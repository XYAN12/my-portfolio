import { buildPortfolioContext, getChatbotCopy, getVisibleSteps } from "./portfolio-chatbot.js";

function createButtonIcon(document) {
  const icon = document.createElement("span");
  icon.classList.add("chatbot-toggle-icon");
  icon.textContent = "✦";
  return icon;
}

function createMessageBubble(document, className, text) {
  const bubble = document.createElement("p");
  bubble.classList.add(className);
  bubble.textContent = text;
  return bubble;
}

function createStepItem(document, text) {
  const item = document.createElement("li");
  item.classList.add("chatbot-step");
  item.textContent = text;
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

  const title = document.createElement("h3");
  header.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.classList.add("chatbot-subtitle");
  header.appendChild(subtitle);

  const status = document.createElement("p");
  status.classList.add("chatbot-status");
  panel.appendChild(status);

  const messages = document.createElement("div");
  messages.classList.add("chatbot-messages");
  panel.appendChild(messages);

  const answer = createMessageBubble(document, "chatbot-answer", "");
  const note = createMessageBubble(document, "chatbot-note", "");
  messages.append(answer, note);

  const stepsTitle = document.createElement("p");
  stepsTitle.classList.add("chatbot-steps-title");
  panel.appendChild(stepsTitle);

  const stepsList = document.createElement("ol");
  stepsList.classList.add("chatbot-steps");
  panel.appendChild(stepsList);

  const form = document.createElement("form");
  form.classList.add("chatbot-form");
  panel.appendChild(form);

  const input = document.createElement("textarea");
  input.classList.add("chatbot-input");
  input.rows = 3;
  form.appendChild(input);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.classList.add("chatbot-submit");
  form.appendChild(submit);

  const state = {
    open: false,
    endpoint: resolveEndpoint(endpoint)
  };

  function renderStaticCopy() {
    const lang = getLanguage();
    const chatbotCopy = getChatbotCopy(lang);

    button.setAttribute("aria-label", chatbotCopy.buttonLabel);
    buttonLabel.textContent = lang === "zh" ? "助手" : "Chat";
    title.textContent = chatbotCopy.title;
    subtitle.textContent = chatbotCopy.subtitle;
    stepsTitle.textContent = chatbotCopy.stepsTitle;
    input.setAttribute("aria-label", chatbotCopy.inputLabel);
    input.placeholder = chatbotCopy.placeholder;
    submit.textContent = chatbotCopy.send;
    note.textContent = chatbotCopy.restricted;

    if (!answer.textContent) {
      answer.textContent = chatbotCopy.emptyState;
    }

    if (!status.textContent) {
      status.textContent = chatbotCopy.restricted;
    }
  }

  function renderSteps(steps, working = false) {
    stepsList.replaceChildren(...steps.map((step) => createStepItem(document, step)));
    panel.setAttribute("aria-busy", String(working));
  }

  function setOpen(nextOpen) {
    state.open = nextOpen;
    panel.hidden = !nextOpen;
    shell.classList.toggle("is-open", nextOpen);
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();
    const lang = getLanguage();
    const chatbotCopy = getChatbotCopy(lang);
    const question = input.value.trim();

    if (!question) {
      answer.textContent = chatbotCopy.emptyState;
      status.textContent = chatbotCopy.restricted;
      renderSteps(getVisibleSteps(lang), false);
      return;
    }

    if (!state.endpoint) {
      answer.textContent = chatbotCopy.endpointMissing;
      status.textContent = chatbotCopy.unavailable;
      renderSteps(getVisibleSteps(lang), false);
      return;
    }

    status.textContent = chatbotCopy.working;
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
      status.textContent = payload.error ? chatbotCopy.unavailable : chatbotCopy.restricted;
      renderSteps(payload.steps || getVisibleSteps(lang), false);
    } catch (error) {
      answer.textContent = chatbotCopy.unavailable;
      status.textContent = chatbotCopy.unavailable;
      renderSteps(getVisibleSteps(lang), false);
    } finally {
      submit.disabled = false;
    }
  }

  function refreshCopy() {
    const lang = getLanguage();
    const chatbotCopy = getChatbotCopy(lang);
    renderStaticCopy();
    if (!stepsList.children.length) {
      renderSteps(getVisibleSteps(lang), false);
    }
    note.textContent = chatbotCopy.restricted;
  }

  button.addEventListener("click", () => setOpen(!state.open));
  form.addEventListener("submit", handleSubmit);

  mount.appendChild(shell);
  refreshCopy();

  return {
    shell,
    button,
    panel,
    form,
    input,
    submit,
    messages: {
      answer,
      note
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
