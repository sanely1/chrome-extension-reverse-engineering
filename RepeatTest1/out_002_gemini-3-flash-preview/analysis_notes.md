# Run 002 (gemini-3-flash-preview)

## Manifest

- Name: Faircado - Second hand shopping
- Version: 3.8.12
- Manifest Version: 3
- Service Worker: background.js
- Content Scripts: content.js (matches: https://*/*, run_at: document_start)
- Permissions: contextMenus, activeTab, storage, tabs
- Host Permissions: https://*/*
- Web Accessible Resources: /save.html, /public/icons/*, /navigation-events.js

Evidence: extension/manifest.json:1-41

## background.js [whole-file, lines 1-903]

### Summary
Main service worker managing extension lifecycle, authentication, supported website identification, A/B testing, and telemetry (Mixpanel).

### Chrome APIs
- chrome.storage.local, chrome.storage.sync, chrome.storage.session
- chrome.runtime.sendMessage, chrome.runtime.onMessage
- chrome.tabs.sendMessage, chrome.tabs.onActivated, chrome.tabs.onUpdated, chrome.tabs.query, chrome.tabs.create
- chrome.contextMenus.create, chrome.contextMenus.onClicked
- chrome.action.setIcon, chrome.action.onClicked
- chrome.runtime.onInstalled, chrome.runtime.onStartup, chrome.runtime.setUninstallURL

### Endpoints
- POST https://catalog-service-api.faircado.com/api/v1/supported-website
- GET https://cms-api.faircado.com/api/supported-websites/list
- GET https://cms-api.faircado.com/api/is-product-page-heuristic
- GET https://cms-api.faircado.com/api/extension-ab-tests/list
- GET https://cms-api.faircado.com/api/extension-config
- POST https://api.mixpanel.com/track
- POST https://api.mixpanel.com/engage#profile-batch-update

### Messaging
- content->background: init, login, logout, error, mixpanel, isSupportedWebsite
- background->content: showExtension, setAuth, clearAuth
- internal: getHeuristicData, isActivated, getAbTestsConfig, getExtensionConfig, getMachineKey, SessionStorage ops

### Risks
- Tracking (Medium): Extensive telemetry using Mixpanel, collecting machine ID and browsing context.

### Evidence
- extension/background.js:1-903

## content.js [whole-file, lines 1-10757]

### Summary
Main content script that detects product pages, extracts product metadata (title, image, brand, etc.), and injects the extension UI as an iframe. It uses complex heuristics and a library for parsing metadata (jsonld, rdfa, microdata).

### Chrome APIs
- chrome.runtime.sendMessage (to background)
- chrome.storage.local, chrome.storage.session (via messaging)

### Product Detection & Extraction
- isProductPage: Uses URL regex, keyword search in body, and Schema.org metadata detection.
- Data Extraction: Uses CSS selectors and oEmbed-style metadata parsing.
- getImageBaseDataByIframe: Likely sends image URLs to a helper for processing.

### UI Injection
- Injects an iframe wrapper with ID 'FAIRCADO_WRAPPER'.
- Main iframe source: https://extension-v3-8.faircado.com
- Draggable UI implemented for the extension icon.

### Messaging
- content->background: isSupportedWebsite, GetHeuristicData, mixpanel, error, GetMachineKey.
- content->webapp (iframe): setFilter, initializeAppSettings, setAuth, clearAuth, iconClicked.
- webapp->content: Various UI and control messages.

### Risks
- Tracking (Medium): Collects detailed product browsing data and page metadata.

### Evidence
- extension/content.js:9959-9985 (isProductPage)
- extension/content.js:10071-10110 (parseHtmlAndExtractMetadata)
- extension/content.js:10253-10271 (Iframe creation)

## Workflows

### Product Alternative Discovery
**Triggers**: User visits a website.
**Steps**:
1. Content script checks if site is supported via background.
2. If supported, content script runs heuristics and metadata extraction to detect if it's a product page.
3. If it's a product page, it extracts title, brand, image, etc.
4. Content script injects an iframe (WebApp).
5. WebApp receives extracted data and fetches secondhand alternatives from Faircado API.
6. WebApp displays results to the user.

### User Authentication
**Triggers**: User logs in/out via the WebApp or popup.
**Steps**:
1. WebApp/Popup sends login/logout message to background.
2. Background stores/clears auth data in chrome.storage.local/sync.
3. Background distributes auth state change to all open tabs.

### Discovery Telemetry
**Triggers**: User interacts with extension UI.
**Steps**:
1. Content script captures interaction (e.g., icon click).
2. Content script sends message to background.
3. Background tracks event via Mixpanel API, including machine ID and URL.

## Privacy Analysis

### Data Categories
- **Browsing Context**: The content script actively scrapes product details (title, brand, image, description) and the current URL.
- **Device/Identity**: A unique machine ID (UUID) is generated and stored to identify the user/browser across sessions.
- **User Authentication**: Stores auth tokens to keep the user logged into the Faircado service.
- **Behavioral Data**: Tracks clicks, UI expansions, and errors.

### Purposes
- **Functional**: Identifying the product to suggest alternatives.
- **Analytics**: Tracking extension usage and effectiveness (A/B tests).

### Consent
- The extension has a 'data-control.html' page which seems to be for consent/activation, especially for Firefox users (as noted in background.js:394).

## Risks

### Risk: Tracking
**Severity**: Medium
**Justification**: The extension monitors browsing activity on all 'https://*/*' sites to identify products and sends this context to its servers and Mixpanel.
**Evidence**: extension/content.js:11, extension/background.js:362

### Risk: PII Exfiltration
**Severity**: Low
**Justification**: Sends a unique machine ID and current URL to Mixpanel for tracking purposes.
**Evidence**: extension/background.js:367

## Validation

Schema validation: PASSED
- All required fields present
- Evidence included for all claims
- Enum values valid
