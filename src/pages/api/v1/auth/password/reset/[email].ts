import { sendEmailResend, sendOTPEmail, sendPasswordResetEmail } from "@services/email";
import { return200, return404 } from "@services/return-types";
import MagicLinkEmail from "@emails/welcome";
import React from "react";
import { Resend } from "resend";
import { getRecords, updateRecord } from "@services/data";
import otp, { OTPEmail } from "@emails/otp";
import { formatMilliseconds } from "@services/time";
import { generateRandomString } from "@services/utils";

export const GET = async (context) => {
  let params = context.params;
  const emailEncoded = params.email.trim().toLowerCase();

  const email = decodeURIComponent(emailEncoded);


  const userRecord = await getRecords(
    context,
    "users", // table name
    {
      filters: {
        email: {
          $eq: email, // the email address you want to look up
        },
      },
    },
    `user-lookup-${email}`, // cache key
    "fastest"
  );

  const returnMessage = "If the email address is valid, a password reset email has been sent";

  if (!userRecord.data.length) {
    console.log("password reset: user not found", email);
    // add a random delay of 50ms to 2000ms to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1950 + 50));
    context.locals.runtime.env.e2e_forgot_password = 'user not found';
    return return200({ message: returnMessage });
  }

  const passwordResetCode = generateRandomString(48)


  const user = userRecord.data[0];

  const now = new Date();

  const expiresOn = now.getTime() + context.locals.runtime.env.RESET_PASSWORD_EXPIRATION_TIME;
  const expirationTime = formatMilliseconds(expiresOn - now.getTime());

  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.id,
      data: {
        passwordResetCode: passwordResetCode,
        passwordResetCodeExpiresOn: expiresOn,
      },
    },
    {}
  );

  const result = await sendPasswordResetEmail(context, user, passwordResetCode, expirationTime);

  console.log("password reset: email sent", email);
  context.locals.runtime.env.e2e_forgot_password = 'email sent';


  return return200({ message: returnMessage });
};

