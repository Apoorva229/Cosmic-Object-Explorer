// script.js - Clean + User-Friendly TLE Display
async function get() {
    const query = document.getElementById("searchBox").value.trim();
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

        // === IMPROVED TLE SECTION ===
        if (data.tle?.length > 0) {
            html += `<h3>🛰️ Orbital Information</h3>`;
            
            data.tle.slice(0, 3).forEach(sat => {
                html += `
                    <div style="margin:15px 0; padding:15px; border:1px solid #4a90e2; border-radius:10px; background:#0f172a;">
                        <h4>${sat.name} <small>(NORAD ID: ${sat.satelliteId || sat.norad_cat_id})</small></h4>
                        
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin:12px 0;">
                            <div><strong>Inclination:</strong> ${sat.inclination ? sat.inclination.toFixed(2) : 'N/A'}°</div>
                            <div><strong>Eccentricity:</strong> ${sat.eccentricity || 'N/A'}</div>
                            <div><strong>Period:</strong> ${sat.period ? sat.period.toFixed(1) : 'N/A'} minutes</div>
                            <div><strong>Perigee Height:</strong> ${sat.perigee_height ? Math.round(sat.perigee_height) : 'N/A'} km</div>
                            <div><strong>Apogee Height:</strong> ${sat.apogee_height ? Math.round(sat.apogee_height) : 'N/A'} km</div>
                            <div><strong>Mean Motion:</strong> ${sat.mean_motion ? sat.mean_motion.toFixed(4) : 'N/A'} rev/day</div>
                        </div>
                        
                        <details style="margin-top:10px;">
                            <summary style="cursor:pointer; color:#60a5fa;">Show Raw TLE Lines</summary>
                            <pre style="font-size:0.8em; background:#1e2937; padding:10px; border-radius:6px; margin-top:8px; overflow-x:auto;">
Line 1: ${sat.line1}
Line 2: ${sat.line2}
                            </pre>
                        </details>
                    </div>
                `;
            });
            html += `<hr>`;
        } else {
            html += `<p><strong>No orbital data found.</strong><br>Try searching: ISS, Hubble, Starlink, NOAA 19</p><hr>`;
        }

        // NASA Media (kept compact)
        if (data.nasaItems?.length > 0) {
            html += `<h3>NASA Images & Videos</h3>`;
            data.nasaItems.slice(0, 6).forEach(item => {
                const link = item.links?.[0]?.href;
                if (!link) return;

                const title = item.data?.[0]?.title || "NASA Media";
                let media = link.includes("youtube") || link.includes("youtu.be") 
                    ? `<iframe width="420" height="236" src="https://www.youtube.com/embed/${link.split("v=")[1] || link.split("/").pop().split("?")[0]}" frameborder="0" allowfullscreen></iframe>`
                    : link.endsWith('.mp4')
                    ? `<video width="420" controls><source src="${link}" type="video/mp4"></video>`
                    : `<img src="${link}" width="420" style="border-radius:6px;" alt="${title}">`;

                html += `
                    <div style="margin:15px 0; padding:10px; border:1px solid #ddd; border-radius:8px;">
                        ${media}
                        <p><strong>${title}</strong></p>
                    </div>
                `;
            });
        } else {
            html += `<p>No NASA media found.</p>`;
        }

        resultDiv.innerHTML = html;

    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
}