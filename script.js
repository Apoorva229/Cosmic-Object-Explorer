async function get() {
    const query = document.getElementById("searchBox").value.trim();
    const resultDiv = document.getElementById("result");

    if (!query) {
        resultDiv.innerHTML = "<p style='color: red;'>Please enter a search term</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Searching for cosmic information...</p>";

    try {
        const res = await fetch(`/cosmic-objects?q=${encodeURIComponent(query)}`);

        if (!res.ok) {
            throw new Error("Failed to fetch data from server");
        }

        const data = await res.json();

        let html = "";

        // Wikipedia Information
        if (data.info) {
            html += `
                <h2>${data.info.title}</h2>
                
                ${data.info.image ? 
                    `<img src="${data.info.image}" width="320" style="float: right; margin: 10px 0 15px 15px; border-radius: 8px;" alt="${data.info.title}">` 
                    : ''}
                
                <p><strong>About ${data.info.title}:</strong></p>
                <p>${data.info.description}</p>
                <hr style="margin: 20px 0;">
            `;
        } else {
            html += `<h2>${query}</h2><p>No detailed information found.</p>`;
        }

        // NASA Images & Videos
        if (data.nasaItems && data.nasaItems.length > 0) {
            html += `<h3>NASA Images & Media</h3>`;

            data.nasaItems.slice(0, 6).forEach(item => {
                const media = item.links && item.links[0] ? item.links[0].href : null;
                const title = item.data && item.data[0] ? item.data[0].title : "NASA Media";
                const desc = item.data && item.data[0] ? item.data[0].description : "";

                if (media) {
                    html += `
                        <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                            ${media.endsWith('.mp4') || media.includes('video') ? 
                                `<video width="420" controls><source src="${media}" type="video/mp4">Your browser does not support video.</video>` :
                                `<img src="${media}" width="420" alt="${title}" style="border-radius: 6px;">`
                            }
                            <p><strong>${title}</strong></p>
                            ${desc ? `<p style="font-size: 0.95em; color: #555;">${desc.substring(0, 180)}...</p>` : ''}
                        </div>
                    `;
                }
            });
        } else {
            html += `<p>No NASA media found for this search.</p>`;
        }

        resultDiv.innerHTML = html;

    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}