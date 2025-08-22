import twilio from "twilio";

// Initialize Twilio client with environment variables only
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client only if all credentials are available
if (accountSid && authToken && twilioPhoneNumber) {
  twilioClient = twilio(accountSid, authToken);
}

export interface SMSMessage {
  to: string;
  body: string;
}

export async function sendSMS(message: SMSMessage): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error("Twilio not configured - missing credentials");
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message.body,
      from: twilioPhoneNumber,
      to: message.to,
    });

    console.log(`SMS sent successfully to ${message.to}. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

export async function sendMagicLinkSMS(
  clientName: string,
  clientPhone: string,
  magicLink: string,
): Promise<boolean> {
  const message: SMSMessage = {
    to: clientPhone,
    body: `Hi ${clientName}! Here's your secure login link for CapturedCCollective client portal: ${magicLink}\n\nThis link expires in 24 hours. If you have any questions, please reply to this message.`,
  };

  return await sendSMS(message);
}

export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}
