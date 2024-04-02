export async function sendEmail(
  ctx,
  to,
  toName,
  from,
  fromName,
  replyTo,
  replyToName,
  subject,
  html
) {
  const messageBody = {
    from: {
      email: from,
      name: fromName
    },
    replyTo: {
      email: replyTo,
      name: replyToName
    },
    subject: subject,
    content: [
      {
        type: 'text/html',
        value: html
      }
    ],
    personalizations: [
      {
        from: {
          email: from,
          name: fromName
        },
        to: [
          {
            email: to,
            name: toName
          }
        ]
      }
    ]
  };

  console.log('messageBody', JSON.stringify(messageBody, null, 4))

  try {
    const email = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageBody)
    });
    let body = await email.json();
    console.log('result', JSON.stringify(body, null, 4))
    return email;
  } catch (error) {
    console.log('email error', error);
    return { status: 500, statusText: error };
  }
}
