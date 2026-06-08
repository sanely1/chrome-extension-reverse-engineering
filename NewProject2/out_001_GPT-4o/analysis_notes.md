# Run 001 (GPT-4o)

## Manifest

- Name: Faircado - Second hand shopping
- Version: 3.8.12
- Manifest Version: 3
- Service Worker: background.js
- Content Scripts: content.js (matches: https://*/*)
- Permissions: contextMenus, activeTab, storage, tabs
- Host Permissions: https://*/*

Evidence: extension/manifest.json:1-41



## extension/background.js [whole-file, lines 1-903]


### Summary

This background script handles various extension functionalities including API calls, storage operations, messaging, and event listeners. It manages authentication, machine keys, supported websites data, AB tests, and extension configuration. It also tracks events using Mixpanel.


### Chrome APIs

- chrome.tabs (line 73)

- chrome.storage (line 82)

- chrome.runtime (line 136)

- chrome.browserAction (line 589)

- chrome.action (line 589)

- chrome.contextMenus (line 729)


### Event Listeners

- chrome.tabs.onActivated.addListener (line 583)

- chrome.tabs.onUpdated.addListener (line 586)

- (chrome.browserAction || chrome.action).onClicked.addListener (line 589)

- chrome.runtime.onMessage.addListener (line 604)

- chrome.contextMenus.onClicked.addListener (line 729)

- chrome.runtime.onInstalled.addListener (line 746)

- chrome.runtime.onStartup.addListener (line 767)


### Messaging

- Channel: ClearDataFromSessionStorage, direction: content->background, keys: []

- Channel: GetMachineKey, direction: content->background, keys: []

- Channel: GetAbTestsConfig, direction: content->background, keys: []

- Channel: unknown, direction: background->content, keys: []


### Storage

- Key: AUTH_KEY, type: local, op: getItem, purpose: unknown (line 793)

- Key: AUTH_VALUE, type: local, op: getItem, purpose: unknown (line 794)

- Key: MACHINE_KEY, type: local, op: setItem, purpose: unknown (line 216)

- Key: AB_TEST_VARIANT_RECORDS, type: local, op: setItem, purpose: unknown (line 492)

- Key: SUPPORTED_WEBSITES_DATA, type: local, op: setItem, purpose: unknown (line 324)

- Key: IS_PRODUCT_PAGE_HEURISTICS_DATA, type: local, op: getItem, purpose: unknown (line 156)

- Key: AB_TESTS_CACHED_CONFIG, type: local, op: getItem, purpose: unknown (line 434)

- Key: EXTENSION_CACHED_CONFIG, type: local, op: getItem, purpose: unknown (line 442)

- Key: AUTH_KEY, type: local, op: removeItem, purpose: unknown (line 823)

- Key: AUTH_VALUE, type: local, op: removeItem, purpose: unknown (line 824)


### Endpoints

- API definition https://catalog-service-api.faircado.com/api/v1/supported-website (line 3)

- API definition https://faircado.com/after-extension-install-versioned?v=3-8 (line 7)

- API definition https://faircado.com/extension-to-website-onboarding (line 8)

- API definition https://cms-api.faircado.com/api/supported-websites/list (line 9)

- API definition https://cms-api.faircado.com/api/is-product-page-heuristic?populate=regexpsUrl&populate=keyphrasesOnPage&populate=keyphrasesOnPage.keyphrases&populate=elementsOnPage&populate=elementsOnPage.regexps&populate=regexpsIsOnPage&populate=stopKeyphrasesOnPage&populate=stopKeyphrasesOnPage.keyphrases (line 10)

- API definition https://cms-api.faircado.com/api/extension-ab-tests/list (line 11)

- API definition https://cms-api.faircado.com/api/extension-config (line 12)

- API definition https://api.mixpanel.com (line 39)

- GET unknown (line 162)

- POST https://catalog-service-api.faircado.com/api/v1/supported-website (line 235)

- GET https://cms-api.faircado.com/api/supported-websites/list (line 277)

- POST unknown (line 372)

- POST unknown (line 838)


### DOM/Sinks

- None in this chunk


### Dynamic Code/Obfuscation

- webpack_modules

- minified_vars

- None in this chunk


### Risks


### Evidence

- extension/background.js:3-3

- extension/background.js:7-7

- extension/background.js:8-8

- extension/background.js:9-9

- extension/background.js:10-10

- extension/background.js:11-11

- extension/background.js:12-12

- extension/background.js:39-39

- extension/background.js:73-73

- extension/background.js:82-82

- extension/background.js:136-136

- extension/background.js:137-137

- extension/background.js:138-138

- extension/background.js:139-142

- extension/background.js:162-162

- extension/background.js:208-210

- extension/background.js:213-213

- extension/background.js:216-216

- extension/background.js:235-242

- extension/background.js:277-277

- extension/background.js:372-378

- extension/background.js:385-385

- extension/background.js:390-390

- extension/background.js:461-463

- extension/background.js:545-545

- extension/background.js:547-547

- extension/background.js:583-585

- extension/background.js:586-588

- extension/background.js:589-603

- extension/background.js:597-601

- extension/background.js:604-728

- extension/background.js:729-729

- extension/background.js:734-740

- extension/background.js:746-766

- extension/background.js:748-748

- extension/background.js:754-754

- extension/background.js:767-767

- extension/background.js:769-769

- extension/background.js:772-776

- extension/background.js:781-781

- extension/background.js:784-784

- extension/background.js:789-789

- extension/background.js:793-793

- extension/background.js:794-794

- extension/background.js:807-807

- extension/background.js:808-808

- extension/background.js:823-823

- extension/background.js:824-824

- extension/background.js:838-844

- extension/background.js:860-860

- extension/background.js:867-867

- extension/background.js:869-869


## extension/background.js [whole-file, lines 1-903]

### Summary
This background script handles various extension functionalities including API calls, storage operations, messaging, and event listeners. It manages authentication, machine keys, supported websites data, AB tests, and extension configuration. It also tracks events using Mixpanel.

### Chrome APIs
- chrome.tabs (line 73)
- chrome.storage (line 82)
- chrome.runtime (line 136)
- chrome.browserAction (line 589)
- chrome.action (line 589)
- chrome.contextMenus (line 729)

### Event Listeners
- chrome.tabs.onActivated.addListener (line 583)
- chrome.tabs.onUpdated.addListener (line 586)
- (chrome.browserAction || chrome.action).onClicked.addListener (line 589)
- chrome.runtime.onMessage.addListener (line 604)
- chrome.contextMenus.onClicked.addListener (line 729)
- chrome.runtime.onInstalled.addListener (line 746)
- chrome.runtime.onStartup.addListener (line 767)

### Messaging
- Channel: ClearDataFromSessionStorage, direction: content->background, keys: []
- Channel: GetItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: RemoveItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: SetItemToSessionStorage, direction: content->background, keys: ["items"]
- Channel: GetMachineKey, direction: content->background, keys: []
- Channel: GetAbTestsConfig, direction: content->background, keys: []
- Channel: unknown, direction: background->content, keys: []

### Storage
- Key: AUTH_KEY, type: local, op: getItem, purpose: unknown (line 793)
- Key: AUTH_VALUE, type: local, op: getItem, purpose: unknown (line 794)
- Key: MACHINE_KEY, type: local, op: setItem, purpose: unknown (line 216)
- Key: AB_TEST_VARIANT_RECORDS, type: local, op: setItem, purpose: unknown (line 492)
- Key: SUPPORTED_WEBSITES_DATA, type: local, op: setItem, purpose: unknown (line 324)
- Key: IS_PRODUCT_PAGE_HEURISTICS_DATA, type: local, op: getItem, purpose: unknown (line 156)
- Key: AB_TESTS_CACHED_CONFIG, type: local, op: getItem, purpose: unknown (line 434)
- Key: EXTENSION_CACHED_CONFIG, type: local, op: getItem, purpose: unknown (line 442)
- Key: AUTH_KEY, type: local, op: removeItem, purpose: unknown (line 823)
- Key: AUTH_VALUE, type: local, op: removeItem, purpose: unknown (line 824)

### Endpoints
- API definition https://catalog-service-api.faircado.com/api/v1/supported-website (line 3)
- API definition https://faircado.com/after-extension-install-versioned?v=3-8 (line 7)
- API definition https://faircado.com/extension-to-website-onboarding (line 8)
- API definition https://cms-api.faircado.com/api/supported-websites/list (line 9)
- API definition https://cms-api.faircado.com/api/is-product-page-heuristic?populate=regexpsUrl&populate=keyphrasesOnPage&populate=keyphrasesOnPage.keyphrases&populate=elementsOnPage&populate=elementsOnPage.regexps&populate=regexpsIsOnPage&populate=stopKeyphrasesOnPage&populate=stopKeyphrasesOnPage.keyphrases (line 10)
- API definition https://cms-api.faircado.com/api/extension-ab-tests/list (line 11)
- API definition https://cms-api.faircado.com/api/extension-config (line 12)
- API definition https://api.mixpanel.com (line 39)
- GET unknown (line 162)
- POST https://catalog-service-api.faircado.com/api/v1/supported-website (line 235)
- GET https://cms-api.faircado.com/api/supported-websites/list (line 277)
- POST unknown (line 372)
- POST unknown (line 838)

### DOM/Sinks
- None in this chunk

### Dynamic Code/Obfuscation
- webpack_modules
- minified_vars

### Risks
- None in this chunk

### Evidence
- extension/background.js:3-3
- extension/background.js:7-7
- extension/background.js:8-8
- extension/background.js:9-9
- extension/background.js:10-10
- extension/background.js:11-11
- extension/background.js:12-12
- extension/background.js:39-39
- extension/background.js:73-73
- extension/background.js:82-82
- extension/background.js:136-136
- extension/background.js:137-137
- extension/background.js:138-138
- extension/background.js:139-142
- extension/background.js:162-162
- extension/background.js:208-210
- extension/background.js:213-213
- extension/background.js:216-216
- extension/background.js:235-242
- extension/background.js:277-277
- extension/background.js:372-378
- extension/background.js:385-385
- extension/background.js:390-390
- extension/background.js:461-463
- extension/background.js:545-545
- extension/background.js:547-547
- extension/background.js:583-585
- extension/background.js:586-588
- extension/background.js:589-603
- extension/background.js:597-601
- extension/background.js:604-728
- extension/background.js:729-729
- extension/background.js:734-740
- extension/background.js:746-766
- extension/background.js:748-748
- extension/background.js:754-754
- extension/background.js:767-767
- extension/background.js:769-769
- extension/background.js:772-776
- extension/background.js:781-781
- extension/background.js:784-784
- extension/background.js:789-789
- extension/background.js:793-793
- extension/background.js:794-794
- extension/background.js:807-807
- extension/background.js:808-808
- extension/background.js:823-823
- extension/background.js:824-824
- extension/background.js:838-844
- extension/background.js:860-860
- extension/background.js:867-867
- extension/background.js:869-869


## extension/content.js [whole-file, lines 1-1762]

### Summary
This content script handles various interactions with the web page and the extension's background script. It communicates via Chrome messaging, interacts with local storage, and performs DOM manipulations. It also appears to be involved in A/B testing and fetching configuration data.

### Chrome APIs
- chrome.runtime (line 5138)
- chrome.tabs (line 5139)
- chrome.storage (line 5177)
- chrome.runtime.sendMessage (line 5229)
- chrome.runtime.getURL (line 5235)
- chrome.runtime.onMessage.addListener (line 5298)

### Event Listeners
- chrome.runtime.onMessage.addListener (line 5298)
- addListener (line 1)

### Messaging
- Channel: init, direction: content->background, keys: []
- Channel: IsActivated, direction: content->background, keys: []
- Channel: ClearDataFromSessionStorage, direction: content->background, keys: []
- Channel: GetItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: RemoveItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: SetItemToSessionStorage, direction: content->background, keys: ["items"]
- Channel: GetAbTestsConfig, direction: content->background, keys: []
- Channel: GetExtensionConfig, direction: content->background, keys: []
- Channel: GetHeuristicData, direction: content->background, keys: []
- Channel: mixpanel, direction: content->background, keys: ["site","experimentName","action","triggeringUrl"]
- Channel: isSupportedWebsite, direction: content->background, keys: []
- Channel: error, direction: content->background, keys: []
- Channel: GetMachineKey, direction: content->background, keys: []

### Storage
- Key: unknown, type: local, op: getItem, purpose: unknown
- Key: unknown, type: local, op: setItem, purpose: unknown

### Endpoints
- API definition https://cms-api.faircado.com/api/extension-ab-tests/list (line 1)
- API definition https://cms-api.faircado.com/api/extension-config (line 1)
- GET unknown (line 1)

### DOM/Sinks
- addEventListener (line 5716)
- querySelector (line 5722)
- MutationObserver (line 5772)
- querySelectorAll (line 5796)

### Dynamic Code/Obfuscation
- Function (line 5856)
- webpack_modules
- minified_vars

### Risks
- AST parsing failed: Cannot read properties of undefined (reading 'type'). Falling back to regex. (severity: low)

### Evidence
- extension/content.js:5138-5138
- extension/content.js:5139-5139
- extension/content.js:5177-5179
- extension/content.js:5229-5231
- extension/content.js:5235-5235
- extension/content.js:5298-5298
- extension/content.js:5299-5299
- extension/content.js:5300-5300
- extension/content.js:5301-5304
- extension/content.js:5371-5371
- extension/content.js:5389-5389
- extension/content.js:5486-5486
- extension/content.js:5522-5524
- extension/content.js:5716-5716
- extension/content.js:5722-5722
- extension/content.js:5772-5772
- extension/content.js:5796-5806
- extension/content.js:5856-5856
- extension/content.js:5892-5894
- extension/content.js:5903-5903
- extension/content.js:5913-5913
- extension/content.js:5929-5929
- extension/content.js:5950-5950
- extension/content.js:5979-5979
- extension/content.js:6009-6009
- extension/content.js:6027-6027
- extension/content.js:6042-6042
- extension/content.js:6049-6049
- extension/content.js:6056-6056
- extension/content.js:6085-6085
- extension/content.js:6120-6120
- extension/content.js:7527-7527
- extension/content.js:7576-7576
- extension/content.js:7904-7904
- extension/content.js:7993-7993
- extension/content.js:9892-9892
- extension/content.js:9923-9923
- extension/content.js:9929-9929
- extension/content.js:9953-9953
- extension/content.js:9963-9965
- extension/content.js:10166-10172
- extension/content.js:10231-10231
- extension/content.js:10233-10233
- extension/content.js:10311-10311
- extension/content.js:10342-10345
- extension/content.js:10369-10374
- extension/content.js:10407-10415
- extension/content.js:10422-10424
- extension/content.js:10427-10427
- extension/content.js:10430-10430
- extension/content.js:10528-10528
- extension/content.js:10545-10545
- extension/content.js:10635-10635
- extension/content.js:10636-10636
- extension/content.js:10690-10690
- extension/content.js:10791-10791
- extension/content.js:10818-10818
- extension/content.js:10901-10935
- extension/content.js:10938-10938


## extension/data-control.js [whole-file, lines 1-303]

### Summary
This script handles the data control page functionalities, including uninstalling the extension and activating it. It interacts with `localStorage` to manage the activation status and constructs a post-installation URL for redirection. It also uses Chrome messaging to get machine key and AB test configuration.

### Chrome APIs
- chrome.tabs (line 42)
- chrome.storage (line 51)
- chrome.runtime (line 105)

### Event Listeners
- None in this chunk

### Messaging
- Channel: ClearDataFromSessionStorage, direction: content->background, keys: []
- Channel: GetItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: RemoveItemFromSessionStorage, direction: content->background, keys: ["key"]
- Channel: SetItemToSessionStorage, direction: content->background, keys: ["items"]
- Channel: GetMachineKey, direction: content->background, keys: []
- Channel: GetAbTestsConfig, direction: content->background, keys: []

### Storage
- Key: AUTH_KEY, type: local, op: getItem, purpose: unknown (line 127)
- Key: AUTH_VALUE, type: local, op: getItem, purpose: unknown (line 130)
- Key: ACTIVATED, type: local, op: setItem, purpose: unknown (line 300)

### Endpoints
- API definition https://faircado.com/after-extension-install-versioned?v=3-8 (line 151)
- API definition https://faircado.com/extension-to-website-onboarding (line 152)
- API definition https://cms-api.faircado.com/api/extension-ab-tests/list (line 153)
- GET unknown (line 177)

### DOM/Sinks
- None in this chunk

### Dynamic Code/Obfuscation
- webpack_modules

### Risks
- None in this chunk

### Evidence
- extension/data-control.js:42-42
- extension/data-control.js:51-51
- extension/data-control.js:105-105
- extension/data-control.js:106-106
- extension/data-control.js:107-107
- extension/data-control.js:108-111
- extension/data-control.js:122-124
- extension/data-control.js:127-127
- extension/data-control.js:130-130
- extension/data-control.js:151-151
- extension/data-control.js:152-152
- extension/data-control.js:153-153
- extension/data-control.js:177-177
- extension/data-control.js:213-215
- extension/data-control.js:300-300


## extension/navigation-events.js [whole-file, lines 1-23]

### Summary
This script hooks into the browser's `history.pushState` and `history.replaceState` methods, as well as the `popstate` event, to send custom messages via `window.postMessage`. This is used to notify other parts of the application or embedded web content about navigation events.

### Chrome APIs
- None in this chunk

### Event Listeners
- window.addEventListener("popstate") (line 20)

### Messaging
- window.postMessage (used for inter-frame communication, not Chrome messaging) (line 10)

### Storage
- None in this chunk

### Endpoints
- None in this chunk

### DOM/Sinks
- addEventListener (line 20)

### Dynamic Code/Obfuscation
- webpack_modules

### Risks
- None in this chunk

### Evidence
- extension/navigation-events.js:20-20


## extension/popup.js [whole-file, lines 1-37]

### Summary
This script dynamically updates the text content and href attributes of various DOM elements within the popup based on the browser's language setting. Specifically, if the language starts with "de" (German), it changes the text to German messages and sets links to Amazon.de and Goodreads.com. No Chrome APIs or direct extension-specific logic were found in this chunk beyond basic DOM manipulation.

### Chrome APIs
- None in this chunk

### Event Listeners
- None in this chunk

### Messaging
- None in this chunk

### Storage
- None in this chunk

### Endpoints
- https://amazon.de (line 18)
- https://www.goodreads.com/book/show/55921837-die-mitternachtsbibliothek (line 26)
- https://www.goodreads.com/book/show/142293.Harry_Potter_und_der_Stein_der_Weisen (line 34)

### DOM/Sinks
- document.getElementById (line 4)
- innerText (line 6)
- href (line 18)

### Dynamic Code/Obfuscation
- webpack_modules

### Risks
- None in this chunk

### Evidence
- None in this chunk


## extension/save.js [whole-file, lines 1-60]

### Summary
This script handles image processing and communication for saving images. It listens for messages, creates an image element, loads the image (handling cross-origin requests), resizes it using a canvas, and then sends the processed image data back to the parent window via `window.parent.postMessage`. This appears to be part of a feature where an image can be extracted and potentially uploaded or used elsewhere.

### Chrome APIs
- None in this chunk

### Event Listeners
- window.addEventListener("message") (line 18)

### Messaging
- window.parent.postMessage (used for inter-frame communication) (line 31)

### Storage
- None in this chunk

### Endpoints
- None in this chunk

### DOM/Sinks
- addEventListener (line 18)
- document.createElement (line 20)
- image.onload (line 22)
- image.onerror (line 48)
- canvas.getContext("2d").drawImage (line 28)
- canvas.toDataURL (line 30)

### Dynamic Code/Obfuscation
- webpack_modules

### Risks
- None in this chunk

### Evidence
- extension/save.js:18-18


## Components

### Background (Service Worker)
- Files: extension/background.js
- APIs: chrome.tabs, chrome.storage, chrome.runtime, chrome.browserAction, chrome.action, chrome.contextMenus
- Listeners: chrome.tabs.onActivated.addListener, chrome.tabs.onUpdated.addListener, onClicked.addListener (for browserAction/action), chrome.runtime.onMessage.addListener, chrome.contextMenus.onClicked.addListener, chrome.runtime.onInstalled.addListener, chrome.runtime.onStartup.addListener
- Evidence: extension/background.js (multiple lines)

### Content Scripts
- Files: extension/content.js
- APIs: chrome.runtime, chrome.tabs, chrome.storage, chrome.runtime.sendMessage, chrome.runtime.getURL, chrome.runtime.onMessage.addListener
- Listeners: chrome.runtime.onMessage.addListener, addListener (line 10901)
- Evidence: extension/content.js (multiple lines)

### Injected Scripts
- Files: extension/navigation-events.js
- APIs: None directly from chrome object, uses history.pushState, history.replaceState, window.postMessage
- Listeners: window.addEventListener("popstate")
- Evidence: extension/navigation-events.js (multiple lines)

### UI
- Files: extension/popup.js, extension/data-control.js
- APIs: chrome.tabs, chrome.storage, chrome.runtime
- Listeners: document.getElementById("uninstallBtn")?.addEventListener("click"), document.getElementById("activateBtn")?.addEventListener("click")
- Evidence: extension/popup.js (multiple lines), extension/data-control.js (multiple lines)

### Page
- Files: extension/save.js (loaded by save.html)
- APIs: None directly from chrome object, uses window.postMessage
- Listeners: window.addEventListener("message")
- Evidence: extension/save.js (multiple lines)

### Remote
- Names: catalog-service-api.faircado.com, faircado.com, cms-api.faircado.com, api.mixpanel.com
- Purposes: API calls, analytics, extension configuration, supported website checks.
- Evidence: (multiple entries in outline.jsonl)


## Flows

- **User -> Web Page**: User visits a webpage.
- **Web Page -> Content Script (content.js)**: Content script is injected into the webpage.
- **Content Script (content.js) <-> Background Service Worker (background.js)**: Chrome Runtime Messaging for various interactions (initialization, Mixpanel tracking, supported website checks, error reporting).
- **Web Page -> Injected Script (navigation-events.js)**: Injected script is loaded as a web accessible resource.
- **Injected Script (navigation-events.js) -> Web Page**: `window.postMessage` used for notifying about navigation state changes (pushState, replaceState, popstate).
- **User -> Popup UI (popup.js)**: User clicks the extension icon, opening the popup.
- **Popup UI (popup.js) <-> Background Service Worker (background.js)**: Implicit interaction to set popup content based on URL.
- **User -> Data Control UI (data-control.js)**: User accesses the data control page.
- **Data Control UI (data-control.js) -> Background Service Worker (background.js)**: Chrome Runtime Messaging to get machine key and AB test configuration for activation.
- **Data Control UI (data-control.js) -> Background Service Worker (background.js)**: Triggers extension uninstall via `browser.management.uninstallSelf`.
- **Data Control UI (data-control.js) -> Web Page**: Redirects the user to a specific URL after activation.
- **User -> Image Save Page (save.js)**: User interacts with the image save functionality.
- **Image Save Page (save.js) -> Web Page**: `window.parent.postMessage` to send processed image data back to the parent window.
- **Background Service Worker (background.js) -> External APIs & Analytics (Remote)**: Fetches data from and sends data to various external APIs (supported websites, AB tests, extension config, Mixpanel).
- **Background Service Worker (background.js) <-> Extension Local Storage**: Uses `chrome.storage.local` for caching data, AB test records, user settings, and authentication.
- **Background Service Worker (background.js) <-> Extension Sync Storage**: Uses `chrome.storage.sync` for authentication data and machine key (if `localStorage` is undefined).
- **Data Control UI (data-control.js) <-> Extension Local Storage**: Uses `localStorage` for activation status.
- **Background Service Worker (background.js) <-> Extension Local Storage**: Uses `localStorage` for activation status and machine key.


## Workflows

### 1. Extension Installation & Onboarding Flow
**Triggers**: Extension installed (chrome.runtime.onInstalled)
**Steps**:
1. Extension is installed.
2. A machine key is generated and stored.
3. Uninstall URL is set with extension version and machine key.
4. Context menu item "Search this image on faircado" is created.
5. AB test variants are set up for "extension_to_website".
6. An "extension_installed_background" event is tracked via Mixpanel.
7. A new tab is opened to an onboarding page. For Firefox, it opens data-control.html.
**APIs**: chrome.runtime.onInstalled, chrome.runtime.setUninstallURL, chrome.contextMenus.create, chrome.tabs.create, chrome.storage.local.setItem, chrome.storage.sync.setItem
**Messages**: None directly, but getMachineKey and setupAbTestVariants might involve internal messages.
**Endpoints**: https://faircado.com/uninstall, https://faircado.com/after-extension-install-versioned?v=3-8, https://faircado.com/extension-to-website-onboarding, https://api.mixpanel.com/track
**Storage Keys**: machineKey, AB_TEST_VARIANT_RECORDS
**Evidence**: extension/background.js:746-766, extension/background.js:208-228, extension/background.js:486-495, extension/background.js:556-560, extension/background.js:541-548

### 2. User Activation Flow (from Data Control Page)
**Triggers**: User clicks "Activate" button on data-control.html page.
**Steps**:
1. User clicks activate button.
2. Machine key is retrieved.
3. After-install URL is determined.
4. `ACTIVATED` flag is set to "1" in `localStorage`.
5. User is redirected to the after-install URL.
**APIs**: chrome.runtime.sendMessage (for GetMachineKey), localStorage.setItem
**Messages**: GetMachineKey
**Endpoints**: https://faircado.com/after-extension-install-versioned?v=3-8, https://faircado.com/extension-to-website-onboarding
**Storage Keys**: machineKey, ACTIVATED
**Evidence**: extension/data-control.js:297-302, extension/background.js:208-228

### 3. Extension Icon Click Flow
**Triggers**: User clicks the browser action icon.
**Steps**:
1. `checkIfDataControlAcceptedBackground` is called.
2. If data control not accepted (Firefox only), data-control.html is opened.
3. `setPopupAction` is called.
4. Auth data (authKey, authValue, machineKey) is retrieved.
5. `messageTypes.showExtension` message is sent to the active tab with `manualExtensionOpen` and `machineKey`.
**APIs**: chrome.browserAction.onClicked.addListener or chrome.action.onClicked.addListener, chrome.tabs.create, chrome.tabs.sendMessage, localStorage.getItem, chrome.storage.sync.getItem
**Messages**: showExtension
**Endpoints**: None directly, but data-control.html opening.
**Storage Keys**: AUTH_KEY, AUTH_VALUE, machineKey, ACTIVATED
**Evidence**: extension/background.js:589-603, extension/background.js:791-820

### 4. Message Handling Flow (Background Script)
**Triggers**: Messages received by the background script (chrome.runtime.onMessage.addListener).
**Steps**:
- `init`: Sets green icon, gets auth data, sends response.
- `login`: Stores auth data, distributes auth data to all tabs.
- `logout`: Clears auth data, distributes logout to all tabs.
- `error`: Tracks error event via Mixpanel.
- `mixpanel`: Tracks generic Mixpanel event.
- `hasResult`: Sets green icon (or snoozed green icon).
- `noResult`: Sets white icon.
- `isSupportedWebsite`: Retrieves supported sites data, falls back to API if needed, finds site data, sends response.
- `GetHeuristicData`: Fetches product page heuristics data.
- `IsActivated`: Checks if extension is activated.
- `GetAbTestsConfig`: Fetches AB tests configuration.
- `GetExtensionConfig`: Fetches extension configuration.
- Session Storage Operations: `SetItemToSessionStorage`, `GetItemFromSessionStorage`, `RemoveItemFromSessionStorage`, `ClearDataFromSessionStorage`.
- `GetMachineKey`: Retrieves machine key.
**APIs**: chrome.runtime.onMessage.addListener, chrome.action.setIcon, localStorage.setItem, localStorage.getItem, chrome.storage.sync.setItem, chrome.storage.sync.removeItem, chrome.tabs.query, chrome.tabs.sendMessage, fetch, console.error
**Messages**: init, login, logout, error, mixpanel, hasResult, noResult, isSupportedWebsite, ClearDataFromSessionStorage, GetItemFromSessionStorage, RemoveItemFromSessionStorage, SetItemToSessionStorage, GetMachineKey, GetAbTestsConfig, GetHeuristicData, GetExtensionConfig
**Endpoints**: https://api.mixpanel.com/track, https://catalog-service-api.faircado.com/api/v1/supported-website, https://cms-api.faircado.com/api/supported-websites/list, https://cms-api.faircado.com/api/is-product-page-heuristic..., https://cms-api.faircado.com/api/extension-ab-tests/list, https://cms-api.faircado.com/api/extension-config
**Storage Keys**: AUTH_KEY, AUTH_VALUE, machineKey, ACTIVATED, AB_TESTS_CACHED_CONFIG, EXTENSION_CACHED_CONFIG, IS_PRODUCT_PAGE_HEURISTICS_DATA, supportedSitesData
**Evidence**: extension/background.js:604-728 (and many sub-functions for specific cases)

### 5. Image Search Context Menu Flow
**Triggers**: User right-clicks an image and selects "Search this image on faircado".
**Steps**:
1. Context menu item click is registered.
2. Auth data (machineKey) is retrieved.
3. `messageTypes.showExtension` message is sent to the active tab with `machineKey`, `imageUrl`, `manualImageSearch`, and `info` (from context menu click).
**APIs**: chrome.contextMenus.onClicked.addListener, chrome.tabs.sendMessage, localStorage.getItem, chrome.storage.sync.getItem
**Messages**: showExtension
**Endpoints**: None directly.
**Storage Keys**: AUTH_KEY, AUTH_VALUE, machineKey
**Evidence**: extension/background.js:729-745

### 6. Image Processing and Data Transfer Flow (Save Page)
**Triggers**: Message received by save.html (via window.addEventListener("message")).
**Steps**:
1. `save.js` receives a message containing an image URL.
2. An `<img>` element is created, `crossOrigin` set.
3. Image is loaded. On `onload`:
   - Image dimensions are calculated.
   - A `<canvas>` is created, image drawn onto it, resized.
   - Image data is extracted as a `dataURL`.
   - Processed image data (or null on error) is sent back to the parent window via `window.parent.postMessage`.
4. On `onerror`:
   - Null image data is sent back to the parent window.
**APIs**: None directly from chrome object, uses window.addEventListener("message"), document.createElement, window.parent.postMessage
**Messages**: window.postMessage (for inter-frame communication).
**Endpoints**: The `request.data.url` for the image source.
**Storage Keys**: None.
**Evidence**: extension/save.js:18-59


## Privacy Analysis

### Data Categories
- User credentials (AUTH_KEY, AUTH_VALUE)
- Unique Identifiers (machineKey)
- Browsing History/Activity (URLs accessed, Mixpanel tracking events, uninstall URL)
- User Preferences/Settings (USER_SETTINGS)
- Analytics/Telemetry (Mixpanel events: browser, time, distinct_id, event names, custom properties)
- IP Address (implied through network requests)

### Purposes
- Authentication (user login)
- Personalization (user settings)
- Analytics/Tracking (user behavior, installations, updates, errors, usage patterns)
- Feature functionality (supported website checks, AB testing, extension configuration fetching, machine key generation)
- Onboarding (post-installation redirection)

### Minimization
The extension collects various data including browsing activity (URLs), unique identifiers (machineKey), and authentication tokens. The broad tracking of browsing URLs and events suggests it might collect more data than strictly necessary for basic functionality.

### Consent
- A consent mechanism is suggested for Firefox users with the `ACTIVATED` flag through `data-control.js`. However, for other browsers, explicit, granular user consent for data collection and tracking is not clearly evident beyond the browser's default extension installation prompt.

### Retention
- Cached data (e.g., `AB_TESTS_CACHED_CONFIG`, `EXTENSION_CACHED_CONFIG`) has caching times, implying temporary retention. `AUTH_KEY`, `AUTH_VALUE`, `machineKey`, `ACTIVATED` appear to be stored indefinitely until cleared manually or upon uninstall. No explicit TTLs beyond caching for core user data.

### Third Parties
- **api.mixpanel.com**: Used for tracking events and user profiles.
- **catalog-service-api.faircado.com**: Used for supported website API calls.
- **cms-api.faircado.com**: Used for supported websites list, product page heuristics, AB tests, and extension configuration APIs.
- **faircado.com**: Used for onboarding and uninstall redirection URLs.

### Policy Compliance
- Potential concerns regarding explicit, granular user consent for data collection (especially browsing history via Mixpanel and various API calls) and the potentially broad data collection may violate Chrome Web Store Developer Program Policies regarding user data privacy and disclosure. The manifest description `"__MSG_Faircado_Description__"`, while localized, would need to be very explicit about all data practices.

## Risks

### Risk: Tracking
**Severity**: medium
**Justification**: The extension sends browsing activity (URLs) and unique identifiers (`machineKey`) to `api.mixpanel.com` and other Faircado APIs without explicit, granular user consent. This data could be used for behavioral tracking.
**Evidence**:
- extension/background.js:358-380 (Mixpanel tracking)
- extension/background.js:636-641 (Mixpanel message handling)
- extension/background.js:235-242 (fetchIsSupportedWebsite with X-Machine-Key)
- extension/background.js:748-752 (Uninstall URL with machineKey and extensionVersion)
- extension/background.js:208-228 (getMachineKey usage)
- extension/content.js (various mixpanel messages)

### Risk: PII Exfiltration (Potential)
**Severity**: low
**Justification**: While not explicitly observed, the collection of "authKey" and "authValue" combined with browsing activity and a machine key, if not handled with strong security measures, could lead to potential PII leakage or unauthorized access if the external APIs are compromised. The "payload_keys" in messages could also potentially carry PII if not carefully managed.
**Evidence**:
- extension/background.js:43-44 (AUTH_KEY, AUTH_VALUE storage keys)
- extension/background.js:791-800 (Storing AUTH_KEY, AUTH_VALUE)
- extension/background.js:802-819 (Getting AUTH_KEY, AUTH_VALUE)
- extension/background.js:614-617 (Login message handling with authKey, authValue)
- extension/content.js (payload keys in mixpanel message)

### Risk: Excessive Permissions (Potential)
**Severity**: low
**Justification**: The extension requests `activeTab`, `storage`, `tabs`, and `contextMenus`. While `tabs` and `storage` are clearly used, the need for `activeTab` or `contextMenus` for all features might be reviewed, though `contextMenus` is directly used for image search. The broad host permission `https://*/*` grants access to all secure websites, which is necessary for content scripts, but warrants attention due to the potential for data access across all visited sites.
**Evidence**: extension/manifest.json:33, extension/manifest.json:11 (content scripts matches)

### Risk: Insecure Storage
**Severity**: low
**Justification**: `AUTH_KEY` and `AUTH_VALUE` are stored in `localStorage` or `chrome.storage.sync`. While `chrome.storage.sync` offers some protection, `localStorage` is less secure and vulnerable to XSS attacks if not properly sanitized. There's no explicit mention of encryption for sensitive data at rest.
**Evidence**:
- extension/background.js:791-800 (localStorage.setItem, syncStorage.setItem for auth data)
- extension/background.js:213-216 (localStorage.getItem, localStorage.setItem for machineKey)

### Risk: Policy Violation
**Severity**: medium
**Justification**: The lack of explicit, granular consent mechanisms for data collection (especially browsing history via Mixpanel and various API calls) and the potentially broad data collection may violate Chrome Web Store Developer Program Policies regarding user data privacy and disclosure. The manifest description `"__MSG_Faircado_Description__"`, while localized, would need to be very explicit about all data practices.
**Evidence**:
- extension/manifest.json:19 (description)
- extension/background.js:358-380 (Mixpanel tracking without clear consent prompt)
- extension/background.js:235-242 (API calls with machine key without clear consent prompt)
- extension/data-control.js:297-302 (Activation flow primarily for Firefox, implying consent might be browser-specific or limited)

