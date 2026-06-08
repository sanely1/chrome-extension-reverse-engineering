# Workflow Promotion Audit - Momentum Extension

## Summary of Merges and Promoted Workflows
This audit documents the transition from raw workflow candidates extracted during static analysis to the finalized set of workflows inside `extension_summary.json`.

### Candidate Analysis
We identified 7 initial workflow candidates across our content scripts and background services:
1. `Installation & Onboarding` (Lifecycle) - **Promoted**
2. `Auth Interop & User Session Sync` (Auth/Identity) - **Promoted**
3. `Focus Mode Site Blocker` (Content/DOM) - **Promoted**
4. `Telemetry & Offline Queue Sync` (Telemetry) - **Promoted**
5. `Vite New Tab Page Launch` (UI/NewTab) - **Promoted**
6. `AI Assistant Prompting` (AI/Media) - **Merged**
7. `Legacy Migration & Offscreen Document` (External Bridge) - **Promoted**

### Merge Rationale
* **Candidate 6 (`AI Assistant Prompting`) merged into Candidate 5 (`Vite New Tab Page Launch`)**:
  * *Reasoning*: Code evidence demonstrates that the AI Assistant widget and chat upsell mechanisms operate purely as integrated client-side components within the Momentum New Tab dashboard frame. There is no independent background background trigger for AI chat actions outside of the New Tab dashboard. Keeping them separate would over-focus on a singular UI element; merging them provides a cohesive architectural narrative.
  * *Destination Workflow*: `Vite New Tab Page UI Dashboard Launch`

### UI / Popup / Sidepanel Category Coverage
All extension user interface capabilities (popup widgets, dashboard overrides, and customized focus overlays) are consolidated inside the `Vite New Tab Page UI Dashboard Launch` workflow, which describes the preload and instantiation steps of Momentum's custom Vite UI dashboard elements.
