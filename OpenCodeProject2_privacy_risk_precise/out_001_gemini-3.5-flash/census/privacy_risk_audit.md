# Privacy and Risk Audit

This audit evaluates the privacy and security risk profiles discovered during the forensic analysis of Grammarly (ID: `kbfnbcaeplbcioakkpcpgfkobkghlhen`).

## Signal Coverage & Forensic Completeness
We discovered a rich signal set including:
- 491 Promoted and Reviewed Endpoints
- 160 Adjudicated Message Channels
- 15 Adjudicated Storage Keys
- 7 core workflows spanning installation, telemetry, configuration fetching, authentication, and inter-frame editor integration.

## Privacy Decompositions
We mapped 5 precise and distinct privacy-relevant data flows:
1. **Typed Document Content**: Capturing character inputs and text blocks from active webpages, buffering in local IndexedDB stores (`document_state` / `document_state_enc`), and streaming via secure WebSocket (`wss://capi.grammarly.com/fpws`) to CAPI checking engines.
2. **Browsing URLs & Domain Navigation**: Capturing the current URL context and tab changes, saving to session settings state, and logging to `gnar.grammarly.com` to validate platform exclusions.
3. **User Credentials & Session Identifiers**: Extracting Grammarly session cookies (`chrome.cookies.get`) and checking authentication status with `auth.grammarly.com`.
4. **Browser & Device Specifications**: Profiling device environments, user-agents, and system locales for WebSocket connections.
5. **Webpage DOM Metadata**: Intercepting document titles, input selector contexts, and lengths to format editing card offsets.

## Risk Justifications
We evaluated and recorded 5 concrete risks:
1. **PII Exfiltration (Medium)**: Relaying active user keystrokes for checking. Safe transport (WSS) and password filters mitigate higher vulnerabilities.
2. **Behavioral Tracking (Medium)**: Logging user navigations and URL focus patterns via telemetry alarms.
3. **Excessive Host Permissions (Low)**: Universal host matches (`<all_urls>`, `http://*/*`, `https://*/*`) allow script injections on all domains. Manifest-level exclusions mitigate severe breaches.
4. **Device Fingerprinting (Low)**: Harvesting detailed agent/screen properties.
5. **Insecure Local Storage (Low)**: Plain plain-text IndexedDB caches of document text structure.
