const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3_5_flash');
const extDir = path.join(__dirname, 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8'));

// 1. Build Metadata
const metadata = {
  name: manifest.name,
  version: manifest.version,
  manifest_version: manifest.manifest_version,
  description: manifest.description || '',
  evidence: [
    { file: 'extension/manifest.json', start: 1, end: 365 }
  ]
};

// 2. Build Permissions
const permissions = {
  api_permissions: manifest.permissions || [],
  host_permissions: manifest.host_permissions || [],
  optional_permissions: manifest.optional_permissions || [],
  evidence: [
    { file: 'extension/manifest.json', start: 315, end: 330 },
    { file: 'extension/manifest.json', start: 357, end: 360 }
  ]
};

// 3. Build Components
const components = {
  background: {
    files: [manifest.background && manifest.background.service_worker || 'sw.js', 'src/js/Grammarly-bg.js'],
    apis: [
      'chrome.runtime.onConnect',
      'chrome.runtime.onMessage',
      'chrome.runtime.sendMessage',
      'chrome.cookies.set',
      'chrome.cookies.remove',
      'chrome.storage.local',
      'chrome.tabs.sendMessage'
    ],
    listeners: ['runtime.onConnect.addListener', 'runtime.onMessage.addListener'],
    evidence: [
      { file: 'extension/manifest.json', start: 9, end: 11 },
      { file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }
    ]
  },
  content_scripts: [
    {
      files: ['src/js/Grammarly-check.styles.js', 'src/js/Grammarly-check.js'],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.getURL', 'chrome.storage.managed.get'],
      listeners: ['window.addEventListener', 'document.addEventListener'],
      evidence: [{ file: 'extension/manifest.json', start: 12, end: 123 }]
    },
    {
      files: ['src/js/Grammarly.styles.js', 'src/js/Grammarly.js'],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.getURL', 'chrome.storage.managed.get'],
      listeners: ['window.addEventListener', 'document.addEventListener'],
      evidence: [{ file: 'extension/manifest.json', start: 124, end: 247 }]
    },
    {
      files: ['src/js/Grammarly-gDocs.styles.js', 'src/js/Grammarly-gDocs.js'],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.getURL', 'chrome.storage.managed.get'],
      listeners: ['window.addEventListener', 'document.addEventListener'],
      evidence: [{ file: 'extension/manifest.json', start: 248, end: 261 }]
    },
    {
      files: ['src/js/Grammarly-gDocsEarlyInjector.js'],
      apis: ['chrome.runtime.id', 'chrome.runtime.getURL'],
      listeners: ['window.addEventListener'],
      evidence: [{ file: 'extension/manifest.json', start: 262, end: 271 }]
    },
    {
      files: ['src/js/Grammarly-gDocsIframeCs.js'],
      apis: ['chrome.runtime.id', 'chrome.tabs.sendMessage'],
      listeners: ['window.addEventListener'],
      evidence: [{ file: 'extension/manifest.json', start: 272, end: 285 }]
    },
    {
      files: ['src/js/Grammarly-overleafStartContentScript.js'],
      apis: ['chrome.runtime.getURL', 'chrome.runtime.id'],
      listeners: [],
      evidence: [{ file: 'extension/manifest.json', start: 286, end: 295 }]
    }
  ],
  injected_scripts: [],
  ui: [
    {
      files: ['src/popup.html', 'src/js/Grammarly-popup.js'],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.getURL', 'chrome.action', 'chrome.notifications'],
      listeners: ['click'],
      evidence: [{ file: 'extension/manifest.json', start: 4, end: 8 }]
    },
    {
      files: ['src/sidePanel.html', 'src/js/Grammarly-sidePanel.js'],
      apis: ['chrome.runtime.sendMessage', 'chrome.runtime.getURL', 'chrome.sidePanel', 'chrome.management.uninstallSelf'],
      listeners: ['click'],
      evidence: [{ file: 'extension/manifest.json', start: 306, end: 308 }]
    }
  ],
  web_accessible_resources: manifest.web_accessible_resources ? manifest.web_accessible_resources.map(r => r.resources).flat() : []
};

// 4. Build Network Endpoints
const endpoints = [
  {
    url: 'https://config.extension.grammarly.com/dynamicConfig.json',
    purpose: 'Retrieve remote runtime configuration overrides and feature flags.',
    methods: ['GET'],
    headers: [],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://config.extension.grammarly.com/browserplugin/config.json',
    purpose: 'Sync browser plugin features and heuristic site checker config.',
    methods: ['GET'],
    headers: [],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://f-log-extension.grammarly.io',
    purpose: 'Collect background service worker and content script crash reports/logs.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://extension.femetrics.grammarly.io/batch/import',
    purpose: 'Import batch event performance logs and extension-specific metrics.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://gateway.grammarly.com',
    purpose: 'Gateway proxy API routing for grammar analysis, spell checking, and suggestions.',
    methods: ['POST'],
    headers: ['Authorization', 'Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://auth.grammarly.com/v4/api/oauth2/authorize',
    purpose: 'OAuth2 web browser SSO page redirect.',
    methods: ['GET'],
    headers: [],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://auth.grammarly.com/v4/api/oauth2/token',
    purpose: 'Exchange authorization codes and refresh keys for new access tokens.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://auth.grammarly.com/v4/api/userinfo',
    purpose: 'Retrieve authenticated profile user metadata and subscription tier status.',
    methods: ['GET'],
    headers: ['Authorization'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://capi.grammarly.com',
    purpose: 'Real-time sentence spell checking, grammar scoring, and correction socket engine.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly.js', start: 2, end: 2 }]
  },
  {
    url: 'https://dox.grammarly.com',
    purpose: 'Alternative document upload and checking core interface.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly.js', start: 2, end: 2 }]
  },
  {
    url: 'https://gnar.grammarly.com',
    purpose: 'High-frequency telemetry logging of user actions and behavioral tracks.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    url: 'https://assistant.femetrics.grammarly.io',
    purpose: 'Telemetry specific to sidepanel modern assistant panel actions.',
    methods: ['POST'],
    headers: ['Content-Type'],
    evidence: [{ file: 'extension/src/js/Grammarly-sidePanel.js', start: 2, end: 2 }]
  }
];

// 5. Build Messaging Channels
const channels = [
  {
    name: 'CODE_SPLITTING_INJECT',
    direction: 'background->content',
    payload_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', const: 'CODE_SPLITTING_INJECT' },
        file: { type: 'string' }
      },
      required: ['type', 'file']
    },
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 84890, end: 84890 }]
  },
  {
    name: 'message:to-priv',
    direction: 'content->background',
    payload_schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        content: { type: 'object' },
        callid: { type: 'string' }
      },
      required: ['type', 'content', 'callid']
    },
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 47661, end: 47661 }]
  },
  {
    name: 'side-panel-close-status',
    direction: 'ui->background',
    payload_schema: {
      type: 'object',
      properties: {
        type: { type: 'string' }
      }
    },
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 47661, end: 47661 }]
  },
  {
    name: 'message-bus-port',
    direction: 'other',
    payload_schema: {},
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 47661, end: 47661 }]
  }
];

// 6. Build Storage Keys
const storageKeys = [
  {
    key: 'gdocs_peak_collabs_dismissed',
    type: 'local',
    purpose: 'Caches whether a user dismissed collaboration popups in Google Docs.',
    retention: 'indefinite',
    evidence: [{ file: 'extension/src/js/Grammarly.js', start: 2, end: 2 }]
  },
  {
    key: 'userState',
    type: 'local',
    purpose: 'Persists user session login token, preferences, and authentication keys.',
    retention: 'session-or-logout',
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  }
];

// 7. Build Core Workflows
const workflows = [
  {
    name: 'Installation & Onboarding',
    triggers: ['chrome.runtime.onInstalled', 'startup'],
    steps: [
      'Sets up default client config values like dialect to US english.',
      'Saves the uninstall URL using chrome.runtime.setUninstallURL pointing to Grammarly feedback portal.',
      'Spawns a new welcome page and login tab.'
    ],
    apis: ['chrome.runtime.setUninstallURL', 'chrome.tabs.create'],
    messages: [],
    endpoints: [],
    storage_keys: ['userState'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 84898, end: 84898 }]
  },
  {
    name: 'Supported Site Check & Config Sync',
    triggers: ['background worker initialization', 'navigation updated'],
    steps: [
      'Calls config endpoints config.extension.grammarly.com to sync browser plugin overrides.',
      'Resolves tab URL to see if it is a blacklisted domain.',
      'Queries active heuristics to decide if SidePanel triggers are enabled.'
    ],
    apis: ['chrome.tabs.onUpdated', 'chrome.runtime.getManifest'],
    messages: ['CODE_SPLITTING_INJECT'],
    endpoints: [
      'https://config.extension.grammarly.com/dynamicConfig.json',
      'https://config.extension.grammarly.com/browserplugin/config.json'
    ],
    storage_keys: [],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 84890, end: 85011 }]
  },
  {
    name: 'Real-time Text Check & Correction',
    triggers: ['user keystroke event', 'DOM mutation'],
    steps: [
      'Content scripts inject MutationObservers and keydown hooks into typing areas.',
      'Extracts sentence strings and splits text into deltas.',
      'Transmits deltas to background using port message:to-priv.',
      'Background worker dispatches correction payload to capi.grammarly.com sockets.',
      'Paints suggestions overlays, floating assistant triggers, and underlines in the document.'
    ],
    apis: [],
    messages: ['message:to-priv'],
    endpoints: ['https://capi.grammarly.com', 'https://dox.grammarly.com'],
    storage_keys: [],
    evidence: [
      { file: 'extension/src/js/Grammarly.js', start: 2, end: 2 },
      { file: 'extension/src/js/Grammarly-bg.js', start: 47808, end: 47808 }
    ]
  },
  {
    name: 'Authentication and Session Integration',
    triggers: ['click login', 'initialization checks'],
    steps: [
      'Popup redirects SSO login tab to auth.grammarly.com/v4/api/oauth2/authorize.',
      'Exchanges auth code at token endpoints for JWT access and refresh tokens.',
      'Checks profile userInfo and stores tokens persistently in LocalStorage and cookies.'
    ],
    apis: ['chrome.storage.local', 'chrome.identity'],
    messages: [],
    endpoints: [
      'https://auth.grammarly.com/v4/api/oauth2/authorize',
      'https://auth.grammarly.com/v4/api/oauth2/token',
      'https://auth.grammarly.com/v4/api/userinfo'
    ],
    storage_keys: ['userState'],
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
  },
  {
    name: 'Product Telemetry Event Reporting',
    triggers: ['accept suggest', 'hover suggestions', 'sidepanel action'],
    steps: [
      'Local hooks capture telemetry event definitions and timestamp metadata.',
      'Buffers logs in memory to minimize packet count.',
      'Transmits serialized JSON lists to tracking systems gnar.grammarly.com and femetrics.grammarly.io.'
    ],
    apis: [],
    messages: [],
    endpoints: ['https://gnar.grammarly.com', 'https://extension.femetrics.grammarly.io/batch/import'],
    storage_keys: [],
    evidence: [
      { file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 },
      { file: 'extension/src/js/Grammarly-sidePanel.js', start: 2, end: 2 }
    ]
  },
  {
    name: 'Global Assistant SidePanel Integration',
    triggers: ['open side panel', 'trigger rewrite shortcut'],
    steps: [
      'Initializes side panel DOM inside sidePanel.html using modern UI styles.',
      'Downloads theme overlays and custom illustrations from assets.grammarly.com.',
      'Dispatches prompt commands to background worker to run AI generative rewrites.'
    ],
    apis: ['chrome.sidePanel.open', 'chrome.sidePanel.setOptions'],
    messages: ['side-panel-close-status'],
    endpoints: ['https://assistant.femetrics.grammarly.io'],
    storage_keys: [],
    evidence: [
      { file: 'extension/src/js/Grammarly-sidePanel.js', start: 2, end: 2 },
      { file: 'extension/src/js/Grammarly-check.js', start: 2, end: 2 }
    ]
  }
];

// 8. Build Observed Privacy Data
const observed_privacy_data = {
  items: [
    {
      data_name: 'Document Content',
      data_description: 'Full text body, corrections, and edit sessions of documents checked by the user are transmitted to Grammarly APIs for real-time spelling, grammar, and AI assistance.',
      source: 'User typing areas / DOM content scripts',
      operation: 'transmission',
      collection_trigger: 'User typing or document edit event',
      storage: {
        stored: true,
        type: 'local',
        key: 'gdocs_peak_collabs_dismissed',
        retention: 'cached locally until session resets'
      },
      transmission: {
        transmitted: true,
        recipient: 'Grammarly check servers',
        endpoint: 'https://capi.grammarly.com',
        method: 'POST',
        payload_fields: ['text', 'context', 'documentId', 'revision']
      },
      local_processing: ['sentence segmenting', 'delta compression', 'local spell-check verification'],
      user_control_or_consent: 'Controlled by extension toggle (enabled/disabled) and user account terms.',
      purpose_observed: 'Provide grammar correction and AI-assisted text rewrite.',
      confidence: 'high',
      evidence: [{ file: 'extension/src/js/Grammarly.js', start: 2, end: 2 }],
      notes: 'Required core capability of the writing assistant.'
    },
    {
      data_name: 'Authentication Tokens',
      data_description: 'User access tokens, cookie data, and credentials used to authorize API calls to premium/personal features.',
      source: 'Cookies / Web App exchange',
      operation: 'storage_and_transmission',
      collection_trigger: 'User login or initialization',
      storage: {
        stored: true,
        type: 'cookies',
        key: 'userState',
        retention: 'indefinite or until logout'
      },
      transmission: {
        transmitted: true,
        recipient: 'Grammarly Auth core',
        endpoint: 'https://auth.grammarly.com/v4/api/oauth2/token',
        method: 'POST',
        payload_fields: ['client_id', 'grant_type', 'code', 'refresh_token']
      },
      local_processing: ['access token validation', 'cookie lookup'],
      user_control_or_consent: 'Explicit user login action',
      purpose_observed: 'Account synchronization and premium feature activation.',
      confidence: 'high',
      evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }],
      notes: 'Mandatory for syncing account status and customized dictionary.'
    },
    {
      data_name: 'User Telemetry & Interaction Logs',
      data_description: 'Anonymized or pseudonymous behavioral events, clicks, hover times, writing sessions, and error logs are collected to monitor product usage.',
      source: 'Content scripts event listeners',
      operation: 'transmission',
      collection_trigger: 'User interface interactions (clicks, suggestions accepted)',
      storage: {
        stored: false,
        type: 'none',
        key: 'none',
        retention: 'none'
      },
      transmission: {
        transmitted: true,
        recipient: 'Grammarly Metrics ingestion',
        endpoint: 'https://gnar.grammarly.com',
        method: 'POST',
        payload_fields: ['action', 'eventName', 'objectId', 'installId', 'distinctId']
      },
      local_processing: ['event buffering and batching'],
      user_control_or_consent: 'Implicit tracking (standard telemetry rules)',
      purpose_observed: 'Analytics and application performance monitoring.',
      confidence: 'high',
      evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }],
      notes: 'Runs continuously in the background.'
    },
    {
      data_name: 'Extension Settings',
      data_description: 'Configurable user preferences such as writing language, dictionary words, and active/inactive sites.',
      source: 'UI panel / Options',
      operation: 'storage',
      collection_trigger: 'Settings change or successful auth',
      storage: {
        stored: true,
        type: 'local',
        key: 'userState',
        retention: 'indefinite'
      },
      transmission: {
        transmitted: false,
        recipient: 'none',
        endpoint: 'none',
        method: 'none',
        payload_fields: []
      },
      local_processing: ['config parsing'],
      user_control_or_consent: 'User interaction in options/popup panel',
      purpose_observed: 'Customizing writing assistant behavior per-user.',
      confidence: 'high',
      evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
    }
  ],
  evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
};

// 9. Build Privacy Posture
const privacy = {
  data_categories: [
    'Document Content',
    'Authentication Credentials',
    'User Telemetry & Behavior Event Logs',
    'Extension Settings'
  ],
  purposes: [
    'Grammar & Spell checking',
    'SSO Account synchronization',
    'Product telemetry & tracking',
    'Side panel AI interactions'
  ],
  minimization: 'High exposure. The extension has host permissions to read and alter text across <all_urls>. Although necessary for checking spelling, it opens exposure to typing in sensitive fields, unless sites match exclusion patterns.',
  consent: 'Implicit user consent. Suggestion check runs by default on enabling. Custom pausing can be configured domain-by-domain.',
  retention: 'Access keys are stored indefinitely inside LocalStorage or cookies until logout. Checking text caches are stored server-side under user accounts.',
  third_parties: [
    {
      name: 'api.iterable.com',
      purpose: 'Coordinates extension notification messages and product email alerts.',
      evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 2, end: 2 }]
    }
  ],
  policy_compliance: 'Fully MV3-compliant, but broad permissions pose data exposure concerns under GDPR / CCPA if checking is enabled on highly confidential business or healthcare pages.',
  evidence: [{ file: 'extension/manifest.json', start: 297, end: 299 }]
};

// 10. Build Risks
const risks = [
  {
    type: 'tracking',
    severity: 'medium',
    justification: 'The extension uses background trackers (gnar.grammarly.com and femetrics.grammarly.io) to transmit user metrics, acceptance events, and performance diagnostics linked to distinct client identifiers without explicit user consent.',
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 85019, end: 85025 }]
  },
  {
    type: 'remote_code',
    severity: 'medium',
    justification: 'Loads experimental parameters, treatment gates, and configuration files dynamically from remote config servers (config.extension.grammarly.com) at runtime, bypasses static Web Store package reviews.',
    evidence: [{ file: 'extension/src/js/Grammarly-bg.js', start: 84890, end: 84890 }]
  },
  {
    type: 'pii_exfiltration',
    severity: 'medium',
    justification: 'Content scripts operate with host permissions on <all_urls> and transmit inputted text blocks to remote servers for processing. This presents risks of exfiltrating sensitive PII inputted in non-excluded text inputs.',
    evidence: [{ file: 'extension/manifest.json', start: 315, end: 318 }]
  }
];

// 11. Build Code Signals
const code_signals = {
  chrome_api_calls: [
    'chrome.runtime.getURL',
    'chrome.runtime.id',
    'chrome.runtime.sendMessage',
    'chrome.runtime.onConnect',
    'chrome.runtime.onMessage',
    'chrome.cookies.set',
    'chrome.cookies.remove',
    'chrome.storage.local',
    'chrome.tabs.sendMessage',
    'chrome.sidePanel.open',
    'chrome.sidePanel.setOptions',
    'chrome.action.setIcon',
    'chrome.notifications.create',
    'chrome.identity.getAuthToken',
    'chrome.management.uninstallSelf'
  ],
  event_listeners: [
    'runtime.onConnect.addListener',
    'runtime.onMessage.addListener',
    'tabs.onUpdated.addListener',
    'tabs.onRemoved.addListener',
    'window.addEventListener',
    'document.addEventListener',
    'permissions.onAdded.addListener'
  ],
  dynamic_code: ['eval', 'new Function', 'importScripts', 'atob'],
  wasm_modules: [],
  third_party_libs: ['webpack', 'react', 'rxjs', 'js-beautify']
};

const extensionSummary = {
  metadata,
  permissions,
  components,
  network: { endpoints },
  messaging: { channels },
  storage: { keys: storageKeys },
  workflows,
  observed_privacy_data,
  privacy,
  risks,
  code_signals
};

fs.writeFileSync(path.join(OUT_DIR, 'extension_summary.json'), JSON.stringify(extensionSummary, null, 2), 'utf8');

// Also copy to privacy_workspace/extension_summary.json
const privWorkspace = path.join(__dirname, 'privacy_workspace');
if (!fs.existsSync(privWorkspace)) {
  fs.mkdirSync(privWorkspace, { recursive: true });
}
fs.writeFileSync(path.join(privWorkspace, 'extension_summary.json'), JSON.stringify(extensionSummary, null, 2), 'utf8');

console.log('Successfully generated extension_summary.json!');
