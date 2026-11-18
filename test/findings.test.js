import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { DISCLAIMER } from "../src/diastology.js";
import {
  gradeAfib,
  gradeHtx,
  gradeMac,
  gradePh,
  gradeStandard,
  needsSecond,
} from "../src/grade.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const core = {
  eReduced: "absent",
  eeIncreased: "absent",
  trIncreased: "absent",
};

test("untouched standard form is indeterminate, never normal", () => {
  const out = gradeStandard({});
  assert.equal(out.grade, "Indeterminate");
  assert.equal(out.indeterminate, true);
  assert.equal(out.lap, null);
  assert.notEqual(out.grade, "Normal diastolic function");
  assert.deepEqual(out.missing, ["Reduced e'", "Increased E/e'", "TR velocity or PASP"]);
});

test("standard pathway: measured present and absent findings keep the previous grades", () => {
  assert.equal(gradeStandard(core).grade, "Normal diastolic function");
  assert.equal(gradeStandard(core).lap, "Normal");
  assert.deepEqual(gradeStandard(core).missing, []);

  const grade3 = gradeStandard({
    eReduced: "present",
    eeIncreased: "present",
    trIncreased: "present",
    eaBand: "ge2",
  });
  assert.equal(grade3.grade, "Grade 3");
  assert.equal(grade3.lap, "Marked increase");

  const grade2 = gradeStandard({
    eReduced: "present",
    eeIncreased: "present",
    trIncreased: "present",
    eaBand: "le08",
  });
  assert.equal(grade2.grade, "Grade 2");
  assert.equal(gradeStandard({ ...grade2Input(), eaBand: "mid" }).grade, "Grade 2");

  const grade1 = gradeStandard({ ...core, eReduced: "present", eaBand: "le08" });
  assert.equal(grade1.grade, "Grade 1");
  assert.equal(grade1.lap, "Normal");
  assert.ok(grade1.criteria.includes("E/A ≤ 0.8"));

  const normalLap = gradeStandard({
    ...core,
    eeIncreased: "present",
    eaBand: "mid",
    laviHigh: "absent",
    larsLow: "absent",
    sdLow: "absent",
    ivrtShort: "absent",
  });
  assert.equal(normalLap.grade, "Normal LAP");
  assert.equal(normalLap.note, null);

  const upgraded = gradeStandard({
    ...core,
    eReduced: "present",
    eeIncreased: "present",
    eaBand: "ge2",
    larsLow: "present",
  });
  assert.equal(upgraded.grade, "Grade 3");
  assert.ok(upgraded.criteria.some((item) => item.includes("LARS")));
});

function grade2Input() {
  return {
    eReduced: "present",
    eeIncreased: "present",
    trIncreased: "present",
  };
}

test("standard pathway stays indeterminate when a required finding is not measured", () => {
  const missingCore = gradeStandard({ eReduced: "absent", eeIncreased: "absent" });
  assert.equal(missingCore.indeterminate, true);
  assert.deepEqual(missingCore.missing, ["TR velocity or PASP"]);
  assert.notEqual(missingCore.grade, "Normal diastolic function");

  const oneAbnormalGap = gradeStandard({ eReduced: "present", eeIncreased: "absent" });
  assert.equal(oneAbnormalGap.indeterminate, true);
  assert.deepEqual(oneAbnormalGap.missing, ["TR velocity or PASP"]);

  const needEa = gradeStandard({ ...core, eReduced: "present" });
  assert.equal(needEa.grade, "Indeterminate");
  assert.deepEqual(needEa.missing, ["E/A ratio"]);

  const needGrade = gradeStandard(grade2Input());
  assert.equal(needGrade.grade, "Indeterminate grade");
  assert.equal(needGrade.lap, "Increased");
  assert.deepEqual(needGrade.missing, ["E/A ratio"]);

  const needSecond = gradeStandard({
    ...core,
    eReduced: "present",
    eeIncreased: "present",
    eaBand: "mid",
  });
  assert.equal(needSecond.indeterminate, true);
  assert.deepEqual(needSecond.missing, ["LARS", "Pulmonary vein S/D", "LAVi", "IVRT"]);
  assert.notEqual(needSecond.grade, "Normal LAP");

  const oneNegative = gradeStandard({
    ...core,
    eeIncreased: "present",
    eaBand: "mid",
    ivrtShort: "absent",
  });
  assert.equal(oneNegative.grade, "Normal LAP");
  assert.match(oneNegative.note, /not counted as normal/i);
});

test("second-stage controls appear only after the core branch needs them", () => {
  assert.equal(needsSecond({}), false);
  assert.equal(needsSecond(core), false);
  assert.equal(needsSecond({ ...grade2Input(), eaBand: "ge2" }), false);
  assert.equal(needsSecond({ ...core, eReduced: "present", eaBand: "le08" }), false);
  assert.equal(needsSecond({ ...core, eReduced: "present" }), false);
  assert.equal(needsSecond({ eReduced: "present", eeIncreased: "absent" }), false);
  assert.equal(needsSecond({ ...core, eReduced: "present", eaBand: "mid" }), true);
  assert.equal(needsSecond({ ...core, eReduced: "present", eeIncreased: "present" }), true);
  assert.equal(
    needsSecond({ ...core, eeIncreased: "present", eaBand: "le08" }),
    true,
  );
});

test("atrial fibrillation: untouched is indeterminate, and measured pathways are unchanged", () => {
  const empty = gradeAfib({});
  assert.equal(empty.grade, "Indeterminate");
  assert.deepEqual(empty.missing, [
    "Mitral E velocity",
    "Septal E/e'",
    "TR velocity or PASP",
    "Deceleration time",
  ]);

  const none = {
    afibE: "absent",
    afibEe: "absent",
    afibTr: "absent",
    afibDt: "absent",
  };
  assert.equal(gradeAfib(none).grade, "Normal LAP");
  assert.equal(gradeAfib({ ...none, afibE: "present" }).grade, "Normal LAP");

  const two = { ...none, afibE: "present", afibEe: "present" };
  const suppAbsent = { afibLars: "absent", afibSd: "absent", afibBmi: "absent" };
  assert.equal(gradeAfib({ ...two, ...suppAbsent }).grade, "Normal LAP");
  assert.equal(
    gradeAfib({ ...two, afibLars: "present", afibSd: "present", afibBmi: "absent" }).grade,
    "Elevated LAP",
  );
  assert.equal(
    gradeAfib({ ...two, ...suppAbsent, afibLars: "present" }).grade,
    "Indeterminate",
  );
  assert.deepEqual(gradeAfib({ ...two, ...suppAbsent, afibLars: "present" }).missing, []);
  assert.equal(gradeAfib({ ...none, afibE: "present", afibEe: "present", afibTr: "present" }).grade, "Elevated LAP");

  const gap = gradeAfib({ ...none, afibDt: "unknown" });
  assert.equal(gap.indeterminate, true);
  assert.deepEqual(gap.missing, ["Deceleration time"]);

  const suppGap = gradeAfib(two);
  assert.equal(suppGap.indeterminate, true);
  assert.deepEqual(suppGap.missing, ["LARS", "Pulmonary vein S/D", "BMI"]);
  assert.notEqual(suppGap.grade, "Normal LAP");
});

test("MAC: untouched and unmeasured IVRT are indeterminate; entered branches keep their grades", () => {
  const empty = gradeMac({});
  assert.equal(empty.grade, "Indeterminate");
  assert.deepEqual(empty.missing, ["E/A ratio"]);

  assert.equal(gradeMac({ macEa: "low" }).grade, "Normal LAP");
  assert.equal(gradeMac({ macEa: "high" }).grade, "Elevated LAP");

  const mid = gradeMac({ macEa: "mid" });
  assert.equal(mid.indeterminate, true);
  assert.deepEqual(mid.missing, ["IVRT"]);
  assert.notEqual(mid.grade, "Normal LAP");

  assert.equal(gradeMac({ macEa: "mid", macIvrtShort: "absent" }).grade, "Normal LAP");
  assert.equal(gradeMac({ macEa: "mid", macIvrtShort: "present" }).grade, "Elevated LAP");
});

test("pulmonary hypertension: not measured does not default to normal LARS", () => {
  const empty = gradePh({});
  assert.equal(empty.grade, "Indeterminate");
  assert.deepEqual(empty.missing, ["Mitral filling"]);

  assert.equal(gradePh({ phPath: "normal" }).grade, "Normal LAP");
  assert.equal(gradePh({ phPath: "high" }).grade, "Elevated LAP");

  const mid = gradePh({ phPath: "mid" });
  assert.equal(mid.indeterminate, true);
  assert.deepEqual(mid.missing, ["LARS", "Lateral E/e'"]);
  assert.notEqual(mid.grade, "Normal LAP");

  assert.equal(gradePh({ phPath: "mid", phLarsLow: "present" }).grade, "Elevated LAP");
  assert.equal(gradePh({ phPath: "mid", phLarsLow: "absent" }).grade, "Normal LAP");
  assert.equal(gradePh({ phPath: "mid", phEe: "low" }).grade, "Normal LAP");
  assert.equal(gradePh({ phPath: "mid", phEe: "high" }).grade, "Elevated LAP");
  assert.equal(gradePh({ phPath: "mid", phEe: "mid" }).grade, "Indeterminate");
  assert.deepEqual(gradePh({ phPath: "mid", phEe: "mid" }).missing, []);
});

test("heart transplant: intermediate E/e' is indeterminate until E/SRIVR or TR is measured", () => {
  const empty = gradeHtx({});
  assert.equal(empty.grade, "Indeterminate");
  assert.deepEqual(empty.missing, ["Average E/e'"]);

  assert.equal(gradeHtx({ htxEe: "low" }).grade, "Normal LAP");
  assert.equal(gradeHtx({ htxEe: "high" }).grade, "Elevated LAP");

  const mid = gradeHtx({ htxEe: "mid" });
  assert.equal(mid.indeterminate, true);
  assert.deepEqual(mid.missing, ["E/SRIVR", "TR velocity"]);
  assert.notEqual(mid.grade, "Normal LAP");

  assert.equal(gradeHtx({ htxEe: "mid", htxSrHigh: "present" }).grade, "Elevated LAP");
  assert.equal(gradeHtx({ htxEe: "mid", htxSrHigh: "absent" }).grade, "Normal LAP");
  assert.equal(gradeHtx({ htxEe: "mid", htxTrHigh: "present" }).grade, "Elevated LAP");
  assert.equal(gradeHtx({ htxEe: "mid", htxTrHigh: "absent" }).grade, "Normal LAP");
});

test("the page still shows the disclaimer once and no longer treats a skip as absent", () => {
  const page = read("../index.html");
  const single = read("../Diastology-Calculator.html");
  const ui = read("../src/ui.js");
  const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").split(DISCLAIMER).length - 1;
  assert.equal(visible(page), 1);
  assert.equal(visible(single), 1);
  for (const source of [ui, single]) {
    assert.match(source, /Not measured/);
    assert.doesNotMatch(source, /Leave it unchecked/);
    assert.doesNotMatch(source, /Leave a box unchecked/);
  }
});
