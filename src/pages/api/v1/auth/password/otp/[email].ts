import { sendEmailResend } from "@services/email";
import { return200, return404 } from "@services/return-types";
import MagicLinkEmail from "@emails/welcome";
import React from "react";
import { Resend } from "resend";
import { getRecords, updateRecord } from "@services/data";
import { OTPEmail } from "@emails/otp";

export const GET = async (context) => {
  let params = context.params;
  const email = params.email.trim().toLowerCase();

  const otp = generateOTPPassword(5);

  const user = await getRecords(
    context,
    "users", // table name
    {
      filters: {
        email: {
          $contains: email, // the email address you want to look up
        },
      },
    },
    `user-lookup-${email}`, // cache key
    "fastest"
  );

  if (!user.data.length) {
    return return404();
  }

  const now = new Date();
  const expiresOn = now.getTime() + 4 * 60 * 60 * 1000; // 4 hours in future

  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.data[0].id,
      data: {
        passwordOTP: otp,
        passwordOTPExpiresOn: expiresOn,
      },
    },
    {}
  );

  //   const react = React.createElement(<MagicLinkEmail otp={otp} />)

  const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);
  const firstName = user.data[0].firstName;

  const result = await resend.emails.send({
    from: context.locals.runtime.env.EMAIL_FROM,
    to: email,
    subject: "One Time Password",
    react: OTPEmail({
      otp,
      firstName: firstName,
    }),
  });

  //   const result = await sendEmailResend(
  //     context,
  //     context.locals.runtime.env.SEND_EMAIL_FROM,
  //     params.email,
  //     "One Time Password",

  //   );

  return return200(result);
};

// declare all characters
const characters = "ABCDEFGHJKLMNPQRTUVWXY123456789";

function generateOTPPassword(length: number) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.trim();
}
