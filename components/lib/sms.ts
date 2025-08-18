// lib/sms.ts
// export async function sendSMS(phone: string, message: string) {
//   console.log(`[SIMULATED SMS] Sending to ${phone}: ${message}`);
//   // Integrate with real SMS service like Termii, Twilio, etc.
// }

// lib/sms.ts
import fetch from "node-fetch";

const USE_TERMII = process.env.USE_TERMII === "true";

export async function sendSmsMock(phone: string, message: string) {
  // Development mock: log to server console
  console.log(`📲 [MOCK SMS] to ${phone}: ${message}`);
  return { success: true };
}

export async function sendSmsTermii(phone: string, message: string) {
  // Termii expects JSON body with api_key, to, from, sms
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID ?? "NIPOST";
  const base = process.env.TERMII_BASE_URL ?? "https://api.ng.termii.com/api";

  if (!apiKey) throw new Error("TERMII_API_KEY not set");

  const url = `${base}/sms/send`;

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
  return data;
}

export async function sendSms(phone: string, message: string) {
  if (USE_TERMII) return sendSmsTermii(phone, message);
  return sendSmsMock(phone, message);
}