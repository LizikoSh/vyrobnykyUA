(() => {
  // node_modules/@vercel/analytics/dist/index.mjs
  var initQueue = () => {
    if (window.va) return;
    window.va = function a(...params) {
      if (!window.vaq) window.vaq = [];
      window.vaq.push(params);
    };
  };
  var name = "@vercel/analytics";
  var version = "2.0.1";
  function isBrowser() {
    return typeof window !== "undefined";
  }
  function detectEnvironment() {
    try {
      const env = "development";
      if (env === "development" || env === "test") {
        return "development";
      }
    } catch {
    }
    return "production";
  }
  function setMode(mode = "auto") {
    if (mode === "auto") {
      window.vam = detectEnvironment();
      return;
    }
    window.vam = mode;
  }
  function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
  }
  function isDevelopment() {
    return getMode() === "development";
  }
  function getScriptSrc(props) {
    if (props.scriptSrc) {
      return makeAbsolute(props.scriptSrc);
    }
    if (isDevelopment()) {
      return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
      return makeAbsolute(`${props.basePath}/insights/script.js`);
    }
    return "/_vercel/insights/script.js";
  }
  function loadProps(explicitProps, confString) {
    var _a;
    let props = explicitProps;
    if (confString) {
      try {
        props = {
          ...(_a = JSON.parse(confString)) == null ? void 0 : _a.analytics,
          ...explicitProps
        };
      } catch {
      }
    }
    setMode(props.mode);
    const dataset = {
      sdkn: name + (props.framework ? `/${props.framework}` : ""),
      sdkv: version
    };
    if (props.disableAutoTrack) {
      dataset.disableAutoTrack = "1";
    }
    if (props.viewEndpoint) {
      dataset.viewEndpoint = makeAbsolute(props.viewEndpoint);
    }
    if (props.eventEndpoint) {
      dataset.eventEndpoint = makeAbsolute(props.eventEndpoint);
    }
    if (props.sessionEndpoint) {
      dataset.sessionEndpoint = makeAbsolute(props.sessionEndpoint);
    }
    if (isDevelopment() && props.debug === false) {
      dataset.debug = "false";
    }
    if (props.dsn) {
      dataset.dsn = props.dsn;
    }
    if (props.endpoint) {
      dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
      dataset.endpoint = makeAbsolute(`${props.basePath}/insights`);
    }
    return {
      beforeSend: props.beforeSend,
      src: getScriptSrc(props),
      dataset
    };
  }
  function makeAbsolute(url) {
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") ? url : `/${url}`;
  }
  function inject(props = {
    debug: true
  }, confString) {
    var _a;
    if (!isBrowser()) return;
    const { beforeSend, src, dataset } = loadProps(props, confString);
    initQueue();
    if (beforeSend) {
      (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", beforeSend);
    }
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    for (const [key, value] of Object.entries(dataset)) {
      script.dataset[key] = value;
    }
    script.defer = true;
    script.onerror = () => {
      const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
      console.log(
        `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
      );
    };
    document.head.appendChild(script);
  }

  // src/app.js
  var SHEET_CSV = "https://docs.google.com/spreadsheets/d/1oR3MdPsyMUQd4ISP2sgvEvHB_m9tNgFdzfV0zKMicnk/gviz/tq?tqx=out:csv";
  var CACHE_KEY = "ukrainianManufacturersSnapshot_v2";
  var PAGE_SIZE = 24;
  var all = [];
  var filtered = [];
  var shown = PAGE_SIZE;
  var randomOrder = /* @__PURE__ */ new Map();
  var $ = (s) => document.querySelector(s);
  function buildRandomOrder() {
    const ids = all.map((x) => x.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    randomOrder = new Map(ids.map((id, index) => [id, index]));
  }
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]);
  var safeUrl = (v) => {
    if (!v) return "";
    v = v.trim();
    if (!/^https?:\/\//i.test(v) && /^(www\.|[\w-]+\.[a-z]{2,})/i.test(v)) v = "https://" + v;
    try {
      const u = new URL(v);
      return ["http:", "https:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  function parseCSV(t) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i], n = t[i + 1];
      if (c == '"' && q && n == '"') {
        cell += '"';
        i++;
      } else if (c == '"') q = !q;
      else if (c == "," && !q) {
        row.push(cell);
        cell = "";
      } else if ((c == "\n" || c == "\r") && !q) {
        if (c == "\r" && n == "\n") i++;
        row.push(cell);
        if (row.some((x) => x.trim())) rows.push(row);
        row = [];
        cell = "";
      } else cell += c;
    }
    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }
  function normalize(rows) {
    let category = "";
    const out = [];
    rows.slice(1).forEach((r) => {
      while (r.length < 9) r.push("");
      const cat = (r[1] || "").trim(), name2 = (r[2] || "").trim(), products = (r[3] || "").trim(), location = (r[4] || "").trim();
      if (cat) category = cat;
      if (!name2 || name2.length > 120) return;
      out.push({ id: out.length + 1, category: category || "\u0406\u043D\u0448\u0435", name: name2, products, location, website: (r[5] || "").trim(), facebook: (r[6] || "").trim(), instagram: (r[7] || "").trim() });
    });
    return out;
  }
  async function loadData() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        all = JSON.parse(cached);
        return;
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }
    const r = await fetch(SHEET_CSV);
    if (!r.ok) throw Error();
    all = normalize(parseCSV(await r.text()));
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  }
  function fillFilters() {
    const cats = [...new Set(all.map((x) => x.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "uk")), regs = [...new Set(all.map((x) => x.location).filter(Boolean))].sort((a, b) => a.localeCompare(b, "uk"));
    $("#category").insertAdjacentHTML("beforeend", cats.map((x) => `<option>${esc(x)}</option>`).join(""));
    $("#region").insertAdjacentHTML("beforeend", regs.map((x) => `<option>${esc(x)}</option>`).join(""));
    if (!$("#sort").querySelector('option[value="random"]')) $("#sort").insertAdjacentHTML("afterbegin", '<option value="random">\u0412\u0438\u043F\u0430\u0434\u043A\u043E\u0432\u0430 \u0434\u043E\u0431\u0456\u0440\u043A\u0430</option>');
    $("#sort").value = "random";
    $("#stat-brands").textContent = all.length;
    $("#stat-categories").textContent = cats.length;
    $("#stat-regions").textContent = regs.length;
  }
  function apply() {
    const q = $("#query").value.trim().toLowerCase(), cat = $("#category").value, reg = $("#region").value, sort = $("#sort").value;
    filtered = all.filter((x) => (!cat || x.category === cat) && (!reg || x.location === reg) && (!q || [x.name, x.products, x.category, x.location].join(" ").toLowerCase().includes(q)));
    if (sort === "random") filtered.sort((a, b) => (randomOrder.get(a.id) ?? 0) - (randomOrder.get(b.id) ?? 0));
    else filtered.sort((a, b) => (sort === "asc" ? 1 : -1) * a.name.localeCompare(b.name, "uk"));
    shown = PAGE_SIZE;
    render();
  }
  function render() {
    $("#found").textContent = filtered.length;
    $("#cards").innerHTML = filtered.slice(0, shown).map((x) => {
      const site = safeUrl(x.website);
      return `<article class="card"><div class="badges"><span class="badge">${esc(x.category)}</span>${x.location ? `<span class="badge location">\u2316 ${esc(x.location)}</span>` : ""}</div><h3>${esc(x.name)}</h3><p>${esc(x.products || "\u041E\u043F\u0438\u0441 \u043D\u0435 \u0432\u043A\u0430\u0437\u0430\u043D\u043E")}</p><div class="card-actions"><button class="details" data-id="${x.id}">\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0456\u0448\u0435</button>${site ? `<a class="text-link" target="_blank" rel="noopener noreferrer" href="${esc(site)}">\u0421\u0430\u0439\u0442 \u2197</a>` : ""}</div></article>`;
    }).join("");
    $("#empty").hidden = filtered.length !== 0;
    $("#load-more").hidden = shown >= filtered.length;
    document.querySelectorAll(".details").forEach((b) => b.onclick = () => openModal(+b.dataset.id));
  }
  function openModal(id) {
    const x = all.find((v) => v.id === id), links = [["\u0421\u0430\u0439\u0442", x.website], ["Facebook", x.facebook], ["Instagram", x.instagram]].map(([l, u]) => [l, safeUrl(u)]).filter((x2) => x2[1]);
    $("#modal-content").innerHTML = `<div class="badges"><span class="badge">${esc(x.category)}</span>${x.location ? `<span class="badge location">\u2316 ${esc(x.location)}</span>` : ""}</div><h2 class="modal-title">${esc(x.name)}</h2><p class="modal-description">${esc(x.products || "\u041E\u043F\u0438\u0441 \u043D\u0435 \u0432\u043A\u0430\u0437\u0430\u043D\u043E.")}</p><div class="modal-links">${links.length ? links.map(([l, u]) => `<a target="_blank" rel="noopener noreferrer" href="${esc(u)}">${l}: ${esc(u)}</a>`).join("") : "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438 \u043D\u0435 \u0432\u043A\u0430\u0437\u0430\u043D\u0456."}</div>`;
    $("#modal").showModal();
  }
  ["query", "category", "region", "sort"].forEach((id) => $("#" + id).addEventListener(id === "query" ? "input" : "change", apply));
  $("#reset").onclick = () => {
    $("#query").value = "";
    $("#category").value = "";
    $("#region").value = "";
    $("#sort").value = "random";
    apply();
  };
  $("#load-more").onclick = () => {
    shown += PAGE_SIZE;
    render();
  };
  $("#modal-close").onclick = () => $("#modal").close();
  $("#hero-search").onsubmit = (e) => {
    e.preventDefault();
    $("#query").value = $("#hero-query").value;
    apply();
    $("#catalog").scrollIntoView({ behavior: "smooth" });
  };
  $("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
  inject();
  (async () => {
    try {
      await loadData();
      buildRandomOrder();
      fillFilters();
      apply();
    } catch {
      console.error("\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0438\u0442\u0438 \u0431\u0430\u0437\u0443.");
    }
  })();
})();
