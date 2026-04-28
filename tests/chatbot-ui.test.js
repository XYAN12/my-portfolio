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
            "Parsed question",
            "Checked portfolio data",
            "Found relevant projects",
            "Generated answer"
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
  assert.match(
    chatbot.messages.answer.textContent,
    /Hi, I.?m Xiaoyu.?s portfolio assistant/i
  );
  assert.equal(chatbot.header.subtitle.textContent, "");
  assert.equal(chatbot.process.container.hidden, true);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, false);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, true);
});

test("chatbot submit calls the configured backend endpoint and clears the input", async () => {
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
            "Parsed question",
            "Checked portfolio data",
            "Found relevant projects",
            "Generated answer"
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
  chatbot.input.style.height = "96px";
  await chatbot.handleSubmit(createEvent("submit"));

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://worker.example/api/chat");
  assert.equal(calls[0].init.method, "POST");

  const payload = JSON.parse(calls[0].init.body);
  assert.equal(payload.question, "What is TaskMaster built with?");
  assert.equal(payload.language, "en");
  assert.equal(chatbot.input.value, "");
  assert.equal(chatbot.input.style.height, "");
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
            "Parsed question",
            "Checked portfolio data",
            "Found relevant projects",
            "Generated answer"
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

test("process is rendered inside the assistant message below the answer", async () => {
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
          answer: "Resume Optimizer combines React, FastAPI, Docker, and PDF export.",
          steps: [
            "Parsed question",
            "Checked portfolio data",
            "Found relevant projects",
            "Generated answer"
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
  chatbot.input.value = "Tell me about Resume Optimizer";
  await chatbot.handleSubmit(createEvent("submit"));

  assert.equal(chatbot.process.container.hidden, false);
  assert.equal(chatbot.process.summary.textContent, "Process");
  assert.equal(chatbot.message.contains(chatbot.process.container), true);
  assert.equal(chatbot.message.contains(chatbot.messages.answer), true);
});

test("close button, outside click, and Escape close the panel", async () => {
  const document = createDocument();
  const mount = document.createElement("div");
  document.body.appendChild(mount);
  const outside = document.createElement("div");
  document.body.appendChild(outside);

  const chatbot = createChatbotInterface({
    document,
    mount,
    endpoint: "https://worker.example/api/chat",
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          answer: "TaskMaster is an iOS productivity app built with Swift and Core Data.",
          steps: [
            "Parsed question",
            "Checked portfolio data",
            "Found relevant projects",
            "Generated answer"
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
  assert.equal(chatbot.panel.hidden, false);

  chatbot.closeButton.click();
  assert.equal(chatbot.panel.hidden, true);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, false);

  outside.dispatchEvent(createEvent("click", { bubbles: true }));
  assert.equal(chatbot.panel.hidden, true);

  chatbot.button.click();
  assert.equal(chatbot.panel.hidden, false);

  chatbot.panel.dispatchEvent(createEvent("click", { bubbles: true }));
  assert.equal(chatbot.panel.hidden, false);

  document.dispatchEvent(createEvent("keydown", { key: "Escape" }));
  assert.equal(chatbot.panel.hidden, true);
});

test("chatbot styles keep the launcher fixed at the bottom-right", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*position:\s*fixed;/);
  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*right:\s*clamp\(/);
  assert.match(css, /\.chatbot-shell\s*\{[\s\S]*bottom:\s*clamp\(/);
  assert.match(css, /\.chatbot-panel\s*\{[\s\S]*display:\s*flex;/);
  assert.match(css, /\.chatbot-panel\s*\{[\s\S]*flex-direction:\s*column;/);
  assert.match(css, /\.chatbot-panel\s*\{[\s\S]*height:\s*min\(720px,\s*80vh\);/);
  assert.match(css, /\.chatbot-messages\s*\{[\s\S]*flex:\s*1/);
  assert.match(css, /\.chatbot-messages\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(css, /\.chatbot-input-area\s*\{[\s\S]*position:\s*sticky;/);
  assert.match(css, /\.chatbot-input-area\s*\{[\s\S]*bottom:\s*0/);
  assert.match(css, /\.chatbot-input\s*\{[\s\S]*min-height:\s*44px;/);
  assert.match(css, /\.chatbot-input\s*\{[\s\S]*max-height:\s*96px;/);
  assert.match(css, /\.chatbot-input\s*\{[\s\S]*resize:\s*none;/);
  assert.match(css, /@media \(max-width:\s*640px\)\s*\{[\s\S]*\.chatbot-panel\s*\{[\s\S]*height:\s*min\(680px,\s*82vh\);/);
});
