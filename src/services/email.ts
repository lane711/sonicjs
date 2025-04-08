import { createTransport, type Transporter } from "nodemailer";
import React from "react";
import { Resend } from "resend";

type SendEmailOptions = {
  /** Email address of the recipient */
  to: string;
  /** Subject line of the email */
  subject: string;
  /** Message used for the body of the email */
  html: string;
};


export async function sendEmailResend(context, from, to, subject, template) {
  const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);

  (async function () {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: React.createElement(template),
    });

    if (error) {
      return console.error({ error });
    }

    return data;
  })();
}

export async function sendEmailNodeMail(options: SendEmailOptions): Promise<Transporter> {
  const transporter = await getEmailTransporter();
  return new Promise(async (resolve, reject) => {
    // Build the email message
    const { to, subject, html } = options;
    const from = import.meta.env.SEND_EMAIL_FROM;
    const message = { to, subject, html, from };
    // Send the email
    transporter.sendMail(message, (err, info) => {
      // Log the error if one occurred
      if (err) {
        console.error(err);
        reject(err);
      }
      // Log the message ID and preview URL if available.
      console.log("Message sent:", info.messageId);
      resolve(info);
    });
  });
}

async function getEmailTransporter(): Promise<Transporter> {
  return new Promise((resolve, reject) => {
    if (!import.meta.env.RESEND_API_KEY) {
      throw new Error("Missing Resend configuration");
    }
    const transporter = createTransport({
      host: "smtp.resend.com",
      secure: true,
      port: 465,
      auth: { user: "resend", pass: import.meta.env.RESEND_API_KEY },
    });
    resolve(transporter);
  });
}