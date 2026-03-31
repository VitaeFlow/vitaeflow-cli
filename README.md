# vitaeflow

CLI for the [VitaeFlow](https://vitaeflow.org) open standard — validate, embed, extract, and inspect structured resumes in PDFs.

## Installation

```bash
npm install -g vitaeflow
```

Or use directly with `npx`:

```bash
npx vitaeflow <command>
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

Options:

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

The output filename defaults to the recommended `.vf.pdf` suffix (e.g. `cv.pdf` → `cv.vf.pdf`). The resume is validated in strict mode before embedding — if invalid, the command fails with details.

Options:

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

Outputs the VitaeFlow JSON to stdout by default. Use `-o` to write to a file.

Options:

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

Options:

| Flag | Description |
|------|-------------|
| `--json` | Output result as JSON |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success (valid, found) |
| `1` | Failure (invalid, not found) |
| `2` | Error (file not readable, unexpected crash) |

Use `--json` with exit codes for CI/CD pipelines:

```bash
vitaeflow validate resume.json --json || echo "Resume is invalid"
```

## What is VitaeFlow?

VitaeFlow is an open standard for embedding structured JSON resume data in PDF files. A VitaeFlow PDF is a normal PDF readable by anyone, but it also contains machine-readable structured data (for ATS, job boards, HR tools). The `.vf.pdf` suffix is recommended, not required.

- [Specification](https://github.com/VitaeFlow/vitaeflow-spec)
- [JavaScript SDK](https://github.com/VitaeFlow/vitaeflow-js)

## License

MIT
