# Onchain proofs

Four gasless StudioNet instances (chain **61999**) exercised the sequential audit. All **22 transactions** finalized with `MAJORITY_AGREE` and a strict majority of recorded votes: **19 successful executions**, including four deployments and 15 semantic audit calls, plus **three intentional rejections**. These are majority results, not unanimity; raw receipts preserve dissenting and idle votes.

## Cases

| Case | Contract | Deployment | Final observation transaction | Verified final state |
| --- | --- | --- | --- | --- |
| Eight qualifying trials | `0x0aeB1cA1E9b7E3e69105720108c130d68B513317` | [Deploy](https://explorer-studio.genlayer.com/tx/0xba9d1265465d884761fc6925e57cd14230d27ec928610f5fca2d6fb685702225) | [Eighth PASS](https://explorer-studio.genlayer.com/tx/0x84c9a9a15f0e04b6728ee23920bfaa026c287fe8e5bb76b659e84a992b4d7af1) | **CLEAR**, cursor 8, ratio **256/6561** |
| Three explicit failed trials | `0xd8bF043B9A4c9623c73174cCE4fA58751912FE6F` | [Deploy](https://explorer-studio.genlayer.com/tx/0x6b0b0c893aeb04c5465e0d896e2c988f9e2b875ce234f40708f66d37c9af21da) | [Third FAIL](https://explorer-studio.genlayer.com/tx/0x42c90c763ad37236faee79b00908389a9e8716488ddbbacfb4865f74a25e50e4) | **FLAG**, cursor 3, ratio **64/1** |
| PASS then FAIL, budget two | `0x683E0D0B4C935A67BA2D11f5be9996b80E8D99fE` | [Deploy](https://explorer-studio.genlayer.com/tx/0xad603a5a69ad71fe36acd151cc6f8893c1cdd830ddce4c2f3aad7d89c9deee85) | [Budget exhausted](https://explorer-studio.genlayer.com/tx/0xd71a73883c483fe2eacf2ab08606e203282819c92e46078500317471d9bbc9d4) | **EXHAUSTED**, cursor 2, ratio **8/3** |
| Forecast-only unfinished trial and decoy asset | `0x570EC6e59Db50CdB881103ad01A3E459D0d7a6AC` | [Deploy](https://explorer-studio.genlayer.com/tx/0x396c613821669e00ff5ea44e0afecca255ffbc0bf8be480446fe5dbae032fefc) | [VOID](https://explorer-studio.genlayer.com/tx/0x801f322a23f08590cb0fcff9e8a0b20b03a9d5fe02e11a382fe009384c333c16), [retry](https://explorer-studio.genlayer.com/tx/0x6778b479e39b6924a8c2451b2a176e48f20fe65d4c596241a2c381c033f69e27) | **BLOCKED**, cursor 0, ratio **1/1**, attempts 2, no accepted records |

CLEAR stops before a ninth committed report; FLAG stops before a fourth. The failure cases distinguish a short closed trial, minimum flow below the threshold despite a higher average, and interrupted runs that cannot be combined. A corrected report supersedes a withdrawn draft in the CLEAR path. Two different wallets alternate successful calls, demonstrating permissionless progression.

## Rejected calls

These receipts finalized with agreement on an `ERROR` execution. Their matching JSON files preserve identical pre/post states and the decoded rejection reason.

- [Skip the first report](https://explorer-studio.genlayer.com/tx/0xe24401a35b9aaf5008a43ddd142347429c2328ac61f909bf599fdfad2967ffa9): [call and state](clear-skipped.json), [decoded receipt](clear-skipped-decoded-receipt.json).
- [Resume a terminal CLEAR audit](https://explorer-studio.genlayer.com/tx/0x8d6ffeed98be0a6d6084468834f7288dbb09cb31fd2c9beef88cea8f820f13bc): [call and state](clear-terminal.json), [decoded receipt](clear-terminal-decoded-receipt.json).
- [Skip a BLOCKED report](https://explorer-studio.genlayer.com/tx/0xc60c7159638ce334c138b58e8245036d497064620214a268d3616b5ed2616c96): [call and state](blocked-skipped.json), [decoded receipt](blocked-skipped-decoded-receipt.json).

## Verification

[Manifests](deployments.json) bind each deployed address to its ordered trial plan, fixture revision and exact contract digest. [Transaction journal](transactions.json) lists all 22 hashes. Each transaction has its raw `*-receipt.json`; writes additionally have snapshots before and after execution. [Verification summary](verification.json) lists every receipt's finality, execution result and exact vote counts, plus fresh final states.

The verifier independently re-fetches all 22 receipts, requires a strict majority over recorded agree/disagree/idle votes, checks actual destinations and callers, and compares the saved votes. It binds all state snapshots to the immutable manifest, checks source bytes/hashes and paragraphs, expected dimension values, accepted record order, cursor/attempt counts, rejection reasons and unchanged rejected states. Prefix ratios are recomputed independently from counts using BigInt powers and rational reduction. It also compares the exact deployed source bytes and fresh `get_state` reads for all four instances. Offline verification replays the same checks against saved artifacts and cannot claim fresh RPC verification.

```sh
node scripts/verify-proofs.cjs --offline
# Fresh verification requires the GenLayer CLI and an unlocked account:
node scripts/verify-proofs.cjs
```

- [Successful CLI deployment and fresh verification workflow](https://github.com/mahdidaawsh-commits/wald-rail/actions/runs/39048565545).
- [Passing CI](https://github.com/mahdidaawsh-commits/wald-rail/actions/runs/39048484697): **57 direct tests**, [hosted test report](cloud-direct-tests.xml).
- Contract SHA-256: `0cc65fc6193500c12de9c1bfe2d0b348872754fa0ea3f11343be6a51b2f78323`.
- Report revision: `744f7020e18711bcac4494e5412f284ad95498c0`.

Tests explicitly replay validators, reject changed dimensions/source bytes, cover malformed model responses and missing evidence, check all **243** five-dimension label combinations and **8,190** binary prefixes with an independent Fraction oracle, and calculate capped-test boundary-error probabilities exactly. Direct tests use mocks; the onchain calls use live model/web consensus.

The reports are synthetic, selected and public before deployment; trial IDs encode case labels. This is protocol execution evidence, not a blind accuracy benchmark or authentic physical inspection. CLEAR/FLAG statistical interpretation requires a valid sampling model and correctly classified trustworthy observations, as explained in the [threat model](../docs/architecture.md). No money is held or paid.
