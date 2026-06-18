#!/usr/bin/env python3
"""
Calculate precision, recall, and F1 scores for each model.

This script:
1. Loads ground truth
2. Loads each model's output
3. Calculates metrics for network, messaging, and storage
4. Generates detailed comparison report

Usage:
    python calculate_metrics.py
"""

import json
from pathlib import Path
from typing import Dict, List, Set, Any, Tuple
from collections import defaultdict

# Configuration
MODEL_DIRS = [
    "../out_001_GPT4.1",
    "../out_002_Claude-Sonnet-4",
    "../out_003_Gemini-2.5-Pro"
]

GROUND_TRUTH_FILE = Path("momentum_summary_ground_truth.json")
REPORT_FILE = Path("evaluation_report.json")
REPORT_MD_FILE = Path("evaluation_report.md")


def load_json(file_path: Path) -> Dict[str, Any]:
    """Load a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def extract_url_set(endpoints: List[Dict[str, Any]]) -> Set[str]:
    """Extract set of URLs from endpoints list."""
    return {ep['url'] for ep in endpoints if 'url' in ep}


def extract_channel_set(channels: List[Dict[str, Any]]) -> Set[str]:
    """Extract set of channel names from channels list."""
    return {ch['name'] for ch in channels if 'name' in ch}


def extract_storage_key_set(keys: List[Dict[str, Any]]) -> Set[str]:
    """Extract set of storage key names from keys list."""
    return {k['key'] for k in keys if 'key' in k}


def calculate_metrics(ground_truth_set: Set[str], model_set: Set[str]) -> Dict[str, float]:
    """Calculate precision, recall, and F1 score."""
    true_positives = len(ground_truth_set & model_set)
    false_positives = len(model_set - ground_truth_set)
    false_negatives = len(ground_truth_set - model_set)
    
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    
    return {
        'true_positives': true_positives,
        'false_positives': false_positives,
        'false_negatives': false_negatives,
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1': round(f1, 4)
    }


def get_detailed_comparison(ground_truth_set: Set[str], model_set: Set[str]) -> Dict[str, List[str]]:
    """Get detailed lists of correct, missing, and extra items."""
    return {
        'correct': sorted(list(ground_truth_set & model_set)),
        'missing': sorted(list(ground_truth_set - model_set)),
        'extra': sorted(list(model_set - ground_truth_set))
    }


def evaluate_model(model_dir: str, ground_truth: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a single model against ground truth."""
    model_name = model_dir.split('_')[-1]
    
    filename = "extension_summary.json"
    
    model_path = Path(model_dir) / filename
    
    print(f"\nEvaluating {model_name}...")
    
    if not model_path.exists():
        print(f"  WARNING: {model_path} not found, skipping")
        return None
    
    model_data = load_json(model_path)
    
    # Extract ground truth sets
    gt_endpoints = extract_url_set(ground_truth.get('network', {}).get('endpoints', []))
    gt_channels = extract_channel_set(ground_truth.get('messaging', {}).get('channels', []))
    gt_storage = extract_storage_key_set(ground_truth.get('storage', {}).get('keys', []))
    
    # Extract model sets
    model_endpoints = extract_url_set(model_data.get('network', {}).get('endpoints', []))
    model_channels = extract_channel_set(model_data.get('messaging', {}).get('channels', []))
    model_storage = extract_storage_key_set(model_data.get('storage', {}).get('keys', []))
    
    # Calculate metrics
    endpoint_metrics = calculate_metrics(gt_endpoints, model_endpoints)
    channel_metrics = calculate_metrics(gt_channels, model_channels)
    storage_metrics = calculate_metrics(gt_storage, model_storage)
    
    # Get detailed comparisons
    endpoint_details = get_detailed_comparison(gt_endpoints, model_endpoints)
    channel_details = get_detailed_comparison(gt_channels, model_channels)
    storage_details = get_detailed_comparison(gt_storage, model_storage)
    
    print(f"  Network: P={endpoint_metrics['precision']:.2f}, R={endpoint_metrics['recall']:.2f}, F1={endpoint_metrics['f1']:.2f}")
    print(f"  Messaging: P={channel_metrics['precision']:.2f}, R={channel_metrics['recall']:.2f}, F1={channel_metrics['f1']:.2f}")
    print(f"  Storage: P={storage_metrics['precision']:.2f}, R={storage_metrics['recall']:.2f}, F1={storage_metrics['f1']:.2f}")
    
    return {
        'model': model_name,
        'network': {
            'metrics': endpoint_metrics,
            'details': endpoint_details
        },
        'messaging': {
            'metrics': channel_metrics,
            'details': channel_details
        },
        'storage': {
            'metrics': storage_metrics,
            'details': storage_details
        }
    }


def generate_markdown_report(results: List[Dict[str, Any]], ground_truth: Dict[str, Any]) -> str:
    """Generate a human-readable Markdown report."""
    md = ["# Model Evaluation Report", ""]
    md.append(f"Ground Truth Statistics:")
    md.append(f"- Network Endpoints: {len(ground_truth.get('network', {}).get('endpoints', []))}")
    md.append(f"- Messaging Channels: {len(ground_truth.get('messaging', {}).get('channels', []))}")
    md.append(f"- Storage Keys: {len(ground_truth.get('storage', {}).get('keys', []))}")
    md.append("")
    
    # Summary table
    md.append("## Summary Table")
    md.append("")
    md.append("### Network Endpoints")
    md.append("")
    md.append("| Model | Precision | Recall | F1 | TP | FP | FN |")
    md.append("|-------|-----------|--------|----|----|----|----|")
    for result in results:
        if not result:
            continue
        m = result['network']['metrics']
        md.append(f"| {result['model']} | {m['precision']:.4f} | {m['recall']:.4f} | {m['f1']:.4f} | {m['true_positives']} | {m['false_positives']} | {m['false_negatives']} |")
    md.append("")
    
    md.append("### Messaging Channels")
    md.append("")
    md.append("| Model | Precision | Recall | F1 | TP | FP | FN |")
    md.append("|-------|-----------|--------|----|----|----|----|")
    for result in results:
        if not result:
            continue
        m = result['messaging']['metrics']
        md.append(f"| {result['model']} | {m['precision']:.4f} | {m['recall']:.4f} | {m['f1']:.4f} | {m['true_positives']} | {m['false_positives']} | {m['false_negatives']} |")
    md.append("")
    
    md.append("### Storage Keys")
    md.append("")
    md.append("| Model | Precision | Recall | F1 | TP | FP | FN |")
    md.append("|-------|-----------|--------|----|----|----|----|")
    for result in results:
        if not result:
            continue
        m = result['storage']['metrics']
        md.append(f"| {result['model']} | {m['precision']:.4f} | {m['recall']:.4f} | {m['f1']:.4f} | {m['true_positives']} | {m['false_positives']} | {m['false_negatives']} |")
    md.append("")
    
    # Detailed comparisons
    for result in results:
        if not result:
            continue
        
        md.append(f"## {result['model']} - Detailed Analysis")
        md.append("")
        
        # Network
        md.append("### Network Endpoints")
        md.append(f"- **Correct**: {len(result['network']['details']['correct'])} endpoints")
        md.append(f"- **Missing**: {len(result['network']['details']['missing'])} endpoints")
        md.append(f"- **Extra**: {len(result['network']['details']['extra'])} endpoints")
        md.append("")
        
        if result['network']['details']['missing']:
            md.append("**Missing Endpoints:**")
            for item in result['network']['details']['missing'][:10]:  # Show first 10
                md.append(f"- `{item}`")
            if len(result['network']['details']['missing']) > 10:
                md.append(f"- ... and {len(result['network']['details']['missing']) - 10} more")
            md.append("")
        
        if result['network']['details']['extra']:
            md.append("**False Positives (Extra):**")
            for item in result['network']['details']['extra'][:10]:
                md.append(f"- `{item}`")
            if len(result['network']['details']['extra']) > 10:
                md.append(f"- ... and {len(result['network']['details']['extra']) - 10} more")
            md.append("")
        
        # Messaging
        md.append("### Messaging Channels")
        md.append(f"- **Correct**: {len(result['messaging']['details']['correct'])} channels")
        md.append(f"- **Missing**: {len(result['messaging']['details']['missing'])} channels")
        md.append(f"- **Extra**: {len(result['messaging']['details']['extra'])} channels")
        md.append("")
        
        if result['messaging']['details']['missing']:
            md.append("**Missing Channels:**")
            for item in result['messaging']['details']['missing'][:10]:
                md.append(f"- `{item}`")
            if len(result['messaging']['details']['missing']) > 10:
                md.append(f"- ... and {len(result['messaging']['details']['missing']) - 10} more")
            md.append("")
        
        if result['messaging']['details']['extra']:
            md.append("**False Positives (Extra):**")
            for item in result['messaging']['details']['extra'][:10]:
                md.append(f"- `{item}`")
            if len(result['messaging']['details']['extra']) > 10:
                md.append(f"- ... and {len(result['messaging']['details']['extra']) - 10} more")
            md.append("")
        
        # Storage
        md.append("### Storage Keys")
        md.append(f"- **Correct**: {len(result['storage']['details']['correct'])} keys")
        md.append(f"- **Missing**: {len(result['storage']['details']['missing'])} keys")
        md.append(f"- **Extra**: {len(result['storage']['details']['extra'])} keys")
        md.append("")
        
        if result['storage']['details']['missing']:
            md.append("**Missing Keys:**")
            for item in result['storage']['details']['missing'][:10]:
                md.append(f"- `{item}`")
            if len(result['storage']['details']['missing']) > 10:
                md.append(f"- ... and {len(result['storage']['details']['missing']) - 10} more")
            md.append("")
        
        if result['storage']['details']['extra']:
            md.append("**False Positives (Extra):**")
            for item in result['storage']['details']['extra'][:10]:
                md.append(f"- `{item}`")
            if len(result['storage']['details']['extra']) > 10:
                md.append(f"- ... and {len(result['storage']['details']['extra']) - 10} more")
            md.append("")
    
    return "\n".join(md)


def main():
    print("=" * 80)
    print("CALCULATING MODEL EVALUATION METRICS")
    print("=" * 80)
    
    # Load ground truth
    print(f"\nLoading ground truth: {GROUND_TRUTH_FILE}")
    ground_truth = load_json(GROUND_TRUTH_FILE)
    
    print(f"Ground truth contains:")
    print(f"  - {len(ground_truth.get('network', {}).get('endpoints', []))} network endpoints")
    print(f"  - {len(ground_truth.get('messaging', {}).get('channels', []))} messaging channels")
    print(f"  - {len(ground_truth.get('storage', {}).get('keys', []))} storage keys")
    
    # Evaluate each model
    results = []
    for model_dir in MODEL_DIRS:
        result = evaluate_model(model_dir, ground_truth)
        if result:
            results.append(result)
    
    # Save JSON report
    print(f"\n\nSaving JSON report: {REPORT_FILE}")
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'ground_truth_stats': {
                'network_endpoints': len(ground_truth.get('network', {}).get('endpoints', [])),
                'messaging_channels': len(ground_truth.get('messaging', {}).get('channels', [])),
                'storage_keys': len(ground_truth.get('storage', {}).get('keys', []))
            },
            'model_results': results
        }, f, indent=2, ensure_ascii=False)
    
    # Generate and save Markdown report
    print(f"Saving Markdown report: {REPORT_MD_FILE}")
    markdown = generate_markdown_report(results, ground_truth)
    with open(REPORT_MD_FILE, 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print("\n" + "=" * 80)
    print("EVALUATION COMPLETE")
    print("=" * 80)
    print(f"""
Reports saved:
  - JSON: {REPORT_FILE}
  - Markdown: {REPORT_MD_FILE}

Open the Markdown file for a human-readable summary.
""")


if __name__ == "__main__":
    main()
