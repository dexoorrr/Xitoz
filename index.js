export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        name: "Xitos API",
        version: "1.0.0",
        status: "online"
      });
    }

    // =========================================================
    // POST /v1/type
    // =========================================================

    if (
      request.method === "POST" &&
      url.pathname === "/v1/type"
    ) {
      const auth = await authenticate(request, env);

      if (!auth.ok) {
        return json(
          {
            ok: false,
            error: auth.error
          },
          401
        );
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json(
          {
            ok: false,
            error: "JSON inválido."
          },
          400
        );
      }

      // -------------------------------------------------------
      // Validação
      // -------------------------------------------------------

      if (
        typeof body.text !== "string" ||
        body.text.length === 0
      ) {
        return json(
          {
            ok: false,
            error: "O campo 'text' é obrigatório."
          },
          400
        );
      }

      // Limite inicial
      if (body.text.length > 20000) {
        return json(
          {
            ok: false,
            error: "Texto muito grande. Limite: 20.000 caracteres."
          },
          400
        );
      }

      const speed =
        Number.isFinite(body.speed)
          ? Math.max(5, Math.min(1000, body.speed))
          : 35;

      const simulateErrors =
        body.simulateErrors === true;

      const variation =
        body.variation !== false;

      // -------------------------------------------------------
      // Criar Job
      // -------------------------------------------------------

      const jobId =
        "job_" +
        crypto.randomUUID()
          .replaceAll("-", "")
          .slice(0, 16);

      const job = {
        id: jobId,

        status: "queued",

        text: body.text,

        options: {
          speed,
          simulateErrors,
          variation
        },

        progress: 0,

        characters: {
          done: 0,
          total: body.text.length
        },

        createdAt:
          new Date().toISOString()
      };

      // KV
      //
      // Configure:
      // JOBS = seu namespace KV
      //
      if (env.JOBS) {
        await env.JOBS.put(
          `job:${jobId}`,
          JSON.stringify(job),
          {
            expirationTtl: 60 * 60
          }
        );
      }

      return json({
        ok: true,

        job: {
          id: jobId,
          status: "queued"
        }
      });
    }

    // =========================================================
    // GET /v1/jobs/:id
    // =========================================================

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/v1/jobs/")
    ) {
      const auth = await authenticate(request, env);

      if (!auth.ok) {
        return json(
          {
            ok: false,
            error: auth.error
          },
          401
        );
      }

      const jobId =
        url.pathname.split("/").pop();

      if (!env.JOBS) {
        return json({
          ok: false,
          error: "KV não configurado."
        }, 500);
      }

      const raw =
        await env.JOBS.get(`job:${jobId}`);

      if (!raw) {
        return json(
          {
            ok: false,
            error: "Job não encontrado."
          },
          404
        );
      }

      const job = JSON.parse(raw);

      return json({
        ok: true,
        job
      });
    }

    // =========================================================
    // POST /v1/jobs/:id/cancel
    // =========================================================

    if (
      request.method === "POST" &&
      url.pathname.startsWith("/v1/jobs/") &&
      url.pathname.endsWith("/cancel")
    ) {
      const auth = await authenticate(request, env);

      if (!auth.ok) {
        return json(
          {
            ok: false,
            error: auth.error
          },
          401
        );
      }

      const parts =
        url.pathname.split("/");

      const jobId =
        parts[3];

      const raw =
        await env.JOBS?.get(`job:${jobId}`);

      if (!raw) {
        return json(
          {
            ok: false,
            error: "Job não encontrado."
          },
          404
        );
      }

      const job = JSON.parse(raw);

      job.status = "cancelled";

      await env.JOBS.put(
        `job:${jobId}`,
        JSON.stringify(job),
        {
          expirationTtl: 60 * 60
        }
      );

      return json({
        ok: true,
        job
      });
    }

    // =========================================================
    // 404
    // =========================================================

    return json(
      {
        ok: false,
        error: "Endpoint não encontrado."
      },
      404
    );
  }
};


// =============================================================
// 🔑 API KEY
// =============================================================

async function authenticate(request, env) {

  const header =
    request.headers.get("Authorization");

  if (!header) {
    return {
      ok: false,
      error: "Authorization ausente."
    };
  }

  if (!header.startsWith("Bearer ")) {
    return {
      ok: false,
      error: "Use Authorization: Bearer SUA_API_KEY"
    };
  }

  const supplied =
    header.slice(7).trim();

  if (!supplied) {
    return {
      ok: false,
      error: "API Key vazia."
    };
  }

  /*
    API_KEYS deve ser uma variável secreta.

    Exemplo:

    API_KEYS =
    XITOS_abc123,XITOS_def456

    Em produção é melhor guardar HASHES
    das chaves, mas para a V1 isso facilita
    os testes.
  */

  const configured =
    env.API_KEYS || "";

  const keys =
    configured
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

  if (!keys.includes(supplied)) {
    return {
      ok: false,
      error: "API Key inválida."
    };
  }

  return {
    ok: true
  };
}


// =============================================================
// JSON RESPONSE
// =============================================================

function json(data, status = 200) {

  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,

      headers: {
        ...corsHeaders(),

        "Content-Type":
          "application/json; charset=utf-8"
      }
    }
  );
}


// =============================================================
// CORS
// =============================================================

function corsHeaders() {

  return {
    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization"
  };
}
