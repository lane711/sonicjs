import { return200 } from "@services/return-types";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
    const blogPosts = [
        { id: 1, title: 'First Blog Post', content: 'This is the content of the first blog post.' },
        { id: 2, title: 'Second Blog Post', content: 'This is the content of the second blog post.' },
        { id: 3, title: 'Third Blog Post', content: 'This is the content of the third blog post.' },
        { id: 4, title: 'Fourth Blog Post', content: 'This is the content of the fourth blog post.' },
        { id: 5, title: 'Fifth Blog Post', content: 'This is the content of the fifth blog post.' },
        { id: 6, title: 'Sixth Blog Post', content: 'This is the content of the sixth blog post.' },
        { id: 7, title: 'Seventh Blog Post', content: 'This is the content of the seventh blog post.' },
        { id: 8, title: 'Eighth Blog Post', content: 'This is the content of the eighth blog post.' },
        { id: 9, title: 'Ninth Blog Post', content: 'This is the content of the ninth blog post.' },
        { id: 10, title: 'Tenth Blog Post', content: 'This is the content of the tenth blog post.' },
    ];

    return return200(blogPosts);

    // return new Response(JSON.stringify(blogPosts), {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    //         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    //         'Access-Control-Max-Age': '86400', // 24 hours
    //     },
    // });
};