function eventHandler(event)
{
    console.log(event);
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
    var status = document.getElementsByClassName("status")[0];
    status.textContent = "▶ Run analysis";
    status.style.color = "darkred";
}

function setStatusUptodate()
{
    var status = document.getElementsByClassName("status")[0];
    status.textContent = "👍 Up to date"; // (Thumbs up unicode)
    status.style.color = "darkgreen";
}
