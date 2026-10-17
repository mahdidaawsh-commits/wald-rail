Category: Builder → Intelligent Contracts

Title: WaldRail: Consensus sequential reliability audit

WaldRail is a GenLayer sequential audit with an immutable ordered report manifest. Leader and validators independently fetch commit-pinned reports, verify SHA-256 hashes and assess five dimensions: trial identity, finality, continuous duration, minimum flow and shutdown freedom. Validators require exact dimension agreement and audit positive, negative and UNKNOWN anchors. Agreed PASS/FAIL trials update a reduced integer likelihood ratio; inclusive bounds stop CLEAR or FLAG. VOID blocks without consuming a trial; exhaustion remains inconclusive. Callers cannot skip rows, replace the plan or resume terminal audits. Four StudioNet deployments prove CLEAR, FLAG, EXHAUSTED and blocked retry. All 22 transactions finalized with MAJORITY_AGREE, including rejected skipping and terminal replay. Includes 57 tests, 8,190 binary prefixes and exact probability checks. Synthetic selected reports demonstrate execution; statistical bounds require trustworthy observations and a valid sampling model.

Repository: https://github.com/mahdidaawsh-commits/wald-rail

Contract: https://github.com/mahdidaawsh-commits/wald-rail/blob/main/contracts/wald_rail.py

Proofs: https://github.com/mahdidaawsh-commits/wald-rail/blob/main/proofs/README.md

StudioNet contract: 0x0aeB1cA1E9b7E3e69105720108c130d68B513317

Deployment: https://explorer-studio.genlayer.com/tx/0xba9d1265465d884761fc6925e57cd14230d27ec928610f5fca2d6fb685702225
