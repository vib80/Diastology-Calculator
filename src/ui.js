import { TABLE7 } from "./diastology.js";
import {
  countPresent,
  gradeAfib,
  gradeHtx,
  gradeMac,
  gradePh,
  gradeStandard,
  needsSecond,
} from "./grade.js";

const MEASURED_NOTE =
  "Each finding starts as not measured. Mark present or absent only after it was assessed. Not measured is never counted as normal.";

const AFIB_CORE_KEYS = ["afibE", "afibEe", "afibTr", "afibDt"];

const SCENARIOS = [
  {
    id: "standard",
    label: "Sinus rhythm, standard algorithm",
    source:
      "Do not use this path for severe primary MR, any mitral stenosis, moderate or severe MAC, atrial fibrillation, LVAD, noncardiac pulmonary hypertension, heart transplant, or pericardial constriction.",
    evaluate: gradeStandard,
    fields: [
      { type: "note", html: MEASURED_NOTE },
      { type: "heading", text: "Core findings" },
      tri("eReduced", "Reduced e' (septal ≤ 6, lateral ≤ 7, or average ≤ 6.5 cm/s)"),
      tri("eeIncreased", "Increased E/e' (septal ≥ 15, lateral ≥ 13, or average ≥ 14)"),
      tri("trIncreased", "TR velocity ≥ 2.8 m/s or PASP ≥ 35 mm Hg"),
      choice("eaBand", "E/A ratio", [
        ["unknown", "Not measured"],
        ["le08", "≤ 0.8"],
        ["mid", "> 0.8 and < 2"],
        ["ge2", "≥ 2"],
      ]),
      { type: "heading", text: "Second-stage findings", show: "needSecond:yes" },
      tri("larsLow", "LARS ≤ 18%", "needSecond:yes"),
      tri("sdLow", "Pulmonary vein S/D ≤ 0.67", "needSecond:yes"),
      tri("laviHigh", "LAVi > 34 mL/m²", "needSecond:yes"),
      tri("ivrtShort", "IVRT ≤ 70 ms", "needSecond:yes"),
    ],
  },
  {
    id: "afib",
    label: "Atrial fibrillation",
    source: "Average several cycles at a usual rate.",
    evaluate: gradeAfib,
    fields: [
      { type: "note", html: MEASURED_NOTE },
      { type: "heading", text: "Core findings" },
      tri("afibE", "Mitral E velocity ≥ 100 cm/s"),
      tri("afibEe", "Septal E/e' > 11"),
      tri("afibTr", "TR velocity > 2.8 m/s or PASP > 35 mm Hg"),
      tri("afibDt", "Deceleration time ≤ 160 ms"),
      { type: "heading", text: "Supplemental findings", show: "afibCore:2" },
      tri("afibLars", "LARS < 18%", "afibCore:2"),
      tri("afibSd", "Pulmonary vein S/D < 1", "afibCore:2"),
      tri("afibBmi", "BMI > 30 kg/m²", "afibCore:2"),
    ],
  },
  {
    id: "mac",
    label: "Moderate or severe MAC",
    source: "Mild MAC is not this algorithm.",
    evaluate: gradeMac,
    fields: [
      { type: "note", html: MEASURED_NOTE },
      choice("macEa", "E/A ratio", [
        ["unknown", "Not measured"],
        ["low", "< 0.8"],
        ["mid", "0.8 to 1.8"],
        ["high", "> 1.8"],
      ]),
      tri("macIvrtShort", "IVRT < 80 ms", "macEa:mid"),
    ],
  },
  {
    id: "ph",
    label: "Pulmonary hypertension (not left-heart group II as the starting point)",
    source: "Group II pulmonary hypertension from left-heart disease uses the standard algorithm instead.",
    evaluate: gradePh,
    fields: [
      {
        type: "note",
        html: `${MEASURED_NOTE} Lateral E/e' is the annulus used here. Septal flattening can lower septal e'.`,
      },
      {
        type: "radios",
        name: "phPath",
        label: "Mitral filling",
        options: [
          ["unknown", "Not measured", true],
          ["normal", "E/A ≤ 0.8 and E ≤ 50 cm/s"],
          ["high", "E/A ≥ 2 and e' is reduced"],
          ["mid", "Neither of the above"],
        ],
      },
      tri("phLarsLow", "LARS ≤ 18%", "phPath:mid"),
      choice(
        "phEe",
        "Lateral E/e'",
        [
          ["unknown", "Not measured"],
          ["low", "< 8"],
          ["mid", "8 to 13"],
          ["high", "> 13"],
        ],
        "phPath:mid;phLarsLow:unknown",
      ),
    ],
  },
  {
    id: "htx",
    label: "Heart transplant, sinus rhythm",
    source: "An E/A ≥ 2 with preserved EF is common early after transplant and is not itself elevated LAP.",
    evaluate: gradeHtx,
    fields: [
      { type: "note", html: MEASURED_NOTE },
      choice("htxEe", "Average E/e'", [
        ["unknown", "Not measured"],
        ["low", "< 7"],
        ["mid", "7 to 14"],
        ["high", "> 14"],
      ]),
      tri("htxSrHigh", "E/SRIVR > 200 cm", "htxEe:mid"),
      tri("htxTrHigh", "TR velocity > 2.8 m/s", "htxEe:mid;htxSrHigh:unknown"),
    ],
  },
  infoScenario(
    "hcm",
    "Hypertrophic cardiomyopathy",
    "Findings associated with elevated LV filling pressure.",
    TABLE7.hcm,
  ),
  infoScenario(
    "rcm",
    "Restrictive cardiomyopathy",
    "Findings associated with elevated LV filling pressure, including advanced restrictive physiology.",
    TABLE7.rcm,
  ),
  infoScenario(
    "lvad",
    "LV assist device",
    "Findings associated with elevated LV filling pressure, including the interatrial-septum relationship.",
    TABLE7.lvad,
  ),
  infoScenario(
    "tachy",
    "Sinus tachycardia",
    "Findings associated with elevated LV filling pressure.",
    TABLE7.tachycardia,
  ),
  infoScenario(
    "mr",
    "Mitral regurgitation",
    "The standard algorithm is not for severe primary MR.",
    TABLE7.mr,
  ),
  infoScenario(
    "ms",
    "Mitral stenosis",
    "Any mitral stenosis excludes the standard algorithm.",
    TABLE7.ms,
  ),
];

function tri(name, label, show) {
  return { type: "tri", name, label, show };
}

function choice(name, label, options, show) {
  return { type: "choice", name, label, options, show };
}

function infoScenario(id, label, source, items) {
  return {
    id,
    label,
    source,
    items,
    evaluate() {
      return {
        grade: "Reference list",
        lap: null,
        reason:
          "These findings are associated with elevated LV filling pressure. They are not added up into a grade.",
        criteria: items,
        note: null,
        figure: "",
        indeterminate: false,
        missing: [],
      };
    },
    fields: [{ type: "list", title: "Findings", items }],
  };
}

const scenarioSelect = document.querySelector("#scenario");
const sourceLine = document.querySelector("#scenario-source");
const formRoot = document.querySelector("#form-root");
const resultRoot = document.querySelector("#result");

for (const scenario of SCENARIOS) {
  const option = document.createElement("option");
  option.value = scenario.id;
  option.textContent = scenario.label;
  scenarioSelect.append(option);
}

scenarioSelect.addEventListener("change", render);
document.querySelector("#reset").addEventListener("click", () => {
  render();
});

function render() {
  const scenario = SCENARIOS.find((item) => item.id === scenarioSelect.value);
  sourceLine.textContent = scenario.source;
  formRoot.innerHTML = `<form id="calc-form" class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">${scenario.fields
    .map(renderField)
    .join("")}</form>`;
  const form = document.querySelector("#calc-form");
  const update = () => {
    applyVisibility(form);
    show(scenario.evaluate(readForm(form)));
  };
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
}

function showAttr(field) {
  return field.show ? ` data-show="${field.show}"` : "";
}

function applyVisibility(form) {
  const data = readForm(form);
  const afibCore = countPresent(data, AFIB_CORE_KEYS);
  for (const el of form.querySelectorAll("[data-show]")) {
    const visible = el.dataset.show.split(";").every((part) => {
      const [key, expected] = part.split(":");
      const actual =
        key === "afibCore"
          ? String(afibCore)
          : key === "needSecond"
            ? needsSecond(data)
              ? "yes"
              : "no"
            : String(data[key] ?? "");
      return expected.split("|").includes(actual);
    });
    el.classList.toggle("hidden", !visible);
  }
}

function wide(extra = "") {
  return `sm:col-span-2 ${extra}`.trim();
}

function renderField(field) {
  if (field.type === "details-start") {
    const hint = field.hint
      ? `<span class="block text-sm font-normal text-gray-500">${escapeHtml(field.hint)}</span>`
      : "";
    return `<details class="${wide("rounded-lg border border-gray-200 bg-gray-50 px-3")}"><summary class="cursor-pointer list-none py-3 font-semibold text-base [&::-webkit-details-marker]:hidden">${escapeHtml(field.summary)}${hint}</summary><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">`;
  }
  if (field.type === "details-end") return `</div></details>`;
  if (field.type === "heading") {
    return `<h2${showAttr(field)} class="${wide("text-lg font-semibold border-b pb-1 pt-2")}">${escapeHtml(field.text)}</h2>`;
  }
  if (field.type === "note") {
    return `<div${showAttr(field)} class="${wide("bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3 text-sm")}">${field.html}</div>`;
  }
  if (field.type === "tri") {
    return renderSeg(
      field,
      [
        ["present", "Present", "opt-present"],
        ["absent", "Absent", "opt-absent"],
        ["unknown", "Not measured", "opt-unknown"],
      ],
      "unknown",
    );
  }
  if (field.type === "choice") {
    const selected = field.options.some(([value]) => value === "unknown")
      ? "unknown"
      : field.options[0][0];
    return renderSeg(
      field,
      field.options.map(([value, label]) => [
        value,
        label,
        value === "unknown" ? "opt-unknown" : "opt-choice",
      ]),
      selected,
      " seg-4",
    );
  }
  if (field.type === "radios") {
    const options = field.options
      .map(
        ([value, label, checked]) =>
          `<label class="flex items-start gap-3 min-h-11 py-1 text-sm"><input data-name="${field.name}" type="radio" name="${field.name}" value="${escapeHtml(value)}" class="mt-1 h-5 w-5 shrink-0"${checked ? " checked" : ""}><span>${escapeHtml(label)}</span></label>`,
      )
      .join("");
    return `<fieldset${showAttr(field)} class="${wide("rounded-lg border border-gray-200 p-3")}"><legend class="px-1 text-sm font-semibold">${escapeHtml(field.label)}</legend><div class="mt-1 space-y-1">${options}</div></fieldset>`;
  }
  if (field.type === "list") {
    return `<div class="${wide("bg-gray-50 border rounded-lg p-4")}"><h3 class="font-semibold mb-2">${escapeHtml(field.title)}</h3><ul class="list-disc pl-5 text-sm space-y-2">${field.items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul></div>`;
  }
  return "";
}

function renderSeg(field, options, selected, extraClass = "") {
  const buttons = options
    .map(
      ([value, label, tone]) =>
        `<label class="seg-opt"><input data-name="${field.name}" type="radio" name="${field.name}" value="${escapeHtml(value)}"${value === selected ? " checked" : ""}><span class="${tone}">${escapeHtml(label)}</span></label>`,
    )
    .join("");
  return `<div${showAttr(field)} class="${wide("finding")}"><div class="finding-label" id="${field.name}-label">${escapeHtml(field.label)}</div><div class="seg${extraClass}" role="radiogroup" aria-labelledby="${field.name}-label">${buttons}</div></div>`;
}

function readForm(form) {
  const data = {};
  for (const element of form.querySelectorAll("[data-name]")) {
    const name = element.dataset.name;
    if (element.type === "radio") {
      if (element.checked) data[name] = element.value;
    } else data[name] = element.value === "" ? null : element.value;
  }
  return data;
}

function show(report) {
  const tone = toneFor(report);
  const criteria = report.criteria?.length
    ? `<ul class="mt-2 space-y-1">${report.criteria
        .map((item) => `<li>• ${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    : "";
  const missing = report.missing?.length
    ? `<div class="mt-3"><p class="text-sm font-semibold">Still needed</p><ul class="mt-1 space-y-1">${report.missing
        .map((item) => `<li>• ${escapeHtml(item)}</li>`)
        .join("")}</ul></div>`
    : "";
  const lap = report.lap ? `<p class="text-lg font-medium mt-1">LAP: ${escapeHtml(report.lap)}</p>` : "";
  const note = report.note
    ? `<p class="mt-3 text-sm italic text-gray-700">${escapeHtml(report.note)}</p>`
    : "";
  const subtitle =
    [
      report.lap ? `LAP: ${report.lap}` : null,
      report.missing?.length ? `Still needed: ${report.missing.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Tap to read the full result";
  const chip = document.querySelector("#live-grade");
  chip.className = `sticky top-0 z-30 mt-4 rounded-lg px-4 py-3 shadow-md ${tone.box}`;
  chip.innerHTML = `<button type="button" class="w-full text-left" id="jump-result">
    <span class="block text-lg font-bold ${tone.title}">${escapeHtml(report.grade)}</span>
    <span class="block text-sm">${escapeHtml(subtitle)}</span>
  </button>`;
  chip.querySelector("#jump-result").addEventListener("click", () => {
    resultRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  resultRoot.innerHTML = `<section class="rounded-lg p-4 sm:p-5 ${tone.box}">
    <h2 class="text-2xl font-bold ${tone.title}">${escapeHtml(report.grade)}</h2>
    ${lap}
    <p class="text-sm mt-3">${escapeHtml(report.reason)}</p>
    ${criteria}
    ${missing}
    ${note}
  </section>`;
}

function toneFor(report) {
  const grade = report.grade;
  if (
    report.indeterminate ||
    grade === "Indeterminate" ||
    grade === "Indeterminate grade" ||
    grade === "Inconclusive"
  ) {
    return { box: "bg-gray-100", title: "text-gray-800" };
  }
  if (grade === "Grade 3" || grade === "Positive") return { box: "bg-red-100", title: "text-red-900" };
  if (grade === "Grade 2" || grade === "Elevated LAP") {
    return { box: "bg-amber-100", title: "text-amber-950" };
  }
  if (grade === "Grade 1") return { box: "bg-sky-100", title: "text-sky-950" };
  if (grade === "Indicators recorded" || grade === "No indicators marked" || grade === "Reference list") {
    return { box: "bg-gray-50", title: "text-gray-800" };
  }
  return { box: "bg-emerald-100", title: "text-emerald-950" };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

render();
