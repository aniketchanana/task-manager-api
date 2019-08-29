const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:"aniketchanana1@hotmail.com",
        subject:'testing send grid',
        text: `welcome to app ${name}`,
        // html:'<strong>hello</strong>'
    })
}

const sendGoodByeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:"aniketchanana1@hotmail.com",
        subject:'testing send grid',
        text: `Good bye ${name}`,
        // html:'<strong>hello</strong>'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
}