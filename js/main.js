/* =========================================================
   ملف إنجاز سحر — سلوك السرد بالتمرير
   GSAP + ScrollTrigger
========================================================= */

gsap.registerPlugin(ScrollTrigger);

document.documentElement.classList.add("js");

const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------------------------------------------------------
   1. تجهيز أي مسار سيُرسم (dash setup)
--------------------------------------------------------- */
function primePath(el) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = len;
  el.style.strokeDashoffset = len;
  return len;
}


/* ---------------------------------------------------------
   2. المسطرة الجانبية — تقدّم القراءة عبر الأقسام
--------------------------------------------------------- */
(function spine() {
  const spineEl = document.querySelector(".spine");
  const progress = document.getElementById("spineProgress");
  const cursor = document.getElementById("spineCursor");
  const marks = document.getElementById("spineMarks");
  if (!spineEl || !progress) return;

  const sections = gsap.utils.toArray("[data-station]");

  // علامات الأقسام على المسطرة
  if (marks) {
    sections.forEach((sec) => {
      const b = document.createElement("b");
      b.textContent = String(sec.dataset.station).padStart(2, "0");
      b.style.top = ((sec.dataset.station - 1) / (sections.length - 1)) * 100 + "%";
      marks.appendChild(b);
    });
  }

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const pct = (self.progress * 100).toFixed(2) + "%";
      progress.style.setProperty("--p", pct);
      spineEl.style.setProperty("--p", pct);
    }
  });

  // رقم القسم الحالي على المؤشر
  sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive && cursor) {
          cursor.dataset.label = String(sec.dataset.station).padStart(2, "0");
        }
      }
    });
  });
})();


/* ---------------------------------------------------------
   3. رقم اللوحة في الكارتوش يتبع القسم الظاهر
--------------------------------------------------------- */
(function sheetCounter() {
  const out = document.getElementById("tbSheet");
  if (!out) return;

  gsap.utils.toArray("[data-station]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (self.isActive) {
          out.textContent = String(sec.dataset.station).padStart(2, "0");
        }
      }
    });
  });
})();


/* ---------------------------------------------------------
   4. الغلاف — اللوحة تُرسم عند التحميل ثم الإلكترونات تدور
--------------------------------------------------------- */
(function heroIntro() {
  const svg = document.querySelector(".hero-atom");
  if (!svg) return;

  const CENTER = "450 450";
  const consts = gsap.utils.toArray(".hero-atom .draw-const");
  const orbits = gsap.utils.toArray(".hero-atom .draw-orbit");
  const electrons = gsap.utils.toArray(".ha-electron");
  const hidden = [
    ".hero-corner", ".hero-title h1",
    ".hero-note", ".ha-anno", ".ha-nucleus"
  ];

  [...consts, ...orbits].forEach(primePath);

  let electronsRunning = false;
  const startElectrons = () => {
    if (electronsRunning) return;
    electronsRunning = true;
    const spins = electrons.map((el, i) =>
      gsap.fromTo(el,
        { rotation: i * 60, svgOrigin: CENTER },
        { rotation: i * 60 + 360, svgOrigin: CENTER,
          duration: 5 + i * 2, ease: "none", repeat: -1 }
      )
    );
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top",
      onUpdate: (self) => spins.forEach((t) => t.timeScale(1 - self.progress * 0.9))
    });
  };

  const revealAll = () => {
    gsap.set([...consts, ...orbits], { strokeDashoffset: 0 });
    gsap.set(hidden.concat(electrons), { opacity: 1, y: 0, clearProps: "transform" });
    startElectrons();
  };

  // انزياح خفيف مع التمرير
  gsap.to(svg, {
    yPercent: reduceMotion ? 0 : -8, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  if (!reduceMotion) {
    gsap.to(".hero-atom .ha-construction", {
      rotation: 12, svgOrigin: CENTER, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  // بدون حركة أو تبويب مخفي: أظهر كل شيء فورًا (لا حركة بلا إطارات رسم)
  if (reduceMotion || document.hidden) {
    revealAll();
    return;
  }

  gsap.set(hidden.concat(electrons), { opacity: 0 });

  gsap.timeline({ defaults: { ease: "power2.out" } })
    .to(".hero-corner", { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, startAt: { y: -6 } })
    .to(consts, { strokeDashoffset: 0, duration: 0.8, stagger: 0.08 }, "-=0.1")
    .to(orbits, { strokeDashoffset: 0, duration: 0.95, stagger: 0.16 }, "-=0.35")
    .to(".ha-nucleus", { opacity: 1, duration: 0.45 }, "-=0.5")
    .to(electrons, { opacity: 1, duration: 0.3 }, "<")
    .to(".ha-anno", { opacity: 1, duration: 0.4 }, "<")
    .add(startElectrons, "<")
    .to(".hero-title h1", { opacity: 1, y: 0, duration: 0.7, startAt: { y: 16 } }, "-=0.15")
    .to(".hero-note", { opacity: 1, duration: 0.4 }, "-=0.3");
})();


/* ---------------------------------------------------------
   5. القالب المكرر — لكل لوحة (chapter)
      رسم المسارات + ظهور العناصر + العنوان
--------------------------------------------------------- */
gsap.utils.toArray(".chapter").forEach((ch) => {

  const heading = ch.querySelector("h2");
  const lead = ch.querySelector(".lead");
  const items = gsap.utils.toArray(ch.querySelectorAll(".chapter-body li"));
  const reveals = gsap.utils.toArray(ch.querySelectorAll(".reveal"));
  const paths = gsap.utils.toArray(ch.querySelectorAll(".draw-path"));

  paths.forEach(primePath);
  gsap.set(reveals, { opacity: 0, y: 24 });

  // العناصر القابلة للكشف (بطاقات الشبكة): كل عنصر يظهر عند وصوله للعرض،
  // على دفعات متتابعة أثناء التمرير — لا كلها دفعة واحدة مع دخول القسم.
  if (reveals.length && !reduceMotion && !document.hidden) {
    ScrollTrigger.batch(reveals, {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.55, ease: "power2.out",
          stagger: 0.09, overwrite: true
        }),
      onLeaveBack: (batch) =>
        gsap.to(batch, { opacity: 0, y: 24, duration: 0.3, overwrite: true })
    });
  }

  // بدون حركة: أظهر كل شيء فورًا وتوقّف
  if (reduceMotion) {
    gsap.set(paths, { strokeDashoffset: 0 });
    gsap.set(reveals, { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ch,
      start: "top 72%",
      toggleActions: "play none none reverse"
    }
  });

  if (heading) {
    tl.from(heading, {
      y: reduceMotion ? 0 : 26,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  if (lead) {
    tl.from(lead, { y: reduceMotion ? 0 : 18, opacity: 0, duration: 0.5 }, "-=0.35");
  }

  if (paths.length) {
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: reduceMotion ? 0.001 : 1.1,
      ease: "power1.inOut",
      stagger: 0.12
    }, "-=0.2");
  }

  // .reveal يُدار الآن ببطاقات ScrollTrigger.batch أعلاه (كشف فردي أثناء التمرير)
  if (reveals.length && document.hidden) {
    gsap.set(reveals, { opacity: 1, y: 0 });
  }

  if (items.length) {
    tl.from(items, {
      x: reduceMotion ? 0 : 20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.08
    }, "-=0.3");
  }
});


/* ---------------------------------------------------------
   6. أُطر الرؤية / الرسالة / القيم
      تبديل تلقائي + فتح يدوي بالضغط
--------------------------------------------------------- */
(function frames() {
  const groups = gsap.utils.toArray(".frames");
  if (!groups.length) return;

  groups.forEach((group) => {
    const frames = gsap.utils.toArray(group.querySelectorAll(".frame"));
    const AUTO_MS = 4500;
    const RESUME_MS = 12000;

    const setOpen = (frame, open) => {
      frame.classList.toggle("is-open", open);
      frame.querySelector(".frame__bar").setAttribute("aria-expanded", String(open));
    };
    const openOnly = (i) => frames.forEach((f, j) => setOpen(f, j === i));

    let current = Math.max(0, frames.findIndex((f) => f.dataset.open === "true"));
    openOnly(current);

    let timer = null;
    let resumeTimer = null;
    const inView = { v: false };

    const tick = () => {
      current = (current + 1) % frames.length;
      openOnly(current);
    };
    const startAuto = () => {
      if (timer || reduceMotion || !inView.v) return;
      timer = setInterval(tick, AUTO_MS);
    };
    const stopAuto = () => { clearInterval(timer); timer = null; };
    const pauseThenResume = () => {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, RESUME_MS);
    };

    frames.forEach((frame, i) => {
      frame.querySelector(".frame__bar").addEventListener("click", () => {
        const willOpen = !frame.classList.contains("is-open");
        current = i;
        frames.forEach((f, j) => setOpen(f, j === i ? willOpen : false));
        pauseThenResume();
      });
    });

    // التبديل التلقائي يعمل فقط بينما القسم ظاهر
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        inView.v = e.isIntersecting;
        if (e.isIntersecting) startAuto();
        else { stopAuto(); clearTimeout(resumeTimer); }
      });
    }, { threshold: 0.28 }).observe(group);

    // إيقاف مؤقت عند تفاعل المؤشر مع الأُطر
    group.addEventListener("pointerenter", pauseThenResume);
  });
})();


/* ---------------------------------------------------------
   7. القسم 03 — رباعي أوجه يدور + ظهور العناصر تباعًا
--------------------------------------------------------- */
(function s3() {
  const stage = document.querySelector(".s3-stage");
  if (!stage) return;

  /* --- ظهور الفقرات: تتفرّع من مركز المنصّة --- */
  const tetra = stage.querySelector(".s3-tetra");
  const nTR = stage.querySelector(".s3-node--tr");
  const nTL = stage.querySelector(".s3-node--tl");
  const nB = stage.querySelector(".s3-node--b");
  const ordered = [nTR, nTL, nB].filter(Boolean);

  const from = new Map([
    [nTR, { x: -60, y: -10 }],   // يبدأ من جهة المركز
    [nTL, { x: 60, y: -10 }],
    [nB, { x: 0, y: -44 }]
  ]);

  if (reduceMotion) {
    gsap.set([tetra, ...ordered], { opacity: 1, x: 0, y: 0, scale: 1 });
  } else {
    gsap.set(tetra, { opacity: 0, scale: 0.86, transformOrigin: "50% 50%" });
    ordered.forEach((n) => gsap.set(n, { opacity: 0, scale: 0.62, ...from.get(n) }));

    gsap.timeline({
      scrollTrigger: { trigger: stage, start: "top 70%", toggleActions: "play none none reverse" }
    })
      .to(tetra, { opacity: 1, scale: 1, duration: 0.65, ease: "power2.out" })
      .to(ordered, {
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: 0.6, ease: "back.out(1.5)", stagger: 0.18
      }, "-=0.15");
  }

  /* --- رباعي الأوجه (wireframe مُسقَط) --- */
  const svg = document.getElementById("tetra");
  if (!svg) return;
  const SVGNS = "http://www.w3.org/2000/svg";
  const edgesG = svg.querySelector(".tetra-edges");
  const vertsG = svg.querySelector(".tetra-verts");
  const labelsG = svg.querySelector(".tetra-labels");

  const R = 108;
  const V = [
    [0, -R * 1.08, 0],                 // القمة
    [0, R * 0.5, R * 0.95],            // قاعدة أمام
    [-R * 0.82, R * 0.5, -R * 0.48],   // قاعدة خلف-يسار
    [R * 0.82, R * 0.5, -R * 0.48]     // قاعدة خلف-يمين
  ];
  const LABELS = ["المتعلّم", "قِيَم", "مهارات", "معارف"];
  const E = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]];

  const eEls = E.map(() => {
    const l = document.createElementNS(SVGNS, "line");
    l.setAttribute("class", "tetra-edge");
    edgesG.appendChild(l);
    return l;
  });
  const vEls = V.map((_, i) => {
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("r", i === 0 ? "4.6" : "3.4");
    c.setAttribute("class", "tetra-vert");
    vertsG.appendChild(c);
    return c;
  });
  const lEls = LABELS.map((txt, i) => {
    const t = document.createElementNS(SVGNS, "text");
    t.setAttribute("class", i === 0 ? "tetra-label tetra-label--apex" : "tetra-label");
    t.setAttribute("text-anchor", "middle");
    t.textContent = txt;
    labelsG.appendChild(t);
    return t;
  });

  const rotY = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };
  const rotX = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  };
  const proj = (p) => {
    const d = 470;
    const s = d / (d - p[2]);
    return [p[0] * s, p[1] * s, p[2]];
  };

  const render = (t) => {
    const ax = -0.34 + Math.sin(t * 0.6) * 0.05;
    const P = V.map((v) => proj(rotX(rotY(v, t), ax)));
    E.forEach((e, i) => {
      const a = P[e[0]], b = P[e[1]];
      eEls[i].setAttribute("x1", a[0].toFixed(1));
      eEls[i].setAttribute("y1", a[1].toFixed(1));
      eEls[i].setAttribute("x2", b[0].toFixed(1));
      eEls[i].setAttribute("y2", b[1].toFixed(1));
      eEls[i].classList.toggle("is-back", (a[2] + b[2]) / 2 < -4);
    });
    P.forEach((p, i) => {
      vEls[i].setAttribute("cx", p[0].toFixed(1));
      vEls[i].setAttribute("cy", p[1].toFixed(1));
      vEls[i].classList.toggle("is-back", p[2] < -8);

      // التسمية: تُزاح للخارج قليلًا وتخفت كلما ابتعدت للخلف
      const out = 1.18;
      const lx = p[0] * out;
      const ly = p[1] * out + (i === 0 ? -4 : 12);
      lEls[i].setAttribute("x", lx.toFixed(1));
      lEls[i].setAttribute("y", ly.toFixed(1));
      const depth = (p[2] + 120) / 240;                 // 0 خلف .. 1 أمام
      lEls[i].style.opacity = (0.28 + depth * 0.72).toFixed(2);
    });
  };

  if (reduceMotion) {
    render(0.7);
    return;
  }

  let raf = null;
  let base = null;
  const loop = (ts) => {
    if (base === null) base = ts;
    render(((ts - base) / 1000) * 0.5);   // ~نصف دورة في الثانية
    raf = requestAnimationFrame(loop);
  };
  render(0);
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && raf === null) raf = requestAnimationFrame(loop);
      else if (!e.isIntersecting && raf !== null) {
        cancelAnimationFrame(raf); raf = null; base = null;
      }
    });
  }, { threshold: 0.04 }).observe(svg);
})();


/* ---------------------------------------------------------
   8. القسم 04 — محاور الميثاق (تبويب + تبديل تلقائي)
--------------------------------------------------------- */
(function s4() {
  const charter = document.querySelector(".s4-charter");
  if (!charter) return;

  const tabs = gsap.utils.toArray(".s4-tab", charter);
  const panels = gsap.utils.toArray(".s4-panel", charter);
  const AUTO_MS = 6000;
  const RESUME_MS = 14000;
  charter.style.setProperty("--s4dur", AUTO_MS + "ms");

  let current = 0;

  const activate = (i, byUser) => {
    current = i;
    tabs.forEach((t, j) => {
      const on = j === i;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, j) => {
      p.classList.toggle("is-active", j === i);
      p.hidden = j !== i;
    });
    // إعادة تشغيل حلقة التقدّم
    if (playing) restartRing();
    if (byUser) pauseThenResume();
  };

  /* --- إعادة تشغيل رسم الحلقة عند كل انتقال --- */
  const restartRing = () => {
    charter.classList.remove("is-playing");
    void charter.offsetWidth;             // reflow
    charter.classList.add("is-playing");
  };

  /* --- التبديل التلقائي (يعمل فقط حين يكون القسم ظاهرًا) --- */
  let resumeTimer = null;
  let paused = reduceMotion;
  let playing = false;

  const onScreen = () => {
    const r = charter.getBoundingClientRect();
    return r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.2;
  };
  const setPlaying = (on) => {
    if (on === playing) return;
    playing = on;
    charter.classList.toggle("is-playing", on);
    if (on) restartRing();
  };
  const pauseThenResume = () => {
    paused = true;
    setPlaying(false);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { paused = reduceMotion; }, RESUME_MS);
  };

  if (!reduceMotion) {
    setInterval(() => {
      if (paused || document.hidden || !onScreen()) { setPlaying(false); return; }
      if (!playing) setPlaying(true);
      activate((current + 1) % tabs.length);
    }, AUTO_MS);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(i, true));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" &&
          e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const back = e.key === "ArrowUp" || e.key === "ArrowRight";   // RTL
      activate((i + (back ? tabs.length - 1 : 1)) % tabs.length, true);
      tabs[current].focus();
    });
  });
  charter.addEventListener("pointerenter", pauseThenResume);

  activate(0);
})();


/* ---------------------------------------------------------
   9. القسم 06 — نموذج تقييم أداء المعلم (تفاعلي)
--------------------------------------------------------- */
(function evalu() {
  const root = document.getElementById("evalu");
  if (!root) return;

  /* عناصر التقييم وأوزانها (المجموع = 100) */
  const ELEMENTS = [
    { t: "أداء الواجبات الوظيفية", w: 10 },
    { t: "التفاعل مع المجتمع المهني", w: 10 },
    { t: "التفاعل مع أولياء الأمور", w: 10 },
    { t: "التنويع في استراتيجيات التدريس", w: 10 },
    { t: "تحسين نتائج المتعلمين", w: 10 },
    { t: "إعداد وتنفيذ خطة التعلم", w: 10 },
    { t: "توظيف تقنيات ووسائل التعلم المناسبة", w: 10 },
    { t: "تهيئة بيئة تعليمية", w: 10 },
    { t: "الإدارة الصفية", w: 5 },
    { t: "تحليل نتائج المتعلمين وتشخيص مستوياتهم", w: 5 },
    { t: "تنوع أساليب التقويم", w: 10 }
  ];

  const STORE_KEY = "sahar-evalu-v1";
  /* لمزامنة التقييم بين أجهزة المشرفة والمعلمة: ضع هنا رابط
     Google Apps Script Web App (يقبل GET لإرجاع آخر تقييم و POST لحفظه).
     اتركه فارغًا للاعتماد على تخزين المتصفح المحلي فقط. */
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyDerFFxIO-1ArMMWe-2ZD3htdf7aPWuiicg0p0Z_4pcDFU_K0ysNr9rlPz-OQqSRTJ/exec";

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 14.6 8.9 21.5 9.3 16 13.7 17.9 20.5 12 16.7 6.1 20.5 8 13.7 2.5 9.3 9.4 8.9Z"/></svg>';

  const rowsEl = document.getElementById("evaluRows");
  const form = document.getElementById("evaluForm");
  const liveEl = document.getElementById("evaluLive");
  const resultEl = document.getElementById("evaluResult");
  const reviewerEl = document.getElementById("evaluReviewer");
  const resetBtn = document.getElementById("evaluReset");

  const ratings = new Array(ELEMENTS.length).fill(0);

  /* --- بناء صفوف النموذج --- */
  ELEMENTS.forEach((el, i) => {
    const row = document.createElement("div");
    row.className = "evalu-row";
    row.innerHTML =
      '<div class="evalu-row__main">' +
        '<span class="evalu-row__n">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="evalu-row__label">' + el.t + '</span>' +
      '</div>' +
      '<div class="evalu-stars" role="group" aria-label="' + el.t + '"></div>';
    const box = row.querySelector(".evalu-stars");
    for (let s = 1; s <= 5; s++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "evalu-star";
      b.dataset.v = s;
      b.setAttribute("aria-label", s + " من 5 — " + el.t);
      b.innerHTML = STAR;
      b.addEventListener("click", () => setRating(i, s));
      box.appendChild(b);
    }
    rowsEl.appendChild(row);
  });

  const rowEls = () => rowsEl.querySelectorAll(".evalu-row");

  const setRating = (i, v) => {
    ratings[i] = ratings[i] === v ? 0 : v;
    paint();
  };
  const paint = () => {
    rowEls().forEach((row, i) => {
      row.classList.toggle("is-rated", ratings[i] > 0);
      row.querySelectorAll(".evalu-star").forEach((b) => {
        b.classList.toggle("is-on", +b.dataset.v <= ratings[i]);
        b.setAttribute("aria-pressed", String(+b.dataset.v === ratings[i]));
      });
    });
    const { pct, done, total } = score();
    liveEl.textContent = done === total
      ? pct + "%  ·  " + grade(pct)
      : done + " / " + total + " عنصر";
  };

  const score = () => {
    let s = 0, done = 0;
    ELEMENTS.forEach((el, i) => {
      if (ratings[i]) { s += (ratings[i] / 5) * el.w; done++; }
    });
    return { pct: Math.round(s), done, total: ELEMENTS.length };
  };
  const grade = (p) =>
    p >= 90 ? "ممتاز" : p >= 80 ? "جيد جدًا" : p >= 70 ? "جيد" : p >= 60 ? "مقبول" : "يحتاج تحسين";

  /* --- عرض نتيجة المشرفة (تراها المعلمة) --- */
  const renderResult = (data) => {
    if (!data) { resultEl.hidden = true; resultEl.innerHTML = ""; return; }
    const stars5 = Math.round(data.pct / 20);
    const C = 2 * Math.PI * 44;
    resultEl.hidden = false;
    resultEl.innerHTML =
      '<div class="evalu-result__top">' +
        '<span class="evalu-result__label">تقييم المشرفة</span>' +
        '<div class="evalu-gauge">' +
          '<svg viewBox="0 0 100 100"><circle class="evalu-gauge__bg" cx="50" cy="50" r="44"/>' +
          '<circle class="evalu-gauge__fg" cx="50" cy="50" r="44" stroke-dasharray="' +
            (data.pct / 100 * C).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg>' +
          '<b>' + data.pct + '<small>%</small></b>' +
        '</div>' +
        '<div class="evalu-result__meta">' +
          '<span class="evalu-result__grade">' + grade(data.pct) + '</span>' +
          '<span class="evalu-result__stars">' + "★".repeat(stars5) + "☆".repeat(5 - stars5) + '</span>' +
          '<span class="evalu-result__by">' +
            (data.reviewer ? "المشرفة: " + data.reviewer + " — " : "") + data.date + '</span>' +
        '</div>' +
      '</div>' +
      '<details class="evalu-result__break"><summary>تفصيل العناصر</summary><ul>' +
        ELEMENTS.map((el, i) =>
          '<li><span>' + el.t + '</span><b>' + (data.ratings[i] || "—") + " / 5</b></li>").join("") +
      '</ul></details>';
  };

  /* --- تحميل / حفظ --- */
  const load = async () => {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    if (ENDPOINT) {
      try {
        const r = await fetch(ENDPOINT, { method: "GET" });
        const remote = await r.json();
        if (remote && typeof remote.pct === "number") data = remote;
      } catch (e) {}
    }
    if (data && Array.isArray(data.ratings)) {
      data.ratings.forEach((v, i) => (ratings[i] = v || 0));
      if (reviewerEl) reviewerEl.value = data.reviewer || "";
      resetBtn.hidden = false;
      renderResult(data);
    }
    paint();
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { pct, done, total } = score();
    if (done < total) {
      liveEl.classList.add("is-warn");
      liveEl.textContent = "أكملي تقييم كل العناصر (" + done + " / " + total + ")";
      setTimeout(paint, 1600);
      setTimeout(() => liveEl.classList.remove("is-warn"), 1600);
      return;
    }
    const data = {
      pct,
      ratings: ratings.slice(),
      reviewer: reviewerEl ? reviewerEl.value.trim() : "",
      date: new Date().toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" })
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
    if (ENDPOINT) {
      try { await fetch(ENDPOINT, { method: "POST", body: JSON.stringify(data) }); } catch (e) {}
    }
    resetBtn.hidden = false;
    renderResult(data);
    resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  resetBtn.addEventListener("click", () => {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    ratings.fill(0);
    if (reviewerEl) reviewerEl.value = "";
    resultEl.hidden = true;
    resultEl.innerHTML = "";
    resetBtn.hidden = true;
    paint();
  });

  load();
})();


/* ---------------------------------------------------------
   10. إعادة حساب المقاسات بعد تحميل الخطوط
--------------------------------------------------------- */
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
window.addEventListener("load", () => ScrollTrigger.refresh());
