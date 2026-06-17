// script.js - Fixed TLE + Clean Code
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

        // TLE Orbital Data (Fixed)
        if (data.tle?.length > 0) {
            html += `<h3>🛰️ Orbital Data (TLE)</h3>`;
            data.tle.slice(0, 3).forEach(sat => {
                html += `
                    <div style="margin:12px 0; padding:12px; border:1px solid #4a90e2; border-radius:8px; background:#0f172a;">
                        <strong>${sat.name}</strong> <small>(NORAD: ${sat.satelliteId || sat.norad_cat_id})</small>
                        <pre style="font-size:0.82em; background:#1e2937; padding:8px; border-radius:6px; margin:8px 0; overflow-x:auto;">
Line 1: ${sat.line1}
Line 2: ${sat.line2}
                        </pre>
                    </div>
                `;
            });
            html += `<hr>`;
        } else {
            html += `<p><strong>No TLE data found.</strong><br>Try: ISS, Hubble, Starlink, NOAA, etc.</p><hr>`;
        }

        // NASA Media
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