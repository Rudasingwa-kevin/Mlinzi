const pool = require("../config/database");

const Report = {
  // Create a new report
  async create({ screenshotPath, extractedText, category, severity, guidance, isAnonymous = true }) {
    const result = await pool.query(
      `INSERT INTO reports (screenshot_path, extracted_text, category, severity, guidance, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [screenshotPath, extractedText, category, severity, guidance, isAnonymous]
    );
    return result.rows[0];
  },

  // Get all reports (for counselor dashboard)
  async findAll({ status, category, severity, limit = 50, offset = 0 } = {}) {
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

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get single report by ID
  async findById(id) {
    const result = await pool.query("SELECT * FROM reports WHERE id = $1", [id]);
    return result.rows[0];
  },

  // Update report status
  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  // Get national analytics — total counts
  async getStats() {
    const total = await pool.query("SELECT COUNT(*) FROM reports");
    const byCategory = await pool.query(
      "SELECT category, COUNT(*) as count FROM reports GROUP BY category ORDER BY count DESC"
    );
    const bySeverity = await pool.query(
      "SELECT severity, COUNT(*) as count FROM reports GROUP BY severity ORDER BY count DESC"
    );
    const byStatus = await pool.query(
      "SELECT status, COUNT(*) as count FROM reports GROUP BY status ORDER BY count DESC"
    );

    return {
      total: parseInt(total.rows[0].count, 10),
      byCategory: byCategory.rows,
      bySeverity: bySeverity.rows,
      byStatus: byStatus.rows,
    };
  },
};

module.exports = Report;
