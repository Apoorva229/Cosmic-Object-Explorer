const express = require("express");

const app = express();

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// 
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html"); 
});

// Existing API route
app.get("/cosmic-objects", async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        console.log("Searching for:", query);

        const nasaRes = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );

        const nasaData = nasaRes.ok ? await nasaRes.json() : null;

        let wikiData = null;
        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            if (wikiRes.ok) {
                wikiData = await wikiRes.json();
            }
        } catch (e) {
            console.log("Wikipedia failed");
        }
        // 3. TLE API (Fixed)
let tleData = [];
try {
    const tleRes = await fetch(
        `https://tle.ivanstanojevic.me/api/tle?search=${encodeURIComponent(query)}`
    );
    
    if (tleRes.ok) {
        const tleJson = await tleRes.json();
        tleData = tleJson.member || [];
    }
} catch (e) {
    console.log("TLE API fetch failed:", e.message);
}

        res.json({
            query: query,
            info: wikiData ? {
                title: wikiData.title,
                description: wikiData.extract,
                image: wikiData.thumbnail?.source || null
            } : null,
            nasaItems: nasaData?.collection?.items || [],
            tle: tleData || []
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;

// Local development only
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}