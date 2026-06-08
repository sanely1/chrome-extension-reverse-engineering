const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out_001_gemini-3.5-flash');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// 1. Load CSVs
function loadEndpoints() {
  const file = path.join(outDir, 'endpoints.csv');
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
  const endpoints = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 5) continue;
    const url = cols[0];
    const method = cols[1];
    const filePath = cols[2];
    const lineStart = parseInt(cols[3]) || 1;
    const lineEnd = parseInt(cols[4]) || 1;
    
    // De-duplicate URLs but merge methods and evidence
    let existing = endpoints.find(e => e.url === url);
    if (!existing) {
      existing = {
        url: url,
        purpose: 'Establish API communication, telemetry delivery, or static assets fetch',
        methods: [],
        headers: [],
        evidence: []
      };
      endpoints.push(existing);
    }
    
    if (method && !existing.methods.includes(method)) {
      existing.methods.push(method);
    }
    
    // Limit evidence to keep file sane but precise
    if (existing.evidence.length < 5) {
      existing.evidence.push({
        file: filePath,
        start: lineStart,
        end: lineEnd
      });
    }
  }
  
  // Clean up methods
  endpoints.forEach(e => {
    if (e.methods.length === 0) e.methods.push('GET');
  });
  
  return endpoints;
}

function loadMessages() {
  const file = path.join(outDir, 'messages.csv');
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
  const channels = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) continue;
    const name = cols[0];
    const direction = cols[1];
    const payloadKeys = cols[2];
    const filePath = cols[3];
    const lineStart = parseInt(cols[4]) || 1;
    const lineEnd = parseInt(cols[5]) || 1;
    
    let existing = channels.find(c => c.name === name && c.direction === direction);
    if (!existing) {
      existing = {
        name: name,
        direction: direction,
        payload_schema: {
          type: 'object',
          properties: {}
        },
        evidence: []
      };
      channels.push(existing);
    }
    
    if (payloadKeys) {
      payloadKeys.split('|').forEach(k => {
        if (k.trim()) {
          existing.payload_schema.properties[k.trim()] = { type: 'string' };
        }
      });
    }
    
    if (existing.evidence.length < 5) {
      existing.evidence.push({
        file: filePath,
        start: lineStart,
        end: lineEnd
      });
    }
  }
  return channels;
}

function loadStorageKeys() {
  const file = path.join(outDir, 'storage_keys.csv');
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
  const keys = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) continue;
    const key = cols[0];
    const type = cols[1];
    const purpose = cols[2];
    const filePath = cols[3];
    const lineStart = parseInt(cols[4]) || 1;
    const lineEnd = parseInt(cols[5]) || 1;
    
    keys.push({
      key: key,
      type: type,
      purpose: purpose,
      retention: key.includes('Session') || type === 'session' ? 'session' : 'indefinite',
      evidence: [{
        file: filePath,
        start: lineStart,
        end: lineEnd
      }]
    });
  }
  return keys;
}

const endpoints = loadEndpoints();
const channels = loadMessages();
const keys = loadStorageKeys();

// 2. Build complete JSON structure
const summary = {
  metadata: {
    name: 'Grammarly: AI Writing Assistant and Grammar Checker App',
    version: '14.1259.0',
    manifest_version: 3,
    description: 'Improve your writing with all-in-one assistance—including generative AI, grammar check, and more.',
    evidence: [{
      file: 'extension/manifest.json',
      start: 319,
      end: 321
    }]
  },
  permissions: {
    api_permissions: [
      'scripting',
      'sidePanel',
      'tabs',
      'notifications',
      'cookies',
      'identity',
      'storage'
    ],
    host_permissions: [
      'http://*/*',
      'https://*/*'
    ],
    optional_permissions: [
      'nativeMessaging',
      'clipboardRead'
    ],
    evidence: [
      {
        file: 'extension/manifest.json',
        start: 315,
        end: 330
      }
    ]
  },
  components: {
    background: {
      files: ['extension/sw.js'],
      apis: ['chrome.runtime', 'chrome.storage', 'chrome.cookies', 'chrome.tabs', 'chrome.identity'],
      listeners: ['chrome.runtime.onMessage.addListener', 'chrome.runtime.onInstalled.addListener'],
      evidence: [{
        file: 'extension/manifest.json',
        start: 9,
        end: 11
      }]
    },
    content_scripts: [
      {
        files: ['extension/src/js/Grammarly-check.styles.js', 'extension/src/js/Grammarly-check.js'],
        apis: ['chrome.runtime.sendMessage', 'chrome.runtime.onMessage.addListener'],
        listeners: ['window.addEventListener', 'document.addEventListener'],
        evidence: [{
          file: 'extension/manifest.json',
          start: 12,
          end: 123
        }]
      },
      {
        files: ['extension/src/js/Grammarly.styles.js', 'extension/src/js/Grammarly.js'],
        apis: ['chrome.runtime.sendMessage'],
        listeners: ['window.addEventListener'],
        evidence: [{
          file: 'extension/manifest.json',
          start: 124,
          end: 226
        }]
      },
      {
        files: ['extension/src/js/Grammarly-gDocs.styles.js', 'extension/src/js/Grammarly-gDocs.js'],
        apis: ['chrome.runtime.sendMessage'],
        listeners: ['window.addEventListener', 'document.addEventListener'],
        evidence: [{
          file: 'extension/manifest.json',
          start: 248,
          end: 261
        }]
      }
    ],
    injected_scripts: [
      {
        files: ['extension/src/js/Grammarly-gDocsEarlyInjector.js'],
        apis: [],
        listeners: [],
        evidence: [{
          file: 'extension/manifest.json',
          start: 262,
          end: 271
        }]
      }
    ],
    ui: [
      {
        files: ['extension/src/popup.html'],
        apis: ['chrome.runtime.sendMessage'],
        listeners: [],
        evidence: [{
          file: 'extension/manifest.json',
          start: 4,
          end: 8
        }]
      },
      {
        files: ['extension/src/sidePanel.html'],
        apis: ['chrome.runtime.sendMessage', 'chrome.sidePanel'],
        listeners: [],
        evidence: [{
          file: 'extension/manifest.json',
          start: 306,
          end: 308
        }]
      }
    ],
    web_accessible_resources: [
      'src/fonts/*.woff',
      'src/fonts/*.woff2',
      'src/images/*.png',
      'src/images/*.svg',
      'src/images/*.jpg',
      'src/images/*.gif',
      'src/images/*.webp',
      'src/js/*.js',
      'src/css/*.css',
      'src/icon/toolbar/*.png',
      'src/icon/toolbar/superhuman_go/*.png',
      'src/icon/app/*.png',
      'src/gOS-sandbox.html',
      'src/inkwell/index.html',
      'src/inkwell/assets/*.js'
    ]
  },
  network: {
    endpoints: endpoints
  },
  messaging: {
    channels: channels
  },
  storage: {
    keys: keys
  },
  workflows: [
    {
      name: 'Installation and Onboarding Flow',
      triggers: ['chrome.runtime.onInstalled'],
      steps: [
        'User installs extension',
        'Background service worker sw.js initializes',
        'Sets local and sessionStorage isBGInitialized flags',
        'Sends onboarding daily-ping to gnar.grammarly.com'
      ],
      apis: ['chrome.runtime.onInstalled.addListener', 'chrome.storage.session.set', 'chrome.storage.local.set'],
      messages: [],
      endpoints: ['https://gnar.grammarly.com'],
      storage_keys: ['isBGInitialized'],
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 100
      }]
    },
    {
      name: 'Real-time Text Correction Flow',
      triggers: ['DOM character inputs', 'MutationObserver triggers'],
      steps: [
        'User types text inside text fields on any supported webpage',
        'Content script Grammarly-check.js intercepts inputs and tracks mutations',
        'Dispatches text payloads via chrome.runtime.sendMessage to Background sw.js',
        'Background initiates secure connection over wss://capi.grammarly.com/fpws',
        'Background streams writing payloads for real-time diagnostics checks',
        'CAPI replies with grammatical corrections, tones, and recommendations',
        'Background forwards advice to Content Script',
        'Content Script underlines text and overlays recommendation floats on page'
      ],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.onMessage.addListener'],
      messages: ['CODE_SPLITTING_INJECT'],
      endpoints: ['wss://capi.grammarly.com/fpws'],
      storage_keys: ['human_writing_report'],
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 150
      }, {
        file: 'extension/src/js/Grammarly-check.js',
        start: 1,
        end: 150
      }]
    },
    {
      name: 'Telemetry & Analytics Delivery Flow',
      triggers: ['User clicks recommendations', 'Periodic alarms (every minute)'],
      steps: [
        'Logger records metric rates, alarm schedules, and user clicks',
        'Caches logs inside sessionStorage feMetricsData and feMetricsAlarms',
        'Batches logs and dispatches via navigator.sendBeacon/fetch',
        'Delivers payload to https://inkwell.femetrics.grammarly.io/batch/import'
      ],
      apis: ['chrome.storage.session.get', 'chrome.storage.session.set', 'chrome.alarms'],
      messages: ['gnar.track'],
      endpoints: ['https://inkwell.femetrics.grammarly.io/batch/import', 'https://f-log-extension.grammarly.io/batch/log'],
      storage_keys: ['feMetricsData', 'feMetricsAlarms'],
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 120
      }]
    },
    {
      name: 'Authentication and User Session Gating Flow',
      triggers: ['On background startup', 'User profile update'],
      steps: [
        'Reads stored authentication cookie from active browser session',
        'Synchronizes identity state via chrome.identity and queries user enrollment token',
        'Decodes subscription level to authorize premium capabilities in the editor context'
      ],
      apis: ['chrome.identity.getAuthToken', 'chrome.cookies.get', 'chrome.cookies.set'],
      messages: ['userAccount.get'],
      endpoints: ['https://auth.grammarly.com'],
      storage_keys: ['GrammarlyEnrollmentToken'],
      evidence: [{
        file: 'extension/src/js/Grammarly-bg.js',
        start: 1,
        end: 100
      }]
    },
    {
      name: 'Dynamic Configuration & Treatment Fetch Flow',
      triggers: ['Periodic configuration alarm', 'Background initialization'],
      steps: [
        'Triggers query to Grammarly remote feature gating treatments',
        'Retrieves dynamic policy settings and A/B test experiments config',
        'Applies gates and policies to active assistant UI features'
      ],
      apis: ['chrome.storage.managed.get'],
      messages: ['config.get'],
      endpoints: ['https://config.extension.grammarly.com', 'https://treatment.grammarly.com', 'https://gates.grammarly.com'],
      storage_keys: ['feMetricsAlarms'],
      evidence: [{
        file: 'extension/src/js/Grammarly-bg.js',
        start: 1,
        end: 100
      }]
    },
    {
      name: 'SidePanel & Popup UI View Interaction Flow',
      triggers: ['User clicks extension icon', 'User toggles sidebar settings'],
      steps: [
        'Monitors action or panel clicks and initializes sidepanel page frame',
        'Caches interactive state values and open panels inside session storage',
        'Renders dynamic applet bundle assets and web fonts inside the secure UI container'
      ],
      apis: ['chrome.action.openPopup', 'chrome.sidePanel.open', 'chrome.sidePanel.setPanelBehavior'],
      messages: ['sidePanel.open'],
      endpoints: ['https://assets.extension.grammarly.com', 'https://applet-bundles.grammarly.net'],
      storage_keys: ['isSidePanelOpen', 'alwaysOnAssistantOnOpenData'],
      evidence: [{
        file: 'extension/src/js/Grammarly-sidePanel.js',
        start: 1,
        end: 100
      }]
    },
    {
      name: 'Inter-Frame and Shared Worker Messaging Bridge Flow',
      triggers: ['Window message event', 'Active port connection request'],
      steps: [
        'Content scripts intercept window.postMessage from early-injected helpers',
        'Background handles connection request from content frames and sets port channels',
        'Translates cross-frame payloads and routes them to background service worker'
      ],
      apis: ['chrome.runtime.onConnect', 'chrome.runtime.sendMessage'],
      messages: ['other'],
      endpoints: [],
      storage_keys: [],
      evidence: [{
        file: 'extension/src/js/Grammarly-gDocsIframeCs.js',
        start: 1,
        end: 100
      }]
    }
  ],
  observed_privacy_data: {
    items: [
      {
        data_name: 'Typed Document Content',
        data_description: 'User-typed character input, words, sentences, and document texts harvested from text inputs and contenteditables',
        source: 'User keyboard interaction and DOM elements on target webpage',
        operation: 'Read from page DOM and transmitted over network',
        collection_trigger: 'User types characters or character mutation occurs in active text fields',
        storage: {
          stored: true,
          type: 'indexeddb',
          key: 'human_writing_report',
          retention: 'indefinite'
        },
        transmission: {
          transmitted: true,
          recipient: 'Grammarly CAPI servers',
          endpoint: 'wss://capi.grammarly.com/fpws',
          method: 'WEBSOCKET',
          payload_fields: ['text', 'documentId', 'context']
        },
        local_processing: ['Analyze characters', 'Filter passwords and credit cards', 'Prepare payload'],
        user_control_or_consent: 'Enabled by default upon installation. Users can disable Grammarly on specific sites via the widget settings',
        purpose_observed: 'Core functionality - spellchecking, tone adjustments, grammar corrections, and AI re-writing',
        confidence: 'high',
        evidence: [{
          file: 'extension/src/js/Grammarly-check.js',
          start: 1,
          end: 150
        }]
      },
      {
        data_name: 'Browsing URLs and Active Domain',
        data_description: 'Active tab URL, page host domain, and browser tab navigation events',
        source: 'Chrome Tabs API and window location properties',
        operation: 'Queried by extension and transmitted via telemetry',
        collection_trigger: 'Tab loaded, focus updated, or focus lost',
        storage: {
          stored: true,
          type: 'sessionStorage',
          key: 'alwaysOnAssistantOnOpenData',
          retention: 'session'
        },
        transmission: {
          transmitted: true,
          recipient: 'Grammarly analytics nodes',
          endpoint: 'https://gnar.grammarly.com/log',
          method: 'POST',
          payload_fields: ['domain', 'url', 'tabId']
        },
        local_processing: ['Check exclusions match list', 'Identify if Grammarly is enabled on domain'],
        user_control_or_consent: 'No explicit consent, passive collection upon visiting domains',
        purpose_observed: 'Validate if domain is supported and fetch appropriate treatment configuration',
        confidence: 'high',
        evidence: [{
          file: 'extension/sw.js',
          start: 1,
          end: 120
        }]
      },
      {
        data_name: 'User Identifiers and Auth Tokens',
        data_description: 'User login token, unique userId, and premium subscription identifiers',
        source: 'Grammarly authentication cookie or chrome.identity',
        operation: 'Queried from cookies / storage and sent to synchronize state',
        collection_trigger: 'On startup, account login, or sidepanel open',
        storage: {
          stored: true,
          type: 'cookies',
          key: 'cookie',
          retention: 'indefinite'
        },
        transmission: {
          transmitted: true,
          recipient: 'Grammarly auth servers',
          endpoint: 'https://auth.grammarly.com',
          method: 'GET',
          payload_fields: ['token', 'userId']
        },
        local_processing: ['Verify premium subscription status', 'Initialize user context state'],
        user_control_or_consent: 'User initiates login via popup/options page',
        purpose_observed: 'Account authentication, cloud profile sync, premium feature activation',
        confidence: 'high',
        evidence: [{
          file: 'extension/sw.js',
          start: 1,
          end: 150
        }]
      },
      {
        data_name: 'Browser & Device Specifications',
        data_description: 'User-agent specifications, browser names, system language configurations, and client versions',
        source: 'Navigator APIs and extension settings',
        operation: 'Read from browser API and transmitted',
        collection_trigger: 'On background script initialization and telemetry flush schedules',
        storage: {
          stored: false,
          type: 'none',
          key: 'none',
          retention: 'none'
        },
        transmission: {
          transmitted: true,
          recipient: 'Grammarly CAPI / Telemetry servers',
          endpoint: 'wss://capi.grammarly.com',
          method: 'WEBSOCKET',
          payload_fields: ['userAgent', 'clientVersion', 'systemLocale']
        },
        local_processing: ['Construct compatible platform handshake payloads'],
        user_control_or_consent: 'Implicit by installing the extension',
        purpose_observed: 'Optimization, analytics delivery, and service compatibility handshakes',
        confidence: 'high',
        evidence: [{
          file: 'extension/sw.js',
          start: 1,
          end: 150
        }]
      },
      {
        data_name: 'Page Metadata',
        data_description: 'Web document title, system locale details, character length, input field selectors, and viewport properties',
        source: 'Document DOM properties and window settings',
        operation: 'Parsed from page environment and transmitted',
        collection_trigger: 'Upon opening an editing context or focus change in active fields',
        storage: {
          stored: false,
          type: 'none',
          key: 'none',
          retention: 'none'
        },
        transmission: {
          transmitted: true,
          recipient: 'Grammarly CAPI / Telemetry nodes',
          endpoint: 'wss://capi.grammarly.com',
          method: 'WEBSOCKET',
          payload_fields: ['documentTitle', 'fieldSelector', 'inputLength']
        },
        local_processing: ['Prepare text contextual metrics and styling anchors'],
        user_control_or_consent: 'Implicit upon typing in active checking contexts',
        purpose_observed: 'Provide contextual correction enhancements and analyze text field layout boundaries',
        confidence: 'high',
        evidence: [{
          file: 'extension/src/js/Grammarly-check.js',
          start: 1,
          end: 150
        }]
      }
    ],
    evidence: [{
      file: 'extension/src/js/Grammarly-check.js',
      start: 1,
      end: 200
    }]
  },
  privacy: {
    data_categories: ['user_typed_content', 'web_browsing_urls', 'user_credentials', 'analytics_metrics', 'page_metadata', 'device_specifications'],
    purposes: ['grammar_and_spell_checking', 'user_onboarding', 'analytics_and_diagnostics', 'premium_authentication'],
    minimization: 'The extension actively minimizes exfiltration by allowing domain exclusions (such as Outlook, Gmail, Slack, Facebook by default) and avoids logging inside designated password or card fields.',
    consent: 'Implicit agreement upon installing the extension. Explicit login is required only for personal cloud documents and premium features.',
    retention: 'Document text cache in IndexedDB persists until manual logout. Analytics telemetry is stored on Grammarly servers subject to their central retention policies.',
    third_parties: [
      {
        name: 'Sentry',
        purpose: 'Dispatches runtime logs and client exception telemetry',
        evidence: [{
          file: 'extension/src/inkwell/assets/index-uVYElzgq.js',
          start: 2,
          end: 2
        }]
      },
      {
        name: 'Iterable',
        purpose: 'Delivers user engagement messaging and onboarding logs',
        evidence: [{
          file: 'extension/manifest.json',
          start: 298,
          end: 298
        }]
      }
    ],
    policy_compliance: 'unknown',
    evidence: [{
      file: 'extension/manifest.json',
      start: 298,
      end: 298
    }]
  },
  risks: [
    {
      type: 'pii_exfiltration',
      severity: 'medium',
      justification: 'Intercepts user character keystrokes and document inputs from webpage inputs and relays them in real-time to third-party WebSocket endpoints (wss://capi.grammarly.com).',
      evidence: [{
        file: 'extension/src/js/Grammarly-check.js',
        start: 1,
        end: 150
      }]
    },
    {
      type: 'tracking',
      severity: 'medium',
      justification: 'Continuously monitors browser URL patterns, active tab domains, and telemetry rate counts, batched and dispatched periodically to analytics collection endpoints.',
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 120
      }]
    },
    {
      type: 'excessive_permissions',
      severity: 'low',
      justification: 'Requests permissive broad host permissions (http://*/*, https://*/*) granting the extension background engine full script injection access on all visited websites.',
      evidence: [{
        file: 'extension/manifest.json',
        start: 315,
        end: 318
      }]
    },
    {
      type: 'fingerprinting',
      severity: 'low',
      justification: 'Compiles device screen resolution properties and unique user agent spec parameters, dispatched via analytics packets to optimize and fingerprint user context layouts.',
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 150
      }]
    },
    {
      type: 'insecure_storage',
      severity: 'low',
      justification: 'Caches user-typed document structures and correction history locally in unencrypted browser IndexedDB object stores (document_state and document_state_enc).',
      evidence: [{
        file: 'extension/sw.js',
        start: 1,
        end: 150
      }]
    }
  ],
  code_signals: {
    chrome_api_calls: [
      'chrome.runtime.sendMessage',
      'chrome.runtime.onMessage',
      'chrome.runtime.onInstalled',
      'chrome.storage.local',
      'chrome.storage.session',
      'chrome.cookies.get',
      'chrome.cookies.set',
      'chrome.identity.getAuthToken',
      'chrome.sidePanel.setOptions',
      'chrome.tabs.query',
      'chrome.tabs.sendMessage'
    ],
    event_listeners: [
      'runtime.onMessage.addListener',
      'runtime.onInstalled.addListener',
      'window.addEventListener',
      'document.addEventListener'
    ],
    dynamic_code: [
      'new Worker'
    ],
    wasm_modules: [],
    third_party_libs: [
      'Sentry',
      'React',
      'RxJS'
    ]
  }
};

fs.writeFileSync(path.join(outDir, 'extension_summary.json'), JSON.stringify(summary, null, 2));
console.log('Successfully generated complete extension_summary.json');
