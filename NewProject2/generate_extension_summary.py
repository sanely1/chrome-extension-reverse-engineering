
import json
import os

# --- Configuration ---
OUT_DIR = "out_001_GPT-4o"
MANIFEST_PATH = "./extension/manifest.json"
PERMISSIONS_REPORT_PATH = os.path.join(OUT_DIR, "permissions_report.json")
OUTLINE_JSONL_PATH = os.path.join(OUT_DIR, "outline.jsonl")
MESSAGES_EN_PATH = "./extension/_locales/en/messages.json"
EXTENSION_SUMMARY_PATH = os.path.join(OUT_DIR, "extension_summary.json")
PRIVACY_WORKSPACE_PATH = "privacy_workspace"
PRIVACY_EXTENSION_SUMMARY_PATH = os.path.join(PRIVACY_WORKSPACE_PATH, "extension_summary.json")

# --- Load Data ---
with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest_data = json.load(f)

with open(PERMISSIONS_REPORT_PATH, 'r', encoding='utf-8') as f:
    permissions_report_data = json.load(f)

with open(OUTLINE_JSONL_PATH, 'r', encoding='utf-8') as f:
    outline_lines = f.readlines()

with open(MESSAGES_EN_PATH, 'r', encoding='utf-8') as f:
    messages_en_data = json.load(f)

# --- Process Outline.jsonl for Aggregation ---
all_chrome_apis = set()
all_event_listeners = set()
all_messages = [] 
all_storage_keys = []
all_endpoints = []
all_dynamic_code = set()
all_wasm_modules = set()
all_obfuscation_hints = set()
all_risks = []

parsed_outline_entries = []
for line in outline_lines:
    if line.strip():
        entry = json.loads(line)
        parsed_outline_entries.append(entry)

        for api in entry['findings']['chrome_apis']:
            all_chrome_apis.add(api)
        for listener in entry['findings']['event_listeners']:
            all_event_listeners.add(listener)
        
        for msg in entry['findings']['messages']:
            if not any(m['name'] == msg['name'] and m['direction'] == msg['direction'] for m in all_messages):
                all_messages.append(msg)
            else:
                existing_msg = next(m for m in all_messages if m['name'] == msg['name'] and m['direction'] == msg['direction'])
                for key in msg.get('payload_keys', []):
                    if key not in existing_msg.get('payload_keys', []):
                        existing_msg.get('payload_keys').append(key)

        for storage_item in entry['findings']['storage']:
            if not any(s['key'] == storage_item['key'] and s['type'] == storage_item['type'] for s in all_storage_keys):
                all_storage_keys.append(storage_item)

        for endpoint in entry['findings']['endpoints']:
            if not any(e['url'] == endpoint['url'] and e['method'] == endpoint['method'] for e in all_endpoints):
                all_endpoints.append(endpoint)

        for dc in entry['findings']['dynamic_code']:
            all_dynamic_code.add(dc)
        for wasm in entry['findings']['wasm']:
            all_wasm_modules.add(wasm)
        for hint in entry['findings']['obfuscation_hints']:
            all_obfuscation_hints.add(hint)
        for risk in entry['findings']['risks']:
            all_risks.append(risk)

# --- Construct Dictionary ---
extension_name_key = manifest_data.get('name', '')
extension_name = messages_en_data.get(extension_name_key[6:-2], {}).get('message', 'unknown') if extension_name_key.startswith('__MSG_') else extension_name_key

extension_description_key = manifest_data.get('description', '')
extension_description = messages_en_data.get(extension_description_key[6:-2], {}).get('message', 'unknown') if extension_description_key.startswith('__MSG_') else extension_description_key

extension_summary = {
    "metadata": {
        "name": extension_name,
        "version": manifest_data.get('version', 'unknown'),
        "manifest_version": manifest_data.get('manifest_version', 'unknown'),
        "description": extension_description,
        "evidence": [{"file": MANIFEST_PATH, "start": 1, "end": 41}]
    },
    "permissions": permissions_report_data,
    "components": {
        "background": {
            "files": ["extension/background.js"],
            "apis": list(set([api for entry in parsed_outline_entries if entry['file'] == "extension/background.js" for api in entry['findings']['chrome_apis']])),
            "listeners": list(set([listener for entry in parsed_outline_entries if entry['file'] == "extension/background.js" for listener in entry['findings']['event_listeners']])),
            "evidence": [{"file": "extension/background.js", "start": 1, "end": 904}]
        },
        "content_scripts": [
            {
                "files": ["extension/content.js"],
                "apis": list(set([api for entry in parsed_outline_entries if entry['file'] == "extension/content.js" for api in entry['findings']['chrome_apis']])),
                "listeners": list(set([listener for entry in parsed_outline_entries if entry['file'] == "extension/content.js" for listener in entry['findings']['event_listeners']])),
                "evidence": [{"file": "extension/content.js", "start": 1, "end": 10986}]
            }
        ],
        "injected_scripts": [
            {
                "files": ["extension/navigation-events.js"],
                "apis": [],
                "listeners": list(set([listener for entry in parsed_outline_entries if entry['file'] == "extension/navigation-events.js" for listener in entry['findings']['event_listeners']])),
                "evidence": [{"file": "extension/navigation-events.js", "start": 1, "end": 24}]
            }
        ],
        "ui": [
            {
                "files": ["extension/popup.js"],
                "apis": [],
                "listeners": [],
                "evidence": [{"file": "extension/popup.js", "start": 1, "end": 38}]
            },
            {
                "files": ["extension/data-control.js"],
                "apis": list(set([api for entry in parsed_outline_entries if entry['file'] == "extension/data-control.js" for api in entry['findings']['chrome_apis']])),
                "listeners": [],
                "evidence": [{"file": "extension/data-control.js", "start": 1, "end": 304}]
            }
        ],
        "web_accessible_resources": [resource for item in manifest_data.get('web_accessible_resources', []) for resource in item.get('resources', [])]
    },
    "network": {"endpoints": all_endpoints},
    "messaging": {"channels": all_messages},
    "storage": {"keys": all_storage_keys},
    "workflows": [
        {"name": "Extension Installation & Onboarding Flow", "triggers": ["Extension installed"], "steps": ["Extension is installed.", "Machine key generated.", "Uninstall URL set.", "Context menu created.", "AB test variants set.", "Mixpanel event tracked.", "Onboarding tab opened."], "apis": ["chrome.runtime.onInstalled"], "evidence": [{"file": "extension/background.js", "start": 746, "end": 766}]},
        {"name": "User Activation Flow", "triggers": ["User clicks 'Activate' button"], "steps": ["User clicks activate.", "Machine key retrieved.", "Activation flag set.", "Redirect to onboarding."], "apis": ["chrome.runtime.sendMessage", "localStorage.setItem"], "evidence": [{"file": "extension/data-control.js", "start": 297, "end": 302}]},
        {"name": "Extension Icon Click Flow", "triggers": ["User clicks icon"], "steps": ["Data control check.", "Popup action set.", "Auth data retrieved.", "Message 'showExtension' sent."], "apis": ["chrome.action.onClicked", "chrome.tabs.sendMessage"], "evidence": [{"file": "extension/background.js", "start": 589, "end": 603}]},
        {"name": "Message Handling Flow", "triggers": ["Message received"], "steps": ["Background script processes various messages (init, login, logout, etc.)."], "apis": ["chrome.runtime.onMessage.addListener"], "evidence": [{"file": "extension/background.js", "start": 604, "end": 728}]},
        {"name": "Image Search Context Menu Flow", "triggers": ["Context menu clicked"], "steps": ["Menu click registered.", "Auth data retrieved.", "Message 'showExtension' sent to active tab."], "apis": ["chrome.contextMenus.onClicked"], "evidence": [{"file": "extension/background.js", "start": 729, "end": 745}]},
        {"name": "Image Processing and Data Transfer Flow", "triggers": ["Message received"], "steps": ["Image URL received.", "Image loaded/processed.", "Image data (base64) sent via window.parent.postMessage."], "apis": ["window.addEventListener", "canvas.toDataURL"], "evidence": [{"file": "extension/save.js", "start": 18, "end": 59}]}
    ],
    "privacy": {
        "data_categories": ["user_credentials", "unique_identifiers", "browsing_history", "user_preferences", "analytics_telemetry", "ip_address"],
        "purposes": ["authentication", "personalization", "analytics_tracking", "feature_functionality", "onboarding"],
        "minimization": "The extension collects various data including browsing activity (URLs), unique identifiers (machineKey), and authentication tokens. The broad tracking of browsing URLs and events suggests it might collect more data than strictly necessary for basic functionality.",
        "consent": "A consent mechanism is suggested for Firefox users via the `ACTIVATED` flag, but explicit, granular user consent for broad data collection isn't clearly evident.",
        "retention": "Cached data has TTLs, but core user data appears to be stored indefinitely.",
        "third_parties": [
            {"name": "api.mixpanel.com", "purpose": "Usage tracking", "evidence": [{"file": "extension/background.js", "start": 358, "end": 380}]},
            {"name": "catalog-service-api.faircado.com", "purpose": "Supported website checks", "evidence": [{"file": "extension/background.js", "start": 3, "end": 3}]},
            {"name": "cms-api.faircado.com", "purpose": "Extension configuration, AB tests, heuristics, supported websites list", "evidence": [{"file": "extension/background.js", "start": 9, "end": 12}]},
            {"name": "faircado.com", "purpose": "Onboarding and uninstall redirection", "evidence": [{"file": "extension/background.js", "start": 7, "end": 8}]}
        ],
        "policy_compliance": "Potential concerns regarding explicit, granular user consent for data collection may violate Chrome Web Store Developer Program Policies.",
        "evidence": [{"file": MANIFEST_PATH, "start": 1, "end": 41}]
    },
    "risks": all_risks,
    "code_signals": {
        "chrome_api_calls": list(all_chrome_apis),
        "event_listeners": list(all_event_listeners),
        "dynamic_code": list(all_dynamic_code),
        "wasm_modules": list(all_wasm_modules),
        "third_party_libs": []
    }
}

# --- Write Output ---
with open(EXTENSION_SUMMARY_PATH, 'w', encoding='utf-8') as f:
    json.dump(extension_summary, f, indent=2, ensure_ascii=False)

os.makedirs(PRIVACY_WORKSPACE_PATH, exist_ok=True)
with open(PRIVACY_EXTENSION_SUMMARY_PATH, 'w', encoding='utf-8') as f:
    json.dump(extension_summary, f, indent=2, ensure_ascii=False)

print(f"Summary files generated successfully.")
