import { return200WithObject } from '@services/return-types';
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {

    let value = await context.locals.runtime.env.KV.get('test', {type: 'json'});

    console.log("kv get", value);
    return return200WithObject(value);
};