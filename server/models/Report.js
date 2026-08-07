const pool = require("../config/database");

const Report = {
  async create({ screenshotPath, extractedText, category, severity, confidence, recommendedAction, guidance, channel = "web", district = null, isAnonymous = true }) {
    const result = await pool.query(
      `INSERT INTO reports (screenshot_path, extracted_text, category, severity, confidence, recommended_action, guidance, channel, district, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [screenshotPath, extractedText, category, severity, confidence || null, recommendedAction || "guidance_only", guidance, channel, district, isAnonymous]
    );
    return result.rows[0];
  },

  async findAll({ status, category, severity, district, channel, limit = 50, offset = 0 } = {}) {
    let query = "SELECT * FROM reports";
    const conditions = [];
    const values = [];
    let paramIndex = 1;

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
    if (channel) {
      conditions.push(`channel = $${paramIndex++}`);
      values.push(channel);
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
      `UPDATE reports SET escalated = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE reports SET severity = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async getStats() {
    const total = await pool.query("SELECT COUNT(*) FROM reports");
    const escalated = await pool.query("SELECT COUNT(*) FROM reports WHERE escalated = TRUE");
    const highSeverity = await pool.query("SELECT COUNT(*) FROM reports WHERE severity = 'high'");
    const byCategory = await pool.query(
      "SELECT category, COUNT(*) as count FROM reports GROUP BY category ORDER BY count DESC"
    );
    const bySeverity = await pool.query(
      "SELECT severity, COUNT(*) as count FROM reports GROUP BY severity ORDER BY count DESC"
    );
    const byDistrict = await pool.query(
      "SELECT district, COUNT(*) as count FROM reports WHERE district IS NOT NULL GROUP BY district ORDER BY count DESC"
    );
    const byChannel = await pool.query(
      "SELECT channel, COUNT(*) as count FROM reports GROUP BY channel ORDER BY count DESC"
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
      highSeverity: parseInt(highSeverity.rows[0].count, 10),
      byCategory: byCategory.rows,
      bySeverity: bySeverity.rows,
      byDistrict: byDistrict.rows,
      byChannel: byChannel.rows,
      monthlyTrend: monthlyTrend.rows,
      weeklyTrend: weeklyTrend.rows,
    };
  },
};

module.exports = Report;
