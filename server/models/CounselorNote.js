const pool = require("../config/database");

const CounselorNote = {
  async create({ caseId, counselorId, note }) {
    const result = await pool.query(
      `INSERT INTO counselor_notes (case_id, counselor_id, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [caseId, counselorId, note]
    );
    return result.rows[0];
  },

  async findByCase(caseId) {
    const result = await pool.query(
      `SELECT cn.*, u.full_name as counselor_name
       FROM counselor_notes cn
       JOIN users u ON cn.counselor_id = u.id
       WHERE cn.case_id = $1
       ORDER BY cn.created_at DESC`,
      [caseId]
    );
    return result.rows;
  },
};

module.exports = CounselorNote;
