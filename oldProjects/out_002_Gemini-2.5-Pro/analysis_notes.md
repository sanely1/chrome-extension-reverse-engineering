# Run 006 (Gemini-2.5-Pro)

## Manifest

- Name: Grammarly: AI Writing Assistant and Grammar Checker App
- Version: 14.1259.0
- Manifest Version: 3
- Service Worker: sw.js
- Content Scripts: 
  - `src/js/Grammarly-check.styles.js`, `src/js/Grammarly-check.js` on `<all_urls>` with exclusions.
  - `src/js/Grammarly.styles.js`, `src/js/Grammarly.js` on many specific sites.
  - `src/js/Grammarly-gDocs.styles.js`, `src/js/Grammarly-gDocs.js` on Google Docs.
  - and more for gdocs and overleaf.
- Permissions: scripting, sidePanel, tabs, notifications, cookies, identity, storage
- Host Permissions: http://*/*, https://*/*
- Optional Permissions: nativeMessaging, clipboardRead

Evidence: manifest.json:1-455

## src/js/Grammarly-bg.js [chunk 1/46, lines 1-2000]

### Summary
This chunk contains the Webpack bootstrap code and sets up an internal RPC-like messaging framework. It defines abstractions for events (`I` class), state management (`q` class, `H` function), and services (`Se` class, `Ne` function) that are used for communication between different parts of the extension. It also references several AI-related features through feature flags and module definitions, such as "Expert Panel," "Humanizer," and "Paraphraser."

### Chrome APIs
- None observed in this chunk.

### Event Listeners
- None observed in this chunk.

### Messaging
- **Internal RPC/messaging framework**: The code defines a low-level message passing system using `port.send` and `port.subscribe`. This is the foundation for higher-level communication. (Evidence: lines 100-500)

### Storage
- None observed in this chunk.

### Endpoints
- None observed in this chunk.

### Dynamic Code/Obfuscation
- **`webpack_modules`**: The file starts with a standard Webpack module loader pattern.

### Risks
- None observed in this chunk.

### Evidence
- src/js/Grammarly-bg.js:1-2000

## src/js/Grammarly-bg.js [chunk 2/46, lines 2001-4000]

### Summary
This chunk focuses on the data models and business logic for managing alerts within the extension. It defines a hierarchy of alert classes (`ne`, `re`, `ie`, `oe`, etc.) that represent different types of writing suggestions and issues, such as correctness, plagiarism, tone, and more. Key functionalities include:

- **Alert Range Management**: The `L` class manages the positions of alert highlights in the text.
- **Alert Alternative Management**: The `U` class handles different replacement options for an alert.
- **Alert State Machine**: The code defines various states for an alert (`Registered`, `Applied`, `Removed`) and the transitions between them.
- **Alert Types**: It explicitly defines various alert types like `Default`, `Plagiarism`, `Super`, `Takeaway`, `ShortenIt`, `ToneAI`, and `EthicalAI`.

### Chrome APIs
- None observed in this chunk.

### Event Listeners
- None observed in this chunk.

### Messaging
- The logic in this chunk is built on top of the internal messaging framework defined in the previous chunk, but no new message listeners are defined here.

### Storage
- None observed in this chunk.

### Endpoints
- None observed in this chunk.

### Dynamic Code/Obfuscation
- None observed in this chunk.

### Risks
- None observed in this chunk.

### Evidence
- src/js/Grammarly-bg.js:2001-4000

## src/js/Grammarly-bg.js [chunk 3/46, lines 4001-6000]

### Summary
This chunk continues the definition of the extension's data models and introduces a client for A/B testing and feature gating. It details the various types of "Alerts" (writing suggestions), the UI events associated with them, and the structure of the document context (domain, goals, audience, etc.). A significant finding is the presence of an `ExperimentClient` that communicates with external endpoints to fetch treatments and gates, indicating a dynamic, server-driven configuration for features and user experiences.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- `https://properties.qagr.io`: Used to get/set properties for experimentation.
- `https://treatment.qagr.io`: Used to retrieve A/B testing treatments.
- `https://gates.qagr.io`: Used to retrieve feature gates.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Minified variable names**: `e`, `t`, `n`, `r` are used extensively.
- **Function chains**: Complex logic is built by chaining higher-order functions.
- **API Client Patterns**: A clear pattern for an API client (`ExperimentClient`, `HttpClient`) is visible, abstracting `fetch` calls.

### Risks
- **Dynamic Configuration**: The extension's behavior can be altered remotely via the A/B testing and feature gating service. This could be used to enable new features, but also potentially malicious ones, without updating the extension itself. The use of `qagr.io` suggests a QA or pre-production environment.

### Evidence
- `src/js/Grammarly-bg.js` (beautified): lines 4873 (config for `qagr.io`), 5457 (`GatesService` class).

## src/js/Grammarly-bg.js [chunk 4/46, lines 6001-8000]

### Summary
This chunk reveals more of the extension's core infrastructure. It contains the remainder of the `TreatmentService` used for A/B testing, which includes logic for logging treatment exposures and handling throttled or cached logs. More significantly, it introduces a custom-built reactive state management library, conceptually similar to RxJS or MobX. This library uses classes like `Atom` (for holding state), `Lens` (for focusing on parts of the state), and `View` (for observing state changes). This indicates a sophisticated, in-house solution for managing the application's complex state. Finally, the chunk includes a large, auto-generated API client for a service named "Uphookhub," which appears to manage the configuration and event tracking for dynamic UI components called "uphooks."

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- The `TreatmentService` has logic for persisting sent logs to avoid re-logging, implying some form of storage is used, though the specific mechanism (`chrome.storage` or `localStorage`) is abstracted here.

### Endpoints
- The `UphookhubApi` client points to a `/configuration` endpoint for GET requests and an `/events` endpoint for POST requests, relative to a base URL not defined in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code is clearly part of a Webpack bundle.
- **API Client Generation**: The `UphookhubApi` client is highly structured and repetitive, strongly suggesting it was auto-generated from an OpenAPI/Swagger specification. It contains a large number of enums for different "uphook" names, slots, and variants.
- **Minified variable names**: `e`, `t`, `n`, `r` are used throughout.

### Risks
- **Complex State Management**: The custom reactive library, while powerful, could be a source of bugs if not implemented perfectly. Its complexity might also obscure data flow.
- **Dynamic UI Configuration**: The `UphookhubApi` further confirms that significant parts of the UI are configured remotely, reinforcing the risk of dynamic, un-reviewed changes to the extension's behavior and appearance.

### Evidence
- `src/js/Grammarly-bg.js` (beautified): lines 6001-8000. Key classes include `TreatmentService`, `Atom` (as `d`), `Lens` (as `h`), `View` (as `p`), and `UphookhubApi`.

## src/js/Grammarly-bg.js [chunk 5/46, lines 8001-10000]

### Summary
This chunk is almost entirely composed of auto-generated API client code. It continues the definition of the `UphookhubApi` client from the previous chunk and introduces another client, `VitoApi`. The code reveals a sophisticated, service-driven architecture for UI configuration and monetization.

### Obfuscation Hints
- **TypeScript Generated Enums**: A vast number of enums are defined, likely compiled from TypeScript. These enums (`ConfigurationGet2XXResponse...`, `EventsPostRequestUphook...`) represent all possible variations of UI elements ("uphooks") that can be delivered from the backend, including different names, UI slots, and A/B test variants. This is a strong indicator of a highly dynamic, server-driven UI.
- **API Client Patterns**: The code contains a standard, generated `BaseAPI` class (line 9219) that handles request/response logic, middleware, error handling, and configuration. This is a common pattern for clients generated from OpenAPI/Swagger specifications.
- **API Middleware**: The `BaseAPI` includes a middleware pipeline (`pre`, `post`, `onError`), allowing for interception and modification of API requests and responses. This is used for tasks like authentication, logging, and error reporting.

### Endpoints
While no literal URLs are present in this chunk, the code defines two distinct API clients, implying at least two backend services:
- **`UphookHubClient`**: Defined around line 9633, this client is responsible for fetching UI configurations (`getConfiguration`) and tracking user interaction events (`track`). This is the client for the dynamic UI/uphook system.
- **`VitoApi`**: Defined around line 9818, this client handles monetization-related actions, including fetching plans (`plansGet`), managing special offers (`specialOffersGet`), setting up trials (`setupTrialPost`), and handling subscriptions (`subscribePost`).

### Risks
- **Dynamic UI Configuration**: The heavy reliance on remote configuration for UI elements (`uphooks`) means that the extension's behavior and appearance can be changed at any time without updating the extension itself. While powerful, this could be a vector for malicious changes if the backend is compromised.

### Evidence
- `src/js/Grammarly-bg.beautified.js:8001-9200`: Extensive enum definitions for the Uphookhub API.
- `src/js/Grammarly-bg.beautified.js:9219-9600`: `BaseAPI` implementation for the generated clients.
- `src/js/Grammarly-bg.beautified.js:9633-9700`: `UphookHubClient` implementation.
- `src/js/Grammarly-bg.beautified.js:9818-10000`: `VitoApi` implementation.

## src/js/Grammarly-bg.js [chunk 6/46, lines 10001-12000]

### Summary
This chunk continues the pattern of containing a large amount of generated code, but this time it's focused on the core data models of the application, specifically the 'Alert' object. An 'Alert' represents a single writing suggestion shown to the user. The code defines the structure of alerts, their properties, and the logic for managing them.

### Obfuscation Hints
- **API Client Patterns**: The code repeats the `BaseAPI` implementation seen in the previous chunk. This is likely due to the bundler including the same utility code in multiple modules.
- **TypeScript Generated Enums**: This chunk is rich with enums and complex type definitions that are characteristic of code compiled from TypeScript. It defines various states, types, and categories for alerts (e.g., `Alert.Impact`, `Alert.View`, `Alert.Inline`, `Session.Mode`, `ScoresStatus`).

### Data Models & Logic
- **Core Alert Structure (`w` or `Alert` module, line ~11100)**: This is the central finding. The code defines the complete data structure for an alert, including:
  - `id`, `rev` (revision), `pname` (programmatic name), `group`, `category`, `title`, `cost`, `impact`.
  - `transformJson`: A detailed object describing how to apply the suggestion, including `highlights` and `alternatives` (the different replacement options). This uses the `AbsAlternative` and `Edit` structures.
  - `extra_properties`: A catch-all for various metadata, including `priority`, `full_sentence_rewrite`, `tone_slider`, `ethical_ai`, etc.
  - `cardLayout`: Defines how the alert is bundled and ranked in the UI (e.g., "Fix spelling and grammar").
- **Alert Type Discrimination**: The code includes functions to differentiate between various types of alerts, such as `isCapiAlert`, `isAutocorrectAlert`, `isPlagiarism`, `isToneAI`, `isFullSentenceRewrite`, etc. This allows the system to handle and render each suggestion type appropriately.
- **Alert Ordering and Conflict Resolution (`Alert.ordering`)**: A critical piece of logic is defined for managing alerts. This includes functions for:
  - `greaterThanOrEqual`: To sort and prioritize alerts.
  - `areConflicting`: To identify when two alerts apply to the same text range and cannot be shown simultaneously.
  - `areSame`: To check if two alerts are identical.
- **Session and Status Enums**: The code defines enums for the session state (`Session.Mode`), score status (`ScoresStatus`), and various user feedback actions (`AlertAction`, `BulkAction`, `LensAction`), providing a clear structure for tracking the application's state and user interactions.

### Risks
- No new risks identified in this chunk, but the complexity of the alert data model reinforces the idea that the extension's core logic is highly sophisticated and data-driven.

### Evidence
- `src/js/Grammarly-bg.beautified.js:10001-11000`: Duplicated `BaseAPI` implementation.
- `src/js/Grammarly-bg.beautified.js:11100-11900`: Extensive definitions for the `Alert` data model, including its various properties, types, and helper functions.
- `src/js/Grammarly-bg.beautified.js:11900-12000`: Definitions for session state, scores, and survey types.

## src/js/Grammarly-bg.js [chunk 7/46, lines 12001-14000]

### Summary
This chunk introduces a dynamic feature loading system that initializes modules on-demand when specific alerts are detected. It contains the implementation for the "Ethical AI" feature, which includes analytics logging and special handling for a "Stand With Ukraine" alert. The chunk also bundles significant third-party libraries: a text-diffing utility (similar to `diff-match-patch`) and a full version of `DOMPurify` for HTML sanitization, indicating a strong focus on security. A large number of functional programming helpers for `Array`, `Either`, and asynchronous operations are also present.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **DOMPurify**: The chunk includes a full, inlined version of the DOMPurify library (module `72314`), a robust XSS sanitizer for HTML. This is a significant defensive security measure.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:13088-13998

### Dynamic Code/Obfuscation
- **Dynamic Feature Loading**: A system (`p` and `g` classes in module `30582`) is used to dynamically import and instantiate features when certain alerts are observed. This avoids loading all features at startup.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:12007-12058
- **Generated APIs**: The structure of the code, with modules referenced by number, continues to suggest a bundler like Webpack.

### Risks
- **Other (Low)**: The presence of DOMPurify is a positive security indicator, used to mitigate XSS risks. The risk is "low" because it's a defensive measure, not an active threat.

### Interesting Patterns
- **Ethical AI Feature**: Module `53419` (`EthicalAIFeature`) is dedicated to handling alerts related to "ethical AI". It triggers analytics events for various user interactions with these alerts.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:12090-12183
- **Stand With Ukraine Alert**: The `EthicalAIFeature` has specific logic for an alert with the pattern name `Style/Sensitivity/SupportUkraine/WarLanguage`. It marks the card as seen to prevent repeated showings during a session.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:12130-12135, `src/js/Grammarly-bg.beautified.js`:12198-12200
- **Text Diffing Utilities**: Module `948` provides functions for creating and applying text diffs (`ins`, `del`), similar to the `diff-match-patch` library. This is likely used for calculating changes for replacements.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:12221-12277
- **Functional Utilities**: Module `78767` and others contain a rich set of functional programming helpers (`memoize`, `debounce`, `throttle`, `Either`, `Option`, etc.), indicating a functional style is preferred in the codebase.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:12279-12516

### Evidence
- `src/js/Grammarly-bg.beautified.js`:12001-14000

## src/js/Grammarly-bg.js [chunk 8/46, lines 14001-16000]

### Summary
This chunk is a dense collection of functional programming utilities, likely from a library similar to `fp-ts`. It provides the core building blocks for a functional approach to programming within the extension. The code defines interfaces and implementations for common algebraic data types (`Option`, `Either`, `IO`, `Reader`) and typeclasses (`Eq`, `Ord`, `Monoid`, `Functor`, `Applicative`, `Monad`). This indicates that the application's logic is built on a foundation of functional principles, emphasizing immutability, composition, and explicit handling of side effects and optional values.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Generated APIs**: The modular structure points to a build tool like Webpack. The code itself is highly abstract and generic, typical of a utility library.

### Risks
- None in this chunk.

### Interesting Patterns
- **Functional Core**: The presence of this large utility belt for functional programming is a strong architectural signal. It suggests that the developers are using functional patterns to manage complexity, handle asynchronous operations, and process data in a predictable way.
- **`Either` and `Option`**: Extensive utilities for `Either` (for error handling) and `Option` (for nullable values) show a commitment to avoiding `null` or `undefined` errors and handling potential failures explicitly.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:14001-14100, `src/js/Grammarly-bg.beautified.js`:14850-15200
- **`IO` and `IOEither`**: The inclusion of `IO` and `IOEither` (modules `95922`, `51505`) suggests that side-effects (like reading from storage or making network requests) are wrapped in these types to keep the core logic pure and testable.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:14450-14600
- **`Eq` and `Ord`**: Utilities for creating `Eq` (equality checking) and `Ord` (ordering) instances (`21147`, `14944`) are used for comparing complex data structures safely.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:14200-14300, `src/js/Grammarly-bg.beautified.js`:15200-15350
- **Array and Record Utilities**: A rich set of functions for manipulating arrays and records (objects) in an immutable way is provided, including `map`, `filter`, `reduce`, `partition`, and `traverse`.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:15350-16000

### Evidence
- `src/js/Grammarly-bg.beautified.js`:14001-16000

## src/js/Grammarly-bg.js [chunk 9/46, lines 16001-18000]

### Summary
This chunk is almost entirely a bundled version of the `io-ts` library, a powerful tool for runtime type validation, decoding, and encoding in TypeScript/JavaScript. Its presence is a major architectural indicator, showing that the application relies on a rigorous, type-safe, and functional approach to handle data, especially data coming from external sources like APIs. The library provides codecs for primitive types (`string`, `number`, `boolean`), complex types (`array`, `record`, `struct`, `partial`), and combinators (`union`, `intersection`, `refine`). It also includes functional data structures like `Task`, `TaskEither`, and `These` for handling asynchronous operations and validation results.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Generated APIs**: The code is a bundled library, consistent with the Webpack module system seen in previous chunks.

### Risks
- None in this chunk. The use of `io-ts` is a strong defensive measure against data-related vulnerabilities.

### Interesting Patterns
- **`io-ts` Library**: The core of this chunk is the `io-ts` library (modules `11633`, `6824`, `63332`, etc.). This library allows developers to define runtime types (codecs) that can be used to:
    1.  **Validate** incoming data (e.g., from an API response).
    2.  **Decode** it from a raw format (like JSON) into a rich, typed object.
    3.  **Encode** it back into a raw format.
  - Evidence: `src/js/Grammarly-bg.beautified.js`:17000-18000
- **Type-Safe Data Handling**: By using `io-ts`, the application ensures that any data it consumes matches an expected schema at runtime. This prevents a wide class of bugs and potential security issues that arise from malformed or unexpected data.
- **Functional Data Structures**: The chunk includes definitions and utilities for:
    - **`Task` and `TaskEither`** (module `67177`, `20232`): For managing asynchronous operations in a functional, composable way. `TaskEither` is particularly useful for async operations that can fail, combining the asynchronicity of a `Promise` with the error-handling of an `Either`.
      - Evidence: `src/js/Grammarly-bg.beautified.js`:16600-17000
    - **`These`** (module `97225`): A data structure that can represent `Left`, `Right`, or `Both`, often used for validation that can accumulate multiple errors.
      - Evidence: `src/js/Grammarly-bg.beautified.js`:17000-17150
- **Codecs for Primitives and Combinators**: The library defines codecs for all standard types (`string`, `number`, `array`, `record`) and functions to combine them (`union`, `intersection`, `type` for structs, `partial` for optional properties).
  - Evidence: `src/js/Grammarly-bg.beautified.js`:17200-17800

### Evidence
- `src/js/Grammarly-bg.beautified.js`:16001-18000
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js [chunk 10/46, lines 18001-20000]

### Summary
This chunk continues the bundled 'io-ts' library for runtime type validation and introduces the 'monocle-ts' library for immutable data manipulation using optics (Lenses, Prisms). A Levenshtein distance function is also present, likely for text diffing or suggestions. This reinforces the functional programming architecture.

### Dynamic Code/Obfuscation
- **io-ts library functions**: Continuation of the `io-ts` library.
- **monocle-ts library functions**: Introduction of the `monocle-ts` library for optics.
- **Levenshtein distance function**: A function for calculating the Levenshtein distance between two strings.
- **Minified variable names detected**
- **Function chaining detected**

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js:18001-20000
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js [chunk 11/46, lines 20001-22000]

### Summary
This chunk contains a bundled library for parsing and handling ONNX (Open Neural Network Exchange) models. It includes full protobuf definitions for the ONNX format (ModelProto, GraphProto, TensorProto). It also contains a 'WasmBinding' and GLSL utilities, strongly suggesting the extension runs ML models in the browser using WebAssembly or WebGL for high-performance inference. This is a major architectural finding.

### Dynamic Code/Obfuscation
- **ONNX model parsing library**: A complete, bundled library for handling ONNX models.
- **WasmBinding for WebAssembly**: Code for interacting with WebAssembly modules.
- **GLSL shader utilities**: Functions for generating and managing GLSL shaders.
- **Minified variable names detected**
- **Protobuf definitions**: Contains protocol buffer definitions for the ONNX format.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js:20001-22000
## Grammarly-bg.js [chunk 12/46, lines 22001-24000]

### Summary
This chunk provides further evidence of a comprehensive ONNX runtime. It includes more protobuf definitions for the ONNX format, the implementation of the `WebGLReshape` operator for the WebGL backend, and a very large mapping of ONNX operators to their CPU implementations. This demonstrates a multi-backend (CPU, WebGL) inference engine. The chunk also bundles `Buffer` and `long.js` for handling binary data and 64-bit integers.

### Findings
- **ONNX Runtime**:
  - **Protobuf Definitions**: `TypeProto`, `OperatorSetIdProto`. These are used to define data types and operator sets within an ONNX model.
  - **WebGL Backend**: Contains the implementation for `WebGLReshape`, confirming the use of WebGL for tensor operations.
  - **Operator Resolver**: A `resolveOperator` function is present to map ONNX operators to their corresponding backend implementations (CPU or WebGL).
  - **CPU Operators**: A large `CPU_OP_RESOLVE_RULES` array maps dozens of ONNX operators to their CPU implementations. This includes:
    - `CpuArgMax`, `CpuBatchNormalization`, `CpuBinaryOp` (for Add, Div, Mul, etc.), `CpuConcat`, `CpuConv`, `CpuDropout`, `CpuFlatten`, `CpuGather`, `CpuGemm`, `CpuGlobalAveragePool`, `CpuGlobalMaxPool`, `CpuImageScaler`, `CpuInstanceNormalization`, `CpuLrn`, `CpuMatMul`, `CpuPad`, `CpuReduce*` (various reductions), `CpuRelu`, `CpuReshape`, `CpuSlice`, `CpuSoftmax`, `CpuSqueeze`, `CpuSum`, `CpuTile`, `CpuTranspose`, `CpuUnaryOp` (for Abs, Acos, etc.), `CpuUnsqueeze`, `CpuUpsample`.
- **Bundled Dependencies**:
  - `Buffer`: A polyfill for Node.js's `Buffer` class, essential for binary data manipulation.
  - `long.js`: A library for representing and manipulating 64-bit integers.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as Webpack modules.
  - `minified_vars`: Variable names are minified (e.g., `e`, `t`, `n`).

### Risks
- No specific risks identified in this chunk, as it primarily contains the implementation of a machine learning runtime and its components. The potential risks would depend on the specific models being executed by this runtime and the data they process.

### Evidence
- File: `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js`
- Lines: 22001-24000
## Grammarly-bg.js [chunk 13/46, lines 24001-26000]

### Summary
This chunk contains the core serialization and deserialization logic for the Protocol Buffers format, which is the backbone of ONNX. It includes the `Writer`, `Reader`, `BufferWriter`, and `BufferReader` classes from a bundled `protobuf.js` library. Additionally, it bundles `platform.js` for environment detection and a polyfill for Node.js's `path` module. The list of CPU operator implementations for the ONNX runtime continues to expand, further detailing the capabilities of the in-browser inference engine.

### Findings
- **Protobuf Runtime**:
  - **Writer/Reader**: Contains the full implementation for `protobuf.Writer` and `protobuf.Reader`, including `BufferWriter` and `BufferReader`. This is critical for parsing the `.onnx` model files.
  - **Data Handling**: Includes logic for encoding and decoding various data types (varints, fixed32/64, strings, bytes, floats, doubles).
- **Bundled Dependencies**:
  - **platform.js**: A library for detecting the user's operating system, browser, and layout engine.
  - **path (polyfill)**: A polyfill for the Node.js `path` module to handle file paths in a cross-platform way.
- **ONNX CPU Operators**:
  - The list of CPU operator implementations continues from the previous chunk, including: `CpuConcat`, `CpuConv`, `CpuDropout`, `CpuFlatten`, `CpuGather`, `CpuImageScaler`, `CpuPad`, `CpuReduceBase`, `CpuReshape`, `CpuSlice`, `CpuSqueeze`, `CpuTile`, `CpuTranspose`, `CpuUnaryOp`, `CpuUnsqueeze`, and `CpuUpsample`.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as Webpack modules.
  - `minified_vars`: Variable names are minified.

### Risks
- No new risks identified in this chunk. The code is focused on data serialization/deserialization and operator implementation.

### Evidence
- File: `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js`
- Lines: 24001-26000
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js [chunk 14/46, lines 26001-28000]

### Summary
This chunk is highly significant as it contains the complete JavaScript glue code for the WebAssembly (Wasm) backend of the ONNX runtime. It includes the `WasmBackend` and `WasmBinding` classes, which manage the lifecycle and low-level interaction with a compiled Wasm module named `onnx-wasm.wasm`. This confirms the extension's ability to perform high-performance ML inference using a compiled C/C++ runtime. The chunk also continues the extensive list of CPU operator implementations, covering a wide range of common neural network operations.

### Dynamic Code/Obfuscation
- **Wasm Instantiation**: The code dynamically fetches and instantiates the `onnx-wasm.wasm` binary using `WebAssembly.instantiateStreaming` and `WebAssembly.instantiate`.
- **Webpack/Emscripten Glue**: The code is a combination of Webpack modules and the boilerplate JavaScript generated by the Emscripten toolchain to interface with the Wasm binary.

### WebAssembly
- **`onnx-wasm.wasm`**: The name of the WebAssembly binary file is explicitly mentioned. This file contains the compiled ONNX runtime.
- **`WasmBackend`**: A high-level class to initialize and manage the Wasm backend.
- **`WasmBinding`**: A low-level class for calling exported C functions from the Wasm module (`ccall`, `ccallRaw`), handling memory allocation (`_malloc`, `_free`), and marshalling data between the JavaScript and Wasm heaps.
- **Emscripten Runtime**: The presence of functions like `emscripten_get_sbrk_ptr`, `emscripten_memcpy_big`, and `emscripten_resize_heap` confirms the use of Emscripten to compile the C/C++ source to Wasm.

### ONNX CPU Operators
This chunk adds a large number of CPU operator implementations to the `CPU_OP_RESOLVE_RULES` list:
- `CpuConv` (continuation)
- `CpuDropout`
- `CpuFlatten`
- `CpuGather`
- `CpuGemm` (General Matrix Multiply)
- `CpuImageScaler`
- `CpuInstanceNormalization`
- `CpuLrn` (Local Response Normalization)
- `CpuPad`
- `CpuAveragePool`, `CpuGlobalAveragePool`, `CpuMaxPool`, `CpuGlobalMaxPool`
- `CpuReduceSum`, `CpuReduceSumSquare`, `CpuReduceLogSum`, `CpuReduceMax`, `CpuReduceMin`, `CpuReduceMean`, `CpuReduceProd`
- `CpuReshape`
- `CpuSlice` / `CpuSliceV10`
- `CpuSoftmax`
- `CpuSqueeze`
- `CpuSum`
- `CpuTile`
- `CpuTranspose`
- `CpuUnsqueeze`
- `CpuUpsample`

### Risks
- No new risks identified in this chunk. The use of Wasm is for performance and is not inherently a risk, although the complexity can hide functionality.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:27880-27882 (Wasm file name)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:27585-27680 (WasmBackend class)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:27692-27878 (WasmBinding class and init logic)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:26001-27583 (Various CPU Operator implementations)
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.js [chunk 15/46, lines 28001-30000]

### Summary
This chunk provides the final pieces of the Wasm integration and then introduces the complete implementation for the WebGL backend, the third major ML inference engine in this extension. It begins by explicitly listing the functions exported from the `onnx-wasm.wasm` module, such as `_conv_f32`, `_gemm_f32`, and `_matmul_f32`. The remainder of the chunk is dedicated to the WebGL backend, defining the core classes (`WebGLBackend`, `WebGLSessionHandler`, `WebGLInferenceHandler`) and the operator-to-shader mapping (`WEBGL_OP_RESOLVE_RULES`). This confirms the extension's sophisticated, tri-backend (CPU, Wasm, WebGL) architecture for running ML models.

### WebAssembly
- **Exported Functions**: The Emscripten glue code explicitly maps JavaScript functions to the C functions exported from the Wasm binary. This provides a clear list of the Wasm module's capabilities, including:
  - `_batch_normalization_f32`, `_instance_normalization_f32`
  - `_add_f32`, `_sub_f32`, `_mul_f32`, `_div_f32`
  - `_conv_f32`, `_gemm_f32`, `_matmul_f32`
  - `_average_pool_f32`, `_max_pool_f32`
  - `_softmax_f32`, `_sum_f32`
  - Memory management: `_free`, `_malloc`

### WebGL Backend
- **`WebGLBackend`**: The top-level class responsible for creating and managing a WebGL context.
- **`WebGLSessionHandler`**: Manages a model inference session using the WebGL backend. It owns:
  - `ProgramManager`: Compiles and caches GLSL shader programs.
  - `TextureManager`: Allocates, manages, and caches WebGL textures, which are used to store tensor data on the GPU.
  - `TextureDataCache`: Caches tensor data that has been uploaded to the GPU.
- **`WebGLInferenceHandler`**: Orchestrates the execution of a model's graph. For each operator, it builds and runs the corresponding shader program, managing the flow of data through textures.
- **`WEBGL_OP_RESOLVE_RULES`**: A large array that maps ONNX operator names to their WebGL implementations. This is the core of the WebGL backend, defining which operations can be run on the GPU.
- **GLSL Shaders**: The operator implementations (e.g., `WebGLUnaryOp`, `WebGLBinaryOp`, `WebGLConv`) contain embedded GLSL (OpenGL Shading Language) code snippets that are compiled at runtime to perform the actual computations on the GPU.

### ONNX WebGL Operators
This chunk defines the WebGL implementations for a vast array of operators, including:
- **Unary Ops**: `Abs`, `Acos`, `Asin`, `Atan`, `Ceil`, `Cos`, `Exp`, `Floor`, `Log`, `Neg`, `Not`, `Relu`, `Sigmoid`, `Sin`, `Sqrt`, `Tan`, `Tanh`.
- **Binary Ops**: `Add`, `And`, `Div`, `Equal`, `Greater`, `Less`, `Mul`, `Or`, `Pow`, `PRelu`, `Sub`, `Xor`.
- **Core ML Ops**: `BatchNormalization`, `Clip`, `Concat`, `Conv`, `Dropout`, `Flatten`, `Gather`, `Gemm`, `GlobalAveragePool`, `GlobalMaxPool`, `InstanceNormalization`, `MatMul`, `MaxPool`, `Pad`, `Reshape`, `Slice`, `Softmax`, `Split`, `Squeeze`, `Sum`, `Tile`, `Transpose`, `Upsample`.

### Risks
- No new risks identified. The complexity of the WebGL backend further obscures the extension's functionality, but the implementation appears to be a standard, albeit highly advanced, ML inference engine.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28004-28080 (Wasm exported function mappings)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28189-28203 (WebGLBackend class)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28205-28260 (WebGLSessionHandler class)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28262-28398 (WebGLInferenceHandler class)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28409-28633 (WEBGL_OP_RESOLVE_RULES array)
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js:28670-29035 (WebGLBinaryOp and GLSL shader snippets)

## src/js/Grammarly-bg.js [chunk 16/46, lines 30001-32000]

### Summary
This chunk provides an exhaustive look into the WebGL backend for the ONNX runtime, containing the specific implementations for a vast array of ONNX operators. Each operator class is responsible for generating custom GLSL (OpenGL Shading Language) fragment shaders to execute its corresponding mathematical operation on the GPU. This demonstrates a highly sophisticated, dynamic shader generation system. The code also reveals the presence of a `ProgramManager` and a `GlslPreprocessor`, which together manage the compilation, linking, and execution of these dynamically generated WebGL programs.

### ONNX Operators (WebGL Backend)
This chunk contains the WebGL implementations for the following ONNX operators. Each of these generates specific GLSL code to run on the GPU.
- **Convolution**: `WebGLConv`
- **Activations & Gates**: `WebGLDropout`, `WebGLElu`, `WebGLLeakyRelu`, `WebGLSoftmax`, `WebGLUnaryOp` (covering Abs, Acos, Asin, Atan, Ceil, Cos, Exp, Floor, Log, Neg, Relu, Sigmoid, Sin, Sqrt, Tan, Tanh)
- **Matrix Operations**: `WebGLGemm`, `WebGLMatMul`
- **Shape & Tensor Manipulation**: `WebGLFlatten`, `WebGLGather`, `WebGLPad`, `WebGLSlice`, `WebGLSliceV10`, `WebGLSplit`, `WebGLSqueeze`, `WebGLSum`, `WebGLTile`, `WebGLTranspose`, `WebGLUnsqueeze`
- **Normalization & Scaling**: `WebGLImageScaler`, `WebGLInstanceNormalization`
- **Pooling**: `WebGLGlobalAveragePool`, `WebGLAveragePool`, `WebGLGlobalMaxPool`, `WebGLMaxPool`
- **Reduction**: `WebGLReduceSum`, `WebGLReduceMean`, `WebGLReduceMax`, `WebGLReduceMin`, `WebGLReduceProd`, `WebGLReduceLogSum`, `WebGLReduceSumSquare`
- **Resampling**: `WebGLUpsample`

### WebGL Infrastructure
- **`ProgramManager`**: Manages the lifecycle of WebGL programs. It compiles shaders, links programs, binds uniforms (parameters) and textures (tensor data), and executes the final draw call.
- **`GlslPreprocessor`**: Prepares the GLSL shader source code for compilation. It handles imports and dependencies for a library of GLSL helper routines, ensuring the final shader has all necessary functions.

### Risks
- No new risks identified in this chunk. The code is focused on high-performance mathematical computation.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js`: lines 30001-32000

## src/js/Grammarly-bg.js [chunk 17/46, lines 32001-34000]

### Summary
This chunk details the core infrastructure and utility libraries that power the WebGL backend. It reveals a sophisticated system for managing WebGL resources, generating shader code, and executing the neural network graph. The code demonstrates a deep understanding of WebGL's capabilities and limitations, especially concerning data types and texture handling.

### WebGL Backend Infrastructure
- **`GlslPreprocessor` & `glslRegistry`**: This system manages a collection of GLSL utility libraries. The preprocessor injects required helper functions into the dynamically generated operator shaders. The registry includes:
  - `EncodingGlslLib`: Handles encoding/decoding of 32-bit float data into 4-channel 8-bit RGBA textures, a critical compatibility feature for WebGL1.
  - `CoordsGlslLib`: Provides functions to convert between tensor indices and texture coordinates (`offsetToCoords`, `coordsToOffset`).
  - `ShapeUtilsGlslLib`: Contains functions for manipulating tensor indices within shaders, essential for operations like broadcasting (`bcastIndex`).
  - `VecGlslLib`: Implements basic vector arithmetic (add, sub, copy) directly in GLSL.
- **`TextureManager`**: A resource manager for WebGL textures. It handles the allocation, deletion, and importantly, the *reuse* (pooling) of textures to minimize performance overhead from frequent memory allocation on the GPU.
- **`WebGLContext`**: A wrapper around the low-level WebGL context. It abstracts away differences between WebGL1 and WebGL2, queries and manages required extensions (e.g., `OES_texture_float`, `EXT_color_buffer_float`), and handles the creation of core WebGL objects like framebuffers, shaders, and programs. It performs checks for vital hardware capabilities, such as the ability to render to floating-point textures.
- **`ExecutionPlan`**: This class orchestrates the execution of the model's graph. It determines the correct order of operations by identifying nodes whose dependencies are met and then executes them using the appropriate backend-specific inference handler.

### Risks
- No new risks identified. This is foundational code for GPU computation.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-bg.beautified.js`: lines 32001-34000

## src/js/Grammarly-bg.beautified.js [chunk 18/46, lines 34001-36000]

### Summary
This chunk contains the core ONNX.js model parsing and graph representation logic. It defines the `Model` class to load the `.onnx` file and the `Graph` class, which builds an in-memory representation of the computation graph. This is a fundamental part of the ML inference engine, responsible for preparing the model for execution by any of the backends (CPU, Wasm, WebGL).

### Key Components
- **Model Class**: Decodes the ONNX model from its protocol buffer format (`onnx.ModelProto.decode`) and verifies the IR version. It serves as the top-level container for the graph and operator set information.

- **Graph Class**: A sophisticated component that constructs the full computation graph. Its responsibilities include:
  - **Parsing**: It parses the graph's inputs, outputs, and initializers (constant tensors/weights).
  - **Graph Building**: It creates an array of `Value` objects (representing tensors) and `Node` objects (representing operations). It correctly links inputs and outputs between nodes.
  - **Cycle Detection**: Implements `checkIsAcyclic()` to ensure the graph is a valid Directed Acyclic Graph (DAG) before execution.
  - **Graph Transformation**: Performs several optimizations to prepare the graph for inference:
    - `removeAllIdentityNodes()`: Simplifies the graph by removing pass-through `Identity` nodes.
    - `removeAllDropoutNodes()`: Removes `Dropout` nodes, which are irrelevant for inference.
    - `finalizeGraph()`: A cleanup step to remove nodes and values that become disconnected after transformations.

- **Attribute Class**: A helper class for `Node` objects that parses operator-specific attributes (e.g., kernel size for a convolution, axis for a softmax). It handles various data types, including floats, ints, strings, and tensors.

- **ExecutionPlan**: The code shows the final part of the `ExecutionPlan.execute` method, which iterates through the topologically sorted nodes, runs the operations, and manages the data flow between them.

### Obfuscation/Bundling
- The code is part of a Webpack bundle, with modules for `Model`, `Graph`, `Attribute`, and `ExecutionPlan`.
- A significant portion of the RxJS library is also bundled in this chunk, indicating its use for handling asynchronous operations and data streams within the extension.

### Risks
- No specific risks identified in this chunk. This is standard model-loading and graph-processing code for an ML framework.

### Evidence
- `src/js/Grammarly-bg.js`: Lines 34001-36000

## src/js/Grammarly-bg.beautified.js [chunk 19/46, lines 36001-38000]

### Summary
This chunk is predominantly composed of bundled third-party libraries, which are common dependencies in modern web applications. Their presence indicates the extension's reliance on established open-source tools for handling complex tasks like asynchronicity, client identification, and version management.

### Third-Party Libraries
- **RxJS**: A large portion of the RxJS library is included. This indicates that the extension uses reactive programming paradigms to manage complex asynchronous operations, event handling, and data streams. This is a powerful library for orchestrating the flow of data between different components of the extension (e.g., UI, background script, content scripts).

- **UAParser.js**: The presence of UAParser.js shows that the extension performs detailed client-side environment detection. It parses the browser's user-agent string to determine:
  - **Browser**: Name and version (e.g., Chrome, Firefox, Edge).
  - **OS**: Name and version (e.g., Windows 10, macOS).
  - **Device**: Type (e.g., mobile, tablet, desktop), vendor (e.g., Apple, Samsung), and model (e.g., iPhone, Galaxy S10).
  - **CPU**: Architecture (e.g., amd64, arm64).
  This information is likely used for analytics, feature flagging (enabling/disabling features based on browser capabilities), or tailoring the user experience to specific devices.

- **semver**: A semantic versioning library is included. This is likely used for checking compatibility between different internal components, dependencies, or perhaps for comparing the extension's version with a version number fetched from a remote server to trigger updates or notifications.

### Risks
- **Fingerprinting**: The use of UAParser.js for detailed environment detection contributes to browser fingerprinting. While often used for legitimate purposes like analytics and compatibility, the collected information (browser, OS, device, CPU) can be combined to create a unique identifier for the user, which has privacy implications.

### Evidence
- `src/js/Grammarly-bg.js`: Lines 36001-38000

## src/js/Grammarly-bg.beautified.js [chunk 20/46, lines 38001-40000]

### Summary
This chunk concludes the UAParser.js library and introduces two other significant components: the `uuid.js` library for generating unique identifiers, and a sophisticated internal agent protocol referred to as "coda-pack". This protocol reveals a modular, plugin-based architecture where both internal Grammarly features (like the AI Detector and Plagiarism Checker) and third-party services (like Google Calendar, Gmail, and Jira) are managed as distinct "agents".

### Third-Party Libraries
- **UAParser.js (conclusion)**: The remainder of the library's regular expressions for parsing user-agent strings.
- **uuid.js**: A library for generating RFC4122 version 4 UUIDs.

### Architecture & Patterns
- **Agent Protocol ("coda-pack")**: A major architectural pattern is revealed. The system uses a modular agent-based architecture to manage and integrate different functionalities.
  - **Agent IDs**: Enumerations are defined for various agents, including `GrammarlyProofreader`, `GrammarlyPlagiarismChecker`, `GoogleCalendar`, `Gmail`, `Jira`, `Confluence`, and `SuperhumanGo`.
  - **Agent Metadata**: The code contains placeholder or mock metadata for these agents, including `name`, `creator`, `icon`, and `description`.
  - **State Management**: Defines state machines for features like the AI Detector and Plagiarism Checker, with states like `Initial`, `Loading`, `Loaded`, and `Locked`.

### Risks
- **Fingerprinting**: The presence of the comprehensive UAParser.js library presents a medium risk of being used for detailed browser and device fingerprinting.

### Evidence
- **UAParser.js and uuid.js**: Lines 38001-38500
- **Agent Protocol and Definitions**: Lines 38501-40000

## src/js/Grammarly-bg.beautified.js [chunk 21/46, lines 40001-42000]

### Summary
This chunk contains a massive amount of the extension's core configuration and infrastructure logic. It defines numerous backend service URLs for different environments (prod, qa, dev), a comprehensive feature flag system, and a sophisticated, custom-built telemetry/analytics SDK (internally named "Mint"). This section is critical for understanding how the extension is configured at runtime, how it communicates with its backend, and how it tracks usage and performance.

### Architecture & Patterns
- **Global Configuration Module**: A central configuration object is created and initialized, holding details about the build, browser, OS, and environment. This config is accessible globally via a `N()` function.
- **Feature Flag System**: An extensive feature flag/gate system is defined, revealing a large number of internal feature names and experiments. This allows for granular control over the extension's behavior. Key feature flags discovered include:
  - `AgentsFeatureInExtension`: The master switch for the "Agents" modular architecture.
  - Specific agent flags: `AgentParaphraserInExtension`, `AgentHumanizerInExtension`, `AgentPlagiarismCheckerInExtension`, etc.
  - `Cheetah...`: A suite of flags related to a feature or service codenamed "Cheetah" (likely related to generative AI writing features).
  - `GDocs...`: Dozens of flags indicating deep and complex integration with Google Docs.
  - `VbarsGlobal`: Likely related to vertical UI bars or sidebars.
  - `TSMintSdkRollout`: Flag for rolling out a TypeScript version of their analytics SDK.
- **Telemetry SDK ("Mint")**: A sophisticated, custom-built analytics SDK (`class Ae`) is defined. Its features include:
  - **Offline Queueing**: Events can be queued if the user is offline.
  - **Retry Logic**: Implements a retry strategy (`class ve`) with exponential backoff and jitter for failed network requests.
  - **Event Pipeline**: Uses transformers and validators to process events before sending.
  - **Error Handling**: Defines a detailed error policy (`class Ee`) to handle different failure modes (Auth, Network, HTTP, Validation, Transformation).
  - **Graceful Degradation**: Can be configured to fail silently if analytics events can't be sent.

### Endpoints
This chunk defines the logic for constructing URLs for various Grammarly services across different environments (prod, qa, dev). Key domains and endpoints include:
- **Assets**: `https://assets.extension.grammarly.com/`
- **Authentication**: `https://auth.grammarly.com/v3`, `/v4`, `/v5`
- **CAPI (Client API)**: `https://capi.grammarly.com`, `wss://capi.grammarly.com/freews`
- **Gateway**: `https://gateway.grammarly.com` (for skills, snippets, etc.)
- **Coda**: `https://coda.grammarly.com` (related to the "coda-pack" agent protocol)
- **Logging/Metrics**: `https://f-log-extension.grammarly.io`, `https://extension.femetrics.grammarly.io/batch/import`
- **Third-Party**: `https://api.iterable.com` (a marketing automation/user engagement platform)

### Evidence
- **Configuration and URL Generation**: Lines 40001-40500
- **Feature Flag Definitions**: Lines 41500-41900
- **Telemetry SDK ("Mint")**: Lines 40800-41500
- **Logging Framework**: Lines 40500-40800

## src/js/Grammarly-bg.js [chunk 22/46, lines 42001-44000]

### Summary
This chunk is dominated by a massive, centralized telemetry and event logging class, internally named `nn`. This class serves as the single point of contact for logging hundreds of distinct events across the entire extension, from performance metrics and errors to fine-grained user interactions and feature-specific usage. The chunk also defines a sophisticated URL pattern matching class (`$t`) used to identify and classify 'top sites' like Google Docs, Slack, Salesforce, and many others, which likely receive special handling or enhanced integration.

### Key Findings

1.  **Centralized Telemetry Hub (`nn`)**:
    *   A single, enormous class (`nn`) is instantiated to handle all event logging.
    *   It defines a vast API surface with hundreds of methods, each corresponding to a specific event (e.g., `csInitialized`, `fetchUserFail`, `userUpgradeClick`, `unhandledBgPageException`).
    *   Events cover performance, errors, user actions, feature lifecycle, A/B testing, and system health.
    *   It uses multiple underlying sender functions (`_sendFelog`, `_sendFelogUsage`, `_sendFemetricsRate`), suggesting different data sinks for different event types (e.g., general logs, usage metrics, performance metrics).
    *   It implements event sampling (`_sendSampled`, `_sendSampledEvent`) for high-frequency events to manage data volume.

2.  **Sophisticated URL Pattern Matching (`$t`)**:
    *   A dedicated class (`$t`) is implemented to match the current page's hostname against a predefined list of patterns.
    *   The list of patterns is extensive, covering major web applications:
        *   **Email**: `mail.google.com`, `outlook.*`, `mail.yahoo.com`
        *   **Productivity/Collaboration**: `*.slack.*`, `trello.com`, `**.atlassian.net`, `**.asana.com`, `teams.microsoft.com`
        *   **CRM/Sales**: `**.salesforce.com`, `**.force.com`, `**.hubspot.com`
        *   **Social Media**: `facebook.com`, `twitter.com`, `x.com`, `linkedin.com`, `reddit.com`
        *   **AI/Chat**: `chat.openai.com`, `chatgpt.com`, `bard.google.com`, `claude.ai`
        *   **Documents/Writing**: `docs.google.com`, `**.officeapps.live.com`, `notion.so`, `coda.io`, `overleaf.com`
        *   **Customer Support**: `**.zendesk.com`, `**.intercom.com`, `**.freshdesk.com`
    *   This classification is crucial for the extension to decide when and how to activate its features.

3.  **Context-Rich Event Payloads**:
    *   Logged events are enriched with detailed context. For example, error logs include the error message, stack trace, and extra metadata (`mt(n, t)`).
    *   Feature-specific data is attached to relevant events (e.g., `gdocsExtra`, `autoFixExtra`, `citationBuilderExtra`).

### Obfuscation/Patterns
*   **Minified Variables**: Standard single-letter variables (`e`, `t`, `n`, `r`) are used throughout.
*   **Class-based Architecture**: The code is well-structured into classes (`nn`, `$t`, `Xt`) despite the minification, indicating a robust underlying architecture.
*   **Centralized Services**: The `nn` class acts as a singleton or a centralized service for telemetry, a common pattern for managing cross-cutting concerns.

### Risks/Implications
*   **Extensive Data Collection**: The sheer volume and granularity of tracked events highlight a very comprehensive data collection strategy. While primarily for product improvement and debugging, it covers nearly every user interaction with the extension.
*   **"Top Site" Prioritization**: The explicit list of "top sites" shows a clear focus on deep integration with specific, popular platforms, particularly in the business, productivity, and education sectors.

### Discovered Items
*   **Telemetry Events**: Hundreds of specific event names were discovered, providing a roadmap of what the extension monitors (e.g., `bg.state.install`, `cs.ui.gbutton.click`, `gnar.bg.tracking.gnar.init.fail`, `iterableIPMOpen`).
*   **Targeted Websites**: A long list of websites targeted for special integration was identified.

## src/js/Grammarly-bg.js [chunk 23/46, lines 44001-46000]

### Summary
This chunk transitions from the extensive telemetry system to a comprehensive and robust OAuth 2.0 client implementation. This client is responsible for all aspects of user authentication, including acquiring, refreshing, and exchanging tokens. It is designed to be resilient, with features like retry logic, environment switching (prod, preprod, qa), and a sophisticated mutex to prevent race conditions during token refresh operations. The implementation also includes support for the PKCE (Proof Key for Code Exchange) standard.

### Key Findings

1.  **Robust OAuth 2.0 Client**:
    *   A set of classes (`sr`, `Ir`, `_r`) and functions are dedicated to handling the full OAuth 2.0 flow.
    *   It supports multiple grant types: `authorization_code`, `refresh_token`, and a custom `urn:ietf:params:oauth:grant-type:token-exchange`.
    *   It defines distinct authentication endpoints for different environments:
        *   **Production**: `https://auth.grammarly.com`
        *   **Pre-Production**: `https://auth.ppgr.io`
        *   **QA**: `https://auth.qagr.io`
    *   The client is built on a custom HTTP client (`_r`) that includes automatic retries with exponential backoff for network requests.

2.  **Secure Token Management**:
    *   **PKCE Implementation**: The code includes functions to generate a `code_verifier` and a SHA-256 hashed `code_challenge` (`Fn`, `jn`), a modern security practice to prevent authorization code interception attacks.
    *   **Token Storage & Caching**: An `ir` class manages the caching of tokens in a persistent storage (`this._storage`), likely `chrome.storage.local`.
    *   **Token Validation**: A `Er` class is used to validate access tokens, checking for expiration and correct structure.

3.  **Race Condition Prevention (Mutex)**:
    *   A sophisticated locking mechanism (`er` function, `rr` class) is implemented to act as a mutex.
    *   This lock, named `grammarly.lock.getAccessToken`, ensures that only one part of the extension can attempt to refresh an expired token at a time, preventing race conditions and redundant network requests.
    *   The lock uses a timeout and a polling mechanism, making it resilient to stale locks.

4.  **Custom Cryptography**:
    *   A from-scratch implementation of the SHA-256 hashing algorithm (`Nn` class) is included, likely to ensure consistency across environments where the Web Crypto API (`crypto.subtle`) might not be available.

### Obfuscation/Patterns
*   **Class-based Modules**: The code is highly modular, with distinct classes for the OAuth service (`Ir`), HTTP client (`_r`), token cache (`ir`), and the mutex (`rr`).
*   **Asynchronous Operations**: The entire authentication flow is built using `async/await`, indicating a modern JavaScript codebase.
*   **Error Handling**: Custom error classes (`An`, `En`, `Sr`, `kr`) are defined to handle specific failure scenarios, such as HTTP errors, invalid tokens, and lock timeouts.

### Risks/Implications
*   **Centralized Authentication**: The security of the entire extension relies heavily on this OAuth implementation. Any vulnerability here could compromise user accounts.
*   **Secure by Design**: The use of PKCE and a token refresh mutex demonstrates a strong focus on security and robustness, following modern best practices for client-side authentication.

### Discovered Items
*   **Authentication Endpoints**:
    *   `https://auth.grammarly.com/v4/api/oauth2/authorize`
    *   `https://auth.grammarly.com/v4/api/oauth2/exchange`
    *   `https://auth.grammarly.com/v4/api/oauth2/token`
    *   `https://auth.grammarly.com/v4/api/revoke-by-refresh-token`
    *   `https://auth.grammarly.com/v4/api/userinfo`
*   **Staging/QA Endpoints**: `auth.ppgr.io` (Pre-Prod), `auth.qagr.io` (QA).
*   **Internal Mechanisms**: `grammarly.lock.getAccessToken` (mutex name), `gr-oauth-key` (storage key for tokens).

## src/js/Grammarly-bg.js [chunk 24/46, lines 46001-48000]

### Summary
This chunk is foundational, introducing the high-level authentication client, a sophisticated IndexedDB-based storage engine, a custom SHA-256 implementation, and an internal message bus. It reveals the core infrastructure for managing user sessions, persistent data, and internal communication.

### Findings
- **Authentication Client (`Rr` class)**: A high-level client that orchestrates the entire token lifecycle. It uses a robust fallback strategy for maintaining a session:
  1.  **Cache**: Get a valid access token from the cache.
  2.  **Refresh**: If the token is expired, use a refresh token.
  3.  **Token Exchange**: If the refresh token is invalid, attempt a token exchange grant.
  4.  **Anonymous**: As a final fallback, perform an anonymous login.
  - It also handles the OAuth 2.0 redirect flow and token revocation on logout.

- **IndexedDB Storage Engine (`$i` / `Wi` class)**: A highly advanced, custom-built wrapper around IndexedDB. This is a major component.
  - **Features**:
    - **Versioning & Migration**: Includes logic to migrate the database schema between versions (e.g., v1 to v2).
    - **Quota Management**: Uses `navigator.storage.estimate()` to check available space and implements an eviction strategy (based on TTL) to clear space when the quota is nearly full.
    - **Data Expiration**: Manages TTL for stored items and uses `requestIdleCallback` to run background cleanup of expired data.
    - **Error Handling**: Wraps IndexedDB operations in promises with detailed error types.
  - **Multi-User Isolation (`io` class)**: A manager that creates separate IndexedDB instances for each user by creating databases named `GrCAPIStorage:<hashed_email>`, ensuring data isolation. It tracks all created databases in a central `GrCAPIStorage:Tracking` database.

- **Custom SHA-256 Implementation (`lo` class)**: A from-scratch implementation of the SHA-256 hashing algorithm.
  - **Purpose**: This is almost certainly a fallback for the Web Crypto API to ensure that the PKCE `code_challenge` for OAuth 2.0 can always be generated, making the authentication flow more resilient.

- **Internal Message Bus (`Ts`, `Os` classes)**: A sophisticated event/messaging system for communication between different parts of the extension.
  - **Architecture**: It creates a network of "ports" that can be connected. Components can create ports to send and receive messages.
  - **Functionality**: Supports publish/subscribe patterns, retained values (for late-joining subscribers), and handshakes to synchronize state between components. This is likely the communication backbone between the service worker, content scripts, and UI panels.

### Storage
- **`oauth.tokens`**: A key used in a `TypedStorage` wrapper (likely `chrome.storage.local`) to store OAuth tokens for an authenticated fetch wrapper.
- **`GrCAPIStorage:*`**: A pattern for naming IndexedDB databases, where `*` is a hash of the user's email. This provides isolated storage per user.
- **`GrCAPIStorage:Tracking`**: A dedicated IndexedDB database to keep track of all other storage databases created by the extension.

### Risks
- No new risks identified in this chunk. The code demonstrates robust security and data management practices (e.g., PKCE, data isolation).

### Evidence
- `src/js/Grammarly-bg.js:46188-46584`: The main `Rr` authentication client class definition.
- `src/js/Grammarly-bg.js:47001-47088`: The `Wi` (`$i`) class definition for the IndexedDB storage engine.
- `src/js/Grammarly-bg.js:47790-47955`: The `lo` class providing the from-scratch SHA-256 implementation.
- `src/js/Grammarly-bg.js:47957-48000`: The `Ts` and `Os` classes implementing the internal message bus.

## src/js/Grammarly-bg.js [chunk 25/46, lines 48001-50000]

### Summary
This chunk is pivotal, revealing two major architectural pillars: the **Agent Platform** and the **Gnar Analytics Client**. The Agent Platform is a sophisticated modular system that dynamically loads features (agents) on demand. The Gnar client is a comprehensive analytics engine with resilient storage, event batching, and detailed session tracking.

### Findings
- **Agent Platform (`La` class)**: This is the core of the extension's modular architecture.
  - **Purpose**: Manages the lifecycle of different "agents" (features like document analysis, assistant, etc.). It activates and deactivates them as needed.
  - **Dynamic Loading**: It uses dynamic imports (`__webpack_require__.e(...).then(...)`) to load agent implementations on the fly. This is a key performance optimization, preventing the extension from loading all features at startup.
  - **Communication**: It leverages the internal message bus (discovered in the previous chunk) to communicate with agents and different parts of the extension (background, content scripts, UI panels).
  - **Protocols**: Defines strict protocols (`ka`, `Ea`, `Pa`, `Ma`) for each agent, specifying their state, events, and integration points.

- **Gnar Analytics Client (`$c` class)**: A full-featured, custom analytics client.
  - **Event Batching**: It queues analytics events and sends them in batches to the backend (`/events-with-token`, `/lite-with-token`) to reduce network traffic.
  - **Resilient Storage**: It uses a multi-layered storage strategy to persist its primary identifier (`gnar_containerId`). It tries to store it in `chrome.cookies` first, falling back to `localStorage` and then an in-memory value. This ensures the identifier is highly persistent.
  - **Session Management**: It manages a `websiteSessionId` and an `instanceId` to track user sessions and application instances.
  - **Throttling**: It throttles its own "ping" events by storing a `gnar_nextPingTimestamp` in `localStorage`.
  - **User Identification**: It includes methods to associate analytics with a `userId` and `institutionId` after the user logs in.

- **Chrome API Usage**:
  - **`chrome.cookies`**: Used extensively by both the Gnar client for its resilient storage strategy and by a dedicated `nl` (Cookies) class to manage authentication-related cookies (`grauth`, `csrf-token`).
  - **Port-based Messaging**: The agent platform listens for connections on a port named `message-bus-port`, which is the entry point for content scripts and UI panels to connect to the background's message bus.

### Storage
- **`gnar_containerId`**: The primary identifier for the Gnar analytics client. Stored resiliently across `chrome.cookies` and `localStorage`.
- **`gnar_nextPingTimestamp`**: A `localStorage` key used to control the frequency of the Gnar client's ping event.
- **`gnarInternalStorage`**: A `localStorage` key for the Gnar client's internal data.

### Messages
- **`message-bus-port`**: The named port used to establish a connection between different parts of the extension (e.g., content scripts, popups) and the central message bus in the service worker.

### Risks
- No new risks identified. The analytics client is sophisticated but appears to be focused on product usage metrics. The use of dynamic imports is a standard code-splitting technique.

### Evidence
- `src/js/Grammarly-bg.js:48293-48499`: The `La` class, which is the core of the agent platform.
- `src/js/Grammarly-bg.js:49251-49550`: The `$c` class, which is the full implementation of the Gnar analytics client.
- `src/js/Grammarly-bg.js:48055-48291`: Definitions for the agent protocols (`ka`, `Ea`, `Pa`, `Ma`), which specify the interface for dynamically loaded features.
- `src/js/Grammarly-bg.js:49680-49800`: The `nl` (Cookies) class, which abstracts away interactions with the `chrome.cookies` API for managing auth-related cookies.

## src/js/Grammarly-bg.js [chunk 26/46, lines 50001-52000]

### Summary
This chunk reveals a major capability: communication with a native desktop application via `chrome.runtime.connectNative`. It also details a custom, in-memory alarm manager, several new API clients for backend services, and a formal framework for managing side effects within the extension.

### Findings
- **Native Messaging Connector**: The code establishes a persistent connection to a native application named `com.grammarly.desktop`.
  - **Mechanism**: It uses `chrome.runtime.connectNative` to create a port for bidirectional RPC-style communication.
  - **Protocol**: A custom RPC protocol (`Eu` class) is implemented on top of the native messaging port, handling request/response cycles, timeouts, and error handling.
  - **Lifecycle Management**: A `ConnectorManager` (`Uu` class) manages the lifecycle of these native connections, including reconnection logic.
  - **Purpose**: This allows the extension to break out of the browser sandbox and interact with the local operating system, likely for deeper integrations like accessing local files or system-wide keyboard shortcuts, though the specific use case is not fully detailed in this chunk.

- **Custom Alarm Manager (`Ku` class)**: Instead of using the standard `chrome.alarms` API, the extension implements its own alarm manager using `setTimeout`. This provides more flexible, non-persistent, in-memory scheduling for periodic tasks. It supports randomizing execution times within a period to distribute load.

- **Side Effect Framework (`Xu`)**: A structured framework is defined to handle application logic in response to specific events. It allows creating declarative "side effects" that trigger on events like `bgWakeUp`, `storeChange`, `alarm`, and `refreshUser`. This organizes the reactive parts of the codebase.

- **API Clients**:
  - **Cheetah Settings (`Jl`, `nu` classes)**: API clients for fetching and updating user and institution-level settings for a feature called "Cheetah" from `capi` and `goldengate` endpoints.
  - **Authorship API (`sd` class)**: An API client for an "Authorship" feature, which can upload data to generate a report and fetch encryption keys from `gateway.grammarly.com`.

- **Assistant Onboarding Storage (`kl` class)**: A dedicated storage class for managing the state of the "Assistant" feature's onboarding flow. It tracks dismissal status, completion status, and show counts in `chrome.storage.local` under the `assistantOnboarding_*` key prefix.

### Risks
- **`remote_code` / `policy_violation` (Medium)**: The use of `chrome.runtime.connectNative` to communicate with `com.grammarly.desktop` is a significant security consideration. While a powerful feature, it bridges the browser and the local machine. A vulnerability in the native application could potentially be exploited by a compromised web page through the extension, increasing the overall attack surface. This pattern requires careful scrutiny and is often restricted by browser store policies.

### Evidence
- `src/js/Grammarly-bg.js:51438-51814`: The `Nu` class, which is the core implementation of the native messaging host handle, including the handshake logic.
- `src/js/Grammarly-bg.js:51418-51436`: The `Du` class, which wraps the `T0().browserApi.connectNative("com.grammarly.desktop")` call.
- `src/js/Grammarly-bg.js:51816-52000`: The `Uu` (ConnectorManager) and `Mu` (Background Connector) classes that manage the lifecycle and communication with foreground scripts.
- `src/js/Grammarly-bg.js:51090-51162`: The `Ku` class, implementing the custom `setTimeout`-based alarm manager.
- `src/js/Grammarly-bg.js:51164-51264`: The `Xu` side effect framework definition.
- `src/js/Grammarly-bg.js:50888-51087`: API clients for "Cheetah" settings (`Jl`, `nu`).
- `src/js/Grammarly-bg.js:51285-51385`: API client for the "Authorship" service (`sd`).

## src/js/Grammarly-bg.js [chunk 27/46, lines 52001-54000]

### Summary
This chunk is almost entirely composed of polyfills and shims, likely from a compatibility library like `core-js`. Its primary purpose is to ensure that modern JavaScript features and APIs are available in older browser environments that may not support them natively. This is a standard practice for robust web development but adds significant bulk to the script.

### Findings
- **Polyfills for Modern JavaScript Features**:
  - **Error Handling**: Polyfills for `Error` causes, `SuppressedError`, and `DisposableStack` are present. These are relatively new features in the JavaScript specification for improved error handling and resource management.
  - **`setImmediate`**: A complex polyfill for `setImmediate` is included. This provides a way to execute code after the current event loop cycle, but before the next one, offering more immediate execution than `setTimeout(..., 0)`. The implementation is sophisticated, trying multiple strategies to find the fastest available mechanism (e.g., `process.nextTick` in Node.js-like environments, `MessageChannel`, `postMessage`, or falling back to `setTimeout`).
  - **Core Object Methods**: Numerous shims for `Object` methods (`Object.defineProperty`, `Object.getOwnPropertyDescriptor`, `Object.keys`, `Object.setPrototypeOf`, etc.) and `Function.prototype` methods are included.

- **Compatibility Layer**: The code contains a large number of small, interdependent utility functions that check for the existence of features and provide fallbacks if they are missing. This is characteristic of a library like `core-js` or a custom `babel` runtime, which is used to transpile modern JavaScript for older targets.

- **Environment Sniffing**: The code includes logic (`Pb` function) to detect the current JavaScript environment (e.g., `BUN`, `CLOUDFLARE`, `DENO`, `NODE`, `BROWSER`). This allows the polyfills to use the most efficient implementation for the specific platform it's running on.

### Risks
- No new risks are introduced in this chunk. This code is focused on providing compatibility and does not introduce new functionality or interact with sensitive APIs. The complexity is high, but it's a standard part of modern web development toolchains.

### Evidence
- `src/js/Grammarly-bg.js:52158-53998`: This large block contains the entirety of the polyfills and shims described. Specific features can be found within this range:
  - `src/js/Grammarly-bg.js:53001-53200`: `DisposableStack` polyfill implementation.
  - `src/js/Grammarly-bg.js:52880-52990`: `SuppressedError` polyfill implementation.
  - `src/js/Grammarly-bg.js:52680-52878`: `setImmediate` polyfill implementation.
  - `src/js/Grammarly-bg.js:52170-52200`: Environment detection logic.

## src/js/Grammarly-bg.js [chunk 28/46, lines 54001-56000]

### Summary
This chunk continues the theme of the previous one, being dominated by polyfills and foundational library code. The most significant finding is a sophisticated logging client (`FeLogWriter`) that batches logs and sends them to a dedicated endpoint. This chunk also marks the beginning of the RxJS library, a major dependency for reactive programming.

### Findings
- **FeLogWriter (`Jv` class)**: A feature-rich logging client for sending telemetry and debug information.
  - **Batching & Sending**: It queues log messages and sends them in batches to `https://f-log-inkwell.grammarly.io/batch/log`.
  - **Rate Limiting**: It includes a `RateLimiter` to avoid sending too many logs, configured with `logsPerSecond` and `logsPerMinute`.
  - **Data Sanitization**: It uses a `sanitizedReplacement` function (`Hv`) to scrub potentially sensitive information from log messages before they are sent.
  - **Resilient Sending**: It uses `fetch` with the `keepalive: true` flag, which ensures that log requests are completed even if the service worker is shutting down.

- **Promise Polyfills**: The code continues to add shims for modern Promise features, including `Promise.all`, `Promise.race`, `Promise.reject`, `Promise.resolve`, and the very recent `Promise.withResolvers()`, ensuring a consistent asynchronous programming model.

- **RxJS Library**: From line ~55402 onwards, the code is the start of the RxJS library. RxJS is a powerful library for composing asynchronous and event-based programs by using observable sequences. This chunk defines the foundational pieces like `UnsubscriptionError` and the basic subscription management logic. The presence of RxJS indicates that the extension's internal architecture is likely heavily based on reactive programming principles.

### Risks
- No new risks identified in this chunk. The logging client appears to have data sanitization in place, and the rest of the code is standard library/polyfill implementation.

### Evidence
- `src/js/Grammarly-bg.js:54800-55050`: The `Jv` class, which is the implementation of the `FeLogWriter`.
- `src/js/Grammarly-bg.js:55052-55400`: The `tw` function, which contains the `fetch` call to the `f-log-inkwell.grammarly.io` endpoint.
- `src/js/Grammarly-bg.js:54003-54800`: Various Promise and other ES feature polyfills.
- `src/js/Grammarly-bg.js:55402-56000`: The beginning of the RxJS library implementation.
## src/js/Grammarly-bg.beautified.js [chunk 29/46, lines 56001-58000]

### Summary
This chunk contains a significant amount of core infrastructure code, including a large part of the RxJS library implementation, a custom RPC framework, a sophisticated IndexedDB wrapper, and several critical API clients for backend services. It also details a feature for tracking service availability metrics.

### Chrome APIs
- `indexedDB`: Used extensively via a custom wrapper for storing application data, particularly for service availability metrics.

### Event Listeners
- `MessagePort.onmessage`: The custom RPC framework (`zw`) listens for messages on a `MessagePort` to handle incoming requests and responses.

### Storage
- **IndexedDB Database**: `duration_service_availability_metrics_db_v1`
  - **Purpose**: Stores aggregated user activity metrics (view duration, typing duration) per domain to track service availability and usage patterns.
  - **Tables**: `view`, `typing`.
  - **Classes**: `Zw` (DB connection/schema manager), `Yw` (Table-level operations), `rS` (Metrics storage logic).

### Endpoints
- 
### Chrome APIs
- `indexedDB`: Used extensively via a custom wrapper for storing **Purpose**: Manages institutional knowledge base content like terms, presets, and settings.
  - **Class**: `Ww` (`$w`).
- **Settings Registry API**: `https://goldengate{env}/settings-registry/v1`
  - **Purpose**: A generic service for fetching and saving settings for users, user groups, and institutions.
  - **Class**: `gS` (`fS`).
- **Grammarly User API**: `https://www.grammarly.com/api/`
  - **Purpose**: Core user authentication and account management. Handles login, logout, signup, password changes, profile updates, OAuth flows, and MFA setup.
  - **Class**: `ek`.

### Dynamic Code/Obfuscation
- **Minified Variables**: Widespread use of single-letter or short, non-descriptive variable names (e.g., `e`, `t`, `n`, `r`).
- **Function Chains**: Complex logic is often implemented through chained function calls, characteristic of libraries like RxJS and functional programming patterns.
- **RxJS Implementation**: A large portion of this chunk consists of the minified implementation of the RxJS library itself (`dw`, `vw`, `Ow`, `Dw`), which handles reactive programming paradigms.

### Key Functionality
- **Custom RPC Framework (`zw`)**: Implements a full RPC system over `MessagePort`. It uses a `Proxy` to create a dynamic client interface, manages request/response lifecycles with unique IDs, and includes timeouts and error handling. This is a core component for inter-service communication within the extension.
- **Service Availability Tracking (`pS`, `oS`)**: A system to monitor how and where the Grammarly extension is used or disabled. It tracks the duration of different integration states (e.g., `integrated`, `disabled_by_user`, `disabled_by_enterprise`) on a per-domain basis. An alarm (`serviceAvailabilityTracking`) periodically sends this collected data as telemetry.
- **API Abstractions**: The code defines clear, class-based abstractions for interacting with key Grammarly backend services, separating API logic from business logic.

### Risks
- No new risks identified in this chunk. The functionality appears to be related to standard application infrastructure and analytics.

### Evidence
- RxJS Subscription: `dw` class, lines 56003-56100
- RPC Framework: `zw` class, lines 56990-57300
- IndexedDB Wrapper: `Yw` and `Zw` classes, lines 57555-57680
- Service Availability Metrics Storage: `rS` class, lines 57682-57830
- Knowledge Hub API Client: `Ww` class, lines 56768-56988
- Settings Registry API Client: `gS` class, lines 57968-58150
- User Auth API Client: `ek` class, lines 58268+

## src/js/Grammarly-bg.beautified.js [chunk 30/46, lines 58001-60000]

### Summary
This chunk details the core authentication and API service infrastructure. It includes a comprehensive OAuth 2.0 client with extensive telemetry, a central API service class that manages all requests, a large registry of feature flags and experiments, and a custom-built, from-scratch IndexedDB wrapper for local data persistence. It also lays the groundwork for the "GOS" (Grammarly Overlay Service) message-passing architecture.

### Chrome APIs
- `indexedDB`: A full custom wrapper (`jI`, `FI`) is implemented on top of the native `indexedDB` API to handle database connections, schema creation, migrations, and CRUD operations.

### Storage
- **`gr-oauth-key`**: The OAuth client (`Rr`) uses this key (likely in `chrome.storage.local`) to persist OAuth tokens and related metadata.
- **Custom IndexedDB Wrapper**:
  - **Classes**: `jI` (connection/migration), `FI` (CRUD operations), `NI` (schema diffing).
  - **Functionality**: Provides a high-level, promise-based API over IndexedDB. It supports schema definition, automatic version upgrades, and full-text search indexing using a Porter Stemmer algorithm (`eI`).

### Endpoints
- The `ek` class continues, defining methods for a wide range of user account and security-related actions against the `https://www.grammarly.com/api/` and `/account/` endpoints, including:
  - Multi-Factor Authentication (MFA) management (setup, verify, remove modes).
  - Account deletion.
  - Fetching security overview and device sessions.
  - Revoking device sessions.

### Dynamic Code/Obfuscation
- **Minified Variables**: Consistent use of short, non-descriptive variable names.
- **Class and Enum Obfuscation**: Many classes and enums are defined as properties of a single object (e.g., `nk`), a common minification pattern.

### Key Functionality
- **Central API Service (`xk`)**: This class is the heart of the extension's communication with the backend. It manages API fingerprints, constructs an `ajaxFactory` with status tracking, and provides an `ajax` client with the correct headers (CSRF, auth token) for all authenticated requests.
- **Composite OAuth 2.0 Client (`wk`)**:
  - Acts as a wrapper that can switch between "implicit" and "explicit" token exchange flows based on the `OAuthExplicitTokenExchange` feature flag.
  - Includes robust telemetry (`yk`) for tracking every stage of the authentication lifecycle.
  - Contains logic to handle degraded token service states, providing resilience.
- **Experimentation/Feature Flag Registry (`kk`)**: A massive object defining dozens of experiments. This shows a heavy reliance on A/B testing and controlled rollouts for features ranging from UI changes (`LockedUiDebouncedHoverUnlock`) to core technical choices (`OAuthSDKV2`).
- **GOS (Grammarly Overlay Service) Architecture (`CI`, `EI`, `xI`)**:
  - Defines the infrastructure for a message-passing system between the background script and foreground components.
  - `CI` (`ObjectBroker`) acts as a central dispatcher, creating and managing service instances (like `userAccount`, `indexedDB`) scoped to specific client contexts.
  - This enables modular and decoupled communication within the extension.
- **Porter Stemmer Implementation (`eI`)**: Includes a classic Porter Stemmer algorithm for reducing English words to their root form. This is used to power the full-text search capability within the custom IndexedDB wrapper.

### Risks
- No new direct risks are identified. The complexity of the custom IndexedDB and OAuth implementations could potentially introduce bugs, but the code appears to be well-structured and includes error handling and telemetry.

### Evidence
- API Service (`xk`): lines 59010-59200
- Composite OAuth Client (`wk`): lines 58730-58850
- Experiment Registry (`kk`): lines 58855-58980
- Custom IndexedDB Wrapper (`jI`, `FI`): lines 59650-60000+
- GOS Object Broker (`CI`): lines 59450-59550
- Porter Stemmer (`eI`): lines 59590-59648

## src/js/Grammarly-bg.beautified.js [chunk 31/46, lines 60001-62000]

### Summary
This chunk introduces a significant feature set related to data persistence, encryption, and native integration. The most prominent feature is the **Human Writing Report (HWR)**, which appears to be an end-to-end encrypted storage mechanism for document content. It uses IndexedDB for local storage (`human_writing_report` database) and a custom keychain service (`UC`) to manage encryption keys fetched from a remote backend. This chunk also contains a large, from-scratch implementation of various cryptographic hash functions, including **SHA-1, SHA-2 (224, 256), and SHA-3 (224, 256, 384, 512)**, as well as SHAKE, CSHAKE, and KMAC variants. This is a major finding, as it indicates a self-reliance on custom crypto implementations rather than using standard browser APIs like `crypto.subtle.digest` for all hashing needs.

### Chrome APIs
- **`indexedDB.open`**: Used to create and open the `human_writing_report` database.
- **`crypto.subtle.*`**: Extensively used for encryption (`encrypt`, `decrypt`), key generation (`generateKey`), and key management (`importKey`, `exportKey`).
- **`crypto.getRandomValues`**: Used for generating initialization vectors (IVs) for encryption.
- **`runtime.getManifest`**: Used to inspect the extension's own manifest for content script details.
- **`runtime.onUpdateAvailable`**: Listens for extension updates.
- **`runtime.reload`**: Reloads the extension, likely after an update.
- **`runtime.requestUpdateCheck`**: Proactively checks for new extension versions.

### Storage
- **IndexedDB (`human_writing_report`)**: A new database is introduced to store encrypted document states (`document_state_enc` object store).
- **IndexedDB (`AppActivity`)**: The `gstore` created with `jI` is used to store `AppActivity` data, tracking when skills/apps are last accessed to rank them.
- **`chrome.storage` (`__migration-.*`)**: A migration utility class `VA` is defined, which uses a flag in `chrome.storage` to track the status of data migrations between different storage systems.

### Endpoints
- **`GET /users/{userId}/skills`**: Used by the `tC` (Skills service) to fetch the list of available skills/apps for a user.

### Cryptography & Security
- **Human Writing Report (HWR)**:
    - **`NC` (HWR Store)**: Manages the `human_writing_report` IndexedDB.
    - **`DC` (Encryption Serializer)**: Handles the serialization and encryption of document data (`gC`) before it's stored. It uses `AES-GCM`.
    - **`UC` (Keychain)**: Manages fetching and provisioning of encryption keys from a remote service via the `uC` client. Keys are identified by a hash of the document ID.
- **From-scratch Crypto Implementations**:
    - **SHA-1 (`dA`)**: A complete, from-scratch implementation of the SHA-1 hashing algorithm.
    - **SHA-2 (`gA`)**: Implementation for SHA-224 and SHA-256.
    - **SHA-3 / Keccak (`GA`)**: A large implementation covering SHA3, SHAKE, CSHAKE, and KMAC variants.
- **Risks**:
    - **`insecure_storage` (Low)**: The inclusion of a from-scratch SHA-1 implementation (`dA`) is a potential security risk. SHA-1 is considered cryptographically weak and vulnerable to collision attacks. While its specific use case here is unknown, relying on a deprecated algorithm is poor practice.

### Native Integration & GDocs
- **`BA` (Desktop Integration GDocs Redirect)**: A module dedicated to handling redirects and interactions related to the Grammarly for Windows/Mac desktop integration, specifically for Google Docs. It can find and activate tabs based on a hash of their URL.
- **`mE` (Superhuman Integration Check)**: A utility function to detect if the user is part of the Superhuman ecosystem by checking for a specific cookie (`sh_installation_flow_source`) on Superhuman-related domains.

### Other Key Modules
- **`tC` (Skills Service)**: A GOS service that fetches, caches, and ranks "skills" (likely representing apps or features like the tone detector, etc.). It uses both a remote API and local IndexedDB (`AppActivity`) to sort skills by recent usage.
- **`VA` (Storage Migrator)**: A generic class for migrating data from a source storage to a destination, tracking completion with a flag.
- **`rE`, `iE` (Content Script Injectors)**: Functions to dynamically inject or update content scripts on pages, replacing older versions if detected.

### Evidence
- `js/Grammarly-bg.beautified.js:60935-60999` (SHA-1 Implementation)
- `js/Grammarly-bg.beautified.js:60223-60510` (Human Writing Report - HWR)
- `js/Grammarly-bg.beautified.js:60080-60200` (Skills Service `tC`)
## src/js/Grammarly-bg.beautified.js [chunk 32/46, lines 62001-64000]

### Summary
This chunk is extremely significant, detailing two major, sophisticated systems: the **Coda.io-based Agent Platform** and an **advanced autocorrect/spelling prediction engine**.

The **Agent Platform** is managed by an `AgentDirectoryService` (`qE`) that communicates with a Coda API (e.g., `coda.grammarly.com`). It provides a complete lifecycle for "agents" (which appear to be Coda Packs): listing, searching, creating/deleting instances, and reordering. This confirms that the extension can dynamically load and manage modular functionalities. The `ME` class handles the optimistic reordering of these agents in the UI, with debounced synchronization to the backend.

The **autocorrect engine** (`ZE`, `xx`) is a powerful, multi-stage system. It goes far beyond simple dictionary lookups. When triggered, it extracts the preceding word and context, generates correction candidates from a vocabulary using hamming distance, and then scores each candidate using a rich set of features. These features include n-gram language model probabilities, a noisy channel model probability (for typo likelihood), edit distance, and even keyboard layout distance (`ix.getShapeDistance`). The final decision is made by a neural network classifier (`Tx` wrapping an ONNX.js model). The system also includes a persistent feedback loop (`ax`, `sx`, `ox`), storing user rejections and acceptances in `chrome.storage` (`apollo-feedback`) to improve future suggestions.

### Event Listeners
- **`installedAgentsOrderChanged`**: Emitted by the `ME` (Agent Order Manager) class when the order of installed agents is updated, allowing other parts of the system to react.

### Endpoints
This chunk defines the entire API surface for the Coda Agent Directory:
- **`GET /apis/v1/packs/listings`**: Lists available agents/packs.
- **`GET /internalAppApi/packs/search`**: Searches for agents.
- **`POST /internalAppApi/agentInstances/{tenantId}`**: Creates/installs a new agent instance.
- **`DELETE /internalAppApi/agentInstances/{tenantId}/{agentInstanceId}`**: Removes an agent instance.
- **`POST /internalAppai/agentInstances/{tenantId}/{agentInstanceId}/reorder`**: Saves the new order of agents.
- **`GET /internalAppApi/account/userAccountInfo`**: Fetches user account info from Coda.
- **`POST /internalAppApi/agentInstances/brainTenantId`**: Fetches a "brain tenant ID".

### Storage
- **`apollo-feedback`**: A key in `chrome.storage` used by the `ox` (FeedbackStorage) class to persist user feedback on autocorrect suggestions (acceptances/rejections).

### Key Modules & Architecture
- **`qE` (AgentDirectoryService)**: The main service for interacting with the Coda-powered agent platform. It wraps the `VE` (CodaAgentDirectory provider) which makes the actual API calls.
- **`ME` (AgentOrderManager)**: Manages the local order of installed agents, providing optimistic updates and syncing changes with the backend.
- **`xx` (Autocorrect Model)**: The core of the spelling prediction engine. It orchestrates feature extraction and prediction.
- **`ZE` (AutocorrectCheckingServiceImpl)**: The service that wraps the `xx` model, handles token boundary checking, and decides when to trigger a prediction.
- **`Tx` (NN Classifier Wrapper)**: Wraps the ONNX.js inference session for the spelling prediction model.
- **`ax`, `sx`, `ox` (Feedback System)**: A three-tiered system for handling feedback. `sx` is the in-memory session data, `ox` persists it to `chrome.storage`, and `ax` provides the logic for when to reject suggestions based on feedback history.
- **`TE`, `mE`, `hE`**: Logic for showing a welcome page on install, with special handling for users identified as coming from Superhuman.
- **`DE` (Profiler)**: A small performance profiler to measure execution time of functions.

### Evidence
- `js/Grammarly-bg.beautified.js:62330-63050` (Coda Agent Directory Provider `zE`)
- `js/Grammarly-bg.beautified.js:63200-63800` (Autocorrect Prediction Engine `xx`)
- `js/Grammarly-bg.beautified.js:62100-62200` (Agent Order Manager `ME`)
## Chunk 33: Lines 64001-66000

### Summary
This chunk is a masterclass in building a declarative, type-safe UI rendering system in JavaScript, heavily influenced by functional programming principles and powered by the `io-ts` and `fp-ts` libraries. It defines the entire schema for the extension's user interface, from the lowest-level design tokens to complex, interactive components. The core of this system is a comprehensive `io-ts` schema that defines all possible UI components (`Content`), their properties, and the actions they can dispatch (`YR`). This reveals a highly sophisticated, data-driven UI architecture.

### Findings

- **Libraries**:
  - **`io-ts`**: Used extensively to create a custom `Decoder` module (`LT`) for runtime type validation of all UI-related data structures. This forms the backbone of the declarative UI system.
  - **`fp-ts`**: The functional programming style and data structures (like `Eq` for type-safe equality) are used throughout.

- **Declarative UI & Design System**:
  - **Massive Design System**: A vast collection of UI constants and enums are defined, codifying the entire visual language.
    - **Color Palette**: Hundreds of named color variables are defined, including a "V6" semantic color system (e.g., `V6_SemanticBackgroundBaseDefault`, `V6_SemanticTextCriticalDefault`).
    - **UI Enums**: Dozens of `enum`-like objects define all possible variants for UI properties like button types (`nR`), icon names (`dR`), animations (`QP`), text sizes (`vR`), and spacing (`_R`).
  - **Component Schema (`dN`, `hN`)**: A massive, recursive `io-ts` schema defines every possible UI component. This includes over 50 component types for layout (`row`, `column`, `box`), text (`text`, `icon`), interaction (`button`, `gButton`, `slider`), cards (`assistantCard`, `inlineCard`), and data display (`list`, `progressBar`).
  - **Native UI Bridge**: The schema includes numerous `native*` components (e.g., `nativeSkillsModal`, `nativeToneInsightsModal`, `nativePerformanceScoreButton`), which act as bridges to UI rendered by a native shell, confirming the hybrid nature of the application.

- **Action and Behavior System**:
  - **Actions (`YR`)**: Defines over 40 distinct, type-safe user actions that can be dispatched from the UI (e.g., `openSettings`, `applyAlerts`, `copyToClipboard`, `pushAssistantFeed`). Each action has a strictly defined payload schema using `io-ts`.
  - **Behaviors (`zD`)**: Defines dynamic behaviors that can be attached to components, such as animations (`fadeIn`, `textShimmer`), lifecycle hooks (`onMount`, `onUnmount`), and popover anchoring.

### Risks
- No new risks identified in this chunk. The code demonstrates a strong emphasis on type safety and structured design, which generally reduces risks related to UI state management.

### Obfuscation Hints
- **TypeScript Generated Enums**: The pattern of using plain JavaScript objects to emulate TypeScript `enum`s is prevalent throughout this chunk (e.g., `YP`, `ZP`, `JP`). This is a common artifact of TypeScript-to-JavaScript compilation.

## Chunk 34: Lines 66001-68000

### Summary
This chunk builds directly on the declarative UI framework from the previous section by introducing two critical utility systems: a powerful tree traversal/manipulation engine for the UI component tree, and a comprehensive Data Loss Prevention (DLP) and sanitization service. This reveals a mature and robust architecture designed for security and complex state management.

### Findings

- **UI Tree Manipulation (`KR`)**:
  - A dedicated module (`KR`) is defined to work with the "SDUI" (Structured Declarative UI) component tree.
  - It provides a rich set of functional utilities for traversing and manipulating the tree, including `forEach`, `map`, `reduce`, `filter`, `findFirst`, and `compact`.
  - It supports both pre-order and post-order traversal (`TreeTraversal`).
  - It includes specific functions for working with UI components, such as `getAlertIds`, `setPopoverView`, and `switchViewStack`. This demonstrates a highly structured approach to managing UI state.

- **Data Loss Prevention (DLP) and Sanitization Service (`Pj`)**:
  - A sophisticated DLP service (`Pj`) is implemented to find and sanitize sensitive information.
  - **Regex-based Detection**: It uses a default configuration (`Oj`) of regex patterns to detect common sensitive data types, including:
    - `email`, `url`, `creditCardNumber`, `phoneNumber`, `usSSN`, `caSSN`, `ukSSN`, `iban`.
  - **Sanitization Process**:
    - When a sensitive string is found, it's replaced with a sanitized token (e.g., `[DLP:Email:1]`).
    - It maintains a `_sensitiveToSanitizedMap` and `_sanitizedToSensitiveMap` to allow for reversible sanitization.
  - **Broad Application**: The service is designed to sanitize data within:
    - Plain text (`sanitizeText`).
    - `quill-delta` objects (`sanitizeDelta`).
    - The entire SDUI component tree (`sanitizeSdui`).
    - External message schemas, indicating it's used on data before it's sent to APIs.
  - **`quill-delta` Integration**: The service explicitly handles `quill-delta` objects, showing deep integration with the Quill rich text editor's data format.

### Risks
- No new risks identified. The presence of a robust, centralized DLP service is a significant security-positive finding, indicating a strong focus on preventing data exfiltration, likely for enterprise or business customers.

### Obfuscation Hints
- **Minified Variables**: Standard minified variables (`e`, `t`, `n`, `r`) are used throughout.
- **Webpack Modules**: The code continues to use `__webpack_require__` to import modules like `quill-delta` (`Qu`).

## src/js/Grammarly-bg.beautified.js [chunk 35/46, lines 68001-70000]

### Summary
This chunk reveals the core of the extension's real-time communication architecture: a sophisticated, resilient WebSocket-based system with an application-level session protocol called "CAPI" (Client API). This layer is deeply integrated with the Data Loss Prevention (DLP) service, ensuring that data is sanitized before being transmitted. The system is designed for stability, with a finite state machine managing the connection lifecycle and a robust reconnection strategy featuring exponential backoff.

### Key Findings

1.  **DLP-Sanitizing WebSocket Wrapper (`Rj`, `Dj`)**:
    *   A wrapper (`Rj`) is created around the standard WebSocket handler to intercept and sanitize messages.
    *   The `Dj` class acts as a factory for this wrapper, instantiating the `Pj` DLP sanitizer and applying it to both inbound (`unsanitizeMessage`) and outbound (`sanitizeMessage`, `sanitizeStaticMessage`) traffic. This confirms that the DLP sanitization discovered in the previous chunk is applied to network communication.

2.  **Generic Finite State Machine (`Gj`)**:
    *   A powerful, generic finite state machine (FSM) is implemented to manage complex states. It supports states, events, transitions, parent states (for hierarchical state machines), and event listeners.
    *   This FSM is used to manage the WebSocket connection's lifecycle (`CONNECTING`, `CONNECTED`, `DISCONNECTED`, `CLOSED`).

3.  **Core WebSocket Handler (`iF`)**:
    *   This class is the primary manager for WebSocket connections.
    *   It uses the `Gj` FSM to track and control the connection state.
    *   It handles all low-level WebSocket events (`onopen`, `onclose`, `onmessage`, `onerror`).
    *   It provides a clean interface for higher-level modules to interact with the connection (`connect`, `onConnect`, `onDisconnect`, `onMessage`).

4.  **WebSocket Reconnection Logic (`Jj`)**:
    *   A sophisticated reconnection module provides strategies for handling dropped connections.
    *   It defines multiple WebSocket close codes (e.g., `NORMAL_CLOSURE`, `SERVICE_RESTART`, `UNAUTHORIZED`) and implements logic to decide whether to reconnect.
    *   It features a `defaultRetryPolicy` with exponential backoff to avoid overwhelming the server.
    *   The `ReconnectSchedulerImpl` manages the timing and execution of reconnection attempts.

5.  **CAPI (Client API) Protocol (`KF`)**:
    *   This is a high-level, application-specific protocol built on top of the WebSocket connection.
    *   It manages the session lifecycle, including `start`, `reconnect`, and `close`.
    *   It uses its own FSM (`XF`) to track session state (`DISCONNECTED`, `CONNECTING`, `CONNECTED`, `SESSION_INBOUND`).
    *   It handles message sequencing and acknowledgment, ensuring reliable communication.
    *   It supports client capabilities negotiation (`clientSupports`) and can resume sessions using `reconnectInfo`.

6.  **CAPI Message Queue (`UL`)**:
    *   A critical component of CAPI, this queue manages outgoing messages (`changes`).
    *   **Chunking**: It can automatically split large messages (specifically `change` deltas) into smaller chunks to respect the server's `maxMessageSizeKb`.
    *   **Staging & Ack**: It stages operations and waits for acknowledgments (`ackOperation`, `ackRevision`) from the server before committing them.
    *   **Delta Transformation**: It has methods (`transformAlertAgainstQueue`, `transformAttentionHeatmapAgainstQueue`) to rebase or transform pending alerts and data against the deltas currently in the queue. This ensures that data displayed to the user remains consistent with text that is still being processed and sent to the server.

### Risks & Obfuscation
*   **Complexity**: The networking stack is extremely complex, involving multiple layers of abstraction (WebSocket -> FSM -> CAPI -> Message Queue). This makes it difficult to trace the exact flow of data without a deep understanding of the entire architecture.
*   **Obfuscation**: Variable names are heavily minified (`Rj`, `Dj`, `Gj`, `iF`, `KF`, `UL`), requiring careful analysis to deduce their purpose from their implementation and interactions.

### Connections to Other Modules
*   **DLP Service (`Pj`)**: The DLP service is directly and fundamentally integrated into the WebSocket communication pipeline via the `Dj` factory, ensuring all data is sanitized.
*   **Delta/OT (`Qu`, `yj`)**: The CAPI message queue (`UL`) is built to handle and transform `quill-delta` objects, showing the deep integration of the OT system with the networking layer.
*   **SDUI**: The `replaceInSdui` function in `Tj` (from the previous chunk) is used to sanitize SDUI trees before they are sent over the wire, connecting the UI, DLP, and networking layers.

### Evidence
*   `Rj` (DLP-Sanitizing WebSocket Handler): lines 68315-68385
*   `Dj` (DLP Sanitizer Factory for WS): lines 68388-68485
*   `Gj` (Finite State Machine): lines 68488-68701
*   `Jj` (WebSocket Reconnection Logic): lines 69000-69180
*   `iF` (Core WebSocket Handler): lines 69182-70000
*   `KF` (CAPI Protocol Implementation): lines 69600-69990
*   `UL` (CAPI Message Queue): lines 69811-69985
## src/js/Grammarly-bg.beautified.js [chunk 36/46, lines 70001-72000]

### Summary
This chunk presents two of the most critical architectural components of the extension: the CAPI client implementation (`cG`) and the CS-to-BG RPC API (`CG`). The `cG` class is the concrete implementation of the CAPI protocol, orchestrating the entire real-time communication with the server. The `CG` class creates a massive RPC (Remote Procedure Call) interface, exposing a vast number of the background script's services and functions to content scripts, acting as the primary bridge between the page and the extension's core logic. This chunk also details a complete OAuth 2.0 authentication client for managing user login.

### Key Findings

1.  **CAPI Client Implementation (`cG`)**:
    *   **State Management**: This class is the master controller for the CAPI connection. It uses the FSM (`Gj`) to manage its lifecycle (`DISCONNECTED`, `CONNECTING`, `CONNECTED`, `WAITING_FOR_OT`, `SESSION_INBOUND`, `CLOSED`).
    *   **Message Queuing**: It instantiates and uses the `UL` message queue to manage all outgoing traffic. It handles pushing changes and commands, respecting send delays, and triggering sends.
    *   **Session Orchestration**: It manages the session start (`_startSession`), handles new vs. existing sessions (`_handleNewSession`, `_handleExistingSession`), and processes all incoming messages from the server (`_handleMessage`).
    *   **OT Integration**: It is deeply integrated with the OT system. It processes `submit_ot` acks, handles chunked OT submissions, and uses the queue's transformation capabilities to keep data consistent.
    *   **Error Handling**: It defines comprehensive error handling for various server responses and connection states.

2.  **CS-to-BG RPC API (`CG`)**:
    *   **RPC Channel**: This class establishes a remote procedure call interface for content scripts to communicate with the background script. The communication channel is explicitly named `cs-to-bg-rpc-1557421403805`.
    *   **Massive API Surface**: It exposes a huge number of background services and functions to content scripts. This is the primary mechanism for UI elements or in-page logic to trigger background operations.
    *   **Exposed Services**: The RPC API provides access to:
        *   **Core**: Logging, time, logout, uninstall.
        *   **Data/Settings**: `persistentStore`, `settingsActions`, `pageConfig`, `cheetahSettingsService`, `dataSharingService`.
        *   **Backend Services**: `dictionaryService`, `snippetsService`, `apiService`, `knowledgeHubBGService`, `dapiService`, `institutionAdminService`, `translateService`, `specialOfferService`.
        *   **Features**: `autocorrectApi`, `touchTypistBgService`, `humanWritingReport` (all services).
        *   **Experiments/Gating**: `experimentClient`, `bgGatesService`.
        *   **Authentication**: `authFlowClient`.
        *   **Chrome APIs**: Proxies calls to `extensionApi` for actions like `openDataControl` and `reload`.

3.  **OAuth 2.0 Authentication Client (`mG`, `bG`)**:
    *   **Implementation**: A full OAuth 2.0 client is implemented to handle user authentication.
    *   **Interactive Flow**: The `bG` class manages the interactive login flow. It uses `chrome.identity.getRedirectURL` to get the correct callback URL and `chrome.tabs.create` to open the authentication URL in a new tab.
    *   **Event Listeners**: It listens to `chrome.tabs.onUpdated` to detect the redirect back to the extension with the authorization code and `chrome.tabs.onRemoved` to handle cases where the user manually closes the auth tab.
    *   **Code Exchange**: It handles the redirect, extracts the authorization code and state, and uses the `_oauthClient` to exchange the code for an access token.

### Chrome APIs Used
*   `chrome.identity.getRedirectURL`: Used by the OAuth 2.0 client to get the correct redirect URI for the authentication flow.
*   `chrome.tabs.create`: Used to open the authentication page in a new tab.
*   `chrome.tabs.onUpdated`: Used to listen for the redirect from the auth server containing the authorization code.
*   `chrome.tabs.onRemoved`: Used to detect when the user closes the auth tab.
*   `chrome.tabs.remove`: Used to programmatically close the auth tab after the flow is complete.
*   `chrome.management.uninstallSelf`: Exposed via the RPC API to allow the extension to uninstall itself.
*   `chrome.tabs.getActiveTabZoom`: Exposed via the RPC API.

### Risks & Obfuscation
*   **Centralized RPC Hub**: The `CG` class is a massive, centralized hub that connects content scripts to almost every major service in the background script. Any vulnerability in this RPC mechanism could potentially expose a huge part of the extension's functionality.
*   **Dependencies**: The `cG` and `CG` classes have a very large number of dependencies injected into their constructors, indicating a high degree of coupling and complexity. This makes the code hard to reason about in isolation.

### Connections to Other Modules
*   **CAPI Protocol (`KF`, `UL`)**: The `cG` class is the concrete implementation and user of the CAPI protocol state machines and message queue defined in the previous chunk.
*   **All Services**: The `CG` class is the "glue" that connects almost every other service analyzed (DLP, OT, HWR, Autocorrect, Experiments, etc.) to the content scripts. It serves as the main entry point for requests originating from the web page context.

### Evidence
*   `cG` (CAPI Client Implementation): lines 70054-71850
*   `CG` (CS-to-BG RPC API): lines 71853-72000+
*   `mG`, `bG` (OAuth 2.0 Client): lines 71700-71850
*   `kG.rpcLegacyMessageName`: line 71852
## Grammarly-bg.js [chunk 37/46, lines 72001-74000]

### Summary
This chunk continues the definition of the massive `cs-to-bg-rpc` API, adding a large number of methods related to the "Agent Directory" service, authentication, debugging, and settings management. It also introduces a completely new RPC channel, `cs-to-bg-static-capi-rpc`, specifically for managing the CAPI WebSocket session from content scripts. A significant new feature introduced here is the **Snippets Service**, which includes a client for a "goldengate" backend API to manage text snippets for institutional users. The chunk also contains the implementation of a generic, observable-based RPC framework (`jG`, `WG`, `LG`) that appears to be the foundation for these complex RPC systems, supporting method calls, observables, and even proxying RPC servers themselves.

### Chrome APIs
- **`chrome.permissions`**: `contains`, `request`, `watchAdded`, `watchRemoved` - Used for checking and requesting optional host permissions for authentication.
- **`chrome.tabs`**: `executeScript`, `getActiveTab`, `getAllTabs`, `reload` - Used for loading content scripts, checking tab focus, and reloading tabs after updates.
- **`chrome.notifications`**: `create` - Used to show a notification to reload tabs after a major extension update.

### Messaging
- **`cs-to-bg-rpc-1557421403805` (continued)**:
  - **Direction**: `content->background`
  - **New Methods**:
    - **Agent Directory**: `agentDirectoryListAgents`, `agentDirectorySearchAgents`, `agentDirectoryCreateAgentInstance`, `agentDirectoryEditAgentInstance`, `agentDirectoryAddAgent`, `agentDirectoryRemoveAgentInstance`, and many more for managing "agents" and "packs".
    - **Auth**: `launchAuthFlow`, `checkAuthPermissions`, `requestAuthPermissions`, `getAccessToken`, `getCSRFToken`.
    - **Debugging/Internal**: `logClient`, `loadContentScript`, `enableHistoryLoggerUntil`, `getBGLogs`, `proxyMessageToDevtools`.
    - **UI/UX**: `openSidePanel`, `openPopupSettings`, `openSubscriptionPage`, `sendToPopup`.
    - **Settings**: `getUserGoExperience`, `getAlwaysAvailableAssistantSettings`.
    - **Offers/Uphooks**: `getSpecialOffer`, `getUphookHubConfiguration`.
- **`cs-to-bg-static-capi-rpc-1668544923207`**:
  - **Direction**: `content->background`
  - **Purpose**: Provides a static, non-observable RPC interface for controlling the CAPI WebSocket session.
  - **Methods**: `log`, `startSession`, `stopSession`, `sendFeedback`, `close`, `setSessionOption`, `ping`, `getStatus`.
- **`cs-to-bg-static-capi-observable-rpc-1668544923207`**:
  - **Direction**: `content->background`
  - **Purpose**: Provides an observable-based RPC interface for CAPI events.
  - **Methods**: `getStatusObs`, `getEventsObs`, `updateContextInfo`, `connect`.

### Endpoints
- **URL**: `https://goldengate.../snippets/v1/snippets`
- **Purpose**: A backend API for managing text snippets, folders, and settings for institutional users. The client (`JG`) supports GET, POST, PUT, and DELETE operations for snippets and folders, as well as CSV import/export.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code continues to use the Webpack module pattern.
- **Generic RPC Framework**: The code defines a highly generic and abstract RPC framework (`jG`, `WG`, `LG`) that uses RxJS Observables (`Ni.y`). This framework supports method calls, subscriptions to server-side observables, and proxying entire RPC servers (`FG`, `LG`). This level of abstraction can be a form of obfuscation, as it decouples the call site from the implementation.

### Risks
- **Type**: `other`
- **Severity**: `low`
- **Description**: The `cs-to-bg-rpc` API exposes an extremely large number of background functions to content scripts. This includes powerful methods like `getAccessToken` and `getCSRFToken`. While likely protected by other means, this large and powerful API surface increases the potential impact if a content script is ever compromised, as it provides a direct channel to manipulate core extension state and access sensitive data.

### Evidence
- **cs-to-bg-rpc continuation**: lines 72001-72168
- **cs-to-bg-static-capi-rpc definition**: lines 72169-72171, 73510-73526
- **Generic RPC Framework (jG, WG, LG)**: lines 72200-73509
- **Snippets API Client (JG, eB)**: lines 73528-73710
- **Extension Update/Install Logic**: lines 73712-73880
- **Settings Actions (HWR, G2, etc.)**: lines 73882-74000
## Grammarly-bg.js [chunk 38/46, lines 74001-76000]

### Summary
This chunk is a dense collection of service definitions, API clients, and data models that form a significant part of the extension's backend-for-frontend architecture. Key findings include:
1.  **Dynamic Configuration**: A massive, strictly-typed (`io-ts`) data structure (`OV`, `PV`, `RV`) defining dozens of feature flags and configuration settings for the entire extension. This includes configurations for nearly every feature seen so far (Autocorrect, GDocs, Proofit, ToneAI, Llama, DLP, V-bars, HWR, etc.). Logic (`MV`) is present to fetch this configuration from a remote server.
2.  **Iterable Integration**: A comprehensive service (`_z`) for integrating with **Iterable**, a marketing automation platform. This service handles fetching in-app messages, tracking user events (`track`, `trackInAppOpen`, `trackInAppClick`), and updating user profiles (`userUpdate`). It includes logic to fetch and refresh a separate JWT for the Iterable API via a "MISe" service (`yz`).
3.  **DAPI Service**: A service (`ZB`) and API client (`KB`) for the "DAPI" (Data API), which is used to load and save user properties from a `https://data.../api` endpoint.
4.  **CS RPC Clients**: The client-side implementations for the various RPC channels discovered earlier are defined here (`ZV`, `JV`, `QV`), providing the content script's entry point into the background script's APIs.
5.  **Other API Clients**: Clients for a dialect settings service (`tz`), an institution admin service (`az`), and the MISe service (`yz`) are also defined.

### Endpoints
- **DAPI**: `https://data.../api` - Used for loading and saving user properties.
- **Dialect Settings**: `https://capi.../api/configuration/language/v1/settings` - Fetches user's dialect settings.
- **Institution Admin**: `https://goldengate.../institution/api/institution/admin` - A rich API for institution admins to manage users, domains, SSO, etc.
- **MISe (for Iterable)**: `https://.../iterable/access/token` - Fetches a client access token for the Iterable API.
- **Iterable**: Multiple URLs under `appConfig.iterable.urls` for tracking events, updating users, and fetching in-app messages.
- **Dynamic Config**: A URL from `appConfig.url.dynamicConfigUrl` is used to fetch the main extension configuration.

### Messaging
- **`cs-to-bg-rpc-1557421403805`**: Client-side implementation (`ZV`) is defined.
- **`cs-to-bg-rpc-1587687052565`**: Client-side implementation (`JV`) for a legacy RPC channel is defined.
- **`cs-to-bg-static-capi-rpc-1668544923207`**: Client-side implementation (`QV`) is defined.

### Obfuscation Hints
- **Webpack Modules**: Standard webpack module structure.
- **Minified Vars**: Many single-letter variables are used, particularly within the data models and API clients.

### Risks
- **Type**: `tracking`
- **Severity**: `medium`
- **Description**: The extension has a deep and comprehensive integration with Iterable, a third-party marketing automation and user engagement platform. It tracks a variety of user interactions, including opening, clicking, and consuming in-app messages, and can update user profiles on the platform. This constitutes significant user behavior tracking for marketing purposes.

### Evidence
- **Store Actions (Settings)**: lines 74001-74180
- **DAPI Service & Client**: lines 74182-74320
- **Dialect & Institution API Clients**: lines 74321-74630
- **Iterable & MISe Services**: lines 74631-75190
- **CS RPC Client Implementations**: lines 75191-75400
- **Dynamic Config Data Models & Fetch Logic**: lines 75401-75900
- **Browser Icon/Badge Rendering Logic**: lines 75901-76000
## Grammarly-bg.js [chunk 39/46, lines 76001-78000]

### Summary
This chunk defines several core infrastructure components that are critical for the extension's UI, workflow orchestration, and data-driven operations. Key findings include:
1.  **UI Positioning Engine**: A sophisticated, declarative engine (`Aq`, `gq`) for positioning floating UI elements (popups, tooltips) relative to anchor elements. It supports complex origin points, margins, and dynamic repositioning strategies (like "flip" and "translate") to keep elements within the viewport. It contains predefined positioning rules for dozens of UI scenarios, including onboarding, login reminders, and Iterable messages.
2.  **Iterable In-App Message (IPM) Client**: The complete client-side logic for displaying and managing in-app messages from the Iterable marketing platform. This includes:
    *   A view manager (`Nq`) that creates and controls the `iframe` used to render the IPM, handles user interactions (clicks, closes), and sends tracking events (`inAppOpen`, `inAppClick`, `inAppConsume`) back to the background script via RPC.
    *   An orchestrator (`Lq`) that decides when to fetch and show messages based on application triggers (e.g., `UserSessionInitialized`, `PauseInTyping`). It implements complex business logic for rate-limiting, cooldowns (global and per-campaign), and filtering messages based on custom payload criteria like domain targeting.
3.  **Side Effect Manager**: A central orchestrator (`qq`) for managing application-level workflows in a decoupled manner. It allows registering "side effects" that are triggered by specific events (e.g., `bgFirstStart`, `activeTabChange`, `storeChange`, `alarm`). This system is the backbone for coordinating actions across different parts of the extension in response to internal and external events.
4.  **Experimentation Framework Client**: The client-side implementation for the A/B testing framework (`rH`, `oH`, `sH`). It handles fetching "treatments" (experiment variants) from a server, caching them in persistent storage with a TTL, and providing a `getTreatment` API to the rest of the application. This allows for robust feature flagging and experimentation.
5.  **Performance Telemetry System**: A detailed system (`MH`, `jH`) for capturing and sending granular performance metrics (e.g., `textInputLatencyV1`, `scrollLatencyV1`, `gButtonDisplay`). One consumer (`MH`) sends this data to a Databricks "performance" dataset, including rich metadata like domain, text length, and alert counts, indicating a strong focus on performance monitoring.

### Chrome APIs
- `identity.launchWebAuthFlow`: Used by the non-interactive auth flow client (`Wq`).
- `tabs.onActiveTabChange`, `tabs.onWindowOrActiveTabChange`: Used by the Side Effect Manager (`qq`) to trigger workflows.
- `alarms.onAlarm`: Used by the Side Effect Manager (`qq`) to trigger scheduled workflows.
- `managedStorage.get`: Used by the Client Controls service (`dH`) to load configuration from enterprise policies.

### DOM
- `document.getElementById`, `document.createElement`, `document.body.appendChild`: Used by the Iterable IPM view (`Nq`) to create and manage the `iframe` that displays the message.
- `iframe.contentWindow`: Used to access the document inside the IPM iframe to attach event listeners.
- `document.visibilityState`, `visibilitychange` event: Used to track page visibility for performance metrics (`OH`).

### Storage
- The experimentation framework uses persistent storage (`rH`) to cache experiment treatments and gates, reducing server requests. Keys include `experimentationGatesTreatments` and `experimentationTreatments`.
- It also reads `experimentOverride` from storage to allow developers to force certain experiment groups.

### Risks
- **Type**: `tracking`
- **Severity**: `medium`
- **Description**: A comprehensive performance telemetry system is in place, sending detailed metrics about user interactions (text input latency, scroll latency, alert interactions) and application performance to a Databricks dataset. This includes metadata like domain, text length, and alert counts, which provides deep insight into user behavior and application usage patterns.

### Evidence
- **UI Positioning Engine**: lines 76001-76550
- **Iterable IPM Client (View & Orchestrator)**: lines 76551-77580
- **Side Effect Manager**: lines 77581-77800
- **User Service & Auth Flow Client**: lines 77801-78300
- **Experimentation Framework Client**: lines 78301-78800
- **Performance Telemetry System**: lines 79000-79500
## Grammarly-bg.js [chunk 40/46, lines 78001-80000]

### Summary
This chunk is almost entirely composed of `io-ts` schema definitions for the various CAPI (Client API) protocols, which are the data contracts for real-time communication with the backend. It provides a highly detailed, static type-safe view of the extension's most advanced features. Key findings include:
1.  **Performance Telemetry Schemas**: It continues the definition of the performance telemetry system from the previous chunk, providing the exact `io-ts` schemas (`qH`, `HH`) for metrics like `gButtonDisplay`, `textInputLatencyV1`, and `httpRequestLatency`. This confirms the structure of the data being sent for performance monitoring, including dimensions like `integrationName`, `textLength`, `domain`, `browserName`, and `os`.
2.  **Performance Timer Implementation**: A `PerformanceTimer` class (`KH`) is defined, which is a static utility for measuring the duration of operations. It uses `performance.mark` and `performance.measure` in development environments and sends the collected metrics to consumers like the Femetrics and Databricks clients. It also includes logic to handle cases where the page is hidden during a measurement.
3.  **"Cheetah" Generative AI Protocol**: A massive and detailed protocol definition for the "Cheetah" generative AI agent (`f$`, `j$`). This is the core of Grammarly's generative AI features. The schemas define every possible message, including:
    *   **Requests**: `cheetah:getContext`, `cheetah:action`, `cheetah:setVoice`, `cheetah:interrupt`.
    *   **Responses**: `cheetah:setContext`, `cheetah:chunk` (for streaming results), `cheetah:result`, `cheetah:error`.
    *   **Data Structures**: Defines complex structures for prompts, actions (`I$`), context (`P$`), results (`U$`), voice/tone profiles (`xX`), and user state (`EX`).
4.  **Generic Agent Protocol**: A protocol for a generic agent (`vW`), likely a precursor or a parallel system to Cheetah. It defines actions like `agent_generic:request`, `agent_generic:response`, and `agent_generic:error`.
5.  **File Upload Assistant Protocol**: A protocol for a file upload assistant (`BW`), defining the multi-step flow for uploading a file and processing it. Actions include `assistant_file_upload:uploadUrlRequest`, `assistant_file_upload:uploadUrlResponse`, `assistant_file_upload:processFile`, `assistant_file_upload:success`, and `assistant_file_upload:error`.
6.  **CAPI Connection Manager**: The implementation of the CAPI connection manager (`YX`, `ZX`). This class is responsible for managing the WebSocket connection, handling reconnect logic (`ReconnectSchedulerImpl`), and orchestrating the CAPI session lifecycle. It wraps the raw WebSocket connection and exposes a higher-level `client` API.

### Risks
- **Type**: `tracking`
- **Severity**: `medium`
- **Description**: The performance telemetry system is further detailed, with specific data schemas (`qH`) for metrics like `gButtonDisplay`, `textInputLatencyV1`, and `httpRequestLatency`. These schemas define the exact dimensions and metadata sent to the analytics backend, confirming a deep level of user interaction and performance tracking.

### Obfuscation Hints
- **Webpack Modules**: Standard webpack module structure.
- **Minified Vars**: Extensive use of single-letter variables, especially in the protocol definitions.

### Evidence
- **Performance Telemetry Schemas & Timer**: lines 78001-78500
- **CAPI Protocol Schemas (Generic Agent, File Upload)**: lines 78501-79000
- **"Cheetah" Generative AI Protocol Schemas**: lines 79001-79500
- **CAPI Connection Manager Implementation**: lines 79501-80000
## src/js/Grammarly-bg.beautified.js [chunk 41/46, lines 80001-82000]

### Summary
This chunk is heavily focused on defining `io-ts` schemas for several key communication protocols and implementing the services that use them. It introduces the "pushed_content" protocol, a comprehensive system for the server to render dynamic UI elements like rewrite cards, plagiarism warnings, and upsell hooks directly in the client. It also defines protocols for trusted rewrites, user feedback, and monetization UI. The chunk includes the implementation of a high-level RPC API over the CAPI WebSocket connection, a data sharing service for managing user privacy settings, and a handler for Apple In-App Purchases. Finally, it contains a large, hardcoded configuration object that tailors the extension's behavior for specific websites.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- **`pushed_content` Protocol**: A rich, server-driven UI protocol for rendering various cards and notifications. Actions include:
  - `pushed_content:pushedContent`: Delivers a UI element (e.g., `rewriteCard`, `plagiarismCard`, `uphookRewriteCard`, `vBar`).
  - `pushed_content:executeAction`: Client requests to execute an action on a pushed element.
  - `pushed_content:updateSettings`: Client updates settings related to the pushed content.
- **`trusted_rewrite` Protocol**: A protocol to manage text ranges that have been approved by the user and should not be re-checked.
  - `trusted_rewrite:prime`: Marks a text range and rewrite as trusted.
  - `trusted_rewrite:forget`: Invalidates a trusted range.
- **`vbar_feedback` Protocol**: A protocol for submitting user feedback on suggestions.
  - `vbar_feedback:vBarFeedbackRequest`: Sends feedback from the client.
- **`vbars_lockedui` Protocol**: Manages the UI for premium/locked features.
  - `vbars_lockedui:updateFreeUnlocks`: Server updates the number of free unlocks available.

### Storage
- **Storage Message Handler (`VJ`)**: Implements a handler for storage operations (`storage:get`, `storage:save`, `storage:clear`) received over the CAPI WebSocket connection, bridging the remote requests to the local storage implementation.
- **`blocklistConfigMetadata`**: The service reads and writes metadata related to the domain blocklist configuration from the persistent store.

### Endpoints
- **`https://gateway/privacy/v1/api/data-sharing/`**: Used by the `DataSharingService` (`ZJ`) to get and update user and institution data sharing settings. (Evidence: lines 81818-81821)

### Dynamic Code/Obfuscation
- **Minified Variables**: Extensive use of single-letter or short, non-descriptive variable names (e.g., `e`, `t`, `n`, `r`).
- **Function Chains**: Complex logic is built through chained function calls and compositions, typical of `fp-ts`.
- **`io-ts` Schemas**: The majority of this chunk consists of `io-ts` schema definitions, which, while providing structure, are highly abstract and require careful interpretation.

### Risks
- **Server-Driven UI**: The `pushed_content` protocol allows the server to dynamically render a wide variety of UI elements, including upsell hooks (`uphookRewriteCard`) and promotional content. While powerful, this could be used to display unexpected or intrusive advertising.

### Key Implementations
- **Denali CAPI RPC API (`XJ`)**: A class that wraps the low-level CAPI WebSocket client (`YX`, `ZX`) to provide a high-level RPC-style API. This simplifies interactions for features like requesting synonyms, sending feedback, and managing checks.
- **Data Sharing Service (`JJ`)**: A service responsible for fetching and updating user privacy settings from the Grammarly backend. It uses the `gateway/privacy/v1/api/data-sharing/` endpoint.
- **Subscription Service Handler (`tQ`)**: A handler for native messaging that processes requests related to user subscriptions, with specific logic for Apple In-App Purchases (e.g., `CHECK_APPLE_SUBSCRIBE_ELIGIBILITY`, `SUBSCRIBE_APPLE_RECEIPT`).
- **Domain-Specific Configuration (`uQ`, `dQ`)**: A large, hardcoded object that defines custom behavior for the extension on various websites. For example, it disables certain features on `chrome.google.com` and `facebook.com/notes`, and enables special modes for `docs.google.com`.

### Evidence
- `src/js/Grammarly-bg.beautified.js:80255-80583`: Definition of the `pushed_content` protocol, including all card types (`rewriteCard`, `plagiarismCard`, `uphookRewriteCard`, etc.).
- `src/js/Grammarly-bg.beautified.js:80061-80128`: Definition of the `trusted_rewrite` protocol.
- `src/js/Grammarly-bg.beautified.js:81578-81758`: Implementation of the `DenaliCapiRpcApi` (`XJ`), which provides a high-level interface over the CAPI client.
- `src/js/Grammarly-bg.beautified.js:81815-81858`: Implementation of the `DataSharingService` API client (`ZJ`).
- `src/js/Grammarly-bg.beautified.js:81918-81998`: The large, hardcoded `pageConfig` object (`uQ`) defining site-specific behavior.
## Chunk 42: Lines 82001-84000 of Grammarly-bg.beautified.js

### Summary
This chunk is the heart of the background script's initialization process. It defines the main application class (`b0`) that orchestrates the startup of all core services. It also defines the services responsible for fetching dynamic configuration and user feature entitlements from remote servers, which are critical to the extension's dynamic nature.

### Key Findings

#### 1. Page Configuration Service (`_Q`, `yQ`, `SQ`)
- **`_Q` (PageConfigLoader)**: This class is responsible for loading the page-specific configuration. It fetches a JSON file from a CDN (`https://config.grammarly.com/browserplugin/v3/page_config.json`).
- **`yQ` (PageConfigService)**: Manages the loaded configuration, providing access to it for other parts of the extension. It uses `chrome.storage.local` to cache the configuration.
- **`SQ` (CDNBlocklistConfigSource)**: Acts as the source for the configuration, defining the URL and caching mechanism.
- **Purpose**: This system allows Grammarly to remotely control extension behavior on a per-domain basis without needing to publish a new version of the extension.

#### 2. Passport Service (Feature Entitlements) (`kQ`, `xQ`)
- **`kQ` (PassportClient)**: A client specifically for fetching the "Passport" object.
- **Endpoint**: It communicates with `https://goldengate.grammarly.com/passport/api/v1/passport`.
- **`xQ` (PassportService)**: Manages the user's Passport, which contains their feature entitlements (e.g., what AI features are enabled, what limits apply). It caches the Passport in `chrome.storage.local` under the key `passport`.
- **Purpose**: This is the core of Grammarly's monetization and feature-gating strategy. The Passport determines which features a user has access to based on their subscription level, institutional affiliation, or experiments they are in.

#### 3. Main Application Bootstrap (`b0`)
- **`b0` (Background App)**: This is the main class that orchestrates the entire background script. Its constructor initializes and wires together all the essential services.
- **Initialization Sequence**:
    1.  Initializes basic services like `Auth`, `Settings`, and `User`.
    2.  Initializes the `PageConfigService` and `PassportService`.
    3.  Initializes the `ExperimentationClient`.
    4.  Initializes the core communication stacks: `CAPI` (WebSocket) and `DAPI` (HTTP).
    5.  Sets up listeners for browser lifecycle events:
        - `chrome.runtime.onInstalled`: Handles new installations and updates.
        - `chrome.runtime.onStartup`: Handles browser startup.
        - `chrome.runtime.onConnectExternal`: Listens for connections from other extensions (potentially for integration).
        - `chrome.alarms.onAlarm`: Sets up and handles periodic tasks.
- **Side Effects**: The constructor also kicks off a number of "side effects," which are independent modules that run in the background, such as `createCheckForIdle`, `createHandleUserChanges`, and `createHandleDunningMessages`.

### Evidence
- **Page Config Service**: `Grammarly-bg.js`, lines 82004-82141
- **Passport Service**: `Grammarly-bg.js`, lines 82143-82369
- **Main App Bootstrap (`b0`)**: `Grammarly-bg.js`, lines 82444-83998
## Chunk 43: Lines 84001-86000 of Grammarly-bg.beautified.js

### Summary
This chunk is foundational, defining the core infrastructure for telemetry (logging, metrics, crash reporting) and creating a comprehensive abstraction layer over the Chrome Extension APIs. This abstraction handles differences between Manifest V2 and V3, ensuring consistent API calls across browser versions. A significant portion of the code is dedicated to defining a massive, auto-generated "gnar" client, which provides a strongly-typed interface for sending hundreds of specific analytics events.

### Key Findings

#### 1. Telemetry and Crash Reporting (`C0`, `E0`)
- **`C0` (Felog Client)**: A detailed client for sending telemetry data. It constructs payloads with static information (app version, environment, browser info) and dynamic context (user ID, session ID).
- **Endpoints**:
    - It sends general logs to a `/logv2` endpoint.
    - It sends crash reports to a `/crashv2` endpoint.
- **`E0` (Telemetry Call Provider)**: A wrapper around the `C0` client that also integrates with a "gnar" client for product metrics. It exposes a unified `call` method to dispatch different types of tracking events. It includes a retry mechanism (`A0`) for sending events.

#### 2. Background Environment Singleton (`x0`, `T0`)
- **`x0` (Background Environment)**: A singleton class (`getInstance`, `init`) that serves as the central hub for the background script. It holds references to all major services and APIs.
- **Initialization**: The `init` method sets up the singleton, initializes shared utilities, and performs a critical check: if core Chrome APIs (`chrome.tabs`, `chrome.runtime`) are missing (a known issue), it attempts to reload the extension.
- **Service Holder**: It holds the `browserApi`, `message` bus, and the `telemetryCallProvider`. It also has setters for the `experimentClient` and `productMetricsCSClient`.

#### 3. Browser API Abstraction Layer (`H0`)
- **Purpose**: This massive class (`H0`) is a crucial abstraction layer that wraps almost every Chrome Extension API used by the application. It detects the manifest version (`_isManifestV3`) and provides a unified interface.
- **Abstracted APIs**:
    - **`storage`**: Creates a `MigrationAwarePreferencesApiImpl` (`W0`) to handle data migrations. It wraps `chrome.storage.local` and provides a fallback `memory` storage (`L0`) if `chrome.storage.session` is not available (as in MV2). It also provides an implementation for `chrome.storage.managed` (`M0`).
    - **`scripting`**: Wraps `chrome.scripting.executeScript` (MV3) and `chrome.tabs.executeScript` (MV2) into a single `executeScript` method. Does the same for `insertCSS`.
    - **`action`**: Wraps `chrome.action` (MV3) and `chrome.browserAction` (MV2) to provide consistent methods like `setBadgeText`, `setIcon`, and `setTitle`.
    - **`tabs`**: Provides unified methods for `tabs.create`, `tabs.query`, `tabs.update`, `tabs.remove`, etc.
    - **`notifications`**: Wraps `chrome.notifications`.
    - **`cookies`**: Wraps `chrome.cookies`.
    - **`permissions`**: Wraps `chrome.permissions`.
    - **`sidePanel`**: Provides methods to `openSidePanel` and check for support, abstracting the `chrome.sidePanel` API.
    - **`i18n`**: Wraps `chrome.i18n`.
    - **`identity`**: Exposes `chrome.identity`.
    - **`runtime`**: Wraps `chrome.runtime.reload`, `setUninstallURL`, and `connectNative`.

#### 4. Gnar Analytics Client (`$0.gnarSpecClass`)
- **Generated API**: This class is an auto-generated client for the "gnar" analytics system. It contains over a hundred methods, each corresponding to a specific user or system event.
- **Strongly-Typed Events**: Each method is named descriptively (e.g., `alwaysOnAssistantAgentActivated`, `authHookButtonClick`, `assistantPopupShow`) and takes specific parameters, creating a strongly-typed schema for analytics.
- **Purpose**: This provides a robust and maintainable way to track detailed user interactions and system performance throughout the application, ensuring data consistency for analytics.

### Evidence
- **Telemetry Client & Endpoints**: `Grammarly-bg.js`, lines 84048-84145
- **Background Environment Singleton**: `Grammarly-bg.js`, lines 84338-84499
- **Browser API Abstraction (`H0`)**: `Grammarly-bg.js`, lines 84888-85861
- **Gnar Analytics Spec (`gnarSpecClass`)**: `Grammarly-bg.js`, lines 85864-86000+
## Chunk 44: Lines 86001-88000 of Grammarly-bg.beautified.js

### Summary
This chunk is a continuation of the massive, auto-generated `gnarSpecClass` used for analytics. It defines hundreds of highly specific methods for tracking user interactions with various features. The granularity of the tracking is extensive, covering actions from simple button clicks to complex feature workflows.

### Key Findings

#### 1. Continuation of Gnar Analytics Client (`gnarSpecClass`)
- The code exclusively consists of method definitions within the `gnarSpecClass`. Each method wraps a `this.gnar.track()` call, passing a structured payload with details about the event.
- The sheer number and specificity of these events indicate a very mature and detailed analytics strategy.

#### 2. Granular Feature Tracking
This chunk provides a clear view into which features are instrumented for analytics. Key features and interactions tracked in this section include:
- **Auto-Apply**: Tracking when suggestions are automatically applied, when the user looks at the alert, and when they revert the change (`autoApplyAcceptButtonClick`, `autoApplyAlertAlertLooked`, `autoApplyRevertButtonClick`).
- **Brand Tones**: Tracking the display of and interaction with the "brand tones" activation uphook (`brandTonesActivationUphookShow`, `brandTonesActivationUphookCTAButtonClick`).
- **Business Features**: Tracking sign-in prompts and interactions across different UI surfaces like the G-Button, inline cards, and toolbars (`businessGButtonSigninButtonClick`, `businessInlineCardSigninButtonClick`).
- **Citation Generator (`cite*`)**: Tracking the entire workflow of citation generation, from showing the button, to adding missing info, to copying the citation (`citePopupButtonShow`, `citePopupAddMissingClick`, `citeCopyButtonClick`).
- **Desktop Integration**: Tracking when the desktop integration is enabled, disabled, or when it redirects from GDocs (`desktopIntegrationEnabled`, `desktopIntegrationDisabled`, `desktopIntegrationGDocsRedirect`).
- **Dunning Messages**: Tracking the display and interaction with notifications related to billing issues (`dunningNotificationNotificationShow`, `dunningCTAButtonClick`).
- **Email Summarization**: Tracking the workflow for the email summarization feature (`emailSummarizationBadgeShow`, `emailSummarizationExpandButtonClick`, `emailSummarizationAcceptButtonClick`).
- **Ethical AI**: Tracking the triggering and interaction with "ethical AI" warnings, which appear to be related to sensitive content (`ethicalAIAlertTriggered`, `ethicalAIAssistantFullCardShow`).
- **GDocs Integration**: A large number of events are dedicated to tracking behavior specifically within Google Docs, including sidebar interactions, handling large documents, and showing feature-unavailable popups (`gdocsEditorInit`, `gdocsLargeDocumentPopupShow`, `gdocsSidebarShow`).
- **Handwriting Recognition (HWR)**: Detailed tracking of the HWR feature, including opt-in, plagiarism checks, and feedback submission (`hwrFeatureOptIn`, `hwrPlagiarismButtonClick`, `hwrFeedbackSubmit`).
- **In-Product Messages (IPM)**: A comprehensive suite of events to track the lifecycle of in-product messages, including triggers, display, clicks, and cooldowns (`ipmMessageTrigger`, `ipmMessageOpen`, `ipmMessageClick`, `ipmMessageCooldown`).
- **Knowledge Hub**: Tracking interactions with the "Knowledge Hub" feature, which seems to provide company-specific writing guidance (`knowledgeHubAlertPointPeopleClick`, `knowledgeHubOnboardingPopupShow`).

### Risks
- **Tracking**: The level of detail in the tracking is extremely high, creating a comprehensive record of user behavior. While likely used for product improvement, it represents a significant amount of data collection.

### Evidence
- **Gnar Analytics Spec Continuation**: `Grammarly-bg.js`, lines 86001-88000

## Chunk 45: Lines 88001-90000 of Grammarly-bg.beautified.js

### Summary
This chunk continues and concludes the massive, auto-generated `gnarSpecClass` used for analytics. It defines hundreds more highly specific methods for tracking user interactions. The final line of the file, `x0.init($0)`, executes the initialization of the entire background script environment, kicking off the extension's operations.

### Key Findings

#### 1. Completion of Gnar Analytics Client (`gnarSpecClass`)
- The code is exclusively method definitions for the `gnarSpecClass`, providing a strongly-typed API for analytics.
- This section covers tracking for a wide range of features, demonstrating the breadth of data collection.

#### 2. Granular Feature Tracking (continued)
Key features and interactions tracked in this section include:
- **Login/Signup/Logout**: Tracking the success and failure of login, signup, and logout forms (`logInFormSuccess`, `signUpFormFail`, `logoutFormSuccess`).
- **Onboarding**: A very detailed set of events for tracking the user onboarding experience, including popups, reminders, and step-by-step progress (`onboardingFollowupPopoverShow`, `onboardingStepOverlayShow`, `onboardingRemindMeLaterButtonClick`).
- **Snippets**: Tracking the entire lifecycle of the snippets feature, from creation and presentation to application (`snippetsFeatureInit`, `snippetsListPresented`, `snippetsSnippetApplied`).
- **Subscription & Monetization**: Tracking of subscription forms (success, failure), and various uphooks and popups (`subscriptionFormFail`, `subscriptionFormSuccess`, `premiumUphookButtonClick`).
- **Tone AI**: Tracking for the "Tone AI" rewrite feature, including when suggestions are shown, applied, and how the user interacts with the tone slider (`toneAIAlertUnderlineShow`, `toneAIAssistantFullCardReplacementApply`, `toneAIAssistantFullCardSliderMove`).
- **"vBar" (Vertical Bar)**: Extensive tracking of the generative AI features attached to the vertical bar, including card views, prompt submissions, rewrite applications, and user feedback (`vBarCardShow`, `vBarCardPromptSubmit`, `vBarCardRewriteApply`).
- **Welcome/Update Pages**: Tracking when the extension is installed, updated, or when welcome pages are shown (`install`, `update`, `welcomePageShow`).

#### 3. Final Initialization
- **`x0.init($0)`**: This is the final and most critical line in this section. It calls the static `init` method on the `x0` (background environment) class, passing the massive configuration object `$0` that was just defined.
- **Execution Start**: This single line triggers the entire initialization sequence of the background script: setting up the browser API abstractions, initializing the message bus, creating the telemetry clients, and starting all background services and listeners.

### Risks
- **Tracking**: This section completes the definition of the analytics client, which, as noted previously, tracks an exhaustive amount of user interaction data.

### Evidence
- **Gnar Analytics Spec Completion**: `Grammarly-bg.js`, lines 88001-90438
- **Background Script Initialization Call**: `Grammarly-bg.js`, line 90439

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js [chunk 1/8, lines 1-2000]

### Summary
This chunk contains the core of a sophisticated experimentation (A/B testing) and feature gating system. It defines clients for fetching treatments and gates from remote services (`treatment.grammarly.com`, `gates.grammarly.com`), logging user exposure, and dynamically configuring the application. It also includes a reactive state management library for handling application state and a telemetry/product metrics client that sends data to Grammarly's servers (`f-log-extension.grammarly.io`, `extension.femetrics.grammarly.io`). The code is structured as Webpack modules with minified variable names.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- `sessionStorage`: Used for backing up history logs.

### Endpoints
- `https://properties.grammarly.com`: To fetch application properties.
- `https://treatment.grammarly.com`: To get A/B testing treatments.
- `https://gates.grammarly.com`: To get feature gate statuses.
- `https://f-log-extension.grammarly.io`: For logging.
- `https://extension.femetrics.grammarly.io/batch/import`: For batch importing telemetry metrics.
- `https://api.iterable.com`: Used for in-app messaging and user updates.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code is bundled using Webpack.
- **Minified Variables**: Variable names are minified (e.g., `e`, `t`, `n`), indicating an obfuscated build process.

### Risks
- **Tracking**: The extension includes a comprehensive A/B testing and feature gating framework that reports user interactions and experiment exposures to Grammarly servers. This constitutes tracking of user behavior within the extension.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js:25-400
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js:1800-1900

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js [chunk 2/8, lines 2001-4000]

### Summary
This chunk defines a massive configuration object containing a large number of URLs for various Grammarly services, including authentication, API gateways, data services, logging, and settings. It also defines a shared environment for the content script, initializes logging services, and sets up telemetry. The code continues to be structured as Webpack modules.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- `https://data.grammarly.com`
- `https://auth.grammarly.com/v3`
- `https://auth.grammarly.com/v4`
- `https://auth.grammarly.com/v5`
- `https://capi.grammarly.com/api/configuration/cheetah/v1/settings`
- `https://gateway.grammarly.com/skills`
- `https://capi.grammarly.com`
- `https://coda.grammarly.com`
- `wss://capi.grammarly.com/freews` (WebSocket)
- `https://dox.grammarly.com/documents`
- `https://gateway.grammarly.com/passport/api/v1/passport`
- `https://config.extension.grammarly.com/dynamicConfig.json`
- `https://config.extension.grammarly.com/browserplugin/config.json`
- `https://rwsgfy.grammarly.com/stand-with-ukraine`
- `https://in-product.report.grammarly.io/v1/report`
- `https://gateway.grammarly.com/privacy/v1/api/data-sharing`
- `https://gateway.grammarly.com/vito`
- `https://gateway.grammarly.com/uhub`
- `https://gateway.grammarly.com/mise/api/v1`

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Minified Variables**: Variable names are minified.

### Risks
- None in this chunk.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js:2001-2200

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-check.js [chunk 3/8, lines 4001-6000]

### Summary
This chunk continues the definition of the massive telemetry and logging service started in the previous chunk. It defines a vast number of specific logging functions for different parts of the extension, including the side panel, popup, content scripts (`checkScript`), Google Docs integration, Gmail integration, auto-fix, auto-apply, knowledge hub, citation builder, and many others. The code demonstrates an extremely granular level of event tracking.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- The methods defined here are responsible for sending telemetry data to the background script (e.g., `this._send("bg.dataControl.accepted", ...)`), which then forwards it to Grammarly's servers.

### Storage
- None in this chunk.

### Endpoints
- The functions in this chunk trigger network requests indirectly by sending messages to the background script, which then communicates with the endpoints defined in the previous chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Minified variable names**: `e`, `t`, `n`, `r` are used extensively.
- **Function chains**: The entire structure is a large object with nested objects and methods.

### Risks
- **Tracking**: The sheer volume and specificity of the tracked events represent a significant privacy concern. Events tracked include:
    - UI interactions (`sidePanel.openFail`, `popupInitFail`, `cardShowAction`).
    - Feature usage (`gdocs.nonDocumentPage`, `autoFix.featureToggleClick`, `knowledgeHub.relatedMaterialsClick`).
    - Performance metrics (`performance.processInput`, `autocorrect.responseTime`).
    - Errors and exceptions (`unhandledBgPageException`, `csCrash`).
    - In-app marketing and onboarding (`iterable.iterableIPMOpen`, `onboardingPopupShow`).
    - User state (`loginReminderCanceled`, `logoutSuccess`).

### Evidence
- The entire chunk (lines 4001-6000) is evidence of this extensive telemetry system.
- `this._sendEvent(...)` and `this._sendFemetricsRate(...)` are the core functions used to dispatch tracking events.
- `this.sidePanel`, `this.popup`, `this.gdocs`, `this.autoFix`, `this.knowledgeHub`, `this.iterable` are all examples of modules with detailed tracking.

## src/js/Grammarly-check.beautified.js [chunk 4/8, lines 6001-8000]

### Summary
This chunk continues the extensive telemetry and logging object from the previous chunk. It adds hundreds more specific logging methods for various features and scenarios, reinforcing the extension's deep instrumentation for analytics and performance monitoring.

### Key Findings
- **Continuation of Telemetry**: This is a direct continuation of the `femetrics` logging object.
- **Granular Event Tracking**: Adds logging for very specific user actions and system events, such as:
    - `writingSuggestions` (e.g., `suggestionRendered`, `suggestionHidden`).
    - `assistant` interactions (`assistantOpened`, `assistantClosed`).
    - `settings` changes (`settingsOpened`, `settingsChanged`).
    - `auth` events (`authModalOpened`, `loginSuccess`).
    - `textServices` and `textInfo` for detailed text analysis metrics.
- **Performance Metrics**: Includes logging for performance-related events, like `longTask` and `inp` (Interaction to Next Paint), indicating a focus on monitoring and improving responsiveness.
- **Error and Exception Handling**: Defines logging for various error scenarios, including `unhandledRejection` and `uncaughtException`, categorized by the part of the extension they originate from (background, content, popup, etc.).
- **No New APIs/Endpoints**: This chunk is purely for defining the logging interface and does not introduce new Chrome APIs or network endpoints.

### Risks
- **Tracking**: The privacy risks associated with extensive tracking, as identified in the previous chunk, are amplified here with the addition of even more detailed event logging. The data collected provides a comprehensive picture of user behavior within the extension.

### Evidence
- src/js/Grammarly-check.js:6001-8000

## src/js/Grammarly-check.beautified.js [chunk 5/8, lines 8001-10000]

### Summary
This chunk is a mix of utility libraries and core extension logic. It includes a significant amount of RxJS helper functions, the full implementation of UAParser.js for browser fingerprinting, and the webpack runtime logic responsible for dynamically loading other parts of the extension. It also contains the logic for initializing the "Always Available Assistant" based on feature gates and handling updates or disposals of orphaned content scripts.

### Key Findings
- **RxJS Utilities**: A large portion of the code consists of operators and utilities for RxJS (Reactive Extensions for JavaScript), which is used for managing asynchronous data streams and events throughout the extension.
- **Browser Fingerprinting**: The code includes a full copy of **UAParser.js** (lines 8799-9803). This library is used to parse the browser's user-agent string to identify detailed information about the user's environment, including:
    - Browser (name, version, major)
    - CPU (architecture)
    - Device (vendor, model, type)
    - Engine (name, version)
    - OS (name, version)
- **Dynamic Loading (Webpack Runtime)**: The chunk contains the webpack runtime (`__webpack_require__`, `__webpack_require__.e`, `__webpack_require__.l`). This code manages the dynamic loading of JavaScript chunks and CSS files from the extension's package, allowing for features to be loaded on demand. It includes logic to inject scripts and stylesheets into the page.
- **Assistant Loader**: The `AlwaysAvailableAssistantLoader` class (`f` in minified code) is defined here. It checks feature gates (`AssistantInSidePanel`, `ReinitializeAssistantOnExtensionUpdate`) to determine if the main assistant should be loaded. It also handles the process of unloading "orphaned" content scripts when the extension is updated.
- **Chrome APIs**:
    - `chrome.runtime.getManifest()`: Used to get the current extension version.
    - `chrome.runtime.sendMessage()`: Used to request the injection of a script from the background page if dynamic import fails.
    - `chrome.runtime.getURL()`: Used to construct the correct path to extension resources (scripts, CSS).

### Risks
- **Fingerprinting**: The inclusion and use of UAParser.js is a clear form of browser fingerprinting. This technique can be used to create a unique or semi-unique identifier for a user's device, which can be used for tracking across different websites, even without cookies.
- **Tracking**: The data collected by UAParser.js is likely sent as part of the telemetry data stream, enriching the user profile with detailed information about their software and hardware configuration. This enhances the tracking capabilities identified in previous chunks.

### Evidence
- src/js/Grammarly-check.js:8799-9803 (UAParser.js)
- src/js/Grammarly-check.js:9804-10000 (Webpack runtime and Assistant Loader)

## src/js/Grammarly-check.beautified.js [chunk 6/8, lines 10001-12000]

### Summary
This chunk contains two major components: a sophisticated system for identifying editable fields on a webpage and a `TypingTracker` that monitors and reports detailed information about user keystrokes. It also includes a complete OAuth 2.0 client for handling authentication and token management.

### Key Findings
- **Editable Field Detection**: The code defines a comprehensive set of selectors and functions (`P.isSpecific`, `P.isGeneric`) to identify various types of rich text editors (CKEditor, Draft.js, Quill, ProseMirror, etc.) as well as standard `contenteditable` elements and `textarea`s. This allows the extension to determine where it can provide writing assistance.
- **TypingTracker (`Ie`)**: This is a significant feature that actively tracks user typing.
    - It listens for keyboard events on all identified editable fields.
    - It captures the typed text, the duration of typing, the length of the text, and the type of field being used.
    - It performs language detection on the typed text.
    - It sends this detailed typing data (`addTypingDurationMetric`) to a remote server for analytics.
- **OAuth 2.0 Client (`Mn`)**: A full-featured OAuth 2.0 client is implemented for managing user authentication.
    - It handles token acquisition, refresh, and exchange.
    - It uses `crypto.subtle.digest('SHA-256')` for creating PKCE code challenges.
    - It includes logic for storing tokens in a configurable storage backend (with an in-memory default) and uses a mutex lock (`acquireLock`) to prevent race conditions when multiple tabs are refreshing tokens simultaneously.
- **DOM Interaction**: The code heavily interacts with the DOM to find editable fields, listening for `focus` events and using `MutationObserver` to detect changes in the DOM that might add or remove editable areas.

### Risks
- **Tracking (High Severity)**: The `TypingTracker` is a powerful user activity monitoring tool. It captures not just that a user is typing, but *what* they are typing, how long they type for, and in what context. This is a very high level of tracking.
- **PII Exfiltration (High Severity)**: Because the `TypingTracker` captures the raw text being typed, it can easily collect Personally Identifiable Information (PII), financial data, health information, or any other sensitive content the user writes. This data is then sent to Grammarly's servers. While this is part of the core functionality of a writing assistant, the extent of the *analytic* tracking on this data poses a significant privacy risk.

### Evidence
- src/js/Grammarly-check.js:10001-10100 (Field detection logic)
- src/js/Grammarly-check.js:10250-10500 (TypingTracker implementation)
- src/js/Grammarly-check.js:11000-12000 (OAuth 2.0 client)

## src/js/Grammarly-check.beautified.js [chunk 7/8, lines 12001-14000]

### Summary
This chunk contains a vast amount of core infrastructure for the extension, acting as a bridge between the extension's application logic and the browser's APIs. It includes a complete OAuth 2.0 authentication client, a robust HTTP client with retry logic, abstractions for numerous Chrome APIs (storage, scripting, tabs, notifications, cookies, permissions), the content script injection and bootstrapping logic, and support for enterprise policies through managed storage.

### Chrome APIs
- **`chrome.storage.managed.get`**: Used to read enterprise policies set by an administrator.
- **`chrome.storage.session.*`**: A complete wrapper (`bi`) is implemented for the session storage API, which is a feature of Manifest V3.
- **`chrome.scripting.executeScript` / `chrome.scripting.insertCSS`**: Wrapped in a cross-version compatible class (`wi`) to inject scripts and styles into pages.
- **`chrome.runtime.connectNative`**: Used to connect to a native messaging host.
- **`chrome.notifications.*`**: A wrapper class (`Ri`) provides methods to create and manage system notifications.
- **`chrome.cookies.*`**: A full wrapper provides methods to get, set, remove, and watch for changes to cookies.
- **`chrome.permissions.*`**: A wrapper provides methods to request, query, and watch for changes in extension permissions.
- **`chrome.tabs.*`**: A comprehensive wrapper (`wi`) provides methods for creating, updating, removing, and querying tabs.
- **`chrome.action` / `chrome.browserAction`**: Used to control the toolbar button's state (icon, badge, title).

### Event Listeners
- **`port.onMessage` / `port.onDisconnect`**: Used for handling communication with the background script.
- **`chrome.runtime.onMessage`**: Listens for messages from other parts of the extension.
- **`chrome.windows.onFocusChanged` / `chrome.windows.onRemoved`**: Used to track window state changes.
- **`chrome.tabs.onActivated` / `chrome.tabs.onUpdated`**: Used to track the active tab and its status.
- **`chrome.cookies.onChanged`**: Listens for changes to cookies.

### Messaging
- **`message:to-priv`**: A channel used for content scripts to send messages to the background script.
- **`side-panel-close-status`**: A channel likely used to communicate the status of the side panel.
- **`message-bus-port`**: The name of the long-lived connection port for the message bus.

### Storage
- **`gr-oauth-key`**: The key for storing OAuth tokens in local storage.
- **`gr-oauth-service-state`**: Stores the state of the OAuth token service, including degradation timestamps.
- **`gr-oauth-state`**: Stores the state parameter and code verifier during the OAuth redirect flow.
- **Managed Storage Keys**: Reads several keys from managed storage for enterprise configuration, including `GrammarlyEnrollmentToken`, `GrammarlyBlockedClients`, and `GrammarlyBlockedDomains`.

### Endpoints
This chunk defines the complete set of OAuth 2.0 endpoints for production, pre-production, and QA environments:
- `https://auth.grammarly.com/v4/api/oauth2/authorize`
- `https://auth.grammarly.com/v4/api/oauth2/exchange`
- `https://auth.grammarly.com/v4/api/oauth2/token`
- `https://auth.grammarly.com/v4/api/revoke-by-refresh-token`
- `https://auth.grammarly.com/v4/api/userinfo`
- And corresponding URLs for `auth.ppgr.io` (pre-prod) and `auth.qagr.io` (QA).

### DOM/Sinks
- The content script bootstrapper (`Rr`) creates `script` and `link` elements to inject the main content script and its dependencies into the host page.

### Dynamic Code/Obfuscation
- **`chrome.scripting.executeScript`**: Used to dynamically execute functions and files in the context of a web page.
- **`chrome.scripting.insertCSS`**: Used to dynamically inject CSS.

### Risks
- **Complex Authentication Flow**: The extensive OAuth 2.0 implementation, while robust, presents a large and complex attack surface for potential vulnerabilities related to token handling, state management, and redirect validation.
- **Native Messaging**: The use of `connectNative` indicates the extension communicates with a native application installed on the user's machine. This is a powerful capability that, if compromised, could lead to significant security risks beyond the browser sandbox.

### Evidence
- OAuth 2.0 Client (`ur`): lines 12300-13000
- HTTP Client (`Jn`): lines 12185-12285
- Content Script Bootstrapper (`Rr`): lines 13208-13288
- Chrome API Wrappers (`Ri`, `wi`): lines 13510-13900

## src/js/Grammarly-check.beautified.js [chunk 8/8, lines 14001-14264]

### Summary
This final chunk serves as the main entry point and orchestrator for the content check script (`check.js`). It initializes all the core components analyzed in previous chunks, including the browser API wrappers, messaging system, and experiment client. It fetches A/B testing configurations, sets up a reactive state management pipeline using RxJS to listen for changes in user settings and authentication state, and ultimately decides whether to load the main content script (`Grammarly.js`) based on these states. It also contains logic for opening the side panel and popups, and notably, includes a mechanism to detect if other specific extensions (Microsoft Editor, Office) are installed.

### Chrome APIs
- **`chrome.sidePanel.open`**: Opens the extension's side panel.
- **`chrome.action.openPopup`**: Programmatically opens the extension's toolbar popup.
- **`chrome.runtime.reload`**: Reloads the extension.
- **`chrome.i18n.*`**: Used for internationalization, including detecting the page language and getting the browser's UI language.
- **`chrome.identity.*`**: Provides access to the user's identity.
- **`chrome.runtime.setUninstallURL`**: Sets a URL to be opened when the extension is uninstalled.
- **`chrome.runtime.connectNative`**: Re-exposed here for creating connections to native applications.
- **`chrome.storage.onChanged`**: Listens for changes in `chrome.storage.local`.

### Event Listeners
- **`chrome.runtime.onMessage`**: A listener is set up to handle dynamic code injection requests (`CODE_SPLITTING_INJECT`).

### DOM/Sinks
- **`#click-to-run`**: An event listener is attached to an element with this ID, likely on a success page, to allow the user to enable the extension on all websites.

### Risks
- **Fingerprinting**: The code explicitly checks for the presence of other extensions (`mseditor`, `office`) by trying to fetch their public resources. This is a form of environment fingerprinting that can be used to build a profile of the user's setup.

### Evidence
- Main initialization logic: lines 14084-14264
- Third-party extension check (`Ri.thirdPartyExtensionsData`): lines 14065-14083
- Side panel and popup logic: lines 14018-14038

## src/js/Grammarly.beautified.js [chunk 1/48, lines 1-2000]

### Summary
This initial chunk of the main content script (`Grammarly.js`) contains the Webpack bootstrapping code, a large set of color definitions used throughout the UI, and a comprehensive set of low-level utilities for manipulating the Quill editor's "Delta" data format. These utilities are fundamental for tracking and transforming document changes, forming the core of the text-editing experience.

### Chrome APIs
None in this chunk.

### Event Listeners
None in this chunk.

### Messaging
None in this chunk.

### Storage
None in this chunk.

### Endpoints
None in this chunk.

### DOM/Sinks
None in this chunk.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The file starts with the characteristic `__webpack_modules__` structure, indicating it's a Webpack bundle.

### Risks
None in this chunk.

### Evidence
- Webpack bootstrap and module definitions: lines 1-2000
- Delta manipulation utilities (`fast-diff`, `quill-delta`): lines 1000-2000

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js [chunk 2/48, lines 2001-4000]

### Summary
This chunk defines the core data models and management classes for alerts. It includes the `BaseAlert` class and its many subclasses (`PremiumAlert`, `PlagiarismAlert`, `DefaultAlert`, etc.), which represent different types of suggestions. It also defines `AlertRangeManager` and `AlertAlternativeManager` to handle the lifecycle of text ranges and suggestion alternatives. The chunk also contains a suite of custom React hooks (`useFocusTrap`), styling utilities, and geometric calculation helpers for positioning UI.

### Findings
- **Alert Data Models**: Defines the entire class hierarchy for different types of Grammarly alerts (`BaseAlert`, `DefaultAlert`, `PremiumAlert`, `PlagiarismAlert`, `TakeawayAlert`, `ShortenItAlert`, `ToneAIAlert`, etc.). Each class represents a specific type of Grammarly card or suggestion.
- **Alert Lifecycle Management**: Includes `AlertRangeManager` to manage the text ranges (highlights, replacements) associated with an alert and `AlertAlternativeManager` to manage different suggestion alternatives.
- **UI/Styling Utilities**: A comprehensive CSS-in-JS styling system (`TypeStyle`) is defined, with helpers for `px`, `rem`, colors, gradients, and a `focusOutline` utility for accessibility.
- **Custom React Hooks**: A significant set of custom React hooks is present, including a robust `useFocusTrap` for managing keyboard focus, and `useElWatcher`/`useRectWatcher` for observing DOM elements and their dimensions.
- **Quill Delta Operations**: Continues from the previous chunk with more advanced operations on the Delta format, such as `invert` and `transform`, crucial for undo/redo functionality.
- **Platform Abstraction**: Defines an abstraction layer (`PlatformEnvironment`) for interacting with the host environment (e.g., opening URLs).

### Obfuscation Hints
- **Webpack Modules**: The code continues to use the Webpack module bundling pattern.

### Risks
- None identified in this chunk.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js`: 2001-4000

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js [chunk 3/48, lines 4001-6000]

### Summary
This chunk contains a large number of predicate functions for determining the type and state of alerts (e.g., isCritical, isPlagiarism, isToneAI). It includes a factory function for creating alert objects, mock data generation functions for testing, and the core PositionManager class. The PositionManager is responsible for tracking text ranges and updating their positions when the document changes, using a delta-based update mechanism. It also defines a comprehensive set of constants for all possible UI actions and events.

### Findings
- **Alert State Predicates**: A large collection of boolean functions to check the state and type of an alert (e.g., `isApplied`, `isRemoved`, `isCritical`, `isPlagiarism`, `isToneAI`, `isShortenIt`, `isFreePremium`, `isLocked`).
- **Alert Factory & Mocks**: Contains a factory function `me.create` to instantiate the correct `Alert` subclass based on the raw CAPI alert data. Also includes functions (`generate`, `generatePlagiarism`) to create mock alert data for testing purposes.
- **Position Management**: Defines the `PositionManager` class, a critical component that tracks all registered text ranges. It uses a delta-based algorithm (`w` function) to update the start and end positions of ranges whenever the document text changes.
- **UI Action/Event Constants**: A comprehensive set of string constants is defined for every possible user interaction with the Grammarly UI, such as `alertApply`, `alertFeedback`, `bulkApply`, `toneAIChangeToneAlternative`, `openPreferences`, etc. This forms the basis of the application's event system.
- **Alternative Management**: Defines the `AlternativesManager` class (`m`), which handles the registration and deregistration of different suggestion alternatives for a given alert.

### Obfuscation Hints
- **Webpack Modules**: The code continues to use the Webpack module bundling pattern.
- **Minified Class/Function Names**: Classes like `PositionManager` are minified to single letters (e.g., `C`).

### Risks
- None identified in this chunk.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js`: 4001-6000
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js [chunk 4/48, lines 6001-8000]

### Summary
This chunk contains several major components: a comprehensive Data Loss Prevention (DLP) / PII sanitization module, a full-featured experimentation and feature gating client, a detailed model for document context (goals, audience, domain), and numerous DOM/geometry utilities.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- `https://properties.grammarly.com` (and `ppgr.io`, `qagr.io` variants): Used by the experimentation client to fetch feature properties. (Line 7638)
- `https://treatment.grammarly.com` (and `ppgr.io`, `qagr.io` variants): Used by the experimentation client to get A/B test group assignments. (Line 7638)
- `https://gates.grammarly.com/gates/get`: Used by the feature gating client to get the status of feature flags. (Line 7818)

### DOM/Sinks
- Extensive DOM geometry and element type checking utilities were found (`isLI`, `isP`, `getBoundingClientRect`, rectangle intersection/manipulation). These are foundational for positioning UI elements.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code continues to follow the Webpack module bundling pattern.
- **Minified Variables**: Variable names are heavily minified.

### Risks
- **Remote Code Configuration (`low`)**: The extension includes a sophisticated client for experimentation and feature gating (`ExperimentClient` at line 7366). This client fetches configuration from remote servers (`grammarly.com`, `ppgr.io`, `qagr.io`), which allows developers to remotely enable/disable features and change the extension's behavior for different user segments. While this is a standard practice for A/B testing, it represents a mechanism by which the extension's functionality can be altered without updating the extension itself.

### Notable Discoveries
- **DLP/PII Sanitization (`A` at 63288)**: A powerful module for identifying and scrubbing sensitive data. It uses a list of configurable regular expressions to find and replace PII like emails, URLs, credit card numbers, phone numbers, and national ID numbers (US SSN, CA SIN, UK NI NO). It supports both sanitizing (replacing sensitive data with placeholders) and unsanitizing (restoring the original data). This is likely used to prevent sensitive user text from being sent to Grammarly's servers.
- **Experimentation & Gating Client (`ExperimentClient` at 7366)**: A complete client for fetching A/B test assignments and feature flag statuses from remote services. This is a core component for controlling the extension's features and rolling out changes.
- **Document Context Model (`x` at 31008)**: Defines the context of the writing, including `domain` (academic, business), `goals` (inform, convince), `audience` (expert, general), `style` (formal, informal), and `dialect`. This is used to tailor the writing suggestions.
- **DOM/Geometry Utilities (`E` at 66006)**: A large library of functions for working with DOM element positions, dimensions, and intersections. This is crucial for accurately placing suggestion cards and other UI elements within the host page.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:6001-8000
- DLP/Sanitization: `src/js/Grammarly.beautified.js:63288`
- Experimentation Client: `src/js/Grammarly.beautified.js:7366`
- Document Context: `src/js/Grammarly.beautified.js:31008`
- Endpoints Config: `src/js/Grammarly.beautified.js:48730`

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js [chunk 5/48, lines 8001-10000]

### Summary
This chunk is almost entirely composed of a large, bundled portion of the RxJS library and a related reactive programming library, likely '@grammarly/focal'. This code provides the foundational framework for managing state and events throughout the application in a reactive manner.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code continues to follow the Webpack module bundling pattern.
- **Minified Variables**: Variable names are heavily minified.
- **Third-Party Libraries**: This chunk is dominated by the inclusion of the RxJS library.

### Risks
- None in this chunk.

### Notable Discoveries
- **RxJS Library**: A significant portion of the Reactive Extensions for JavaScript (RxJS) library is included here. This includes core classes like `Observable`, `Subject`, `BehaviorSubject`, `ReplaySubject`, and `Scheduler`.
- **Focal Library**: The code also includes what appears to be `@grammarly/focal`, a library built on top of RxJS that provides state management primitives like `Atom` (a reactive variable) and `Lens` (for focused, composable state updates).
- **Reactive Operators**: A vast number of RxJS operators are present, such as `map`, `filter`, `switchMap`, `concatMap`, `debounceTime`, `buffer`, `scan`, `withLatestFrom`, etc. These are the building blocks for creating complex asynchronous and event-based logic.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:8001-10000
- RxJS/Focal primitives: `Observable` (8867), `Subject` (62552), `Atom` (50806), `Lens` (18946)

## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js [chunk 6/48, lines 10001-12000]

### Summary
This chunk continues the large bundle of third-party and foundational libraries. It is dominated by the remainder of the RxJS library operators and introduces a comprehensive, feature-rich internal logging framework. It also contains low-level utilities for manipulating Quill-like delta objects, which are central to how the application represents document changes.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Webpack Modules**: The code continues to follow the Webpack module bundling pattern.
- **Minified Variables**: Variable names are heavily minified.
- **Third-Party Libraries**: This chunk is primarily composed of RxJS operators and a custom logging framework.

### Risks
- None in this chunk.

### Notable Discoveries
- **RxJS Operators (continued)**: This chunk contains a vast collection of RxJS operators, completing the inclusion of the library. This underscores the application's heavy reliance on reactive programming for managing state, events, and asynchronous operations.
- **Internal Logging Framework (`ue.Logging` at 64443)**: A sophisticated, in-house logging framework is defined. Its features include:
    - **Log Levels**: Standard levels like TRACE, DEBUG, INFO, WARN, ERROR.
    - **Sinks**: Pluggable output destinations. A `consoleLogger` is present, as well as a remote logging sink (`H` at 64443) designed to send JSON-formatted log events to a configurable URL.
    - **Rate Limiting**: A `RateLimitIndicator` class (`A` at 64443) is used to prevent log flooding.
    - **Metrics Integration**: The logging framework is integrated with a metrics system (`D.getRootMetric`) to count log events by level.
    - **Crash Reporting**: Includes functionality for buffered logging and sending a "crash log" containing recent events when a trigger condition (e.g., an ERROR-level log) is met (`ae` at 64443).
- **Quill Delta Utilities (30908)**: This module provides a rich set of tools for working with document change objects, known as deltas. It defines operations like `insert`, `delete`, and `retain`, and includes logic for composing, transforming, and iterating over these deltas. This is the core data structure for representing user edits and applying suggestions.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:10001-12000
- Logging Framework: `src/js/Grammarly.beautified.js:64443`
- Delta Utilities: `src/js/Grammarly.beautified.js:30908`

## [/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js] chunk 7/48, lines 12001-14000

### Summary
This chunk details the implementation of the `Alternative` class for managing text suggestions, including complex rebase and compose logic. It also defines the comprehensive data model for `Alerts`, including parsers (`fromAlertMessage`) and type guards for specialized alerts like Plagiarism, ToneAI, and Citations. A large number of enums define user interaction events (e.g., `ACCEPTED`, `IGNORE`, `APPLY`, `REVERT`). Finally, it includes the start of the bundled Popper.js library for UI positioning.

### Findings
- **DOM:** `getBoundingClientRect`, `getOffsetParent`, `getComputedStyle`
- **Third-party Libraries:** Popper.js
- **Obfuscation Hints:** `minified_vars`

### Evidence
- Lines 13800-14000
## [/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js] chunk 8/48, lines 14001-16000

### Summary
This chunk continues the bundled Popper.js library, including modifiers for `preventOverflow`, `arrow`, and `hide`. It also contains a large, declarative definition of the extension's UI component model. This model defines the schema for all UI elements, such as `ContentText`, `AssistantCard`, `PopoverStack`, various `gButton` types, `list`, `row`, `column`, `icon`, `image`, etc. This appears to be a comprehensive, in-house UI framework or view-model definition layer, likely used with a rendering library like React.

### Findings
- **Third-party Libraries:** Popper.js
- **Obfuscation Hints:** `minified_vars`

### Evidence
- Lines 14001-15000

## src/js/Grammarly.beautified.js [chunk 9/48, lines 16001-18000]

### Summary
This chunk continues the declarative definition of the UI component model. It specifies the schemas for many more components, including `Tooltip`, `ClickableText`, `Count`, `AlternativeChoice`, `Slider`, and numerous 'native' components (`nativeSkillsModal`, `nativeToneInsightsModal`, etc.). It also defines the data structures for user actions and behaviors that can be attached to these components. The code uses a custom type-checking or schema-definition library (likely minified `io-ts` or similar) to define every property of every component, from colors and sizes to complex nested content. This chunk reinforces the conclusion that the extension uses a highly structured, data-driven approach to building its user interface.

### Findings
- **UI Component Model**: Extensive definitions for UI components like `Tooltip`, `AlternativeChoice`, `Slider`, and various native modals.
- **Obfuscation Hints**: `minified_vars` are present throughout.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:16001-18000`

## src/js/Grammarly.beautified.js [chunk 10/48, lines 18001-20000]

### Summary
This chunk is dense with core logic. It finalizes the UI tree traversal utilities and defines a `dslRootParser` that uses a schema to validate the UI component tree, confirming a data-driven UI approach. It contains a comprehensive theme/color palette mapping semantic names to hex codes. A significant finding is the implementation of a Server-Driven UI (SDUI) system, complete with data structures (`Item`, `AlertId`) and a sophisticated `Diff` engine to efficiently apply updates from the server. The chunk also includes the `AlwaysAvailableAssistantLoader` class, which controls the loading and unloading of the main assistant based on feature flags and extension version updates. Finally, it details the `FieldIntegrationStore` and `TypingTrackerImpl` classes, which manage how Grammarly integrates with text fields and tracks user typing for metrics and language detection.

### Findings
- **UI Engine**: Contains a `dslRootParser` for validating the UI component tree against a schema.
- **Theming**: A large color palette is defined, mapping semantic color names (e.g., `V6SemanticBackgroundBaseDefault`) to hex values.
- **Server-Driven UI (SDUI)**: Implementation of an SDUI system, including data models (`Item`, `AlertId`) and a `Diff` engine for applying server-sent UI updates.
- **Assistant Lifecycle**: The `AlwaysAvailableAssistantLoader` class manages loading/unloading the assistant based on feature gates (`AssistantInSidePanel`) and version changes.
- **Field Integration**: The `FieldIntegrationStore` and `TypingTrackerImpl` classes are responsible for tracking and managing integrations with text fields on the page, including tracking typing events for analytics and language detection.
- **Obfuscation Hints**: `minified_vars` are present throughout.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:18001-20000`

## src/js/Grammarly.beautified.js [chunk 11/48, lines 20001-22000]

### Summary
This chunk is a massive collection of API wrappers and client-side business logic. It defines actions for modifying all parts of the extension's settings, including GDocs integration, Cheetah (generative AI), knowledge hub, user data sharing, and various uphooks and popups. It introduces a `Kt` class, a transport layer for RPC between frames/tabs. A significant portion is dedicated to a comprehensive wrapper around the Chrome Extension API (`un` class), abstracting away differences between Manifest V2 and V3 and providing a consistent interface for managing tabs, storage (local, session, managed), notifications, cookies, permissions, and i18n. It also includes the logic for the main application controller (`Kn` class), which initializes all integrations, manages the application lifecycle, and handles state updates from the persistent store.

### Findings
- **Chrome API Wrappers**: A comprehensive wrapper class (`un`) abstracts the `chrome.*` APIs for tabs, storage, scripting, notifications, cookies, permissions, i18n, and more. It handles differences between Manifest V2 and V3.
- **Application Controller**: The `Kn` class acts as the main application controller, responsible for initializing the extension, managing the lifecycle of page integrations, and responding to state changes.
- **State Management**: Defines numerous actions for modifying the extension's persistent state, covering a wide range of features like GDocs settings, Cheetah (AI) features, uphooks, and user preferences.
- **RPC Transport**: The `Kt` class provides a Remote Procedure Call (RPC) transport layer for communication between different parts of the extension (e.g., content script to background).
- **Performance Metrics**: Includes logic for measuring and reporting performance metrics like Interaction to Next Paint (INP).
- **Dynamic Code**: Uses `chrome.scripting.executeScript` for dynamic code injection.
- **DOM Manipulation**: Interacts with `document.body.dataset` to signal state to the DOM.
- **Storage**: Utilizes `chrome.storage.local`, `chrome.storage.session`, and `chrome.storage.managed`.
- **Obfuscation Hints**: `minified_vars` are present throughout.

### Evidence
- `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js:20001-22000`
## src/js/Grammarly.beautified.js [chunk 12/48, lines 22001-24000]

### Summary
This chunk contains extensive logic for the Always-On Assistant (AAA) and Cheetah (GenAI) integrations. It defines RPC channels for communication between the content script, the AAA notch, and the side panel. It includes an `ActiveTextFieldReporter` to keep the side panel updated on the active text field's state, focus, and alert counts. The `CheetahIntegrationBase` class provides the core logic for GenAI features within text fields, with specific implementations for `contenteditable` elements and `textarea`s. This chunk also reveals a native messaging connector, suggesting integration with a desktop application, and numerous feature gates for controlling AI agents (plagiarism, paraphraser, etc.) and various UI/UX flows.

### Chrome APIs
- `chrome.runtime.getManifest`: Used to get the extension version.
- `chrome.runtime.id`: Used to check if the script is an orphaned content script.
- `chrome.sessionStorage.get`: To retrieve `isSidePanelOpen`.
- `chrome.sessionStorage.set`: To store `alwaysOnAssistantOnOpenData` and `alwaysOnAssistant` notch position.
- `chrome.sessionStorage.onChange`: To listen for changes to `isSidePanelOpen`.
- `chrome.bgRpc.api.openSidePanel`: To programmatically open the side panel for the assistant.
- `chrome.bgRpc.api.isPermissionGranted`: Checks for `nativeMessaging` permission.
- `chrome.nativeMessaging`: Implied by the `Connector` logic, used to communicate with a native host application.

### Messaging
- `gr-fieldIntegration-to-aaaNotch-to-server`/`client`: RPC channel between the text field integration and the Always-On Assistant notch.
- `side-panel-to-cs-text-field-rpc_to-server`/`client`: RPC channel between the side panel and the content script's text field integration.
- `cs-text-field-to-side-panel-rpc_to-server`/`client`: Another RPC channel between the content script and the side panel.
- `setActiveTextFieldId`: Message sent to the side panel to inform it of the currently active text field, including alert counts.
- `unsetActiveTextFieldId`: Message sent to the side panel when a text field becomes inactive.

### Storage
- **sessionStorage**:
  - `alwaysOnAssistantOnOpenData`: Stores data needed when opening the side panel from the AAA notch (e.g., `assistantSessionId`, `agentId`).
  - `alwaysOnAssistant`: Stores UI state for the AAA, like the notch position.
  - `isSidePanelOpen`: A boolean flag indicating if the side panel is currently open.

### DOM
- `document.body.dataset.grAaaLoaded`: Attribute used to mark that the Always-On Assistant has been loaded into the page, storing the extension version.
- `document.body.dataset.grAaaNotchConnectionId`: A unique ID to establish a connection between the field integration and the AAA notch.

### Dynamic Code/Obfuscation
- **Minified variable names**: Widespread use of single-letter variables (e, t, n, i, r, o, etc.).
- **Function chains**: Complex logic is built through chained function calls and RxJS pipes.

### Risks
- **Native Messaging**: The presence of a `ForegroundConnectorServerImpl` and checks for `nativeMessaging` permission indicate communication with a native application installed on the user's machine. This expands the extension's capabilities beyond the browser sandbox and requires user trust, as the native component is not subject to the same security constraints as the extension.

### Evidence
- src/js/Grammarly.beautified.js:22001-24000
## src/js/Grammarly.beautified.js [chunk 13/48, lines 24001-26000]

### Summary
This chunk details a sophisticated system for feature flagging and performance monitoring. It includes logic for G2 vBars, Ghost Protocol, Human Writing Report (HWR), Knowledge Hub, and TouchTypist features, with availability determined by a complex combination of user type, domain, integration name, and numerous experiment flags. A `PerformanceTimer` class is used to collect and send detailed performance metrics (e.g., latency for text input, scrolling, HTTP requests) to backends like Femetrics and Databricks, using a sampling system to manage data volume. The code also uses `io-ts` for schema validation of these metrics. The `TouchTypist` feature has its own CAPI service and state management for real-time writing assistance.

### Chrome APIs
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### DOM
- None in this chunk.

### Dynamic Code/Obfuscation
- **Minified variable names**: Widespread use of single-letter variables.
- **Webpack Modules**: Code is organized into webpack modules.
- **Function chains**: Complex logic is built through chained function calls and RxJS pipes.

### Risks
- **Tracking**: The extension contains a detailed performance monitoring and metrics collection system (`PerformanceTimer`, `ProductMetricsClient`). It samples and sends various performance timers (e.g., `textInputLatencyV1`, `scrollLatencyV1`, `httpRequestLatency`) to backend services, including Databricks. This constitutes tracking of user interaction performance.

### Evidence
- src/js/Grammarly.beautified.js:24001-26000
## src/js/Grammarly.beautified.js [chunk 14/48, lines 26001-28000]

### Summary
This chunk details a sophisticated declarative UI framework, a client for the 'Iterable' marketing/telemetry platform, and the core alert processing and session statistics management systems. The `AlertProcessor` is responsible for rebasing alert positions as text changes, while the `SessionStatsManager` collects and reports detailed metrics on user interactions and feature performance. An `AutoApply` feature for automatically correcting text and providing an undo mechanism is also implemented.

### Chrome APIs
- `chrome.storage` (via `sessionStorage` backup mechanism)

### Event Listeners
- `message.on('sendCsLogsToPopup')`
- `message.on('downloadDebugReportsFromCS')`

### Storage
- `csHistoryLogs`: Backup of content script history logs to `sessionStorage`.
- `bgHistoryLogs`: Backup of background script history logs to `sessionStorage`.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- Webpack module pattern (`__webpack_require__`).
- Minified variable names.

### Risks
- **Tracking**: A comprehensive `SessionStatsManager` and a client for the 'Iterable' marketing platform collect and report a wide range of granular user interactions. This includes detailed statistics on text replacements (categorized by source, type, length), engagement with in-product messages (IPMs), and performance of the checking service. This data is sent to Grammarly's servers for analytics and marketing purposes.

### Evidence
- **SessionStatsManager**: `src/js/Grammarly.beautified.js:27115-27915`
- **Iterable Marketing Client**: `src/js/Grammarly.beautified.js:26056-26158`
- **AlertProcessor**: `src/js/Grammarly.beautified.js:27916-28991`
## src/js/Grammarly.beautified.js [chunk 15/48, lines 28001-30000]

### Summary
This chunk details the implementation of 'AutoApply' and 'Autocorrect' features, including a sophisticated 'CaretPreservingReplacementServiceDecorator' that captures keyboard events during text replacements to preserve user input. It also introduces a massive performance telemetry system with numerous profilers for various UI and processing latencies (resize, scroll, text input, alert processing, etc.). Additionally, it lays the groundwork for several major features: 'TouchTypist' (with its own UI and auto-opt-out logic), 'Human Writing Report' (with encryption and storage clients), 'Inkwell' integration, and a deep linking service.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `document.addEventListener('keydown')`
- `document.addEventListener('keypress')`

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- Webpack module pattern (`__webpack_require__`).
- Minified variable names.

### Risks
- **Tracking**: This chunk implements an extremely detailed performance and interaction tracking system. It includes multiple profilers for 'resizeLatencyV1', 'scrollLatencyV1', 'textInputLatencyV1', 'alertProcessing', 'gButtonTextCheck', 'highlightsDisplay', and 'inlineAlertApply'. It also captures keyboard events ('keydown', 'keypress') during text replacements to preserve user input, which could be logged. The 'TouchTypist' and 'Human Writing Report' features also imply significant data collection.

### Evidence
- **Performance Profilers**: `src/js/Grammarly.beautified.js:29308-29880`
- **CaretPreservingReplacementServiceDecorator (Keyboard Capture)**: `src/js/Grammarly.beautified.js:28184-28310`
- **TouchTypist Feature**: `src/js/Grammarly.beautified.js:29106-29298`
- **Human Writing Report (HWR) Clients**: `src/js/Grammarly.beautified.js:28992-29105`
## src/js/Grammarly.beautified.js [chunk 16/48, lines 30001-32000]

### Summary
This chunk details the complex implementation of various inline card controllers, which manage the pop-ups that appear when a user interacts with an alert. It includes a factory (`Wi`) for creating different alert state services based on the interaction model (hover, click, touch), indicating a sophisticated, context-aware UI. Key components include `Hi`, the main CAPI card controller, which handles rendering and user actions within the card; `ki`, an alert classifier and counter service that provides filtered views of alerts for UI badging; and `zi`, a controller for a delayed-unlock feature for premium alerts, controlled by an experiment. The chunk also defines a formatting service (`br`) that notably uses the deprecated `document.execCommand` for rich text actions. Finally, it contains logic (`wo`, `So`) to programmatically focus the assistant's input field when opened via a keyboard shortcut by querying the DOM for `grammarly-popups`.

### Chrome APIs
- None in this chunk.

### Event Listeners
- The `wo` function and related logic set up `focusin` and `focusout` listeners on the assistant's root element to track focus state when opened via keyboard shortcut.

### Messaging
- None in this chunk.

### Storage
- **`claimedUserSettings`**: Accessed via a settings manager (`Ji.h`) to get/patch timestamps for when a "claimed user" popup was last seen. This is used to control how often the popup appears.
- **`UserEngagedByAlertsAccepted`**: Managed by the `Fr` service to track user engagement for the Iterable marketing platform. It counts alert acceptances and resets the counter periodically.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **`document.execCommand`**: The `br` (FormattingService) uses `document.execCommand` to apply 'bold', 'italic', 'underline', 'formatBlock' (for headers), and list formatting ('insertOrderedList', 'insertUnorderedList'). This is a deprecated API.
- **`querySelectorAll("grammarly-popups")`**: The `wo` function queries the DOM for the `grammarly-popups` custom element to find and focus the assistant's input field when opened via a keyboard shortcut.

### Dynamic Code/Obfuscation
- **Experiment-driven Features**: The code heavily uses feature flags and experiments (e.g., `Ie.K.SduiBulkDismiss`, `rn.p.LockedUiDebouncedHoverUnlock`) to enable/disable functionality, such as the delayed unlocking of premium suggestions or bulk dismissal of alerts. The configuration for these experiments is sometimes parsed from a JSON string.

### Risks
- **Use of Deprecated API**: The use of `document.execCommand` is a potential risk as browser support may be removed in the future, breaking rich text formatting features.

### Evidence
- `src/js/Grammarly.beautified.js:31800-31807`: Use of `document.execCommand`.
- `src/js/Grammarly.beautified.js:30288-30291`: `SduiBulkDismiss` experiment check.
- `src/js/Grammarly.beautified.js:30500-30509`: `LockedUiDebouncedHoverUnlock` experiment check and dynamic configuration parsing.
- `src/js/Grammarly.beautified.js:31900-31907`: `querySelectorAll` for `grammarly-popups`.
- `src/js/Grammarly.beautified.js:31188-31195`: Accessing and patching `claimedUserSettings` in storage.
- `src/js/Grammarly.beautified.js:31600-31605`: Logic for incrementing the `UserEngagedByAlertsAccepted` counter for Iterable.
## src/js/Grammarly.beautified.js [chunk 17/48, lines 32001-34000]

### Summary
This massive chunk contains the constructor for the main `Qo` class, which appears to be the central `AquaFieldIntegration` controller. This constructor is the heart of the content script, responsible for initializing and wiring together almost every feature. It orchestrates the creation of numerous services and controllers based on user state, experiments, and dynamic configuration.

Key features initialized here include:
- **G2 v-bars**: A new vertical bar UI feature (`Nt`).
- **Agents Framework**: A system for integrating document-level agents (`getDocumentIntegrationsObservable`).
- **TouchTypist**: The predictive typing feature (`qn`).
- **AquaAlertsWiring**: The critical component (`Zi.M`) that binds alert data from the `AlertProcessor` to the visual highlights rendered on the page.
- **Dynamic Skills & Snippets**: Services for dynamic skills (`Yt`) and code snippets (`no.x`, `Ro`).
- **User Surveys**: A controller (`jr`) for showing perception metrics surveys.
- **Human Writing Report (HWR)**: A feature (`nn`) with its own storage (`Qt`) and encryption (`Jt`) clients that communicate with the background script via a proxied `chrome.runtime.sendMessage`.

The chunk also defines the main `_render` method, which is responsible for injecting all UI components (highlights, G-button, popups) into the DOM, and a large, lazy-loading popup router component (`re`) that handles displaying dozens of different popups like login reminders, onboarding tours, feature uphooks, and consent dialogs.

### Chrome APIs
- **`runtime.sendMessage`**: Used indirectly by the Human Writing Report (HWR) feature. The `Qt` (storage client) and `Jt` (encryption client) are initialized with `(0, qe.OB)().bgRpc.api`, which is a proxy that sends messages to the background script to handle secure storage and encryption operations.

### Event Listeners
- None directly defined, but many services initialized here will set up their own listeners (e.g., for mouse, keyboard, and scroll events).

### Messaging
- **`hwr-storage`**: A message channel is implicitly created by the HWR's storage client (`Qt`) to send storage requests (get/set) to the background script.
- **`hwr-encryption`**: A message channel is implicitly created by the HWR's encryption client (`Jt`) to send encryption/decryption requests to the background script.

### Storage
- None directly accessed. Storage operations are delegated to the background script via messaging (see HWR feature).

### Endpoints
- None in this chunk.

### DOM/Sinks
- **`document.body.appendChild`**: The `jr` (Perception Metrics Survey Controller) injects a `grammarly-perception-metrics-survey` element directly into the document body to display surveys.
- **Rendering Engine**: The `_render` method within the `Qo` class is the primary sink for all visual output. It takes a root element and renders all highlights, the G-button, and a vast array of popups into it.

### Dynamic Code/Obfuscation
- **Lazy Loading**: The popup router (`re`) makes extensive use of `i.lazy` and dynamic `import()` (`n.e(...)`) to load popup components on demand, reducing the initial bundle size.
- **Feature Flagging**: The entire constructor is a testament to heavy feature flagging. Nearly every service and feature is conditionally initialized based on experiment checks (`this._experimentClient.isGateEnabled(...)`) or dynamic configuration from the user's state.

### Risks
- **Complexity**: The sheer number of services and their complex interdependencies initialized in this single constructor represents a significant maintenance and debugging challenge. A failure in one of the many asynchronous initializations could have cascading effects.

### Evidence
- `src/js/Grammarly.beautified.js:32800-32815`: Initialization of the Human Writing Report (`nn`) service, including its storage (`Qt`) and encryption (`Jt`) clients which use the background message proxy `(0, qe.OB)().bgRpc.api`.
- `src/js/Grammarly.beautified.js:32900-32905`: Initialization of the `jr` (Perception Metrics Survey Controller).
- `src/js/Grammarly.beautified.js:33400-33425`: The main `_render` method, showing the composition of all UI elements.
- `src/js/Grammarly.beautified.js:33900-34000`: The beginning of the large, lazy-loading popup router component (`re`).
## src/js/Grammarly.beautified.js [chunk 18/48, lines 34001-36000]

### Summary
This chunk is highly significant, defining two of the most critical classes in the content script: the main UI rendering controller (`Ve`) and the CAPI (Core API) proxy (`k`). The `Ve` class is responsible for orchestrating the rendering of all Grammarly UI on the page, including highlights, the G-Button, and a vast, dynamic popup system. The `k` class acts as the data bridge between the backend checking service and the UI, transforming and rebasing alert data to keep it synchronized with document changes.

### UI Rendering Controller (`Ve`)
- **Class `Ve`**: This is the central controller for all rendered UI elements. Its constructor takes a massive number of services and controllers as dependencies (~38 arguments).
- **Highlights Rendering**: It renders all types of highlights: standard alerts (`we`), synonym suggestions (`ye`), autocorrect highlights, and highlights for the Cheetah feature. It uses a `He` (React Context) to provide a `clickableCardService` to the highlights.
- **G-Button and Popups**: It manages the rendering of the G-Button (`pe`, `fe`) and the complex popup system (`re` from the previous chunk). The popup router handles dozens of cases, lazy-loading components for each one (e.g., `accountMigration`, `dunningMessage`, `claimedUser`, `freePremiumUphook`).
- **Google Docs Collaborator Tracking**: A specific feature, `_startCollaboratorTracking`, is implemented to monitor the number of collaborators in Google Docs. It does this by querying the DOM for `.docs-presence-plus-collab-widget-container`. If the count is high (>= 4) and the `ShowPerformanceCard` experiment is enabled, it triggers a `performanceCardPopup`. This behavior can be suppressed via a `gdocs_peak_collabs_dismissed` key in `localStorage`.

### CAPI Proxy (`k`)
- **Class `k` (CAPIProxy)**: This class acts as a proxy to the backend `_checkingService`. Its main responsibility is to receive messages from the service, transform them, and rebase them against document changes tracked by `_textRevisionManager`.
- **Message Transformation**: It uses a `capiMessageTransformer` to convert raw messages from the checking service (like `add`, `changed`, `remove`, `finished`) into a standardized format for the application.
- **Rebasing Logic**: It employs a `capiMessageRebaser` that uses the `_textRevisionManager` to get squashed text changes since a given revision. It then applies these transformations to incoming alert data (`transformAlert`, `transformAlertChanged`) to ensure alert positions remain correct as the user types.
- **Event Stream**: It exposes a public `events` stream (`Subject`) that emits the transformed and rebased messages for other parts of the application (like the UI controller `Ve`) to consume.

### Other Key Findings
- **Delta Transformation**: The file `39214` contains utility functions (`l`, `c`) for processing Quill.js-like delta objects. These functions convert deltas into a series of actions (insert, delete) or extract formatting information, which is fundamental to how text changes are processed.
- **Lazy Loading**: The pattern of using `i.lazy` and `n.e(...).then(...)` continues extensively, particularly for loading popup components (`dunningMessagePopup`, `claimedUserPopup`, `proofit`, etc.) and other features like the `TooltipHost`.

### Risks
- **Tracking**: A low-severity tracking risk is identified. The extension monitors the number of collaborators in a Google Doc to trigger a "performance card" feature. While seemingly for product functionality, it involves observing the user's collaborative environment.

### Evidence
- **Google Docs Collaborator Tracking**: `src/js/Grammarly.beautified.js:35816-35836`
- **localStorage Access**: `src/js/Grammarly.beautified.js:35822`
- **DOM Query for Collaborators**: `src/js/Grammarly.beautified.js:35817`
- **Main UI Controller `Ve` Definition**: `src/js/Grammarly.beautified.js:35208`
- **CAPI Proxy `k` Definition**: `src/js/Grammarly.beautified.js:35930`
- **Popup Lazy Loading**: `src/js/Grammarly.beautified.js:34005-34214`, `34488-34568`
## src/js/Grammarly.beautified.js [chunk 20/48, lines 38001-40000]

### Summary
This chunk manages the G-button UI, including various popups, banners, and states. It contains services for uphooks, permissions, and various notifications (account migration, payment issues, etc.). The `GButtonController` orchestrates the button's appearance and state. It uses dynamic imports to load components.

### Chrome APIs
- `(0, M.OB)().bgRpc.api.requestGrantPermission` (line 38388) - Likely a wrapper for `chrome.runtime.sendMessage` to the background script to request permissions.
- `n.e(2308).then(n.bind(n, 63463))` (line 39138) - Webpack dynamic import, which under the hood uses `chrome.runtime.getURL` and script injection.

### Event Listeners
- None found in this chunk.

### Messaging
- None found in this chunk.

### Storage
- None found in this chunk.

### Endpoints
- None found in this chunk.

### DOM/Sinks
- `self.open(...)` (line 38188) - Opens a new tab/window.
- `this._textField.ownerDocument.location.reload()` (line 38391) - Reloads the page.

### Dynamic Code/Obfuscation
- `n.e(2308)`: Webpack dynamic import used to lazy-load a module (`PersonalizedInsightsConsentService`).
- Minified variable names are prevalent.
- Webpack module structure.

### Risks
- None identified in this chunk.

### Evidence
- src/js/Grammarly.beautified.js:38001-40000
## src/js/Grammarly.beautified.js [chunk 21/48, lines 40001-42000]

### Summary
This chunk implements the main popup model factory, handling various states like onboarding, login reminders, and notifications. It introduces a significant integration with 'Iterable', a third-party in-app messaging service, which is triggered by various user actions (e.g., `GDocsSidebarInitialized`, `UserSessionInitialized`, `PauseInTyping`). This service is responsible for fetching and displaying in-app messages (IPM) within an iframe. The chunk also contains the core logic for managing highlight geometry, including creating, updating, removing, and calculating positions for underlines and other visual cues on the text.

### Chrome APIs
- `(0, a.OB)().bgRpc.api.sendToFocusTab(...)` (line 40020): Sends a message to the content script of the currently focused tab, likely a wrapper for `chrome.tabs.sendMessage`.
- `(0, a.OB)().bgRpc.api.iterableGetInAppMessages(r)` (line 41329): Calls the background script to fetch messages from the Iterable service.

### Event Listeners
- None found in this chunk.

### Messaging
- The code communicates with the background script to trigger actions like showing the onboarding dialog (`showOnboardingDialog`) and disabling the extension on the current tab.
- It heavily uses an internal RPC-like mechanism (`bgRpc`) to communicate with the background script.

### Storage
- `localStorage.setItem("gdocs_peak_collabs_dismissed", "true")` (line 40220): Sets a flag in local storage to dismiss a feature related to Google Docs collaboration.

### Endpoints
- The integration with Iterable implies network requests to Iterable's servers, but the specific endpoints are managed by the background script and not visible here.

### DOM/Sinks
- `self.open(...)`: Used multiple times to open new tabs for sign-in, payment info, etc.
- An `iframe` is created and injected into the page to display in-app messages from Iterable (line 41630). The `srcdoc` attribute is used to populate its content, which is a potential security risk if the content is not properly sanitized.

### Dynamic Code/Obfuscation
- `n.e(1090)` (line 40880): Webpack dynamic import to lazy-load a component related to card rendering.
- Minified variable names and Webpack module structure are present.

### Risks
- **Tracking**: The extensive use of the Iterable service for in-app messaging based on user behavior (`UserSessionInitialized`, `UserEngagedByAlertsAccepted`, `PauseInTyping`) constitutes a form of user tracking. This could have privacy implications if not clearly disclosed to the user. Severity: Low.

### Evidence
- src/js/Grammarly.beautified.js:40001-42000
## src/js/Grammarly.beautified.js [chunk 22/48, lines 42001-44000]

### Summary
This chunk contains a sophisticated set of utilities for layout, geometry, and rendering, forming the foundation of how the extension positions its UI relative to the text field. It includes an advanced IntersectionObserver for performance, color/blend mode utilities for UI contrast, core geometry primitives (Point, Rect, Size), and a major EditorLayout class that orchestrates UI injection and positioning. It also defines a generic text replacement service.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `mousemove`
- `touchstart`
- `resize`
- `keydown`
- `mousedown`
- `keyup`
- `mousewheel`
- `touchmove`

### DOM APIs
- `getBoundingClientRect`
- `getComputedStyle`
- `scrollBy`
- `insertAdjacentElement`
- `createElement`
- `appendChild`
- `querySelector`

### Obfuscation Hints
- `minified_vars`: Single-letter variables are used extensively.
- `webpack_modules`: The code is structured as webpack modules.

### Key Findings
- **Advanced Intersection Observer (module 7865)**: Implements a highly optimized, shared `IntersectionObserver` to efficiently track the visibility of elements within a large viewport by dividing it into a grid. This is crucial for performance.
- **Layout & Geometry Engine (modules 44287, 13374, 68418, 63310)**: A comprehensive set of classes and functions for managing UI layout. The `EditorLayout` class (`D` in 44287) is central, handling the logic for injecting and positioning the G-button and highlights relative to the target text field. It intelligently handles different CSS positioning contexts (`static`, `relative`, `absolute`).
- **Color & Blending Utilities (module 61833)**: Provides functions to parse colors, calculate luminance, and determine the effective background color by traversing the DOM. This is used to ensure UI elements like highlights have proper contrast (`mix-blend-mode: darken`).
- **Text Replacement Service (module 13425)**: Defines a generic service (`v`) for replacing text within the editor, handling range creation and selection.
- **Proofit Feature Initialization (module 205)**: Contains logic to dynamically load and initialize the "Proofit" text rewriting feature, setting up its data channels and view injectors.

### Risks
- None identified in this chunk. The code is focused on core rendering and layout logic.

### Evidence
- **Intersection Observer Grid Logic**: `serviceWorker.beautified.js:42050-42095`
- **EditorLayout Class Definition**: `serviceWorker.beautified.js:43255-43689`
- **Color Blending Logic**: `serviceWorker.beautified.js:42220-42295`
- **Text Replacement Service**: `serviceWorker.beautified.js:43883-43920`
## src/js/Grammarly.beautified.js [chunk 23/48, lines 44001-46000]

### Summary
This chunk details the text replacement services, including a generic service using `execCommand` and another using `paste`/`beforeinput` events. It contains utilities for rendering the internal rich text format (Delta) to both HTML and plain text. A significant part is the 'preserve formatting' logic, which transforms replacements to maintain existing styles. A validation and tracking middleware wraps the replacement service to prevent text corruption and log extensive telemetry on success or failure.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `paste`
- `keydown`

### DOM APIs
- `execCommand`
- `dispatchEvent`

### Obfuscation Hints
- `minified_vars`: Single-letter variables are used extensively.
- `webpack_modules`: The code is structured as webpack modules.

### Key Findings
- **Replacement Services (modules 13425, 27970)**: Two primary replacement strategies are defined:
    1.  **`execCommand` based**: A service (`_` in 13425) that uses `document.execCommand('insertHTML'/'insertText')`.
    2.  **Event-based**: A more modern service (`f` in 27970) that dispatches `paste` or `beforeinput` events to perform replacements, which is often more reliable in complex editors.
- **Delta Rendering (modules 64405, 25754)**: Contains `renderToHtml` and `renderToPlainText` utilities, which convert the internal Quill-like Delta format into either HTML (for rich text editors) or plain text.
- **Preserve Formatting Logic (module 33387)**: A sophisticated system (`h` and `p` classes) to handle text replacements while preserving existing formatting. It analyzes the text to be replaced, detects complex styles or list items, and transforms the replacement value into a series of smaller replacements (batch mode) or a composed Delta to maintain the original styling.
- **Replacement Middleware & Validation (module 77642)**: A crucial middleware (`oe`) wraps the core replacement services. It adds two key layers:
    1.  **Validation (`z`, `PromiseReplacementValidatorImpl`)**: After a replacement is performed, this validator observes subsequent text changes to confirm the replacement was successful and didn't corrupt the text. It includes logic for approximate matching and timeouts.
    2.  **Tracking (`re`, `ReplacementTracker`)**: This class logs extensive telemetry for every replacement attempt (success, fail, reason, context, performance) to the `felog` service.
- **Domain-Specific Logic**: The code contains logic to apply different formatting preservation rules based on the domain (`dynamicConfig`), indicating tailored behavior for specific websites.

### Risks
- None identified in this chunk. This is core editor functionality.

### Evidence
- **Replacement Service using `execCommand`**: `src/js/Grammarly.beautified.js:44051-44090`
- **Event-Dispatching Replacement Service**: `src/js/Grammarly.beautified.js:44400-44550`
- **Preserve Formatting Transformation Logic**: `src/js/Grammarly.beautified.js:44950-45150`
- **Replacement Validation and Tracking Middleware**: `src/js/Grammarly.beautified.js:45300-45800`
## src/js/Grammarly.beautified.js [chunk 24/48, lines 46001-48000]

### Summary
This chunk provides a set of generic integration factories for popular rich text editors (CKEditor, Draft.js, ProseMirror, Quill, Slate.js). It also contains the core implementation of the text change buffering/batching system, which is a key performance optimization. Furthermore, it includes the logic for creating a linear text map from complex content-editable DOM structures and a suite of utilities for querying the Server-Driven UI (SDUI) component tree.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `click`
- `keydown`
- `focus`

### DOM APIs
- `querySelectorAll`
- `closest`
- `getAttribute`

### Obfuscation Hints
- `minified_vars`: Single-letter variables are used extensively.
- `webpack_modules`: The code is structured as webpack modules.

### Key Findings
- **Editor Integration Factories (modules 28958, 62501, 15307, 86076, 61431)**: Provides generic, reusable integration builders for several common rich-text editors. These factories abstract away the specific implementation details of each editor, allowing Grammarly to be integrated with a common set of options (e.g., layout creation, replacement service).
- **Text Change Buffering (module 20994, 40394)**: Implements the core logic for buffering and batching text changes. This is a critical performance optimization that prevents the extension from over-processing small, rapid changes (e.g., as a user types). It uses an idle timer and specific flush triggers (like newlines or punctuation) to decide when to process a batch of changes.
- **Text Map Creation (module 85452)**: Defines the `ContentEditableTextMap` class, which is responsible for traversing a `contenteditable` element's DOM tree and converting it into a linear, plain-text representation with associated formatting information. This is the foundation for how the extension understands the text it's working with.
- **SDUI Utilities (module 37873)**: A suite of functions for querying and manipulating the Server-Driven UI tree. It includes helpers for finding components by ID or type (e.g., `gButton`, `assistantFeed`), getting specific content (e.g., `getPlagiarismContent`), and creating actions (`createPushAssistantFeedAction`).

### Risks
- None identified in this chunk.

### Evidence
- **Editor Factories**: `src/js/Grammarly.beautified.js:46050-46150` (CKEditor5), `src/js/Grammarly.beautified.js:46200-46350` (Draft.js)
- **Text Change Buffer**: `src/js/Grammarly.beautified.js:47150-47250`
- **Text Map Implementation**: `src/js/Grammarly.beautified.js:47800-48000`
- **SDUI Query Utilities**: `src/js/Grammarly.beautified.js:46900-47050`
## src/js/Grammarly.beautified.js [chunk 25/48, lines 48001-50000]

### Summary
This chunk is pivotal, containing the core logic that orchestrates the entire field and page integration process. It details the `TextRevisionManager`, which is essential for tracking and synchronizing text changes with the server. It also includes the master integration factory (`M` in module 96075) that assembles all necessary components (layout, mirroring, text observation, services) for a single editable field. The chunk further defines the `MirrorView` used for accurate UI placement and the top-level `GenericPageIntegration` class, which discovers, validates, and manages the lifecycle of all field integrations on a page.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `compositionstart`, `compositionend`: To track IME composition.
- `input`, `change`: To detect value changes in text fields.
- `focus`: To identify active text fields.
- `keydown`, `keyup`, `keypress`, `mouseup`, `mousedown`, `pointerdown`, `click`, `dblclick`: A comprehensive set of events for monitoring user interaction, likely propagated from the host.
- `load`, `unload`: To manage the lifecycle of iframe integrations.

### DOM APIs
- `querySelectorAll`, `querySelector`, `getElementsByTagName`, `getElementById`: Standard DOM traversal.
- `createElement`, `createContext`: For building UI components (likely with a React-like library).
- `getComputedStyle`, `computedStyleMap`: Used extensively by the `MirrorView` to replicate text field styles.
- `attachShadow`, `adoptedStyleSheets`, `CSSStyleSheet.replace`, `CSSStyleSheet.replaceSync`: Advanced APIs for creating shadow DOM roots and managing styles with Constructable Stylesheets for encapsulation.

### Obfuscation Hints
- `minified_vars`: Widespread use of single-letter variables.
- `webpack_modules`: Code is organized into webpack modules.

### Key Findings
- **`TextRevisionManagerImpl` (module 15213)**: A critical class for managing text state. It creates and tracks sequential revision IDs for all text changes, allowing it to compute deltas between any two points in time. Its ability to `tagLatestRevision` by mapping a local ID to a remote (server) ID is the core mechanism for synchronizing document state with the CAPI backend.
- **Generic Integration Factory (module 96075)**: This is the master function (`M`) that wires everything together for a field integration. It instantiates the `TextFieldLayout`, creates the `MirrorView` for geometry calculations, initializes the `TextObserver`, and assembles the main `FieldIntegration` controller, passing in all required services and context.
- **Layout and Mirroring (`MirrorView`, module 96405)**: Implements the "mirror" element, a hidden DOM element that perfectly mimics the target field's styles (font, padding, line-height, etc.). This is a crucial technique for accurately calculating the geometry of text and determining where to render UI elements like highlights and the G-button without interfering with the live editor.
- **`GenericPageIntegration` (module 23790)**: The main orchestrator for the page. It uses observables (`_textFieldsObservable`) to discover new editable fields as they appear or are focused. It then validates these fields against a set of rules and, if valid, uses the generic factory to create and manage the lifecycle of the corresponding field integration. It also handles the disposal of integrations when fields are removed from the DOM.
- **Shadow DOM and Style Encapsulation (modules 9976, 9542)**: The code uses advanced techniques for UI injection. It creates shadow DOM roots to encapsulate its UI and uses Constructable Stylesheets (`new CSSStyleSheet()`) to adopt styles, which is more performant than injecting `<style>` tags. It has fallbacks for browsers that don't support this.

### Risks
- None identified in this chunk.

### Evidence
- **TextRevisionManager**: `src/js/Grammarly.beautified.js:48601-48850`
- **Generic Integration Factory**: `src/js/Grammarly.beautified.js:49001-49400`
- **MirrorView Implementation**: `src/js/Grammarly.beautified.js:49401-49800`
- **GenericPageIntegration**: `src/js/Grammarly.beautified.js:49801-50000`
- **Shadow DOM Injection**: `src/js/Grammarly.beautified.js:49850-49950`
## src/js/Grammarly.beautified.js [chunk 26/48, lines 50001-52000]

### Summary
This chunk defines the high-level rule engine for page-level integrations and contains the implementation for several key UI components and managers. It includes the factory system that selects the correct integration strategy based on the current domain and URL. It also details the specific rule for handling iframe-based editors. Furthermore, the chunk contains the code for UI components like the "Add to Dictionary" card, a powerful `Positioner` component for anchoring UI, a draggable component wrapper, and a keyboard shortcut manager.

### Chrome APIs
- None in this chunk.

### Event Listeners
- `click`, `mousedown`: For UI interactions.
- `keydown`: Used by the keyboard shortcut manager.
- `focus`, `blur`: To track active elements, likely for iframe integrations.

### DOM APIs
- `CustomEvent`, `dispatchEvent`, `addEventListener`, `removeEventListener`: Used for creating a custom event-based communication channel, likely between different parts of the extension within the same page.
- `querySelector`: Used to find specific elements for integration (e.g., GDocs elements).

### Obfuscation Hints
- `minified_vars`: Extensive use of single-letter variables.
- `webpack_modules`: Code is structured as webpack modules.

### Key Findings
- **Page Integration Rule Engine (module 3670)**: This module provides a factory system (`c`, `u`, `h`) for creating and managing page-level integrations. It uses a rule-based system to select the appropriate integration strategy based on conditions like `domain`, `pathname`, `url`, browser type, and other custom functions. This allows for specialized integrations (e.g., for Google Docs) while having a generic `catch-all` for other websites.
- **IFrame Host Integration Rule (module 85298)**: Defines the `iframeHostRule`, a specific rule for creating integrations that manage communication with child iframes. It checks dynamic configuration and experiments to determine if it should activate and defines security checks for the origin of messages from iframes.
- **Google Docs Integration Logic (modules 91135, 4271)**: Contains constants and helper functions specifically for Google Docs. This includes CSS selectors for key elements like the main editor (`div.kix-appview-editor`) and the `iframe.docs-texteventtarget-iframe`, which is the actual target for text events.
- **`Positioner` UI Component (module 8536)**: A sophisticated, generic component for anchoring a UI element to a specific DOM rectangle (`anchorRect`). It handles complex positioning logic, including automatically "flipping" or "translating" the element to ensure it stays within the viewport boundaries, making it a cornerstone of the extension's non-invasive UI.
- **Draggable Component (module 2914)**: A higher-order component that wraps the `Positioner` to add drag-and-drop functionality. It manages the state of the drag operation and can be constrained by defined boundaries, used for elements like the floating assistant.
- **Keyboard Shortcut Manager (modules 56052, 64910, 13162)**: A system for defining and handling keyboard shortcuts. It defines default key combinations for actions like opening the assistant (`Ctrl+Shift+G` or `Cmd+Shift+G`) and provides classes to listen for these shortcuts within specific text fields.

### Risks
- None identified in this chunk.

### Evidence
- **Page Integration Rule Engine**: `src/js/Grammarly.beautified.js:50001-50200`
- **Iframe Host Rule**: `src/js/Grammarly.beautified.js:51001-51200`
- **Positioner and Draggable Components**: `src/js/Grammarly.beautified.js:51401-51800`
- **Keyboard Shortcut Manager**: `src/js/Grammarly.beautified.js:51801-52000`
## src/js/Grammarly.beautified.js [chunk 27/48, lines 52001-54000]

### Summary
This chunk is almost entirely dedicated to defining a comprehensive suite of React-like UI components that constitute Grammarly's suggestion card interface. It reveals a modular and composable architecture for building different types of cards (e.g., for replacements, definitions, synonyms) and their footers, tailored to the user's authentication state (anonymous, authenticated, premium). The components use a React-like library (`i.createElement`) and are styled using CSS modules.

### UI Components
- **Master Card Component (`Y` in 45821)**: A central component that assembles a generic card. It conditionally renders headers, footers, explanations, and action buttons based on props like `isAuthenticated`, `onIgnore`, `onAddToDict`, `upgradeCTA`, etc. This is the main wrapper for most suggestion cards.
- **Replacement Card (`p` in 75374)**: The core component for displaying suggestions that replace text. It can render multiple replacement options and visually differentiates between inserted, deleted, and unchanged text parts.
- **Definitions Card (`p` in 8893)**: A card to display word definitions, citing the source (Wikipedia or Wiktionary) and providing a link for more details.
- **Synonyms Card (`h` in 42044)**: Displays synonyms, grouped by meaning, and allows the user to replace the original word with a synonym.
- **Unknown Word Card (`l` in 66187)**: A card specifically for misspelled or unknown words, providing "Add to dictionary" and "Ignore" actions.
- **Sign-in/Sign-up Card (`d` in 84695)**: A prompt for anonymous users to log in or create an account.
- **Specialized "Vox" Cards (38949, 78438)**: Components named `vox-replacement-card` and `vox-text-only-card`, likely related to tone or voice suggestions.

### Card Footers (State-Aware)
- A variety of footer components are defined to adapt to different contexts:
  - **`authenticated-card-footer` (25306)**: Standard footer for logged-in users, with a "See more in Grammarly" link.
  - **`anonymous-card-footer` (45783)**: Footer for logged-out users, prompting them to "Sign up now".
  - **`premium-card-yellow-footer` (43128)**: A yellow-themed footer for premium-only suggestions.
  - **`free-premium-card-footer` (43128)**: A footer for free samples of premium suggestions.
  - **`fluency-card-footer` (31363)**: A specialized footer for fluency suggestions, which includes an info icon with a tooltip explaining that the suggestion is based on language settings.

### UI Primitives
- **Popover (`J` in 19282)**: A powerful popover component built using `popper.js` for positioning. It supports features like placement, arrows, and click-away-to-close.
- **Popover Menu (`p` in 92607)**: A component for building dropdown menus with full keyboard navigation (arrow keys, home, end, escape), hover/click triggers, and support for sections and icons.
- **Tooltip (`S` in 69652)**: A tooltip component that uses a global `TooltipManager` (React Context) to orchestrate the showing and hiding of tooltips, often with delays, based on RxJS-managed mouse events.
- **Button (`a` in 1695)**: A standard, versatile button component with multiple visual styles (`primary`, `link`, `outlined`, `premium`, etc.) and sizes.
- **Emoji (`c` in 90207)**: An interesting emoji component that attempts to load an SVG from a CDN (`https://static.grammarly.com/assets/emoji/`). If the image fails to load, it gracefully falls back to rendering the native Unicode emoji character.
- **Highlight (`u` in 31152)**: A component for rendering styled text highlights, supporting different colors and styles like `background`, `underline`, and `dottedUnderlineAndBackground`.

### Obfuscation & Code Patterns
- **Webpack Modules**: The code is structured as webpack modules (e.g., `96569: (e, t, n) => { ... }`).
- **React-like Components**: The entire chunk uses a React-like virtual DOM pattern with `i.createElement`. The library appears to be custom or bundled, not a standard React import.
- **RxJS for UI Events**: Complex UI interactions, like tooltips with delays, are managed using RxJS observables to handle event streams.
- **Fonts Preloader (`o` in 55885)**: A dedicated component (`fonts-preloader`) renders multiple `<span>` elements, each with a class applying a different weight of the "Inter" font family. This is a technique to force the browser to download all required font variations upfront to prevent flickering.
## src/js/Grammarly.beautified.js [chunk 28/48, lines 54001-56000]

### Summary
This chunk is a cornerstone of the extension's architecture, containing the complete environment and configuration management system. It defines a factory function that generates all necessary URLs for Grammarly's backend services (CAPI, auth, logging, assets) and dynamically switches them based on the deployment environment (`prod`, `qa`, `dev`). The chunk also includes sophisticated RxJS-based wrappers for `MutationObserver` and `ResizeObserver`, transforming standard DOM observation into reactive streams. Additionally, it contains the implementation for rendering text highlights and several core utility modules for handling text deltas and versioning.

### Key Findings

#### 1. Environment Configuration (`i` in 87030, `r` in 44257)
- **Environment-Specific URLs**: A factory function (`i.create`) generates all service URLs based on the environment (`prod`, `qa`, `dev`, `dev-preprod`). This is a critical piece of infrastructure that allows the extension to target different backend environments.
- **Service Endpoints**: It defines the URLs for a wide array of services:
  - **Authentication**: `auth.grammarly.com` (v3, v4, v5 for different auth flows).
  - **Core API**: `capi.grammarly.com` (including `wss://` for WebSocket connections).
  - **Logging & Metrics**: `f-log-extension.grammarly.io` (felog) and `extension.femetrics.grammarly.io`.
  - **Static Assets**: `assets.extension.grammarly.com`.
  - **Dynamic Configuration**: `config.extension.grammarly.com` for fetching `dynamicConfig.json` and `config.json`.
  - **Gateways**: `gateway.grammarly.com` for services like `skills`, `passport`, `snippets`, and `knowledge-hub`.
- **Evidence**: The `create` function in module `87030` is the central point for this configuration.

#### 2. Build and Versioning (`a` in 35922)
- **Manifest & ID Access**: The code uses `chrome.runtime.getManifest().version` and `chrome.runtime.id` to get the extension's version and unique identifier.
- **Full Version String**: It constructs a detailed version string (e.g., `14.1259.0-prod/UNVERSIONED`) that includes the manifest version, environment, and git commit information, which is vital for logging and debugging.
- **Evidence**: `getManifestVersion` and `getExtensionId` functions in module `35922`.

#### 3. Reactive DOM Observers
- **`MutationObserver` Wrapper (`i` in 45523)**: Creates an RxJS `Observable` from a `MutationObserver`. This allows the application to subscribe to DOM changes (e.g., attribute modifications, child additions/removals) as a reactive stream, simplifying complex asynchronous DOM interactions.
- **`ResizeObserver` Wrapper (`i` in 85004)**: Similarly, wraps the `ResizeObserver` API to create an observable that emits whenever an element's size changes.
- **Compatibility Fallback**: The `ResizeObserver` wrapper includes a fallback implementation that uses the `MutationObserver` for browsers that don't support `ResizeObserver`, showing robust, defensive programming.
- **Evidence**: Modules `45523` and `85004`.

#### 4. Highlight Rendering (`u` in 31152, `p` in 3038)
- **Component Implementation**: This chunk contains the core rendering logic for the `Highlight` component.
- **Dynamic Styling**: It dynamically applies CSS classes and styles based on properties like `color`, `displayFormat` (`underline`, `background`), `hovered`, `theme` (`light`/`dark`), and animation speed.
- **Gradient Underlines**: A clever feature in module `3038` calculates CSS `linear-gradient` properties to create partial or fading underlines for the `underlineStart` format, which is used to visually indicate the start of a suggestion.
- **Evidence**: The `u` component in module `31152` and helper functions in `3038`.

#### 5. DAPI Client (`i` in 32626)
- **Purpose**: Defines a client for a "DAPI" (likely Data API or Dynamic API).
- **Functionality**: Exposes methods to modify user-specific state that is not part of the main settings, such as `modifyCheetahOnboardingState`, `changeStrongDialect`, and `setEmogenieEmojiState`. This suggests a separate persistence layer for feature-specific user data.
- **Evidence**: Module `32626`.

#### 6. Text Delta Utilities (`u`, `d`, `h`, `p` in 67800)
- **Delta Manipulation**: Provides functions for composing and transforming text deltas, likely in the `quill-delta` format. These are fundamental utilities for managing text state and applying changes from the CAPI.
- **Evidence**: Module `67800`.
## src/js/Grammarly.beautified.js [chunk 29/48, lines 56001-58000]

### Summary
This chunk is central to the extension's dynamic behavior, containing two major pieces of architecture: a massive collection of feature flags and A/B testing experiments, and the primary `CardView` component that acts as the main controller for rendering all inline suggestion cards. The code demonstrates a heavy reliance on experimentation to control UI, features, and performance, with the `CardView` component using these flags to select the appropriate card renderer for a given suggestion.

### Key Findings

#### 1. Feature Flags and A/B Testing (`c` in 90595, `a` in 70843)
- **Massive Experimentation Framework**: This chunk defines an extensive set of feature flags (`FeatureGate`) and experiments (`Experiment`). These are used throughout the codebase to enable or disable features, test UI variations, and control rollouts.
- **Scope of Flags**: The flags cover a vast range of functionalities:
  - **UI/UX**: `CleanUxUiFree`, `VbarsShimmerOnOpen`, `LockedUIWithNewUx`.
  - **New Features**: `CitationBuilder`, `KnowledgeHubGdocs`, `CheetahFeatureFlagCompose`.
  - **Performance/Internals**: `GDocsCachingParserMiddleware`, `TextChangeBufferUseLegacy`, `AlertProcessingOptimization`.
  - **Rollouts**: `GOSRollout`, `StudentsOFEGdocs`, `TouchTypistRelease`.
  - **Authentication**: `OAuthSDKV2`, `FullySignedInExperience`, `ChromeStoreSignupV2`.
  - **Site-Specific Fixes**: `RedditReplacementDuplicationFix`, `SalesforceServiceConsoleReplacementFix`, `DiscordExecComandReplacementService`.
- **Implementation**: The flags are defined as instances of a `Cc` (likely "Constant Class" or "Configuration Constant") or `KS` class, which takes a name and a set of possible treatment values (e.g., `["control", "test"]`). This structured approach allows for robust feature management.
- **Evidence**: Modules `90595` and `70843` contain the exhaustive list of these flags.

#### 2. Master `CardView` Component (`le` in 44914)
- **Central Controller**: This React-like component is the main entry point for rendering any inline suggestion card. It receives a `model` prop that represents the suggestion data.
- **Conditional Rendering Logic**: The core of this component is a large `render` method that uses a `switch` or `if/else` chain on `model.kind` to determine which specific card component to render.
- **Card Types Handled**:
  - `"common"`: Renders a standard suggestion card (`ee` component).
  - `"vox"`: Renders a tone/voice suggestion card (`X` component).
  - `"sdui"`: Renders a "Server-Driven UI" card (`te` component), which itself has complex logic for handling different authentication states and experiments (e.g., `BlurredFsiCard`, `QuickSignupFsiCard`, `AccountChooserFsiCard`).
  - `"suggestedSnippetCardModel"`: Renders a card for suggesting a new snippet.
  - `"knowledgeHub"`: Renders a card with information from the company's knowledge base.
- **Action Handling**: The `CardView` also wires up all user interactions (e.g., `replace`, `ignore`, `addToDictionary`, `login`) and dispatches them to the appropriate services or parent components.
- **Evidence**: The `ne` class and the main `le` component in module `44914`.

#### 3. Environment and Logging Initialization (`d` in 28898)
- **Singleton `Env` Class**: This chunk defines and initializes a singleton `Env` class that holds the global configuration (`config`), logger, and other environment-specific details.
- **Debug Logging Control**: The `Env` class includes methods (`enableHistoryLoggerInProd`, `enableAdvancedHistoryLoggerInProd`) to dynamically turn on more verbose logging in the production environment, likely triggered by a hidden command or setting for debugging purposes.
- **Evidence**: The `d` class in module `28898`.

#### 4. Messaging and Port Management (`l` in 33908)
- **Content Script Messaging API**: Defines a `ContentScriptMessageApi` class responsible for managing the communication port between the content script and the background service worker.
- **Resilient Connection**: The implementation is designed to be resilient, with logic to re-initialize the port (`initPort`) if the connection is lost, which can happen if the service worker goes idle. It uses a `_bgIsWorking` check to verify the background script's availability before attempting to reconnect.
- **Evidence**: The `l` class in module `33908`.

### Obfuscation & Code Patterns
- **Feature Flag Driven Architecture**: The code is heavily structured around feature flags, making its behavior highly dynamic and dependent on configuration fetched from the server.
- **Lazy Loading**: UI components like `SduiCard`, `BlurredFsiCard`, and `QuickSignupFsiCard` are loaded lazily using `React.lazy` (or a custom equivalent), which improves initial load performance by deferring the loading of component code until it's actually needed.
- **Singleton Pattern**: The `Env` class is implemented as a singleton to provide global access to configuration and services.
## src/js/Grammarly.beautified.js [chunk 30/48, lines 58001-60000]

### Summary
This chunk provides the data modeling backbone for suggestion cards, the logic for parsing text transformations (diffs), and a significant portion of the underlying RPC and persistent storage infrastructure. It defines a factory for creating different card data models (common, style guide, server-driven UI) and the classes that represent them. The code also reveals a sophisticated, multi-layered RPC system for inter-component communication and a robust persistent store for managing extension state.

### Key Findings

#### 1. Card Model Factory and Data Models (Module `6090`, `le` in `44914`)
- **Card Model Factory (`b` function)**: A critical factory function that creates the appropriate data model instance for a suggestion card based on the alert's properties. This is the core of the card's data layer.
- **Model Types**:
  - **`g` (Common Card - `d.av`)**: The standard model for most suggestions. It handles logic for "Unknown word" alerts, tone improvements (including emoji/icon selection), and a "Progressive Exposure" experiment that shows a special footer (`firstAcceptFooter`) the first time a user sees a certain type of suggestion.
  - **`f` (Vox Card - `d.F4`)**: A model for "Style guide" suggestions, often branded with a company logo and name.
  - **`m` (Suggested Snippet Card - `d.tG`)**: A model for snippet suggestions, which includes specific handlers for actions like `onIgnore`, `onMute`, and `onAcknowledge`, along with Gnar analytics tracking for each action.
  - **`v` (SDUI Card - `d.m0`)**: A model for Server-Driven UI cards, which are highly dynamic and controlled by the backend. It includes a `notify` method to send actions back to the server.
- **Replacements Logic (Module `60431`)**: Defines classes (`Mc` for no replacements, `U_` for replacements) to handle the list of possible text replacements, including the logic to construct the final replacement string from a transformation.
- **Evidence**: The factory function is in the continuation of module `44914` from the previous chunk. The model classes are defined in module `6090`.

#### 2. Text Transformation Parsing (Module `65877`)
- **Diff Display Logic**: This module is responsible for parsing the transformation data that allows the UI to display "diffs" (what's being removed vs. added).
- **Parsing Methods**:
  - **`u(e)`**: A simple parser for strings containing custom tags like `<span class='gr_grammar_del'>...</span>` and `<span class='gr_grammar_ins'>...</span>`. It converts this into a structured array (e.g., `{type: "delete", text: "..."}`).
  - **`h(...)`**: A more advanced parser that works with operational transformation (OT) data (`e.ops`), which is a more robust format for representing text changes. It intelligently combines operations and handles context to produce a clean diff.
  - **`p(e, t)`**: The main function that orchestrates which parsing method to use based on the structure of the alert data (checking for `transformJSON` or `transforms`).
- **Evidence**: Module `65877` contains all transformation parsing logic.

#### 3. RPC and Messaging Infrastructure
- **Multi-Layered RPC**: This chunk contains a sophisticated RPC system built in layers.
  - **Base Layers (Modules `54167`, `84195`, `10238`)**: Basic message service wrappers for sending and receiving messages between different extension contexts (e.g., content script to background).
  - **Generic RPC Clients/Servers (Modules `46649`, `30498`)**: Implementations of a standard request-response RPC pattern.
  - **Observable RPC (Modules `36798`, `59405`)**: A more advanced layer that supports observable streams over RPC, allowing for continuous data flow. This is used for things like real-time state updates. It includes logic for garbage collection of unused observables and client pinging to ensure connections are alive.
  - **RPC Proxy/Tunneling (Module `46231`)**: A `RpcProxy` class that can "tunnel" RPC calls, allowing one component to expose the API of another, which is useful for bridging communication between isolated contexts.
- **Legacy Systems**: The presence of multiple RPC message names (`cs-to-bg-rpc-1587687052565`, `cs-to-bg-rpc-1557421403805`, `cs-to-bg-static-capi-rpc-1668544923207`) indicates that the communication architecture has evolved over time, with multiple protocols likely co-existing.
- **Evidence**: Numerous modules are dedicated to this infrastructure, including `53966`, `23472`, `30603`, `46231`, `36798`, `59405`.

#### 4. Persistent Storage (`PersistentStore` in Module `43912`)
- **Robust State Management**: Defines a `PersistentStore` class that acts as a wrapper around the browser's storage API (`chrome.storage.local` or similar).
- **Key Features**:
  - **Change Observation**: It provides a `changes` observable that emits events whenever the store is updated.
  - **Conflict Detection**: It includes logic (`_applyChanges`) to detect "mismatched changes" (when the local state is out of sync with the actual stored state), triggering a full refresh to prevent data corruption.
  - **Protected Keys**: It prevents direct modification of certain "protected" keys (like `user`, `dapi`, `dynamicConfig`), enforcing the use of specific actions for these critical pieces of state.
- **Key Definitions (Module `3774`)**: Defines the schema for the persistent store, listing all possible keys (`allPersistentKeys`) and identifying which ones are protected.
- **Evidence**: Module `43912` for the `PersistentStore` class and module `3774` for the key schema.

### Obfuscation & Code Patterns
- **Factory Pattern**: The card model factory is a clear example of the factory pattern, decoupling the card creation logic from the view.
- **Layered Architecture**: The RPC system is a strong example of a layered architecture, with each layer adding new capabilities (basic messaging -> RPC -> observable RPC -> proxying).
- **Reactive Programming**: The use of RxJS observables for the persistent store and RPC communication is a core pattern, enabling a reactive and event-driven architecture.
## src/js/Grammarly.beautified.js [chunk 31/48, lines 60001-62000]

### Summary
This chunk is dominated by two major systems: a comprehensive set of "actions" for interacting with the persistent store, and a sophisticated, multi-faceted logging framework. The actions provide a structured API for modifying different parts of the extension's state, such as settings, connection status, and feature toggles. The logging framework is highly configurable, supporting different log levels, history buffers, custom writers, and backup to session storage, indicating a strong emphasis on debuggability and diagnostics.

### Key Findings

#### 1. Persistent Store Actions (Modules `86837`, `89512`, `24534`, `15933`, `42900`, `18428`, `44814`)
- **Structured State Management**: This chunk defines a collection of "actions," which are factory functions that create methods for modifying the `PersistentStore` (defined in## src/js/Grammarly.beauts pattern centralizes state mutation logic, making it more predictable and maintainable.
- **Action Categories**:
  - **`auth` (86837)**: Manages authentication state
### Key Findings

#### 1. Persistent Store Actions (Modules `86837`, `89512`, `24534`, `15933`, `42900`, `18428`, `44814`)
- **Structured State Management**: This chunk defines a collline` flags.
  - **`environment` (24534)**: Modifies the general environment state.
  - **`gdocs` (15933)**: Specifically handles opting into Grammarly on Google Docs.
  - **`quickSettings` (42900)**: A large set of actions for toggling user-facing features. This is a critical module for understanding user-configurable behavior.
    - Toggles for definitions (`toggleDefs`), autocorrect (`toggleAutocorrect`).
    - Toggles and settings for the **Always-Available Assistant** (`toggleAlwaysAvailableAssistant`).
    - Extensive logic for **Touch Typist**, including toggling, snoozing, hotkey settings, and tracking user interactions for experiments (`toggleTouchTypist`, `snoozeTouchTypist`, `setTouchTypistHotkey`, `incrementTouchTypistUserAcceptedCount`).
    - Toggles for the **Citation Builder** and **Translate Onboarding** on a per-domain basis.
  - **`settings` (18428)**: General settings management, including patching common settings, enabling debug features (`toggleDebugMenu`, `toggleGOSDebugger`), and disabling the extension on a specific tab.
  - **`tabs` (44814)**: Manages tab-specific state, such as the active tab and enabling "click-to-run" for a single session.
- **Helper Utilities (Module `84674`)**: Provides helper functions (`k1` for patching common settings, `J_` for patching domain-specific settings) to simplify the creation of these actions.
- **Evidence**: The various action modules are clearly defined, e.g., `const i = e => ({ modifyEnvironment... })` in module `24534`. Module `55830` aggregates all these actions into a single `quickSettings` object.

#### 2. Advanced Logging Framework (Modules `8058`, `97833`, `40594`, `72532`, `59789`, `27194`, `78235`, `66209`)
- **Core Components**:
  - **`Logger` (78235)**: The base class for all loggers, providing standard methods (`trace`, `debug`, `info`, `warn`, `error`).
  - **`HistoryLogsService` (97833)**: A central service that manages log history. It maintains multiple buffers for different log severities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and can also handle custom, feature-specific buffers.
  - **`BackupStorage` (66209)**: A class that backs up logs to `sessionStorage`. This is a crucial feature for debugging issues where the extension might crash or the service worker becomes inactive, as it preserves the most recent logs across sessions. It throttles writes to avoid performance issues.
  - **`ConsoleWriter` (27194)**: The component responsible for writing formatted logs to the browser's developer console, with color-coding for different log levels and logger names.
- **Key Features**:
  - **Log Levels & Filtering**: Supports standard log levels (`TRACE`, `DEBUG`, etc.) and allows for filtering, so only logs of a certain severity are processed.
  - **History Buffers**: Uses circular buffers (`RingBuffer` from module `82853`) to keep a history of recent logs without consuming unbounded memory. The buffer sizes can be dynamically resized (e.g., for "advanced logging" mode).
  - **Data Normalization (`41478`)**: Includes utilities to safely "normalize" complex data structures (like DOM elements or circular objects) before logging to prevent crashes and produce readable output.
  - **Debuggability**: The framework is designed for high debuggability, with features to enable advanced logging in production, download debug reports, and inspect log history.
- **Evidence**: Module `97833` (`HistoryLogsService`) shows the sophisticated buffering and storage logic. Module `66209` (`BackupStorage`) shows the session storage backup mechanism. Module `59789` defines the console color-coding.

#### 3. Default Configuration and Constants (Modules `15362`, `86130`, `33976`)
- **Default Settings (`15362`)**: Defines the default shape of `extensionSettings`, including initial values for features like definitions, keyboard shortcuts, and the Touch Typist feature.
- **Dynamic Config (`86130`)**: Provides the default values for the `dynamicConfig`, which is configuration that can be updated from the server.
- **Feature-Specific Constants (`33976`)**: Contains default objects and enums for features like the Citation Builder and Knowledge Hub.
- **Evidence**: The `he` constant in module `15362` is the canonical default for all extension settings.

### Obfuscation & Code Patterns
- **Factory Pattern**: The "actions" are a strong example of the factory pattern, where functions take the `PersistentStore` as an argument and return an object of methods that operate on that store.
- **Dependency Injection (via Closures)**: The logger is created via a factory function (`(0, r.O)().logger.create(...)`) that injects the necessary dependencies (writers, history service) into the logger instance.
- **Modular Design**: Both the actions and the logging framework are highly modular, with different files/modules responsible for specific pieces of functionality, which are then aggregated into a cohesive whole.
## src/js/Grammarly.beautified.js [chunk 32/48, lines 62001-64000]

### Summary
This chunk is almost entirely dedicated to a single, massive, and critically important module: the Telemetry service (`w` class in module `60378`). This class is the central nervous system for all tracking, logging, and metrics collection within the extension. It exposes an exhaustive API for sending detailed events about user interactions, performance, errors, and feature usage to Grammarly's servers. The sheer breadth of this module highlights a deep investment in data-driven development, A/B testing, and remote diagnostics.

### Key Findings

#### 1. Centralized Telemetry Service (`w` class in `60378`)
- **Core Responsibility**: This class, aliased as `Telemetry`, is responsible for sending structured log events (`felog`), usage metrics, performance data (`femetrics`), and crash reports to the backend.
- **Constructor and Dependencies**: It's initialized with a wide range of dependencies, including functions to send different types of logs (`_sendFelog`, `_sendFelogUsage`, `_sendFelogEvent`), manage user info (`_setUserInfo`), and control sampling rates (`_getUsageMetricsRate`).
- **Event Sending Logic (`_sendEvent`, `_sendException`)**: The core methods format the event payload, attach metadata (like user info, unless `hideUserInfo` is true), and dispatch it to the appropriate sending function. The `_sendException` method is a specialized wrapper for logging errors, ensuring that exception details are properly captured.
- **Sampling**: The service uses sampling (`_sendSampled`, `_sendSampledEvent`) for high-frequency events to avoid overwhelming the backend, controlled by a sampling ratio (e.g., `m = 0.1`).
- **Evidence**: The entire module `60378` is the definition of this class.

#### 2. Exhaustive Tracking API
- **Breadth of Coverage**: The Telemetry class provides a specific, named method for nearly every conceivable user action or system event. This creates a highly detailed, evidence-based trail of the extension's behavior.
- **Major Tracking Categories**:
  - **Connection & State**: `restoredBgConnection`, `lostBgPageConnection`, `dynamicConfigLoadFromServerError`, `storageMigrationFailed`.
  - **UI Interactions**: `userUpgradeClick`, `gGbUpHookClick`, `gButtonClick`, `cardShowAction`, `cardReplacementAction`, `synonymReplacementAction`.
  - **Authentication**: `fetchUserFail`, `getAccessTokenError`, `oauthLogout`, `logoutSuccess`, `logoutError`.
  - **Performance**: `tooLongPageConfigInit`, `csInitialized`, `gdocs.mappingPerf`, `autocorrect.responseTime`. It includes a `_createPerfLogger` for creating performance timers.
  - **Errors & Crashes**: `unhandledBgPageException`, `unhandledPopupRejection`, `csCrash`, `gdocs.injectedException`, `sendToTabFailed`.
  - **Feature-Specific Tracking**:
    - **GDocs (`gdocs`, `canvasGdocs`)**: Extremely detailed tracking for Google Docs, including page type, tab switching frequency, mapping performance, and errors specific to the canvas-based editor.
    - **Auto-Apply & Auto-Fix (`autoFix`, `autoApply`)**: Tracks when automatic corrections are triggered, reverted, or accepted.
    - **Knowledge Hub (`knowledgeHub`)**: Tracks clicks on related materials, point people, and feature toggles.
    - **Citation Builder (`citationBuilder`)**: A dedicated logger factory for the citation feature.
    - **Always-Available Assistant (`alwaysAvailableAssistant`)**: Tracks feedback submissions and chat deletions.
    - **Iterable (In-App Messages)**: A comprehensive suite of trackers for the in-app messaging system, including when messages are fetched, opened, clicked, deleted, or expire.
- **Evidence**: The body of the `w` class in module `60378` is a long list of these public methods, each corresponding to a specific tracking event.

#### 3. Data Payload and Formatting
- **Structured Data**: Events are sent with structured data. The `S` helper function stringifies JSON payloads for inclusion in logs.
- **Femetrics**: Many events are sent to "femetrics" (`_sendFemetricsRate`), a specialized metrics endpoint, often with additional, structured `femetricsExtra` data. This suggests a separate pipeline for quantitative analysis.
- **Gnar Integration**: The service integrates with a "Gnar" tracking system (`gnar` object), which appears to be another analytics backend, with methods like `sendError` and `trackBeforeSetUser`.
- **User Privacy Control**: The `_enableDataSharing` dependency and the `hideUserInfo` flag on events indicate that there are mechanisms to control or limit the collection of user-identifiable information, likely tied to user consent settings.
- **Evidence**: The `_sendEvent` method shows how `femetricsExtra` is handled. The `_sendException` method shows how error data is structured using `(0, g.nG)`.

### Risks
- **High-Severity Tracking**: The sheer volume and detail of the data being collected constitute a significant privacy risk. The service logs everything from UI clicks and performance timings to unhandled exceptions and feature usage patterns. While there are provisions for hiding user info, the default appears to be comprehensive tracking. This is a core part of the extension's functionality, not an incidental feature.

### Obfuscation & Code Patterns
- **Facade Pattern**: The `Telemetry` class acts as a Facade, providing a simple, unified interface to a complex and varied set of underlying logging and tracking subsystems (`felog`, `femetrics`, `gnar`).
- **Method-per-Event**: The design pattern of having a distinct, named method for each event (e.g., `loginReminderPopupShow()`, `autoCorrectCardLooked()`) makes the code highly readable and self-documenting from a tracking perspective. It's easy to search the codebase to find exactly where a specific event is triggered.
- **Throttling/Debouncing**: The use of `(0, s.hz)` (a memoization/once-per-session utility) and `(0, s.HO)` (a more complex memoization/sampling utility) on many logging methods indicates that high-frequency events are controlled to prevent flooding the analytics endpoints.

## src/js/Grammarly.beautified.js [chunk 33/48, lines 64001-66000]

### Summary
This chunk continues the massive Telemetry class, providing an exhaustive API for logging user interactions, performance metrics, and errors. It includes specific logging for replacements, service availability, feature integrations (Inkwell, gOS), permissions, and A/B testing. It also contains utilities for error classification, domain classification, and debug report generation. A full copy of the DOMPurify library is also embedded in this chunk.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- **Name**: `tracking/RPC`
- **Direction**: content->background
- **Payload Keys**: `...any`
- **Evidence**: `src/js/Grammarly.beautified.js` lines 64700-64713

### Storage
- **Key**: `...`
- **Type**: sessionStorage
- **Purpose**: Fallback for debug logs
- **Evidence**: `src/js/Grammarly.beautified.js` lines 65558-65583

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Obfuscation Hints**:
    - `minified_vars`
    - `webpack_modules`

### Risks
- **Type**: `tracking`
- **Severity**: high
- **Description**: This chunk details an exceptionally comprehensive and granular tracking system. It logs a vast array of user interactions, performance data, and environmental details, including typing duration, view duration, and activity across different domains.
- **Evidence**: `src/js/Grammarly.beautified.js` lines 64001-64670

### Evidence
- `src/js/Grammarly.beautified.js`:64001-66000

## src/js/Grammarly.beautified.js [chunk 34/48, lines 66001-68000]

### Summary
This chunk contains the remainder of the bundled DOMPurify library for HTML sanitization. It also includes a large portion of the 'diff-match-patch' library for computing text differences, and a significant number of functional programming utilities from 'fp-ts' and 'io-ts' for data validation and manipulation. This indicates a strong focus on security, data integrity, and robust, functional-style programming.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Obfuscation Hints**:
    - `minified_vars`
    - `webpack_modules`
    - `third_party_libs`

### Risks
- None in this chunk.

### Evidence
- `src/js/Grammarly.beautified.js`:66001-68000

## [/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js chunk 35/48, lines 68001-70000]

### Summary
This chunk is composed almost entirely of functional programming utilities, characteristic of a library like `fp-ts`. It defines a comprehensive set of helpers and type class instances for common data structures, including `Map`, `ReadonlyArray`, and `Option`. The code is highly abstract and generic, focusing on data manipulation, composition, and type safety.

### Findings
- **Obfuscation Hints**: 
  - `minified_vars`: The code is heavily minified with single-letter variable names.
  - `webpack_modules`: The module structure (e.g., `24332: (e, t, n) => { ... }`) is indicative of Webpack bundling.
  - `function_chains`: Extensive use of higher-order functions and function composition is present.
- **Functional Programming**:
  - **Data Structures**: Provides rich APIs for `Map`, `ReadonlyArray`, and `Option` (a type for handling nullable values).
  - **Type Classes**: Implements standard functional type classes like `Functor` (for `map`), `Applicative` (for `ap`), `Monad` (for `chain`), `Foldable` (for `reduce`), `Filterable`, and `Traversable`.
  - **Utilities**: Includes functions for ordering (`Ord`), equality (`Eq`), semigroup/monoid (for concatenation), partitioning, filtering, searching (`findFirst`, `findLast`), and transforming data structures.
- **No Direct Risks**: No Chrome APIs, network requests, DOM manipulations, or other risky behaviors were identified in this chunk. The code is purely computational and foundational.

### Evidence
- The entire chunk (lines 68001-70000) is evidence of the functional programming library.

## [/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js chunk 36/48, lines 70001-72000]

### Summary
This chunk continues the implementation of a functional programming library, consistent with `fp-ts`. It provides a rich set of utilities for data structures like `ReadonlyArray` and `Record` (key-value objects), and for handling asynchronous operations with `Task` and `TaskEither`. The code is highly generic and foundational, focusing on providing robust, composable tools for data manipulation and async flow control.

### Findings
- **Obfuscation Hints**:
  - `minified_vars`: The code is heavily minified.
  - `webpack_modules`: The bundled module format is present.
  - `function_chains`: The entire chunk is built around function composition and higher-order functions.
- **Functional Programming Constructs**:
  - **`ReadonlyArray`**: A comprehensive module for immutable arrays, including functions for grouping (`Y`), filtering (`Z`), chunking, and folding.
  - **`Record` (`ReadonlyRecord`)**: An extensive module for working with objects as dictionaries, providing safe lookups (`m`), insertion (`p`), filtering (`X`), partitioning (`E`, `I`), mapping (`b`), and traversing (`J`, `L`).
  - **`Task`**: Utilities for creating and managing asynchronous operations that don't fail (e.g., `c` for delays).
  - **`TaskEither`**: A monad for handling asynchronous operations that can fail, combining `Task` and `Either`. It includes constructors (`w`, `y`), error handling (`T`), and composition functions.
  - **`These`**: A data structure representing `Left`, `Right`, or `Both`, useful for diffing or merging data.
  - **Core Utilities**: Includes `pipe` and `flow` for function composition, and definitions for type classes like `Functor`, `Applicative`, `Monad`, `Bifunctor`, `Foldable`, etc.
- **No Direct Risks**: This chunk contains only abstract library code. There are no direct interactions with Chrome APIs, the DOM, or network resources.

### Evidence
- The entire chunk (lines 70001-72000) is evidence of the functional programming library.

## [/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js chunk 37/48, lines 72001-74000]

### Summary
This chunk contains two main libraries: a continuation of the `io-ts` runtime type system and a CSS-in-JS library called `freestyle`. The `io-ts` code provides the building blocks for defining and validating data structures at runtime, which is crucial for handling data from external sources like APIs. The `freestyle` library is used for programmatically creating and managing CSS stylesheets.

### Findings
- **`io-ts` Library**:
  - **Core Types**: Defines fundamental types like `string`, `number`, `boolean`, `null`, `undefined`, `array`, and `record`.
  - **Combinators**: Provides functions to create complex types:
    - `type` / `interface`: For defining object shapes with required properties.
    - `partial`: For object shapes with optional properties.
    - `union`: For creating types that can be one of several other types (e.g., `string | number`).
    - `intersection`: For combining multiple types into one.
    - `literal`: For defining types with exact values (e.g., `literal('foo')`).
    - `keyof`: For creating a type from the keys of an object.
    - `refine`: For adding custom validation logic to a type.
    - `recursion`: For defining recursive types (e.g., trees).
  - **Validation**: The core purpose of the library is to validate unknown input against these type definitions, returning either the typed data or a detailed list of validation errors.
- **`freestyle` CSS-in-JS Library**:
  - **Dynamic Styles**: Allows for creating CSS rules from JavaScript objects.
  - **Hashing & Uniqueness**: It generates unique class names by hashing style content to avoid collisions and allow for deduplication.
  - **Features**: Supports nested selectors, pseudo-classes, and media queries. It manages a cache of styles and can add/remove rules dynamically.
- **Obfuscation Hints**:
  - `minified_vars`: The code is heavily minified.
  - `webpack_modules`: The code is bundled using Webpack.
- **No Direct Risks**: This chunk consists of foundational library code. No risky behaviors, API calls, or sensitive data handling were observed.

### Evidence
- **`io-ts`**: The presence of `validate`, `decode`, `encode`, and type constructors like `InterfaceType`, `UnionType`, `LiteralType` throughout the chunk.
- **`freestyle`**: The presence of functions like `registerStyle`, `registerKeyframes`, and classes like `FreeStyle`, `Rule`, and `Style` (module `46832`).

## src/js/Grammarly.beautified.js [chunk 38/48, lines 74001-76000]

### Summary
This chunk continues the implementation of the 'io-ts' library, defining complex type constructors like `PartialType`, `DictionaryType`, `UnionType`, `IntersectionType`, and `TupleType`. It also includes the implementation for 'monocle-ts', a library for functional optics (Lens, Prism, etc.). A Levenshtein distance function is also present. The latter half contains many small modules exporting hashed CSS class names, indicating a CSS-in-JS styling approach.

### Findings
- **Libraries**: 
  - `io-ts`: Continuation of the runtime type-checking library.
  - `monocle-ts`: Implementation of functional optics (Lens, Prism, Optional, etc.).
  - `CSS-in-JS`: Numerous modules exporting hashed class names (e.g., `ideateButton: "_ErYR"`), a common pattern for scoped CSS.
- **Utilities**:
  - A Levenshtein distance implementation for string similarity calculation.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as webpack modules.
  - `minified_vars`: Variable names are minified.

### Risks
- None identified in this chunk.

### Evidence
- `src/js/Grammarly.beautified.js:74001-76000`

## src/js/Grammarly.beautified.js [chunk 39/48, lines 76001-78000]

### Summary
This chunk contains a significant portion of the React DOM library. It includes the core logic for React's synthetic event system, handling of DOM properties and attributes, controlled components, and event scheduling. It defines numerous event handlers and the internal Fiber node traversal logic for event dispatching.

### Findings
- **Libraries**: 
  - `react-dom`: The code is clearly identifiable as part of React's DOM renderer. It includes internal symbols like `__reactFiber$`, `__reactProps$`, and the synthetic event system implementation.
- **DOM Interaction**:
  - Extensive DOM manipulation and event handling logic is present, including `document.createElement`, `element.addEventListener`, `element.dispatchEvent`, and management of element properties like `value`, `checked`, `defaultValue`.
  - Logic for handling controlled components (e.g., `<input>`, `<textarea>`).
  - Fiber node traversal (`qi`, `qi`) and event dispatching logic (`Ni`, `ji`).
- **Obfuscation Hints**:
  - `webpack_modules`: The code is part of a webpack bundle.
  - `minified_vars`: Variable names are heavily minified.

### Risks
- None identified in this chunk.

### Evidence
- `src/js/Grammarly.beautified.js:76001-78000`

## src/js/Grammarly.beautified.js [chunk 40/48, lines 78001-80000]

### Summary
This chunk continues the React DOM implementation, focusing on the core reconciliation (diffing) algorithm. It includes the internal logic for React's context API, component lifecycle methods (`shouldComponentUpdate`, `getDerivedStateFromError`), the main reconciler function (`So`, `wo`), and the internal implementation of various hooks (`useState`, `useEffect`, `useReducer`, `useRef`, etc.). It also contains logic for handling Suspense and dehydrated server-rendered content.

### Findings
- **Libraries**: 
  - `react-dom`: This is a continuation of the React DOM library, specifically the reconciler. It contains the logic for creating, updating, and deleting Fiber nodes.
- **React Internals**:
  - **Context API**: Implementation of `createContext`, `useContext`, and context propagation (`Pr`, `Lr`).
  - **Reconciliation**: The core diffing algorithm (`So`, `wo`) for handling children arrays, keyed fragments, and single nodes.
  - **Hooks**: The internal implementation of many standard React hooks, including the state management (`Rs`, `Ss`) and effect hooks (`Ms`, `Bs`).
  - **Suspense & Hydration**: Logic for handling `Suspense` boundaries (`Ba`) and hydrating server-rendered content (`ho`, `po`).
  - **Component Lifecycle**: Logic for invoking lifecycle methods like `shouldComponentUpdate`, `getDerivedStateFromProps`, and error boundaries (`ga`).
- **Obfuscation Hints**:
  - `webpack_modules`: The code is part of a webpack bundle.
  - `minified_vars`: Variable names are heavily minified.

### Risks
- None identified in this chunk.

### Evidence
- `src/js/Grammarly.beautified.js:78001-80000`
## src/js/Grammarly.beautified.js [chunk 41/48, lines 80001-82000]

### Summary
This chunk continues the implementation of the `react-dom` library, focusing on the "commit" phase of the reconciliation process. It contains the logic for applying the calculated changes to the actual DOM, including inserting, updating, and deleting DOM nodes. It also handles the invocation of component lifecycle methods like `componentDidMount` and `componentWillUnmount`, and the execution of `useEffect` hooks. Furthermore, this section includes the final implementation of the public React DOM APIs such as `createRoot`, `hydrateRoot`, `render`, and `unmountComponentAtNode`, and the logic for integrating with the React DevTools extension.

### Findings
- **DOM Manipulation**:
  - `Pa`, `al`, `ll`: Functions for inserting DOM nodes (`appendChild`, `insertBefore`).
  - `hl`: Function for handling the removal of DOM nodes (`removeChild`).
  - `Oa`: Logic for updating DOM element properties and styles.
  - `de`: Handles `dangerouslySetInnerHTML`.
  - `he`: Sets `textContent`.
- **Lifecycle & Hooks**:
  - `nl`, `tl`: Functions to create and destroy `useEffect` hooks.
  - `il`: Attaches `ref`s to DOM nodes or component instances.
  - `Qa`: Detaches `ref`s during unmounting.
  - `fl`: Part of the commit phase that calls `componentWillUnmount`.
  - `bl`: Part of the commit phase that calls `componentDidMount` and `componentDidUpdate`.
- **React DOM Public API**:
  - `t.createRoot`: Implementation for the modern `createRoot` API.
  - `t.hydrateRoot`: Implementation for the modern `hydrateRoot` API.
  - `t.render`: Implementation for the legacy `render` API.
  - `t.hydrate`: Implementation for the legacy `hydrate` API.
  - `t.unmountComponentAtNode`: Implementation for unmounting a React root.
  - `t.flushSync`: Implementation for synchronous updates.
- **DevTools Integration**:
  - Contains the injection logic for `__REACT_DEVTOOLS_GLOBAL_HOOK__`, allowing the extension to connect and inspect the component tree.
- **Obfuscation Hints**:
  - `minified_vars`: Many single or double-letter variable names are used (`e`, `t`, `n`, `i`, `r`).
  - `webpack_modules`: The code is part of a larger webpack bundle.

### Evidence
- **File**: `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js`
- **Lines**: 80001-82000

## src/js/Grammarly.beautified.js [chunk 42/48, lines 82001-84000]

### Summary
This chunk is a collection of several important utility libraries bundled together. It includes `react-fast-compare` for deep object comparison, the `usePopper` React hook for advanced element positioning, a `react-is` like utility for type-checking React components, and a polyfill or wrapper for the `ResizeObserver` API. Most significantly, this chunk contains a large portion of the RxJS library, including the core `Observable`, `Subject`, `Subscriber`, and `Subscription` classes, as well as numerous operators for creating and manipulating observable streams.

### Findings
- **Libraries**:
  - **`react-fast-compare`**: A utility for deep-comparing two objects, useful for `React.memo` or `shouldComponentUpdate`.
  - **`usePopper` (from `react-popper`)**: The React hook implementation for Popper.js, used for positioning popovers, tooltips, and dropdowns.
  - **`react-is` (or similar)**: A collection of functions to check the type of a React component (e.g., `isElement`, `isFragment`, `isContextProvider`).
  - **`ResizeObserver` Polyfill**: A full implementation of the `ResizeObserver` API to monitor changes in an element's size, ensuring cross-browser compatibility.
  - **RxJS (Reactive Extensions for JavaScript)**: A substantial part of the RxJS library is included, providing powerful tools for reactive programming.
    - **Core Classes**: `Observable`, `Subject` (and its variants like `BehaviorSubject`, `ReplaySubject`), `Subscriber`, `Subscription`.
    - **Creation Operators**: `of`, `from`, `fromEvent`, `interval`, `timer`, `throwError`, `race`, `zip`, `combineLatest`, `defer`, `iif`.
    - **Pipeable Operators**: The infrastructure for operators like `map`, `filter`, `mergeMap`, etc. is present.
- **DOM/Browser APIs**:
  - `document.createElement`: Used by `usePopper`.
  - `getComputedStyle`, `clientWidth`, `clientHeight`: Used by the `ResizeObserver` logic to measure elements.
  - `requestAnimationFrame`, `setTimeout`: Used for scheduling.
  - `MutationObserver`: Used by the `ResizeObserver` polyfill to detect DOM changes.
- **Obfuscation Hints**:
  - `minified_vars`: Widespread use of single-letter variables (`e`, `t`, `n`, `i`, `r`).
  - `webpack_modules`: The code is clearly part of a webpack bundle, with module IDs like `82330`, `52654`, `67139`.

### Evidence
- **File**: `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js`
- **Lines**: 82001-84000
## src/js/Grammarly.beautified.js [chunk 43/48, lines 84001-86000]

### Summary
This chunk continues the bundled RxJS library, containing the implementation for a large number of pipeable operators. These operators are the core building blocks for creating complex asynchronous data streams. The code includes logic for transformation, filtering, combination, error handling, and various utility functions that can be chained together using the `.pipe()` method on an Observable.

### Findings
- **RxJS Operators**: A significant number of RxJS operators are defined in this chunk.
  - **Transformation**: `map`, `scan`, `mergeMap` (and its alias `flatMap`), `switchMap`, `concatMap`, `exhaustMap`, `pluck`.
  - **Filtering**: `filter`, `take`, `skip`, `debounceTime`, `distinctUntilChanged`, `single`, `first`, `last`, `ignoreElements`, `sample`.
  - **Combination**: `zip`, `combineLatest`, `merge`, `race`, `startWith`, `pairwise`, `concat`.
  - **Error Handling**: `catchError` (minified as `B`), `retry`, `retryWhen`.
  - **Utility**: `tap` (minified as `x`), `delay`, `finalize`, `subscribeOn`.
  - **Buffering & Windowing**: `buffer`, `bufferCount`, `bufferTime`, `bufferToggle`, `bufferWhen`.
  - **Conditional & Boolean**: `every`, `isEmpty`, `defaultIfEmpty`, `find`, `findIndex`.
  - **Multicasting**: `multicast`, `publish`, `publishReplay`, `publishLast`, `publishBehavior`, `share`, `shareReplay`.
- **Obfuscation Hints**:
  - `minified_vars`: Extensive use of single-letter variables.
  - `webpack_modules`: The code is organized into webpack modules.

### Evidence
- **File**: `/Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly.beautified.js`
- **Lines**: 84001-86000

## src/js/Grammarly.beautified.js [chunk 44/48, lines 86001-88000]

### Summary
This chunk is a mix of several important bundled libraries. It continues the inclusion of RxJS operators, provides the core implementation for RxJS schedulers, contains a bundled version of React's internal cooperative scheduler, and includes the 'typestyle' CSS-in-JS library.

### Findings
- **RxJS Operators**:
  - `take`, `takeLast`, `takeUntil`, `takeWhile`: Operators for filtering and completing streams based on counts or notifier observables.
  - `tap`: Operator for performing side-effects.
  - `throttle`, `timeout`: Operators for controlling the rate of emissions and handling timeouts.
  - `toArray`: Operator to collect all source values into an array.
  - `window`: Operator to branch source Observable into sub-observables.
  - `zip`: Operator to combine multiple observables.
- **RxJS Schedulers**:
  - `asyncScheduler`: Schedules tasks asynchronously (like `setInterval`).
  - `asapScheduler`: Schedules tasks on the microtask queue (like `Promise.resolve().then()`).
  - `queueScheduler`: Schedules tasks synchronously in a queue.
  - `animationFrameScheduler`: Schedules tasks on `requestAnimationFrame`.
- **React Internal Scheduler**:
  - A bundled version of the `scheduler` package is present, used by React for cooperative multitasking.
  - Exports priority levels like `unstable_ImmediatePriority`, `unstable_UserBlockingPriority`, `unstable_NormalPriority`.
  - Includes core functions like `unstable_scheduleCallback`, `unstable_runWithPriority`, and `unstable_shouldYield`.
- **CSS-in-JS**:
  - The `typestyle` library is included for creating and managing CSS styles in JavaScript.
  - Core functions like `style`, `stylesheet`, `keyframes`, `cssRule`, and `media` are present.
- **Obfuscation Hints**:
  - `webpack_modules`: The code continues to be structured as webpack modules.

### Risks
- No specific risks identified in this chunk.

### Evidence
- src/js/Grammarly.beautified.js:86001-88000

## src/js/Grammarly.beautified.js [chunk 45/48, lines 88001-90000]

### Summary
This chunk finalizes the 'typestyle' library and introduces several new, significant components. It includes a complete, bundled version of the 'ua-parser-js' library for detailed user agent string analysis. It also contains a UUID v4 generator and the high-level definitions for two major features: the "AI Detector" and the "Plagiarism Checker". These feature definitions specify their communication protocols and, importantly, how their respective UI and logic modules are dynamically loaded on demand.

### Findings
- **`typestyle` (continued)**:
  - The chunk contains the rest of the `TypeStyle` class implementation, including methods for stylesheet creation (`stylesheet`), style updates, and managing the `<style>` tag in the DOM (`setStylesTarget`, `_getTag`).
- **`ua-parser-js`**:
  - A full, minified-but-readable version of the popular `ua-parser-js` library is present.
  - It's used to parse the browser's user agent string to identify the browser name/version, engine, OS, CPU architecture, and device type/
### FindinThis is a significant piece of fingerprinting/analytics code.
- **UUID Generation**:
  - A UUID v4 generator is included, likely the `uuid` npm package. It uses `crypto.randomUUID` if available, with a fallback to `crypto.getRandomValues`.
- **Feature: AI Detector**:
  - Defines the feature's internal ID (`aiDetector`), protocol for state management (`panelState/:docId`), and event handling.
  - Crucially, it defines `integrations` for `documentActivate`, `textDecorationsActivate`, `inlineCardActivate`, and `assistantActivate`.
  - Each integration uses dynamic imports (`Promise.all([n.e(5020), ...]).then(...)`) to load the necessary code chunks for the feature on demand. This is a form of dynamic code loading.
- **Feature: Plagiarism Checker**:
  - Similar to the AI Detector, it defines the feature ID (`plagiarismChecker`), protocol, and state management.
  - It also uses dynamic imports via `Promise.all([...]).then(...)` to load its components when activated.
- **LRU Cache**:
  - An implementation of a Least Recently Used (LRU) cache is present (`class i`).
- **GDS (Grammarly Design System) Components**:
  - The code includes what appear to be React components from Grammarly's internal design system, such as `Flex`, `Typography`, `Icon`, and `ThemeProvider`.
  - Several GDS icons are defined as React components (e.g., `InterfaceError`, `InterfaceIgnore`, `LogoLogomarkColorDefault`).

### Risks
- **Fingerprinting**: The inclusion of `ua-parser-js` allows for detailed fingerprinting of the user's environment (browser, OS, device), which can be a privacy concern if not handled transparently.
- **Dynamic Code Loading**: The use of `n.e(...)` (webpack's dynamic import) to load feature modules is a form of dynamic code execution. While common and often benign, it's a pattern to note as it loads and runs code that isn't present at initial script evaluation.

### Evidence
- src/js/Grammarly.beautified.js:88001-90000

## src/js/Grammarly.beautified.js [chunk 46/48, lines 90001-92000]

### Summary
This chunk contains a comprehensive, self-contained implementation of an OAuth 2.0 client, which appears to be Grammarly's internal authentication library. It manages the entire lifecycle of authentication tokens, including acquisition via authorization code grant (with PKCE), refreshing expired tokens, and exchanging tokens. It features robust error handling, retry logic with exponential backoff, and a mutex lock to prevent race conditions during token refreshes.

### Findings
- **OAuth 2.0 Client**:
  - Implements the full client-side logic for OAuth 2.0 flows.
  - `getAccessToken`: The main function to retrieve a valid access token, handling caching, refreshing, and acquisition.
  - **Token Refresh**: Logic to use a `refresh_token` to get a new `access_token`.
  - **Token Exchange**: Logic for `urn:ietf:params:oauth:grant-type:token-exchange`.
  - **Anonymous Authentication**: Supports a flow for anonymous users, likely exchanging a client ID for a token.
- **PKCE (Proof Key for Code Exchange)**:
  - `I()` function generates a `codeVerifier` and a `codeChallenge`.
  - The code challenge is created by SHA-256 hashing the verifier and Base64URL encoding the result.
  - A custom SHA-256 implementation is bundled.
- **Token Storage & Caching**:
  - `W` class (`StorageCache`) acts as a wrapper around a storage medium (e.g., `localStorage` or an in-memory store) to `get`, `set`, and `remove` tokens.
  - `F` function (`getValidTokens`) checks if cached tokens are expired.
- **Concurrency Control**:
  - A mutex lock (`z` function) is implemented to ensure that only one token refresh/acquisition request is active at a time across different tabs or frames. It uses a two-key system (`__$$MUTEX_x`, `__$$MUTEX_y`) in storage to manage the lock.
  - `j` class (`Lock`) manages acquiring and releasing this lock.
- **HTTP Client & Error Handling**:
  - `P` class (`HttpClient`) is a wrapper around `fetch`.
  - Implements retry logic with exponential backoff (`A` function) for network requests.
  - Defines custom error classes like `g` (`HttpError`) and `p` (`AuthError`).
- **Authentication Endpoints**:
  - Defines endpoint URLs for `prod`, `preprod`, and `qa` environments.
  - Production URLs include:
    - `https://auth.grammarly.com/v4/api/oauth2/authorize`
    - `https://auth.grammarly.com/v4/api/oauth2/token`
    - `https://auth.grammarly.com/v4/api/oauth2/exchange`
    - `https://auth.grammarly.com/v4/api/userinfo`
- **GDS (Grammarly Design System)**:
  - More GDS icons are defined as React components (`OutcomeClarity`, `OutcomeCorrectness`, `OutcomeDelivery`, `OutcomeEngagement`).
  - A large set of color tokens (e.g., `Blue0`, `Green60`, `Red100`) and design system constants (for spacing, radius, elevation) are defined.

### Risks
- No new risks identified. The implementation of OAuth 2.0 with PKCE is a standard and secure practice. The mutex lock is a good security and performance measure to prevent token request storms.

### Evidence
- src/js/Grammarly.beautified.js:90001-92000

## src/js/Grammarly.beautified.js [chunk 47/48, lines 92001-94000]

### Summary
This chunk contains the remainder of the comprehensive client-side authentication library and, critically, the entire Webpack runtime bootstrap logic. The authentication code completes the OAuth 2.0 flow with token validation, storage abstractions, and complex retry/refresh logic. The Webpack runtime section includes the dynamic chunk loading mechanism (`__webpack_require__.e`) and a large, revealing manifest that maps internal chunk IDs to human-readable feature names. This manifest provides a clear map of the extension's internal features, from UI components like popups (`freePremiumUphookPopup`, `dunningMessagePopup`) to integrations with specific websites (`confluenceRule`, `jiraRule`, `slackRule`, `googleDocsRule`).

### Findings
- **Storage Operations**:
  - `gr-oauth-key`: Stores the OAuth token object (access token, refresh token, expiration). (get/set/remove)
  - `gr-oauth-service-state`: Stores state related to the authentication service, like degradation timestamps. (set)
  - `gr-oauth-state`: Stores the state and code verifier for the PKCE flow. (get/set/remove)

- **Endpoints**:
  - The authentication service (`de`) continues to define interactions with dynamic URLs constructed from `te[t]`, which holds environment-specific base URLs.
    - `<DYNAMIC>/oauth2/token` (POST)
    - `<DYNAMIC>/oauth2/exchange` (POST)
    - `<DYNAMIC>/oauth2/revoke` (POST)
    - `<DYNAMIC>/user-info` (POST)

- **Dynamic Code**:
  - **Webpack Runtime**: The core of Webpack's runtime is present, including `__webpack_require__.e`, the function responsible for dynamically loading additional JavaScript chunks from the server.
  - **Webpack Chunk Manifest**: A very large object maps numeric chunk IDs to descriptive, human-readable names. This acts as a feature manifest for the entire extension, revealing the names of dozens of internal modules.
    - Example mappings: `5213: "jiraRule"`, `498: "slackRule"`, `8721: "assistant"`, `7717: "snippets"`, `3896: "citationBuilderIntegration"`, `9414: "automaticallyAppliedAlertView"`.

- **Obfuscation Hints**:
  - **API Client Patterns**: The `oe` and `de` classes form a structured, multi-layered API client for handling authentication.
  - **TypeScript Generated Enums**: The `re` enum (`Anonymous`, `Authenticated`, `Unknown`) is a common TypeScript pattern.
  - **Webpack Modules**: The entire file is structured as a series of Webpack modules, and this chunk contains the runtime that ties them together.

- **Risks**:
  - **Fingerprinting (Low)**: The Webpack chunk manifest exposes the internal module structure and feature names of the extension. While not directly a user privacy risk, it significantly simplifies reverse engineering and analysis of the extension's capabilities.

### Evidence
- **Authentication Logic**: `src/js/Grammarly.js`, lines 92178-93698 (classes `de`, `ge`, `fe`, `be`)
- **Webpack Runtime & Manifest**: `src/js/Grammarly.js`, lines 93725-94238

## src/js/Grammarly.beautified.js [chunk 48/48, lines 94001-94238]

### Summary
This final chunk contains the remainder of the Webpack runtime, detailing the mechanisms for loading dynamic code and styles. A key finding is a robust fallback for dynamic imports (`import()`). If a chunk fails to load via a standard dynamic import, the runtime sends a `CODE_SPLITTING_INJECT` message to another part of the extension (likely the service worker) to inject the script directly. It then polls a global variable (`window.webpackChunk`) to wait for the injection to complete. This chunk also shows how CSS stylesheets are dynamically loaded and how the extension's public asset path is resolved at runtime using `chrome.runtime.getURL`.

### Findings
- **Chrome APIs**:
  - `chrome.runtime.sendMessage`: Used in the dynamic chunk loading fallback to request script injection.
  - `chrome.runtime.getURL`: Used to construct the absolute URL for extension assets (like JS chunks and CSS files) at runtime.

- **Messaging**:
  - A message with the `type: "CODE_SPLITTING_INJECT"` is sent when a dynamic import fai
### Findings
- **Chrome APIs**:
  - `chrome.runtime.sendMessage`: Used in the dynamic chunk loading fallback to request script injection.
  - `chrome.runtime.g CSS stylesheets into the document head.
  - It also has logic to create `<script>` tags for chunk loading, although the primary mechanism appears to be `import()`.

- **Dynamic Code**:
  - **Webpack Runtime (`__webpack_require__.l`)**: This function implements the logic for loading chunks. It includes a `try...catch` block around the `import()` call. The `catch` block triggers the `chrome.runtime.sendMessage` fallback.
  - **Webpack CSS Loading**: The `loadStylesheet` function and `__webpack_require__.f.miniCss` object manage the dynamic loading of CSS chunks, ensuring they are only loaded once.

- **Obfuscation Hints**:
  - **Webpack Modules**: This is the final part of the Webpack bootstrap code that manages the entire module system.

### Evidence
- **Dynamic Import Fallback**: `src/js/Grammarly.js`, lines 94088-94143 (within `__webpack_require__.l`)
- **Chrome API Usage**: `src/js/Grammarly.js`, lines 94116 (`chrome.runtime.sendMessage`), 94159-94160 (`chrome.runtime.getURL`)
- **CSS/Asset Loading**: `src/js/Grammarly.js`, lines 94162-94201
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.js [chunk 1/53, lines 1-2000]

### Summary
This chunk contains webpack module definitions, color constants, and various utility functions. It defines asset URLs for emojis and animations. The code is clearly a bundled artifact.

### Endpoints
- https://assets.grammarly.com/emoji/v1/ (line 234)
- https://assets.grammarly.com/animations/v1/ (line 235)

### Obfuscation
- Webpack module pattern detected.
- Minified variable names detected.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.beautified.js:233-236
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.js [chunk 2/53, lines 2001-4000]

### Summary
This chunk continues the implementation of a text processing library (similar to Quill Delta) and defines the core data models for different types of Grammarly "Alerts" (e.g., Premium, Plagiarism, ToneAI, ShortenIt). It includes logic for managing alert states, ranges, and alternatives. It also contains React-like hooks and focus management utilities. This section is focused on internal application logic and data structures.

### Obfuscation
- Minified variable names detected.

### Evidence
- /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.beautified.js:2001-4000
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.js [chunk 3/53, lines 4001-6000]

### Summary
This chunk defines core data models and managers for Grammarly alerts. It includes a factory for creating different alert types (Plagiarism, ToneAI, etc.), a PositionManager for tracking highlight ranges in the text, a Lens system for filtering alerts, and a comprehensive set of constants for UI actions. The code is part of a Webpack bundle and uses minified variable names.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- Webpack module pattern.
- Minified variable names.

### Risks
- None in this chunk.

### Evidence
- The entire chunk is evidence of the described functionality.
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.js [chunk 4/53, lines 6001-8000]

### Summary
This chunk defines models and utilities for feature flagging (ExperimentClient, GatesService), Data Loss Prevention (DLP) with text sanitization, UI components (CardItem), DOM utilities, and document context management (DocumentContext).

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- The code includes DOM manipulation utilities, but no sinks are directly exposed in this chunk.

### Dynamic Code/Obfuscation
- Webpack module pattern.
- Minified variable names.

### Risks
- None in this chunk.

### Evidence
- The entire chunk is evidence of the described functionality.
## /Users/jfri/Downloads/kbfnbcaeplbcioakkpcpgfkobkghlhen/src/js/Grammarly-gDocs.js [chunk 5/53, lines 8001-10000]

### Summary
This chunk is a large module that appears to be a custom build or re-export of the RxJS library. It also includes modules for feature flagging and treatment management (ExperimentClient, GatesService, TreatmentService), and various utility functions. The code is structured as webpack modules.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- Webpack module pattern.
- Minified variable names.

### Risks
- None in this chunk.

### Evidence
- The entire chunk is evidence of the described functionality.
## src/js/Grammarly-gDocs.beautified.js [chunk 6/53, lines 10001-12000]

### Summary
This chunk contains a collection of high-level utility modules. Key functionalities include reactive utilities (RxJS-like), string and DOM sanitization (isomorphic-dompurify), a comprehensive logging and metrics framework, and core primitives for Operational Transforms (OT) used in text editing.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **isomorphic-dompurify**: The code includes a reference to `i().sanitize(e)`, which is characteristic of DOMPurify, likely used to prevent XSS attacks by sanitizing HTML content before it's inserted into the DOM. (line 10220)

### Dynamic Code/Obfuscation
- **Minified variable names**: The code continues to use short, non-descriptive variable names (e.g., `e`, `t`, `n`, `r`).
- **Webpack module pattern**: The code is structured as a series of webpack modules, identified by numeric module IDs (e.g., `99887`, `83816`, `86214`).

### Risks
- No specific risks identified in this chunk. The use of a DOM sanitizer is a positive security indicator.

### Notable Functionality
- **Logging Framework**: A sophisticated logging framework is defined with features like log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL), rate limiting, different appenders (console, remote via fetch), and context management. This is a robust system for monitoring and debugging.
- **Metrics/TimeSeries**: A metrics collection framework is present for tracking performance counters and timers (`F.getRootMetric()`, `X.getRootMetric()`).
- **Operational Transforms (OT)**: Defines the core data structures and operations for OT, which is essential for synchronizing changes in a collaborative editor like Google Docs. It includes types for `insert`, `delete`, and `retain` operations, along with attributes.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:10001-12000

## src/js/Grammarly-gDocs.beautified.js [chunk 7/53, lines 12001-14000]

### Summary
This chunk details the data models for Grammarly alerts, including parsing from backend messages and transformation logic. It contains sophisticated machinery for Operational Transforms (OT) via an `Alternative` class, crucial for applying suggestions. It also includes what appears to be the Popper.js library, used for positioning UI elements like suggestion cards.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **Popper.js**: The code from line ~13500 onwards is a bundled version of Popper.js, a library used for positioning popovers and tooltips. This is used to render the suggestion cards next to the highlighted text in the document. It involves calculating positions and applying CSS transforms to DOM elements.

### Dynamic Code/Obfuscation
- **Minified variable names**: The code continues to use short, non-descriptive variable names.
- **Webpack module pattern**: The code is structured as a series of webpack modules.

### Risks
- No specific risks identified. The functionality is related to core editing and UI rendering.

### Notable Functionality
- **Alert Data Models**: This chunk defines the data structures for various Grammarly alerts (e.g., `Plagiarism`, `ToneAI`, `EthicalAI`, `Takeaway`, `ShortenIt`, `CitationDetection`). It includes logic for parsing these from raw backend messages (`fromAlertMessage`) and handling different properties and layouts.
- **Operational Transforms (`Alternative` class)**: A significant portion is dedicated to the `Alternative` class, which encapsulates a proposed text change. It has complex logic for rebasing (`rebase`, `_internalRebase`) and composing (`compose`) these changes against other document edits. This is fundamental to how Grammarly suggestions work in a live-editing environment like Google Docs.
- **Popper.js Integration**: The inclusion of Popper.js indicates how Grammarly's UI elements (the pop-up cards with suggestions) are positioned dynamically within the host application's DOM.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:12001-14000

## src/js/Grammarly-gDocs.beautified.js [chunk 8/53, lines 14001-16000]

### Summary
This chunk continues the implementation of Popper.js for UI element positioning and defines a comprehensive schema for the extension’s UI components. It details the structure of various content types like text, buttons, cards, lists, and layout containers using a runtime type-checking library. This forms the backbone of the dynamic UI rendering system.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **Popper.js**: The first part of this chunk concludes the Popper.js library code, which is used for dynamically positioning UI elements in the DOM.

### Dynamic Code/Obfuscation
- **Minified variable names**: The code continues to use short, non-descriptive variable names.
- **Webpack module pattern**: The code is structured as a series of webpack modules.

### Risks
- No specific risks identified.

### Notable Functionality
- **UI Component Schema**: The majority of this chunk is dedicated to defining a detailed schema for the extension's UI components. This is done using a library that provides runtime type checking (similar to `io-ts` or `zod`).
- **Content Types**: It defines a wide variety of content types that can be rendered, including:
    - **Layouts**: `column`, `row`, `block`, `box`, `scroll`, `list`.
    - **Interactive Elements**: `button`, `slider`, `dropDownMenuButton`, `selectableDropDownMenu`, `clickableText`.
    - **Informational Elements**: `text`, `icon`, `image`, `tooltip`, `progressBar`.
    - **Cards**: `inlineCard`, `assistantCard`, `shortFormCard`, `longFormCard`.
    - **Behaviors**: Defines behaviors that can be attached to components, such as `onMount`, `onUnmount`, and animations (`fadeIn`, `fadeOut`, `textShimmer`).
- **Action and Event Schema**: Defines the schema for user actions (`UserAction`) and interactions with UI elements, which are dispatched to the application's logic.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:14001-16000

## src/js/Grammarly-gDocs.beautified.js [chunk 9/53, lines 16001-18000]

### Summary
This chunk concludes the extensive UI component schema definitions and introduces two major modules: a comprehensive set of design system constants and a powerful suite of utility functions for creating, traversing, querying, and manipulating the UI component tree. This represents the core engine for the extension's dynamic user interface.

### Chrome APIs
- None in this chunk.

### Event Listeners
- None in this chunk.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- None in this chunk.

### Dynamic Code/Obfuscation
- **Minified variable names**: The code continues to use short, non-descriptive variable names.
- **Webpack module pattern**: The code is structured as a series of webpack modules.

### Risks
- No specific risks identified.

### Notable Functionality
- **UI Schema Finalization**: The first part of the chunk finalizes the definitions for various UI components like sliders, popovers, lists, and native modals.
- **Design System Constants (Module 62101)**: A large module exports numerous enums that define the extension's design system. This includes:
    - **Colors**: A vast palette of core and semantic colors (e.g., `V6_SemanticBackgroundBrandDefault`, `V6_CoreNeutralGray80`).
    - **Component States**: `Enabled`, `Disabled`, `Selected`, `Hidden`.
    - **Styles**: Button kinds (`Primary`, `Secondary`), text formats (`Bold`, `Italic`), alignments, and more.
    - **Sizing & Spacing**: Constants for radii, spacing, and opacity.
    - **Iconography**: A list of known icon names (`close`, `arrow-right`, `diamond`, `sparkles`).
- **UI Tree Utilities (Module 14325 & 86349)**: A significant portion of this chunk is dedicated to a library of functions for working with the UI component tree. These utilities provide the logic for managing the dynamic UI. Key capabilities include:
    - **Tree Traversal**: `forEach`, `traverse` (with pre-order and post-order strategies).
    - **Tree Manipulation**: `map`, `filter`, `filterMap` for transforming the component tree, and `over` for updating a specific node by its ID path.
    - **Component Creation**: A large set of factory functions (`create`, `createIcon`, `createRow`) for programmatically building UI components that conform to the schema.
    - **Querying**: Functions to find components (`findFirst`), check for emptiness (`isEmpty`), and extract specific data like alert IDs (`getAlertIds`, `getAllAlertIds`).

### Evidence
- src/js/Grammarly-gDocs.beautified.js:16001-18000
## src/js/Grammarly-gDocs.beautified.js [chunk 10/53, lines 18001-20000]

### Summary
This chunk provides the concrete implementation for the UI tree manipulation functions declared in the previous chunk. It also includes a color mapping utility to resolve design system color tokens to hex values, a typing tracker for analytics, a dictionary card UI manager, and the initial setup for the main content script. This script orchestrates page integration, settings management, and communication with the background script.

### Chrome APIs
- None in this chunk.

### Event Listeners
- **`grammarly-assistant-dispose`**: A listener is set up to dispose of orphaned content scripts when the extension is updated.
- **`click`**: The dictionary card feature listens for double-click events to trigger definition lookups.

### Messaging
- **`en` class (RPC wrapper)**: A class is defined to wrap message passing between the content script and background script, providing a simple RPC-like interface over `message.on` and `message.sendTo`.

### Storage
- **`fieldsSettings`**: Actions are defined to patch settings for specific fields.
- **`iterable`**: Actions are defined to manage cooldowns and impression counts for in-app messages from Iterable.
- **`extensionSettings`**: A large number of actions are defined to modify user settings, such as dismissing notifications, updating onboarding status, and managing feature-specific popups.

### Endpoints
- None in this chunk.

### DOM/Sinks
- **Dictionary Card**: A manager (`et`) is defined to show and hide a dictionary definition card. It creates and injects a UI component (`<grammarly-dictionary-card>`) into the DOM when a user double-clicks a word.
- **Desktop Hidden Field Integration**: A class (`It`) manages a hidden `<div>` injected into the page to communicate with the Grammarly for Windows desktop app, indicating the active state and integration mode.

### Dynamic Code/Obfuscation
- **Minified variable names**: The code continues to use short, non-descriptive variable names.
- **Webpack module pattern**: The code is structured as a series of webpack modules.

### Risks
- No specific risks identified.

### Notable Functionality
- **UI Tree Implementation**: This chunk contains the implementation for the UI tree traversal and manipulation functions (`map`, `filter`, `forEach`, etc.) that were declared previously.
- **Typing Tracker (`Pe` class)**: A class responsible for tracking user typing for analytics. It detects typing events, identifies the integration context (e.g., integrated, unsupported), determines the language, and sends typing metrics to the background script.
- **Content Script Orchestration**: The latter part of the chunk begins the main content script logic. It sets up the connection to the background script, initializes the data store, and creates action dispatchers for various features (settings, GDocs, user data).
- **Double-Click Dictionary**: A `ot` class is implemented to detect double-clicks on text, extract the selected word, and trigger a handler to show the dictionary card with definitions.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:18001-20000
## src/js/Grammarly-gDocs.beautified.js [chunk 11/53, lines 20001-22000]

### Summary
This chunk is rich with core extension functionality, providing a comprehensive abstraction layer over various Chrome APIs. It introduces the main application class `er` (App) which orchestrates the entire content script lifecycle. A key class, `mn` (ExtensionAPI), acts as a façade, unifying access to storage, tabs, scripting, notifications, cookies, and more, while cleverly handling differences between Manifest V2 and V3. The code also includes wrappers for managed storage, session storage (with an in-memory fallback), native messaging, and a sophisticated scripting/tabs manager. The `er` class ties everything together, initializing controllers, managing state, and handling the dynamic loading and unloading of features based on the page and user settings.

### Chrome APIs
- `chrome.runtime.connectNative`: Used for communication with native applications.
- `chrome.storage.managed`: Wrapped by `an` class for accessing enterprise policies.
- `chrome.storage.session`: Wrapped by `cn` class for MV3 session storage.
- `chrome.scripting.executeScript`: Used in the `dn` class for MV3 script injection.
- `chrome.scripting.insertCSS`: Used in the `dn` class for MV3 CSS injection.
- `chrome.tabs.executeScript`: Used as a fallback for MV2 script injection.
- `chrome.tabs.insertCSS`: Used as a fallback for MV2 CSS injection.
- `chrome.tabs.*`: Extensively wrapped by `dn` for tab management (query, create, update, remove, reload).
- `chrome.action.*` / `chrome.browserAction.*`: Abstracted by `mn` to control the toolbar icon, badge, and popup.
- `chrome.notifications.*`: Wrapped by `mn` to create and manage notifications.
- `chrome.cookies.*`: Wrapped by `mn` for cookie management.
- `chrome.permissions.*`: Wrapped by `mn` to request and check permissions.
- `chrome.sidePanel.*`: Wrapped by `mn` to control the side panel.
- `chrome.i18n.*`: Wrapped by `mn` for internationalization.
- `chrome.identity.*`: Referenced in `mn`.
- `chrome.management.uninstallSelf`: Used to allow the extension to uninstall itself.
- `chrome.runtime.onMessage`: Listener set up to handle code-splitting injection requests.
- `chrome.runtime.setUninstallURL`: Used to specify a URL to open upon uninstallation.

### Event Listeners
- `chrome.storage.session.onChanged`: Used in `cn` to monitor session storage changes.
- `chrome.tabs.onActivated`: Used in `dn` to track active tab changes.
- `chrome.tabs.onUpdated`: Used in `dn` to track tab updates.
- `chrome.windows.onFocusChanged`: Used in `dn` to detect window focus changes.
- `chrome.cookies.onChanged`: Used in `mn` to watch for cookie modifications.
- `chrome.permissions.onAdded`: Watched in `mn`.
- `chrome.permissions.onRemoved`: Watched in `mn`.
- `addEventListener("pageshow", ...)`: Used to detect page restoration from back-forward cache.
- `document.addEventListener("visibilitychange", ...)`: Used to detect when the page becomes hidden.

### Messaging
- **Native Messaging**: `ln.createPort` wraps `chrome.runtime.connectNative`, enabling communication with a native host application.
- **Internal Messaging**: `er` class listens for `Sn.B.Kind.disableOnTab` and `Sn.B.Kind.reloadTab` messages to control its lifecycle.
- **Code Splitting**: A `chrome.runtime.onMessage` listener is set up to dynamically inject scripts when a `CODE_SPLITTING_INJECT` message is received.

### Storage
- **Managed Storage**: `an` class provides validated access to `chrome.storage.managed`, likely for enterprise policies.
- **Session Storage (MV3)**: `cn` class provides a wrapper for `chrome.storage.session`, with a method to grant access to content scripts.
- **In-Memory Storage**: `un` class provides a fallback in-memory storage solution.
- **Persistent Storage**: The `er` (App) class is initialized with a `_persistentStore`, which is used throughout the application logic.

### Obfuscation Hints
- `minified_vars`: The code is heavily minified with single or double-letter variable names (`e`, `t`, `n`, `er`, `mn`, `dn`, etc.).
- `function_chains`: Extensive use of chained method calls and functional programming patterns (e.g., in `er._onUpdate`).
- `webpack_modules`: The module loading pattern (`n(12345)`) is indicative of Webpack bundling.

### Risks
- **Native Code Execution**: The use of `chrome.runtime.connectNative` implies the extension can execute code outside the browser's sandbox by communicating with a native application. This is a powerful capability that requires user trust, as the native component is not subject to the same security restrictions as the extension itself.
- **Third-Party Extension Detection**: The `mn` class contains logic to detect if other specific extensions (`mseditor`, `office`) are installed. While used here likely for conflict resolution, this capability could be used for fingerprinting the user's extension profile.

### Other
- **Manifest V2/V3 Abstraction**: The `dn` (scripting) and `mn` (API façade) classes are designed to work with both MV2 and MV3, abstracting away differences in APIs like `chrome.scripting` vs. `chrome.tabs.executeScript` and `chrome.action` vs. `chrome.browserAction`.
- **Main App Controller**: The `er` class is the central controller for the content script. It manages state, initializes feature controllers (`_textCheckingController`, `_generalPurposeController`), handles dynamic configuration updates, and orchestrates the entire lifecycle of the script on the page.
- **Performance Monitoring**: The code includes logic to measure "Interaction to Next Paint" (INP) using `PerformanceObserver`, sending telemetry about the page's responsiveness.
- **Error Handling**: The code includes robust error handling, such as timeouts for storage access and specific error checking for tab operations (e.g., "Tabs cannot be edited right now").
- **TextMap/TextObserver**: The chunk ends by defining classes like `di` (TextMap), `hi` (TextObserver), and `Gr` (SelectionService), which are fundamental for observing and manipulating text within content-editable elements. This forms the basis of Grammarly's core text analysis functionality.
## src/js/Grammarly-gDocs.beautified.js [chunk 12/53, lines 22001-24000]

### Summary
This chunk details the core logic for discovering and integrating with various rich text editors on a webpage. It introduces the `Io` (GenericPageIntegration) class, which acts as a master controller. This class observes the DOM for potential text fields, matches them against a series of rules for specific editors (Draft.js, CKEditor 5, ProseMirror, Quill, Slate.js), and then instantiates the appropriate `FieldIntegration`. The chunk also contains the sophisticated `is` class and `as` rule for handling integrations within iframes, managing the RPC communication between the host page and the embedded frame. A validation layer (`fs` class) ensures that fields are suitable for integration by checking size, attributes, and page-specific settings. Finally, the chunk defines the data serialization and parsing logic (`Ks`) for communicating with the backend Content API (CAPI).

### Chrome APIs
No new Chrome APIs were directly called in this chunk. The logic here builds upon the API abstractions defined in the previous chunk.

### Event Listeners
- `(0, o.R)(e, "dblclick")`: A double-click listener is attached to textarea integrations.
- The `Io` (GenericPageIntegration) class uses a `MutationObserver` (`_mutations`) to detect when fields are removed from the DOM to clean up integrations.
- It also uses focus and other events to create a `_textFieldsObservable` to discover new fields.

### Messaging
- **Iframe RPC**: The `is` (IframeHostAquaFieldIntegration) class and the `as` (iframeHost rule) set up a robust RPC mechanism between a host page and an integrated iframe. This includes methods for showing cards, opening/closing the assistant, pushing text changes, and syncing highlights, all proxied over the RPC channel.

### Storage
No new storage mechanisms were introduced. This chunk utilizes the existing storage abstractions for configuration and state.

### Obfuscation Hints
- `minified_vars`: Continues to be prevalent (`e`, `t`, `n`, `Io`, `fo`, etc.).
- `webpack_modules`: The `n(...)` pattern for module loading is present.
- `function_chains`: Extensive use of RxJS-style piping and functional chaining is used for observables and rule matching.

### Risks
- **Complex DOM Interaction**: The generic page integration logic is highly complex, relying on `MutationObserver` and various heuristics to detect and manage integrations. This could be a source of performance issues or conflicts with the host web application's own DOM manipulation.

### Other
- **Editor Integration Rules**: A significant portion of this chunk is dedicated to defining integration rules for popular web-based rich text editors:
  - `Ui`: Draft.js
  - `ls`: CKEditor 5
  - `cs`: CLEditor
  - `us`: ProseMirror
  - `ds`: QuillJS
  - `ps`: Slate.js
- **Generic Page Controller (`Io`)**: This class is the orchestrator for all field integrations on a page. It discovers fields, matches them to rules, manages their lifecycle, and handles the complexity of iframe integrations.
- **Iframe Integration Host (`is`, `as`)**: Provides the logic for a Grammarly instance on a host page to control and communicate with a Grammarly integration running inside a child iframe. This is crucial for applications that embed editors in frames.
- **Validation Layer (`fs`)**: Implements a `validate` method that checks various conditions before allowing an integration to proceed, such as field size, attributes (`contenteditable`, `dir="rtl"`), and domain-specific blocklists.
- **CAPI Serialization (`Ks`)**: Defines the serialization/deserialization logic for data structures sent to the "Content API", including document context and client configurations. This is the data contract for backend communication.
## src/js/Grammarly-gDocs.beautified.js [chunk 13/53, lines 24001-26000]

### Summary
This chunk details the core implementation of the CAPI (Content API) connection management and the primary checking service. It includes the client-side RPC proxy, robust connection lifecycle and reconnection logic, and the service that translates editor changes into CAPI messages and vice-versa.

### Findings
- **CAPI Session Client (`Ys` class)**: A proxy class that wraps all CAPI RPC calls (e.g., `pushChanges`, `requestSynonyms`), automatically including the session token. This abstracts the raw RPC mechanism from the rest of the application.
- **CAPI RPC Connection (`ia` class)**: The central manager for the CAPI connection lifecycle. It features sophisticated reconnection logic to handle service worker shutdowns, attempting to reconnect to existing sessions to preserve state. It also buffers outgoing messages to ensure they are sent only when the connection is live.
- **CAPI Checking Service (`_a` class)**: The main implementation of the `CheckingService`. It bridges the editor and the CAPI backend by:
  - Translating CAPI events (`alert_received`, `sdui_add`, `finish`) into internal application messages.
  - Calculating text diffs via its `setDelta` method and pushing them to the backend.
  - Sending user feedback (alert accepts/ignores, etc.) back to CAPI.
- **Integration Rule Factories (`wa`, `ya` namespaces)**: Defines factories and rule sets for creating integrations. This shows a configurable, rule-based system for deciding how and where to integrate, with specific logic for Google Docs comments and canvas, as well as generic catch-all rules.
- **Obfuscation Hints**: `minified_vars`, `function_chains`.

### Risks
- None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:24001-26000
## src/js/Grammarly-gDocs.beautified.js [chunk 14/53, lines 26001-28000]

### Summary
This chunk focuses on high-level feature implementations and their integration into the page. It contains the core logic for the "Cheetah" (GrammarlyGO) feature, including its state management, UI rendering, and specialized integration for Google Docs. It also includes feature flagging and initialization for "G2 vBars" (a sideline suggestion UI) and the "Knowledge Hub".

### Findings
- **Cheetah Feature (`x` class, `CheetahFeatureImpl`)**: The main implementation for the GrammarlyGO assistant. It manages the assistant's state (opened/closed), UI components (inline buttons, assistant panel), and orchestrates sub-features like compose, rewrite, and ideation. It has a dynamic `init` method that lazy-loads its dependencies.
- **Google Docs Canvas Integration (`F` class, `CheetahIntegrationGDocsCanvas`)**: A specialized class that extends the base Cheetah integration to work within the Google Docs canvas. It handles rendering the assistant relative to the GDocs sidebar and manages scrolling behavior within the document.
- **Authentication Hooks (`s` and `a` functions in `12314`)**: A centralized system for displaying and tracking user interactions with various authentication prompts (login reminders, signup forms) based on user type and context.
- **Native Messaging Connector (`r` namespace, `84078`)**: Contains the logic to establish a connection with a native messaging host (`ForegroundConnectorServerImpl`), enabling features that require desktop integration.
- **G2 vBars (`p`, `g`, `f`, `m`, `v`, `_` functions in `86211`)**: Extensive feature flagging and configuration logic for a new sideline UI pattern called "vBars". The configuration is context-dependent (GDocs vs. non-GDocs) and controlled by multiple experiments.
- **Knowledge Hub (`l`, `c`, `u`, `d`, `h` functions in `24435`)**: Feature flagging and utility functions for a "Knowledge Hub" feature, which appears to provide contextual information about specific terms, likely in an enterprise setting.
- **Obfuscation Hints**: `minified_vars`, `webpack_modules`.

### Risks
- None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:26001-28000
## src/js/Grammarly-gDocs.beautified.js [chunk 15/53, lines 28001-30000]

### Summary
This chunk is heavily focused on instrumentation, feature configuration, and data models for advanced features. It introduces a comprehensive performance measurement system, a session statistics manager, and the models for "Knowledge Hub" and "TouchTypist" features.

### Findings
- **Performance Measurement System (`h` class in `67223`)**: A robust system for measuring and reporting performance metrics. It supports starting/stopping timers, adding metadata, and sending data to multiple backends (Femetrics, Databricks) with configurable sampling rates.
- **Session Statistics Manager (`O` class in `17159`)**: A manager class (`SessionStatsManagerImpl`) that collects and reports statistics for a user's session in a text field. It tracks connection stats (connects, disconnects, idle time), alert stats, and text replacement stats (success/fail counts by source and type).
- **Knowledge Hub (`33442`, `6182`)**: Defines the data models and UI for the "Knowledge Hub" feature. It includes logic for handling different card types (`TermDetails`, `SuggestedTerm`) and lazy-loads the main `KnowledgeHubCard` React component.
- **TouchTypist Models (`74789`, `98409`)**: Contains the data models and business logic for the "TouchTypist" feature's UI cards. This includes models for `TouchTypistPreviewCardModelImpl` (showing a suggestion) and `TouchTypistRevertCardModelImpl` (allowing the user to undo a change).
- **Uphook & Special Offers (`53981`, `3620`, `35614`)**: Defines services for fetching and tracking user-facing special offers and "uphooks" (prompts to upgrade or try new features).
- **Debug Utilities (`77590`)**: Implements handlers for collecting and downloading debug reports from the content script, including a keyboard shortcut to trigger the download.
- **Obfuscation Hints**: `minified_vars`, `webpack_modules`.

### Risks
- None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:28001-30000
## src/js/Grammarly-gDocs.beautified.js [chunk 16/53, lines 30001-32000]

### Summary
This chunk is heavily focused on the client-side logic for processing alerts, managing their state, and implementing automated correction features like "Auto-Apply" and "Autocorrect". It reveals the core machinery that allows Grammarly to maintain suggestion accuracy in a dynamic text environment and handle user interactions with those suggestions.

### Key Components & Findings

#### 1. Session Metrics & Instrumentation (Modules `(anonymous)`, `1763`, `37275`, `67734`)
- **Session-End Reporting**: The code finalizes the logic for flushing session statistics. It gathers highly detailed metrics on alert interactions (e.g., `accepted_autocorrect_count`, `rewrite_under_30_chars`), text corruption events, and replacement statuses.
- **Data Aggregation**: This data is aggregated from various session statistics maps and sent to a `productMetricsCSClient` when the session concludes.
- **Metric Helpers**: Several modules define constants and helper functions for creating histogram buckets and categorizing metrics, indicating a sophisticated client-side performance and usage monitoring system.

#### 2. Alert Processor (`AlertProcessorImpl` in module `28051`)
- **Core Responsibility**: This class is the central hub for managing the lifecycle of alerts on the client. It maintains a map of all active alerts.
- **Rebasing on Text Change**: Its primary and most complex task is to process user text changes. It listens to a `_textRevisionManager` and transforms the positions of all existing alerts to align with the new document state.
- **Alert Validity Logic**: The `isAlertBrokenByChange` and `doesRangeStillMakeSense` methods contain the crucial logic to determine if an alert is still valid after a text change. It checks character boundaries and context to decide whether to keep or discard an alert.
- **Performance Optimization**: An `_optimizeAlertProcessing` flag toggles between two different validation strategies (`A` class vs. `P` class), showing a focus on performance tuning for this critical path.

#### 3. Alert State Service (`AlertStateServiceBase` in module `30842`)
- **Focus Management**: This service is responsible for determining which alert is currently "highlighted" or "active" based on user interaction.
- **Input Sources**: It uses RxJS streams to process mouse position (`_extensionRawHighlightedAlert`) and external decoration events (`_externalRawHighlightedAlert`) to identify the alert under the user's cursor.
- **State Invalidation**: It includes logic to "turn off" the highlighted state in response to text changes, scrolling, or window resizing, ensuring the UI doesn't show stale information.

#### 4. Auto-Apply and Autocorrect Features (Module `13733`)
- **Orchestration**: This large module acts as an orchestrator for several "auto-fix" features.
- **Auto-Apply (`ge` class)**: Implements the logic for automatically applying high-confidence suggestions. It listens for specific alert types, performs the replacement, and crucially, creates a corresponding "revert" alert to allow the user to undo the action.
- **Autocorrect (`We` class)**: Implements traditional autocorrect. It checks text changes, communicates with an `_acClient` (Autocorrect Client), and applies corrections, also creating a revertible alert.
- **Undo UI (`ye`, `nt` classes)**: These classes are controllers for the lazy-loaded React components that render the "Undo" cards after an automatic correction is made.
- **Feedback Loop (`fe` class)**: A dedicated feedback reporter sends detailed events for every step of the process (triggered, reverted, accepted, affected by text change) back to Grammarly's servers.

### Risks & Obfuscation
- **Instrumentation**: The sheer volume of detailed metrics being collected on user interactions, alert acceptance/rejection, and text characteristics could have privacy implications if not handled carefully and disclosed properly.
- **Complexity**: The logic, especially in the `AlertProcessorImpl`, is highly complex with heavy use of custom data structures and RxJS, making it difficult to fully trace without a debugger.

### Evidence
- **Session Metrics**: `this._productMetricsCSClient.send({ event_name: "session_end", ... })` at line 30103.
- **Alert Processing**: `class Y` (minified from `AlertProcessorImpl`) in module `28051`, especially the `_rebaseAlert` and `V` (`V` is minified, likely `transformAlert`) functions.
- **Auto-Apply Logic**: `class ge` in module `13733`, with `_handleApplyAlert` method.
- **Autocorrect Logic**: `class We` in module `13733`, with `_applyAutocorrectAlert` method.
- **Undo Card Views**: `const be = me.lazy(...)` and `const tt = me.lazy(...)` show the lazy loading of the undo card components.
## src/js/Grammarly-gDocs.beautified.js [chunk 17/53, lines 32001-34000]

### Summary
This chunk contains the core logic for two significant user-facing features: the Inline Card Service and the Synonyms feature. The `InlineCardService` (`ki`) is a central orchestrator that determines which type of suggestion card (e.g., correction, autocorrect undo, auto-apply undo, snippets) to display based on the currently active alert. The Synonyms feature is implemented via the `SynonymsService` (`ho`), which listens for double-clicks on words and shows a synonym suggestion card using the `SynonymsCardController` (`so`). Additionally, this chunk includes services for managing Server-Driven UI state (`SduiBufferService`) and displaying in-app user surveys (`PerceptionMetricsSurveyView`).

### Findings
- **Inline Card Orchestration (`InlineCardService`)**: The `ki` class is the central router for displaying various inline cards. It takes multiple specific card controllers (for CAPI alerts, autocorrect, auto-apply, etc.) and decides which one to show based on the type of the currently active alert from the 
### Findings
- **Inline Card Orchestration (`InlineCardService`)**: The `ki` class is the central router for displaying various inline cards. It takes multiple specific card controre. The `ho` service listens for double-clicks, fetches synonyms, and uses the `so` controller to render the suggestions in a card. It includes logic for showing and hiding the card based on user interactions.
- **Server-Driven UI (`SduiBufferService`)**: The `to` class is a buffer for Server-Driven UI events. It processes `sdui_add` and `sdui_remove` events to maintain a consistent state of what SDUI components should be rendered, which is crucial for features driven by backend logic.
- **Perception Metrics Survey (`PerceptionMetricsSurveyView`)**: The `ji` class handles showing a user survey card. It's designed to appear near the G-button and uses a lazy-loaded React component to render the survey UI.
- **State Management**: The code heavily uses RxJS for state management and event handling, with `BehaviorSubject` and `Subject` for managing state and streams of events (e.g., `_cardHoveredSubject`, `_sduiCapiEvents`).

### Risks
- No new risks identified in this chunk.

### Evidence
- `src/js/Grammarly-gDocs.beautified.js:33708-33880`: Definition of the `ki` (`InlineCardService`) class.
- `src/js/Grammarly-gDocs.beautified.js:34283-34453`: Definition of the `ho` (`SynonymsService`) class.
- `src/js/Grammarly-gDocs.beautified.js:34200-34281`: Definition of the `so` (`SynonymsCardController`) class.
- `src/js/Grammarly-gDocs.beautified.js:34138-34200`: Definition of the `to` (`SduiBufferService`) class.
- `src/js/Grammarly-gDocs.beautified.js:34084-34136`: Definition of the `ji` (`PerceptionMetricsSurveyView`) class.
## src/js/Grammarly-gDocs.beautified.js [chunk 18/53, lines 34001-36000]

### Summary
This chunk is dominated by the massive `AquaFieldIntegration` class (`Jo`), which acts as the central orchestrator for almost all extension features within a text field. It initializes and wires together dozens of services, including the checking service, alert processor, G-button, synonyms, autocorrect, auto-apply, snippets, and the main assistant ("Cheetah"). This class is the core of the field-level integration. The chunk also contains the complete implementation for the synonyms feature, including the service that listens for double-clicks and the UI controller for the synonym card.

### Findings
- **Core Feature Integration (`AquaFieldIntegration`)**: The `Jo` class is a massive orchestrator responsible for initializing, wiring, and managing the lifecycle of nearly all features in a text field. It sets up the checking service, alert processor, G-button, highlights, and numerous UI controllers.
- **Synonyms Feature (`SynonymsService`, `SynonymsCardController`)**: Contains the full implementation for the synonyms feature. The `ho` service listens for double-clicks, requests synonyms from the backend, and the `so` controller manages the synonym card UI.
- **Analytics and Tracking**:
  - **`GButtonSessionTrackingServiceDefaultImpl` (`Do`)**: A dedicated service for tracking all G-button related analytics (show, initialized, click) and sending them to Gnar.
  - **`UserEngagedByAlertsAccepted` (`Mi`)**: Tracks the number of accepted alerts to trigger `Iterable` user engagement campaigns.
- **Server-Driven UI (`SduiBufferService`)**: The `to` class buffers and manages the state of Server-Driven UI (SDUI) events, ensuring consistency across sessions.
- **Dynamic Feature Loading**: The code shows patterns of lazily loading features like the "Snippets Templating" feature (`Ro`) and the "SDUI Basic Engine" (`Uo`), often gated by experiment flags.
- **UI Controllers**: Includes controllers for a "Perception Metrics Survey" (`ji`) and a visibility manager (`qo`) to handle sidebar conflicts in Google Docs.
- **Keyboard Shortcut Handling**: The `So` function provides the logic for handling the "openAssistant" keyboard shortcut.

### Risks
- **Complexity**: The `AquaFieldIntegration` class is extremely large and complex, making it a single point of failure and difficult to maintain or debug. Changes in this class could have wide-ranging, unintended consequences across the entire extension.

### Evidence
- `src/js/Grammarly-gDocs.beautified.js:35085-36000`: Definition of the `Jo` (`AquaFieldIntegration`) class.
- `src/js/Grammarly-gDocs.beautified.js:34283-34453`: Definition of the `ho` (`SynonymsService`) class.
- `src/js/Grammarly-gDocs.beautified.js:34200-34281`: Definition of the `so` (`SynonymsCardController`) class.
- `src/js/Grammarly-gDocs.beautified.js:34688-34733`: Definition of the `Do` (`GButtonSessionTrackingServiceDefaultImpl`) class.
- `src/js/Grammarly-gDocs.beautified.js:34040-34079`: Definition of the `Mi` (`UserEngagedByAlertsAccepted`) class.
- `src/js/Grammarly-gDocs.beautified.js:34138-34200`: Definition of the `to` (`SduiBufferService`) class.
## src/js/Grammarly-gDocs.beautified.js [chunk 19/53, lines 36001-38000]

### Summary
This chunk details the crucial wiring between the checking service, the alert processor, and the UI highlights. The `AquaCheckingFeatureImpl` class processes messages from the backend (add/remove/change alerts), while the `AquaAlertsWiring` class listens to those changes and translates them into visual highlights on the screen. This section contains the core logic for deciding highlight color and style based on alert properties like type, impact, and whether it's a premium feature. It also includes a `CAPIProxy` that serves as a bridge between the UI and the checking service, rebasing alert data against text changes to ensure consistency.

### Findings
- **Checking Feature Implementation (`AquaCheckingFeatureImpl`)**: The `f` class is the primary consumer of messages from the checking service. It receives events like `add`, `changed`, and `remove` for alerts and pushes them to the `_alertProcessor`. It also handles other backend messages like `finished` (to update scores and language status) and `showSurvey`.
- **Alert-to-Highlight Wiring (`AquaAlertsWiring`)**: The `P` class is the link between abstract alerts and visual highlights. It subscribes to changes from the `alertProcessor` and calls `addHighlight`, `updateHighlight`, and `removeHighlights` on the `highlights` service.
- **Highlight Styling Logic**: `AquaAlertsWiring` contains the static method `getHighlightColor`, which holds the business logic for determining the color of an underline (red for correctness, blue for clarity, green for engagement, etc.). It also includes special logic for yellow "reactivation" underlines and different styles for locked/premium alerts.
- **Text Revision Handling**: Both `AquaAlertsWiring` and `CAPIProxy` interact with the `textRevisionManager`. They rebase alert positions and highlight geometries against user text changes to ensure that suggestions don't become stale or point to the wrong location after an edit.
- **CAPI Proxy (`CAPIProxy`)**: The `k` class acts as a proxy to the core checking service. Its main responsibility is to intercept messages, rebase them against any pending text changes using the `textRevisionManager`, and then forward them to the rest of the application. This ensures that all data is consistent with the latest text state.
- **Attribute Maintenance (`ElementAttrMaintainer`)**: A utility class (`p`) is defined to forcefully maintain specific attributes on an HTML element (e.g., `spellcheck="false"`), fighting against external changes using a `MutationObserver`.

### Risks
- No new risks identified in this chunk.

### Evidence
- `src/js/Grammarly-gDocs.beautified.js:36033-36203`: Definition of the `f` (`AquaCheckingFeatureImpl`) class.
- `src/js/Grammarly-gDocs.beautified.js:36580-37100`: Definition of the `P` (`AquaAlertsWiring`) class, including `getHighlightColor`.
- `src/js/Grammarly-gDocs.beautified.js:37388-37610`: Definition of the `k` (`CAPIProxy`) class.
- `src/js/Grammarly-gDocs.beautified.js:36205-36270`: Definition of the `p` (`ElementAttrMaintainer`) class.
- `src/js/Grammarly-gDocs.beautified.js:36400-36579`: Highlight visibility tracking and geometry utilities.
## src/js/Grammarly-gDocs.beautified.js [chunk 20/53, lines 38001-40000]

### Summary
This chunk continues the implementation of the CAPI (Core API) proxy, with a heavy focus on feedback reporting. It contains a massive `sendFeedback` method that acts as a central hub for dispatching dozens of different user interaction events to the backend. This includes feedback on alerts, synonyms, AI features, autocorrect, and more. The chunk also defines the critical `capiMessageTransformer` and `capiMessageRebaser` functions, which are essential for translating backend data and ensuring alert positions remain correct as the document text changes. Additionally, it includes a large settings controller class, the `EthicalAIFeature` for handling sensitive content alerts, and logic for business-related uphooks and experiments.

### Findings
- **Chrome APIs**: None observed in this chunk.
- **Event Listeners**: None observed in this chunk.
- **Messages**:
  - **Feedback Hub (`sendFeedback`)**: A large switch statement that routes numerous feedback types to the `_checkingService`. This is the primary mechanism for reporting user interactions to the backend.
    - Types handled include: `IGNORE`, `ACCEPTED`, `LIKE`, `DISLIKE`, `ADD_TO_DICTIONARY`, `SYNONYM_ACCEPTED`, `ASSISTANT_OPENED`, `AUTOAPPLY_REVERTED`, `SNIPPET_ACCEPTED`, `WritingExpert`, `AiStudio`, and many more.
- **Storage**: None observed in this chunk.
- **Endpoints**: None observed in this chunk.
- **DOM**: None observed in this chunk.
- **Dynamic Code**: None observed in this chunk.
- **Obfuscation Hints**:
  - `minified_vars`: Single-letter variables (`e`, `t`, `n`, `r`) are used extensively.
  - `webpack_modules`: Code is structured in Webpack modules (e.g., `57495`, `84705`, `48667`).
- **Risks**:
  - **Extensive Tracking**: The `sendFeedback` method demonstrates comprehensive tracking of user interactions with almost every feature of the extension. This includes clicks, dismissals, accepts, and views of alerts, synonyms, and AI suggestions.
- **Key Functionality**:
  - **CAPI Proxy (continued)**: Finishes the implementation of the CAPI proxy started in the previous chunk.
  - **`capiMessageTransformer`**: Converts messages from the backend CAPI format (e.g., `add`, `changed`, `remove`, `finished`) into the internal format used by the `AlertProcessor`.
  - **`capiMessageRebaser`**: A critical function for data consistency. It takes an internal message (e.g., `alert_received`) and a revision number and uses a `delta` to transform the alert's position to match the current state of the document. This is crucial for collaborative or fast-typing environments.
  - **Settings Controller (`48667`)**: A large class that provides an API (`actions`) to toggle various features like `toggleSite`, `toggleDefs`, `toggleAutocorrect`, `toggleAlwaysAvailableAssistant`, and change settings like dialect.
  - **`EthicalAIFeature` (`99562`)**: A dynamically loaded feature that handles "ethical AI" alerts. It tracks user interactions (shows, clicks, dismisses) with these specific alerts and reports them. It explicitly references the `STAND_WITH_UKRAINE_ALERT_PNAME`.
  - **Business Uphooks (`10053`)**: Contains logic to determine user eligibility for various business-related uphooks and experiments based on user type (free/premium), site category, and interaction history.

### Evidence
- **Feedback Hub**: `src/js/Grammarly-gDocs.beautified.js`, lines 38120-38265
- **`capiMessageTransformer`**: `src/js/Grammarly-gDocs.beautified.js`, lines 38480-38588
- **`capiMessageRebaser`**: `src/js/Grammarly-gDocs.beautified.js`, lines 38589-38610
- **`EthicalAIFeature`**: `src/js/Grammarly-gDocs.beautified.js`, lines 39695-39790
- **Business Uphook Logic**: `src/js/Grammarly-gDocs.beautified.js`, lines 39418-39580
## src/js/Grammarly-gDocs.beautified.js [chunk 21/53, lines 40001-42000]

### Summary
This chunk focuses heavily on the creation and management of various popups that appear anchored to the G-Button. It includes services for handling native messaging connector permissions, free-to-premium uphooks, account migration notifications, and subscription status warnings (dunning messages, upcoming renewals). A significant portion of the code is dedicated to the main G-Button controller (`qt`, class `qt` in module `70962`), which orchestrates the display, state, and interactions of the G-Button and its expanded menu.

### Findings
- **Chrome APIs**:
  - `browser.runtime.getURL`: Used in module `83507` to construct full URLs for CSS stylesheets.
- **Event Listeners**: None observed in this chunk.
- **Messages**:
  - `bgRpc.api.requestGrantPermission`: Called to request the `nativeMessaging` permission from the user.
  - `bgRpc.api.reload`: Called to reload the e## src/js/Grammarly-gDocson grant.
  - `bgRpc.api.sendToFocusTab`: Used to send commands to the active tab, such as `showOnboardingDialog` or `d
### Findings
- **Chrome APIs**:
  - `browser.runtime.getURL`: Used in module `83507` to construct full URLs for CSS stylesheets.
-ylesheets**: Module `83507` defines a React component (`a`) that dynamically injects `<link rel="stylesheet">` tags into the document to load CSS on demand.
- **Dynamic Code**:
  - **Dynamic Feature Loading**: The `EthicalAIFeature` (module `99562` from the previous chunk) uses a dynamic `import()` to load its implementation, and this pattern is seen again with the `PersonalizedInsightsConsentService` (module `ye` in `70962`).
- **Obfuscation Hints**:
  - `minified_vars`: Extensive use of single-letter variables.
  - `webpack_modules`: Code is organized into Webpack modules.
- **Risks**:
  - **Permission Request**: The `ConnectorPermissionPopupService` can trigger a browser permission prompt for `nativeMessaging`, which could be alarming to users if unexpected. This permission allows the extension to communicate with native applications on the user's computer.
- **Key Functionality**:
  - **G-Button Controller (`qt` in `70962`)**: This is the main class that brings together all the models and services for the G-Button. It determines G-Button visibility, manages its minimized/expanded state, and renders the appropriate UI (the compact button or the expanded menu with multiple items).
  - **Popup Services**: Several services are instantiated to manage different popups:
    - `ConnectorPermissionPopupService` (`G` in `70962`): Shows a popup to request `nativeMessaging` permission if needed.
    - `FreePremiumUphookPopupService` (`H` in `70962`): Shows an uphook popup after a user accepts a premium suggestion for the first time.
    - `AccountMigrationNotification` (`X` in `70962`): Shows a notification for users who need to migrate their billing information.
    - `DunningMessageService` (`Se` in `70962`): Manages popups and inline banners for users with payment issues.
    - `UngatingRenewalNotification` (`Ee` in `70962`): Manages notifications for upcoming subscription renewals.
  - **G-Button Expanded Menu (`Be` in `70962`)**: This class is responsible for building the list of items that appear in the expanded G-Button menu. This includes the main CTA (showing alert counts), the emogenie button, the disable button, and any active banner notifications.
  - **G-Button Rendering Logic (`ct` in `70962`)**: The core React component for the G-Button, which handles its visual state (checking, offline, errors, minimized) and renders the appropriate status icon or alert count.

### Evidence
- **G-Button Controller (`qt`)**: `src/js/Grammarly-gDocs.beautified.js`, lines 41730-42000
- **Connector Permission Popup**: `src/js/Grammarly-gDocs.beautified.js`, lines 40018-40080
- **Free-to-Premium Uphook**: `src/js/Grammarly-gDocs.beautified.js`, lines 40090-40145
- **Dunning/Renewal Banners**: `src/js/Grammarly-gDocs.beautified.js`, lines 41400-41729
- **G-Button Expanded Menu Logic**: `src/js/Grammarly-gDocs.beautified.js`, lines 41110-41210
- **G-Button Rendering Component**: `src/js/Grammarly-gDocs.beautified.js`, lines 41400-41550
## src/js/Grammarly-gDocs.beautified.js [chunk 22/53, lines 42001-44000]

### Summary
This chunk is heavily focused on the UI rendering pipeline, particularly for highlights, popups, and in-app messages (IPMs). It contains the services and components for the "Stand with Ukraine" banner, the complex state aggregation for the main G-Button's appearance, and the sophisticated geometry engine (`AquaHighlightCollectionGeometry`) responsible for calculating and rendering text highlights efficiently. A significant portion is also dedicated to the infrastructure for fetching and displaying marketing/informational messages from the Iterable platform based on user behavior triggers.

### Findings
- **Chrome APIs**: No direct Chrome API calls were observed in this chunk.
- **Event Listeners**: The code sets up numerous internal event listeners using RxJS, but also `IntersectionObserver` for detecting when elements are visible on screen.
- **DOM Interaction**:
  - Extensive DOM manipulation for creating, positioning, and updating highlight rectangles.
  - Creates and manages `<iframe>` elements to display in-app messages from Iterable, sandboxing the content.
  - Uses `getClientRects` and `getBoundingClientRect` to measure element positions for layout calculations.
- **Dynamic Code/Obfuscation**:
  - **Lazy Loading**: Module `3245` implements a system for lazily loading and rendering React components (`renderLazyView`), likely to improve initial load performance.
- **Endpoints**:
  - The code interacts with the Iterable service via `bgRpc.api.iterableGetInAppMessages`, `iterableTrackInAppOpen`, `iterableTrackInAppClick`, and `iterableTrackInAppConsume`, implying network communication handled in the background script.
- **Storage**:
  - Interacts with stored state for session information, user data, and feature flags (e.g., `page.iterableNextFetchSettings`, `user.customSessionTimeoutInfo`).
  - Manages cooldown and impression counts for Iterable campaigns, likely persisting this data via `csActions`.
- **Obfuscation Hints**: `webpack_modules`, `minified_vars`.
- **Risks**:
  - **Tracking**: The `IterableInAppMessageService` (module `73074`) implements extensive user activity tracking to trigger in-app messages. Triggers include `UserSessionInitialized`, `UserEngagedByAlertsAccepted`, and `PauseInTyping`. This data is sent to a third-party marketing platform (Iterable).
  - **External Content**: Renders HTML content fetched from the Iterable service within a sandboxed `<iframe>`. While sandboxed, this still introduces a vector for external content to be displayed within the extension's context.

### Key Code Points
- **Module `7865` (`AquaHighlightCollectionGeometry`)**: A highly complex and performance-critical class that manages the geometry of all highlights. It uses queues, clocks, and frame-based processing to efficiently update highlight rectangles on the screen as the document changes.
- **Module `99216`**: Aggregates state from numerous sources (user, experiments, checking status) to construct the props for the main G-Button (`gButtonProps`). This module is central to determining the G-Button's visual state (e.g., disabled, offline, checking, warning).
- **Module `73074` (`IterableInAppMessageService`)**: A service dedicated to handling in-app messages from the Iterable marketing platform. It listens for various user action triggers, fetches messages, and manages display logic, including rate-limiting, cooldowns, and targeting based on custom payloads (domain, trigger type).
- **Module `5973` (`IterableView`)**: The view component that takes the HTML content from the `IterableInAppMessageService` and renders it in a positioned `<iframe>` over the page. It handles user interactions within the iframe, such as clicks and closes.
- **Module `31818` (`StandWithUkraineBannerService`)**: This service controls the logic for displaying a "Stand with Ukraine" banner, checking experiment flags and other conditions before showing the popup.
- **Module `13583` (`InlineCardModelImpl`)**: Defines the model and actions for inline suggestion cards, handling events like `onReplace`, `onIgnore`, `onMute`, and `onAddToDictionary`. It serves as the bridge between the UI card and the core checking/replacement services.
## src/js/Grammarly-gDocs.beautified.js [chunk 23/53, lines 44001-46000]

### Summary
This chunk is a deep dive into the core rendering, layout, and interaction logic of the extension. It contains the primary `TextFieldLayout` class, which is responsible for orchestrating the entire UI layer within the text field, including highlights and the G-Button. It also details the sophisticated text replacement mechanism, with a focus on preserving rich text formatting by analyzing text diffs and styles. Furthermore, it includes the setup for the "Proofit" (Generative AI) feature and utilities for simulating DOM events like `paste` and `keydown` to interact robustly with the host editor.

### Findings
- **Chrome APIs**: No direct Chrome API calls were observed.
- **Event Listeners**: Listens for `resize`, `keydown`, `mousedown`, `scroll`, `mousewheel`, and `touchmove` to update its layout and mouse position state. It also uses `MutationObserver` (`d.x.create`) for fine-grained DOM change detection.
- **DOM Interaction**:
  - **Layout Calculation**: Heavily relies on `getBoundingClientRect`, `clientTop`, `clientLeft`, `offsetHeight`, `clientWidth`, etc., to build a geometric model of the text field.
  - **Element Injection**: The `TextFieldLayout` class injects its own root elements into the DOM to host the highlights and G-Button UI.
  - **Event Simulation**: Module `27970` contains functions to programmatically create and dispatch `ClipboardEvent` (`paste`), `KeyboardEvent` (`keydown`), and `InputEvent` (`beforeinput`). This is a key technique for interacting with the host application's editor.
- **Dynamic Code/Obfuscation**: No new significant patterns beyond the existing Webpack structure.
- **Endpoints**: No direct endpoint calls.
- **Storage**: No direct storage interactions.
- **Obfuscation Hints**: `webpack_modules`, `minified_vars`.
- **Risks**:
  - **DOM Fragility**: The heavy reliance on specific DOM properties, layout calculations, and event simulation makes the extension potentially fragile to changes in the host application's (Google Docs) structure and behavior.

### Key Code Points
- **Module `44287` (`TextFieldLayout`)**: This is a major class that serves as the central orchestrator for the extension's UI within the text field. It prepares the field, injects UI roots, and manages the layout for highlights and the G-Button. It's the bridge between the logical extension state and the visual representation on the page.
- **Module `13425` (`GenericReplacementService`) & `33387`**: These modules define the core logic for applying text replacements. `GenericReplacementService` handles the mechanics of creating a range and executing the replacement. `33387` builds on this by adding sophisticated logic to preserve formatting. It calculates a diff between the old and new text and attempts to intelligently apply the formatting from the original text to the new text, which is crucial for rich text environments.
- **Module `27970`**: This module provides utilities to simulate native user interactions. Functions like `pasteWithData`, `pressDelete`, and `dispatchBeforeInput` allow the extension to perform actions as if a user were typing or pasting, which is often more reliable than direct `value` or `innerHTML` manipulation in complex editors.
- **Module `205` (`ProofitFeature`)**: This module initializes the "Proofit" (Generative AI) feature. It sets up the core class and injects its dependencies, acting as the entry point for the entire GenAI workflow.
- **Module `61833`**: Contains color blending logic. It can calculate the effective background color of an element by traversing up the DOM tree and blending `rgba` colors, essential for visual effects like `mix-blend-mode`.
- **Modules `7294`, `68418`, `63310`**: These are core geometry libraries defining primitives like points and rectangles and functions for coordinate space conversions (client, page, offset), which are fundamental to the entire layout engine.
## src/js/Grammarly-gDocs.beautified.js [chunk 24/53, lines 46001-48000]

### Summary
This chunk is central to the extension's text processing and replacement validation logic. It introduces the `ReplacementMiddleware`, a key class that intercepts replacement requests, validates them, and decides whether to apply advanced "preserve formatting" logic. It contains the core algorithms for validating that a text replacement was successful by comparing the text before and after the change, including sophisticated context matching that can ignore whitespace and non-visible characters. The chunk also defines the `TextChangeBuffer`, which batches text change events to avoid overwhelming the processing pipeline, and the `ReplacementTracker`, which is responsible for logging detailed telemetry about every replacement's success or failure.

### Findings
- **Chrome APIs**: No direct Chrome API calls.
- **Event Listeners**: No new direct DOM event listeners, but the code is heavily based on RxJS streams which listen to internal application events (e.g., text changes, focus changes).
- **DOM Interaction**:
  - **Simulated Events**: Module `27970` continues with functions to simulate `paste`, `keydown` (delete), and `beforeinput` events, which are used by the `GenericReplacementService` to perform robust replacements.
- **Dynamic Code/Obfuscation**: No new patterns.
- **Endpoints**: No direct endpoint calls.
- **Storage**: No direct storage interactions.
- **Obfuscation Hints**: `webpack_modules`, `minified_vars`.
- **Risks**:
  - **Complex Validation Logic**: The text corruption validation logic is intricate, comparing contexts and ignoring certain characters. A bug in this logic could lead to either false positives (flagging correct replacements as corrupt) or false negatives (failing to detect actual text corruption).

### Key Code Points
- **Module `77642` (`ReplacementMiddleware`)**: This is a crucial middleware layer that wraps the core `ReplacementService`. It decides whether to apply formatting preservation logic based on the capabilities of the underlying service (`gDocs` vs. `richtext`) and experiment flags. It uses a `PromiseReplacementValidator` to asynchronously check if a replacement was successful.
- **Module `77642` (`PromiseReplacementValidator`)**: Implements the core logic for validating text replacements. It listens for text changes after a replacement is initiated and compares the actual result against the expected text. It uses a timeout and can handle conflicting changes.
- **Module `77642` (Text Corruption Validation)**: Contains the algorithms (`O`, `M`, `U`) for validating text changes. This logic is sophisticated, capable of ignoring non-width characters and handling list-based formatting differences to reduce false corruption reports. It calculates Levenshtein distance for failed replacements to measure the degree of corruption.
- **Module `77642` (`ReplacementTracker`)**: A comprehensive telemetry class. It tracks every replacement attempt, logging detailed information about its source, type, status (success/fail), failure reason, and performance metrics. It sends this data to multiple analytics endpoints (`felog.replacement`, `productMetricsClient`).
- **Module `40394` & `20994` (`TextChangeBuffer`)**: These modules implement a buffering strategy for text change events. They collect multiple small, rapid changes into a single event, which is then sent for processing. This is a performance optimization to prevent the system from being overwhelmed during fast typing. It has logic to flush the buffer immediately for significant changes (e.g., pasting, newlines).
- **Module `33387` (Formatting Transformation)**: Contains the logic for the "preserve formatting" feature. When a replacement is about to happen, it analyzes the formatting of the text being replaced and the new text, then calculates a diff (`Delta`) to apply the original formatting to the new content.
## src/js/Grammarly-gDocs.beautified.js [chunk 25/53, lines 48001-50000]

### Summary
This chunk contains the foundational components for how the extension understands and interacts with the document's text. It includes the `BlockMapBuilder`, which parses the DOM into a structured block model, and the subsequent text normalization and mapping logic that converts this model into a linear plain text string with a corresponding character-to-DOM-node map (`charMap`). This `charMap` is the critical link between the text the checking engine sees and the live DOM. The chunk also defines the `TextRevisionManager`, a crucial service that tracks every change to the text, creates a local history of revisions, and can compute the differences between any two points in time, which is essential for state synchronization with the backend. Finally, it includes the `MirrorView`, a component that creates a hidden, pixel-perfect replica of the text area to accurately calculate text layout and character positions for rendering highlights and other UI elements.

### Findings
- **Chrome APIs**: No direct Chrome API calls.
- **Event Listeners**: Listens for `compositionstart`, `compositionend`, `input`, and `change` on the target element to detect content changes. Also uses `MutationObserver` to watch for attribute changes.
- **DOM Interaction**:
  - **DOM Traversal**: The `BlockMapBuilder` performs a deep traversal of the editor's DOM to build its internal model.
  - **Style Calculation**: The `MirrorView` uses `getComputedStyle` to read a wide range of CSS properties from the target element to replicate its appearance.
  - **Shadow DOM**: The code includes logic for injecting views into a Shadow DOM, with fallbacks. It uses `attachShadow` and `adoptedStyleSheets`.
- **Dynamic Code/Obfuscation**: No new patterns.
- **Endpoints**: No direct endpoint calls.
- **Storage**: No direct storage interactions.
- **Obfuscation Hints**: `webpack_modules`, `minified_vars`.
- **Risks**:
  - **Performance**: The DOM traversal and style computation for the `BlockMapBuilder` and `MirrorView` can be performance-intensive, especially on very large documents. The code shows some mitigation (e.g., debouncing style recalculations), but it remains a sensitive area.

### Key Code Points
- **Module `91297` (`BlockMapBuilder`)**: This class is responsible for the initial parsing of the live DOM. It walks the DOM tree of the editor and converts it into an array of "blocks," where each block contains a structured representation of its content (text nodes, BRs, images, etc.). This is the first step in abstracting the editor's content away from the raw DOM.
- **Module `99022` (Text Normalization & CharMap)**: This module takes the output of the `BlockMapBuilder` and performs two critical functions:
  1.  **`buildFragmentModel`**: Normalizes whitespace and converts the block structure into a linear sequence of text fragments.
  2.  **`buildCharMap`**: Creates the final plain text representation of the document and a `charMap`. The `charMap` is an array that maps every single character in the plain text back to its origin in the DOM (the specific node and offset). This is the cornerstone of the extension's ability to relate a finding at a text offset to a location on the screen.
- **Module `15213` (`TextRevisionManagerImpl`)**: A state management powerhouse. It subscribes to text changes and maintains a local history of revisions. Each revision is assigned a local ID. It provides `getChangesSinceRevision` to compute the delta between a past state and the current state, which is fundamental for communicating with the CAPI backend. It can also tag local revisions with remote IDs from the server.
- **Module `96405` (`MirrorView`)**: Implements the "mirror" technique. It creates a hidden `<div>` that is styled to be a pixel-perfect replica of the actual editor. By populating this mirror with the document's text, the extension can perform layout calculations (e.g., finding the screen coordinates of character 500) without affecting the real editor. This is essential for placing highlights, the G-Button, and other UI elements correctly.
- **Module `9976` & `9542` (View Injection)**: These modules provide a generic system for injecting UI components (views) into the DOM. It supports using Shadow DOM with constructable stylesheets for encapsulation (the preferred modern method) and has a fallback to using `<style>` elements for older browsers. This is the system used to render all extension UI, including the mirror view.
- **Module `79809` (Editor Detection)**: Contains heuristics (`isSpecific`, `isGeneric`) to identify the type of rich text editor being used (e.g., Quill, ProseMirror, CKEditor, or a generic `contenteditable` field).

## src/js/Grammarly-gDocs.js [chunk 26/53, lines 50001-52000]

### Summary
This chunk contains logic for showing popups in Google Docs, specifically for anonymous users and for a "Stand With Ukraine" campaign. It also defines a sidebar and related UI components, including a custom event-based communication channel (`CustomEvent`) for inter-component messaging. It also includes a parser for the document content.

### Chrome APIs
- None

### Event Listeners
- None

### Messaging
- A custom event system is defined, which is a form of messaging.

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- `document.location.href` is used for navigation.
- `self.open` is used to open new windows.
- `document.createElement`, `document.querySelector`, `element.setAttribute`, `element.getBoundingClientRect` are used for DOM manipulation and inspection.

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:50001-52000

## src/js/Grammarly-gDocs.js [chunk 27/53, lines 52001-54000]

### Summary
This chunk is a continuation of the Google Docs content parser. It includes complex logic for handling tables, rows, cells, and text fragments within the document. It defines a variety of parsing functions and combinators to handle different document structures, including whitespace, special characters, and different types of content blocks. It also includes logic for handling multi-column layouts and page breaks.

### Chrome APIs
- None

### Event Listeners
- None

### Messaging
- None

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- None

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:52001-54000

## src/js/Grammarly-gDocs.js [chunk 28/53, lines 54001-56000]

### Summary
This chunk continues the implementation of the Google Docs content parser. It includes logic for handling text replacements, managing selection, and observing text changes. It defines a `CanvasReplacementService` that can perform single and batch replacements, and a `SelectionService` that can set and verify the selection in the document. It also includes logic for handling different document modes, such as "suggesting" mode, and for dealing with whitespace and special characters.

### Chrome APIs
- None

### Event Listeners
- None

### Messaging
- None

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- `document.createElement`
- `document.head.appendChild`
- `element.remove`

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:54001-56000

## src/js/Grammarly-gDocs.js [chunk 29/53, lines 56001-58000]

### Summary
This chunk defines the core logic for mapping the rendered content of a Google Doc to a structured text representation. It introduces the `CanvasTextObserver`, which is responsible for observing changes in the rendered content and creating a `TextMap` that can be used to reason about the document's structure. It also defines a `TextMapLogger` that is used to collect statistics about the mapping process.

### Chrome APIs
- None

### Event Listeners
- None

### Messaging
- None

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- None

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:56001-58000

## src/js/Grammarly-gDocs.js [chunk 30/53, lines 58001-60000]

### Summary
This chunk is a collection of core utilities and services. It includes modules for:
- **Text Processing (73560):** Cleaning and preparing text for analysis by handling special characters, inline images, and other non-text elements.
- **Scrolling (41806):** Programmatically scrolling the document to specific ranges or elements, likely for focusing on alerts or selections.
- **Text Map Traversal (90870):** A visitor pattern implementation for traversing the structured `TextMap`, allowing different parts of the code to process various fragment types (text, clips, pages, etc.).
- **Fragment Representation (8674, 43881, 43811):** Classes and functions for representing and creating parsed text fragments, which include geometry, styling (links, smart chips), and offset information.
- **UI Interaction and Observation (4271):** A large set of functions for simulating events (clicks), finding specific UI elements (text targets, dialogs), observing UI changes (smart chip menus), and calculating metrics like text coverage.
- **Iframe Communication (89685):** A sophisticated system for managing communication between the main extension and various iframes within the Google Docs UI. It handles frame identification, focus tracking, and establishes RPC-like connections.
- **State Management and Initialization (34819):** The main logic for bootstrapping the application state, combining user settings, page configuration, dynamic config, and connection status into a unified state observable.
- **Settings Management (63838, 7909, 52698):** Actions and services for managing user settings related to Grammarly's AI features (Cheetah), growth experiments, and the Knowledge Hub.
- **Analytics and Hashing (82914, 38456):** A proxy for tracking analytics events (Gnar) and a utility for generating unique hashes for DOM elements.
- **Keyboard Shortcuts (56052, 64910, 13118, 13162):** Logic for defining, detecting, and handling keyboard shortcuts within the text field.

### Chrome APIs
- None

### Event Listeners
- `mousedown`, `mouseup`, `mousemove` (in module `2914` for dragging)
- `focus`, `blur` (in module `89685` for iframe focus tracking)
- `keydown` (in module `64910` for shortcuts)
- `click` (in module `4271` for observing UI interactions)
- `message` (in module `89685` for cross-frame communication)

### Messaging
- `postMessage` is used extensively in module `89685` for communication between the host and integrated iframes. It uses a custom protocol with `__grammarly` property to identify messages.

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- `requestAnimationFrame` (in module `41806` for smooth scrolling)
- `element.dispatchEvent` (in module `4271` to simulate mouse events)
- `element.scrollBy` (in module `41806`)

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names
- Extensive use of RxJS suggests a reactive, event-driven architecture.

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:58001-60000

## src/js/Grammarly-gDocs.js [chunk 31/53, lines 60001-62000]

### Summary
This chunk is almost entirely composed of UI components, likely written in React, that form the building blocks for the suggestion cards and popovers seen by the user. It includes a sophisticated `Positioner` component for placing floating elements, and a wide variety of specialized "card" components for different types of suggestions: replacements, definitions, synonyms, unknown words, and upgrade prompts. It also contains the logic for popover menus, tooltips, and custom buttons. The code handles complex user interactions like hover, click, and keyboard navigation for these UI elements.

### Chrome APIs
- None

### Event Listeners
- `click`, `mousedown`, `mouseover`, `mouseleave`, `keydown` (Used extensively for UI component interactivity)
- `resize` (via `ResizeObserver` in multiple components)

### Messaging
- None

### Storage
- None

### Endpoints
- None

### DOM/Sinks
- `setTimeout`, `clearTimeout` (for hover delays)
- `ResizeObserver` (for responsive positioning)

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names
- React components (inferred from `r.forwardRef`, `r.createElement`, `r.useState`, etc.)

### Risks
- None

### Evidence
- src/js/Grammarly-gDocs.js:60001-62000

## src/js/Grammarly-gDocs.js [chunk 32/53, lines 62001-64000]

### Summary
This chunk continues to define core utilities and configuration logic. Key modules include:
- **Tooltip System (46418, 69652):** A complete system for creating and managing tooltips. It includes a `TooltipProvider` (`4636`), a `TooltipView` (`46418`), and a `Tooltip` component (`69652`) that handles positioning, show/hide delays, and event listeners.
- **Highlight Component (31152, 3038):** The main React component (`31152`) for rendering text highlights. It supports various colors, display formats (underline, background), hover effects, and animations. The associated module (`3038`) defines the data structures and utility functions for managing highlight styles and colors.
- **Iconography (46178, 76468, 97258, 49993):** A collection of SVG icon components, including the Grammarly logo, Premium diamond, and various UI action icons (e.g., close, dismiss).
- **UI Components (42496, 28510, 4141, 50699, 35975):** A set of generic UI building blocks, including buttons, style injectors, and custom React hooks for managing state and side effects (e.g., `useTimeout`, `useStreamValue`, `useDisposable`).
- **Extension Settings and Preferences (92270, 79825):** Utilities for accessing and subscribing to changes in the extension's preferences.
- **Color Palette (7913):** A mapping of semantic color names (e.g., `neutral0`, `blue40`) to specific color codes, used throughout the UI components.
- **Positioning and Geometry (36650):** Advanced logic for calculating the position of floating elements, considering viewport boundaries, anchor points, and various repositioning strategies (flip, translate).
- **Event Handling and State Management (89803, 67800, 2799):** Logic for handling text-level changes, including creating and applying deltas (diffs) and managing marks for highlights.
- **Configuration and Environment (47052, 67505, 62531, 79477, 74609, 87030, 35922, 49779, 97231, 44257, 87254, 95570, 67778):** A large and critical set of modules responsible for initializing the global application configuration. This includes determining the environment (prod, qa, dev), browser type, versioning, and constructing all necessary URLs for APIs, assets, and web pages based on this context. It defines the endpoints for services like Gnar (analytics), CAPI (core API), and authentication.

### Chrome APIs
- `chrome.runtime.getManifest` (inferred from `35922`)
- `chrome.runtime.id` (inferred from `35922`)

### Event Listeners
- `scroll` (in module `69652` for tooltips)
- `mouseover`, `mouseleave` (in module `69652` for tooltips)

### Messaging
- None

### Storage
- None

### Endpoints
- This chunk defines the logic for constructing all major API and web page URLs for the extension, based on the environment. Key URLs constructed include:
  - `https://gnar.*` (analytics)
  - `https://in.*` (analytics ingestion)
  - `https://f-log-extension.grammarly.io` (logging)
  - `https://capi.*` (core API)
  - `wss://capi.*` (WebSocket API)
  - `https://auth.*` (authentication)
  - `https://gateway.*` (skills)
  - `https://assets.extension.grammarly.com/` (static assets)
  - `https://data.*` (data services)
  - `https://api.iterable.com` (third-party marketing/messaging)

### DOM/Sinks
- `setTimeout`, `clearTimeout`
- `requestAnimationFrame`, `cancelAnimationFrame`
- `ResizeObserver`

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names
- React components

### Risks
- **Third-party Connection:** The code establishes a connection to `api.iterable.com`, a third-party marketing automation platform. This could be used for tracking user engagement, sending in-app messages, or other marketing-related activities.

### Evidence
- src/js/Grammarly-gDocs.js:62001-64000
- Module `87254`: `o.Rl.create("https://api.iterable.com")`

## src/js/Grammarly-gDocs.js [chunk 33/53, lines 64001-66000]

### Summary
This chunk is dense with configuration, feature flagging, and the core logic for rendering different types of inline suggestion cards.
- **URL and Asset Definitions (continued):** Finalizes the extensive list of URLs for all Grammarly services (API, auth, web pages) and CDN paths for assets like GIFs, images, and audio files used in onboarding and UI elements.
- **DAPI (Data API) Actions (32626):** Defines a set of actions for interacting with a "DAPI" (likely a data or settings API), with methods to modify onboarding state, dialect, and other user-specific settings.
- **Environment Initialization (28898):** Contains the `Env` class, a singleton responsible for initializing the entire extension's environment. It sets up the logger, determines the context (CS, BG), and builds the final configuration object based on browser type, deployment type, and other environmental factors.
- **Feature Flags and Experiments (70843, 90595, 77553):** This is the most significant part of the chunk. It explicitly defines a massive list of feature flags (`Cc`) and experiments (`KS`). These flags control nearly every feature in the extension, from major functionalities like "CitationBuilder", "Cheetah" (generative AI), and "GOSRollout" (Grammarly Overlay Service), to minor UI tweaks, performance experiments, and internal debugging tools. This provides a comprehensive map of the extension's capabilities.
- **Messaging API (33908, 28951):** Implements the `content-script-message-api`, which manages the communication port between the content script and the background service worker. It handles message broadcasting, callbacks, and reconnection logic in case the service worker is terminated.
- **DOM and UI Utilities (4026, 79039):** Provides helper functions for DOM manipulation (addClass, closest), event handling, and defines positioning configurations for various popups and notifications (e.g., login reminders, onboarding tours).
- **Inline Card Rendering (44914):** Contains the core React rendering logic for various inline cards. It includes components for:
    - **SDUI (Server-Driven UI) cards:** Generic cards whose content and behavior are defined by the server.
    - **FSI (Fully Signed-In) cards:** Cards related to authentication, including blurred suggestions for logged-out users (`BlurredFsiCard`), quick signup forms (`QuickSignupFsiCard`), and account choosers (`AccountChooserFsiCard`).
    - **Legacy cards:** Handlers for older card types, such as unknown word suggestions and basic text corrections.
    - **Knowledge Hub cards:** Renders results from the Knowledge Hub feature.
    - **Suggested Snippets:** A card that suggests creating a reusable snippet from repetitive text.

### Chrome APIs
- None explicitly called, but the messaging API (`33908`) is built on top of `chrome.runtime.connect` and `chrome.runtime.sendMessage`.

### Event Listeners
- `resize` (in module `83934` for notifications)

### Messaging
- Defines the core content script to background messaging API.
- Listens for `bgSW-shutdown` and `contentScript-disconnected` internal events.
- Broadcasts messages from content script to background.

### Storage
- None

### Endpoints
- Defines URLs for `support` and `grammarlyEmployeesBugReportsUrl`.
- Defines asset URLs on `assets.extension.grammarly.com`.
- Defines URLs for social auth providers (Google, Facebook, Apple).

### DOM/Sinks
- `document.createEvent`, `document.dispatchEvent`
- `console.log`, `console.debug`, `console.warn`, `console.error`

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names
- Extensive use of feature flags and experiments to dynamically alter code paths and UI.
- Lazy loading of React components (`i.lazy`).

### Risks
- **Extensive Feature Flagging:** The sheer number of feature flags and experiments indicates that the extension's behavior can change dramatically without a new version being deployed. This makes static analysis challenging, as many features may be dormant or only active for certain users.

### Evidence
- src/js/Grammarly-gDocs.js:64001-66000
- Modules `70843`, `90595`: Feature flag and experiment definitions.
- Module `33908`: Content script messaging API.
- Module `44914`: Inline card rendering logic.

## src/js/Grammarly-gDocs.js [chunk 34/53, lines 66001-68000]

### Summary
This chunk is divided into two main functional areas: the continuation of the inline card rendering logic and a deep dive into the extension's core RPC (Remote Procedure Call) and messaging architecture.

- **Inline Card Rendering Logic (44914, 6090, 40188, 52993):** This is the central controller for displaying suggestion cards.
    - It acts as a factory, deciding which specific React component to render based on the `kind` of the card model (`common`, `vox`, `sdui`, `suggestedSnippet`, `knowledgeHub`).
    - It handles the logic for the "Fully Signed-In" (FSI) experience, determining whether to show a blurred card, a quick signup form, or an account chooser based on experiment flags and user authentication history.
    - It defines the data models for each card type, encapsulating properties like header text, replacements, and extra metadata.
    - It includes the logic for rendering various footers on cards, such as "first accept" encouragement or premium feature footers.

- **Core RPC and Messaging Infrastructure (53966, 23472, 30603, 40866, 46231, 36798, 46649, 59405):** This is a foundational part of the extension's architecture, defining a sophisticated system for communication between the content script and the background service worker.
    - **RPC Abstraction:** It creates a proxy-based RPC system that allows the content script to call functions in the background script (and vice-versa) as if they were local methods.
    - **Observable Support:** The RPC system is built to handle not just single method calls but also streaming data via RxJS-like Observables. This is used for continuous updates, like connection status or user state changes.
    - **Tunneling and Proxying (46231, 59405):** Implements a "tunneling" mechanism, allowing RPC calls to be proxied through intermediate layers. This is likely used to manage communication with multiple iframes or components from a single background connection.
    - **Lifecycle Management:** The system includes logic for garbage collection of unused observables and ping/pong heartbeats to keep connections alive and detect disconnections.
    - **Message Naming:** Defines unique names for different RPC channels (`cs-to-bg-rpc-*`, `cs-to-bg-observable-rpc-*`) to separate different communication streams (e.g., legacy API, static CAPI).

- **Persistent Storage (43912, 3774):** Defines a `PersistentStore` class that wraps the browser's storage API (`chrome.storage.local` or similar).
    - It provides a reactive interface (`view()`, `changes`) to the stored data.
    - It includes a mechanism to handle "mismatched changes," where the in-memory state becomes out of sync with the persisted state, triggering a full reload from storage.
    - It defines a list of all keys used in persistent storage, including protected keys that can only be modified through specific actions.

- **URL Construction and Utilities (95404, 25693, 16381):** Continues to define helper functions for building URLs with appropriate UTM parameters for various campaigns (e.g., sign-in, sign-up, subscription pages) and for parsing information about the current page's domain and path.

### Chrome APIs
- The RPC and PersistentStore implementations are high-level abstractions over `chrome.runtime.sendMessage`, `chrome.runtime.connect`, and `chrome.storage.*`.

### Event Listeners
- `error` and `unhandledrejection` listeners are set up globally (in module `39963`) to catch and log errors.

### Messaging
- This chunk defines the entire RPC messaging protocol, including request/response formats, observable subscription/unsubscription messages, and proxy/tunneling data structures.

### Storage
- Defines the `PersistentStore` and lists all keys used for persistent data, such as `user`, `version`, `dynamicConfig`, `extensionSettings`, `oauthSDKTokenExchangeMethod`, etc.

### Endpoints
- Defines URL construction logic for authentication (`/signin`, `/signup`) and account management (`/account/subscription`).

### DOM/Sinks
- No direct DOM manipulation. The focus is on data models, communication protocols, and React component logic.

### Dynamic Code/Obfuscation
- Webpack modules
- Minified variable names
- The RPC system is a significant architectural abstraction that hides the underlying message passing, making the code flow non-linear and harder to trace without understanding the proxy mechanism.

### Risks
- No new risks identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.js:66001-68000
- Module `44914`: Main inline card renderer.
- Modules `46231`, `36798`, `59405`: Core RPC and observable implementation.
- Module `43912`: Persistent storage wrapper.
- Module `3774`: List of all persistent storage keys.
## src/js/Grammarly-gDocs.beautified.js [chunk 35/53, lines 68001-70000]

### Summary
This chunk is heavily focused on the extension's state management and logging infrastructure. It finalizes the RPC server implementation and introduces a comprehensive set of "action" creators for modifying the application's state. These actions manage everything from user-facing settings (autocorrect, Always Available Assistant, Citation Builder) to internal states like network connection and authentication. The chunk also defines the default structures for settings and user profiles, including different user tiers (free, premium, business) that control feature access. A sophisticated client-side logging framework is detailed, featuring a `HistoryLogsService` with prioritized log buffers, throttling, and session storage backup capabilities for robust debugging and monitoring.

### Findings
- **RPC Server Finalization (Module `29348`):** Completes the RPC server logic with methods for disposing of server/client instances and creating "tunneled" transports that multiplex messages over a single connection.
- **Generic RPC Method Handler (Module `30498`):** Defines a core RPC server class that dynamically handles incoming method calls, executes them against a provided API object, and returns the results.
- **State Management Actions (Modules `86837`, `89512`, `24534`, `15933`, `31715`, `42900`, `55830`, `18428`, `44814`):** A large collection of action creators for modifying the central application state.
  - **`quickSettings` (Module `42900`):** Manages numerous user settings, including synonyms, autocorrect, the "Always Available Assistant," "Touch Typist" feature, and the Citation Builder.
  - **`settings` (Module `18428`):** Manages global settings like desktop integration, click-to-run, and debug features.
  - **`allActions` (Module `55830`):** Aggregates all individual action creators into a single, unified interface for all state modifications.
- **Default Settings and User Profiles (Modules `15362`, `19724`):** Defines the initial shape of the `extensionSettings` and the different user types (`anonymous`, `registered`, `premium`, `business`), which are used to gate features.
- **Client-Side Logging Framework (Modules `66209`, `97833`, `8058`, `40594`):**
  - **`HistoryLogsService` (Module `97833`):** The core of the logging system. It manages multiple log buffers based on priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and can resize them based on whether advanced logging is enabled.
  - **`BackupStorage` (Module `66209`):** Implements a throttled mechanism to back up logs to session storage, ensuring that recent logs are preserved even if the extension crashes.
  - **`Logger` (Module `8058`, `78235`):** The main logger class that handles log events, filters them, and pushes them to the `HistoryLogsService` and the console.
  - **`Logger.create` (Module `40594`):** A factory function for creating new logger instances.
- **Utility Functions (Modules `39020`, `36769`, `78767`, `53396`, `31272`):** A wide range of helper functions for array manipulation, assertions, type guards, lazy initialization (`Lazy`), and object manipulation.

### Chrome APIs
- `chrome.storage.session` (inferred from `_sessionStorage` in `BackupStorage`)

### Obfuscation Hints
- **Webpack Modules:** Clear webpack module structure with numeric IDs.
- **Minified Vars:** Some single-letter variables are present, but many modules use descriptive names.
- **Generated APIs:** The `allActions` object is a generated API surface for interacting with the application state.

### Risks
- **In-depth Logging:** The extensive logging framework, while great for debugging, could potentially capture sensitive information if not handled carefully. The `normalizeData` function attempts to mitigate this but still captures significant detail about DOM elements and object structures.
## src/js/Grammarly-gDocs.beautified.js [chunk 36/53, lines 70001-72000]

### Summary
This chunk is almost entirely dedicated to defining the `TelemetryService` (class `S` in module `60378`), a massive and critical component for client-side event tracking and logging. This service is responsible for sending a wide variety of events, from low-level technical errors to user interaction metrics, to Grammarly's backend systems (`felog`, `femetrics`). It provides a catalog of specific, named methods for nearly every trackable event in the extension, covering areas like connection status, configuration loading, UI interactions, unhandled exceptions, and feature-specific usage. The service includes robust error handling, data serialization, event sampling, and performance measurement capabilities. It also contains dedicated logging suites for major features like Google Docs integration, the Always Available Assistant, Autocorrect, and third-party services like Iterable for in-product messaging.

### Findings
- **Core Telemetry Service (Module `60378`):** Defines the main `TelemetryService` class.
  - **Sending Logic:** Implements core methods (`_send`, `_sendUsage`, `_sendSampled`, `_sendEvent`) to handle the dispatch of events to different backends.
  - **Event Catalog:** The class body is a huge enumeration of methods, each corresponding to a specific telemetry event. Examples include:
    - `restoredBgConnection`, `initWithoutBgConnection`: Tracks the health of the content-script-to-background-script connection.
    - `userUpgradeClick`, `gButtonClick`: Tracks user UI interactions.
    - `unhandledExceptions`, `csCrash`: Catches and reports unhandled errors and crashes.
    - `storageMigrationFailed`, `cookieOverflow`: Logs infrastructure and storage-related issues.
  - **Performance Logging:** Integrates a `_createPerfLogger` factory to create performance timers for critical operations (e.g., `cs.fluid.processInput`, `cs.assistant.initTime`).
  - **Exception Handling:** Uses a standardized `_sendException` helper to report errors with consistent structure.
- **Feature-Specific Logging Suites:**
  - **`gdocs` & `canvasGdocs`:** An extensive set of loggers for tracking every aspect of the Google Docs integration, including page rendering, mapping performance, exceptions, and user interactions with popups.
  - **`alwaysAvailableAssistant`:** Tracks feedback, chat deletions, and failures related to the assistant.
  - **`autocorrect` & `autoApply`:** Logs user interactions with automated correction features (triggers, reverts, accepts).
  - **`knowledgeHub` & `citationBuilder`:** Telemetry for newer, complex writing assistance features.
  - **`iterable`:** A full suite for tracking the lifecycle of In-Product Messages (IPMs) from the Iterable service (fetch, open, click, delete, errors).
- **Factories and Helpers:**
  - **`g2LoggerFactory`:** A factory for creating standardized loggers for "G2" (next-generation) integrations.
  - **`touchTypistLoggerFactory`:** A dedicated logger factory for the "Touch Typist" feature.
- **Observable and Promise Utilities (Modules `13848`, `25714`, `87459`):** Provides helper functions for working with RxJS Observables and Promises, including `SafePromise` which adds better stack traces to caught errors.
- **String and Hash Utilities (Modules `75224`, `82485`):** Includes functions for string manipulation (e.g., capitalization, finding indices) and hashing.

### Obfuscation Hints
- **Webpack Modules:** Clear webpack module structure.
- **Minified Vars:** Widespread use of single-letter variables (`e`, `t`, `n`, `r`) as function arguments and local variables, indicating minification.
- **Generated APIs:** The `TelemetryService` class itself acts as a large, generated API for all tracking events.

### Risks
- **Exhaustive Data Collection:** The sheer volume and detail of the telemetry collected could pose a privacy risk. While some events are explicitly marked `hideUserInfo: true`, the system is capable of logging extensive data about user behavior, system configuration, and errors, which could inadvertently include sensitive information.
## src/js/Grammarly-gDocs.beautified.js [chunk 37/53, lines 72001-74000]

### Summary
This chunk concludes the definition of the massive `TelemetryService` and then introduces two significant, self-contained libraries: a comprehensive color manipulation utility and the full implementation of the DOMPurify HTML sanitizer. The telemetry definition adds logging for a wide array of features, including in-product messaging (Iterable), server-driven UI, authentication hooks, and extremely detailed metrics for text replacements and service availability. The inclusion of DOMPurify, with an exhaustive configuration of allowed tags and attributes for HTML, SVG, and MathML, highlights a strong focus on security by preventing XSS vulnerabilities from dynamically rendered content.

### Findings
- **`TelemetryService` Conclusion (Module `60378`):** The remainder of the `TelemetryService` class is defined, adding numerous logging suites:
  - **`iterable` & `mise`:** Extensive logging for fetching, displaying, and interacting with In-Product Messages (IPMs).
  - **`alerts` & `sdui`:** Telemetry for alert rendering, including Server-Driven UI cards.
  - **`authHooks` & `upgradeHooks`:** Tracking for authentication and premium upgrade prompts.
  - **`replacement`:** A highly detailed metrics suite for analyzing the success and characteristics of text replacements, including formatting, style, and source. This is a core data collection mechanism for suggestion quality.
  - **`serviceAvailability`:** A detailed suite for measuring user engagement, including view duration, typing duration, and typing length across domains.
  - **`connector`:** Telemetry for the component that manages integrations with text fields, including connection status and permissions.
  - **`inkwell` & `gOS`:** Logging for the "Inkwell" document processing feature and the "Grammarly for Developers" (gOS) SDK.
- **Color Manipulation Library (Module `53784`):** A full-featured library for parsing and manipulating colors.
  - **Formats:** Supports hex, RGB, and HSL color formats.
  - **Functions:** Provides a rich API for color operations like `lighten`, `darken`, `saturate`, `desaturate`, `grayscale`, `mix`, `tint`, `shade`, and `spin`.
  - **Usage:** Likely used for dynamically generating UI component styles.
- **DOMPurify HTML Sanitizer (Module `72314`):** The complete implementation of the DOMPurify library.
  - **Purpose:** A critical security component used to prevent Cross-Site Scripting (XSS) by sanitizing HTML before it is rendered in the DOM.
  - **Configuration:** Contains extensive, hardcoded lists of allowed tags and attributes for HTML (`k`, `D`), SVG (`A`, `R`, `P`, `L`), and MathML (`O`, `F`, `B`), demonstrating a meticulous approach to security.
  - **Policy Detection:** Includes logic to integrate with Trusted Types policies if they are available in the environment.

### Obfuscation Hints
- **Webpack Modules:** Clear webpack module structure.
- **Minified Vars:** Continued use of single-letter variables.
- **Library Bundling:** The inclusion of the full, unobfuscated DOMPurify source code within a module is a clear sign of library bundling.

### Risks
- **Security (Mitigated):** The explicit inclusion and detailed configuration of DOMPurify is a strong mitigation against XSS vulnerabilities, which are a common risk in extensions that render dynamic content. The presence of this library is a positive security signal.
## src/js/Grammarly-gDocs.beautified.js [chunk 38/53, lines 74001-76000]

### Summary
This chunk is composed of several bundled libraries. It contains the core implementation and configuration logic for the **DOMPurify** HTML sanitizer, a complete text-diffing library (likely **diff-match-patch**), and a suite of functional programming utilities from a library like **fp-ts** for handling `Either`, `Eq`, and function composition.

### Findings
- **DOMPurify Core Logic**:
  - Contains the main `sanitize` function which orchestrates the parsing, node iteration, and application of sanitization rules.
  - Implements the configuration function `ut` which processes settings like `ALLOWED_TAGS`, `ALLOWED_ATTR`, `FORBID_TAGS`, and `USE_PROFILES`.
  - Includes the element sanitizer (`xt`) which validates tags against allow/forbid lists and handles custom element checks.
  - Includes the attribute sanitizer (`Tt`) which validates attributes against allow-lists, URI schemes, and prevents DOM clobbering by prefixing `id` and `name` attributes.
  - Provides a system of hooks (`addHook`) for injecting custom logic at various stages of the sanitization process.
  - Evidence: lines 74009-75203.

- **Text Diffing Library (diff-match-patch)**:
  - A bundled and minified version of a text diffing algorithm.
  - Defines constants for `INSERT` (1), `DELETE` (-1), and `EQUAL` (0).
  - Exports a main function that takes two strings and returns a sequence of operations to transform one into the other.
  - This suggests the extension has functionality related to comparing text versions, such as showing changes or revisions.
  - Evidence: lines 75205-75782.

- **Functional Programming Utilities (fp-ts style)**:
  - **`Either`**: A comprehensive implementation of the `Either` type, including `map`, `ap`, `chain`, `bimap`, `getOrElse`, `tryCatch`, and functions to convert from `Nullable` or `Predicate`. This is used for robust error handling. (Evidence: lines 75888-76000)
  - **`Eq`**: Utilities for creating equality checkers (`Eq` instances) for various data structures (structs, tuples). (Evidence: lines 75798-75841)
  - **Applicative/Monad helpers**: Functions like `sequence` and `traverse` for working with functional data structures. (Evidence: lines 75843-75886)

### Obfuscation Hints
- **Bundled Libraries**: Multiple distinct libraries (`DOMPurify`, `diff-match-patch`, `fp-ts`) are bundled into a single file, which is a common practice but also a form of code organization that can obscure the origin of specific functionalities.

### Risks
- No new risks identified in this chunk. The presence and detailed configuration of DOMPurify is a strong positive indicator for security, as it's designed to prevent XSS attacks.

## src/js/Grammarly-gDocs.beautified.js [chunk 39/53, lines 76001-78000]

### Summary
This chunk consists entirely of bundled functional programming utility libraries, characteristic of the `fp-ts` ecosystem. It provides a rich, immutable, and type-safe API for common JavaScript data structures like `Map` and `Array`.

### Findings
- **`IOEither` Utilities**: Contains helper functions for working with `IOEither`, a type for representing synchronous operations that can fail. (Evidence: lines 76001-76015)

- **Functional `Map` Library**: A comprehensive set of utilities for working with JavaScript `Map` objects in a functional style.
  - **Instances**: `getEq` (for equality checking), `getMonoid` (for combining maps).
  - **Data Access**: `lookup` (safe key access returning an `Option`), `elem` (check for value existence).
  - **Transformations**: `map`, `mapWithIndex`, `filter`, `filterMap`, `partition`, `partitionMap`.
  - **Folding/Reduction**: `reduce`, `foldMap`, `reduceWithIndex`.
  - **Traversals**: `traverse`, `sequence` for applying effectful functions to map values.
  - Evidence: lines 76193-76715.

- **`ReadonlyArray` Functional Library**: An extensive collection of functions for operating on immutable arrays.
  - **Constructors**: `empty`, `of`, `replicate`.
  - **Safe Accessors**: `head`, `last`, `lookup` (returns `Option`).
  - **Transformations**: `map`, `mapWithIndex`, `chain` (flatMap), `ap`.
  - **Slicing/Chunking**: `takeLeft`, `dropLeft`, `chunk`.
  - **Filtering**: `filter`, `filterMap`, `partition`, `compact`, `separate`.
  - **Folding**: `reduce`, `reduceRight`, `foldMap`.
  - **Searching**: `findFirst`, `findLast`, `findIndex`.
  - **Set Operations**: `union`, `intersection`, `difference`.
  - **Sorting & Uniqueness**: `sort`, `uniq`.
  - **Zipping**: `zip`, `zipWith`, `unzip`.
  - Evidence: lines 76717-78000.

### Obfuscation Hints
- **Bundled Libraries**: The code is a bundle of many small, specialized functional modules. While not traditional obfuscation, this level of abstraction and the specific paradigm can make the code's intent difficult to trace without understanding the underlying libraries (`fp-ts`).

### Risks
- No risks identified. This is standard, robust library code designed to enhance type safety and prevent common errors through immutability and explicit handling of optional values and errors.

## src/js/Grammarly-gDocs.beautified.js [chunk 40/53, lines 78001-80000]

### Summary
This chunk continues the large bundle of functional programming utilities, consistent with the `fp-ts` library. It extends the `Map` and `Array` utilities from the previous chunk and introduces comprehensive libraries for `Record` (JavaScript objects), `Tuple` (pairs), and the `These` data type.

### Findings
- **`Record` Utilities**: A large, full-featured library for working with `Record<string, T>` (standard JavaScript objects) in a functional, immutable way.
  - **Transformations**: `map`, `mapWithIndex`.
  - **Folding/Reduction**: `reduce`, `reduceWithIndex`, `reduceRight`.
  - **Filtering**: `filter`, `filterMap`, `partition`, `partitionMap`.
  - **Data Access**: `lookup` (safe property access returning `Option`), `elem` (check for value existence).
  - **Traversals**: `traverse`, `sequence` for applying effectful functions to record values.
  - **Instances**: `getMonoid` (for merging records), `getEq` (for deep equality checking).
  - Evidence: lines 78295-79245.

- **`Tuple` (Pair) Utilities**: A small library for manipulating 2-element arrays.
  - **Accessors**: `fst` (first), `snd` (second).
  - **Transformations**: `map`, `mapLeft`, `bimap`, `swap`.
  - Evidence: lines 79247-79311.

- **`These` Data Type**: Implementation of the `These` type, which can represent `Left`, `Right`, or `Both`. This is often used for validation that can accumulate errors while also producing a successful value.
  - **Constructors**: `left`, `right`, `both`.
  - **Type Guards**: `isLeft`, `isRight`, `isBoth`.
  - **Folding**: A `fold` function for handling all three cases.
  - Evidence: lines 79313-79438.

- **Core Functional Utilities**:
  - **`pipe`, `flow`**: Functions for function composition.
  - **Constants**: `constTrue`, `constFalse`, `identity`.
  - **`absurd`**: A function for proving exhaustive checks in type systems.
  - Evidence: lines 79550-79680.

### Obfuscation Hints
- **Bundled Libraries**: The code is a bundle of many small, specialized functional modules. The high level of abstraction and specific paradigm can make direct tracing of business logic difficult without understanding the `fp-ts` patterns.

### Risks
- No risks identified. This is standard, robust library code.

## src/js/Grammarly-gDocs.beautified.js [chunk 41/53, lines 80001-82000]

### Summary
This chunk contains a complete, bundled implementation of a powerful data validation and codec (encoder/decoder) library, strongly resembling **`io-ts`**. This library is used to define runtime types, validate incoming data against these types, and encode/decode data to and from these types.

### Findings
- **Core Codec Class**: A central `Type` or `Codec` class is defined, which encapsulates `name`, `is` (a type guard), `validate` (for decoding and validation), and `encode` methods. (Evidence: lines 81650-81690)

- **Type Constructors**: A rich set of constructors is provided to build complex codecs:
  - **Primitives**: `literal`, `string`, `number`, `boolean`. (Evidence: lines 81200-81250)
  - **Combinators**: `nullable`, `type` (for object schemas), `partial` (for objects with optional properties), `array`, `record`, `tuple`. (Evidence: lines 81250-81400)
  - **Logic Combinators**: `intersect` (for combining object types), `union`, `sum` (for discriminated unions). (Evidence: lines 81400-81500)
  - **Refinement**: `refine` to add custom validation logic to an existing type. (Evidence: line 81245)
  - **Recursive Types**: `lazy` for defining self-referential types. (Evidence: line 81510)

- **Error Reporting**:
  - Defines a `ValidationError` structure.
  - Includes a `PathReporter` that generates human-readable error messages from validation failures, indicating the path to the invalid data. (Evidence: lines 81080-81180)

- **Schemable Interface**: Implements a `Schemable` interface that allows a single definition to be interpreted as a `Guard`, `Decoder`, `Encoder`, or `Eq` instance, promoting code reuse and consistency. (Evidence: lines 81200-81600)

### Obfuscation Hints
- **Bundled Library**: This is a large, self-contained library bundled directly into the file. While not obfuscation in the traditional sense, it adds a significant amount of complex, generic code that is not specific to the extension's direct business logic.

### Risks
- No new risks identified. The presence of a robust runtime validation library like this is a strong positive security practice. It suggests that data, especially from external sources, is carefully checked against expected schemas, which helps prevent a wide range of bugs and security vulnerabilities related to data integrity.

## src/js/Grammarly-gDocs.beautified.js [chunk 42/53, lines 82001-84000]

### Summary
This chunk concludes the implementation of the `io-ts`-like validation library and begins to define a large number of UI-related components and styles. It also includes a Levenshtein distance implementation, likely for text comparison or suggestions.

### Findings
- **`io-ts` Primitives and Combinators**: The chunk defines the concrete implementations for the core `io-ts` types and combinators that were declared in the previous chunk. This includes:
  - Basic types: `void`, `unknown`, `string`, `number`, `boolean`, `UnknownArray`, `UnknownRecord`. (Evidence: lines 82001-82100)
  - Advanced types: `LiteralType`, `KeyofType`, `RefinementType`, `RecursiveType`, `ArrayType`, `InterfaceType` (for object schemas), `PartialType` (for optional properties), `DictionaryType` (for records/maps), `UnionType`, `IntersectionType`, `TupleType`, `ReadonlyType`, `ReadonlyArrayType`, and `ExactType`. (Evidence: lines 82100-83500)
  - These findings confirm the library is a comprehensive solution for runtime data validation.

- **Levenshtein Distance Algorithm**: A standalone function for calculating the Levenshtein distance between two strings is included. This is a strong indicator of functionality related to spell checking, diffing, or finding "close" matches for text. (Evidence: lines 83550-83650)

- **CSS Module Exports**: A significant portion of this chunk consists of `module.exports` assignments that map component or style names to obfuscated CSS class names (e.g., `ideateButton: "_ErYR"`). This is characteristic of a build process using CSS Modules to scope styles locally to components. (Evidence: lines 83700-84000)
  - Examples include styles for: `ideateButton`, `dunningMessagePopup`, `gButtonContainer`, `suggestionCardHeader`, `badge`, `popoverMenu`, `tooltip`, and many others.

- **Optics/Lens Library (`monocle-ts`)**: The chunk includes a bundled implementation of a library that strongly resembles `monocle-ts`. It defines core optical types like `Iso`, `Lens`, `Prism`, `Optional`, `Traversal`, `Getter`, and `Setter`. These are powerful tools for immutably accessing and updating nested data structures, often used in combination with functional libraries like `fp-ts`. (Evidence: lines 83800-83990, interspersed with CSS modules)

### Obfuscation Hints
- **Bundled Libraries**: Continues to show evidence of multiple, distinct libraries (`io-ts`, `monocle-ts`, Levenshtein) being bundled into a single file.
- **CSS Class Name Obfuscation**: The CSS class names are minified (e.g., `_ErYR`, `zCXgw`), which is standard practice for production builds but is a form of obfuscation.

### Risks
- No new risks identified. The use of `monocle-ts` and `io-ts` points to a sophisticated and robust approach to state management and data handling.

## src/js/Grammarly-gDocs.beautified.js [chunk 43/53, lines 84001-86000]

### Summary
This chunk is dominated by low-level implementations of hashing algorithms and the core event handling logic of a bundled React-like library. It details how events are created, dispatched, and managed within the library's synthetic event system.

### Findings
- **Hashing Algorithms**:
  - **MurmurHash3**: A complete implementation of the MurmurHash3 algorithm (both 32-bit and 128-bit versions) is present. This is a high-performance, non-cryptographic hash function often used for hash-based lookups (e.g., in hash tables or bloom filters). (Evidence: lines 84020-84300)
  - **SuperFastHash**: An implementation of the SuperFastHash algorithm is also included. (Evidence: lines 84350-84400)
  - A factory function `createHash` is provided to select between these hashing algorithms. (Evidence: lines 84001-84015)

- **React-like Event System**: A large portion of the chunk is dedicated to what appears to be a bundled version of React's synthetic event system. Key features identified include:
  - **Event Polyfills and Normalization**: Code for creating and normalizing event objects across different browsers (e.g., `un`, `hn`, `gn`). It defines properties for various event types like mouse events, keyboard events, and UI events. (Evidence: lines 85200-85600)
  - **Event Dispatching and Listener Management**: Logic for dispatching events to the correct listeners, including handling event propagation (bubbling and capturing phases). (Evidence: lines 85800-86000)
  - **Event Plugin System**: The code structure suggests a plugin system where different event types (`onChange`, `onInput`, `onClick`, etc.) are handled by specific plugins. (Evidence: lines 85600-85800, with functions like `Gn` and `zn` for composition and input events).
  - **Controlled Component Logic**: Implementation details for handling controlled components in forms (like `<input>`, `<textarea>`, `<select>`), including tracking their values and checked states (`q`, `K`, `Z`, `J`). (Evidence: lines 84800-85100)
  - **DOM Property and Attribute Handling**: A detailed implementation for setting and updating DOM properties and attributes, including handling of special cases, namespaces (SVG, MathML), and boolean attributes. (Evidence: lines 84500-84700)
  - **Event Blocking and Prioritization**: Logic for managing event priorities and handling situations where events might be blocked (e.g., by a modal or a suspended component). This includes concepts of "lanes" for scheduling updates. (Evidence: lines 85700-85900)

### Obfuscation Hints
- **Minified React Internals**: The code is heavily minified and contains patterns and variable names (e.g., `o(91)`, `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`) that are characteristic of a production build of React.

### Risks
- No new risks identified. The code demonstrates a complex, production-grade UI library is being used to render the extension's interface.

## src/js/Grammarly-gDocs.beautified.js [chunk 44/53, lines 86001-88000]

### Summary
This chunk continues the deep dive into the bundled React-like library's internals, focusing on the core reconciliation algorithm (the "fiber" architecture). It details how the library processes component updates, manages component state and props, and handles the component lifecycle.

### Findings
- **Event System Finalization**:
  - The chunk starts by finalizing the event system logic from the previous chunk, including the mapping of DOM events to React event handlers (e.g., `onAnimationEnd`, `onDoubleClick`, `onFocus`). (Evidence: lines 86050-86200)
  - It defines logic for event propagation, including how `onMouseEnter`/`onMouseLeave` are derived from `mouseover`/`mouseout`. (Evidence: lines 86600-86800)
  - It sets up event listeners for a wide range of DOM events, ensuring the library can capture and handle user interactions. (Evidence: lines 86250-86400)

- **Fiber Node Architecture**:
  - The code defines the core data structure for a "fiber," which is the internal representation of a component instance. This includes properties like `tag` (component type), `key`, `elementType`, `pendingProps`, `memoizedProps`, `memoizedState`, `updateQueue`, `flags` (for side-effects), and pointers (`return`, `child`, `sibling`). (Evidence: lines 87800-88000, and throughout)
  - Functions like `Rc` (likely `createFiber`) are used to create new fiber nodes.

- **Reconciliation Logic (The "Render Phase")**:
  - The core `beginWork` and `completeWork` phases of the reconciliation process are evident. The code contains a large switch statement (`Ac`) that delegates to different functions based on the fiber's `tag` (e.g., `FunctionComponent`, `ClassComponent`, `HostComponent`). (Evidence: lines 87900-end of chunk, though the full switch is not visible).
  - **Child Reconciliation**: It includes the logic for diffing children (the `reconcileChildFibers` function, aliased as `yo`). This logic determines whether to create, update, or delete child components based on their keys and types. It handles single children, arrays of children, and iterables. (Evidence: lines 87400-87700)
  - **Context API Implementation**: The implementation of React's Context API is present, including `createContext`, `readContext`, and the logic for propagating context changes through the component tree. (Evidence: lines 87100-87300)

- **Hooks Implementation**:
  - The complete implementation of React Hooks is present. This includes the dispatcher logic that routes `useState`, `useEffect`, `useContext`, etc., to the correct internal functions depending on whether the component is mounting or updating (`Qs` for mount, `ea` for update). (Evidence: lines 87800-88000)
  - It includes the internal data structures for hooks (the linked list of `hook` objects) and the logic for processing the update queue for `useState` and `useReducer` (`Ho`). (Evidence: lines 87000-87100)

- **Class Component Lifecycle**:
  - The code implements the lifecycle methods for class components, including `getDerivedStateFromProps`, `shouldComponentUpdate`, `componentWillMount`, `componentDidMount`, `componentWillUpdate`, `componentDidUpdate`, and `componentWillReceiveProps`. (Evidence: lines 87850-88000)

### Obfuscation Hints
- **Minified React Internals**: This is a continuation of the minified React source code. The function and variable names are short and non-descriptive (e.g., `yo`, `wo`, `So`, `Rc`), and error codes are used instead of full error messages.

### Risks
- No new risks identified. This chunk provides further evidence of a sophisticated, well-structured UI library being used, which is a standard and secure practice for building complex web interfaces.


## src/js/Grammarly-gDocs.beautified.js [chunk 45/53, lines 88001-90000]

### Summary
This chunk covers the **commit phase** of the React reconciler. This is a critical part of React's rendering process where the changes calculated during the "render phase" are actually applied to the DOM. This code is responsible for DOM insertions, updates, and deletions. It also handles the execution of component lifecycle methods (like `componentDidMount` and `componentDidUpdate`), `useEffect` hooks, and updating `ref` objects to point to the correct DOM nodes or component instances.

### Obfuscation Hints
- **react_internals**: Deeply nested functions and variables prefixed with `_` are indicative of internal React library code.
- **react_commit_phase**: The presence of functions related to DOM mutations, effect tags (e.g., `Placement`, `Update`, `Deletion`), and lifecycle method invocation are hallmarks of the commit phase.

### Risks
- No direct risks identified in this chunk, as it's part of a well-known library's core rendering logic.

### Evidence
- The analysis is based on the code structure within lines 88001-90000 of `src/js/Grammarly-gDocs.beautified.js`.

## src/js/Grammarly-gDocs.beautified.js [chunk 46/53, lines 90001-92000]

### Summary
This chunk exposes the public API of the `react-dom` library. It serves as the bridge between the React reconciler (analyzed in previous chunks) and the host environment (the browser). Key functions like `createRoot`, `hydrateRoot`, `render`, and `unmountComponentAtNode` are defined here. This code is the entry point for initiating and managing the rendering of a React application into the DOM. Additionally, this chunk contains the logic for injecting the reconciler into the React DevTools global hook (`__REACT_DEVTOOLS_GLOBAL_HOOK__`), enabling debugging and inspection capabilities.

### Obfuscation Hints
- **react_api**: The presence of well-known `react-dom` public methods (`createRoot`, `render`, etc.) indicates this is the library's public interface.
- **react_devtools_hook**: The code explicitly checks for and interacts with `__REACT_DEVTOOLS_GLOBAL_HOOK__`, a clear sign of the DevTools integration logic.

### Risks
- No direct risks are identified. This is standard boilerplate for the `react-dom` libra
### ### Evidence
- The analysis is based on the code structure within lines 90001-92000 of `src/js/Grammarly-gDocs.beautified.js`.

## src/js/Grammarly-gDocs.beautified.js [chunk 47/53, lines 92001-94000]

### Summary
This chunk is a collection of RxJS operators and utilities. RxJS is a library for reactive programming using Observables, which makes it easier to compose asynchronous or callback-based code. The code defines numerous operators for creating, transforming, filtering, and combining streams of data. Key operators identified include `from`, `of`, `map`, `filter`, `merge`, `concat`, `zip`, `combineLatest`, `debounceTime`, `throttleTime`, `retry`, `catchError`, and various buffering and windowing operators. This indicates that the extension heavily relies on reactive patterns for managing events, asynchronous operations, and state.

### Obfuscation Hints
- **rxjs_operators**: The code structure with numerous small, chainable functions is characteristic of RxJS operators.
- **observable_patterns**: The use of `pipe`, `subscribe`, and the creation of `Observable` instances are clear indicators of RxJS usage.

### Risks
- No direct risks are identified. This is a standard, widely-used library for managing asynchronous data streams.

### Evidence
- The analysis is based on the code structure within lines 92001-94000 of `src/js/Grammarly-gDocs.beautified.js`.

## src/js/Grammarly-gDocs.beautified.js [chunk 48/53, lines 94001-96000]

### Summary
This chunk continues the collection of RxJS operators. It includes a wide array of operators for controlling the flow of observable streams, such as `retry`, `repeat`, `sample`, `scan`, `sequenceEqual`, `share`, `single`, `skip`, `take`, `throttle`, `timeout`, `timestamp`, and `toArray`. It also contains more advanced operators for windowing and combining streams like `window` and `zip`. The presence of these operators further confirms the extension's reliance on complex reactive patterns for managing asynchronous data and events.

### Obfuscation Hints
- **rxjs_operators**: The code consists of many small, composable functions, which is characteristic of the RxJS library.
- **observable_patterns**: The implementation details clearly relate to the manipulation of `Observable` data streams.

### Risks
- No direct risks are identified. This is a continuation of the standard RxJS library.

### Evidence
- The analysis is based on the code structure within lines 94001-96000 of `src/js/Grammarly-gDocs.beautified.js`.
## src/js/Grammarly-gDocs.beautified.js [chunk 49/53, lines 96001-98000]

### Summary
This chunk contains a variety of bundled libraries and application features. Key findings include React's internal scheduler for cooperative multitasking, the `typestyle` CSS-in-JS library, and the `ua-parser-js` library for user agent string analysis. It also contains detailed definitions for core product features like the "AI Detector" and "Plagiarism Checker," including their state machines, communication protocols, and integration points. Finally, it includes a set of React components from what appears to be an internal design system (GDS - Grammarly Design System) and various utilities like a UUID generator and an LRU cache.

### Obfuscation Hints
- `webpack_modules`: The code is structured as a webpack bundle.

### Findings
- **Dynamic Code:** None
- **WASM:** None
- **DOM:** None
- **Chrome APIs:** None
- **Event Listeners:** None
- **Endpoints:** None
- **Storage:** None
- **Messages:**
  - Defines protocols for "AI Detector" and "Plagiarism Checker" features, including `cardAction/:docId` and `panelAction/:docId`.
- **Third-party Libraries:**
  - **React Scheduler**: Internal scheduling library for React.
  - **typestyle**: A CSS-in-JS library.
  - **ua-parser-js**: For parsing user agent strings.
  - **uuid**: For generating UUIDs.
- **Risks:** None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:96182-96651 (React Scheduler)
- src/js/Grammarly-gDocs.beautified.js:96670-97011 (typestyle)
- src/js/Grammarly-gDocs.beautified.js:97015-97508 (ua-parser-js)
- src/js/Grammarly-gDocs.beautified.js:97512-97531 (uuid)
- src/js/Grammarly-gDocs.beautified.js:97535-97618 (AI Detector feature definition)
- src/js/Grammarly-gDocs.beautified.js:97622-97729 (Plagiarism Checker feature definition)
- src/js/Grammarly-gDocs.beautified.js:97805-97843 (LRU Cache)
- src/js/Grammarly-gDocs.beautified.js:97933-98000 (Grammarly Design System components)
## src/js/Grammarly-gDocs.beautified.js [chunk 50/53, lines 98001-100000]

### Summary
This chunk contains UI components and SVG assets, likely part of an internal design system (GDS). It defines a `Link` component with accessibility features and various visual styles. The majority of the code consists of React components that render different SVG logos, such as "LogoGo" and "LogoMail" in various color schemes and orientations (stacked, horizontal). It also includes helper functions for managing icon properties and issuing developer warnings for using non-standard icons.

### Obfuscation Hints
- `webpack_modules`: The code is structured as a webpack bundle.

### Findings
- **Dynamic Code:** None
- **WASM:** None
- **DOM:** Renders SVG and `<a>` elements as part of the UI components.
- **Chrome APIs:** None
- **Event Listeners:** `onClick` handlers are part of the `Link` component.
- **Endpoints:** None
- **Storage:** None
- **Messages:** None
- **Third-party Libraries:**
  - **react-aria**: Used for creating accessible UI components (`useLink`, `useFocusRing`).
- **Risks:** None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:98004-98040 (Icon developer warning)
- src/js/Grammarly-gDocs.beautified.js:98041-98133 (Icon component helpers)
- src/js/Grammarly-gDocs.beautified.js:98134-98269 (Link component)
- src/js/Grammarly-gDocs.beautified.js:98270-99990 (SVG Logo components)
## src/js/Grammarly-gDocs.beautified.js [chunk 51/53, lines 100001-102000]

### Summary
This chunk primarily contains a comprehensive, self-contained OAuth 2.0 client library. It also includes a few more SVG icon components for the internal design system. The OAuth library is robust, featuring mechanisms for token fetching, exchange, and refresh, with support for various grant types (`authorization_code`, `refresh_token`, `token-exchange`). It includes a full-featured HTTP client with retry logic and exponential backoff, a SHA-256 implementation (with a fallback from the native Web Crypto API), PKCE code challenge generation, and a mutex implementation using `localStorage` to handle race conditions across multiple tabs.

### Obfuscation Hints
- `webpack_modules`: The code is structured as a webpack bundle.

### Findings
- **Dynamic Code:** None
- **WASM:** None
- **DOM:** Renders SVG icon components.
- **Chrome APIs:** None
- **Event Listeners:** None
- **Endpoints:**
  - Interacts with `/oauth2/token` and `/oauth2/exchange` for token management.
- **Storage:**
  - Uses `localStorage` (`this._storage.setItem`, `this._storage.getItem`, `this._storage.removeItem`) to cache tokens and manage a mutex for token refresh operations. The storage key is dynamically created based on the client ID (e.g., `grammarly.{clientId}.tokens`).
- **Messages:** None
- **Third-party Libraries:** None explicitly named, but contains a full, bundled OAuth 2.0 client implementation.
- **Cryptography:**
  - Implements SHA-256 for PKCE code challenges.
  - Uses `crypto.getRandomValues` for generating the code verifier.
- **Risks:** None identified in this chunk.

### Evidence
- src/js/Grammarly-gDocs.beautified.js:100004-100215 (SVG Icon Components)
- src/js/Grammarly-gDocs.beautified.js:100550-101995 (OAuth 2.0 Client Library)
- src/js/Grammarly-gDocs.beautified.js:101235-101335 (HTTP Client with retry logic)
- src/js/Grammarly-gDocs.beautified.js:101336-101403 (TokensClient for OAuth endpoints)
- src/js/Grammarly-gDocs.beautified.js:100785-100998 (SHA-256 implementation)
- src/js/Grammarly-gDocs.beautified.js:101030-101065 (PKCE code challenge generation)
- src/js/Grammarly-gDocs.beautified.js:101560-101750 (Mutex implementation for cross-tab lock)
- src/js/Grammarly-gDocs.beautified.js:101780-101865 (StorageCache for token persistence)
- src/js/Grammarly-gDocs.beautified.js:101866-102000 (Main OAuth class)
## src/js/Grammarly-gDocs.beautified.js [chunk 52/53, lines 102001-104000]

### Summary
This chunk continues the OAuth 2.0 client implementation and pulls in a significant portion of the React Aria library for advanced focus and interaction management. It defines OAuth endpoints for different environments, handles various grant types, and includes sophisticated hooks for accessibility and user interaction.

### Findings
- **Technology**: OAuth 2.0 Client (continuation), React Aria (`@react-aria/focus`, `@react-aria/interactions`).
- **Obfuscation Hints**: `minified_vars`, `function_chains`.
- **Endpoints**:
  - `https://auth.grammarly.com/v4/api/oauth2/authorize` (Prod)
  - `https://auth.grammarly.com/v4/api/oauth2/exchange` (Prod)
  - `https://auth.grammarly.com/v4/api/oauth2/token` (Prod)
  - `https://auth.grammarly.com/v4/api/revoke-by-refresh-token` (Prod)
  - `https://auth.grammarly.com/v4/api/userinfo` (Prod)
  - Corresponding endpoints for `preprod` (`auth.ppgr.io`) and `qa` (`auth.qagr.io`).
- **Storage**:
  - `gr-oauth-key`: Stores OAuth tokens.
  - `gr-oauth-service-state`: Stores state related to the token service, like degradation status.
  - `gr-oauth-state`: Stores state for the authorization code flow.
- **Code Patterns**:
  - **OAuth Client**: Defines a comprehensive client with support for `authorization_code`, `refresh_token`, anonymous, and `token-exchange` grants. Includes environment-specific endpoint configurations.
  - **React Aria Hooks**: Extensive use of React Aria hooks for managing UI interactions and accessibility:
    - `useFocus`, `useFocusRing`, `useFocusable`, `useFocusWithin` for advanced focus management.
    - `usePress` for handling complex press events across devices.
    - `useKeyboard` for keyboard event handling.
    - `useInteractOutside` for detecting clicks outside a component.
  - **Global Focus State**: Implements a global state manager to track the user's current interaction modality (keyboard, pointer, virtual), a core feature of React Aria.
- **Risks**: None identified in this chunk.

### Evidence
- **OAuth Endpoints**: src/js/Grammarly-gDocs.beautified.js:102028-102051
- **OAuth Grant Handlers**: src/js/Grammarly-gDocs.beautified.js:102287-102500
- **React Aria Focus/Interaction Hooks**: src/js/Grammarly-gDocs.beautified.js:103500-103990
## src/js/Grammarly-gDocs.beautified.js [chunk 53/53, lines 104001-105030]

### Summary
This final chunk contains the Webpack runtime and module loader. It's responsible for asynchronously loading all the other JavaScript chunks (`.vendors.chunk.js`, `.common.chunk.js`) and CSS files that make up the extension's functionality. It defines the core `__webpack_require__` function and the logic for handling dynamic imports and CSS injection.

### Findings
- **Technology**: Webpack runtime.
- **Obfuscation Hints**: `webpack_modules`.
- **Code Patterns**:
  - **Webpack Bootstrap**: The core logic for defining and loading modules. Includes `__webpack_require__`, `__webpack_require__.e` (for ensuring chunks), `__webpack_require__.u` (for chunk URLs), `__webpack_require__.l` (for loading scripts), and `__webpack_require__.f.miniCss` (for loading CSS).
  - **Dynamic Chunk Loading**: The code constructs URLs for JS and CSS chunks based on a chunk ID, e.g., `5396.vendors.chunk.js` or `workplaceAppBusinessUphookPopup.common.chunk.js`.
  - **Error Handling**: Includes logic for handling chunk loading failures. It sends a message to the background script (`chrome.runtime.sendMessage`) if a chunk fails to load, potentially to inject it via another mechanism.
  - **CSS Injection**: Dynamically creates `<link>` tags to inject CSS stylesheets into the document head.
- **Risks**: None identified. This is standard build tool output.

### Evidence
- **Webpack Runtime**: src/js/Grammarly-gDocs.beautified.js:104558-105030
- **Chunk Loading Logic**: src/js/Grammarly-gDocs.beautified.js:104700-104800
- **Chunk Load Failure Handler**: src/js/Grammarly-gDocs.beautified.js:104858-104870
## src/js/Grammarly-gDocsEarlyInjector.js [chunk 1/1, lines 1-154]

### Summary
This script is an "early injector" for Google Docs. Its primary purpose is to patch the Google Docs application's JavaScript entry point (`_createKixApplication`) before it runs. This allows Grammarly to gain a reference to the core GDocs application object for deep integration. The script then injects the main content script (`Grammarly-gDocsEarlyInjectedCs.js`) and establishes a persistent communication port with the background script for logging and telemetry.

### Findings
- **Technology**: Plain JavaScript.
- **Obfuscation Hints**: `minified_vars`.
- **Chrome APIs**: `chrome.runtime.connect`, `chrome.runtime.getURL`, `chrome.runtime.id`.
- **Code Patterns**:
  - **Host-Page Patching**: Injects an inline `<script>` that intercepts the `window._createKixApplication` function, which is the main entry point for the Google Docs editor. By wrapping this function, it captures the GDocs application instance (`window.GR_gdocs_connector`) as soon as it's created.
  - **Dynamic Script Injection**: Creates a `<script>` tag to load `Grammarly-gDocsEarlyInjectedCs.js` from the extension's resources and prepends it to the document's `documentElement`. This ensures it executes before other page scripts.
  - **Shadow DOM Injection**: Creates a `<grammarly-desktop-integration>` custom element with a shadow root. This is likely used to create an isolated environment for UI elements or to pass state information via `data-content` attributes.
- **Messaging**:
  - Establishes a long-lived connection to the background script using `chrome.runtime.connect` with the name `message:to-priv`.
  - Uses this port to send RPC-style messages for telemetry, specifically for tracking events (`sendFelogEvent`) via a `tracking/RPC` method.
- **Risks**:
  - **Hostile Environment Interaction**: The script directly manipulates and patches the host page's global `window` object (`_createKixApplication`). While necessary for its functionality, this is a fragile integration method that could break if Google changes the GDocs initialization process.

### Evidence
- **GDocs Patching**: src/js/Grammarly-gDocsEarlyInjector.beautified.js:80-121
- **Main Script Injection**: src/js/Grammarly-gDocsEarlyInjector.beautified.js:126-147
- **Background Script Connection**: src/js/Grammarly-gDocsEarlyInjector.beautified.js:70-74, 150-166
- **Shadow DOM Injection**: src/js/Grammarly-gDocsEarlyInjector.beautified.js:4-49
## src/js/Grammarly-gDocsIframeCs.js [chunk 1/5, lines 1-2000]

### Summary
This file is the content script for Grammarly's iframe within Google Docs. This initial chunk contains the Webpack bootstrap code and the `ua-parser-js` library. It also includes core components of the RxJS library, such as `Observable`, `Subscription`, and `Subject`, which indicates that the script uses a reactive programming model for handling events and asynchronous operations.

### Findings
- **Technology**: Webpack, RxJS, ua-parser-js.
- **Obfuscation Hints**: `webpack_modules`.
- **Code Patterns**:
  - **Webpack Bootstrap**: The file starts with the standard Webpack module loader, responsible for defining and loading modules within the bundle.
  - **ua-parser-js**: A bundled copy of the `ua-parser-js` library is present, used for detailed user agent string parsing to identify browser, OS, device, etc.
  - **RxJS Core**: Includes the fundamental building blocks of RxJS, such as `Observable`, `Subject`, `BehaviorSubject`, and `Subscription`. This suggests that the script heavily relies on reactive streams to manage state and events.
- **Risks**: None identified in this chunk.

### Evidence
- **Webpack Bootstrap**: src/js/Grammarly-gDocsIframeCs.beautified.js:1-110
- **ua-parser-js**: src/js/Grammarly-gDocsIframeCs.beautified.js:112-712
- **RxJS Core**: src/js/Grammarly-gDocsIframeCs.beautified.js:1000-1500
## src/js/Grammarly-gDocsIframeCs.js [chunk 2/5, lines 2001-4000]

### Summary
This chunk contains the core infrastructure for the iframe's application logic. It includes a sophisticated custom reactive state management system built on RxJS, a comprehensive configuration module that generates settings based on the environment (browser, deployment type), and the critical logic for tracking user typing and determining if a text field should be integrated with Grammarly's features.

### Findings
- **State Management (Reactive FRP model):**
  - A custom state management library built on RxJS is defined, using concepts like `Atom`, `Lens`, and `View`.
  - `Me.create(initialValue)`: Creates a new state container, similar to a `BehaviorSubject`.
  - `lens()`: Creates a "lens" to focus on and modify a part of a larger state object.
  - `view()`: Creates a derived, read-only view of the state.
  - `Me.combine(...)`: Creates a new state derived from multiple other state sources.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:2206-2415`

- **Configuration and Environment:**
  - A large block of code is dedicated to creating a global configuration object (`Bt`, `jt`).
  - It dynamically builds configuration for various services based on environment (`prod`, `qa`, `dev`), browser (`chrome`, `edge`, `firefox`), and context (`regular`, `retail`).
  - Configured services include `gnar` (analytics), `felog` (metrics), `capi` (main API), and `iterable` (in-app messaging).
  - It constructs a large map of URLs (`yt.create`) for all parts of the Grammarly ecosystem (e.g., `signin`, `app`, `account`, `settings`).
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:2738-3388`

- **Typing and Field Integration Logic:**
  - `gi` (`TypingTrackerImpl`): A class that tracks user typing activity across different fields.
  - `di` function: A key function that determines the integration status of a text field. It checks numerous conditions:
    - Network connectivity.
    - Enterprise policies (`isEnterpriseConfig`).
    - User settings.
    - Presence of a desktop app integration (`llamaIntegration`).
    - Site-specific opt-out attributes (e.g., `data-gramm_editor="false"`).
  - The final status can be `integrated`, `disabled_by_user`, `disabled_by_grammarly`, `unsupported`, etc.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:3818-3968`

- **Logging Framework:**
  - A detailed logging framework (`dn`, `hn`, `mn`, `vn`, `_n`, `bn`) is established.
  - It supports different log levels (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`).
  - It includes a history/buffering mechanism (`dn`, `Zt`) to store recent logs, with different capacities based on severity.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:3490-3798`

### Obfuscation Hints
- `minified_vars`: Many single-letter variables (`e`, `t`, `n`, `i`) are used, typical of minified code.
- `function_chains`: Extensive use of chained function calls, particularly with RxJS's `.pipe()`.

## src/js/Grammarly-gDocsIframeCs.js [chunk 3/5, lines 4001-6000]

### Summary
This chunk details the extension's sophisticated infrastructure for analytics, RPC communication, and feature-specific telemetry. It finalizes the typing-tracking logic by adding language detection and sending the final metric. It then defines a comprehensive RPC system for both standard and observable-based communication with the background script. The largest part of this chunk is the definition of a master telemetry service (`gs`) that tracks a vast array of events, from UI clicks and performance timings to detailed errors and integration statuses, with a heavy emphasis on Google Docs-specific metrics.

### Findings
- **Typing Analytics (`_handleTyping` continuation):**
  - After tracking typing, the code uses `browserApi.i18n.detectLanguage` to determine the primary language of the typed text.
  - It constructs and sends a detailed analytics payload via an RPC call (`rpc.addTypingDurationMetric`) containing the integration type, field type, text length, duration, and detected language.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:4001-4080`

- **Shared Storage (`pi`, `__EXT_CS_SHARE_STORAGE__`):**
  - A simple, in-memory key-value store is defined to share state between different content scripts injected into the same page. It works by attaching a shared object to the `window`.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:4101-4133`

- **RPC and Messaging Infrastructure:**
  - **Standard RPC:** A robust RPC client (`_i`, `wi`) is defined for request-response communication between the content script and the background script.
  - **Observable RPC:** A more advanced RPC client (`Ti`, `ki`) is built on top of the standard one to handle streaming data from the background using RxJS `Observable`s. This is crucial for receiving real-time updates.
  - **Message Service:** A structured event-listener interface (`Ci`, `Ai`) is created to wrap the browser's raw messaging API, providing `on`/`off`/`once` capabilities.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:4143-4530`

- **Comprehensive Telemetry Service (`gs`):**
  - This massive class centralizes all telemetry, logging, and metrics for the extension.
  - It has methods to track a wide variety of events, including UI interactions (`userUpgradeClick`, `gButtonClick`), internal errors (`fetchDefinitionsFail`, `dynamicConfigLoadFromServerError`), and performance metrics (`tooLongPageConfigInit`).
  - **GDocs Specific Telemetry:** A large, dedicated section tracks Google Docs events (`gdocs`, `canvasGdocs`), such as injection errors, initialization timeouts, and detailed performance metrics for mapping Grammarly's UI onto the GDocs canvas (`mappingPerf`, `mappingStats`).
  - **Feature Telemetry:** It also includes tracking for features like `autoFix`, `autoApply`, and `knowledgeHub`.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:5010-6000` (and beyond)

### Obfuscation Hints
- `minified_vars`: The code continues to use single-letter variables extensively.
- `generated_apis`: The `gs` telemetry class acts as a generated API, with dozens of methods that correspond to specific tracking events.

## src/js/Grammarly-gDocsIframeCs.js [chunk 4/5, lines 6001-8000]

### Summary
This chunk continues the definition of the massive telemetry service (`gs`), adding tracking for a wide range of features including citation building, human writing reports, the "Always-Available Assistant" (AAA), agents, performance metrics, autocorrect, and more. It also defines the core browser API abstraction layer, providing a unified interface for interacting with browser features like storage, messaging, and tabs, while handling differences between Chrome's Manifest V2 and V3.

### Findings
- **Telemetry Service (`gs` continuation):**
  - **Feature Tracking:** Adds specific logging methods for numerous features:
    - `citationBuilder`: Tracks errors, warnings, and info.
    - `humanWritingReport`: Tracks errors and info related to the human writing report feature.
    - `alwaysAvailableAssistant`: Tracks feedback, chat deletions, and side panel opens.
    - `autocorrect`: Tracks response times, triggers, and user interactions (revert, accept).
    - `assistant`: Tracks initialization and render times.
    - `proofit`: Tracks errors related to the "Proofit" feature.
    - `iterable`: Extensive tracking for in-product messages (IPM), including triggers, opens, clicks, and API failures.
    - `connector`: Tracks connection status for integrations with third-party services.
    - `serviceAvailability`: Tracks typing duration and length across different domains to measure service usage.
  - **Performance Logging:** Defines a `performance` section with methods to create performance loggers (`_createPerfLogger`) for specific events like `cs.fluid.processInput` and `cs.assistant.initTime`.
  - **Error and Exception Handling:** Includes robust methods for sending unhandled exceptions and rejections from different parts of the extension (background, popup, content script), with sampling to avoid overwhelming the logging service.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:6001-7800`

- **Browser API Abstraction:**
  - **Messaging (`Xs`, `Zs`):** Defines a `Port`-based messaging system to communicate with the background script. It handles connection restoration and message queuing.
  - **Storage (`fr`, `br`):** Implements a `SessionStorage` API that abstracts over Chrome's `storage.session` (for MV3) or a memory-based fallback. It includes methods like `get`, `set`, `remove`, and `onChange`.
  - **Scripting and Tabs (`vr`):** Creates a unified API for `executeScript`, `insertCSS`, and managing tabs (`open`, `create`, `remove`, `getActiveTab`). It contains conditional logic to handle the significant differences between Manifest V2 (`chrome.tabs.executeScript`) and Manifest V3 (`chrome.scripting.executeScript`).
  - **Managed Storage (`pr`):** Defines a reader for `chrome.storage.managed`, used to get configuration set by enterprise policies. It includes a validator (`hr`) to ensure the data is in the correct format.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:7801-8000` (and beyond)

### Obfuscation Hints
- `minified_vars`: The code remains heavily minified.
- `generated_apis`: The telemetry service (`gs`) continues to be a prime example of a large, generated API surface.

## src/js/Grammarly-gDocsIframeCs.js [chunk 5/5, lines 8001-8331]

### Summary
This final chunk of the file completes the browser API abstraction layer and then initializes and starts the entire content script. It defines the final methods for the `tabs` API, parses the user agent to determine browser/OS info, and creates the main `xr` (browser API) instance. The script concludes by calling `Us.start`, which bootstraps the content script's main logic, setting up the connection to the background script, initializing the data stores, and kicking off the typing tracker and other core functionalities.

### Findings
- **Browser API Abstraction (Conclusion):**
  - **Tabs API (`vr`):** Finishes the implementation of the tabs API, adding methods like `closeCurrentTab`, `focusTab`, `sendMessageToTab`, and providing access to `onUpdated` and `onRemoved` events.
  - **User Agent Parsing (`Er`):** Includes a utility that uses the `ua-parser-js` library (seen in chunk 1) to parse the `navigator.userAgent` string and determine the browser name, version, OS name, and OS version.
  - **Main API Object (`xr`):** This class brings all the browser API abstractions together (`preferences`, `message`, `tabs`, `storage`, `notifications`, `cookies`, etc.) into a single, unified object. It handles the Manifest V3 vs. V2 differences for the browser/page action (`chrome.action` vs. `chrome.browserAction`).
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:8001-8300`

- **Content Script Initialization (`Us.start`):**
  - The entire script culminates in a single call to `Us.start`.
  - This function is the main entry point for the content script.
  - It initializes the core `Fs` environment for the content script, which includes setting up the RPC connections (`bgRpc`, `capiBgRpc`), the shared storage (`csShareStorage`), and the telemetry provider.
  - It creates the main data store (`Ds`) which syncs with background script data.
  - It subscribes to the data store and, upon receiving data, creates the `gi` (TypingTracker) instance, effectively starting the extension's main functionality in the iframe.
  - **Evidence:** `Grammarly-gDocsIframeCs.beautified.js:8301-8331`

### Obfuscation Hints
- `minified_vars`: Consistent with previous chunks.


## src/js/Grammarly-overleafStartContentScript.js [whole-file]

### Summary
This script is a content script designed to run at `document_start` on Overleaf pages. Its sole purpose is to inject the `Grammarly-overleafInjectedScript.js` into the main world context of the page, allowing it to interact with the Overleaf editor's JavaScript environment. It uses a standard script injection pattern, creating a `<script>` tag and appending it to the document's root element.

### Chrome APIs
- `chrome.runtime.getURL`: Used to get the correct URL for the injected script.
- `chrome.runtime.id`: The extension's ID is passed as a data attribute to the injected script tag.

### Injected Scripts
- `src/js/Grammarly-overleafInjectedScript.js`: The primary script being injected into the page.

### Evidence
- src/js/Grammarly-overleafStartContentScript.js:1-22

## src/js/Grammarly-overleafInjectedScript.js [whole-file]

### Summary
This script is injected into the main world of Overleaf pages to directly interact with its CodeMirror editor instance. It acts as a bridge between the Grammarly extension and the editor. It listens for a custom `UNSTABLE_editor:extensions` event to gain access to the CodeMirror `EditorView`. It then attaches a listener that, on every editor update, copies the entire document content into a `data-grammarly-text` attribute on the editor's DOM element, making the text accessible to the extension. It also sets up a listener for `GrammarlyAssistantOverleafScrollEvent` to programmatically scroll the editor to specific text locations, likely when a user clicks on a suggestion.

### DOM Interaction
- `document.querySelector('.cm-content')`: Selects the CodeMirror content area.
- `e.view.dom.dataset.grammarlyText = ...`: Sets the editor's text content on a data attribute for the extension to read.

### Event Listeners
- `self.addEventListener("UNSTABLE_editor:extensions", ...)`: Listens for the Overleaf event that exposes the CodeMirror editor.
- `document.addEventListener("GrammarlyAssistantOverleafScrollEvent", ...)`: Listens for events from the Grammarly UI to scroll the editor.
- `EditorView.updateListener.of(...)`: Creates a listener that fires on every CodeMirror editor update.

### Evidence
- src/js/Grammarly-overleafInjectedScript.js:1-21

## src/js/Grammarly-popup.js [chunk 1/26, lines 1-2000]

### Summary
This chunk contains the initial Webpack bootstrap and a large number of UI and utility modules. Key findings include:
- **Webpack Bootstrap**: The file starts with the standard Webpack module loader.
- **UI Component Library**: A significant portion of this chunk is dedicated to defining a rich set of UI components and their styles. This includes buttons, dropdowns, typography, and layout utilities. It appears to be a custom-built design system.
- **Color Palette**: A comprehensive color palette is defined (e.g., `CoreBlue10`, `CoreGreen50`, `CoreNeutral80`), indicating a systematic approach to theming.
- **Feature Flags & Experiments**: The code imports and defines numerous feature flags (`Cc`) and experiment toggles (`KS`) related to "Cheetah", "AI Studio", and various editor agents (e.g., `agent_paraphraser_ai_editor_internal`). This suggests the popup's UI and functionality are highly configurable based on user entitlements and ongoing experiments.
- **Delta & Attributes Manipulation**: Modules for handling `quill-delta` like structures are present (`Delta`, `AttributeMap`), which are typically used for rich text manipulation. This might be for rendering complex content within the popup or interacting with an editor.
- **React Components**: The presence of `React.Component`, `createContext`, and `createElement` confirms that the popup UI is built with React.

### Obfuscation Hints
- `webpack_modules`
- `minified_vars`

### Chrome APIs
- None in this chunk.

### Evidence
- src/js/Grammarly-popup.js:1-2000
## src/js/Grammarly-popup.js [chunk 2/26, lines 2001-4000]

### Summary
This chunk is heavily focused on UI components and their underlying logic, built with React. It defines several key reusable components, including a complex `Dropdown`, an `ErrorBoundary`, and a `Ripple` effect for user interactions. It also introduces a `Tooltip` system and a suite of custom React hooks for managing element references, dimensions, focus, and subscriptions (`useElWatcher`, `useRectWatcher`, `useFocusTrap`). The code confirms the use of a CSS-in-JS library (likely `typestyle`) for styling and continues to use a reactive state management library (Focal) for component state.

### Findings
- **UI Components**:
  - `Dropdown`: A complex dropdown/combobox component with hover and visibility state management.
  - `ErrorBoundary`: Standard React error boundary to catch rendering errors in child components.
  - `Ripple`: A component to create Material Design-like ripple effects on user interaction, driven by observable streams.
  - `Typography`: A set of components (`H1`, `H2`, `Base`, etc.) for rendering text with predefined styles.
  - `Tooltip`: A system for creating and managing tooltips, including a React Context provider.
- **Custom React Hooks**:
  - `useElWatcher`: Hook to get a reference to a DOM element.
  - `useRectWatcher`: Hook to observe the dimensions and position of an element.
  - `useFocusTrap`: Hook to trap focus within a component, essential for accessibility in modals and dropdowns.
  - `useSubscriptionTo`: Hook for managing subscriptions to observables within a component's lifecycle.
- **State Management**:
  - Continues to use the reactive state management library (Focal) with atoms (`m.h.create(...)`) and lenses (`.lens(...)`).
- **Styling**:
  - Uses a CSS-in-JS library (`typestyle`) to define component styles and animations (`keyframes`).
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as Webpack modules.
  - `minified_vars`: Many single-letter variables are used, which is characteristic of minified code.
  - `api_client_patterns`: The `ExperimentClient` and related services show clear patterns for API clients that abstract network requests.

### Evidence
- src/js/Grammarly-popup.js:2001-2180 (Dropdown component)
- src/js/Grammarly-popup.js:2181-2230 (ErrorBoundary component)
- src/js/Grammarly-popup.js:2231-2400 (Ripple component & styles)
- src/js/Grammarly-popup.js:3201-3400 (Typography components)
- src/js/Grammarly-popup.js:3001-3200 (Tooltip system)
- src/js/Grammarly-popup.js:3601-3800 (Custom React Hooks: useElWatcher, useFocusTrap, etc.)
## src/js/Grammarly-popup.js [chunk 3/26, lines 4001-6000]

### Summary
This chunk defines the core infrastructure for backend communication and feature flagging. It includes several service clients (`GatesService`, `HttpClient`, `PropertiesClient`, `TreatmentService`) for interacting with Grammarly's APIs to fetch A/B test treatments and manage user properties. It also contains a large module defining a comprehensive design system with a detailed color palette and typography rules. The presence of reactive programming primitives (from what appears to be the Focal library) for state management is also confirmed.

### Findings
- **Endpoints**:
  - `.../gates/get`: Used by `GatesService` to fetch feature gate configurations.
  - `.../properties`: Used by `PropertiesClient` to get and set user-specific properties.
  - `.../treatment/get`: Used by `TreatmentService` to get A/B test assignments.
  - `.../treatment/log`: Used by `TreatmentService` to log user exposure to an experiment.
- **State Management**:
  - The code includes components of a reactive programming library, likely **Focal**, for managing UI state with observables and lenses.
- **UI & Design**:
  - A large, detailed design system is defined, including a comprehensive color palette (e.g., `CoreNeutral0-90`, `CoreGreen10-70`, `CoreBlue`, `CoreRed`) and typography tokens (`H1Size`, `BodySize`, `ButtonWeight`).
- **Obfuscation Hints**:
  - `typescript_generated_async`: The file contains `__awaiter` and `__generator` helper functions.
  - `webpack_modules`: The code is structured as Webpack modules.
  - `api_client_patterns`: Clear patterns for API clients abstracting `fetch`.

### Evidence
- src/js/Grammarly-popup.js:4060-4080 (GatesService)
- src/js/Grammarly-popup.js:4288-4308 (PropertiesClient)
- src/js/Grammarly-popup.js:4488-4650 (TreatmentService)
- src/js/Grammarly-popup.js:4105-4255 (HttpClient)
- src/js/Grammarly-popup.js:5701-6000 (Design System Colors & Typography)
## src/js/Grammarly-popup.js [chunk 4/26, lines 6001-8000]

### Summary
This chunk contains two major, highly complex systems. The first is a massive, schema-driven UI content model, likely using a library like `io-ts` for runtime type validation. It defines the structure for every piece of content in the popup, including alerts, cards, buttons, and user feedback forms. The second is a comprehensive logging framework with hierarchical loggers, rate-limiting, and performance metric collection (`TimeSeries`, `Femetrics`). This indicates a strong focus on data-driven development and monitoring.

### Findings
- **UI Content Schema**:
  - A very large and detailed schema defines the entire UI content structure. It uses a codec/validation library (like `io-ts`) to create types for every possible UI element, such as `Alert`, `Card`, `Button`, `Feedback`, `Suggestion`, and `Upsell`.
  - This schema dictates the content, appearance, and behavior of UI components, which are then rendered dynamically.
- **Logging Framework**:
  - A sophisticated logging system (`Logging`) is defined, allowing for the creation of hierarchical loggers with different levels (e.g., `info`, `warn`, `error`).
  - It includes a `RateLimiter` to prevent flooding logs.
  - It integrates with a performance metrics system (`TimeSeries`, `Femetrics`) for tracking application performance and user interactions.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as Webpack modules.
  - `minified_vars`: Many variables are minified (e.g., `t`, `e`, `n`, `r`).
  - `object_property_chaining`: Extensive use of chained property access is present, typical of compiled/minified code.

### Evidence
- src/js/Grammarly-popup.js:6001-7500 (UI Content Schema)
- src/js/Grammarly-popup.js:7501-8000 (Logging Framework, RateLimiter, Femetrics)
## src/js/Grammarly-popup.js [chunk 5/26, lines 8001-10000]

### Summary
This chunk continues the definition of the massive `io-ts` based UI content model, specifying more components like progress bars, popovers, and global part placeholders. More significantly, it reveals a sophisticated, custom-built library for traversing and manipulating this UI component tree. This library includes functions for tree walking (pre-order, post-order), mapping, filtering, reducing, and finding nodes, indicating a highly structured and programmatic approach to UI construction and state management. The chunk also contains a vast number of enums defining every possible value for component properties, from colors and sizes to animation types and button states.

### Findings
- **UI Content Schema (continued)**:
  - The schema definition from the previous chunk is extended with more components: `progressBar`, `horizontalRule`, `globalPart`, `popoverView`, `radioButtonsGroup`, and more.
- **Tree Manipulation Library**:
  - A comprehensive library for working with the UI component tree is defined.
  - **Traversal**: `traverse`, `forEach` with `PreOrder` and `PostOrder` strategies.
  - **Transformation**: `map`, `filter`, `filterMap`, `compact` (for removing empty nodes).
  - **Search**: `findFirst`, `findFirstWithPredicate`.
  - **State Management**: Functions like `setPopoverView` and `removeStrongAlertRef` demonstrate how the UI state is updated by transforming the tree.
- **Enums & Constants**:
  - A very large set of enums defines all possible string literals for component properties, including:
    - **Colors**: `V6_CoreBlue40`, `CoreNeutral90`, etc.
    - **Sizes**: `Radius1`, `HeadingLevel3`, etc.
    - **States**: `enabled`, `disabled`, `selected`, etc.
    - **Icons**: `close`, `arrow-right`, `sparkles`, etc.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as Webpack modules (e.g., `65778:`, `62101:`, `86349:`).
  - `minified_vars`: Widespread use of single-letter variables.
  - `typescript_generated_enums`: The extensive enums are characteristic of compiled TypeScript.

### Evidence
- src/js/Grammarly-popup.js:8001-8500 (UI Content Schema continuation)
- src/js/Grammarly-popup.js:8501-9000 (Enums for colors, sizes, states)
- src/js/Grammarly-popup.js:9001-10000 (UI Tree Traversal and Manipulation Library)
## src/js/Grammarly-popup.js [chunk 6/26, lines 10001-12000]

### Summary
This chunk finalizes the UI tree manipulation library and introduces several core application services. It defines the main `dslRootParser` which validates the entire UI schema using `io-ts`. It also contains a large map of design system color tokens to hex values, a registry of all feature gates (e.g., `AIEditorAgentParaphraserInternal`, `AssistantInSidePanel`), and clients for tracking analytics events (`authHook`, `gitm`). Additionally, it includes logic for managing settings for major features like the "Human Writing Report" (HWR), "TouchTypist," and "Knowledge Hub," and defines the RPC communication layer for interacting with the background script.

### Findings
- **UI & Parsing**:
  - The `dslRootParser` is defined, which is the entry point for decoding and validating the entire UI component tree against the `io-ts` schema.
  - A large color map implements the design system, translating semantic names like `V6SemanticBackgroundBaseDefault` to `#FFF`.
- **Feature Gating**:
  - A comprehensive list of feature gates is defined, covering AI features (`AIEditor...`), the side panel assistant (`AssistantInSidePanel`), and various onboarding flows.
- **Analytics**:
  - Logic for tracking `authHook` events (shown, clicked) and `gitm` (Grammarly In The Moment) analytics is present.
- **Settings & Feature Management**:
  - Contains logic for managing settings for several key features:
    - **Human Writing Report (HWR)**: Experiments and gates for rolling out the HWR feature to different user types.
    - **TouchTypist**: Logic to determine if the feature is available based on gates, dynamic config, and client-side settings. Includes a `ShortcutManager` for handling its hotkey.
    - **Knowledge Hub**: Functions for checking feature availability in GDocs, Gmail, etc.
- **RPC & Communication**:
  - Defines the core RPC classes (`capiBgRpc`, `staticCapiBgRpc`, `bgRpc`) used by the content script to communicate with the background page.
- **Constants**:
  - Defines an object containing extension IDs for different environments (PROD, DEV, QA).

### Evidence
- src/js/Grammarly-popup.js:10001-10250 (UI Tree library finalization, `dslRootParser`)
- src/js/Grammarly-popup.js:10251-10500 (Color map, Extension ID constants)
- src/js/Grammarly-popup.js:10501-10800 (Feature gate registry)
- src/js/Grammarly-popup.js:10801-11200 (Analytics clients for auth hooks and GITM)
- src/js/Grammarly-popup.js:11201-12000 (Feature management logic for HWR, TouchTypist, Knowledge Hub; RPC clients)
## src/js/Grammarly-popup.beautified.js [chunk 7/26, lines 12001-14000]

### Summary
This chunk is heavily focused on the React-based UI of the extension's popup. It defines a comprehensive set of UI components, including a sophisticated positioning and tooltip system. The core of the popup's application logic resides here, with a main component that orchestrates the display of different views (settings, unsupported site, sign-in/sign-up) based on the extension's state and the current web page. The code handles various states like user authentication, site support, and different platform specifics (Safari, iOS).

### Findings
- **UI Components & Systems**:
  - **Positioner (1085)**: A powerful component for positioning floating elements like popovers and tooltips. It uses `ResizeObserver` to react to size changes and dynamically recalculates position.
  - **Button (1695, 42496)**: A customizable button component with various styles (`primary`, `success`, `link`, `outlined`, `premium`, etc.).
  - **Tooltip System (4636, 46418, 69652)**: A full-featured tooltip system. It uses a React Context (`4636`) to manage tooltip state via an RxJS `BehaviorSubject`. The `WithTooltip` HOC (`69652`) adds tooltips to other components, and `TooltipView` (`46418`) renders them.
  - **Authentication UI (Re, Oe, pt, mt)**: A suite of components for handling user sign-in, sign-up, and permission requests, with different flows for regular users and business users.
  - **Unsupported Site UI (Ot, kt, Tt, It)**: Components to inform the user when Grammarly is not supported on the current site, is temporarily down, or when viewing the Grammarly Editor itself.
  - **`EdcStripe` (86090)**: A banner to indicate that the extension is "Managed by" an institution (for business/edu accounts).

- **Core Application Logic**:
  - **Main Popup Component (`Nt`)**: This appears to be the root React component for the popup. It acts as a router, deciding whether to render the main `SettingsComponent`, the `UnsupportedComponent`, or a `ChromeStoreToolbarPopup` based on the extension's configuration and state.
  - **`SettingsComponent` (`nt`)**: The main settings view of the popup. It manages a large amount of state and actions, and renders different sub-components based on user status (free, premium, business), platform (Safari, iOS), and feature flags.
  - **State Management**: The components heavily use RxJS for state management, with utilities like `useBehaviorSubject` (`50699`) and `useSubscription` (`79825`) to connect React components to RxJS streams.

- **Platform-Specific Code**:
  - The code contains numerous checks for `isSafari`, `isSafariIOS`, and `isChrome` to render different UI or trigger different behaviors depending on the browser. For example, it shows a special footer (`Ae`) and header (`Le`) for Safari on iOS.

- **Obfuscation Hints**:
  - **Webpack Modules**: The code is structured as Webpack modules, with numeric module IDs (e.g., `1695`, `27327`).
  - **Minified Vars**: Some internal variables are minified (e.g., `e`, `t`, `n`), but component and function names are largely preserved.
  - **Generated APIs**: The code references a `hn()` function which seems to provide access to a global API object, likely a pattern to manage dependencies and access background services.

### Evidence
- src/js/Grammarly-popup.beautified.js:12001-14000
## src/js/Grammarly-popup.beautified.js [chunk 8/26, lines 14001-16000]

### Summary
This chunk contains the heart of the popup's rendering and initialization logic. It details the main `Nt` React component, which acts as a router to display different UI views based on user state (auth, enterprise, data control, etc.). It also includes the primary `on()` function that bootstraps the entire popup, initializing services, fetching state, and rendering the React application. A significant portion is dedicated to the main `Settings` component (`Ye`), which is a large, complex component responsible for rendering all the user-facing toggles and controls for features like Generative AI, keyboard shortcuts, dialect selection, and a detailed debug menu for internal use.

### Findings
- **Core Application Logic**:
  - **Main Component (`Nt`)**: Contains the top-level conditional rendering logic. It decides whether to show the settings UI, an auth prompt, a data control page, a "Stand with Ukraine" message, or other specific views based on a hierarchy of checks.
  - **Initialization (`on()`)**: The main entry point for the popup script. It sets up the environment, initializes all necessary services (RPC, experiments, preferences), fetches the initial state, and kicks off the React rendering process. It includes retry logic for robustness.
  - **Environment (`pn`, `hn`)**: Defines and provides access to the `PopupEnv` singleton, which holds all core services like the browser API, messaging, and RPC clients.

- **UI Components & Systems**:
  - **Settings Component (`Ye`)**: A massive component that renders the "Quick Settings" view. It's highly dynamic, showing different controls based on numerous feature flags and user properties.
  - **Debug Menu (`Xe`)**: A special section within the settings, visible to employees, that provides tools for debugging. This includes toggles for enabling/disabling logging, downloading logs, and opening a debug page.
  - **Bug Reporting (`ue`, `de`)**: A client-side implementation for submitting bug reports directly to a Jira API endpoint. It gathers detailed environment information, constructs a `FormData` object, and sends it via `fetch`.

- **Chrome API Calls**:
  - `chrome.runtime.getURL("src/debug.html")`: Used to get the URL for the local debug page.
  - `chrome.runtime.getPlatformInfo`: Used to detect the OS (specifically 'mac') to apply a rendering-related CSS hack.

- **Endpoints**:
  - `https://gateway.grammarly.com/api/jira/tickets/create`: The endpoint used for submitting bug reports from the debug menu.

- **Obfuscation Hints**:
  - **Webpack Modules**: The code continues to be structured as Webpack modules.
  - **Minified Vars**: Local variables are minified, but component and function names remain descriptive.
  - **Generated APIs**: The `hn()` function continues to be the central point for accessing background services and shared modules.

### Evidence
- src/js/Grammarly-popup.beautified.js:14001-16000
## Grammarly-popup.js [chunk 9/26, lines 16001-18000]

### Summary
This chunk is heavily focused on the core infrastructure of the extension, including environment configuration, state management, authentication, feature flagging, and inter-script communication. It defines the factories for creating environment-specific API endpoints, build information, and the main props object for the React application. It also contains the logic for handling sign-in/sign-up flows, which vary based on experiments, and a vast number of definitions for feature gates and A/B tests that control almost every aspect of the extension's behavior.

### Chrome APIs
- `chrome.runtime.getManifest` (inferred from `getManifestVersion` in module `35922`)
- `chrome.runtime.id` (inferred from `getExtensionId` in module `35922`)
- `chrome.permissions.contains` (in module `72526`)
- `chrome.permissions.request` (in module `72526`)
- `chrome.runtime.connect` (inferred from `createPortConnection` in module `33908`)
- `chrome.runtime.sendMessage` (inferred from `_browserRuntimeSendMessage` in module `33908`)

### Event Listeners
- `onRuntimeMessage` (in module `33908`)
- `port.onMessage` (in module `33908`)
- `port.onDisconnect` (in module `33908`)
- `window.addEventListener("error")` (in module `39963`)
- `window.addEventListener("unhandledrejection")` (in module `39963`)

### Messaging
- **Direction**: content->background
  - **Name**: `message:to-priv` (via port connection)
  - **Purpose**: Generic message passing from content script to background.
  - **Evidence**: module `33908`, `99161`
- **Direction**: background->content
  - **Name**: `cs-bg-runtime-*`
  - **Purpose**: Runtime messages from background to content script.
  - **Evidence**: module `28951`

### Endpoints
- **Module `87030`**: Defines factories for all backend URLs, which vary by environment (`prod`, `qa`, `dev`).
  - `https://f-log-extension.grammarly.io` (Logging)
  - `https://extension.femetrics.grammarly.io/batch/import` (Metrics)
  - `https://gnar.grammarly.com` (Analytics)
  - `https://in.grammarly.com/v1/events` (Analytics Ingestion)
  - `https://capi.grammarly.com` (Core API)
  - `wss://capi.grammarly.com/freews` (WebSocket for CAPI)
  - `https://api.iterable.com` (In-app messaging and marketing)
  - `https://auth.grammarly.com` (Authentication v3, v4, v5)
  - `https://gateway.grammarly.com/*` (Various APIs: skills, snippets, passport, etc.)
  - `https://config.extension.grammarly.com/dynamicConfig.json` (Remote configuration)
  - `https://in-product.report.grammarly.io/v1/report` (Internal bug reporting)

### Obfuscation Hints
- **webpack_modules**: Code is structured as a Webpack bundle with numeric module IDs.
- **api_client_patterns**: Clear separation of API endpoint configuration (module `87030`, `67778`) from business logic.

### Risks
- **Type**: `remote_code`
  - **Severity**: Low
  - **Description**: The extension loads its dynamic configuration, including feature flags and experiment settings, from `https://config.extension.grammarly.com/dynamicConfig.json`. While this is a standard practice for feature flagging, it means that a compromise of this endpoint could alter the extension's behavior significantly.
  - **Evidence**: module `67778` (defines `dynamicConfigUrl`)
- **Type**: `pii_exfiltration`
  - **Severity**: Low
  - **Description**: The internal bug reporting feature (`grammarlyEmployeesBugReportsUrl`) sends reports to `https://in-product.report.grammarly.io`. While intended for employees, if triggered by a regular user, it could send diagnostic data.
  - **Evidence**: module `67778`

### Other Findings
- **Extensive Feature Flagging**: Modules `70843` and `90595` list hundreds of feature flags (`Cc`) and experiments (`KS`). This indicates a highly configurable and dynamic application where features can be toggled remotely. Examples include `OAuthSDKV2`, `V5UserInfo`, `FullySignedInExperience`, `DataSharing`, and `GDocsInternalsForReplacementExperiment`.
- **Environment Abstraction**: The code is well-architected to run in different environments (`prod`, `qa`, `dev`) and on different browsers (`chrome`, `edge`, `safari`, `firefox`), with clear abstraction layers for configuration and browser-specific APIs.
- **Authentication Logic**: Module `72526` shows a sophisticated authentication flow that can be switched via an experiment (`OAuth2Phase2Interactive`), using either a new RPC-based flow (`launchAuthFlow`) or a legacy URL-based one.
- **State Aggregation**: Module `79477` acts as a central hub for collecting and shaping the application's state from numerous asynchronous sources into a single props object for the UI.
## Grammarly-popup.js [chunk 10/26, lines 18001-20000]

### Summary
This chunk is almost entirely dedicated to the extension's core infrastructure, with a strong focus on state management, RPC (Remote Procedure Call) communication, and utility modules. It defines the `PersistentStore` class, which is the foundation for the extension's state, and the generic RPC clients used for communication between scripts. It also includes numerous "action creator" modules that provide a structured way to modify the application's state, default state values for initialization, and a critical utility module for classifying user types and permissions.

### Chrome APIs
- This chunk is primarily abstract infrastructure and does not directly call Chrome APIs. However, it implements the client side of RPC calls that will eventually be handled by background scripts which do use Chrome APIs.

### Event Listeners
- `self.navigator.onLine` (inferred from module `89512` which manages connection state).

### Messaging
- **Direction**: Generic RPC Client/Server
  - **Name**: `cs-to-bg-rpc-1557421403805` (module `23472`), `cs-to-bg-rpc-1587687052565` (module `53966`), `cs-to-bg-static-capi-rpc-1668544923207` (module `30603`)
  - **Purpose**: These are named channels for different RPC client instances, facilitating communication between the content script and the background script for various APIs (general, legacy, and static CAPI).
  - **Evidence**: modules `23472`, `53966`, `30603`

### Storage
- **`PersistentStore` (module `43912`)**: This class is a wrapper around the browser's storage API (`chrome.storage` or similar). It provides a reactive layer for getting, setting, and subscribing to changes in the extension's state.
  - **Keys**: The module `3774` lists all keys managed by the persistent store, including `user`, `extensionSettings`, `dynamicConfig`, `activeTab`, `dapi`, etc.
  - **Protected Keys**: The store protects certain keys like `user` and `dapi` from direct modification, enforcing that they are only changed through specific actions.

### Obfuscation Hints
- **webpack_modules**: The code continues to be structured as a Webpack bundle.
- **api_client_patterns**: The RPC client implementation (`36798`) is a classic example of an API client pattern, creating a proxy object that translates method calls into messages over a transport layer.

### Risks
- No new, direct risks were identified in this chunk, as it primarily contains infrastructure code. The risks associated with this code are inherited from the data it handles and the endpoints it communicates with, which were identified in previous chunks.

### Other Findings
- **State Management Architecture**: The combination of `PersistentStore` (`43912`), action creators (`55830`, `18428`, `42900`), and default state objects (`15362`) reveals a state management architecture similar to Redux, designed for a browser extension context.
- **User Classification**: Module `19724` is a critical utility for determining the user's status (e.g., `anonymous`, `registered`, `premium`, `business`, `edu`). It contains functions like `isPremium`, `isBusinessAdmin`, and `isGrammarlyEmployee` that are used throughout the codebase to control feature access and UI variations.
- **RPC Implementation**: Module `36798` provides a full implementation of a generic observable-based RPC client. It handles method calls, subscriptions to data streams, and the lifecycle of the connection, demonstrating a sophisticated communication layer.
- **Telemetry Service**: Module `60378` defines the core telemetry service (`C`), which is responsible for sending various types of analytics (felog, femetrics) to Grammarly's servers. It includes logic for sampling and formatting data.
## src/js/Grammarly-popup.beautified.js [chunk 11/26, lines 20001-22000]

### Summary
This chunk is almost exclusively dedicated to the definition of the extension's centralized **`Logger` service**. This massive object is the core of the extension's analytics, telemetry, and error reporting infrastructure. It contains hundreds of highly specific methods for logging events, performance metrics, and errors from every part of the application to multiple backend services.

### Findings
- **Centralized Logging Service**: The code defines a single, comprehensive logging object responsible for all telemetry.
- **Multiple Telemetry Backends**: It sends data to several distinct services:
  - `felog`: General-purpose event and error logging.
  - `femetrics`: Frontend metrics, including performance timers and rates.
  - `gnar`: Another analytics and tracking service.
  - `iterable`: A marketing automation and in-product messaging (IPM) platform.
  - `mise`: Another service, likely related to marketing or user engagement.
- **Hierarchical Structure**: The logger is organized by component, with nested objects for `bgPage`, `sidePanel`, `popup`, `gdocs`, `canvasGdocs`, `autoFix`, `autoApply`, `knowledgeHub`, `citationBuilder`, `performance`, `autocorrect`, and many others.
- **Robust Error Reporting**: It includes standardized methods (`_sendException`) for reporting errors and unhandled exceptions/rejections from all major contexts (background, content-script, popup, side-panel).
- **Granular Performance Measurement**: The service uses a `_createPerfLogger` helper to create detailed performance timers for critical operations, especially within the Google Docs (`gdocs`, `canvasGdocs`) and text processing (`fluid`, `autocorrect`) modules.
- **Feature-Specific Analytics**: Methods are tied directly to feature interactions, such as `autoFix.featureToggleClick`, `knowledgeHub.relatedMaterialsClick`, and `upgradeHooks.clickUpgradeHook`, allowing for detailed funnel analysis.
- **A/B Testing Support**: The logging infrastructure is clearly built to support A/B testing by capturing variant information in its event payloads.
- **Obfuscation Hints**:
  - `minified_vars`: Single-letter variables (`e`, `t`, `n`, `r`) are used extensively as function arguments.
  - `function_chains`: The entire logger is a large chain of function and object definitions.

### Risks
- **Extensive Tracking**: The sheer breadth and detail of the logging events indicate that a very large amount of user interaction data, performance measurements, and error information is being collected. This includes clicks, feature usage, performance degradation events, and detailed context for errors.

### Evidence
- The entire chunk (lines 20001-22000) is the definition of this logger service.
## src/js/Grammarly-popup.beautified.js [chunk 12/26, lines 22001-24000]

### Summary
This chunk concludes the definition of the massive `Logger` service and introduces several fundamental, high-impact utility modules. The most significant finding is the inclusion of the entire **DOMPurify** library, a critical security component for HTML sanitization. The chunk also contains utilities for RPC tracking, performance measurement, and text diffing.

### Findings
- **Logger Service (Conclusion)**: The logger definition is completed with more feature-specific methods for:
  - `inkwell`: Document connection and processing.
  - `connector`: Text field integration and permission prompts.
  - `serviceAvailability`: Detailed usage metrics like typing duration/length and active domains.
  - `treatments`: Fetching A/B test configurations.
- **Internal Logger Helpers**: Defines the private methods (`_send`, `_sendUsage`, `_sendSampled`) that manage log sampling and transmission to the telemetry backends.
- **Error Classification**: Includes utility functions (`x(e)`, `k(e)`) to categorize runtime errors into standardized strings (e.g., `FailedToFetch`, `TabNotExists`) for better backend aggregation.
- **Module 72314: DOMPurify Library**: This module contains a full, embedded copy of the DOMPurify library, a well-known and robust HTML sanitizer. This is a strong indicator of security-conscious development, as it's used to prevent Cross-Site Scripting (XSS) attacks by cleaning any HTML before it's rendered.
- **Module 11950: RPC Tracking Wrapper**: A generic, proxy-based wrapper is defined to automatically track RPC calls, including handling timeouts. This adds a layer of observability to inter-script communication.
- **Module 70565: Performance Measurement**: A simple class for measuring the execution time of synchronous and asynchronous functions, used by the logger's performance-timing methods.
- **Module 93667: Text Diffing Utility**: The chunk includes a utility for calculating differences between two strings, likely used for managing document states or logging text changes.
- **Obfuscation Hints**:
  - `minified_vars`: Prevalent use of single-letter variables.
  - `webpack_modules`: Clear Webpack module structure (`52439:`, `11950:`, etc.).

### Risks
- **Security Dependency**: While the use of DOMPurify is a positive security practice, the extension's security against XSS is now tied to the version and configuration of this embedded library. Any vulnerabilities in this specific version of DOMPurify could be inherited.

### Evidence
- **DOMPurify**: The entire library is present in module `72314` (lines 23200-23900 approx).
- **Logger Helpers**: `_send`, `_sendUsage`, `_sendSampled` methods are defined within the `Logger` class around lines 22150-22200.
- **RPC Tracker**: Module `11950` (lines 22308-22325).
- **Text Diffing**: Module `93667` (lines 23902-24000).
## Grammarly-popup.js [chunk 13/26, lines 24001-26000]

### Summary
This chunk continues the implementation of a sophisticated text diffing algorithm and introduces a suite of functional programming utilities, primarily from a library resembling `fp-ts`.

### Findings

#### Obfuscation Hints
- **webpack_modules**: The code is structured as Webpack modules (`93667`, `18117`, `59833`, etc.).
- **minified_vars**: Single-letter variables (`e`, `t`, `n`, `r`) are used extensively, typical of minified code.

#### Libraries & Patterns
- **Diff-Match-Patch Algorithm (Module `93667`):**
  - Implements a powerful text diffing capability with functions like `diff_main`, `diff_bisect`, and `diff_cleanupSemantic`.
  - Uses constants `DIFF_INSERT`, `DIFF_DELETE`, `DIFF_EQUAL` to represent changes.
  - Includes logic to handle Unicode surrogate pairs, ensuring correct processing of international text.
  - **Evidence:** `Grammarly-popup.js:24001-24400`

- **Functional Programming (`fp-ts` style):**
  - **Array Module (Module `59833`):** A comprehensive, `fp-ts`-like module for array manipulation, providing functions such as `map`, `chain` (flatMap), `filter`, `reduce`, `partition`, and `traverse`. This suggests a declarative approach to data processing.
    - **Evidence:** `Grammarly-popup.js:24801-25580`
  - **Either Module (Module `12518`):** The `Either` data type is used for robust error handling, representing computations that can result in either a `Left` (error) or a `Right` (success).
    - **Evidence:** `Grammarly-popup.js:25582-25821`
  - **Option Module (Module `58303`):** The `Option` type (`Some` or `None`) is used to handle potentially missing values without resorting to `null` or `undefined`.
    - **Evidence:** `Grammarly-popup.js:25823-26000` (start of module)
  - **Other FP Utilities:** Includes `Eq` for equality checking (Module `21147`), `Reader` for dependency injection (Module `48886`), and various helper functions.

### Risks
- No new risks are identified in this chunk. The use of established functional programming patterns and a robust diffing algorithm are signs of mature, defensive coding practices.

### Evidence
- `Grammarly-popup.js:24001-26000`
## Grammarly-popup.js [chunk 14/26, lines 26001-28000]

### Summary
This chunk continues the deep dive into the extension's functional programming infrastructure, revealing a comprehensive set of utilities for handling records (objects) and a powerful runtime validation and decoding library that strongly resembles `io-ts`.

### Findings

#### Obfuscation Hints
- **webpack_modules**: Code is organized into modules like `8351`, `38538`, `93123`, and `63332`.
- **minified_vars**: Consistent use of single-letter variables (`e`, `t`, `n`, `r`).

#### Libraries & Patterns
- **ReadonlyRecord Module (Module `8351`):**
  - A complete `fp-ts`-style module for immutable record manipulation.
  - Provides a rich API including `map`, `reduce`, `filter`, `partition`, `traverse`, and `sequence`.
  - This indicates a strong preference for immutability and declarative data transformation when working with objects.
  - **Evidence:** `Grammarly-popup.js:26001-27500`

- **Record Module (Module `38538`):**
  - A related module, likely for mutable records, that complements the `ReadonlyRecord` utilities.
  - **Evidence:** `Grammarly-popup.js:27502-27800`

- **`io-ts` Decoder/Encoder Library (Modules `93123`, `63332`):**
  - **Decoder (Module `93123`):** A powerful runtime validation and decoding system. It is used to safely transform untrusted data (e.g., from an API or `chrome.storage`) into known, typed structures.
    - Defines primitives like `string`, `number`, `boolean`, `array`, `type` (for objects), `partial`, `intersect`, `sum`, and `lazy`.
    - Includes a sophisticated error-reporting system (`drawTree`) to generate human-readable error messages for validation failures. This is a key feature of `io-ts`.
  - **Encoder (Module `63332`):** The counterpart to the `Decoder`, used to convert application data models back into simple objects for serialization (e.g., to send in an API request).
  - **Evidence:** `Grammarly-popup.js:27802-28000`

### Risks
- No new risks are identified. The extensive use of `io-ts`-like decoders is a significant security and stability feature. It demonstrates a robust, defensive approach to handling any external or untyped data, which helps prevent a wide range of bugs and potential injection-style vulnerabilities.

### Evidence
- `Grammarly-popup.js:26001-28000`
## Grammarly-popup.js [chunk 15/26, lines 28001-30000]

### Summary
This chunk concludes the `io-ts`-like validation library and transitions into a large, minified module that is clearly identifiable as the core of **React's DOM rendering and event handling logic (`react-dom`)**.

### Findings

#### Obfuscation Hints
- **webpack_modules**: The code is structured into modules (`64551`, `43351`, `95340`).
- **minified_vars**: Extensive use of single-letter variables.

#### Libraries & Patterns
- **`io-ts` Decoder Utilities (Modules `64551`, `43351`):**
  - These modules provide the final pieces of the runtime validation framework, including functions for creating complex decoders (`intersect`, `sum`, `lazy`) and a sophisticated error reporter (`draw`) that formats validation failures into a readable tree. This confirms the library's similarity to `io-ts`.
  - **Evidence:** `Grammarly-popup.js:28001-28300`

- **React DOM Internals (Module `95340`):**
  - This large module contains the core runtime logic for `react-dom`.
  - **Error Handling:** Begins with React's standard error decoder URL (`reactjs.org/docs/error-decoder.html`).
  - **DOM Property Configuration:** Defines an extensive configuration for mapping React props (e.g., `className`, `onClick`) to DOM attributes and properties, including their types and namespaces.
  - **React Symbols:** Defines all the `Symbol.for('react.*')` identifiers (`react.element`, `react.fragment`, `react.provider`, etc.) used by React to distinguish component types.
  - **Controlled Components:** Implements the `_valueTracker` mechanism for form elements (`<input>`, `<textarea>`, `<select>`) to manage state for controlled components.
  - **DOM Manipulation:** Contains low-level functions for setting `innerHTML`, `textContent`, and applying CSS styles, including a list of unitless CSS properties.
  - **Event System:** The code includes logic for registering event listeners and mapping React event names (e.g., `onClick`) to native browser events (e.g., `click`).
  - **Evidence:** `Grammarly-popup.js:28302-30000`

### Risks
- No new risks are identified. The presence of a standard, albeit minified, version of `react-dom` is expected for a React-based application.

### Evidence
- `Grammarly-popup.js:28001-30000`

## src/js/Grammarly-popup.beautified.js [chunk 16/26, lines 30001-32000]

### Summary
This chunk continues the deep dive into the internals of the **`react-dom`** library (module `95340`). It reveals a significant portion of React's core runtime, including the synthetic event system, logic for controlled components, the hydration process for server-rendered HTML, and the main reconciliation (diffing) algorithm.

### Findings
- **React Synthetic Event System**:
  - **Event Dispatching & Queueing**: Contains the logic for capturing, wrapping, and dispatching native browser events. It includes a sophisticated queueing and blocking mechanism to handle events during hydration or other blocking work.
  - **Event Priority**: Integrates with the scheduler to prioritize events (e.g., `click` vs. `mouseover`).
  - **Synthetic Event Constructors**: Defines constructors for various synthetic event types (mouse, keyboard, touch, focus, composition) that normalize browser inconsistencies.

- **Controlled Component Logic**:
  - Implements the machinery for controlled `<input>` and `<textarea>` elements.
  - Tracks input values and selection state to correctly fire `onChange` events and maintain user focus/cursor position across re-renders.
  - Includes workarounds for older browsers (e.g., `onpropertychange` for IE).

- **Hydration Internals**:
  - Details the process of attaching React to existing HTML.
  - Uses comment nodes (`<!--$-->`, `<!--/$-->`) as boundaries to match the DOM with the virtual component tree.
  - Internal pointers (`$o`, `ei`) are used to traverse the DOM during this process.

- **Reconciliation (Diffing) Algorithm**:
  - The `gi` function represents the core of React's diffing algorithm.
  - It contains the logic for comparing the new element tree with the old Fiber tree to efficiently compute and apply updates to the DOM.
  - It handles creating, updating, and deleting Fibers, and uses `key` props for list optimization.

### Obfuscation Hints
- **Minified Vars**: Standard minified variable names are used throughout.
- **Generated APIs**: The code is a compiled and minified version of the `react-dom` library, with its internal function names and structures.

### Risks
- No new risks identified in this chunk. This is standard, albeit complex, UI library code.

### Evidence
- src/js/Grammarly-popup.beautified.js:30001-32000

## src/js/Grammarly-popup.beautified.js [chunk 17/26, lines 32001-34000]

### Summary
This chunk contains the heart of the **`react-dom`** commit phase (module `95340`). It details the complex logic for walking the completed Fiber tree, applying DOM mutations, handling component lifecycle methods, and executing hook effects. This section is critical for making the virtual DOM changes visible in the actual DOM.

### Findings
- **Commit Phase Main Loop**: The code orchestrates the commit phase, which is divided into multiple stages: before mutation, mutation, and layout. Functions like `dl` and `ul` walk the Fiber tree to find and execute effects.
- **DOM Mutation Logic**:
  - **Insertion**: `rl` and `ol` handle inserting DOM nodes.
  - **Updates**: `Is` applies updated props to DOM nodes.
  - **Deletion**: `ll` and `sl` manage the removal of components and their corresponding DOM nodes, including unmounting lifecycles and detaching refs.
- **Lifecycle and Hook Execution**:
  - It contains the logic to call class component lifecycles like `componentDidMount` and `componentDidUpdate`.
  - It implements the invocation of `useLayoutEffect` and `useEffect` hooks, respecting their dependency arrays (`Qs`, `Js`).
- **Ref Handling**: The code manages attaching (`$s`) and detaching (`Xs`) `ref`s during commit.
- **Error Handling**: Implements the error boundary mechanism, catching errors during the render and lifecycle methods and propagating them up to the nearest boundary (`yc`, `us`, `cs`).
- **Suspense and Hydration**: Continues the deep integration of Suspense, with functions like `As`, `Ds`, and `Fs` handling the rendering of fallback UI, managing dehydrated trees, and retrying rendering.

### Obfuscation Hints
- **Minified Vars**: The code is heavily minified with short, non-descriptive variable names.
- **Generated APIs**: This is clearly compiled output from the React library, not handwritten application code.

### Risks
- No new risks are identified. This is the standard, production-grade implementation of the React DOM renderer.

### Evidence
- src/js/Grammarly-popup.beautified.js:32001-34000
## Grammarly-popup.js [chunk 18/26, lines 34001-36000]

### Summary
This chunk, spanning lines 34001-36000 of `Grammarly-popup.beautified.js`, contains the absolute core of the React scheduler and the main work loop, which orchestrates the entire rendering process. It's the engine room of the React application. This section is responsible for scheduling updates, running the render and commit phases, and handling errors that occur during rendering. It includes the main entry points for `ReactDOM.render` and the logic that drives the fiber reconciliation and commit lifecycle. Key functions like `beginWork` (`bl`), `commitRoot` (`gc`), and the main scheduler loop (`$l`) are defined here. This code manages priorities, handles asynchronous rendering, and ensures the UI is updated efficiently.

### Findings
- **Obfuscation Hints**:
  - **Minified Vars**: The code is heavily minified with short, non-descriptive variable names (`bl`, `yl`, `wl`, `_l`, etc.), which is characteristic of production builds.
  - **Webpack Modules**: The module structure (`95340`, `95295`, etc.) confirms this is a Webpack bundle.
- **React Internals**:
  - **Scheduler Loop**: Functions like `Yl`, `Zl`, `Jl`, `Ql`, and `$l` form the core scheduling and work execution loop. They handle priorities, time-slicing (`pc`), and coordinating with the browser's main thread (`Xe`).
  - **`beginWork` (`bl`)**: This is the main function of the "render phase." It's a large switch statement that processes each fiber based on its `tag` (e.g., ClassComponent, FunctionComponent, HostComponent) and determines the work to be done, such as calling render methods and reconciling children.
  - **`commitRoot` (`gc`)**: This function executes the "commit phase." It takes the finished fiber tree (`finishedWork`) and applies the changes to the DOM. It handles DOM insertions, updates, and deletions, and calls lifecycle methods like `componentDidMount` and `componentDidUpdate`, as well as `useEffect` hooks.
  - **Error Handling (`yc`, `lc`)**: This is React's internal error handling mechanism. When an error is thrown during render, these functions catch it, find the nearest error boundary, and schedule a re-render to display the fallback UI.
  - **Root Management (`Lc`, `Yc`)**: These functions manage the root of the React application. `Lc` (`createRoot`) creates a new fiber root, and `Yc` (`updateContainer`) is the entry point for `ReactDOM.render` and subsequent updates.
  - **Hydration Logic (`Bc`, `Gc`)**: Contains logic for hydrating server-rendered content, attaching event listeners, and reconciling the initial UI with the client-side React tree.

### Risks
- No direct risks are observable in this chunk, as it consists of the standard, production-optimized React DOM library. The behavior is complex but expected for a React application.

### Evidence
- **File**: `src/js/Grammarly-popup.js`
- **Chunk**: 18/26
- **Lines**: 34001-36000
## Grammarly-popup.js [chunk 19/26, lines 36001-38000]

### Summary
This chunk, from lines 36001-38000 of `Grammarly-popup.beautified.js`, contains a comprehensive `ResizeObserver` polyfill (or a library with the same API). This utility is designed to allow developers to react to changes in an element's size. The implementation is robust, using a variety of modern and legacy techniques to detect dimension changes, including `MutationObserver`, `transitionend` events, and even the deprecated `DOMSubtreeModified` for older browsers. It also includes logic to correctly measure both standard HTML elements (considering `box-sizing`) and SVG elements (using `getBBox`). This is a foundational piece for building responsive UI components that adapt to their own container size, not just the viewport.

### Findings
- **Core Functionality**:
  - **ResizeObserver Polyfill**: The code defines a `ResizeObserver` class (exported as `E`) that mimics the standard browser API. It manages observers and broadcasts notifications when element sizes change.
  - **Change Detection Strategy**: It employs a multi-pronged approach to detect changes:
    - `MutationObserver`: The preferred method for observing the DOM for attribute changes, child additions/removals, and character data changes.
    - `transitionend` Event: Listens for the end of CSS transitions, which often result in size changes.
    - `resize` Event: Listens for the global window resize event.
    - `DOMSubtreeModified`: Used as a fallback if `MutationObserver` is not available, though it's noted for being less performant.
- **Element Measurement**:
  - The code contains sophisticated logic to measure element sizes accurately.
  - For standard block elements, it reads `clientWidth`/`clientHeight` and adjusts for `padding`, `border`, and the `box-sizing` property.
  - For SVG elements, it correctly switches to using the `getBBox()` method, which is necessary for scalable vector graphics.
- **Performance**:
  - Uses `requestAnimationFrame` to batch and debounce the refresh logic, preventing layout thrashing by ensuring measurements and broadcasts happen at an optimal time in the browser's rendering cycle.
- **Obfuscation Hints**:
  - **Minified Vars**: The code is heavily minified (`c`, `u`, `d`, `f`, `p`, `h`, `m`, `g`, `v`, `b`, `y`, `w`, `_`, `C`, `S`, `E`).
  - **Webpack Modules**: The code is structured as Webpack modules, including `49146` (the ResizeObserver polyfill itself) and several modules from the `rxjs` library (`62552`, `70937`, `8867`, etc.), indicating that RxJS is a dependency for handling asynchronous events and streams.

### Risks
- No direct security risks are present. This is a standard UI utility library. The use of the deprecated `DOMSubtreeModified` event is a potential performance concern in very old browser environments, but it's a fallback mechanism.

### Evidence
- **File**: `src/js/Grammarly-popup.js`
- **Chunk**: 19/26
- **Lines**: 36001-38000
## Grammarly-popup.beautified.js [chunk 20/26, lines 38001-40000]

### Summary
This chunk is a mix of several libraries. It contains more `rxjs` scheduler implementations (`asyncScheduler`, `queueScheduler`, `asapScheduler`), various `rxjs` operators and observable creation functions (`from`, `combineLatestWith`), and the core implementation of React's scheduler (`unstable_scheduleCallback`, `unstable_now`, etc.). It also includes a full-featured User-Agent string parser library (`UAParser.js`) and the `typestyle` CSS-in-JS library.

### `rxjs` Schedulers & Utilities
- **Schedulers**: `asyncScheduler` (module `25941`), `asapScheduler` (module `49601`), and `queueScheduler` (module `25941`) are present, providing different strategies for scheduling asynchronous tasks.
- **`from` operator** (module `91603`): A key observable creation function that can convert arrays, promises, iterables, and other structures into an observable stream.
- **`combineLatestWith` operator** (module `10883`): An operator to combine multiple observables.

### React Scheduler
- **Implementation**: Module `26974` (and `22015`) contains the full implementation of React's cooperative scheduler.
- **Key Functions**: `unstable_scheduleCallback`, `unstable_cancelCallback`, `unstable_now`, `unstable_runWithPriority`, `unstable_getCurrentPriorityLevel`, `unstable_shouldYield`.
- **Purpose**: This is the core of React's concurrent mode, allowing rendering work to be paused and resumed without blocking the main thread. It uses a priority queue and a time-slicing mechanism (`shouldYield`) to manage tasks.

### UAParser.js
- **Implementation**: Module `87998` contains a complete copy of `UAParser.js`.
- **Purpose**: This library is used to parse a browser's User-Agent string to identify the browser, engine, OS, CPU, and device type. This is often used for analytics or for enabling/disabling features based on the user's environment.

### typestyle
- **Implementation**: Module `15158` contains the `typestyle` library.
- **Purpose**: A CSS-in-JS library for writing type-safe styles in TypeScript/JavaScript. It allows for creating stylesheets, media queries, keyframes, and more, programmatically.

### LRU Cache
- **Implementation**: Module `84108` contains a simple Least Recently Used (LRU) cache implementation.

### Findings
- **DOM Manipulation**: `typestyle` (module `15158`) dynamically creates and injects `<style>` tags into the document head.
- **Obfuscation Hints**: `webpack_modules`.
- **Risks**:
  - **Fingerprinting**: `UAParser.js` (module `87998`) is a classic fingerprinting tool. It gathers detailed information about the user's system (Browser, OS, CPU, Device) from the User-Agent string, which can contribute to creating a unique user profile.

### Evidence
- `Grammarly-popup.beautified.js`:38001-40000
## Grammarly-popup.beautified.js [chunk 21/26, lines 40001-42000]

### Summary
This chunk contains a significant portion of the `@floating-ui/react` library, a comprehensive toolkit for positioning and managing floating UI elements like popups, tooltips, and menus. It includes the core positioning logic, the DOM platform implementation, and various React hooks for interactions.

### `@floating-ui/core` (Module `40018`)
- **Core Logic**: This module contains the main `computePosition` function (seen as `i` in the minified code), which is the engine for calculating the coordinates of a floating element.
- **Middleware**: It includes several middleware functions that modify the position:
  - `offset` (`c`): Adds distance between the reference and floating elements.
  - `flip` (`l`): Changes the placement of the floating element to prevent it from being clipped by the viewport.
  - `shift` (`u`): Adjusts the position to keep the floating element in view.
  - `arrow` (`s`): Calculates the position for an arrow element that points to the reference element.

### `@floating-ui/dom` (Module `4061`)
- **DOM Platform**: This module provides the web-specific implementation needed by the core. It handles all direct DOM interactions.
- **Key Functions**:
  - `getElementRects`: Measures the dimensions and position of elements.
  - `getClippingRect`: Identifies the visible area of the viewport and any scrollable ancestors.
  - `getOffsetParent`: Finds the nearest positioned ancestor.
  - `autoUpdate` (`C`): A crucial utility that automatically repositions the floating element in response to events like scrolling, resizing, or layout shifts.

### `@floating-ui/react` (Modules `15026`, `21585`)
- **React Hooks**: This is the React layer that integrates the core positioning logic into the React component lifecycle.
  - `useFloating` (`f` in `15026`): The primary hook that manages the floating element's state, returning its position, strategy, placement, and refs.
  - **Interaction Hooks**: A suite of hooks to control the open/closed state of the floating element:
    - `useHover` (`R` in `21585`): Manages hover interactions.
    - `useClick` (`K` in `21585`): Manages click interactions.
    - `useDismiss` (`J` in `21585`): Handles closing the element (e.g., on outside click or Escape key).
    - `useFocus` (`$` in `21585`): Manages focus and blur interactions.
    - `useRole` (`ie` in `21585`): Applies appropriate ARIA attributes for accessibility.
  - **Components & Utilities**:
    - `FloatingPortal` (`H` in `21585`): Renders the floating element in a React Portal, typically at the end of `document.body`.
    - `FloatingArrow` (`w` in `21585`): A component for rendering an arrow.
    - `useTransitionStatus` (`ae` in `21585`): Helps manage CSS transitions and animations.

### Findings
- **DOM Manipulation**: The `FloatingPortal` component dynamically creates `div` elements and appends them to the document to serve as containers for floating UI.
- **Event Listeners**: The library sets up a wide array of event listeners for `scroll`, `resize`, `focus`, `blur`, `keydown`, `mouseenter`, `mouseleave`, `mousedown`, and `click` to manage positioning and state.
- **Obfuscation Hints**: `webpack_modules`.
- **Risks**: No new risks identified in this chunk. This is a standard, widely-used UI library.

### Evidence
- `Grammarly-popup.beautified.js`:40001-42000
## Grammarly-popup.js [chunk 22/26, lines 42001-44000]

### Summary
This chunk contains a significant portion of what appears to be Grammarly's internal UI component library, referred to as "GDS" (Grammarly Design System). It includes a wide range of foundational React components for building the extension's user interface, alongside various utility libraries for DOM manipulation, focus management, and accessibility.

### Findings
- **Grammarly Design System (GDS)**: A large set of React components are defined, all prefixed with `gds-`. This is a proprietary component library.
  - **Layout**: `gds-box` (module `83542`), `gds-flex` (module `50635`).
  - **Typography**: `gds-typography` (module `69554`), `gds-link` (module `15484`).
  - **Controls**: `gds-button` (modules `52348`, `86486`), `gds-icon-button` (module `12712`).
  - **Feedback**: `gds-loader` (modules `96634`, `77664`, `65464`).
  - **Form Elements**: `gds-input-label` (module `67283`), `gds-input-error` (module `42684`).
  - **Graphics**: `gds-icon` (module `36279`), and various Grammarly logos (module `59819`).
- **Focus Management**: Module `39421` is a comprehensive library for identifying tabbable/focusable elements in the DOM. Its structure is highly indicative of the `tabbable` npm package, used for managing focus in complex UIs like modals and menus.
- **DOM & Environment Utilities**:
  - Module `82700` provides a rich set of DOM helper functions (e.g., `getComputedStyle`, `ownerDocument`, traversing parents).
  - Module `28834` contains functions for sniffing the user agent (`s()`), platform (`a()`), and vendor (`c()`) to determine the environment (e.g., Android, Mac, Apple device).
- **Accessibility**: Module `61189` implements a "live announcer" (`gds-liveAnnouncer`) to programmatically make announcements to screen readers, an important accessibility feature.
- **Obfuscation Hints**:
  - `webpack_modules`: The code is structured as a Webpack bundle with numeric module IDs.
  - `minified_vars`: Variable names are minified (e.g., `e`, `t`, `n`).
  - `private_fields`: Several small modules (`87938`, `37715`, etc.) appear to be helpers or polyfills for handling private class fields, a common pattern in compiled modern JavaScript.

### Risks
- **Fingerprinting (Low)**: The environment sniffing in module `28834` contributes to browser fingerprinting by collecting details about the user's OS and browser. This is a common practice but is noted for completeness.

### Evidence
- **GDS Components**: Lines 42853-43990 (covering modules like `83542`, `52348`, `50635`, etc.).
- **Focus Management (`tabbable`)**: Lines 42695-42852 (module `39421`).
- **Environment Sniffing**: Lines 42018-42070 (module `28834`).
- **Live Announcer**: Lines 43594-43658 (module `61189`).

## src/js/Grammarly-popup.beautified.js [chunk 23/26, lines 44001-46001]

### Summary
This chunk is a continuation of the Grammarly Design System (GDS) and consists almost entirely of SVG logo components defined as React components. It contains a large library of logos for "Grammarly," "Superhuman," and "Coda," each with numerous variations (e.g., stacked, horizontal, mark-only) and color schemes (primary, secondary, mono-light, mono-inverse). This suggests a robust, internal UI library designed to handle brand assets for Grammarly and potentially for integrations or partnerships.

### Findings
- **Component Library (GDS):**
  - A comprehensive set of SVG logo components for different brands, indicating a shared or integration-focused UI library.
  - Brands included:
    - `Grammarly`
    - `Superhuman`
    - `Coda`
    - `Grammarly Go`
  - Each logo has multiple compositions (`mark`, `lockup:horizontal`, `lockup:stacked`, `type`) and color variants (`color-primary`, `color-secondary`, `mono-light`, `mono-inverse`).
  - A generic `Logo` component (at the end of the chunk) appears to be a dispatcher that selects the correct SVG component based on props like `brand`, `variant`, `composition`, etc.

- **Obfuscation Hints:**
  - `webpack_modules`: The code continues to use the Webpack module pattern.
  - `minified_vars`: Standard minified variable names (`e`, `t`, `n`, `r`) are used throughout.

### Risks
- **None** identified in this chunk. The code is purely for rendering UI assets.

### Chrome APIs
- None

### Event Listeners
- None

### Storage
- None

### Endpoints
- None

### Evidence
- `src/js/Grammarly-popup.beautified.js:44001-46001`

## src/js/Grammarly-popup.beautified.js [chunk 24/26, lines 46001-48001]

### Summary
This chunk contains a mix of UI utility functions and React hooks, primarily from the Grammarly Design System (GDS). Key functionalities include:
1.  **Styling Utilities:** Functions for converting props (like `margin`, `padding`, `bgColor`) into CSS styles.
2.  **React Hooks:** Custom hooks for handling side effects, managing focus, and detecting user preferences like `prefers-reduced-motion`.
3.  **Icon Components:** A large set of simple "Interface" SVG icons (e.g., Bell, Checkmark, Close, Down, Error, ExternalLink).
4.  **API Services:** Definitions for interacting with Grammarly's backend configuration API for "Cheetah" (likely the internal name for Grammarly's generative AI features). This includes fetching and setting user/institution settings.
5.  **Focus Management:** A `FocusScope` implementation for trapping focus within a specific part of the DOM, crucial for modals and dialogs.

### Findings
- **Component Library (GDS):**
  - **Styling:** Modules `42620` and `81061` provide utility functions (`o.AA`, `o.VI`, `a.f`) to transform component props into CSS styles, handling spacing, colors, borders, and dimensions.
  - **Icons:** A series of modules (`15e3`, `1087`, `64803`, etc.) define basic interface icons as React components.
- **React Hooks:**
  - `usePrevious` (`52708`): A standard hook to keep track of a value from the previous render.
  - `useReducedMotion` (`61311`): A hook that detects the user's `prefers-reduced-motion` OS-level setting.
- **API Interaction:**
  - **Cheetah Settings API:** Module `54647` (and its dependencies `2599`, `90512`) defines a service class for interacting with the Cheetah configuration API.
    - **Endpoints:**
      - `https://capi[...]/api/configuration/cheetah/v1/settings` (for user-level settings)
      - `https://goldengate[...]/configuration/cheetah/v1/institution/settings` (for institutional/admin settings)
    - **Functionality:** The service can `getStatus`, `setStatus`, `optIn`, `optOut`, and `optInGroups`, indicating a system for managing user and group access to AI features.
    - **Authentication:** The API calls are extended with headers for `X-Client-Version`, `X-Client-Type`, `X-CSRF-Token`, and an `Authorization` bearer token, showing standard authenticated requests.
- **Focus Management:**
  - Module `95396` implements a `FocusScope` using a tree-like data structure (`Tree`, `TreeNode`) to manage and trap focus. This is a common pattern for accessibility in complex web applications.
- **Obfuscation Hints:**
  - `webpack_modules`: The code continues to use the Webpack module pattern.
  - `minified_vars`: Standard minified variable names are used.

### Risks
- **None** identified in this chunk. The API interactions appear to be for legitimate feature configuration.

### Chrome APIs
- None

### Event Listeners
- `change` listener on `matchMedia` for `prefers-reduced-motion`.

### Storage
- None

### Endpoints
- `https://capi[...]/api/configuration/cheetah/v1/settings`
- `https://goldengate[...]/configuration/cheetah/v1/institution/settings`

### Evidence
- `src/js/Grammarly-popup.beautified.js:46001-48001`
## Grammarly-popup.js [chunk 25/26, lines 48001-50000]

### Summary
This chunk contains a sophisticated set of low-level UI framework modules, strongly resembling the architecture of Adobe's `react-aria` and `react-spectrum` libraries. It provides foundational hooks and utilities for building accessible and interactive components, rather than application-specific business logic. The primary functionalities include advanced event handling (press, keyboard), comprehensive focus management (focus hooks, focus visibility, focus scopes), and primitives for building accessible form elements.

### Chrome APIs
- None in this chunk.

### Event Listeners
- This chunk defines high-level abstractions for a wide range of DOM events (`keydown`, `keyup`, `pointerdown`, `mousedown`, `focus`, `blur`, `focusout`, `focusin`, `touch`, `scroll`) as part of the UI framework, but does not attach them to specific application features.

### Messaging
- None in this chunk.

### Storage
- None in this chunk.

### Endpoints
- None in this chunk.

### DOM/Sinks
- The framework code is designed to manipulate DOM properties and attributes for focus, accessibility (`aria-*`), and event handling.

### Dynamic Code/Obfuscation
- **Obfuscation Hints**:
  - `webpack_modules`: Code is organized into Webpack modules (`95396`, `20885`, `83902`, `82285`, `20285`).
  - `minified_vars`: Original variable names within the modules are minified (e.g., `e`, `t`, `n`).
- **Framework Code**: The code appears to be part of a component framework, likely internal but based on principles from libraries like `react-aria`.

### Risks
- No specific risks are identifiable in this chunk, as it consists of generic UI framework implementation.

### Evidence
- `Grammarly-popup.beautified.js:48001-50000`
## Grammarly-popup.js [chunk 26/26, lines 50001-50282]

### Summary
This final chunk serves as the main entry point for the popup. It defines a comprehensive `P` class that acts as a facade or wrapper around the entire `chrome.*` extension API surface. This class abstracts away differences between Manifest V2 and V3 and provides a consistent, high-level API for features like browser actions, storage (local, session, managed), messaging, tabs, notifications, cookies, permissions, and native messaging. The script concludes by calling an initialization function (`e.Xb.init()`) and passing it an instance of this API wrapper, effectively bootstrapping the entire popup application.

### Chrome APIs
- `chrome.runtime.connect`
- `chrome.runtime.sendMessage`
- `chrome.runtime.onMessage`
- `chrome.runtime.getURL`
- `chrome.runtime.reload`
- `chrome.runtime.setUninstallURL`
- `chrome.storage.local`
- `chrome.storage.managed`
- `chrome.storage.session`
- `chrome.storage.onChanged`
- `chrome.action` / `chrome.browserAction` (handles both MV3/MV2)
- `chrome.scripting.executeScript` (MV3)
- `chrome.tabs.executeScript` (MV2)
- `chrome.scripting.insertCSS` (MV3)
- `chrome.tabs.insertCSS` (MV2)
- `chrome.tabs.create`
- `chrome.tabs.update`
- `chrome.tabs.query`
- `chrome.tabs.reload`
- `chrome.tabs.remove`
- `chrome.tabs.onUpdated`
- `chrome.tabs.onRemoved`
- `chrome.tabs.onActivated`
- `chrome.windows.onFocusChanged`
- `chrome.notifications.create`
- `chrome.notifications.clear`
- `chrome.cookies.get`
- `chrome.cookies.set`
- `chrome.cookies.remove`
- `chrome.cookies.getAll`
- `chrome.cookies.onChanged`
- `chrome.permissions.getAll`
- `chrome.permissions.request`
- `chrome.permissions.contains`
- `chrome.permissions.onAdded`
- `chrome.permissions.onRemoved`
- `chrome.i18n.detectLanguage`
- `chrome.i18n.getUILanguage`
- `chrome.i18n.getAcceptLanguages`
- `chrome.identity`
- `chrome.management.uninstallSelf`
- `chrome.sidePanel.open`
- `chrome.runtime.connectNative`
- `self.indexedDB`

### Event Listeners
- `chrome.runtime.onMessage`
- `chrome.storage.onChanged`
- `chrome.tabs.onUpdated`
- `chrome.tabs.onRemoved`
- `chrome.tabs.onActivated`
- `chrome.windows.onFocusChanged`
- `chrome.cookies.onChanged`
- `chrome.permissions.onAdded`
- `chrome.permissions.onRemoved`
- `chrome.notifications.onClicked`
- `chrome.notifications.onButtonClicked`
- `chrome.notifications.onClosed`

### Messaging
- Establishes runtime messaging channels and a native messaging connection (`connectNative`).
- Implements a code-splitting listener that uses `chrome.runtime.onMessage` to dynamically inject scripts into tabs.

### Storage
- Implements wrappers for `local`, `managed`, and `session` storage, including an in-memory fallback for `session` storage in non-MV3 environments.

### Endpoints
- None directly, but it provides the `fetch` mechanism for internal resources and checks for the installation of other Microsoft extensions (`mseditor`, `office`) by fetching their public resources.

### DOM/Sinks
- No direct DOM manipulation, but it provides the APIs (`executeScript`, `insertCSS`) that other parts of the application use to interact with web pages.

### Dynamic Code/Obfuscation
- **Webpack Bootstrap**: This chunk contains the final part of the Webpack runtime and the main entry point logic.
- **Facade Pattern**: The `P` class is a clear example of the Facade design pattern, simplifying a complex subsystem (the `chrome` API) into a single interface.

### Risks
- **High Privilege**: This script orchestrates the use of a vast number of powerful Chrome APIs. Any vulnerability in the logic that uses this API facade could have significant security implications.
- **Native Messaging**: The use of `connectNative` indicates communication with a native application on the user's machine, which is a high-privilege operation that bypasses the browser sandbox.

### Evidence
- `Grammarly-popup.beautified.js:50001-50282`

## Components

### Background (Service Worker)
- **Files**: `sw.js` (aliases: `Grammarly-bg.js`)
- **APIs**: `chrome.storage`, `chrome.runtime`, `chrome.tabs`, `chrome.scripting`, `chrome.alarms`, `chrome.declarativeNetRequest`, `chrome.webRequest`, `chrome.cookies`
- **Listeners**: `runtime.onMessage`, `runtime.onInstalled`, `alarms.onAlarm`, `webRequest.onBeforeSendHeaders`
- **Evidence**: `outline.jsonl` (chunks for `Grammarly-bg.js`), `manifest.json`

### Content Scripts
- **Files**: `Grammarly.js`, `Grammarly-gDocs.js`, `Grammarly-check.js`, `Grammarly-popup.js`, `Grammarly-sidepanel.js`, and others.
- **APIs**: `chrome.runtime` (for messaging)
- **Listeners**: DOM events (`mousedown`, `keydown`, `input`), `runtime.onMessage`
- **Evidence**: `manifest.json` (content_scripts section), `outline.jsonl` (chunks for `Grammarly.js`, etc.)

### Injected Scripts
- **Files**: The extension uses `chrome.scripting.executeScript` to dynamically inject code, but the primary mechanism is the content scripts defined in the manifest. The ONNX runtime and its models (`.pt` files) are loaded dynamically.
- **Evidence**: `outline.jsonl` (mentions of `ort.InferenceSession` and loading of `.pt` files).

### UI Components
- **Files**: `popup.html`, `sidePanel.html`, `src/debug.html`, `src/gOS-sandbox.html`
- **Scripts**: `Grammarly-popup.js`, `Grammarly-sidepanel.js`
- **Evidence**: `manifest.json` (action, side_panel sections), `outline.jsonl`.

### Remote Services (Endpoints)
- **Domains**: `*.grammarly.com`, `*.googleapis.com`, `*.sentry.io`
- **Purpose**: Authentication, API services (CAPI), configuration (`page_config.json`), feature flags (`gates/get`), telemetry/logging (`logv2`, `femetrics`), error reporting (Sentry).
- **Evidence**: `endpoints.csv`, `outline.jsonl`.

## Flows

- **Core Text Checking**: Content Script captures text, sends it to the Service Worker via RPC. The Service Worker performs local checks (e.g., autocorrect with ONNX) and sends sanitized data to the remote CAPI for deeper analysis. Suggestions are returned to the Content Script, which renders them in the DOM.
- **Authentication**: UI triggers OAuth 2.0 flow handled by the Service Worker, which communicates with the `/oauth` endpoints. Tokens are stored in `chrome.storage.local`.
- **Telemetry**: Content Scripts and the Service Worker track a wide range of events (UI interactions, performance, errors) and send them to various logging endpoints (`/logv2`, `/femetrics`, Sentry).
- **Configuration**: On startup, the Service Worker fetches user entitlements, feature flags, and configurations from remote endpoints and caches them in storage.
- **GenAI (Agent Platform)**: User interaction in a Content Script triggers an RPC call to the Service Worker, which communicates with the CAPI backend to get generative AI responses, which are then streamed back to the UI.
