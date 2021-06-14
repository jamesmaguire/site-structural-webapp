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
