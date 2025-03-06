import { purgeE2eTestData } from '@services/e2e';
import { return200 } from '@services/return-types';
import { checkToken } from '@services/token';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  return new Response(
        JSON.stringify({
            message: "Hello, world!",
        }),
        { status: 200 }
    );
};
export const POST: APIRoute = async (context ) => {
  const token = await checkToken(context);
  if (context.locals?.user?.role !== 'admin') {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      { status: 401 }
    );
  }

  await purgeE2eTestData(context.locals.runtime.env.D1, "users", "email");

  return return200();
  
};
