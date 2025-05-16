import ConfirmationEmail from "@emails/confirmation";
import OTPEmail from "@emails/otp";
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
  const resend = getResendClient(context);

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

export async function sendWelcomeEmail(context, user) {
  const resend = getResendClient(context);
  const firstName = user.firstName;
  // const result = await resend.emails.send({
  //   from: context.locals.runtime.env.EMAIL_FROM,
  //   to: email,
  //   subject: context.locals.runtime.env.ONE_TIME_PASSWORD_EMAIL_SUBJECT,
  //   react: OTPEmail({
  //     otp,
  //     firstName: firstName,
  //     expirationTime: expirationTime,
  //   }),
  // });
  // return result;
}

export async function sendOTPEmail(context, user, otp, expirationTime) {
  const resend = getResendClient(context);
  const result = await resend.emails.send({
    from: context.locals.runtime.env.EMAIL_FROM,
    to: user.email,
    subject: context.locals.runtime.env.ONE_TIME_PASSWORD_EMAIL_SUBJECT,
    react: OTPEmail({
      otp,
      firstName: user.firstName,
      expirationTime: expirationTime,
    }),
  });
  return result;
}

export async function sendEmailConfirmationEmail(context, user, code) {
  const resend = getResendClient(context);
  const result = await resend.emails.send({
    from: context.locals.runtime.env.EMAIL_FROM,
    to: user.email,
    subject: context.locals.runtime.env.EMAIL_CONFIRMATION_SUBJECT,
    react: ConfirmationEmail({
      code,
      firstName: user.firstName,
    }),
  });
  return result;
}

export function getResendClient(context) {
  return new Resend(context.locals.runtime.env.RESEND_API_KEY);
}

// export async function sendEmailNodeMail(options: SendEmailOptions): Promise<Transporter> {
//   const transporter = await getEmailTransporter();
//   return new Promise(async (resolve, reject) => {
//     // Build the email message
//     const { to, subject, html } = options;
//     const from = import.meta.env.SEND_EMAIL_FROM;
//     const message = { to, subject, html, from };
//     // Send the email
//     transporter.sendMail(message, (err, info) => {
//       // Log the error if one occurred
//       if (err) {
//         console.error(err);
//         reject(err);
//       }
//       // Log the message ID and preview URL if available.
//       console.log("Message sent:", info.messageId);
//       resolve(info);
//     });
//   });
// }

// async function getEmailTransporter(): Promise<Transporter> {
//   return new Promise((resolve, reject) => {
//     if (!import.meta.env.RESEND_API_KEY) {
//       throw new Error("Missing Resend configuration");
//     }
//     const transporter = createTransport({
//       host: "smtp.resend.com",
//       secure: true,
//       port: 465,
//       auth: { user: "resend", pass: import.meta.env.RESEND_API_KEY },
//     });
//     resolve(transporter);
//   });
// }
