import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Solar Drying System" <${process.env.EMAIL_USER}>`,
      to: toEmail.toLowerCase(),
      subject:
        "Verify your newly created account at Solar Drying System using this OTP",
      text: `Your OTP code is ${otp}. This will expire in 5 minutes.`,
      html: `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #5a9aa4; text-align: center;">Solar Drying System Email Verification</h2>
                    <p style="font-size: 18px;">Hello,</p>
                    <p style="font-size: 16px;">We received a request to access your account <b>${toEmail.toLowerCase()}</b> through your email address.</p>
                    <p style="font-size: 16px; margin: 50px 0;">Verify this request by using this OTP: <b>${otp}</b></p>
                    <p style="font-size: 16px; color: #888;">This will expire in 5 minutes.</p>
                    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777;">If you did not request this account creation, please ignore this email.</p>
                    <p style="font-size: 14px; color: #777;">If you need help securing your account, please contact our support team.</p>
                </div>
            </body>
        </html>
      `,
    });

    console.log(`✅ OTP email sent to ${toEmail.toLowerCase()}`);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
  }
}
