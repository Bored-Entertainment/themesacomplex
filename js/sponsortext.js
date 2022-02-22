fetch("/sponsor.json")
.then(res => res.json())
.then(json => {
    document.getElementById("sponsor").innerHTML = json[Math.floor(Math.random() * json.length)];
}).catch(error => {
    console.log(error);
});
