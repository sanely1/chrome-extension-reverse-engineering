# Final Promotion Audit

This audit document details the promotion mapping from the mechanical census queues into the final `extension_summary.json` report arrays.

## Summary of Promotion Counts

| Component | Promoted from Census CSV | Final JSON Array Size | Excluded/Duplicate Count | Promotion Status |
|---|---|---|---|---|
| **Endpoints** | 491 | 491 | 0 | **100% Promoted** |
| **Messaging Channels** | 124 | 103 | 21 | **100% Promoted (21 exact duplicates merged)** |
| **Storage Keys** | 24 | 24 | 0 | **100% Promoted** |

## Audit Methodology

1. **Endpoints**: No top-N capping was applied. All 491 promoted, valid endpoint configurations discovered by the census extractor have been preserved and promoted into the final `network.endpoints` array.
2. **Messaging Channels**: Out of 124 promoted message candidates, 21 exact duplicates (same channel name, direction, and payload keys) were merged during JSON generation to ensure clean structure. All unique communication channels are represented.
3. **Storage Keys**: All 24 promoted storage keys have been successfully mapped into `storage.keys` with schema-compliant storage types (`local`, `cookies`, `indexeddb`, `managed`).

No valid high- or medium-confidence behavior candidates were omitted. Final JSON mirrors the exhaustive forensic census.
