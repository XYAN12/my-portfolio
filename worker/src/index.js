import {
  buildPortfolioContext,
  buildSystemPrompt,
  getPortfolioRedirectAnswer,
  getVisibleSteps,
  isPortfolioQuestion,
  sanitizeProviderAnswer
} from "../../src/portfolio-chatbot.js";

const DEFAULT_MODEL = "deepseek-chat";
const DEFAULT_MAX_INPUT_CHARS = 500;
const DEFAULT_MAX_OUTPUT_TOKENS = 280;
const DEFAULT_RATE_LIMIT = 5;
const DEFAULT_DAILY_QUOTA = 40;
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function jsonResponse(body, status, corsHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders
    }
  });
}

function splitAllowedOrigins(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Normalize scheme + host (+ port) so GitHub Pages origins match regardless of hostname casing. */
function canonicalOrigin(origin) {
  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function isAllowedOrigin(origin, env) {
  if (!origin) {
    return false;
  }

  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    return true;
  }

  const requestOrigin = canonicalOrigin(origin);
  if (!requestOrigin) {
    return false;
  }

  const allowedOrigins = splitAllowedOrigins(env.ALLOWED_FRONTEND_ORIGIN);
  return allowedOrigins.some((allowed) => canonicalOrigin(allowed) === requestOrigin);
}

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin, env)) {
    return {
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type"
    };
  }

  return {
    "access-control-allow-origin": origin,
    vary: "Origin",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type"
  };
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown"
  );
}

function getMinuteBucket(now) {
  return Math.floor(now / RATE_LIMIT_WINDOW_MS);
}

function getDateBucket(now) {
  return new Date(now).toISOString().slice(0, 10);
}

function enforceRateLimit({ runtimeState, ip, now, env }) {
  const minuteKey = `${ip}:${getMinuteBucket(now)}`;
  const limit = Number.parseInt(env.RATE_LIMIT_MAX_PER_MINUTE || "", 10) || DEFAULT_RATE_LIMIT;
  const current = runtimeState.rateLimitBuckets.get(minuteKey) || 0;

  if (current >= limit) {
    return false;
  }

  runtimeState.rateLimitBuckets.set(minuteKey, current + 1);
  return true;
}

function enforceDailyQuota({ runtimeState, ip, now, env }) {
  const dayKey = `${ip}:${getDateBucket(now)}`;
  const limit = Number.parseInt(env.DAILY_REQUEST_QUOTA || "", 10) || DEFAULT_DAILY_QUOTA;
  const current = runtimeState.dailyQuotaBuckets.get(dayKey) || 0;

  if (current >= limit) {
    return false;
  }

  runtimeState.dailyQuotaBuckets.set(dayKey, current + 1);
  return true;
}

function buildCacheKey(question, language) {
  return `${language}:${question.trim().toLowerCase()}`;
}

async function verifyTurnstileToken({ token, request, env, fetchImpl }) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }

  if (!token || typeof token !== "string") {
    return false;
  }

  const formData = new URLSearchParams();
  formData.set("secret", env.TURNSTILE_SECRET_KEY);
  formData.set("response", token);
  formData.set("remoteip", getClientIp(request));

  const response = await fetchImpl(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    }
  );

  if (!response.ok) {
    return false;
  }

  const payload = await response.json();
  return Boolean(payload.success);
}

function extractProviderAnswer(payload) {
  return payload?.choices?.[0]?.message?.content ?? "";
}

export function createChatHandler({
  env = {},
  fetchImpl = fetch,
  now = () => Date.now(),
  state
} = {}) {
  const runtimeState = state || {
    rateLimitBuckets: new Map(),
    dailyQuotaBuckets: new Map(),
    responseCache: new Map()
  };

  return async function handleChatRequest(request) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405, corsHeaders);
    }

    if (!isAllowedOrigin(request.headers.get("origin") || "", env)) {
      return jsonResponse({ error: "Origin not allowed." }, 403, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON payload." }, 400, corsHeaders);
    }

    const question = typeof body.question === "string" ? body.question.trim() : "";
    const language = body.language === "zh" ? "zh" : "en";
    const maxInputChars =
      Number.parseInt(env.MAX_INPUT_CHARS || "", 10) || DEFAULT_MAX_INPUT_CHARS;

    if (!question) {
      return jsonResponse({ error: "A portfolio question is required." }, 400, corsHeaders);
    }

    if (question.length > maxInputChars) {
      return jsonResponse(
        { error: `Question is too long. Please keep it under ${maxInputChars} characters.` },
        413,
        corsHeaders
      );
    }

    const currentTime = now();
    const ip = getClientIp(request);

    if (!enforceRateLimit({ runtimeState, ip, now: currentTime, env })) {
      return jsonResponse(
        { error: "Too many requests. Please wait a minute and try again." },
        429,
        corsHeaders
      );
    }

    if (!enforceDailyQuota({ runtimeState, ip, now: currentTime, env })) {
      return jsonResponse(
        { error: "Daily chatbot quota reached. Please try again tomorrow." },
        429,
        corsHeaders
      );
    }

    try {
      const turnstileOk = await verifyTurnstileToken({
        token: body.turnstileToken,
        request,
        env,
        fetchImpl
      });
      if (!turnstileOk) {
        return jsonResponse(
          { error: "Turnstile verification failed. Please refresh and try again." },
          403,
          corsHeaders
        );
      }

      const visibleSteps = getVisibleSteps(language);
      if (!isPortfolioQuestion(question)) {
        return jsonResponse(
          {
            answer: getPortfolioRedirectAnswer(language),
            steps: visibleSteps,
            cached: false
          },
          200,
          corsHeaders
        );
      }

      const cacheKey = buildCacheKey(question, language);
      const cached = runtimeState.responseCache.get(cacheKey);
      if (cached && cached.expiresAt > currentTime) {
        return jsonResponse({ ...cached.payload, cached: true }, 200, corsHeaders);
      }

      if (!env.DEEPSEEK_API_KEY) {
        throw new Error("Missing DEEPSEEK_API_KEY");
      }

      const context = buildPortfolioContext(question, language);
      const providerResponse = await fetchImpl("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL || DEFAULT_MODEL,
          max_tokens:
            Number.parseInt(env.MAX_OUTPUT_TOKENS || "", 10) || DEFAULT_MAX_OUTPUT_TOKENS,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: buildSystemPrompt({
                question,
                lang: language,
                context
              })
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      });

      if (!providerResponse.ok) {
        throw new Error(`Provider request failed with status ${providerResponse.status}`);
      }

      const providerPayload = await providerResponse.json();
      const answer = sanitizeProviderAnswer(extractProviderAnswer(providerPayload), language);
      const responsePayload = {
        answer,
        steps: visibleSteps,
        cached: false,
        matches: {
          projects: context.matchedProjects.map((project) => project.title),
          tech: context.matchedTech
        }
      };

      runtimeState.responseCache.set(cacheKey, {
        expiresAt:
          currentTime +
          (Number.parseInt(env.CACHE_TTL_MS || "", 10) || DEFAULT_CACHE_TTL_MS),
        payload: responsePayload
      });

      return jsonResponse(responsePayload, 200, corsHeaders);
    } catch {
      return jsonResponse(
        { error: "The portfolio assistant is temporarily unavailable." },
        502,
        corsHeaders
      );
    }
  };
}

const defaultHandler = createChatHandler();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      return createChatHandler({ env })(request, env, ctx);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: buildCorsHeaders(request, env)
      });
    }

    return jsonResponse({ error: "Not found." }, 404, buildCorsHeaders(request, env));
  }
};

export { defaultHandler };
