function indexFilter() {
    // Variables
    var input, filter, h3, h4, applink, a, i, txtValue;
    input = document.getElementById('filterInput');
    filter = input.value.toUpperCase();
    h4 = document.getElementsByTagName("h4");
    h3 = document.getElementsByTagName("h3");

    // Loop through all list items, and hide those who don't match the search query
    for (n = 0; n < h4.length; n++) {
        applink = h4[n].getElementsByTagName('a');
        for (i = 0; i < applink.length; i++) {
            a = applink[i];
            txtValue = a.textContent || a.innerText;
            console.log(txtValue, txtValue.toUpperCase().indexOf(filter));
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                a.parentElement.style.display = "";
            } else {
                a.parentElement.style.display = "none";
            }
        }
    }

    // If filter has text, hide h3 elements
    for (i = 0; i < h3.length; i++) {
        if (filter.length !== 0) {
            h3[i].style.display = "none";
        } else {
            h3[i].style.display = "";
        }
    }
}
