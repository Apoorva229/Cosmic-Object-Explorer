const express = require("express");

const app = express();

app.use(express.static(__dirname));

const NASA_KEY = "YOUR_KEY_HERE";

app.get("/horizons", async (req, res) => {
    const query = req.query.q;

    try {
        const response = await fetch(
            `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${query}'`
        );

        const data = await response.json();

        res.json(data);
    }
    catch (error) {
        res.status(500).send("NASA API ERROR");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});