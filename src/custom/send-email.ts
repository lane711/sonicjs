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
  // "{\n    \"personalizations\": [\n        {\n            \"to\": [\n                {\n                    \"email\": \"lane@rifeplayer.com\"\n                }\n            ]\n        }\n    ],\n    \"from\": {\n        \"email\": \"lane@rifeplayer.com\",\n        \"name\": \"Lane @ RifePlayer\"\n    },\n    \"reply_to\": {\n        \"email\": \"ldc0618@gmail.com\",\n        \"name\": \"Lane Campbell\"\n    },\n    \"subject\": \"RifePlayer Message Received\",\n    \"content\": [\n        {\n            \"type\": \"text/html\",\n            \"value\": \"<p>Hello Lane,<p>Thanks for reaching out. We will get back to you asap.</p>\\n  <p>For your reference, your message was:</p><p><hr></p><p>Lane Campbell:</p><p>f<br>asdf<br>adsf</p><p><hr></p><p>Thank you,<br>RifePlayer Support</p>\"\n        }\n    ]\n}

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

  const url = 'https://api.sendgrid.com/v3/mail/send';
  console.log('contact send mail url ', url);

  try {
    const email = await fetch(url, {
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
    console.log('sendEmail error', error);
    return { status: 500, statusText: error };
  }
}
