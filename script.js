async function search() {
    const query = document.getElementById("searchBox").value;

    const res = await fetch(`http://localhost:3000/search?q=${query}`);
    const data = await res.text();

    document.getElementById("result").innerText = data;
}