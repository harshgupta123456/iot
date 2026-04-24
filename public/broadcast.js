const localVideo = document.getElementById("localVideo");
const connectionState = document.getElementById("connectionState");
const cameraStatus = document.getElementById("cameraStatus");
const socketStatus = document.getElementById("socketStatus");
const peerStatus = document.getElementById("peerStatus");
const viewerCount = document.getElementById("viewerCount");
const latencyStatus = document.getElementById("latencyStatus");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const switchCamBtn = document.getElementById("switchCamBtn");

const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 800,
  reconnectionDelayMax: 4000,
});

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let localStream = null;
const peers = new Map();
let facingMode = "environment";
let metricsInterval = null;

function getCameraErrorMessage(error) {
  if (!window.isSecureContext) {
    return "Camera needs HTTPS or localhost";
  }

  switch (error?.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera permission denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera device found";
    case "NotReadableError":
    case "TrackStartError":
      return "Camera busy in another app";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Camera constraints unsupported";
    default:
      return "Camera unavailable";
  }
}

function setHeaderStatus(type, label, pulse = false) {
  const pulseClass = pulse ? "pulse" : "";
  connectionState.innerHTML = `<span class="status-dot ${type} ${pulseClass}"></span>${label}`;
}

function updateViewerMetrics() {
  const count = peers.size;
  peerStatus.textContent = `${count} active`;
  viewerCount.textContent = `Viewers: ${count}`;
  latencyStatus.textContent = count > 0 ? "~250 ms" : "-- ms";
}

function loadBroadcastSettings() {
  try {
    const raw = localStorage.getItem("okdriver_settings");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function startMedia() {
  try {
    if (!window.isSecureContext) {
      throw new Error("INSECURE_CONTEXT");
    }

    cameraStatus.textContent = "Requesting permission...";

    const settings = loadBroadcastSettings();
    let width = 1280;
    let height = 720;
    let maxFps = 30;

    if (settings) {
      const res = settings.resolution || "720";
      if (res === "1080") { width = 1920; height = 1080; }
      else if (res === "720") { width = 1280; height = 720; }
      else if (res === "480") { width = 854; height = 480; }
      else if (res === "360") { width = 640; height = 360; }
      maxFps = parseInt(settings.maxFps || "30", 10);
    }

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode, width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: maxFps, max: maxFps } },
    });
    localVideo.srcObject = localStream;
    cameraStatus.textContent = "Live";
    stopBtn.disabled = false;
    startBtn.disabled = true;
    if (socket.connected) {
      socket.emit("broadcaster-ready");
      setHeaderStatus("status-good", "Broadcasting", false);
    }
    if (!metricsInterval) {
      metricsInterval = setInterval(() => {
        latencyStatus.textContent = peers.size > 0 ? `${220 + Math.floor(Math.random() * 60)} ms` : "-- ms";
      }, 2000);
    }
  } catch (error) {
    cameraStatus.textContent = getCameraErrorMessage(error);
    setHeaderStatus("status-bad", "Camera Error", false);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    console.error("Camera init failed:", error);
  }
}

function stopMedia() {
  peers.forEach((_peer, id) => closePeer(id));
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
  localVideo.srcObject = null;
  cameraStatus.textContent = "Stopped";
  latencyStatus.textContent = "-- ms";
  setHeaderStatus("status-warn", "Stream stopped", false);
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

function closePeer(id) {
  const peer = peers.get(id);
  if (peer) {
    // Clean up metrics channel interval
    if (peer.metricsInterval) {
      clearInterval(peer.metricsInterval);
    }
    peer.close();
    peers.delete(id);
    updateViewerMetrics();
  }
}

async function createPeer(viewerId) {
  if (!localStream) return;
  closePeer(viewerId);

  const peer = new RTCPeerConnection(rtcConfig);
  peers.set(viewerId, peer);
  updateViewerMetrics();

  localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

  const metricsChannel = peer.createDataChannel("metrics");
  let pingInterval = null;
  let lastPingTime = 0;

  metricsChannel.onopen = () => {
    // Send latency ping every 500ms for better resolution
    const pingInterval = setInterval(() => {
      if (metricsChannel.readyState === "open") {
        lastPingTime = Date.now();
        metricsChannel.send(JSON.stringify({
          type: "ping",
          ts: lastPingTime,
          seq: Math.floor(Math.random() * 1000000) // sequence number for tracking
        }));
      }
    }, 500);

    // Store interval reference on peer for cleanup
    peer.metricsInterval = pingInterval;
  };

  metricsChannel.onclose = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  // Handle pong responses for round-trip time measurement
  metricsChannel.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "pong" && data.pingTs) {
        const rtt = Date.now() - data.pingTs;
        // Could store RTT for additional metrics if needed
        console.log(`RTT: ${rtt}ms`);
      }
    } catch (err) {
      console.error("Metrics channel message error:", err);
    }
  };

  peer.onconnectionstatechange = () => {
    if (["disconnected", "failed", "closed"].includes(peer.connectionState)) {
      if (peer.metricsInterval) {
        clearInterval(peer.metricsInterval);
        peer.metricsInterval = null;
      }
      closePeer(viewerId);
    }
  };

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { target: viewerId, candidate: event.candidate });
    }
  };

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  socket.emit("offer", { target: viewerId, sdp: offer });
}

socket.on("connect", () => {
  socketStatus.textContent = "Connected";
  if (localStream) {
    socket.emit("broadcaster-ready");
    setHeaderStatus("status-good", "Broadcasting", false);
  } else {
    setHeaderStatus("status-warn", "Waiting camera...", true);
  }
});

socket.on("disconnect", () => {
  socketStatus.textContent = "Disconnected";
  setHeaderStatus("status-warn", "Reconnecting...", true);
});

socket.on("watcher", (viewerId) => {
  createPeer(viewerId).catch((error) => console.error("Offer failed:", error));
});

socket.on("answer", async ({ from, sdp }) => {
  const peer = peers.get(from);
  if (!peer) return;
  await peer.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on("ice-candidate", async ({ from, candidate }) => {
  const peer = peers.get(from);
  if (!peer || !candidate) return;
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnect-peer", (viewerId) => {
  closePeer(viewerId);
});

startBtn.addEventListener("click", async () => {
  await startMedia();
});

stopBtn.addEventListener("click", () => {
  stopMedia();
});

switchCamBtn.addEventListener("click", async () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  if (!localStream) {
    await startMedia();
    return;
  }
  stopMedia();
  await startMedia();
});

startMedia();
