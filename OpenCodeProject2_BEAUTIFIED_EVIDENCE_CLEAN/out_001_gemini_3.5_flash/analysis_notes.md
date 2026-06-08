# Grammarly Extension Analysis Notes

## Step 1: Manifest Inventory Summary

### Metadata
- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App
- **Short Name**: Superhuman Go (Beta)
- **Version**: 14.1259.0
- **Manifest Version**: 3
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.

### Entry Points
- **Background**: `sw.js` (MV3 Service Worker)
- **Action/Popup**: `src/popup.html`
- **Side Panel**: `src/sidePanel.html`
- **Content Scripts**:
  - Script 1: Matches `<all_urls>` (excluding Outlook, Atlassian, Gmail, Quora, etc.), runs at `document_idle`. Loads `src/js/Grammarly-check.styles.js` and `src/js/Grammarly-check.js`.
  - Script 2: Matches Outlook, Atlassian, Gmail, Quora, etc., runs at `document_idle`. Loads `src/js/Grammarly.styles.js` and `src/js/Grammarly.js`.
  - Script 3: Matches Outlook/Live/Office mail, runs at `document_idle`. Loads `src/js/Grammarly.styles.js` and `src/js/Grammarly.js`.
  - Script 4: Matches Google Docs, runs at `document_idle`. Loads `src/js/Grammarly-gDocs.styles.js` and `src/js/Grammarly-gDocs.js`.
  - Script 5: Matches Google Docs, runs at `document_start`. Loads `src/js/Grammarly-gDocsEarlyInjector.js`.
  - Script 6: Matches Google Docs iframes/sub-pages, runs at `document_idle`. Loads `src/js/Grammarly-gDocsIframeCs.js`.
  - Script 7: Matches Overleaf, runs at `document_start`. Loads `src/js/Grammarly-overleafStartContentScript.js`.

### Permissions
- **permissions**: `["scripting", "sidePanel", "tabs", "notifications", "cookies", "identity", "storage"]`
- **host_permissions**: `["http://*/*", "https://*/*"]`
- **optional_permissions**: `["nativeMessaging", "clipboardRead"]`

### Security and Policy Info
- **Externally Connectable**: Matches `https://*.grammarly.com/*`. Allows Grammarly pages to connect directly to the extension.
- **Content Security Policy (CSP)**: Has highly specific `connect-src` domains pointing to `*.grammarly.com`, `*.grammarly.io`, `*.grammarly.net`, `api.iterable.com`, `coda.io`, `codahosted.io`. Includes reporting URL `https://f-log-extension.grammarly.io/logv2`.
- **Storage**: Uses `src/schema.json` as `managed_schema` for enterprise policy/configuration.

---

## Step 2: Source File Analysis (Outline and Findings)
