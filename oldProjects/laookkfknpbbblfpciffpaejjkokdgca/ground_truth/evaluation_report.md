# Model Evaluation Report

Ground Truth Statistics:
- Network Endpoints: 12
- Messaging Channels: 18
- Storage Keys: 22

## Summary Table

### Network Endpoints

| Model | Precision | Recall | F1 | TP | FP | FN |
|-------|-----------|--------|----|----|----|----|
| GPT4.1 | 0.8750 | 0.5833 | 0.7000 | 7 | 1 | 5 |
| Claude-Sonnet-4 | 1.0000 | 0.5833 | 0.7368 | 7 | 0 | 5 |
| Gemini-2.5-Pro | 0.7143 | 0.4167 | 0.5263 | 5 | 2 | 7 |

### Messaging Channels

| Model | Precision | Recall | F1 | TP | FP | FN |
|-------|-----------|--------|----|----|----|----|
| GPT4.1 | 1.0000 | 0.6111 | 0.7586 | 11 | 0 | 7 |
| Claude-Sonnet-4 | 1.0000 | 0.5000 | 0.6667 | 9 | 0 | 9 |
| Gemini-2.5-Pro | 1.0000 | 0.9444 | 0.9714 | 17 | 0 | 1 |

### Storage Keys

| Model | Precision | Recall | F1 | TP | FP | FN |
|-------|-----------|--------|----|----|----|----|
| GPT4.1 | 0.8667 | 0.5909 | 0.7027 | 13 | 2 | 9 |
| Claude-Sonnet-4 | 1.0000 | 0.7273 | 0.8421 | 16 | 0 | 6 |
| Gemini-2.5-Pro | 1.0000 | 0.4545 | 0.6250 | 10 | 0 | 12 |

## GPT4.1 - Detailed Analysis

### Network Endpoints
- **Correct**: 7 endpoints
- **Missing**: 5 endpoints
- **Extra**: 1 endpoints

**Missing Endpoints:**
- `.posthog.com`
- `https://api.momentumdash.com/user:migrateLegacy?canceled=true`
- `https://browser-http-intake.logs.datadoghq.com/v1/input/`
- `https://momentumdash.com/uninstall`
- `posthog.momentumdash.com/e/`

**False Positives (Extra):**
- `https://browser-http-intake.logs.datadoghq.com/v1/input/pub18ef9128dd80db1a80dfc3f9180b55b5`

### Messaging Channels
- **Correct**: 11 channels
- **Missing**: 7 channels
- **Extra**: 0 channels

**Missing Channels:**
- `activateNewWorker`
- `legacyUserMigration:triggerOffscreenDocumentRequest`
- `momentum:callback:checkUserId`
- `momentum:callback:oneTimeLogin`
- `momentum:callback:openNew`
- `oneTimeLogin`
- `unknown`

### Storage Keys
- **Correct**: 13 keys
- **Missing**: 9 keys
- **Extra**: 2 keys

**Missing Keys:**
- `authState`
- `chrome.storage`
- `config`
- `indexedDB`
- `keyValueDb`
- `localStorage`
- `momentumExtensionUserId`
- `momentumPlatform`
- `momentumVersion`

**False Positives (Extra):**
- `misc`
- `userPrefs`

## Claude-Sonnet-4 - Detailed Analysis

### Network Endpoints
- **Correct**: 7 endpoints
- **Missing**: 5 endpoints
- **Extra**: 0 endpoints

**Missing Endpoints:**
- `chrome-extension://<id>/site-blocker.html?hostname=...&sitename=...&metatitle=...&documenttitle=...`
- `https://api.momentumdash.com/config`
- `https://api.momentumdash.com/user:migrateLegacy?canceled=true`
- `https://momentumdash.com/uninstall`
- `https://posthog.momentumdash.com/e/`

### Messaging Channels
- **Correct**: 9 channels
- **Missing**: 9 channels
- **Extra**: 0 channels

**Missing Channels:**
- `activateNewWorker`
- `flashMessage`
- `legacyUserMigration:triggerOffscreenDocumentRequest`
- `momentum:callback:checkUserId`
- `momentum:callback:oneTimeLogin`
- `momentum:callback:openNew`
- `notificationClick`
- `runtime.onMessage`
- `unknown`

### Storage Keys
- **Correct**: 16 keys
- **Missing**: 6 keys
- **Extra**: 0 keys

**Missing Keys:**
- `authState`
- `calculateUnregisteredDashboardExperiment`
- `config`
- `installDate`
- `momentum-customization-1`
- `releaseUpdateModalCheck`

## Gemini-2.5-Pro - Detailed Analysis

### Network Endpoints
- **Correct**: 5 endpoints
- **Missing**: 7 endpoints
- **Extra**: 2 endpoints

**Missing Endpoints:**
- `.posthog.com`
- `chrome-extension://<id>/site-blocker.html?hostname=...&sitename=...&metatitle=...&documenttitle=...`
- `https://account.momentumdash.com/`
- `https://api.momentumdash.com/`
- `https://browser-http-intake.logs.datadoghq.com/v1/input/`
- `https://posthog.momentumdash.com/e/`
- `https://www.momentumdash.com/`

**False Positives (Extra):**
- `.posthog.com/e/`
- `https://browser-http-intake.logs.datadoghq.com/v1/input/pub18ef9128dd80db1a80dfc3f9180b55b5?ddsource=browser&ddtags=env:production,service:extension,version:2.25.3`

### Messaging Channels
- **Correct**: 17 channels
- **Missing**: 1 channels
- **Extra**: 0 channels

**Missing Channels:**
- `runtime.onMessage`

### Storage Keys
- **Correct**: 10 keys
- **Missing**: 12 keys
- **Extra**: 0 keys

**Missing Keys:**
- `analyticsQueue`
- `chrome.storage`
- `idMap`
- `indexedDB`
- `keyValueDb`
- `localStorage`
- `momentumExtensionUserId`
- `momentumPlatform`
- `momentumVersion`
- `notificationsQueue`
- ... and 2 more
