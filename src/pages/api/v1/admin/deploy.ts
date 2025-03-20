// src/pages/api/deploy.ts

export const POST = async (context) => {
  try {
    console.log(context.locals.runtime.env.DEPOLY_URL);

    const response = await fetch(
      context.locals.runtime.env.DEPOLY_URL.toString(),
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ status: "error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ status: "error", error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
