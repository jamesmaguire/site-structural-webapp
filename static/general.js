function eventHandler(event)
{
    if (event.keyCode == 13) {
        updatePage();
    } else {
        setStatusOutofdate();
    }
}

        obj.className = 'PASS';
function setPassFail (obj, threshold = 1) {
    if (obj.valueAsNumber < threshold) {
    } else {
        obj.className = 'FAIL';
    }
}

function sidebarToggle()
{
    var sidebarObj = document.getElementsByClassName("sidebar")[0];
    if (sidebarObj.style.display == "block") {
        sidebarObj.style.display = "none";
    } else {
        sidebarObj.style.display = "block";
    }
}

function setStatusOutofdate()
{
    if (document.getElementById('text-results-window') != null) {
        document.getElementById('text-results-window').innerHTML = "";
    }
    statusbutton.innerHTML = "▶ &nbsp Run analysis";
    statusbutton.className = "status-red";
}

function setStatusUptodate()
{
    statusbutton.innerHTML = "👍 &nbsp Up to date"; // (Thumbs up unicode);
    statusbutton.className = "status-green";
}
