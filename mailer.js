// send.js
const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amit79meta@gmail.com',
    pass: 'ktjjujrmdsgedglq' // NOT your regular password
  }
});

let html = fs.readFileSync('email.html', 'utf8');

// per-recipient rid injection
const recipients = [
  { email: 'amit21blr@gmail.com', rid: 'abc123' },
  { email: 'amit7903@outlook.com', rid: 'def456' },
  { email: 'amitaknkpt@gmail.com', rid: 'ooooooooooooo' }
];

(async () => {
  for (const r of recipients) {
    const personalizedHtml = html.replace(/{{RID}}/g, r.rid);

    await transporter.sendMail({
      from: '"Your Name" <amit79meta@gmail.com>',
      to: r.email,
      subject: 'Test Campaign',
      html: personalizedHtml
    });

    console.log(`sent to ${r.email}`);
  }
})();
