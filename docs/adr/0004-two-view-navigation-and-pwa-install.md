# 4. Two-View Screen Navigation and PWA Home Screen Installation

We decided to eliminate the persistent bottom card list on the home screen in favor of a clean two-view architecture:
1. **Orbit Hub View**: A distraction-free visual gateway showcasing the glowing central school emblem and 5 orbiting department nodes on both desktop and mobile viewports.
2. **Department / Search View**: Activated only upon selecting a department node or initiating a search query, with full-screen focus, dedicated back navigation (`◀ กลับหน้าหลัก`), and URL hash routing (`#academic`, `#budget`, etc.) for seamless mobile back-button support.

Additionally, we integrated Progressive Web App (PWA) manifest and installation hooks enabling users on Android and iOS to add the portal directly to their smartphone home screens with native icon branding and standalone display.
