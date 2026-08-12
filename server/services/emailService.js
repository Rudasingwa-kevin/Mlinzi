const nodemailer = require("nodemailer");
const logger = require("../config/logger");

const emailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

async function sendCaseAssignmentEmail(email, caseData, counselorName) {
  const from = `"${process.env.SENDER_NAME || "Mlinzi"}" <${process.env.SENDER_EMAIL}>`;
  const severityColors = { low: "#2E7D32", medium: "#F57F17", high: "#C62828" };
  const severityColor = severityColors[caseData.severity] || "#666";
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/counselor/${caseData.id}`;

  await emailTransporter.sendMail({
    from,
    to: email,
    subject: `Mlinzi: New Case #${caseData.id} Assigned to You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <div style="background: #1B5E20; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">New Case Assigned</h2>
          <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">Hi ${counselorName}, a new case needs your attention.</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px; width: 120px;">Case ID</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">#${caseData.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">District</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">${caseData.district}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Category</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">${caseData.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Severity</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; color: white; background: ${severityColor};">
                  ${(caseData.severity || "").toUpperCase()}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Channel</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220; text-transform: capitalize;">${caseData.channel || "Web"}</td>
            </tr>
          </table>
          <a href="${loginUrl}" style="display: block; text-align: center; background: #2E7D32; color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            View Case Details
          </a>
          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 16px;">
            Mlinzi — Child Digital Protection Platform • UNICEF Innovation Project
          </p>
        </div>
      </div>
    `,
  });
}

async function sendHighRiskAlertEmail(email, caseData) {
  const from = `"${process.env.SENDER_NAME || "Mlinzi"}" <${process.env.SENDER_EMAIL}>`;
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/counselor/${caseData.id}`;

  await emailTransporter.sendMail({
    from,
    to: email,
    subject: `URGENT: High-Risk Case #${caseData.id} — Immediate Action Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <div style="background: #C62828; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ High-Risk Case Alert</h2>
          <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">This case requires immediate attention.</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px; width: 120px;">Case ID</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">#${caseData.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">District</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">${caseData.district}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Category</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0B1220;">${caseData.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 13px;">Severity</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; color: white; background: #C62828;">
                  HIGH RISK
                </span>
              </td>
            </tr>
          </table>
          <a href="${loginUrl}" style="display: block; text-align: center; background: #C62828; color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Review Case Now
          </a>
          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 16px;">
            Mlinzi — Child Digital Protection Platform • UNICEF Innovation Project
          </p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendCaseAssignmentEmail, sendHighRiskAlertEmail };
