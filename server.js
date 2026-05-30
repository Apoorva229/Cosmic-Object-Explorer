const path = require("path");
const express = require("express");
const { exec } = require("child_process");

const app = express();

app.use(express.static(__dirname));
app.get("/horizons", async (req, res) => {
    const url = 
    'https://ssd.jpl.nasa.gov/api/horizons.api=${GxhGUqbmY6wtf9kORBX8jgv97CLfjxRG9kELbGVY}';

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);


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
