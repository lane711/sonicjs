import { sendEmailResend } from "@services/email";
import { return200, return200WithObject } from "@services/return-types";
import MagicLinkEmail from "@emails/magic-link";
import React from "react";
import { Resend } from "resend";

export const GET = async (context) => {
  let params = context.params;

  const otp = generateOTPPassword(5);

//   const react = React.createElement(<MagicLinkEmail otp={otp} />)

  const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);


  const result = await resend.emails.send({
    from: context.locals.runtime.env.SEND_EMAIL_FROM,
    to :params.email,
    subject: "One Time Password",
    react: MagicLinkEmail({ otp }),
  });

//   const result = await sendEmailResend(
//     context,
//     context.locals.runtime.env.SEND_EMAIL_FROM,
//     params.email,
//     "One Time Password",
    
//   );

  return return200WithObject(result);
};

// declare all characters
const characters = "ABCDEFGHJKLMNPQRTUVWXY123456789";

function generateOTPPassword(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.trim();
}
