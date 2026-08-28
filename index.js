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
   JSON
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
   CLIENT
========================================================= */

/*
   COLE AQUI O SEU CLIENT_CODE ORIGINAL.

   Ele deve continuar contendo:

   const API = API_URL;
   const KEY = API_KEY;

*/

const CLIENT_CODE = `

(() => {

const API = API_URL;
const KEY = API_KEY;

console.log("[Xitos] Client iniciado.");

document.getElementById("xitos-mc")?.remove();
document.getElementById("xitos-mc-style")?.remove();

const style = document.createElement("style");

style.id = "xitos-mc-style";

style.textContent = \`
#xitos-mc {
    position: fixed;
    right: 22px;
    bottom: 22px;
    width: 360px;
    z-index: 2147483647;
    color: white;
    font-family: Arial, sans-serif;
    background: linear-gradient(180deg,#30251b,#17120e);
    border: 4px solid #d1a85b;
    border-radius: 8px;
    box-shadow:
        0 12px 0 #0006,
        0 20px 45px #0009;
    overflow: hidden;
}

#xmc-header {
    height: 65px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: move;
    background: linear-gradient(180deg,#5f9d3b,#26351e);
}

#xmc-logo {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    font-size: 25px;
    background: #0004;
}

#xmc-title {
    font-weight: bold;
    font-size: 16px;
}

#xmc-sub {
    margin-top: 5px;
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
    background: #0005;
    color: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 16px;
}

#xmc-body {
    padding: 14px;
}

.xmc-card {
    background: #0004;
    border: 2px solid #ffffff12;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
}

.xmc-title {
    font-weight: bold;
    font-size: 10px;
    color: #79c34b;
    margin-bottom: 8px;
}

.xmc-row {
    display: flex;
    gap: 7px;
    align-items: center;
}

.xmc-input,
.xmc-select {
    flex: 1;
    box-sizing: border-box;
    padding: 9px;
    color: white;
    background: #15110d;
    border: 2px solid #6b5134;
    border-radius: 4px;
}

.xmc-range {
    width: 100%;
}

.xmc-btn {
    border: 0;
    padding: 10px 13px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    background: linear-gradient(#76b843,#477629);
}

.xmc-stop {
    background: linear-gradient(#a94b3f,#702d27);
}

#xmc-status {
    padding: 9px;
    font-size: 11px;
    background: #0006;
    border-radius: 4px;
}

#xmc-progress {
    height: 13px;
    margin-top: 8px;
    background: #101010;
    border: 2px solid #080808;
    overflow: hidden;
}

#xmc-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg,#62a832,#9bdb55);
    transition: width .1s linear;
}

#xmc-percent {
    text-align: right;
    font-size: 9px;
    margin-top: 3px;
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
    background: #5f9d3b;
    border: 4px solid #d1a85b;
    border-radius: 6px;
}
\`;

document.head.appendChild(style);

/* =========================================================
   PANEL
========================================================= */

const panel =
    document.createElement("div");

panel.id = "xitos-mc";

panel.innerHTML = \`

<div id="xmc-header">

    <div id="xmc-logo">⛏️</div>

    <div>
        <div id="xmc-title">XITOS</div>
        <div id="xmc-sub">
            Survival Edition
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

<div id="xmc-body">

    <div class="xmc-card">

        <div class="xmc-title">
            🌍 MUNDO
        </div>

        <div class="xmc-row">

            <select
                id="xmc-theme"
                class="xmc-select">

                <option value="plains">
                    🌾 Planícies
                </option>

                <option value="forest">
                    🌲 Floresta
                </option>

                <option value="taiga">
                    🌲 Taiga
                </option>

                <option value="desert">
                    🏜️ Deserto
                </option>

                <option value="snow">
                    ❄️ Picos Nevados
                </option>

                <option value="nether">
                    🔥 Nether
                </option>

                <option value="end">
                    🟣 The End
                </option>

            </select>

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
            value="35">

        <div
            id="xmc-speed-label"
            style="text-align:center">
            35 ms
        </div>

    </div>

    <div class="xmc-card">

        <div class="xmc-title">
            📜 OPERAÇÃO
        </div>

        <div class="xmc-row">

            <button
                class="xmc-btn"
                id="xmc-start">
                ▶ INICIAR
            </button>

            <button
                class="xmc-btn xmc-stop"
                id="xmc-stop">
                ■ PARAR
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

const speedInput =
    panel.querySelector("#xmc-speed");

const speedLabel =
    panel.querySelector("#xmc-speed-label");

const status =
    panel.querySelector("#xmc-status");

const bar =
    panel.querySelector("#xmc-bar");

const percent =
    panel.querySelector("#xmc-percent");

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
   TARGET
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
        "textarea,input:not([type=hidden]),[contenteditable=true]"
    );

}

/* =========================================================
   INSERT
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
                inputType: "insertText",
                data: char
            }
        )
    );

}

/* =========================================================
   RUN
========================================================= */

let running = false;

async function run(job) {

    const el = target();

    if (!el) {

        throw new Error(
            "Clique em um campo de texto primeiro."
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

        if (!running)
            throw new Error("STOP");

        const delay =
            Number(speedInput.value) || 35;

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    Math.max(5, delay)
                )
        );

        insert(
            el,
            text[i]
        );

        const p =
            Math.round(
                ((i + 1) / text.length) * 100
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
                encodeURIComponent(job.id) +
                "/status",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: "typing",
                        progress: p,
                        done: i + 1,
                        total: text.length
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

            bar.style.width = "0%";
            percent.textContent = "0%";

            status.textContent =
                "✏️ Digitando...";

            await run(data.job);

            await api(
                "/v1/jobs/" +
                encodeURIComponent(data.job.id) +
                "/status",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: "completed",
                        progress: 100,
                        done:
                            String(
                                data.job.text || ""
                            ).length
                    })
                }
            );

            status.textContent =
                "🌟 Job concluído!";

        } catch (error) {

            if (
                error.message === "STOP"
            ) {

                status.textContent =
                    "⏹️ Operação parada.";

            } else {

                console.error(
                    "[Xitos]",
                    error
                );

                status.textContent =
                    "❌ " + error.message;

            }

            running = false;

        }

    }

}

/* =========================================================
   BUTTONS
========================================================= */

panel
    .querySelector("#xmc-start")
    .onclick = () => {

        if (running)
            return;

        running = true;

        status.textContent =
            "🌱 Xitos iniciado!";

        loop();

    };

panel
    .querySelector("#xmc-stop")
    .onclick = () => {

        running = false;

        status.textContent =
            "⏹️ Parando...";

    };

/* =========================================================
   MINIMIZE
========================================================= */

panel
    .querySelector("#xmc-min")
    .onclick = () => {

        panel.style.display = "none";
        minimized.style.display = "grid";

    };

minimized.onclick = () => {

    minimized.style.display = "none";
    panel.style.display = "block";

};

/* =========================================================
   CLOSE
========================================================= */

panel
    .querySelector("#xmc-close")
    .onclick = () => {

        running = false;

        panel.remove();
        minimized.remove();
        style.remove();

    };

/* =========================================================
   SPEED
========================================================= */

speedInput.oninput = () => {

    speedLabel.textContent =
        speedInput.value + " ms";

};

/* =========================================================
   DRAG
========================================================= */

const header =
    panel.querySelector("#xmc-header");

let dragging = false;
let dragX = 0;
let dragY = 0;

header.addEventListener(
    "mousedown",
    e => {

        if (
            e.target.closest("button")
        )
            return;

        dragging = true;

        const rect =
            panel.getBoundingClientRect();

        dragX =
            e.clientX - rect.left;

        dragY =
            e.clientY - rect.top;

        panel.style.left =
            rect.left + "px";

        panel.style.top =
            rect.top + "px";

        panel.style.right = "auto";
        panel.style.bottom = "auto";

    }
);

document.addEventListener(
    "mousemove",
    e => {

        if (!dragging)
            return;

        panel.style.left =
            e.clientX - dragX + "px";

        panel.style.top =
            e.clientY - dragY + "px";

    }
);

document.addEventListener(
    "mouseup",
    () => {
        dragging = false;
    }
);

console.log(
    "%c⛏️ XITOS CLIENT CONECTADO",
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
           OPTIONS
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

            /* ================================
               VERIFICA KEY
            ================================= */

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

            /* ================================
               CONFIGURA CLIENT
            ================================= */

            const apiUrl =
                url.origin;

            const apiKey =
                getKey(request);

            /*
             * Substitui os placeholders:
             *
             * API_URL
             * API_KEY
             */

            const code =
                CLIENT_CODE
                    .replace(
                        /API_URL/g,
                        JSON.stringify(apiUrl)
                    )
                    .replace(
                        /API_KEY/g,
                        JSON.stringify(apiKey)
                    );

            return json(
                {
                    ok: true,
                    version: VERSION,
                    code
                },
                200,
                request
            );

        }

        /* =====================================================
           CREATE JOB
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
                typeof body.text !== "string" ||
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
                    Number(body.speed) || 35,

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
                const item of list.keys
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
                        job.status === "queued"
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
                typeof body.status === "string"
            ) {

                job.status =
                    body.status;

            }

            if (
                typeof body.progress === "number"
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
                typeof body.done === "number"
            ) {

                job.done =
                    body.done;

            }

            if (
                typeof body.total === "number"
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
                            job.progress ?? 0
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
