# WaldRail protocol

## Boundary and novelty

An immutable, ordered audit plan becomes a sequential statistical stopping process. A caller asks `step(expected_index)`; the contract fetches precisely that committed trial report, independently interprets five substantive dimensions through GenLayer consensus, and advances an exact likelihood ratio. No caller supplies the result or chooses the next report. There is no owner, certificate issuance, graph editing, ranking, auction or token payout.

Frontend/offchain tooling prepares a target asset and ordered manifest of unique trial IDs, commit-pinned report URLs and SHA-256 hashes. The contract owns acquisition, semantic comparison, order enforcement, exact arithmetic, an append-only accepted-trial ledger and absorbing stopping decisions. Publishers own raw observations. The protocol cannot establish their honesty or that distinct trial IDs represent independent experiments.

## Fixed inspection protocol

For the specified target and trial ID, a final closed trial qualifies only if it reports one uninterrupted run of at least 60 minutes, a minimum observed flow of at least 50 litres/minute throughout that run, and no unplanned shutdown. Separate runs cannot be added. An average flow is insufficient to establish a minimum. Withdrawn drafts, plans, predictions and another asset or trial do not establish observed performance. Final corrections supersede drafts; unresolved contradictory final findings are UNKNOWN.

The model supplies five source-anchored YES/NO/UNKNOWN decisions: identity, final closed trial, continuous duration, minimum flow and shutdown freedom. Validators fetch and hash the full report themselves, independently classify all five dimensions, require exact value agreement, then audit every proposed anchor against the full document. Prompts contain the target, trial ID and complete report paragraphs; they exclude the current ratio and earlier outcomes. An anchor may differ between independent extractions, but the leader anchor must pass substantive audit. UNKNOWN absence may use -1; definitive decisions must cite a material paragraph.

Identity or finality not YES produces VOID. Otherwise any explicit failed performance dimension produces FAIL; all three YES produce PASS; all other combinations produce VOID. Every decision affects validity or statistical evidence, so validators compare the complete dimension vector rather than a confidence tolerance.

## Exact sequential likelihood ratio

The reference hypotheses are failure probability 1/10 versus 4/10. Start N/D = 1. FAIL multiplies by 4; PASS multiplies by 2/3. Reduce by gcd after every update. Flag at N >= 20D; clear at 20N <= D. Thresholds are inclusive and checked before exhaustion. All other prefixes remain RUNNING; consuming the last report without crossing gives EXHAUSTED, never an automatic clearance. The cap is 24 valid trials, keeping every reduced numerator/denominator far below u256.

This is an implementation of a likelihood-ratio sequential test, a standard statistical mechanism, not a claim to invent it. See [NIST sequential sampling](https://www.itl.nist.gov/div898/handbook/pmc/section2/pmc254.htm). The GenLayer contribution is binding documentary classification, non-skippable ordered acquisition and exact stopping state to independently verified observations.

Under correctly classified independent Bernoulli trials with failure probability at most 0.1, the expected next multiplier is at most 1; the nonnegative likelihood ratio is a supermartingale and the chance of ever crossing 20 is at most 1/20. For failure probability at least 0.4, the reciprocal has that property and the chance of crossing 1/20 is at most 1/20. This conditional bound is not a posterior probability, a simultaneous interval, or a guarantee about selected, fabricated, correlated or misclassified documents. This repo's chosen synthetic reports do not satisfy a random sampling experiment. Consumers must establish a sampling protocol and source trust separately. Capping at 24 can produce EXHAUSTED and changes power, but cannot add a false boundary crossing.

An independent exact-rational dynamic calculation for a full 24-trial plan illustrates the cap. These rounded values assume perfectly classified IID Bernoulli trials, no VOID reports and the stated model; they are not measured contract or model accuracy.

| True failure probability | FLAG | CLEAR | EXHAUSTED | Expected valid trials |
| --- | --- | --- | --- | --- |
| 0.1 | 0.02523863 | 0.88099825 | 0.09376312 | 12.648671 |
| 0.4 | 0.90071618 | 0.03620836 | 0.06307546 | 10.319508 |

## State and concurrency

The constructor freezes 2–24 unique trial IDs, URLs and raw hashes. Anyone may step. A stale `expected_index` fails before web access, preventing a repeated successful request from silently consuming the next report. Each valid observation increments the cursor once and appends the full report, decision vector, reduced ratio and resulting status. CLEAR, FLAG and EXHAUSTED are permanent. Records are bounded by 24.

VOID records a last-attempt snapshot and BLOCKED status, without advancing the cursor, ratio or accepted history. A retry can only re-evaluate the same immutable report; callers cannot replace or skip it. A genuinely incomplete pinned report can block permanently. Only the latest VOID attempt is retained in storage, with prior attempts recoverable from transaction receipts. Web/hash/LLM errors revert instead of consuming a trial. Repeated calls cannot change the plan.

## Trust and security

HTTPS commit URLs plus exact hashes bind bytes, not truth or independent provenance. Untrusted text is isolated as JSON data and never executed. The two-class model is deliberately fixed; outputs are checked without coercing booleans to integers or strings to booleans. Validators reject model errors and mismatched source bytes. Matching deterministic external failures may agree on a failed transaction; transient matching failures never create an observation. No funds, keys or private sensor access are held by this contract.

The plan can be cherry-picked before deployment, and observers can deploy several instances and publicize only a favorable one. Consumers must choose the plan and instance before outcomes and reject that selection bias. This is a reusable audit primitive, not independently authenticated physical inspection or real-world reliability certification. Synthetic trial IDs include case labels and the reports are selected for known outcomes: these are transparent execution examples, not a blind model-accuracy benchmark.
