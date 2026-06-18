# Run 002 (Gemini 3 Flash Preview)

## Manifest

- Name: Grammarly: AI Writing Assistant and Grammar Checker App
- Version: 14.1259.0
- Manifest Version: 3
- Service Worker: sw.js
- Content Scripts: 
  - src/js/Grammarly-check.js (matches: <all_urls>)
  - src/js/Grammarly.js (matches: various domains)
  - src/js/Grammarly-gDocs.js (matches: docs.google.com)
  - src/js/Grammarly-gDocsEarlyInjector.js (matches: docs.google.com)
  - src/js/Grammarly-gDocsIframeCs.js (matches: docs.google.com)
  - src/js/Grammarly-overleafStartContentScript.js (matches: overleaf.com)
- Permissions: scripting, sidePanel, tabs, notifications, cookies, identity, storage
- Host Permissions: http://*/*, https://*/*

Evidence: manifest.json:1-450

## src/js/Grammarly-bg.js [chunk 1/46, lines 1-2000]

### Summary
Infrastructure and Webpack module definitions. Logic for RPC, state management, and alerts. Highly modularized code with private fields and complex state abstractions.

### Obfuscation hints
- webpack_modules (line 2)
- minified_vars (throughout)
- private_fields (e.g., lines 130-150)
- function_chains (e.g., line 1250)

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 2/46, lines 2001-4000]

### Summary
Alert management logic. Defines AlertRangeManager and subclasses for various Grammarly alert types. Handles parsing of extra_properties from CAPI.

### Obfuscation hints
- minified_vars (throughout)
- class_declarations (e.g., 
e, e, ie, oe)

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 3/46, lines 4001-6000]

### Summary
Experimentation and Feature Gates infrastructure. Defines classes for managing A/B tests and feature flags. Interacts with Grammarly's backend services for properties, treatments, and gates.

### Endpoints
- GET/POST https://properties.grammarly.com/properties (line 5834)
- POST https://treatment.grammarly.com/treatment/get (line 6250 - extrapolated from context)
- POST https://gates.grammarly.com/gates/get (line 5460 - extrapolated from context)

### Obfuscation hints
- minified_vars (throughout)
- class_declarations (e.g., ExperimentClient, GatesService)
- function_chains (common in the provided chunk)

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 4/46, lines 6001-8000]

### Summary
Logging and state management infrastructure. Includes UphookhubApi for managing upgrade hooks and paywalls. Handles treatment logging for A/B tests.

### Endpoints
- GET /configuration (line 7820)
- POST /events (line 7837)
- POST .../log (line 6023)

### Obfuscation hints
- minified_vars (throughout)
- class_declarations (e.g., UphookhubApi, L, V)
- function_chains

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 5/46, lines 8001-10000]

### Summary
Extensive definitions of upgrade hook enums for various UI contexts (sidebar, inline cards, settings, etc.). Defines VitoApi for managing user plans, subscriptions, and trials.

### Endpoints
- GET /plans (line 9673)
- POST /setup-trial (line 9691)
- GET /special-offers (line 9706)
- POST /subscribe (line 9726)

### Obfuscation hints
- minified_vars
- class_declarations (e.g., VitoApi, BaseAPI)
- function_chains

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 6/46, lines 10001-12000]

### Summary
Extensive data models for Grammarly suggestions, including Alert, Alternative, Range, and Delta logic. Handles the complexity of mapping suggestions to changing document text (rebasing). Defines various enums for suggestion types, outcomes, and user feedback.

### Obfuscation hints
- minified_vars
- class_declarations (e.g., BaseAPI, Iterator, u)
- function_chains

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 7/46, lines 12001-14000]

### Summary
Infrastructure for dynamic feature loading. Specific logic for EthicalAIFeature, which handles sensitive language suggestions (e.g., 'Stand with Ukraine'). Includes a custom HTML sanitizer to prevent XSS during card rendering. Tracks various user interactions with ethical AI suggestions using Grammarly's internal analytics (Gnar).

### Obfuscation hints
- minified_vars
- class_declarations (e.g., EthicalAIFeature, p, g)
- function_chains

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 8/46, lines 14001-16000]

### Summary
FP utility library. Contains core logic for Task, TaskEither, Either, Option, and IO. These are used throughout the background script to manage complex asynchronous flows and side effects safely.

### Obfuscation hints
- minified_vars
- function_chains (ubiquitous in FP code)

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 9/46, lines 16001-18000]

### Summary
Continuation of FP utilities. Includes Record, Eq, Show, and Schemable patterns (similar to io-ts). Used for validating and serializing data exchanged with the CAPI and other services.

### Obfuscation hints
- minified_vars
- function_chains

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 10/46, lines 18001-20000]

### Summary
Internal implementation of io-ts for runtime type safety. This chunk defines the core infrastructure for defining and validating schemas for API responses and internal state.

### Obfuscation hints
- minified_vars
- class_declarations (e.g., NullType, InterfaceType, RecursiveType)

### Evidence
- src/js/Grammarly-bg.js:1-2

## src/js/Grammarly-bg.js [chunk 11/46, lines 20001-22000]

### Summary
ONNX runtime utilities implemented in JavaScript. Includes a set of utilities for matrix multiplication, broadcasting, general matrix multiplication (Gemm), pooling, and convolution operations. This infrastructure is likely used to run Grammarly's local ML models (e.g., the .pt files found in the data/ directory).

### Obfuscation hints
- minified_vars
- class_declarations (e.g., MatMulUtil, ShapeUtil)

### Evidence
- src/js/Grammarly-bg.js:1-2
