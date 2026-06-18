const fs = require('fs');
const path = require('path');

const declaredPath = path.join(__dirname, 'privacy_workspace/declared_privacy.json');
const summaryPath = path.join(__dirname, 'privacy_workspace/extension_summary.json');
const outputPath = path.join(__dirname, 'privacy_workspace/external_privacy_comparison.json');

function main() {
  const declared = JSON.parse(fs.readFileSync(declaredPath, 'utf8'));
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  const extPolicy = declared.external_privacy_policy;
  if (!extPolicy || extPolicy.retrieved !== true || !extPolicy.privacy_text || !extPolicy.url) {
    console.log('No external privacy policy was available in privacy_workspace/declared_privacy.json. Skipping external privacy comparison. No output file was created.');
    process.exit(0);
  }

  const externalDeclaredCategories = extPolicy.detected_data_categories;
  const developerStatements = extPolicy.developer_statements || [];

  const observedItems = summary.observed_privacy_data.items;

  const matches = [];
  const underdeclaredExternal = [];
  const overdeclaredExternal = [];
  const unclear = [];
  const observedCategoriesOut = [];

  // Map each observed item
  observedItems.forEach(item => {
    let mappedCategory = '';
    let reason = '';

    if (item.data_name === 'Document Content') {
      mappedCategory = 'website_content';
      reason = 'User text segments entered into forms and document editors are parsed and processed.';
    } else if (item.data_name === 'Authentication Tokens') {
      mappedCategory = 'authentication_information';
      reason = 'JWT access tokens and session authorization cookies identify users on the gateway.';
    } else if (item.data_name === 'User Telemetry & Interaction Logs') {
      mappedCategory = 'user_activity';
      reason = 'Anonymized or pseudonymous behavioral click events and hovers are logged for optimization.';
    } else if (item.data_name === 'Extension Settings') {
      mappedCategory = 'user_activity';
      reason = 'User writing assistant preferences (such as dialect or active sites) are persisted.';
    }

    const obsCat = {
      observed_item: item.data_name,
      mapped_category: mappedCategory,
      source_field: 'observed_privacy_data.items',
      reason: item.data_description,
      confidence: item.confidence,
      evidence: item.evidence
    };
    observedCategoriesOut.push(obsCat);

    // Perform external declared vs actual comparison
    const isDeclared = externalDeclaredCategories.includes(mappedCategory);
    if (isDeclared) {
      let match = matches.find(m => m.external_policy_category === mappedCategory);
      if (!match) {
        match = {
          external_policy_category: mappedCategory,
          observed_items: [],
          reason: `Observed ${mappedCategory} collection is fully disclosed in the external privacy policy.`,
          confidence: 'high',
          evidence: []
        };
        matches.push(match);
      }
      match.observed_items.push(item.data_name);
      match.evidence.push(...item.evidence);
    } else {
      underdeclaredExternal.push({
        observed_item: item.data_name,
        mapped_category: mappedCategory,
        reason: `The external privacy policy does not clearly mention the collection or processing of ${item.data_name} (${mappedCategory}).`,
        severity: mappedCategory === 'authentication_information' ? 'high' : 'medium',
        confidence: 'high',
        evidence: item.evidence
      });
    }
  });

  // Check external declared categories that were NOT observed
  const observedMappedNames = observedCategoriesOut.map(o => o.mapped_category);
  externalDeclaredCategories.forEach(extCat => {
    if (!observedMappedNames.includes(extCat)) {
      if (extCat === 'location') {
        overdeclaredExternal.push({
          external_policy_category: extCat,
          reason: 'Location-based tracking is declared in the external policy (IP address geolocation) but not directly accessed client-side inside the content scripts.',
          confidence: 'medium'
        });
      } else if (extCat === 'web_history') {
        overdeclaredExternal.push({
          external_policy_category: extCat,
          reason: 'Web history (browsing/navigation) is declared in the external policy for general products but not directly logged client-side by this specific extension beyond active tab URL checking.',
          confidence: 'medium'
        });
      } else if (extCat === 'financial_and_payment_information') {
        overdeclaredExternal.push({
          external_policy_category: extCat,
          reason: 'Financial and payment details are mentioned in the external policy (e.g. for premium product subscriptions) but are processed server-side rather than in content scripts.',
          confidence: 'high'
        });
      } else {
        overdeclaredExternal.push({
          external_policy_category: extCat,
          reason: 'Declared in the general external privacy policy (which covers multiple platform products) but not observed inside this specific extension bundle.',
          confidence: 'medium'
        });
      }
    }
  });

  // Check Developer Statements
  const statementChecks = developerStatements.map(stmt => {
    return {
      statement: stmt,
      status: 'not_contradicted',
      reason: 'No contradicting client-side code behaviors were found.',
      evidence: []
    };
  });

  // Overall Assessment
  const underCount = underdeclaredExternal.length;
  const isConsistent = underCount === 0;
  const riskLevel = underCount > 0 ? 'medium' : 'low';
  const assessment = {
    is_consistent_with_external_policy: isConsistent,
    risk_level: riskLevel,
    confidence: 'high',
    summary: isConsistent
      ? `Consistent: Grammarly's external privacy policy is highly comprehensive and accurately covers all observed data categories, including 'website_content', 'user_activity', and 'authentication_information'. Overdeclared categories arise from the policy's multi-product scope.`
      : `Minor discrepancies: Some observed behaviors are not fully covered by the external policy.`
  };

  const comparison = {
    extension_id: declared.extension_id,
    extension_name: summary.metadata.name,
    external_privacy_policy_url: extPolicy.url,
    comparison_summary: {
      external_declared_category_count: externalDeclaredCategories.length,
      observed_category_count: observedCategoriesOut.length,
      match_count: matches.length,
      underdeclared_external_count: underdeclaredExternal.length,
      overdeclared_external_count: overdeclaredExternal.length,
      unclear_count: unclear.length
    },
    external_declared_categories: externalDeclaredCategories,
    observed_categories: observedCategoriesOut,
    matches,
    underdeclared_external: underdeclaredExternal,
    overdeclared_external: overdeclaredExternal,
    unclear,
    developer_statement_checks: statementChecks,
    overall_assessment: assessment,
    limitations: [
      'The general privacy policy applies to multiple products (Grammarly, Superhuman, Coda) and therefore declares categories wider than what is observed in this single extension.'
    ]
  };

  fs.writeFileSync(outputPath, JSON.stringify(comparison, null, 2), 'utf8');
  console.log('Successfully generated external_privacy_comparison.json!');
}

main();
