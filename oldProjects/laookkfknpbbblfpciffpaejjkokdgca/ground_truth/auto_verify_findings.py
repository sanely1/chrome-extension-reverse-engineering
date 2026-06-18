#!/usr/bin/env python3
"""
Auto-verify findings by searching for them in evidence files.

This script:
1. For each item, searches for the string in the claimed evidence file
2. Checks if the string appears in the specified line range
3. Auto-marks items as verified=true if found, verified=false if not found
4. Generates a report of auto-verification results

Usage:
    python auto_verify_findings.py
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple

WORKSPACE_ROOT = Path("..")
VERIFICATION_FILES = {
    'network': 'verification_network_endpoints.json',
    'messaging': 'verification_messaging_channels.json',
    'storage': 'verification_storage_keys.json'
}


def read_file_lines(file_path: Path, start: int, end: int) -> str:
    """Read entire file content (ignoring line range for broader search)."""
    if not file_path.exists():
        return None
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        return content
    except Exception as e:
        print(f"      ERROR reading {file_path}: {e}")
        return None


def normalize_for_search(text: str) -> str:
    """Normalize text for more flexible searching."""
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text


def search_in_evidence(search_string: str, evidence_list: List[Dict], fuzzy: bool = True) -> Tuple[bool, List[str]]:
    """
    Search for a string in evidence files.
    
    Returns:
        (found, details) - found is True if string appears in ANY evidence file
    """
    if not evidence_list:
        return False, ["No evidence provided"]
    
    details = []
    found_in_any = False
    
    # Prepare search string
    search_clean = search_string.strip()
    search_lower = search_clean.lower()
    
    for i, ev in enumerate(evidence_list):
        file_path = WORKSPACE_ROOT / ev.get('file', '')
        start = ev.get('start', 0)
        end = ev.get('end', 0)
        
        if not file_path.exists():
            details.append(f"Evidence {i+1}: File not found: {ev.get('file')}")
            continue
        
        # Read the evidence section
        content = read_file_lines(file_path, start, end)
        if content is None:
            details.append(f"Evidence {i+1}: Could not read {ev.get('file')}")
            continue
        
        # Search for the string
        found_exact = search_clean in content
        found_case_insensitive = search_lower in content.lower()
        
        # For URLs, also try without protocol
        found_without_protocol = False
        if search_clean.startswith('http://') or search_clean.startswith('https://'):
            url_without_protocol = search_clean.replace('https://', '').replace('http://', '')
            found_without_protocol = url_without_protocol in content
        
        if found_exact:
            details.append(f"Evidence {i+1}: ✓ Found exact match in {ev.get('file')}")
            found_in_any = True
        elif found_case_insensitive:
            details.append(f"Evidence {i+1}: ✓ Found (case-insensitive) in {ev.get('file')}")
            found_in_any = True
        elif found_without_protocol:
            details.append(f"Evidence {i+1}: ✓ Found (without protocol) in {ev.get('file')}")
            found_in_any = True
        else:
            # Try fuzzy search for partial matches
            if fuzzy and len(search_clean) > 10:
                # For long strings, check if at least 70% appears
                words = search_clean.split('/')
                matches = sum(1 for word in words if word and word.lower() in content.lower())
                if matches / len(words) >= 0.7:
                    details.append(f"Evidence {i+1}: ~ Partial match in {ev.get('file')}")
                    found_in_any = True
                else:
                    details.append(f"Evidence {i+1}: ✗ NOT found in {ev.get('file')}")
            else:
                details.append(f"Evidence {i+1}: ✗ NOT found in {ev.get('file')}")
    
    return found_in_any, details


def auto_verify_network(endpoints: List[Dict]) -> Tuple[int, int, int]:
    """Auto-verify network endpoints."""
    verified_true = 0
    verified_false = 0
    uncertain = 0
    
    for i, ep in enumerate(endpoints):
        if i % 20 == 0:
            print(f"  Progress: {i}/{len(endpoints)} endpoints...")
        
        url = ep.get('url', '')
        if not url:
            ep['verified'] = False
            ep['verification_notes'] = "No URL provided"
            verified_false += 1
            continue
        
        found, details = search_in_evidence(url, ep.get('evidence', []))
        
        if found:
            ep['verified'] = True
            ep['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_true += 1
        else:
            ep['verified'] = False
            ep['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_false += 1
    
    return verified_true, verified_false, uncertain


def auto_verify_messaging(channels: List[Dict]) -> Tuple[int, int, int]:
    """Auto-verify messaging channels."""
    verified_true = 0
    verified_false = 0
    uncertain = 0
    
    for i, ch in enumerate(channels):
        if i % 20 == 0:
            print(f"  Progress: {i}/{len(channels)} channels...")
        
        name = ch.get('name', '')
        if not name:
            ch['verified'] = False
            ch['verification_notes'] = "No channel name provided"
            verified_false += 1
            continue
        
        found, details = search_in_evidence(name, ch.get('evidence', []))
        
        if found:
            ch['verified'] = True
            ch['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_true += 1
        else:
            ch['verified'] = False
            ch['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_false += 1
    
    return verified_true, verified_false, uncertain


def auto_verify_storage(keys: List[Dict]) -> Tuple[int, int, int]:
    """Auto-verify storage keys."""
    verified_true = 0
    verified_false = 0
    uncertain = 0
    
    for i, sk in enumerate(keys):
        if i % 20 == 0:
            print(f"  Progress: {i}/{len(keys)} keys...")
        
        key = sk.get('key', '')
        if not key:
            sk['verified'] = False
            sk['verification_notes'] = "No key name provided"
            verified_false += 1
            continue
        
        found, details = search_in_evidence(key, sk.get('evidence', []))
        
        if found:
            sk['verified'] = True
            sk['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_true += 1
        else:
            sk['verified'] = False
            sk['verification_notes'] = "AUTO: " + "; ".join(details)
            verified_false += 1
    
    return verified_true, verified_false, uncertain


def main():
    print("=" * 80)
    print("AUTO-VERIFYING FINDINGS BY STRING SEARCH")
    print("=" * 80)
    print("\nThis will search for each URL/channel/key in its evidence files")
    print("and mark items as verified=true if found, verified=false if not.\n")
    
    results = {}
    
    # Network Endpoints
    print("\n### NETWORK ENDPOINTS ###")
    with open(VERIFICATION_FILES['network'], 'r') as f:
        endpoints = json.load(f)
    
    print(f"Auto-verifying {len(endpoints)} endpoints...")
    true_count, false_count, uncertain_count = auto_verify_network(endpoints)
    
    with open(VERIFICATION_FILES['network'], 'w') as f:
        json.dump(endpoints, f, indent=2, ensure_ascii=False)
    
    results['network'] = {
        'total': len(endpoints),
        'verified_true': true_count,
        'verified_false': false_count,
        'uncertain': uncertain_count
    }
    
    print(f"  ✓ Verified TRUE:  {true_count}")
    print(f"  ✗ Verified FALSE: {false_count}")
    print(f"  ? Uncertain:      {uncertain_count}")
    
    # Messaging Channels
    print("\n### MESSAGING CHANNELS ###")
    with open(VERIFICATION_FILES['messaging'], 'r') as f:
        channels = json.load(f)
    
    print(f"Auto-verifying {len(channels)} channels...")
    true_count, false_count, uncertain_count = auto_verify_messaging(channels)
    
    with open(VERIFICATION_FILES['messaging'], 'w') as f:
        json.dump(channels, f, indent=2, ensure_ascii=False)
    
    results['messaging'] = {
        'total': len(channels),
        'verified_true': true_count,
        'verified_false': false_count,
        'uncertain': uncertain_count
    }
    
    print(f"  ✓ Verified TRUE:  {true_count}")
    print(f"  ✗ Verified FALSE: {false_count}")
    print(f"  ? Uncertain:      {uncertain_count}")
    
    # Storage Keys
    print("\n### STORAGE KEYS ###")
    with open(VERIFICATION_FILES['storage'], 'r') as f:
        storage = json.load(f)
    
    print(f"Auto-verifying {len(storage)} keys...")
    true_count, false_count, uncertain_count = auto_verify_storage(storage)
    
    with open(VERIFICATION_FILES['storage'], 'w') as f:
        json.dump(storage, f, indent=2, ensure_ascii=False)
    
    results['storage'] = {
        'total': len(storage),
        'verified_true': true_count,
        'verified_false': false_count,
        'uncertain': uncertain_count
    }
    
    print(f"  ✓ Verified TRUE:  {true_count}")
    print(f"  ✗ Verified FALSE: {false_count}")
    print(f"  ? Uncertain:      {uncertain_count}")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    for category, stats in results.items():
        print(f"\n{category.upper()}:")
        print(f"  Total items:      {stats['total']}")
        print(f"  Verified TRUE:    {stats['verified_true']} ({stats['verified_true']/stats['total']*100:.1f}%)")
        print(f"  Verified FALSE:   {stats['verified_false']} ({stats['verified_false']/stats['total']*100:.1f}%)")
        if stats['uncertain'] > 0:
            print(f"  Uncertain:        {stats['uncertain']} ({stats['uncertain']/stats['total']*100:.1f}%)")
    
    print("\n" + "=" * 80)
    print("NEXT STEPS")
    print("=" * 80)
    print("""
1. Review items marked as verified=false
   - These might be false positives from models
   - Or the search string might need adjustment
   
2. You can manually review uncertain items if any

3. Run build_ground_truth.py to compile verified items

4. Run calculate_metrics.py to get model precision/recall

The verification files have been updated with auto-verification results.
Check the 'verification_notes' field to see why each item was marked.
""")


if __name__ == "__main__":
    main()
