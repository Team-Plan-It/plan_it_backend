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
        to: `${email}`,
        subject: 'Team Plan-it: Please add your availability to the meeting',
        text: `The coordinator has created a meeting and has invited you! 
                Click on this link so then you can add your availability for this date
                   https://team-plan-it.netlify.app/availability/${meetingNumber}`,
    })
}