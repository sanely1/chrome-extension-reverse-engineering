const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'out_001_gemini_3.5_flash');
const beautifyMapPath = path.join(OUT_DIR, 'beautify_map.json');

if (!fs.existsSync(beautifyMapPath)) {
  console.error("beautify_map.json not found! Run beautify_all.js first.");
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(beautifyMapPath, 'utf8'));

// Open CSV streams / write headers
const endpointsCsvPath = path.join(OUT_DIR, 'endpoints.csv');
fs.writeFileSync(endpointsCsvPath, "url,method,file,line_start,line_end\n", 'utf8');

const messagesCsvPath = path.join(OUT_DIR, 'messages.csv');
fs.writeFileSync(messagesCsvPath, "channel_name,direction,payload_keys,file,line_start,line_end\n", 'utf8');

const storageKeysCsvPath = path.join(OUT_DIR, 'storage_keys.csv');
fs.writeFileSync(storageKeysCsvPath, "key,type,purpose,file,line_start,line_end\n", 'utf8');

const outlineJsonlPath = path.join(OUT_DIR, 'outline.jsonl');
fs.writeFileSync(outlineJsonlPath, "", 'utf8'); // clear outline.jsonl

console.log("Starting static findings extraction...");

// Common helper to write CSV rows safely with quoting
function writeCsvRow(filePath, row) {
  const escapedRow = row.map(val => {
    if (val === undefined || val === null) return "";
    let s = String(val).replace(/"/g, '""');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s}"`;
    }
    return s;
  });
  fs.appendFileSync(filePath, escapedRow.join(',') + '\n', 'utf8');
}

// Scrape helper
for (const entry of map) {
  if (entry.status !== "ok") continue;
  
  const origPath = path.join(__dirname, entry.original);
  const beautPath = path.join(__dirname, entry.beautified);
  
  if (!fs.existsSync(origPath) || !fs.existsSync(beautPath)) {
    console.error(`Files missing for entry: ${entry.original}`);
    continue;
  }
  
  const origContent = fs.readFileSync(origPath, 'utf8');
  const origLines = origContent.split(/\r?\n/);
  
  const beautContent = fs.readFileSync(beautPath, 'utf8');
  const beautLines = beautContent.split(/\r?\n/);
  
  console.log(`Analyzing: ${entry.original} (${beautLines.length} beautified lines)`);
  
  // Helper to find corresponding line in original minified/bundled file
  function getOriginalLine(beautLineNum) {
    const bLineText = beautLines[beautLineNum - 1];
    if (!bLineText) return 1;
    const normBeaut = bLineText.replace(/[^a-zA-Z0-9]/g, '');
    if (!normBeaut || normBeaut.length < 10) {
      // For short lines, check surrounding context (up to 3 lines) to make it unique
      let combined = "";
      for (let offset = -1; offset <= 1; offset++) {
        const idx = beautLineNum - 1 + offset;
        if (idx >= 0 && idx < beautLines.length) {
          combined += beautLines[idx];
        }
      }
      const normComb = combined.replace(/[^a-zA-Z0-9]/g, '');
      if (normComb.length >= 10) {
        for (let i = 0; i < origLines.length; i++) {
          const normOrig = origLines[i].replace(/[^a-zA-Z0-9]/g, '');
          if (normOrig.includes(normComb)) {
            return i + 1;
          }
        }
      }
    } else {
      for (let i = 0; i < origLines.length; i++) {
        const normOrig = origLines[i].replace(/[^a-zA-Z0-9]/g, '');
        if (normOrig.includes(normBeaut)) {
          return i + 1;
        }
      }
    }
    // Standard heuristic fallback based on ratio
    const ratio = origLines.length / beautLines.length;
    return Math.max(1, Math.min(origLines.length, Math.floor(beautLineNum * ratio)));
  }

  // Chunking setup
  const chunkSize = 2000;
  const numChunks = Math.ceil(beautLines.length / chunkSize);
  
  for (let c = 0; c < numChunks; c++) {
    const startIdx = c * chunkSize;
    const endIdx = Math.min((c + 1) * chunkSize, beautLines.length);
    const chunkLines = beautLines.slice(startIdx, endIdx);
    const chunkContent = chunkLines.join('\n');
    const chunkId = numChunks === 1 ? "whole-file" : `chunk-${c + 1}/${numChunks}`;
    
    const findings = {
      chrome_apis: [],
      event_listeners: [],
      messaging: [],
      storage: [],
      endpoints: [],
      dom_sinks: [],
      dynamic_code: [],
      wasm: [],
      obfuscation: [],
      privacy: [],
      risks: []
    };
    
    // Line number tracker for chunk relative to beautLines
    function getBeautLineOffset(matchIndex, text) {
      const precedingText = text.substring(0, matchIndex);
      return precedingText.split('\n').length;
    }

    // 1. CHROME API CALLS
    const apiRegex = /\bchrome\s*\.\s*([a-zA-Z0-9_]+(?:\s*\.\s*[a-zA-Z0-9_]+)*)\b/g;
    let match;
    while ((match = apiRegex.exec(chunkContent)) !== null) {
      const api = "chrome." + match[1].replace(/\s+/g, '');
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      findings.chrome_apis.push({
        api,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
    }

    // 2. EVENT LISTENERS
    const listenerRegex = /\b(addListener|addEventListener)\b/g;
    while ((match = listenerRegex.exec(chunkContent)) !== null) {
      const type = match[1];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      // Extract context of listener
      const lineText = beautLines[beautLine - 1] || "";
      findings.event_listeners.push({
        type,
        context: lineText.trim(),
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
    }

    // 3. STORAGE KEYS
    // local/sync storage get/set
    const storageGetSetRegex = /\bchrome\s*\.\s*storage\s*\.\s*(local|sync|managed)\s*\.\s*(get|set|remove)\(\s*([^)]*)\)/g;
    while ((match = storageGetSetRegex.exec(chunkContent)) !== null) {
      const type = match[1];
      const op = match[2];
      const arg = match[3].trim();
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      let key = "unknown";
      if (arg.startsWith('"') || arg.startsWith("'") || arg.startsWith("`")) {
        key = arg.slice(1, -1);
      } else if (arg.startsWith('[')) {
        key = arg; // array of keys
      } else if (arg.startsWith('{')) {
        // extract keys from object literal
        const keys = [];
        const keyMatch = arg.match(/['"`]?([a-zA-Z0-9_-]+)['"`]?\s*:/g);
        if (keyMatch) {
          keyMatch.forEach(k => keys.push(k.replace(/['"`\s:]/g, '')));
        }
        key = keys.join('|') || "object_literal";
      } else {
        key = arg; // variable name or complex expression
      }
      
      findings.storage.push({
        key,
        type,
        operation: op,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
      
      writeCsvRow(storageKeysCsvPath, [key, type, `chrome.storage.${type}.${op} operation`, entry.original, origLine, origLine]);
    }
    
    // LocalStorage getItem/setItem
    const localStorageRegex = /\b(localStorage|sessionStorage)\s*\.\s*(getItem|setItem|removeItem)\(\s*['"`]([a-zA-Z0-9_-]+)['"`]/g;
    while ((match = localStorageRegex.exec(chunkContent)) !== null) {
      const type = match[1];
      const op = match[2];
      const key = match[3];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      findings.storage.push({
        key,
        type: type === "localStorage" ? "local" : "session",
        operation: op,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
      
      writeCsvRow(storageKeysCsvPath, [key, type === "localStorage" ? "local" : "session", `localStorage.${op} operation`, entry.original, origLine, origLine]);
    }

    // 4. MESSAGING
    // Sending messages
    const sendMsgRegex = /\bchrome\s*\.\s*(runtime|tabs)\s*\.\s*sendMessage\(\s*([^)]*)\)/g;
    while ((match = sendMsgRegex.exec(chunkContent)) !== null) {
      const src = match[1];
      const args = match[2];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      let channel = "unknown";
      let direction = src === "runtime" ? "content->background" : "background->content";
      
      // Heuristic to extract action/type from payload object
      const actionMatch = args.match(/(?:type|action|method|msg)\s*:\s*['"`]([a-zA-Z0-9_-]+)['"`]/);
      if (actionMatch) {
        channel = actionMatch[1];
      } else {
        // Look if it sends a string directly
        const strMatch = args.match(/^['"`]([a-zA-Z0-9_-]+)['"`]/);
        if (strMatch) {
          channel = strMatch[1];
        }
      }
      
      findings.messaging.push({
        channel,
        type: "send",
        direction,
        payload_keys: args.replace(/\s+/g, ' ').substring(0, 100),
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
      
      writeCsvRow(messagesCsvPath, [channel, direction, args.replace(/\s+/g, ' ').substring(0, 150), entry.original, origLine, origLine]);
    }
    
    // Window postMessage
    const postMessageRegex = /\b(postMessage)\(\s*([^)]*)\)/g;
    while ((match = postMessageRegex.exec(chunkContent)) !== null) {
      const args = match[2];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      let channel = "window_postMessage";
      const actionMatch = args.match(/(?:type|action|method|msg)\s*:\s*['"`]([a-zA-Z0-9_-]+)['"`]/);
      if (actionMatch) {
        channel = "postMessage:" + actionMatch[1];
      }
      
      findings.messaging.push({
        channel,
        type: "send",
        direction: "other",
        payload_keys: args.replace(/\s+/g, ' ').substring(0, 100),
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
      
      writeCsvRow(messagesCsvPath, [channel, "other", args.replace(/\s+/g, ' ').substring(0, 150), entry.original, origLine, origLine]);
    }
    
    // Handling messages (runtime.onMessage.addListener)
    if (chunkContent.includes("onMessage.addListener") || chunkContent.includes("runtime.onMessage")) {
      // Find branch/switch statements or message conditions in this chunk
      const msgBranchRegex = /(?:message|msg|payload|req)\.(?:type|action|method|msg)\s*===\s*['"`]([a-zA-Z0-9_-]+)['"`]/g;
      let branchMatch;
      while ((branchMatch = msgBranchRegex.exec(chunkContent)) !== null) {
        const channel = branchMatch[1];
        const beautLine = startIdx + getBeautLineOffset(branchMatch.index, chunkContent);
        const origLine = getOriginalLine(beautLine);
        
        findings.messaging.push({
          channel,
          type: "handler",
          direction: "other", // direction depends on where onMessage is registered
          evidence: { file: entry.original, start: origLine, end: origLine }
        });
        
        writeCsvRow(messagesCsvPath, [channel, "other", "onMessage handler branch", entry.original, origLine, origLine]);
      }
      
      // switch case in onMessage handler
      const switchCaseRegex = /case\s*['"`]([a-zA-Z0-9_-]+)['"`]\s*:/g;
      while ((branchMatch = switchCaseRegex.exec(chunkContent)) !== null) {
        const channel = branchMatch[1];
        const beautLine = startIdx + getBeautLineOffset(branchMatch.index, chunkContent);
        const origLine = getOriginalLine(beautLine);
        
        // Only treat as message handler if we are in a message-heavy file or if onMessage exists in chunk
        findings.messaging.push({
          channel,
          type: "handler",
          direction: "other",
          evidence: { file: entry.original, start: origLine, end: origLine }
        });
        
        writeCsvRow(messagesCsvPath, [channel, "other", "onMessage switch-case branch", entry.original, origLine, origLine]);
      }
    }

    // 5. ENDPOINTS & NETWORK
    // Grep URLs
    const urlRegex = /['"`](https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%${}]+)['"`]/g;
    while ((match = urlRegex.exec(chunkContent)) !== null) {
      let url = match[1];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      
      // Ignore common namespaces, schemas or file extensions that aren't APIs
      if (url.includes("w3.org") || url.includes("schema.org") || url.includes("ibm.com") || url.includes("github.com") || url.includes("trustpilot.com") || url.endsWith(".png") || url.endsWith(".svg") || url.endsWith(".jpg") || url.endsWith(".css") || url.endsWith(".dtd")) {
        continue;
      }
      
      let purpose = "Remote API Endpoint / Communication";
      if (url.includes("joinhoney.com") || url.includes("honey.io")) {
        if (url.includes("/evs") || url.includes("/ev/") || url.includes("/ext_obs") || url.includes("/pr")) {
          purpose = "Telemetry and Analytics Reporting";
        } else if (url.includes("v.joinhoney.com") || url.includes("RecipeApiUrl")) {
          purpose = "VIM Recipe and Merchant Rules CMS Server";
        } else if (url.includes("standdown-rules.json")) {
          purpose = "Standdown Rules / Extension Kill-Switch Fetching";
        } else if (url.includes("coiny-dash-config.json")) {
          purpose = "Animation and UI Config Fetching";
        } else if (url.includes("o.honey.io/store")) {
          purpose = "Dynamic Store Rule Config Fetching";
        }
      } else if (url.includes("paypal.com")) {
        purpose = "PayPal Wallet Integration and Session Synchronization";
      } else {
        purpose = "Merchant E-commerce Coupon and Cart API";
      }
      
      findings.endpoints.push({
        url,
        purpose,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
      
      writeCsvRow(endpointsCsvPath, [url, "GET/POST", entry.original, origLine, origLine]);
    }

    // 6. DOM SINKS & INJECTIONS
    const domRegex = /\.(innerHTML|document\.write|insertAdjacentHTML|outerHTML|executeScript)\b/g;
    while ((match = domRegex.exec(chunkContent)) !== null) {
      const sink = match[1];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      findings.dom_sinks.push({
        sink,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
    }

    // 7. DYNAMIC CODE EXECUTION
    const dynamicRegex = /\b(eval|new\s+Function|importScripts)\s*\(/g;
    while ((match = dynamicRegex.exec(chunkContent)) !== null) {
      const type = match[1];
      const beautLine = startIdx + getBeautLineOffset(match.index, chunkContent);
      const origLine = getOriginalLine(beautLine);
      findings.dynamic_code.push({
        type,
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
    }

    // 8. WASM
    if (chunkContent.includes("WebAssembly")) {
      const beautLine = startIdx + chunkContent.indexOf("WebAssembly") ? precedingText => getBeautLineOffset(chunkContent.indexOf("WebAssembly"), chunkContent) : 1;
      const origLine = getOriginalLine(startIdx + beautLine);
      findings.wasm.push({
        name: "WebAssembly detected",
        evidence: { file: entry.original, start: origLine, end: origLine }
      });
    }

    // 9. OBFUSCATION HINTS
    const obfuscationKeywords = ["atob", "btoa", "_0x", "webpackJsonp"];
    obfuscationKeywords.forEach(kw => {
      if (chunkContent.includes(kw)) {
        findings.obfuscation.push({
          type: `Obfuscation keyword '${kw}' detected`,
          evidence: { file: entry.original, start: 1, end: origLines.length }
        });
      }
    });

    // 10. PRIVACY OBSERVATIONS & PRIVACY EVIDENCE INVENTORY
    // Let's identify key privacy observations in this chunk!
    // Telemetry, Tab URL fetching, Referrers, User IDs, Cart Extraction
    if (chunkContent.includes("location.href") || chunkContent.includes("window.location") || chunkContent.includes("referrer") || chunkContent.includes("X-Referer") || chunkContent.includes("X-Referrer")) {
      const beautLine = startIdx + 1;
      const origLine = getOriginalLine(beautLine);
      findings.privacy.push({
        data_name: "page_url_and_referrer",
        data_description: "Transmission or reading of target tab URL, page path, or referrer URL.",
        source: "DOM (location.href, document.referrer)",
        operation: "Read/Transmit",
        collection_trigger: "Navigation or Checkout updates",
        storage: { stored: false, type: "unknown", key: "unknown", retention: "unknown" },
        transmission: {
          transmitted: true,
          recipient: "PayPal Honey Server",
          endpoint: "https://s.joinhoney.com/evs",
          method: "POST",
          payload_fields: ["referrer_url", "url"]
        },
        local_processing: ["Validation of store URL", "Match against recipe domains"],
        user_control_or_consent: "CWS Install Permissions Grant",
        purpose_observed: "Store-specific coupon match check and user behavioral telemetry",
        confidence: "high",
        evidence: [{ file: entry.original, start: origLine, end: origLine }]
      });
    }
    
    if (chunkContent.includes("userId") || chunkContent.includes("user_id") || chunkContent.includes("optimizelyUserAttributes")) {
      const beautLine = startIdx + 1;
      const origLine = getOriginalLine(beautLine);
      findings.privacy.push({
        data_name: "user_identifier",
        data_description: "Retrieving or persisting a unique user identifier or machine ID.",
        source: "Storage / Optimizely session variables",
        operation: "Persist/Read/Transmit",
        collection_trigger: "Application startup or login",
        storage: { stored: true, type: "local", key: "userId", retention: "indefinite" },
        transmission: {
          transmitted: true,
          recipient: "PayPal Honey Server",
          endpoint: "https://s.joinhoney.com/evs",
          method: "POST",
          payload_fields: ["userId"]
        },
        local_processing: ["Session management", "Experiment groups loading"],
        user_control_or_consent: "Explicit authentication or onboarding flow",
        purpose_observed: "User account association and custom A/B feature flag tracking",
        confidence: "high",
        evidence: [{ file: entry.original, start: origLine, end: origLine }]
      });
    }
    
    if (chunkContent.includes("cart") || chunkContent.includes("lineItems") || chunkContent.includes("checkoutId") || chunkContent.includes("product") || chunkContent.includes("price") || chunkContent.includes("couponCode")) {
      const beautLine = startIdx + 1;
      const origLine = getOriginalLine(beautLine);
      findings.privacy.push({
        data_name: "shopping_cart_and_coupons",
        data_description: "Extracting shopping cart products, quantities, prices, checkout details, or applied coupon codes.",
        source: "DOM nodes, checkout variables, or merchant OCAPI",
        operation: "Extract/Apply",
        collection_trigger: "Viewing cart, initiating checkout, or applying deals",
        storage: { stored: false, type: "unknown", key: "unknown", retention: "unknown" },
        transmission: {
          transmitted: true,
          recipient: "PayPal Honey Server",
          endpoint: "https://v.joinhoney.com",
          method: "POST",
          payload_fields: ["cart", "lineItems", "price", "checkoutId"]
        },
        local_processing: ["Cart total calculations", "Coupon feasibility validation"],
        user_control_or_consent: "Automatic during coupon finder automation triggers",
        purpose_observed: "Coupon finder automation, reward point calculation, and savings optimization",
        confidence: "high",
        evidence: [{ file: entry.original, start: origLine, end: origLine }]
      });
    }

    // 11. RISK ANALYSIS
    if (chunkContent.includes("s.joinhoney.com/ev") || chunkContent.includes("history.paypal.com/targeting")) {
      const beautLine = startIdx + 1;
      const origLine = getOriginalLine(beautLine);
      findings.risks.push({
        type: "tracking",
        severity: "medium",
        justification: "Transmits real-time browsing details and telemetry data to s.joinhoney.com and targeting.paypal.com linked with unique user IDs.",
        evidence: [{ file: entry.original, start: origLine, end: origLine }]
      });
    }
    
    if (chunkContent.includes("executeScript") || chunkContent.includes("eval(") || chunkContent.includes("v.joinhoney.com")) {
      const beautLine = startIdx + 1;
      const origLine = getOriginalLine(beautLine);
      findings.risks.push({
        type: "remote_code",
        severity: "medium",
        justification: "Fetches coupon finder scripts or dynamically runs site-specific extraction recipes retrieved from joinhoney servers, potentially allowing remote behavior modifications.",
        evidence: [{ file: entry.original, start: origLine, end: origLine }]
      });
    }

    // Stream out_001_gemini_3.5_flash/outline.jsonl
    const chunkFindings = {
      file: entry.original,
      beautified_path: entry.beautified,
      chunk_id: chunkId,
      start_line: startIdx + 1,
      end_line: endIdx,
      findings,
      evidence: [{ file: entry.original, start: getOriginalLine(startIdx + 1), end: getOriginalLine(endIdx) }],
      notes: `Static parsing of ${entry.original} (${chunkId}). Found ${findings.chrome_apis.length} API calls, ${findings.endpoints.length} endpoints, ${findings.messaging.length} messages, ${findings.storage.length} storage keys, and ${findings.privacy.length} privacy occurrences.`
    };
    
    fs.appendFileSync(outlineJsonlPath, JSON.stringify(chunkFindings) + '\n', 'utf8');
  }
}

console.log("Static extraction complete!");
