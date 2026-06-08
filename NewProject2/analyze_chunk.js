
const espree = require('espree');
const fs = require('fs');

const filePath = process.argv[2];
const fileContent = fs.readFileSync(filePath, 'utf-8');
const fileLines = fileContent.split('\n');
const totalLines = fileLines.length;

const beautifiedFilePath = filePath.replace('.js', '.beautified.js');

const findings = {
  chrome_apis: [],
  event_listeners: [],
  messages: [],
  storage: [],
  endpoints: [],
  dom: [],
  dynamic_code: [],
  wasm: [],
  obfuscation_hints: [],
  risks: []
};

const evidence = [];

// Helper to add evidence
function addEvidence(node, file) {
  evidence.push({
    file: file,
    start: node.loc.start.line,
    end: node.loc.end.line,
    ast_id: null // For now, we'll keep this null unless a stable ID can be generated
  });
}

let notesSummary = "Analyzed JavaScript file.";

try {
  const ast = espree.parse(fileContent, {
    ecmaVersion: 2022,
    sourceType: 'script',
    loc: true, // Attach location info
    range: true, // Attach range info
    comment: true, // Attach comments
  });

  // Basic obfuscation hint: webpack_modules (from top-level IIFE and comments like // src/...)
  if (fileContent.startsWith('(() => {') && fileContent.includes('// src/')) {
    findings.obfuscation_hints.push('webpack_modules');
  }

  // Basic obfuscation hint: minified_vars (single letter variables in non-trivial code)
  // This is a heuristic and might require more sophisticated analysis.
  const minifiedVarRegex = /(?:var|let|const)\s+([a-zA-Z])\s*=\s*/g;
  if (minifiedVarRegex.test(fileContent)) {
      findings.obfuscation_hints.push('minified_vars');
  }


  // Traverse the AST
  function traverse(node) {
    if (!node) return;

    // Chrome API calls
    if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'chrome') {
      let apiCall = 'chrome';
      let current = node;
      while (current.type === 'MemberExpression') {
        apiCall = current.property.name + '.' + apiCall;
        current = current.object;
      }
      apiCall = current.name + '.' + apiCall;
      if (!findings.chrome_apis.includes(apiCall)) {
        findings.chrome_apis.push(apiCall);
      }
      addEvidence(node, filePath);
    }

    // Event Listeners (addListener)
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.name === 'addListener') {
      let listener = '';
      let current = node.callee.object;
      if (current.type === 'MemberExpression') {
        while (current.type === 'MemberExpression') {
          listener = current.property.name + '.' + listener;
          current = current.object;
        }
        listener = current.name + '.' + listener + 'addListener'; // e.g., chrome.runtime.onMessage.addListener
      } else if (current.type === 'Identifier') {
         listener = current.name + '.addListener';
      }
      if (!findings.event_listeners.includes(listener)) {
        findings.event_listeners.push(listener);
      }
      addEvidence(node, filePath);
    }

    // Messaging patterns (chrome.runtime.sendMessage, chrome.tabs.sendMessage)
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        (node.callee.property.name === 'sendMessage' || node.callee.property.name === 'connect')) {
      const parent = node.callee.object;
      let channel = { name: 'unknown', direction: 'other', payload_keys: [] };
      if (parent.type === 'MemberExpression' && parent.object.type === 'Identifier' && parent.object.name === 'chrome') {
        if (parent.property.name === 'runtime') {
          channel.direction = 'content->background'; // Often initiated from content
        } else if (parent.property.name === 'tabs') {
          channel.direction = 'background->content'; // Often initiated from background
        }
      }

      if (node.arguments.length > 0 && node.arguments[0].type === 'ObjectExpression') {
        node.arguments[0].properties.forEach(prop => {
          if (prop.key.type === 'Identifier' && prop.key.name === 'type' && prop.value.type === 'MemberExpression') {
            // Extract message type from InternalMessageTypes.GetMachineKey etc.
            if (prop.value.object.type === 'Identifier' && prop.value.object.name === 'InternalMessageTypes' && prop.value.property.type === 'Identifier') {
                channel.name = prop.value.property.name;
            } else if (prop.value.object.type === 'Identifier' && prop.value.object.name === 'messageTypes' && prop.value.property.type === 'Identifier') {
                channel.name = prop.value.property.name;
            }
          } else if (prop.key.type === 'Identifier' && prop.value.type === 'Identifier') {
            channel.payload_keys.push(prop.key.name);
          } else if (prop.key.type === 'Identifier' && prop.value.type === 'ObjectExpression') {
            prop.value.properties.forEach(subProp => {
              if (subProp.key.type === 'Identifier') {
                channel.payload_keys.push(subProp.key.name);
              }
            });
          }
        });
      }
      if (channel.name === 'unknown' && node.arguments.length > 0 && node.arguments[0].type === 'Literal') {
        channel.name = node.arguments[0].value;
      }

      // Check for existing message with same name and direction
      const existingMessage = findings.messages.find(m => m.name === channel.name && m.direction === channel.direction);
      if (!existingMessage) {
          findings.messages.push(channel);
      } else {
          // Merge payload keys if new keys are found
          channel.payload_keys.forEach(key => {
              if (!existingMessage.payload_keys.includes(key)) {
                  existingMessage.payload_keys.push(key);
              }
          });
      }
      addEvidence(node, filePath);
    }

    // Storage operations (chrome.storage.[local|sync|managed], localStorage)
    if (node.type === 'MemberExpression' && node.object.type === 'MemberExpression' && node.object.object && node.object.object.name === 'chrome' && node.object.property.name === 'storage') {
        const storageType = node.property.name; // local, sync, managed
        if (['local', 'sync', 'managed'].includes(storageType)) {
            let op = 'unknown';
            if (node.parent && node.parent.type === 'CallExpression' && node.parent.callee === node) {
                op = node.parent.callee.property.name; // set, get, remove, clear
            }
            let key = 'unknown';
            if (op === 'set' && node.parent.arguments.length > 0 && node.parent.arguments[0].type === 'ObjectExpression') {
                node.parent.arguments[0].properties.forEach(prop => {
                    if (prop.key.type === 'Identifier') {
                        key = prop.key.name;
                    } else if (prop.key.type === 'Literal') {
                        key = prop.key.value;
                    }
                });
            } else if ((op === 'get' || op === 'remove') && node.parent.arguments.length > 0) {
                const arg = node.parent.arguments[0];
                if (arg.type === 'Literal') {
                    key = arg.value;
                } else if (arg.type === 'Identifier') {
                    key = arg.name; // This would require more resolution
                } else if (arg.type === 'ArrayExpression') {
                    key = arg.elements.map(e => e.value).join('|');
                }
            }
            // Check for STORAGE_KEY usage
            if (node.parent && node.parent.type === 'CallExpression' && node.parent.arguments.length > 0 && node.parent.arguments[0].type === 'MemberExpression' && node.parent.arguments[0].object.name === 'STORAGE_KEY') {
                key = node.parent.arguments[0].property.name;
            }


            findings.storage.push({ key: key, type: storageType, op: op, purpose: 'unknown' });
            addEvidence(node, filePath);
        }
    } else if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'localStorage') {
        const op = node.property.name; // getItem, setItem, removeItem, clear
        let key = 'unknown';
        if ((op === 'getItem' || op === 'removeItem') && node.parent && node.parent.type === 'CallExpression' && node.parent.arguments.length > 0 && node.parent.arguments[0].type === 'MemberExpression' && node.parent.arguments[0].object.name === 'STORAGE_KEY') {
             key = node.parent.arguments[0].property.name;
        } else if ((op === 'getItem' || op === 'removeItem') && node.parent && node.parent.type === 'CallExpression' && node.parent.arguments.length > 0 && node.parent.arguments[0].type === 'Literal') {
            key = node.parent.arguments[0].value;
        } else if (op === 'setItem' && node.parent && node.parent.type === 'CallExpression' && node.parent.arguments.length > 1 && node.parent.arguments[0].type === 'MemberExpression' && node.parent.arguments[0].object.name === 'STORAGE_KEY') {
            key = node.parent.arguments[0].property.name;
        } else if (op === 'setItem' && node.parent && node.parent.type === 'CallExpression' && node.parent.arguments.length > 1 && node.parent.arguments[0].type === 'Literal') {
            key = node.parent.arguments[0].value;
        }
        findings.storage.push({ key: key, type: 'local', op: op, purpose: 'unknown' });
        addEvidence(node, filePath);
    }


    // Network communications (fetch, XMLHttpRequest, URLs)
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
      if (node.arguments.length > 0) {
        let url = 'unknown';
        let method = 'GET';
        let headers = [];

        if (node.arguments[0].type === 'Literal') {
          url = node.arguments[0].value;
        } else if (node.arguments[0].type === 'Identifier') {
            // Check if it's a constant
            const varName = node.arguments[0].name;
            const match = fileContent.match(new RegExp(`(?:var|let|const)\\s+${varName}\\s*=\\s*["\`\'](.*?)[ disputes '"];`, 's'));
            if (match && match[1]) {
                url = match[1];
            }
        } else if (node.arguments[0].type === 'TemplateLiteral') {
            url = node.arguments[0].quasis.map(q => q.value.cooked).join('${...}'); // Placeholder for dynamic parts
        }

        if (node.arguments.length > 1 && node.arguments[1].type === 'ObjectExpression') {
          node.arguments[1].properties.forEach(prop => {
            if (prop.key.type === 'Identifier' && prop.key.name === 'method' && prop.value.type === 'Literal') {
              method = prop.value.value;
            } else if (prop.key.type === 'Identifier' && prop.key.name === 'headers' && prop.value.type === 'ObjectExpression') {
              prop.value.properties.forEach(headerProp => {
                if (headerProp.key.type === 'Literal') {
                  headers.push(headerProp.key.value);
                } else if (headerProp.key.type === 'Identifier') {
                    headers.push(headerProp.key.name);
                }
              });
            }
          });
        }
        findings.endpoints.push({ url: url, method: method, headers: headers, purpose: 'unknown' });
        addEvidence(node, filePath);
      }
    }
    // URLs mentioned as string literals or template literals (e.g., for APIs)
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init && (node.init.type === 'Literal' || node.init.type === 'TemplateLiteral')) {
        const varName = node.id.name;
        if (varName.includes('_API') || varName.includes('URL')) { // Heuristic for API URLs
            let url = '';
            if (node.init.type === 'Literal') {
                url = node.init.value;
            } else if (node.init.type === 'TemplateLiteral') {
                url = node.init.quasis.map(q => q.value.cooked).join('${...}');
            }
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                findings.endpoints.push({ url: url, method: 'unknown', headers: [], purpose: 'API definition' });
                addEvidence(node, filePath);
            }
        }
    }


    // Dynamic code (eval, new Function, import(), importScripts(), atob())
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' &&
        (node.callee.name === 'eval' || node.callee.name === 'Function' || node.callee.name === 'import' || node.callee.name === 'importScripts' || node.callee.name === 'atob')) {
      if (!findings.dynamic_code.includes(node.callee.name)) {
        findings.dynamic_code.push(node.callee.name);
      }
      addEvidence(node, filePath);
    }
     // WebAssembly (WebAssembly.instantiate*, .wasm file references, ArrayBuffer sources for WASM)
     if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'WebAssembly') {
        let wasmCall = 'WebAssembly.' + node.property.name;
        if (!findings.wasm.includes(wasmCall)) {
            findings.wasm.push(wasmCall);
        }
        addEvidence(node, filePath);
     }
    // DOM interaction (querySelector*, addEventListener, MutationObserver, innerHTML, document.write)
    // Less likely in background script, but including for completeness
    if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && (node.object.name === 'document' || node.object.name === 'window')) {
        if (node.property.type === 'Identifier' && (
            node.property.name.startsWith('querySelector') ||
            node.property.name === 'addEventListener' ||
            node.property.name === 'innerHTML' ||
            node.property.name === 'write'
        )) {
            if (!findings.dom.includes(node.property.name)) {
                findings.dom.push(node.property.name);
            }
            addEvidence(node, filePath);
        }
    }
    if (node.type === 'NewExpression' && node.callee.type === 'Identifier' && node.callee.name === 'MutationObserver') {
        if (!findings.dom.includes('MutationObserver')) {
            findings.dom.push('MutationObserver');
        }
        addEvidence(node, filePath);
    }


    for (const key in node) {
      if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          node[key].forEach(traverse);
        } else {
          traverse(node[key]);
        }
      }
    }
  }

  traverse(ast);

} catch (error) {
  notesSummary = `AST parsing failed: ${error.message}. Falling back to regex.`;
  findings.risks.push({
    type: 'other',
    severity: 'low',
    justification: notesSummary,
    evidence: []
  });
  // Fallback to regex for some key patterns if AST parsing fails
  const chromeApiRegex = /chrome\.[a-zA-Z0-9_\.]+/g;
  let match;
  while ((match = chromeApiRegex.exec(fileContent)) !== null) {
      if (!findings.chrome_apis.includes(match[0])) {
          findings.chrome_apis.push(match[0]);
      }
      // Add basic evidence for regex matches, but without AST node info
      const lineNum = fileContent.substring(0, match.index).split('\n').length;
      evidence.push({ file: filePath, start: lineNum, end: lineNum, ast_id: null });
  }
  const listenerRegex = /addListener/g;
  while ((match = listenerRegex.exec(fileContent)) !== null) {
      const lineNum = fileContent.substring(0, match.index).split('\n').length;
      findings.event_listeners.push(`addListener (line ${lineNum})`);
      evidence.push({ file: filePath, start: lineNum, end: lineNum, ast_id: null });
  }
  // This needs more sophisticated regex for messages, storage etc. For now, just logging the failure.
}

const outlineEntry = {
  file: filePath,
  beautified: beautifiedFilePath,
  chunk: {
    id: "whole-file",
    start_line: 1,
    end_line: totalLines,
    same_function_group: null
  },
  findings: findings,
  evidence: evidence,
  notes: notesSummary
};

console.log(JSON.stringify(outlineEntry));
