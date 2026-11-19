---
title: "Can AI Improve Primary Care Without Compromising Patient Safety?"
description: "What screening trials and early experience with AI scribes reveal about where artificial intelligence can help primary care, and what clinics need to verify before relying on it."
publishDate: 2026-11-18
category: Artificial Intelligence
tags: [Medical AI, Primary healthcare, Patient safety, Clinical decision support, External validation]
coverImage:
  src: /images/journal/ai-in-primary-care-patient-safety.webp
  alt: "A brushed-silver stethoscope rests on a glass plate etched with circuit traces."
  width: 1440
  height: 810
featured: true
seoTitle: "AI in Primary Care and Patient Safety"
seoDescription: "What does the evidence say about AI in primary care? Explore screening, diagnostic support and AI scribes, and how clinics can evaluate risks to patient safety."
draft: false
takeaways:
  - "Trials support some narrowly defined uses, such as detecting low ejection fraction, while evidence for better patient outcomes remains limited."
  - "A model’s accuracy depends on where it is used. Check local performance, failed inputs and differences across patient groups."
  - "Assign someone to review outputs and close the loop on follow-up. Decide who can pause the tool when safety concerns arise."
  - "Track the work AI creates as well as the time it saves, and protect patients’ ability to decline recording."
---

A primary care clinic could use artificial intelligence to flag an abnormal pattern on an electrocardiogram or draft a note after a visit. In the first case, someone must decide whether the signal warrants further investigation and see that the patient receives follow-up. In the second, someone must read the note closely enough to catch a missed allergy or a medication change attributed to the wrong person. Both tools can help with a defined task. Their consequences depend on what the clinic does with the output.

AI can improve parts of primary care, particularly when a tool addresses a specific problem and fits an established care pathway. Evidence that it makes care safer or improves outcomes is more limited and varies by application. For a clinic considering adoption, the useful question is what would have to happen after the tool produces a result for patients to benefit.

## Where AI can help in primary care

### Finding patients who may need further assessment

The EAGLE pragmatic trial randomized 120 primary care teams to receive AI results from patients’ electrocardiograms (ECGs) or continue usual care. Within 90 days of an ECG, 2.1% of patients in the intervention group had a new diagnosis of low ejection fraction, a measure of how much blood the heart’s main pumping chamber ejects with each beat, compared with 1.6% in usual care. The trial measured additional diagnoses. Whether detecting more cases led to fewer hospital admissions or better symptoms remained outside that primary outcome. [Yao et al., Nature Medicine](https://pubmed.ncbi.nlm.nih.gov/33958795/)

An autonomous diabetic eye-screening system was evaluated against a specialist reading-centre reference standard in a study that enrolled 900 people with diabetes at primary care sites. It achieved 87.2% sensitivity and 90.7% specificity for the study’s target of more-than-mild diabetic retinopathy or diabetic macular oedema. The figures describe how well the system identified people with and without the target finding under the study conditions. A clinic still needs a route to eye care for people with a positive screen and a plan for patients whose images cannot be graded. [Abràmoff et al., npj Digital Medicine](https://pmc.ncbi.nlm.nih.gov/articles/PMC6550188/)

### Reducing documentation work

Ambient AI scribes use a visit conversation to draft a clinical note. In a randomized trial of 238 outpatient physicians across 14 specialties, one scribe reduced time spent in notes by 9.5% relative to usual care. The other showed no statistically significant reduction. That variation matters to practices comparing products. The trial measured time in notes, and clinicians reported clinically significant inaccuracies. A pilot should account for time spent checking and correcting notes, including work that falls to other team members. [Lukac et al., NEJM AI](https://pmc.ncbi.nlm.nih.gov/articles/PMC12768499/)

## Why accuracy alone cannot establish safety

In a randomized study of 50 physicians from family medicine, internal medicine and emergency medicine, access to a large language model did not significantly improve diagnostic reasoning scores on written cases compared with conventional resources. The study assessed performance on vignettes. In a consultation, the history may be incomplete, several conditions may be plausible, and the decision may turn on information still being gathered. A score on a written case leaves those uncertainties largely untouched. [Goh et al., JAMA Network Open](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2825395)

A 2026 systematic review of 10 real-world studies of AI-enabled clinical decision support in primary care found mixed effects on case finding, accuracy and processes of care. The two trials in the review that measured outcomes important to patients showed no benefit on those outcomes. Harms such as false alarms, inappropriate reassurance and alert burden were rarely measured. The review makes a case for tracking three things separately in any evaluation: how the model performs, what clinicians do with its output, and what happens to patients. [Journal of Medical Internet Research systematic review](https://www.jmir.org/2026/1/e98630)

## Validate the tool in the clinic that will use it

### Check the population and the threshold

A tool trained in a specialist clinic may encounter different patients in primary care, where the target condition can be less common and symptoms less clearly defined. Even with the same sensitivity and specificity, a lower prevalence means that a larger share of positive results will be false positives. The clinic needs to consider what this would do to its capacity for repeat testing and referrals, and how missed cases would be found. For a tool reporting probabilities, check whether its estimated risks agree with observed outcomes in the local population. For example, if a group is assigned a 10% risk, an outcome rate near 10% in that group would indicate good calibration at that level. [Why the test setting matters for medical AI](/blog/where-a-medical-ai-model-is-tested/)

### Look for differences hidden by averages

Bias can start with the outcome a model is asked to predict. In a US population health program, an algorithm used healthcare spending as a proxy for health need. Black patients were sicker than White patients at the same risk score because spending differed at similar levels of illness. The example is relevant whenever a practice uses historical care as a stand-in for need. A record of completed referrals may reflect transport, wait times or access to an interpreter as well as clinical need. Look at whom the tool misses, whose data are often incomplete, and who gets through to follow-up. Report uncertainty when subgroup samples are small. [Obermeyer et al., Science](https://pubmed.ncbi.nlm.nih.gov/31649194/)

## Build oversight and privacy into the workflow

### Assign responsibility for decisions and follow-up

Before a tool goes live, walk one example through the clinic. Who receives the flag? Can they see the original clinical information and an explanation of what the flag is meant to indicate? Who follows up when a patient cannot be reached, and who covers that work when someone is away? A clinician needs time and a practical way to disagree with a recommendation. The usual pathway should remain available when the model is unavailable, encounters an input it cannot handle or produces an output that conflicts with the clinical assessment. The DECIDE-AI reporting guideline is a starting point for evaluating human factors and safety during early live use. [DECIDE-AI, The BMJ](https://pmc.ncbi.nlm.nih.gov/articles/PMC9116198/)

### Explain what happens to patient information

A patient should be able to understand why a visit is being recorded, what will be kept, who can access it and how to continue the visit without recording. Before introducing a scribe, a clinic needs to know where audio and transcripts are processed, when they are deleted and whether the supplier can use the data for another purpose. Policies and contracts should reflect the privacy rules that apply to the organization. In British Columbia, the provincial privacy commissioner’s guidance for organizations subject to the Personal Information Protection Act addresses consent, withdrawal and vendor oversight for AI scribes. [Office of the Information and Privacy Commissioner for British Columbia](https://www.oipc.bc.ca/documents/guidance-documents/3082)

## What a primary care pilot should measure

A useful pilot starts with one task and a comparison with usual care. For an alert intended to shorten the time to assessment, measure completed assessments and time to follow-up, alongside unnecessary referrals, delayed care and missed cases. For a scribe, examine total documentation time and audit signed notes for clinically important errors. Build in a way for clinicians, staff and patients to report problems. A small pilot can show where the workflow breaks or who ends up doing more work. Rare harms and longer-term patient effects usually require a larger evaluation or ongoing surveillance. [DECIDE-AI, The BMJ](https://pmc.ncbi.nlm.nih.gov/articles/PMC9116198/)

For developers working with a practice, a useful evaluation starts with a record of which model version was used, what inputs it accepted and when it could return no result. Count those non-results among the eligible encounters. If the evaluation includes only people for whom the tool produced an answer, it can miss a problem that matters in practice, such as poor-quality images occurring more often in one clinic. Reporting these failures helps other sites judge what would transfer. [DECIDE-AI, The BMJ](https://pmc.ncbi.nlm.nih.gov/articles/PMC9116198/)

Agree in advance on who reviews the measures and what would trigger a pause. A pattern of missed follow-up, clinically important errors or a disparity in who gets assessed should prompt investigation. Revisit the evaluation when the supplier changes the model or the clinic changes how it uses the output. A tool that worked under the original conditions can produce different results when the inputs, population or workflow change. The WHO’s guidance on large multimodal models addresses ongoing oversight of generative tools. [World Health Organization](https://www.who.int/publications/i/item/9789240084759)

## When the case for adoption is strongest

The case for AI in primary care is strongest when a tool helps with a specific task, patients can access the care that follows, and the clinic can measure both benefits and harms. Screening studies show that more patients with a defined finding can be identified. Documentation trials show time savings with some tools in some settings. Those gains are worth pursuing when the team can verify them locally and respond to mistakes. The question to return to after a pilot is whether patients received better care and whether the practice would know if anyone was worse off.

## Further reading

- Assess what a prediction-model study reports about its data, methods and performance. [TRIPOD+AI reporting guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11019967/)
- Explore governance responsibilities for generative AI in health, including oversight after deployment. [WHO guidance on large multimodal models](https://www.who.int/publications/i/item/9789240084759)
- Read the practical steps for interpreting a trial’s outcome and the size of its effect. [Reading a clinical trial beyond the abstract](/blog/reading-a-clinical-trial/)
