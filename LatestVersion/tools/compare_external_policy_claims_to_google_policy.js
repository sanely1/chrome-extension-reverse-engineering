#!/usr/bin/env node
/*
 * Compares developer external-privacy-policy claims against the structured
 * Chrome Web Store Program Policies snapshot.
 *
 * Input:
 *   privacy_workspace/external_policy_claims_review.json, preferred
 *   privacy_workspace/external_policy_claims.json, draft fallback
 *   docs/policies/chrome_webstore_program_policies.json
 *
 * Output, only when external policy claims exist:
 *   privacy_workspace/external_policy_google_policy_comparison.json
 *
 * This is a claim-vs-policy check. It does not re-scan source code and it does
 * not decide whether the extension actually performs the claimed behavior.
 */

const fs = require('fs');
const path = require('path');

const workspace = process.argv[2] || './privacy_workspace';
const policyPath = process.argv[3] || './docs/policies/chrome_webstore_program_policies.json';
const claimsPath = path.join(workspace, 'external_policy_claims.json');
const reviewedClaimsPath = path.join(workspace, 'external_policy_claims_review.json');
const externalComparisonPath = path.join(workspace, 'external_privacy_comparison.json');
const privacyComparisonPath = path.join(workspace, 'privacy_comparison.json');
const outPath = path.join(workspace, 'external_policy_google_policy_comparison.json');

const STATUS = {
  CONFIRMED_CONFLICT: 'confirmed_policy_conflict',
  POSSIBLE_CONFLICT: 'possible_policy_conflict',
  CONCERN: 'compliance_concern',
  NOT_ENOUGH: 'not_enough_evidence',
  NO_CONFLICT: 'no_conflict'
};

const RULES = {
  sale_or_data_broker: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_4_4B'],
    status: STATUS.POSSIBLE_CONFLICT,
    reason: 'The external policy text appears to describe sale, broker-like transfer, or monetization of user data. Chrome Web Store policy restricts selling or transferring user data to third parties except for allowed purposes.',
  },
  advertising_or_marketing: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_4_4A', 'CWS_PRIVACY_POLICY_2B'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe advertising, marketing, or personalized advertising uses. This is policy-relevant and should be checked against the extension single purpose, disclosure, and limited-use requirements.',
  },
  creditworthiness_or_lending: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_4_4C'],
    status: STATUS.POSSIBLE_CONFLICT,
    reason: 'The external policy text appears to describe creditworthiness, lending, or eligibility use. Chrome Web Store policy restricts using user data for determining creditworthiness or lending purposes.',
  },
  third_party_sharing: {
    clauses: ['CWS_PRIVACY_POLICY_2B', 'CWS_PRIVACY_LIMITED_USE_4_2A'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe third-party sharing. This requires clear disclosure and a purpose allowed by Chrome Web Store limited-use rules.',
  },
  data_collection: {
    clauses: ['CWS_PRIVACY_POLICY_2A', 'CWS_PRIVACY_DISCLOSURE_1', 'CWS_PRIVACY_LIMITED_USE_3'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe collection of user data. This is policy-relevant and should align with privacy disclosures and limited-use requirements.',
  },
  data_use: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_4_1', 'CWS_PRIVACY_LIMITED_USE_3'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe user-data use. The stated use should be limited to the extension single purpose and disclosed accurately.',
  },
  storage_or_retention: {
    clauses: ['CWS_PRIVACY_HANDLING_4', 'CWS_PRIVACY_POLICY_2A'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe storage or retention. This should be disclosed accurately and handled securely, especially for sensitive data.',
  },
  human_access: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_4_3A'],
    status: STATUS.CONCERN,
    reason: 'The external policy text appears to describe human access to user data. This is policy-relevant and should fit an allowed exception such as user consent, security, legal compliance, or abuse investigation.',
  },
  security_handling: {
    clauses: ['CWS_PRIVACY_HANDLING_2', 'CWS_PRIVACY_HANDLING_4'],
    status: STATUS.NO_CONFLICT,
    reason: 'The external policy text appears to describe security handling practices. This is generally supportive unless observed behavior contradicts it.',
  },
  no_collection_claim: {
    clauses: ['CWS_PRIVACY_POLICY_2A', 'CWS_PRIVACY_DISCLOSURE_1'],
    status: STATUS.NO_CONFLICT,
    reason: 'A no-collection claim is not itself a Google policy conflict. It should be compared against observed behavior in the external-policy-vs-observed step.',
  },
  no_use_or_storage_claim: {
    clauses: ['CWS_PRIVACY_POLICY_2A', 'CWS_PRIVACY_DISCLOSURE_1', 'CWS_PRIVACY_HANDLING_4'],
    status: STATUS.NO_CONFLICT,
    reason: 'A no-use or no-storage claim is not itself a Google policy conflict. It becomes policy-relevant when observed behavior contradicts it.',
  },
  local_processing: {
    clauses: ['CWS_PRIVACY_LIMITED_USE_3', 'CWS_PRIVACY_DISCLOSURE_1'],
    status: STATUS.NO_CONFLICT,
    reason: 'Local processing is not itself a policy conflict. It remains relevant for disclosure and observed-behavior comparison.',
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadClaimsReport() {
  if (fs.existsSync(reviewedClaimsPath)) {
    const review = readJson(reviewedClaimsPath);
    return {
      source: 'privacy_workspace/external_policy_claims_review.json',
      extension_id: review.extension_id || 'unknown',
      external_privacy_policy_url: review.external_privacy_policy_url || 'unknown',
      claims: Array.isArray(review.final_claims) ? review.final_claims : [],
      review_summary: review.review_summary || {}
    };
  }
  if (fs.existsSync(claimsPath)) {
    const draft = readJson(claimsPath);
    return {
      source: 'privacy_workspace/external_policy_claims.json',
      extension_id: draft.extension_id || 'unknown',
      external_privacy_policy_url: draft.external_privacy_policy_url || 'unknown',
      claims: Array.isArray(draft.claims) ? draft.claims : [],
      review_summary: null
    };
  }
  return null;
}

function clauseIndex(policy) {
  const map = new Map();
  for (const clause of policy.clauses || []) {
    if (clause && clause.id) map.set(clause.id, clause);
  }
  return map;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasSensitiveCategory(claim) {
  const sensitive = new Set([
    'authentication_information',
    'personal_communications',
    'financial_and_payment_information',
    'health_information',
    'location',
    'website_content',
    'web_history'
  ]);
  return (claim.data_categories || []).some((category) => sensitive.has(category));
}

function readOptionalJson(file) {
  if (!fs.existsSync(file)) return null;
  return readJson(file);
}

function getObservedContradictions() {
  const externalComparison = readOptionalJson(externalComparisonPath);
  const privacyComparison = readOptionalJson(privacyComparisonPath);
  const externalUnderdeclared = Array.isArray(externalComparison?.underdeclared_external)
    ? externalComparison.underdeclared_external
    : [];
  const cwsUnderdeclared = Array.isArray(privacyComparison?.underdeclared)
    ? privacyComparison.underdeclared
    : [];
  return {
    hasObservedPrivacyContradiction: externalUnderdeclared.length > 0 || cwsUnderdeclared.length > 0,
    external_underdeclared_count: externalUnderdeclared.length,
    chrome_webstore_underdeclared_count: cwsUnderdeclared.length,
    observed_items: unique([
      ...externalUnderdeclared.map(item => item.observed_item),
      ...cwsUnderdeclared.map(item => item.observed_item)
    ])
  };
}

function isBroadNegativeUseOrStorageClaim(claim) {
  const text = String(claim.claim_text || '').toLowerCase();
  if (/\bbug reporter\b|\bsupport ticket\b|\bcontact request\b/.test(text)) return false;
  return /\bany\s+(?:data|information|details)\b|\buser\s+(?:data|information)\b|\bpersonal\s+(?:data|information)\b/.test(text);
}

function reviewClaim(claim, index, comparisonContext) {
  const rule = RULES[claim.claim_type] || {
    clauses: [],
    status: STATUS.NOT_ENOUGH,
    reason: 'No direct Google policy mapping rule exists for this external policy claim type.'
  };

  let status = rule.status;
  let reasoning = rule.reason;
  let extraClauses = [];
  let observedContradiction = null;

  const negativeClaimContradicted =
    claim.claim_type === 'no_collection_claim' ||
    (claim.claim_type === 'no_use_or_storage_claim' && isBroadNegativeUseOrStorageClaim(claim));

  if (negativeClaimContradicted && comparisonContext.hasObservedPrivacyContradiction) {
    status = STATUS.CONFIRMED_CONFLICT;
    extraClauses = ['CWS_LISTING_3'];
    observedContradiction = {
      source: 'privacy_workspace/external_privacy_comparison.json and/or privacy_workspace/privacy_comparison.json',
      external_underdeclared_count: comparisonContext.external_underdeclared_count,
      chrome_webstore_underdeclared_count: comparisonContext.chrome_webstore_underdeclared_count,
      observed_items: comparisonContext.observed_items
    };
    reasoning = 'The external policy claim says no data collection/use/storage, but the observed privacy comparisons found concrete privacy-relevant data flows. This is a direct disclosure conflict with Chrome Web Store accuracy and privacy disclosure requirements.';
  }

  if (claim.claim_type === 'advertising_or_marketing' && hasSensitiveCategory(claim)) {
    status = STATUS.POSSIBLE_CONFLICT;
    reasoning += ' The claim also references sensitive or browsing/content-related data categories, so the concern is stronger.';
  }

  if (claim.claim_type === 'third_party_sharing' && hasSensitiveCategory(claim)) {
    status = STATUS.POSSIBLE_CONFLICT;
    reasoning += ' The claim references sensitive or browsing/content-related data categories, making allowed-purpose and disclosure review more important.';
  }

  const policyEvidence = unique([...rule.clauses, ...extraClauses]).map((id) => {
    const clause = index.get(id);
    return {
      clause_id: id,
      area: clause ? clause.area : 'unknown',
      section: clause ? clause.section : 'unknown',
      requirement: clause ? clause.requirement : 'unknown policy clause id'
    };
  });

  return {
    claim_type: claim.claim_type,
    claim_text: claim.claim_text || claim.normalized_meaning || 'unknown',
    data_categories: claim.data_categories || [],
    policy_clause_ids: policyEvidence.map((entry) => entry.clause_id),
    status,
    reasoning,
    external_policy_evidence: claim.evidence || {},
    observed_contradiction_evidence: observedContradiction,
    policy_evidence: policyEvidence,
    limitations: [
      'This finding compares external privacy policy wording to Google policy clauses only.',
      'It does not prove that the extension performs the claimed behavior; observed behavior must be checked separately.',
      'A compliance concern is not a confirmed breach without code, disclosure, consent, and context evidence.'
    ]
  };
}

function summarize(reviews) {
  const summary = {
    claims_reviewed: reviews.length,
    findings_count: reviews.filter((review) => review.status !== STATUS.NO_CONFLICT).length,
    confirmed_policy_conflicts: 0,
    possible_policy_conflicts: 0,
    compliance_concerns: 0,
    not_enough_evidence: 0,
    no_conflict: 0
  };
  for (const review of reviews) {
    if (review.status === STATUS.CONFIRMED_CONFLICT) summary.confirmed_policy_conflicts += 1;
    else if (review.status === STATUS.POSSIBLE_CONFLICT) summary.possible_policy_conflicts += 1;
    else if (review.status === STATUS.CONCERN) summary.compliance_concerns += 1;
    else if (review.status === STATUS.NOT_ENOUGH) summary.not_enough_evidence += 1;
    else if (review.status === STATUS.NO_CONFLICT) summary.no_conflict += 1;
  }
  return summary;
}

function main() {
  const claimsReport = loadClaimsReport();
  if (!claimsReport) {
    console.log(`No external policy claims file found at ${reviewedClaimsPath} or ${claimsPath}; skipping Google policy comparison.`);
    return;
  }
  if (!fs.existsSync(policyPath)) {
    throw new Error(`Chrome Web Store policy snapshot not found: ${policyPath}`);
  }

  const policy = readJson(policyPath);
  const index = clauseIndex(policy);
  const claims = claimsReport.claims;
  const comparisonContext = getObservedContradictions();

  if (claims.length === 0) {
    console.log('External policy claims file contains no claims; skipping Google policy comparison.');
    return;
  }

  const claimReviews = claims.map((claim, i) => ({
    review_id: `EPGP-${String(i + 1).padStart(3, '0')}`,
    claim_id: claim.claim_id || `EPC-${String(i + 1).padStart(3, '0')}`,
    ...reviewClaim(claim, index, comparisonContext)
  }));

  const report = {
    extension_id: claimsReport.extension_id || 'unknown',
    external_privacy_policy_url: claimsReport.external_privacy_policy_url || 'unknown',
    source_policy: {
      name: 'Chrome Web Store Program Policies',
      source_url: policy.source_url || 'https://developer.chrome.com/docs/webstore/program-policies/policies',
      snapshot: 'docs/policies/chrome_webstore_program_policies.json',
      snapshot_date: policy.snapshot_date || 'unknown'
    },
    claims_source: claimsReport.source,
    claims_review_summary: claimsReport.review_summary,
    summary: summarize(claimReviews),
    claim_reviews: claimReviews,
    findings: claimReviews.filter((review) => review.status !== STATUS.NO_CONFLICT),
    limitations: [
      'This report checks developer policy text against Google policy clauses; it is not a source-code behavior report.',
      'Confirmed breaches require additional evidence from observed behavior, declarations, consent UI, store listing text, and context.',
      'Use external_policy_claims.json and external_privacy_comparison.json for the external-policy-vs-observed behavior comparison.'
    ]
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Wrote ${claimReviews.length} external-policy Google-policy review(s) to ${outPath}`);
}

main();
