async function get() {
    const query = document.getElementById("searchBox").value.trim();

    if (!query) {
        document.getElementById("result").innerHTML = "Please enter a search term";
        return;
    }

    try {
        const res = await fetch(`/images-api.nasa.gov?q=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
            throw new Error("Search request failed");
        }

        const data = await res.json();

        if (!data.collection || !data.collection.items.length) {
            document.getElementById("result").innerHTML = "No results found";
            return;
        }

        const item = data.collection.items[0];
        const title = item.data[0]?.title || "No title";
        const description = item.data[0]?.description || "No description available";
        const image = item.links?.[0]?.href;

        document.getElementById("result").innerHTML = `
            <h2>${title}</h2>
            ${image ? `<img src="${image}" width="400" alt="${title}">` : ''}
            <p>${description}</p>
        `;
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerHTML = `Error: ${error.message}`;
    }
}