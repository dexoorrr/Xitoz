const VERSION = "2.0.0";

/* =========================================================
   CORS
========================================================= */

function getCorsHeaders(request) {
    const requestedHeaders =
        request.headers.get("Access-Control-Request-Headers");

    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
            requestedHeaders ||
            "Content-Type, Authorization, request-id, x-request-id, traceparent",
        "Access-Control-Max-Age": "86400"
    };
}

/* =========================================================
   JSON RESPONSE
========================================================= */

function json(data, status = 200, request = null) {

    const cors = request
        ? getCorsHeaders(request)
        : {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, request-id, x-request-id, traceparent"
        };

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                ...cors,
                "Content-Type":
                    "application/json; charset=utf-8"
            }
        }
    );

}

/* =========================================================
   API KEY
========================================================= */

function getKey(request) {

    const auth =
        request.headers.get("Authorization");

    if (
        !auth ||
        !auth.startsWith("Bearer ")
    ) {
        return null;
    }

    return auth
        .slice(7)
        .trim();

}

function validKey(request, env) {

    const key =
        getKey(request);

    if (
        !key ||
        !env.API_KEYS
    ) {
        return false;
    }

    return env.API_KEYS
        .split(",")
        .map(k => k.trim())
        .filter(Boolean)
        .includes(key);

}

/* =========================================================
   ID
========================================================= */

function makeId(prefix = "job") {

    return (
        prefix +
        "_" +
        crypto
            .randomUUID()
            .replaceAll("-", "")
    );

}

/* =========================================================
   CLIENT CODE
========================================================= */

const CLIENT_CODE = `

(() => {

const API = API_URL;
const KEY = API_KEY;

document.getElementById("xitos-mc")?.remove();
document.getElementById("xitos-mc-style")?.remove();
document.getElementById("xmc-minimized")?.remove();

const VERSION = "2.0.0";

/* =========================================================
   THEMES
========================================================= */

const themes = {

    plains: {
        name: "Planícies",
        icon: "🌾",
        main: "#5f9d3b",
        dark: "#26351e",
        panel: "#211912",
        border: "#d1a85b",
        accent: "#79c34b"
    },

    forest: {
        name: "Floresta",
        icon: "🌲",
        main: "#3d7b36",
        dark: "#1d321e",
        panel: "#171d16",
        border: "#9b743c",
        accent: "#5fb84d"
    },

    taiga: {
        name: "Taiga",
        icon: "❄️",
        main: "#52775b",
        dark: "#202b2b",
        panel: "#182020",
        border: "#b28b58",
        accent: "#82b878"
    },

    desert: {
        name: "Deserto",
        icon: "🏜️",
        main: "#b88939",
        dark: "#49351d",
        panel: "#2b2015",
        border: "#d6ae62",
        accent: "#e0b34d"
    },

    snow: {
        name: "Picos Nevados",
        icon: "🏔️",
        main: "#668fa9",
        dark: "#263847",
        panel: "#17232c",
        border: "#bcd5e3",
        accent: "#8ed1ef"
    },

    nether: {
        name: "Nether",
        icon: "🔥",
        main: "#a52d20",
        dark: "#260d0d",
        panel: "#180c0c",
        border: "#bd6534",
        accent: "#ff6a2a"
    },

    end: {
        name: "The End",
        icon: "🟣",
        main: "#69519c",
        dark: "#171322",
        panel: "#181320",
        border: "#9c7ad1",
        accent: "#bd82ed"
    },

    obsidian: {
        name: "Obsidiana",
        icon: "⬛",
        main: "#363644",
        dark: "#101018",
        panel: "#0b0b10",
        border: "#68687c",
        accent: "#a4a4ff"
    },

    emerald: {
        name: "Esmeralda",
        icon: "💎",
        main: "#16866b",
        dark: "#0b2e28",
        panel: "#0a1b18",
        border: "#45d6ad",
        accent: "#48f0bc"
    }

};

/* =========================================================
   WRITE MODES
========================================================= */

const modes = {

    turtle: {
        name: "🐢 Tartaruga",
        speed: 180,
        variation: 25
    },

    normal: {
        name: "🚶 Normal",
        speed: 55,
        variation: 12
    },

    fast: {
        name: "⚡ Rápido",
        speed: 22,
        variation: 6
    },

    insta: {
        name: "💨 Insta",
        speed: 5,
        variation: 0
    }

};

/* =========================================================
   SETTINGS
========================================================= */

let settings =
    JSON.parse(
        localStorage.getItem(
            "xitos-v2-settings"
        ) || "null"
    ) || {

        theme: "plains",
        mode: "normal",

        speed: 55,

        errorRate: 0,
        correction: true,
        correctionDelay: 120,

        clickSound: true,
        volume: 0.25,

        particles: true,

        bgImage: "",
        bgOpacity: 0.12

    };

/* =========================================================
   STATE
========================================================= */

let running = false;
let dragging = false;

let dragX = 0;
let dragY = 0;

/* =========================================================
   SAVE
========================================================= */

function save() {

    localStorage.setItem(
        "xitos-v2-settings",
        JSON.stringify(settings)
    );

}

/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;

function clickSound() {

    if (!settings.clickSound)
        return;

    try {

        audioContext ||=
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

        const osc =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        osc.type =
            "square";

        osc.frequency.value =
            500 +
            Math.random() * 160;

        const now =
            audioContext.currentTime;

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            Math.max(
                0.0001,
                settings.volume
            ),
            now + 0.005
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.035
        );

        osc.connect(gain);
        gain.connect(
            audioContext.destination
        );

        osc.start();
        osc.stop(now + 0.04);

    } catch {}

}

/* =========================================================
   STYLE
========================================================= */

const style =
    document.createElement("style");

style.id =
    "xitos-mc-style";

style.textContent = \`

@import url(
'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
);

#xitos-mc {

    --main: #5f9d3b;
    --dark: #26351e;
    --panel: #211912;
    --border: #d1a85b;
    --accent: #79c34b;

    position: fixed;

    right: 22px;
    bottom: 22px;

    width: 410px;

    max-width:
        calc(100vw - 24px);

    z-index: 2147483647;

    color: #fff;

    font-family:
        Arial,
        sans-serif;

    background:
        linear-gradient(
            180deg,
            var(--panel),
            #090807
        );

    border:
        3px solid var(--border);

    border-radius:
        14px;

    box-shadow:
        0 12px 0 #0007,
        0 25px 70px #000b,
        inset 0 0 0 1px #ffffff10;

    overflow:
        hidden;

    backdrop-filter:
        blur(12px);

}

#xmc-bg {

    position:
        absolute;

    inset:
        0;

    background:
        center / cover
        no-repeat;

    pointer-events:
        none;

}

#xmc-content {

    position:
        relative;

    z-index:
        2;

}

#xmc-header {

    min-height:
        68px;

    padding:
        0 13px;

    display:
        flex;

    align-items:
        center;

    gap:
        10px;

    cursor:
        move;

    background:
        linear-gradient(
            135deg,
            var(--main),
            var(--dark)
        );

}

#xmc-logo {

    width:
        45px;

    height:
        45px;

    display:
        grid;

    place-items:
        center;

    font-size:
        25px;

    background:
        #0005;

    border:
        2px solid #fff3;

    border-radius:
        9px;

}

#xmc-title {

    font-family:
        'Press Start 2P',
        monospace;

    font-size:
        13px;

    text-shadow:
        2px 2px #000;

}

#xmc-sub {

    margin-top:
        6px;

    font-size:
        10px;

    opacity:
        .75;

}

.xmc-head-btn {

    margin-left:
        auto;

    display:
        flex;

    gap:
        5px;

}

.xmc-icon-btn {

    width:
        31px;

    height:
        31px;

    border:
        1px solid #fff3;

    background:
        #0005;

    color:
        white;

    cursor:
        pointer;

    border-radius:
        7px;

    font-size:
        17px;

}

.xmc-icon-btn:hover {

    background:
        #fff2;

}

#xmc-tabs {

    display:
        flex;

    gap:
        6px;

    padding:
        8px;

    background:
        #0005;

}

.xmc-tab {

    flex:
        1;

    border:
        1px solid #ffffff12;

    background:
        #ffffff05;

    color:
        #aaa;

    padding:
        9px 5px;

    border-radius:
        8px;

    cursor:
        pointer;

    font-size:
        10px;

}

.xmc-tab.active {

    color:
        #fff;

    border-color:
        var(--accent);

    background:
        #ffffff0c;

}

#xmc-body {

    padding:
        11px;

}

.xmc-section {

    display:
        none;

}

.xmc-section.active {

    display:
        block;

}

.xmc-card {

    padding:
        11px;

    margin-bottom:
        9px;

    border:
        1px solid #ffffff12;

    background:
        #0005;

    border-radius:
        10px;

}

.xmc-label {

    margin-bottom:
        8px;

    color:
        var(--accent);

    font-size:
        10px;

    font-weight:
        800;

    text-transform:
        uppercase;

}

.xmc-row {

    display:
        flex;

    gap:
        7px;

    align-items:
        center;

}

.xmc-select,
.xmc-input,
.xmc-number {

    width:
        100%;

    box-sizing:
        border-box;

    padding:
        9px;

    color:
        #fff;

    background:
        #0d0d0d;

    border:
        1px solid #594632;

    border-radius:
        7px;

    outline:
        none;

}

.xmc-select:focus,
.xmc-input:focus,
.xmc-number:focus {

    border-color:
        var(--accent);

}

.xmc-range {

    width:
        100%;

    accent-color:
        var(--accent);

}

.xmc-value {

    min-width:
        62px;

    text-align:
        right;

    font-size:
        10px;

    opacity:
        .75;

}

.xmc-mode-grid {

    display:
        grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap:
        7px;

}

.xmc-mode {

    padding:
        10px;

    text-align:
        left;

    color:
        white;

    border:
        1px solid #ffffff12;

    background:
        #ffffff05;

    border-radius:
        8px;

    cursor:
        pointer;

}

.xmc-mode small {

    display:
        block;

    margin-top:
        4px;

    font-size:
        9px;

    opacity:
        .5;

}

.xmc-mode.active {

    border-color:
        var(--accent);

    box-shadow:
        inset 0 0 0 1px var(--accent);

}

.xmc-btn {

    border:
        0;

    padding:
        10px 13px;

    color:
        white;

    background:
        linear-gradient(
            180deg,
            var(--main),
            var(--dark)
        );

    border-radius:
        7px;

    font-weight:
        800;

    cursor:
        pointer;

    box-shadow:
        0 2px 0 #0008;

}

.xmc-btn:hover {

    filter:
        brightness(1.12);

}

.xmc-danger {

    background:
        linear-gradient(
            180deg,
            #b95448,
            #702d27
        );

}

.xmc-switch {

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        10px;

    font-size:
        11px;

}

.xmc-switch input {

    width:
        40px;

    height:
        20px;

    accent-color:
        var(--accent);

}

.xmc-muted {

    margin-top:
        7px;

    font-size:
        9px;

    line-height:
        1.5;

    opacity:
        .5;

}

#xmc-status {

    padding:
        9px;

    font-size:
        10px;

    background:
        #0007;

    border:
        1px solid #ffffff0c;

    border-radius:
        7px;

}

#xmc-progress {

    height:
        12px;

    margin-top:
        8px;

    overflow:
        hidden;

    background:
        #070707;

    border:
        1px solid #000;

    border-radius:
        99px;

}

#xmc-bar {

    height:
        100%;

    width:
        0%;

    background:
        linear-gradient(
            90deg,
            var(--main),
            var(--accent)
        );

    transition:
        width .1s linear;

}

#xmc-percent {

    margin-top:
        4px;

    text-align:
        right;

    font-size:
        9px;

    opacity:
        .55;

}

#xmc-estimate {

    text-align:
        center;

    padding:
        8px;

    background:
        #ffffff06;

    border-radius:
        7px;

    font-size:
        10px;

}

#xmc-minimized {

    position:
        fixed;

    right:
        22px;

    bottom:
        22px;

    width:
        62px;

    height:
        62px;

    z-index:
        2147483647;

    display:
        none;

    place-items:
        center;

    font-size:
        28px;

    cursor:
        pointer;

    background:
        var(--main);

    border:
        3px solid var(--border);

    border-radius:
        10px;

    box-shadow:
        0 10px 30px #0008;

}

\`;

document.head.appendChild(style);

/* =========================================================
   PANEL
========================================================= */

const panel =
    document.createElement("div");

panel.id =
    "xitos-mc";

panel.innerHTML = \`

<div id="xmc-bg"></div>

<div id="xmc-content">

<div id="xmc-header">

    <div id="xmc-logo">
        ⛏️
    </div>

    <div>

        <div id="xmc-title">
            XITOS
        </div>

        <div id="xmc-sub">
            Survival Edition • v${VERSION}
        </div>

    </div>

    <div class="xmc-head-btn">

        <button
            class="xmc-icon-btn"
            id="xmc-min">
            −
        </button>

        <button
            class="xmc-icon-btn"
            id="xmc-close">
            ×
        </button>

    </div>

</div>

<div id="xmc-tabs">

    <button
        class="xmc-tab active"
        data-tab="write">
        ✍️ Escrita
    </button>

    <button
        class="xmc-tab"
        data-tab="visual">
        🎨 Visual
    </button>

    <button
        class="xmc-tab"
        data-tab="audio">
        🔊 Áudio
    </button>

</div>

<div id="xmc-body">

<!-- =====================================================
     WRITE
===================================================== -->

<div
    class="xmc-section active"
    data-section="write">

    <div class="xmc-card">

        <div class="xmc-label">
            ⚡ Modo de escrita
        </div>

        <div class="xmc-mode-grid">

            <button
                class="xmc-mode"
                data-mode="turtle">
                🐢 Tartaruga
                <small>Muito lento</small>
            </button>

            <button
                class="xmc-mode active"
                data-mode="normal">
                🚶 Normal
                <small>Natural</small>
            </button>

            <button
                class="xmc-mode"
                data-mode="fast">
                ⚡ Rápido
                <small>Velocidade alta</small>
            </button>

            <button
                class="xmc-mode"
                data-mode="insta">
                💨 Insta
                <small>Quase instantâneo</small>
            </button>

        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-label">
            🎯 Velocidade
        </div>

        <div class="xmc-row">

            <input
                id="xmc-speed"
                class="xmc-range"
                type="range"
                min="5"
                max="500"
                value="55">

            <div
                id="xmc-speed-value"
                class="xmc-value">
                55 ms
            </div>

        </div>

        <div class="xmc-muted">
            Intervalo médio entre caracteres.
        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-label">
            🧠 Margem de erros
        </div>

        <div class="xmc-row">

            <input
                id="xmc-error"
                class="xmc-range"
                type="range"
                min="0"
                max="30"
                value="0">

            <div
                id="xmc-error-value"
                class="xmc-value">
                0%
            </div>

        </div>

        <label class="xmc-switch">

            Corrigir erros automaticamente

            <input
                id="xmc-correction"
                type="checkbox"
                checked>

        </label>

        <div
            class="xmc-row"
            style="margin-top:8px">

            <input
                id="xmc-correction-delay"
                class="xmc-number"
                type="number"
                min="0"
                max="3000"
                value="120">

        </div>

        <div class="xmc-muted">
            O texto pode conter erros temporários que
            são corrigidos depois.
        </div>

    </div>

    <div class="xmc-card">

        <div
            id="xmc-estimate">
            Estimativa: 0 s
        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-row">

            <button
                class="xmc-btn"
                id="xmc-start">
                ▶ INICIAR
            </button>

            <button
                class="xmc-btn xmc-danger"
                id="xmc-stop">
                ■ PARAR
            </button>

        </div>

    </div>

</div>

<!-- =====================================================
     VISUAL
===================================================== -->

<div
    class="xmc-section"
    data-section="visual">

    <div class="xmc-card">

        <div class="xmc-label">
            🌍 Tema
        </div>

        <select
            id="xmc-theme"
            class="xmc-select">
        </select>

    </div>

    <div class="xmc-card">

        <div class="xmc-label">
            🖼️ Fundo personalizado
        </div>

        <input
            id="xmc-image"
            class="xmc-input"
            type="file"
            accept="image/png,image/jpeg,image/webp">

        <div
            id="xmc-image-status"
            class="xmc-muted">
            PNG/JPG/WEBP armazenado localmente.
        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-label">
            🌫️ Opacidade do fundo
        </div>

        <div class="xmc-row">

            <input
                id="xmc-bg-opacity"
                class="xmc-range"
                type="range"
                min="0"
                max="100"
                value="12">

            <div
                id="xmc-bg-opacity-value"
                class="xmc-value">
                12%
            </div>

        </div>

    </div>

    <div class="xmc-card">

        <label class="xmc-switch">

            ✨ Partículas

            <input
                id="xmc-particles"
                type="checkbox"
                checked>

        </label>

    </div>

</div>

<!-- =====================================================
     AUDIO
===================================================== -->

<div
    class="xmc-section"
    data-section="audio">

    <div class="xmc-card">

        <label class="xmc-switch">

            🔊 Som de clique

            <input
                id="xmc-click"
                type="checkbox"
                checked>

        </label>

    </div>

    <div class="xmc-card">

        <div class="xmc-label">
            Volume
        </div>

        <div class="xmc-row">

            <input
                id="xmc-volume"
                class="xmc-range"
                type="range"
                min="0"
                max="100"
                value="25">

            <div
                id="xmc-volume-value"
                class="xmc-value">
                25%
            </div>

        </div>

    </div>

    <div class="xmc-card">

        <button
            class="xmc-btn"
            id="xmc-test-sound">
            🔊 Testar som
        </button>

    </div>

</div>

<div id="xmc-status">
    🟢 Client conectado.
</div>

<div id="xmc-progress">

    <div id="xmc-bar"></div>

</div>

<div id="xmc-percent">
    0%
</div>

</div>
</div>

\`;

document.body.appendChild(panel);

/* =========================================================
   MINIMIZED
========================================================= */

const minimized =
    document.createElement("div");

minimized.id =
    "xmc-minimized";

minimized.textContent =
    "⛏️";

document.body.appendChild(
    minimized
);

/* =========================================================
   ELEMENTS
========================================================= */

const bg =
    document.getElementById("xmc-bg");

const status =
    document.getElementById("xmc-status");

const bar =
    document.getElementById("xmc-bar");

const percent =
    document.getElementById("xmc-percent");

const speed =
    document.getElementById("xmc-speed");

const speedValue =
    document.getElementById("xmc-speed-value");

const error =
    document.getElementById("xmc-error");

const errorValue =
    document.getElementById("xmc-error-value");

const correction =
    document.getElementById("xmc-correction");

const correctionDelay =
    document.getElementById(
        "xmc-correction-delay"
    );

const estimate =
    document.getElementById(
        "xmc-estimate"
    );

const themeSelect =
    document.getElementById(
        "xmc-theme"
    );

const imageInput =
    document.getElementById(
        "xmc-image"
    );

const imageStatus =
    document.getElementById(
        "xmc-image-status"
    );

const bgOpacity =
    document.getElementById(
        "xmc-bg-opacity"
    );

const bgOpacityValue =
    document.getElementById(
        "xmc-bg-opacity-value"
    );

const particles =
    document.getElementById(
        "xmc-particles"
    );

const clickToggle =
    document.getElementById(
        "xmc-click"
    );

const volume =
    document.getElementById(
        "xmc-volume"
    );

const volumeValue =
    document.getElementById(
        "xmc-volume-value"
    );

/* =========================================================
   THEMES
========================================================= */

for (
    const [id, theme]
    of Object.entries(themes)
) {

    const option =
        document.createElement("option");

    option.value =
        id;

    option.textContent =
        theme.icon +
        " " +
        theme.name;

    themeSelect.appendChild(
        option
    );

}

/* =========================================================
   THEME
========================================================= */

function applyTheme() {

    const theme =
        themes[settings.theme] ||
        themes.plains;

    panel.style.setProperty(
        "--main",
        theme.main
    );

    panel.style.setProperty(
        "--dark",
        theme.dark
    );

    panel.style.setProperty(
        "--panel",
        theme.panel
    );

    panel.style.setProperty(
        "--border",
        theme.border
    );

    panel.style.setProperty(
        "--accent",
        theme.accent
    );

    themeSelect.value =
        settings.theme;

    bg.style.backgroundImage =
        settings.bgImage
            ? 'url("' +
                settings.bgImage +
                '")'
            : "none";

    bg.style.opacity =
        settings.bgImage
            ? Number(
                settings.bgOpacity ?? .12
              )
            : 0;

    imageStatus.textContent =
        settings.bgImage
            ? "✅ Fundo personalizado ativo."
            : "PNG/JPG/WEBP armazenado localmente.";

    particles.style.display =
        settings.particles
            ? "block"
            : "none";

}

/* =========================================================
   MODE
========================================================= */

function applyMode() {

    const mode =
        modes[settings.mode] ||
        modes.normal;

    speed.value =
        settings.speed ??
        mode.speed;

    speedValue.textContent =
        speed.value +
        " ms";

    document
        .querySelectorAll(
            ".xmc-mode"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.mode ===
                        settings.mode
                );

            }
        );

}

/* =========================================================
   ESTIMATE
========================================================= */

function formatTime(seconds) {

    if (seconds < 1)
        return "< 1 s";

    const s =
        Math.round(seconds);

    const mins =
        Math.floor(s / 60);

    const secs =
        s % 60;

    if (mins > 0) {

        return (
            mins +
            " min " +
            secs +
            " s"
        );

    }

    return s + " s";

}

function updateEstimate(length = 100) {

    const delay =
        Number(speed.value) || 55;

    const estimated =
        (
            Number(length) *
            delay
        ) / 1000;

    estimate.textContent =
        "⏱️ Estimativa: " +
        formatTime(estimated);

}

/* =========================================================
   UI EVENTS
========================================================= */

speed.oninput = () => {

    settings.speed =
        Number(speed.value);

    speedValue.textContent =
        speed.value +
        " ms";

    save();

    updateEstimate();

};

error.oninput = () => {

    settings.errorRate =
        Number(error.value);

    errorValue.textContent =
        error.value +
        "%";

    save();

};

correction.onchange = () => {

    settings.correction =
        correction.checked;

    save();

};

correctionDelay.oninput = () => {

    settings.correctionDelay =
        Math.max(
            0,
            Number(
                correctionDelay.value
            ) || 0
        );

    save();

};

themeSelect.onchange = () => {

    settings.theme =
        themeSelect.value;

    applyTheme();
    save();

};

bgOpacity.oninput = () => {

    settings.bgOpacity =
        Number(bgOpacity.value) /
        100;

    bgOpacityValue.textContent =
        bgOpacity.value +
        "%";

    bg.style.opacity =
        settings.bgImage
            ? settings.bgOpacity
            : 0;

    save();

};

particles.onchange = () => {

    settings.particles =
        particles.checked;

    particles.style.display =
        settings.particles
            ? "block"
            : "none";

    save();

};

clickToggle.onchange = () => {

    settings.clickSound =
        clickToggle.checked;

    save();

};

volume.oninput = () => {

    settings.volume =
        Number(volume.value) /
        100;

    volumeValue.textContent =
        volume.value +
        "%";

    save();

};

document
    .getElementById(
        "xmc-test-sound"
    )
    .onclick =
        clickSound;

/* =========================================================
   IMAGE
========================================================= */

imageInput.onchange = () => {

    const file =
        imageInput.files?.[0];

    if (!file)
        return;

    if (
        ![
            "image/png",
            "image/jpeg",
            "image/webp"
        ].includes(file.type)
    ) {

        alert(
            "Use PNG, JPG ou WEBP."
        );

        return;

    }

    const reader =
        new FileReader();

    reader.onload = () => {

        settings.bgImage =
            String(
                reader.result
            );

        applyTheme();
        save();

    };

    reader.readAsDataURL(file);

};

/* =========================================================
   TABS
========================================================= */

document
    .querySelectorAll(
        ".xmc-tab"
    )
    .forEach(
        tab => {

            tab.onclick = () => {

                const target =
                    tab.dataset.tab;

                document
                    .querySelectorAll(
                        ".xmc-tab"
                    )
                    .forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                item === tab
                            );

                        }
                    );

                document
                    .querySelectorAll(
                        ".xmc-section"
                    )
                    .forEach(
                        section => {

                            section.classList.toggle(
                                "active",
                                section.dataset.section ===
                                    target
                            );

                        }
                    );

            };

        }
    );

/* =========================================================
   MODES
========================================================= */

document
    .querySelectorAll(
        ".xmc-mode"
    )
    .forEach(
        button => {

            button.onclick = () => {

                const id =
                    button.dataset.mode;

                settings.mode =
                    id;

                settings.speed =
                    modes[id].speed;

                applyMode();
                save();
                updateEstimate();

            };

        }
    );

/* =========================================================
   TARGET
========================================================= */

function target() {

    const active =
        document.activeElement;

    if (
        active &&
        (
            active.tagName ===
                "TEXTAREA" ||

            (
                active.tagName ===
                    "INPUT" &&
                active.type !==
                    "hidden"
            ) ||

            active.isContentEditable
        )
    ) {

        return active;

    }

    return document.querySelector(
        "textarea," +
        "input:not([type=hidden])," +
        "[contenteditable=true]"
    );

}

/* =========================================================
   INSERT
========================================================= */

function insert(el, char) {

    if (
        el.isContentEditable
    ) {

        document.execCommand(
            "insertText",
            false,
            char
        );

        return;

    }

    const start =
        el.selectionStart ??
        el.value.length;

    const end =
        el.selectionEnd ??
        el.value.length;

    el.setRangeText(
        char,
        start,
        end,
        "end"
    );

    el.dispatchEvent(
        new InputEvent(
            "input",
            {
                bubbles:
                    true,

                inputType:
                    "insertText",

                data:
                    char
            }
        )
    );

}

/* =========================================================
   BACKSPACE
========================================================= */

function backspace(el) {

    if (
        el.isContentEditable
    ) {

        document.execCommand(
            "delete",
            false
        );

        return;

    }

    const start =
        el.selectionStart ??
        el.value.length;

    const end =
        el.selectionEnd ??
        el.value.length;

    if (
        start === 0 &&
        end === 0
    )
        return;

    const position =
        Math.max(
            0,
            start - 1
        );

    el.setSelectionRange(
        position,
        end
    );

    el.setRangeText(
        "",
        position,
        end,
        "end"
    );

    el.dispatchEvent(
        new InputEvent(
            "input",
            {
                bubbles:
                    true,

                inputType:
                    "deleteContentBackward"
            }
        )
    );

}

/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                Math.max(
                    0,
                    ms
                )
            )
    );

}

/* =========================================================
   API
========================================================= */

async function api(
    path,
    options = {}
) {

    const response =
        await fetch(
            API + path,
            {
                ...options,

                headers: {
                    Authorization:
                        "Bearer " + KEY,

                    ...(options.headers || {})
                }
            }
        );

    let data;

    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "Resposta inválida."
        );

    }

    if (!response.ok) {

        throw new Error(
            data.error ||
            "Erro na API."
        );

    }

    return data;

}

/* =========================================================
   ERROR GENERATOR
========================================================= */

function shouldError() {

    if (
        settings.mode === "insta"
    )
        return false;

    return (
        Math.random() <
        Number(
            settings.errorRate
        ) / 100
    );

}

function randomWrongChar(correct) {

    const letters =
        "abcdefghijklmnopqrstuvwxyz";

    let char;

    do {

        char =
            letters[
                Math.floor(
                    Math.random() *
                    letters.length
                )
            ];

    } while (
        char ===
        String(correct).toLowerCase()
    );

    return char;

}

/* =========================================================
   RUN
========================================================= */

async function run(job) {

    const el =
        target();

    if (!el) {

        throw new Error(
            "Clique primeiro no campo de texto."
        );

    }

    el.focus();

    const text =
        String(
            job.text ||
            ""
        );

    const total =
        text.length;

    if (!total)
        return;

    updateEstimate(total);

    const baseDelay =
        Number(
            speed.value
        ) || 55;

    for (
        let i = 0;
        i < total;
        i++
    ) {

        if (!running)
            throw new Error("STOP");

        let delay =
            baseDelay;

        const mode =
            modes[
                settings.mode
            ];

        if (
            mode &&
            mode.variation
        ) {

            delay +=
                (
                    Math.random() *
                    mode.variation *
                    2
                ) -
                mode.variation;

        }

        await wait(
            Math.max(
                5,
                delay
            )
        );

        /* =====================================
           TEMPORARY ERROR
        ===================================== */

        if (
            shouldError()
        ) {

            const wrong =
                randomWrongChar(
                    text[i]
                );

            insert(
                el,
                wrong
            );

            clickSound();

            if (
                settings.correction
            ) {

                await wait(
                    Number(
                        settings.correctionDelay
                    ) || 120
                );

                backspace(el);

                await wait(30);

            }

        }

        insert(
            el,
            text[i]
        );

        clickSound();

        const progress =
            Math.round(
                (
                    (i + 1) /
                    total
                ) *
                100
            );

        bar.style.width =
            progress + "%";

        percent.textContent =
            progress + "%";

        if (
            (i + 1) % 10 === 0 ||
            i + 1 === total
        ) {

            await api(
                "/v1/jobs/" +
                encodeURIComponent(
                    job.id
                ) +
                "/status",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            status:
                                "typing",

                            progress,

                            done:
                                i + 1,

                            total

                        })

                }
            );

        }

    }

}

/* =========================================================
   LOOP
========================================================= */

async function loop() {

    while (running) {

        try {

            status.textContent =
                "🔎 Procurando job...";

            const data =
                await api(
                    "/v1/jobs/next"
                );

            if (!data.job) {

                status.textContent =
                    "🌙 Nenhum job na fila.";

                await wait(3000);

                continue;

            }

            bar.style.width =
                "0%";

            percent.textContent =
                "0%";

            status.textContent =
                "✏️ Digitando...";

            await run(
                data.job
            );

            await api(
                "/v1/jobs/" +
                encodeURIComponent(
                    data.job.id
                ) +
                "/status",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            status:
                                "completed",

                            progress:
                                100,

                            done:
                                String(
                                    data.job.text ||
                                    ""
                                ).length,

                            total:
                                String(
                                    data.job.text ||
                                    ""
                                ).length

                        })
                }
            );

            status.textContent =
                "🌟 Job concluído!";

        } catch (error) {

            if (
                error.message ===
                "STOP"
            ) {

                status.textContent =
                    "⏹️ Operação parada.";

            } else {

                console.error(
                    "[Xitos]",
                    error
                );

                status.textContent =
                    "❌ " +
                    error.message;

            }

            running = false;

        }

    }

}

/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "xmc-start"
    )
    .onclick = () => {

        if (running)
            return;

        if (!target()) {

            status.textContent =
                "⚠️ Clique no campo onde deseja digitar.";

            return;

        }

        running = true;

        status.textContent =
            "🌱 Xitos iniciado!";

        loop();

    };

document
    .getElementById(
        "xmc-stop"
    )
    .onclick = () => {

        running = false;

        status.textContent =
            "⏹️ Parando...";

    };

/* =========================================================
   MINIMIZE
========================================================= */

document
    .getElementById(
        "xmc-min"
    )
    .onclick = () => {

        panel.style.display =
            "none";

        minimized.style.display =
            "grid";

    };

minimized.onclick = () => {

    minimized.style.display =
        "none";

    panel.style.display =
        "block";

};

/* =========================================================
   CLOSE
========================================================= */

document
    .getElementById(
        "xmc-close"
    )
    .onclick = () => {

        running = false;

        panel.remove();
        minimized.remove();
        style.remove();

    };

/* =========================================================
   DRAG
========================================================= */

const header =
    document.getElementById(
        "xmc-header"
    );

header.addEventListener(
    "mousedown",
    e => {

        if (
            e.target.closest(
                "button"
            )
        )
            return;

        dragging = true;

        const rect =
            panel.getBoundingClientRect();

        dragX =
            e.clientX -
            rect.left;

        dragY =
            e.clientY -
            rect.top;

        panel.style.left =
            rect.left + "px";

        panel.style.top =
            rect.top + "px";

        panel.style.right =
            "auto";

        panel.style.bottom =
            "auto";

    }
);

document.addEventListener(
    "mousemove",
    e => {

        if (!dragging)
            return;

        panel.style.left =
            (
                e.clientX -
                dragX
            ) + "px";

        panel.style.top =
            (
                e.clientY -
                dragY
            ) + "px";

    }
);

document.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);

/* =========================================================
   HOTKEY
========================================================= */

document.addEventListener(
    "keydown",
    e => {

        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase() ===
                "x"
        ) {

            e.preventDefault();

            if (
                panel.style.display ===
                "none"
            ) {

                panel.style.display =
                    "block";

                minimized.style.display =
                    "none";

            } else {

                panel.style.display =
                    "none";

                minimized.style.display =
                    "grid";

            }

        }

    }
);

/* =========================================================
   STARTUP
========================================================= */

speed.value =
    settings.speed ??
    55;

speedValue.textContent =
    speed.value +
    " ms";

error.value =
    settings.errorRate ??
    0;

errorValue.textContent =
    error.value +
    "%";

correction.checked =
    settings.correction !== false;

correctionDelay.value =
    settings.correctionDelay ??
    120;

themeSelect.value =
    settings.theme;

particles.checked =
    settings.particles !== false;

clickToggle.checked =
    settings.clickSound !== false;

volume.value =
    Math.round(
        (
            settings.volume ??
            0.25
        ) *
        100
    );

volumeValue.textContent =
    volume.value +
    "%";

bgOpacity.value =
    Math.round(
        (
            settings.bgOpacity ??
            0.12
        ) *
        100
    );

bgOpacityValue.textContent =
    bgOpacity.value +
    "%";

applyTheme();
applyMode();
updateEstimate();

console.log(
    "%c⛏️ XITOS v" + VERSION,
    "color:#79c34b;font-size:20px;font-weight:bold"
);

})();

`;

/* =========================================================
   WORKER
========================================================= */

export default {

    async fetch(request, env) {

        const cors =
            getCorsHeaders(request);

        /* =====================================================
           PREFLIGHT
        ===================================================== */

        if (
            request.method ===
            "OPTIONS"
        ) {

            return new Response(
                null,
                {
                    status: 204,
                    headers: cors
                }
            );

        }

        const url =
            new URL(
                request.url
            );

        /* =====================================================
           HOME
        ===================================================== */

        if (
            request.method ===
                "GET" &&
            url.pathname === "/"
        ) {

            return json(
                {
                    ok: true,
                    name: "Xitos API",
                    version: VERSION,
                    status: "online"
                },
                200,
                request
            );

        }

        /* =====================================================
           CLIENT
           GET /v1/client
        ===================================================== */

        if (
            request.method ===
                "GET" &&
            url.pathname ===
                "/v1/client"
        ) {

            const key =
                getKey(request);

            if (!key) {

                return json(
                    {
                        ok: false,
                        error:
                            "API Key não informada."
                    },
                    401,
                    request
                );

            }

            if (
                !validKey(
                    request,
                    env
                )
            ) {

                return json(
                    {
                        ok: false,
                        error:
                            "API Key inválida."
                    },
                    401,
                    request
                );

            }

            const apiUrl =
                url.origin;

            const code =
                CLIENT_CODE
                    .replace(
                        /API_URL/g,
                        JSON.stringify(
                            apiUrl
                        )
                    )
                    .replace(
                        /API_KEY/g,
                        JSON.stringify(
                            key
                        )
                    );

            return json(
                {
                    ok: true,
                    authorized:
                        true,
                    version:
                        VERSION,
                    code
                },
                200,
                request
            );

        }

        /* =====================================================
           CREATE JOB
           POST /v1/type
        ===================================================== */

        if (
            request.method ===
                "POST" &&
            url.pathname ===
                "/v1/type"
        ) {

            if (
                !validKey(
                    request,
                    env
                )
            ) {

                return json(
                    {
                        ok: false,
                        error:
                            "API Key inválida."
                    },
                    401,
                    request
                );

            }

            let body;

            try {

                body =
                    await request.json();

            } catch {

                return json(
                    {
                        ok: false,
                        error:
                            "JSON inválido."
                    },
                    400,
                    request
                );

            }

            if (
                typeof body.text !==
                    "string" ||
                !body.text.trim()
            ) {

                return json(
                    {
                        ok: false,
                        error:
                            "O campo 'text' é obrigatório."
                    },
                    400,
                    request
                );

            }

            const job = {

                id:
                    makeId(
                        "job"
                    ),

                status:
                    "queued",

                text:
                    body.text,

                speed:
                    Number(
                        body.speed
                    ) || 35,

                options: {

                    simulateErrors:
                        Boolean(
                            body.simulateErrors
                        ),

                    variation:
                        Boolean(
                            body.variation
                        )

                },

                progress: 0,

                done: 0,

                total:
                    body.text.length,

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now()

            };

            await env.JOBS.put(
                job.id,
                JSON.stringify(
                    job
                )
            );

            return json(
                {
                    ok: true,

                    job: {
                        id:
                            job.id,

                        status:
                            job.status
                    }
                },
                200,
                request
            );

        }

        /* =====================================================
           NEXT JOB
           GET /v1/jobs/next
        ===================================================== */

        if (
            request.method ===
                "GET" &&
            url.pathname ===
                "/v1/jobs/next"
        ) {

            if (
                !validKey(
                    request,
                    env
                )
            ) {

                return json(
                    {
                        ok: false,
                        error:
                            "API Key inválida."
                    },
                    401,
                    request
                );

            }

            const list =
                await env.JOBS.list();

            const candidates =
                [];

            for (
                const item
                of list.keys
            ) {

                const raw =
                    await env.JOBS.get(
                        item.name
                    );

                if (!raw)
                    continue;

                try {

                    const job =
                        JSON.parse(
                            raw
                        );

                    if (
                        job.status ===
                        "queued"
                    ) {

                        candidates.push(
                            job
                        );

                    }

                } catch {}

            }

            candidates.sort(
                (a, b) =>
                    a.createdAt -
                    b.createdAt
            );

            const job =
                candidates[0];

            if (!job) {

                return json(
                    {
                        ok: true,
                        job: null
                    },
                    200,
                    request
                );

            }

            job.status =
                "typing";

            job.updatedAt =
                Date.now();

            await env.JOBS.put(
                job.id,
                JSON.stringify(
                    job
                )
            );

            return json(
                {
                    ok: true,
                    job
                },
                200,
                request
            );

        }

        /* =====================================================
           JOB STATUS
           POST /v1/jobs/:id/status
        ===================================================== */

        const statusMatch =
            url.pathname.match(
                /^\\/v1\\/jobs\\/([^\\/]+)\\/status$/
            );

        if (
            request.method ===
                "POST" &&
            statusMatch
        ) {

            if (
                !validKey(
                    request,
                    env
                )
            ) {

                return json(
                    {
                        ok: false,
                        error:
                            "API Key inválida."
                    },
                    401,
                    request
                );

            }

            const id =
                statusMatch[1];

            const raw =
                await env.JOBS.get(
                    id
                );

            if (!raw) {

                return json(
                    {
                        ok: false,
                        error:
                            "Job não encontrado."
                    },
                    404,
                    request
                );

            }

            let job;

            try {

                job =
                    JSON.parse(
                        raw
                    );

            } catch {

                return json(
                    {
                        ok: false,
                        error:
                            "Job corrompido."
                    },
                    500,
                    request
                );

            }

            let body = {};

            try {

                body =
                    await request.json();

            } catch {}

            if (
                typeof body.status ===
                    "string"
            ) {

                job.status =
                    body.status;

            }

            if (
                typeof body.progress ===
                    "number"
            ) {

                job.progress =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            body.progress
                        )
                    );

            }

            if (
                typeof body.done ===
                    "number"
            ) {

                job.done =
                    body.done;

            }

            if (
                typeof body.total ===
                    "number"
            ) {

                job.total =
                    body.total;

            }

            job.updatedAt =
                Date.now();

            await env.JOBS.put(
                id,
                JSON.stringify(
                    job
                )
            );

            return json(
                {
                    ok: true,

                    job: {

                        id:
                            job.id,

                        status:
                            job.status,

                        progress:
                            job.progress ??
                            0

                    }
                },
                200,
                request
            );

        }

        /* =====================================================
           404
        ===================================================== */

        return json(
            {
                ok: false,
                error:
                    "Endpoint não encontrado."
            },
            404,
            request
        );

    }

};
