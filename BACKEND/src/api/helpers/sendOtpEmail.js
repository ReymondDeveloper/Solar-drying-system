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
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<h3>Your OTP code is <b>${otp}</b></h3><p>This code will expire in 5 minutes.</p>`,
    });

    console.log(`✅ OTP email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
  }
}
