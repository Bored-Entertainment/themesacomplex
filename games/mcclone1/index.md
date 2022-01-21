---
layout: game
title: "Minecraft Clone"
---
<div>

    <canvas id="frontBuffer" width="360" height="240" style="background-color: #85d8ed; float:left; width: 1080px; height: 720px;"></canvas>

    <div>
        <ul id="timerStat" style="color: white; list-style-type:none; display:table;">
            Time:
        </ul>

        <ul id="fpsStat" style="color: white; list-style-type:none; display:table;">
            FPS:
        </ul>

        <br>

        <ul id="blockInHandStat" style="color: white; list-style-type:none; display:table;">
            Block in Hand:
        </ul>

        <br>

        <ul id="testStat" style="color: white; list-style-type:none; display:table;"> </ul>

        <ul id="seedStat" style="color: white; list-style-type:none; display:table;"></ul>

        <ul id="hierarchy" style="color: white; list-style-type:none; display:table;"></ul>
    </div>

</div>


<div>
    <table>
        <tr>
            <td>Text to Save:</td>
        </tr>
        <tr>
            <td colspan="3">
                <textarea id="inputTextToSave" cols="80" rows="25"></textarea>
            </td>
        </tr>
        <tr>
            <td>Filename to Save As:</td>
            <td>
                <input id="inputFileNameToSaveAs"></input>
            </td>
            <td><button onclick="saveTextAsFile(convertWorldDataToString())">Save Text to File</button></td>
        </tr>
        <tr>
            <td>Select a File to Load:</td>
            <td><input type="file" id="fileToLoad"></td>
            <td><button onclick="convertStringToWorldData(loadFileAsText())">Load Selected File</button>
            <td>
        </tr>
    </table>
</div>
