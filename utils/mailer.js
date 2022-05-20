// require our mailgun dependencies
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
require('dotenv').config();

// auth with our mailgun API key and domain
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN
  }
}
// create a mailer
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports.sendMail = (email, meetingNumber) => {
    nodemailerMailgun.sendMail({
        from: 'no-reply@plan-it.team',
        to: "johnsaguay@gmail.com",
        subject: 'Choose your availability',
        text: `Click on this link so then you can add your availability for this date http://plan-it.team/availability/${meetingNumber}`,
    })
}
// export our send mail function
// module.exports.sendMail = (data) => {
//     nodemailerMailgun.sendMail({
//         from: 'no-reply@example.com',
//         to: 'johnsaguay@gmail.com', // An array if you have multiple recipients.
//         subject: 'Reminder to pay all these bills!!',
//         template: {
//             name: './views/email.hbs',
//             engine: 'handlebars',
//             context: data
//         }
//     })
// }