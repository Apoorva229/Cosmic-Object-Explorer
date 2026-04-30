const express = require("express");
const { exec } = require("child_process");

const app = express();

app.get("/search", (req, res) => {
    const query = req.query.q;

    exec(`./cosmos cosmos.csv "${query}"`, (error, stdout, stderr) => {
        if (error) {
            res.send("Error running program");
            return;
        }
        res.send(stdout);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
