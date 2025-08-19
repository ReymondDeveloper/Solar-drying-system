// require('dotenv').config();


// const accessSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// const client  = require('twilio')(accessSid, authToken);


// async function sendSMS() {
//     // let msgOptions = {
//     //     from: process.env.TWILIO_SENDER_NUMBER,
//     //     to: to,
//     //     body: body
//     // };

//     try {
//         // const messages = await client.messages.create(msgOptions);
//         const message = await client.messages.create({
//             body: "Hello from Twilio!",
//             from: "+1719781XXXX", // 👈 your Twilio trial number (not your own phone!)
//             to: "+639754739812", // 👈 your verified mobile number
//           });
//         console.log(messages);
//     } catch (error) {
//         console.error('Error sending SMS:', error);
//     }
// }
// sendSMS();
