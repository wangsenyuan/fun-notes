---
title: VLA Beginner Docs — a reading list
tags: robotics, VLA, LeRobot, beginner, docs
date: 2026-08-17
---

Start with **LeRobot docs and Colabs**, not the 7B papers. ACT first (imitation learning), then SmolVLA (your first real VLA). The [VLA basics note]({{ site.baseurl }}/notes/2026-08-17-vla-basics/) is the concept map; this page is the official docs in a sensible order.

---

## Read in this order

### 1. Concepts (no GPU, no robot)

| Doc | Why |
| --- | --- |
| [🤗 Robotics Course — welcome](https://huggingface.co/learn/robotics-course/en/unit0/1) | Beginner syllabus. Python is enough. Units 5–7 (RL / IL / foundation models) are still rolling out. |
| [Unit 1 — robot learning](https://huggingface.co/learn/robotics-course/en/unit1/1) | Why we train from data instead of writing a planner. |
| [Unit 1 — what LeRobot is](https://huggingface.co/learn/robotics-course/en/unit1/2) | The library you will actually run. |
| [Robot Learning Tutorial](https://huggingface.co/spaces/lerobot/robot-learning-tutorial) | Longer companion (classical robotics → RL → imitation → foundation models). Skim until you need depth. |

### 2. Install and the CLI map

| Doc | Why |
| --- | --- |
| [LeRobot docs home](https://huggingface.co/docs/lerobot/) | The four-step loop: **teleoperate → record → train → deploy**. Pick “I have a robot” or “no hardware yet.” |
| [Installation](https://huggingface.co/docs/lerobot/installation) | Python ≥ 3.12. Use extras: `core_scripts` to record, `training` to train, `feetech` for SO-100/SO-101. |
| [Cheat sheet](https://huggingface.co/docs/lerobot/cheat-sheet) | Copy-paste `lerobot-record`, `lerobot-train`, `lerobot-rollout`. Keep this tab open. |

### 3. First policy: ACT (do this before any VLA)

ACT is the recommended first policy: small, fast to train, same data format as SmolVLA.

| Doc | Why |
| --- | --- |
| [ACT policy](https://huggingface.co/docs/lerobot/act) | What action chunking is, plus the `lerobot-train --policy.type=act` command. |
| [Imitation learning on real robots](https://huggingface.co/docs/lerobot/il_robots) | End-to-end on hardware: teleop, record, train ACT, evaluate. |
| [Train ACT Colab](https://colab.research.google.com/github/huggingface/notebooks/blob/main/lerobot/training-act.ipynb) | No local GPU. ~1.5 h / 100k steps on an A100; a T4 works, slower. |

### 4. First VLA: SmolVLA

Only after ACT clones a tiny skill (pick-and-place one object).

| Doc | Why |
| --- | --- |
| [SmolVLA docs](https://huggingface.co/docs/lerobot/smolvla) | 450M VLA. Fine-tune `lerobot/smolvla_base` on ~50 of *your* episodes. |
| [SmolVLA blog](https://huggingface.co/blog/smolvla) | Architecture in plain language (VLM + flow-matching action expert). |
| [Train SmolVLA Colab](https://colab.research.google.com/github/huggingface/notebooks/blob/main/lerobot/training-smolvla.ipynb) | Same Hub dataset workflow as the ACT notebook. ~5 h / 20k steps on an A100. |
| [Notebooks index](https://huggingface.co/docs/lerobot/notebooks) | Official Colab list. |

### 5. If you have (or will buy) an arm

| Doc | Why |
| --- | --- |
| [SO-101 assembly](https://huggingface.co/docs/lerobot/so101) | Flagship cheap arm: motors, calibrate, then jump to the IL tutorial. |
| [LeLab GUI](https://huggingface.co/docs/lerobot/lelab) | Browser app for SO-101: calibrate, record, train, deploy without memorizing CLI. |
| [Cameras](https://huggingface.co/docs/lerobot/cameras) | Find OpenCV / RealSense devices. Wrist + scene beats one laptop webcam. |
| [What makes a good dataset](https://huggingface.co/blog/lerobot-datasets#what-makes-a-good-dataset) | Two steady views, ~30 FPS, leader arm *out of frame*, ~50 episodes, a real task sentence not `task1`. |

Target: grasp an object in a few locations and drop it in a bin. Hugging Face suggests **≥ 50 episodes, ~10 per location**. You should be able to do the task yourself using **only** the camera feeds.

---

## Weekend path (no robot)

1. Robotics Course unit 0 + unit 1.
2. Install: `pip install 'lerobot[training]'` (or just open Colab).
3. Train ACT on a Hub dataset, e.g. something under [`lerobot` on the Hub](https://huggingface.co/lerobot).
4. Read the SmolVLA page and run the SmolVLA Colab on the same kind of dataset.

## Weekend path (SO-101 on the desk)

1. [SO-101](https://huggingface.co/docs/lerobot/so101) or [LeLab](https://huggingface.co/docs/lerobot/lelab).
2. Teleop until the motion is boringly consistent.
3. Record ~50 pick-and-place episodes ([IL tutorial](https://huggingface.co/docs/lerobot/il_robots) + [dataset checklist](https://huggingface.co/blog/lerobot-datasets#what-makes-a-good-dataset)).
4. Train **ACT**. If success is near zero, fix data/cameras — do not jump to a VLA.
5. Fine-tune **SmolVLA** on the same dataset.

---

## Save for later (not beginner)

These are real, but they assume you already have a working imitation loop.

- [π0 in LeRobot](https://huggingface.co/docs/lerobot/pi0) — flow-matching VLA, heavier than SmolVLA.
- [OpenVLA 7B model card](https://huggingface.co/openvla/openvla-7b) — load + `predict_action`. Needs a serious GPU; LoRA fine-tune is a separate repo.
- [OpenVLA GitHub](https://github.com/openvla/openvla) — research training, not the first clone-and-train.
- [Open X-Embodiment](https://robotics-transformer-x.github.io/) — the big multi-robot pretraining corpus.

---

## Community

- [LeRobot Discord](https://discord.gg/q8Dzzpym3f) — install, cameras, and “why is success 0%” questions.
- Hub search: datasets tagged `LeRobot`.
