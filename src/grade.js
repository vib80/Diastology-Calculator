/**
 * Bedside finding grades for the 2025 ASE update.
 *
 * Each finding is "present", "absent", or "unknown" (not measured).
 * Unknown is never treated as absent. Cutoffs and branch choices match the
 * checkbox algorithm: only the measured states are used, and a branch whose
 * required findings are unknown stays indeterminate.
 */

export function findingState(value) {
  if (value === "present" || value === true) return "present";
  if (value === "absent" || value === false) return "absent";
  return "unknown";
}

export function countPresent(input, keys) {
  return keys.filter((key) => findingState(input[key]) === "present").length;
}

function withState(defs, input) {
  return defs.map((item) => ({ ...item, state: findingState(input[item.key]) }));
}

function report(fields) {
  return {
    grade: "Indeterminate",
    lap: null,
    reason: "",
    criteria: [],
    note: null,
    figure: "",
    indeterminate: false,
    missing: [],
    ...fields,
  };
}

function indeterminate(reason, missing, extra = {}) {
  return report({
    indeterminate: true,
    reason,
    missing,
    ...extra,
  });
}

function eaBand(input) {
  if (!input.eaBand || input.eaBand === "unknown") return "unknown";
  return input.eaBand;
}

const STANDARD_CORE = [
  { key: "eReduced", missing: "Reduced e'", criterion: "Reduced e' velocity" },
  { key: "eeIncreased", missing: "Increased E/e'", criterion: "Increased E/e' ratio" },
  {
    key: "trIncreased",
    missing: "TR velocity or PASP",
    criterion: "TR velocity ≥ 2.8 m/s or PASP ≥ 35 mm Hg",
  },
];

const STANDARD_SECOND = [
  { key: "larsLow", missing: "LARS", criterion: "LARS ≤ 18%" },
  { key: "sdLow", missing: "Pulmonary vein S/D", criterion: "Pulmonary vein S/D ≤ 0.67" },
  { key: "laviHigh", missing: "LAVi", criterion: "LAVi > 34 mL/m²" },
  { key: "ivrtShort", missing: "IVRT", criterion: "IVRT ≤ 70 ms" },
];

const AFIB_CORE = [
  { key: "afibE", missing: "Mitral E velocity", criterion: "Mitral E velocity ≥ 100 cm/s" },
  { key: "afibEe", missing: "Septal E/e'", criterion: "Septal E/e' > 11" },
  {
    key: "afibTr",
    missing: "TR velocity or PASP",
    criterion: "TR velocity > 2.8 m/s or PASP > 35 mm Hg",
  },
  { key: "afibDt", missing: "Deceleration time", criterion: "Deceleration time ≤ 160 ms" },
];

const AFIB_SUPP = [
  { key: "afibLars", missing: "LARS", criterion: "LARS < 18%" },
  { key: "afibSd", missing: "Pulmonary vein S/D", criterion: "Pulmonary vein S/D < 1" },
  { key: "afibBmi", missing: "BMI", criterion: "BMI > 30 kg/m²" },
];

export function needsSecond(input) {
  const core = withState(STANDARD_CORE, input);
  if (core.some((item) => item.state === "unknown")) return false;
  const present = core.filter((item) => item.state === "present").length;
  if (present === 0 || present === 3) return false;
  const ea = eaBand(input);
  const onlyReducedE = present === 1 && core[0].state === "present";
  if (onlyReducedE && (ea === "unknown" || ea === "le08")) return false;
  return true;
}

export function gradeStandard(input = {}) {
  const core = withState(STANDARD_CORE, input);
  const present = core.filter((item) => item.state === "present");
  const unknown = core.filter((item) => item.state === "unknown");
  const criteria = present.map((item) => item.criterion);
  const ea = eaBand(input);

  const byEa = (lead) => {
    if (ea === "ge2") {
      return report({
        grade: "Grade 3",
        lap: "Marked increase",
        reason: `${lead} E/A is ≥ 2.`,
        criteria,
      });
    }
    if (ea === "le08" || ea === "mid") {
      return report({
        grade: "Grade 2",
        lap: "Mild to moderate increase",
        reason: `${lead} E/A is < 2.`,
        criteria,
      });
    }
    return report({
      grade: "Indeterminate grade",
      lap: "Increased",
      reason: `${lead} E/A was not measured, so grade 2 cannot be separated from grade 3.`,
      criteria,
      indeterminate: true,
      missing: ["E/A ratio"],
    });
  };

  if (present.length === 0 && unknown.length === core.length) {
    return indeterminate(
      "No core findings have been measured. An unmeasured finding is not counted as normal.",
      unknown.map((item) => item.missing),
    );
  }
  if (present.length === 0 && unknown.length > 0) {
    return indeterminate(
      "No measured core finding is abnormal. Diastolic function is normal only when e', E/e', and TR velocity or PASP are all measured and normal.",
      unknown.map((item) => item.missing),
    );
  }
  if (unknown.length > 0) {
    return indeterminate(
      "A core finding is abnormal and another core finding was not measured, so one abnormality cannot be separated from two.",
      unknown.map((item) => item.missing),
      { criteria },
    );
  }
  if (present.length === 0) {
    return report({
      grade: "Normal diastolic function",
      lap: "Normal",
      reason: "e', E/e', and TR velocity or PASP are not increased.",
    });
  }
  if (present.length === 3) return byEa("All three core findings are abnormal.");
  if (present.length === 1 && core[0].state === "present" && ea === "le08") {
    return report({
      grade: "Grade 1",
      lap: "Normal",
      reason: "Only e' is reduced, and E/A is ≤ 0.8.",
      criteria: [...criteria, "E/A ≤ 0.8"],
    });
  }
  if (present.length === 1 && core[0].state === "present" && ea === "unknown") {
    return indeterminate(
      "Only e' is reduced. E/A was not measured: ≤ 0.8 is grade 1, and a higher E/A uses the second-stage findings.",
      ["E/A ratio"],
      { criteria },
    );
  }

  const second = withState(STANDARD_SECOND, input);
  const secondPresent = second.filter((item) => item.state === "present");
  const secondAbsent = second.filter((item) => item.state === "absent");
  const secondUnknown = second.filter((item) => item.state === "unknown");
  if (secondPresent.length > 0) {
    const graded = byEa("A second-stage finding is abnormal.");
    graded.criteria = [...criteria, ...secondPresent.map((item) => item.criterion)];
    return graded;
  }
  if (secondAbsent.length > 0) {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason:
        "The core findings do not establish elevated LAP, and every second-stage finding that was measured is not abnormal. This is not grade 1.",
      criteria,
      note: secondUnknown.length
        ? "Unmeasured second-stage findings were not counted as normal."
        : null,
    });
  }
  return indeterminate(
    "The core findings are inconclusive, and LARS, pulmonary vein S/D, LAVi, and IVRT were not measured. Unmeasured second-stage findings are not counted as normal.",
    secondUnknown.map((item) => item.missing),
    { criteria },
  );
}

export function gradeAfib(input = {}) {
  const core = withState(AFIB_CORE, input);
  const supp = withState(AFIB_SUPP, input);
  const positive = core.filter((item) => item.state === "present");
  const unknown = core.filter((item) => item.state === "unknown");
  const criteria = positive.map((item) => item.criterion);

  if (positive.length === 0 && unknown.length === core.length) {
    return indeterminate(
      "No atrial fibrillation findings have been measured. An unmeasured finding is not counted as normal.",
      core.map((item) => item.missing),
    );
  }
  if (positive.length >= 3) {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Three or more core criteria are positive.",
      criteria,
    });
  }
  if (positive.length === 2) {
    const suppPos = supp.filter((item) => item.state === "present");
    const suppUnknown = supp.filter((item) => item.state === "unknown");
    const names = [...criteria, ...suppPos.map((item) => item.criterion)];
    if (unknown.length > 0 && suppPos.length < 2) {
      return indeterminate(
        "Two core criteria are positive and another core finding was not measured, so this study could still meet three or more core criteria. It is not called normal.",
        [...unknown.map((item) => item.missing), ...suppUnknown.map((item) => item.missing)],
        { criteria: names },
      );
    }
    if (suppPos.length >= 2) {
      return report({
        grade: "Elevated LAP",
        lap: "Elevated",
        reason: "Two core criteria are positive and at least two supplemental criteria are positive.",
        criteria: names,
      });
    }
    if (suppPos.length === 1 && suppUnknown.length === 0) {
      return report({
        grade: "Indeterminate",
        lap: null,
        reason: "Two core criteria are positive and only one supplemental criterion is positive.",
        criteria: names,
        indeterminate: true,
      });
    }
    if (suppUnknown.length > 0) {
      return indeterminate(
        suppPos.length === 1
          ? "Two core criteria are positive and only one supplemental criterion is positive. The other supplemental findings were not measured."
          : "Two core criteria are positive, and the supplemental findings were not measured. They are not counted as normal.",
        suppUnknown.map((item) => item.missing),
        { criteria: names },
      );
    }
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "Two core criteria are positive and all three supplemental criteria are negative.",
      criteria,
    });
  }
  if (unknown.length > 0) {
    return indeterminate(
      "Fewer than two core criteria are positive, but not every core finding was measured. LAP is normal only when none or one criterion is positive after every core finding has been measured.",
      unknown.map((item) => item.missing),
      { criteria },
    );
  }
  return report({
    grade: "Normal LAP",
    lap: "Normal",
    reason:
      positive.length === 0
        ? "All four core criteria were measured and none is positive."
        : "All four core criteria were measured and only one is positive.",
    criteria,
  });
}

export function gradeMac(input = {}) {
  const ea = input.macEa;
  if (!ea || ea === "unknown") {
    return indeterminate("E/A was not measured.", ["E/A ratio"]);
  }
  if (ea === "low") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "In moderate or severe MAC, E/A < 0.8 usually means LAP is normal.",
    });
  }
  if (ea === "high") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "In moderate or severe MAC, E/A > 1.8 usually means LAP is elevated.",
    });
  }
  const ivrt = findingState(input.macIvrtShort);
  if (ivrt === "unknown") {
    return indeterminate(
      "E/A is 0.8 to 1.8. IVRT was not measured, and a missing IVRT is not treated as ≥ 80 ms.",
      ["IVRT"],
    );
  }
  if (ivrt === "present") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "E/A is 0.8 to 1.8 and IVRT is < 80 ms, so LAP is elevated.",
      criteria: ["IVRT < 80 ms"],
    });
  }
  return report({
    grade: "Normal LAP",
    lap: "Normal",
    reason: "E/A is 0.8 to 1.8 and IVRT is ≥ 80 ms, so LAP is usually normal.",
    criteria: ["IVRT ≥ 80 ms"],
  });
}

export function gradePh(input = {}) {
  if (!input.phPath || input.phPath === "unknown") {
    return indeterminate("Mitral filling was not measured.", ["Mitral filling"]);
  }
  if (input.phPath === "normal") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "E/A ≤ 0.8 and E ≤ 50 cm/s.",
    });
  }
  if (input.phPath === "high") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "E/A ≥ 2 and e' is reduced.",
    });
  }
  const lars = findingState(input.phLarsLow);
  if (lars === "present") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "The mitral filling pattern is intermediate and LARS is ≤ 18%.",
      criteria: ["LARS ≤ 18%"],
    });
  }
  if (lars === "absent") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "The mitral filling pattern is intermediate and LARS is > 18%.",
    });
  }
  if (!input.phEe || input.phEe === "unknown") {
    return indeterminate("LARS was not measured, and lateral E/e' was not measured.", [
      "LARS",
      "Lateral E/e'",
    ]);
  }
  if (input.phEe === "low") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "LARS was not measured and lateral E/e' is < 8.",
    });
  }
  if (input.phEe === "high") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "LARS was not measured and lateral E/e' is > 13.",
    });
  }
  return report({
    grade: "Indeterminate",
    indeterminate: true,
    reason: "LARS was not measured and lateral E/e' is 8 to 13.",
  });
}

export function gradeHtx(input = {}) {
  if (!input.htxEe || input.htxEe === "unknown") {
    return indeterminate(
      "Average E/e' was not measured. A single annulus is not the average.",
      ["Average E/e'"],
    );
  }
  if (input.htxEe === "low") {
    return report({ grade: "Normal LAP", lap: "Normal", reason: "Average E/e' is < 7." });
  }
  if (input.htxEe === "high") {
    return report({ grade: "Elevated LAP", lap: "Elevated", reason: "Average E/e' is > 14." });
  }
  const sr = findingState(input.htxSrHigh);
  if (sr === "present") {
    return report({
      grade: "Elevated LAP",
      lap: "Elevated",
      reason: "Average E/e' is intermediate and E/SRIVR is > 200 cm.",
    });
  }
  if (sr === "absent") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "Average E/e' is intermediate and E/SRIVR is ≤ 200 cm.",
    });
  }
  const tr = findingState(input.htxTrHigh);
  if (tr === "unknown") {
    return indeterminate(
      "Average E/e' is intermediate. E/SRIVR was not measured, and TR velocity was not measured.",
      ["E/SRIVR", "TR velocity"],
    );
  }
  if (tr === "absent") {
    return report({
      grade: "Normal LAP",
      lap: "Normal",
      reason: "E/SRIVR is unavailable and TR velocity is ≤ 2.8 m/s.",
    });
  }
  return report({
    grade: "Elevated LAP",
    lap: "Elevated",
    reason: "E/SRIVR is unavailable and TR velocity is > 2.8 m/s.",
  });
}
