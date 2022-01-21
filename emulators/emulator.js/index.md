---
layout: game
title: "Emulator.JS"
---

    <script>
	window.addEventListener('load', function() {
	  document.getElementById('file').onchange = function(e) {
	    var gameUrl = URL.createObjectURL(new Blob([e.target.files[0]]))
		var extension = e.target.files[0].name.split('.').pop()
		var gameName = e.target.files[0].name.replaceAll("'", "\\'")
		var gameName = gameName.substr(0, gameName.length - extension.length - 1)
		e.target.remove()
		document.body.innerHTML = ''
		if (['fds', 'nes', 'unif', 'unf'].includes(extension)) {
		    var core = 'nes';
		} else if (['z64'].includes(extension)) {
		    var core = 'n64';
		} else if (['smc', 'fig', 'sfc', 'gd3', 'gd7', 'dx2', 'bsx', 'swc'].includes(extension)) {
		    var core = 'snes';
		} else if (['nds'].includes(extension)) {
		    var core = 'nds';
		} else if (['gba'].includes(extension)) {
		    var core = 'gba';
		}else if (['vb'].includes(extension)) {
		    var core = 'vb';
		} else if (['bin','cue','img','mdf','pbp','toc','cbn','m3u','ccd'].includes(extension)) {
		    var core = 'psx';
		}else if (['gb'].includes(extension)) {
		    var core = 'gb';
		} else {
		    var core = prompt('Input core (examples: nes, snes, n64, gb, gba, psx, vb)');
		};
		var a = document.createElement('div');
		a.style = "width:640px;height:480px;max-width:100%";
		var b = document.createElement('div');
		b.id = 'game';
		a.appendChild(b);
		document.body.appendChild(a);
		var script = document.createElement('script');
		script.innerHTML = "EJS_player = '#game'; EJS_gameName = '" + gameName + "'; EJS_biosUrl = ''; EJS_gameUrl = '" + gameUrl + "'; EJS_core = '" + core + "'; EJS_pathtodata = 'data/'; ";
		document.body.appendChild(script);
		var script = document.createElement('script');
		script.src = 'data/loader.js';
		document.body.appendChild(script);
      }
    })
    </script>
    Select Game Rom: <input type="file" id="file">


<h3>Systems:</h3>
<p>NES, SNES, Virtual Boy, N64, GameBoy, GameBoy Color, GameBoy Advance, NDS, and PS1</p>
