const remoteVideo = document.getElementById("remoteVideo");
const streamState = document.getElementById("streamState");
const signalStatus = document.getElementById("signalStatus");
const webrtcStatus = document.getElementById("webrtcStatus");
const latencyValue = document.getElementById("latencyValue");
const latencyChip = document.getElementById("latencyChip");
const reconnectBtn = document.getElementById("reconnectBtn");
const snapshotBtn = document.getElementById("snapshotBtn");
const muteBtn = document.getElementById("muteBtn");
const bitrateValue = document.getElementById("bitrateValue");
const fpsValue = document.getElementById("fpsValue");
const fpsChip = document.getElementById("fpsChip");
const networkChip = document.getElementById("networkChip");
const currentLatency = document.getElementById("currentLatency");
const avgLatency = document.getElementById("avgLatency");
const minMaxLatency = document.getElementById("minMaxLatency");
const rttLatency = document.getElementById("rttLatency");
const latencyQuality = document.getElementById("latencyQuality");
let latencyHistory = [];
let rttHistory = [];
let latencyStats = { min: Infinity, max: 0, avg: 0, count: 0 };
let rttStats = { min: Infinity, max: 0, avg: 0, count: 0 };

function updateLatencyStats(latency, rtt = null) {
  // Update latency stats
  latencyStats.min = Math.min(latencyStats.min, latency);
  latencyStats.max = Math.max(latencyStats.max, latency);
  latencyStats.count++;
  latencyStats.avg = Math.round((latencyStats.avg * (latencyStats.count - 1) + latency) / latencyStats.count);

  // Keep last 50 measurements for rolling average
  latencyHistory.push(latency);
  if (latencyHistory.length > 50) {
    latencyHistory.shift();
  }

  // Update RTT stats if provided
  if (rtt !== null) {
    rttStats.min = Math.min(rttStats.min, rtt);
    rttStats.max = Math.max(rttStats.max, rtt);
    rttStats.count++;
    rttStats.avg = Math.round((rttStats.avg * (rttStats.count - 1) + rtt) / rttStats.count);

    rttHistory.push(rtt);
    if (rttHistory.length > 50) {
      rttHistory.shift();
    }
  }

  // Update display
  const rollingAvg = latencyHistory.length > 0 ?
    Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length) : latency;

  latencyValue.textContent = `Latency: ${latency}ms (avg: ${rollingAvg}ms)`;
  latencyChip.textContent = `Latency: ${latency}ms`;

  // Update detailed latency analysis
  currentLatency.textContent = `${latency} ms`;
  avgLatency.textContent = `${rollingAvg} ms`;
  minMaxLatency.textContent = `${latencyStats.min === Infinity ? '--' : latencyStats.min}/${latencyStats.max === 0 ? '--' : latencyStats.max} ms`;
  rttLatency.textContent = rtt !== null ? `${rtt} ms` : '-- ms';

  // Update latency quality indicator
  if (latency < 150) {
    latencyQuality.textContent = "Excellent";
    latencyQuality.style.color = "#10b981"; // green
  } else if (latency < 300) {
    latencyQuality.textContent = "Good";
    latencyQuality.style.color = "#3b82f6"; // blue
  } else if (latency < 500) {
    latencyQuality.textContent = "Moderate";
    latencyQuality.style.color = "#f59e0b"; // yellow
  } else {
    latencyQuality.textContent = "Poor";
    latencyQuality.style.color = "#ef4444"; // red
  }

  // Update network quality based on latency
  if (latency < 150) {
    networkChip.textContent = "Network: Excellent";
  } else if (latency < 300) {
    networkChip.textContent = "Network: Good";
  } else if (latency < 500) {
    networkChip.textContent = "Network: Moderate";
  } else {
    networkChip.textContent = "Network: Poor";
  }
}

const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 800,
  reconnectionDelayMax: 4000,
});

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let peer = null;
let muted = false;
let statsTimer = null;

function setStreamStatus(type, label, pulse = false) {
  const pulseClass = pulse ? "pulse" : "";
  streamState.innerHTML = `<span class="status-dot ${type} ${pulseClass}"></span>${label}`;
}

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const row = document.createElement("p");
  row.textContent = `[${timestamp}] ${message}`;
  logPanel.prepend(row);
  while (logPanel.childElementCount > 8) {
    logPanel.removeChild(logPanel.lastElementChild);
  }
}

function updateMockDriverStats() {
  const speed = 38 + Math.floor(Math.random() * 22);
  const attention = 75 + Math.floor(Math.random() * 20);
  const fatigueState = attention > 88 ? "Low" : attention > 80 ? "Medium" : "High";
  speedValue.textContent = `${speed} km/h`;
  attentionValue.textContent = `${attention}%`;
  fatigueValue.textContent = fatigueState;
}

async function pollPeerStats() {
  if (!peer || peer.connectionState !== "connected") {
    return;
  }
  const stats = await peer.getStats();
  let videoStats = null;

  stats.forEach((report) => {
    if (report.type === "inbound-rtp" && report.kind === "video") {
      videoStats = report;
    }
  });

  if (!videoStats) return;

  const fps = Math.round(videoStats.framesPerSecond || 0);
  const bitrateMbps = videoStats.bytesReceived
    ? ((videoStats.bytesReceived * 8) / 1_000_000).toFixed(2)
    : "--";

  fpsValue.textContent = `FPS: ${fps || "--"}`;
  fpsChip.textContent = `FPS: ${fps || "--"}`;
  bitrateValue.textContent = `Bitrate: ${bitrateMbps} Mbps`;

  if (fps >= 24) {
    networkChip.textContent = "Network: Good";
  } else if (fps >= 12) {
    networkChip.textContent = "Network: Moderate";
  } else {
    networkChip.textContent = "Network: Weak";
  }
}

function resetPeer() {
  if (peer) {
    peer.close();
    peer = null;
  }
  if (statsTimer) {
    clearInterval(statsTimer);
    statsTimer = null;
  }

  // Reset latency statistics
  latencyHistory = [];
  rttHistory = [];
  latencyStats = { min: Infinity, max: 0, avg: 0, count: 0 };
  rttStats = { min: Infinity, max: 0, avg: 0, count: 0 };

  // Reset UI elements
  currentLatency.textContent = "-- ms";
  avgLatency.textContent = "-- ms";
  minMaxLatency.textContent = "--/-- ms";
  rttLatency.textContent = "-- ms";
  latencyQuality.textContent = "--";
  latencyQuality.style.color = "";
}

function requestStream() {
  if (socket.connected) {
    socket.emit("viewer-ready");
    setStreamStatus("status-warn", "Requesting stream...", true);
    webrtcStatus.textContent = "WebRTC: Negotiating";
    addLog("Requested stream from broadcaster");
  }
}

socket.on("connect", () => {
  signalStatus.textContent = "Signal: Connected";
  addLog("Connected to signaling server");
  requestStream();
});

socket.on("disconnect", () => {
  signalStatus.textContent = "Signal: Disconnected";
  setStreamStatus("status-warn", "Reconnecting...", true);
  webrtcStatus.textContent = "WebRTC: Disconnected";
  addLog("Socket disconnected, retrying");
});

socket.on("broadcaster-offline", () => {
  setStreamStatus("status-warn", "Broadcaster offline", true);
  webrtcStatus.textContent = "WebRTC: Waiting";
  addLog("Broadcaster is offline");
});

socket.on("broadcaster-online", () => {
  addLog("Broadcaster online, requesting feed");
  requestStream();
});

socket.on("offer", async ({ from, sdp }) => {
  resetPeer();
  peer = new RTCPeerConnection(rtcConfig);

  peer.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
    setStreamStatus("status-good", "Live stream active");
    webrtcStatus.textContent = "WebRTC: Connected";
    addLog("Remote video track connected");
    updateMockDriverStats();
    statsTimer = setInterval(() => {
      pollPeerStats().catch((error) => console.error("Stats error:", error));
      updateMockDriverStats();
    }, 2000);
  };

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { target: from, candidate: event.candidate });
    }
  };

  peer.onconnectionstatechange = () => {
    const state = peer.connectionState;
    webrtcStatus.textContent = `WebRTC: ${state}`;
    if (state === "failed" || state === "disconnected") {
      setStreamStatus("status-warn", "Connection unstable", true);
      addLog(`Connection ${state}, requesting reconnect`);
      requestStream();
    } else if (state === "connected") {
      addLog("WebRTC peer connected");
    }
  };

  peer.ondatachannel = (event) => {
    const channel = event.channel;
    channel.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        const now = Date.now();

        if (data.type === "ping") {
          // Calculate one-way latency (time since ping was sent)
          const latency = now - data.ts;
          updateLatencyStats(latency);

          // Send pong response for RTT measurement
          if (channel.readyState === "open") {
            channel.send(JSON.stringify({
              type: "pong",
              pingTs: data.ts,
              pongTs: now,
              seq: data.seq
            }));
          }
        } else if (data.type === "pong") {
          // Calculate round-trip time
          const rtt = now - data.pingTs;
          // Update stats with RTT (pass as second parameter)
          updateLatencyStats(now - data.pongTs, rtt);
        } else if (data.ts) {
          // Legacy format support
          const latency = now - data.ts;
          updateLatencyStats(latency);
        }
      } catch (err) {
        console.error("Latency parse error:", err);
      }
    };
  };

  await peer.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  socket.emit("answer", { target: from, sdp: answer });
});

socket.on("ice-candidate", async ({ candidate }) => {
  if (!peer || !candidate) return;
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
});

reconnectBtn.addEventListener("click", () => {
  resetPeer();
  addLog("Manual reconnect triggered");
  requestStream();
});

snapshotBtn.addEventListener("click", () => {
  if (!remoteVideo.srcObject) {
    addLog("Snapshot failed: no active stream");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = remoteVideo.videoWidth || 1280;
  canvas.height = remoteVideo.videoHeight || 720;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
  const imageURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageURL;
  link.download = `snapshot-${Date.now()}.png`;
  link.click();
  addLog("Snapshot saved");
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  remoteVideo.muted = muted;
  muteBtn.textContent = muted ? "Unmute" : "Mute";
  addLog(muted ? "Dashboard muted" : "Dashboard unmuted");
});

setInterval(() => {
  timeChip.textContent = new Date().toLocaleTimeString();
}, 1000);

addLog("Dashboard initialized");
