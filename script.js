console.log("JavaScript loaded");

async function gethorizon() {
    const response = await fetch("horizons");
    const data = await response.json();
    console.log(data);

    const query = document.getElementById("searchBox").value;

    const res = await fetch(`/horizons?q=${query}`);
    const data = await res.json();

    document.getElementById("result").innerText = data;
}