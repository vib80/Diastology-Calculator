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
    source: "Figure 3, with Figure 2 shown alongside. Not for severe primary MR, any mitral stenosis, moderate or severe MAC, mitral repair, replacement, or TEER, atrial fibrillation, LVAD, noncardiac pulmonary hypertension, heart transplant, or pericardial constriction.",
    evaluate(input) {
      const secondMissing = input.secondMissing === true;
      const age = input.ageBand === "young" ? 30 : input.ageBand === "midage" ? 50 : input.ageBand === "older" ? 70 : null;
      return assessStandard({
        septalEPrime: input.eReduced ? 6 : 8,
        lateralEPrime: input.eReduced ? 6 : 10,
        averageEe: input.eeIncreased ? 14 : 8,
        tr: input.trIncreased ? 2.8 : 2.2,
        pasp: input.paspIncreased ? 35 : null,
        ea: input.eaBand === "le08" ? 0.8 : input.eaBand === "mid" ? 1.2 : input.eaBand === "ge2" ? 2 : null,
        symptomatic: input.symptomatic === true,
        lvef: input.glsNormal ? "preserved" : input.lvef || null,
        ageSpecific: input.ageSpecific === true,
        age,
        lars: secondMissing ? null : input.larsLow ? 18 : 25,
        lavi: secondMissing ? null : input.laviHigh ? 35 : 30,
        sd: secondMissing ? null : input.sdLow ? 0.67 : 1.2,
        ivrt: secondMissing ? null : input.ivrtShort ? 70 : 90,
        significantMr: input.significantMr === true,
        laStunning: input.laStunning === true,
        gls: input.glsNormal ? 19 : null,
        prEdv: input.prHigh ? 2 : null,
        padp: input.padpHigh ? 16 : null,
        lWave: input.lWaveHigh ? 50 : null,
        arMinusA: input.arALong ? 31 : null,
        valsalvaEaDecreasePct: input.valsalvaPositive ? 50 : null,
        sex: input.massSex || null,
        lvMassIndex: input.massHigh ? (input.massSex === "male" ? 116 : 96) : null,
      });
    },
    fields: [
      {
        type: "note",
        html: "Check each abnormal finding that is present. An unchecked box means that finding is absent, not missing.",
      },
      { type: "heading", text: "Core findings" },
      { type: "check", name: "eReduced", label: "Reduced e' (septal ≤ 6, lateral ≤ 7, or average ≤ 6.5 cm/s)" },
      { type: "check", name: "eeIncreased", label: "Increased E/e' (septal ≥ 15, lateral ≥ 13, or average ≥ 14)" },
      { type: "check", name: "trIncreased", label: "TR velocity ≥ 2.8 m/s" },
      { type: "check", name: "paspIncreased", label: "PASP ≥ 35 mm Hg (use this instead of TR when RAP was estimated)" },
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
      {
        type: "radios",
        name: "lvef",
        label: "LVEF",
        options: [
          ["", "Not specified", true],
          ["reduced", "Reduced (< 50%)"],
          ["preserved", "Preserved (≥ 50%)"],
        ],
      },
      { type: "check", name: "symptomatic", label: "Symptomatic (dyspnea or suspected heart failure)" },
      { type: "heading", text: "Second-stage findings" },
      {
        type: "note",
        html: "Use these when the core findings disagree, or when e' is the only abnormality and E/A is above 0.8.",
      },
      { type: "check", name: "larsLow", label: "LARS ≤ 18%" },
      { type: "check", name: "sdLow", label: "Pulmonary vein S/D ≤ 0.67" },
      { type: "check", name: "laviHigh", label: "LAVi > 34 mL/m²" },
      { type: "check", name: "ivrtShort", label: "IVRT ≤ 70 ms" },
      { type: "check", name: "secondMissing", label: "These second-stage measurements were not obtained" },
      { type: "check", name: "significantMr", label: "Significant mitral regurgitation (do not use LARS)" },
      { type: "check", name: "laStunning", label: "Suspected LA stunning (do not use LARS)" },
      { type: "check", name: "glsNormal", label: "Preserved EF and GLS > 18% (do not use LARS)" },
      {
        type: "details-start",
        summary: "Supplemental methods and age-specific limits",
      },
      { type: "check", name: "prHigh", label: "PR end-diastolic velocity ≥ 2 m/s" },
      { type: "check", name: "padpHigh", label: "PA diastolic pressure ≥ 16 mm Hg" },
      { type: "check", name: "lWaveHigh", label: "Mitral L-wave ≥ 50 cm/s" },
      { type: "check", name: "arALong", label: "Ar−A duration > 30 ms" },
      { type: "check", name: "valsalvaPositive", label: "Valsalva lowers E/A by ≥ 50%" },
      { type: "check", name: "ageSpecific", label: "Use age-specific e' and E/A limits" },
      {
        type: "radios",
        name: "ageBand",
        label: "Age band",
        show: "ageSpecific:true",
        options: [
          ["young", "20–39 years"],
          ["midage", "40–65 years"],
          ["older", "> 65 years"],
        ],
      },
      {
        type: "radios",
        name: "massSex",
        label: "LV mass index above the Figure 2 limit",
        options: [
          ["", "Not used", true],
          ["female", "Woman, LV mass index > 95 g/m²"],
          ["male", "Man, LV mass index > 115 g/m²"],
        ],
      },
      { type: "check", name: "massHigh", label: "LV mass index is above that limit", show: "massSex:female|male" },
      { type: "details-end" },
    ],
  },
  {
    id: "afib",
    label: "Atrial fibrillation",
    source: "Figure 8. Average several cycles at a representative rate. Table 7 lists additional indicators that are not branches of Figure 8.",
    evaluate(input) {
      const positive = ["afibE", "afibEe", "afibTr", "afibDt"].filter((key) => input[key]).length;
      const sendSupp = positive === 2 && input.suppMissing !== true;
      return assessAfib({
        e: input.afibE ? 100 : 80,
        septalEe: input.afibEe ? 11.1 : 10,
        tr: input.afibTr ? 2.81 : 2.5,
        dt: input.afibDt ? 160 : 180,
        lvef: input.lvefReduced ? "reduced" : input.lvefPreserved ? "preserved" : null,
        lars: sendSupp ? (input.afibLars ? 17.9 : 20) : null,
        sd: sendSupp ? (input.afibSd ? 0.9 : 1.1) : null,
        bmi: sendSupp ? (input.afibBmi ? 31 : 28) : null,
      });
    },
    fields: [
      { type: "note", html: "Check the abnormal findings. Unchecked means that finding is absent." },
      { type: "heading", text: "Core findings" },
      { type: "check", name: "afibE", label: "Mitral E velocity ≥ 100 cm/s" },
      { type: "check", name: "afibEe", label: "Septal E/e' > 11" },
      { type: "check", name: "afibTr", label: "TR velocity > 2.8 m/s or PASP > 35 mm Hg" },
      { type: "check", name: "afibDt", label: "Deceleration time ≤ 160 ms" },
      { type: "check", name: "lvefPreserved", label: "LVEF is preserved (adds the Table 7 note about DT)" },
      { type: "heading", text: "Supplemental findings", show: "afibCore:2" },
      {
        type: "note",
        show: "afibCore:2",
        html: "Figure 8 asks for these only when exactly two core findings are positive.",
      },
      { type: "check", name: "afibLars", label: "LARS < 18%", show: "afibCore:2" },
      { type: "check", name: "afibSd", label: "Pulmonary vein S/D < 1", show: "afibCore:2" },
      { type: "check", name: "afibBmi", label: "BMI > 30 kg/m²", show: "afibCore:2" },
      { type: "check", name: "suppMissing", label: "Supplemental measurements were not obtained", show: "afibCore:2" },
      { type: "list", title: "Other Table 7 atrial-fibrillation indicators, not scored", items: TABLE7.afib },
    ],
  },
  {
    id: "mac",
    label: "Moderate or severe MAC",
    source: "Figure 4 and Table 7. Mild MAC is not this algorithm.",
    evaluate(input) {
      const ea = input.macEa === "low" ? 0.7 : input.macEa === "mid" ? 1.2 : input.macEa === "high" ? 1.9 : null;
      const ivrt = input.macEa !== "mid" ? null : input.macIvrtMissing ? null : input.macIvrtShort ? 70 : 80;
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
      { type: "check", name: "macIvrtMissing", label: "IVRT was not measured", show: "macEa:mid" },
    ],
  },
  {
    id: "ph",
    label: "Pulmonary hypertension (not left-heart group II as the starting point)",
    source: "Figure 6. Group II pulmonary hypertension from left-heart disease is estimated with the standard algorithm instead.",
    evaluate(input) {
      if (input.phPath === "normal") return assessPh({ ea: 0.8, e: 50 });
      if (input.phPath === "lowE") {
        return assessPh(phIntermediate(input, { ea: 0.8, e: 60 }));
      }
      if (input.phPath === "mid") return assessPh(phIntermediate(input, { ea: 1.2 }));
      if (input.phPath === "highReduced") return assessPh({ ea: 2, septalEPrime: 5, lateralEPrime: 10 });
      if (input.phPath === "highPreserved") return assessPh({ ea: 2, septalEPrime: 8, lateralEPrime: 10 });
      return assessPh({});
    },
    fields: [
      { type: "note", html: "Lateral E/e' is the annulus used here. Septal flattening can lower septal e'." },
      {
        type: "radios",
        name: "phPath",
        label: "Mitral filling",
        options: [
          ["normal", "E/A ≤ 0.8 and E ≤ 50 cm/s"],
          ["lowE", "E/A ≤ 0.8 and E > 50 cm/s"],
          ["mid", "E/A > 0.8 and < 2"],
          ["highReduced", "E/A ≥ 2 and e' is reduced"],
          ["highPreserved", "E/A ≥ 2 and e' is not reduced"],
        ],
      },
      {
        type: "radios",
        name: "phLars",
        label: "LARS",
        show: "phPath:lowE|mid",
        options: [
          ["available", "LARS was measured", true],
          ["unavailable", "LARS was not measured"],
        ],
      },
      { type: "check", name: "phLarsLow", label: "LARS ≤ 18%", show: "phPath:lowE|mid;phLars:available" },
      {
        type: "radios",
        name: "phEe",
        label: "Lateral E/e'",
        show: "phPath:lowE|mid;phLars:unavailable",
        options: [
          ["low", "Lateral E/e' < 8"],
          ["mid", "Lateral E/e' 8 to 13"],
          ["high", "Lateral E/e' > 13"],
        ],
      },
      { type: "list", title: "Table 7 wording, which is not identical to Figure 6", items: TABLE7.ph },
    ],
  },
  {
    id: "htx",
    label: "Heart transplant, sinus rhythm",
    source: "Figure 5 and Table 7. An E/A ≥ 2 with preserved EF is common early after transplant and is not itself elevated LAP.",
    evaluate(input) {
      const averageEe = input.htxEe === "low" ? 6.9 : input.htxEe === "mid" ? 10 : input.htxEe === "high" ? 14.1 : null;
      if (input.htxEe !== "mid") return assessHtx({ averageEe });
      if (input.htxSr === "available") {
        return assessHtx({ averageEe, eSrIvr: input.htxSrHigh ? 201 : 200 });
      }
      const tr = input.htxTr === "high" ? 2.81 : input.htxTr === "low" ? 2.8 : null;
      return assessHtx({ averageEe, tr });
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
  {
    id: "exercise",
    label: "Diastolic exercise echocardiography",
    source: "Section 13. Indicated for dyspnea with grade 1 diastolic dysfunction or indeterminate resting pressure. Not indicated when rest diastolic function is completely normal, or when rest LAP is already elevated.",
    evaluate(input) {
      const averageEe = { under10: 9, tenTo14: 12, exactly14: 14, over14: 15 }[input.exEe] ?? null;
      const tr = { under28: 2.5, between: 3, at32: 3.2, over32: 3.3 }[input.exTr] ?? null;
      return assessExercise({
        averageEe,
        septalEe: input.exSeptal ? 15 : null,
        tr,
      });
    },
    fields: [
      {
        type: "radios",
        name: "exEe",
        label: "Exercise average E/e'",
        options: [
          ["under10", "Average E/e' < 10"],
          ["tenTo14", "Average E/e' 10 to 14, not including 14"],
          ["exactly14", "Average E/e' = 14"],
          ["over14", "Average E/e' > 14"],
        ],
      },
      { type: "check", name: "exSeptal", label: "Septal E/e' ≥ 15" },
      {
        type: "radios",
        name: "exTr",
        label: "Exercise TR velocity",
        options: [
          ["under28", "TR velocity < 2.8 m/s"],
          ["between", "TR velocity > 2.8 and < 3.2 m/s"],
          ["at32", "TR velocity = 3.2 m/s"],
          ["over32", "TR velocity > 3.2 m/s"],
        ],
      },
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
    evaluate(input) {
      const rap = { r3: 3, r5: 5, r10: 10, r15: 15 }[input.teerRap] ?? null;
      const velocity = input.teerV === "high" ? 1.8 : input.teerV === "low" ? 1.2 : null;
      return assessTeer({ velocity, rap, biventricularHf: input.biventricularHf === true });
    },
    fields: [
      {
        type: "radios",
        name: "teerV",
        label: "Peak transseptal velocity",
        options: [
          ["low", "Velocity ≤ 1.7 m/s"],
          ["high", "Velocity > 1.7 m/s"],
        ],
      },
      {
        type: "radios",
        name: "teerRap",
        label: "RAP",
        options: [
          ["r3", "3 mm Hg"],
          ["r5", "5 mm Hg"],
          ["r10", "10 mm Hg"],
          ["r15", "15 mm Hg"],
        ],
      },
      { type: "check", name: "biventricularHf", label: "Biventricular heart failure (velocity is not reliable)" },
    ],
  },
  {
    id: "conduction",
    label: "AV block, bundle branch block, or ventricular pacing",
    source: "Section 15.D. E/e' is less accurate with LBBB, RV pacing, and CRT. If mitral inflow is only an A wave, TR velocity > 2.8 m/s is the stated indicator.",
    evaluate(input) {
      const tr = input.condTr === "high" ? 2.81 : input.condTr === "low" ? 2.8 : null;
      return assessConductionTr({ tr });
    },
    fields: [
      {
        type: "note",
        html: "Fusion of E and A from a long PR interval can imitate impaired relaxation. The variables remain usable when E and A are not fused. This entry applies when only a mitral A wave is present.",
      },
      {
        type: "radios",
        name: "condTr",
        label: "TR velocity",
        options: [
          ["high", "TR velocity > 2.8 m/s"],
          ["low", "TR velocity ≤ 2.8 m/s"],
          ["missing", "TR was not measured"],
        ],
      },
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
      const actual = key === "afibCore" ? String(afibCore) : String(data[key] ?? "");
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
