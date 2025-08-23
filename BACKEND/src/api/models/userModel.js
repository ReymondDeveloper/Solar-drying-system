import pool from "../../database/postgres.db.js";

const Account = {
  findAll: async () => {
    const { rows } = await pool.query(
      "SELECT id, first_name, last_name, email FROM account"
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      "SELECT id, first_name, last_name, email FROM account WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query(
      "SELECT * FROM account WHERE email = $1",
      [email]
    );
    return rows[0];
  },

  create: async ({ id, first_name, last_name, email, password, role }) => {
    const { rows } = await pool.query(
      "INSERT INTO account (id, first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING first_name, last_name, email, role",
      [id, first_name, last_name, email, password, role]
    );
    return rows[0];
  },

  updatePassword: async (id, hashedPassword) => {
    await pool.query("UPDATE account SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);
  },
};

export default Account;
