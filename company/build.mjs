// Рис.: ИИ-компания за работой. Стол с пятью отделами (у каждого лампа — горит, пока отдел работает, и счётчик
// предложений), лента с карточками-предложениями к воротам проверки (две лампы — скептики), верстак инженеров,
// циферблат совета (доля пройденного пути) и две учебные установки — наши видеокарты.
// Живые данные: company.json рядом со страницей (пишет grokking/company_board.py), опрос раз в 30 с.
// Сборка: node build.mjs [--light] → ../company.html (или company-light.html)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = "C:/Users/user/.claude/skills/anatomy";
const k = await import("file:///" + KIT + "/kit/iso-kit.mjs");
const { kitScript } = await import("file:///" + KIT + "/scripts/inline-kit.mjs");

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640, HEIGHT = 420;

const PLATE = { x: -160, y: -82, w: 336, d: 164, r: 8 };
const PLATE_H = 10, FOOT_H = 5;
const DESKS = [-62, -36, -10, 16, 42].map((y) => ({ x: -142, y, w: 22, d: 20, r: 2 }));
const DESK_H = 14;
const RAIL = { x: -112, y: -3, w: 118, d: 6, r: 1 };
const RAIL_H = 3;
const CARD = { w: 9, d: 11, h: 1.6 };
const CARDS = 6;
const GATE = [18, -18, 18];
const GATE_H = 40;
const BENCH = { x: 38, y: -70, w: 46, d: 30, r: 2 };
const BENCH_H = 16;
const DIAL = [62, 66];
const DIAL_R = 16, DIAL_Z = 30, DIAL_H = 7, DIAL_TOP = DIAL_Z + DIAL_H;
const RIGS = [{ x: 108, y: -66, w: 54, d: 36, r: 3 }, { x: 108, y: 8, w: 54, d: 36, r: 3 }];
const RIG_H = 18;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [GATE[0], 0, GATE_H + 10], [DIAL[0], DIAL[1], DIAL_TOP + 4]],
  WIDTH, HEIGHT, { pad: 28, azimuth: 44 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of [...k.corners(PLATE, 22)].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: PLATE.x + 30, y: PLATE.y + PLATE.d - 13, w: PLATE.w - 60, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // табличка «Фиг. компании» в углу
  const tag = { x: PLATE.x + 10, y: PLATE.y + 8, w: 34, d: 14, r: 1.5 };
  out.push(S(k.slabOf(tag, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(tag, 2.4).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  for (const yy of [tag.y + 4.5, tag.y + 7, tag.y + 9.5]) out.push(L(k.lineOnTop([tag.x + 5, yy], [tag.x + tag.w - 5, yy], 0.8, P), { tone: "faint", free: "both" }));
  return out.join("");
}

function desk(plan, i) {
  const out = [];
  const [cx, cy] = [plan.x + plan.w / 2, plan.y + plan.d / 2];
  out.push(S(k.slabOf(plan, 0, DESK_H, P, 2, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2.5), DESK_H, P, 1.5), { tone: "faint" }));
  out.push(D(k.corners(plan, 2.2).map(([x, y]) => at([x, y, DESK_H])), { size: 0.4 }));
  // счётчик предложений: окошко и цифра
  const win = { x: plan.x + plan.w - 9, y: plan.y + 3, w: 6, d: 9, r: 0.8 };
  out.push(S(k.slabOf(win, DESK_H, 0.5, P, 2), { tone: "lo", crease: "none" }));
  out.push(`<g data-part="count-${i}">${k.faceTextSvg(k.topMatrix([win.x + 3.4, win.y + 4.5], DESK_H + 0.6, P, "y"), "0", { size: 4.2, tone: "hi", anchor: "middle" })}</g>`);
  // лампа отдела
  out.push(S(k.cylinder(cx - 3, cy, 4.2, DESK_H, 1.4, P, 24), { tone: "mid" }));
  out.push(`<g data-part="lamp-${i}">${S(k.cylinder(cx - 3, cy, 3, DESK_H + 1.4, 4.2, P, 24, 0.5), { tone: "hi" })}</g>`);
  return { depth: depth(cx, cy), svg: out.join("") };
}

function rail() {
  const out = [S(k.slabOf(RAIL, 0, RAIL_H, P, 1, 0.4), { tone: "mid" })];
  for (const x of [RAIL.x - 4, RAIL.x + RAIL.w]) {
    out.push(S(k.slabOf({ x, y: RAIL.y - 4, w: 4, d: RAIL.d + 8, r: 1 }, 0, 6, P, 2, 0.4), { tone: "mid" }));
    out.push(D([at([x + 2, RAIL.y - 1.5, 6]), at([x + 2, RAIL.y + RAIL.d + 1.5, 6])], { size: 0.42 }));
  }
  const ticks = k.topTicks(RAIL.x + 3, RAIL.x + RAIL.w - 3, 6, 5, RAIL.y + 0.6, RAIL_H, [1.2, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  return { depth: depth(RAIL.x + RAIL.w / 2, 0) - 50, svg: out.join("") };
}

function cards() {
  const out = [];
  for (let i = 0; i < CARDS; i++) {
    const plan = { x: -CARD.w / 2, y: -CARD.d / 2, w: CARD.w, d: CARD.d, r: 0.8 };
    out.push(`<g data-part="card-${i}" transform="${k.translateAlong(P, [RAIL.x + 8 + i * 18, 0, RAIL_H])}" style="opacity:0">${S(k.slabOf(plan, 0, CARD.h, P, 1, 0.3), { tone: "hi" })}${L(k.lineOnTop([plan.x + 2, -2], [plan.x + plan.w - 2, -2], CARD.h, P), { tone: "lo", free: "both" })}${L(k.lineOnTop([plan.x + 2, 1], [plan.x + plan.w - 4, 1], CARD.h, P), { tone: "lo", free: "both" })}</g>`);
  }
  return { depth: depth(-40, 0) - 40, svg: out.join("") };
}

function gate() {
  const [x, y0, y1] = GATE;
  const out = [];
  for (const y of [y0, y1]) {
    out.push(S(k.cylinder(x, y, 4.4, 0, 2, P, 24), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 2.4, 2, GATE_H - 2, P, 20), { tone: "mid", crease: "none" }));
    out.push(L([12, 24].map((z) => k.sideArc(x, y, 2.4, z, P, 12)).join(""), { tone: "faint" }));
  }
  const bar = { x: x - 4, y: y0 - 4, w: 8, d: y1 - y0 + 8, r: 1.5 };
  out.push(S(k.slabOf(bar, GATE_H, 4, P, 2, 0.5), { tone: "mid" }));
  out.push(D([at([x, y0, GATE_H + 4]), at([x, y1, GATE_H + 4])], { size: 0.45 }));
  // решётка сита под перекладиной
  const comb = [];
  for (let y = y0 + 4; y <= y1 - 4; y += 4) comb.push(k.lineOnTop([x - 2, y], [x + 2, y], GATE_H, P));
  out.push(L(comb.join(""), { tone: "lo" }));
  ["a", "b"].forEach((s, i) => {
    const y = i ? 7 : -7;
    out.push(S(k.cylinder(x, y, 3.2, GATE_H + 4, 1.2, P, 20), { tone: "mid" }));
    out.push(`<g data-part="skeptic-${s}">${S(k.cylinder(x, y, 2.3, GATE_H + 5.2, 3.6, P, 20, 0.4), { tone: "hi" })}</g>`);
  });
  return { depth: depth(x, 0), svg: out.join("") };
}

function bench() {
  const out = [];
  out.push(S(k.slabOf(BENCH, 0, BENCH_H, P, 2, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BENCH, 3), BENCH_H, P, 1.5), { tone: "faint" }));
  out.push(D(k.corners(BENCH, 2.5).map(([x, y]) => at([x, y, BENCH_H])), { size: 0.42 }));
  const g = [BENCH.x + 14, BENCH.y + 15];
  out.push(S(k.cylinder(g[0], g[1], 9, BENCH_H, 4, P, 40, 0.5), { tone: "mid" }));
  out.push(L(k.knurl(g[0], g[1], 9, BENCH_H, BENCH_H + 4, 30, P, 0.3), { tone: "lo" }));
  out.push(S(k.cylinder(g[0], g[1], 2.2, BENCH_H + 4, 6, P, 16), { tone: "mid" }));
  const g2 = [BENCH.x + 31, BENCH.y + 11];
  out.push(S(k.cylinder(g2[0], g2[1], 5.5, BENCH_H, 3, P, 32, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(g2[0], g2[1], 5.5, BENCH_H, BENCH_H + 3, 20, P, 0.3), { tone: "lo" }));
  out.push(S(k.cylinder(BENCH.x + 38, BENCH.y + 24, 3, BENCH_H, 1.2, P, 20), { tone: "mid" }));
  out.push(`<g data-part="lamp-eng">${S(k.cylinder(BENCH.x + 38, BENCH.y + 24, 2.2, BENCH_H + 1.2, 3.8, P, 20, 0.4), { tone: "hi" })}</g>`);
  return { depth: depth(BENCH.x + BENCH.w / 2, BENCH.y + BENCH.d / 2), svg: out.join("") };
}

const needleAt = (share) => {
  const a = share * Math.PI * 2;
  const [x, y] = [62, 66];
  return k.lineOnTop([x - Math.sin(a) * 2.6, y + Math.cos(a) * 2.6], [x + Math.sin(a) * 12.5, y - Math.cos(a) * 12.5], 37.2, P);
};

function dial() {
  const [x, y] = DIAL;
  const out = [];
  out.push(S(k.cylinder(x, y, 7, 0, 2, P, 28), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 2.8, 2, DIAL_Z - 2, P, 20), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(x, y, 2.8, 14, P, 12), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 2.6, DIAL_TOP, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 2, DIAL_TOP, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, DIAL_R - 2.6, 40, 5, DIAL_TOP, [1.1, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.4, DIAL_TOP, P, 16), { tone: "mid" }));
  out.push(`<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleAt(0)}" style="stroke-width:1.1"/>`);
  out.push(S(k.cylinder(x + DIAL_R + 4, y, 2.6, 0, 1, P, 16), { tone: "mid" }));
  out.push(`<g data-part="lamp-board">${S(k.cylinder(x + DIAL_R + 4, y, 1.8, 1, 3.4, P, 16, 0.3), { tone: "hi" })}</g>`);
  return { depth: depth(x, y, 10), svg: out.join("") };
}

function rig(plan, i) {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(plan, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.slabOf(plan, 0, RIG_H, P, 3, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 3), RIG_H, P, 2), { tone: "faint" }));
  out.push(D(k.corners(plan, 2.6).map(([x, y]) => at([x, y, RIG_H])), { size: 0.45 }));
  for (const fx of [plan.x + 14, plan.x + 34]) {
    const fy = plan.y + plan.d / 2;
    out.push(S(k.cylinder(fx, fy, 9, RIG_H, 0.8, P, 40), { tone: "lo", crease: "none" }));
    out.push(L(k.ring(fx, fy, 7.6, RIG_H + 0.8, P, 40), { tone: "lo" }));
    out.push(`<g data-part="fan-${i}">${L(Array.from({ length: 7 }, (_, b) => { const a = (b / 7) * Math.PI * 2; return k.lineOnTop([fx + Math.cos(a) * 2.4, fy + Math.sin(a) * 2.4], [fx + Math.cos(a + 0.5) * 7.2, fy + Math.sin(a + 0.5) * 7.2], RIG_H + 0.9, P); }).join(""), { tone: "mid" })}</g>`);
    out.push(S(k.cylinder(fx, fy, 2.2, RIG_H + 0.8, 1, P, 16), { tone: "mid" }));
  }
  // полоса загрузки на торце
  const bar = { x: plan.x + plan.w - 8, y: plan.y + 4, w: 4, d: plan.d - 8, r: 1 };
  out.push(S(k.slabOf(bar, RIG_H, 0.6, P, 2), { tone: "lo", crease: "none" }));
  out.push(`<g data-part="load-${i}">${S(k.slabOf({ x: bar.x + 0.6, y: bar.y + 0.6, w: bar.w - 1.2, d: 0.1, r: 0.3 }, RIG_H + 0.6, 0.4, P, 1), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.cylinder(plan.x + plan.w - 15, plan.y + 6, 2.6, RIG_H, 1, P, 16), { tone: "mid" }));
  out.push(`<g data-part="lamp-gpu-${i}">${S(k.cylinder(plan.x + plan.w - 15, plan.y + 6, 1.8, RIG_H + 1, 3, P, 16, 0.3), { tone: "hi" })}</g>`);
  return { depth: depth(plan.x + plan.w / 2, plan.y + plan.d / 2), svg: out.join("") };
}

const parts = [rail(), cards(), ...DESKS.map(desk), gate(), bench(), dial(), ...RIGS.map(rig)].sort((a, b) => a.depth - b.depth);
const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "ИИ-компания за работой: пять отделов с лампами и счётчиками предложений, лента карточек к воротам проверки с двумя скептиками, верстак инженеров, циферблат совета и две учебные установки.",
  body: [plate(), ...parts.map((p) => p.svg)],
});

const live = `
const P = ${JSON.stringify(P)};
const RAIL_X = ${RAIL.x}, RAIL_W = ${RAIL.w}, RAIL_H = ${RAIL_H}, CARDS = ${CARDS};
const svg = document.querySelector(".iso-stage svg");
const q = (n) => svg.querySelector('[data-part="' + n + '"]');
const readout = document.querySelector("[data-readout]");
const needleAt = ${needleAt.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
const lit = (n, on) => { const g = q(n); if (!g) return; on ? g.setAttribute("data-on", "") : g.removeAttribute("data-on"); };
const setText = (n, t) => { const g = q(n); if (g) { const el = g.querySelector("text"); if (el && el.textContent !== t) el.textContent = t; } };
let data = null, share = 0, shown = 0, clock = 0, last = 0, frame = 0, spin = [0, 0];
const still = matchMedia("(prefers-reduced-motion: reduce)");
async function poll() {
  try { data = await (await fetch("company.json?ts=" + Date.now())).json(); apply(); } catch (e) {}
}
function apply() {
  if (!data) return;
  data.depts.forEach((d, i) => { lit("lamp-" + i, d.active); setText("count-" + i, String(d.proposals ?? 0)); });
  lit("skeptic-a", data.verify.active > 0); lit("skeptic-b", data.verify.active > 1);
  lit("lamp-eng", data.eng.active > 0); lit("lamp-board", data.board.active);
  (data.gpus || []).forEach((g, i) => lit("lamp-gpu-" + i, g.running));
  share = data.progress || 0;
  readout.textContent = data.short || "";
  const st = document.querySelector("[data-status]");
  if (st) st.innerHTML = data.depts.map((d) => "<li><b>" + (d.active ? "работает" : d.done ? "сдал " + d.proposals + " предл." : "ждёт") + "</b> — " + d.name + "</li>").join("")
    + "<li><b>" + data.verify.done + "/" + data.verify.total + "</b> — служба проверки (скептики)</li><li><b>" + data.eng.done + "/" + data.eng.total + "</b> — инженеры</li><li><b>" + (data.board.done ? "итог готов" : data.board.active ? "работает" : "ждёт") + "</b> — совет директоров</li>"
    + (data.gpus || []).filter((g) => g.name).map((g) => "<li><b>" + g.name + "</b> — видеокарта: " + (g.bits ? g.bits.toFixed(3).replace(".", ",") + " / " + (g.bits2 || 0).toFixed(3).replace(".", ",") + " бита, " + g.minutes + " мин" : "идёт") + "</li>").join("")
    + "<li class='upd'>обновлено " + (data.updated || "") + "</li>";
  run();
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  clock += dt;
  shown += (share - shown) * (1 - Math.exp(-dt / 0.6));
  q("needle").setAttribute("d", needleAt(shown));
  const flow = data ? Math.min(CARDS, data.cards || 0) : 0;
  for (let i = 0; i < CARDS; i++) {
    const c = q("card-" + i);
    const x = RAIL_X + 6 + ((i * 19 + clock * 9) % (RAIL_W - 12));
    c.setAttribute("transform", translateAlong(P, [x, 0, RAIL_H]));
    c.style.opacity = i < flow ? "1" : "0";
  }
  (data?.gpus || []).forEach((g, i) => { if (g.running) spin[i] += dt * 6; const f = q("fan-" + i); if (f) f.style.opacity = String(0.55 + 0.45 * Math.abs(Math.sin(spin[i]))); });
  frame = still.matches ? 0 : requestAnimationFrame(tick);
}
const run = () => { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } };
poll(); setInterval(poll, 30000); run();
`;

const body = k.plateHtml({
  fig: "Рис. К",
  title: "ИИ-компания: обойти DeepSeek",
  hint: "Обновляется раз в 30 секунд",
  readout: "загрузка…",
  keys: [
    { mark: "lit", label: "Горит — отдел, скептик, инженеры, совет или видеокарта сейчас работают" },
    { mark: "raised", label: "Пять столов слева направо: исследования (биты), исследования (задачи), знания, оценка, инфраструктура; цифра — число предложений" },
    { mark: "raised", label: "Карточки на ленте — предложения, идущие к воротам проверки; стрелка совета — доля пройденного пути" },
  ],
  caption: "Отделы предлагают пути обойти DeepSeek, два скептика пытаются опровергнуть каждое предложение, выжившие идут на верстак инженеров, совет сводит итог. Справа — две видеокарты, на которых сейчас учится наша сеть.",
  body: `<style>[data-on] .iso-fill,[data-on] .iso-top,[data-on] .iso-shade{fill:#7dffa8!important;stroke:#7dffa8}[data-on] .iso-edge{stroke:#eafff0!important}[data-on]{filter:drop-shadow(0 0 4px #5dff96)}.co-status{list-style:none;margin:10px 0 0;padding:0;font:12px/1.6 ui-monospace,monospace;color:var(--anatomy-mid,#888)}.co-status b{color:var(--anatomy-hi,#ddd);font-weight:600}.co-status .upd{opacity:.6}</style><div class="iso-stage" tabindex="0" role="img" aria-label="ИИ-компания за работой">${svg}</div><ul class="co-status" data-status></ul>`,
});
const out = join(HERE, "..", theme === "light" ? "company-light.html" : "company.html");
writeFileSync(out, k.pageHtml({ title: "ИИ-компания", theme, body, script: kitScript() + live }));
console.log("wrote", out);
