# Chrome Web Store Program Policies Snapshot

Source URL: https://developer.chrome.com/docs/webstore/program-policies/policies
Official page last updated: 2025-05-22 UTC
Local snapshot date: 2026-06-14

This local file is the human-readable policy reference for the policy-compliance stage.
The machine-readable source of truth for analysis is:

- `docs/policies/chrome_webstore_program_policies.json`
- `docs/policies/policy_signal_mapping.json`

The structured JSON intentionally breaks the policy page into stable clause IDs. Use those
IDs in `policy_compliance_report.json` instead of vague references such as "Google policy".

## Analysis Use

Policy analysis must not treat every technical risk as a confirmed policy breach. The report
must build an argument from:

1. observed code behavior;
2. direct source evidence from the extension;
3. source finding references such as `observed_privacy_data:*`, `risk:*`, `workflow:*`,
   `endpoint:*`, `message:*`, `storage:*`, `permission:*`, or `privacy_comparison:*`;
4. a specific policy clause ID;
5. declared Chrome Web Store privacy data when available;
6. external privacy policy comparison when available;
7. confidence and missing information.

Allowed policy finding statuses:

- `confirmed_breach`
- `likely_breach`
- `possible_breach`
- `compliance_concern`
- `not_enough_evidence`
- `not_applicable`

Use `confirmed_breach` only when the code behavior and disclosure/policy evidence together
show a concrete conflict with a Chrome Web Store Program Policy. If the code shows sensitive
behavior but the store listing, consent screen, privacy policy, or developer dashboard fields
are unavailable, prefer `possible_breach`, `compliance_concern`, or `not_enough_evidence`.

Avoid absolute compliance language such as "fully compliant", "fully conforms", or "this is
compliant" unless code evidence and disclosure/declaration/policy evidence are all available
and consistent. Prefer cautious phrasing such as "available evidence does not show a
client-side violation" when inputs are incomplete.

## High-Value Policy Areas For Extension Analysis

- Privacy policy accuracy and completeness.
- Limited Use rules for browsing activity, user data, third-party transfers, human access,
  advertising, data brokers, and credit/lending use.
- Narrowest-necessary permission use.
- Disclosure and affirmative consent for user data not closely related to the prominent
  product functionality.
- Secure handling, modern cryptography in transit, and authentication information protection.
- Malicious/prohibited products such as spyware, malicious scripts, phishing, unauthorized
  access, copyrighted media access, and cryptocurrency mining.
- Marketing, installation, misleading behavior, ads, affiliate links, cookie updates, and
  URL/code injection transparency.
- Listing accuracy, privacy field accuracy, single purpose, spam/abuse, notification abuse,
  and user-sent messages.
- Technical requirements, including code readability, API use, and Manifest V3 restrictions
  on remote logic.
