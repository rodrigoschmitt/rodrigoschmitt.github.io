/* Shared site behaviour. Each page sets <body data-page="home|work|vaulto|about|contact">. */

(function () {
  // ---------- Theme ----------
  const root = document.documentElement;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  function resolveTheme(mode) {
    if (mode === "auto") return mql.matches ? "dark" : "light";
    return mode;
  }
  function readMode() {
    try { return localStorage.getItem("themeMode") || "auto"; } catch (e) { return "auto"; }
  }
  function applyMode(mode) {
    try { localStorage.setItem("themeMode", mode); } catch (e) {}
    root.dataset.theme = resolveTheme(mode);
  }
  // Reflect OS-level changes when in auto.
  mql.addEventListener("change", function () {
    if (readMode() === "auto") root.dataset.theme = resolveTheme("auto");
  });

  // ---------- Tweaks panel (theme toggle) ----------
  function initTweaks() {
    const trigger = document.getElementById("tweaks-trigger");
    if (!trigger) return;
    let panel = null;
    function close() {
      if (panel) { panel.remove(); panel = null; }
    }
    function open() {
      if (panel) return;
      panel = document.createElement("div");
      panel.className = "tweaks";
      const mode = readMode();
      panel.innerHTML = `
        <div class="tweaks-head">
          <span>Tweaks</span>
          <button class="tweaks-close" type="button" aria-label="Close">×</button>
        </div>
        <div class="tweaks-body">
          <div class="tweaks-label">Theme</div>
          <div class="tweaks-seg">
            <button type="button" data-mode="auto">Auto</button>
            <button type="button" data-mode="light">Light</button>
            <button type="button" data-mode="dark">Dark</button>
          </div>
          <div class="tweaks-hint">Auto follows your device's appearance setting.</div>
        </div>`;
      document.body.appendChild(panel);
      function paint() {
        const m = readMode();
        panel.querySelectorAll(".tweaks-seg button").forEach(function (b) {
          b.classList.toggle("on", b.dataset.mode === m);
        });
      }
      paint();
      panel.querySelector(".tweaks-close").addEventListener("click", close);
      panel.querySelectorAll(".tweaks-seg button").forEach(function (b) {
        b.addEventListener("click", function () {
          applyMode(b.dataset.mode);
          paint();
        });
      });
    }
    trigger.addEventListener("click", function () {
      panel ? close() : open();
    });
  }

  // ---------- Phone status clock ----------
  function initClocks() {
    const els = document.querySelectorAll("[data-clock]");
    if (!els.length) return;
    function paint() {
      const d = new Date();
      const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      els.forEach(function (e) { e.textContent = t; });
    }
    paint();
    setInterval(paint, 30000);
  }

  // ---------- CountUp ----------
  function initCountUps() {
    const els = document.querySelectorAll("[data-countup]");
    if (!els.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const el = e.target;
        const to = parseInt(el.dataset.countup, 10);
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const dur = 900;
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const n = Math.round(to * (1 - Math.pow(1 - p, 3)));
          el.textContent = n + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ---------- Skill bar reveal ----------
  function initSkillBars() {
    const bars = document.querySelectorAll(".skill-bar-fill[data-level]");
    if (!bars.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.style.width = e.target.dataset.level + "%"; }, 60);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { obs.observe(b); });
  }

  // ---------- Skills tabs ----------
  function initSkillTabs() {
    const tabs = document.querySelectorAll(".skills-tabs .chip");
    if (!tabs.length) return;
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        const group = t.dataset.group;
        tabs.forEach(function (x) { x.classList.toggle("chip-active", x === t); });
        document.querySelectorAll(".skills-list").forEach(function (list) {
          list.classList.toggle("hidden", list.dataset.group !== group);
        });
      });
    });
  }

  // ---------- Timeline reveal ----------
  function initTimeline() {
    const items = document.querySelectorAll(".tl-item");
    if (!items.length) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("shown");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(function (it, i) {
      it.style.transitionDelay = (i * 60) + "ms";
      obs.observe(it);
    });
  }

  // ---------- Career chart ----------
  const EXPERIENCE = [
    { company: "Ryanair", sub: "Europe’s Favourite Airline", role: "iOS Developer", start: "Mar 2022", end: "Present", startY: 2022.2, endY: 2026.4, color: "#0b3d91" },
    { company: "Fuze", role: "iOS Developer", start: "Nov 2018", end: "Feb 2022", startY: 2018.83, endY: 2022.16, color: "#7a3ad4" },
    { company: "XING", role: "iOS Developer", start: "May 2017", end: "Oct 2018", startY: 2017.33, endY: 2018.83, color: "#16a34a" },
    { company: "Apple Developer Academy | PUCRS", role: "iOS Instructor", start: "Dec 2015", end: "Mar 2017", startY: 2015.92, endY: 2017.25, color: "#e11d48" },
    { company: "Grupo RBS", role: "iOS Engineer / Tech Lead", start: "Jan 2011", end: "Jul 2015", startY: 2011, endY: 2015.5, color: "#f59e0b" },
    { company: "MobiMarket", role: "iOS Developer", start: "Aug 2009", end: "Dec 2010", startY: 2009.58, endY: 2010.92, color: "#0891b2" },
    { company: "Conectt", role: "Web Developer", start: "Jul 2007", end: "May 2009", startY: 2007.5, endY: 2009.42, color: "#64748b" },
    { company: "ABSIS Informática", role: "Web Developer", start: "Jan 2004", end: "Jul 2007", startY: 2004, endY: 2007.5, color: "#64748b" },
    { company: "Grupo RBS (early)", role: "Web Developer", start: "Oct 2000", end: "Aug 2003", startY: 2000.75, endY: 2003.66, color: "#64748b" },
  ];

  function svgEl(name, attrs) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function initCareerChart() {
    const wraps = document.querySelectorAll("[data-career-chart]");
    if (!wraps.length) return;

    const startYear = 2000, endYear = 2026.5, years = endYear - startYear;
    const W = 1000, H = 220;
    const xOf = function (y) { return 40 + ((y - startYear) / years) * (W - 60); };

    // Lane assignment
    const placed = [];
    EXPERIENCE.forEach(function (e, i) {
      let lane = 0;
      while (true) {
        const conflict = placed.some(function (p) {
          return p.lane === lane && !(e.endY <= p.startY || e.startY >= p.endY);
        });
        if (!conflict) break;
        lane++;
      }
      placed.push(Object.assign({}, e, { lane: lane, idx: i }));
    });
    const lanesCount = Math.max.apply(null, placed.map(function (p) { return p.lane; })) + 1;
    const laneH = (H - 60) / lanesCount;
    const yOf = function (lane) { return 30 + lane * laneH + laneH * 0.5; };

    wraps.forEach(function (wrap) {
      wrap.classList.add("chart-wrap", "card");
      wrap.innerHTML = "";
      const svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "career-chart" });
      // gridlines
      for (let y = 2000; y <= 2026; y += 2) {
        svg.appendChild(svgEl("line", { x1: xOf(y), y1: 20, x2: xOf(y), y2: H - 20, stroke: "var(--border)", "stroke-dasharray": "2 4", opacity: "0.4" }));
        const tx = svgEl("text", { x: xOf(y), y: H - 4, "text-anchor": "middle", "font-size": "10", fill: "var(--text-muted)" });
        tx.textContent = y;
        svg.appendChild(tx);
      }
      const legend = document.createElement("div");
      legend.className = "chart-legend";
      legend.innerHTML = '<div class="chart-hint">Hover a bar to see the role · 26 years across 9 companies</div>';

      const bars = [];
      placed.forEach(function (p) {
        const x1 = xOf(p.startY), x2Final = xOf(p.endY), y = yOf(p.lane);
        const g = svgEl("g", { style: "cursor:pointer" });
        const rect = svgEl("rect", { x: x1, y: y - 8, width: 2, height: 16, rx: 8, fill: p.color, opacity: "0.85" });
        const startCircle = svgEl("circle", { cx: x1, cy: y, r: 3.5, fill: "white", stroke: p.color, "stroke-width": "2" });
        const endCircle = svgEl("circle", { cx: x1, cy: y, r: 3.5, fill: p.color });
        let label = null;
        g.appendChild(rect); g.appendChild(startCircle); g.appendChild(endCircle);
        function setHover(on) {
          rect.setAttribute("opacity", on ? "1" : "0.85");
          startCircle.setAttribute("r", on ? 5 : 3.5);
          endCircle.setAttribute("r", on ? 5 : 3.5);
          if (on) {
            legend.innerHTML = '<div class="chart-tooltip"><span class="chart-tt-dot" style="background:' + p.color + '"></span><strong>' + p.company + '</strong><span class="chart-tt-meta">' + p.role + ' · ' + p.start + ' – ' + p.end + '</span></div>';
          } else {
            legend.innerHTML = '<div class="chart-hint">Hover a bar to see the role · 26 years across 9 companies</div>';
          }
        }
        g.addEventListener("mouseenter", function () { setHover(true); });
        g.addEventListener("mouseleave", function () { setHover(false); });
        svg.appendChild(g);
        bars.push({ p: p, rect: rect, endCircle: endCircle, label: null, g: g, x1: x1, x2Final: x2Final, y: y });
      });

      // NOW marker
      svg.appendChild(svgEl("line", { x1: xOf(2026.4), y1: 20, x2: xOf(2026.4), y2: H - 20, stroke: "var(--accent)", "stroke-width": "1.5" }));
      const nowLabel = svgEl("text", { x: xOf(2026.4) + 4, y: 28, "font-size": "10", fill: "var(--accent)", "font-weight": "700" });
      nowLabel.textContent = "NOW";
      svg.appendChild(nowLabel);

      wrap.appendChild(svg);
      wrap.appendChild(legend);

      // Animate draw
      const start = performance.now(), dur = 1400;
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        bars.forEach(function (b) {
          const x2 = xOf(Math.min(b.p.endY, startYear + years * p));
          const w = Math.max(2, x2 - b.x1);
          b.rect.setAttribute("width", w);
          b.endCircle.setAttribute("cx", x2);
          if ((x2 - b.x1) > 80 && !b.label) {
            b.label = svgEl("text", { x: b.x1 + 8, y: b.y + 3.5, "font-size": "10", fill: "white", "font-weight": "600" });
            b.label.textContent = b.p.company;
            b.g.appendChild(b.label);
          }
        });
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // ---------- Hero phone plane animation ----------
  function initHeroPhone() {
    const plane = document.querySelector("[data-plane]");
    if (!plane) return;
    const start = performance.now();
    function tick(now) {
      const t = (now - start) / 1000;
      const x = 30 + Math.sin(t * 0.6) * 10;
      plane.setAttribute("transform", "translate(" + x.toFixed(2) + ", 11)");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Dublin clock (Contact page) ----------
  function initDublinClock() {
    const out = document.querySelector("[data-dublin-clock]");
    if (!out) return;
    const glyph = document.querySelector("[data-clock-glyph]");
    const SUN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    function paint() {
      const time = new Date().toLocaleTimeString("en-IE", {
        timeZone: "Europe/Dublin", hour: "2-digit", minute: "2-digit", hour12: false
      });
      out.textContent = time;
      if (glyph) {
        const hourStr = new Date().toLocaleString("en-IE", {
          timeZone: "Europe/Dublin", hour: "2-digit", hour12: false
        });
        const hour = parseInt(hourStr, 10);
        const isDay = hour >= 7 && hour < 19;
        glyph.innerHTML = isDay ? SUN : MOON;
      }
    }
    paint();
    const id = setInterval(paint, 1000);
    window.addEventListener("beforeunload", function () { clearInterval(id); });
  }

  // ---------- Boot ----------
  // The <head> pre-paint script already set data-theme. Just enforce the stored mode (in case tab opened with stale OS state).
  applyMode(readMode());

  document.addEventListener("DOMContentLoaded", function () {
    initTweaks();
    initClocks();
    initCountUps();
    initSkillBars();
    initSkillTabs();
    initTimeline();
    initCareerChart();
    initHeroPhone();
    initDublinClock();
  });
})();
