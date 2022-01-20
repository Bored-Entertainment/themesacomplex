# dosbox-online

From: [Bored-Entertainment/dosbox-online](https://github.com/Bored-Entertainment/dosbox-online)

## To Add More Games

1. Put to the `.zip` into the `softs` folder.
2. Open `index.html` and find `var softs = {` (around line 74)
3. Write a new object like below:
```js
NAME: {
    file: 'softs/NAME.zip',
    cmd: 'NAME/NAME.exe',
    pointer: true
}
```