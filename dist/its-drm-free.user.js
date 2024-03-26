// ==UserScript==
// @name its-drm-free
// @namespace https://github.com/kevinfiol/its-drm-free
// @version 1.2.2
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
  // node_modules/.pnpm/umhi@0.1.4/node_modules/umhi/dist/umhi.js
  var NIL = void 0;
  var REDRAWS = [];
  var isArray = Array.isArray;
  var isStr = (x) => typeof x === "string";
  var isFn = (x) => typeof x === "function";
  var isObj = (x) => x !== null && typeof x === "object";
  var createNode = (v) => document[v._cmp ? "createElement" : "createTextNode"](v.tag || v);
  var addChildren = (x, children) => {
    if (isArray(x))
      for (let i = 0; i < x.length; i++)
        addChildren(x[i], children);
    else if (x != null && x !== false)
      children.push(x);
  };
  var styles = (obj) => {
    let str = "";
    for (let k in obj)
      str += k.replace(/[A-Z]/g, (m2) => "-" + m2.toLowerCase()) + ":" + obj[k] + ";";
    return str;
  };
  var update = (node, v, redraw) => {
    if (!v._cmp)
      return node.nodeValue === v + "" || (node.nodeValue = v);
    for (let i in v.props) {
      let newProp = v.props[i];
      if (i in node) {
        if (redraw && i[0] === "o" && i[1] === "n" && isFn(newProp)) {
          let res, fn = newProp;
          node[i] = (ev) => (res = fn(ev)) instanceof Promise ? res.finally((_2) => (redraw(), res = NIL)) : (redraw(), res = NIL);
        } else {
          if (i === "style" && isObj(newProp))
            newProp = styles(newProp);
          node[i] = newProp;
        }
      } else if (!isFn(newProp) && node.getAttribute(i) != newProp) {
        if (newProp == null || newProp === false)
          node.removeAttribute(i);
        else
          node.setAttribute(i, newProp);
      }
    }
    for (let i = 0, names = [...node.getAttributeNames(), ...Object.keys(node)]; i < names.length; i++)
      if (!(names[i] in v.props))
        i in node ? node[names[i]] = NIL : node.removeAttribute(names[i]);
  };
  function render(parent, cmp, redraw) {
    let i, tmp, olds = parent.childNodes || [], children = cmp.children || [], news = isArray(children) ? children : [children];
    for (i = 0, tmp = Array(Math.max(0, olds.length - news.length)); i < tmp.length; i++)
      parent.removeChild(parent.lastChild);
    for (i = 0; i < news.length; i++) {
      let node, vnode = news[i];
      node = olds[i] || createNode(vnode);
      if (!olds[i])
        parent.appendChild(node);
      else if ((node.tagName || "") !== (vnode.tag || "").toUpperCase()) {
        node = createNode(vnode);
        parent.replaceChild(node, olds[i]);
      }
      update(node, vnode, redraw);
      render(node, vnode, redraw);
    }
  }
  function mount(el, cmp) {
    let redraw;
    el.innerHTML = "";
    REDRAWS.push(
      redraw = (_2) => requestAnimationFrame(
        (_3) => render(el, { children: cmp() }, redraw)
      )
    );
    return redraw() && redraw;
  }
  function m(tag, ...tail) {
    let k, tmp, classes, first = tail[0], props = {}, children = [];
    if (isObj(first) && !isArray(first) && first.tag === NIL)
      [props, ...tail] = tail;
    if (isStr(tag)) {
      [tag, ...classes] = tag.split(".");
      classes = classes.join(" ");
      if (isObj(tmp = props.class)) {
        for (k in tmp) {
          if (tmp[k]) {
            if (classes)
              classes += " ";
            classes += k;
          }
        }
      }
      if (isStr(tmp))
        classes += !classes ? tmp : tmp ? " " + tmp : "";
      if (classes)
        props.class = classes;
    }
    addChildren(tail, children);
    return { _cmp: 1, tag, props: { ...props }, children };
  }

  // src/config.js
  var VERSION = "1.2.2";
  var API_KEY = "d047b30e0fc7d9118f3953de04fa6af9eba22379";
  var GOG_ICON_URL = "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/gog.png";
  var ITCH_ICON_URL = "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/itch.png";
  var HUMBLE_ICON_URL = "https://raw.githubusercontent.com/kevinfiol/its-drm-free/master/dist/humble.png";

  // src/util.js
  var request = (method, url, { params = {}, body = {} } = {}) => {
    const queryArr = Object.keys(params).map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    });
    const queryStr = queryArr.join("&");
    return new Promise((resolve, reject) => {
      if (window.GM_xmlhttpRequest) {
        const xhr = window.GM_xmlhttpRequest;
        xhr({
          method,
          url: `${url}?${queryStr}`,
          data: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          onload: (res) => {
            let json = {};
            try {
              json = JSON.parse(res.responseText);
            } catch {
            }
            if (res.status >= 200 && res.status < 400) {
              resolve(json);
            } else {
              reject(json);
            }
          },
          onerror: (err) => reject(err)
        });
      } else {
        const xhr = new XMLHttpRequest();
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.open(method, `${url}?${queryStr}`);
        xhr.onload = () => {
          let json = {};
          try {
            json = JSON.parse(xhr.response);
          } catch {
          }
          if (xhr.status >= 200 && xhr.status < 400) {
            resolve(json);
          } else {
            reject(json);
          }
        };
        xhr.onerror = () => reject(xhr);
        xhr.send(JSON.stringify(body));
      }
    });
  };

  // src/itad.js
  var GOG = 35;
  var ITCH = 44;
  var HUMBLE = 37;
  var DRM_FREE = 1e3;
  var DRM_FREE_TAG = "Drm Free";
  var api = (iface, method, version) => `https://api.isthereanydeal.com/${iface}/${method}/${version}`;
  async function getGameId(appid = "") {
    let data = "";
    let error = void 0;
    const endpoint = api("games", "lookup", "v1");
    const params = { key: API_KEY, appid };
    try {
      const res = await request("GET", endpoint, { params });
      if (!res.found)
        throw Error("Game not found with appid", appid);
      data = res.game.id;
    } catch (e) {
      error = e;
    }
    return { data, error };
  }
  async function getStorePrices(gameId) {
    let data = {};
    let error = void 0;
    const endpoint = api("games", "prices", "v2");
    const params = {
      key: API_KEY,
      shops: [GOG, ITCH, HUMBLE].join(","),
      country: "US",
      capacity: 10,
      nondeals: true,
      vouchers: false
    };
    try {
      const res = await request("POST", endpoint, {
        params,
        body: [gameId]
      });
      if (res.length && res[0].deals.length) {
        const deals = res[0].deals;
        for (const deal of deals) {
          const shopId = deal.shop.id;
          let shop = "";
          if (shopId === ITCH)
            shop = "itch";
          if (shopId === HUMBLE) {
            shop = "humble";
            const isDrmFree = deal.drm.some(
              (drm) => drm.id === DRM_FREE || drm.name === DRM_FREE_TAG
            );
            if (!isDrmFree)
              continue;
          }
          if (shopId === GOG) {
            shop = "gog";
            const finalUrl = await request("GET", deal.url).catch((res2) => decodeURIComponent(res2.finalUrl));
            deal.url = "https://www.gog.com" + decodeURIComponent(finalUrl.split("www.gog.com")[1]);
          }
          ;
          data[shop] = {
            shop,
            price: `$${deal.price.amount}`,
            url: deal.url
          };
        }
      }
    } catch (e) {
      error = e;
    }
    return { data, error };
  }

  // src/components.js
  var getIconUrl = (shop) => {
    if (shop === "gog")
      return GOG_ICON_URL;
    if (shop === "itch")
      return ITCH_ICON_URL;
    if (shop === "humble")
      return HUMBLE_ICON_URL;
    return "";
  };
  var Prices = ({ prices }) => m(
    "div",
    Object.entries(prices).map(
      ([shop, data]) => m(
        "span",
        { style: { paddingRight: "2em" } },
        m(
          "a",
          { href: data.url },
          m("img", {
            src: getIconUrl(shop),
            style: {
              width: "20px",
              height: "20px",
              verticalAlign: "middle",
              margin: "0 4px 0 0"
            }
          }),
          data.price
        )
      )
    )
  );
  var Container = ({ isAppPage = false }, ...children) => m(
    "div",
    {
      style: isAppPage ? {
        padding: "1em",
        position: "relative",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        fontSize: "12px",
        color: "#626366",
        zIndex: "0"
      } : ""
    },
    m(
      "div",
      { style: isAppPage ? { paddingBottom: "1em" } : "" },
      m("b", "DRM-Free versions available from:")
    ),
    children
  );

  // src/index.js
  var LOG_MESSAGE = `=== its-drm-free version ${VERSION} ===`;
  var [_, PAGE_TYPE, APP_ID] = window.location.pathname.split("/");
  async function getStores(app_id, callback) {
    try {
      const id = await getGameId(app_id);
      if (id.error)
        throw id.error;
      const prices = await getStorePrices(id.data);
      if (prices.error)
        throw prices.error;
      if (Object.keys(prices.data).length > 0) {
        callback(prices.data);
      }
    } catch (e) {
      console.error("its-drm-free getStores error", e);
    }
  }
  if (PAGE_TYPE === "app" && APP_ID) {
    console.log(LOG_MESSAGE);
    getStores(APP_ID, (prices) => {
      const appContainer = document.createElement("div");
      appContainer.classList.add("its-drm-free-container");
      document.querySelector(".game_area_purchase_game").insertAdjacentElement("beforebegin", appContainer);
      mount(
        appContainer,
        () => Container(
          { isAppPage: true },
          Prices({ prices })
        )
      );
    });
  }
  if (PAGE_TYPE === "wishlist") {
    console.log(LOG_MESSAGE);
    const cache = {};
    const mutationCallback = (mutationList) => {
      mutationList.forEach((mutation) => {
        const row = mutation.addedNodes[0];
        if (!row)
          return;
        const existing = row.querySelector("div.idf-wishlist-container");
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
        const referenceEl = row.querySelector("div.value.release_date");
        const wishlistContainer = document.createElement("div");
        wishlistContainer.classList.add("idf-wishlist-container");
        wishlistContainer.style.display = "none";
        referenceEl.insertAdjacentElement("afterend", wishlistContainer);
        row.addEventListener("mouseleave", () => {
          wishlistContainer.style.display = "none";
        });
        row.addEventListener("mouseenter", () => {
          const app_id = row.dataset.appId;
          if (app_id in cache) {
            const prices = cache[app_id];
            mount(
              wishlistContainer,
              () => Container(
                {},
                Prices({ prices })
              )
            );
            wishlistContainer.style.display = "block";
          } else {
            getStores(app_id, (prices) => {
              cache[app_id] = prices;
              mount(
                wishlistContainer,
                () => Container(
                  {},
                  Prices({ prices })
                )
              );
              wishlistContainer.style.display = "block";
            });
          }
        });
      });
    };
    const wishlist = document.querySelector("#wishlist_ctn");
    const observer = new MutationObserver(mutationCallback);
    observer.observe(wishlist, {
      childList: true,
      attributes: false,
      subtree: false
    });
  }
})();
