fetch("https://bored-entertainment.github.io/json/lines.json")
.then(res => res.json())
.then(json => {
    document.getElementById("splash").innerHTML = json[Math.floor(Math.random() * json.length)];
}).catch(error => {
    console.log(error);
});

fetch("https://bored-entertainment.github.io/json/sponsor.json")
.then(res => res.json())
.then(json => {
    document.getElementById("sponsor").innerHTML = json[Math.floor(Math.random() * json.length)];
}).catch(error => {
    console.log(error);
});

