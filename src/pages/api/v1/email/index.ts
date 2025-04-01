import { Resend } from "resend";
import MagicLinkEmail from "@emails/magic-link";
import React from "react";

export const GET = async (context) => {
  // const { request } = context;

  // const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);

  // (async function () {
  //   const { data, error } = await resend.emails.send({
  //     from: "lane@sonicjs.com",
  //     to: ["ldc0618@gmail.com"],
  //     subject: "Hello World",
  //     react: React.createElement(MagicLinkEmail),
  //   });

  //   if (error) {
  //     return console.error({ error });
  //   }

  //   console.log({ data });
  // })();

  // return new Response(JSON.stringify({ message: "email test" }), {
  //   status: 200,
  // });
};
