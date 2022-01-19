function convertWorldDataToString() {
    let dataString = "";
    for (let x = 0; x < worldWidth; x++) {
        for (let y = 0; y < worldHeight; y++) {
            for (let z = 0; z < worldWidth; z++) {
                let thisBlock = GetBlockData(x, y, z);

                if (thisBlock != 0) {
                    dataString += x + ',' + y + ',' + z + ',' + thisBlock + ';';
                }
            }
        }
    }

    return dataString;
}


function convertStringToWorldData(str) {
    // Split each group of coordinates by ';'
    let coordArray = str.substring(0, str.length - 1).split(';');

    // Run through each xyz coordinate trio and split by ','
    for (let c = 0; c < coordArray.length; c++) {
        thisCoords = coordArray[c].split(',');

        let x = thisCoords[0];
        let y = thisCoords[1];
        let z = thisCoords[2];
        let ID = thisCoords[3];

        SetBlockData(x, y, z, ID);
    }

    ClearChunks();
    LoadChunks(currChunk, renderDistance);
    UpdateBlockIndexes();
}


function saveTextAsFile(textToSave) {
    fileName = document.getElementById('inputFileNameToSaveAs').value;
    var textToSaveAsBlob = new Blob([textToSave], { type: "text/plain" });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}


function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}


function loadFileAsText() {
    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();

    fileReader.readAsText(fileToLoad, "UTF-8");

    fileReader.onload = function (fileLoadedEvent) {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        document.getElementById("inputTextToSave").value = textFromFileLoaded;

        return textFromFileLoaded;
    }
}
    
    