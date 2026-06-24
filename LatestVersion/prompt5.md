# GitHub Copilot Instructions for Internal vs External Privacy Comparison

## Project Context

This workspace step compares two privacy disclosure layers for the same Chrome extension:

1. **Internal privacy disclosure**: the Chrome Web Store privacy declaration extracted by Prompt 2 and compared with observed behavior by Prompt 3.
2. **External privacy policy**: the developer's external privacy policy page extracted by Prompt 2, if available.

When available, use `privacy_workspace/external_policy_claims_review.json` as the reviewed claim-level representation of the external privacy policy. It preserves specific claim IDs, claim text, excerpts, and category mappings that are easier to audit than raw policy text alone. Use `privacy_workspace/external_policy_claims.json` only as a draft fallback.

The goal is to answer two questions:

1. For behaviors that Prompt 3 found as **underdeclared in the Chrome Web Store**, are those same behaviors explained in the developer's **external privacy policy**?
2. Does the external privacy policy disclose any privacy categories that are **not declared in the Chrome Web Store privacy declaration**, regardless of whether those categories were observed in code?

This step does **not** re-analyze source code. It only compares existing structured JSON outputs.

---

## Quick Start

**To begin internal-vs-external privacy comparison, use this prompt:**

```text
Begin internal vs external privacy comparison. Read privacy_workspace/declared_privacy.json, privacy_workspace/privacy_comparison.json, and privacy_workspace/extension_summary.json if needed. If an external privacy policy is available, produce privacy_workspace/internal_external_privacy_comparison.json. If no external privacy policy is available, stop without creating a new file.
```

---

## Core Principles

### Existing-Outputs-Only Rule

Use only existing files in `privacy_workspace/`.

Required input files:

1. `privacy_workspace/declared_privacy.json`
2. `privacy_workspace/privacy_comparison.json`

Optional supporting input file:

3. `privacy_workspace/extension_summary.json`

Do NOT re-run any previous prompt.
Do NOT run `fetch_privacy.py`.
Do NOT open Chrome Web Store.
Do NOT open the external privacy policy URL.
Do NOT inspect JavaScript source files.
Do NOT inspect `manifest.json` directly.
Do NOT modify input JSON files.

### Skip-If-No-External-Policy Rule

Before doing any comparison, inspect:

```json
privacy_workspace/declared_privacy.json.external_privacy_policy
```

If any of the following is true, stop gracefully and do **not** create `privacy_workspace/internal_external_privacy_comparison.json`:

- `external_privacy_policy` field is missing
- `external_privacy_policy.retrieved` is not `true`
- `external_privacy_policy.url` is missing or null
- `external_privacy_policy.privacy_text` is missing or empty

In this case, report exactly:

```text
No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping internal-vs-external privacy comparison. No output file was created.
```

### Evidence-Grounded Rule

Every finding must be grounded in the input JSON files.

For Chrome Web Store declarations, use:

- `declared_privacy.json.declared_data_categories`
- `declared_privacy.json.chrome_webstore.declared_data_categories`
- `declared_privacy.json.privacy_text`
- `declared_privacy.json.chrome_webstore.privacy_text`

For external privacy policy declarations, use:

- `external_policy_claims_review.json.final_claims[].data_categories`, `claim_type`, `claim_text`, and `evidence` when `privacy_workspace/external_policy_claims_review.json` exists
- `external_policy_claims.json.claims[].data_categories`, `claim_type`, `claim_text`, and `evidence` only as draft fallback
- `declared_privacy.json.external_privacy_policy.detected_data_categories`
- `declared_privacy.json.external_privacy_policy.privacy_text`

For Chrome-Web-Store-underdeclared behavior, use:

- `privacy_comparison.json.underdeclared`
- `privacy_comparison.json.observed_categories`
- `privacy_comparison.json.matches`
- `privacy_comparison.json.limitations`

Newer Prompt 3 outputs may contain observed items that were derived from `extension_summary.json.observed_privacy_data.items`. Preserve those items exactly as Prompt 3 reported them. Do not collapse them back into only broad legacy categories.

For observed-code evidence, use evidence already contained in:

- `privacy_comparison.json`
- optionally `extension_summary.json`, only if needed to preserve evidence already extracted by earlier steps

Do NOT invent evidence.
Do NOT create new source-code evidence.
If evidence is weak or missing, mark confidence as `low` and document the limitation.

### Conservative Reasoning Rule

Prefer conservative conclusions.

Do NOT claim a legal violation.
Do NOT claim intentional hiding.
Use careful terms such as:

- `chrome_webstore_underdeclared_but_external_explains`
- `not_declared_in_either_policy`
- `external_only_disclosure`
- `unclear`

---

## Input Files

### 1. privacy_workspace/declared_privacy.json

This file is produced by Prompt 2.

It should contain Chrome Web Store privacy data and may contain external privacy policy data:

```json
{
  "extension_id": "...",
  "url": "...",
  "chrome_webstore_privacy_url": "...",
  "retrieved_at": "...",
  "declared_data_categories": [],
  "developer_statements": [],
  "privacy_text": "...",
  "chrome_webstore": {
    "url": "...",
    "declared_data_categories": [],
    "developer_statements": [],
    "privacy_text": "..."
  },
  "external_privacy_policy": {
    "url": "...",
    "final_url": "...",
    "retrieved": true,
    "error": null,
    "detected_data_categories": [],
    "developer_statements": [],
    "privacy_text": "..."
  }
}
```

### Optional: privacy_workspace/external_policy_claims_review.json

When this file exists, it is the preferred external-policy source.

Relevant fields:

```json
{
  "external_privacy_policy_url": "...",
  "detected_data_categories": [],
  "developer_statements": [],
  "final_claims": [
    {
      "claim_id": "EPC-001",
      "claim_type": "data_collection",
      "data_categories": [],
      "claim_text": "...",
      "normalized_meaning": "...",
      "evidence": {}
    }
  ]
}
```

Use final claim IDs and excerpts from this file when explaining whether the external policy covers a Chrome-Web-Store-underdeclared behavior or whether the external policy declares categories not present in Chrome Web Store.

### 2. privacy_workspace/privacy_comparison.json

This file is produced by Prompt 3.

It compares Chrome Web Store declared categories with observed behavior from source-code analysis.

Relevant fields:

```json
{
  "extension_id": "...",
  "extension_name": "...",
  "declared_categories": [],
  "observed_categories": [],
  "matches": [],
  "underdeclared": [],
  "overdeclared": [],
  "unclear": [],
  "developer_statement_checks": [],
  "overall_assessment": {},
  "limitations": []
}
```

The most important field for this Prompt 5 is:

```json
"underdeclared": []
```

This field means: observed behavior was found in the extension analysis but was not declared in the Chrome Web Store privacy declaration.

### 3. privacy_workspace/extension_summary.json

This file is optional for this step.

Use it only if needed to preserve evidence or extension metadata already extracted earlier.

Do NOT use it to create new behavioral findings beyond what Prompt 3 already reported.

If `extension_summary.json` is used for supporting evidence, it may contain the newer detailed section:

```json
{
  "observed_privacy_data": {
    "items": []
  }
}
```

Use this section only to preserve or verify evidence for observed items already present in `privacy_comparison.json`. Do not create new underdeclared findings directly from `observed_privacy_data` in Prompt 5; Prompt 3 is responsible for that comparison.

---

## Standard Privacy Categories

Use the following standard privacy categories:

- `personally_identifiable_information`
- `health_information`
- `financial_and_payment_information`
- `authentication_information`
- `personal_communications`
- `location`
- `web_history`
- `user_activity`
- `website_content`

---

## Category Mapping Guidance

Map observed or policy wording to the standard categories using semantic reasoning.

### Personally Identifiable Information

Map to `personally_identifiable_information` when wording or observed behavior includes:

- names
- email addresses
- user IDs
- account identifiers
- profile information
- identity API access
- OAuth profile data

### Authentication Information

Map to `authentication_information` when wording or observed behavior includes:

- passwords
- credentials
- auth tokens
- OAuth tokens
- session tokens
- login secrets
- sign-in data

### Personal Communications

Map to `personal_communications` when wording or observed behavior includes:

- emails
- chat messages
- SMS
- message bodies
- private communication content

### Location

Map to `location` when wording or observed behavior includes:

- GPS coordinates
- geolocation API
- IP-based location
- approximate location
- city
- country
- region

### Web History

Map to `web_history` when wording or observed behavior includes:

- visited URLs
- browsing history
- tab URLs
- navigation history
- page visit timestamps
- websites visited

### User Activity

Map to `user_activity` when wording or observed behavior includes:

- clicks
- mouse movement
- scroll activity
- keystrokes
- browsing behavior tracking
- network monitoring
- analytics events
- telemetry events
- feature usage
- A/B testing
- session replay
- buttons tapped
- pages viewed

### Website Content

Map to `website_content` when wording or observed behavior includes:

- page text
- DOM content
- selected text
- images
- videos
- audio or tab audio
- hyperlinks
- page structure
- content script reading page data
- product data
- cart contents

### Financial and Payment Information

Map to `financial_and_payment_information` when wording or observed behavior includes:

- payment data
- credit card information
- billing data
- financial account data
- transaction data
- purchase data
- order history

### Health Information

Map to `health_information` when wording or observed behavior includes:

- medical data
- health conditions
- health-related content
- fitness or wellness data

---

## Main Task 1: Check Whether Chrome-Web-Store-Underdeclared Behavior Is Explained Externally

This is the most important part of this prompt.

Take every item in:

```json
privacy_workspace/privacy_comparison.json.underdeclared
```

For each item:

1. Read its `mapped_category`.
2. Check whether that category appears in:
   - `declared_privacy.json.external_privacy_policy.detected_data_categories`, or
   - clearly inside `declared_privacy.json.external_privacy_policy.privacy_text`.
3. If the external policy explains it, classify as:

```text
chrome_webstore_underdeclared_but_external_explains
```

4. If the external policy does not explain it, classify as:

```text
not_declared_in_either_policy
```

5. If the external policy text is too broad or ambiguous, classify as:

```text
unclear_external_coverage
```

If `external_policy_claims_review.json.final_claims[]` contains a `no_collection_claim` or equivalent no-data wording and Prompt 3 reports underdeclared observed privacy behavior, do not classify the external policy as merely unclear. Classify the item as not declared in either policy and explain that the external no-collection claim directly contradicts the observed privacy behavior.

Important:

- Do not remove the original Prompt 3 finding.
- Preserve the idea that the behavior was underdeclared in the Chrome Web Store.
- The external policy can reduce the concern, but it does not erase the fact that the Chrome Web Store declaration was incomplete.
- If the Prompt 3 item came from `observed_privacy_data.items`, keep its concrete `observed_item` name, mapped category, evidence, and source-field context. Do not replace it with only a broad category label.

Example:

```json
{
  "observed_item": "privacy.data_categories: session_tokens",
  "mapped_category": "authentication_information",
  "prompt3_status": "underdeclared_in_chrome_webstore",
  "external_policy_coverage": "not_declared_in_either_policy",
  "reason": "Prompt 3 found authentication information underdeclared in the Chrome Web Store, and the external policy does not clearly mention authentication tokens, credentials, or session tokens.",
  "severity": "medium",
  "confidence": "medium",
  "evidence": {
    "prompt3_underdeclared_evidence": [],
    "external_policy_evidence": {
      "file": "privacy_workspace/declared_privacy.json",
      "path": "external_privacy_policy.privacy_text"
    }
  }
}
```

---

## Main Task 2: Compare Chrome Web Store Categories vs External Privacy Policy Categories

This task is independent of observed source-code behavior.

Compare:

```json
declared_privacy.json.declared_data_categories
```

or, if available:

```json
declared_privacy.json.chrome_webstore.declared_data_categories
```

against:

```json
declared_privacy.json.external_privacy_policy.detected_data_categories
```

Also inspect `external_privacy_policy.privacy_text` for clearly described additional categories.

Produce three lists:

### Shared Categories

Categories declared in both Chrome Web Store and external privacy policy.

### Chrome-Web-Store-Only Categories

Categories declared in Chrome Web Store but not found in the external privacy policy.

This does not automatically mean a problem. It may mean the external policy is broader, product-wide, or the extractor missed wording.

### External-Only Categories

Categories found in the external privacy policy but not declared in Chrome Web Store.

This is important.

For example:

- External policy says it collects location data.
- Chrome Web Store declaration does not include `location`.

Then add:

```json
{
  "category": "location",
  "status": "external_only_disclosure",
  "reason": "The external privacy policy mentions location-related data, but the Chrome Web Store privacy declaration does not list the location category.",
  "confidence": "high",
  "evidence": {
    "chrome_webstore": {
      "file": "privacy_workspace/declared_privacy.json",
      "path": "declared_data_categories"
    },
    "external_policy": {
      "file": "privacy_workspace/declared_privacy.json",
      "path": "external_privacy_policy.detected_data_categories"
    }
  }
}
```

Important:

- External-only categories do not require observed source-code evidence.
- The purpose is to check disclosure mismatch between the Chrome Web Store privacy declaration and the external privacy policy.
- Do not call this an actual behavior mismatch unless it is also observed in Prompt 3 or extension_summary.

---

## Output File

Create exactly one output file if external privacy policy exists:

```text
privacy_workspace/internal_external_privacy_comparison.json
```

Do NOT create this file if no external privacy policy is available.

The file must contain valid JSON.

Do NOT create additional markdown reports, CSV files, diagrams, or notes unless explicitly asked.

---

## Required Output Schema

The output JSON must follow this structure:

```json
{
  "extension_id": "string or unknown",
  "extension_name": "string or unknown",
  "chrome_webstore_privacy_url": "string or unknown",
  "external_privacy_policy_url": "string or unknown",
  "comparison_summary": {
    "chrome_webstore_declared_category_count": 0,
    "external_policy_category_count": 0,
    "prompt3_underdeclared_count": 0,
    "underdeclared_explained_by_external_count": 0,
    "underdeclared_not_declared_in_either_count": 0,
    "underdeclared_unclear_external_coverage_count": 0,
    "shared_category_count": 0,
    "chrome_webstore_only_category_count": 0,
    "external_only_category_count": 0
  },
  "chrome_webstore_declared_categories": [],
  "external_policy_declared_categories": [],
  "prompt3_underdeclared_review": [
    {
      "observed_item": "string",
      "mapped_category": "string",
      "prompt3_status": "underdeclared_in_chrome_webstore",
      "external_policy_coverage": "chrome_webstore_underdeclared_but_external_explains|not_declared_in_either_policy|unclear_external_coverage",
      "reason": "string",
      "severity": "low|medium|high",
      "confidence": "high|medium|low",
      "evidence": {
        "prompt3_underdeclared_evidence": [],
        "external_policy_evidence": []
      }
    }
  ],
  "policy_category_alignment": {
    "shared_categories": [
      {
        "category": "string",
        "reason": "string",
        "confidence": "high|medium|low",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      }
    ],
    "chrome_webstore_only_categories": [
      {
        "category": "string",
        "reason": "string",
        "confidence": "high|medium|low",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      }
    ],
    "external_only_categories": [
      {
        "category": "string",
        "status": "external_only_disclosure",
        "reason": "string",
        "confidence": "high|medium|low",
        "evidence": {
          "chrome_webstore": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "declared_data_categories"
          },
          "external_policy": {
            "file": "privacy_workspace/declared_privacy.json",
            "path": "external_privacy_policy.detected_data_categories"
          }
        }
      }
    ]
  },
  "overall_assessment": {
    "chrome_webstore_underdeclaration_resolved_by_external_policy": true,
    "has_categories_declared_only_externally": true,
    "risk_level": "low|medium|high",
    "confidence": "high|medium|low",
    "summary": "string"
  },
  "limitations": []
}
```

---

## Comparison Steps

### Step 0: Validate Setup

1. Confirm that `privacy_workspace/declared_privacy.json` exists.
2. Confirm that `privacy_workspace/privacy_comparison.json` exists.
3. Open and parse both files as JSON.
4. If either file is missing or invalid, stop and do not create output.

Optional:

5. If `privacy_workspace/extension_summary.json` exists, parse it only for extension name or supporting evidence if needed.

---

### Step 1: Check External Privacy Policy Availability

Inspect `declared_privacy.json.external_privacy_policy`.

If the external policy is missing, not retrieved, has no URL, or has empty text:

1. Stop immediately.
2. Do NOT create `privacy_workspace/internal_external_privacy_comparison.json`.
3. Report:

```text
No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping internal-vs-external privacy comparison. No output file was created.
```

---

### Step 2: Extract Chrome Web Store Categories

Extract Chrome Web Store declared categories from:

```json
declared_privacy.json.chrome_webstore.declared_data_categories
```

If that field is missing, fallback to:

```json
declared_privacy.json.declared_data_categories
```

Do not invent categories.

---

### Step 3: Extract External Policy Categories

First check whether `privacy_workspace/external_policy_claims_review.json` exists.

If it exists, extract external policy categories from:

```json
external_policy_claims_review.json.final_claims[].data_categories
```

Also preserve `claim_id`, `claim_type`, `claim_text`, and `evidence` for any output item that relies on a claim.

If the reviewed claims file is missing or incomplete, use draft `external_policy_claims.json.claims[]` only as fallback. If both claim files are missing or incomplete, extract external policy categories from:

```json
declared_privacy.json.external_privacy_policy.detected_data_categories
```

Also inspect:

```json
declared_privacy.json.external_privacy_policy.privacy_text
```

If the text clearly describes a standard category not present in `detected_data_categories`, add it to the external category set and explain why in the output.

Do not invent categories from vague wording.

---

### Step 4: Review Prompt 3 Underdeclared Findings

Read:

```json
privacy_comparison.json.underdeclared
```

For each item:

1. Get `observed_item`.
2. Get `mapped_category`.
3. Check whether `mapped_category` is present in the external policy category set.
4. If yes, classify as `chrome_webstore_underdeclared_but_external_explains`.
5. If no, inspect external policy text for clear equivalent wording.
6. If still no, classify as `not_declared_in_either_policy`.
7. If wording is vague, classify as `unclear_external_coverage`.

---

### Step 5: Compare Chrome Web Store Categories vs External Policy Categories

Compute:

1. `shared_categories`
2. `chrome_webstore_only_categories`
3. `external_only_categories`

Remember:

- `external_only_categories` are important even if the behavior was not observed in source code.
- This is a disclosure consistency check between two privacy documents.

---

### Step 6: Assign Overall Assessment

Use:

#### low

Use `low` when:

- no Prompt 3 underdeclared findings exist, or all are clearly explained by the external policy
- no important external-only categories exist
- inconsistencies are minor or likely due to policy wording

#### medium

Use `medium` when:

- one or more Prompt 3 underdeclared findings are only explained externally but not in Chrome Web Store
- external-only categories exist
- unclear external coverage exists

#### high

Use `high` when:

- Prompt 3 underdeclared findings are not declared in either Chrome Web Store or external policy
- sensitive categories such as authentication information, personal communications, financial/payment information, location, or website content are not declared in either policy
- there are multiple important external-only categories that suggest the Chrome Web Store disclosure is substantially incomplete
- an external no-collection/no-data claim contradicts observed privacy behavior from Prompt 3

---

### Step 7: Write Output

Write the result to:

```text
privacy_workspace/internal_external_privacy_comparison.json
```

The file must be valid JSON.

Do not include markdown in the JSON file.

---

## Failure Handling

### Missing declared_privacy.json

Stop and report:

```text
privacy_workspace/declared_privacy.json is missing. Cannot perform internal-vs-external comparison.
```

Do not create output.

### Missing privacy_comparison.json

Stop and report:

```text
privacy_workspace/privacy_comparison.json is missing. Run Prompt 3 first.
```

Do not create output.

### No External Privacy Policy

Stop and report:

```text
No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping internal-vs-external privacy comparison. No output file was created.
```

Do not create output.

### Invalid JSON

Stop and report which file failed to parse.

Do not create output.

---

## Quality Checks

Before finalizing:

- [ ] `privacy_workspace/declared_privacy.json` exists
- [ ] `privacy_workspace/privacy_comparison.json` exists
- [ ] Both files parse as valid JSON
- [ ] External privacy policy exists, was retrieved, has URL, and has non-empty text
- [ ] No source files were analyzed
- [ ] `fetch_privacy.py` was not executed
- [ ] Chrome Web Store categories came only from `declared_privacy.json`
- [ ] External policy categories came from `external_policy_claims_review.json` when available, otherwise from draft `external_policy_claims.json` or `declared_privacy.json.external_privacy_policy`
- [ ] External-policy evidence preserves final claim IDs/excerpts when `external_policy_claims_review.json` exists
- [ ] Prompt 3 underdeclared findings came only from `privacy_comparison.json.underdeclared`
- [ ] External-only categories are reported even if not observed in code
- [ ] Output file was created only if external policy exists
- [ ] `privacy_workspace/internal_external_privacy_comparison.json` is valid JSON

---

## Exclusions

Do NOT:

- run `fetch_privacy.py`
- run Prompt 2, Prompt 3, or Prompt 4 again
- open Chrome Web Store
- open the external privacy policy URL
- analyze JavaScript files
- inspect source folders
- modify input JSON files
- create output if external privacy policy is unavailable
- create additional output files unless explicitly asked

---

## Notes

- This step is a meta-comparison between privacy documents and Prompt 3 findings.
- Prompt 3 answers: what observed behavior was missing from the Chrome Web Store declaration?
- Prompt 5 answers: are those Prompt 3 gaps covered by the external privacy policy, and does the external policy disclose categories missing from Chrome Web Store?
- A category can be external-only even if it was not observed in code.
- External-only disclosure does not automatically prove the extension collects that data; it shows that the external policy is broader than the Chrome Web Store declaration.
- Chrome Web Store underdeclaration that is explained externally should still be reported as incomplete Chrome Web Store disclosure, but with lower concern than behavior not declared in either place.
