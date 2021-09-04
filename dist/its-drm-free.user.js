// ==UserScript==
// @name its-drm-free
// @namespace https://github.com/kevinfiol/its-drm-free
// @version 1.2.0
// @description Find games available on DRM-free platforms while browsing Steam Storefront
// @license MIT; https://github.com/kevinfiol/its-drm-free/blob/master/LICENSE
// @include http://*.steampowered.com/app/*
// @include https://*.steampowered.com/app/*
// @include https://*.steampowered.com/wishlist/*
// @icon https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/icon.png
// @updateURL https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/its-drm-free.user.js
// @downloadURL https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/its-drm-free.user.js
// @run-at document-idle
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_listValues
// ==/UserScript==
(() => {
  // src/util.js
  var q = (query) => document.querySelector(query);
  var c = (tag, className, innerHTML = "") => {
    const el = document.createElement(tag);
    el.className = className;
    el.innerHTML = innerHTML;
    return el;
  };
  var request = (method, endpoint, params = {}) => {
    let queryString = "";
    const queryArr = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    if (queryArr.length)
      queryString = "?" + queryArr.join("&");
    const url = endpoint + queryString;
    return new Promise((resolve, reject) => {
      if (window.GM_xmlhttpRequest) {
        const xhr = window.GM_xmlhttpRequest;
        xhr({
          method,
          url,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
              resolve(res.responseText);
            } else {
              reject(res.statusText);
            }
          },
          onerror: (err) => reject(err.statusText)
        });
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(xhr.statusText);
          }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
      }
    });
  };

  // src/services/ITAD.js
  var get = (url, params = {}) => request("GET", url, params).then(JSON.parse);
  function ITAD(base_url, api_key) {
    this.base_url = base_url;
    this.api_key = api_key;
  }
  ITAD.prototype.makeEndpoint = function(version, iface, method) {
    return `${this.base_url}/${version}/${iface}/${method}/`;
  };
  ITAD.prototype.parseResponse = function(res) {
    const key = Object.keys(res.data)[0];
    return res.data[key];
  };
  ITAD.prototype.getPlainId = function(shop, game_id) {
    const endpoint = this.makeEndpoint("v02", "game", "plain");
    const data = { key: this.api_key, shop, game_id };
    return get(endpoint, data);
  };
  ITAD.prototype.getSteamPlainId = function(steam_appid) {
    const endpoint = this.makeEndpoint("v02", "game", "plain");
    const data = { key: this.api_key, game_id: `app/${steam_appid}`, shop: "steam" };
    return get(endpoint, data).then(this.parseResponse);
  };
  ITAD.prototype.getPrices = function(plain_id, region, country) {
    const endpoint = this.makeEndpoint("v01", "game", "prices");
    const data = { key: this.api_key, plains: plain_id, shops: "gog,itchio,humblestore", region, country };
    return get(endpoint, data).then(this.parseResponse);
  };
  var ITAD_default = ITAD;

  // src/config.js
  var config = {
    VERSION: "1.0.0",
    BASE_URL: "https://api.isthereanydeal.com",
    API_KEY: "d047b30e0fc7d9118f3953de04fa6af9eba22379",
    GOG_ICON_URL: "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/gog.png",
    ITCH_ICON_URL: "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/itch.png",
    HUMBLE_ICON_URL: "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/humble.png"
  };
  var config_default = config;

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/directive.js
  var directives = new WeakMap();
  var directive = (f) => (...args) => {
    const d = f(...args);
    directives.set(d, true);
    return d;
  };
  var isDirective = (o) => {
    return typeof o === "function" && directives.has(o);
  };

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/dom.js
  var isCEPolyfill = typeof window !== "undefined" && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== void 0;
  var removeNodes = (container, start, end = null) => {
    while (start !== end) {
      const n = start.nextSibling;
      container.removeChild(start);
      start = n;
    }
  };

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/part.js
  var noChange = {};
  var nothing = {};

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/template.js
  var marker = `{{lit-${String(Math.random()).slice(2)}}}`;
  var nodeMarker = `<!--${marker}-->`;
  var markerRegex = new RegExp(`${marker}|${nodeMarker}`);
  var boundAttributeSuffix = "$lit$";
  var Template = class {
    constructor(result, element) {
      this.parts = [];
      this.element = element;
      const nodesToRemove = [];
      const stack = [];
      const walker = document.createTreeWalker(element.content, 133, null, false);
      let lastPartIndex = 0;
      let index = -1;
      let partIndex = 0;
      const { strings, values: { length } } = result;
      while (partIndex < length) {
        const node = walker.nextNode();
        if (node === null) {
          walker.currentNode = stack.pop();
          continue;
        }
        index++;
        if (node.nodeType === 1) {
          if (node.hasAttributes()) {
            const attributes = node.attributes;
            const { length: length2 } = attributes;
            let count = 0;
            for (let i = 0; i < length2; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }
            while (count-- > 0) {
              const stringForPart = strings[partIndex];
              const name = lastAttributeNameRegex.exec(stringForPart)[2];
              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
              const attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({ type: "attribute", index, name, strings: statics });
              partIndex += statics.length - 1;
            }
          }
          if (node.tagName === "TEMPLATE") {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3) {
          const data = node.data;
          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode;
            const strings2 = data.split(markerRegex);
            const lastIndex = strings2.length - 1;
            for (let i = 0; i < lastIndex; i++) {
              let insert;
              let s = strings2[i];
              if (s === "") {
                insert = createMarker();
              } else {
                const match = lastAttributeNameRegex.exec(s);
                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }
                insert = document.createTextNode(s);
              }
              parent.insertBefore(insert, node);
              this.parts.push({ type: "node", index: ++index });
            }
            if (strings2[lastIndex] === "") {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = strings2[lastIndex];
            }
            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8) {
          if (node.data === marker) {
            const parent = node.parentNode;
            if (node.previousSibling === null || index === lastPartIndex) {
              index++;
              parent.insertBefore(createMarker(), node);
            }
            lastPartIndex = index;
            this.parts.push({ type: "node", index });
            if (node.nextSibling === null) {
              node.data = "";
            } else {
              nodesToRemove.push(node);
              index--;
            }
            partIndex++;
          } else {
            let i = -1;
            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              this.parts.push({ type: "node", index: -1 });
              partIndex++;
            }
          }
        }
      }
      for (const n of nodesToRemove) {
        n.parentNode.removeChild(n);
      }
    }
  };
  var endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
  };
  var isTemplatePartActive = (part) => part.index !== -1;
  var createMarker = () => document.createComment("");
  var lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/template-instance.js
  var TemplateInstance = class {
    constructor(template, processor, options) {
      this.__parts = [];
      this.template = template;
      this.processor = processor;
      this.options = options;
    }
    update(values) {
      let i = 0;
      for (const part of this.__parts) {
        if (part !== void 0) {
          part.setValue(values[i]);
        }
        i++;
      }
      for (const part of this.__parts) {
        if (part !== void 0) {
          part.commit();
        }
      }
    }
    _clone() {
      const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
      const stack = [];
      const parts2 = this.template.parts;
      const walker = document.createTreeWalker(fragment, 133, null, false);
      let partIndex = 0;
      let nodeIndex = 0;
      let part;
      let node = walker.nextNode();
      while (partIndex < parts2.length) {
        part = parts2[partIndex];
        if (!isTemplatePartActive(part)) {
          this.__parts.push(void 0);
          partIndex++;
          continue;
        }
        while (nodeIndex < part.index) {
          nodeIndex++;
          if (node.nodeName === "TEMPLATE") {
            stack.push(node);
            walker.currentNode = node.content;
          }
          if ((node = walker.nextNode()) === null) {
            walker.currentNode = stack.pop();
            node = walker.nextNode();
          }
        }
        if (part.type === "node") {
          const part2 = this.processor.handleTextExpression(this.options);
          part2.insertAfterNode(node.previousSibling);
          this.__parts.push(part2);
        } else {
          this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
        }
        partIndex++;
      }
      if (isCEPolyfill) {
        document.adoptNode(fragment);
        customElements.upgrade(fragment);
      }
      return fragment;
    }
  };

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/template-result.js
  var policy = window.trustedTypes && trustedTypes.createPolicy("lit-html", { createHTML: (s) => s });
  var commentMarker = ` ${marker} `;
  var TemplateResult = class {
    constructor(strings, values, type, processor) {
      this.strings = strings;
      this.values = values;
      this.type = type;
      this.processor = processor;
    }
    getHTML() {
      const l = this.strings.length - 1;
      let html2 = "";
      let isCommentBinding = false;
      for (let i = 0; i < l; i++) {
        const s = this.strings[i];
        const commentOpen = s.lastIndexOf("<!--");
        isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf("-->", commentOpen + 1) === -1;
        const attributeMatch = lastAttributeNameRegex.exec(s);
        if (attributeMatch === null) {
          html2 += s + (isCommentBinding ? commentMarker : nodeMarker);
        } else {
          html2 += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
        }
      }
      html2 += this.strings[l];
      return html2;
    }
    getTemplateElement() {
      const template = document.createElement("template");
      let value = this.getHTML();
      if (policy !== void 0) {
        value = policy.createHTML(value);
      }
      template.innerHTML = value;
      return template;
    }
  };

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/parts.js
  var isPrimitive = (value) => {
    return value === null || !(typeof value === "object" || typeof value === "function");
  };
  var isIterable = (value) => {
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
  };
  var AttributeCommitter = class {
    constructor(element, name, strings) {
      this.dirty = true;
      this.element = element;
      this.name = name;
      this.strings = strings;
      this.parts = [];
      for (let i = 0; i < strings.length - 1; i++) {
        this.parts[i] = this._createPart();
      }
    }
    _createPart() {
      return new AttributePart(this);
    }
    _getValue() {
      const strings = this.strings;
      const l = strings.length - 1;
      const parts2 = this.parts;
      if (l === 1 && strings[0] === "" && strings[1] === "") {
        const v = parts2[0].value;
        if (typeof v === "symbol") {
          return String(v);
        }
        if (typeof v === "string" || !isIterable(v)) {
          return v;
        }
      }
      let text = "";
      for (let i = 0; i < l; i++) {
        text += strings[i];
        const part = parts2[i];
        if (part !== void 0) {
          const v = part.value;
          if (isPrimitive(v) || !isIterable(v)) {
            text += typeof v === "string" ? v : String(v);
          } else {
            for (const t of v) {
              text += typeof t === "string" ? t : String(t);
            }
          }
        }
      }
      text += strings[l];
      return text;
    }
    commit() {
      if (this.dirty) {
        this.dirty = false;
        this.element.setAttribute(this.name, this._getValue());
      }
    }
  };
  var AttributePart = class {
    constructor(committer) {
      this.value = void 0;
      this.committer = committer;
    }
    setValue(value) {
      if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
        this.value = value;
        if (!isDirective(value)) {
          this.committer.dirty = true;
        }
      }
    }
    commit() {
      while (isDirective(this.value)) {
        const directive2 = this.value;
        this.value = noChange;
        directive2(this);
      }
      if (this.value === noChange) {
        return;
      }
      this.committer.commit();
    }
  };
  var NodePart = class {
    constructor(options) {
      this.value = void 0;
      this.__pendingValue = void 0;
      this.options = options;
    }
    appendInto(container) {
      this.startNode = container.appendChild(createMarker());
      this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
      this.startNode = ref;
      this.endNode = ref.nextSibling;
    }
    appendIntoPart(part) {
      part.__insert(this.startNode = createMarker());
      part.__insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
      ref.__insert(this.startNode = createMarker());
      this.endNode = ref.endNode;
      ref.endNode = this.startNode;
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      if (this.startNode.parentNode === null) {
        return;
      }
      while (isDirective(this.__pendingValue)) {
        const directive2 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive2(this);
      }
      const value = this.__pendingValue;
      if (value === noChange) {
        return;
      }
      if (isPrimitive(value)) {
        if (value !== this.value) {
          this.__commitText(value);
        }
      } else if (value instanceof TemplateResult) {
        this.__commitTemplateResult(value);
      } else if (value instanceof Node) {
        this.__commitNode(value);
      } else if (isIterable(value)) {
        this.__commitIterable(value);
      } else if (value === nothing) {
        this.value = nothing;
        this.clear();
      } else {
        this.__commitText(value);
      }
    }
    __insert(node) {
      this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
      if (this.value === value) {
        return;
      }
      this.clear();
      this.__insert(value);
      this.value = value;
    }
    __commitText(value) {
      const node = this.startNode.nextSibling;
      value = value == null ? "" : value;
      const valueAsString = typeof value === "string" ? value : String(value);
      if (node === this.endNode.previousSibling && node.nodeType === 3) {
        node.data = valueAsString;
      } else {
        this.__commitNode(document.createTextNode(valueAsString));
      }
      this.value = value;
    }
    __commitTemplateResult(value) {
      const template = this.options.templateFactory(value);
      if (this.value instanceof TemplateInstance && this.value.template === template) {
        this.value.update(value.values);
      } else {
        const instance = new TemplateInstance(template, value.processor, this.options);
        const fragment = instance._clone();
        instance.update(value.values);
        this.__commitNode(fragment);
        this.value = instance;
      }
    }
    __commitIterable(value) {
      if (!Array.isArray(this.value)) {
        this.value = [];
        this.clear();
      }
      const itemParts = this.value;
      let partIndex = 0;
      let itemPart;
      for (const item of value) {
        itemPart = itemParts[partIndex];
        if (itemPart === void 0) {
          itemPart = new NodePart(this.options);
          itemParts.push(itemPart);
          if (partIndex === 0) {
            itemPart.appendIntoPart(this);
          } else {
            itemPart.insertAfterPart(itemParts[partIndex - 1]);
          }
        }
        itemPart.setValue(item);
        itemPart.commit();
        partIndex++;
      }
      if (partIndex < itemParts.length) {
        itemParts.length = partIndex;
        this.clear(itemPart && itemPart.endNode);
      }
    }
    clear(startNode = this.startNode) {
      removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
  };
  var BooleanAttributePart = class {
    constructor(element, name, strings) {
      this.value = void 0;
      this.__pendingValue = void 0;
      if (strings.length !== 2 || strings[0] !== "" || strings[1] !== "") {
        throw new Error("Boolean attributes can only contain a single expression");
      }
      this.element = element;
      this.name = name;
      this.strings = strings;
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      while (isDirective(this.__pendingValue)) {
        const directive2 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive2(this);
      }
      if (this.__pendingValue === noChange) {
        return;
      }
      const value = !!this.__pendingValue;
      if (this.value !== value) {
        if (value) {
          this.element.setAttribute(this.name, "");
        } else {
          this.element.removeAttribute(this.name);
        }
        this.value = value;
      }
      this.__pendingValue = noChange;
    }
  };
  var PropertyCommitter = class extends AttributeCommitter {
    constructor(element, name, strings) {
      super(element, name, strings);
      this.single = strings.length === 2 && strings[0] === "" && strings[1] === "";
    }
    _createPart() {
      return new PropertyPart(this);
    }
    _getValue() {
      if (this.single) {
        return this.parts[0].value;
      }
      return super._getValue();
    }
    commit() {
      if (this.dirty) {
        this.dirty = false;
        this.element[this.name] = this._getValue();
      }
    }
  };
  var PropertyPart = class extends AttributePart {
  };
  var eventOptionsSupported = false;
  (() => {
    try {
      const options = {
        get capture() {
          eventOptionsSupported = true;
          return false;
        }
      };
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (_e) {
    }
  })();
  var EventPart = class {
    constructor(element, eventName, eventContext) {
      this.value = void 0;
      this.__pendingValue = void 0;
      this.element = element;
      this.eventName = eventName;
      this.eventContext = eventContext;
      this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      while (isDirective(this.__pendingValue)) {
        const directive2 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive2(this);
      }
      if (this.__pendingValue === noChange) {
        return;
      }
      const newListener = this.__pendingValue;
      const oldListener = this.value;
      const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
      const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
      if (shouldRemoveListener) {
        this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
      }
      if (shouldAddListener) {
        this.__options = getOptions(newListener);
        this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
      }
      this.value = newListener;
      this.__pendingValue = noChange;
    }
    handleEvent(event) {
      if (typeof this.value === "function") {
        this.value.call(this.eventContext || this.element, event);
      } else {
        this.value.handleEvent(event);
      }
    }
  };
  var getOptions = (o) => o && (eventOptionsSupported ? { capture: o.capture, passive: o.passive, once: o.once } : o.capture);

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/default-template-processor.js
  var DefaultTemplateProcessor = class {
    handleAttributeExpressions(element, name, strings, options) {
      const prefix = name[0];
      if (prefix === ".") {
        const committer2 = new PropertyCommitter(element, name.slice(1), strings);
        return committer2.parts;
      }
      if (prefix === "@") {
        return [new EventPart(element, name.slice(1), options.eventContext)];
      }
      if (prefix === "?") {
        return [new BooleanAttributePart(element, name.slice(1), strings)];
      }
      const committer = new AttributeCommitter(element, name, strings);
      return committer.parts;
    }
    handleTextExpression(options) {
      return new NodePart(options);
    }
  };
  var defaultTemplateProcessor = new DefaultTemplateProcessor();

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/template-factory.js
  function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === void 0) {
      templateCache = {
        stringsArray: new WeakMap(),
        keyString: new Map()
      };
      templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== void 0) {
      return template;
    }
    const key = result.strings.join(marker);
    template = templateCache.keyString.get(key);
    if (template === void 0) {
      template = new Template(result, result.getTemplateElement());
      templateCache.keyString.set(key, template);
    }
    templateCache.stringsArray.set(result.strings, template);
    return template;
  }
  var templateCaches = new Map();

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lib/render.js
  var parts = new WeakMap();
  var render = (result, container, options) => {
    let part = parts.get(container);
    if (part === void 0) {
      removeNodes(container, container.firstChild);
      parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
      part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
  };

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/lit-html.js
  if (typeof window !== "undefined") {
    (window["litHtmlVersions"] || (window["litHtmlVersions"] = [])).push("1.4.1");
  }
  var html = (strings, ...values) => new TemplateResult(strings, values, "html", defaultTemplateProcessor);

  // src/components/Stores.js
  var gog_icon_url = config_default.GOG_ICON_URL;
  var itch_icon_url = config_default.ITCH_ICON_URL;
  var humble_icon_url = config_default.HUMBLE_ICON_URL;
  var getIconUrl = (store_id) => {
    if (store_id === "gog")
      return gog_icon_url;
    if (store_id === "itchio")
      return itch_icon_url;
    if (store_id === "humblestore")
      return humble_icon_url;
    return "";
  };
  var Stores = (stores) => html`
    <div>
        ${stores.map((s) => {
    if (s.shop.id === "humblestore" && s.drm.indexOf("DRM Free") < 0) {
      return null;
    }
    if (s.shop.id === "gog") {
      s.url = "https://www.gog.com" + decodeURIComponent(s.url.split("www.gog.com")[1]);
    }
    return html`
                <span style="padding-right: 2em;">
                    <a href=${s.url}>
                        <img
                            src=${getIconUrl(s.shop.id)}
                            style="width: 20px; height: 20px; vertical-align: middle; margin: 0 4px 0 0;"
                        />
                        $${s.price_new}
                    </a>
                </span>
            `;
  })}
    </div>
`;
  var Stores_default = Stores;

  // node_modules/.pnpm/lit-html@1.4.1/node_modules/lit-html/directives/style-map.js
  var previousStylePropertyCache = new WeakMap();
  var styleMap = directive((styleInfo) => (part) => {
    if (!(part instanceof AttributePart) || part instanceof PropertyPart || part.committer.name !== "style" || part.committer.parts.length > 1) {
      throw new Error("The `styleMap` directive must be used in the style attribute and must be the only part in the attribute.");
    }
    const { committer } = part;
    const { style } = committer.element;
    let previousStyleProperties = previousStylePropertyCache.get(part);
    if (previousStyleProperties === void 0) {
      style.cssText = committer.strings.join(" ");
      previousStylePropertyCache.set(part, previousStyleProperties = new Set());
    }
    previousStyleProperties.forEach((name) => {
      if (!(name in styleInfo)) {
        previousStyleProperties.delete(name);
        if (name.indexOf("-") === -1) {
          style[name] = null;
        } else {
          style.removeProperty(name);
        }
      }
    });
    for (const name in styleInfo) {
      previousStyleProperties.add(name);
      if (name.indexOf("-") === -1) {
        style[name] = styleInfo[name];
      } else {
        style.setProperty(name, styleInfo[name]);
      }
    }
  });

  // src/components/AppContainer.js
  var AppContainerStyles = {
    padding: "1em",
    position: "relative",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    fontSize: "12px",
    color: "#626366",
    zIndex: "0"
  };
  var AppContainer = (children) => html`
    <div style=${styleMap(AppContainerStyles)}>
        <div style="padding-bottom: 1em;">
            <b>DRM-Free versions available from:</b>
        </div>
        
        ${children}
    </div>
`;
  var AppContainer_default = AppContainer;

  // src/components/WishlistContainer.js
  var WishlistContainer = (children) => html`
    <div>
        <div>
            <b>DRM-Free versions available from:</b>
        </div>
        
        ${children}
    </div>
`;
  var WishlistContainer_default = WishlistContainer;

  // src/index.js
  var location = window.location;
  var path = location.pathname.split("/");
  var itad = new ITAD_default(config_default.BASE_URL, config_default.API_KEY);
  function getStores(app_id, callback) {
    return itad.getSteamPlainId(app_id).then((id) => itad.getPrices(id, "us", "US")).then((data) => {
      const stores = data.list.filter((store) => {
        if (store.shop.id === "humblestore") {
          return store.drm.indexOf("DRM Free") > -1;
        }
        return true;
      });
      if (stores.length > 0) {
        callback(stores);
      }
    });
  }
  if (path[1] === "app") {
    if (path[2]) {
      const app_id = path[2];
      getStores(app_id, (stores) => {
        const purchaseBox = q(".game_area_purchase_game");
        const appContainer = c("div", "its-drm-free-container");
        purchaseBox.insertAdjacentElement("beforebegin", appContainer);
        render(AppContainer_default(Stores_default(stores)), appContainer);
      });
    }
  }
  if (path[1] === "wishlist") {
    const cache = {};
    const mutationCallback = (mutationList, observer2) => {
      mutationList.forEach((mutation) => {
        const row = mutation.addedNodes[0];
        if (row) {
          const existing = row.querySelector("div.idf-wishlist-container");
          if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
          }
          const referenceEl = row.querySelector("div.value.release_date");
          const wishlistContainer = c("div", "idf-wishlist-container");
          wishlistContainer.style.display = "none";
          referenceEl.insertAdjacentElement("afterend", wishlistContainer);
          row.addEventListener("mouseleave", (e) => {
            wishlistContainer.style.display = "none";
          });
          row.addEventListener("mouseenter", (e) => {
            const app_id = row.dataset.appId;
            if (app_id in cache) {
              const stores = cache[app_id];
              render(WishlistContainer_default(Stores_default(stores)), wishlistContainer);
              wishlistContainer.style.display = "block";
            } else {
              getStores(app_id, (stores) => {
                cache[app_id] = stores;
                render(WishlistContainer_default(Stores_default(stores)), wishlistContainer);
                wishlistContainer.style.display = "block";
              });
            }
          });
        }
      });
    };
    const wishlist = q("#wishlist_ctn");
    const observer = new MutationObserver(mutationCallback);
    observer.observe(wishlist, {
      childList: true,
      attributes: false,
      subtree: false
    });
  }
})();
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
