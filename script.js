// === NASA Images & Videos (Improved) ===
if (data.nasaItems && data.nasaItems.length > 0) {
    html += `<h3>NASA Images & Media</h3>`;

    data.nasaItems.slice(0, 8).forEach(item => {
        const mediaUrl = item.links && item.links[0] ? item.links[0].href : null;
        const title = item.data && item.data[0] ? item.data[0].title : "NASA Media";
        const desc = item.data && item.data[0] ? item.data[0].description : "";

        if (!mediaUrl) return;

        let mediaHTML = "";

        if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
            // Convert YouTube link to embed
            let videoId = mediaUrl.split("v=")[1] || mediaUrl.split("/").pop();
            videoId = videoId ? videoId.split("&")[0] : "";
            
            mediaHTML = `
                <iframe width="420" height="236" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    title="${title}" frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } 
        else if (mediaUrl.endsWith('.mp4') || mediaUrl.includes('.mp4')) {
            mediaHTML = `
                <video width="420" controls>
                    <source src="${mediaUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } 
        else {
            // For images or other media
            mediaHTML = `<img src="${mediaUrl}" width="420" alt="${title}" style="border-radius: 6px;">`;
        }

        html += `
            <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                ${mediaHTML}
                <p><strong>${title}</strong></p>
                ${desc ? `<p style="font-size: 0.95em; color: #555;">${desc.substring(0, 180)}...</p>` : ''}
            </div>
        `;
    });
} else {
    html += `<p>No NASA media found.</p>`;
}