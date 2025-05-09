import { sendEmailResend } from "@services/email";
import { return200, return404 } from "@services/return-types";
import MagicLinkEmail from "@emails/welcome";
import React from "react";
import { Resend } from "resend";
import { getRecords, updateRecord } from "@services/data";
import { OTPEmail } from "@emails/otp";
import { formatMilliseconds } from "@services/time";

export const GET = async (context) => {
  let params = context.params;
  const emailEncoded = params.email.trim().toLowerCase();

  const email = decodeURIComponent(emailEncoded);

  const otp = generateOTPPassword(context.locals.runtime.env.ONE_TIME_PASSWORD_CHARACTER_LENGTH ?? 8);

  const userRecord = await getRecords(
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

  if (!userRecord.data.length) {
    return return404();
  }

  const user = userRecord.data[0];

  const now = new Date();

  const expiresOn = now.getTime() + context.locals.runtime.env.ONE_TIME_PASSWORD_EXPIRATION_TIME;
  const expirationTime = formatMilliseconds(expiresOn - now.getTime());

  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.id,
      data: {
        passwordOTP: otp,
        passwordOTPExpiresOn: expiresOn,
      },
    },
    {}
  );

  //   const react = React.createElement(<MagicLinkEmail otp={otp} />)

  const resend = new Resend(context.locals.runtime.env.RESEND_API_KEY);
  const firstName = user.firstName;

  const result = await resend.emails.send({
    from: context.locals.runtime.env.EMAIL_FROM,
    to: email,
    subject: context.locals.runtime.env.ONE_TIME_PASSWORD_EMAIL_SUBJECT,
    react: OTPEmail({
      otp,
      firstName: firstName,
      expirationTime: expirationTime,
    }),
  });

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
