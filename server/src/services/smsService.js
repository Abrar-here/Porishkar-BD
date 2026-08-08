// smsService.js
// Provider-agnostic SMS sending. For now this just logs to the console so
// F13 (OTP) can be built and tested without a live Twilio/SSL Wireless account.
// Swap the inside of sendSms() later when real credentials are available —
// nothing that calls this function needs to change.

// @desc    Send an SMS message
// @param   {string} phone   - recipient's phone number
// @param   {string} message - message body (e.g. "Your OTP is 482913")
export const sendSms = async (phone, message) => {
  // TODO: replace this block with a real Twilio/SSL Wireless API call later
  console.log(`\n📱 [SMS to ${phone}]: ${message}\n`);
  return { success: true, provider: "console-mock" };
};