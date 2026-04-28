import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createDocument, createEvent } from "./helpers/fake-dom.js";
import { createChatbotInterface } from "../src/chatbot-ui.js";

test("chatbot button renders and toggles the floating panel", async () => {
  const document = createDocument();
  const mount = document.createElement("div");
  document.body.appendChild(mount);

  const chatbot = createChatbotInterface({
    document,
    mount,
    endpoint: "https://worker.example/chat",
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          answer: "Resume Optimizer is an AI workflow project built with React and FastAPI.",
          steps: [
            "Understanding the question",
            "Searching portfolio data",
            "Selecting relevant projects or skills",
            "Generating final answer"
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      ),
    getLanguage: () => "en"
  });

  assert.equal(chatbot.button.getAttribute("aria-label"), "Open portfolio chatbot");
  assert.equal(chatbot.panel.hidden, true);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, false);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, true);
});

test("chatbot submit calls the configured backend endpoint", async () => {
  const document = createDocument();
  const mount = document.createElement("div");
  document.body.appendChild(mount);
  const calls = [];

  const chatbot = createChatbotInterface({
    document,
    mount,
    endpoint: "https://worker.example/api/chat",
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({
          answer: "TaskMaster is an iOS productivity app built with Swift and Core Data.",
          steps: [
            "Understanding the question",
            "Searching portfolio data",
            "Selecting relevant projects or skills",
            "Generating final answer"
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    },
    getLanguage: () => "en"
  });

  chatbot.button.click();
  chatbot.input.value = "What is TaskMaster built with?";
  await chatbot.handleSubmit(createEvent("submit"));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://worker.example/api/chat");
  assert.equal(calls[0].init.method, "POST");

  const payload = JSON.parse(calls[0].init.body);
  assert.equal(payload.question, "What is TaskMaster built with?");
  assert.equal(payload.language, "en");
});

test("chatbot shows a safe redirect response for unrelated questions", async () => {
  const document = createDocument();
  const mount = document.createElement("div");
  document.body.appendChild(mount);

  const chatbot = createChatbotInterface({
    document,
    mount,
    endpoint: "https://worker.example/api/chat",
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          answer:
            "I can help with Xiaoyu's portfolio, projects, skills, tech stack, and experience. Try asking about a specific project or technology.",
          steps: [
            "Understanding the question",
            "Searching portfolio data",
            "Selecting relevant projects or skills",
            "Generating final answer"
          ]
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      ),
    getLanguage: () => "en"
  });

  chatbot.button.click();
  chatbot.input.value = "What is the weather today?";
  await chatbot.handleSubmit(createEvent("submit"));

  assert.match(chatbot.messages.answer.textContent, /I can help with Xiaoyu's portfolio/i);
});

test("chatbot styles keep the launcher fixed at the bottom-right", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*position:\s*fixed;/);
  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*right:\s*clamp\(/);
  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*bottom:\s*clamp\(/);
});
