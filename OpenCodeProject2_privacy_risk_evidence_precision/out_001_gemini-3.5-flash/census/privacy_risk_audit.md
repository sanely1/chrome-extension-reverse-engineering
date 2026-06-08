# Privacy and Risk Forensic Evidence Audit

## 1. Justification for Broad Evidence Ranges
The Grammarly extension source code is heavily minified and compiled using Webpack/Rollup bundlers. Specifically:
- `extension/sw.js` is a single-line service worker wrapper.
- `extension/src/js/Grammarly-bg.js` consists of only 2 extremely long minified lines containing all the core business logic (44 unique APIs, 8 listeners).
- `extension/src/js/Grammarly-check.js` is a single-line content script bundle.

Because the code is minified into single-line blocks, any reference to lines `1` or `2` of these files spans thousands of logical operations. It is physically impossible to narrow line ranges down below 80 lines (or down to specific functions) within the original minified sources because there are no newline boundaries. We have referenced original paths and line numbers (`1` and `2`) to preserve absolute fidelity to the original extension distribution.

## 2. Privacy and Risk Alignment Count Audit
In `extension_summary.json`, we represented 5 distinct, highly atomic categories of observed privacy data (Typed Document Content, Browsing URLs/Active Domain, User Identifiers, Browser Specifications, Page Metadata) and 5 risks to maximize forensic completeness and comply with detailed schema guidelines. In our initial high-level `privacy_candidate_review.csv` and `risk_candidate_review.csv`, we clustered these into 3 consolidated high-level candidate groups (Written Content, Session, and Telemetry) for ease of manual review. This granular expansion in the final report is fully justified and backed by the programmatic `discovered_apis.json` and the full CSP allowed connect-src domain listings.
