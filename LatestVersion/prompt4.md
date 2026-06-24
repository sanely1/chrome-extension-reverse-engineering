# GitHub Copilot Instructions for Chrome Extension External Privacy Policy Comparison

## Project Context

This workspace step is for comparing declared privacy information from the developer's **external privacy policy** with observed behavior extracted from Chrome extension source code.

The goal is to determine whether the developer's external privacy policy is consistent with the actual behavior identified during reverse engineering.

This step uses two existing JSON files:

1. **`privacy_workspace/declared_privacy.json`** - Privacy extraction output that may contain an `external_privacy_policy` object
2. **`privacy_workspace/extension_summary.json`** - What the code analysis found about the extension's actual behavior

When available, this step also uses:

3. **`privacy_workspace/external_policy_claims_review.json`** - LLM-reviewed claim-level extraction from the external privacy policy text
4. **`privacy_workspace/external_policy_claims.json`** - Deterministic draft claim candidates, fallback only

This step does **not** re-analyze source code. It only compares the external privacy policy data inside the already-generated declared privacy JSON with the structured observed behavior JSON.

Important: If no external privacy policy was found or retrieved, this step must stop gracefully and must **not** create a new comparison output file.

---

## Quick Start

**To begin external privacy policy comparison, use this prompt:**

```
Begin Chrome extension external privacy policy comparison. Read privacy_workspace/declared_privacy.json and privacy_workspace/extension_summary.json. If an external privacy policy is available, produce privacy_workspace/external_privacy_comparison.json. If no external privacy policy is available, stop without creating a new file.
```

---

## Core Principles

### Evidence-Grounded Comparison Rule

- Every comparison finding must be grounded in the input JSON files
- For observed behavior, cite evidence from `privacy_workspace/extension_summary.json` whenever available
- For external policy declarations, cite fields from `privacy_workspace/declared_privacy.json.external_privacy_policy`
- If `privacy_workspace/external_policy_claims_review.json` exists, use `final_claims[]` as the primary source for external policy categories, explicit claims, excerpts, and claim IDs
- Do NOT invent code evidence
- Do NOT infer behavior that is not supported by `privacy_workspace/extension_summary.json`
- Do NOT infer external policy declarations that are not supported by `external_privacy_policy.privacy_text` or `external_privacy_policy.detected_data_categories`
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
- Do NOT open the external privacy policy URL in a browser
- Do NOT run `fetch_privacy.py`
- Do NOT modify input JSON files

### Skip-If-No-External-Policy Rule

Before doing any comparison, check `privacy_workspace/declared_privacy.json`.

If any of the following is true, stop gracefully and do **not** create `privacy_workspace/external_privacy_comparison.json`:

- `external_privacy_policy` field is missing
- `external_privacy_policy.retrieved` is not `true`
- `external_privacy_policy.privacy_text` is missing or empty
- `external_privacy_policy.url` is missing or null

In this case, report:

```
No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping external privacy comparison. No output file was created.
```

### Conservative Reasoning Rule

- Prefer conservative conclusions over aggressive accusations
- Distinguish between confirmed mismatch and possible mismatch
- Do NOT claim legal or policy violation unless supported by clear evidence
- Use confidence levels: `high`, `medium`, `low`

---

## Input Requirements

### Required Input Files

The following files must exist in the current workspace:

1. `privacy_workspace/declared_privacy.json`
2. `privacy_workspace/extension_summary.json`

Optional but preferred when present:

3. `privacy_workspace/external_policy_claims_review.json`
4. `privacy_workspace/external_policy_claims.json`

### privacy_workspace/declared_privacy.json

This file contains privacy information extracted by the local privacy extraction script.

For this prompt, the relevant field is:

```json
{
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

The Chrome Web Store fields may also exist in the same file, but this prompt focuses only on the external privacy policy.

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

Create exactly one output file, but only if an external privacy policy is available:

```
privacy_workspace/external_privacy_comparison.json
```

If no external privacy policy is available, do not create any output file.

### File Writing Rule

- Write the final comparison result to `privacy_workspace/external_privacy_comparison.json`
- The file must contain valid JSON
- Do NOT create additional markdown reports, CSV files, diagrams, or notes unless explicitly asked

---

## Category Mapping Guidance

### External Privacy Policy Declared Categories

External policy categories may come from:

- `external_policy_claims_review.json.final_claims[].data_categories` and claim excerpts when `external_policy_claims_review.json` exists
- `external_policy_claims.json.claims[].data_categories` only as draft fallback
- `external_privacy_policy.detected_data_categories`
- direct wording inside `external_privacy_policy.privacy_text`

Prefer reviewed `external_policy_claims_review.json.final_claims[]` over raw text because it preserves LLM-adjudicated claim IDs, claim types, excerpts, and text offsets. Use draft `external_policy_claims.json` or raw `privacy_text` only as fallback when the review file is missing, incomplete, or blocked.

The detected categories may include:

- `personally_identifiable_information`
- `health_information`
- `financial_and_payment_information`
- `authentication_information`
- `personal_communications`
- `location`
- `web_history`
- `user_activity`
- `website_content`

If the external policy text clearly describes a data type even if `detected_data_categories` missed it, you may include it as externally declared, but you must cite the relevant text field and explain the reason.

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

Map observed behavior to privacy categories using semantic reasoning.

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
- feature usage
- A/B testing
- session replay

#### Website Content

Map to `website_content` when observed behavior includes:
- page text
- DOM content
- selected text
- images
- videos
- audio or tab audio
- hyperlinks
- page structure
- content script reading page data
- product data or cart contents

#### Financial and Payment Information

Map to `financial_and_payment_information` when observed behavior includes:
- payment data
- credit card information
- billing data
- financial account data
- transaction data
- purchase data

#### Health Information

Map to `health_information` when observed behavior includes:
- medical data
- health conditions
- health-related content
- fitness or wellness data

---

## Comparison Classification

### Match

Use `match` when observed behavior is adequately explained by the external privacy policy.

Example:

```json
{
  "external_policy_category": "user_activity",
  "observed_category": "telemetry",
  "status": "match"
}
```

### Underdeclared in External Policy

Use `underdeclared_external` when observed behavior appears in the code analysis but is not explained in the external privacy policy.

If the external policy contains a `no_collection_claim` or equivalent wording such as "we do not collect any data", and observed privacy behavior exists, treat the item as a direct contradiction. Mark it clearly in the reason, use high confidence when the observed evidence is strong, and do not soften it as merely vague wording.

Example:

```json
{
  "observed_category": "session_tokens",
  "mapped_external_policy_category": "authentication_information",
  "status": "underdeclared_external"
}
```

### Overdeclared in External Policy

Use `overdeclared_external` when the external privacy policy declares a category that is not observed in the code analysis.

This is not necessarily a violation. It may mean:
- the analysis missed something
- the behavior occurs server-side
- the policy covers multiple products or platforms
- the feature is optional or inactive
- the developer declared conservatively

Example:

```json
{
  "external_policy_category": "location",
  "status": "overdeclared_external"
}
```

### Unclear

Use `unclear` when there is insufficient evidence to decide.

Example:

```json
{
  "category": "website_content",
  "status": "unclear",
  "reason": "The external policy mentions website usage generally, but the observed source summary does not show whether page content is transmitted."
}
```

---

## Developer Statement Checks

### External Policy Developer Statements

The field `external_privacy_policy.developer_statements` may include:

- `not_sold_to_third_parties`
- `not_used_for_unrelated_purposes`
- `not_used_for_creditworthiness`

The external policy text itself may also include similar claims.

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

Create this file only if an external privacy policy is available:

1. **`privacy_workspace/external_privacy_comparison.json`** - Final external-policy-vs-observed privacy comparison report

### Required JSON Fields

The output JSON must contain:

```json
{
  "extension_id": "...",
  "extension_name": "...",
  "external_privacy_policy_url": "...",
  "comparison_summary": {},
  "external_declared_categories": [],
  "observed_categories": [],
  "matches": [],
  "underdeclared_external": [],
  "overdeclared_external": [],
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

### Step 0.5: Check External Privacy Policy Availability

**Purpose**: Skip this step if no external privacy policy exists.

From `privacy_workspace/declared_privacy.json`, inspect:

- `external_privacy_policy`
- `external_privacy_policy.url`
- `external_privacy_policy.retrieved`
- `external_privacy_policy.privacy_text`

If the external privacy policy is missing, not retrieved, or has empty text:

1. Stop immediately
2. Do NOT create `privacy_workspace/external_privacy_comparison.json`
3. Report: `No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping external privacy comparison. No output file was created.`

---

### Step 1: Extract External Privacy Policy Categories

**Purpose**: Identify what the external privacy policy claims to handle.

First check whether `privacy_workspace/external_policy_claims_review.json` exists.

If it exists, extract:
- `final_claims[].claim_id`
- `final_claims[].claim_type`
- `final_claims[].data_categories`
- `final_claims[].claim_text`
- `final_claims[].normalized_meaning`
- `final_claims[].evidence`
- `detected_data_categories`
- `developer_statements`

Use these claim-level fields as the primary external policy representation.

From `privacy_workspace/declared_privacy.json.external_privacy_policy`, extract:
- `url`
- `final_url`
- `retrieved`
- `detected_data_categories`
- `developer_statements`
- `privacy_text`

Use `detected_data_categories` as the base list of external declared categories.

If `external_policy_claims_review.json` exists, treat its final claim categories and excerpts as the base list of external declared categories. If raw `privacy_text` clearly mentions additional categories not captured in the review file or `detected_data_categories`, you may add them, but you must provide a reason and mark confidence appropriately.

Do not modify category names unless mapping them into the standard category list.

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
- `data_description`, `source`, `operation`, `collection_trigger`, `storage`, `transmission`, `local_processing`, and `purpose_observed` to decide the mapped external policy category
- `evidence` from the item as the primary evidence
- `confidence` from the item as a starting confidence, adjusted conservatively if mapping is ambiguous

Do not collapse multiple detailed items into one broad item before comparison. For example, keep `machineKey`, `current_page_url`, `authKey`, `product_metadata`, and `image_data` as separate observed items even if several map to the same standard privacy category.

Do not inspect source files directly.

---

### Step 3: Normalize Observed Behavior

**Purpose**: Map observed behavior to standard privacy categories.

For each observed privacy-relevant item:
1. Determine the most appropriate standard privacy category
2. Record the original observed label or signal
3. Record the mapped external policy category
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
- language, locale, settings, popup position -> usually `user_activity` or `website_content` only when tied to behavior/content; otherwise mark `unclear` if standard category mapping is weak

Example:

```json
{
  "observed_item": "privacy.data_categories: telemetry",
  "mapped_category": "user_activity",
  "source_field": "privacy.data_categories",
  "reason": "Telemetry events describe usage/activity data.",
  "confidence": "high",
  "evidence": [
    {"file": "serviceWorker.js", "start": 35, "end": 45}
  ]
}
```

---

### Step 4: Compare External Policy vs Observed

**Purpose**: Determine consistency between external policy and behavior.

For each normalized observed category:
- If the mapped category exists in the external declared categories, add it to `matches`
- If the mapped category does not exist in the external declared categories, add it to `underdeclared_external`

For each external declared category:
- If no observed behavior maps to it, add it to `overdeclared_external`

For ambiguous cases:
- Add to `unclear`
- Explain why the case is unclear

---

### Step 5: Check External Developer Statements

**Purpose**: Determine whether external policy statements are contradicted by observed behavior.

For each statement in `external_privacy_policy.developer_statements`:
1. Check whether `privacy_workspace/extension_summary.json` contains evidence contradicting the statement
2. If contradicted, mark as `potentially_contradicted`
3. If not contradicted, mark as `not_contradicted`
4. If unclear, mark as `unclear`

Do not infer contradiction without evidence.

---

### Step 6: Assign Overall Assessment

**Purpose**: Summarize the external privacy policy consistency result.

Set:

```json
{
  "is_consistent_with_external_policy": true,
  "risk_level": "low",
  "confidence": "medium",
  "summary": "..."
}
```

### Risk Level Guidance

#### low

Use `low` when:
- most observed categories are explained by the external policy
- no meaningful external underdeclaration exists
- no external developer statements are contradicted

#### medium

Use `medium` when:
- one or more privacy-relevant categories are missing from the external policy
- evidence is meaningful but not severe
- some external developer statements are unclear

#### high

Use `high` when:
- sensitive data appears missing from the external policy
- personal communications, authentication data, location, or website content are collected but not explained
- evidence suggests external transfer of data not explained by the external policy
- developer statements appear contradicted by code evidence
- external policy claims no data collection while `observed_privacy_data.items` contains concrete privacy-relevant data flows

---

### Step 7: Write external_privacy_comparison.json

**Purpose**: Save the final comparison output.

Write the complete result to:

```
privacy_workspace/external_privacy_comparison.json
```

The file must be valid JSON.

Do not include markdown in the JSON file.

---

## Required Output Schema

### external_privacy_comparison.json

```json
{
  "extension_id": "string or unknown",
  "extension_name": "string or unknown",
  "external_privacy_policy_url": "string or unknown",
  "comparison_summary": {
    "external_declared_category_count": 0,
    "observed_category_count": 0,
    "match_count": 0,
    "underdeclared_external_count": 0,
    "overdeclared_external_count": 0,
    "unclear_count": 0
  },
  "external_declared_categories": [
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
      "external_policy_category": "string",
      "observed_items": ["string"],
      "reason": "string",
      "confidence": "high|medium|low",
      "evidence": []
    }
  ],
  "underdeclared_external": [
    {
      "observed_item": "string",
      "mapped_category": "string",
      "reason": "string",
      "severity": "low|medium|high",
      "confidence": "high|medium|low",
      "evidence": []
    }
  ],
  "overdeclared_external": [
    {
      "external_policy_category": "string",
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
    "is_consistent_with_external_policy": true,
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
3. Do NOT create `privacy_workspace/external_privacy_comparison.json`

### When extension_summary.json Is Missing

1. Stop execution
2. Report that observed behavior data is missing
3. Do NOT create `privacy_workspace/external_privacy_comparison.json`

### When external_privacy_policy Is Missing or Not Retrieved

1. Stop execution
2. Report that no external privacy policy is available
3. Do NOT create `privacy_workspace/external_privacy_comparison.json`

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
- [ ] `external_privacy_policy` exists in `privacy_workspace/declared_privacy.json`
- [ ] `external_privacy_policy.retrieved` is `true`
- [ ] `external_privacy_policy.privacy_text` is non-empty
- [ ] No source files were directly analyzed
- [ ] External declared categories were derived from `privacy_workspace/declared_privacy.json.external_privacy_policy`
- [ ] If `privacy_workspace/external_policy_claims_review.json` exists, it was used as the primary source for external categories, claim IDs, excerpts, and developer statements
- [ ] Observed behavior was derived only from `privacy_workspace/extension_summary.json`
- [ ] If `observed_privacy_data.items` exists, it was inspected as the primary detailed observed-behavior source
- [ ] If `observed_privacy_data.items` is absent, older fields (`privacy`, `network`, `storage`, `workflows`, `risks`, `code_signals`) were used as fallback sources
- [ ] Every external underdeclared item includes a reason
- [ ] Every external underdeclared item includes evidence or a limitation
- [ ] External developer statements were checked conservatively
- [ ] `privacy_workspace/external_privacy_comparison.json` was written only if external policy exists
- [ ] `privacy_workspace/external_privacy_comparison.json` is valid JSON

---

## Example Output

```json
{
  "extension_id": "mmioliijnhnoblpgimnlajmefafdfilb",
  "extension_name": "Example Extension",
  "external_privacy_policy_url": "https://www.example.com/privacy",
  "comparison_summary": {
    "external_declared_category_count": 2,
    "observed_category_count": 3,
    "match_count": 1,
    "underdeclared_external_count": 2,
    "overdeclared_external_count": 1,
    "unclear_count": 0
  },
  "external_declared_categories": [
    "website_content",
    "user_activity"
  ],
  "observed_categories": [
    {
      "observed_item": "privacy.data_categories: tab_audio",
      "mapped_category": "website_content",
      "source_field": "privacy.data_categories",
      "reason": "Tab audio is website content/audio content processed by the extension.",
      "confidence": "high",
      "evidence": [
        {"file": "serviceWorker.js", "start": 35, "end": 45}
      ]
    }
  ],
  "matches": [
    {
      "external_policy_category": "website_content",
      "observed_items": [
        "privacy.data_categories: tab_audio"
      ],
      "reason": "Observed tab audio processing is explained by the external privacy policy.",
      "confidence": "high",
      "evidence": [
        {"file": "serviceWorker.js", "start": 35, "end": 45}
      ]
    }
  ],
  "underdeclared_external": [],
  "overdeclared_external": [
    {
      "external_policy_category": "user_activity",
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
    "is_consistent_with_external_policy": true,
    "risk_level": "low",
    "confidence": "medium",
    "summary": "The external privacy policy appears broadly consistent with the observed behavior, with one overdeclared category."
  },
  "limitations": [
    "This comparison depends on the completeness of extension_summary.json and the extracted external policy text."
  ]
}
```

---

## Exclusions

### Do Not Perform

- Do NOT run `fetch_privacy.py`
- Do NOT open Chrome Web Store
- Do NOT open the external privacy policy URL
- Do NOT analyze JavaScript files
- Do NOT inspect source folders
- Do NOT modify `privacy_workspace/declared_privacy.json`
- Do NOT modify `privacy_workspace/extension_summary.json`
- Do NOT create additional output files unless explicitly asked
- Do NOT create `privacy_workspace/external_privacy_comparison.json` if no external privacy policy exists

### This Step Only Compares Existing Outputs

This prompt is only for comparing already-generated external privacy policy data and observed privacy behavior.

Chrome Web Store privacy comparison is handled by the regular privacy comparison prompt.

Declared privacy extraction is handled by the privacy extraction prompt.

Actual behavior analysis is handled by the Chrome extension reverse engineering prompt.

---

## Notes

- This is a comparison and interpretation step, not a scraping step
- Precision and conservative reasoning matter more than aggressive conclusions
- External underdeclaration findings are the most important output
- External overdeclaration findings should not be treated as violations by default
- Always separate confirmed mismatches from unclear cases
- The quality of this comparison depends on the quality of both input JSON files
- If no external policy exists, skipping this step is the correct behavior
