#!/usr/bin/env python3
"""
Extract all unique findings from model outputs for manual verification.

This script:
1. Loads all 3 model outputs
2. Extracts all unique Network endpoints, Messaging channels, and Storage keys
3. Creates a verification workbook for manual review
4. Outputs a JSON file for each category with verification status fields

Usage:
    python extract_model_findings.py
"""

import json
from pathlib import Path
from typing import Dict, List, Set, Any
from collections import defaultdict

# Configuration
MODEL_DIRS = [
    "../out_001_GPT4.1",
    "../out_002_Claude-Sonnet-4", 
    "../out_003_Gemini-2.5-Pro"
]

OUTPUT_DIR = Path(".")
WORKSPACE_ROOT = Path(".")


def load_model_output(model_dir: str) -> Dict[str, Any]:
    """Load a model's extension summary output."""
    filename = "extension_summary.json"
    
    path = WORKSPACE_ROOT / model_dir / filename
    print(f"Loading: {path}")
    
    if not path.exists():
        print(f"  WARNING: File not found, skipping")
        return {}
    
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def extract_network_endpoints(data: Dict[str, Any], model_name: str) -> List[Dict[str, Any]]:
    """Extract all network endpoints from a model output."""
    endpoints = []
    
    if 'network' not in data or 'endpoints' not in data['network']:
        return endpoints
    
    for endpoint in data['network']['endpoints']:
        endpoints.append({
            'url': endpoint.get('url', ''),
            'purpose': endpoint.get('purpose', ''),
            'methods': endpoint.get('methods', []),
            'headers': endpoint.get('headers', []),
            'evidence': endpoint.get('evidence', []),
            'found_by': model_name
        })
    
    return endpoints


def extract_messaging_channels(data: Dict[str, Any], model_name: str) -> List[Dict[str, Any]]:
    """Extract all messaging channels from a model output."""
    channels = []
    
    if 'messaging' not in data or 'channels' not in data['messaging']:
        return channels
    
    for channel in data['messaging']['channels']:
        channels.append({
            'name': channel.get('name', ''),
            'direction': channel.get('direction', ''),
            'payload_schema': channel.get('payload_schema', {}),
            'evidence': channel.get('evidence', []),
            'found_by': model_name
        })
    
    return channels


def extract_storage_keys(data: Dict[str, Any], model_name: str) -> List[Dict[str, Any]]:
    """Extract all storage keys from a model output."""
    keys = []
    
    if 'storage' not in data or 'keys' not in data['storage']:
        return keys
    
    for key in data['storage']['keys']:
        keys.append({
            'key': key.get('key', ''),
            'type': key.get('type', ''),
            'purpose': key.get('purpose', ''),
            'retention': key.get('retention', ''),
            'evidence': key.get('evidence', []),
            'found_by': model_name
        })
    
    return keys


def deduplicate_endpoints(endpoints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicate endpoints by URL, merging evidence from multiple models."""
    url_map = defaultdict(lambda: {
        'url': '',
        'purpose': '',
        'methods': [],
        'headers': [],
        'evidence': [],
        'found_by_models': []
    })
    
    for ep in endpoints:
        url = ep['url']
        entry = url_map[url]
        
        if not entry['url']:
            entry['url'] = url
            entry['purpose'] = ep['purpose']
        
        # Merge methods
        for method in ep.get('methods', []):
            if method not in entry['methods']:
                entry['methods'].append(method)
        
        # Merge headers
        for header in ep.get('headers', []):
            if header not in entry['headers']:
                entry['headers'].append(header)
        
        # Merge evidence
        entry['evidence'].extend(ep.get('evidence', []))
        
        # Track which models found this
        if ep['found_by'] not in entry['found_by_models']:
            entry['found_by_models'].append(ep['found_by'])
    
    # Convert to list and add verification fields
    result = []
    for url, data in sorted(url_map.items()):
        data['verified'] = None  # null = not yet verified, true = correct, false = incorrect
        data['verification_notes'] = ''
        data['correct_url'] = ''  # If incorrect, what should it be?
        data['correct_purpose'] = ''
        result.append(data)
    
    return result


def deduplicate_channels(channels: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicate messaging channels by name, merging evidence."""
    name_map = defaultdict(lambda: {
        'name': '',
        'direction': '',
        'payload_schema': {},
        'evidence': [],
        'found_by_models': []
    })
    
    for ch in channels:
        name = ch['name']
        entry = name_map[name]
        
        if not entry['name']:
            entry['name'] = name
            entry['direction'] = ch['direction']
            entry['payload_schema'] = ch['payload_schema']
        
        # Merge evidence
        entry['evidence'].extend(ch.get('evidence', []))
        
        # Track which models found this
        if ch['found_by'] not in entry['found_by_models']:
            entry['found_by_models'].append(ch['found_by'])
    
    # Convert to list and add verification fields
    result = []
    for name, data in sorted(name_map.items()):
        data['verified'] = None
        data['verification_notes'] = ''
        data['correct_name'] = ''
        data['correct_direction'] = ''
        data['correct_payload_schema'] = {}
        result.append(data)
    
    return result


def deduplicate_storage_keys(keys: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicate storage keys by key name, merging evidence."""
    key_map = defaultdict(lambda: {
        'key': '',
        'type': '',
        'purpose': '',
        'retention': '',
        'evidence': [],
        'found_by_models': []
    })
    
    for k in keys:
        key_name = k['key']
        entry = key_map[key_name]
        
        if not entry['key']:
            entry['key'] = key_name
            entry['type'] = k['type']
            entry['purpose'] = k['purpose']
            entry['retention'] = k['retention']
        
        # Merge evidence
        entry['evidence'].extend(k.get('evidence', []))
        
        # Track which models found this
        if k['found_by'] not in entry['found_by_models']:
            entry['found_by_models'].append(k['found_by'])
    
    # Convert to list and add verification fields
    result = []
    for key_name, data in sorted(key_map.items()):
        data['verified'] = None
        data['verification_notes'] = ''
        data['correct_key'] = ''
        data['correct_type'] = ''
        data['correct_purpose'] = ''
        result.append(data)
    
    return result


def main():
    print("=" * 80)
    print("EXTRACTING MODEL FINDINGS FOR MANUAL VERIFICATION")
    print("=" * 80)
    
    # Load all model outputs
    all_endpoints = []
    all_channels = []
    all_storage_keys = []
    
    for model_dir in MODEL_DIRS:
        model_name = model_dir.split('_')[-1]  # Extract model name
        print(f"\nProcessing {model_name}...")
        
        data = load_model_output(model_dir)
        if not data:
            continue
        
        endpoints = extract_network_endpoints(data, model_name)
        channels = extract_messaging_channels(data, model_name)
        storage = extract_storage_keys(data, model_name)
        
        print(f"  Found {len(endpoints)} endpoints")
        print(f"  Found {len(channels)} messaging channels")
        print(f"  Found {len(storage)} storage keys")
        
        all_endpoints.extend(endpoints)
        all_channels.extend(channels)
        all_storage_keys.extend(storage)
    
    print("\n" + "=" * 80)
    print("DEDUPLICATING FINDINGS")
    print("=" * 80)
    
    # Deduplicate
    unique_endpoints = deduplicate_endpoints(all_endpoints)
    unique_channels = deduplicate_channels(all_channels)
    unique_storage = deduplicate_storage_keys(all_storage_keys)
    
    print(f"\nUnique endpoints: {len(unique_endpoints)}")
    print(f"Unique messaging channels: {len(unique_channels)}")
    print(f"Unique storage keys: {len(unique_storage)}")
    
    # Save to verification files
    print("\n" + "=" * 80)
    print("SAVING VERIFICATION FILES")
    print("=" * 80)
    
    endpoints_file = OUTPUT_DIR / "verification_network_endpoints.json"
    channels_file = OUTPUT_DIR / "verification_messaging_channels.json"
    storage_file = OUTPUT_DIR / "verification_storage_keys.json"
    
    with open(endpoints_file, 'w', encoding='utf-8') as f:
        json.dump(unique_endpoints, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Saved: {endpoints_file}")
    
    with open(channels_file, 'w', encoding='utf-8') as f:
        json.dump(unique_channels, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved: {channels_file}")
    
    with open(storage_file, 'w', encoding='utf-8') as f:
        json.dump(unique_storage, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved: {storage_file}")
    
    # Create summary
    print("\n" + "=" * 80)
    print("CONSENSUS ANALYSIS")
    print("=" * 80)
    
    # Count consensus levels for endpoints
    endpoint_consensus = defaultdict(int)
    for ep in unique_endpoints:
        count = len(ep['found_by_models'])
        endpoint_consensus[count] += 1
    
    print("\nEndpoints by model agreement:")
    for count in sorted(endpoint_consensus.keys(), reverse=True):
        print(f"  {count}/3 models agree: {endpoint_consensus[count]} endpoints")
    
    # Count consensus levels for channels
    channel_consensus = defaultdict(int)
    for ch in unique_channels:
        count = len(ch['found_by_models'])
        channel_consensus[count] += 1
    
    print("\nMessaging channels by model agreement:")
    for count in sorted(channel_consensus.keys(), reverse=True):
        print(f"  {count}/3 models agree: {channel_consensus[count]} channels")
    
    # Count consensus levels for storage
    storage_consensus = defaultdict(int)
    for sk in unique_storage:
        count = len(sk['found_by_models'])
        storage_consensus[count] += 1
    
    print("\nStorage keys by model agreement:")
    for count in sorted(storage_consensus.keys(), reverse=True):
        print(f"  {count}/3 models agree: {storage_consensus[count]} keys")
    
    print("\n" + "=" * 80)
    print("NEXT STEPS")
    print("=" * 80)
    print("""
1. Open the verification JSON files
2. For each item, set 'verified' to:
   - true (correct finding)
   - false (incorrect finding)
   - null (skip/uncertain)

3. Add 'verification_notes' explaining your decision

4. If incorrect, fill in the 'correct_*' fields with ground truth

5. Run build_ground_truth.py to compile verified findings

6. Run calculate_metrics.py to get precision/recall scores
""")


if __name__ == "__main__":
    main()
