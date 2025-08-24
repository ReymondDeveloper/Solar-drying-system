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
      to: toEmail,
      subject:
        "Verify your newly created account at Solar Drying System using this OTP",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<h6>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</h6>`,
    });

    console.log(`✅ OTP email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
  }
}
