async function get() {
    const query = document.getElementById("searchBox").value;

    const res = await fetch(`/images-api.nasa.gov?q=${query}`);
    const data = await res.json();

    if (!data.collection.items.length) {
        document.getElementById("result").innerHTML = "No results found";
        return;
    }

    const item = data.collection.items[0];

    const title = item.data[0].title;
    const description = item.data[0].description;
    const image = item.links[0].href;

    document.getElementById("result").innerHTML = `
        <h2>${title}</h2>
        <img src="${image}" width="400">
        <p>${description}</p>
    `;
}