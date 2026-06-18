# FINAL PROMOTION AUDIT

**Target Extension ID:** kbfnbcaeplbcioakkpcpgfkobkghlhen
**Extension Name:** Grammarly: AI Writing Assistant and Grammar Checker App

This audit verifies that the counts of promoted network endpoints, messaging channels, and storage keys in the intermediate CSV tables are in perfect alignment with the final arrays represented in `extension_summary.json`.

## 1. ENDPOINTS AUDIT
- **Promoted Endpoints (CSV):** 491
- **Final JSON Endpoints:** 491 (de-duplicated URL keys, merging methods and evidence spans)
- **Status:** Perfect alignment. Zero unexpected drop-off.

## 2. MESSAGES AUDIT
- **Adjudicated Message Channels (CSV):** 235 (filtered from 267 promoted candidates)
- **Final JSON Messages:** 235 (grouped by unique name and direction to represent the exact protocol)
- **Excluded Candidates:** 32 generic event labels or internal callback hooks (such as `selectAlternative`, `longpressend`, `finished`) were rejected during LLM adjudication.
- **Status:** Perfect alignment. Only confirmed and likely message channels appear in the final output.

## 3. STORAGE KEYS AUDIT
- **Adjudicated Storage Keys (CSV):** 15 (filtered from 24 promoted candidates)
- **Final JSON Storage Keys:** 15
- **Excluded Candidates:** 9 namespace prefixes, helper classes, or callback variables (such as `host.userAccount.`, `ChromeMV3SessionStorageApiImpl`, `selectAdjacentFailed`, `ltr`) were rejected during LLM adjudication.
- **Status:** Perfect alignment. Only confirmed and likely keys appear in the final output.
