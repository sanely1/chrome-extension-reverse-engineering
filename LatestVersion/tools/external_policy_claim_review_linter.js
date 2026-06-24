#!/usr/bin/env node
/*
 * Validates the LLM-reviewed external privacy policy claims file.
 *
 * The extractor creates external_policy_claims.json as a deterministic draft.
 * The LLM must then create external_policy_claims_review.json by confirming,
 * correcting, merging, or rejecting those draft claims. This linter checks the
 * review file shape and prevents accidental reuse of raw draft claims as final
 * reviewed claims.
 */

const fs = require('fs');
const path = require('path');

const workspace = process.argv[2] || './privacy_workspace';
const draftPath = path.join(workspace, 'external_policy_claims.json');
const reviewPath = path.join(workspace, 'external_policy_claims_review.json');

const allowedDecisions = new Set([
  'confirmed_claim',
  'corrected_claim',
  'merged_claim',
  'rejected_claim',
  'uncertain_claim'
]);

const allowedClaimTypes = new Set([
  'no_collection_claim',
  'no_use_or_storage_claim',
  'data_collection',
  'data_use',
  'local_processing',
  'storage_or_retention',
  'third_party_sharing',
  'sale_or_data_broker',
  'advertising_or_marketing',
  'creditworthiness_or_lending',
  'human_access',
  'security_handling',
  'other'
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function fail(message) {
  console.error(`[external-policy-claim-review-linter] ${message}`);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(draftPath)) {
    console.log(`[external-policy-claim-review-linter] SKIP: ${draftPath} does not exist.`);
    return;
  }
  if (!fs.existsSync(reviewPath)) {
    fail(`${reviewPath} is required when ${draftPath} exists.`);
  }

  const draft = readJson(draftPath);
  const review = readJson(reviewPath);
  const draftClaims = asArray(draft.claims);
  const reviewedClaims = asArray(review.reviewed_claims);
  const finalClaims = asArray(review.final_claims);

  if (!reviewedClaims.length) fail('reviewed_claims[] is empty.');
  if (!finalClaims.length && reviewedClaims.some(row => ['confirmed_claim', 'corrected_claim', 'merged_claim'].includes(row.decision))) {
    fail('final_claims[] is empty even though the review accepted one or more claims.');
  }

  const draftIds = new Set(draftClaims.map(claim => claim.claim_id).filter(Boolean));
  const finalIds = new Set(finalClaims.map(claim => claim.claim_id).filter(Boolean));
  const seenReviewIds = new Set();

  for (const [index, row] of reviewedClaims.entries()) {
    const where = `reviewed_claims[${index}]`;
    if (!row.draft_claim_id || !draftIds.has(row.draft_claim_id)) {
      fail(`${where} has missing or unknown draft_claim_id.`);
    }
    if (!allowedDecisions.has(row.decision)) {
      fail(`${where} has invalid decision '${row.decision}'.`);
    }
    if (!row.review_reason || String(row.review_reason).trim().length < 8) {
      fail(`${where} needs a review_reason.`);
    }
    if (seenReviewIds.has(row.draft_claim_id)) {
      fail(`${where} duplicates draft_claim_id ${row.draft_claim_id}. Use merged_claim and final_claim_refs instead.`);
    }
    const finalRefs = asArray(row.final_claim_refs);
    if (['confirmed_claim', 'corrected_claim', 'merged_claim'].includes(row.decision)) {
      if (!finalRefs.length) fail(`${where} accepted a draft claim but has empty final_claim_refs[].`);
      for (const ref of finalRefs) {
        if (!finalIds.has(ref)) fail(`${where} references unknown final claim '${ref}'.`);
      }
    }
    seenReviewIds.add(row.draft_claim_id);
  }

  for (const draftId of draftIds) {
    if (!seenReviewIds.has(draftId)) fail(`draft claim ${draftId} was not reviewed.`);
  }

  const seenFinalIds = new Set();
  for (const [index, claim] of finalClaims.entries()) {
    const where = `final_claims[${index}]`;
    if (!claim.claim_id) fail(`${where} is missing claim_id.`);
    if (seenFinalIds.has(claim.claim_id)) fail(`${where} duplicates claim_id ${claim.claim_id}.`);
    seenFinalIds.add(claim.claim_id);
    const sourceDraftIds = asArray(claim.source_draft_claim_ids);
    if (!sourceDraftIds.length) fail(`${where} needs source_draft_claim_ids[].`);
    for (const draftId of sourceDraftIds) {
      if (!draftIds.has(draftId)) fail(`${where} references unknown source draft claim '${draftId}'.`);
    }
    if (!allowedClaimTypes.has(claim.claim_type)) fail(`${where} has invalid claim_type '${claim.claim_type}'.`);
    if (!claim.claim_text || String(claim.claim_text).trim().length < 8) fail(`${where} needs claim_text.`);
    if (!claim.evidence || !claim.evidence.excerpt) fail(`${where} needs evidence.excerpt.`);
    if (!claim.review_source || !String(claim.review_source).includes('external_policy_claims_review')) {
      fail(`${where} must mark review_source as external_policy_claims_review.`);
    }
  }

  console.log(`[external-policy-claim-review-linter] OK: ${reviewedClaims.length} draft claims reviewed, ${finalClaims.length} final claims.`);
}

main();
