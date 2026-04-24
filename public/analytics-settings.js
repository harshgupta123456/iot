const DEFAULTS = {
  resolution: "720",
  bitrate: "2.5",
  maxFps: "30",
  codec: "vp8",
  drowsiness: "6",
  attentionThreshold: "80",
  speedLimit: "80",
  fatigueLevel: "medium",
  soundAlerts: true,
  visualAlerts: true,
  autoSnapshot: false,
  pushNotif: false,
  retention: "24",
  autoClear: true,
  allowExport: true,
  latencyWarn: "300",
  stunServer: "stun:stun.l.google.com:19302",
  reconnectDelay: "800",
  maxReconnect: "Infinity",
};

function $(id) {
  return document.getElementById(id);
}

function loadSettings() {
  const stored = localStorage.getItem("okdriver_settings");
  const settings = stored ? JSON.parse(stored) : { ...DEFAULTS };

  // Apply to inputs
  $("resolution").value = settings.resolution || DEFAULTS.resolution;
  $("bitrate").value = settings.bitrate || DEFAULTS.bitrate;
  $("maxFps").value = settings.maxFps || DEFAULTS.maxFps;
  $("codec").value = settings.codec || DEFAULTS.codec;

  $("drowsiness").value = settings.drowsiness || DEFAULTS.drowsiness;
  $("attentionThreshold").value = settings.attentionThreshold || DEFAULTS.attentionThreshold;
  $("speedLimit").value = settings.speedLimit || DEFAULTS.speedLimit;
  $("fatigueLevel").value = settings.fatigueLevel || DEFAULTS.fatigueLevel;

  $("soundAlerts").checked = settings.soundAlerts ?? DEFAULTS.soundAlerts;
  $("visualAlerts").checked = settings.visualAlerts ?? DEFAULTS.visualAlerts;
  $("autoSnapshot").checked = settings.autoSnapshot ?? DEFAULTS.autoSnapshot;
  $("pushNotif").checked = settings.pushNotif ?? DEFAULTS.pushNotif;

  $("retention").value = settings.retention || DEFAULTS.retention;
  $("autoClear").checked = settings.autoClear ?? DEFAULTS.autoClear;
  $("allowExport").checked = settings.allowExport ?? DEFAULTS.allowExport;

  $("latencyWarn").value = settings.latencyWarn || DEFAULTS.latencyWarn;
  $("stunServer").value = settings.stunServer || DEFAULTS.stunServer;
  $("reconnectDelay").value = settings.reconnectDelay || DEFAULTS.reconnectDelay;
  $("maxReconnect").value = settings.maxReconnect || DEFAULTS.maxReconnect;

  updateAllLabels();
}

function saveSettings() {
  const settings = {
    resolution: $("resolution").value,
    bitrate: $("bitrate").value,
    maxFps: $("maxFps").value,
    codec: $("codec").value,
    drowsiness: $("drowsiness").value,
    attentionThreshold: $("attentionThreshold").value,
    speedLimit: $("speedLimit").value,
    fatigueLevel: $("fatigueLevel").value,
    soundAlerts: $("soundAlerts").checked,
    visualAlerts: $("visualAlerts").checked,
    autoSnapshot: $("autoSnapshot").checked,
    pushNotif: $("pushNotif").checked,
    retention: $("retention").value,
    autoClear: $("autoClear").checked,
    allowExport: $("allowExport").checked,
    latencyWarn: $("latencyWarn").value,
    stunServer: $("stunServer").value,
    reconnectDelay: $("reconnectDelay").value,
    maxReconnect: $("maxReconnect").value,
  };
  localStorage.setItem("okdriver_settings", JSON.stringify(settings));
  showSaveStatus("Settings saved!", "status-good");
  updatePreview();
}

function resetSettings() {
  if (confirm("Reset all settings to defaults?")) {
    localStorage.removeItem("okdriver_settings");
    loadSettings();
    showSaveStatus("Reset to defaults", "status-warn");
    updatePreview();
  }
}

function showSaveStatus(text, colorClass) {
  const badge = $("saveStatus");
  badge.style.display = "inline-flex";
  badge.innerHTML = `<span class="status-dot ${colorClass}"></span>${text}`;
  setTimeout(() => {
    badge.style.display = "none";
  }, 2500);
}

function updateLabel(inputId, labelId, suffix = "") {
  const input = $(inputId);
  const label = $(labelId);
  if (!input || !label) return;
  label.textContent = input.value + suffix;
}

function updateAllLabels() {
  updateLabel("bitrate", "bitrateVal");
  updateLabel("maxFps", "maxFpsVal");
  updateLabel("drowsiness", "drowsinessVal");
  updateLabel("attentionThreshold", "attentionThresholdVal", "%");
  updateLabel("speedLimit", "speedLimitVal");
  updateLabel("retention", "retentionVal", "h");
  updateLabel("latencyWarn", "latencyWarnVal");
  updateLabel("reconnectDelay", "reconnectDelayVal");

  const mr = $("maxReconnect");
  const mrVal = $("maxReconnectVal");
  if (mr && mrVal) {
    mrVal.textContent = mr.value === "Infinity" ? "∞" : mr.value;
  }
}

function updatePreview() {
  const box = $("previewBox");
  const s = {
    resolution: $("resolution").value,
    bitrate: $("bitrate").value,
    maxFps: $("maxFps").value,
    attentionThreshold: $("attentionThreshold").value,
    speedLimit: $("speedLimit").value,
    latencyWarn: $("latencyWarn").value,
  };
  box.style.display = "block";
  box.innerHTML = `
    <strong>Active Configuration Preview</strong><br/>
    Stream: ${s.resolution}p @ ${s.bitrate} Mbps, ${s.maxFps} FPS<br/>
    Alerts: Attention < ${s.attentionThreshold}%, Speed > ${s.speedLimit} km/h, Latency warn > ${s.latencyWarn} ms
  `;
}

function exportData() {
  const data = localStorage.getItem("okdriver_settings");
  if (!data) {
    alert("No settings data to export.");
    return;
  }
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `okdriver-settings-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showSaveStatus("Exported JSON", "status-good");
}

function clearAllData() {
  if (confirm("Clear all local settings and cached data? This cannot be undone.")) {
    localStorage.removeItem("okdriver_settings");
    loadSettings();
    showSaveStatus("All data cleared", "status-bad");
    $("previewBox").style.display = "none";
  }
}

// Attach listeners
[
  "bitrate",
  "maxFps",
  "drowsiness",
  "attentionThreshold",
  "speedLimit",
  "retention",
  "latencyWarn",
  "reconnectDelay",
].forEach((id) => {
  $(id)?.addEventListener("input", () => updateAllLabels());
});

$("maxReconnect")?.addEventListener("input", () => updateAllLabels());

$("saveBtn")?.addEventListener("click", saveSettings);
$("resetBtn")?.addEventListener("click", resetSettings);
$("exportBtn")?.addEventListener("click", exportData);
$("clearBtn")?.addEventListener("click", clearAllData);

// Init
loadSettings();

