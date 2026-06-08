#!/usr/bin/env python3
"""
Build ground truth from manually verified findings.

This script:
1. Loads verification files (after manual review)
2. Extracts only items marked as verified=true
3. Builds the ground_truth sections for network, messaging, storage
4. Updates momentum_summary_ground_truth.json

Usage:
    python build_ground_truth.py
"""

import json
from pathlib import Path
from typing import Dict, List, Any

# Configuration
OUTPUT_DIR = Path(".")
VERIFICATION_FILES = {
    'network': OUTPUT_DIR / "verification_network_endpoints.json",
    'messaging': OUTPUT_DIR / "verification_messaging_channels.json",
    'storage': OUTPUT_DIR / "verification_storage_keys.json"
}
GROUND_TRUTH_FILE = OUTPUT_DIR / "momentum_summary_ground_truth.json"


def load_verified_items(file_path: Path) -> List[Dict[str, Any]]:
    """Load verification file and return only verified=true items."""
    if not file_path.exists():
        print(f"WARNING: {file_path} not found, skipping")
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    verified = [item for item in items if item.get('verified') is True]
    total = len(items)
    verified_count = len(verified)
    
    print(f"  {file_path.name}: {verified_count}/{total} verified as correct")
    
    return verified


def build_network_section(verified_endpoints: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build the network section of ground truth."""
    endpoints = []
    
    for ep in verified_endpoints:
        # Use corrected values if provided, otherwise use original
        endpoints.append({
            'url': ep.get('correct_url') or ep['url'],
            'purpose': ep.get('correct_purpose') or ep['purpose'],
            'methods': ep['methods'],
            'headers': ep.get('headers', []),
            'evidence': ep['evidence']
        })
    
    return {'endpoints': endpoints}


def build_messaging_section(verified_channels: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build the messaging section of ground truth."""
    channels = []
    
    for ch in verified_channels:
        # Use corrected values if provided, otherwise use original
        channels.append({
            'name': ch.get('correct_name') or ch['name'],
            'direction': ch.get('correct_direction') or ch['direction'],
            'payload_schema': ch.get('correct_payload_schema') or ch['payload_schema'],
            'evidence': ch['evidence']
        })
    
    return {'channels': channels}


def build_storage_section(verified_keys: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build the storage section of ground truth."""
    keys = []
    
    for key in verified_keys:
        # Use corrected values if provided, otherwise use original
        keys.append({
            'key': key.get('correct_key') or key['key'],
            'type': key.get('correct_type') or key['type'],
            'purpose': key.get('correct_purpose') or key['purpose'],
            'retention': key.get('retention', ''),
            'evidence': key['evidence']
        })
    
    return {'keys': keys}


def main():
    print("=" * 80)
    print("BUILDING GROUND TRUTH FROM VERIFIED FINDINGS")
    print("=" * 80)
    
    # Load verified items
    print("\nLoading verified items...")
    verified_endpoints = load_verified_items(VERIFICATION_FILES['network'])
    verified_channels = load_verified_items(VERIFICATION_FILES['messaging'])
    verified_storage = load_verified_items(VERIFICATION_FILES['storage'])
    
    # Build sections
    print("\nBuilding ground truth sections...")
    network_section = build_network_section(verified_endpoints)
    messaging_section = build_messaging_section(verified_channels)
    storage_section = build_storage_section(verified_storage)
    
    print(f"  Network: {len(network_section['endpoints'])} endpoints")
    print(f"  Messaging: {len(messaging_section['channels'])} channels")
    print(f"  Storage: {len(storage_section['keys'])} keys")
    
    # Load existing ground truth
    print(f"\nLoading existing ground truth: {GROUND_TRUTH_FILE}")
    with open(GROUND_TRUTH_FILE, 'r', encoding='utf-8') as f:
        ground_truth = json.load(f)
    
    # Update sections
    print("\nUpdating ground truth sections...")
    ground_truth['network'] = network_section
    ground_truth['messaging'] = messaging_section
    ground_truth['storage'] = storage_section
    
    # Update metadata
    if '_meta' in ground_truth:
        ground_truth['_meta']['verification_status'] = 'network_messaging_storage_complete'
        print("  Updated _meta.verification_status")
    
    # Save updated ground truth
    print(f"\nSaving updated ground truth: {GROUND_TRUTH_FILE}")
    with open(GROUND_TRUTH_FILE, 'w', encoding='utf-8') as f:
        json.dump(ground_truth, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print("GROUND TRUTH UPDATED SUCCESSFULLY")
    print("=" * 80)
    print(f"""
Summary:
  - {len(verified_endpoints)} network endpoints
  - {len(verified_channels)} messaging channels
  - {len(verified_storage)} storage keys

Next step: Run calculate_metrics.py to evaluate model performance
""")


if __name__ == "__main__":
    main()
