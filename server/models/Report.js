const pool = require("../config/database");

const Report = {
  async create({ screenshotPath, extractedText, category, severity, guidance, district = null, isAnonymous = true }) {
    const result = await pool.query(
      `INSERT INTO reports (screenshot_path, extracted_text, category, severity, guidance, district, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [screenshotPath, extractedText, category, severity, guidance, district, isAnonymous]
    );
    return result.rows[0];
  },

  async findAll({ status, category, severity, district, limit = 50, offset = 0 } = {}) {
    let query = "SELECT * FROM reports";
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (severity) {
      conditions.push(`severity = $${paramIndex++}`);
      values.push(severity);
    }
    if (district) {
      conditions.push(`district = $${paramIndex++}`);
      values.push(district);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
    return result.rows[0];
  },

  async updateEscalated(id) {
    const result = await pool.query(
      `UPDATE reports SET escalated = TRUE, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async getStats() {
    const total = await pool.query("SELECT COUNT(*) FROM reports");
    const escalated = await pool.query("SELECT COUNT(*) FROM reports WHERE escalated = TRUE");
    const byCategory = await pool.query(
      "SELECT category, COUNT(*) as count FROM reports GROUP BY category ORDER BY count DESC"
    );
    const bySeverity = await pool.query(
      "SELECT severity, COUNT(*) as count FROM reports GROUP BY severity ORDER BY count DESC"
    );
    const byDistrict = await pool.query(
      "SELECT district, COUNT(*) as count FROM reports WHERE district IS NOT NULL GROUP BY district ORDER BY count DESC"
    );
    const monthlyTrend = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM reports GROUP BY DATE_TRUNC('month', created_at) ORDER BY month DESC LIMIT 12`
    );
    const weeklyTrend = await pool.query(
      `SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as count
       FROM reports WHERE created_at > NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('week', created_at) ORDER BY week DESC`
    );

    return {
      total: parseInt(total.rows[0].count, 10),
      escalated: parseInt(escalated.rows[0].count, 10),
      byCategory: byCategory.rows,
      bySeverity: bySeverity.rows,
      byDistrict: byDistrict.rows,
      monthlyTrend: monthlyTrend.rows,
      weeklyTrend: weeklyTrend.rows,
    };
  },
};

module.exports = Report;
