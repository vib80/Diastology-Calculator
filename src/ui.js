import {
  AR_SUPPORTIVE_FINDINGS,
  CONSTRICTION_CRITERIA,
  DISCLAIMER,
  TABLE7,
  assessAfib,
  assessConductionTr,
  assessExercise,
  assessHfpef,
  assessHtx,
  assessMac,
  assessPh,
  assessStandard,
  assessTeer,
  listIndicators,
} from "./diastology.js";

const SCENARIOS = [
  {
    id: "standard",
    label: "Sinus rhythm, standard algorithm",
    source: "Figure 3, with Figure 2 shown alongside. Not for severe primary MR, any mitral stenosis, moderate or severe MAC, mitral repair, replacement, or TEER, atrial fibrillation, LVAD, noncardiac pulmonary hypertension, heart transplant, or pericardial constriction.",
    evaluate: assessStandard,
    fields: [
      {
        type: "note",
        html: "Leave a field blank if that measurement was not made. Blank is not normal. When PASP is entered, it is used instead of TR velocity because PASP means right-atrial pressure was estimated.",
      },
      { type: "heading", text: "Core variables" },
      { type: "number", name: "septalEPrime", label: "Septal e'", unit: "cm/s", step: "0.1" },
      { type: "number", name: "lateralEPrime", label: "Lateral e'", unit: "cm/s", step: "0.1" },
      { type: "number", name: "averageEPrime", label: "Average e' (only if both sites were not entered)", unit: "cm/s", step: "0.1" },
      { type: "number", name: "septalEe", label: "Septal E/e'", unit: "", step: "0.1" },
      { type: "number", name: "lateralEe", label: "Lateral E/e'", unit: "", step: "0.1" },
      { type: "number", name: "averageEe", label: "Average E/e' (only if both sites were not entered)", unit: "", step: "0.1" },
      { type: "number", name: "tr", label: "Peak TR velocity", unit: "m/s", step: "0.01" },
      { type: "number", name: "pasp", label: "PASP", unit: "mm Hg", step: "1" },
      { type: "number", name: "e", label: "Mitral E", unit: "cm/s", step: "1" },
      { type: "number", name: "a", label: "Mitral A", unit: "cm/s", step: "1" },
      { type: "number", name: "ea", label: "E/A, if E and A were not both entered", unit: "", step: "0.01" },
      {
        type: "select",
        name: "lvef",
        label: "LVEF",
        options: [
          ["", "Not specified"],
          ["preserved", "Preserved (≥ 50%)"],
          ["reduced", "Reduced (< 50%)"],
        ],
      },
      { type: "check", name: "symptomatic", label: "Symptomatic (dyspnea or suspected heart failure)" },
      { type: "check", name: "ageSpecific", label: "Use age-specific e' limits (Table 6) and the Table 5 E/A floor" },
      { type: "number", name: "age", label: "Age", unit: "years", step: "1" },
      {
        type: "details-start",
        summary: "Second-stage parameters",
        hint: "Open when the core variables disagree",
      },
      {
        type: "note",
        html: "Used when the three core variables disagree, and when e' is the only abnormality but E/A is above the low cutoff. LARS ≤ 18%, pulmonary vein S/D ≤ 0.67, LAVi > 34 mL/m², or IVRT ≤ 70 ms.",
      },
      { type: "number", name: "lars", label: "LA reservoir strain", unit: "%", step: "0.1" },
      { type: "number", name: "lavi", label: "LAVi", unit: "mL/m²", step: "0.1" },
      { type: "number", name: "sd", label: "Pulmonary vein S/D", unit: "", step: "0.01" },
      { type: "number", name: "systolicFillingFraction", label: "Pulmonary vein systolic filling fraction, if S/D was not entered", unit: "%", step: "1" },
      { type: "number", name: "ivrt", label: "IVRT", unit: "ms", step: "1" },
      { type: "number", name: "gls", label: "LV GLS (enter 18 or −18)", unit: "%", step: "0.1" },
      { type: "check", name: "significantMr", label: "Significant mitral regurgitation (LARS will not be used)" },
      { type: "check", name: "laStunning", label: "Suspected LA stunning (LARS will not be used)" },
      { type: "details-end" },
      {
        type: "details-start",
        summary: "Supplemental methods",
        hint: "Only if LARS, pulmonary vein flow, LAVi, and IVRT are missing",
      },
      {
        type: "note",
        html: "Figure 3 uses these only when LARS, pulmonary vein flow, LAVi, and IVRT are unavailable or unreliable. Positive cutoffs: PR end-diastolic velocity ≥ 2 m/s, PA diastolic pressure ≥ 16 mm Hg, L-wave ≥ 50 cm/s, Ar−A > 30 ms, Valsalva E/A decrease ≥ 50%.",
      },
      { type: "number", name: "prEdv", label: "PR end-diastolic velocity", unit: "m/s", step: "0.01" },
      { type: "number", name: "padp", label: "PA diastolic pressure", unit: "mm Hg", step: "1" },
      { type: "number", name: "lWave", label: "Mitral L-wave velocity", unit: "cm/s", step: "1" },
      { type: "number", name: "arMinusA", label: "Ar−A duration", unit: "ms", step: "1" },
      { type: "number", name: "valsalvaEaDecreasePct", label: "Valsalva decrease in E/A", unit: "%", step: "1" },
      { type: "details-end" },
      {
        type: "details-start",
        summary: "Figure 2 structural marker",
        hint: "Optional LV mass",
      },
      {
        type: "select",
        name: "sex",
        label: "Sex, for LV mass index",
        options: [
          ["", "Not specified"],
          ["female", "Female"],
          ["male", "Male"],
        ],
      },
      { type: "number", name: "lvMassIndex", label: "LV mass index", unit: "g/m²", step: "1" },
      { type: "details-end" },
    ],
  },
  {
    id: "afib",
    label: "Atrial fibrillation",
    source: "Figure 8. Average several cycles at a representative rate. Table 7 lists additional indicators that are not branches of Figure 8.",
    evaluate: assessAfib,
    fields: [
      { type: "heading", text: "Core criteria" },
      { type: "number", name: "e", label: "Mitral E", unit: "cm/s", step: "1" },
      { type: "number", name: "septalEe", label: "Septal E/e'", unit: "", step: "0.1" },
      { type: "number", name: "tr", label: "Peak TR velocity", unit: "m/s", step: "0.01" },
      { type: "number", name: "pasp", label: "PASP", unit: "mm Hg", step: "1" },
      { type: "number", name: "dt", label: "Mitral E deceleration time", unit: "ms", step: "1" },
      {
        type: "select",
        name: "lvef",
        label: "LVEF (note only; Figure 8 does not change the DT branch)",
        options: [
          ["", "Not specified"],
          ["preserved", "Preserved (≥ 50%)"],
          ["reduced", "Reduced (< 50%)"],
        ],
      },
      { type: "heading", text: "Supplemental criteria, used when exactly two core criteria are positive" },
      { type: "number", name: "lars", label: "LARS", unit: "%", step: "0.1" },
      { type: "number", name: "sd", label: "Pulmonary vein S/D", unit: "", step: "0.01" },
      { type: "number", name: "bmi", label: "BMI", unit: "kg/m²", step: "0.1" },
      { type: "list", title: "Other Table 7 atrial-fibrillation indicators, not scored", items: TABLE7.afib },
    ],
  },
  {
    id: "mac",
    label: "Moderate or severe MAC",
    source: "Figure 4 and Table 7. Mild MAC is not this algorithm.",
    evaluate: assessMac,
    fields: [
      { type: "number", name: "e", label: "Mitral E", unit: "cm/s", step: "1" },
      { type: "number", name: "a", label: "Mitral A", unit: "cm/s", step: "1" },
      { type: "number", name: "ea", label: "E/A, if E and A were not both entered", unit: "", step: "0.01" },
      { type: "number", name: "ivrt", label: "IVRT, required when E/A is 0.8 to 1.8", unit: "ms", step: "1" },
    ],
  },
  {
    id: "ph",
    label: "Pulmonary hypertension (not left-heart group II as the starting point)",
    source: "Figure 6. Group II pulmonary hypertension from left-heart disease is estimated with the standard algorithm instead.",
    evaluate: assessPh,
    fields: [
      { type: "note", html: "Use lateral E/e' rather than the septal or average ratio. Septal flattening can lower septal e'." },
      { type: "number", name: "e", label: "Mitral E", unit: "cm/s", step: "1" },
      { type: "number", name: "a", label: "Mitral A", unit: "cm/s", step: "1" },
      { type: "number", name: "ea", label: "E/A, if E and A were not both entered", unit: "", step: "0.01" },
      { type: "number", name: "septalEPrime", label: "Septal e'", unit: "cm/s", step: "0.1" },
      { type: "number", name: "lateralEPrime", label: "Lateral e'", unit: "cm/s", step: "0.1" },
      { type: "number", name: "lars", label: "LARS", unit: "%", step: "0.1" },
      { type: "number", name: "lateralEe", label: "Lateral E/e', used when LARS is blank", unit: "", step: "0.1" },
      { type: "list", title: "Table 7 wording, which is not identical to Figure 6", items: TABLE7.ph },
    ],
  },
  {
    id: "htx",
    label: "Heart transplant, sinus rhythm",
    source: "Figure 5 and Table 7. An E/A ≥ 2 with preserved EF is common early after transplant and is not itself elevated LAP.",
    evaluate: assessHtx,
    fields: [
      { type: "number", name: "septalEe", label: "Septal E/e'", unit: "", step: "0.1" },
      { type: "number", name: "lateralEe", label: "Lateral E/e'", unit: "", step: "0.1" },
      { type: "number", name: "averageEe", label: "Average E/e', if both sites were not entered", unit: "", step: "0.1" },
      { type: "number", name: "eSrIvr", label: "E / SRIVR", unit: "cm", step: "1" },
      { type: "number", name: "tr", label: "Peak TR velocity, if E/SRIVR was not measured", unit: "m/s", step: "0.01" },
    ],
  },
  {
    id: "exercise",
    label: "Diastolic exercise echocardiography",
    source: "Section 13. Indicated for dyspnea with grade 1 diastolic dysfunction or indeterminate resting pressure. Not indicated when rest diastolic function is completely normal, or when rest LAP is already elevated.",
    evaluate: assessExercise,
    fields: [
      { type: "number", name: "averageEe", label: "Exercise average E/e'", unit: "", step: "0.1" },
      { type: "number", name: "septalEe", label: "Exercise septal E/e'", unit: "", step: "0.1" },
      { type: "number", name: "tr", label: "Exercise peak TR velocity", unit: "m/s", step: "0.01" },
    ],
  },
  {
    id: "hfpef",
    label: "HFpEF diagnostic sequence",
    source: "Figure 9. Resting LAP should come from the algorithm that matches the rhythm and valves, usually Figure 3.",
    evaluate: (input) =>
      assessHfpef({
        ...input,
        alternativesExcluded: input.alternativesExcluded === true,
        symptoms: input.symptoms === true,
      }),
    fields: [
      { type: "check", name: "symptoms", label: "Symptoms or signs of heart failure" },
      {
        type: "check",
        name: "alternativesExcluded",
        label: "Significant valve disease, noncardiac PH, significant CAD, amyloidosis, HCM, and constriction have been excluded",
      },
      {
        type: "select",
        name: "restingLap",
        label: "Resting LAP from the applicable algorithm",
        options: [
          ["", "Not assessed"],
          ["elevated", "Elevated (grade 2 or 3)"],
          ["normal", "Normal, including grade 1"],
          ["indeterminate", "Indeterminate"],
        ],
      },
      {
        type: "select",
        name: "exercise",
        label: "Diastolic exercise echocardiography",
        options: [
          ["", "Not performed"],
          ["positive", "Positive"],
          ["negative", "Negative"],
          ["indeterminate", "Indeterminate"],
        ],
      },
    ],
  },
  {
    id: "teer",
    label: "After TEER or another interatrial shunt",
    source: "Section 15.A. LAP (mm Hg) = 4V² + RAP. Velocity > 1.7 m/s usually means LAP is elevated, except in biventricular heart failure.",
    evaluate: assessTeer,
    fields: [
      { type: "number", name: "velocity", label: "Peak transseptal velocity", unit: "m/s", step: "0.01" },
      { type: "number", name: "rap", label: "RAP", unit: "mm Hg", step: "1" },
      { type: "check", name: "biventricularHf", label: "Biventricular heart failure (velocity is not reliable)" },
    ],
  },
  {
    id: "conduction",
    label: "AV block, bundle branch block, or ventricular pacing",
    source: "Section 15.D. E/e' is less accurate with LBBB, RV pacing, and CRT. If mitral inflow is only an A wave, TR velocity > 2.8 m/s is the stated indicator.",
    evaluate: assessConductionTr,
    fields: [
      {
        type: "note",
        html: "Fusion of E and A from a long PR interval can imitate impaired relaxation. The variables remain usable when E and A are not fused. This entry applies when only a mitral A wave is present.",
      },
      { type: "number", name: "tr", label: "Peak TR velocity", unit: "m/s", step: "0.01" },
    ],
  },
  infoScenario("hcm", "Hypertrophic cardiomyopathy", "Table 7. These are indicators, not a count that equals elevated LAP.", TABLE7.hcm),
  infoScenario("rcm", "Restrictive cardiomyopathy", "Table 7, plus the narrative description of advanced restrictive physiology.", TABLE7.rcm),
  infoScenario("lvad", "LV assist device", "Table 7, including the interatrial-septum pressure relationship.", TABLE7.lvad),
  infoScenario("tachy", "Sinus tachycardia", "Table 7.", TABLE7.tachycardia),
  infoScenario("mr", "Mitral regurgitation", "Table 7. The standard algorithm is not for severe primary MR.", TABLE7.mr),
  infoScenario("ms", "Mitral stenosis", "Table 7. Any mitral stenosis excludes the standard algorithm.", TABLE7.ms),
  infoScenario(
    "constriction",
    "Pericardial constriction",
    "Section 15.F. Figure 7 is the Mayo constriction-versus-restriction algorithm. The text gives these criteria and does not print a numeric point score, so none is invented here.",
    CONSTRICTION_CRITERIA,
  ),
  {
    id: "as",
    label: "Aortic stenosis",
    source: "Section 15.A.e. Diastolic function should be reported in aortic stenosis.",
    evaluate() {
      return {
        grade: "Use the standard algorithm",
        lap: null,
        reason:
          "The sinus-rhythm algorithm applies regardless of aortic stenosis severity. If moderate or severe MAC is also present, use the MAC algorithm instead.",
        criteria: [],
        note: null,
        figure: "Section 15.A.e",
        indeterminate: false,
      };
    },
    fields: [
      {
        type: "note",
        html: "There is no separate aortic-stenosis decision tree. Moderate or severe MAC is the exception.",
      },
    ],
  },
  infoScenario(
    "ar",
    "Aortic regurgitation",
    "Section 15.A.e. In severe regurgitation these findings support elevated LV filling pressure. The text does not define how many are required.",
    AR_SUPPORTIVE_FINDINGS,
  ),
];

function infoScenario(id, label, source, items) {
  return {
    id,
    label,
    source,
    items,
    evaluate(input) {
      const checked = items.map((_, index) => input[`item${index}`] === true);
      return listIndicators(checked, items);
    },
    fields: [
      { type: "note", html: "Mark a finding only when it is present. Unchecked means not marked, not normal." },
      ...items.map((item, index) => ({ type: "check", name: `item${index}`, label: item })),
    ],
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
  const update = () => show(scenario.evaluate(readForm(form)));
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
}

function wide(extra = "") {
  return `sm:col-span-2 ${extra}`.trim();
}

function renderField(field) {
  if (field.type === "details-start") {
    const hint = field.hint ? `<span class="block text-sm font-normal text-gray-500">${escapeHtml(field.hint)}</span>` : "";
    return `<details class="${wide("rounded-lg border border-gray-200 bg-gray-50 px-3")}"><summary class="cursor-pointer list-none py-3 font-semibold text-base [&::-webkit-details-marker]:hidden">${escapeHtml(field.summary)}${hint}</summary><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">`;
  }
  if (field.type === "details-end") return `</div></details>`;
  if (field.type === "heading") {
    return `<h2 class="${wide("text-lg font-semibold border-b pb-1 pt-2")}">${escapeHtml(field.text)}</h2>`;
  }
  if (field.type === "note") {
    return `<div class="${wide("bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3 text-sm")}">${field.html}</div>`;
  }
  if (field.type === "list") {
    return `<div class="${wide("bg-gray-50 border rounded-lg p-4")}"><h3 class="font-semibold mb-2">${escapeHtml(field.title)}</h3><ul class="list-disc pl-5 text-sm space-y-2">${field.items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul></div>`;
  }
  if (field.type === "check") {
    return `<label class="${wide("flex items-start gap-3 text-sm min-h-11 py-1")}"><input data-name="${field.name}" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0"><span>${escapeHtml(field.label)}</span></label>`;
  }
  if (field.type === "select") {
    const options = field.options
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("");
    return `<label class="${wide("block text-sm font-medium")}">${escapeHtml(field.label)}<select data-name="${field.name}" class="mt-1 w-full min-h-12 rounded-lg border border-gray-300 bg-white px-3 text-base">${options}</select></label>`;
  }
  const unit = field.unit ? ` (${escapeHtml(field.unit)})` : "";
  return `<label class="block text-sm font-medium">${escapeHtml(field.label)}${unit}<input data-name="${field.name}" type="number" inputmode="decimal" step="${field.step}" autocomplete="off" class="mt-1 w-full min-h-12 rounded-lg border border-gray-300 bg-white px-3 text-base"></label>`;
}

function readForm(form) {
  const data = {};
  for (const element of form.querySelectorAll("[data-name]")) {
    const name = element.dataset.name;
    if (element.type === "checkbox") data[name] = element.checked;
    else if (element.type === "number") data[name] = element.value === "" ? null : Number(element.value);
    else data[name] = element.value === "" ? null : element.value;
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
  const lap = report.lap ? `<p class="text-lg font-medium mt-1">LAP: ${escapeHtml(report.lap)}</p>` : "";
  const note = report.note
    ? `<p class="mt-3 text-sm italic text-gray-700">${escapeHtml(report.note)}</p>`
    : "";
  const pressure =
    report.extra?.lapValue != null
      ? `<p class="mt-2 text-sm">Calculated LAP ${escapeHtml(String(report.extra.lapValue))} mm Hg</p>`
      : "";
  const chip = document.querySelector("#live-grade");
  chip.className = `sticky top-0 z-30 mt-4 rounded-lg px-4 py-3 shadow-md ${tone.box}`;
  chip.innerHTML = `<button type="button" class="w-full text-left" id="jump-result">
    <span class="block text-lg font-bold ${tone.title}">${escapeHtml(report.grade)}</span>
    <span class="block text-sm">${report.lap ? `LAP: ${escapeHtml(report.lap)}` : "Tap to read the full result"}</span>
  </button>`;
  chip.querySelector("#jump-result").addEventListener("click", () => {
    resultRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  resultRoot.innerHTML = `<section class="rounded-lg p-4 sm:p-5 ${tone.box}">
    <h2 class="text-2xl font-bold ${tone.title}">${escapeHtml(report.grade)}</h2>
    ${lap}
    <p class="text-sm mt-3">${escapeHtml(report.reason)}</p>
    ${criteria}
    ${pressure}
    ${note}
    <p class="text-xs mt-4 text-gray-500">Source: ${escapeHtml(report.figure || "")}</p>
    <p class="text-sm mt-3 text-gray-700 leading-relaxed">${escapeHtml(DISCLAIMER)}</p>
  </section>`;
}

function toneFor(report) {
  const grade = report.grade;
  if (report.indeterminate || grade === "Indeterminate" || grade === "Indeterminate grade" || grade === "Inconclusive" || grade === "Exercise testing needed") {
    return { box: "bg-gray-100", title: "text-gray-800" };
  }
  if (grade === "Grade 3" || grade === "Positive") return { box: "bg-red-100", title: "text-red-900" };
  if (grade === "Grade 2" || grade === "Elevated LAP" || grade === "HFpEF likely" || grade === "HFpEF supported") {
    return { box: "bg-amber-100", title: "text-amber-950" };
  }
  if (grade === "Grade 1") return { box: "bg-sky-100", title: "text-sky-950" };
  if (grade === "Indicators recorded" || grade === "No indicators marked") {
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
