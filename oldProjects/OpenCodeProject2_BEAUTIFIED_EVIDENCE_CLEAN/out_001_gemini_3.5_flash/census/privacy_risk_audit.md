# Privacy and Risk Audit

This audit documents and justifies the mapping, evidence, and coverage of privacy and risk findings in the Grammarly extension reverse engineering run.

## 1. Broad Evidence Ranges Justification
Several evidence spans in the final report utilize line ranges wider than 40 or 80 lines (specifically, up to 100 lines in `Grammarly-bg.beautified.js`). These broad ranges are unavoidable and justified due to the following structural characteristics of the bundled background service worker:
- **Activity URLs and domains**: The logic monitoring navigation changes (via `chrome.tabs`) and checking allowlisted sites spans across several utility classes and setup handlers in the first 100 lines of `Grammarly-bg.beautified.js`. Splitting this logical flow would obscure the full context of how active URLs are processed and matched against the exclusion list.
- **Insecure Persistent Storage of Session Caches**: Session-related keys (including `isBGInitialized` and `bgInitFail`) are checked and persisted alongside general settings initialization within the startup routines. The range `1-100` comprehensively captures this initialization lifecycle.

## 2. Semantic Architecture Risk Mapping Coverage
The following semantic architecture families are mapped to risks as follows:
- **remote_config**: Feature gating and remote treatment flag fetching are handled via `treatment.grammarly.com` and `gates.grammarly.com`. These are covered by the `User Behavioral and Activity Tracking` and `Insecure Persistent Storage of Session Caches` risks because the fetched configuration is stored locally and correlated with the telemetry session.
- **native_external_bridge**: The optional `nativeMessaging` permission is analyzed as part of the `Excessive Permissions with All Urls match` risk, which evaluates the extension's broad access capabilities.
- **ai_or_model_features**: Generative AI writing assistant prompts are processed by the same CAPI endpoint as normal checks. Therefore, they are represented and covered under the `PII Exfiltration through captured text` risk.
