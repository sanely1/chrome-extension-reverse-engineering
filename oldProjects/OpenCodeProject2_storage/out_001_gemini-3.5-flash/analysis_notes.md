# Analysis Notes - Grammarly Extension (ID: kbfnbcaeplbcioakkpcpgfkobkghlhen)

## Step 1: Manifest Summary

The manifest file `manifest.json` describes an Manifest V3 Chrome extension designed to provide grammar checking and generative AI writing assistance across multiple web platforms.

### Basic Metadata
- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App (Original: `manifest.json` line 320)
- **Short Name**: Superhuman Go (Beta) (Original: `manifest.json` line 321)
- **Version**: 14.1259.0 (Original: `manifest.json` line 331)
- **Manifest Version**: 3 (Original: `manifest.json` line 319)
- **Description**: "Improve your writing with all-in-one assistance—including generative AI, grammar check, and more." (Original: `manifest.json` line 300)
- **Service Worker**: `sw.js` (Original: `manifest.json` line 10)

### Permissions and Capabilities
- **Permissions**:
  - `scripting`: Allows programmatic execution of content scripts in active tabs.
  - `sidePanel`: Supports the Grammarly sidebar overlay interface.
  - `tabs`: Allows query/interaction with open tabs and navigation events.
  - `notifications`: Supports system notifications.
  - `cookies`: Provides API access to read and change cookies on host domains (often used for auth propagation).
  - `identity`: Standard OAuth2 support or user identity retrieval.
  - `storage`: Provides local/sync storage key space.
- **Host Permissions**:
  - `http://*/*`
  - `https://*/*`
  - (These host permissions grant access to read, modify, and intercept data on all HTTP and HTTPS websites.)
- **Optional Permissions**:
  - `nativeMessaging`: For potential communication with a local companion app.
  - `clipboardRead`: Grants access to paste or parse text from clipboard.

### Content Security Policy (connect-src Endpoints)
The extension declares a complex CSP containing many Grammarly domain endpoints:
- `https://auth.grammarly.com` (Auth and sessions)
- `https://capi.grammarly.com` / `wss://capi.grammarly.com` (Core service API/WebSockets)
- `https://gnar.grammarly.com` / `https://in.grammarly.com` / `https://f-log-extension.grammarly.io` (Telemetry, logs, metrics)
- `https://config.extension.grammarly.com` (Configuration, A/B gates)
- `https://chipmunk.grammarly.com` / `https://gates.grammarly.com` (Feature gates/AB testing)
- `https://skills.grammarly.com` (Generative AI or specialized rules)
- `https://subscription.grammarly.com` (User license management)
- `https://api.iterable.com` (Iterable campaign or messaging service)

### Entrypoints and Components
- **Background SW**: `sw.js` imports `src/js/Grammarly-bg.js`.
- **Content Scripts**:
  - Injecting `Grammarly-check.js` on `<all_urls>` (except specified exceptions) to perform basic DOM parsing/in-page assistant initialization.
  - Injecting site-specific `Grammarly.js` on Google Mail, Slack, Facebook, LinkedIn, Twitter/X, Trello, Upwork, WhatsApp, Wix, WordPress, Zendesk, Blackboard, etc.
  - Injecting `Grammarly-gDocs.js` on `docs.google.com/document/*`.
  - Injecting `Grammarly-gDocsEarlyInjector.js` at `document_start` on Google Docs.
  - Injecting `Grammarly-overleafStartContentScript.js` on Overleaf at `document_start`.
- **UI Elements**:
  - Action Popup: `src/popup.html` (referenced in manifest Action)
  - Side Panel: `src/sidePanel.html`
  - Sandbox: `src/gOS-sandbox.html`
  - Specialized iframe view: `src/inkwell/index.html`

