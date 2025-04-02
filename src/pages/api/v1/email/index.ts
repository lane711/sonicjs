import { Resend } from "resend";
import MagicLinkEmail from "@emails/magic-link";
import React from "react";
import {  return200, return400, return500 } from "@services/return-types";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  const { env } = context.locals.runtime;

  const params = context.params;

  const request = context.request;
  const content = await request.json();

  if (!content.to || !content.subject || !content.template) {
    return return400("Missing required parameters: 'to', 'subject', and 'template' are required")
  }

  // Additional optional parameters
  const to = content.to;
  const subject = content.subject;
  const text = content.text;
  const from = content.from || "noreply@example.com"; // Default from address
  const templateData = content.templateData || {}; // Data to pass to email template
  const replyTo = content.replyTo; // Optional reply-to address
  const cc = content.cc; // Optional CC recipients
  const bcc = content.bcc; // Optional BCC recipients
  const attachments = content.attachments; // Optional attachments

  const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);

  (async function () {
    const { data, error } = await resend.emails.send({
      from: from,
      to: [to],
      subject,
      text: text,
    });

    if (error) {
      return return500(error);
    }
    return return200(data);

  })();

  // return new Response(JSON.stringify({ message: "email test" }), {
  //   status: 200,
  // });

};
