import { return200 } from "@services/return-types";
import { statsGetUrl } from "@services/stats";
import type { APIRoute } from "astro";


export const GET: APIRoute = async (context) => {
    const url = context.url.search.split('?stats-url=')[1];
    if (!url) {
        throw new Error('URL parameter is required');
    }

    const stats = await statsGetUrl(context, url);

    return return200(stats);
};