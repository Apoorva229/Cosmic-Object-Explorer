console.log("JavaScript loaded");

async function search() {
    console.log("Button clicked");

    const query = document.getElementById("searchBox").value;

    const res = await fetch(`/search?q=${query}`);
    const data = await res.text();

    document.getElementById("result").innerText = data;
}