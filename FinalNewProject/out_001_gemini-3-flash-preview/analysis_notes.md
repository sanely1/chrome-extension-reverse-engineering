# Run 001 (gemini-3-flash-preview)

## Manifest

- Name: Faircado - Second hand shopping
- Version: 3.8.12
- Manifest Version: 3
- Service Worker: background.js
- Content Scripts: content.js (matches: https://*/*)
- Permissions: contextMenus, activeTab, storage, tabs
- Host Permissions: None explicitly listed in "host_permissions", but content scripts match "https://*/*"

Evidence: manifest.json:1-41

## background.js [whole-file, lines 1-903]

### Summary
Service worker managing storage, messaging, and analytics. Handles extension lifecycle events (install, update, startup).

### Chrome APIs
- chrome.storage (local, sync, session)
- chrome.tabs (create, sendMessage, query, onActivated, onUpdated)
- chrome.runtime (sendMessage, onMessage, onInstalled, onStartup, setUninstallURL)
- chrome.action / chrome.browserAction (onClicked, setIcon, setPopup)
- chrome.contextMenus (onClicked, create)

### Event Listeners
- chrome.tabs.onActivated, onUpdated
- chrome.runtime.onMessage, onInstalled, onStartup
- chrome.action.onClicked
- chrome.contextMenus.onClicked

### Messaging
- Channels: init, login, logout, error, mixpanel, showExtension, setAuth, clearAuth, and internal types.
- Direction: Both ways (content <-> background).

### Storage
- Keys: authKey, authValue, machineKey, supportedSitesData, isProductPageHeuristicsData, abTestsCachedConfig, extensionCachedConfig, abTestVariantRecords, userSettings.

### Endpoints
- POST https://catalog-service-api.faircado.com/api/v1/supported-website
- GET https://cms-api.faircado.com/api/supported-websites/list
- POST https://api.mixpanel.com/track
- POST https://api.mixpanel.com/engage#profile-batch-update

### Risks
- Tracking: Uses Mixpanel with a persistent machine identifier (machineKey) to track user events.

---

## content.js [10985 lines]

### Summary
Main content script injected into all pages. Responsible for product page detection, data extraction (title, images), and UI injection (iframes, catalogue redirector).

### Chrome APIs
- chrome.runtime (sendMessage, onMessage, getURL)

### DOM/Sinks
- Extensive use of document.querySelector and document.querySelectorAll for data extraction.
- Iframe injection (main web app and save.html helper).
- MutationObserver and ResizeObserver for UI synchronization.

### Privacy Observations
- Current page URL is sent to background for support check.
- Product images are processed and converted to base64 via a hidden iframe.
- Whole page HTML is parsed for metadata extraction.

### Risks
- PII Exfiltration: Sends current page URL to background.

---

## save.js [whole-file, lines 1-60]

### Summary
Helper script for save.html. Processes images into base64 using a canvas. Used by content.js to bypass CORS or extract image data.

---

## navigation-events.js [whole-file, lines 1-23]

### Summary
Web accessible resource that hooks history API to notify content script of SPA navigation events.


## Components

### Background (Service Worker)
- Files: background.js
- APIs: chrome.storage.local/sync, chrome.tabs, chrome.runtime, chrome.action, chrome.contextMenus
- Listeners: tabs.onActivated, tabs.onUpdated, runtime.onMessage, runtime.onInstalled, runtime.onStartup, action.onClicked, contextMenus.onClicked
- Evidence: background.js:1-903

### Content Scripts
- Files: content.js
- APIs: chrome.runtime
- Listeners: runtime.onMessage, window.message, document.onsecuritypolicyviolation
- Evidence: manifest.json:7-13, content.js:1-12412

### UI
- Files: popup.html, popup.js, data-control.html, data-control.js
- Evidence: popup.js:1-37, data-control.js:1-317

### Flows
- Content -> Background: 'isSupportedWebsite' to check if current URL matches supported catalog.
- Content -> Background: 'mixpanel' to track user interactions.
- Content -> Page: Injects 'faircado-catalogue-redirector' box or an iframe with the main web app.
- Content -> faircado.com: Allows the Faircado website to read data from the extension's storage via postMessage.

## Workflows

### Product Detection and Redirection
**Triggers**: User visits a webpage, URL changes.
**Steps**:
1. Content script sends current URL to background.
2. Background checks if site is supported (via cached list or API).
3. If supported, content script extracts product metadata (title, image) using site-specific selectors or general metadata parsing (htmlmetaparser).
4. If image search is triggered, image is converted to base64 via a hidden 'save.html' iframe.
5. If the 'extension_to_website' A/B test is enabled, a 'Find secondhand' box is injected into the page.
6. User clicks the box, and the script redirects to faircado.com/redirect-handler with a session-based redirection ID.

**APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL
**Messages**: isSupportedWebsite, mixpanel, showExtension
**Endpoints**: catalog-service-api.faircado.com, cms-api.faircado.com, api.mixpanel.com
**Storage**: machineKey, supportedSitesData, isProductPageHeuristicsData
**Evidence**: content.js:11294-11320 (detection), content.js:11894-11933 (redirection)


## Privacy Analysis

### Data Categories
- Browsing history: Current page URL is sent to background for support check.
- Installation ID: A persistent UUIDv4 (machineKey) is generated and sent with all tracking events.
- Product data: Titles and images of products viewed by the user are extracted and processed.
- User Credentials: Authentication keys/values are stored in chrome.storage.local/sync.

### Concrete Observed Privacy Data
- machineKey: generated/stored as installation identifier and sent with Mixpanel/API requests. (Evidence: background.js:205-238)
- current_url: transmitted to background to check if site is supported. (Evidence: content.js:11706-11709)
- page_metadata: extracted from products and sent to the Faircado web app or website. (Evidence: content.js:11412-11455)

### Purposes
- Feature functionality: Checking for supported sites and extracting product info to find alternatives.
- Analytics: Tracking extension usage and A/B test variants via Mixpanel.

### Minimization
Collects page URLs and product details for all visited sites (to check support). The use of a persistent machine identifier for tracking is noted.

### Consent
A 'data-control.html' page exists, which suggests an onboarding or activation flow where users might give consent, but the code shows background initialization happens on install.

### Third Parties
- api.mixpanel.com: Usage tracking (Evidence: background.js:378-398)
- faircado.com: Service provider for catalog and search.

## Risks

### Risk: Tracking
**Severity**: Medium
**Justification**: Uses Mixpanel with a persistent machine identifier to track user events across all supported sites.
**Evidence**: background.js:378-398, background.js:205-238

### Risk: PII Exfiltration (URLs)
**Severity**: Low
**Justification**: Sends the full URL of pages visited by the user to the background script for support check.
**Evidence**: content.js:11706-11709


## Validation

Schema validation: PASSED
- All required fields present
- Evidence included for all claims
- Enum values valid

