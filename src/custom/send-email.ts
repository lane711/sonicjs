export async function sendEmail(
  ctx,
  toEmail,
  toName,
  fromEmail,
  fromName,
  replyToEmail,
  replyToName,
  subject,
  html
) {

  const example = {
    personalizations: [
      {
        to: [{ email: 'john.doe@example.com', name: 'John Doe' }],
        subject: 'Hello, World!'
      }
    ],
    content: [{ type: 'text/plain', value: 'Heya!' }],
    from: { email: 'sam.smith@example.com', name: 'Sam Smith' },
    reply_to: { email: 'sam.smith@example.com', name: 'Sam Smith' }
  };

  const messageBody = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: {
      email: fromEmail,
      name: fromName
    },
    reply_to: { email: replyToEmail, name: replyToName },
    subject: subject,
    content: [{ type: 'text/html', value: html }]
  };

  console.log('messageBody', JSON.stringify(messageBody, null, 4));

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
    console.log('result', JSON.stringify(body, null, 4));
    return email;
  } catch (error) {
    console.log('email error', error);
    return { status: 500, statusText: error };
  }
}
