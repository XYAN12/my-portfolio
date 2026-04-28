import test from "node:test";
import assert from "node:assert/strict";

import { createChatHandler } from "../worker/src/index.js";

function createRequest(body, headers = {}) {
  return new Request("https://worker.example/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://xyan12.github.io",
      "cf-connecting-ip": "203.0.113.10",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

test("worker rejects empty input", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "test-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io"
    },
    fetchImpl: async () => {
      throw new Error("provider should not be called");
    }
  });

  const response = await handler(createRequest({ question: "   ", language: "en" }));
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.match(payload.error, /question is required/i);
});

test("worker rejects overly long input", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "test-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io",
      MAX_INPUT_CHARS: "120"
    },
    fetchImpl: async () => {
      throw new Error("provider should not be called");
    }
  });

  const response = await handler(
    createRequest({ question: "x".repeat(121), language: "en" })
  );
  const payload = await response.json();

  assert.equal(response.status, 413);
  assert.match(payload.error, /too long/i);
});

test("worker uses DEEPSEEK_API_KEY from env when calling the provider", async () => {
  const calls = [];
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "deepseek-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io"
    },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Resume Optimizer combines React, FastAPI, Docker, and PDF export."
              }
            }
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }
  });

  const response = await handler(
    createRequest({ question: "Tell me about the Resume Optimizer tech stack", language: "en" })
  );

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(
    new Headers(calls[0].init.headers).get("authorization"),
    "Bearer deepseek-secret"
  );
});

test("worker applies IP-based rate limiting", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "deepseek-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io",
      RATE_LIMIT_MAX_PER_MINUTE: "2"
    },
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "TaskMaster uses Swift, UIKit, Core Data, and Charts."
              }
            }
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      )
  });

  const requestBody = { question: "What powers TaskMaster?", language: "en" };

  const first = await handler(createRequest(requestBody));
  const second = await handler(createRequest(requestBody));
  const third = await handler(createRequest(requestBody));

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(third.status, 429);
});

test("worker returns a safe formatted answer", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "deepseek-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io"
    },
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  "Xiaoyu has experience across React, FastAPI, Swift, Java, PHP, R, Docker, and data visualization tools."
              }
            }
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      )
  });

  const response = await handler(
    createRequest({ question: "What skills and tech stack stand out?", language: "en" })
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload.steps));
  assert.equal(payload.steps.length, 4);
  assert.match(payload.answer, /React|FastAPI|Swift|Docker/);
});

test("worker hides API keys and raw provider errors from the client", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "deepseek-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://xyan12.github.io"
    },
    fetchImpl: async () => {
      throw new Error("DeepSeek exploded with deepseek-secret");
    }
  });

  const response = await handler(
    createRequest({ question: "Tell me about the PDF Translator", language: "en" })
  );
  const payload = await response.json();

  assert.equal(response.status, 502);
  assert.match(payload.error, /temporarily unavailable/i);
  assert.doesNotMatch(JSON.stringify(payload), /deepseek-secret/);
});

test("worker matches ALLOWED_FRONTEND_ORIGIN case-insensitively (GitHub Pages Origin)", async () => {
  const handler = createChatHandler({
    env: {
      DEEPSEEK_API_KEY: "test-secret",
      ALLOWED_FRONTEND_ORIGIN: "https://XYAN12.github.io"
    },
    fetchImpl: async () => {
      throw new Error("should not be called");
    }
  });

  const request = new Request("https://worker.example/api/chat", {
    method: "OPTIONS",
    headers: {
      origin: "https://xyan12.github.io"
    }
  });

  const response = await handler(request);

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://xyan12.github.io");
});
