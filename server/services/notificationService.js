const pool = require("../config/database");
const { sendSMS } = require("./smsService");
const { sendCaseAssignmentEmail, sendHighRiskAlertEmail } = require("./emailService");
const logger = require("../config/logger");

async function createNotification({ recipientType, recipientId, channel, title, message }) {
  const result = await pool.query(
    `INSERT INTO notifications (recipient_type, recipient_id, channel, title, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [recipientType, recipientId, channel, title, message]
  );
  return result.rows[0];
}

async function notifyCounselorNewCase(counselorId, caseData) {
  const notification = await createNotification({
    recipientType: "counselor",
    recipientId: counselorId,
    channel: "in_app",
    title: "New Case Assigned",
    message: `Case #${caseData.id} from ${caseData.district} has been assigned to you. Category: ${caseData.category}, Severity: ${caseData.severity}`,
  });

  const userResult = await pool.query("SELECT phone, email, full_name FROM users WHERE id = $1", [counselorId]);
  const user = userResult.rows[0];

  if (user?.phone) {
    try {
      await sendSMS(user.phone, `Mlinzi: New case #${caseData.id} (${caseData.severity}) assigned to you from ${caseData.district}. Log in to view details.`);
      await pool.query("UPDATE notifications SET sent = TRUE WHERE id = $1", [notification.id]);
    } catch (err) {
      logger.warn({ err }, "Notification SMS send failed");
      await pool.query("UPDATE notifications SET error = $1 WHERE id = $2", [err.message, notification.id]);
    }
  }

  if (user?.email) {
    try {
      await sendCaseAssignmentEmail(user.email, caseData, user.full_name || "Counselor");
      logger.info({ email: user.email, caseId: caseData.id }, "Case assignment email sent");
    } catch (err) {
      logger.warn({ err }, "Case assignment email failed");
    }
  }

  return notification;
}

async function notifyHighRiskCase(caseData) {
  const counselors = await pool.query(
    "SELECT id, phone, email, full_name FROM users WHERE role = 'counselor' AND is_approved = TRUE AND district = $1",
    [caseData.district]
  );

  const notifications = [];
  for (const counselor of counselors.rows) {
    const notification = await createNotification({
      recipientType: "counselor",
      recipientId: counselor.id,
      channel: "in_app",
      title: "High Risk Case",
      message: `URGENT: Case #${caseData.id} is HIGH severity. Category: ${caseData.category}. District: ${caseData.district}. Please review immediately.`,
    });
    notifications.push(notification);

    if (counselor.phone) {
      try {
        await sendSMS(counselor.phone, `Mlinzi URGENT: High-risk case #${caseData.id} (${caseData.category}) in ${caseData.district}. Please log in immediately.`);
        await pool.query("UPDATE notifications SET sent = TRUE WHERE id = $1", [notification.id]);
      } catch (err) {
        logger.warn({ err }, "High-risk notification SMS failed");
      }
    }

    if (counselor.email) {
      try {
        await sendHighRiskAlertEmail(counselor.email, caseData);
        logger.info({ email: counselor.email, caseId: caseData.id }, "High-risk alert email sent");
      } catch (err) {
        logger.warn({ err }, "High-risk notification email failed");
      }
    }
  }

  return notifications;
}

async function notifyCaseStatusChange(caseId, newStatus, counselorId) {
  const caseResult = await pool.query(
    "SELECT rc.*, r.category, r.severity FROM referral_cases rc JOIN reports r ON rc.report_id = r.id WHERE rc.id = $1",
    [caseId]
  );
  const caseData = caseResult.rows[0];
  if (!caseData) return null;

  const statusLabels = {
    under_review: "is now under review",
    resolved: "has been resolved",
  };

  return createNotification({
    recipientType: "counselor",
    recipientId: counselorId,
    channel: "in_app",
    title: `Case #${caseId} Updated`,
    message: `Case #${caseId} ${statusLabels[newStatus] || `status changed to ${newStatus}`}.`,
  });
}

async function getCounselorNotifications(counselorId, { unreadOnly = false, limit = 20 } = {}) {
  let query = "SELECT * FROM notifications WHERE recipient_type = 'counselor' AND recipient_id = $1";
  const values = [counselorId];
  let paramIndex = 2;

  if (unreadOnly) {
    query += ` AND read = FALSE`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  values.push(limit);

  const result = await pool.query(query, values);
  return result.rows;
}

async function markNotificationRead(notificationId) {
  await pool.query("UPDATE notifications SET read = TRUE WHERE id = $1", [notificationId]);
}

async function markAllRead(counselorId) {
  await pool.query(
    "UPDATE notifications SET read = TRUE WHERE recipient_type = 'counselor' AND recipient_id = $1 AND read = FALSE",
    [counselorId]
  );
}

module.exports = {
  createNotification,
  notifyCounselorNewCase,
  notifyHighRiskCase,
  notifyCaseStatusChange,
  getCounselorNotifications,
  markNotificationRead,
  markAllRead,
};
