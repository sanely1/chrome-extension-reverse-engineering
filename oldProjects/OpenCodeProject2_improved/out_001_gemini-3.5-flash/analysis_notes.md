# Analysis Notes

- **Run Number**: 001
- **Model**: gemini-3.5-flash
- **Extension ID**: kbfnbcaeplbcioakkpcpgfkobkghlhen
- **Date**: Sunday May 31 2026

## Introduction
Reverse engineering analysis of Chrome extension: Grammarly (ID: kbfnbcaeplbcioakkpcpgfkobkghlhen)

## Step 1: Inventory (Manifest Analysis)
- **Name**: Grammarly: AI Writing Assistant and Grammar Checker App
- **Short Name**: Superhuman Go (Beta)
- **Version**: 14.1259.0
- **Manifest Version**: 3
- **Description**: Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.
- **Background Service Worker**: `sw.js`
- **Permissions**: scripting, sidePanel, tabs, notifications, cookies, identity, storage
- **Host Permissions**: http://*/*, https://*/*

## Step 4: Components and Flows
- Background service worker manages auth sessions and coordinates telemetry.
- Content scripts capture document typing changes and render waveline highlights in page DOM.
- Assistant popup and sidepanel inject generative Cheetah rules.

## Step 5: Core Workflows
1. **Dynamic Config Load**: Fetches rules from config.extension.grammarly.com.
2. **Profile Authorization**: Synchronizes sessions and tokens via auth.grammarly.com.
3. **Grammar Correction Check**: Dispatches document changes to capi WebSocket.
4. **AI writing rewriter**: Computes rewrite refinements via gateway Cheetah proxies.
5. **Interactive Telemetry**: Logs analytics packets to f-log hosts.

## Step 6: Privacy, Security, Compliance
- **Data Categories**: user credentials, document textual contents, active tab URLs, telemetry click streams.
- **Minimization**: High logging telemetry, though checking flows remain proportionate.
- **Security Risks**:
  - *PII Exfiltration (High)*: Full typing inputs dispatched to capi spellchecker WS.
  - *Tracking (Medium)*: Extensive event logs with persistent machine IDs sent to metrics servers.
  - *Insecure Storage (Medium)*: Caches credential properties inside extensions Storage plaintext.
  - *Fingerprinting (Low)*: Tracks stable machine keys alongside device layouts.
