const express = require("express");
const {pipeline} = require("@xenova/transformers");
const app = express();
// Static files
app.use(express.static(_dirname));
app.use((req, res, next) => {
    res.setHeader("Access control Allow Origin", "*");
    res.setHeader("Access control Allow Methods", "GET, POST, OPTIONS");
    next();
});
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/indes.html");
});
// Semantic Searching
let embedder = null;
let spaceIndex = [];
async function getEmbedder() {
    if(!embedder){
        console.log("Loading embedding model");
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            quantized : true
        });
    }
    return embedder;
}
async function getEmbedding(text){
    const extractor = await getEmbedder();
    const output = await extractor(text, { pooling: 'mean', normalize: true});
    return Array.from(output.data);
}
function cosineSimilarity(vecA, vecB){
    let dot = 0, magA = 0, magB = 0
    for(let i = 0; i< vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecB[i];
        magB += vecA[i] * vecB[i];
    }
    return dot/ (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}
// Index of space related pages
async function buildSpaceIndex(){
    if(spaceIndex.lenth > 0) return;
    console.log("Building semantic index for space related pages.");
    const spaceTopics = [
        "Space Exploration", "NASA", "International Space Station", "MARS",
        "Moon", "SpaceX", "Astronomy", "Astrophysics", "Exoplanet", "Black Hole",
        "Hubble Space Telescope", "James Webb Space Telescope", "Apollo Program", 
        "Saturn V", "Starlink", "Orbit", "Galaxy", "Milky Way", "Solar System",
        "Andromeda", "Saggitarius A", "Nebulae", "Supenovae", "Sun"
    ];
    for(const topic of spaceTopics){
        try{
            const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
            if (res.ok) {
                const data = await res.json();
                const embedding = await getEmbedding(data.extract || data.title);
                spaceIndex.push({
                    title : data.title,
                    description: data.extract,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
                    embedding : embedding
                });
            }
        } catch (e){
            console.log('Failed to index ${topic}');
        }
    }
    console.log('Indexed ${spaceIndex.length} space topics');
}
// Main API
app.get("/cosmic-objects", async (req, res) => {
    const query = req.query.q?.trim();
    if(!query){
        return res.status(400).json({error: "No query provided"});
    }
    try{
        console.log("Searching for:", query);
        await buildSpaceIndex();
        // NASA Images and Videos
        const nasaRes = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image,video`
        );
        const nasaData = nasaRes.ok? await nasaRes.json() : null;
        // Wikipedia main article
        let wikiData = null;
        try{
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
            );
            if(wikiRes.ok) {
                wikiData = await wikiRes.json();
            }
        } catch(e){
            console.log("Wikipedia fetch failed!");
        }
        // TLE DATA
        let tleData = null;
        try{
            const tleRes = await fetch(
                `https://tle.ivanstanojevic.me/api/tle?search=${encodeURIComponent(query)}`
            );
            if(tleRes.ok){
                const tleJson = await tleRes.json();
                tleData = tleJson.member || [];
            }
        } catch(e){
            console.log("TLE API failed!", e.message);
        }
        // Exoplanet Data
        let exoData = [];
        try{
            const searchTerm = encodeURIComponenet(query);
            const exoURL = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?` +
                `query=select+pl_name,hostname,pl_masse,pl_rade,pl_orbper,sy_dist,disc_year,discoverymethod ` +
                `from+ps+` +
                `where+pl_name+like+'%25${searchTerm}%25'+or+hostname+like+'%25${searchTerm}%25' ` +
                `&format=json`;
                const exoRes = await fetch(exoUrl);
                if(exoRes.ok){
                    exoData = await exoRes.json();
                    exoData = exoData.slice(0,8);
                }
            } catch(e){
                console.log("Exoplanet API failed!");
            }
            // Semantic Search
            let relatedPages = [];
            try{
                const queryEmbedding = await getEmbedding(query);
                relatedPages = spaceIndex
                .map(page => ({
                    ...page,
                    score: cosineSimilarity(queryEmbedding, page.embedding)
                }))
                .sort((a, b) => b.score - a.score)
                .filter(item => item.score > 0.3)
                .slice(0,6)
                .map(({embedding, ...rest}) => rest);
            } catch(e){
                console.log("Semantic search failes!");
            }
            res.json({
                query: query,
                info: wikiData ? {
                    title : wikiData.title,
                    description: wikiData.extract,
                    image: wikiData.thumbnail?.source || null
                } : null,
                nasaItems : nasaData?.collection?.items || [],
                tle: tleData || [],
                exoplanets: exoData || [],
                relatedPages: relatedPages
            });
        } catch(e){
            console.error("Server error!", error);
            res.status(500).json({error: error.message});
        }
});
module.exports = app;
if(require.main === module){
    const port = process.env.PORT || 3000;
    app.listen(port, async () => {
        console.log = (`Server running on http://localhost:${port}`);
        await buildSpaceIndex();
    });
}