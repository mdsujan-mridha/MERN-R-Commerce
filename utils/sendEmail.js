const nodemailer = require("nodemailer");
const sendToken = require("../utils/jwtToken");

const sendEmail = async (options) => {
    let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,

        secure:false,

        // service: "gmail",
        auth: {
            // type:"OAuth2",
            user: 'hans.koepp11@ethereal.email',
            pass: '9Nbk4u9GBgDZjMBp9n'
            // accessToken: ,
        },

    });


    const mailOptions = {
        from: "sujan@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);

}

module.exports = sendEmail;