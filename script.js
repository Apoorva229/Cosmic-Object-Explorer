document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("messageInput");
    
    if (input) {
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();        // Prevent default behavior
                get();                     // Call your search function
            }
        });

        input.focus();{

        }
    }
    });
async function get() {
    const query = document.getElementById("messageInput").value.trim();
         const resultDiv = document.getElementById("result");
    if (!query) {
        resultDiv.innerHTML = `<p style="color: red;">Please enter a search term</p>`;
        return;
    }

    resultDiv.innerHTML = `<p>Searching for "${query}"...</p>`;

    try {
        const res = await fetch(`/cosmic-objects?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        let html = "";

        // Wikipedia
        if (data.info) {
            html += `
                <h2>${data.info.title}</h2>
                ${data.info.image ? `<img src="${data.info.image}" width="300" style="float:right; margin:10px 0 15px 15px; border-radius:8px;" alt="${data.info.title}">` : ''}
                <p>${data.info.description || "No description available."}</p>
                <hr>
            `;
        } else {
            html += `<h2>${query}</h2><p>No summary found.</p><hr>`;
        }

        // ORBITAL DATA (Satellites)
        if (data.tle?.length > 0) {
            html += `<h3>🛰️ Orbital Information</h3>`;
            
            data.tle.slice(0, 3).forEach(sat => {
                const tle2 = sat.line2 ? sat.line2.split(/\s+/) : [];
                
                const inclination = tle2[2] || 'N/A';
                const eccentricity = parseFloat(tle2[4] || 0).toFixed(6);
                const meanMotion = tle2[7] ? parseFloat(tle2[7]).toFixed(4) : 'N/A';
                const period = meanMotion !== 'N/A' ? (1440 / meanMotion).toFixed(1) : 'N/A';

                html += `
                    <div style="margin:15px 0; padding:15px; border:1px solid #4a90e2; border-radius:10px; background:#0f172a;">
                        <h4>${sat.name} <small>(NORAD: ${sat.satelliteId})</small></h4>
                        
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin:12px 0; font-size:0.95em;">
                            <div><strong>Inclination:</strong> ${inclination}°</div>
                            <div><strong>Eccentricity:</strong> ${eccentricity}</div>
                            <div><strong>Orbital Period:</strong> ${period} minutes</div>
                            <div><strong>Mean Motion:</strong> ${meanMotion} rev/day</div>
                        </div>
                        
                        <details style="margin-top:10px;">
                            <summary style="cursor:pointer; color:#60a5fa;">📜 Show Raw TLE Lines</summary>
                            <pre style="font-size:0.82em; background:#1e2937; padding:10px; border-radius:6px; margin-top:8px; overflow-x:auto;">
Line 1: ${sat.line1 || 'N/A'}
Line 2: ${sat.line2 || 'N/A'}
                            </pre>
                        </details>
                    </div>
                `;
            });
            html += `<hr>`;
        } else {
            html += `<p><strong>No orbital data found.</strong><br>Try: ISS, Hubble, Starlink, NOAA</p><hr>`;
        }

        // NASA Media
        if (data.nasaItems?.length > 0) {
            html += `<h3>NASA Images & Videos</h3>`;
            data.nasaItems.slice(0, 6).forEach(item => {
                const link = item.links?.[0]?.href;
                if (!link) return;

                const title = item.data?.[0]?.title || "NASA Media";
                let media = '';

                if (link.includes("youtube") || link.includes("youtu.be")) {
                    const videoId = link.split("v=")[1] || link.split("/").pop().split("?")[0];
                    media = `<iframe width="420" height="236" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                } else if (link.endsWith('.mp4')) {
                    media = `<video width="420" controls><source src="${link}" type="video/mp4"></video>`;
                } else {
                    media = `<img src="${link}" width="420" style="border-radius:6px;" alt="${title}">`;
                }

                html += `
                    <div style="margin:15px 0; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        ${media}
                        <p><strong>${title}</strong></p>
                    </div>
                `;
            });
            html += `<hr>`;
        } else {
            html += `<p>No NASA media found.</p><hr>`;
        }

        // EXOPLANET DATA
        if (data.exoplanets?.length > 0) {
            html += `<h3>🌌 Exoplanet Data</h3>`;
            
            data.exoplanets.slice(0, 6).forEach(planet => {
                const name = planet.pl_name || "Unknown";
                const host = planet.hostname || "Unknown Star";
                const mass = planet.pl_masse ? parseFloat(planet.pl_masse).toFixed(2) + " M<sub>⊕</sub>" : "N/A";
                const radius = planet.pl_rade ? parseFloat(planet.pl_rade).toFixed(2) + " R<sub>⊕</sub>" : "N/A";
                const period = planet.pl_orbper ? parseFloat(planet.pl_orbper).toFixed(2) + " days" : "N/A";
                const distance = planet.sy_dist ? parseFloat(planet.sy_dist).toFixed(1) + " pc" : "N/A";
                const year = planet.disc_year || "N/A";
                const method = planet.discoverymethod || "N/A";

                html += `
                    <div style="margin:15px 0; padding:15px; border:1px solid #22c55e; border-radius:10px; background:#0f172a;">
                        <h4>${name} <small>around ${host}</small></h4>
                        
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin:12px 0; font-size:0.95em;">
                            <div><strong>Mass:</strong> ${mass}</div>
                            <div><strong>Radius:</strong> ${radius}</div>
                            <div><strong>Orbital Period:</strong> ${period}</div>
                            <div><strong>Distance:</strong> ${distance}</div>
                            <div><strong>Discovered:</strong> ${year}</div>
                            <div><strong>Method:</strong> ${method}</div>
                        </div>
                    </div>
                `;
            });
            html += `<hr>`;
        } else {
            html += `<p><strong>No exoplanet data found.</strong><br>Try: <strong>Proxima Centauri b</strong>, <strong>TRAPPIST-1</strong>, <strong>Kepler-452 b</strong>, or <strong>TOI-700 d</strong></p><hr>`;
        }

        resultDiv.innerHTML = html;

    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
}
