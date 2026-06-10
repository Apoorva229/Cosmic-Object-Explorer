const express = require("express");

const app = express();

app.use(express.static(__dirname));

app.get("/images-api.nasa.gov", async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: "No query provided"
        });
    }

    try {
        const response = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );

        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});