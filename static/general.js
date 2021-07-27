function eventHandler(event)
{
    if (event.keyCode == 13) {
        updatePage();
    } else {
        setStatusOutofdate();
    }
}

function setPassFail (obj, threshold = 1) {
    if (obj.valueAsNumber < threshold) {
        obj.parentElement.className = 'outputspan PASS right';
    } else {
        obj.parentElement.className = 'outputspan FAIL right';
    }
}

function setStatusOutofdate()
{
    if (document.getElementById('text-results-window') != null) {
        document.getElementById('text-results-window').innerHTML = "";
    }
    statusbutton.innerHTML = "▶ &nbsp Solve";
    statusbutton.className = "status-red";
}

function setStatusUptodate()
{
    statusbutton.innerHTML = "▶ &nbsp Up to date"; // (Thumbs up unicode);
    statusbutton.className = "status-green";
}
