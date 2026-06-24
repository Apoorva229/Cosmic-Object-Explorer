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
})