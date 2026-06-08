# Workflow Promotion Audit

This document audits the clustering, promotion, and categorization of Grammarly Chrome extension workflows.

## Workflow Categories Mapping & Merges

To avoid unnecessary redundancy and prevent workflow over-fragmentation, we have merged several technical behavior categories into high-level user-facing workflows:

1.  **Config / Feature Flags / Experiments**:
    *   *Mapping*: Merged into **User Session & Auth Flow** (`user_session_auth_flow`).
    *   *Justification*: Grammarly checks feature flags and treatment gates (via Cheetah/Gates endpoints) on session startup or user login to determine the active configuration of UI elements.
2.  **Storage / Cache / Persistence**:
    *   *Mapping*: Merged into **Text Checking Flow** (`text_checking_flow`) and **Telemetry Logging Flow** (`telemetry_logging_flow`).
    *   *Justification*: Document state caching (`document_state_enc`) is an integral storage component of the text-checking loop, while `feMetricsData` buffer storage is specific to the telemetry upload loop.
3.  **External Bridge / Native / Frame Messaging**:
    *   *Mapping*: Merged into **Generative AI Rewrite Flow** (`generative_ai_rewrite_flow`).
    *   *Justification*: The generative rewrite panel (Inkwell) runs inside a sandboxed web-accessible iframe, necessitating postMessage/port bridge communication to exchange selection context and inject rewritten text back into the DOM.

All 6 core workflows are confirmed, validated, and fully cover the functional surface of the extension.
