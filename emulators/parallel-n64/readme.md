# N64 Wasm

From [nbarkhina/N64Wasm](https://github.com/nbarkhina/N64Wasm)

Thanks for checking out N64 Wasm! An N64 emulator that runs in the browser. It is a port of the excellent RetroArch ParaLLEl Core to WebAssembly. This project started because I wanted to have a well playing open-source N64 emulator designed for the web. I also wanted to learn OpenGL and this was a good way to dive in. Game compatibility is decent with a good portion of the 3D games playable and at full speed on a mid-range computer - Mario 64, Ocarina of Time etc... There is currently an issue with some 2D games such as Dr Mario 64 and Pokemon Puzzle League which I am still investigating. I also tested on the iPhone 13 Pro and Xbox Series X Browser and it works great.

Supports the following features -
- Gamepad Support (Xbox and PS4 Controller tested)
- Button and Keyboard Remapping
- Save States
  - They save in your browser so you can close and come back later
- Import/Export Save Files (see settings.js)
- Zoom Controls
- Full Screen
- Audio Support
- Cloud Save States (Host your own server)


You can try it here: https://www.neilb.net/n64wasm/

# Hosting
This emulator supports hosting the app yourself with your own rom list. Create a folder called `roms` in the dist\ folder and copy them there. Then go into `romlist.js` and uncomment the code and populate the paths and names of your roms.

```javascript

var ROMLIST = [
    {url:"roms/rom1.z64",title:"Game 1"},
    {url:"roms/rom2.v64",title:"Game 2"},
    {url:"roms/rom3.v64",title:"Game 3"},
];

```
This will then display a dropdown on the UI to select a game

![romlist](https://raw.githubusercontent.com/nbarkhina/N64Wasm/master/screenshots/romlist.PNG)

You can also enable Cloud Save States with some additional configuration. See this [README in Server Folder](https://github.com/nbarkhina/N64Wasm/tree/master/server) for information on how to set that up.

# References
- ParaLLEl N64 Core https://github.com/libretro/parallel-n64