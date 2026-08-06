const pool = require("../config/database");

const ReferralCase = {
  async create({ reportId, district, preferredContact, contactValue, bestTime, isSafe }) {
    const result = await pool.query(
      `INSERT INTO referral_cases (report_id, district, preferred_contact, contact_value, best_time, is_safe)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [reportId, district, preferredContact, contactValue, bestTime, isSafe]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT rc.*, r.category, r.severity, r.guidance, r.extracted_text, r.screenshot_path
       FROM referral_cases rc
       JOIN reports r ON rc.report_id = r.id
       WHERE rc.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByCounselor(counselorId, { status, limit = 50, offset = 0 } = {}) {
    let query = "SELECT rc.*, r.category, r.severity FROM referral_cases rc JOIN reports r ON rc.report_id = r.id WHERE rc.assigned_counselor_id = $1";
    const conditions = [];
    const values = [counselorId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`rc.status = $${paramIndex++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += ` ORDER BY rc.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findUnassigned({ status, limit = 50, offset = 0 } = {}) {
    let query = "SELECT rc.*, r.category, r.severity FROM referral_cases rc JOIN reports r ON rc.report_id = r.id WHERE rc.assigned_counselor_id IS NULL";
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`rc.status = $${paramIndex++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += ` ORDER BY rc.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  async assignCounselor(caseId, counselorId) {
    const result = await pool.query(
      `UPDATE referral_cases SET assigned_counselor_id = $1 WHERE id = $2 RETURNING *`,
      [counselorId, caseId]
    );
    return result.rows[0];
  },

  async updateStatus(caseId, status, counselorId) {
    let query;
    let values;

    if (status === "under_review") {
      query = `UPDATE referral_cases SET status = $1, first_response_at = COALESCE(first_response_at, NOW()) WHERE id = $2 AND assigned_counselor_id = $3 RETURNING *`;
      values = [status, caseId, counselorId];
    } else if (status === "resolved") {
      query = `UPDATE referral_cases SET status = $1, resolved_at = NOW() WHERE id = $2 AND assigned_counselor_id = $3 RETURNING *`;
      values = [status, caseId, counselorId];
    } else {
      query = `UPDATE referral_cases SET status = $1 WHERE id = $2 AND assigned_counselor_id = $3 RETURNING *`;
      values = [status, caseId, counselorId];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getStats() {
    const total = await pool.query("SELECT COUNT(*) FROM referral_cases");
    const byStatus = await pool.query(
      "SELECT status, COUNT(*) as count FROM referral_cases GROUP BY status"
    );
    const byDistrict = await pool.query(
      "SELECT district, COUNT(*) as count FROM referral_cases GROUP BY district ORDER BY count DESC"
    );
    const byCategory = await pool.query(
      "SELECT r.category, COUNT(*) as count FROM referral_cases rc JOIN reports r ON rc.report_id = r.id GROUP BY r.category ORDER BY count DESC"
    );
    const bySeverity = await pool.query(
      "SELECT r.severity, COUNT(*) as count FROM referral_cases rc JOIN reports r ON rc.report_id = r.id GROUP BY r.severity ORDER BY count DESC"
    );
    const avgResponseTime = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600) as avg_hours
       FROM referral_cases WHERE first_response_at IS NOT NULL`
    );
    const monthlyTrend = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM referral_cases GROUP BY DATE_TRUNC('month', created_at) ORDER BY month DESC LIMIT 12`
    );

    return {
      total: parseInt(total.rows[0].count, 10),
      byStatus: byStatus.rows,
      byDistrict: byDistrict.rows,
      byCategory: byCategory.rows,
      bySeverity: bySeverity.rows,
      avgResponseTime: avgResponseTime.rows[0]?.avg_hours ? parseFloat(parseFloat(avgResponseTime.rows[0].avg_hours).toFixed(1)) : null,
      monthlyTrend: monthlyTrend.rows,
    };
  },
};

module.exports = ReferralCase;
