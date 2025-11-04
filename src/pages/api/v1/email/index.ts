import { Resend } from "resend";
import WelcomeEmail from "@emails/welcome";
import React from "react";
import {
  return200,
  return400,
  return401,
  return500,
} from "@services/return-types";
import type { APIRoute } from "astro";

//TODO: revisit this. There is likely no safe way to do this without exposing the token to the client
// export const POST: APIRoute = async (context) => {
//   const { env } = context.locals.runtime;

//   const params = context.params;

//   const request = context.request;
//   const content = (await request.json()) as {
//     to?: string;
//     subject?: string;
//     token?: string;
//     text?: string;
//     from?: string;
//     data?: Record<string, unknown>;
//     templateData?: Record<string, unknown>;
//     replyTo?: string;
//     cc?: string[];
//     bcc?: string[];
//     attachments?: any[];
//   };

//   if (!content.to || !content.subject) {
//     return return400(
//       "Missing required parameters: 'to', 'subject', and 'template' are required"
//     );
//   }

//   if (
//     !content.token ||
//     content.token !== context.locals.runtime.env.EMAIL_CLIENT_TOKEN
//   ) {
//     return return401();
//   }

//   // Additional optional parameters
//   const to = content.to;
//   const subject = content.subject;
//   const text = content.text;
//   const from = content.from || "noreply@example.com"; // Default from address
//   const templateData = content.templateData || {}; // Data to pass to email template
//   const replyTo = content.replyTo; // Optional reply-to address
//   const cc = content.cc; // Optional CC recipients
//   const bcc = content.bcc; // Optional BCC recipients
//   const attachments = content.attachments; // Optional attachments

//   const resend = new Resend(
//     context.locals.runtime.env.RESEND_API_KEY as string
//   );

//   const { data, error } = await resend.emails.send({
//     from: from,
//     to: [to],
//     subject,
//     react: WelcomeEmail({
//       data: templateData,
//     }),
//   });

//   if (error) {
//     return return500(error);
//   }
//   return return200(data);

//   // return new Response(JSON.stringify({ message: "email test" }), {
//   //   status: 200,
//   // });
// };
