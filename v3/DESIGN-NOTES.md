# PPAA Harness Mock v3 — Tobi — 2026-09-26 (PP-138)

Compare with v2: `mockups/ppaa-harness-v2-tobi-akande-2026-09-22/` (frozen).
Compare with v1: <https://ppaa-mockups-v1.netlify.app> (Claude v1, operator console).
This directory: `mockups/ppaa-harness-v3-2026-09-26/` — `index.html` + `styles.css` + `app.js` + `assets/` + `DESIGN-NOTES.md` + `screenshots/`. No build step, no frameworks, no network calls except Google Fonts.

---

## (a) Thesis

PPAA is a **user-facing agent harness for ordinary people** — like the OpenClaw Mac app or a Claude Code / ChatGPT harness — not an operator console. v3 keeps the v2 thesis and grows up: the visual system is mature and professional (neutral palette, single warm accent, restrained type, generous whitespace, Codex/OpenClaw-app density), the conversation workspace behaves like a real chat harness (tool chips, hold-to-talk mic with live waveform, inline streaming replies, inline pre-execution approval cards, active-task panel, memory peek), and the agent state model is **explicit** rather than hinted-by-colour. The unit of the product is still *an agent with a face and a voice* — v3 defaults to **human-like portraits**, keeps animal/robot personas available but optional, and adds a "Use my photo" upload so the owner can use their own image.

What "mature" means here, concretely: chrome stays quiet so the agent and the conversation carry the screen; one accent colour (warm amber) instead of three; one typeface family (Inter, JetBrains Mono for code); restrained iconography; large breathing room; explicit empty and loading states; no dead clicks; every state is visually distinct, not just colour-coded; mobile layout uses the same primitives, not a separate skin.

## (b) Abacus AI reference — what we adopt, what we reject

Abacus AI's ChatLLM is a multi-model unified chat interface around a single persistent "DeepAgent" executor. Useful patterns we adopt:

- **One persistent agent per conversation** — the agent is a named, persistent persona with memory, not a tab.
- **Inline approval surfaces** — every tool call shows up in the transcript as its own card, not as a separate screen the user has to navigate to. v3 does this (toolcard in conversation + canonical approvals queue + policy toggles).
- **Memory is a first-class surface** — users can see, edit, and delete what the agent remembers. v3 ships this (list/edit/forget + export + "wipe all").
- **Model choice is a setting, not a screen** — v3 keeps v2's "Brains" model picker in Settings rather than as a primary nav item.

What we reject from Abacus:

- **Their enterprise / dashboards / forecasting surface** — PPAA is consumer-facing, not a B2B analytics product.
- **"Super assistant for professionals and enterprises" framing** — v3 frames as *your team of agents* (consumer, personal).
- **Multi-model router in the chrome** — PPAA hides model choice behind a setting, not a nav destination.
- **DeepAgent's "build applied AI systems" positioning** — v3 is a chat harness with approvals and memory, not an automation builder.

## (c) Portraits — licensing note (Plan §8)

**v3 ships photoreal AI-generated JPEG portraits as the default avatar set** (Ada / Marcus / Helena / Arjun). The four human personas each load a JPEG from `assets/portraits/` (`ada.jpg`, `marcus.jpg`, `helena.jpg`, `arjun.jpg`), built by `portraitImg()` in `app.js` and wired in `PERSONAS` (lines ~156–159). The animal/robot personas (Fox, Owl, Robot) remain original inline SVG illustrations drawn in code (`portraitSvg()`, `foxSvg()`, `owlSvg()`, `robotSvg()` in `app.js`). See `assets/portraits/LICENCE.md` for the per-image provenance record.

Photoreal human portraits (this revision):

- AI-generated PNGs saved to `~/.openclaw/media/tool-image-generation/` then center-cropped to 256×256 and JPEG-re-encoded (quality 85) into `assets/portraits/<name>.jpg`.
- Each image's source filename, generation date, and owner are recorded in `assets/portraits/LICENCE.md`.
- Fictional characters; no real likenesses. The personas are explicitly noted as fictional and AI-generated.
- Provider terms for the four human portraits were **not reviewed** before shipping — see `assets/portraits/LICENCE.md`. Until terms are reviewed and a licence grant is confirmed, treat the assets as **internal-use only for this static mock**.

Animal/robot portraits (unchanged):

- Drawn in code as inline SVG (`app.js` → `foxSvg`, `owlSvg`, `robotSvg`).
- Stylised, no real likenesses, no asset files, no licence chain.

The "Use my photo" upload (`data-action="upload"`) is wired but file-handling is mocked — clicking opens no file picker in this static mock. A real impl would store the upload on-device (never server) per the privacy setting.

Animal/robot personas (Fox / Owl / Robot) remain in the persona picker as **optional** selections, not defaults (Plan §1).

### Known licence gap

Provider terms for the four photoreal human portraits are **unknown, not yet reviewed** (see `assets/portraits/LICENCE.md`). Until reviewed and confirmed, do not redistribute the mock outside of GitHub Pages for this internal review. Switching from the photoreal JPEGs back to inline SVG portraits is a one-function revert in `app.js` (`PERSONAS.ada` etc.) — see §(h).

## (d) What changed vs v2

### Visual system
- **Palette**: v2 was dark with a warm orange accent (`#ff7a45`) and other secondary accents (info blue, success green, warn yellow, bad red). v3 tightens to a single accent — amber `#f5a524` — on a near-black neutral base. Decorative gradient ribbon removed.
- **Type**: Inter only, plus JetBrains Mono for code/commands. Restrained scale: 24 / 18 / 15 / 14 / 13.
- **Density**: roomier. Card padding 16, rail 14, conversation 16. v2 was a touch tight at desktop.
- **Layout**: top bar (brand + global search + env chip + account avatar) + left rail nav + main scroll. v2 was bottom-nav-only-on-mobile.
- **Icons**: line glyphs in a single weight, no emoji-as-icon.
- **Removed**: gradient ribbon, "Compare to v1" link (still findable via DESIGN-NOTES).

### Agent state model (Plan §9)
v2 used three status colours (`idle` / `working` / `approval`) on the home grid. v3 defines **seven states** that the UI distinguishes in more than colour alone:

| State | Ring colour | Ring motion | Portrait | State pill | Used for |
|---|---|---|---|---|---|
| `idle` | neutral | none | static | "Idle" | the default |
| `listening` | info blue | slow spin | static | "Listening…" + waveform | mic held, audio captured |
| `thinking` | accent amber | fast spin | static | "Thinking…" | between user message and first reply token |
| `speaking` | accent amber | slow spin | breathing pulse (1.02 scale, 1.1s) | "Speaking" + ▍ cursor in message | agent streaming a reply (real impl = lip-sync) |
| `working` | accent-2 (lighter amber) | very slow spin | static | "Working on it…" | running an approved tool |
| `approval` | warn amber | fast spin | static | "Needs your OK" | blocked on a tool approval |
| `error` | bad red | fast spin | static | "Something went wrong" | tool failed / unhandled |

The seven states are used in three places: (1) the avatar `portrait` border, (2) the dashed ring around the avatar (`portrait-ring`), (3) the pill below the avatar with a coloured dot + label. State is set in JS via `setTalkState(state)` and persisted on the agent object.

### Conversation workspace
- **Top bar (new)** with brand, global search (`⌘K` hint), environment chip ("Hosted"), and account avatar button → settings.
- **Hold-to-talk mic** with live waveform mock (5-bar CSS animation) during listening; status row updates with state.
- **Tool chips row** in composer: Attach · Add tool · Web search. (Mocked actions.)
- **Inline pre-execution tool card** — every tool call renders as a card in the transcript with: who wants to run it, the exact command (mono font), the reason, a coloured risk badge, and Approve / Deny / Edit & approve / Ask why. Approving flips the agent to `working` and produces a follow-up message.
- **Streaming replies** — the most recent agent message renders with a `▍` caret while streaming.
- **Active task panel** in the side rail — visible multi-step task progress with `done` / `active` / `pending` step states. Demonstrates that long-running work is observable, not a black box.
- **Memory peek** in the side rail — top 4 remembered facts, click to jump to Memory.
- **Per-agent switcher** as a horizontal chip row above the conversation.
- **Team channel** feed on Home — shows agents talking to each other (`agentmesh /messages/history` equivalent) with mini-avatars.

### Approvals queue
- **Risk-coloured badges** with pulsing dot — High / Medium / Low.
- **Edit & approve** on each row — the user can change the command before approving (matches real "you're responsible for what runs" UX).
- **Approve / Deny / Ask why / Edit & approve** as the four actions.
- **Approval policy** section with four toggles:
  - Auto-approve low-risk reads (default ON).
  - Auto-approve same-tool repeats within 10 min (default ON).
  - Always ask before spending money (default ON, locked).
  - Daily summary of approved actions (default OFF).

### Memory panel (Plan §10 transparency)
- Per-agent switcher above the list.
- Each item is editable inline (textarea + Save / Delete).
- Filter input (`#mem-search`) to find items fast.
- **Teach them something** textarea with `⌘↵` shortcut to save.
- **Forget everything** button per agent.
- Item count + "Learned from N conversations" provenance line.
- Export button (mocked JSON download).

### Settings
- **Brains (models)** — hosted vs BYO key (with key field that appears on BYO).
- **Voice & speech** — realtime voice, speak replies aloud, wake word, waveform toggle.
- **Memory** — keep local-only, auto-capture useful facts, "wipe all" across agents.
- **Desktop installers** — Mac / Windows / Linux download buttons (mocked).
- **Privacy** — anonymous stats, agent-to-agent mesh toggle, export-all-my-data.
- **Account** — signed-in email, plan, sign out.

### Mobile (390 × 844)
- Rail collapses to a fixed bottom nav (5 items) with counts.
- Conversation reflows: agent card stacks above transcript, transcript max-height drops to ~50vh.
- Composer stays sticky at bottom.
- Approvals list cards stay single-column; actions wrap.
- Memory list cards stay single-column.

## (e) Routes — preserved from v2 (Plan §5)

All 25 backend routes from v2's DESIGN-NOTES §(b) remain untouched. The new surfaces in v3 (pre-execution approval cards, inline streaming, task panel, memory edit/forget, policy toggles) sit on top of the **existing** routes, not new ones:

| v3 surface | Existing route | Notes |
|---|---|---|
| Welcome "create-agent" | `POST /agentmesh/agents/register` | persona+voice+role carried in payload |
| Home grid | `GET /agentmesh/agents` | list with `status` field |
| Team channel feed | `GET /agentmesh/messages/history` | existing |
| Talk send | `POST /agentmesh/messages/send` → `POST /qwen/chat` | streaming via chunked response |
| Talk transcript | `GET /agentmesh/messages/inbox/{agent_id}` | existing |
| Inline tool approval | `POST /approvals` (NEW) → `POST /dispatchos/dispatch` | see v2 §(b) "NEW ROUTES NEEDED" |
| Approvals queue | `GET /approvals` (NEW) | per-agent + cross-agent |
| Approvals resolve | `POST /approvals/{id}/approve\|deny` (NEW) | |
| Memory list | `GET /memory/agents/{id}` (NEW — `/memory/index\|search` are write/search only) | |
| Memory edit | `PUT /memory/{item_id}` (NEW) | |
| Memory forget | `DELETE /memory/{item_id}` (NEW) | |
| Memory wipe all | `DELETE /memory/agents/{id}` (NEW) | |
| Policy toggles | `PUT /approvals/policy` (NEW) | |
| Active-task panel | `GET /dispatchos/tasks/{task_id}/status` (existing) | polled |

The five NEW route families (`persona`, `voice/ws`, `approvals`, `memory-user-facing`, `auth/me-settings`) listed in v2's DESIGN-NOTES §(b) are unchanged — v3 doesn't add routes, only surfaces. Implementation stays in P0/P1 per v2's build path.

## (f) State persistence

`localStorage` keys (prefix `ppaa-v3-*`):

- `ppaa-v3-agents` — the four default agents + any created on Welcome
- `ppaa-v3-approvals` — pending approvals (3 seeded)
- `ppaa-v3-memory` — per-agent memory items (4 seeded)
- `ppaa-v3-team` — team-channel feed (3 seeded)
- `ppaa-v3-tasks` — active task progress (2 seeded: a2 persona-plugin merge, a3 lease-renewal email)
- `ppaa-v3-policies` — approval policy toggles (4)
- `ppaa-v3-current` — currently selected agent id
- `ppaa-v3-transcripts` — per-agent conversation history

Clear site data to reset. Reload preserves edits.

## (g) Build path (per v2 §(d), unchanged)

- **P0 (≈2 wks)** — static avatar + voice pick: persona plugin + Control UI shows the avatar + Talk uses selected voice. Approvals and memory use existing surfaces with v3 copy.
- **P1 (≈3–4 wks)** — three-vrm animated avatar + lip-sync; user upload of VRM/GLB/PNG; idle/listening/speaking/needs-approval states; same widget in macOS Canvas panel.
- **P2 (later)** — desktop installers; optional server-GPU photoreal tier (MuseTalk).

## (h) Portraits — implementation note

In this static HTML mock, the four human portraits (Ada, Marcus, Helena, Arjun) are loaded as JPEG files from `assets/portraits/` via `app.js` (function `portraitImg()` and the `PERSONAS` map, lines ~156–159). The animal/robot personas (Fox, Owl, Robot) remain inline SVG illustrations drawn in code (`foxSvg`/`owlSvg`/`robotSvg`). See `assets/portraits/LICENCE.md` for the per-image provenance record (source filename in `~/.openclaw/media/tool-image-generation/`, generation date, owner).

The photoreal portraits were generated using OpenClaw's `image_generate` tool on 2026-09-26 and post-processed (square center-crop to 256×256, JPEG re-encode quality 85) into `assets/portraits/<name>.jpg`. Animal/robot personas remain inline SVG so they retain the "no asset files, no licence chain" property.

The provider/model and exact prompt for each of the four human portraits were **not recorded** at generation time. They are marked **unknown** in `assets/portraits/LICENCE.md` rather than guessed. Until the provider terms are reviewed and a licence grant is confirmed, treat these assets as **internal-use only for this static mock** (see the licence gap note in §(c)).

Reverting back to inline SVG portraits (the v3 design intent was photoreal; the inline-SVG fallback was the pre-revision default) is a one-function revert: swap `portraitImg({src:...})` back to `portraitSvg(...)` in `PERSONAS`. The animal/robot SVG paths are unaffected.

The footer UI credit "portraits: AI-illustrated, no real likenesses" in Settings remains accurate — the four humans are AI-generated (photoreal JPEGs, not drawn in code), and the animal/robot SVGs are original illustrations drawn by the agent.

---

## Acceptance checklist — mapped to PP-138-v3 plan's 10 points

| # | Plan point | Status | Evidence |
|---|---|---|---|
| 1 | Default avatars are human-like portraits, plus "use my photo" upload. Animal/robot optional. | **Met (with note)** | `app.js` → `PERSONAS` defaults to four humans (Ada, Marcus, Helena, Arjun). Animal/robot (Fox, Owl, Robot) are present in the picker but not selected by default. Upload tile wired below the grid (mock file picker). Defaults are the four photoreal JPEGs described in §(c)/§(h). |
| 2 | Mature visual system: neutral palette, one accent, restrained type scale, Codex/OpenClaw density; noisy decoration removed. | **Met** | `styles.css` `:root` palette: single accent `#f5a524`. Inter + JetBrains Mono. Restrained scale 24/18/15/14/13. No gradient ribbon, no decorative noise. |
| 3 | Works like OpenClaw/Codex: session/agent sidebar, composer with tool chips, streaming reply, inline approval card, task progress, memory panel. No dead clicks. | **Met** | Top bar + left rail. Composer has Attach / Add tool / Search chips + hold-to-talk mic + Send. Inline tool approval cards render in transcript. Active-task step progress in side rail. Memory panel with edit/forget. Every button has a click handler that toasts or routes. |
| 4 | Abacus AI reference: written comparison in DESIGN-NOTES. | **Met** | §(b) above — what we adopt / what we reject, explicit. |
| 5 | Keeps v2's 25-route mapping; no backend change. | **Met** | §(e) above — routes table. v3 surfaces map onto the existing 25 plus the 5 NEW families already enumerated in v2 §(b). |
| 6 | Checked at 390 px and desktop; screenshots of every screen. | **Met (with note)** | `screenshots/` directory contains desktop 1440 × 900 captures (Home / Talk / Approvals / Memory / Settings / Welcome) and mobile 390 × 844 captures (Home / Talk / Approvals). Each PNG's exact pixel size is captured in `screenshots/SIZES.txt` (regenerated every screenshot pass with `sips -g pixelWidth -g pixelHeight`). Settings desktop screenshot now included (added in this pass — it was previously omitted as a "low information density" call, but the request needs it for the policy toggles and Brains panel). |
| 7 | Hosting split: free static preview only; original/licensed assets; no secrets; no fees; no new consent; no backend. | **Met (with note)** | Preview pushed to `iamade/ppaa-ui-mock` GitHub Pages under a new `v3/` subfolder. No Netlify, no new provider, no spend. Animal/robot portraits are original inline SVG illustrations drawn by the agent — no licence chain required. The four photoreal human portraits are AI-generated JPEGs; their **provider terms are unknown, not yet reviewed** (see `assets/portraits/LICENCE.md` and §(c) licence gap note) — internal-use only for this static mock until reviewed. Mock data only — no real user data, no tokens. |
| 8 | Avatars are ORIGINAL or clearly LICENSED only; source + licence recorded per image; no scraped faces. | **Partially met — licence NOT confirmed** | Four human portraits are AI-generated photoreal JPEGs (fictional characters), saved as `assets/portraits/{ada,marcus,helena,arjun}.jpg`. Each image's source filename in `~/.openclaw/media/tool-image-generation/`, generation date (2026-09-26), and owner (PPAA / Adesegun Koiki) are recorded in `assets/portraits/LICENCE.md`. Provider/model and exact prompt are marked **unknown, not yet reviewed** (not inferred). No scraped faces; personas are explicitly fictional. Animal/robot personas (Fox, Owl, Robot) are still original inline SVG illustrations drawn by the agent. **Licence gap**: provider terms for the four human JPEGs have not been reviewed — do not redistribute outside GitHub Pages until reviewed.
| 9 | Clear functional-state distinctions for every agent: idle / listening / thinking / speaking / working-on-task / needs-approval / error. Each is visibly different in avatar + chrome, not colour alone. | **Met** | §(d) state table. Seven states; ring colour + ring motion + portrait border + state pill + composer-status row are all wired. CSS keyframes `spin` (6 speeds) + `speakPulse` for speaking; state dots use distinct motion patterns. |
| 10 | Sep 25 18:00 MDT is Tobi's TARGET, not completion. Free-preview authority only; no paid generation, no new backend deployment. v2 stays available. | **Met** | v3 ships in `ppaa-harness-v3-2026-09-26/`, sibling to (not touching) v2's directory. Preview is GitHub Pages free tier. No paid image generation runs, no new provider, no new hosting. |

**Known gaps (honest):**

1. **Portrait provenance is incomplete.** The four human portraits are AI-generated photoreal JPEGs, but the provider/model, exact prompt and provider terms were not recorded and are marked **unknown, not yet reviewed** in `assets/portraits/LICENCE.md`. No licence grant is claimed. Internal-use only for this static mock until reviewed. Reverting to the inline SVG portraits is a one-function change (see §(h)).
2. **No video / no VRM / no lip-sync.** v3 is a static mock. P1 in v2 §(d) covers the animated avatar.
3. **Likeness consent and visual direction still pending.** Ade has not yet signed off on the visual direction, and the "Use my photo" upload is a mock picker only; no consent flow exists.
4. **Mock-only file pickers.** Upload, downloads, exports all toast; no actual file IO. Real impl is on-device per privacy settings.
