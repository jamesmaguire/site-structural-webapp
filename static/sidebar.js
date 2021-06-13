function sidebarToggle()
{
    var sidebarObj = document.getElementsByClassName("sidebar")[0];
    if (sidebarObj.style.display == "block") {
        sidebarObj.style.display = "none";
    } else {
        sidebarObj.style.display = "block";
    }
}
