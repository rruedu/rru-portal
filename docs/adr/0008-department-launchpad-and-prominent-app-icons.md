# ADR 0008: Department App Launchpad and Prominent 3D Squircle Icons

## Status
Accepted

## Context
When users navigated into a department from the 360-degree Radial Orbit, the resulting service card grid appeared flat and conventional. Application icons were small and failed to convey the premium, tactile feel of a modern school launchpad. The user requested a "WOW" UI upgrade, particularly emphasizing each app's icon.

## Decision
1. **Modern App Launchpad Presentation (Q1: Option A)**:
   - Enlarge each service icon into a prominent 3D Squircle container (64px desktop / 54px mobile) with glossy bevel highlights, ambient drop shadow, and a smooth hover scale (1.08x) with a lift effect.
   - Introduce an interactive `[เปิดใช้งาน ➔]` launch badge on each card that lights up dynamically on hover.
   - Show clean domain badges using `formatDisplayUrl` so users instantly recognize destination platforms (Google Apps Script, Drive, etc.).
2. **Unified School Violet-Pink Branding (Q2: Option B)**:
   - Maintain the signature violet-pink executive color palette (`from-pink-500 to-purple-600`) across all department headers, preserving institutional cohesion and visual harmony without disjointed color shifts.
3. **Staggered Smooth Pop-In Animation (Q3: Option A)**:
   - Apply a staggered CSS entrance animation (`cardStaggerPopIn`, 0.04s sequential offset per card) to create a fluid, cascading reveal when transitioning from the orbit hub.

## Consequences
- Every digital service link looks and feels like a dedicated native application icon.
- Navigation into departments delivers an engaging, tactile visual transition.
- Institutional branding remains consistent and clean across all school divisions.
