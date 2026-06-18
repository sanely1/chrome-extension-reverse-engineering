import json
import sys
import time
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright


# IMPORTANT:
# Chrome Web Store privacy page must be detected with STRICT exact category labels only.
# Do NOT use broad words such as "activity" or "usage" for Chrome Web Store detection,
# because the standard page text contains "collection and usage of your data",
# which can falsely trigger user_activity.
CWS_CATEGORY_MAP = {
    "personally_identifiable_information": [
        "personally identifiable information"
    ],
    "health_information": [
        "health information"
    ],
    "financial_and_payment_information": [
        "financial and payment information"
    ],
    "authentication_information": [
        "authentication information"
    ],
    "personal_communications": [
        "personal communications"
    ],
    "location": [
        "location"
    ],
    "web_history": [
        "web history"
    ],
    "user_activity": [
        "user activity"
    ],
    "website_content": [
        "website content"
    ]
}


# External privacy policies are free-form text, so broader phrases are useful here.
# This map is ONLY used for external_privacy_policy.detected_data_categories.
EXTERNAL_CATEGORY_MAP = {
    "personally_identifiable_information": [
        "personally identifiable information",
        "personal identifiers",
        "name",
        "email address",
        "account information",
        "profile information",
        "user id",
        "user identifier"
    ],
    "health_information": [
        "health information",
        "medical history",
        "symptoms",
        "diagnoses"
    ],
    "financial_and_payment_information": [
        "financial and payment information",
        "payment information",
        "credit card",
        "billing",
        "transactions",
        "payment details",
        "card details",
        "stripe"
    ],
    "authentication_information": [
        "authentication information",
        "password",
        "credentials",
        "login",
        "sign in",
        "sign-in",
        "account creation",
        "authentication",
        "auth token",
        "session token"
    ],
    "personal_communications": [
        "personal communications",
        "emails",
        "text messages",
        "chat messages",
        "social media posts",
        "messages"
    ],
    "location": [
        "location",
        "ip address",
        "city",
        "country",
        "region",
        "gps",
        "approximate your location",
        "weather data"
    ],
    "web_history": [
        "web history",
        "browsing history",
        "web pages",
        "pages you visit",
        "page title",
        "time of visit",
        "open tabs",
        "root domain",
        "most visited websites"
    ],
    "user_activity": [
        "user activity",
        "feature usage",
        "usage data",
        "how you use",
        "how our users access and use",
        "pages you view",
        "buttons you tap",
        "clicks",
        "mouse position",
        "scroll",
        "keystroke",
        "analytics",
        "posthog",
        "a/b testing",
        "event tracking"
    ],
    "website_content": [
        "website content",
        "inputted content",
        "to-dos",
        "notes",
        "links",
        "countdowns",
        "daily focus",
        "text",
        "images",
        "sounds",
        "videos",
        "hyperlinks",
        "songs you identify",
        "songs were recognized",
        "tab audio",
        "audio",
        "selected text",
        "page content"
    ]
}


CWS_DEVELOPER_STATEMENTS_MAP = {
    "not_sold_to_third_parties": [
        "not being sold to third parties"
    ],
    "not_used_for_unrelated_purposes": [
        "not being used or transferred for purposes that are unrelated"
    ],
    "not_used_for_creditworthiness": [
        "not being used or transferred to determine creditworthiness"
    ]
}


EXTERNAL_DEVELOPER_STATEMENTS_MAP = {
    "not_sold_to_third_parties": [
        "not being sold to third parties",
        "not sold to third parties",
        "not sell",
        "do not sell",
        "isn't sold",
        "is not sold",
        "never been sold"
    ],
    "not_used_for_unrelated_purposes": [
        "not being used or transferred for purposes that are unrelated",
        "not used for unrelated purposes",
        "only used to",
        "solely",
        "necessary for providing the service",
        "solely for core functionality"
    ],
    "not_used_for_creditworthiness": [
        "not being used or transferred to determine creditworthiness",
        "not used to determine creditworthiness",
        "creditworthiness"
    ]
}


def log(message):
    print(f"[INFO] {message}", flush=True)


def log_warning(message):
    print(f"[WARNING] {message}", flush=True)


def log_error(message):
    print(f"[ERROR] {message}", flush=True)


def normalize(text):
    return " ".join((text or "").lower().strip().split())


def extract_privacy_section(full_text):
    log("Extracting Chrome Web Store privacy section...")

    start_marker = "Privacy practices"
    end_marker = "About Chrome Web Store"

    start_index = full_text.find(start_marker)

    if start_index == -1:
        log_warning("Could not find 'Privacy practices' marker. Using full page text.")
        return full_text.strip()

    end_index = full_text.find(end_marker, start_index)

    if end_index == -1:
        log_warning("Could not find end marker. Using text from 'Privacy practices' to the end.")
        return full_text[start_index:].strip()

    log("Chrome Web Store privacy section extracted.")
    return full_text[start_index:end_index].strip()


def detect_categories(text, category_map, source_name):
    log(f"Detecting data categories in {source_name}...")

    found = []
    normalized_text = normalize(text)

    for category, variants in category_map.items():
        for variant in variants:
            if normalize(variant) in normalized_text:
                found.append(category)
                break

    log(f"Detected categories in {source_name}: {found}")
    return found


def detect_developer_statements(text, statement_map, source_name):
    log(f"Detecting developer statements in {source_name}...")

    found = []
    normalized_text = normalize(text)

    for statement, variants in statement_map.items():
        for variant in variants:
            if normalize(variant) in normalized_text:
                found.append(statement)
                break

    log(f"Detected developer statements in {source_name}: {found}")
    return found


def click_consent_in_frame(frame):
    button_names = [
        "Accept all",
        "Accept All",
        "Reject all",
        "Reject All",
        "I agree",
        "Agree",
        "Allow all",
        "Continue",
        "OK",
        "Got it",
        "Alle akzeptieren",
        "Alle ablehnen",
        "Akzeptieren",
        "Ablehnen"
    ]

    for name in button_names:
        try:
            frame.get_by_role("button", name=name).click(timeout=500)
            log(f"Clicked consent button: {name}")
            return True
        except:
            pass

    return False


def handle_google_consent(page):
    log("Checking for Google consent page...")

    time.sleep(2)

    if click_consent_in_frame(page):
        time.sleep(4)
        log("Google consent handled on main page.")
        return True

    max_frames_to_check = 5

    for index, frame in enumerate(page.frames[:max_frames_to_check]):
        log(f"Checking Google consent iframe {index + 1}/{min(len(page.frames), max_frames_to_check)}...")

        try:
            if click_consent_in_frame(frame):
                time.sleep(4)
                log("Google consent handled inside iframe.")
                return True
        except:
            pass

    log("No Google consent button clicked.")
    return False


def handle_generic_consent(page):
    log("Checking for generic cookie/consent popup...")

    time.sleep(1)

    try:
        if click_consent_in_frame(page):
            time.sleep(1)
            log("Generic consent handled on main page.")
            return True
    except:
        pass

    max_frames_to_check = 5

    for index, frame in enumerate(page.frames[:max_frames_to_check]):
        log(f"Checking generic consent iframe {index + 1}/{min(len(page.frames), max_frames_to_check)}...")

        try:
            if click_consent_in_frame(frame):
                time.sleep(1)
                log("Generic consent handled inside iframe.")
                return True
        except:
            pass

    log("No generic consent popup handled.")
    return False


def wait_until_not_consent_page(page, url):
    log("Checking if Chrome Web Store redirected to Google consent page...")

    for attempt in range(5):
        log(f"Consent check attempt {attempt + 1}/5...")

        text = page.locator("body").inner_text(timeout=30000)

        if "Before you continue to Google" not in text:
            log("Page is not Google consent page. Continuing.")
            return True

        log_warning("Google consent page detected. Trying to handle consent...")
        handle_google_consent(page)

        log("Reloading Chrome Web Store privacy page after consent handling...")
        page.goto(url, wait_until="networkidle", timeout=60000)
        time.sleep(5)

    log_warning("Could not fully confirm that Google consent page disappeared.")
    return False


def is_external_url(href):
    if not href:
        return False

    parsed = urlparse(href)

    if parsed.scheme not in ["http", "https"]:
        return False

    hostname = parsed.hostname or ""

    blocked_hosts = [
        "chromewebstore.google.com",
        "accounts.google.com",
        "policies.google.com",
        "support.google.com",
        "myaccount.google.com",
        "google.com"
    ]

    for blocked_host in blocked_hosts:
        if hostname == blocked_host or hostname.endswith("." + blocked_host):
            return False

    return True


def find_external_privacy_policy_url(page):
    log("Searching for external privacy policy link on Chrome Web Store page...")

    candidates = []

    try:
        links = page.locator("a").all()
        log(f"Found {len(links)} links on the page.")
    except:
        log_warning("Could not read page links.")
        return None

    for link in links:
        try:
            link_text = normalize(link.inner_text(timeout=500))
            href = link.get_attribute("href")
        except:
            continue

        if not href:
            continue

        href = urljoin(page.url, href)

        if not is_external_url(href):
            continue

        href_normalized = normalize(href)

        score = 0

        if link_text == "privacy policy":
            score += 100

        if "privacy policy" in link_text:
            score += 80

        if "privacy" in link_text:
            score += 50

        if "privacy" in href_normalized:
            score += 30

        if "policy" in href_normalized:
            score += 10

        if score > 0:
            candidate = {
                "score": score,
                "url": href,
                "text": link_text
            }

            candidates.append(candidate)
            log(f"External privacy candidate found: score={score}, text='{link_text}', url={href}")

    if not candidates:
        log_warning("No external privacy policy link found.")
        return None

    candidates.sort(key=lambda item: item["score"], reverse=True)

    best_candidate = candidates[0]

    log(f"Selected external privacy policy URL: {best_candidate['url']}")
    return best_candidate["url"]


def fetch_external_privacy_policy(context, external_url):
    log(f"Opening external privacy policy: {external_url}")

    page = context.new_page()

    try:
        log("Navigating to external privacy policy page...")
        page.goto(external_url, wait_until="domcontentloaded", timeout=60000)

        time.sleep(2)

        try:
            handle_generic_consent(page)
        except Exception as error:
            log_warning(f"Consent handling skipped because of error: {error}")

        try:
            log("Waiting for external privacy policy page network idle...")
            page.wait_for_load_state("networkidle", timeout=10000)
        except:
            log_warning("Network idle timeout on external privacy policy page. Continuing anyway.")

        time.sleep(1)

        log("Extracting external privacy policy text...")
        external_text = page.locator("body").inner_text(timeout=30000).strip()

        log(f"External privacy policy text length: {len(external_text)} characters.")

        result = {
            "url": external_url,
            "final_url": page.url,
            "retrieved": True,
            "error": None,
            "detected_data_categories": detect_categories(
                external_text,
                EXTERNAL_CATEGORY_MAP,
                "external privacy policy"
            ),
            "developer_statements": detect_developer_statements(
                external_text,
                EXTERNAL_DEVELOPER_STATEMENTS_MAP,
                "external privacy policy"
            ),
            "privacy_text": external_text
        }

        page.close()

        log("External privacy policy successfully retrieved.")
        return result

    except Exception as error:
        log_error(f"Failed to retrieve external privacy policy: {error}")

        try:
            page.close()
        except:
            pass

        return {
            "url": external_url,
            "final_url": None,
            "retrieved": False,
            "error": str(error),
            "detected_data_categories": [],
            "developer_statements": [],
            "privacy_text": ""
        }


def fetch(extension_id):
    log("Starting privacy extraction script...")
    log(f"Extension ID: {extension_id}")

    url = f"https://chromewebstore.google.com/detail/{extension_id}/privacy"

    log(f"Chrome Web Store privacy URL: {url}")

    with sync_playwright() as p:
        log("Launching Chromium browser...")

        browser = p.chromium.launch(headless=True)

        log("Creating browser context...")

        context = browser.new_context(
            locale="en-US",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )

        page = context.new_page()

        log("Opening Chrome Web Store privacy page...")

        page.goto(url, wait_until="networkidle", timeout=60000)

        log("Chrome Web Store privacy page loaded.")

        wait_until_not_consent_page(page, url)

        log("Waiting for page content to stabilize...")
        time.sleep(5)

        log("Extracting full Chrome Web Store page text...")
        full_text = page.locator("body").inner_text(timeout=30000)

        log(f"Full Chrome Web Store page text length: {len(full_text)} characters.")

        privacy_text = extract_privacy_section(full_text)

        log(f"Chrome Web Store privacy text length: {len(privacy_text)} characters.")

        external_privacy_policy_url = find_external_privacy_policy_url(page)

        if external_privacy_policy_url:
            log("External privacy policy link found. Fetching external policy...")
            external_privacy_policy = fetch_external_privacy_policy(
                context,
                external_privacy_policy_url
            )
        else:
            log_warning("External privacy policy link was not found. Saving empty external policy object.")
            external_privacy_policy = {
                "url": None,
                "final_url": None,
                "retrieved": False,
                "error": "No external privacy policy link found on Chrome Web Store privacy page.",
                "detected_data_categories": [],
                "developer_statements": [],
                "privacy_text": ""
            }

        log("Closing browser...")
        browser.close()

    log("Detecting Chrome Web Store categories and developer statements...")

    # CRITICAL FIX:
    # Chrome Web Store detection uses CWS_CATEGORY_MAP only.
    # External-policy broad keywords are not used here.
    categories = detect_categories(
        privacy_text,
        CWS_CATEGORY_MAP,
        "Chrome Web Store privacy page"
    )

    developer_statements = detect_developer_statements(
        privacy_text,
        CWS_DEVELOPER_STATEMENTS_MAP,
        "Chrome Web Store privacy page"
    )

    result = {
        "extension_id": extension_id,
        "url": url,
        "chrome_webstore_privacy_url": url,
        "retrieved_at": datetime.now(timezone.utc).isoformat(),

        "declared_data_categories": categories,
        "developer_statements": developer_statements,
        "privacy_text": privacy_text,

        "chrome_webstore": {
            "url": url,
            "declared_data_categories": categories,
            "developer_statements": developer_statements,
            "privacy_text": privacy_text
        },

        "external_privacy_policy": external_privacy_policy
    }

    output_dir = Path(__file__).parent / "privacy_workspace"

    log(f"Creating output directory if needed: {output_dir.resolve()}")

    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "declared_privacy.json"

    log(f"Writing result JSON to: {output_path.resolve()}")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print()
    print("DONE")
    print("Chrome Web Store categories:", categories)
    print("Chrome Web Store developer statements:", developer_statements)
    print("External privacy policy URL:", external_privacy_policy.get("url"))
    print("External privacy policy retrieved:", external_privacy_policy.get("retrieved"))
    print("External privacy policy categories:", external_privacy_policy.get("detected_data_categories"))
    print("External privacy policy developer statements:", external_privacy_policy.get("developer_statements"))
    print("Saved JSON:", output_path.resolve())


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_privacy.py <extension_id>")
        sys.exit()

    fetch(sys.argv[1])
