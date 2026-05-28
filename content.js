/* ── Simplify · content.js ── */

// Inject the shared stylesheet once
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
  let savedRect = null; // persists rect so click handler can use it safely
  
  /* ── Clean up both elements ── */
  function cleanup() {
    btn?.remove();  btn  = null;
    card?.remove(); card = null;
  }
  
  /* ── Show result card ── */
  function showCard(content, isError = false) {
    card?.remove();
  
    card = document.createElement("div");
    card.className = "sx-card";
  
    // Header
    const head = document.createElement("div");
    head.className = "sx-card-head";
  
    const lbl = document.createElement("span");
    lbl.className = "sx-card-label";
    lbl.textContent = "✦ Simplified";
  
    const close = document.createElement("button");
    close.className = "sx-close";
    close.innerHTML = "&#x2715;";
    close.title = "Close";
    close.addEventListener("click", cleanup);
  
    head.append(lbl, close);
  
    // Body
    const body = document.createElement("div");
    body.className = "sx-card-body" + (isError ? " error" : "");
    body.textContent = content;
  
    card.append(head, body);
    positionBelow(card, savedRect, 10);
    document.body.appendChild(card);
  }
  
  /* ── Show skeleton loader ── */
  function showSkeleton() {
    card?.remove();
  
    card = document.createElement("div");
    card.className = "sx-card";
  
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
  
  /* ── Selection listener ── */
  document.addEventListener("mouseup", (e) => {
    // Don't interfere if clicking our own button or card
    if (btn?.contains(e.target) || card?.contains(e.target)) return;
  
    const selected = window.getSelection()?.toString().trim();
  
    cleanup();
  
    if (!selected) return;
  
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
  
    const range = sel.getRangeAt(0);
    savedRect = range.getBoundingClientRect(); // save for later use
  
    // Build button
    btn = document.createElement("button");
    btn.className = "sx-btn";
    btn.innerHTML = "✨ Simplify";
  
    positionBelow(btn, savedRect, 10);
    document.body.appendChild(btn);
  
    btn.addEventListener("click", async () => {
      // Remove button, show skeleton immediately
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
  
  /* ── Close card on outside click ── */
  document.addEventListener("mousedown", (e) => {
    if (card && !card.contains(e.target) && e.target !== btn) {
      card.remove(); card = null;
    }
  });