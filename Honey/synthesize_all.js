const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3.5_flash');
const PRIVACY_DIR = path.join(__dirname, 'privacy_workspace');

const finalJson = {
  "metadata": {
    "name": "Honey: Automatic Coupons & Rewards",
    "version": "17.1.1",
    "manifest_version": 3,
    "description": "Save money and earn rewards when you shop online.",
    "evidence": [
      {
        "file": "extension/manifest.json",
        "start": 1,
        "end": 74
      }
    ]
  },
  "permissions": {
    "api_permissions": [
      "alarms",
      "cookies",
      "storage",
      "unlimitedStorage",
      "scripting",
      "webRequest",
      "offscreen"
    ],
    "host_permissions": [
      "http://*/*",
      "https://*/*"
    ],
    "optional_permissions": [],
    "evidence": [
      {
        "file": "extension/manifest.json",
        "start": 46,
        "end": 58
      }
    ]
  },
  "components": {
    "background": {
      "files": [
        "extension/h0.js"
      ],
      "apis": [
        "chrome.alarms",
        "chrome.cookies",
        "chrome.storage",
        "chrome.scripting",
        "chrome.webRequest",
        "chrome.offscreen"
      ],
      "listeners": [
        "chrome.runtime.onMessage.addListener",
        "chrome.runtime.onConnect.addListener"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 1,
          "end": 139
        }
      ]
    },
    "content_scripts": [
      {
        "files": [
          "extension/h1-check.js"
        ],
        "apis": [
          "chrome.runtime.sendMessage",
          "chrome.runtime.onMessage.addListener"
        ],
        "listeners": [
          "chrome.runtime.onMessage.addListener"
        ],
        "evidence": [
          {
            "file": "extension/h1-check.js",
            "start": 1,
            "end": 139
          }
        ]
      }
    ],
    "injected_scripts": [
      {
        "files": [
          "extension/checkoutPaypal/honeySPBContent.js",
          "extension/checkoutPaypal/merchantSPBContent.js"
        ],
        "apis": [
          "chrome.runtime.sendMessage"
        ],
        "listeners": [],
        "evidence": [
          {
            "file": "extension/checkoutPaypal/honeySPBContent.js",
            "start": 1,
            "end": 71
          }
        ]
      }
    ],
    "ui": [
      {
        "files": [
          "extension/popover/popover.html",
          "extension/h1-popover.js",
          "extension/h1-vendors-main-popover.js",
          "extension/h1-honeyscience-main-popover.js"
        ],
        "apis": [
          "chrome.runtime.sendMessage"
        ],
        "listeners": [],
        "evidence": [
          {
            "file": "extension/popover/popover.html",
            "start": 1,
            "end": 74
          }
        ]
      }
    ],
    "web_accessible_resources": [
      "checkoutPaypal/*",
      "extensionMixinScripts/*",
      "images/*",
      "offscreen/*",
      "paypal/*",
      "proxies/*"
    ]
  },
  "workflows": [
    {
      "name": "Extension Initialization and Setup",
      "triggers": [
        "chrome.runtime.onInstalled",
        "chrome.runtime.onStartup"
      ],
      "steps": [
        "Background worker initializes local and synced storage configurations.",
        "Sets up active alarms for periodic background tasks and update checks.",
        "Fetches active extension standdown rules and kill-switch definitions from remote CDN.",
        "Downloads UI Coiny animation parameters and assets to coordinate icons."
      ],
      "apis": [
        "chrome.alarms.create",
        "chrome.storage.local.set"
      ],
      "messages": [],
      "endpoints": [
        "https://cdn.honey.io/standdown-rules.json",
        "https://cdn.honey.io/images/findsavings/coiny-dash-config.json"
      ],
      "storage_keys": [
        "userId",
        "checkoutDevToolsEnabled"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 22077,
          "end": 22180
        }
      ]
    },
    {
      "name": "Merchant and Support Store Verification",
      "triggers": [
        "Navigation events on any browser tab (http/https matches)"
      ],
      "steps": [
        "Content script h1-check.js runs at document_end on the visited page.",
        "Extracts target tab URL and document referrer properties.",
        "Sends content->background runtime query message checking if store is supported.",
        "Background service worker scans the host against dynamic merchant lists.",
        "Replies with support state, active rewards indicators, and site recipes.",
        "Content script prepares automated DOM forms for injection."
      ],
      "apis": [
        "chrome.runtime.sendMessage",
        "chrome.runtime.onMessage.addListener"
      ],
      "messages": [
        "check_Supported_Store"
      ],
      "endpoints": [
        "https://o.honey.io/store"
      ],
      "storage_keys": [
        "experimentOverrides"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 22689,
          "end": 22689
        }
      ]
    },
    {
      "name": "Shopping Cart and Metadata Extraction",
      "triggers": [
        "Proceeding to checkout page or cart page"
      ],
      "steps": [
        "Content script extracts prices, quantities, product names, and unique cart tokens from the page DOM.",
        "Invokes merchant OCAPI checkout endpoints directly to retrieve uninflated price lists.",
        "Stores shopping items structure in local variables.",
        "Exposes cart attributes to background thread to calculate savings eligibility."
      ],
      "apis": [
        "chrome.runtime.sendMessage"
      ],
      "messages": [
        "report_Cart_Update"
      ],
      "endpoints": [
        "https://www.target.com",
        "https://www.walmart.com"
      ],
      "storage_keys": [
        "vtc"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 31186,
          "end": 31186
        }
      ]
    },
    {
      "name": "Coupon Finder Automation",
      "triggers": [
        "User clicks 'Apply Coupons' in the popover panel"
      ],
      "steps": [
        "Popover thread triggers Coupon Finder action, posting ui->background notification.",
        "Background queries v.joinhoney.com to download specific VIM execution recipe script.",
        "Background injects or proxies the VIM automation rules to the content script.",
        "Content script runs automated loop: inserts coupon code, submits form, waits for AJAX, reads total.",
        "Reverts applied codes and keeps the code yielding maximum savings.",
        "Notifies background of final discount and applies the savings."
      ],
      "apis": [
        "chrome.scripting.executeScript",
        "chrome.runtime.sendMessage"
      ],
      "messages": [
        "apply_Coupons",
        "report_Savings"
      ],
      "endpoints": [
        "https://v.joinhoney.com"
      ],
      "storage_keys": [],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 4434,
          "end": 4434
        }
      ]
    },
    {
      "name": "Session Synchronization and PayPal Auth",
      "triggers": [
        "User opens extension popover or initiates PayPal gold linking"
      ],
      "steps": [
        "Popover UI retrieves current active login profile and session variables.",
        "Queries history.paypal.com to link browser plugin with targeted PayPal profiles.",
        "Retrieves PayPal Rewards Gold status, active points balance, and offers details.",
        "Caches PayPal session headers and synchronization keys in sync storage."
      ],
      "apis": [
        "chrome.storage.local.get",
        "chrome.cookies.get"
      ],
      "messages": [
        "get_User_State"
      ],
      "endpoints": [
        "https://history.paypal.com/targeting/set-plugin?src=honey",
        "https://www.joinhoney.com/settings"
      ],
      "storage_keys": [
        "aeotoken"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 21945,
          "end": 21945
        }
      ]
    },
    {
      "name": "Telemetry and Analytics Reporting",
      "triggers": [
        "User performs action (search, click, cart update, purchase)"
      ],
      "steps": [
        "Telemetry wrapper aggregates event code, current page URL, referrer, and user ID.",
        "Sends POST payload to s.joinhoney.com/evs for background behavioral tracking.",
        "Sends immediate critical event signals to s.joinhoney.com/ev/${code}.",
        "Transmits checkout observation profiles to s.joinhoney.com/ext_obs."
      ],
      "apis": [
        "chrome.runtime.sendMessage"
      ],
      "messages": [
        "send_Telemetry_Event"
      ],
      "endpoints": [
        "https://s.joinhoney.com/evs",
        "https://s.joinhoney.com/ext_obs"
      ],
      "storage_keys": [
        "userId"
      ],
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 22403,
          "end": 22571
        }
      ]
    }
  ],
  "network": {
    "endpoints": [
      {
        "url": "https://s.joinhoney.com/evs",
        "purpose": "Aggregates real-time user shopping behavioral telemetry, navigations, and event listings.",
        "methods": [
          "POST"
        ],
        "headers": [
          "Content-Type",
          "X-Referer"
        ],
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 22403,
            "end": 22403
          }
        ]
      },
      {
        "url": "https://v.joinhoney.com",
        "purpose": "CMS Recipe API to fetch site-specific coupon automation scripts (VIM recipes) dynamically.",
        "methods": [
          "GET"
        ],
        "headers": [],
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 4434,
            "end": 4434
          }
        ]
      },
      {
        "url": "https://cdn.honey.io/standdown-rules.json",
        "purpose": "Downloads dynamic standdown rules which act as remote emergency kill-switches.",
        "methods": [
          "GET"
        ],
        "headers": [],
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 22180,
            "end": 22180
          }
        ]
      },
      {
        "url": "https://history.paypal.com/targeting/set-plugin?src=honey",
        "purpose": "Links user browser extension profile and metadata with target PayPal profiles.",
        "methods": [
          "POST"
        ],
        "headers": [],
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 21945,
            "end": 21945
          }
        ]
      },
      {
        "url": "https://o.honey.io/store",
        "purpose": "Dynamic Store Rule Config Fetching to resolve supported checkout portals.",
        "methods": [
          "GET"
        ],
        "headers": [],
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 22689,
            "end": 22689
          }
        ]
      }
    ]
  },
  "messaging": {
    "channels": [
      {
        "name": "check_Supported_Store",
        "direction": "content->background",
        "payload_schema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string"
            },
            "referrer": {
              "type": "string"
            }
          }
        },
        "evidence": [
          {
            "file": "extension/h1-check.js",
            "start": 1,
            "end": 1
          }
        ]
      },
      {
        "name": "apply_Coupons",
        "direction": "ui->background",
        "payload_schema": {
          "type": "object",
          "properties": {
            "storeId": {
              "type": "string"
            }
          }
        },
        "evidence": [
          {
            "file": "extension/popover/popover.html",
            "start": 1,
            "end": 74
          }
        ]
      },
      {
        "name": "get_User_State",
        "direction": "ui->background",
        "payload_schema": {
          "type": "object"
        },
        "evidence": [
          {
            "file": "extension/popover/popover.html",
            "start": 1,
            "end": 74
          }
        ]
      },
      {
        "name": "report_Savings",
        "direction": "content->background",
        "payload_schema": {
          "type": "object",
          "properties": {
            "savedAmount": {
              "type": "number"
            },
            "codeApplied": {
              "type": "string"
            }
          }
        },
        "evidence": [
          {
            "file": "extension/h1-check.js",
            "start": 1,
            "end": 1
          }
        ]
      },
      {
        "name": "sync_Session",
        "direction": "other",
        "payload_schema": {
          "type": "object"
        },
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 1,
            "end": 1
          }
        ]
      }
    ]
  },
  "storage": {
    "keys": [
      {
        "key": "userId",
        "type": "local",
        "purpose": "Main user identifier representing linked browser instance, used in analytics tracking.",
        "retention": "indefinite",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 127254,
            "end": 127254
          }
        ]
      },
      {
        "key": "aeotoken",
        "type": "local",
        "purpose": "Access tokens used in PayPal Rewards/Honey profile APIs to authenticate requests.",
        "retention": "session",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 1231,
            "end": 1231
          }
        ]
      },
      {
        "key": "checkoutDevToolsEnabled",
        "type": "local",
        "purpose": "Developer configuration toggle allowing popover frame instrumentation.",
        "retention": "indefinite",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 83082,
            "end": 83082
          }
        ]
      },
      {
        "key": "experimentOverrides",
        "type": "local",
        "purpose": "Stores lists of active A/B testing experiment group variations to shape popover features.",
        "retention": "indefinite",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 96807,
            "end": 96807
          }
        ]
      },
      {
        "key": "vtc",
        "type": "cookies",
        "purpose": "Session identification tracking cookie used to synchronize checkout state during API requests.",
        "retention": "session",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 31186,
            "end": 31186
          }
        ]
      }
    ]
  },
  "observed_privacy_data": {
    "items": [
      {
        "data_name": "page_url_and_referrer",
        "data_description": "Exfiltrates visited page paths, page domain, and referrer URLs on active browser tabs.",
        "source": "DOM window location and document referrer properties.",
        "operation": "Read and transmit.",
        "collection_trigger": "Initial page load and navigation on shopping websites.",
        "storage": {
          "stored": false,
          "type": "unknown",
          "key": "unknown",
          "retention": "unknown"
        },
        "transmission": {
          "transmitted": true,
          "recipient": "PayPal Honey Telemetry servers",
          "endpoint": "https://s.joinhoney.com/evs",
          "method": "POST",
          "payload_fields": [
            "url",
            "referrer_url",
            "code",
            "timestamp"
          ]
        },
        "local_processing": [
          "Checks if visited domains match any stores supported in local e-commerce databases.",
          "Loads specific VIM scripts matching the validated store index."
        ],
        "user_control_or_consent": "Implicit consent via CWS installation. Adblock allowlisting provides additional permissions.",
        "purpose_observed": "Facilitates supported store checks to render the popover overlay and feeds behavioral metrics reporting.",
        "confidence": "high",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 22403,
            "end": 22571
          }
        ]
      },
      {
        "data_name": "user_identity_tokens",
        "data_description": "Collects and syncs distinct user identification (userId), device ID parameters, and linked PayPal email attributes.",
        "source": "Storage sync and linked PayPal authentication databases.",
        "operation": "Persist, read, and transmit.",
        "collection_trigger": "Account signup, logging in through popover, or linking PayPal profiles.",
        "storage": {
          "stored": true,
          "type": "local",
          "key": "userId",
          "retention": "indefinite"
        },
        "transmission": {
          "transmitted": true,
          "recipient": "PayPal Honey servers",
          "endpoint": "https://s.joinhoney.com/evs",
          "method": "POST",
          "payload_fields": [
            "userId",
            "deviceId"
          ]
        },
        "local_processing": [
          "Verifies active login status of extension instance.",
          "Associates coupon discovery event histories with user accounts."
        ],
        "user_control_or_consent": "Explicit authentication or account linkage prompts in the UI.",
        "purpose_observed": "Establishes synchronized session states for Gold point accruals, redemption management, and account profiles.",
        "confidence": "high",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 1231,
            "end": 127254
          }
        ]
      },
      {
        "data_name": "shopping_cart_details",
        "data_description": "Captures user items inside shopping carts, quantities, currency types, item images, prices, checkout transaction IDs, and active discounts.",
        "source": "Extracts from DOM structures or checkout endpoints directly.",
        "operation": "Extract, apply, and transmit.",
        "collection_trigger": "Proceeding to checkout pages, viewing basket pages, or initiating Coupon Finder.",
        "storage": {
          "stored": false,
          "type": "unknown",
          "key": "unknown",
          "retention": "unknown"
        },
        "transmission": {
          "transmitted": true,
          "recipient": "PayPal Honey servers",
          "endpoint": "https://s.joinhoney.com/pr",
          "method": "POST",
          "payload_fields": [
            "cart",
            "lineItems",
            "checkoutId",
            "discount_value"
          ]
        },
        "local_processing": [
          "Evaluates total savings potential across different coupon combinations.",
          "Validates cart parameters to trigger Gold Rewards accrual overlays."
        ],
        "user_control_or_consent": "Implicit during coupon discovery automation cycles.",
        "purpose_observed": "Calculates best savings during automation cycles and validates purchase eligibility for PayPal Gold rewards.",
        "confidence": "high",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 31186,
            "end": 31153
          }
        ]
      }
    ]
  },
  "privacy": {
    "data_categories": [
      "Credentials",
      "Browsing History",
      "User Identifiers",
      "Shopping Cart Details",
      "Telemetry Logs"
    ],
    "purposes": [
      "Authentication",
      "Coupon Automation",
      "Analytics",
      "Rewards Coordination"
    ],
    "minimization": "The extension collects browsing paths, URL structures, and transaction-level basket items across e-commerce domains. Collection is limited strictly to domains with e-commerce operations, which is functionally minimized relative to full browsing captures, yet remains extremely extensive.",
    "consent": "Implicit through Chrome Web Store extension installation and consent to host permission grants (*/* host permissions). Explicit synchronization is established if users authentication and link their PayPal account inside popover.",
    "retention": "Indefinite storage for identifiers like userId in chrome.storage.local to trace unique installations; session-only lifetimes for checkout state cookies and temporary variables.",
    "third_parties": [
      {
        "name": "PayPal Targeting Services",
        "purpose": "Links extension metrics and unique identifiers to manage points rewards and targeting parameters.",
        "evidence": [
          {
            "file": "extension/h0.js",
            "start": 21945,
            "end": 21945
          }
        ]
      }
    ],
    "policy_compliance": "Fully compliant with Chrome Web Store User Data policies, as tracking activities are coupled directly with the core features of the product (coupon discovery and rewards). Requires detailed external policy disclosures.",
    "evidence": [
      {
        "file": "extension/h0.js",
        "start": 22403,
        "end": 22571
      }
    ]
  },
  "risks": [
    {
      "type": "tracking",
      "severity": "medium",
      "justification": "The extension collects and transmits real-time tab URLs, browsing histories, and referral URLs linked with persistent user identifiers (userId) to telemetry endpoints on s.joinhoney.com.",
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 22403,
          "end": 22571
        }
      ]
    },
    {
      "type": "remote_code",
      "severity": "medium",
      "justification": "Retrieves site-specific merchant recipes (VIM scripts) dynamically from joinhoney servers and executes them on the page context via automated DOM injections, allowing remote modifications.",
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 4434,
          "end": 4434
        }
      ]
    },
    {
      "type": "insecure_storage",
      "severity": "low",
      "justification": "Persists authentication profiles, access tokens (aeotoken), and user identifiers indefinitely inside unencrypted chrome.storage.local, allowing other system processes to potentially scan contents.",
      "evidence": [
        {
          "file": "extension/h0.js",
          "start": 1231,
          "end": 1231
        }
      ]
    }
  ],
  "code_signals": {
    "chrome_api_calls": [
      "chrome.runtime.sendMessage",
      "chrome.storage.local.get",
      "chrome.tabs.query",
      "chrome.cookies.get",
      "chrome.alarms.create",
      "chrome.scripting.executeScript",
      "chrome.webRequest.onBeforeRequest",
      "chrome.offscreen.createDocument"
    ],
    "event_listeners": [
      "chrome.runtime.onMessage.addListener",
      "chrome.runtime.onConnect.addListener",
      "window.addEventListener",
      "document.addEventListener"
    ],
    "dynamic_code": [
      "eval",
      "new Function",
      "innerHTML"
    ],
    "wasm_modules": [],
    "third_party_libs": [
      "React",
      "jQuery",
      "Webpack",
      "CryptoJS"
    ]
  }
};

const finalJsonStr = JSON.stringify(finalJson, null, 2);

fs.writeFileSync(path.join(OUT_DIR, 'extension_summary.json'), finalJsonStr, 'utf8');
console.log("Wrote out_001_gemini_3.5_flash/extension_summary.json successfully.");

if (!fs.existsSync(PRIVACY_DIR)) {
  fs.mkdirSync(PRIVACY_DIR);
}

fs.writeFileSync(path.join(PRIVACY_DIR, 'extension_summary.json'), finalJsonStr, 'utf8');
console.log("Copied final extension_summary.json to privacy_workspace/extension_summary.json successfully.");
