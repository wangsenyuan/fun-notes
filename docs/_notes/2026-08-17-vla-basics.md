---
title: Vision-Language-Action (VLA) Basics for Robot Projects
tags: robotics, VLA, AI, vision, language, control
date: 2026-08-17
---

A **Vision-Language-Action (VLA)** model is a single neural net that takes camera images and a natural-language instruction (plus robot state), and outputs motor commands. The same weights can follow “pick up the red cup” and “put the banana in the bowl” without swapping controllers.

If you already know VLMs (GPT-4o, PaliGemma, LLaVA): a VLA is a VLM that learned to **speak robot actions** instead of only speaking text.

![VLA pipeline]({{ site.baseurl }}/assets/vla-pipeline.svg)

---

## 1. The problem VLAs are solving

A classic manipulation stack is a pipeline of specialists:

1. **See** — detect objects, estimate pose
2. **Plan** — pick a grasp, a path, a sequence of skills
3. **Act** — inverse kinematics + low-level tracking

Each box is brittle. A new object, a new verb, or a slightly different table often means new code or a new policy.

VLAs collapse the middle of that stack into one **language-conditioned policy**:

```text
(images, instruction, proprioception)  →  action chunk
```

Language is the task API. You do not compile “put the cup in the sink” into a finite-state machine; you condition the policy on that sentence.

They are **not** magic. They still need demonstrations, a well-defined action space, and a control loop that is fast enough for the robot. What they buy you is **generalization through language and internet-scale vision**, plus a path to reuse one backbone across many tasks.

---

## 2. The closed-loop picture

At inference the robot does not “think once and execute a movie.” It runs a loop, typically 5–50 Hz:

1. Read cameras + joint/gripper state
2. Run the VLA → a short **action chunk** (e.g. the next 8–50 timesteps)
3. Send those actions to the robot
4. Observe again (closed loop)

**Action chunking** is the important implementation trick. Predicting a horizon of future actions at once:

- hides LLM latency behind several control ticks
- makes motion smoother than one-step greedy actions
- reduces compounding error versus open-loop “plan the whole episode”

You still replan every chunk. Think of it as receding-horizon control with a neural net as the planner.

A functional sketch of the loop:

```python
def predict_chunk(model, images, instruction, state):
    return model(images, instruction, state)

def run_episode(model, instruction, sense, send, done):
    def step(state):
        images, proprio = sense()
        chunk = predict_chunk(model, images, instruction, proprio)
        return send(chunk)

    def loop(state):
        return state if done(state) else loop(step(state))

    return loop(None)
```

The real system adds safety limits, action un-normalization, and a fallback if inference is late.

---

## 3. Anatomy of a VLA

Almost every current VLA is three pieces glued together.

### Vision encoder

Turns pixels into tokens. Common choices: **SigLIP** (semantic / language-aligned) and **DINOv2** (spatial / geometry). OpenVLA fuses both: semantics for “which object is the cup,” spatial features for “where is it in the gripper frame.”

Typical inputs: one scene camera, often a wrist camera. More views help grasping; they also cost compute.

### Language backbone (VLM)

A pretrained transformer that already maps images + text into a shared space. This is where internet knowledge lives: “a sponge is for wiping,” “red is a color,” “a sink is a container.” RT-2’s headline result was that this knowledge **transfers** into robot behavior when you co-train on actions.

### Action head

The part that is actually robotics. Two main families:

| Family | How actions are produced | Strength | Cost |
| ------ | ------------------------ | -------- | ---- |
| **Discrete tokens** (RT-2, original OpenVLA) | Bin each action dim (often 256 bins) and emit tokens like language | Reuses the LLM decoder as-is; simple training | Quantization error; slow if you decode token-by-token |
| **Continuous / flow matching** (π0) | An action expert denoises a continuous vector (diffusion / flow) | Smooth, high-rate, better for dexterity | Extra module; different training recipe |
| **Dual-system** (GR00T N1, Helix-style) | Slow VLM for semantics + fast expert for motor commands | Splits “what” from “how” | More moving parts |

A typical action vector (per timestep) looks like:

```text
[Δx, Δy, Δz, Δroll, Δpitch, Δyaw, gripper]
```

in end-effector space, or joint-space deltas for some arms. Values are **normalized** to the dataset (often into `[-1, 1]`) before training; you must invert that transform on the robot.

---

## 4. Landmark models (enough history to read papers)

| Model | What to remember |
| ----- | ---------------- |
| **RT-1** (Google, 2022) | Transformer policy on many robot demos. Language-conditioned, but not yet a web VLM. |
| **RT-2** (2023) | Coined **VLA**. Fine-tune a web VLM so action tokens live in the same vocabulary as words. Emergent semantic generalization (“move the coke can onto the picture of an extinct animal”). |
| **Open X-Embodiment / RT-X** | Many labs, many robots, one dataset. The pretraining corpus behind most open VLAs. |
| **OpenVLA** (2024, 7B) | First widely used open VLA. Llama 2 + SigLIP/DINOv2, ~970k OXE episodes. Fine-tune with LoRA on a single GPU. |
| **Octo** | Smaller generalist diffusion policy; good baseline, less “LLM reasoning.” |
| **π0 / π0.5** (Physical Intelligence) | PaliGemma-scale VLM + **flow-matching action expert**. Smooth ~50 Hz chunks; current mental model for “modern VLA.” |
| **SmolVLA / LeRobot policies** | Hugging Face stack aimed at actually running on a desk robot (SO-100, ALOHA, etc.). Start here if you have hardware. |
| **GR00T N1** (NVIDIA) | Cross-embodiment / humanoid-oriented dual-system VLA. |

You do not need to reimplement these. You need to know **which action head you are inheriting**, because that choice dominates latency, precision, and how you collect data.

---

## 5. How they are trained

Two-phase recipe, almost always:

1. **Pretrain** a VLM on web image–text (already done for you).
2. **Robot-train** on demonstration trajectories: at each timestep, given `(images, instruction, state)`, predict the human/teleop action.

That is **behavior cloning** (imitation learning) at heart. Scale and diversity do the heavy lifting:

- many tasks, many objects, many cameras, several embodiments
- language that actually varies (not one canned sentence per skill)
- failures and recoveries, not only clean successes

Fine-tuning for *your* robot is usually **LoRA** (or similar PEFT) on a few hundred to a few thousand episodes, not training 7B weights from scratch.

What VLAs generally are **not** (yet) in a beginner project:

- full online RL from scratch on the real robot
- a replacement for a safety-rated motion stack
- a mapping from a single photo to a whole long-horizon program without a loop

Some systems add a high-level planner (another LLM) that emits subgoals, then a VLA executes each subgoal. That is a **hierarchy**, not a different definition of VLA.

---

## 6. What “good data” means

The model can only follow language that is **grounded in the demos**.

Useful collection habits:

- **One instruction per episode**, but many phrasings across the dataset (“place the mug in the dish rack” / “put the cup away”).
- **Wrist + scene cameras**, synced with actions.
- **Fixed control rate** (e.g. 20 Hz). Do not mix 5 Hz and 50 Hz in one action space without resampling.
- **Relative actions** in a consistent frame (often end-effector in the robot or camera frame).
- **Coverage**: start poses, object positions, lighting, clutter. VLAs interpolate; they do not invent kinematics you never showed.

Open datasets to know: **Open X-Embodiment**, **DROID**, **ALOHA / Mobile ALOHA**. For a personal project, your own teleop on one platform will beat a giant mismatched corpus.

---

## 7. A practical path on a real robot

A sane beginner sequence:

1. **Pick a supported stack** — Hugging Face **LeRobot** plus a cheap arm (SO-100 / SO-101, ALOHA-like) is the shortest path to a working VLA loop. Avoid building camera sync, dataset format, and training glue yourself.
2. **Define a tiny skill** — e.g. pick a single cube and drop it in a bowl. One verb, one object class, one workspace.
3. **Teleoperate 50–100 clean episodes** before you touch a 7B model. If a simple ACT / diffusion policy cannot clone this, a VLA will not save you.
4. **Fine-tune a small VLA** (SmolVLA, π0-style, or OpenVLA-OFT) with LoRA. Freeze most of the LLM; train the action path.
5. **Evaluate closed-loop**, not MSE on actions. Success rate from varied starts is the only metric that matters.
6. **Then** scale language diversity, objects, and model size.

Hardware reality check:

| Piece | Why it matters |
| ----- | -------------- |
| Camera latency + sync | The model sees the past; unsynced wrist cameras look like a different robot |
| Inference device | 7B unquantized is a 4090/A100 class problem; 4-bit + small VLAs fit hobby GPUs |
| Control rate | Discrete token VLAs often sit at ~3–5 Hz unless you use parallel decoding / chunking |
| Action limits | Always clamp in Cartesian/joint space; the net will occasionally output nonsense |

---

## 8. Common failure modes

- **Language that was never in training** — “gently” or “the one on the left” only works if demos teach those words.
- **Distribution shift** — new table texture, a novel mug shape, a camera that moved 3 cm.
- **Quantized actions on precise tasks** — inserting a peg, zipping, folding: prefer continuous action heads.
- **Open-loop chunks that are too long** — the world moved; the chunk did not.
- **Evaluating with teacher-forced MSE** — low action error can still mean 0% task success.
- **Ignoring the low-level controller** — VLA outputs setpoints; something still has to track them safely.

---

## 9. Mental model to keep

```text
VLM  =  see + read  →  text
VLA  =  see + read  →  motor commands   (often still internally “tokens”)
```

Three questions when you read a VLA paper or pick a checkpoint:

1. **Action representation** — discrete bins, continuous regression, or flow/diffusion?
2. **Chunk horizon and control frequency** — can it keep up with *your* arm?
3. **What was it trained on** — embodiment, cameras, action frame, language style?

If those three match your robot, fine-tuning is plausible. If they do not, you are doing a transfer problem, not a drop-in deploy.

---

## 10. Where to go next

- RT-2 paper — why action tokens + web VLMs generalize
- OpenVLA — open 7B recipe, LoRA fine-tuning, OXE
- π0 — flow-matching action expert, high-rate chunks
- Hugging Face LeRobot docs / policies — the implementation layer you will actually run
- Open X-Embodiment — what “cross-robot pretraining data” looks like

For this notes repo, the takeaway is small: **a VLA is a language-conditioned visuomotor policy built on a pretrained VLM.** Everything else — tokens vs flow, chunking, LoRA, OXE — is how that idea is made fast and trainable on a real arm.
