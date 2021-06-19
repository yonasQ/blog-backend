const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.contactForm = (req, res) => {
    const { name, email, message } = req.body
    const emailData = {
        to: process.env.EMAIL_TO,
        from: email,
        subject: `Contact from - ${process.env.APP_NAME}`,
        text: `Email received from contact form \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `      <h4>Email received from contact form:</h4>
      <p>Sender name: ${name}</p>
      <p>Sender email: ${email}</p>
      <p>Sender message: ${message}</p>
      <hr/>
      <p>This email may contain sensetive information:</p>
      <p>${process.env.CLIENT_URL}</p>
      `
    }
    sgMail.send(emailData)
        .then(() => {
            return res.json({
                success: true
            })
        }
            , error => {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            }
        );
}
exports.contactBlogAuthorForm = (req, res) => {
    const { authorEmail,name, email, message } = req.body
    const emailData = {
        to: authorEmail,
        from: email,
        subject: `Someone messaged you from - ${process.env.APP_NAME}`,
        text: `Message received from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `      <h4>Message received from:</h4>
      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <hr/>
      <p>Message: ${message}</p>
      <hr/>
      <p>This email may contain sensetive information:</p>
      <p>${process.env.CLIENT_URL}</p>
      `
    }
    sgMail.send(emailData)
        .then(() => {
            return res.json({
                success: true
            })
        }
            , error => {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            }
        );
}