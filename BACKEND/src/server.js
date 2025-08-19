const express = require('express');
const pool = require('./db/postgres.db')

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Express Starting...")
});

app.get("/users", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users");
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

app.listen(4000, () => {
    console.log("listening to port 4000");
});  