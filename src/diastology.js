/**
 * Left-ventricular diastolic function and LAP estimation.
 *
 * Logic follows Nagueh SF, Sanborn DY, Oh JK, et al. Recommendations for the
 * Evaluation of Left Ventricular Diastolic Function by Echocardiography and
 * for Heart Failure With Preserved Ejection Fraction Diagnosis: An Update From
 * the American Society of Echocardiography. J Am Soc Echocardiogr.
 * 2025;38(7):537-569. doi:10.1016/j.echo.2025.03.011
 * https://www.asecho.org/wp-content/uploads/2025/07/Left-Ventricular-Diastolic-Function.pdf
 *
 * This is an ASE update. It supersedes the 2016 ASE/EACVI guideline. It is not
 * itself a joint ASE/EACVI document. No newer ASE or ASE/EACVI diastolic-function
 * recommendation was identified (checked November 2026). An ASE reference booklet
 * listed with a later publishing date does not replace this JASE document.
 *
 * Blank measurements are missing. They are never treated as normal.
 */

export const GUIDELINE = {
  authors: "Nagueh SF, Sanborn DY, Oh JK, et al.",
  title:
    "Recommendations for the Evaluation of Left Ventricular Diastolic Function by Echocardiography and for Heart Failure With Preserved Ejection Fraction Diagnosis: An Update From the American Society of Echocardiography",
  journal: "J Am Soc Echocardiogr",
  year: 2025,
  volume: 38,
  issue: 7,
  pages: "537-569",
  doi: "10.1016/j.echo.2025.03.011",
  pdf: "https://www.asecho.org/wp-content/uploads/2025/07/Left-Ventricular-Diastolic-Function.pdf",
  link: "https://doi.org/10.1016/j.echo.2025.03.011",
};

export const DISCLAIMER =
  "This tool is for educational and decision-support purposes only. It is not a substitute for independent clinical judgment. Results must be verified by a qualified clinician against the full echocardiographic study and current guidelines. The tool is provided “as is,” without warranties of any kind, express or implied, including warranties of accuracy, completeness, merchantability, or fitness for a particular purpose. The author assumes no liability for clinical decisions or outcomes arising from its use.";

/** Figure 3 default annulus cutoffs. Equality is abnormal. */
export const DEFAULT_E_PRIME = Object.freeze({
  septal: 6,
  lateral: 7,
  average: 6.5,
  op: "<=",
});

/**
 * Table 6. Age-specific lower limits. The table prints strict "<".
 * Bins: 20–39, 40–65, >65 years.
 */
export const TABLE6_E_PRIME = Object.freeze({
  "20-39": Object.freeze({ septal: 7, lateral: 10, average: 9, op: "<" }),
  "40-65": Object.freeze({ septal: 6, lateral: 8, average: 7, op: "<" }),
  ">65": Object.freeze({ septal: 6, lateral: 7, average: 6.5, op: "<" }),
});

/**
 * Table 5 fifth-percentile E/A lower reference limits.
 * A value below the printed fifth percentile is abnormally reduced.
 * Bins in the table are 20–39, 40–60, and 60–80, which do not match Table 6.
 */
export const TABLE5_EA_FIFTH = Object.freeze({
  "20-39": 0.88,
  "40-60": 0.69,
  "60-80": 0.5,
});

/** Table 7 indicators. Strings are the operational thresholds as printed. */
export const TABLE7 = Object.freeze({
  afib: Object.freeze([
    "DT < 160 ms in patients with depressed LVEF (Table 7). Figure 8, the decision algorithm, uses DT ≤ 160 ms and does not restrict it to depressed LVEF.",
    "Peak acceleration rate of mitral E velocity ≥ 1,900 cm/s²",
    "IVRT ≤ 65 ms",
    "Deceleration time of pulmonary venous diastolic velocity ≤ 220 ms",
    "E/Vp ratio ≥ 1.4",
    "Septal E/e' ≥ 11 (Table 7). Figure 8 uses septal E/e' > 11.",
    "Peak TR velocity > 2.8 m/s",
  ]),
  tachycardia: Object.freeze([
    "Predominant early LV filling pattern with depressed LVEF",
    "IVRT ≤ 70 ms (specific, 79%)",
    "Pulmonary vein systolic filling fraction ≤ 40% (specific, 88%)",
    "Average E/e' > 14 (high specificity, low sensitivity)",
    "When E and A are fused, a post-ectopic pause often separates them and those beats can be measured",
  ]),
  hcm: Object.freeze([
    "Average E/e' > 14",
    "Ar−A duration ≥ 30 ms",
    "Peak TR velocity > 2.8 m/s",
    "LA maximum volume index > 34 mL/m²",
  ]),
  rcm: Object.freeze([
    "Average E/e' > 14",
    "Deceleration time < 140 ms (specific, not sensitive). Advanced restrictive physiology is also described with deceleration time < 150 ms.",
    "E/A > 2.5 (specific, not sensitive)",
    "IVRT < 50 ms (specific, not sensitive)",
    "Advanced disease also shows septal and lateral e' about 3–4 cm/s. Annular velocities < 5 cm/s in systole, early diastole, and late diastole (“5-5-5”) suggest advanced cardiac amyloidosis.",
  ]),
  ph: Object.freeze([
    "E/A ≥ 2 favors postcapillary (group II) PH",
    "E/A ≤ 0.8 favors precapillary PH",
    "When E/A is > 0.8 but < 2: lateral E/e' > 13, LAVi > 34 mL/m², and LARS < 18% favor postcapillary PH (Table 7). Figure 6 is the decision tree and differs in detail.",
  ]),
  ms: Object.freeze([
    "IVRT < 60 ms (specific, not sensitive)",
    "Mitral A velocity > 1.5 m/s",
    "IVRT / TE−e' < 4.2",
    "E/e' is not useful in mitral stenosis",
  ]),
  mr: Object.freeze([
    "IVRT < 60 ms (specific, not sensitive)",
    "Ar−A duration ≥ 30 ms",
    "IVRT / TE−e' < 5.6. Separately, the text states that IVRT / TE−e' < 3 readily predicts mean PCWP > 15 mm Hg regardless of EF.",
    "Average E/e' > 14 in patients with depressed EF. E/e' is not established in primary MR with normal EF.",
    "LARS has no significant relationship with LA v-wave or mean pressure in significant MR.",
  ]),
  mac: Object.freeze([
    "E/A < 0.8: LAP usually normal",
    "E/A > 1.8: LAP usually elevated",
    "E/A 0.8 to 1.8: measure IVRT. IVRT ≥ 80 ms: LAP usually normal. IVRT < 80 ms: LAP elevated.",
  ]),
  lvad: Object.freeze([
    "E/A > 2",
    "RAP > 10 mm Hg",
    "PASP > 40 mm Hg",
    "Average E/e' > 14 or septal E/e' ≥ 15",
    "LA maximum volume index > 33 mL/m²",
    "Interatrial septum: LAP equals RAP when the septum is neutral; LAP is 5 mm Hg higher than RAP when the septum bulges to the right; LAP is 5 mm Hg lower than RAP when the septum bulges to the left.",
  ]),
  htx: Object.freeze([
    "Average E/e' < 7: normal LV filling pressure",
    "Average E/e' > 14: elevated LV filling pressure",
    "Average E/e' > 7 and < 14: measure E/SRIVR from all three apical views. ≤ 200 cm: normal. > 200 cm: elevated.",
    "If SRIVR cannot be measured, use peak TR velocity. ≤ 2.8 m/s: normal. > 2.8 m/s: elevated.",
  ]),
});

export const CONSTRICTION_CRITERIA = Object.freeze([
  "Respirophasic shift of the ventricular septum and septal bounce",
  "Mitral inflow respiratory variation > 25%",
  "Tricuspid inflow respiratory variation > 40%",
  "Septal e' often > 7 cm/s, whereas restrictive cardiomyopathy usually has septal e' ≤ 5 cm/s",
  "Annulus reversus: septal e' greater than lateral e'",
  "Strain reversus: lateral LV and RV free-wall peak systolic strain reduced relative to the septum",
  "Expiratory hepatic-vein end-diastolic reversal velocity / forward flow ≥ 0.8",
  "A normal septal e' velocity should raise suspicion for pericardial constriction",
  "Do not apply the Figure 3 LAP algorithm",
]);

export const AR_SUPPORTIVE_FINDINGS = Object.freeze([
  "Premature mitral-valve closure",
  "Diastolic mitral regurgitation",
  "Left atrial enlargement",
  "Average E/e' > 14",
  "LARS < 18%",
  "Peak TR velocity > 2.8 m/s",
]);

function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1e6) / 1e6;
}

function cmp(value, cutoff, op) {
  if (op === "<=") return value <= cutoff;
  if (op === "<") return value < cutoff;
  if (op === ">=") return value >= cutoff;
  if (op === ">") return value > cutoff;
  throw new Error(`Unknown comparator ${op}`);
}

function result({
  grade,
  lap = null,
  reason,
  criteria = [],
  note = null,
  figure,
  indeterminate = false,
  extra = null,
}) {
  return {
    grade,
    lap,
    reason,
    criteria,
    note: note || null,
    figure,
    indeterminate,
    extra,
  };
}

function indeterminate(reason, figure, criteria = [], note = null, extra = null) {
  return result({
    grade: "Indeterminate",
    lap: null,
    reason,
    criteria,
    note,
    figure,
    indeterminate: true,
    extra,
  });
}

export function ageBandForEPrime(age) {
  const years = num(age);
  if (years === null || years < 20) return null;
  if (years <= 39) return "20-39";
  if (years <= 65) return "40-65";
  return ">65";
}

export function table5EaBin(age) {
  const years = num(age);
  if (years === null || years < 20) return null;
  if (years <= 39) return "20-39";
  if (years <= 60) return "40-60";
  return "60-80";
}

function ePrimeCutoffs(input) {
  if (!input.ageSpecific) return { ...DEFAULT_E_PRIME, source: "Figure 3" };
  const band = ageBandForEPrime(input.age);
  if (!band) {
    return {
      ...DEFAULT_E_PRIME,
      source: "Figure 3",
      note: "Table 6 starts at age 20. Figure 3 cutoffs were used.",
    };
  }
  return { ...TABLE6_E_PRIME[band], source: `Table 6 (${band} y)`, band };
}

/**
 * Reduced e' (Figure 3 / Table 6).
 * Returns true, false, or null when no annulus velocity was measured.
 * A single available site is judged by its own cutoff. When both sites are
 * measured, the average is included and any abnormal site counts.
 */
export function ePrimeReduced(input) {
  const septal = num(input.septalEPrime);
  const lateral = num(input.lateralEPrime);
  const averageInput = num(input.averageEPrime);
  const average =
    septal !== null && lateral !== null ? (septal + lateral) / 2 : averageInput;
  const cut = ePrimeCutoffs(input);
  const checks = [];
  if (septal !== null) checks.push(cmp(septal, cut.septal, cut.op));
  if (lateral !== null) checks.push(cmp(lateral, cut.lateral, cut.op));
  if (average !== null && (averageInput !== null || (septal !== null && lateral !== null))) {
    checks.push(cmp(average, cut.average, cut.op));
  }
  return {
    reduced: checks.length === 0 ? null : checks.some(Boolean),
    average,
    cut,
  };
}

/** Figure 3 increased E/e': septal ≥ 15 or lateral ≥ 13 or average ≥ 14. */
export function eeIncreased(input) {
  const septal = num(input.septalEe);
  const lateral = num(input.lateralEe);
  const averageInput = num(input.averageEe);
  const average =
    septal !== null && lateral !== null ? (septal + lateral) / 2 : averageInput;
  const checks = [];
  if (septal !== null) checks.push(septal >= 15);
  if (lateral !== null) checks.push(lateral >= 13);
  if (
    average !== null &&
    (averageInput !== null || (septal !== null && lateral !== null))
  ) {
    checks.push(average >= 14);
  }
  return {
    increased: checks.length === 0 ? null : checks.some(Boolean),
    average,
  };
}

/**
 * Figure 3 TR/PASP variable.
 * When PASP is entered, RAP was estimated and PASP ≥ 35 decides.
 * Otherwise TR velocity ≥ 2.8 m/s decides.
 */
export function trPaspIncreased(input) {
  const pasp = num(input.pasp);
  const tr = num(input.tr);
  if (pasp !== null) {
    return { increased: pasp >= 35, basis: "PASP" };
  }
  if (tr !== null) {
    return { increased: tr >= 2.8, basis: "TR" };
  }
  return { increased: null, basis: null };
}

export function resolvedEa(input) {
  const e = num(input.e);
  const a = num(input.a);
  if (e !== null && a !== null && a !== 0) return e / a;
  return num(input.ea);
}

function eaIsReduced(ea, input) {
  if (ea === null) return null;
  if (!input.ageSpecific) return ea <= 0.8;
  const bin = table5EaBin(input.age);
  if (!bin) return ea <= 0.8;
  return ea < TABLE5_EA_FIFTH[bin];
}

function larsDisqualified(input) {
  if (input.significantMr) {
    return "LARS was not used because MR is significant (Table 4).";
  }
  if (input.laStunning) {
    return "LARS was not used because LA stunning is suspected (Table 4).";
  }
  const gls = num(input.gls);
  const absoluteGls = gls === null ? null : Math.abs(gls);
  if (input.lvef === "preserved" && absoluteGls !== null && absoluteGls > 18) {
    return "LARS was not used because LVEF is preserved and GLS is > 18% (Table 4).";
  }
  return null;
}

function sdRatio(input) {
  const direct = num(input.sd);
  if (direct !== null) return direct;
  const sff = num(input.systolicFillingFraction);
  if (sff === null) return null;
  // Systolic filling fraction ≤ 40% corresponds to S/D ≤ 0.67.
  // Keep the fraction available to the caller; return null here and handle SFF
  // as its own measurement so a percent is not compared with 0.67.
  return null;
}

function adjudicate(input) {
  const positives = [];
  const reliableNegatives = [];
  const notes = [];
  const larsNote = larsDisqualified(input);
  const lars = num(input.lars);
  if (lars !== null) {
    if (larsNote) notes.push(larsNote);
    else if (lars <= 18) positives.push("LARS ≤ 18%");
    else reliableNegatives.push("LARS > 18%");
  }

  const lavi = num(input.lavi);
  if (lavi !== null) {
    if (lavi > 34) positives.push("LAVi > 34 mL/m²");
    else reliableNegatives.push("LAVi ≤ 34 mL/m²");
  }

  const ivrt = num(input.ivrt);
  if (ivrt !== null) {
    if (ivrt <= 70) positives.push("IVRT ≤ 70 ms");
    else reliableNegatives.push("IVRT > 70 ms");
  }

  const sd = sdRatio(input);
  const sff = num(input.systolicFillingFraction);
  if (sd !== null && sff !== null && (sd <= 0.67) !== (sff <= 40)) {
    notes.push(
      "Pulmonary vein S/D and systolic filling fraction disagree. Figure 3 prints S/D ≤ 0.67, so S/D was used.",
    );
  }
  const sdLow = sd !== null ? sd <= 0.67 : sff !== null ? sff <= 40 : null;
  const sdHigh = sd !== null ? sd > 0.67 : sff !== null ? sff > 40 : null;
  const sdLabel =
    sd !== null
      ? "Pulmonary vein S/D ≤ 0.67"
      : "Pulmonary vein systolic filling fraction ≤ 40%";

  if (sdLow === true) {
    if (input.lvef === "reduced") {
      positives.push(sdLabel);
    } else if (input.lvef === "preserved") {
      if (ivrt !== null && ivrt <= 70) {
        notes.push(
          "Pulmonary vein S/D ≤ 0.67 (or systolic filling fraction ≤ 40%) with preserved LVEF was not used by itself. IVRT ≤ 70 ms is the confirming finding (Section 11).",
        );
      } else {
        notes.push(
          "Pulmonary vein S/D ≤ 0.67 was not treated as elevated LAP because LVEF is preserved and IVRT did not confirm it. In normal LVEF the ratio can be ≤ 0.67 without elevated LAP, and it can also be > 0.67 despite elevated LAP (Section 11).",
        );
      }
    } else if (positives.length > 0) {
      notes.push(
        "Pulmonary vein S/D ≤ 0.67 was not required for the conclusion. LVEF was not specified, and this ratio is most reliable when systolic function is reduced (Section 11).",
      );
    } else {
      notes.push(
        "Pulmonary vein S/D ≤ 0.67 was not treated as elevated LAP because LVEF was not specified. Confirm with IVRT or another second-stage parameter (Section 11).",
      );
    }
  } else if (sdHigh === true) {
    reliableNegatives.push(
      sd !== null
        ? "Pulmonary vein S/D > 0.67"
        : "Pulmonary vein systolic filling fraction > 40%",
    );
  }

  if (input.lvef === "preserved" && lars !== null && !larsNote && lars <= 18) {
    notes.push(
      "LARS ≤ 18% is specific but can be insensitive when LVEF is normal (Section 11).",
    );
  }

  return {
    positives,
    reliableNegatives,
    measuredReliable: positives.length + reliableNegatives.length > 0,
    notes,
  };
}

function supplementalMethods(input) {
  const positives = [];
  let measured = 0;
  const pr = num(input.prEdv);
  if (pr !== null) {
    measured += 1;
    if (pr >= 2) positives.push("PR end-diastolic velocity ≥ 2 m/s");
  }
  const padp = num(input.padp);
  if (padp !== null) {
    measured += 1;
    if (padp >= 16) positives.push("PA diastolic pressure ≥ 16 mm Hg");
  }
  const lWave = num(input.lWave);
  if (lWave !== null) {
    measured += 1;
    if (lWave >= 50) positives.push("Mitral L-wave velocity ≥ 50 cm/s");
  }
  const arA = num(input.arMinusA);
  if (arA !== null) {
    measured += 1;
    if (arA > 30) {
      positives.push("Ar−A duration > 30 ms");
    }
  }
  const valsalva = num(input.valsalvaEaDecreasePct);
  if (valsalva !== null) {
    measured += 1;
    if (valsalva >= 50) positives.push("E/A decreased ≥ 50% with Valsalva");
  }
  return { positives, measured };
}

function gradeElevated(ea) {
  if (ea === null) {
    return {
      grade: "Indeterminate grade",
      lap: "Increased",
      indeterminate: true,
      gradeReason:
        "LAP is increased. E/A is missing, so grade 2 (E/A < 2) cannot be separated from grade 3 (E/A ≥ 2).",
    };
  }
  if (ea >= 2) {
    return {
      grade: "Grade 3",
      lap: "Marked increase",
      indeterminate: false,
      gradeReason: "E/A is ≥ 2, so diastolic dysfunction is grade 3.",
    };
  }
  return {
    grade: "Grade 2",
    lap: "Mild to moderate increase",
    indeterminate: false,
    gradeReason: "E/A is < 2, so diastolic dysfunction is grade 2.",
  };
}

function ageSpecificNote(input, ea) {
  if (!input.ageSpecific) return null;
  const eBand = ageBandForEPrime(input.age);
  const eaBin = table5EaBin(input.age);
  const parts = [];
  if (eBand) parts.push(`e' limits follow Table 6 for age ${eBand}`);
  else parts.push("age is under 20 or missing, so Figure 3 e' limits were kept");
  if (eaBin && ea !== null) {
    parts.push(
      `the Table 5 fifth-percentile E/A floor for ${eaBin} years is ${TABLE5_EA_FIFTH[eaBin]} (abnormal when strictly below it)`,
    );
  }
  if (num(input.age) !== null && num(input.age) > 80) {
    parts.push("Table 5 does not publish a bin older than 60–80 years; that floor was used");
  }
  return `Age-specific mode: ${parts.join("; ")}.`;
}

/**
 * Figure 2. Presence of LV diastolic dysfunction.
 * Step 2 uses average E/e' > 14 (strict), which is not the Figure 3 LAP cutoff.
 */
export function assessDiastolicDysfunction(input) {
  const e = ePrimeReduced(input);
  const markers = [];
  const unknown = [];
  const ee = eeIncreased(input);
  if (ee.average === null) unknown.push("average E/e'");
  else if (ee.average > 14) markers.push("average E/e' > 14");

  const lars = num(input.lars);
  if (lars === null) unknown.push("LARS");
  else if (lars <= 18 && !larsDisqualified(input)) markers.push("LARS ≤ 18%");

  const ea = resolvedEa(input);
  if (ea === null) unknown.push("E/A");
  else if (ea >= 2) markers.push("E/A ≥ 2");
  else if (eaIsReduced(ea, input)) {
    markers.push(input.ageSpecific ? "E/A below the age-specific floor" : "E/A ≤ 0.8");
  }

  const lavi = num(input.lavi);
  if (lavi === null) unknown.push("LAVi");
  else if (lavi > 34) markers.push("LAVi > 34 mL/m²");

  const mass = num(input.lvMassIndex);
  if (mass !== null && (input.sex === "female" || input.sex === "male")) {
    const cut = input.sex === "female" ? 95 : 115;
    if (mass > cut) markers.push(`LV mass index > ${cut} g/m²`);
  }

  if (e.reduced === null) {
    return { present: null, markers, reason: "e' was not measured, so Figure 2 cannot be applied." };
  }
  const need = e.reduced ? 1 : 2;
  if (markers.length >= need) {
    return {
      present: true,
      markers,
      reason: e.reduced
        ? `e' is reduced and at least one Step 2 marker is present (${markers.join("; ")}).`
        : `e' is not reduced and at least two Step 2 markers are present (${markers.join("; ")}).`,
    };
  }
  if (markers.length + unknown.length >= need && unknown.length > 0) {
    return {
      present: null,
      markers,
      reason: "Figure 2 is incomplete because one or more Step 2 markers were not measured.",
    };
  }
  return {
    present: false,
    markers,
    reason: "Figure 2 criteria for diastolic dysfunction are not met.",
  };
}

export function assessStandard(input = {}) {
  const e = ePrimeReduced(input);
  const ee = eeIncreased(input);
  const tr = trPaspIncreased(input);
  const ea = resolvedEa(input);
  const criteria = [];
  const core = [
    ["e'", e.reduced, "Reduced e' velocity"],
    ["E/e'", ee.increased, "Increased E/e' ratio"],
    ["TR/PASP", tr.increased, tr.basis === "PASP" ? "PASP ≥ 35 mm Hg" : "TR velocity ≥ 2.8 m/s"],
  ];
  const abnormal = core.filter(([, status]) => status === true);
  const missing = core.filter(([, status]) => status === null);
  abnormal.forEach(([, , label]) => criteria.push(label));

  if (core.every(([, status]) => status === null) && ea === null) {
    return indeterminate(
      "No measurements entered. An empty field is not a normal value.",
      "Figure 3",
    );
  }
  if (abnormal.length === 0 && missing.length === 3) {
    return indeterminate(
      "The three Figure 3 core variables were not measured, so diastolic function cannot be called normal.",
      "Figure 3",
    );
  }

  const dd = assessDiastolicDysfunction(input);
  const ageNote = ageSpecificNote(input, ea);

  if (abnormal.length === 0 && missing.length === 0) {
    const figure2Note =
      dd.present === true
        ? `Figure 3 classifies this study as normal diastolic function because e', E/e', and TR/PASP are all normal. Figure 2 is also positive: ${dd.reason} TR velocity is not a Figure 2 marker. Report both and reconcile them.`
        : null;
    return result({
      grade: "Normal diastolic function",
      lap: "Normal",
      reason:
        "e' is not reduced, E/e' is not increased, and TR velocity/PASP is not increased (Figure 3, all normal).",
      criteria,
      note: [ageNote, figure2Note].filter(Boolean).join(" ") || null,
      figure: "Figure 3",
      extra: { figure2: dd },
    });
  }

  if (abnormal.length >= 3) {
    const graded = gradeElevated(ea);
    return result({
      grade: graded.grade,
      lap: graded.lap,
      reason: `All three core variables are abnormal. ${graded.gradeReason}`,
      criteria,
      note: ageNote,
      figure: "Figure 3",
      indeterminate: graded.indeterminate,
      extra: { figure2: dd },
    });
  }

  if (abnormal.length === 1 && missing.length > 0) {
    return indeterminate(
      "One core variable is abnormal and another was not measured. Figure 3 uses a different branch for a single abnormality than for two abnormalities, so LAP cannot be assigned.",
      "Figure 3",
      criteria,
      ageNote,
    );
  }

  if (abnormal.length === 0 && missing.length > 0) {
    return indeterminate(
      "No core variable is abnormal, but at least one was not measured. Figure 3 calls diastolic function normal only when all three are normal.",
      "Figure 3",
      criteria,
      ageNote,
    );
  }

  const onlyReducedE =
    abnormal.length === 1 && abnormal[0][0] === "e'" && missing.length === 0;

  if (onlyReducedE) {
    const low = eaIsReduced(ea, input);
    if (low === null) {
      return indeterminate(
        "Only e' is reduced. E/A is required: an E/A at or below the low cutoff is grade 1 with normal LAP, and a higher E/A needs LARS, pulmonary vein S/D, LAVi, or IVRT.",
        "Figure 3",
        criteria,
        ageNote,
      );
    }
    if (low === true) {
      const lowLabel = input.ageSpecific
        ? "E/A is below the Table 5 age-specific floor"
        : "E/A ≤ 0.8";
      return result({
        grade: "Grade 1",
        lap: "Normal",
        reason: `Only e' is reduced, E/e' and TR/PASP are not increased, and ${lowLabel}.`,
        criteria: [...criteria, lowLabel],
        note: ageNote,
        figure: "Figure 3",
        extra: { figure2: dd },
      });
    }
  }

  return resolveSecondStage(input, criteria, ea, dd, ageNote);
}

function resolveSecondStage(input, criteria, ea, dd, ageNote) {
  const adj = adjudicate(input);
  if (adj.positives.length > 0) {
    const graded = gradeElevated(ea);
    return result({
      grade: graded.grade,
      lap: graded.lap,
      reason: `Core findings are inconclusive and at least one second-stage parameter meets the elevated-LAP cutoff. ${graded.gradeReason}`,
      criteria: [...criteria, ...adj.positives],
      note: [ageNote, ...adj.notes].filter(Boolean).join(" ") || null,
      figure: "Figure 3",
      indeterminate: graded.indeterminate,
      extra: { figure2: dd },
    });
  }

  if (adj.measuredReliable) {
    const ddNote =
      dd.present === true
        ? `LAP is normal by Figure 3. Figure 2 diastolic dysfunction is present (${dd.reason}). This is not grade 1 unless the only abnormality is reduced e' with a low E/A, and it is not grade 2 or 3 because LAP is not elevated.`
        : null;
    const single =
      adj.reliableNegatives.length === 1
        ? "Only one second-stage parameter was measured. Figure 3 treats the absence of an abnormal adjudicator as normal LAP; concordance of two or more adjudicators is more secure."
        : null;
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason:
        "Core findings are inconclusive, and every reliable second-stage parameter that was measured is below the elevated-LAP cutoff. This is not grade 1. Grade 1 requires reduced e' as the only core abnormality plus a low E/A.",
      criteria,
      note: [ageNote, ddNote, single, ...adj.notes]
        .filter(Boolean)
        .join(" "),
      figure: "Figure 3",
      extra: { figure2: dd },
    });
  }

  const supp = supplementalMethods(input);
  if (supp.positives.length > 0) {
    const graded = gradeElevated(ea);
    const arNote = supp.positives.some((item) => item.startsWith("Ar−A"))
      ? "Ar−A duration > 30 ms indicates elevated LV end-diastolic pressure, which can exist while mean LAP is still normal (Section 5 and Table 2). Figure 3 still lists it among supplemental methods when the second-stage parameters are unavailable."
      : null;
    return result({
      grade: graded.grade,
      lap: graded.lap,
      reason: `Second-stage parameters were unavailable or unreliable. A Figure 3 supplemental method is positive. ${graded.gradeReason}`,
      criteria: [...criteria, ...supp.positives],
      note: [ageNote, ...adj.notes, arNote].filter(Boolean).join(" ") || null,
      figure: "Figure 3 footnote",
      indeterminate: graded.indeterminate,
      extra: { figure2: dd },
    });
  }

  return indeterminate(
    "Core findings are inconclusive, and LARS, pulmonary vein S/D, LAVi, and IVRT were not available as reliable measurements. Supplemental methods (PR end-diastolic velocity, PA diastolic pressure, L-wave, Ar−A, Valsalva) were also not positive. LAP is not called normal when those data are missing.",
    "Figure 3",
    criteria,
    [ageNote, ...adj.notes].filter(Boolean).join(" ") || null,
  );
}

function afibCore(input) {
  const items = [];
  const e = num(input.e);
  items.push({
    name: "Mitral E velocity ≥ 100 cm/s",
    value: e === null ? null : e >= 100,
  });
  const septalEe = num(input.septalEe);
  items.push({
    name: "Septal E/e' > 11",
    value: septalEe === null ? null : septalEe > 11,
  });
  const tr = num(input.tr);
  const pasp = num(input.pasp);
  items.push({
    name: "TR velocity > 2.8 m/s or PASP > 35 mm Hg",
    value:
      tr === null && pasp === null
        ? null
        : (tr !== null && tr > 2.8) || (pasp !== null && pasp > 35),
  });
  const dt = num(input.dt);
  items.push({
    name: "DT ≤ 160 ms",
    value: dt === null ? null : dt <= 160,
  });
  return items;
}

function afibSupplemental(input) {
  const items = [];
  const lars = num(input.lars);
  items.push({ name: "LARS < 18%", value: lars === null ? null : lars < 18 });
  const sd = num(input.sd);
  items.push({
    name: "Pulmonary vein S/D < 1",
    value: sd === null ? null : sd < 1,
  });
  const bmi = num(input.bmi);
  items.push({ name: "BMI > 30 kg/m²", value: bmi === null ? null : bmi > 30 });
  return items;
}

export function assessAfib(input = {}) {
  const core = afibCore(input);
  const positive = core.filter((item) => item.value === true);
  const unknown = core.filter((item) => item.value === null);
  const criteria = positive.map((item) => item.name);
  const dtNote =
    positive.some((item) => item.name.startsWith("DT")) && input.lvef !== "reduced"
      ? "Figure 8 counts DT ≤ 160 ms without an EF restriction. Table 7 lists DT < 160 ms only in depressed LVEF. This result follows Figure 8."
      : null;
  const septalNote =
    num(input.septalEe) === 11
      ? "Septal E/e' of exactly 11 is not > 11, so Figure 8 does not count it. Table 7 prints septal E/e' ≥ 11."
      : null;

  if (positive.length === 0 && unknown.length === core.length) {
    return indeterminate(
      "No atrial-fibrillation measurements entered. An empty field is not a normal value.",
      "Figure 8",
    );
  }
  if (positive.length >= 3) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Three or more Figure 8 core criteria are positive.",
      criteria,
      note: [dtNote, septalNote].filter(Boolean).join(" ") || null,
      figure: "Figure 8",
    });
  }

  if (positive.length === 2) {
    const supp = afibSupplemental(input);
    const suppPos = supp.filter((item) => item.value === true);
    const suppUnknown = supp.filter((item) => item.value === null);
    const names = [...criteria, ...suppPos.map((item) => item.name)];
    if (unknown.length > 0 && suppPos.length < 2) {
      return indeterminate(
        "Two core criteria are positive and another core variable was not measured, so this study could fall in the three-or-more branch. It is not called normal.",
        "Figure 8",
        names,
        [dtNote, septalNote].filter(Boolean).join(" ") || null,
      );
    }
    if (suppPos.length >= 2) {
      return result({
        grade: "Elevated LAP",
        lap: "Elevated",
        reason: "Two core criteria are positive and at least two supplemental criteria are positive.",
        criteria: names,
        note: [dtNote, septalNote].filter(Boolean).join(" ") || null,
        figure: "Figure 8",
      });
    }
    if (suppPos.length === 1) {
      return indeterminate(
        "Two core criteria are positive and only one supplemental criterion is positive (Figure 8).",
        "Figure 8",
        names,
        [dtNote, septalNote].filter(Boolean).join(" ") || null,
      );
    }
    if (suppUnknown.length > 0) {
      return indeterminate(
        "Two core criteria are positive, and the supplemental criteria are missing, incomplete, or not reliable (Figure 8: 1 only, or not available, or not reliable).",
        "Figure 8",
        criteria,
        [dtNote, septalNote].filter(Boolean).join(" ") || null,
      );
    }
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "Two core criteria are positive and all three supplemental criteria are negative.",
      criteria,
      note: [dtNote, septalNote].filter(Boolean).join(" ") || null,
      figure: "Figure 8",
    });
  }

  if (unknown.length > 0) {
    return indeterminate(
      "Fewer than two core criteria are positive, but not every core variable was measured. Figure 8 calls LAP normal only when none or one criterion is positive after the variables have been assessed.",
      "Figure 8",
      criteria,
      [dtNote, septalNote].filter(Boolean).join(" ") || null,
    );
  }
  return result({
    grade: "Normal LAP",
    lap: "Normal",
    reason:
      positive.length === 0
        ? "All four Figure 8 core criteria were measured and none is positive."
        : "All four Figure 8 core criteria were measured and only one is positive.",
    criteria,
    note: [dtNote, septalNote].filter(Boolean).join(" ") || null,
    figure: "Figure 8",
  });
}

export function assessMac(input = {}) {
  const ea = resolvedEa(input);
  if (ea === null) {
    return indeterminate("E/A was not measured (Figure 4).", "Figure 4");
  }
  if (ea < 0.8) {
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "In moderate or severe MAC, E/A < 0.8 usually means LAP is normal.",
      figure: "Figure 4",
    });
  }
  if (ea > 1.8) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "In moderate or severe MAC, E/A > 1.8 usually means LAP is elevated.",
      figure: "Figure 4",
    });
  }
  const ivrt = num(input.ivrt);
  if (ivrt === null) {
    return indeterminate(
      "E/A is 0.8 to 1.8, inclusive. IVRT is required and was not measured. A missing IVRT is not treated as ≥ 80 ms.",
      "Figure 4",
    );
  }
  if (ivrt >= 80) {
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "E/A is 0.8 to 1.8 and IVRT is ≥ 80 ms, so LAP is usually normal.",
      criteria: ["IVRT ≥ 80 ms"],
      figure: "Figure 4",
    });
  }
  return result({
    grade: "Elevated LAP",
    lap: "Elevated",
    reason: "E/A is 0.8 to 1.8 and IVRT is < 80 ms, so LAP is elevated.",
    criteria: ["IVRT < 80 ms"],
    figure: "Figure 4",
  });
}

function phLarsNote(lars) {
  if (lars > 16 && lars <= 18) {
    return "Figure 6 classifies LARS ≤ 18% as elevated LAP. Key Point 4 uses LARS ≤ 16%, the PH prose cites LARS < 16%, and Table 7 cites LARS < 18%. This value is abnormal on Figure 6 and would not meet the ≤ 16% or < 16% wording.";
  }
  return null;
}

function phIntermediate(input, lead) {
  const lars = num(input.lars);
  if (lars !== null) {
    if (lars <= 18) {
      return result({
        grade: "Elevated LAP",
        lap: "Elevated",
        reason: `${lead} LARS is ≤ 18%, which favors elevated LAP / group II PH (Figure 6).`,
        criteria: ["LARS ≤ 18%"],
        note: phLarsNote(lars),
        figure: "Figure 6",
      });
    }
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: `${lead} LARS is > 18% (Figure 6).`,
      figure: "Figure 6",
    });
  }
  const lateralEe = num(input.lateralEe);
  if (lateralEe === null) {
    return indeterminate(
      `${lead} LARS was not measured, and lateral E/e' was not measured. Figure 6 cannot be completed. LAVi > 34 mL/m² is a Table 7 clue but is not a branch on Figure 6.`,
      "Figure 6",
    );
  }
  if (lateralEe < 8) {
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: `${lead} LARS is unavailable and lateral E/e' is < 8.`,
      figure: "Figure 6",
    });
  }
  if (lateralEe > 13) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: `${lead} LARS is unavailable and lateral E/e' is > 13.`,
      figure: "Figure 6",
    });
  }
  return indeterminate(
    `${lead} LARS is unavailable and lateral E/e' is ${lateralEe}. Figure 6 calls ratios > 8 and < 13 indeterminate. Exactly 8 and exactly 13 are outside both the normal (< 8) and elevated (> 13) branches. The prose says values in the range of 8 to 13 have little association with filling pressure, so those exact bounds are reported as indeterminate rather than normal or elevated.`,
    "Figure 6",
  );
}

export function assessPh(input = {}) {
  const ea = resolvedEa(input);
  if (ea === null) {
    return indeterminate(
      "E/A is required for the pulmonary-hypertension algorithm (Figure 6).",
      "Figure 6",
    );
  }
  const e = num(input.e);
  const reduced = ePrimeReduced(input).reduced;
  if (ea <= 0.8) {
    if (e === null) {
      return indeterminate(
        "E/A is ≤ 0.8. Mitral E velocity is required: E ≤ 50 cm/s is normal LAP, and E > 50 cm/s is the intermediate path (Figure 6). Table 7 favors precapillary PH from E/A ≤ 0.8 alone and does not use the E ≤ 50 cm/s split.",
        "Figure 6",
      );
    }
    if (e <= 50) {
      return result({
        grade: "Normal LAP",
        lap: "Normal",
        reason: "E/A ≤ 0.8 and mitral E ≤ 50 cm/s (Figure 6).",
        note: "Table 7 says E/A ≤ 0.8 favors precapillary PH and does not require E ≤ 50 cm/s. This result follows Figure 6.",
        figure: "Figure 6",
      });
    }
    return phIntermediate(input, "E/A is ≤ 0.8 and mitral E is > 50 cm/s.");
  }
  if (ea >= 2) {
    if (reduced === null) {
      return indeterminate(
        "E/A is ≥ 2, but e' was not measured. Figure 6 assigns elevated LAP only when e' is also reduced. Table 7 and Key Point 2 favor postcapillary PH from E/A ≥ 2 without that requirement.",
        "Figure 6",
        [],
        "Do not report elevated LAP from E/A alone unless you are deliberately applying Table 7 rather than Figure 6.",
      );
    }
    if (reduced === true) {
      return result({
        grade: "Elevated LAP",
        lap: "Elevated",
        reason: "E/A is ≥ 2 and e' is reduced (Figure 6).",
        criteria: ["Reduced e'"],
        note: "In pulmonary hypertension, septal flattening can lower septal e'. Lateral e' is the preferred annulus for E/e' (Section 15.C). Reduced e' here uses the Figure 3 site cutoffs because Figure 6 does not publish a separate number.",
        figure: "Figure 6",
      });
    }
    return indeterminate(
      "E/A is ≥ 2 but e' is not reduced. The elevated branch of Figure 6 requires both. Table 7 and Key Point 2 say E/A ≥ 2 favors postcapillary PH without an e' requirement. The two statements are not the same, so LAP is indeterminate.",
      "Figure 6",
    );
  }
  return phIntermediate(input, "E/A is > 0.8 and < 2.");
}

function averageOnly(input) {
  const septal = num(input.septalEe);
  const lateral = num(input.lateralEe);
  const average = num(input.averageEe);
  if (average !== null) return average;
  if (septal !== null && lateral !== null) return (septal + lateral) / 2;
  return null;
}

export function assessHtx(input = {}) {
  const ee = averageOnly(input);
  if (ee === null) {
    return indeterminate(
      "Average E/e' is required. A single annulus is not the average (Figure 5 / Table 7).",
      "Figure 5",
    );
  }
  if (ee < 7) {
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "Average E/e' is < 7.",
      figure: "Figure 5",
    });
  }
  if (ee > 14) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Average E/e' is > 14.",
      figure: "Figure 5",
    });
  }
  const boundary =
    ee === 7 || ee === 14
      ? "Table 7 writes the middle branch as average E/e' > 7 and < 14. Exactly 7 is not < 7, and exactly 14 is not > 14, so neither definite branch applies. The key point says “between 7 and 14,” and this value is sent down that middle path."
      : null;
  const sr = num(input.eSrIvr);
  if (sr !== null) {
    if (sr <= 200) {
      return result({
        grade: "Normal LAP",
        lap: "Normal",
        reason: "Average E/e' is intermediate and E/SRIVR is ≤ 200 cm.",
        note: boundary,
        figure: "Figure 5",
      });
    }
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Average E/e' is intermediate and E/SRIVR is > 200 cm.",
      note: boundary,
      figure: "Figure 5",
    });
  }
  const tr = num(input.tr);
  if (tr === null) {
    return indeterminate(
      "Average E/e' is intermediate. E/SRIVR was not measured, and TR velocity was not measured.",
      "Figure 5",
      [],
      boundary,
    );
  }
  if (tr <= 2.8) {
    return result({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "E/SRIVR is unavailable and TR velocity is ≤ 2.8 m/s.",
      note: boundary,
      figure: "Figure 5",
    });
  }
  return result({
    grade: "Elevated LAP",
    lap: "Elevated",
    reason: "E/SRIVR is unavailable and TR velocity is > 2.8 m/s.",
    note: boundary,
    figure: "Figure 5",
  });
}

export function assessTeer(input = {}) {
  const velocity = num(input.velocity);
  const rap = num(input.rap);
  if (velocity === null || rap === null) {
    return indeterminate(
      "Enter the peak transseptal velocity in m/s and RAP in mm Hg. LAP = 4V² + RAP.",
      "Section 15.A.d",
    );
  }
  const lapValue = Math.round((4 * velocity * velocity + rap) * 10) / 10;
  if (input.biventricularHf) {
    return result({
      grade: "Indeterminate",
      lap: null,
      reason: `The Bernoulli estimate is ${lapValue} mm Hg, but interatrial velocity is not a reliable LAP estimate in biventricular heart failure.`,
      figure: "Section 15.A.d",
      indeterminate: true,
      extra: { lapValue },
    });
  }
  const byVelocity = velocity > 1.7;
  const byPressure = lapValue > 15;
  if (byVelocity || byPressure) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: `Estimated LAP is ${lapValue} mm Hg (4V² + RAP). ${
        byVelocity
          ? "Transseptal velocity is > 1.7 m/s, which the text says usually means LAP is elevated."
          : "Transseptal velocity is not > 1.7 m/s, but the calculated LAP is still > 15 mm Hg."
      }`,
      note: "Table 1 defines elevated resting mean PCWP as > 15 mm Hg. The velocity shortcut and the calculated pressure can disagree when RAP is unusually high or low.",
      figure: "Section 15.A.d",
      extra: { lapValue },
    });
  }
  return result({
    grade: "LAP not elevated by this estimate",
    lap: "Not elevated",
    reason: `Estimated LAP is ${lapValue} mm Hg, which is not > 15, and transseptal velocity is not > 1.7 m/s.`,
    figure: "Section 15.A.d",
    extra: { lapValue },
  });
}

export function assessConductionTr(input = {}) {
  const tr = num(input.tr);
  if (tr === null) {
    return indeterminate(
      "When only a mitral A wave is present, the key point uses peak TR velocity > 2.8 m/s as the filling-pressure indicator. TR was not measured. LARS has not been validated for this setting.",
      "Section 15.D",
    );
  }
  if (tr > 2.8) {
    return result({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Only mitral A velocity is present and TR velocity is > 2.8 m/s.",
      note: "Septal and average E/e' are less accurate with left bundle branch block, right-ventricular pacing, and cardiac resynchronization therapy. Lateral E/e' may still be usable, but the document does not provide a cutoff for that setting.",
      figure: "Section 15.D",
    });
  }
  return result({
    grade: "Elevated LAP not shown",
    lap: null,
    reason:
      "TR velocity is not > 2.8 m/s. That is the only numeric indicator given for a uniphasic A wave. A lower velocity does not prove that LAP is normal.",
    note: "Exactly 2.8 m/s does not meet the strict > 2.8 m/s key point.",
    figure: "Section 15.D",
    indeterminate: true,
  });
}

export function listIndicators(checked, catalog) {
  const present = catalog.filter((_, index) => checked[index]);
  return result({
    grade: present.length ? "Indicators recorded" : "No indicators marked",
    reason:
      "Table 7 (or the matching narrative list) names findings associated with elevated LV filling pressure. It does not say how many are required, so this list is not converted into a normal or elevated grade.",
    criteria: present,
    figure: "Table 7",
  });
}
