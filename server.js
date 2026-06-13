const express = require("express");

const app = express();

app.use(express.static(__dirname));

app.get("/cosmic-objects", async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        console.log("Searching for:", query);

        // NASA Images & Videos
        const nasaRes = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );

        const nasaData = nasaRes.ok ? await nasaRes.json() : null;

        // Wikipedia Summary
        let wikiData = null;
        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            if (wikiRes.ok) {
                wikiData = await wikiRes.json();
            }
        } catch (wikiError) {
            console.log("Wikipedia fetch failed:", wikiError.message);
        }

        res.json({
            query: query,
            info: wikiData ? {
                title: wikiData.title,
                description: wikiData.extract,
                image: wikiData.thumbnail?.source || null
            } : null,
            nasaItems: nasaData?.collection?.items || []
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});