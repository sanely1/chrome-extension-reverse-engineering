#!/usr/bin/env node
/*
 * Extracts structured claims from the developer's external privacy policy.
 *
 * Input:
 *   privacy_workspace/declared_privacy.json
 *
 * Output, only when an external policy was retrieved:
 *   privacy_workspace/external_policy_claims.json
 *
 * This is intentionally generic: it does not contain extension-specific
 * expected claims. It converts policy text into a reusable claim-level
 * representation for later observed-vs-external and policy-vs-external checks.
 */

const fs = require('fs');
const path = require('path');

const workspace = process.argv[2] || './privacy_workspace';
const declaredPath = path.join(workspace, 'declared_privacy.json');
const outPath = path.join(workspace, 'external_policy_claims.json');

const CATEGORY_TERMS = {
  personally_identifiable_information: [
    'personally identifiable information',
    'personal identifiers',
    'email address',
    'account information',
    'profile information',
    'user id',
    'user identifier',
    'name'
  ],
  health_information: [
    'health information',
    'medical history',
    'symptoms',
    'diagnoses'
  ],
  financial_and_payment_information: [
    'financial information',
    'payment information',
    'credit card',
    'billing',
    'transactions',
    'payment details',
    'card details'
  ],
  authentication_information: [
    'authentication information',
    'password',
    'credentials',
    'login',
    'sign in',
    'sign-in',
    'auth token',
    'session token',
    'license key',
    'activation key'
  ],
  personal_communications: [
    'personal communications',
    'emails',
    'text messages',
    'chat messages',
    'messages'
  ],
  location: [
    'location',
    'ip address',
    'city',
    'country',
    'region',
    'gps'
  ],
  web_history: [
    'web history',
    'browsing history',
    'web pages',
    'pages you visit',
    'page title',
    'time of visit',
    'open tabs',
    'visited websites',
    'url'
  ],
  user_activity: [
    'user activity',
    'feature usage',
    'usage data',
    'how you use',
    'pages you view',
    'buttons you tap',
    'clicks',
    'mouse position',
    'scroll',
    'keystroke',
    'analytics',
    'event tracking'
  ],
  website_content: [
    'website content',
    'inputted content',
    'page content',
    'selected text',
    'text',
    'images',
    'audio',
    'video',
    'videos',
    'tab audio',
    'links',
    'hyperlinks'
  ]
};

const CLAIM_RULES = [
  {
    type: 'no_collection_claim',
    confidence: 'high',
    patterns: [
      /\bdo(?:es)?\s+not\s+collect\b/i,
      /\bdon['’]?t\s+collect\b/i,
      /\bno\s+data\s+(?:is\s+)?collected\b/i,
      /\bwe\s+collect\s+no\b/i,
      /\bdo\s+no\s+collect\b/i
    ]
  },
  {
    type: 'no_use_or_storage_claim',
    confidence: 'high',
    patterns: [
      /\bdo(?:es)?\s+not\s+use\s+or\s+store\b/i,
      /\bdo(?:es)?\s+not\s+store\b/i,
      /\bdo(?:es)?\s+not\s+use\b/i,
      /\bdon['â€™]?t\s+(?:use|store)\b/i,
      /\bno\s+(?:use|storage|retention)\s+of\b/i
    ]
  },
  {
    type: 'data_collection',
    confidence: 'medium',
    patterns: [
      /\bcollect(?:s|ed|ing)?\b/i,
      /\bgather(?:s|ed|ing)?\b/i,
      /\bobtain(?:s|ed|ing)?\b/i,
      /\breceive(?:s|d|ing)?\b/i
    ]
  },
  {
    type: 'data_use',
    confidence: 'medium',
    patterns: [
      /\buse(?:s|d|ing)?\b/i,
      /\bprocess(?:es|ed|ing)?\b/i,
      /\banaly[sz]e(?:s|d|ing)?\b/i
    ]
  },
  {
    type: 'local_processing',
    confidence: 'high',
    patterns: [
      /\blocally\b/i,
      /\bon\s+your\s+(?:device|computer|browser)\b/i,
      /\bnever\s+leaves\s+your\b/i,
      /\bnot\s+(?:sent|transmitted|uploaded)\b/i
    ]
  },
  {
    type: 'storage_or_retention',
    confidence: 'medium',
    patterns: [
      /\bretain(?:s|ed|ing)?\b/i,
      /\bstor(?:e|es|ed|ing)\b/i,
      /\bdelete(?:s|d)?\b/i,
      /\bretention\b/i
    ]
  },
  {
    type: 'third_party_sharing',
    confidence: 'medium',
    patterns: [
      /\bshare(?:s|d|ing)?\b/i,
      /\btransfer(?:s|red|ring)?\b/i,
      /\bdisclos(?:e|es|ed|ing)\b/i,
      /\bthird[-\s]?part(?:y|ies)\b/i,
      /\bservice providers?\b/i,
      /\bpartners?\b/i
    ]
  },
  {
    type: 'sale_or_data_broker',
    confidence: 'high',
    patterns: [
      /\bsell(?:s|ing)?\b/i,
      /\bsold\b/i,
      /\bdata broker(?:s)?\b/i,
      /\binformation reseller(?:s)?\b/i
    ]
  },
  {
    type: 'advertising_or_marketing',
    confidence: 'high',
    patterns: [
      /\badvertis(?:e|es|ed|ing|ement|ements)\b/i,
      /\bmarketing\b/i,
      /\bpersonalized ads?\b/i,
      /\bad platforms?\b/i
    ]
  },
  {
    type: 'creditworthiness_or_lending',
    confidence: 'high',
    patterns: [
      /\bcreditworthiness\b/i,
      /\bcredit\s+worthiness\b/i,
      /\blending\b/i,
      /\bloan\b/i
    ]
  },
  {
    type: 'human_access',
    confidence: 'medium',
    patterns: [
      /\bhuman(?:s)?\s+(?:may\s+)?(?:read|review|access)\b/i,
      /\bmanual\s+review\b/i,
      /\bsupport\s+(?:team|staff)\s+(?:may\s+)?(?:read|review|access)\b/i
    ]
  },
  {
    type: 'security_handling',
    confidence: 'medium',
    patterns: [
      /\bencrypt(?:s|ed|ion)?\b/i,
      /\btls\b/i,
      /\bsecure(?:ly)?\b/i,
      /\bmodern\s+cryptography\b/i
    ]
  }
];

const NEGATIVE_CLAIM_TYPES = new Set([
  'no_collection_claim',
  'no_use_or_storage_claim'
]);

const POSITIVE_TYPES_SUPPRESSED_BY_NEGATION = new Set([
  'data_collection',
  'data_use',
  'storage_or_retention'
]);

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function sentenceSplit(text) {
  const compact = String(text || '').replace(/\r/g, '\n');
  const units = [];
  const regex = /[^.!?\n]+(?:[.!?]+|\n+|$)/g;
  let match;
  while ((match = regex.exec(compact)) !== null) {
    const raw = match[0];
    const cleaned = normalize(raw);
    if (cleaned.length >= 12) {
      units.push({
        text: cleaned,
        start: match.index,
        end: match.index + raw.length
      });
    }
  }
  return units;
}

function inferSection(text, start) {
  const before = text.slice(0, start).split(/\n/).map(s => s.trim()).filter(Boolean);
  for (let i = before.length - 1; i >= 0; i -= 1) {
    const line = before[i];
    if (line.length <= 90 && !/[.!?]$/.test(line)) return line;
  }
  return 'unknown';
}

function categoriesFor(sentence) {
  const lower = sentence.toLowerCase();
  const found = [];
  for (const [category, terms] of Object.entries(CATEGORY_TERMS)) {
    if (terms.some(term => lower.includes(term.toLowerCase()))) found.push(category);
  }
  return found;
}

function recipientsFor(sentence) {
  const lower = sentence.toLowerCase();
  const recipients = [];
  if (/third[-\s]?part(?:y|ies)/i.test(lower)) recipients.push('third_parties');
  if (/service providers?/i.test(lower)) recipients.push('service_providers');
  if (/partners?/i.test(lower)) recipients.push('partners');
  if (/advertis(?:ing|ers?)|ad platforms?/i.test(lower)) recipients.push('advertising_partners');
  if (/data broker(?:s)?|information reseller(?:s)?/i.test(lower)) recipients.push('data_brokers_or_resellers');
  return [...new Set(recipients)];
}

function purposesFor(sentence) {
  const lower = sentence.toLowerCase();
  const purposes = [];
  if (/provide|operate|deliver|functionality|service/i.test(lower)) purposes.push('provide_or_operate_service');
  if (/improve|develop|debug|diagnos|quality/i.test(lower)) purposes.push('improve_or_debug_service');
  if (/analytics|usage|event tracking/i.test(lower)) purposes.push('analytics');
  if (/advertis|marketing|personalized ads?/i.test(lower)) purposes.push('advertising_or_marketing');
  if (/creditworthiness|lending|loan/i.test(lower)) purposes.push('creditworthiness_or_lending');
  if (/security|fraud|abuse|spam|malware/i.test(lower)) purposes.push('security_or_abuse_prevention');
  return [...new Set(purposes)];
}

function suppressPositiveMatchesWhenNegated(ruleMatches) {
  const hasNegativeClaim = ruleMatches.some(rule => NEGATIVE_CLAIM_TYPES.has(rule.type));
  if (!hasNegativeClaim) return ruleMatches;
  return ruleMatches.filter(rule => !POSITIVE_TYPES_SUPPRESSED_BY_NEGATION.has(rule.type));
}

function detectClaims(policyText, detectedCategories = [], developerStatements = []) {
  const sentences = sentenceSplit(policyText);
  const claims = [];
  let counter = 1;

  for (const sentence of sentences) {
    const rawRuleMatches = CLAIM_RULES.filter(rule => rule.patterns.some(pattern => pattern.test(sentence.text)));
    const ruleMatches = suppressPositiveMatchesWhenNegated(rawRuleMatches);
    if (ruleMatches.length === 0) continue;

    const dataCategories = [...new Set([...categoriesFor(sentence.text), ...detectedCategories.filter(cat => sentence.text.toLowerCase().includes(cat.replace(/_/g, ' ')))])];
    const recipients = recipientsFor(sentence.text);
    const purposes = purposesFor(sentence.text);

    for (const rule of ruleMatches) {
      claims.push({
        claim_id: `EPC-${String(counter).padStart(3, '0')}`,
        claim_type: rule.type,
        data_categories: dataCategories,
        purposes,
        recipients,
        developer_statement_refs: developerStatements.filter(statement => sentence.text.toLowerCase().includes(statement.replace(/_/g, ' '))),
        claim_text: sentence.text,
        normalized_meaning: summarizeMeaning(rule.type, dataCategories, purposes, recipients),
        evidence: {
          source: 'declared_privacy.json.external_privacy_policy.privacy_text',
          section_heading: inferSection(policyText, sentence.start),
          start_char: sentence.start,
          end_char: sentence.end,
          excerpt: sentence.text
        },
        confidence: rule.confidence,
        detection_method: 'heuristic_claim_extraction'
      });
      counter += 1;
    }
  }

  return dedupeClaims(claims);
}

function summarizeMeaning(type, categories, purposes, recipients) {
  const bits = [`The external privacy policy contains a ${type} statement`];
  if (categories.length) bits.push(`for ${categories.join(', ')}`);
  if (purposes.length) bits.push(`for ${purposes.join(', ')}`);
  if (recipients.length) bits.push(`involving ${recipients.join(', ')}`);
  return `${bits.join(' ')}.`;
}

function dedupeClaims(claims) {
  const seen = new Set();
  const out = [];
  for (const claim of claims) {
    const key = `${claim.claim_type}|${claim.claim_text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(claim);
  }
  return out;
}

function main() {
  if (!fs.existsSync(declaredPath)) {
    console.error(`Missing ${declaredPath}`);
    process.exit(1);
  }

  const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
  const external = declared.external_privacy_policy || {};

  if (external.retrieved !== true || !external.url || !normalize(external.privacy_text)) {
    console.log('No retrieved external privacy policy with text. Skipping external_policy_claims.json.');
    return;
  }

  const policyText = external.privacy_text;
  const detectedCategories = Array.isArray(external.detected_data_categories) ? external.detected_data_categories : [];
  const developerStatements = Array.isArray(external.developer_statements) ? external.developer_statements : [];
  const claims = detectClaims(policyText, detectedCategories, developerStatements);

  const report = {
    extension_id: declared.extension_id || 'unknown',
    external_privacy_policy_url: external.url || 'unknown',
    external_privacy_policy_final_url: external.final_url || external.url || 'unknown',
    source_text: {
      path: 'declared_privacy.json.external_privacy_policy.privacy_text',
      character_count: policyText.length
    },
    extraction_summary: {
      detected_category_count: detectedCategories.length,
      developer_statement_count: developerStatements.length,
      claim_count: claims.length,
      claim_type_counts: claims.reduce((acc, claim) => {
        acc[claim.claim_type] = (acc[claim.claim_type] || 0) + 1;
        return acc;
      }, {})
    },
    detected_data_categories: detectedCategories,
    developer_statements: developerStatements,
    claims,
    limitations: [
      'Claims are extracted from the external privacy policy text saved by fetch_privacy.py.',
      'Heuristic extraction is an audit aid; the LLM must review ambiguous or high-impact claims before drawing policy conclusions.',
      'Absence of a claim does not prove the policy omits the behavior if the source text is incomplete or extraction missed relevant wording.'
    ]
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote ${claims.length} external policy claim(s) to ${outPath}`);
}

main();
