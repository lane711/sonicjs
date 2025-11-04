// POST /api/v1/auth/password/reset/receive

//this will accept a password reset code and a new password
//it will update the user's password
//it will return a 200 if the password is updated
//it will return a 400 if the password reset code is invalid
//it will return a 400 if the new password is invalid
//it will return a 400 if the user is not found
//it will return a 400 if the password reset code is expired
//it will return a 400 if the password reset code is already used
//it will return a 400 if the password reset code is already expired
import { return200, return400 } from "@services/return-types";
import { getRecords, updateRecord } from "@services/data";

export const POST = async (context) => {
  const { email, password, code } = await context.request.json();

  if (!email || !password || !code) {
    return return400("Missing required fields" );
  }

  const userRecord = await getRecords(
    context,
    "users",
    {
      filters: {
        email: {
          $eq: email.trim().toLowerCase(),
        },
      },
    },
    `user-lookup-${email}`,
    "fastest"
  );

  if (!userRecord.data.length) {
    return return400("Invalid reset code" );
  }

  const user = userRecord.data[0];

  if (!user.passwordResetCode || user.passwordResetCode !== code) {
    return return400("Invalid reset code" );
  }

  const now = new Date().getTime();
  if (!user.passwordResetCodeExpiresOn || user.passwordResetCodeExpiresOn < now) {
    return return400("Reset code has expired" );
  }

  const updated = await updateRecord(
    context.locals.runtime.env.D1,
    {},
    {
      table: "users",
      id: user.id,
      data: {
        password: password,
        passwordResetCode: null,
        passwordResetCodeExpiresOn: null,
      },
    },
    {}
  );

  return return200({ message: "Password updated successfully" });
};
