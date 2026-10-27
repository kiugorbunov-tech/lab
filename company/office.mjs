// Рис.: офис ИИ-компании. Комнаты: отделы, зал изобретателей, переговорная проверки, мастерская инженеров,
// комната совета и серверная с двумя стойками (наши видеокарты). Каждый агент — человечек на своём месте:
// работает — светится зелёным, закончил — серый. Живые данные: company.json (пишет grokking/company_board.py).
// Сборка: node office.mjs [--light] → ../company.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = "C:/Users/user/.claude/skills/anatomy";
const k = await import("file:///" + KIT + "/kit/iso-kit.mjs");
const { kitScript } = await import("file:///" + KIT + "/scripts/inline-kit.mjs");
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 760, HEIGHT = 520;

const FLOOR = { x: -180, y: -110, w: 380, d: 220, r: 6 };
const WALL_H = 9, WALL_T = 2;
// комнаты: план и куда сажать людей
const ROOMS = {
  dept: { x: -176, y: -106, w: 104, d: 104, title: "Отделы" },
  skeptic: { x: -68, y: -106, w: 104, d: 104, title: "Проверка" },
  engineer: { x: 40, y: -106, w: 72, d: 104, title: "Мастерская" },
  inventor: { x: -176, y: 2, w: 212, d: 104, title: "Изобретатели" },
  board: { x: 40, y: 2, w: 72, d: 104, title: "Совет" },
  server: { x: 116, y: -106, w: 80, d: 212, title: "Серверная" },
};
const P = k.fitProjection([...k.boxCorners(FLOOR, -8, WALL_H + 30)], WIDTH, HEIGHT, { pad: 20, azimuth: 45 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const items = [];
const put = (x, y, svg, dz = 0) => items.push({ d: depth(x, y, dz), svg });

// пол, плинтус
function floor() {
  const out = [`<path class="iso-halo" d="${k.haloOf(FLOOR, -8, 8, P)}"/>`];
  out.push(S(k.slabOf(FLOOR, -8, 8, P, 6, 1.4), { tone: "mid" }));
  // плитка пола
  const g = [];
  for (let x = FLOOR.x + 20; x < FLOOR.x + FLOOR.w; x += 20) g.push(k.lineOnTop([x, FLOOR.y + 2], [x, FLOOR.y + FLOOR.d - 2], 0, P));
  for (let y = FLOOR.y + 20; y < FLOOR.y + FLOOR.d; y += 20) g.push(k.lineOnTop([FLOOR.x + 2, y], [FLOOR.x + FLOOR.w - 2, y], 0, P));
  out.push(L(g.join(""), { tone: "faint" }));
  return out.join("");
}

// стены: задние (дальние) стороны комнат — сплошные, передние — низкие перегородки с проёмом
function walls() {
  for (const r of Object.values(ROOMS)) {
    // задняя стена по y (дальняя от зрителя при азимуте 45 — меньшие x и y)
    put(r.x + r.w / 2, r.y, S(k.slabOf({ x: r.x, y: r.y, w: r.w, d: WALL_T, r: 0.4 }, 0, WALL_H, P, 1, 0.3), { tone: "lo" }), -5);
    put(r.x, r.y + r.d / 2, S(k.slabOf({ x: r.x, y: r.y, w: WALL_T, d: r.d, r: 0.4 }, 0, WALL_H, P, 1, 0.3), { tone: "lo" }), -5);
    // передние перегородки низкие, с дверным проёмом посередине
    const fy = r.y + r.d - WALL_T;
    const door = 16;
    const half = (r.w - door) / 2;
    put(r.x + half / 2, fy, S(k.slabOf({ x: r.x, y: fy, w: half, d: WALL_T, r: 0.4 }, 0, 3.5, P, 1, 0.3), { tone: "lo" }), -2);
    put(r.x + r.w - half / 2, fy, S(k.slabOf({ x: r.x + r.w - half, y: fy, w: half, d: WALL_T, r: 0.4 }, 0, 3.5, P, 1, 0.3), { tone: "lo" }), -2);
    // табличка над входом — три строки «надписи»
    const tag = { x: r.x + 6, y: r.y + 4, w: 22, d: 8, r: 1 };
    put(tag.x, tag.y, S(k.slabOf(tag, 0, 0.6, P, 2), { tone: "lo", crease: "none" }) + L(k.lineOnTop([tag.x + 3, tag.y + 4], [tag.x + tag.w - 3, tag.y + 4], 0.6, P), { tone: "mid", free: "both" }), -3);
  }
}

// стол с монитором и стулом
function desk(x, y, w = 16, d = 8, tone = "mid") {
  const out = [];
  out.push(S(k.slabOf({ x, y, w, d, r: 1 }, 6, 1.2, P, 1, 0.3), { tone }));
  for (const [lx, ly] of [[x + 1.5, y + 1.5], [x + w - 1.5, y + 1.5], [x + 1.5, y + d - 1.5], [x + w - 1.5, y + d - 1.5]]) out.push(S(k.cylinder(lx, ly, 0.6, 0, 6, P, 8), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: x + w / 2 - 4, y: y + 1.2, w: 8, d: 0.8, r: 0.2 }, 7.2, 5, P, 1), { tone: "hi" }));
  out.push(S(k.slabOf({ x: x + w / 2 - 0.6, y: y + 1.6, w: 1.2, d: 1.2, r: 0.2 }, 7.2, 0.8, P, 1), { tone: "lo", crease: "none" }));
  return out.join("");
}

// мебель по комнатам и места для людей
const SEATS = {};
function furnish() {
  // отделы: 5 столов
  const r = ROOMS.dept;
  SEATS.dept = [];
  for (let i = 0; i < 5; i++) {
    const x = r.x + 10 + (i % 2) * 46, y = r.y + 14 + Math.floor(i / 2) * 30;
    put(x + 8, y + 4, desk(x, y, 26, 10));
    SEATS.dept.push([x + 13, y + 14]);
  }
  // проверка: длинный стол и стулья по бокам
  const s = ROOMS.skeptic;
  const T = { x: s.x + 18, y: s.y + 40, w: 68, d: 22, r: 3 };
  put(T.x + T.w / 2, T.y + T.d / 2, S(k.slabOf(T, 6, 1.4, P, 3, 0.4), { tone: "mid" }) + S(k.cylinder(T.x + 10, T.y + 11, 1.4, 0, 6, P, 12), { tone: "lo" }) + S(k.cylinder(T.x + T.w - 10, T.y + 11, 1.4, 0, 6, P, 12), { tone: "lo" }));
  SEATS.skeptic = [];
  for (let row = 0; row < 6; row++) for (let c = 0; c < 11; c++) SEATS.skeptic.push([s.x + 8 + c * 8.5, s.y + 12 + row * 15 + (row >= 2 ? 30 : 0)]);
  SEATS.skeptic = SEATS.skeptic.filter(([x, y]) => !(y > T.y - 4 && y < T.y + T.d + 4) && y < s.y + s.d - 6);
  // мастерская: верстак с шестернями
  const e = ROOMS.engineer;
  const B = { x: e.x + 10, y: e.y + 14, w: 52, d: 16, r: 2 };
  put(B.x + B.w / 2, B.y + B.d / 2, S(k.slabOf(B, 0, 9, P, 2, 0.5), { tone: "mid" }) + S(k.cylinder(B.x + 12, B.y + 8, 5, 9, 2.5, P, 32), { tone: "mid" }) + L(k.knurl(B.x + 12, B.y + 8, 5, 9, 11.5, 24, P, 0.3), { tone: "lo" }) + S(k.cylinder(B.x + 30, B.y + 8, 3.4, 9, 2, P, 24), { tone: "mid" }) + L(k.knurl(B.x + 30, B.y + 8, 3.4, 9, 11, 16, P, 0.3), { tone: "lo" }));
  SEATS.engineer = [];
  for (let row = 0; row < 5; row++) for (let c = 0; c < 7; c++) SEATS.engineer.push([e.x + 8 + c * 9, e.y + 40 + row * 12]);
  // совет: круглый стол
  const b = ROOMS.board;
  put(b.x + 36, b.y + 50, S(k.cylinder(b.x + 36, b.y + 50, 16, 6, 1.4, P, 48, 0.5), { tone: "mid" }) + S(k.cylinder(b.x + 36, b.y + 50, 2, 0, 6, P, 16), { tone: "lo" }));
  SEATS.board = [];
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; SEATS.board.push([b.x + 36 + Math.cos(a) * 22, b.y + 50 + Math.sin(a) * 22]); }
  // зал изобретателей: ряды длинных столов
  const v = ROOMS.inventor;
  SEATS.inventor = [];
  for (let row = 0; row < 5; row++) {
    const y = v.y + 10 + row * 19;
    for (let block = 0; block < 4; block++) {
      const x = v.x + 8 + block * 51;
      put(x + 22, y + 3, S(k.slabOf({ x, y, w: 46, d: 6, r: 1 }, 5, 1, P, 1, 0.3), { tone: "mid" }) + S(k.cylinder(x + 2, y + 3, 0.6, 0, 5, P, 8), { tone: "lo", crease: "none" }) + S(k.cylinder(x + 44, y + 3, 0.6, 0, 5, P, 8), { tone: "lo", crease: "none" }));
      for (let c = 0; c < 8; c++) SEATS.inventor.push([x + 3 + c * 5.8, y + 10]);
    }
  }
  // серверная: две стойки с вентиляторами
  const sv = ROOMS.server;
  SEATS.gpu = [];
  [0, 1].forEach((i) => {
    const R = { x: sv.x + 14, y: sv.y + 22 + i * 96, w: 50, d: 30, r: 2 };
    let svg = S(k.slabOf(R, 0, 34, P, 2, 0.6), { tone: "mid" });
    for (let z = 6; z < 34; z += 7) svg += L(k.planOutline({ x: R.x + 2, y: R.y + R.d - 0.01, w: R.w - 4, d: 0.01, r: 0 }, z, P), { tone: "lo" });
    for (const fx of [R.x + 14, R.x + 34]) {
      svg += S(k.cylinder(fx, R.y + R.d / 2, 8, 34, 0.8, P, 36), { tone: "lo", crease: "none" }) + L(k.ring(fx, R.y + R.d / 2, 6.6, 34.8, P, 36), { tone: "lo" });
      svg += `<g data-part="fan-${i}">${L(Array.from({ length: 7 }, (_, b) => { const a = (b / 7) * Math.PI * 2; return k.lineOnTop([fx + Math.cos(a) * 2, R.y + R.d / 2 + Math.sin(a) * 2], [fx + Math.cos(a + 0.5) * 6.2, R.y + R.d / 2 + Math.sin(a + 0.5) * 6.2], 34.9, P); }).join(""), { tone: "mid" })}</g>`;
    }
    svg += `<g data-part="lamp-gpu-${i}">${S(k.cylinder(R.x + R.w - 6, R.y + 5, 2, 34, 3, P, 16, 0.3), { tone: "hi" })}</g>`;
    put(R.x + R.w / 2, R.y + R.d / 2, svg, 10);
  });
}

floor();
walls();
furnish();
// растения по углам комнат
for (const r of Object.values(ROOMS)) {
  const [x, y] = [r.x + r.w - 7, r.y + 7];
  put(x, y, S(k.cylinder(x, y, 2.4, 0, 3.2, P, 16), { tone: "mid" }) + `<g class="plant">${S(k.cylinder(x, y, 3.6, 3.2, 5, P, 18, 1.6), { tone: "hi", crease: "none" })}</g>`, 1);
}
// доска в переговорной
{ const s = ROOMS.skeptic; put(s.x + 50, s.y + 3, `<g class="board-w">${S(k.slabOf({ x: s.x + 30, y: s.y + 2.5, w: 40, d: 1, r: 0.3 }, 3, 14, P, 1), { tone: "hi" })}</g>`, -4); }
const LABELS = Object.values(ROOMS).map((r) => { const [px, py] = at([r.x + 4, r.y + 4, WALL_H + 4]); return `<text class="room" x="${px.toFixed(1)}" y="${py.toFixed(1)}">${r.title}</text>`; }).join("");
const statics = items.sort((a, b) => a.d - b.d).map((x) => x.svg).join("");
const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Офис ИИ-компании: комнаты отделов, изобретателей, проверки, мастерская, совет и серверная; каждый агент — человечек на своём месте.",
  body: [floor(), statics, `<g data-part="people"></g>`, LABELS],
});

const live = `
const P = ${JSON.stringify(P)};
const SEATS = ${JSON.stringify(SEATS)};
const svg = document.querySelector(".iso-stage svg");
const layer = svg.querySelector('[data-part="people"]');
const readout = document.querySelector("[data-readout]");
const q = (n) => svg.querySelector('[data-part="' + n + '"]');
const lit = (n, on) => { const g = q(n); if (g) on ? g.setAttribute("data-on", "") : g.removeAttribute("data-on"); };
const depth = (x, y) => depthOf([x, y, 0], P);
function person(x, y, on, title, role) {
  const body = solidSvg(cylinder(x, y, 2.1, 0, 6.2, P, 16, 0.9), { tone: "hi", crease: "none" });
  const head = solidSvg(cylinder(x, y, 1.6, 6.8, 2.8, P, 16, 1.2), { tone: "hi", crease: "none" });
  return '<g class="pp r-' + role + '"' + (on ? " data-on" : "") + '><title>' + title.replace(/[<&]/g, "") + (on ? " — работает" : " — закончил") + '</title>' + body + head + '</g>';
}
let data = null, spin = [0, 0], last = 0, frame = 0;
function render() {
  const used = {}, all = [];
  for (const p of data.people || []) {
    const room = SEATS[p.r] ? p.r : "inventor";
    const seats = SEATS[room]; const i = used[room] = (used[room] || 0) + 1;
    let [x, y] = seats[(i - 1) % seats.length];
    const lap = Math.floor((i - 1) / seats.length); if (lap) { x += (lap % 3) * 1.8; y += 1.8 * Math.ceil(lap / 3); }
    all.push({ x, y, on: p.a, t: p.l, r: room });
  }
  all.sort((a, b) => depth(a.x, a.y) - depth(b.x, b.y));
  layer.innerHTML = all.map((p) => person(p.x, p.y, p.on, p.t, p.r)).join("");
  (data.gpus || []).forEach((g, i) => lit("lamp-gpu-" + i, g.running));
  readout.textContent = data.short || "";
  const st = document.querySelector("[data-status]");
  const cnt = (r) => (data.people || []).filter((p) => p.r === r);
  const row = (r, name) => { const c = cnt(r); return "<li><b>" + c.filter((p) => p.a).length + " работают / " + c.length + "</b> — " + name + "</li>"; };
  if (st) st.innerHTML = row("dept", "отделы") + row("inventor", "изобретатели") + row("skeptic", "скептики (проверка)") + row("engineer", "инженеры и прототиписты") + row("board", "совет и редакторы")
    + (data.gpus || []).filter((g) => g.name).map((g) => "<li><b>" + g.name + "</b> — видеокарта: " + (g.bits ? g.bits.toFixed(3).replace(".", ",") + " / " + (g.bits2 || 0).toFixed(3).replace(".", ",") + " бита, " + g.minutes + " мин" : "идёт") + "</li>").join("")
    + "<li class='upd'>обновлено " + (data.updated || "") + "</li>";
}
async function poll() { try { data = await (await fetch("company.json?ts=" + Date.now())).json(); render(); run(); } catch (e) {} }
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60; last = now;
  (data?.gpus || []).forEach((g, i) => { if (g.running) spin[i] += dt * 6; const f = q("fan-" + i); if (f) f.style.opacity = String(0.5 + 0.5 * Math.abs(Math.sin(spin[i]))); });
  const t = now / 1000;
  layer.querySelectorAll(".pp[data-on]").forEach((g, i) => { g.style.opacity = String(0.75 + 0.25 * Math.sin(t * 2 + i)); });
  frame = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : requestAnimationFrame(tick);
}
const run = () => { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } };
poll(); setInterval(poll, 30000);
`;

const body = k.plateHtml({
  fig: "Рис. К",
  title: "Офис ИИ-компании",
  hint: "Наведи на человечка — кто он",
  readout: "загрузка…",
  keys: [
    { mark: "lit", label: "Яркий — агент сейчас работает, бледный — закончил. Цвет: синие — изобретатели, оранжевые — скептики, жёлтые — инженеры, фиолетовые — совет, зелёные — отделы" },
    { mark: "raised", label: "Комнаты: отделы, проверка, мастерская (сзади); зал изобретателей и совет (спереди); справа серверная с двумя видеокартами" },
  ],
  caption: "Каждый человечек — отдельный агент компании. Отделы и изобретатели предлагают пути обойти DeepSeek, скептики пытаются их опровергнуть, инженеры собирают прототипы, совет сводит итог. В серверной учится наша сеть.",
  body: `<style>
.pp .iso-fill,.pp .iso-top,.pp .iso-shade{fill:var(--c)!important}.pp .iso-edge{stroke:var(--c2)!important}
.pp{--c:#2b6cb0;--c2:#90cdf4;opacity:.42}.pp[data-on]{opacity:1}
.r-inventor{--c:#2b6cb0;--c2:#9fd2ff}.r-skeptic{--c:#c05621;--c2:#ffc48a}.r-engineer{--c:#b7791f;--c2:#ffe38a}.r-board{--c:#6b46c1;--c2:#d6bcfa}.r-dept{--c:#2f855a;--c2:#9ae6b4}
.pp[data-on]{filter:drop-shadow(0 0 2.5px var(--c2))}
.plant .iso-fill,.plant .iso-top,.plant .iso-shade{fill:#2f6b3a!important}.plant .iso-edge{stroke:#7fbf86!important}
.board-w .iso-fill,.board-w .iso-top,.board-w .iso-shade{fill:#e8e8e2!important}
text.room{font:600 9px ui-sans-serif,system-ui,sans-serif;fill:#cfd8e3;letter-spacing:.04em;paint-order:stroke;stroke:#111;stroke-width:3px}
[data-part^=lamp-gpu][data-on] .iso-fill,[data-part^=lamp-gpu][data-on] .iso-top,[data-part^=lamp-gpu][data-on] .iso-shade{fill:#7dffa8!important}
[data-part^=lamp-gpu][data-on]{filter:drop-shadow(0 0 4px #5dff96)}
</style><style>.co-status{list-style:none;margin:10px 0 0;padding:0;font:12px/1.6 ui-monospace,monospace;color:var(--anatomy-mid,#888)}.co-status b{color:var(--anatomy-hi,#ddd);font-weight:600}.co-status .upd{opacity:.6}</style><div class="iso-stage" tabindex="0" role="img" aria-label="Офис ИИ-компании">${svg}</div><ul class="co-status" data-status></ul>`,
});
const out = join(HERE, "..", theme === "light" ? "company-light.html" : "company.html");
writeFileSync(out, k.pageHtml({ title: "Офис ИИ-компании", theme, body, script: kitScript() + live, width: 820 }));
console.log("wrote", out);
