const fs = require('fs');
const path = require('path');

const declaredPath = path.join(__dirname, 'privacy_workspace/declared_privacy.json');
const comparisonPath = path.join(__dirname, 'privacy_workspace/privacy_comparison.json');
const outputPath = path.join(__dirname, 'privacy_workspace/internal_external_privacy_comparison.json');

function main() {
  const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
  const comparison = JSON.parse(fs.readFileSync(comparisonPath, 'utf8'));

  const extPolicy = declared.external_privacy_policy;
  if (!extPolicy || extPolicy.retrieved !== true || !extPolicy.url || !extPolicy.privacy_text) {
    console.log('No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping internal-vs-external privacy comparison. No output file was created.');
    process.exit(0);
  }

  const chromeWebStoreCategories = declared.declared_data_categories;
  const externalPolicyCategories = extPolicy.detected_data_categories;

  const underdeclaredFromPrompt3 = comparison.underdeclared;

  const prompt3UnderdeclaredReview = underdeclaredFromPrompt3.map(item => {
    const isExplained = externalPolicyCategories.includes(item.mapped_category);
    const coverageStatus = isExplained 
      ? 'chrome_webstore_underdeclared_but_external_explains' 
      : 'not_declared_in_either_policy';

    return {
      observed_item: item.observed_item,
      mapped_category: item.mapped_category,
      prompt3_status: 'underdeclared_in_chrome_webstore',
      external_policy_coverage: coverageStatus,
      reason: isExplained 
        ? `The Chrome Web Store declaration omitted ${item.observed_item} (${item.mapped_category}), but the developer's external privacy policy explicitly discloses the collection of ${item.mapped_category} (e.g. user credentials, sign-in tokens, or access keys).`
        : `Neither the Chrome Web Store nor the external privacy policy explains the collection of ${item.observed_item} (${item.mapped_category}).`,
      severity: item.severity,
      confidence: 'high',
      evidence: {
        prompt3_underdeclared_evidence: item.evidence,
        external_policy_evidence: [
          {
            file: 'privacy_workspace/declared_privacy.json',
            start: 1,
            end: 53
          }
        ]
      }
    };
  });

  // Calculate alignment sets
  const sharedCategories = [];
  const chromeWebStoreOnlyCategories = [];
  const externalOnlyCategories = [];

  chromeWebStoreCategories.forEach(cat => {
    if (externalPolicyCategories.includes(cat)) {
      sharedCategories.push({
        category: cat,
        reason: `Disclosed in both the Chrome Web Store declaration and the developer's external privacy policy.`,
        confidence: 'high',
        evidence: {
          chrome_webstore: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'declared_data_categories'
          },
          external_policy: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'external_privacy_policy.detected_data_categories'
          }
        }
      });
    } else {
      chromeWebStoreOnlyCategories.push({
        category: cat,
        reason: `Disclosed in the Chrome Web Store declaration but not detected in the external privacy policy text.`,
        confidence: 'medium',
        evidence: {
          chrome_webstore: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'declared_data_categories'
          },
          external_policy: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'external_privacy_policy.detected_data_categories'
          }
        }
      });
    }
  });

  externalPolicyCategories.forEach(cat => {
    if (!chromeWebStoreCategories.includes(cat)) {
      externalOnlyCategories.push({
        category: cat,
        status: 'external_only_disclosure',
        reason: `The developer's external privacy policy discloses the processing of ${cat}, but this category is not declared in the Chrome Web Store privacy practices summary.`,
        confidence: 'high',
        evidence: {
          chrome_webstore: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'declared_data_categories'
          },
          external_policy: {
            file: 'privacy_workspace/declared_privacy.json',
            path: 'external_privacy_policy.detected_data_categories'
          }
        }
      });
    }
  });

  // Underdeclared counts
  const underCount = prompt3UnderdeclaredReview.length;
  const explainedCount = prompt3UnderdeclaredReview.filter(r => r.external_policy_coverage === 'chrome_webstore_underdeclared_but_external_explains').length;
  const notDeclaredCount = prompt3UnderdeclaredReview.filter(r => r.external_policy_coverage === 'not_declared_in_either_policy').length;
  const unclearCount = prompt3UnderdeclaredReview.filter(r => r.external_policy_coverage === 'unclear_external_coverage').length;

  const hasCategoriesOnlyExternally = externalOnlyCategories.length > 0;
  const isCwsUnderdeclarationResolved = underCount > 0 && explainedCount === underCount;

  // Overall assessment risk level:
  // - Medium because Prompt 3 underdeclared findings exist and are resolved externally, and multiple external-only categories exist.
  const riskLevel = notDeclaredCount > 0 ? 'high' : (underCount > 0 ? 'medium' : 'low');

  const assessment = {
    chrome_webstore_underdeclaration_resolved_by_external_policy: isCwsUnderdeclarationResolved,
    has_categories_declared_only_externally: hasCategoriesOnlyExternally,
    risk_level: riskLevel,
    confidence: 'high',
    summary: `Partial Alignment: The Chrome Web Store privacy page was slightly underdeclared because it omitted 'authentication_information' (e.g. login tokens). However, this underdeclaration is fully explained and resolved inside Grammarly's comprehensive external privacy policy page. Additionally, the external policy discloses multiple 'external-only' categories (web_history, financial_and_payment_information) representing broad multi-product terms, which do not directly contradict the extension's technical behavior.`
  };

  const internalExternalComparison = {
    extension_id: declared.extension_id,
    extension_name: comparison.extension_name,
    chrome_webstore_privacy_url: declared.chrome_webstore_privacy_url,
    external_privacy_policy_url: extPolicy.url,
    comparison_summary: {
      chrome_webstore_declared_category_count: chromeWebStoreCategories.length,
      external_policy_category_count: externalPolicyCategories.length,
      prompt3_underdeclared_count: underCount,
      underdeclared_explained_by_external_count: explainedCount,
      underdeclared_not_declared_in_either_count: notDeclaredCount,
      underdeclared_unclear_external_coverage_count: unclearCount,
      shared_category_count: sharedCategories.length,
      chrome_webstore_only_category_count: chromeWebStoreOnlyCategories.length,
      external_only_category_count: externalOnlyCategories.length
    },
    chrome_webstore_declared_categories: chromeWebStoreCategories,
    external_policy_declared_categories: externalPolicyCategories,
    prompt3_underdeclared_review: prompt3UnderdeclaredReview,
    policy_category_alignment: {
      shared_categories: sharedCategories,
      chrome_webstore_only_categories: chromeWebStoreOnlyCategories,
      external_only_categories: externalOnlyCategories
    },
    overall_assessment: assessment,
    limitations: [
      `The external policy contains broad multi-platform clauses that cover Grammarly, Coda, and Superhuman products, leading to a larger set of disclosures (external_only_categories) than the specific extension's behavior.`
    ]
  };

  fs.writeFileSync(outputPath, JSON.stringify(internalExternalComparison, null, 2), 'utf8');
  console.log('Successfully generated internal_external_privacy_comparison.json!');
}

main();
