# desume-wasm

From [44670/vba-next-wasm](https://github.com/44670/vba-next-wasm)

## To Add More Games

1. Put to the `.gba` into the `roms` folder.
2. Open `index.html` and find `<div id="select-rom" hidden>` (around line 74)
3. Add a new option like below:
```html
<option value="NAME">NAME</option>
```