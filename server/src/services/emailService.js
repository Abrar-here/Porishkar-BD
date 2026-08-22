// ─── F15: In-App & Email Notification Centre ──────────────
// Sends formatted transactional emails via Resend. Same pattern as
// smsService.js — wrapped so a failure here never blocks whatever
// action triggered the notification.
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      // Resend's shared sandbox sender — works without owning a
      // verified domain, but can only deliver to the email address
      // you signed up to Resend with (their free-tier restriction).
      from: "PorishkarBD <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return { success: true, result };
  } catch (error) {
    console.error("Email send failed:", error.message);
    return { success: false, error: error.message };
  }
};

// import { Resend } from "resend";

// const resend = process.env.RESEND_API_KEY
//   ? new Resend(process.env.RESEND_API_KEY)
//   : null;

// export const sendEmail = async ({ to, subject, html }) => {

//   try {

//     if (!resend) {

//       console.log("Email skipped (no RESEND_API_KEY):", {
//         to,
//         subject
//       });

//       return {
//         success:false,
//         message:"Email service not configured"
//       };

//     }

//     const result = await resend.emails.send({

//       from:"PorishkarBD <onboarding@resend.dev>",

//       to,

//       subject,

//       html,

//     });

//     return {
//       success:true,
//       result
//     };

//   } catch(error){

//     console.error(
//       "Email send failed:",
//       error.message
//     );

//     return {
//       success:false,
//       error:error.message
//     };

//   }

// };
