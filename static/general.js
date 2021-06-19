function eventHandler(event)
{
    if (event.keyCode == 13) {
        updatePage();
    } else {
        setStatusOutofdate();
    }
}

function setPassFail (obj) {
    if (obj.valueAsNumber < 1) {
        obj.className = 'PASS';
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
    statusbutton.textContent = "▶ Run analysis";
    statusbutton.className = "status-red";
}

function setStatusUptodate()
{
    statusbutton.textContent = "👍 Up to date"; // (Thumbs up unicode);
    statusbutton.className = "status-green";
}
