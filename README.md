# vitaeflow

[![CI](https://github.com/VitaeFlow/vitaeflow-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/VitaeFlow/vitaeflow-cli/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vitaeflow.svg)](https://www.npmjs.com/package/vitaeflow)
[![license](https://img.shields.io/npm/l/vitaeflow.svg)](LICENSE)

CLI for the [VitaeFlow](https://vitaeflow.org) open standard — validate, embed, extract, and inspect structured resumes in PDFs.

## Install

```bash
npm install -g vitaeflow
```

Or use directly with `npx`:

```bash
npx vitaeflow <command>
```

## Quick start

```bash
vitaeflow validate resume.json            # Validate a JSON resume
vitaeflow embed cv.pdf resume.json        # Embed data into a PDF → cv.vf.pdf
vitaeflow extract cv.vf.pdf               # Extract JSON from a PDF
vitaeflow inspect cv.vf.pdf               # Check if a PDF contains VitaeFlow data
```

## Commands

### `validate` — Validate a JSON resume

```bash
vitaeflow validate resume.json
# ✓ Valid resume (strict mode)

vitaeflow validate resume.json --mode tolerant
# ✓ Valid resume (tolerant mode)

vitaeflow validate bad.json
# ✗ Invalid resume (strict mode) — 2 error(s)
#
#   / Missing required property: profile
#   / Missing required property: basics
```

| Flag | Description | Default |
|------|-------------|---------|
| `-m, --mode <mode>` | `strict` or `tolerant` | `strict` |
| `--json` | Output result as JSON | |

### `embed` — Embed a resume into a PDF

```bash
vitaeflow embed cv.pdf resume.json
# ✓ Embedded resume → cv.vf.pdf

vitaeflow embed cv.pdf resume.json -o output.pdf
# ✓ Embedded resume → output.pdf
```

The resume is validated in strict mode before embedding. Output defaults to the `.vf.pdf` suffix (e.g. `cv.pdf` → `cv.vf.pdf`).

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <path>` | Custom output path | `<input>.vf.pdf` |

### `extract` — Extract resume data from a PDF

```bash
vitaeflow extract cv.vf.pdf
# { "version": "0.1", "profile": "standard", ... }

vitaeflow extract cv.vf.pdf -o resume.json
# ✓ Extracted resume → resume.json
```

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <path>` | Write JSON to file | stdout |
| `--json` | Output full result (resume + validation) as JSON | |

### `inspect` — Check if a PDF contains VitaeFlow data

```bash
vitaeflow inspect cv.vf.pdf
#
# File:      cv.vf.pdf
# VitaeFlow: Yes
# Valid:     Yes
# Version:   0.1
# Profile:   standard
# Sections:  work, education, skills, languages

vitaeflow inspect plain.pdf
#
# File:      plain.pdf
# VitaeFlow: No
#
# ✗ No VitaeFlow data found in this PDF.
```

| Flag | Description |
|------|-------------|
| `--json` | Output result as JSON |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success (valid, found) |
| `1` | Failure (invalid, not found) |
| `2` | Error (file not readable, unexpected crash) |

```bash
vitaeflow validate resume.json --json || echo "Resume is invalid"
```

## Ecosystem

| Project | Description |
|---------|-------------|
| [VitaeFlow Spec](https://github.com/VitaeFlow/vitaeflow-spec) | JSON schema and PDF embedding standard |
| [@vitaeflow/sdk](https://github.com/VitaeFlow/vitaeflow-js) | JavaScript/TypeScript SDK |
| [vitaeflow.org](https://vitaeflow.org) | Website with interactive tools |

## License

[MIT](LICENSE)
