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

(async () => {

const API = API_URL;
const KEY = API_KEY;

document.getElementById("xitos-valley")?.remove();
document.getElementById("xitos-style")?.remove();

/* =========================================================
   STYLE
========================================================= */

const style = document.createElement("style");

style.id = "xitos-style";

style.textContent = \`

#xitos-valley {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 340px;
    z-index: 2147483647;

    font-family:
        Arial,
        sans-serif;

    color: #fff3cf;

    background:
        linear-gradient(
            145deg,
            #59402a,
            #2b1d14
        );

    border:
        3px solid #c79a55;

    border-radius:
        18px;

    box-shadow:
        0 15px 45px rgba(0,0,0,.55),
        inset 0 0 0 1px rgba(255,255,255,.08);

    overflow: hidden;

    user-select: none;
}

#xv-head {
    padding: 13px 15px;

    font-size: 18px;
    font-weight: bold;

    background:
        linear-gradient(
            #78a94f,
            #466f30
        );

    cursor: move;
}

#xv-sub {
    font-size: 11px;
    opacity: .75;
    margin-top: 3px;
}

#xv-close {
    float: right;
    cursor: pointer;
    opacity: .75;
    font-size: 20px;
}

#xv-body {
    padding: 14px;
}

.xv-label {
    display: block;
    margin-bottom: 5px;

    font-size: 12px;
    opacity: .85;
}

.xv-input {
    width: 100%;
    box-sizing: border-box;

    padding: 9px;
    margin-bottom: 10px;

    background: #211711;
    color: #fff0c5;

    border:
        2px solid #87643a;

    border-radius: 8px;
    outline: none;
}

.xv-input:focus {
    border-color: #b9d76d;
}

.xv-btn {
    padding: 9px 12px;
    margin: 3px 2px;

    border: 0;
    border-radius: 8px;

    background:
        linear-gradient(
            #78a84d,
            #547d34
        );

    color: white;
    font-weight: bold;

    cursor: pointer;

    box-shadow:
        0 3px #354e25;
}

.xv-btn:hover {
    filter: brightness(1.12);
}

.xv-btn:active {
    transform: translateY(2px);
    box-shadow: none;
}

.xv-danger {
    background:
        linear-gradient(
            #a75b51,
            #753c36
        );

    box-shadow:
        0 3px #4e2925;
}

#xv-status {
    margin-top: 10px;

    padding: 9px;

    background: #17100c;

    border-radius: 8px;

    font-size: 12px;

    border:
        1px solid #473323;
}

#xv-progress {
    height: 9px;

    margin-top: 9px;

    background: #17100c;

    border-radius: 10px;

    overflow: hidden;

    border:
        1px solid #473323;
}

#xv-bar {
    height: 100%;
    width: 0%;

    background:
        linear-gradient(
            90deg,
            #76b34b,
            #d8c45d
        );

    transition:
        width .1s linear;
}

#xv-icons {
    text-align: center;

    margin-top: 11px;

    font-size: 17px;

    letter-spacing: 3px;
}

#xv-version {
    text-align: right;

    font-size: 9px;

    opacity: .4;

    margin-top: 7px;
}

\`;

document.head.appendChild(style);

/* =========================================================
   PANEL
========================================================= */

const panel =
    document.createElement("div");

panel.id =
    "xitos-valley";

panel.innerHTML = \`

<div id="xv-head">

    <span id="xv-close">
        ×
    </span>

    🌾 Xitos Valley

    <div id="xv-sub">
        Connector online
    </div>

</div>

<div id="xv-body">

    <label class="xv-label">
        ⚡ Velocidade (ms)
    </label>

    <input
        id="xv-speed"
        class="xv-input"
        type="number"
        value="35"
        min="5"
        max="2000"
    >

    <label class="xv-label">
        🎲 Variação
    </label>

    <select
        id="xv-variation"
        class="xv-input"
    >

        <option value="false">
            Normal
        </option>

        <option value="true" selected>
            Natural
        </option>

    </select>

    <button
        class="xv-btn"
        id="xv-start"
    >
        ▶ INICIAR
    </button>

    <button
        class="xv-btn xv-danger"
        id="xv-stop"
    >
        ■ PARAR
    </button>

    <div id="xv-status">
        🟢 Pronto
    </div>

    <div id="xv-progress">

        <div id="xv-bar"></div>

    </div>

    <div id="xv-icons">
        🐱 🌱 🪨 🐔
    </div>

    <div id="xv-version">
        Xitos Connector
    </div>

</div>

\`;

document.body.appendChild(panel);

/* =========================================================
   ELEMENTS
========================================================= */

const speed =
    panel.querySelector("#xv-speed");

const variation =
    panel.querySelector("#xv-variation");

const status =
    panel.querySelector("#xv-status");

const bar =
    panel.querySelector("#xv-bar");

const close =
    panel.querySelector("#xv-close");

let running = false;

/* =========================================================
   CLOSE
========================================================= */

close.onclick = () => {

    running = false;

    panel.remove();
    style.remove();

};

/* =========================================================
   API
========================================================= */

async function api(path, options = {}) {

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
            "Resposta inválida da API."
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
   FIND TARGET
========================================================= */

function target() {

    const active =
        document.activeElement;

    if (
        active &&
        (
            active.tagName === "TEXTAREA" ||

            (
                active.tagName === "INPUT" &&
                active.type !== "hidden"
            ) ||

            active.isContentEditable
        )
    ) {

        return active;

    }

    return document.querySelector(
        [
            "textarea",
            "input:not([type=hidden])",
            "[contenteditable=true]"
        ].join(",")
    );

}

/* =========================================================
   INSERT CHARACTER
========================================================= */

function insert(el, char) {

    if (el.isContentEditable) {

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
   RUN JOB
========================================================= */

async function run(job) {

    const el =
        target();

    if (!el) {

        throw new Error(
            "Nenhum campo editável encontrado."
        );

    }

    el.focus();

    const text =
        String(job.text || "");

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
            Number(speed.value) || 35;

        if (
            variation.value === "true"
        ) {

            delay +=
                Math.random() * 20 - 10;

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

        const progress =
            Math.round(
                ((i + 1) /
                    text.length) *
                100
            );

        bar.style.width =
            progress + "%";

        if (
            (i + 1) % 10 === 0 ||
            i + 1 === text.length
        ) {

            await api(
                "/v1/jobs/" +
                encodeURIComponent(job.id) +
                "/status",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status: "typing",
                            progress,
                            done: i + 1,
                            total: text.length
                        })
                }
            );

        }

    }

}

/* =========================================================
   JOB LOOP
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
                    "🌙 Fila vazia";

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

                            progress: 100,

                            done:
                                String(
                                    data.job.text ||
                                    ""
                                ).length
                        })
                }
            );

            status.textContent =
                "🌟 Concluído!";

        } catch (error) {

            if (
                error.message === "STOP"
            ) {

                status.textContent =
                    "⏹️ Parado";

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
    .querySelector("#xv-start")
    .onclick = () => {

        if (running)
            return;

        running = true;

        status.textContent =
            "🌱 Xitos iniciado!";

        loop();

    };

panel
    .querySelector("#xv-stop")
    .onclick = () => {

        running = false;

        status.textContent =
            "⏹️ Parando...";

    };

/* =========================================================
   DRAG
========================================================= */

const head =
    panel.querySelector("#xv-head");

let dragging = false;
let offsetX = 0;
let offsetY = 0;

head.addEventListener(
    "mousedown",
    event => {

        if (
            event.target === close
        ) {
            return;
        }

        dragging = true;

        const rect =
            panel.getBoundingClientRect();

        offsetX =
            event.clientX -
            rect.left;

        offsetY =
            event.clientY -
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
    event => {

        if (!dragging)
            return;

        panel.style.left =
            (
                event.clientX -
                offsetX
            ) + "px";

        panel.style.top =
            (
                event.clientY -
                offsetY
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
   EASTER EGGS
========================================================= */

console.log(
    "%c🌾 XITOS VALLEY ONLINE",
    "color:#8bc34a;font-size:20px;font-weight:bold"
);

console.log(
    "%c🐔 A galinha não deveria estar programando isso.",
    "color:#d8c45d;font-size:12px"
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
