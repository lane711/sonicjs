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

  if (!userRecord.data.length) {
    return return404();
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

  return return200(result);
};

