const express = require("express");

const app = express();

app.use(express.static(__dirname));

app.get("/images-api.nasa.gov", async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        console.log("Searching for:", query);

        const apiResponse = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );

        if (!apiResponse.ok) {
            throw new Error(`NASA API error: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();

        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});