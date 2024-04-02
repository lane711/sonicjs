const sgMail = require('@sendgrid/mail');

// export async function sendMail(ctx, to, from, subject, html) {

//   sgMail.setApiKey(ctx.env.SENDGRID_API_KEY);


//   const msg = {
//     to,
//     from, 
//     subject,
//     html
//   };

//   sgMail
//     .send(msg)
//     .then((response) => {
//       console.log(response[0].statusCode);
//       console.log(response[0].headers);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

export async function sendEmail(ctx, to, from, subject, html) {
  const messageBody = {
    from: {
      email: ctx.env.SENDGRID_EMAIL_SENDER,
      name: "RifePlayer Message Received",
    },
    replyTo: {
      email: ctx.env.SENDGRID_EMAIL_SENDER,
      name: ctx.env.SENDGRID_EMAIL_SENDER_NAME,
    },
    subject: "New message from my website",
    content: [
      {
        type: "text/html",
        value: html,
      },
    ],
    personalizations: [
      {
        from: {
          email: ctx.env.SENDGRID_EMAIL_SENDER,
          name: ctx.env.SENDGRID_EMAIL_SENDER_NAME,
        },
        to: [
          {
            email: to,
            name: "Recipient",
          },
        ],
      },
    ],
  };


  try {
    const email = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageBody),
    });
    return email;
  } catch (error) {
    return { status: 500, statusText: error };
  }
}
