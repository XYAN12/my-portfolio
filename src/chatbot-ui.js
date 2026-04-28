import { buildPortfolioContext, getChatbotCopy, getVisibleSteps } from "./portfolio-chatbot.js";

function createButtonIcon(document) {
  const icon = document.createElement("span");
  icon.classList.add("chatbot-toggle-icon");
  icon.textContent = "✦";
  return icon;
}

function createMessageBubble(document, className, text) {
  const bubble = document.createElement("div");
  bubble.classList.add(className);
  bubble.textContent = text;
  return bubble;
}

function createStepItem(document, text, complete = true) {
  const item = document.createElement("li");
  item.classList.add("chatbot-step");

  const icon = document.createElement("span");
  icon.classList.add("chatbot-step-icon");
  icon.textContent = complete ? "✓" : "•";

  const label = document.createElement("span");
  label.classList.add("chatbot-step-label");
  label.textContent = text;

  item.append(icon, label);
  return item;
}

function resolveEndpoint(endpoint) {
  if (endpoint) {
    return endpoint;
  }

  if (typeof document !== "undefined") {
    const configured = document
      .querySelector?.('meta[name="portfolio-chatbot-endpoint"]')
      ?.getAttribute("content")
      ?.trim();
    if (configured) {
      return configured;
    }

    const isLocalPreview =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalPreview) {
      return "http://127.0.0.1:8787/api/chat";
    }
  }

  return "";
}

export function createChatbotInterface({
  document,
  mount,
  endpoint,
  fetchImpl = fetch,
  getLanguage = () => "en"
}) {
  const shell = document.createElement("aside");
  shell.classList.add("chatbot-shell");

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("chatbot-toggle");
  shell.appendChild(button);
  button.appendChild(createButtonIcon(document));

  const buttonLabel = document.createElement("span");
  buttonLabel.classList.add("chatbot-toggle-label");
  button.appendChild(buttonLabel);

  const panel = document.createElement("section");
  panel.classList.add("chatbot-panel");
  panel.hidden = true;
  shell.appendChild(panel);

  const header = document.createElement("header");
  header.classList.add("chatbot-header");
  panel.appendChild(header);

  const headerMain = document.createElement("div");
  headerMain.classList.add("chatbot-header-main");
  header.appendChild(headerMain);

  const title = document.createElement("h3");
  headerMain.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.classList.add("chatbot-subtitle");
  headerMain.appendChild(subtitle);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.classList.add("chatbot-close");
  closeButton.setAttribute("aria-label", "Close chat");
  closeButton.textContent = "×";
  header.appendChild(closeButton);

  const messages = document.createElement("div");
  messages.classList.add("chatbot-messages");
  panel.appendChild(messages);

  const message = document.createElement("div");
  message.classList.add("chat-message", "assistant");
  messages.appendChild(message);

  const answer = createMessageBubble(document, "chatbot-answer", "");
  message.append(answer);

  const process = document.createElement("details");
  process.classList.add("chatbot-process");
  process.hidden = true;
  process.open = true;
  message.appendChild(process);

  const processSummary = document.createElement("summary");
  processSummary.classList.add("chatbot-process-summary");
  process.appendChild(processSummary);

  const processBody = document.createElement("div");
  processBody.classList.add("chatbot-process-body");
  process.appendChild(processBody);

  const stepsList = document.createElement("ol");
  stepsList.classList.add("chatbot-steps");
  processBody.appendChild(stepsList);

  const inputArea = document.createElement("div");
  inputArea.classList.add("chatbot-input-area");
  panel.appendChild(inputArea);

  const form = document.createElement("form");
  form.classList.add("chatbot-form");
  inputArea.appendChild(form);

  const input = document.createElement("textarea");
  input.classList.add("chatbot-input");
  input.rows = 1;
  form.appendChild(input);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.classList.add("chatbot-submit");
  form.appendChild(submit);

  const state = {
    open: false,
    endpoint: resolveEndpoint(endpoint),
    processVisible: false
  };

  function resetInput() {
    input.value = "";
    input.style.height = "";
  }

  function renderStaticCopy() {
    const lang = getLanguage();
    const chatbotCopy = getChatbotCopy(lang);

    button.setAttribute("aria-label", chatbotCopy.buttonLabel);
    button.setAttribute("aria-expanded", String(state.open));
    buttonLabel.textContent = lang === "zh" ? "助手" : "Chat";
    title.textContent = chatbotCopy.title;
    subtitle.textContent = "";
    processSummary.textContent = chatbotCopy.processTitle;
    input.setAttribute("aria-label", chatbotCopy.inputLabel);
    input.placeholder = chatbotCopy.placeholder;
    submit.textContent = chatbotCopy.send;

    if (!answer.textContent) {
      answer.textContent = chatbotCopy.emptyState;
    }
  }

  function renderSteps(steps, working = false) {
    const items = steps.map((step, index) =>
      createStepItem(document, step, !working || index < steps.length - 1)
    );
    stepsList.replaceChildren(...items);
    state.processVisible = steps.length > 0;
    process.hidden = !state.processVisible;
    panel.setAttribute("aria-busy", String(working));
  }

  function setOpen(nextOpen) {
    state.open = nextOpen;
    panel.hidden = !nextOpen;
    panel.setAttribute("aria-hidden", String(!nextOpen));
    button.setAttribute("aria-expanded", String(nextOpen));
    shell.classList.toggle("is-open", nextOpen);
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();
    const lang = getLanguage();
    const chatbotCopy = getChatbotCopy(lang);
    const question = input.value.trim();

    if (!question) {
      answer.textContent = chatbotCopy.emptyState;
      process.hidden = true;
      return;
    }

    if (!state.endpoint) {
      answer.textContent = chatbotCopy.endpointMissing;
      renderSteps(getVisibleSteps(lang), false);
      return;
    }

    resetInput();
    answer.textContent = chatbotCopy.working;
    renderSteps(getVisibleSteps(lang), true);
    submit.disabled = true;

    try {
      const response = await fetchImpl(state.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          question,
          language: lang,
          previewContext: buildPortfolioContext(question, lang)
        })
      });
      const payload = await response.json();

      answer.textContent = payload.answer || chatbotCopy.unavailable;
      renderSteps(payload.steps || getVisibleSteps(lang), false);
    } catch (error) {
      answer.textContent = chatbotCopy.unavailable;
      renderSteps(getVisibleSteps(lang), false);
    } finally {
      submit.disabled = false;
    }
  }

  function refreshCopy() {
    renderStaticCopy();
    process.hidden = !state.processVisible;
  }

  function handleDocumentClick(event) {
    if (!state.open) {
      return;
    }

    const target = event.target;
    if (target === shell) {
      setOpen(false);
      return;
    }

    if (!shell.contains(target)) {
      setOpen(false);
    }
  }

  function handleDocumentKeydown(event) {
    if (state.open && event.key === "Escape") {
      setOpen(false);
    }
  }

  button.addEventListener("click", () => setOpen(!state.open));
  form.addEventListener("submit", handleSubmit);
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);

  mount.appendChild(shell);
  refreshCopy();

  return {
    shell,
    button,
    panel,
    header: {
      title,
      subtitle
    },
    form,
    input,
    submit,
    closeButton,
    message,
    messages: {
      answer
    },
    process: {
      container: process,
      summary: processSummary,
      body: processBody,
      steps: stepsList
    },
    renderSteps,
    refreshCopy,
    handleSubmit,
    setOpen
  };
}

export function initChatbot({
  document,
  mount = document.body,
  endpoint,
  getLanguage
}) {
  return createChatbotInterface({
    document,
    mount,
    endpoint,
    getLanguage
  });
}
