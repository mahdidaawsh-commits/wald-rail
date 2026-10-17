# WaldRail

An ordered sequential reliability audit with independent GenLayer interpretation and exact likelihood-ratio stopping.

**StudioNet contract:** `0x0aeB1cA1E9b7E3e69105720108c130d68B513317`. [Deployment](https://explorer-studio.genlayer.com/tx/0xba9d1265465d884761fc6925e57cd14230d27ec928610f5fca2d6fb685702225) · [Four instances and 22 finalized receipts](proofs/README.md) · [Passing CI: 57 tests](https://github.com/mahdidaawsh-commits/wald-rail/actions/runs/39048484697).

The deployer freezes a target asset and 2–24 unique trial IDs, commit-pinned report URLs and raw SHA-256 hashes. Anyone can process the next trial; no one can skip or replace one. Leader and validators independently acquire the full report and assess five source-anchored dimensions: asset/trial identity, finality, continuous duration, minimum observed flow and shutdown freedom. Validators require exact decision values and audit the leader's anchors against the whole source.

Only consensus PASS/FAIL observations enter a reduced integer likelihood ratio. Failures multiply it by 4; passes multiply it by 2/3. At 20 the audit stops FLAG; at 1/20 it stops CLEAR. Exhaustion between the boundaries gives EXHAUSTED. Missing or unfinished evidence gives BLOCKED without changing the ratio or cursor. Terminal outcomes are immutable. These are documentary audit states, not monetary settlement or physical reliability certification.

- [Pinned GenLayer contract](contracts/wald_rail.py)
- [Protocol, mathematical assumptions and threat model](docs/architecture.md)
- [Direct tests and independent exact-arithmetic checks](tests/direct/test_wald.py)
- [Synthetic reports](reports) and [expected case vectors](config/scenarios.json)
- [Verified onchain proofs](proofs/README.md)
- [Submission text](docs/submission.md)

```sh
pip install -r requirements-dev.txt
genvm-lint download --version v0.2.16
genvm-lint check contracts/wald_rail.py --json
python -m pytest -q
node scripts/check-scenarios.cjs
```

Native CLI constructor arguments are `target`, `trial_ids`, `report_urls`, `report_hashes`. Arrays must be supplied as native JSON arrays to `genlayer deploy --args`. Call `step` with the current integer cursor; `get_state` exposes the manifest, exact numerator/denominator, accepted records and latest attempt. The manual workflow deploys and verifies four cases on gasless StudioNet using encrypted disposable CLI accounts.

Sequential likelihood-ratio testing is established statistics. This implementation binds the test's consequential observations and stopping state to independently checked external prose. Statistical error bounds require a valid sampling model and correctly classified reports; the selected synthetic fixtures demonstrate execution only. A trusted precommitted sampling plan and authentic observations remain external requirements. See the full threat model before interpreting CLEAR or FLAG.

Generic CLI transport and test-environment helpers are adapted from [BrierCommit](https://github.com/ehsanisildur-ux/brier-commit) under MIT. WaldRail's audit protocol, contract, report fixtures and exact stopping tests are implemented for this repository.
