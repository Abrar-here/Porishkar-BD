// Provider-agnostic SMS sending. For now this just logs to the console so
// F13 (OTP) can be built and tested without a live Twilio/SSL Wireless account.
// Swap the inside of sendSms() later when real credentials are available —
// nothing that calls this function needs to change.
export const sendSms = async (phone, message) => {
  console.log(`\n📱 [SMS to ${phone}]: ${message}\n`);
  return { success: true, provider: "console-mock" };
};