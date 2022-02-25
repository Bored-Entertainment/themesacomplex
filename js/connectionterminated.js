var playButton = document.getElementById("play");
var pauseButton = document.getElementById("pause");

playButton.onclick = function() {
    music.play();
    playButton.style.visibility = "visible";
    pause.style.visibility = "visible";
    setTimeout(func, 3000)
    pause.style.visibility = "hidden";
  }

