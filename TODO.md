# Live Feed Analytics Settings Page + Architecture Diagram

## Plan

### Step 1: Create analytics-settings.html
- Glass-morphism UI matching existing theme
- Sections: Stream Quality, Driver Alert Thresholds, Notification Settings, Data & Privacy, Network Tuning
- Interactive toggles, sliders, number inputs
- Save/Reset buttons with localStorage persistence

### Step 2: Create analytics-settings.js
- Load settings from localStorage on page load
- Save settings to localStorage on "Save & Apply"
- Reset to defaults
- Mock preview updates

### Step 3: Update styles.css
- Toggle switches, range sliders, settings grid layout
- Form groups, labels, input styling consistent with glass theme

### Step 4: Update Navigation Links
- dashboard.html: link to /analytics-settings
- broadcast.html: add nav or link
- index.html: add link

### Step 5: Update server.js
- Add /analytics-settings route to serve analytics-settings.html

### Step 6: Create Architecture Diagram
- docs/architecture.html — interactive HTML diagram
- Shows: Mobile Broadcaster → Signaling Server (Socket.io) → Viewer Dashboard
- Protocols: WebRTC media, Socket.io signaling, DataChannel metrics
- Components: Camera, STUN, PeerConnection, Express, Analytics Engine, UI

### Step 7: Test
- Run node server.js and open all pages

## Status
- [x] analytics-settings.html
- [x] analytics-settings.js
- [x] styles.css updated
- [x] server.js route added
- [x] dashboard.html nav updated
- [x] broadcast.html nav updated
- [x] index.html nav updated
- [x] docs/architecture.html created

