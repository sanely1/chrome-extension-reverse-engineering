Initial beautification pass: extension/save.js -> out_001_gemini-2.5-flash/save_beautified.js
Initial beautification pass: extension/popup.js -> out_001_gemini-2.5-flash/popup_beautified.js
Initial beautification pass: extension/navigation-events.js -> out_001_gemini-2.5-flash/navigation-events_beautified.js
Initial beautification pass: extension/data-control.js -> out_001_gemini-2.5-flash/data-control_beautified.js

### Manifest Summary
- **Name:** Faircado - Second hand shopping
- **Description:** We help you make the sustainable choice your go-to!
- **Version:** 3.8.12
- **Manifest Version:** 3
- **Default Locale:** en
- **Background Service Worker:** extension/background.js
- **Content Scripts:** extension/content.js, extension/content.css (matches https://*/*, runs at document_start, all_frames: true)
- **Web Accessible Resources:** extension/save.html, extension/public/icons/*, extension/navigation-events.js (matches *://*/*)
- **Permissions:** contextMenus, activeTab, storage, tabs
- **Host Permissions:** https://*/* (inferred from content scripts)
- **OAuth2 Client ID:** 56728365748-594crqe66dmn6aff41vkpbjsik6uqeko.apps.googleusercontent.com
- **OAuth2 Scopes:** https://www.googleapis.com/auth/userinfo.email
- **Update URL:** https://clients2.google.com/service/update2/crx
- **Content Security Policy (extension_pages):** default-src 'none'; font-src 'self' https://assets.faircado.com; img-src * data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; media-src https://assets.faircado.com; connect-src https://assets.faircado.com https://catalog-service-api.faircado.com https://customer-service-api.faircado.com https://catalog-service-api.staging.faircado.com https://customer-service-api.staging.faircado.com https://api.mixpanel.com https://cms.faircado.com https://cms.staging.faircado.com https://cms-api.faircado.com https://cms-api.staging.faircado.com;
- **Content Security Policy (img-src):** self

### Analysis of extension/background.js
- **Chrome API Calls:** `chrome.tabs.onActivated.addListener`, `chrome.tabs.onUpdated.addListener`, `chrome.action.onClicked.addListener`, `chrome.runtime.onMessage.addListener`, `chrome.contextMenus.onClicked.addListener`, `chrome.runtime.onInstalled.addListener`, `chrome.runtime.onStartup.addListener`, `chrome.tabs.create`, `chrome.tabs.sendMessage`, `chrome.runtime.sendMessage` (various internal types), `chrome.contextMenus.create`, `chrome.runtime.setUninstallURL`, `chrome.action.setIcon`, `chrome.action.setPopup`, `browser.tabs.query` (Firefox specific).
- **Event Listeners:** `chrome.tabs.onActivated` (sets popup action), `chrome.tabs.onUpdated` (sets popup action), `chrome.action.onClicked` (handles extension icon click, data control, sends `showExtension` message), `chrome.runtime.onMessage` (handles various message types from content script), `chrome.contextMenus.onClicked` (handles image search context menu click), `chrome.runtime.onInstalled` (initializes uninstall URL, context menu, runs post-install logic, Mixpanel tracking), `chrome.runtime.onStartup` (retrieves supported sites data).
- **Messaging:** (See messages.csv - defines and handles messages like `init`, `login`, `logout`, `error`, `mixpanel`, `hasResult`, `noResult`, `isSupportedWebsite`, `GetHeuristicData`, `IsActivated`, `GetAbTestsConfig`, `GetExtensionConfig`, `SetItemToSessionStorage`, `GetItemFromSessionStorage`, `RemoveItemFromSessionStorage`, `ClearDataFromSessionStorage`, `GetMachineKey`, `showExtension`, `setAuth`, `clearAuth`)
- **Storage Keys:** (See storage_keys.csv - `AUTH_KEY`, `AUTH_VALUE`, `MACHINE_KEY`, `SUPPORTED_WEBSITES_DATA`, `IS_PRODUCT_PAGE_HEURISTICS_DATA`, `AB_TESTS_CACHED_CONFIG`, `EXTENSION_CACHED_CONFIG`, `AB_TEST_VARIANT_RECORDS`, `ACTIVATED`, `USER_SETTINGS`)
- **Network Endpoints:** (See endpoints.csv - `IS_SUPPORTED_WEBSITE_API`, `WEB_APP_ADDRESS/uninstall`, `AFTER_EXTENSION_INSTALL_URL`, `AFTER_EXTENSION_INSTALL_URL_EXTENSION_TO_WEBSITE`, `SUPPORTED_WEBSITES_API`, `IS_PRODUCT_PAGE_HEURISTIC_API`, `EXTENSION_AB_TESTS_API`, `EXTENSION_CONFIG_API`, `MIXPANEL_URL/track`, `MIXPANEL_URL/engage`)
- **Privacy Observations:** (See extension_summary.json, observed_privacy_data.items - Machine Key, Browser Info, Current URL, Auth Keys, A/B Test Variants, Install/Update Time, Image URL for search)

### Analysis of extension/content.js
- **Chrome API Calls:** `chrome.runtime.sendMessage` (various internal types, and general message forwarding), `chrome.runtime.getURL` (for web accessible resources).
- **Event Listeners:** `window.message` (for navigation events from injected script, messages from embedded web app, messages from external apps, messages from web app), `click` (on `#uninstallBtn`, `#activateBtn` - though these are in data-control.js module, imported and used), `document.onsecuritypolicyviolation` (handles CSP violations), `MutationObserver` (used for `waitForEcosiaAdsToBeLoaded`, generic creation in `createMutationObserver`, and in `fetchPageData`, `watchForPageDataChange`).
- **Messaging:** (See messages.csv - defines and handles messages like `init`, `IsActivated`, `GetExtensionConfig`, `isSupportedWebsite`, `error`, `mixpanel`, `GetMachineKey`, `showExtension`, `closeExtension`, `openOnFullMode`, `webAppReady`, `hasResult`, `setToExtensionStorage`, `setAuth`, `clearAuth`, `setFilter`, `iconClicked`, `initializeAppSettings`, `setDocumentBackgroundColor`, `toggleEmbeddedAccordion`, `removeExtensionFromDOM`, `colorScheme`, `getFromExtensionStorage`, `getFromExtensionStorageResponse`, and custom image data requests/responses for `save.js` iframe)
- **Storage Keys:** (See storage_keys.csv - `USER_SETTINGS`, `AB_TEST_VARIANT_RECORDS`, `FAIRCADO_EXT_SETTINGS`, dynamic `redirectionKey` for sessionStorage, dynamic `event.data.key` for various storage areas)
- **Network Endpoints:** (See endpoints.csv - `WEB_APP_ADDRESS` as origin/base for iframes, `faircado.com/redirect-handler`)
- **Privacy Observations:** (See extension_summary.json, observed_privacy_data.items - Document Color Scheme, Page Metadata, User Settings Language, Window/Element Dimensions and Position, CSP Violations)

### Analysis of extension/popup.js
- **Chrome API Calls:** None.
- **Event Listeners:** None directly observed, logic executes on script load based on `window.navigator.language`.
- **Messaging:** None.
- **Storage Operations:** None.
- **Network Endpoints:** (See endpoints.csv - `https://amazon.de`, `https://www.goodreads.com/...`)
- **Privacy Observations:** (See extension_summary.json, observed_privacy_data.items - User Language (Navigator API))

### Analysis of extension/save.js
- **Chrome API Calls:** None.
- **Event Listeners:** `window.message` (receives image data requests from parent).
- **Messaging:** (See messages.csv - custom messages for image data request and response between parent and iframe)
- **Storage Operations:** None.
- **Network Endpoints:** (See endpoints.csv - `dynamic (request.data.url)` for image fetching)
- **Privacy Observations:** (See extension_summary.json, observed_privacy_data.items - Image Data (base64 encoded), Image URL)

### Analysis of extension/navigation-events.js
- **Chrome API Calls:** None.
- **Event Listeners:** `window.popstate`, `history.pushState` (overridden), `history.replaceState` (overridden).
- **Messaging:** (See messages.csv - custom messages for `pushStateFaircado`, `replaceStateFaircado`, `popstateFaircado` to content script)
- **Storage Operations:** None.
- **Network Endpoints:** None.
- **Privacy Observations:** (See extension_summary.json, observed_privacy_data.items - Navigation Events)
