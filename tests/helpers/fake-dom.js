class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.target = null;
    this.currentTarget = null;
    this.key = options.key ?? "";
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }
}

class FakeClassList {
  constructor(owner) {
    this.owner = owner;
    this.values = new Set();
  }

  add(...tokens) {
    tokens.forEach((token) => this.values.add(token));
    this.#sync();
  }

  remove(...tokens) {
    tokens.forEach((token) => this.values.delete(token));
    this.#sync();
  }

  toggle(token, force) {
    if (force === true) {
      this.values.add(token);
      this.#sync();
      return true;
    }

    if (force === false) {
      this.values.delete(token);
      this.#sync();
      return false;
    }

    if (this.values.has(token)) {
      this.values.delete(token);
      this.#sync();
      return false;
    }

    this.values.add(token);
    this.#sync();
    return true;
  }

  contains(token) {
    return this.values.has(token);
  }

  #sync() {
    this.owner.className = Array.from(this.values).join(" ");
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.listeners = new Map();
    this.className = "";
    this.classList = new FakeClassList(this);
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.value = "";
    this.textContent = "";
    this.type = "";
    this.id = "";
  }

  append(...nodes) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  contains(node) {
    let current = node;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  replaceChildren(...nodes) {
    this.children = [];
    nodes.forEach((node) => this.appendChild(node));
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "id") {
      this.id = String(value);
    }

    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .split("-")
        .map((part, index) => (index === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`))
        .join("");
      this.dataset[key] = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.target ??= this;
    event.currentTarget = this;
    const listeners = this.listeners.get(event.type) ?? [];
    listeners.forEach((listener) => listener(event));
    if (event.bubbles && !event.propagationStopped && this.parentNode?.dispatchEvent) {
      this.parentNode.dispatchEvent(event);
    }
    return !event.defaultPrevented;
  }

  click() {
    this.dispatchEvent(new FakeEvent("click"));
  }

  reset() {
    this.children.forEach((child) => {
      if ("value" in child) {
        child.value = "";
      }
    });
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.body = this.createElement("body");
    this.body.parentNode = this;
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.currentTarget = this;
    const listeners = this.listeners.get(event.type) ?? [];
    listeners.forEach((listener) => listener(event));
    return !event.defaultPrevented;
  }
}

export function createDocument() {
  return new FakeDocument();
}

export function createEvent(type, options) {
  return new FakeEvent(type, options);
}
