# Diastology Calculator

Educational calculator for left-ventricular diastolic-function grading and left-atrial pressure estimation.

The decision logic follows the 2025 American Society of Echocardiography update:

Nagueh SF, Sanborn DY, Oh JK, et al. Recommendations for the Evaluation of Left Ventricular Diastolic Function by Echocardiography and for Heart Failure With Preserved Ejection Fraction Diagnosis: An Update From the American Society of Echocardiography. *J Am Soc Echocardiogr.* 2025;38(7):537-569. [https://doi.org/10.1016/j.echo.2025.03.011](https://doi.org/10.1016/j.echo.2025.03.011)

Primary PDF: [https://www.asecho.org/wp-content/uploads/2025/07/Left-Ventricular-Diastolic-Function.pdf](https://www.asecho.org/wp-content/uploads/2025/07/Left-Ventricular-Diastolic-Function.pdf)

This document is an ASE update. It supersedes the 2016 ASE/EACVI diastolic-function guideline. It is not a new joint ASE/EACVI guideline. No newer ASE or ASE/EACVI recommendation was identified as of November 2026. ASE also lists a diastolic-function reference booklet with a later publishing date; that booklet was not a replacement document with different cutoffs.

## Use

Serve the folder and open `index.html`. ES modules do not load reliably from a `file://` URL.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

Leave a measurement blank when it was not obtained. A blank field is missing data, not a normal value.

## Test

```bash
npm test
```

The tests encode each Figure 3, 4, 5, 6, 8, and 9 branch used by the calculator, plus threshold boundaries (`>` versus `≥`, and the matching `<` / `≤` pairs).

## What the calculator applies

- Figure 2, presence of diastolic dysfunction, reported alongside the Figure 3 grade
- Figure 3, sinus-rhythm LAP and grade, including second-stage parameters and the footnote supplemental methods
- Table 6 age-specific e' limits and Table 5 age-specific E/A floors, used only when that option is turned on
- Figure 4, moderate or severe mitral annular calcification
- Figure 5 / Table 7, heart transplant recipients in sinus rhythm
- Figure 6, pulmonary hypertension when the standard algorithm does not apply
- Figure 8, atrial fibrillation
- Section 13, diastolic exercise echocardiography
- Figure 9, the HFpEF sequence after alternative diagnoses are excluded
- Table 7 indicator lists for hypertrophic cardiomyopathy, restrictive cardiomyopathy, LVAD, sinus tachycardia, mitral regurgitation, and mitral stenosis
- Narrative criteria for pericardial constriction, aortic regurgitation, post-TEER transseptal LAP, and a uniphasic mitral A wave

## What it intentionally does not turn into a grade

The guideline names supportive findings for several populations without a counted algorithm. Those screens list the findings and do not invent a “how many positives” rule. In particular:

- H2FPEF and HFA-PEFF scores are discussed in the guideline and are not calculated here
- The Mayo constriction-versus-restriction tree (Figure 7) is cited by description; the figure itself is not reproduced as a numeric score
- Aortic stenosis uses the standard algorithm unless moderate or severe MAC is present; there is no separate AS tree
- Diastolic exercise acquisition technique is described in the guideline and is not an interactive protocol
- Vendor-specific LA-strain normal ranges in Table 5 are reference data, not LAP cutoffs

Where the guideline text and a figure use different inequalities, the result follows the decision figure and the screen states the conflicting sentence.

## Disclaimer

This tool is for educational and decision-support purposes only. It is not a substitute for independent clinical judgment. Results must be verified by a qualified clinician against the full echocardiographic study and current guidelines. The tool is provided “as is,” without warranties of any kind, express or implied, including warranties of accuracy, completeness, merchantability, or fitness for a particular purpose. The author assumes no liability for clinical decisions or outcomes arising from its use.
