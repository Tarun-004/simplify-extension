/* ── Simplify · content.js ── */

// Inject stylesheet once
(function injectStyles() {
  if (document.getElementById("sx-styles")) return;
  const link = document.createElement("link");
  link.id   = "sx-styles";
  link.rel  = "stylesheet";
  link.href = chrome.runtime.getURL("styles.css");
  document.head.appendChild(link);
})();

/* ── State ── */
let btn       = null;
let card      = null;
let savedRect = null;

// History: array of { text, isError }
const history = [];
let historyIndex = -1;

// Dark mode: auto-detect system preference, persisted in sessionStorage
let isDark = sessionStorage.getItem("sx-dark") !== null
  ? sessionStorage.getItem("sx-dark") === "true"
  : window.matchMedia("(prefers-color-scheme: dark)").matches;

/* ── SVG icons ── */
const ICONS = {
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  prev: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  next: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
};

/* ── Clean up ── */
function cleanup() {
  btn?.remove();  btn  = null;
  card?.remove(); card = null;
}

/* ── Apply dark/light theme to card ── */
function applyTheme(cardEl) {
  cardEl.setAttribute("data-sx-dark", isDark ? "true" : "false");
}

/* ── Render card from history at historyIndex ── */
function renderCard() {
  if (historyIndex < 0 || historyIndex >= history.length) return;
  const entry = history[historyIndex];

  card?.remove();
  card = document.createElement("div");
  card.className = "sx-card";
  applyTheme(card);

  /* ── Header ── */
  const head = document.createElement("div");
  head.className = "sx-card-head";

  // Left: label
  const lbl = document.createElement("span");
  lbl.className = "sx-card-label";
  lbl.textContent = "✦ Simplified";

  // Center: history nav  ‹ 2/3 ›
  const nav = document.createElement("div");
  nav.className = "sx-nav";

  const prevBtn = document.createElement("button");
  prevBtn.className = "sx-nav-btn";
  prevBtn.innerHTML = ICONS.prev;
  prevBtn.disabled = historyIndex === 0;
  prevBtn.title = "Previous";
  prevBtn.addEventListener("click", () => {
    if (historyIndex > 0) { historyIndex--; renderCard(); }
  });

  const counter = document.createElement("span");
  counter.className = "sx-nav-count";
  counter.textContent = `${historyIndex + 1}/${history.length}`;

  const nextBtn = document.createElement("button");
  nextBtn.className = "sx-nav-btn";
  nextBtn.innerHTML = ICONS.next;
  nextBtn.disabled = historyIndex === history.length - 1;
  nextBtn.title = "Next";
  nextBtn.addEventListener("click", () => {
    if (historyIndex < history.length - 1) { historyIndex++; renderCard(); }
  });

  nav.append(prevBtn, counter, nextBtn);

  // Right: dark toggle + copy + close
  const actions = document.createElement("div");
  actions.className = "sx-actions";

  // Dark mode toggle
  const themeBtn = document.createElement("button");
  themeBtn.className = "sx-icon-btn";
  themeBtn.innerHTML = isDark ? ICONS.sun : ICONS.moon;
  themeBtn.title = isDark ? "Light mode" : "Dark mode";
  themeBtn.addEventListener("click", () => {
    isDark = !isDark;
    sessionStorage.setItem("sx-dark", isDark);
    themeBtn.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    themeBtn.title = isDark ? "Light mode" : "Dark mode";
    applyTheme(card);
  });

  // Copy
  const copyBtn = document.createElement("button");
  copyBtn.className = "sx-icon-btn";
  copyBtn.innerHTML = ICONS.copy;
  copyBtn.title = "Copy";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(entry.text).then(() => {
      copyBtn.innerHTML = ICONS.check;
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.innerHTML = ICONS.copy;
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  });

  // Close
  const closeBtn = document.createElement("button");
  closeBtn.className = "sx-icon-btn sx-close";
  closeBtn.innerHTML = "&#x2715;";
  closeBtn.title = "Close";
  closeBtn.addEventListener("click", cleanup);

  actions.append(themeBtn, copyBtn, closeBtn);
  head.append(lbl, nav, actions);

  /* ── Body ── */
  const body = document.createElement("div");
  body.className = "sx-card-body" + (entry.isError ? " error" : "");
  body.textContent = entry.text;

  card.append(head, body);
  positionBelow(card, savedRect, 10);
  makeDraggable(card, head);
  document.body.appendChild(card);
}

/* ── Push to history and show ── */
function showCard(text, isError = false) {
  // If we navigated back and get a new result, trim forward history
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1);
  }
  history.push({ text, isError });
  if (history.length > 5) history.shift(); // keep max 5
  historyIndex = history.length - 1;
  renderCard();
}

/* ── Skeleton loader ── */
function showSkeleton() {
  card?.remove();
  card = document.createElement("div");
  card.className = "sx-card";
  applyTheme(card);

  const head = document.createElement("div");
  head.className = "sx-card-head";
  const lbl = document.createElement("span");
  lbl.className = "sx-card-label";
  lbl.textContent = "✦ Simplifying…";
  head.appendChild(lbl);

  const skel = document.createElement("div");
  skel.className = "sx-skeleton";
  for (let i = 0; i < 3; i++) {
    const line = document.createElement("div");
    line.className = "sx-skel-line";
    skel.appendChild(line);
  }

  card.append(head, skel);
  positionBelow(card, savedRect, 10);
  document.body.appendChild(card);
}

/* ── Position helper ── */
function positionBelow(el, rect, extraY = 0) {
  if (!rect) return;
  el.style.position = "absolute";
  el.style.top  = `${window.scrollY + rect.bottom + extraY}px`;
  el.style.left = `${window.scrollX + rect.left}px`;
}

/* ── Drag logic ── */
function makeDraggable(cardEl, handleEl) {
  let dragging = false;
  let startX, startY, origLeft, origTop;

  handleEl.addEventListener("mousedown", (e) => {
    // Ignore clicks on buttons inside the header
    if (e.target.closest("button")) return;

    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = parseInt(cardEl.style.left, 10) || 0;
    origTop  = parseInt(cardEl.style.top,  10) || 0;

    cardEl.classList.add("sx-dragging");
    e.preventDefault(); // prevent text selection while dragging
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    cardEl.style.left = `${origLeft + dx}px`;
    cardEl.style.top  = `${origTop  + dy}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    cardEl.classList.remove("sx-dragging");
  });
}

/* ── Selection listener ── */
document.addEventListener("mouseup", (e) => {
  if (btn?.contains(e.target) || card?.contains(e.target)) return;

  const selected = window.getSelection()?.toString().trim();
  cleanup();
  if (!selected) return;

  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  savedRect = range.getBoundingClientRect();

  btn = document.createElement("button");
  btn.className = "sx-btn";
  btn.innerHTML = "✨ Simplify";
  positionBelow(btn, savedRect, 10);
  document.body.appendChild(btn);

  btn.addEventListener("click", async () => {
    btn.remove(); btn = null;
    showSkeleton();

    try {
      const res = await fetch("https://simplify-backend-k55o.onrender.com/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selected })
      });
      const data = await res.json();
      if (data.error) {
        showCard("⚠ " + data.error, true);
      } else {
        showCard(data.explanation);
      }
    } catch (err) {
      showCard("⚠ Could not reach backend. Is it running?", true);
    }
  });
});

/* ── Close on outside click ── */
let wasDragging = false;

document.addEventListener("mousedown", (e) => {
  if (card?.classList.contains("sx-dragging")) { wasDragging = true; return; }
  if (card && !card.contains(e.target) && e.target !== btn) {
    card.remove(); card = null;
  }
});

document.addEventListener("mouseup", () => {
  wasDragging = false;
});
