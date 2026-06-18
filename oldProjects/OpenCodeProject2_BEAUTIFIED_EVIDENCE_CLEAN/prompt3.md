# GitHub Copilot Instructions for Chrome Extension Privacy Comparison

## Project Context

This workspace step is for comparing declared privacy information from the Chrome Web Store with observed behavior extracted from Chrome extension source code.

The goal is to determine whether the developer-declared privacy practices are consistent with the actual behavior identified during reverse engineering.

This step uses two existing JSON files:

1. **`privacy_workspace/declared_privacy.json`** - What the developer declares on the Chrome Web Store privacy page
2. **`privacy_workspace/extension_summary.json`** - What the code analysis found about the extension's actual behavior

This step does **not** re-analyze source code. It only compares the two structured JSON inputs and produces a structured comparison report.

---

## Quick Start

**To begin privacy comparison, use this prompt:**

```
Begin Chrome extension privacy comparison. Read privacy_workspace/declared_privacy.json and privacy_workspace/extension_summary.json, then produce privacy_workspace/privacy_comparison.json.
```

---

## Core Principles

### Evidence-Grounded Comparison Rule
- Every comparison finding must be grounded in the input JSON files
- For observed behavior, cite evidence from `privacy_workspace/extension_summary.json` whenever available
- Do NOT invent code evidence
- Do NOT infer behavior that is not supported by `privacy_workspace/extension_summary.json`
- If evidence is missing or unclear, mark confidence as `low` and document the limitation

### No Re-Analysis Rule
- Do NOT re-analyze JavaScript source files
- Do NOT inspect `manifest.json` directly
- Do NOT scan source folders
- Do NOT run the reverse engineering prompt again
- Use only the already-generated JSON inputs

### Local-Only Execution
- Work entirely within the current workspace
- Do NOT call external services or APIs
- Do NOT open Chrome Web Store pages
- Do NOT run `fetch_privacy.py`
- Do NOT modify input JSON files

### Conservative Reasoning Rule
- Prefer conservative conclusions over aggressive accusations
- Distinguish between confirmed mismatch and possible mismatch
- Do NOT claim policy violation unless supported by clear evidence
- Use confidence levels: `high`, `medium`, `low`

---

## Input Requirements

### Required Input Files
The following files must exist in the current workspace:

1. `privacy_workspace/declared_privacy.json`
2. `privacy_workspace/extension_summary.json`

### privacy_workspace/declared_privacy.json
This file contains developer-declared privacy information extracted from the Chrome Web Store privacy page.

Expected fields:

```json
{
  "extension_id": "...",
  "url": "...",
  "retrieved_at": "...",
  "declared_data_categories": [],
  "developer_statements": [],
  "privacy_text": "..."
}
```

### privacy_workspace/extension_summary.json
This file contains observed behavior extracted from the extension source code.

Relevant fields may include:

```json
{
  "metadata": {},
  "permissions": {},
  "components": {},
  "network": {},
  "messaging": {},
  "storage": {},
  "workflows": [],
  "observed_privacy_data": {
    "items": []
  },
  "privacy": {},
  "risks": [],
  "code_signals": {}
}
```

### New Observed Privacy Data Format

Newer reverse-engineering runs may include:

```json
{
  "observed_privacy_data": {
    "items": [
      {
        "data_name": "current_page_url",
        "data_description": "...",
        "source": "...",
        "operation": "read, stored, transmitted, processed",
        "collection_trigger": "...",
        "storage": {},
        "transmission": {},
        "local_processing": [],
        "user_control_or_consent": "...",
        "purpose_observed": "...",
        "confidence": "high",
        "evidence": []
      }
    ]
  }
}
```

Treat `observed_privacy_data.items` as the most detailed source for observed privacy behavior when it exists. Do not ignore the older fields (`privacy`, `network`, `storage`, `workflows`, `risks`, `code_signals`); use them as supporting context and fallback sources.

---

## File Handling Rules

### Input Files
- Open and parse `privacy_workspace/declared_privacy.json`
- Open and parse `privacy_workspace/extension_summary.json`
- Do NOT modify either input file
- If one file is missing or invalid, stop and report the issue

### Output File
Create exactly one output file:

```
privacy_workspace/privacy_comparison.json
```

### File Writing Rule
- Write the final comparison result to `privacy_workspace/privacy_comparison.json`
- The file must contain valid JSON
- Do NOT create additional markdown reports, CSV files, diagrams, or notes unless explicitly asked

---

## Category Mapping Guidance

### Chrome Web Store Declared Categories
Declared categories in `privacy_workspace/declared_privacy.json` may include:

- `personally_identifiable_information`
- `health_information`
- `financial_and_payment_information`
- `authentication_information`
- `personal_communications`
- `location`
- `web_history`
- `user_activity`
- `website_content`

### Observed Behavior Categories
Observed categories in `privacy_workspace/extension_summary.json` may use different names and levels of abstraction.

For example:

- `user_credentials`
- `user_profile`
- `browsing_history`
- `analytics`
- `telemetry`
- `website_content`
- `location`
- `personal_data`
- `tokens`
- `cookies`

### Semantic Mapping Rules
Map observed behavior to Chrome Web Store declared categories using semantic reasoning.

Use the following guidance:

#### Personally Identifiable Information
Map to `personally_identifiable_information` when observed behavior includes:
- names
- email addresses
- user IDs
- account identifiers
- profile information
- identity API access
- OAuth profile data

#### Authentication Information
Map to `authentication_information` when observed behavior includes:
- passwords
- auth tokens
- OAuth tokens
- credentials
- session tokens
- login secrets

#### Personal Communications
Map to `personal_communications` when observed behavior includes:
- emails
- chat messages
- SMS
- message bodies
- private communication content

#### Location
Map to `location` when observed behavior includes:
- GPS coordinates
- geolocation API
- IP-based location
- region or country detection
- nearby device or location information

#### Web History
Map to `web_history` when observed behavior includes:
- visited URLs
- browsing history
- tab URLs
- navigation history
- page visit timestamps

#### User Activity
Map to `user_activity` when observed behavior includes:
- clicks
- mouse movement
- scroll activity
- keystrokes
- browsing behavior tracking
- network monitoring
- analytics events
- telemetry events

#### Website Content
Map to `website_content` when observed behavior includes:
- page text
- DOM content
- selected text
- images
- videos
- hyperlinks
- page structure
- content script reading page data

#### Financial and Payment Information
Map to `financial_and_payment_information` when observed behavior includes:
- payment data
- credit card information
- billing data
- financial account data

#### Health Information
Map to `health_information` when observed behavior includes:
- medical data
- health conditions
- health-related content
- fitness or wellness data

---

## Comparison Classification

### Match
Use `match` when observed behavior is adequately declared by the developer.

Example:

```json
{
  "declared_category": "personally_identifiable_information",
  "observed_category": "user_profile",
  "status": "match"
}
```

### Underdeclared
Use `underdeclared` when observed behavior appears in the code analysis but is not declared in Chrome Web Store privacy data.

This is the most important category.

Example:

```json
{
  "observed_category": "browsing_history",
  "mapped_declared_category": "web_history",
  "status": "underdeclared"
}
```

### Overdeclared
Use `overdeclared` when the developer declares a category that is not observed in the code analysis.

This is not necessarily a violation. It may mean:
- the analysis missed something
- the behavior occurs server-side
- the developer declared conservatively
- the feature is optional or inactive

Example:

```json
{
  "declared_category": "location",
  "status": "overdeclared"
}
```

### Unclear
Use `unclear` when there is insufficient evidence to decide.

Example:

```json
{
  "category": "user_activity",
  "status": "unclear",
  "reason": "Observed telemetry endpoints exist, but payload content is not clear."
}
```

---

## Developer Statement Checks

### Developer Statements
The field `developer_statements` may include:

- `not_sold_to_third_parties`
- `not_used_for_unrelated_purposes`
- `not_used_for_creditworthiness`

### How to Evaluate Statements
Evaluate these statements conservatively.

#### not_sold_to_third_parties
Only flag concern if `privacy_workspace/extension_summary.json` contains evidence suggesting sale of user data or advertising/marketing transfer beyond approved use cases.

#### not_used_for_unrelated_purposes
Flag concern if observed workflows, endpoints, or risks indicate use unrelated to the extension's core functionality.

#### not_used_for_creditworthiness
Only flag concern if observed behavior clearly relates to credit scoring, lending, financial eligibility, or creditworthiness evaluation.

If there is no clear evidence against a statement, mark it as `not_contradicted`.

---

## Output Structure

### Required Deliverable
Create:

1. **`privacy_workspace/privacy_comparison.json`** - Final declared-vs-observed privacy comparison report

### Required JSON Fields
The output JSON must contain:

```json
{
  "extension_id": "...",
  "extension_name": "...",
  "comparison_summary": {},
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

---

## Comparison Steps (Complete Workflow)

### Step 0: Validate Setup

**Purpose**: Ensure both required JSON files are available.

1. Confirm that `privacy_workspace/declared_privacy.json` exists
2. Confirm that `privacy_workspace/extension_summary.json` exists
3. Open both files
4. Parse both files as JSON
5. Stop if either file is missing or invalid

---

### Step 1: Extract Declared Privacy Categories

**Purpose**: Identify what the developer claims to handle.

From `privacy_workspace/declared_privacy.json`, extract:
- `extension_id`
- `url`
- `retrieved_at`
- `declared_data_categories`
- `developer_statements`
- `privacy_text`

Do not modify declared category names.

---

### Step 2: Extract Observed Privacy-Relevant Behavior

**Purpose**: Identify what the code analysis found.

From `privacy_workspace/extension_summary.json`, inspect:
- `observed_privacy_data.items` (primary detailed source when present)
- `privacy.data_categories`
- `privacy.third_parties`
- `privacy.purposes`
- `permissions.api_permissions`
- `permissions.host_permissions`
- `network.endpoints`
- `storage.keys`
- `workflows`
- `risks`
- `code_signals.chrome_api_calls`
- `code_signals.event_listeners`

Use evidence fields from `privacy_workspace/extension_summary.json` whenever available.

When `observed_privacy_data.items` exists, process each item as an observed privacy-relevant behavior. Use:
- `data_name` as the observed item label
- `data_description`, `source`, `operation`, `collection_trigger`, `storage`, `transmission`, `local_processing`, and `purpose_observed` to decide the mapped Chrome Web Store category
- `evidence` from the item as the primary evidence
- `confidence` from the item as a starting confidence, adjusted conservatively if mapping is ambiguous

Do not collapse multiple detailed items into one broad item before comparison. For example, keep `machineKey`, `current_page_url`, `authKey`, `product_metadata`, and `image_data` as separate observed items even if several map to the same Chrome Web Store category.

Do not inspect source files directly.

---

### Step 3: Normalize Observed Behavior

**Purpose**: Map observed behavior to Chrome Web Store privacy categories.

For each observed privacy-relevant item:
1. Determine the most appropriate Chrome Web Store category
2. Record the original observed label or signal
3. Record the mapped declared category
4. Record evidence from `privacy_workspace/extension_summary.json`
5. Assign confidence: `high`, `medium`, or `low`

If the item came from `observed_privacy_data.items`, set `source_field` to `observed_privacy_data.items` and preserve the concrete `data_name` in `observed_item`.

Mapping examples for `observed_privacy_data.items`:
- `current_page_url`, tab URL, navigation history, page visit timestamp -> `web_history`
- `machineKey`, user ID, distinct ID, account ID, OAuth profile/email -> `personally_identifiable_information`
- `authKey`, `authValue`, token, credential, session secret -> `authentication_information`
- product metadata, DOM/page content, images, image data, selected text, page structure -> `website_content`
- analytics events, clicks, feature usage, A/B tests, telemetry payloads -> `user_activity`
- browser/user agent/device info used for analytics or profiling -> `user_activity` or `personally_identifiable_information` depending on identifiability; use `unclear` if ambiguous
- language, locale, settings, popup position -> usually `user_activity` or `website_content` only when tied to behavior/content; otherwise mark `unclear` if Chrome Web Store category mapping is weak

Example:

```json
{
  "observed_item": "chrome.identity.getProfileUserInfo",
  "mapped_category": "personally_identifiable_information",
  "reason": "The Identity API accesses user profile information such as email.",
  "confidence": "high",
  "evidence": [
    {"file": "identity.js", "start": 35, "end": 45}
  ]
}
```

---

### Step 4: Compare Declared vs Observed

**Purpose**: Determine consistency between declaration and behavior.

For each normalized observed category:
- If the mapped category exists in `declared_data_categories`, add it to `matches`
- If the mapped category does not exist in `declared_data_categories`, add it to `underdeclared`

For each declared category:
- If no observed behavior maps to it, add it to `overdeclared`

For ambiguous cases:
- Add to `unclear`
- Explain why the case is unclear

---

### Step 5: Check Developer Statements

**Purpose**: Determine whether developer statements are contradicted by observed behavior.

For each statement in `developer_statements`:
1. Check whether `privacy_workspace/extension_summary.json` contains evidence contradicting the statement
2. If contradicted, mark as `potentially_contradicted`
3. If not contradicted, mark as `not_contradicted`
4. If unclear, mark as `unclear`

Do not infer contradiction without evidence.

---

### Step 6: Assign Overall Assessment

**Purpose**: Summarize the privacy consistency result.

Set:

```json
{
  "is_consistent": true,
  "risk_level": "low",
  "confidence": "medium",
  "summary": "..."
}
```

### Risk Level Guidance

#### low
Use `low` when:
- most observed categories are declared
- no meaningful underdeclaration exists
- no developer statements are contradicted

#### medium
Use `medium` when:
- one or more privacy-relevant categories are underdeclared
- evidence is meaningful but not severe
- some developer statements are unclear

#### high
Use `high` when:
- sensitive data appears underdeclared
- personal communications, authentication data, location, or website content are collected but not declared
- evidence suggests external transfer of undeclared user data
- developer statements appear contradicted by code evidence

---

### Step 7: Write privacy_comparison.json

**Purpose**: Save the final comparison output.

Write the complete result to:

```
privacy_workspace/privacy_comparison.json
```

The file must be valid JSON.

Do not include markdown in the JSON file.

---

## Required Output Schema

### privacy_comparison.json

```json
{
  "extension_id": "string or unknown",
  "extension_name": "string or unknown",
  "comparison_summary": {
    "declared_category_count": 0,
    "observed_category_count": 0,
    "match_count": 0,
    "underdeclared_count": 0,
    "overdeclared_count": 0,
    "unclear_count": 0
  },
  "declared_categories": [
    "personally_identifiable_information"
  ],
  "observed_categories": [
    {
      "observed_item": "string",
      "mapped_category": "string",
      "source_field": "string",
      "reason": "string",
      "confidence": "high|medium|low",
      "evidence": [
        {"file": "string", "start": 0, "end": 0}
      ]
    }
  ],
  "matches": [
    {
      "declared_category": "string",
      "observed_items": ["string"],
      "reason": "string",
      "confidence": "high|medium|low",
      "evidence": []
    }
  ],
  "underdeclared": [
    {
      "observed_item": "string",
      "mapped_category": "string",
      "reason": "string",
      "severity": "low|medium|high",
      "confidence": "high|medium|low",
      "evidence": []
    }
  ],
  "overdeclared": [
    {
      "declared_category": "string",
      "reason": "string",
      "confidence": "high|medium|low"
    }
  ],
  "unclear": [
    {
      "category_or_item": "string",
      "reason": "string",
      "needed_information": "string"
    }
  ],
  "developer_statement_checks": [
    {
      "statement": "string",
      "status": "not_contradicted|potentially_contradicted|unclear",
      "reason": "string",
      "evidence": []
    }
  ],
  "overall_assessment": {
    "is_consistent": true,
    "risk_level": "low|medium|high",
    "confidence": "high|medium|low",
    "summary": "string"
  },
  "limitations": [
    "string"
  ]
}
```

---

## Failure Handling

### When declared_privacy.json Is Missing
1. Stop execution
2. Report that declared privacy data is missing
3. Do NOT create `privacy_workspace/privacy_comparison.json`

### When extension_summary.json Is Missing
1. Stop execution
2. Report that observed behavior data is missing
3. Do NOT create `privacy_workspace/privacy_comparison.json`

### When JSON Parsing Fails
1. Stop execution
2. Report which file failed to parse
3. Do NOT infer from partial content

### When Evidence Is Missing
1. Continue only if the observed claim is clearly present in structured fields
2. Mark confidence as `low`
3. Add a limitation explaining that evidence was unavailable

---

## Quality Checks

### Before Finalizing
- [ ] `privacy_workspace/declared_privacy.json` exists
- [ ] `privacy_workspace/extension_summary.json` exists
- [ ] Both files parse as valid JSON
- [ ] No source files were directly analyzed
- [ ] Declared categories were copied from `privacy_workspace/declared_privacy.json`
- [ ] Observed behavior was derived only from `privacy_workspace/extension_summary.json`
- [ ] If `observed_privacy_data.items` exists, it was inspected as the primary detailed observed-behavior source
- [ ] If `observed_privacy_data.items` is absent, older fields (`privacy`, `network`, `storage`, `workflows`, `risks`, `code_signals`) were used as fallback sources
- [ ] Every underdeclared item includes a reason
- [ ] Every underdeclared item includes evidence or a limitation
- [ ] Developer statements were checked conservatively
- [ ] `privacy_workspace/privacy_comparison.json` was written
- [ ] `privacy_workspace/privacy_comparison.json` is valid JSON

---

## Example Output

```json
{
  "extension_id": "<EXTENSION_ID>",
  "extension_name": "Example Extension",
  "comparison_summary": {
    "declared_category_count": 2,
    "observed_category_count": 3,
    "match_count": 1,
    "underdeclared_count": 2,
    "overdeclared_count": 1,
    "unclear_count": 0
  },
  "declared_categories": [
    "personally_identifiable_information",
    "user_activity"
  ],
  "observed_categories": [
    {
      "observed_item": "chrome.identity.getProfileUserInfo",
      "mapped_category": "personally_identifiable_information",
      "source_field": "code_signals.chrome_api_calls",
      "reason": "The extension accesses user profile information through Chrome Identity API.",
      "confidence": "high",
      "evidence": [
        {"file": "identity.js", "start": 35, "end": 45}
      ]
    }
  ],
  "matches": [
    {
      "declared_category": "personally_identifiable_information",
      "observed_items": [
        "chrome.identity.getProfileUserInfo"
      ],
      "reason": "Observed identity access is covered by the declared PII category.",
      "confidence": "high",
      "evidence": [
        {"file": "identity.js", "start": 35, "end": 45}
      ]
    }
  ],
  "underdeclared": [],
  "overdeclared": [
    {
      "declared_category": "user_activity",
      "reason": "No user activity tracking was observed in the structured code analysis.",
      "confidence": "medium"
    }
  ],
  "unclear": [],
  "developer_statement_checks": [
    {
      "statement": "not_sold_to_third_parties",
      "status": "not_contradicted",
      "reason": "No evidence of data sale was found in extension_summary.json.",
      "evidence": []
    }
  ],
  "overall_assessment": {
    "is_consistent": true,
    "risk_level": "low",
    "confidence": "medium",
    "summary": "The declared privacy categories appear broadly consistent with the observed behavior, with one overdeclared category."
  },
  "limitations": [
    "This comparison depends on the completeness of extension_summary.json."
  ]
}
```

---

## Exclusions

### Do Not Perform
- Do NOT run `fetch_privacy.py`
- Do NOT open Chrome Web Store
- Do NOT analyze JavaScript files
- Do NOT inspect source folders
- Do NOT modify `privacy_workspace/declared_privacy.json`
- Do NOT modify `privacy_workspace/extension_summary.json`
- Do NOT create additional output files unless explicitly asked

### This Step Only Compares Existing Outputs
This prompt is only for comparing already-generated declared and observed privacy data.

Declared privacy extraction is handled by the privacy extraction prompt.

Actual behavior analysis is handled by the Chrome extension reverse engineering prompt.

---

## Notes

- This is a comparison and interpretation step, not a scraping step
- Precision and conservative reasoning matter more than aggressive conclusions
- Underdeclaration findings are the most important output
- Overdeclaration findings should not be treated as violations by default
- Always separate confirmed mismatches from unclear cases
- The quality of this comparison depends on the quality of both input JSON files
