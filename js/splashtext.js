fetch("/lines.json")
.then(res => res.json())
.then(json => {
    document.getElementById("splash").innerHTML = json[Math.floor(Math.random() * json.length)];
}).catch(error => {
    console.log(error);
});
