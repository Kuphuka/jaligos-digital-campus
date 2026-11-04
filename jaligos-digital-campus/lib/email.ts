import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const loginUrl = "https://jaligostraining.co.za/login";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

export async function sendStudentWelcomeEmail(
  toEmail: string,
  studentEmail: string,
  tempPassword: string,
  fullName: string,
  courseName: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!toEmail.trim()) {
    throw new Error("The student's personal email address is missing.");
  }

  const name = escapeHtml(fullName);
  const personalAddress = escapeHtml(toEmail);
  const schoolAddress = escapeHtml(studentEmail);
  const password = escapeHtml(tempPassword);
  const course = escapeHtml(courseName);
  const { data, error } = await resend.emails.send({
    from: "Jaligos Training <info@jaligostraining.co.za>",
    to: [toEmail],
    subject: "Welcome to Jaligos Training",
    text: [
      `Welcome to Jaligos Training, ${fullName}!`,
      `You have been enrolled in ${courseName}.`,
      "",
      `Login email: ${studentEmail}`,
      `Temporary password: ${tempPassword}`,
      `Login: ${loginUrl}`,
      "",
      "Please change your temporary password after your first login.",
      `This email was sent to your personal address: ${toEmail}.`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:32px 16px;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#243047;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:30px 36px;background:#0B1B3D;border-bottom:5px solid #FDB913;">
          <p style="margin:0;color:#FDB913;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Jaligos Training</p>
          <h1 style="margin:14px 0 0;color:#ffffff;font-size:28px;line-height:1.25;">Welcome, ${name}!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 36px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Your student account is ready. We are pleased to welcome you to Jaligos Training.</p>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.6;"><strong>Course:</strong> ${course}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fa;border-left:4px solid #FDB913;border-radius:6px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 12px;color:#0B1B3D;font-size:14px;font-weight:bold;">YOUR LOGIN DETAILS</p>
              <p style="margin:0 0 10px;font-size:14px;"><strong>Login email</strong><br>${schoolAddress}</p>
              <p style="margin:0;font-size:14px;"><strong>Temporary password</strong><br><span style="font-family:monospace;font-size:16px;">${password}</span></p>
            </td></tr>
          </table>
          <p style="margin:24px 0;text-align:center;">
            <a href="${loginUrl}" style="display:inline-block;padding:14px 28px;background:#FDB913;border-radius:6px;color:#0B1B3D;font-size:15px;font-weight:bold;text-decoration:none;">Log in to your student portal</a>
          </p>
          <p style="margin:0;color:#5d687b;font-size:13px;line-height:1.6;">For your security, sign in and change your temporary password as soon as possible. This message was sent to your personal email address, ${personalAddress}.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 36px;background:#0B1B3D;color:#dce3f0;font-size:12px;line-height:1.5;">
          Jaligos Training and Skills Development Centre
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });

  if (error) throw new Error(`Resend could not deliver the welcome email: ${error.message}`);
  return data;
}
