const sgMail = require('@sendgrid/mail');

export async function sendMail(ctx, to, from, subject, html) {

  sgMail.setApiKey(ctx.env.SENDGRID_API_KEY);


  const msg = {
    to,
    from, 
    subject,
    html
  };

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
}
