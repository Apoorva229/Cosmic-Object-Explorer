console.log("JavaScript loaded");

async function gethorizon() {
    const response = await fetch("horizon");
    const data = await response.json();
    console.log(data);

    const query = document.getElementById("searchBox").value;

    const res = await fetch(`/search?q=${query}`);
    const data = await res.text();

    document.getElementById("result").innerText = data;
}