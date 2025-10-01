
// export async function sendSmsBulkLive(phone, message) {
//   const url = `https://api.bulksmslive.com/v2/app/sms?email=${process.env.email}&password=${process.env.password}&message=${message}&sender_name=nipost&recipients=${phone}&forcednd=0`;
//   const token = process.env.token; // Replace with your actual authorization token


// fetch(url, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json', // Or other appropriate content type
//     'Authorization': `Bearer ${token}` // Add your authorization header here
//   },
// })
// .then(response => {
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   return response.json(); // Or response.text() if the response is not JSON
// })
// .then(data => {
  
//   if(data.status === -7){
//     console.log('data:', data);
//     return { success: false };
//   }
//   console.log('success:', data);
//   return { success: true };
// })
// .catch(error => {
//   console.error('Error:', error);
// });
// }

import { NigeriaBulkSMSClient } from 'nigeriabulksms-sdk';

// Initialize the client


// Send an SMS
export async function sendSmsBulkLive(phone, message) {

  console.log("name is now", process.env.Bulksms_User)
  const client = new NigeriaBulkSMSClient({
    username: process.env.Bulksms_User,
    password: process.env.Bulksms_Password
});
    try {
        const res = await client.sms.send({
            message: message,
            sender: 'NIPOST',
            mobiles: phone
        });


        console.log('SMS sent successfully:', res);
        if(res.status === 'OK') return true
        return false
    } catch (error) {
        console.error('Error sending SMS:', error.message);
    }
}

