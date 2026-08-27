const VERSION = "1.3.1";

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

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

/* =========================================================
   API KEY
========================================================= */

function getKey(request) {
  const auth = request.headers.get("Authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice(7).trim();
}

function validKey(request, env) {
  const key = getKey(request);

  if (!key || !env.API_KEYS) {
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
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

/* =========================================================
   CLIENT
========================================================= */

const CLIENT_CODE = `

(() => {

const API = API_URL;
const KEY = API_KEY;

document.getElementById("xitos-mc")?.remove();
document.getElementById("xitos-mc-style")?.remove();

const themes = {

    plains: {
        name: "Planícies",
        icon: "🌾",
        sky: "#74b9e6",
        main: "#5f9d3b",
        dark: "#26351e",
        panel: "#30251b",
        border: "#d1a85b",
        accent: "#79c34b"
    },

    forest: {
        name: "Floresta",
        icon: "🌲",
        sky: "#39734a",
        main: "#3d7b36",
        dark: "#1d321e",
        panel: "#292018",
        border: "#9b743c",
        accent: "#5fb84d"
    },

    taiga: {
        name: "Taiga",
        icon: "🌲",
        sky: "#71959c",
        main: "#52775b",
        dark: "#202b2b",
        panel: "#252321",
        border: "#b28b58",
        accent: "#82b878"
    },

    desert: {
        name: "Deserto",
        icon: "🏜️",
        sky: "#e5b96c",
        main: "#b88939",
        dark: "#49351d",
        panel: "#392719",
        border: "#d6ae62",
        accent: "#e0b34d"
    },

    snow: {
        name: "Picos Nevados",
        icon: "❄️",
        sky: "#a8cce4",
        main: "#668fa9",
        dark: "#263847",
        panel: "#263039",
        border: "#bcd5e3",
        accent: "#8ed1ef"
    },

    nether: {
        name: "Nether",
        icon: "🔥",
        sky: "#711d1d",
        main: "#a52d20",
        dark: "#260d0d",
        panel: "#211111",
        border: "#bd6534",
        accent: "#ff6a2a"
    },

    end: {
        name: "The End",
        icon: "🟣",
        sky: "#342a50",
        main: "#69519c",
        dark: "#171322",
        panel: "#211b2d",
        border: "#9c7ad1",
        accent: "#bd82ed"
    }

};

const locations = {

    village: ["🏘️", "Vila"],
    cave: ["⛏️", "Caverna"],
    castle: ["🏰", "Castelo"],
    jungle: ["🌴", "Templo da Selva"],
    ocean: ["🌊", "Monumento Oceânico"],
    mine: ["🛤️", "Mina Abandonada"],
    fortress: ["🔥", "Fortaleza do Nether"],
    endcity: ["🏯", "Cidade do End"]

};

let settings = JSON.parse(
    localStorage.getItem("xitos-settings") ||
    "null"
) || {

    theme: "plains",
    location: "village",
    accent: "#79c34b",
    dark: true,
    particles: true

};

let running = false;
let minimized = false;
let dragging = false;

let dragX = 0;
let dragY = 0;

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
    --panel: #30251b;
    --border: #d1a85b;
    --accent: #79c34b;

    position: fixed;

    right: 22px;
    bottom: 22px;

    width: 360px;

    z-index: 2147483647;

    color: #fff;

    font-family:
        Arial,
        sans-serif;

    background:
        linear-gradient(
            180deg,
            var(--panel),
            #17120e
        );

    border:
        4px solid var(--border);

    border-radius: 8px;

    box-shadow:
        0 12px 0 #0006,
        0 20px 45px #0009,
        inset 0 0 0 2px #ffffff12;

    overflow: hidden;

    image-rendering: pixelated;

}

#xmc-header {

    height: 65px;

    padding: 0 14px;

    display: flex;

    align-items: center;

    gap: 10px;

    cursor: move;

    background:

        linear-gradient(
            180deg,
            var(--main),
            var(--dark)
        );

    border-bottom:
        3px solid #0005;

    position: relative;

}

#xmc-header:after {

    content: "";

    position: absolute;

    left: 0;
    right: 0;
    bottom: 0;

    height: 5px;

    background:
        repeating-linear-gradient(
            90deg,
            #0002 0 5px,
            transparent 5px 10px
        );

}

#xmc-logo {

    width: 42px;
    height: 42px;

    display: grid;

    place-items: center;

    font-size: 25px;

    background:
        #0004;

    border:
        2px solid #fff4;

    box-shadow:
        inset 0 0 0 2px #0003;

}

#xmc-title {

    font-family:
        'Press Start 2P',
        monospace;

    font-size: 13px;

    text-shadow:
        2px 2px #000;

}

#xmc-sub {

    margin-top: 6px;

    font-size: 11px;

    opacity: .8;

}

.xmc-head-btn {

    margin-left: auto;

    display: flex;

    gap: 5px;

}

.xmc-icon-btn {

    width: 30px;
    height: 30px;

    border: 2px solid #ffffff40;

    background:
        #0005;

    color: white;

    cursor: pointer;

    border-radius: 4px;

    font-size: 16px;

}

.xmc-icon-btn:hover {

    background:
        #fff2;

}

#xmc-body {

    padding: 14px;

}

.xmc-card {

    background:
        #0004;

    border:
        2px solid #ffffff12;

    border-radius: 6px;

    padding: 10px;

    margin-bottom: 10px;

}

.xmc-title {

    font-family:
        'Press Start 2P',
        monospace;

    font-size: 9px;

    color:
        var(--accent);

    margin-bottom: 8px;

}

.xmc-row {

    display: flex;

    gap: 7px;

    align-items: center;

}

.xmc-select,
.xmc-input {

    flex: 1;

    width: 100%;

    box-sizing: border-box;

    padding: 9px;

    color: white;

    background:
        #15110d;

    border:
        2px solid #6b5134;

    border-radius: 4px;

    outline: none;

}

.xmc-select:focus,
.xmc-input:focus {

    border-color:
        var(--accent);

}

.xmc-range {

    width: 100%;

    accent-color:
        var(--accent);

}

.xmc-btn {

    border: 0;

    padding: 10px 13px;

    border-radius: 4px;

    color: white;

    font-weight: bold;

    cursor: pointer;

    background:
        linear-gradient(
            #76b843,
            #477629
        );

    box-shadow:
        0 3px #263f19;

}

.xmc-btn:hover {

    filter:
        brightness(1.15);

}

.xmc-btn:active {

    transform:
        translateY(2px);

    box-shadow:
        none;

}

.xmc-stop {

    background:
        linear-gradient(
            #a94b3f,
            #702d27
        );

    box-shadow:
        0 3px #481c18;

}

#xmc-status {

    padding: 9px;

    font-size: 11px;

    background:
        #0006;

    border:
        2px solid #ffffff0c;

    border-radius: 4px;

}

#xmc-progress {

    height: 13px;

    margin-top: 8px;

    background:
        #101010;

    border:
        2px solid #080808;

    overflow: hidden;

}

#xmc-bar {

    height: 100%;

    width: 0%;

    background:
        linear-gradient(
            90deg,
            #62a832,
            #9bdb55
        );

    box-shadow:
        inset 0 2px #ffffff30;

    transition:
        width .1s linear;

}

#xmc-percent {

    text-align: right;

    font-size: 9px;

    margin-top: 3px;

    opacity: .6;

}

#xmc-footer {

    text-align: center;

    padding-top: 5px;

    font-size: 16px;

    letter-spacing: 5px;

}

#xmc-particles {

    position: absolute;

    inset: 0;

    pointer-events: none;

    overflow: hidden;

}

.xmc-particle {

    position: absolute;

    animation:
        xmc-float 4s linear infinite;

    opacity: .35;

}

@keyframes xmc-float {

    from {

        transform:
            translateY(70px);

        opacity: 0;

    }

    30% {

        opacity: .4;

    }

    to {

        transform:
            translateY(-30px);

        opacity: 0;

    }

}

#xmc-minimized {

    position: fixed;

    right: 22px;
    bottom: 22px;

    width: 60px;
    height: 60px;

    z-index: 2147483647;

    display: none;

    place-items: center;

    font-size: 28px;

    cursor: pointer;

    background:
        var(--main);

    border:
        4px solid var(--border);

    border-radius: 6px;

    box-shadow:
        0 8px 20px #0008;

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

<div id="xmc-particles"></div>

<div id="xmc-header">

    <div id="xmc-logo">
        ⛏️
    </div>

    <div>

        <div id="xmc-title">
            XITOS
        </div>

        <div id="xmc-sub">
            Survival Edition
        </div>

    </div>

    <div class="xmc-head-btn">

        <button
            class="xmc-icon-btn"
            id="xmc-min"
        >
            −
        </button>

        <button
            class="xmc-icon-btn"
            id="xmc-close"
        >
            ×
        </button>

    </div>

</div>

<div id="xmc-body">

    <div class="xmc-card">

        <div class="xmc-title">
            🌍 MUNDO
        </div>

        <div class="xmc-row">

            <select
                id="xmc-theme"
                class="xmc-select"
            ></select>

            <select
                id="xmc-location"
                class="xmc-select"
            ></select>

        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-title">
            ⚡ VELOCIDADE
        </div>

        <input
            id="xmc-speed"
            class="xmc-range"
            type="range"
            min="5"
            max="500"
            value="35"
        >

        <div
            id="xmc-speed-label"
            style="
            text-align:center;
            margin-top:5px;
            font-size:11px
            "
        >
            35 ms
        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-title">
            🎨 PERSONALIZAÇÃO
        </div>

        <div class="xmc-row">

            <input
                id="xmc-color"
                class="xmc-input"
                type="color"
                value="#79c34b"
                style="height:38px"
            >

            <button
                class="xmc-btn"
                id="xmc-particles-btn"
            >
                ✨ Partículas
            </button>

        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-title">
            📜 OPERAÇÃO
        </div>

        <div class="xmc-row">

            <button
                class="xmc-btn"
                id="xmc-start"
            >
                ▶ INICIAR
            </button>

            <button
                class="xmc-btn xmc-stop"
                id="xmc-stop"
            >
                ■ PARAR
            </button>

        </div>

    </div>

    <div id="xmc-status">
        🟢 Mundo carregado.
    </div>

    <div id="xmc-progress">

        <div id="xmc-bar"></div>

    </div>

    <div id="xmc-percent">
        0%
    </div>

    <div id="xmc-footer">
        🐷 🌳 🐔 🧱
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

const themeSelect =
panel.querySelector(
    "#xmc-theme"
);

const locationSelect =
panel.querySelector(
    "#xmc-location"
);

const speedInput =
panel.querySelector(
    "#xmc-speed"
);

const speedLabel =
panel.querySelector(
    "#xmc-speed-label"
);

const colorInput =
panel.querySelector(
    "#xmc-color"
);

const status =
panel.querySelector(
    "#xmc-status"
);

const bar =
panel.querySelector(
    "#xmc-bar"
);

const percent =
panel.querySelector(
    "#xmc-percent"
);

const particles =
panel.querySelector(
    "#xmc-particles"
);

/* =========================================================
   THEMES
========================================================= */

Object.entries(themes)
.forEach(
([id, theme]) => {

    const option =
        document.createElement(
            "option"
        );

    option.value = id;

    option.textContent =
        theme.icon +
        " " +
        theme.name;

    themeSelect.appendChild(
        option
    );

}
);

/* =========================================================
   LOCATIONS
========================================================= */

Object.entries(locations)
.forEach(
([id, value]) => {

    const option =
        document.createElement(
            "option"
        );

    option.value = id;

    option.textContent =
        value[0] +
        " " +
        value[1];

    locationSelect.appendChild(
        option
    );

}
);

/* =========================================================
   SAVE
========================================================= */

function save() {

    localStorage.setItem(
        "xitos-settings",
        JSON.stringify(
            settings
        )
    );

}

/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme() {

    const theme =
        themes[
            settings.theme
        ];

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
        settings.accent ||
        theme.accent
    );

    themeSelect.value =
        settings.theme;

    locationSelect.value =
        settings.location;

    colorInput.value =
        settings.accent ||
        theme.accent;

    speedInput.value =
        settings.speed ||
        35;

    speedLabel.textContent =
        speedInput.value +
        " ms";

    particles.style.display =
        settings.particles ?
        "block" :
        "none";

}

/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {

    particles.innerHTML = "";

    if (!settings.particles)
        return;

    const chars = [
        "✦",
        "•",
        "🍃",
        "✨"
    ];

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const p =
            document.createElement(
                "span"
            );

        p.className =
            "xmc-particle";

        p.textContent =
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

        p.style.left =
            Math.random() * 100 +
            "%";

        p.style.top =
            Math.random() * 100 +
            "%";

        p.style.animationDelay =
            Math.random() * 4 +
            "s";

        particles.appendChild(
            p
        );

    }

}

/* =========================================================
   SETTINGS EVENTS
========================================================= */

themeSelect.onchange = () => {

    settings.theme =
        themeSelect.value;

    settings.accent =
        themes[
            settings.theme
        ].accent;

    applyTheme();
    createParticles();
    save();

    status.textContent =
        "🌍 Bioma alterado para " +
        themes[
            settings.theme
        ].name +
        ".";

};

locationSelect.onchange = () => {

    settings.location =
        locationSelect.value;

    save();

    const loc =
        locations[
            settings.location
        ];

    status.textContent =
        loc[0] +
        " Localização: " +
        loc[1];

};

speedInput.oninput = () => {

    settings.speed =
        Number(
            speedInput.value
        );

    speedLabel.textContent =
        speedInput.value +
        " ms";

    save();

};

colorInput.oninput = () => {

    settings.accent =
        colorInput.value;

    panel.style.setProperty(
        "--accent",
        settings.accent
    );

    save();

};

panel
.querySelector(
    "#xmc-particles-btn"
)
.onclick = () => {

    settings.particles =
        !settings.particles;

    createParticles();
    save();

};

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
                bubbles: true,
                inputType:
                    "insertText",
                data: char
            }
        )
    );

    el.dispatchEvent(
        new Event(
            "change",
            {
                bubbles: true
            }
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
                        "Bearer " +
                        KEY,

                    ...(options.headers ||
                        {})
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
   RUN
========================================================= */

async function run(job) {

    const el =
        target();

    if (!el) {

        throw new Error(
            "Clique em um campo de texto primeiro."
        );

    }

    el.focus();

    const text =
        String(
            job.text || ""
        );

    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        if (!running) {

            throw new Error(
                "STOP"
            );

        }

        let delay =
            Number(
                speedInput.value
            ) || 35;

        if (
            job.options?.variation
        ) {

            delay +=
                Math.random() *
                20 -
                10;

        }

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    Math.max(
                        5,
                        delay
                    )
                )
        );

        insert(
            el,
            text[i]
        );

        const p =
            Math.round(
                (
                    (i + 1) /
                    text.length
                ) * 100
            );

        bar.style.width =
            p + "%";

        percent.textContent =
            p + "%";

        if (
            (i + 1) % 10 === 0 ||
            i + 1 === text.length
        ) {

            await api(
                "/v1/jobs/" +
                encodeURIComponent(
                    job.id
                ) +
                "/status",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status:
                                "typing",

                            progress:
                                p,

                            done:
                                i + 1,

                            total:
                                text.length
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

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            3000
                        )
                );

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
                    method: "POST",

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

panel
.querySelector(
    "#xmc-start"
)
.onclick = () => {

    if (running)
        return;

    running = true;

    status.textContent =
        "🌱 Xitos iniciado!";

    loop();

};

panel
.querySelector(
    "#xmc-stop"
)
.onclick = () => {

    running = false;

    status.textContent =
        "⏹️ Parando...";

};

/* =========================================================
   MINIMIZE
========================================================= */

panel
.querySelector(
    "#xmc-min"
)
.onclick = () => {

    minimized.style.display =
        "grid";

    panel.style.display =
        "none";

    minimized.style.setProperty(
        "--main",
        themes[
            settings.theme
        ].main
    );

    minimized.style.setProperty(
        "--border",
        themes[
            settings.theme
        ].border
    );

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

panel
.querySelector(
    "#xmc-close"
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
    panel.querySelector(
        "#xmc-header"
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
            e.key.toLowerCase() === "x"
        ) {

            e.preventDefault();

            if (panel.style.display ===
                "none") {

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

applyTheme();
createParticles();

console.log(
    "%c⛏️ XITOS MINECRAFT EDITION",
    "color:#79c34b;" +
    "font-size:20px;" +
    "font-weight:bold;"
);

console.log(
    "%c🌳 Bioma: " +
    themes[settings.theme].name,
    "color:#9bdb55;"
);

console.log(
    "%c🏘️ Local: " +
    locations[settings.location][1],
    "color:#d1a85b;"
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
            request.method === "OPTIONS"
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
            new URL(request.url);

        /* =====================================================
           HOME
        ===================================================== */

        if (
            request.method === "GET" &&
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
        ===================================================== */

        if (
            request.method === "GET" &&
            url.pathname === "/v1/client"
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

            return json(
                {
                    ok: true,
                    version: VERSION,
                    code: CLIENT_CODE
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
            request.method === "POST" &&
            url.pathname === "/v1/type"
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
                    makeId("job"),

                status:
                    "queued",

                text:
                    body.text,

                speed:
                    Number(body.speed) ||
                    35,

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
                JSON.stringify(job)
            );

            return json(
                {
                    ok: true,

                    job: {
                        id: job.id,
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
            request.method === "GET" &&
            url.pathname === "/v1/jobs/next"
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

            const candidates = [];

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
                        JSON.parse(raw);

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
                JSON.stringify(job)
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
                /^\/v1\/jobs\/([^\/]+)\/status$/
            );

        if (
            request.method === "POST" &&
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
                await env.JOBS.get(id);

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
                    JSON.parse(raw);

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
                JSON.stringify(job)
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
