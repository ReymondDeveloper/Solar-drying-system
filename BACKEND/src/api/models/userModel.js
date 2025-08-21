import pool  from "../../database/postgres.db.js";

const User = {
  findAll: async () => {
    const { rows } = await pool.query("SELECT id, name, email FROM users");
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0];
  },

  create: async ({ name, email, password }) => {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password]
    );
    return rows[0];
  },

  updatePassword: async (id, hashedPassword) => {
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);
  },
};

export default User;
