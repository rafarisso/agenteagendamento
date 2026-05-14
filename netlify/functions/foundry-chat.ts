import type { Config } from "@netlify/functions";
import { cleanString, corsHeaders, json, readEnv } from "./_shared/schedule";

type FoundryChatPayload = {
  message?: unknown;
  previousResponseId?: unknown;
  conversationId?: unknown;
};

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

const defaultProjectEndpoint = "https://agentes2.services.ai.azure.com/api/projects/proj-default-novo";
const defaultAgentName = "AgenteAgendamento";

export const config: Config = {};

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  let payload: FoundryChatPayload;
  try {
    payload = (await request.json()) as FoundryChatPayload;
  } catch {
    return json({ error: "Envie um corpo JSON válido." }, 400);
  }

  const message = cleanString(payload.message);
  const previousResponseId = cleanString(payload.previousResponseId);
  const conversationId = cleanString(payload.conversationId);

  if (!message) {
    return json({ error: "Informe uma mensagem para o agente." }, 400);
  }

  const agentName = readEnv("AZURE_FOUNDRY_AGENT_NAME") || defaultAgentName;
  const agentVersion = cleanString(readEnv("AZURE_FOUNDRY_AGENT_VERSION"));
  const requestBody: Record<string, unknown> = {
    input: message,
    agent_reference: {
      name: agentName,
      type: "agent_reference",
      ...(agentVersion ? { version: agentVersion } : {}),
    },
    metadata: {
      source: "senai-agenda-ia-site",
    },
  };

  if (previousResponseId) {
    requestBody.previous_response_id = previousResponseId;
  }

  if (conversationId) {
    requestBody.conversation = conversationId;
  }

  try {
    const endpoint = getResponsesEndpoint();
    const headers = await getFoundryAuthHeaders();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responsePayload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro ao chamar agente Foundry", {
        status: response.status,
        payload: sanitizeFoundryError(responsePayload),
      });

      return json(
        {
          error:
            "Não foi possível conversar com o agente do Microsoft Foundry. Verifique as variáveis de ambiente e a autenticação da Function.",
          status: response.status,
          details: sanitizeFoundryError(responsePayload),
        },
        502,
      );
    }

    const reply = extractOutputText(responsePayload);
    return json({
      success: true,
      reply,
      responseId: readString(responsePayload, "id"),
      conversationId: extractConversationId(responsePayload) || conversationId || null,
      outputTypes: extractOutputTypes(responsePayload),
      toolCalls: extractToolCalls(responsePayload),
    });
  } catch (error) {
    console.error("Falha inesperada na integração com Foundry", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível acionar o agente do Microsoft Foundry.",
      },
      500,
    );
  }
};

function getResponsesEndpoint() {
  const configured = cleanString(readEnv("AZURE_FOUNDRY_RESPONSES_ENDPOINT"));
  if (configured) {
    return configured.endsWith("/responses") ? configured : `${configured.replace(/\/$/, "")}/responses`;
  }

  const projectEndpoint =
    cleanString(readEnv("AZURE_FOUNDRY_PROJECT_ENDPOINT")) || defaultProjectEndpoint;

  return `${projectEndpoint.replace(/\/$/, "")}/openai/v1/responses`;
}

async function getFoundryAuthHeaders(): Promise<Record<string, string>> {
  const bearerToken = cleanString(readEnv("AZURE_FOUNDRY_BEARER_TOKEN"));
  if (bearerToken) {
    return { Authorization: `Bearer ${bearerToken}` };
  }

  const tenantId = cleanString(readEnv("AZURE_TENANT_ID"));
  const clientId = cleanString(readEnv("AZURE_CLIENT_ID"));
  const clientSecret = cleanString(readEnv("AZURE_CLIENT_SECRET"));

  if (tenantId && clientId && clientSecret) {
    const token = await getClientCredentialsToken(tenantId, clientId, clientSecret);
    return { Authorization: `Bearer ${token}` };
  }

  const apiKey = cleanString(readEnv("AZURE_FOUNDRY_API_KEY")) || cleanString(readEnv("AZURE_OPENAI_API_KEY"));
  if (apiKey) {
    return { "api-key": apiKey };
  }

  throw new Error(
    "Configure AZURE_TENANT_ID, AZURE_CLIENT_ID e AZURE_CLIENT_SECRET na Netlify, ou informe AZURE_FOUNDRY_API_KEY se o seu endpoint aceitar API key.",
  );
}

async function getClientCredentialsToken(tenantId: string, clientId: string, clientSecret: string) {
  const scope = cleanString(readEnv("AZURE_FOUNDRY_SCOPE")) || "https://ai.azure.com/.default";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json().catch(() => ({}))) as TokenResponse;

  if (!response.ok || !payload.access_token) {
    console.error("Erro ao obter token Entra para Foundry", {
      status: response.status,
      error: payload.error,
      description: payload.error_description,
    });
    throw new Error("Não foi possível autenticar no Microsoft Foundry com as credenciais Entra.");
  }

  return payload.access_token;
}

function extractOutputText(payload: unknown) {
  if (!isRecord(payload)) {
    return "O agente respondeu, mas a resposta não veio em um formato esperado.";
  }

  const outputText = readString(payload, "output_text");
  if (outputText) {
    return outputText;
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const textParts: string[] = [];

  for (const item of output) {
    if (!isRecord(item)) {
      continue;
    }

    const content = Array.isArray(item.content) ? item.content : [];
    for (const contentItem of content) {
      if (!isRecord(contentItem)) {
        continue;
      }

      const text = readString(contentItem, "text");
      if (text) {
        textParts.push(text);
      }
    }
  }

  return textParts.join("\n").trim() || "O agente não retornou texto nesta resposta.";
}

function extractConversationId(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.conversation === "string") {
    return payload.conversation;
  }

  if (isRecord(payload.conversation)) {
    return readString(payload.conversation, "id");
  }

  return null;
}

function extractOutputTypes(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.output)) {
    return [];
  }

  return payload.output
    .filter(isRecord)
    .map((item) => readString(item, "type"))
    .filter(Boolean);
}

function extractToolCalls(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.output)) {
    return [];
  }

  return payload.output.filter(isRecord).flatMap((item) => {
    const type = readString(item, "type");
    if (!type || !type.includes("call")) {
      return [];
    }

    return [
      {
        type,
        name: readString(item, "name") || readString(item, "tool_name") || type,
        status: readString(item, "status") || null,
      },
    ];
  });
}

function sanitizeFoundryError(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  const error = isRecord(payload.error) ? payload.error : payload;
  return {
    code: readString(error, "code"),
    message: readString(error, "message"),
    type: readString(error, "type"),
  };
}

function readString(value: Record<string, unknown>, key: string) {
  const result = value[key];
  return typeof result === "string" ? result : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
