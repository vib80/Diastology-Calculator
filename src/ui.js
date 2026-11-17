import {
  TABLE7,
  assessAfib,
  assessHtx,
  assessMac,
  assessPh,
} from "./diastology.js";

function gradeStandard(input) {
  const abnormal = [input.eReduced, input.eeIncreased, input.trIncreased].filter(Boolean).length;
  const criteria = [];
  if (input.eReduced) criteria.push("Reduced e' velocity");
  if (input.eeIncreased) criteria.push("Increased E/e' ratio");
  if (input.trIncreased) criteria.push("TR velocity ≥ 2.8 m/s or PASP ≥ 35 mm Hg");
  const finish = (base) => ({ note: null, figure: "Figure 3", indeterminate: false, criteria, ...base });
  const byEa = (lead) => {
    if (input.eaBand === "ge2") {
      return finish({ grade: "Grade 3", lap: "Marked increase", reason: `${lead} E/A is ≥ 2.` });
    }
    if (input.eaBand === "le08" || input.eaBand === "mid") {
      return finish({ grade: "Grade 2", lap: "Mild to moderate increase", reason: `${lead} E/A is < 2.` });
    }
    return finish({
      grade: "Indeterminate grade",
      lap: "Increased",
      reason: `${lead} E/A is needed to separate grade 2 from grade 3.`,
      indeterminate: true,
    });
  };

  if (abnormal === 0) {
    return finish({
      grade: "Normal diastolic function",
      lap: "Normal",
      reason: "e', E/e', and TR velocity or PASP are not increased.",
    });
  }
  if (abnormal === 3) return byEa("All three core findings are abnormal.");
  if (abnormal === 1 && input.eReduced && input.eaBand === "le08") {
    return finish({
      grade: "Grade 1",
      lap: "Normal",
      reason: "Only e' is reduced, and E/A is ≤ 0.8.",
      criteria: [...criteria, "E/A ≤ 0.8"],
    });
  }
  if (abnormal === 1 && input.eReduced && (!input.eaBand || input.eaBand === "unknown")) {
    return finish({
      grade: "Indeterminate",
      lap: null,
      reason: "Only e' is reduced. Choose E/A: ≤ 0.8 is grade 1, and a higher E/A uses the second-stage findings.",
      indeterminate: true,
    });
  }
  const supp = [];
  if (input.larsLow) supp.push("LARS ≤ 18%");
  if (input.sdLow) supp.push("Pulmonary vein S/D ≤ 0.67");
  if (input.laviHigh) supp.push("LAVi > 34 mL/m²");
  if (input.ivrtShort) supp.push("IVRT ≤ 70 ms");
  if (supp.length === 0) {
    return finish({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "The core findings do not establish elevated LAP, and the second-stage findings are not abnormal. This is not grade 1.",
    });
  }
  const graded = byEa("A second-stage finding is abnormal.");
  graded.criteria = [...criteria, ...supp];
  return graded;
}

function needsSecond(input) {
  const abnormal = [input.eReduced, input.eeIncreased, input.trIncreased].filter(Boolean).length;
  if (abnormal === 0 || abnormal === 3) return false;
  if (abnormal === 1 && input.eReduced && (input.eaBand === "le08" || !input.eaBand || input.eaBand === "unknown")) {
    return false;
  }
  return true;
}

function phIntermediate(input, base) {
  if (input.phLars === "unavailable") {
    const lateralEe = input.phEe === "low" ? 7 : input.phEe === "high" ? 14 : input.phEe === "mid" ? 10 : null;
    return { ...base, lateralEe };
  }
  return { ...base, lars: input.phLarsLow ? 18 : 20 };
}

const SCENARIOS = [
  {
    id: "standard",
    label: "Sinus rhythm, standard algorithm",
    source: "Figure 3. Do not use this path for severe primary MR, any mitral stenosis, moderate or severe MAC, atrial fibrillation, LVAD, noncardiac pulmonary hypertension, heart transplant, or pericardial constriction.",
    evaluate: gradeStandard,
    fields: [
      { type: "note", html: "Check each abnormal finding. Leave it unchecked when that finding is absent." },
      { type: "heading", text: "Core findings" },
      { type: "check", name: "eReduced", label: "Reduced e' (septal ≤ 6, lateral ≤ 7, or average ≤ 6.5 cm/s)" },
      { type: "check", name: "eeIncreased", label: "Increased E/e' (septal ≥ 15, lateral ≥ 13, or average ≥ 14)" },
      { type: "check", name: "trIncreased", label: "TR velocity ≥ 2.8 m/s or PASP ≥ 35 mm Hg" },
      {
        type: "radios",
        name: "eaBand",
        label: "E/A ratio",
        options: [
          ["unknown", "Not specified", true],
          ["le08", "E/A ≤ 0.8"],
          ["mid", "E/A > 0.8 and < 2"],
          ["ge2", "E/A ≥ 2"],
        ],
      },
      { type: "heading", text: "Second-stage findings", show: "needSecond:yes" },
      { type: "check", name: "larsLow", label: "LARS ≤ 18%", show: "needSecond:yes" },
      { type: "check", name: "sdLow", label: "Pulmonary vein S/D ≤ 0.67", show: "needSecond:yes" },
      { type: "check", name: "laviHigh", label: "LAVi > 34 mL/m²", show: "needSecond:yes" },
      { type: "check", name: "ivrtShort", label: "IVRT ≤ 70 ms", show: "needSecond:yes" },
    ],
  },
  {
    id: "afib",
    label: "Atrial fibrillation",
    source: "Figure 8. Average several cycles at a usual rate.",
    evaluate(input) {
      const positive = ["afibE", "afibEe", "afibTr", "afibDt"].filter((key) => input[key]).length;
      const report = assessAfib({
        e: input.afibE ? 100 : 80,
        septalEe: input.afibEe ? 11.1 : 10,
        tr: input.afibTr ? 2.81 : 2.5,
        dt: input.afibDt ? 160 : 180,
        lars: positive === 2 ? (input.afibLars ? 17.9 : 20) : null,
        sd: positive === 2 ? (input.afibSd ? 0.9 : 1.1) : null,
        bmi: positive === 2 ? (input.afibBmi ? 31 : 28) : null,
      });
      return { ...report, note: null };
    },
    fields: [
      { type: "note", html: "Check the abnormal findings. Leave a box unchecked when that finding is absent." },
      { type: "heading", text: "Core findings" },
      { type: "check", name: "afibE", label: "Mitral E velocity ≥ 100 cm/s" },
      { type: "check", name: "afibEe", label: "Septal E/e' > 11" },
      { type: "check", name: "afibTr", label: "TR velocity > 2.8 m/s or PASP > 35 mm Hg" },
      { type: "check", name: "afibDt", label: "Deceleration time ≤ 160 ms" },
      { type: "heading", text: "Supplemental findings", show: "afibCore:2" },
      { type: "check", name: "afibLars", label: "LARS < 18%", show: "afibCore:2" },
      { type: "check", name: "afibSd", label: "Pulmonary vein S/D < 1", show: "afibCore:2" },
      { type: "check", name: "afibBmi", label: "BMI > 30 kg/m²", show: "afibCore:2" },
    ],
  },
  {
    id: "mac",
    label: "Moderate or severe MAC",
    source: "Figure 4 and Table 7. Mild MAC is not this algorithm.",
    evaluate(input) {
      const ea = input.macEa === "low" ? 0.7 : input.macEa === "mid" ? 1.2 : input.macEa === "high" ? 1.9 : null;
      const ivrt = input.macEa !== "mid" ? null : input.macIvrtShort ? 70 : 80;
      return assessMac({ ea, ivrt });
    },
    fields: [
      {
        type: "radios",
        name: "macEa",
        label: "E/A ratio",
        options: [
          ["low", "E/A < 0.8"],
          ["mid", "E/A 0.8 to 1.8"],
          ["high", "E/A > 1.8"],
        ],
      },
      { type: "check", name: "macIvrtShort", label: "IVRT < 80 ms", show: "macEa:mid" },
    ],
  },
  {
    id: "ph",
    label: "Pulmonary hypertension (not left-heart group II as the starting point)",
    source: "Figure 6. Group II pulmonary hypertension from left-heart disease is estimated with the standard algorithm instead.",
    evaluate(input) {
      if (input.phPath === "normal") return { ...assessPh({ ea: 0.8, e: 50 }), note: null };
      if (input.phPath === "mid") return { ...assessPh(phIntermediate(input, { ea: 1.2, e: 60 })), note: null };
      if (input.phPath === "high") return { ...assessPh({ ea: 2, septalEPrime: 5, lateralEPrime: 10 }), note: null };
      return { ...assessPh({}), note: null };
    },
    fields: [
      { type: "note", html: "Lateral E/e' is the annulus used here. Septal flattening can lower septal e'." },
      {
        type: "radios",
        name: "phPath",
        label: "Mitral filling",
        options: [
          ["normal", "E/A ≤ 0.8 and E ≤ 50 cm/s"],
          ["high", "E/A ≥ 2 and e' is reduced"],
          ["mid", "Neither of the above"],
        ],
      },
      {
        type: "radios",
        name: "phLars",
        label: "LARS",
        show: "phPath:mid",
        options: [
          ["available", "LARS was measured", true],
          ["unavailable", "LARS was not measured"],
        ],
      },
      { type: "check", name: "phLarsLow", label: "LARS ≤ 18%", show: "phPath:mid;phLars:available" },
      {
        type: "radios",
        name: "phEe",
        label: "Lateral E/e'",
        show: "phPath:mid;phLars:unavailable",
        options: [
          ["low", "Lateral E/e' < 8"],
          ["mid", "Lateral E/e' 8 to 13"],
          ["high", "Lateral E/e' > 13"],
        ],
      },
    ],
  },
  {
    id: "htx",
    label: "Heart transplant, sinus rhythm",
    source: "Figure 5 and Table 7. An E/A ≥ 2 with preserved EF is common early after transplant and is not itself elevated LAP.",
    evaluate(input) {
      const averageEe = input.htxEe === "low" ? 6.9 : input.htxEe === "mid" ? 10 : input.htxEe === "high" ? 14.1 : null;
      if (input.htxEe !== "mid") return { ...assessHtx({ averageEe }), note: null };
      if (input.htxSr === "available") {
        return { ...assessHtx({ averageEe, eSrIvr: input.htxSrHigh ? 201 : 200 }), note: null };
      }
      const tr = input.htxTr === "high" ? 2.81 : input.htxTr === "low" ? 2.8 : null;
      return { ...assessHtx({ averageEe, tr }), note: null };
    },
    fields: [
      {
        type: "radios",
        name: "htxEe",
        label: "Average E/e'",
        options: [
          ["low", "Average E/e' < 7"],
          ["mid", "Average E/e' 7 to 14"],
          ["high", "Average E/e' > 14"],
        ],
      },
      {
        type: "radios",
        name: "htxSr",
        label: "E/SRIVR",
        show: "htxEe:mid",
        options: [
          ["available", "E/SRIVR was measured", true],
          ["unavailable", "E/SRIVR was not measured"],
        ],
      },
      { type: "check", name: "htxSrHigh", label: "E/SRIVR > 200 cm", show: "htxEe:mid;htxSr:available" },
      {
        type: "radios",
        name: "htxTr",
        label: "TR velocity",
        show: "htxEe:mid;htxSr:unavailable",
        options: [
          ["high", "TR velocity > 2.8 m/s"],
          ["low", "TR velocity ≤ 2.8 m/s"],
          ["missing", "TR was not measured"],
        ],
      },
    ],
  },
  infoScenario("hcm", "Hypertrophic cardiomyopathy", "Table 7. Findings associated with elevated LV filling pressure.", TABLE7.hcm),
  infoScenario("rcm", "Restrictive cardiomyopathy", "Table 7, plus the narrative description of advanced restrictive physiology.", TABLE7.rcm),
  infoScenario("lvad", "LV assist device", "Table 7, including the interatrial-septum pressure relationship.", TABLE7.lvad),
  infoScenario("tachy", "Sinus tachycardia", "Table 7.", TABLE7.tachycardia),
  infoScenario("mr", "Mitral regurgitation", "Table 7. The standard algorithm is not for severe primary MR.", TABLE7.mr),
  infoScenario("ms", "Mitral stenosis", "Table 7. Any mitral stenosis excludes the standard algorithm.", TABLE7.ms),
];

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
        reason: "These findings are associated with elevated LV filling pressure. They are not added up into a grade.",
        criteria: items,
        note: null,
        figure: "Table 7",
        indeterminate: false,
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
  const afibCore = ["afibE", "afibEe", "afibTr", "afibDt"].filter((key) => data[key]).length;
  for (const el of form.querySelectorAll("[data-show]")) {
    const visible = el.dataset.show.split(";").every((part) => {
      const [key, expected] = part.split(":");
      const actual = key === "afibCore" ? String(afibCore) : key === "needSecond" ? (needsSecond(data) ? "yes" : "no") : String(data[key] ?? "");
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
    const hint = field.hint ? `<span class="block text-sm font-normal text-gray-500">${escapeHtml(field.hint)}</span>` : "";
    return `<details class="${wide("rounded-lg border border-gray-200 bg-gray-50 px-3")}"><summary class="cursor-pointer list-none py-3 font-semibold text-base [&::-webkit-details-marker]:hidden">${escapeHtml(field.summary)}${hint}</summary><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3">`;
  }
  if (field.type === "details-end") return `</div></details>`;
  if (field.type === "heading") {
    return `<h2${showAttr(field)} class="${wide("text-lg font-semibold border-b pb-1 pt-2")}">${escapeHtml(field.text)}</h2>`;
  }
  if (field.type === "note") {
    return `<div${showAttr(field)} class="${wide("bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3 text-sm")}">${field.html}</div>`;
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
  if (field.type === "check") {
    return `<label${showAttr(field)} class="${wide("flex items-start gap-3 text-sm min-h-11 py-1")}"><input data-name="${field.name}" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0"><span class="font-medium">${escapeHtml(field.label)}</span></label>`;
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
    else if (element.type === "radio") {
      if (element.checked) data[name] = element.value;
    } else if (element.type === "number") data[name] = element.value === "" ? null : Number(element.value);
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
  </section>`;
}

function toneFor(report) {
  const grade = report.grade;
  if (report.indeterminate || grade === "Indeterminate" || grade === "Indeterminate grade" || grade === "Inconclusive") {
    return { box: "bg-gray-100", title: "text-gray-800" };
  }
  if (grade === "Grade 3" || grade === "Positive") return { box: "bg-red-100", title: "text-red-900" };
  if (grade === "Grade 2" || grade === "Elevated LAP") {
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
