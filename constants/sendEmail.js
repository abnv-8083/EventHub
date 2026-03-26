import { transporter } from "../config/mailer.js";

export const sendEmail = async ({ email, name, data }) => {
  const mailOptions = {
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hi ${name || "User"},</h2>
        <p>Your OTP for signup is:</p>
        <h1 style="color:#FF4D4D;">${data.otp}</h1>
        <p>This OTP is valid for 1 minute.</p>
        <p>${data.purpose}</p>
      </div>
    `,
  };
  const info = await transporter.sendMail(mailOptions)
}

export const sendAdminCredentials = async ({ email, name, password }) => {
  const mailOptions = {
    from: `"EventHub Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to EventHub - Your Administrator Credentials",
    html: `
      <div style="font-family: Arial; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #E63946;">Welcome to the EventHub Team, ${name}!</h2>
        <p>Your administrative account has been successfully provisioned.</p>
        <p>Please use the following credentials to access the secure admin portal:</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #E63946; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Admin Login URL:</strong> <a href="http://localhost:5000/admin/login">http://localhost:5000/admin/login</a></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p style="color: #666; font-size: 0.9em;">For security reasons, please do not share these credentials with anyone.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions)
}
