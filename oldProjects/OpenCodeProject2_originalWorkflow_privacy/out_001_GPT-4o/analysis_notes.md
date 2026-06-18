# Run 001 (GPT-4o)

## Manifest

- Name: Grammarly: AI Writing Assistant and Grammar Checker App
- Version: 14.1259.0
- Manifest Version: 3
- Service Worker: sw.js
- Content Scripts: 
  - src/js/Grammarly-check.js, src/js/Grammarly-check.styles.js (matches: <all_urls>, run_at: document_idle)
  - src/js/Grammarly.js, src/js/Grammarly.styles.js (matches: various, run_at: document_idle)
  - src/js/Grammarly-gDocs.js, src/js/Grammarly-gDocs.styles.js (matches: docs.google.com/document/*, run_at: document_idle)
  - src/js/Grammarly-gDocsEarlyInjector.js (matches: docs.google.com/document/*, run_at: document_start)
  - src/js/Grammarly-gDocsIframeCs.js (matches: docs.google.com/*, run_at: document_idle)
  - src/js/Grammarly-overleafStartContentScript.js (matches: https://*.overleaf.com/*, run_at: document_start)
- Permissions: scripting, sidePanel, tabs, notifications, cookies, identity, storage
- Host Permissions: http://*/*, https://*/*
- Optional Permissions: nativeMessaging, clipboardRead

Evidence: extension/manifest.json:1-365

## extension/sw.js [whole-file, lines 1-1]

### Summary
Analyzed extension/sw.js chunk lines 1-1.

### Dynamic Code
- importScripts

### Risks
- remote_code: Dynamic code execution via importScripts (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-1/46, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 1-2000.

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-2/46, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 2001-4000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-3/46, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 4001-6000.

### Endpoints
- https://properties.
- https://treatment.
- https://gates.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-4/46, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 6001-8000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-5/46, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 8001-10000.

### Endpoints
- http://localhost
- https://www.grammarly.com/plans
- http://localhost

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-6/46, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 10001-12000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-7/46, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 12001-14000.

### Endpoints
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-8/46, lines 14001-16000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 14001-16000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-9/46, lines 16001-18000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 16001-18000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-10/46, lines 18001-20000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 18001-20000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-11/46, lines 20001-22000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 20001-22000.

### Dynamic Code
- new Function

### Obfuscation Hints
minified_vars, function_chains

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-12/46, lines 22001-24000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 22001-24000.

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-13/46, lines 24001-26000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 24001-26000.

### Dynamic Code
- eval

### Obfuscation Hints
webpack_modules, minified_vars, function_chains

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-14/46, lines 26001-28000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 26001-28000.

### Dynamic Code
- importScripts

### Obfuscation Hints
minified_vars, function_chains

### Risks
- remote_code: Dynamic code execution via importScripts (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-15/46, lines 28001-30000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 28001-30000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-16/46, lines 30001-32000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 30001-32000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-17/46, lines 32001-34000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 32001-34000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-18/46, lines 34001-36000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 34001-36000.

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-19/46, lines 36001-38000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 36001-38000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-20/46, lines 38001-40000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 38001-40000.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.sendMessage

### Endpoints
- https://example.com/metadata/googlecalendar
- https://www.example.com/tos
- https://www.example.com/privacy
- https://example.com/metadata/slack
- https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg
- https://example.com/icon.svg
- https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg
- https://example.com/icon.svg
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-21/46, lines 40001-42000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 40001-42000.

### Chrome APIs
- chrome.runtime.getManifest
- chrome.runtime.id

### Endpoints
- https://assets.extension.grammarly.com/
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://gateway.qagr.io
- https://gateway.ppgr.io
- https://gateway.grammarly.com

### Dynamic Code
- eval

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-bg.js [chunk-22/46, lines 42001-44000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 42001-44000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-23/46, lines 44001-46000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 44001-46000.

### Event Listeners
- addEventListener

### Endpoints
- https://auth.grammarly.com/v4/api/oauth2/authorize
- https://auth.grammarly.com/v4/api/oauth2/exchange
- https://auth.grammarly.com/v4/api/oauth2/token
- https://auth.grammarly.com/v4/api/revoke-by-refresh-token
- https://auth.grammarly.com/v4/api/userinfo
- https://auth.ppgr.io/v4/api/oauth2/authorize
- https://auth.ppgr.io/v4/api/oauth2/exchange
- https://auth.ppgr.io/v4/api/oauth2/token
- https://auth.ppgr.io/v4/api/revoke-by-refresh-token
- https://auth.ppgr.io/v4/api/userinfo
- https://auth.qagr.io/v4/api/oauth2/authorize
- https://auth.qagr.io/v4/api/oauth2/exchange
- https://auth.qagr.io/v4/api/oauth2/token
- https://auth.qagr.io/v4/api/revoke-by-refresh-token
- https://auth.qagr.io/v4/api/userinfo

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-24/46, lines 46001-48000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 46001-48000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.id
- chrome.runtime.lastError

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-25/46, lines 48001-50000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 48001-50000.

### Chrome APIs
- chrome.cookie.get
- chrome.cookie.set
- chrome.cookies.get
- chrome.cookies.remove
- chrome.cookies.set
- chrome.runtime
- chrome.runtime.lastError

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-26/46, lines 50001-52000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 50001-52000.

### Endpoints
- https://gateway.grammarly.com/authorship/v1/

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-27/46, lines 52001-54000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 52001-54000.

### Event Listeners
- addEventListener

### Endpoints
- https://github.com/zloirock/core-js/blob/v3.38.0/LICENSE
- https://github.com/zloirock/core-js

### Dynamic Code
- importScripts

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via importScripts (Severity: high)


## extension/src/js/Grammarly-bg.js [chunk-28/46, lines 54001-56000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 54001-56000.

### Endpoints
- https://f-log-inkwell.grammarly.io/batch/log

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-bg.js [chunk-29/46, lines 56001-58000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 56001-58000.

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-30/46, lines 58001-60000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 58001-60000.

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-31/46, lines 60001-62000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 60001-62000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-32/46, lines 62001-64000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 62001-64000.

### Endpoints
- https://coda.io
- https://staging.coda.io
- https://head.coda.io
- https://dev.coda.io:8080
- https://coda.grammarly.com
- https://coda.ppgr.io
- https://coda.qagr.io
- https://coda-local.ppgr.io:8080
- https://coda.io/favicon.ico

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-33/46, lines 64001-66000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 64001-66000.

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-34/46, lines 66001-68000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 66001-68000.

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-35/46, lines 68001-70000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 68001-70000.

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-bg.js [chunk-36/46, lines 70001-72000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 70001-72000.

### Event Listeners
- .addListener

### Endpoints
- https://www.grammarly.com/safariWebExt/auth/callback

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-37/46, lines 72001-74000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 72001-74000.

### Endpoints
- https://docs.google.com/document

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-38/46, lines 74001-76000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 74001-76000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-39/46, lines 76001-78000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 76001-78000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-40/46, lines 78001-80000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 78001-80000.

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-41/46, lines 80001-82000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 80001-82000.

### Chrome APIs
- chrome.google.com

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-42/46, lines 82001-84000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 82001-84000.

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-43/46, lines 84001-86000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 84001-86000.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.extension
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime
- chrome.runtime.getURL
- chrome.runtime.lastError
- chrome.runtime.onConnect
- chrome.runtime.onConnect.addListener
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage
- chrome.storage.managed.get
- chrome.tabs

### Event Listeners
- .addListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onConnect.addListener
- chrome.runtime.onMessage.addListener

### Storage
- Key: "unknown", type: managed, op: get

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-bg.js [chunk-44/46, lines 86001-88000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 86001-88000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-45/46, lines 88001-90000]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 88001-90000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-bg.js [chunk-46/46, lines 90001-90439]

### Summary
Analyzed extension/src/js/Grammarly-bg.js chunk lines 90001-90439.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-check.js [chunk-1/8, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 1-2000.

### Chrome APIs
- chrome.runtime.getManifest
- chrome.runtime.id

### Endpoints
- https://properties.
- https://treatment.
- https://gates.
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://assets.extension.grammarly.com/

### Obfuscation Hints
webpack_modules, minified_vars, function_chains

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-check.js [chunk-2/8, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 2001-4000.

### Chrome APIs
- chrome.toolbar.popup

### Endpoints
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-check.js [chunk-3/8, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 4001-6000.

### Chrome APIs
- chrome.cs.load.error

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-check.js [chunk-4/8, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 6001-8000.

### Event Listeners
- .addListener
- addEventListener

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars, function_chains

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-check.js [chunk-5/8, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 8001-10000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.getManifest
- chrome.runtime.getURL
- chrome.runtime.sendMessage

### Event Listeners
- addEventListener

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars, function_chains

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-check.js [chunk-6/8, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 10001-12000.

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-check.js [chunk-7/8, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 12001-14000.

### Chrome APIs
- chrome.action
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime
- chrome.runtime.getURL
- chrome.runtime.lastError
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener

### Storage
- Key: "unknown", type: managed, op: get

### Endpoints
- https://auth.grammarly.com/v4/api/oauth2/authorize
- https://auth.grammarly.com/v4/api/oauth2/exchange
- https://auth.grammarly.com/v4/api/oauth2/token
- https://auth.grammarly.com/v4/api/revoke-by-refresh-token
- https://auth.grammarly.com/v4/api/userinfo
- https://auth.ppgr.io/v4/api/oauth2/authorize
- https://auth.ppgr.io/v4/api/oauth2/exchange
- https://auth.ppgr.io/v4/api/oauth2/token
- https://auth.ppgr.io/v4/api/revoke-by-refresh-token
- https://auth.ppgr.io/v4/api/userinfo
- https://auth.qagr.io/v4/api/oauth2/authorize
- https://auth.qagr.io/v4/api/oauth2/exchange
- https://auth.qagr.io/v4/api/oauth2/token
- https://auth.qagr.io/v4/api/revoke-by-refresh-token
- https://auth.qagr.io/v4/api/userinfo
- https://www.grammarly.com

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-check.js [chunk-8/8, lines 14001-14264]

### Summary
Analyzed extension/src/js/Grammarly-check.js chunk lines 14001-14264.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.permissions.contains
- chrome.runtime.getURL
- chrome.runtime.id
- chrome.runtime.lastError
- chrome.runtime.onMessage
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.sendMessage
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage

### Event Listeners
- .addListener
- chrome.runtime.onMessage.addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-1/48, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 1-2000.

### Endpoints
- https://assets.grammarly.com/emoji/v1/
- https://assets.grammarly.com/animations/v1/

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly.js [chunk-2/48, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 2001-4000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-3/48, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 4001-6000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-4/48, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 6001-8000.

### Endpoints
- https://properties.
- https://treatment.
- https://gates.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-5/48, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 8001-10000.

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-6/48, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 10001-12000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-7/48, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 12001-14000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-8/48, lines 14001-16000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 14001-16000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-9/48, lines 16001-18000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 16001-18000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-10/48, lines 18001-20000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 18001-20000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-11/48, lines 20001-22000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 20001-22000.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime.getURL
- chrome.runtime.id
- chrome.runtime.lastError
- chrome.runtime.onMessage
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.sendMessage
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener
- addEventListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onMessage.addListener

### Storage
- Key: "unknown", type: managed, op: get

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-12/48, lines 22001-24000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 22001-24000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.getManifest

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-13/48, lines 24001-26000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 24001-26000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-14/48, lines 26001-28000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 26001-28000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-15/48, lines 28001-30000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 28001-30000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-16/48, lines 30001-32000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 30001-32000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-17/48, lines 32001-34000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 32001-34000.

### Event Listeners
- addEventListener

### Endpoints
- https://www.grammarly.com/product/product-recommendation-table-comparison

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-18/48, lines 34001-36000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 34001-36000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-19/48, lines 36001-38000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 36001-38000.

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-20/48, lines 38001-40000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 38001-40000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-21/48, lines 40001-42000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 40001-42000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-22/48, lines 42001-44000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 42001-44000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-23/48, lines 44001-46000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 44001-46000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-24/48, lines 46001-48000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 46001-48000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-25/48, lines 48001-50000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 48001-50000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-26/48, lines 50001-52000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 50001-52000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-27/48, lines 52001-54000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 52001-54000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-28/48, lines 54001-56000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 54001-56000.

### Chrome APIs
- chrome.runtime.getManifest
- chrome.runtime.id

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://assets.extension.grammarly.com/
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly.js [chunk-29/48, lines 56001-58000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 56001-58000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-30/48, lines 58001-60000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 58001-60000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.lastError

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-31/48, lines 60001-62000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 60001-62000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-32/48, lines 62001-64000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 62001-64000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-33/48, lines 64001-66000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 64001-66000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly.js [chunk-34/48, lines 66001-68000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 66001-68000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-35/48, lines 68001-70000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 68001-70000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-36/48, lines 70001-72000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 70001-72000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-37/48, lines 72001-74000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 72001-74000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-38/48, lines 74001-76000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 74001-76000.

### Event Listeners
- .addListener

### Endpoints
- https://reactjs.org/docs/error-decoder.html?invariant=
- http://www.w3.org/1999/xlink
- http://www.w3.org/XML/1998/namespace
- http://www.w3.org/1999/xlink

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-39/48, lines 76001-78000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 76001-78000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-40/48, lines 78001-80000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 78001-80000.

### Endpoints
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-41/48, lines 80001-82000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 80001-82000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-42/48, lines 82001-84000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 82001-84000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-43/48, lines 84001-86000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 84001-86000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-44/48, lines 86001-88000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 86001-88000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-45/48, lines 88001-90000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 88001-90000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly.js [chunk-46/48, lines 90001-92000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 90001-92000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- https://auth.grammarly.com/v4/api/oauth2/authorize
- https://auth.grammarly.com/v4/api/oauth2/exchange
- https://auth.grammarly.com/v4/api/oauth2/token
- https://auth.grammarly.com/v4/api/revoke-by-refresh-token
- https://auth.grammarly.com/v4/api/userinfo
- https://auth.ppgr.io/v4/api/oauth2/authorize
- https://auth.ppgr.io/v4/api/oauth2/exchange
- https://auth.ppgr.io/v4/api/oauth2/token
- https://auth.ppgr.io/v4/api/revoke-by-refresh-token
- https://auth.ppgr.io/v4/api/userinfo
- https://auth.qagr.io/v4/api/oauth2/authorize
- https://auth.qagr.io/v4/api/oauth2/exchange
- https://auth.qagr.io/v4/api/oauth2/token
- https://auth.qagr.io/v4/api/revoke-by-refresh-token
- https://auth.qagr.io/v4/api/userinfo

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-47/48, lines 92001-94000]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 92001-94000.

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly.js [chunk-48/48, lines 94001-94238]

### Summary
Analyzed extension/src/js/Grammarly.js chunk lines 94001-94238.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.sendMessage

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-gDocs.js [chunk-1/53, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 1-2000.

### Endpoints
- https://assets.grammarly.com/emoji/v1/
- https://assets.grammarly.com/animations/v1/

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-2/53, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 2001-4000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-3/53, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 4001-6000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-4/53, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 6001-8000.

### Endpoints
- https://properties.
- https://treatment.
- https://gates.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-5/53, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 8001-10000.

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-6/53, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 10001-12000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-7/53, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 12001-14000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-8/53, lines 14001-16000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 14001-16000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-9/53, lines 16001-18000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 16001-18000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-10/53, lines 18001-20000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 18001-20000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-11/53, lines 20001-22000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 20001-22000.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime.getURL
- chrome.runtime.lastError
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener
- addEventListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onMessage.addListener

### Storage
- Key: "unknown", type: managed, op: get

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-12/53, lines 22001-24000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 22001-24000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-13/53, lines 24001-26000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 24001-26000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.getManifest
- chrome.runtime.id
- chrome.runtime.onMessage
- chrome.runtime.sendMessage
- chrome.storage

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-14/53, lines 26001-28000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 26001-28000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-15/53, lines 28001-30000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 28001-30000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-16/53, lines 30001-32000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 30001-32000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-17/53, lines 32001-34000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 32001-34000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-18/53, lines 34001-36000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 34001-36000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-19/53, lines 36001-38000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 36001-38000.

### Event Listeners
- addEventListener

### Endpoints
- https://www.grammarly.com/product/product-recommendation-table-comparison

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-20/53, lines 38001-40000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 38001-40000.

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-21/53, lines 40001-42000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 40001-42000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-22/53, lines 42001-44000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 42001-44000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-23/53, lines 44001-46000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 44001-46000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-24/53, lines 46001-48000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 46001-48000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-25/53, lines 48001-50000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 48001-50000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-26/53, lines 50001-52000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 50001-52000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-27/53, lines 52001-54000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 52001-54000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-28/53, lines 54001-56000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 54001-56000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-29/53, lines 56001-58000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 56001-58000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-30/53, lines 58001-60000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 58001-60000.

### Event Listeners
- addEventListener

### Endpoints
- https://support.google.com/chrome/answer/187443
- https://support.mozilla.org/en-US/kb/disable-or-remove-add-ons

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-31/53, lines 60001-62000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 60001-62000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-32/53, lines 62001-64000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 62001-64000.

### Chrome APIs
- chrome.runtime.getManifest
- chrome.runtime.id

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://assets.extension.grammarly.com/

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-gDocs.js [chunk-33/53, lines 64001-66000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 64001-66000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-gDocs.js [chunk-34/53, lines 66001-68000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 66001-68000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.lastError

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-35/53, lines 68001-70000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 68001-70000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-36/53, lines 70001-72000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 70001-72000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-37/53, lines 72001-74000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 72001-74000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-gDocs.js [chunk-38/53, lines 74001-76000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 74001-76000.

### Endpoints
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-39/53, lines 76001-78000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 76001-78000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-40/53, lines 78001-80000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 78001-80000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-41/53, lines 80001-82000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 80001-82000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-42/53, lines 82001-84000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 82001-84000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-43/53, lines 84001-86000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 84001-86000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- https://reactjs.org/docs/error-decoder.html?invariant=
- http://www.w3.org/1999/xlink
- http://www.w3.org/XML/1998/namespace
- http://www.w3.org/1999/xlink
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-44/53, lines 86001-88000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 86001-88000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-45/53, lines 88001-90000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 88001-90000.

### Endpoints
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-46/53, lines 90001-92000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 90001-92000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-47/53, lines 92001-94000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 92001-94000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-48/53, lines 94001-96000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 94001-96000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-49/53, lines 96001-98000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 96001-98000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-50/53, lines 98001-100000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 98001-100000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xlink
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocs.js [chunk-51/53, lines 100001-102000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 100001-102000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-52/53, lines 102001-104000]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 102001-104000.

### Event Listeners
- addEventListener

### Endpoints
- https://auth.grammarly.com/v4/api/oauth2/authorize
- https://auth.grammarly.com/v4/api/oauth2/exchange
- https://auth.grammarly.com/v4/api/oauth2/token
- https://auth.grammarly.com/v4/api/revoke-by-refresh-token
- https://auth.grammarly.com/v4/api/userinfo
- https://auth.ppgr.io/v4/api/oauth2/authorize
- https://auth.ppgr.io/v4/api/oauth2/exchange
- https://auth.ppgr.io/v4/api/oauth2/token
- https://auth.ppgr.io/v4/api/revoke-by-refresh-token
- https://auth.ppgr.io/v4/api/userinfo
- https://auth.qagr.io/v4/api/oauth2/authorize
- https://auth.qagr.io/v4/api/oauth2/exchange
- https://auth.qagr.io/v4/api/oauth2/token
- https://auth.qagr.io/v4/api/revoke-by-refresh-token
- https://auth.qagr.io/v4/api/userinfo

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-gDocs.js [chunk-53/53, lines 104001-105030]

### Summary
Analyzed extension/src/js/Grammarly-gDocs.js chunk lines 104001-105030.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.sendMessage

### Event Listeners
- addEventListener

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-gDocsEarlyInjector.js [whole-file, lines 1-138]

### Summary
Analyzed extension/src/js/Grammarly-gDocsEarlyInjector.js chunk lines 1-138.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.id

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocsIframeCs.js [chunk-1/5, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-gDocsIframeCs.js chunk lines 1-2000.

### Event Listeners
- .addListener

### Obfuscation Hints
webpack_modules, minified_vars, function_chains


## extension/src/js/Grammarly-gDocsIframeCs.js [chunk-2/5, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-gDocsIframeCs.js chunk lines 2001-4000.

### Chrome APIs
- chrome.runtime.getManifest
- chrome.runtime.id

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- https://assets.extension.grammarly.com/
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-gDocsIframeCs.js [chunk-3/5, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-gDocsIframeCs.js chunk lines 4001-6000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-gDocsIframeCs.js [chunk-4/5, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-gDocsIframeCs.js chunk lines 6001-8000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.lastError
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener

### Storage
- Key: "unknown", type: managed, op: get

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-gDocsIframeCs.js [chunk-5/5, lines 8001-8331]

### Summary
Analyzed extension/src/js/Grammarly-gDocsIframeCs.js chunk lines 8001-8331.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime.getURL
- chrome.runtime.id
- chrome.runtime.lastError
- chrome.runtime.onMessage
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.sendMessage
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage

### Event Listeners
- .addListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onMessage.addListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-overleafStartContentScript.js [whole-file, lines 1-18]

### Summary
Analyzed extension/src/js/Grammarly-overleafStartContentScript.js chunk lines 1-18.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.id

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-1/26, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 1-2000.

### Event Listeners
- addEventListener

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-popup.js [chunk-2/26, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 2001-4000.

### Endpoints
- https://properties.
- https://treatment.
- https://gates.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-3/26, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 4001-6000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-4/26, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 6001-8000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-5/26, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 8001-10000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-6/26, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 10001-12000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-7/26, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 12001-14000.

### Chrome APIs
- chrome.google.com

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-8/26, lines 14001-16000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 14001-16000.

### Chrome APIs
- chrome.runtime.getPlatformInfo
- chrome.runtime.getURL

### Endpoints
- https://gateway.grammarly.com/api/jira/tickets/create
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-9/26, lines 16001-18000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 16001-18000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.getManifest
- chrome.runtime.id
- chrome.runtime.lastError

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://assets.extension.grammarly.com/
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-popup.js [chunk-10/26, lines 18001-20000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 18001-20000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-11/26, lines 20001-22000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 20001-22000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-12/26, lines 22001-24000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 22001-24000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-popup.js [chunk-13/26, lines 24001-26000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 24001-26000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-14/26, lines 26001-28000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 26001-28000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-15/26, lines 28001-30000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 28001-30000.

### Event Listeners
- .addListener

### Endpoints
- https://reactjs.org/docs/error-decoder.html?invariant=
- http://www.w3.org/1999/xlink
- http://www.w3.org/XML/1998/namespace
- http://www.w3.org/1999/xlink
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-16/26, lines 30001-32000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 30001-32000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-17/26, lines 32001-34000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 32001-34000.

### Endpoints
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-18/26, lines 34001-36000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 34001-36000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-19/26, lines 36001-38000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 36001-38000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-20/26, lines 38001-40000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 38001-40000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-popup.js [chunk-21/26, lines 40001-42000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 40001-42000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-22/26, lines 42001-44000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 42001-44000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xlink
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-23/26, lines 44001-46000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 44001-46000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-24/26, lines 46001-48000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 46001-48000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-popup.js [chunk-25/26, lines 48001-50000]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 48001-50000.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.lastError
- chrome.runtime.sendMessage
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener
- addEventListener

### Storage
- Key: "unknown", type: managed, op: get

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)


## extension/src/js/Grammarly-popup.js [chunk-26/26, lines 50001-50282]

### Summary
Analyzed extension/src/js/Grammarly-popup.js chunk lines 50001-50282.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.notifications
- chrome.notifications.clear
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime.getURL
- chrome.runtime.id
- chrome.runtime.lastError
- chrome.runtime.onMessage
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.sendMessage
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage

### Event Listeners
- .addListener
- chrome.cookies.onChanged.addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onMessage.addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-1/88, lines 1-2000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 1-2000.

### Endpoints
- https://assets.grammarly.com/emoji/v1/
- https://assets.grammarly.com/animations/v1/

### Obfuscation Hints
webpack_modules, minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-2/88, lines 2001-4000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 2001-4000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-3/88, lines 4001-6000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 4001-6000.

### Endpoints
- https://assets.grammarly.com/icons/v1/ai-studio-icon.svg
- https://assets.grammarly.com/icons/v1/ai-studio-icon.svg
- https://assets.grammarly.com/cheetah/v1/actions/simplify.svg
- https://assets.grammarly.com/cheetah/v1/actions/improve.svg
- https://assets.grammarly.com/emoji/v1/1f1fa-1f1f8.svg
- https://assets.grammarly.com/emoji/v1/1f1e6-1f1fa.svg
- https://assets.grammarly.com/emoji/v1/1f1ec-1f1e7.svg
- https://assets.grammarly.com/emoji/v1/1f1e8-1f1e6.svg
- https://assets.grammarly.com/emoji/v1/1f1ee-1f1f3.svg
- https://assets.grammarly.com/icons/v1/ai-studio-icon.svg
- https://assets.grammarly.com/icons/v1/ai-studio-icon.svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-4/88, lines 6001-8000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 6001-8000.

### Endpoints
- https://assistant.femetrics.grammarly.io
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-sidePanel.js [chunk-5/88, lines 8001-10000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 8001-10000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-6/88, lines 10001-12000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 10001-12000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-7/88, lines 12001-14000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 12001-14000.

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-8/88, lines 14001-16000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 14001-16000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-9/88, lines 16001-18000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 16001-18000.

### Endpoints
- https://account.grammarly.com/admin/playbooks
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-10/88, lines 18001-20000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 18001-20000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-11/88, lines 20001-22000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 20001-22000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-12/88, lines 22001-24000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 22001-24000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- https://d201kpdrh73vuz.cloudfront.net/text-generation/voice-banner.png')
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-13/88, lines 24001-26000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 24001-26000.

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-14/88, lines 26001-28000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 26001-28000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-15/88, lines 28001-30000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 28001-30000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-16/88, lines 30001-32000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 30001-32000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-17/88, lines 32001-34000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 32001-34000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-18/88, lines 34001-36000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 34001-36000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-19/88, lines 36001-38000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 36001-38000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-20/88, lines 38001-40000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 38001-40000.

### Endpoints
- https://properties.
- https://treatment.
- https://gates.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-21/88, lines 40001-42000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 40001-42000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-22/88, lines 42001-44000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 42001-44000.

### Event Listeners
- .addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-23/88, lines 44001-46000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 44001-46000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-24/88, lines 46001-48000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 46001-48000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-25/88, lines 48001-50000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 48001-50000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-26/88, lines 50001-52000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 50001-52000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-27/88, lines 52001-54000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 52001-54000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-28/88, lines 54001-56000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 54001-56000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-29/88, lines 56001-58000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 56001-58000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-30/88, lines 58001-60000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 58001-60000.

### Chrome APIs
- chrome.action
- chrome.browserAction
- chrome.cookies.get
- chrome.cookies.getAll
- chrome.cookies.onChanged.addListener
- chrome.cookies.onChanged.removeListener
- chrome.cookies.remove
- chrome.cookies.set
- chrome.notifications
- chrome.notifications.clear
- chrome.runtime.getURL
- chrome.runtime.lastError
- chrome.storage
- chrome.storage.managed.get

### Event Listeners
- .addListener
- chrome.cookies.onChanged.addListener

### Storage
- Key: "unknown", type: managed, op: get

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-31/88, lines 60001-62000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 60001-62000.

### Chrome APIs
- chrome.action
- chrome.action.openPopup
- chrome.i18n.detectLanguage
- chrome.i18n.getAcceptLanguages
- chrome.i18n.getUILanguage
- chrome.identity
- chrome.management.uninstallSelf
- chrome.permissions
- chrome.permissions.contains
- chrome.permissions.getAll
- chrome.permissions.onAdded.addListener
- chrome.permissions.onAdded.removeListener
- chrome.permissions.onRemoved.addListener
- chrome.permissions.onRemoved.removeListener
- chrome.permissions.request
- chrome.runtime.getURL
- chrome.runtime.id
- chrome.runtime.lastError
- chrome.runtime.onMessage
- chrome.runtime.onMessage.addListener
- chrome.runtime.reload
- chrome.runtime.sendMessage
- chrome.runtime.setUninstallURL
- chrome.sidePanel
- chrome.sidePanel.open
- chrome.storage

### Event Listeners
- .addListener
- chrome.permissions.onAdded.addListener
- chrome.permissions.onRemoved.addListener
- chrome.runtime.onMessage.addListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-32/88, lines 62001-64000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 62001-64000.

### Chrome APIs
- chrome.runtime
- chrome.runtime.getManifest
- chrome.runtime.id
- chrome.runtime.lastError

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- https://127.0.0.1:8000
- https://f-log-extension.grammarly.io
- https://extension.femetrics.grammarly.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://femetrics.ppgr.io/batch/import
- https://femetrics.qagr.io/batch/import
- https://coda.io
- https://head.coda.io
- https://head.coda.io
- https://staging.coda.io
- https://coda.io
- https://api.iterable.com
- https://assets.extension.grammarly.com/
- https://addons.mozilla.org/en-US/firefox/addon/grammarly-1/privacy/
- https://config.extension.grammarly.com/dynamicConfig.json
- https://config.extension.grammarly.com/browserplugin/config.json
- https://rwsgfy.grammarly.com/stand-with-ukraine
- https://in-product.report.grammarly.io/v1/report
- https://superhuman.com/superhuman-go-intro
- https://superhuman.com/superhuman-go-intro?genesisLaunch=true
- https://accounts.google.com
- https://www.facebook.com/login
- https://appleid.apple.com/auth

### Obfuscation Hints
minified_vars

### Risks
- tracking: User behavior metrics and logging sent to Grammarly/Iterable endpoints (Severity: medium)


## extension/src/js/Grammarly-sidePanel.js [chunk-33/88, lines 64001-66000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 64001-66000.

### Chrome APIs
- chrome.cs.load.error
- chrome.toolbar.popup

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-34/88, lines 66001-68000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 66001-68000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-35/88, lines 68001-70000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 68001-70000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-36/88, lines 70001-72000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 70001-72000.

### Event Listeners
- addEventListener

### Endpoints
- https://coda.io
- https://staging.coda.io
- https://head.coda.io
- https://dev.coda.io:8080
- https://coda.grammarly.com
- https://coda.ppgr.io
- https://coda.qagr.io
- https://coda-local.ppgr.io:8080
- https://coda.io/favicon.ico

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-37/88, lines 72001-74000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 72001-74000.

### Event Listeners
- addEventListener

### Endpoints
- http://localhost

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-38/88, lines 74001-76000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 74001-76000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- https://support.grammarly.com/hc/en-us/articles/5806184637325-Error-Can-t-connect-to-Grammarly-or-Something-went-wrong
- https://help.coda.io/hc/en-us/articles/39555832714381-Security-of-Packs-on-Coda
- https://coda.io/form/Report-an-issue-with-an-agent_duLUVC5y4Td?agentID=

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-39/88, lines 76001-78000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 76001-78000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-40/88, lines 78001-80000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 78001-80000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-41/88, lines 80001-82000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 80001-82000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-42/88, lines 82001-84000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 82001-84000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-43/88, lines 84001-86000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 84001-86000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-44/88, lines 86001-88000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 86001-88000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-45/88, lines 88001-90000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 88001-90000.

### Event Listeners
- addEventListener

### Endpoints
- https://reactjs.org/docs/error-decoder.html?invariant=
- http://www.w3.org/1999/xlink
- http://www.w3.org/XML/1998/namespace
- http://www.w3.org/1999/xlink
- http://www.w3.org/2000/svg
- http://www.w3.org/1998/Math/MathML
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg
- http://www.w3.org/1999/xhtml
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-46/88, lines 90001-92000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 90001-92000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-47/88, lines 92001-94000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 92001-94000.

### Endpoints
- http://www.w3.org/1999/xhtml
- http://www.w3.org/1999/xhtml

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-48/88, lines 94001-96000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 94001-96000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-49/88, lines 96001-98000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 96001-98000.

### Event Listeners
- addEventListener

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-50/88, lines 98001-100000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 98001-100000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-51/88, lines 100001-102000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 100001-102000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-52/88, lines 102001-104000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 102001-104000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-53/88, lines 104001-106000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 104001-106000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-54/88, lines 106001-108000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 106001-108000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-55/88, lines 108001-110000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 108001-110000.

### Dynamic Code
- eval

### Obfuscation Hints
minified_vars

### Risks
- remote_code: Dynamic code execution via eval (Severity: high)


## extension/src/js/Grammarly-sidePanel.js [chunk-56/88, lines 110001-112000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 110001-112000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-57/88, lines 112001-114000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 112001-114000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-58/88, lines 114001-116000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 114001-116000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-59/88, lines 116001-118000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 116001-118000.

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-60/88, lines 118001-120000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 118001-120000.

### Endpoints
- https://example.com/metadata/googlecalendar
- https://www.example.com/tos
- https://www.example.com/privacy
- https://example.com/metadata/slack
- https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg
- https://example.com/icon.svg
- https://assets.grammarly.com/icons/v1/ai-studio-icon-lg.svg
- https://example.com/icon.svg
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico
- https://coda.io/favicon.ico

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-61/88, lines 120001-122000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 120001-122000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-62/88, lines 122001-124000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 122001-124000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-63/88, lines 124001-126000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 124001-126000.

### Event Listeners
- addEventListener

### Endpoints
- https://www.grammarly.com/security
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-64/88, lines 126001-128000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 126001-128000.

### Event Listeners
- .addListener

### Endpoints
- http://www.w3.org/2000/svg
- https://superhuman.com/superhuman-go-intro

### Obfuscation Hints
minified_vars, function_chains


## extension/src/js/Grammarly-sidePanel.js [chunk-65/88, lines 128001-130000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 128001-130000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-66/88, lines 130001-132000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 130001-132000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-67/88, lines 132001-134000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 132001-134000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-68/88, lines 134001-136000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 134001-136000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-69/88, lines 136001-138000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 136001-138000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-70/88, lines 138001-140000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 138001-140000.

### Event Listeners
- .addListener
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-71/88, lines 140001-142000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 140001-142000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-72/88, lines 142001-144000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 142001-144000.

### Event Listeners
- .addListener
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-73/88, lines 144001-146000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 144001-146000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-74/88, lines 146001-148000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 146001-148000.

### Event Listeners
- addEventListener

### Endpoints
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-75/88, lines 148001-150000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 148001-150000.

### Endpoints
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg
- http://www.w3.org/2000/svg

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-76/88, lines 150001-152000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 150001-152000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-77/88, lines 152001-154000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 152001-154000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-78/88, lines 154001-156000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 154001-156000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-79/88, lines 156001-158000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 156001-158000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-80/88, lines 158001-160000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 158001-160000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-81/88, lines 160001-162000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 160001-162000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-82/88, lines 162001-164000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 162001-164000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-83/88, lines 164001-166000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 164001-166000.

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-84/88, lines 166001-168000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 166001-168000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-85/88, lines 168001-170000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 168001-170000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-86/88, lines 170001-172000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 170001-172000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-87/88, lines 172001-174000]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 172001-174000.

### Event Listeners
- addEventListener

### Obfuscation Hints
minified_vars


## extension/src/js/Grammarly-sidePanel.js [chunk-88/88, lines 174001-175385]

### Summary
Analyzed extension/src/js/Grammarly-sidePanel.js chunk lines 174001-175385.

### Chrome APIs
- chrome.runtime.getURL
- chrome.runtime.sendMessage

### Event Listeners
- addEventListener

### Dynamic Code
- new Function

### Obfuscation Hints
webpack_modules, minified_vars

### Risks
- remote_code: Dynamic code execution via new Function (Severity: high)



## Components and Flows

### Background (Service Worker)
- **Files**: `sw.js` (which loads `extension/src/js/Grammarly-bg.js`)
- **APIs**: `chrome.storage.local`, `chrome.storage.managed`, `chrome.cookies`, `chrome.runtime`, `chrome.tabs`, `chrome.permissions`
- **Listeners**: `runtime.onMessage.addListener`, `runtime.onConnect.addListener`, `cookies.onChanged.addListener`
- **Evidence**: `extension/manifest.json:9-11`, `extension/src/js/Grammarly-bg.js`

### Content Scripts
- **Files**: `src/js/Grammarly-check.js`, `src/js/Grammarly.js`, `src/js/Grammarly-gDocs.js`, `src/js/Grammarly-gDocsEarlyInjector.js`, `src/js/Grammarly-gDocsIframeCs.js`, `src/js/Grammarly-overleafStartContentScript.js`
- **APIs**: `chrome.runtime`, `chrome.storage`
- **Listeners**: `runtime.onMessage.addListener`, DOM text input, focus, selection and input events.
- **Evidence**: `extension/manifest.json:12-296`

### User Interface (UI)
- **Files**: `src/popup.html`, `src/sidePanel.html` (which load `src/js/Grammarly-popup.js` and `src/js/Grammarly-sidePanel.js` respectively)
- **APIs**: `chrome.runtime`, `chrome.tabs`, `chrome.sidePanel`, `chrome.action`, `chrome.storage`
- **Evidence**: `extension/manifest.json:4-8`, `extension/manifest.json:306-308`

### Remote Services
- **Telemetry & Tracking**: `https://gnar.grammarly.com`, `https://data.grammarly.com`, `https://femetrics.grammarly.io`
- **Core Checking Service**: `https://capi.grammarly.com`, `wss://capi.grammarly.com` (WebSocket for real-time text analysis)
- **Authentication**: `https://auth.grammarly.com`
- **Configuration & Experimentation**: `https://config.extension.grammarly.com`, `https://gates.grammarly.com`, `https://treatment.grammarly.com`
- **Marketing & Notification**: `https://api.iterable.com`
- **Evidence**: `extension/manifest.json:297-299` (CSP directive)


## Core Workflows

### 1. Real-Time Text Checking & Suggestion Injection
- **Triggers**: User types or focuses on an editable text area on web pages (or Overleaf, Google Docs).
- **Steps**:
  1. Content script (e.g. `Grammarly-check.js`) intercepts the input events and extracts text.
  2. Sends the text context to the service worker via messaging (`"cheetah"` or internal rpc).
  3. Service worker connects to `wss://capi.grammarly.com` to analyze the text.
  4. Real-time checking service returns grammar and spellcheck suggestions.
  5. Service worker sends suggestion counts and inline card markup via `sendMessage("alertsCount", ...)` and `sendMessage("shortFormCard", ...)`.
  6. Content script receives messages and highlights errors with colored underlines and draws the Grammarly overlay suggestion card.
- **Evidence**: `extension/src/js/Grammarly-bg.js`, `extension/src/js/Grammarly-check.js`

### 2. User Authentication & Session Management
- **Triggers**: User clicks "Sign In" in popup, or extension performs background token verification.
- **Steps**:
  1. Popup UI captures username/credentials or starts OAuth2 implicit flow in popup.
  2. Sends `login-attempt` message to background service worker.
  3. Service worker queries `https://auth.grammarly.com` to validate the user session.
  4. Stores returned access tokens and authentication state in `chrome.storage.local` under keys `gr-oauth-service-state` and `authTokenInitialRefreshDone`.
  5. Synchronizes user-specific preferences, dictionaries, and subscription limits.
- **Evidence**: `extension/src/js/Grammarly-popup.js`, `extension/src/js/Grammarly-bg.js`

### 3. Usage Tracking, Telemetry, & Analytics
- **Triggers**: User interacts with suggestions (accepts or dismisses cards) or loads/closes document sessions.
- **Steps**:
  1. Content script captures event clicks and sends `actionNotification` back to service worker.
  2. Service worker updates local analytics cache `gnarInternalStorage`.
  3. Formulates tracking payloads containing user details, interaction counts, and anonymized context metrics.
  4. Pushes tracking data to Grammarly telemetry endpoints (`https://gnar.grammarly.com`, `https://data.grammarly.com`, `https://extension.femetrics.grammarly.io`).
- **Evidence**: `extension/src/js/Grammarly-bg.js`, `extension/src/js/Grammarly-sidePanel.js`

