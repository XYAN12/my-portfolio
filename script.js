import {
  copy,
  projects,
  responsibilities,
  stackGroups,
  techIconMeta
} from "./src/portfolio-data.js";
import { initChatbot } from "./src/chatbot-ui.js";

const state = {
  lang: localStorage.getItem("portfolio-language") || "en"
};

let headerResizeObserver;
let revealObserver;
let chatbotController;

function getByPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function createMockup(visual, lang) {
  return `
    <div class="project-visual project-mockup ${visual.variant}">
      <div class="mockup-browser">
        <div class="mockup-topbar">
          <span class="mockup-dot"></span>
          <span class="mockup-dot"></span>
          <span class="mockup-dot"></span>
        </div>
        <div class="mockup-body">
          <span class="mockup-kicker">${visual.kicker[lang]}</span>
          <p class="mockup-title">${visual.pills[0]}</p>
          <div class="mockup-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="mockup-pills">
            ${visual.pills.map((pill) => `<span>${pill}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function createTechIcon(name) {
  const meta = techIconMeta[name];
  if (!meta) return "";

  return `
    <img
      class="tech-icon"
      src="https://cdn.simpleicons.org/${meta.slug}"
      alt="${meta.label} logo"
      loading="lazy"
      decoding="async"
      onerror="this.style.display='none'"
    />
  `;
}

function getHashTarget(hash = window.location.hash) {
  if (!hash) {
    return null;
  }

  const hashAliases = {
    "#tech": "#stack"
  };

  const normalizedHash = hashAliases[hash] || hash;
  return document.querySelector(normalizedHash);
}

function revealTree(target) {
  if (!target) {
    return;
  }

  if (target.classList.contains("reveal")) {
    target.classList.add("is-visible");
  }

  target.querySelectorAll(".reveal").forEach((node) => {
    node.classList.add("is-visible");
  });
}

function syncHashTarget() {
  const target = getHashTarget();
  if (!target) {
    return;
  }

  revealTree(target);
  requestAnimationFrame(() => {
    target.scrollIntoView({
      block: "start",
      inline: "nearest"
    });
  });
}

function renderProjects(lang) {
  const grid = document.getElementById("projects-grid");
  const labels = copy[lang].projects;

  grid.innerHTML = projects
    .map((project) => {
      const visual =
        project.visual.kind === "image"
          ? `
            <div class="project-visual">
              <img src="${project.visual.src}" alt="${project.visual.alt[lang]}" loading="lazy" />
            </div>
          `
          : createMockup(project.visual, lang);

      const links = [
        `<a class="project-link" href="${project.repo}" target="_blank" rel="noreferrer">${labels.repo}</a>`
      ];

      if (project.live) {
        links.push(
          `<a class="project-link" href="${project.live}" target="_blank" rel="noreferrer">${labels.live}</a>`
        );
      }

      return `
        <article class="project-card reveal">
          ${visual}
          <div class="project-content">
            <div class="project-header">
              <div>
                <p class="project-type">${project.type[lang]}</p>
                <h3>${project.title[lang]}</h3>
              </div>
            </div>
            <p class="project-description">${project.description[lang]}</p>
            <div class="project-stack">
              ${project.tech.map((item) => `<span class="chip">${item}</span>`).join("")}
            </div>
            <ul class="project-features">
              ${project.features[lang].map((feature) => `<li>${feature}</li>`).join("")}
            </ul>
            <div class="project-links">${links.join("")}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStack(lang) {
  const grid = document.getElementById("stack-grid");

  grid.innerHTML = stackGroups
    .map(
      (group) => `
        <article class="stack-card reveal">
          <h3>${group.title[lang]}</h3>
          <div class="chip-list tech-list">
            ${group.items
              .map(
                (item) => `
                  <span class="tech-chip">
                    ${createTechIcon(item)}
                    <span class="tech-name">${item}</span>
                  </span>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderResponsibilities(lang) {
  const grid = document.getElementById("responsibility-grid");

  grid.innerHTML = responsibilities
    .map(
      (item) => `
        <article class="responsibility-card reveal">
          <h3>${item.title[lang]}</h3>
          <p>${item.body[lang]}</p>
        </article>
      `
    )
    .join("");
}

function applyLanguage(lang) {
  const dictionary = copy[lang];
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = getByPath(dictionary, node.dataset.i18n);
    if (typeof value === "string") {
      node.textContent = value;
    }
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  });

  renderProjects(lang);
  renderStack(lang);
  renderResponsibilities(lang);
  observeReveal();
  chatbotController?.refreshCopy();

  requestAnimationFrame(() => {
    syncHeaderOffset();
    syncHashTarget();
  });
}

function syncHeaderOffset() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const computedHeader = getComputedStyle(header);
  const top = Number.parseFloat(computedHeader.top) || 0;
  const height = Math.ceil(header.getBoundingClientRect().height + top + 16);
  document.documentElement.style.setProperty("--header-offset", `${height}px`);
}

function initHeaderOffset() {
  syncHeaderOffset();
  window.addEventListener("resize", syncHeaderOffset);

  if ("ResizeObserver" in window) {
    headerResizeObserver = new ResizeObserver(() => syncHeaderOffset());
    headerResizeObserver.observe(document.querySelector(".site-header"));
  }
}

function observeReveal() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  const elements = document.querySelectorAll(".reveal");
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  elements.forEach((element) => revealObserver.observe(element));
}

function initLanguageSwitch() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      localStorage.setItem("portfolio-language", state.lang);
      applyLanguage(state.lang);
    });
  });
}

function init() {
  document.getElementById("project-count").textContent = String(projects.length);
  document.getElementById("year").textContent = String(new Date().getFullYear());

  chatbotController = initChatbot({
    document,
    getLanguage: () => state.lang
  });

  initLanguageSwitch();
  initHeaderOffset();
  window.addEventListener("hashchange", syncHashTarget);
  applyLanguage(state.lang);
}

init();
