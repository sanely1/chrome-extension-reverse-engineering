## Privacy Analysis

### Data Categories
- **User Identifiers**: A unique `machineKey` (UUIDv4) is generated and stored to identify the installation. This is sent with most network requests.
- **Browsing Activity**: The extension detects the current URL to determine if it's a supported retail or product page. It extracts product information (name, image, color, brand) from the page's DOM and metadata. Navigation events within a page are also tracked.
- **Analytics/Telemetry**: The extension tracks events like `extension_installed_background`, `extension_expanded`, and participates in A/B tests. It also collects browser type and version.

### Purposes
- **Functionality**: Data extraction from product pages is essential for the core feature of finding second-hand alternatives.
- **Analytics**: Mixpanel is used to track user engagement, feature usage, and A/B test performance.
- **User Onboarding**: The post-installation redirect uses the `machineKey` to track new installations.

### Minimization
- The extension collects more data than strictly necessary for its core functionality. While product data is required, the collection of a persistent `machineKey` and detailed events in Mixpanel are for analytics and tracking purposes, not direct user-facing features.
- The content script has broad host permissions (`https://*/*`) and reads the entire DOM (`document.documentElement.outerHTML`) for its metadata parsing, which is not a minimized approach.

### Consent
- For Firefox users, a `data-control.html` page is shown, requiring an explicit "activate" click, which serves as a consent mechanism.
- For other browsers (e.g., Chrome), consent appears to be implicit upon installation. No explicit opt-in/opt-out mechanism for data collection or tracking was observed within the analyzed code.

### Retention
- The `machineKey` and A/B test variant assignments are stored indefinitely in `localStorage` or `chrome.storage`.
- Caches for API data (supported sites, configs) have a time-based expiration (`cachingTimeMins`).

### Third Parties
- **Faircado APIs** (`*.faircado.com`): Used for core functionality, configuration, and tracking (post-install redirect).
- **Mixpanel** (`api.mixpanel.com`): A third-party analytics service used to track user behavior and engagement.
- **Google APIs** (`clients2.google.com`, `googleapis.com`): Used for extension updates and OAuth2 (email scope), respectively.

### Policy Compliance
- **Potential Chrome Web Store Policy Violation**: The injection of `navigation-events.js` by creating a `<script>` tag and appending it to the host page's DOM could be seen as a method to circumvent the site's Content Security Policy (CSP), which is scrutinized by the CWS.
- **Potential GDPR/Privacy Policy Concerns**: The collection of a unique, persistent identifier (`machineKey`) and its transmission to third-party analytics (Mixpanel) without a clear and explicit user opt-in (especially outside of the Firefox-specific flow) could be problematic under GDPR and other privacy regulations that require informed consent for tracking.

## Risks

### Risk: Tracking
- **Severity**: Medium
- **Justification**: The extension assigns a unique `machineKey` to each user and sends it to both its own backend and Mixpanel. This allows for cross-site tracking of user behavior (which sites are supported, when the extension is used) without clear, upfront consent.
- **Evidence**: `extension/background.js:378-398`, `extension/background.js:11784-11792`

### Risk: Insecure Storage
- **Severity**: Low
- **Justification**: The unique `machineKey` and user authentication tokens (`authKey`, `authValue`) are stored in `localStorage` or `chrome.storage.sync` without encryption. While not directly accessible by other websites, this is a less secure practice.
- **Evidence**: `extension/background.js:830-839`, `extension/data-control.js:134-140`

### Risk: Policy Violation (CSP Circumvention)
- **Severity**: Medium
- **Justification**: The content script dynamically injects a script (`navigation-events.js`) into the host page's DOM. This is a potential violation of Chrome Web Store policies regarding code injection and could be flagged as a security risk, as it circumvents the intended isolation between the extension and the host page.
- **Evidence**: `extension/content.js:4848-4854`
