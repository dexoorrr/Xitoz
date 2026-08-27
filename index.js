const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, request-id, x-request-id"
  };
}


async function auth(request, env) {
  const header = request.headers.get("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return false;
  }

  const key = header.slice(7).trim();

  const configured = env.API_KEYS || "";

  const keys = configured
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  return keys.includes(key);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    // =====================================================
    // HOME
    // =====================================================

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        name: "Xitos API",
        version: "1.1.0",
        status: "online"
      });
    }

    // =====================================================
    // CRIAR JOB
    // =====================================================

    if (
      request.method === "POST" &&
      url.pathname === "/v1/type"
    ) {
      if (!(await auth(request, env))) {
        return json({
          ok: false,
          error: "API Key inválida."
        }, 401);
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json({
          ok: false,
          error: "JSON inválido."
        }, 400);
      }

      if (
        typeof body.text !== "string" ||
        !body.text.trim()
      ) {
        return json({
          ok: false,
          error: "O campo text é obrigatório."
        }, 400);
      }

      if (body.text.length > 20000) {
        return json({
          ok: false,
          error: "Limite de 20.000 caracteres."
        }, 400);
      }

      const jobId =
        "job_" +
        crypto.randomUUID().replaceAll("-", "");

      const job = {
        id: jobId,
        status: "queued",

        text: body.text,

        options: {
          speed: Math.max(
            5,
            Math.min(
              1000,
              Number(body.speed) || 35
            )
          ),

          simulateErrors:
            body.simulateErrors === true,

          variation:
            body.variation !== false
        },

        progress: 0,

        characters: {
          done: 0,
          total: body.text.length
        },

        createdAt: new Date().toISOString()
      };

      await env.JOBS.put(
        `job:${jobId}`,
        JSON.stringify(job),
        {
          expirationTtl: 3600
        }
      );

      // fila simples
      await env.JOBS.put(
        `queue:${jobId}`,
        "1",
        {
          expirationTtl: 3600
        }
      );

      return json({
        ok: true,
        job: {
          id: jobId,
          status: "queued"
        }
      });
    }

    // =====================================================
    // PEGAR PRÓXIMO JOB
    // =====================================================

    if (
      request.method === "GET" &&
      url.pathname === "/v1/jobs/next"
    ) {
      if (!(await auth(request, env))) {
        return json({
          ok: false,
          error: "API Key inválida."
        }, 401);
      }

      const list =
        await env.JOBS.list({
          prefix: "queue:"
        });

      if (!list.keys.length) {
        return json({
          ok: true,
          job: null
        });
      }

      const key =
        list.keys[0].name;

      const jobId =
        key.replace("queue:", "");

      const raw =
        await env.JOBS.get(
          `job:${jobId}`
        );

      if (!raw) {
        await env.JOBS.delete(key);

        return json({
          ok: true,
          job: null
        });
      }

      const job = JSON.parse(raw);

      job.status = "claimed";

      await env.JOBS.put(
        `job:${jobId}`,
        JSON.stringify(job),
        {
          expirationTtl: 3600
        }
      );

      await env.JOBS.delete(key);

      return json({
        ok: true,
        job
      });
    }

    // =====================================================
    // ATUALIZAR JOB
    // =====================================================

    if (
      request.method === "POST" &&
      url.pathname.match(
        /^\/v1\/jobs\/[^/]+\/status$/
      )
    ) {
      if (!(await auth(request, env))) {
        return json({
          ok: false,
          error: "API Key inválida."
        }, 401);
      }

      const jobId =
        url.pathname.split("/")[3];

      const raw =
        await env.JOBS.get(
          `job:${jobId}`
        );

      if (!raw) {
        return json({
          ok: false,
          error: "Job não encontrado."
        }, 404);
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json({
          ok: false,
          error: "JSON inválido."
        }, 400);
      }

      const job = JSON.parse(raw);

      const allowed = [
        "claimed",
        "typing",
        "completed",
        "cancelled",
        "error"
      ];

      if (
        typeof body.status === "string" &&
        allowed.includes(body.status)
      ) {
        job.status = body.status;
      }

      if (
        Number.isFinite(body.progress)
      ) {
        job.progress =
          Math.max(
            0,
            Math.min(100, body.progress)
          );
      }

      if (
        Number.isFinite(body.done)
      ) {
        job.characters.done =
          Math.max(0, body.done);
      }

      await env.JOBS.put(
        `job:${jobId}`,
        JSON.stringify(job),
        {
          expirationTtl: 3600
        }
      );

      return json({
        ok: true,
        job
      });
    }

    // =====================================================
    // CONSULTAR JOB
    // =====================================================

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/v1/jobs/")
    ) {
      if (!(await auth(request, env))) {
        return json({
          ok: false,
          error: "API Key inválida."
        }, 401);
      }

      const jobId =
        url.pathname.split("/").pop();

      const raw =
        await env.JOBS.get(
          `job:${jobId}`
        );

      if (!raw) {
        return json({
          ok: false,
          error: "Job não encontrado."
        }, 404);
      }

      return json({
        ok: true,
        job: JSON.parse(raw)
      });
    }

    return json({
      ok: false,
      error: "Endpoint não encontrado."
    }, 404);
  }
};
