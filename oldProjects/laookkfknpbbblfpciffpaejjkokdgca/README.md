# AI Model Comparison for Extension Analysis

Comparing GPT-4.1, Claude-Sonnet-4, and Gemini-2.5-Pro on automated Chrome extension behavioral analysis.

**Test Subject:** Momentum Extension

## Reproduction Steps

### 1. Run AI Analysis

Open this folder as top level in your VSCode and run in Github Copilot:

```
Begin Chrome extension reverse engineering analysis. Model: [YOUR_MODEL_NAME]. Start with run setup and proceed through all steps.
```

This produces analysis outputs in `out_XXX_[MODEL]/` directories:
- `extension_summary.json` - Main analysis output
- `outline.jsonl` - Per-chunk findings
- `analysis_notes.md` - Analysis notes
- `*.csv` - Intermediate tables

### 2. Extract Model Findings

```bash
cd ground_truth
python3 extract_model_findings.py
```

Reads outputs from:
- `out_001_GPT4.1/extension_summary.json`
- `out_002_Claude-Sonnet-4/extension_summary.json`
- `out_003_Gemini-2.5-Pro/extension_summary.json`

Creates candidate lists for verification.

### 3. Auto-Verify Evidence

```bash
python3 auto_verify_findings.py
```

Searches extension source code to verify findings. Generates:
- `verification_network_endpoints.json`
- `verification_messaging_channels.json`
- `verification_storage_keys.json`

### 4. Manual Review

Open verification JSON files and set `"verified": true/false` for items where auto-verification failed or was uncertain.

### 5. Build Ground Truth

```bash
python3 build_ground_truth.py
```

Compiles verified items into `momentum_summary_ground_truth.json`:
- Network endpoints
- Messaging channels
- Storage keys

### 6. Calculate Metrics

```bash
python3 calculate_metrics.py
```

Generates:
- `evaluation_report.json` - Precision/recall/F1 scores
- `evaluation_report.md` - Human-readable report

## Repository Structure

```
.
├── README.md                                   # This file
├── ground_truth/                               # Verification framework
│   ├── momentum_summary_ground_truth.json      # Final ground truth
│   ├── evaluation_report.json                  # Metrics
│   ├── evaluation_report.md                    # Report
│   └── *.py                                    # Verification scripts
├── out_001_GPT4.1/                             # GPT output
│   └── extension_summary.json
├── out_002_Claude-Sonnet-4/                    # Claude output
│   └── extension_summary.json
├── out_003_Gemini-2.5-Pro/                     # Gemini output
│   └── extension_summary.json
├── serviceWorker.js                            # Main service worker
├── serviceWorker.beautified.js                 # Beautified version
├── index.html                                  # Main page
├── loading.html                                # Loading page
├── site-blocker.html                           # Site blocker UI
├── offscreenDocument.html                      # Offscreen document
├── manifest.json                               # Extension manifest
├── pwaManifest.json                            # PWA manifest
├── assets/                                     # Asset files
├── backgrounds/                                # Background images
├── content-scripts/                            # Content scripts
├── font/                                       # Fonts
├── img/                                        # Images
├── sounds/                                     # Sound files
└── .github/copilot-instructions.md             # Analysis instructions
```
