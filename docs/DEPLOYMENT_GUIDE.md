# okDriver — Deployment Guide

This guide covers local HTTPS testing and cloud deployment for the live streaming prototype.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- (Optional) ngrok account for HTTPS tunneling
- (Optional) Render account for free cloud hosting

---

## Local Development

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`.

---

## HTTPS Local Testing with ngrok

Modern mobile browsers require a **secure context** (`https://` or `localhost`) for camera access.

1. Start the app:
   ```bash
   npm start
   ```

2. In a new terminal, run ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copy the `https://` URL from ngrok output.

4. Open on your phone:
   - `https://<ngrok-domain>/broadcast` → Start camera stream
   - `https://<ngrok-domain>/dashboard` → View live feed

> **Note**: Each ngrok session gives a new random domain. For a static domain, upgrade to ngrok Pro or use Render.

---

## Cloud Deployment — Render (Recommended)

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "okDriver live streaming prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/okdriver-livestream.git
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New → Web Service**.
3. Connect your `okdriver-livestream` repository.
4. Use these settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click **Create Web Service**.

Render will assign you a URL like:
```
https://iot-1-d4c1.onrender.com
```

### Step 3: Test Live Demo

- **Broadcaster (Phone)**: `https://iot-1-d4c1.onrender.com/broadcast`
- **Dashboard (Viewer)**: `https://iot-1-d4c1.onrender.com/dashboard`

Both devices must use the **same URL** for Socket.IO signaling to work.

---

## Environment Variables (Optional)

Create a `.env` file for local customization:

```env
PORT=3000
```

Render automatically injects `PORT` — no `.env` needed there.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Camera blocked on phone | Use HTTPS URL (ngrok/Render). Check browser settings → Camera permission = Allow. |
| Black screen on dashboard | Ensure broadcaster started stream first. Click **Reconnect** on dashboard. |
| High latency (>500ms) | Reduce resolution in Analytics Settings. Use same Wi-Fi network for both devices. |
| Socket disconnects frequently | Check internet stability. Reduce reconnect delay in Analytics Settings. |
| "Camera busy" error | Close other apps using camera (Instagram, Zoom, etc.). |
| WebRTC connection fails | Some corporate firewalls block STUN/ICE. Try mobile hotspot instead. |

---

## Post-Deployment Checklist

- [ ] Broadcaster page loads on phone with HTTPS
- [ ] Camera permission granted
- [ ] Dashboard shows live feed within 2-3 seconds
- [ ] Latency metrics update in real time
- [ ] Network disconnect/reconnect recovers automatically
- [ ] Analytics Settings page saves preferences

---

## Submission Links

After deployment, your submission email should include:

- **Live Demo**: `https://iot-1-d4c1.onrender.com/dashboard`
- **Broadcaster**: `https://iot-1-d4c1.onrender.com/broadcast`
- **Architecture Diagram**: Open `docs/architecture.html` in browser, screenshot or attach as PDF

