// script.js - Clean & Complete Version
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

        // NASA Media (Images + YouTube Videos)
        if (data.nasaItems && data.nasaItems.length > 0) {
            html += `<h3>NASA Images & Media</h3>`;

            data.nasaItems.slice(0, 8).forEach(item => {
                const mediaUrl = item.links && item.links[0] ? item.links[0].href : null;
                const title = item.data && item.data[0] ? item.data[0].title : "NASA Media";
                const desc = item.data && item.data[0] ? item.data[0].description : "";

                if (!mediaUrl) return;

                let mediaHTML = "";

                if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
                    let videoId = mediaUrl.split("v=")[1] || mediaUrl.split("/").pop().split("?")[0];
                    mediaHTML = `
                        <iframe width="420" height="236" 
                            src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" allowfullscreen>
                        </iframe>`;
                } 
                else if (mediaUrl.endsWith('.mp4')) {
                    mediaHTML = `<video width="420" controls><source src="${mediaUrl}" type="video/mp4"></video>`;
                } 
                else {
                    mediaHTML = `<img src="${mediaUrl}" width="420" style="border-radius:6px;" alt="${title}">`;
                }

                html += `
                    <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        ${mediaHTML}
                        <p><strong>${title}</strong></p>
                        ${desc ? `<p style="font-size:0.9em;color:#555;">${desc.substring(0,160)}...</p>` : ''}
                    </div>
                `;
            });
        } else {
            html += `<p>No NASA media found.</p>`;
        }

        resultDiv.innerHTML = html;

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}