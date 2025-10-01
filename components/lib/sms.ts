// lib/sms.ts
// export async function sendSMS(phone: string, message: string) {
//   console.log(`[SIMULATED SMS] Sending to ${phone}: ${message}`);
//   // Integrate with real SMS service like Termii, Twilio, etc.
// }

// lib/sms.ts
import fetch from "node-fetch";

import twilio from 'twilio';
import {sendSmsBulkLive} from './liveBulksms'

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

const USE_TERMII = process.env.USE_TERMII === "true";

export async function sendSmsTwilio(phone: string, message: string) {
  // Development mock: log to server console
 
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
});
console.log(`📲 [Twilio SMS] to ${phone}: ${message}`);
return { success: true };
}

export async function sendSmsTermii(phone: string, message: string) {
  // Termii expects JSON body with api_key, to, from, sms
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID ?? "NIPOST";
  const base = process.env.TERMII_BASE_URL;

  if (!apiKey) throw new Error("TERMII_API_KEY not set");

  const url = `${base}/api/sms/send`;
  console.log("url ytermii", url)
  const body = {
    api_key: apiKey,
    to: phone,
    from: sender,
    sms: message,
    type: "plain",
    channel: process.env.TERMII_CHANNEL ?? "generic"
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("termii sms response",data)
  if(res.ok) return data;
  return
}

export async function sendSms(phone: string, message: string) {
  if (USE_TERMII) return sendSmsTermii(phone, message);
  return sendSmsBulkLive(phone, message);
}