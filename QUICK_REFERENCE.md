# 📋 IoT Live Streaming - Quick Reference Card

## 🎯 LIVE DEMO URLs (Copy & Paste Ready)

### Broadcaster (Use on Phone)
```
https://lindsay-interminable-disputably.ngrok-free.dev/broadcast
```

### Dashboard (Use on Computer)
```
https://lindsay-interminable-disputably.ngrok-free.dev/dashboard
```

### Home
```
https://lindsay-interminable-disputably.ngrok-free.dev/
```

---

## ⚡ Quick Facts

| Item | Value |
|------|-------|
| **Tech Stack** | Node.js + WebRTC + Socket.IO |
| **Streaming Type** | Peer-to-peer (P2P) |
| **Latency Range** | 80-250ms typical |
| **Measurement Interval** | 500ms (ping-pong) |
| **Video Storage** | None (compliance-ready) |
| **Browser Support** | All modern browsers |
| **Mobile Support** | iOS Safari, Android Chrome |

---

## 🔑 Key Numbers to Remember

```
Latency Tiers:
• Excellent:  < 150ms  (🟢 Green)
• Good:       150-300ms (🔵 Blue)
• Moderate:   300-500ms (🟡 Yellow)
• Poor:       > 500ms  (🔴 Red)

Performance:
• FPS:    20-30 fps typical
• Bitrate: 1-5 Mbps
• RTT:     150-600ms typical
• Jitter:  ±50ms variation
```

---

## 🎤 Elevator Pitch (30 seconds)

*"This is a real-time WebRTC-based IoT streaming platform. A mobile phone broadcasts its camera feed peer-to-peer to a web dashboard with ultra-low latency (150-250ms). The server only handles signaling—no video storage. It includes advanced latency monitoring with real-time analytics and automatic recovery from network issues. Perfect for applications like driver monitoring, remote surveillance, or telemedicine."*

---

## 💡 3 Main Differentiators

1. **WebRTC P2P** - Not using server-side video processing
2. **Latency Monitoring** - Measuring every 500ms with statistics
3. **Zero Storage** - Fully compliance-ready, no video saved

---

## 🧠 Common Interview Questions & Answers

### Q: Why WebRTC and not HLS?
**A:** "WebRTC gives us 150ms latency vs 2-10 seconds for HLS. For real-time IoT applications, that's critical. Plus P2P streaming saves server bandwidth and resources."

### Q: How does the latency measurement work?
**A:** "Every 500ms, the broadcaster sends a timestamp via WebRTC DataChannel. The viewer calculates the one-way delay. We also measure RTT with ping-pong responses. This gives us current, average, min/max, and quality metrics."

### Q: How does it scale to multiple viewers?
**A:** "The broadcaster creates a separate peer connection for each viewer. Socket.IO handles the signaling. Each viewer gets their own direct P2P stream."

### Q: What happens on network failures?
**A:** "Socket.IO auto-reconnects with exponential backoff (800ms to 4s). When reconnected, the viewer automatically re-requests the stream. The broadcaster detects disconnections and cleans up."

### Q: Why no video storage?
**A:** "Storage adds latency, cost, and privacy concerns. For real-time monitoring, you don't need historical video. If recording is needed, the client can save locally."

---

## 🖥️ Demo Sequence (5 minutes)

```
1. Open both URLs in browser (30s)
   └─ Broadcaster on phone
   └─ Dashboard on computer

2. Start broadcasting (15s)
   └─ Click "Start Broadcasting"
   └─ Allow camera permission
   └─ Wait for stream to appear

3. Show latency metrics (2m)
   └─ Point out current latency
   └─ Show rolling average
   └─ Highlight quality indicator
   └─ Note the 500ms update frequency

4. Test resilience (1m)
   └─ Toggle phone Wi-Fi
   └─ Show auto-reconnect
   └─ Mention the metrics stay accurate

5. Code walkthrough (1m 15s)
   └─ Open DevTools (F12)
   └─ Show WebSocket messages
   └─ Explain offer/answer/ICE flow
   └─ Point out DataChannel for latency
```

---

## 📱 Mobile Setup Tips

- Use **HTTPS URL** (ngrok provides this)
- Works on **Safari (iOS)** and **Chrome (Android)**
- Allow **camera & microphone** permissions
- Use **same Wi-Fi** as computer for best latency
- If permission denied:
  - Try private/incognito mode
  - Check browser settings
  - Restart browser

---

## 🔧 Local Development

```bash
# Start server
npm start
# Server runs on http://localhost:3000

# Create ngrok tunnel (in new terminal)
ngrok http 3000

# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels
```

---

## 📊 What You'll Show in Dashboard

```
Live Feed:
├─ Video Stream (real-time video)
├─ Connection Status
│  ├─ Signal: Connected/Disconnected
│  ├─ WebRTC: Connected/Negotiating/Idle
│  └─ Stream: Active/Reconnecting
├─ Latency Analysis
│  ├─ Current: 145ms
│  ├─ Average: 152ms (50 samples)
│  ├─ Min/Max: 120/198ms
│  ├─ Round-trip: 304ms
│  └─ Quality: Good
├─ Performance Metrics
│  ├─ FPS: 30
│  ├─ Bitrate: 2.5 Mbps
│  └─ Network: Good
└─ Driver Stats (simulated)
   ├─ Speed: 45 km/h
   ├─ Attention: 85%
   └─ Fatigue: Low
```

---

## ✅ Pre-Interview Checklist

- [ ] Test both URLs work
- [ ] Phone battery is charged
- [ ] Same Wi-Fi network for phone & computer
- [ ] Clear browser cache/cookies
- [ ] Open this guide on another device
- [ ] Have README.md ready to reference
- [ ] Test camera permission on phone
- [ ] Check latency metrics update correctly
- [ ] Test auto-reconnect by toggling Wi-Fi
- [ ] Practice the demo sequence twice

---

## 🎯 What to Emphasize

✅ **Real-time Performance** - 150ms latency is impressive  
✅ **Architecture** - P2P streaming with signaling only  
✅ **Compliance** - Zero storage, privacy-ready  
✅ **Resilience** - Auto-recovery from failures  
✅ **Scalability** - Multiple viewers, separate P2P connections  
✅ **Monitoring** - Advanced latency analytics  
✅ **Production-Ready** - Professional code quality  

---

## 🚀 Follow-up Topics to Prepare For

- WebRTC codec negotiation
- ICE candidate gathering
- STUN server purpose
- Socket.IO vs WebSockets
- Mobile browser limitations
- NAT traversal techniques
- Video quality adaptation
- Bandwidth estimation

---

## 📞 Contact & Resources

- **WebRTC Docs:** https://webrtc.org/
- **Socket.IO:** https://socket.io/
- **ngrok:** https://ngrok.com/
- **MDN WebRTC:** https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

**Good luck! You've got this! 💪**

*Last updated: April 22, 2026*