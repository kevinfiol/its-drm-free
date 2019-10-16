// ==UserScript==
// @name its-drm-free
// @namespace https://github.com/kevinfiol/its-drm-free
// @version 1.0.0
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
(function () {
    'use strict';

    /**
     * DOM Methods
     */
    var q = function (query) { return document.querySelector(query); };

    var c = function (tag, className, innerHTML) {
        if ( innerHTML === void 0 ) innerHTML = '';

        var el = document.createElement(tag);
        el.className = className;
        el.innerHTML = innerHTML;
        return el;
    };

    var request = function (method, endpoint, params) {
        if ( params === void 0 ) params = {};

        var queryString = '';

        var queryArr = Object.keys(params).map(function (key) { return ((encodeURIComponent(key)) + "=" + (encodeURIComponent(params[key]))); }
        );

        if (queryArr.length)
            { queryString = '?' + queryArr.join('&'); }

        var url = endpoint + queryString;

        return new Promise(function (resolve, reject) {
            if (window.GM_xmlhttpRequest) {
                var xhr = window.GM_xmlhttpRequest;

                xhr({
                    method: method,
                    url: url,
                    onload: function (res) {
                        if (res.status >= 200 && res.status < 300) {
                            resolve(res.responseText);
                        } else {
                            reject(res.statusText);
                        }
                    },
                    onerror: function (err) { return reject(err.statusText); }
                });
            } else {
                var xhr$1 = new XMLHttpRequest();
                xhr$1.open(method, url);
        
                xhr$1.onload = function () {
                    if (xhr$1.status >= 200 && xhr$1.status < 300) {
                        resolve(xhr$1.response);
                    } else {
                        reject(xhr$1.statusText);
                    }
                };
        
                xhr$1.onerror = function () { return reject(xhr$1.statusText); };
                xhr$1.send();
            }
        });
    };

    var get = function (url, params) {
            if ( params === void 0 ) params = {};

            return request('GET', url, params).then(JSON.parse);
    }
    ;

    function ITAD(base_url, api_key) {
        this.base_url = base_url;
        this.api_key = api_key;
    }

    ITAD.prototype.makeEndpoint = function(version, iface, method) {
        return ((this.base_url) + "/" + version + "/" + iface + "/" + method + "/");
    };

    ITAD.prototype.parseResponse = function(res) {
        var key = Object.keys(res.data)[0];
        return res.data[key];
    };

    ITAD.prototype.getPlainId = function(shop, game_id) {
        var endpoint = this.makeEndpoint('v02', 'game', 'plain');
        var data = { key: this.api_key, shop: shop, game_id: game_id };

        return get(endpoint, data);
    };

    ITAD.prototype.getSteamPlainId = function(steam_appid) {
        var endpoint = this.makeEndpoint('v02', 'game', 'plain');
        var data = { key: this.api_key, game_id: ("app/" + steam_appid), shop: 'steam' };

        return get(endpoint, data)
            .then(this.parseResponse)
        ;
    };

    ITAD.prototype.getPrices = function(plain_id, region, country) {
        var endpoint = this.makeEndpoint('v01', 'game', 'prices');
        var data = { key: this.api_key, plains: plain_id, shops: 'gog,itchio,humblestore', region: region, country: country };

        return get(endpoint, data)
            .then(this.parseResponse)
        ;
    };

    var config = {
        VERSION: '1.0.0',
        BASE_URL: 'https://api.isthereanydeal.com',
        API_KEY: 'd047b30e0fc7d9118f3953de04fa6af9eba22379',
        GOG_ICON_URL: 'https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/gog.png',
        ITCH_ICON_URL: 'https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/itch.png',
        HUMBLE_ICON_URL: 'https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/humble.png'
    };

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
    var directives = new WeakMap();
    /**
     * Brands a function as a directive factory function so that lit-html will call
     * the function during template rendering, rather than passing as a value.
     *
     * A _directive_ is a function that takes a Part as an argument. It has the
     * signature: `(part: Part) => void`.
     *
     * A directive _factory_ is a function that takes arguments for data and
     * configuration and returns a directive. Users of directive usually refer to
     * the directive factory as the directive. For example, "The repeat directive".
     *
     * Usually a template author will invoke a directive factory in their template
     * with relevant arguments, which will then return a directive function.
     *
     * Here's an example of using the `repeat()` directive factory that takes an
     * array and a function to render an item:
     *
     * ```js
     * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
     * ```
     *
     * When `repeat` is invoked, it returns a directive function that closes over
     * `items` and the template function. When the outer template is rendered, the
     * return directive function is called with the Part for the expression.
     * `repeat` then performs it's custom logic to render multiple items.
     *
     * @param f The directive factory function. Must be a function that returns a
     * function of the signature `(part: Part) => void`. The returned function will
     * be called with the part object.
     *
     * @example
     *
     * import {directive, html} from 'lit-html';
     *
     * const immutable = directive((v) => (part) => {
     *   if (part.value !== v) {
     *     part.setValue(v)
     *   }
     * });
     */
    var directive = function (f) { return (function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var d = f.apply(void 0, args);
        directives.set(d, true);
        return d;
    }); };
    var isDirective = function (o) {
        return typeof o === 'function' && directives.has(o);
    };
    //# sourceMappingURL=directive.js.map

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
     * True if the custom elements polyfill is in use.
     */
    var isCEPolyfill = window.customElements !== undefined &&
        window.customElements.polyfillWrapFlushCallback !==
            undefined;
    /**
     * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
     * `container`.
     */
    var removeNodes = function (container, start, end) {
        if ( end === void 0 ) end = null;

        while (start !== end) {
            var n = start.nextSibling;
            container.removeChild(start);
            start = n;
        }
    };
    //# sourceMappingURL=dom.js.map

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
    /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */
    var noChange = {};
    /**
     * A sentinel value that signals a NodePart to fully clear its content.
     */
    var nothing = {};
    //# sourceMappingURL=part.js.map

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
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */
    var marker = "{{lit-" + (String(Math.random()).slice(2)) + "}}";
    /**
     * An expression marker used text-positions, multi-binding attributes, and
     * attributes with markup-like text values.
     */
    var nodeMarker = "<!--" + marker + "-->";
    var markerRegex = new RegExp((marker + "|" + nodeMarker));
    /**
     * Suffix appended to all bound attribute names.
     */
    var boundAttributeSuffix = '$lit$';
    /**
     * An updateable Template that tracks the location of dynamic parts.
     */
    var Template = function Template(result, element) {
        this.parts = [];
        this.element = element;
        var nodesToRemove = [];
        var stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        var walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        var lastPartIndex = 0;
        var index = -1;
        var partIndex = 0;
        var strings = result.strings;
        var length = result.values.length;
        while (partIndex < length) {
            var node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    var attributes = node.attributes;
                    var length$1 = attributes.length;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    var count = 0;
                    for (var i = 0; i < length$1; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        var stringForPart = strings[partIndex];
                        // Find the attribute name
                        var name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        var attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        var attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        var statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index: index, name: name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                var data = node.data;
                if (data.indexOf(marker) >= 0) {
                    var parent = node.parentNode;
                    var strings$1 = data.split(markerRegex);
                    var lastIndex = strings$1.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (var i$1 = 0; i$1 < lastIndex; i$1++) {
                        var insert = (void 0);
                        var s = strings$1[i$1];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            var match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings$1[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings$1[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    var parent$1 = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent$1.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index: index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    var i$2 = -1;
                    while ((i$2 = node.data.indexOf(marker, i$2 + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (var i$3 = 0, list = nodesToRemove; i$3 < list.length; i$3 += 1) {
            var n = list[i$3];

            n.parentNode.removeChild(n);
        }
    };
    var endsWith = function (str, suffix) {
        var index = str.length - suffix.length;
        return index >= 0 && str.slice(index) === suffix;
    };
    var isTemplatePartActive = function (part) { return part.index !== -1; };
    // Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.
    var createMarker = function () { return document.createComment(''); };
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#elements-attributes
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-characters
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
     * space character except " ".
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */
    var lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
    //# sourceMappingURL=template.js.map

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
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */
    var TemplateInstance = function TemplateInstance(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    };
    TemplateInstance.prototype.update = function update (values) {
        var i = 0;
        for (var i$1 = 0, list = this.__parts; i$1 < list.length; i$1 += 1) {
            var part = list[i$1];

                if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (var i$2 = 0, list$1 = this.__parts; i$2 < list$1.length; i$2 += 1) {
            var part$1 = list$1[i$2];

                if (part$1 !== undefined) {
                part$1.commit();
            }
        }
    };
    TemplateInstance.prototype._clone = function _clone () {
            var ref;

        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        // method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari dooes not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        var fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        var stack = [];
        var parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        var walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        var partIndex = 0;
        var nodeIndex = 0;
        var part;
        var node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                var part$1 = this.processor.handleTextExpression(this.options);
                part$1.insertAfterNode(node.previousSibling);
                this.__parts.push(part$1);
            }
            else {
                (ref = this.__parts).push.apply(ref, this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    };
    //# sourceMappingURL=template-instance.js.map

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
    var commentMarker = " " + marker + " ";
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */
    var TemplateResult = function TemplateResult(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    };
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    TemplateResult.prototype.getHTML = function getHTML () {
        var l = this.strings.length - 1;
        var html = '';
        var isCommentBinding = false;
        for (var i = 0; i < l; i++) {
            var s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment poisition.
            //   * For node-position bindings we insert a comment with the marker
            // sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            // first binding, so that we support unquoted attribute bindings.
            // Subsequent bindings can use a comment marker because multi-binding
            // attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            // close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            var commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceeding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            var attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceeding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    };
    TemplateResult.prototype.getTemplateElement = function getTemplateElement () {
        var template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    };
    //# sourceMappingURL=template-result.js.map

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
    var isPrimitive = function (value) {
        return (value === null ||
            !(typeof value === 'object' || typeof value === 'function'));
    };
    var isIterable = function (value) {
        return Array.isArray(value) ||
            // tslint:disable-next-line:no-any
            !!(value && value[Symbol.iterator]);
    };
    /**
     * Writes attribute values to the DOM for a group of AttributeParts bound to a
     * single attibute. The value is only set once even if there are multiple parts
     * for an attribute.
     */
    var AttributeCommitter = function AttributeCommitter(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (var i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    };
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    AttributeCommitter.prototype._createPart = function _createPart () {
        return new AttributePart(this);
    };
    AttributeCommitter.prototype._getValue = function _getValue () {
        var strings = this.strings;
        var l = strings.length - 1;
        var text = '';
        for (var i = 0; i < l; i++) {
            text += strings[i];
            var part = this.parts[i];
            if (part !== undefined) {
                var v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                }
                else {
                    for (var i$1 = 0, list = v; i$1 < list.length; i$1 += 1) {
                        var t = list[i$1];

                            text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    };
    AttributeCommitter.prototype.commit = function commit () {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    };
    /**
     * A Part that controls all or part of an attribute value.
     */
    var AttributePart = function AttributePart(committer) {
        this.value = undefined;
        this.committer = committer;
    };
    AttributePart.prototype.setValue = function setValue (value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    };
    AttributePart.prototype.commit = function commit () {
        while (isDirective(this.value)) {
            var directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    };
    /**
     * A Part that controls a location within a Node tree. Like a Range, NodePart
     * has start and end locations and can set and update the Nodes between those
     * locations.
     *
     * NodeParts support several value types: primitives, Nodes, TemplateResults,
     * as well as arrays and iterables of those types.
     */
    var NodePart = function NodePart(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    };
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    NodePart.prototype.appendInto = function appendInto (container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    };
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    NodePart.prototype.insertAfterNode = function insertAfterNode (ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    };
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    NodePart.prototype.appendIntoPart = function appendIntoPart (part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    };
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    NodePart.prototype.insertAfterPart = function insertAfterPart (ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    };
    NodePart.prototype.setValue = function setValue (value) {
        this.__pendingValue = value;
    };
    NodePart.prototype.commit = function commit () {
        while (isDirective(this.__pendingValue)) {
            var directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        var value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    };
    NodePart.prototype.__insert = function __insert (node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    };
    NodePart.prototype.__commitNode = function __commitNode (value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    };
    NodePart.prototype.__commitText = function __commitText (value) {
        var node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        var valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    };
    NodePart.prototype.__commitTemplateResult = function __commitTemplateResult (value) {
        var template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            var instance = new TemplateInstance(template, value.processor, this.options);
            var fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    };
    NodePart.prototype.__commitIterable = function __commitIterable (value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        var itemParts = this.value;
        var partIndex = 0;
        var itemPart;
        for (var i = 0, list = value; i < list.length; i += 1) {
            // Try to reuse an existing part
            var item = list[i];

                itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    };
    NodePart.prototype.clear = function clear (startNode) {
            if ( startNode === void 0 ) startNode = this.startNode;

        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    };
    /**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */
    var BooleanAttributePart = function BooleanAttributePart(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    };
    BooleanAttributePart.prototype.setValue = function setValue (value) {
        this.__pendingValue = value;
    };
    BooleanAttributePart.prototype.commit = function commit () {
        while (isDirective(this.__pendingValue)) {
            var directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        var value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    };
    /**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */
    var PropertyCommitter = /*@__PURE__*/(function (AttributeCommitter) {
        function PropertyCommitter(element, name, strings) {
            AttributeCommitter.call(this, element, name, strings);
            this.single =
                (strings.length === 2 && strings[0] === '' && strings[1] === '');
        }

        if ( AttributeCommitter ) PropertyCommitter.__proto__ = AttributeCommitter;
        PropertyCommitter.prototype = Object.create( AttributeCommitter && AttributeCommitter.prototype );
        PropertyCommitter.prototype.constructor = PropertyCommitter;
        PropertyCommitter.prototype._createPart = function _createPart () {
            return new PropertyPart(this);
        };
        PropertyCommitter.prototype._getValue = function _getValue () {
            if (this.single) {
                return this.parts[0].value;
            }
            return AttributeCommitter.prototype._getValue.call(this);
        };
        PropertyCommitter.prototype.commit = function commit () {
            if (this.dirty) {
                this.dirty = false;
                // tslint:disable-next-line:no-any
                this.element[this.name] = this._getValue();
            }
        };

        return PropertyCommitter;
    }(AttributeCommitter));
    var PropertyPart = /*@__PURE__*/(function (AttributePart) {
        function PropertyPart () {
            AttributePart.apply(this, arguments);
        }if ( AttributePart ) PropertyPart.__proto__ = AttributePart;
        PropertyPart.prototype = Object.create( AttributePart && AttributePart.prototype );
        PropertyPart.prototype.constructor = PropertyPart;

        

        return PropertyPart;
    }(AttributePart));
    // Detect event listener options support. If the `capture` property is read
    // from the options object, then options are supported. If not, then the thrid
    // argument to add/removeEventListener is interpreted as the boolean capture
    // value so we should only pass the `capture` property.
    var eventOptionsSupported = false;
    try {
        var options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // tslint:disable-next-line:no-any
        window.addEventListener('test', options, options);
        // tslint:disable-next-line:no-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
    }
    var EventPart = function EventPart(element, eventName, eventContext) {
        var this$1 = this;

        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = function (e) { return this$1.handleEvent(e); };
    };
    EventPart.prototype.setValue = function setValue (value) {
        this.__pendingValue = value;
    };
    EventPart.prototype.commit = function commit () {
        while (isDirective(this.__pendingValue)) {
            var directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        var newListener = this.__pendingValue;
        var oldListener = this.value;
        var shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        var shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    };
    EventPart.prototype.handleEvent = function handleEvent (event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    };
    // We copy options because of the inconsistent behavior of browsers when reading
    // the third argument of add/removeEventListener. IE11 doesn't support options
    // at all. Chrome 41 only reads `capture` if the argument is an object.
    var getOptions = function (o) { return o &&
        (eventOptionsSupported ?
            { capture: o.capture, passive: o.passive, once: o.once } :
            o.capture); };
    //# sourceMappingURL=parts.js.map

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
     * Creates Parts when a template is instantiated.
     */
    var DefaultTemplateProcessor = function DefaultTemplateProcessor () {};

    DefaultTemplateProcessor.prototype.handleAttributeExpressions = function handleAttributeExpressions (element, name, strings, options) {
        var prefix = name[0];
        if (prefix === '.') {
            var committer$1 = new PropertyCommitter(element, name.slice(1), strings);
            return committer$1.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        var committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    };
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    DefaultTemplateProcessor.prototype.handleTextExpression = function handleTextExpression (options) {
        return new NodePart(options);
    };
    var defaultTemplateProcessor = new DefaultTemplateProcessor();
    //# sourceMappingURL=default-template-processor.js.map

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
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */
    function templateFactory(result) {
        var templateCache = templateCaches.get(result.type);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(result.type, templateCache);
        }
        var template = templateCache.stringsArray.get(result.strings);
        if (template !== undefined) {
            return template;
        }
        // If the TemplateStringsArray is new, generate a key from the strings
        // This key is shared between all templates with identical content
        var key = result.strings.join(marker);
        // Check if we already have a Template for this key
        template = templateCache.keyString.get(key);
        if (template === undefined) {
            // If we have not seen this key before, create a new Template
            template = new Template(result, result.getTemplateElement());
            // Cache the Template for this key
            templateCache.keyString.set(key, template);
        }
        // Cache all future queries for this TemplateStringsArray
        templateCache.stringsArray.set(result.strings, template);
        return template;
    }
    var templateCaches = new Map();
    //# sourceMappingURL=template-factory.js.map

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
    var parts = new WeakMap();
    /**
     * Renders a template result or other value to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result Any value renderable by NodePart - typically a TemplateResult
     *     created by evaluating a template tag like `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param options RenderOptions for the entire render tree rendered to this
     *     container. Render options must *not* change between renders to the same
     *     container, as those changes will not effect previously rendered DOM.
     */
    var render = function (result, container, options) {
        var part = parts.get(container);
        if (part === undefined) {
            removeNodes(container, container.firstChild);
            parts.set(container, part = new NodePart(Object.assign({ templateFactory: templateFactory }, options)));
            part.appendInto(container);
        }
        part.setValue(result);
        part.commit();
    };
    //# sourceMappingURL=render.js.map

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
    // IMPORTANT: do not change the property name or the assignment expression.
    // This line will be used in regexes to search for lit-html usage.
    // TODO(justinfagnani): inject version number at build time
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.2');
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */
    var html = function (strings) {
    	var values = [], len = arguments.length - 1;
    	while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    	return new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
    };
    //# sourceMappingURL=lit-html.js.map

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
    /**
     * Stores the StyleInfo object applied to a given AttributePart.
     * Used to unset existing values when a new StyleInfo object is applied.
     */
    var styleMapCache = new WeakMap();
    /**
     * A directive that applies CSS properties to an element.
     *
     * `styleMap` can only be used in the `style` attribute and must be the only
     * expression in the attribute. It takes the property names in the `styleInfo`
     * object and adds the property values as CSS propertes. Property names with
     * dashes (`-`) are assumed to be valid CSS property names and set on the
     * element's style object using `setProperty()`. Names without dashes are
     * assumed to be camelCased JavaScript property names and set on the element's
     * style object using property assignment, allowing the style object to
     * translate JavaScript-style names to CSS property names.
     *
     * For example `styleMap({backgroundColor: 'red', 'border-top': '5px', '--size':
     * '0'})` sets the `background-color`, `border-top` and `--size` properties.
     *
     * @param styleInfo {StyleInfo}
     */
    var styleMap = directive(function (styleInfo) { return function (part) {
        if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
            part.committer.name !== 'style' || part.committer.parts.length > 1) {
            throw new Error('The `styleMap` directive must be used in the style attribute ' +
                'and must be the only part in the attribute.');
        }
        var committer = part.committer;
        var ref = committer.element;
        var style = ref.style;
        // Handle static styles the first time we see a Part
        if (!styleMapCache.has(part)) {
            style.cssText = committer.strings.join(' ');
        }
        // Remove old properties that no longer exist in styleInfo
        var oldInfo = styleMapCache.get(part);
        for (var name in oldInfo) {
            if (!(name in styleInfo)) {
                if (name.indexOf('-') === -1) {
                    // tslint:disable-next-line:no-any
                    style[name] = null;
                }
                else {
                    style.removeProperty(name);
                }
            }
        }
        // Add or update properties
        for (var name$1 in styleInfo) {
            if (name$1.indexOf('-') === -1) {
                // tslint:disable-next-line:no-any
                style[name$1] = styleInfo[name$1];
            }
            else {
                style.setProperty(name$1, styleInfo[name$1]);
            }
        }
        styleMapCache.set(part, styleInfo);
    }; });
    //# sourceMappingURL=style-map.js.map

    var templateObject$1 = Object.freeze(["\n                    <span style=\"padding-right: 2em;\">\n                        <a href=", ">\n                            <img\n                                src=", "\n                                style=\"width: 20px; height: 20px; vertical-align: middle; margin: 0 4px 0 0;\"\n                            />\n                            $", "\n                        </a>\n                    </span>\n                "]);
    var templateObject = Object.freeze(["\n    <div style=", ">\n        <div style=\"padding-bottom: 1em;\">\n            <b>DRM-Free versions available from:</b>\n        </div>\n        \n        <div>\n            ", "\n        </div>\n    </div>\n"]);

    var gog_icon_url = config.GOG_ICON_URL;
    var itch_icon_url = config.ITCH_ICON_URL;
    var humble_icon_url = config.HUMBLE_ICON_URL;

    var getIconUrl = function (store_id) {
        if (store_id === 'gog') { return gog_icon_url; }
        if (store_id === 'itchio') { return itch_icon_url; }
        if (store_id === 'humblestore') { return humble_icon_url; }
        return '';
    };

    var ContainerStyles = {
        padding: '1em',
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        fontSize: '12px',
        color: '#626366',
        zIndex: '0'
    };

    var Container = function (stores) { return html(templateObject, styleMap(ContainerStyles), stores.map(function (s) {
                    if (s.shop.id === 'humblestore' && s.drm.indexOf('DRM Free') < 0) {
                        // Humble Store version is not DRM-Free
                        return null;
                    }

                    return html(templateObject$1, s.url, getIconUrl(s.shop.id), s.price_new);
                })); };

    var templateObject$2 = Object.freeze(["\n    <div>\n        <p>hello</p>\n    </div>\n"]);

    var WishlistContainer = function () { return html(templateObject$2); };

    var location = window.location;
    var path = location.pathname.split('/');
    var itad = new ITAD(config.BASE_URL, config.API_KEY);

    function getStores(app_id, callback) {    
        return itad.getSteamPlainId(app_id)
            .then(function (id) { return itad.getPrices(id, 'us', 'US'); })
            .then(function (data) {
                var stores = data.list;

                if (stores.length) {
                    if (stores.length === 1) {
                        // Check if HumbleStore is the only store
                        // If it is, make sure it has a DRM Free version
                        // Else, don't render the Container
                        var store = stores[0];
                        
                        if (store.shop.id === 'humblestore' && store.drm.indexOf('DRM Free') < 0) {
                            return;
                        }
                    }

                    callback(stores);
                }
            })
        ;
    }

    // App Page
    if (path[1] === 'app') {
        if (path[2]) {
            var app_id = path[2];

            getStores(app_id, function (stores) {
                // Game Store Page
                var purchaseBox = q('.game_area_purchase_game');
                var appContainer = c('div', 'its-drm-free-container');

                purchaseBox.insertAdjacentElement('beforebegin', appContainer);
                render(Container(stores), appContainer);
            });
        }
    }

    // Wishlist
    if (path[1] === 'wishlist') {
        var mutationCallback = function (mutationList, observer) {
            mutationList.forEach(function (mutation) {
                var row = mutation.addedNodes[0];
        
                if (row) {
                    // Check to see if container already exists, if so, remove.
                    var existing = row.querySelector('div.idf-wishlist-container');
                    if (existing && existing.parentNode) {
                        existing.parentNode.removeChild(existing);
                    }

                    var row_title = row.querySelector('a.title');
                    var wishlistContainer = c('div', 'idf-wishlist-container');
                    wishlistContainer.style.display = 'none';

                    row_title.insertAdjacentElement('afterend', wishlistContainer);
                    render(WishlistContainer(), wishlistContainer);

                    row.addEventListener('mouseleave', function (e) {
                        wishlistContainer.style.display = 'none';
                    });

                    row.addEventListener('mouseenter', function (e) {
                        var app_id = row.dataset.appId;
                        wishlistContainer.style.display = 'block';
                    });
                }
            });
        };
        
        var wishlist = q('#wishlist_ctn');
        var observer = new MutationObserver(mutationCallback);
        
        observer.observe(wishlist, {
            childList: true,
            attributes: false,
            subtree: false
        });
    }

}());
//# sourceMappingURL=its-drm-free.user.js.map
