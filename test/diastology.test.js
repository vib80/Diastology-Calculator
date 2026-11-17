import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  AR_SUPPORTIVE_FINDINGS,
  CONSTRICTION_CRITERIA,
  DISCLAIMER,
  TABLE7,
  assessAfib,
  assessConductionTr,
  assessDiastolicDysfunction,
  assessExercise,
  assessHfpef,
  assessHtx,
  assessMac,
  assessPh,
  assessStandard,
  assessTeer,
  ePrimeReduced,
  eeIncreased,
  trPaspIncreased,
} from "../src/diastology.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("disclaimer language is shared with the page and the README", () => {
  const page = read("../index.html");
  const readme = read("../README.md");
  for (const text of [page, readme]) {
    assert.ok(text.includes(DISCLAIMER));
  }
  assert.match(DISCLAIMER, /educational and decision-support/i);
  assert.match(DISCLAIMER, /not a substitute for independent clinical judgment/i);
  assert.match(DISCLAIMER, /qualified clinician/i);
  assert.match(DISCLAIMER, /as is/i);
  assert.match(DISCLAIMER, /without warranties/i);
  assert.match(DISCLAIMER, /no liability/i);
  assert.match(DISCLAIMER, /clinical decisions or outcomes/i);
});

test("Figure 3 e' boundaries are inclusive and Table 6 boundaries are exclusive", () => {
  assert.equal(ePrimeReduced({ septalEPrime: 6 }).reduced, true);
  assert.equal(ePrimeReduced({ septalEPrime: 6.01 }).reduced, false);
  assert.equal(ePrimeReduced({ lateralEPrime: 7 }).reduced, true);
  assert.equal(ePrimeReduced({ lateralEPrime: 7.01 }).reduced, false);
  assert.equal(ePrimeReduced({ averageEPrime: 6.5 }).reduced, true);
  assert.equal(ePrimeReduced({ averageEPrime: 6.51 }).reduced, false);
  assert.equal(ePrimeReduced({}).reduced, null);

  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 30, septalEPrime: 6.99 }).reduced,
    true,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 30, septalEPrime: 7 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 30, lateralEPrime: 9.99 }).reduced,
    true,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 30, lateralEPrime: 10 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 50, septalEPrime: 6 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 50, lateralEPrime: 8 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 50, averageEPrime: 7 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 70, septalEPrime: 6 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 70, averageEPrime: 6.5 }).reduced,
    false,
  );
  assert.equal(
    ePrimeReduced({ ageSpecific: true, age: 70, averageEPrime: 6.49 }).reduced,
    true,
  );
});

test("Figure 3 E/e' and TR/PASP boundaries", () => {
  assert.equal(eeIncreased({ septalEe: 15 }).increased, true);
  assert.equal(eeIncreased({ septalEe: 14.99 }).increased, false);
  assert.equal(eeIncreased({ lateralEe: 13 }).increased, true);
  assert.equal(eeIncreased({ lateralEe: 12.99 }).increased, false);
  assert.equal(eeIncreased({ averageEe: 14 }).increased, true);
  assert.equal(eeIncreased({ averageEe: 13.99 }).increased, false);
  assert.equal(trPaspIncreased({ tr: 2.8 }).increased, true);
  assert.equal(trPaspIncreased({ tr: 2.79 }).increased, false);
  assert.equal(trPaspIncreased({ pasp: 35 }).increased, true);
  assert.equal(trPaspIncreased({ pasp: 34.99 }).increased, false);
  assert.equal(trPaspIncreased({ pasp: 30, tr: 3.2 }).increased, false);
  assert.equal(trPaspIncreased({ pasp: 40, tr: 2.0 }).increased, true);
  assert.equal(trPaspIncreased({}).increased, null);
});

test("empty standard input is indeterminate, not normal diastolic function", () => {
  const out = assessStandard({});
  assert.equal(out.indeterminate, true);
  assert.equal(out.grade, "Indeterminate");
  assert.notEqual(out.grade, "Normal diastolic function");
});

test("Figure 3: all three core variables normal is normal diastolic function", () => {
  const out = assessStandard({
    septalEPrime: 8,
    lateralEPrime: 10,
    septalEe: 10,
    lateralEe: 8,
    tr: 2.5,
  });
  assert.equal(out.grade, "Normal diastolic function");
  assert.equal(out.lap, "Normal");
  assert.equal(out.indeterminate, false);
  assert.equal(out.note, null);
});

test("Figure 3: a missing core variable is not called normal", () => {
  const out = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 11,
    averageEe: 8,
  });
  assert.equal(out.indeterminate, true);
});

test("Figure 3: three abnormal variables grade on E/A, including the E/A = 2 boundary", () => {
  const base = {
    septalEPrime: 5,
    septalEe: 16,
    tr: 2.8,
  };
  assert.equal(assessStandard({ ...base, ea: 1.999 }).grade, "Grade 2");
  assert.equal(assessStandard({ ...base, ea: 1.999 }).lap, "Mild to moderate increase");
  assert.equal(assessStandard({ ...base, ea: 2 }).grade, "Grade 3");
  assert.equal(assessStandard({ ...base, ea: 2 }).lap, "Marked increase");
  assert.equal(assessStandard({ ...base, ea: 0.8 }).grade, "Grade 2");
  const missing = assessStandard(base);
  assert.equal(missing.grade, "Indeterminate grade");
  assert.equal(missing.lap, "Increased");
  assert.equal(missing.indeterminate, true);
});

test("Figure 3: reduced e' only and E/A ≤ 0.8 is grade 1, not the second-stage path", () => {
  const out = assessStandard({
    septalEPrime: 6,
    lateralEPrime: 9,
    averageEe: 10,
    pasp: 30,
    ea: 0.8,
    symptomatic: true,
  });
  assert.equal(out.grade, "Grade 1");
  assert.equal(out.lap, "Normal");
  assert.match(out.note, /exercise/i);
});

test("Figure 3: E/A just above 0.8 with negative adjudicators is normal LAP, not grade 1", () => {
  const out = assessStandard({
    septalEPrime: 5,
    lateralEPrime: 9,
    averageEe: 8,
    tr: 2.2,
    ea: 0.81,
    lars: 18.01,
    lavi: 34,
    sd: 0.68,
    ivrt: 71,
    lvef: "reduced",
  });
  assert.equal(out.grade, "Normal LAP");
  assert.equal(out.lap, "Normal");
  assert.notEqual(out.grade, "Grade 1");
});

test("Figure 3: one abnormal adjudicator upgrades inconclusive core findings", () => {
  const grade2 = assessStandard({
    septalEPrime: 5,
    lateralEPrime: 10,
    averageEe: 8,
    tr: 2.2,
    ea: 1.2,
    lavi: 34.01,
    lars: 30,
    sd: 1,
    lvef: "reduced",
  });
  assert.equal(grade2.grade, "Grade 2");
  assert.ok(grade2.criteria.some((item) => item.includes("LAVi")));

  const grade3 = assessStandard({
    averageEPrime: 6.5,
    averageEe: 8,
    tr: 2.2,
    ea: 2,
    lars: 18,
    lvef: "reduced",
  });
  assert.equal(grade3.grade, "Grade 3");
  assert.ok(grade3.criteria.some((item) => item.includes("LARS")));
});

test("Figure 3: only E/e' or only TR, with negative adjudicators, is not grade 1", () => {
  const onlyEe = assessStandard({
    septalEPrime: 8,
    lateralEPrime: 10,
    averageEe: 14,
    tr: 2.0,
    lavi: 28,
    lars: 30,
    sd: 1.1,
    lvef: "reduced",
  });
  assert.equal(onlyEe.grade, "Normal LAP");

  const onlyTr = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 11,
    averageEe: 8,
    tr: 2.8,
    ivrt: 90,
  });
  assert.equal(onlyTr.grade, "Normal LAP");
  assert.match(onlyTr.reason, /not grade 1/i);
});

test("Figure 3: two abnormal core variables use the second stage", () => {
  const elevated = assessStandard({
    septalEPrime: 5,
    averageEe: 15,
    tr: 2.0,
    ea: 1,
    sd: 0.67,
    lvef: "reduced",
  });
  assert.equal(elevated.grade, "Grade 2");

  const normal = assessStandard({
    septalEPrime: 5,
    averageEe: 15,
    tr: 2.0,
    lavi: 30,
    lars: 25,
  });
  assert.equal(normal.grade, "Normal LAP");
});

test("Figure 3: preserved-EF pulmonary vein S/D needs IVRT confirmation", () => {
  const unconfirmed = assessStandard({
    septalEPrime: 5,
    averageEe: 16,
    tr: 2.1,
    sd: 0.67,
    lvef: "preserved",
    ivrt: 80,
    lars: 25,
    lavi: 30,
  });
  assert.equal(unconfirmed.grade, "Normal LAP");
  assert.match(unconfirmed.note, /preserved/i);

  const confirmed = assessStandard({
    septalEPrime: 5,
    averageEe: 16,
    tr: 2.1,
    sd: 0.67,
    lvef: "preserved",
    ivrt: 70,
    ea: 1.4,
  });
  assert.equal(confirmed.grade, "Grade 2");
  assert.ok(confirmed.criteria.some((item) => item.includes("IVRT")));
});

test("Figure 3: missing second-stage data stays indeterminate unless a supplemental method is positive", () => {
  const missing = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 11,
    averageEe: 14,
    tr: 2.1,
  });
  assert.equal(missing.indeterminate, true);
  assert.notEqual(missing.grade, "Grade 1");

  const twoMissing = assessStandard({
    septalEPrime: 5,
    averageEe: 15,
    tr: 2.1,
  });
  assert.equal(twoMissing.indeterminate, true);
  assert.notEqual(twoMissing.grade, "Grade 1");

  const symptomaticNormal = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 12,
    averageEe: 7,
    tr: 2.2,
    symptomatic: true,
  });
  assert.equal(symptomaticNormal.grade, "Normal diastolic function");
  assert.equal(symptomaticNormal.note, null);

  const valsalva = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 11,
    averageEe: 14,
    tr: 2.1,
    valsalvaEaDecreasePct: 50,
    ea: 1.5,
  });
  assert.equal(valsalva.grade, "Grade 2");

  const notEnoughValsalva = assessStandard({
    septalEPrime: 9,
    lateralEPrime: 11,
    averageEe: 14,
    tr: 2.1,
    valsalvaEaDecreasePct: 49.9,
  });
  assert.equal(notEnoughValsalva.indeterminate, true);

  const arBoundary = assessStandard({
    lateralEe: 13,
    septalEPrime: 8,
    lateralEPrime: 10,
    pasp: 20,
    arMinusA: 30,
  });
  assert.equal(arBoundary.indeterminate, true);

  const arPositive = assessStandard({
    lateralEe: 13,
    septalEPrime: 8,
    lateralEPrime: 10,
    pasp: 20,
    arMinusA: 30.01,
    ea: 2,
  });
  assert.equal(arPositive.grade, "Grade 3");
  assert.match(arPositive.note, /end-diastolic/i);
});

test("Figure 3 supplemental method boundaries", () => {
  const base = { septalEPrime: 10, lateralEPrime: 12, septalEe: 15, tr: 2.0, ea: 1 };
  assert.equal(assessStandard({ ...base, prEdv: 2 }).grade, "Grade 2");
  assert.equal(assessStandard({ ...base, prEdv: 1.99 }).indeterminate, true);
  assert.equal(assessStandard({ ...base, padp: 16 }).grade, "Grade 2");
  assert.equal(assessStandard({ ...base, padp: 15.99 }).indeterminate, true);
  assert.equal(assessStandard({ ...base, lWave: 50 }).grade, "Grade 2");
  assert.equal(assessStandard({ ...base, lWave: 49 }).indeterminate, true);
});

test("LARS is ignored when GLS is > 18% with preserved EF, or MR is significant", () => {
  const ignored = assessStandard({
    septalEPrime: 5,
    averageEe: 8,
    tr: 2.0,
    ea: 1.2,
    lars: 12,
    lvef: "preserved",
    gls: 19,
    lavi: 30,
  });
  assert.equal(ignored.grade, "Normal LAP");
  assert.match(ignored.note, /GLS/);

  const used = assessStandard({
    septalEPrime: 5,
    averageEe: 8,
    tr: 2.0,
    ea: 1,
    lars: 12,
    lvef: "preserved",
    gls: 18,
  });
  assert.equal(used.grade, "Grade 2");

  const mr = assessStandard({
    septalEPrime: 5,
    averageEe: 8,
    tr: 2.0,
    ea: 1.2,
    lars: 10,
    significantMr: true,
    lavi: 28,
  });
  assert.equal(mr.grade, "Normal LAP");
  assert.match(mr.note, /MR/);
});

test("one known abnormal core variable plus one missing core variable is indeterminate", () => {
  const out = assessStandard({ septalEPrime: 5, averageEe: 8 });
  assert.equal(out.indeterminate, true);
});

test("age-specific E/A floor replaces ≤ 0.8 only when that mode is on", () => {
  const young = assessStandard({
    ageSpecific: true,
    age: 30,
    septalEPrime: 6,
    lateralEPrime: 12,
    averageEe: 8,
    tr: 2.2,
    ea: 0.87,
  });
  assert.equal(young.grade, "Grade 1");

  const atFloor = assessStandard({
    ageSpecific: true,
    age: 30,
    septalEPrime: 6,
    lateralEPrime: 12,
    averageEe: 8,
    tr: 2.2,
    ea: 0.88,
    lavi: 30,
  });
  assert.equal(atFloor.grade, "Normal LAP");

  const defaultMode = assessStandard({
    septalEPrime: 6,
    lateralEPrime: 12,
    averageEe: 8,
    tr: 2.2,
    ea: 0.87,
    lavi: 30,
    lars: 30,
  });
  assert.equal(defaultMode.grade, "Normal LAP");
});

test("Figure 2 uses average E/e' > 14 and does not use TR velocity", () => {
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 5,
      lavi: 30,
      lars: 25,
      ea: 1.2,
      averageEe: 14,
    }).present,
    false,
  );
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 5,
      lavi: 30,
      lars: 25,
      ea: 1.2,
      averageEe: 14.01,
    }).present,
    true,
  );
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 10,
      lateralEPrime: 12,
      lavi: 40,
      lars: 30,
      ea: 1,
      averageEe: 8,
      tr: 3.5,
    }).present,
    false,
  );
  const twoMarkers = assessDiastolicDysfunction({
    septalEPrime: 10,
    lateralEPrime: 12,
    lavi: 40,
    ea: 2,
    lars: 30,
    averageEe: 8,
  });
  assert.equal(twoMarkers.present, true);
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 10,
      lateralEPrime: 12,
      lvMassIndex: 95,
      sex: "female",
      lavi: 30,
      lars: 30,
      ea: 1,
      averageEe: 8,
    }).present,
    false,
  );
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 10,
      lateralEPrime: 12,
      lvMassIndex: 95.01,
      sex: "female",
      lavi: 35,
      lars: 30,
      ea: 1,
      averageEe: 8,
    }).present,
    true,
  );
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 10,
      lateralEPrime: 12,
      lvMassIndex: 115,
      sex: "male",
      lavi: 35,
      lars: 30,
      ea: 1,
      averageEe: 8,
    }).present,
    false,
  );
  assert.equal(
    assessDiastolicDysfunction({
      septalEPrime: 10,
      lateralEPrime: 12,
      lvMassIndex: 116,
      sex: "male",
      lavi: 35,
      lars: 30,
      ea: 1,
      averageEe: 8,
    }).present,
    true,
  );
});

test("Figure 8 atrial fibrillation branches and boundaries", () => {
  assert.equal(assessAfib({}).indeterminate, true);

  const negative = {
    e: 99.99,
    septalEe: 11,
    tr: 2.8,
    dt: 160.01,
  };
  assert.equal(assessAfib(negative).grade, "Normal LAP");
  assert.equal(assessAfib({ ...negative, e: 100 }).grade, "Normal LAP");

  const two = { e: 100, septalEe: 11.01, tr: 2.8, dt: 200 };
  assert.equal(assessAfib(two).indeterminate, true);
  assert.equal(
    assessAfib({ ...two, lars: 18, sd: 1, bmi: 30 }).grade,
    "Normal LAP",
  );
  assert.equal(
    assessAfib({ ...two, lars: 17.99, sd: 1, bmi: 30 }).grade,
    "Indeterminate",
  );
  assert.equal(
    assessAfib({ ...two, lars: 17, sd: 0.99, bmi: 30 }).grade,
    "Elevated LAP",
  );
  assert.equal(assessAfib({ ...two, bmi: 30.01, lars: 20 }).indeterminate, true);

  const three = { e: 100, septalEe: 12, pasp: 35.01, dt: 180 };
  assert.equal(assessAfib(three).grade, "Elevated LAP");
  assert.equal(assessAfib({ e: 100, septalEe: 12, dt: 160 }).grade, "Elevated LAP");
  assert.equal(
    assessAfib({ e: 90, septalEe: 10, tr: 2.5 }).indeterminate,
    true,
  );
  const dtPreserved = assessAfib({
    e: 100,
    septalEe: 12,
    tr: 3,
    dt: 160,
    lvef: "preserved",
  });
  assert.equal(dtPreserved.grade, "Elevated LAP");
  assert.match(dtPreserved.note, /Figure 8/);
});

test("Figure 4 MAC branches and boundaries", () => {
  assert.equal(assessMac({}).indeterminate, true);
  assert.equal(assessMac({ ea: 0.799 }).grade, "Normal LAP");
  assert.equal(assessMac({ ea: 0.8 }).indeterminate, true);
  assert.equal(assessMac({ ea: 0.8, ivrt: 80 }).grade, "Normal LAP");
  assert.equal(assessMac({ ea: 1.8, ivrt: 80 }).grade, "Normal LAP");
  assert.equal(assessMac({ ea: 1.8, ivrt: 79.99 }).grade, "Elevated LAP");
  assert.equal(assessMac({ ea: 1.801 }).grade, "Elevated LAP");
});

test("Figure 6 pulmonary hypertension branches and boundaries", () => {
  assert.equal(assessPh({ ea: 0.8, e: 50 }).grade, "Normal LAP");
  assert.equal(assessPh({ ea: 0.8, e: 50.01, lars: 18 }).grade, "Elevated LAP");
  assert.equal(assessPh({ ea: 0.8, e: 50.01, lars: 18.01 }).grade, "Normal LAP");
  assert.equal(assessPh({ ea: 1.2, lateralEe: 7.99 }).grade, "Normal LAP");
  assert.equal(assessPh({ ea: 1.2, lateralEe: 8 }).indeterminate, true);
  assert.equal(assessPh({ ea: 1.2, lateralEe: 13 }).indeterminate, true);
  assert.equal(assessPh({ ea: 1.2, lateralEe: 13.01 }).grade, "Elevated LAP");
  assert.equal(
    assessPh({ ea: 2, septalEPrime: 5, lateralEPrime: 10 }).grade,
    "Elevated LAP",
  );
  assert.equal(
    assessPh({ ea: 1.999, lars: 25 }).grade,
    "Normal LAP",
  );
  const preserved = assessPh({
    ea: 2,
    septalEPrime: 8,
    lateralEPrime: 10,
  });
  assert.equal(preserved.indeterminate, true);
  assert.match(preserved.reason, /Table 7/);
  assert.equal(assessPh({ ea: 0.8 }).indeterminate, true);
  assert.equal(assessPh({ ea: 1 }).indeterminate, true);
  const ambiguousLars = assessPh({ ea: 1, lars: 17 });
  assert.equal(ambiguousLars.grade, "Elevated LAP");
  assert.match(ambiguousLars.note, /16%/);
});

test("Figure 5 heart transplant branches and boundaries", () => {
  assert.equal(assessHtx({ averageEe: 6.99 }).grade, "Normal LAP");
  assert.equal(assessHtx({ averageEe: 14.01 }).grade, "Elevated LAP");
  assert.equal(assessHtx({ septalEe: 6 }).indeterminate, true);
  assert.equal(assessHtx({ averageEe: 7, eSrIvr: 200 }).grade, "Normal LAP");
  assert.match(assessHtx({ averageEe: 7, eSrIvr: 200 }).note, /exactly 7/i);
  assert.equal(assessHtx({ averageEe: 14, eSrIvr: 200.01 }).grade, "Elevated LAP");
  assert.equal(assessHtx({ averageEe: 10, eSrIvr: 200 }).grade, "Normal LAP");
  assert.equal(assessHtx({ averageEe: 10, eSrIvr: 200.01 }).grade, "Elevated LAP");
  assert.equal(assessHtx({ septalEe: 8, lateralEe: 12, tr: 2.8 }).grade, "Normal LAP");
  assert.equal(assessHtx({ averageEe: 10, tr: 2.81 }).grade, "Elevated LAP");
  assert.equal(assessHtx({ averageEe: 10 }).indeterminate, true);
});

test("Section 13 exercise categories and boundaries", () => {
  assert.equal(assessExercise({}).indeterminate, true);
  assert.equal(assessExercise({ averageEe: 14, tr: 3.21 }).grade, "Positive");
  const exact = assessExercise({ averageEe: 14, tr: 3.2 });
  assert.equal(exact.grade, "Positive");
  assert.match(exact.note, /Key Point/);
  assert.equal(
    assessExercise({ averageEe: 13.9, septalEe: 15, tr: 3.2 }).grade,
    "Positive",
  );
  assert.equal(assessExercise({ averageEe: 9.99, tr: 2.79 }).grade, "Normal exercise LAP");
  assert.equal(assessExercise({ averageEe: 10, tr: 2.7 }).indeterminate, true);
  assert.equal(assessExercise({ averageEe: 9, tr: 2.8 }).indeterminate, true);
  assert.equal(assessExercise({ averageEe: 13.9, tr: 3.21 }).grade, "HFpEF not supported");
  assert.equal(assessExercise({ averageEe: 14.01, tr: 3.0 }).grade, "HFpEF likely");
  assert.equal(assessExercise({ averageEe: 14, tr: 3.0 }).indeterminate, true);
  assert.equal(assessExercise({ averageEe: 14.5, tr: 2.8 }).indeterminate, true);
});

test("Figure 9 HFpEF pathway", () => {
  assert.equal(assessHfpef({ symptoms: true, restingLap: "elevated" }).grade, "HFpEF not concluded");
  assert.equal(
    assessHfpef({
      symptoms: true,
      alternativesExcluded: true,
      restingLap: "elevated",
    }).grade,
    "HFpEF supported",
  );
  assert.equal(
    assessHfpef({
      symptoms: true,
      alternativesExcluded: true,
      restingLap: "normal",
    }).grade,
    "Exercise testing needed",
  );
  assert.equal(
    assessHfpef({
      symptoms: true,
      alternativesExcluded: true,
      restingLap: "normal",
      exercise: "positive",
    }).grade,
    "HFpEF supported",
  );
  assert.equal(
    assessHfpef({
      symptoms: true,
      alternativesExcluded: true,
      restingLap: "normal",
      exercise: "negative",
    }).grade,
    "Noncardiac dyspnea",
  );
  assert.equal(
    assessHfpef({
      symptoms: true,
      alternativesExcluded: true,
      restingLap: "normal",
      exercise: "indeterminate",
    }).indeterminate,
    true,
  );
  assert.equal(
    assessHfpef({
      symptoms: false,
      alternativesExcluded: true,
      restingLap: "elevated",
    }).grade,
    "HFpEF not concluded",
  );
});

test("TEER LAP estimate and conduction-only TR indicator", () => {
  const highVelocity = assessTeer({ velocity: 1.71, rap: 3 });
  assert.equal(highVelocity.grade, "Elevated LAP");
  const highPressure = assessTeer({ velocity: 1.7, rap: 10 });
  assert.equal(highPressure.grade, "Elevated LAP");
  assert.ok(highPressure.extra.lapValue > 15);
  const normal = assessTeer({ velocity: 1.2, rap: 3 });
  assert.equal(normal.grade, "LAP not elevated by this estimate");
  assert.equal(assessTeer({ velocity: 2, rap: 5, biventricularHf: true }).indeterminate, true);
  assert.equal(assessTeer({ velocity: 2 }).indeterminate, true);

  assert.equal(assessConductionTr({ tr: 2.81 }).grade, "Elevated LAP");
  assert.equal(assessConductionTr({ tr: 2.8 }).indeterminate, true);
  assert.equal(assessConductionTr({}).indeterminate, true);
});

test("reference lists keep the published special-population thresholds", () => {
  assert.ok(TABLE7.hcm.some((item) => item.includes("Average E/e' > 14")));
  assert.ok(TABLE7.hcm.some((item) => item.includes("> 34 mL/m²")));
  assert.ok(TABLE7.rcm.some((item) => item.includes("< 140 ms")));
  assert.ok(TABLE7.rcm.some((item) => item.includes("< 150 ms")));
  assert.ok(TABLE7.lvad.some((item) => item.includes("> 33 mL/m²")));
  assert.ok(TABLE7.lvad.some((item) => item.includes("5 mm Hg")));
  assert.ok(TABLE7.mr.some((item) => item.includes("< 5.6")));
  assert.ok(TABLE7.mr.some((item) => item.includes("< 3")));
  assert.ok(TABLE7.ms.some((item) => item.includes("< 4.2")));
  assert.ok(TABLE7.ms.some((item) => item.includes("> 1.5 m/s")));
  assert.ok(TABLE7.tachycardia.some((item) => item.includes("≤ 40%")));
  assert.ok(TABLE7.mac.some((item) => item.includes("≥ 80 ms")));
  assert.ok(CONSTRICTION_CRITERIA.some((item) => item.includes("> 25%")));
  assert.ok(CONSTRICTION_CRITERIA.some((item) => item.includes("≥ 0.8")));
  assert.ok(AR_SUPPORTIVE_FINDINGS.includes("LARS < 18%"));
  assert.equal(TABLE7.afib.length, 7);
});
