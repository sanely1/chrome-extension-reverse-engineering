## Analysis of Specified JS Files

### extension/content.js [whole-file, lines 1-10950]
- **Chrome APIs**: chrome.runtime.sendMessage, chrome.runtime.getURL, chrome.storage, chrome.runtime.onMessage
- **Event Listeners**: message, DOMContentLoaded, mousemove, mouseup, mousedown, click
- **Messaging**: Uses InternalMessageTypes for communication between content scripts and background script.
- **Storage**: Uses session storage via message passing.
- **Network**: Uses fetch() for configuration.
- **Evidence**: extension/content.js:5177-10939

### extension/data-control.js [whole-file, lines 1-303]
- **Chrome APIs**: chrome.runtime.sendMessage, chrome.storage.local, chrome.storage.sync
- **Event Listeners**: click (on DOM buttons)
- **Messaging**: Uses InternalMessageTypes.
- **Storage**: Provides wrappers for local and sync storage, and session storage via messages.
- **Evidence**: extension/data-control.js:294-302

### extension/navigation-events.js [whole-file, lines 1-23]
- **Event Listeners**: popstate
- **Messaging**: Uses postMessage to propagate history events.
- **Evidence**: extension/navigation-events.js:12-22

### extension/popup.js [whole-file, lines 1-37]
- **DOM**: Localizes text content.
- **Evidence**: extension/popup.js:3-36

### extension/save.js [whole-file, lines 1-60]
- **Event Listeners**: message
- **Messaging**: Uses postMessage to parent window.
- **Evidence**: extension/save.js:18-59
