# Portrait asset licence

The four human portraits used by the PPAA harness mock v3 are AI-generated
images, generated for this project only and never depicting real people.

## Per-image provenance

| File | Tool | Model / provider | Prompt | Source file (internal, in `~/.openclaw/media/tool-image-generation/`) | Generation date | Owner |
|---|---|---|---|---|---|---|
| `ada.jpg` | OpenClaw `image_generate` | unknown, not yet reviewed | unknown | `portrait-1-ada---42ef8457-5de2-459d-825b-6cdb6cd9c3fe.png` | 2026-09-26 | PPAA / Adesegun Koiki |
| `marcus.jpg` | OpenClaw `image_generate` | unknown, not yet reviewed | unknown | `portrait-2-marcus---92ee7fd4-57da-438c-85b1-65444b574122.png` | 2026-09-26 | PPAA / Adesegun Koiki |
| `helena.jpg` | OpenClaw `image_generate` | unknown, not yet reviewed | unknown | `portrait-3-helena---f7643652-8727-41b3-83cf-d4788881c60d.png` | 2026-09-26 | PPAA / Adesegun Koiki |
| `arjun.jpg` | OpenClaw `image_generate` | unknown, not yet reviewed | unknown | `portrait-4-arjun---fa2e847c-51da-435d-870b-e8e64935cd10.png` | 2026-09-26 | PPAA / Adesegun Koiki |

**Model and prompt were not recorded at generation time and are intentionally
left as `unknown` rather than inferred.** Confirm the provider / model / exact
prompt by cross-referencing the OpenClaw gateway call log for 2026-09-26
before claiming any licence grant beyond what this file says.

## Backup grid (not used in the mock)

A separate `pp138-v3-portraits-grid---c82ddcec-dcf1-40d6-ac6f-228f48ec367b.png`
file exists in `~/.openclaw/media/tool-image-generation/`. According to
OpenClaw's media metadata, that backup grid was generated via
`minimax/image-01`. It is **not** referenced anywhere in this mock and is
**not** the source of any of the four shipped JPEGs. It is listed here only
to avoid confusion if anyone searches for it.

## Licence grant — what we claim (and what we do not)

- **Subject**: fictional people. The personas "Ada", "Marcus", "Helena", and
  "Arjun" are fictional characters for this product mock. None of these
  images are likenesses of real people.
- **Post-processing**: square center-crop to 256×256, JPEG re-encode (quality 85).
- **Storage / use**: served from this static mock only (GitHub Pages
  `iamade/ppaa-ui-mock` under `v3/`). No real user data, no third-party
  redistribution. Animal/robot persona images (fox, owl, robot) remain
  original inline SVG illustrations drawn in code by the agent.
- **Provider terms**: **unknown, not yet reviewed.** Until the provider /
  model terms for the four human JPEGs are reviewed and a licence grant is
  confirmed in writing, treat these assets as **internal-use only for this
  static mock**. Do not reuse for unrelated purposes, do not redistribute
  outside GitHub Pages, and do not claim a licence grant beyond what this
  file states.

## How to revert

Switching from the photoreal JPEGs back to inline SVG portraits is a
one-function revert in `app.js` — swap each `PERSONAS` entry's `build`
from `portraitImg({src:'assets/portraits/<name>.jpg', ...})` back to
`portraitSvg({...})`. The animal/robot SVG paths are unaffected. See
`DESIGN-NOTES.md` §(c) and §(h) for the full context.
