const express = require("express");

const app = express();

// Serve static files
app.use(express.static(__dirname));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Main API route
app.get("/cosmic-objects", async (req, res) => {
    const query = req.query.q?.trim();

    if (!query) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        console.log("Searching for:", query);

        // 1. NASA Images & Videos
        const nasaRes = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );
        const nasaData = nasaRes.ok ? await nasaRes.json() : null;

        // 2. Wikipedia
        let wikiData = null;
        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            if (wikiRes.ok) {
                wikiData = await wikiRes.json();
            }
        } catch (e) {
            console.log("Wikipedia fetch failed");
        }

        // 3. TLE (Satellites)
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
            console.log("TLE API failed:", e.message);
        }

        // 4. EXOPLANET DATA 
        let exoData = [];
        try {
            const searchTerm = encodeURIComponent(query);
            
            const exoUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?` +
                `query=select+pl_name,hostname,pl_masse,pl_rade,pl_orbper,sy_dist,disc_year,discoverymethod ` +
                `from+ps+` +
                `where+pl_name+like+'%25${searchTerm}%25'+or+hostname+like+'%25${searchTerm}%25' ` +
                `&format=json`;

            const exoRes = await fetch(exoUrl);
            
            if (exoRes.ok) {
                exoData = await exoRes.json();
                // Limit results to avoid huge responses
                exoData = exoData.slice(0, 8);
            }
        } catch (e) {
            console.log("Exoplanet API failed:", e.message);
        }

        res.json({
            query: query,
            info: wikiData ? {
                title: wikiData.title,
                description: wikiData.extract,
                image: wikiData.thumbnail?.source || null
            } : null,
            nasaItems: nasaData?.collection?.items || [],
            tle: tleData || [],
            exoplanets: exoData || []
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}