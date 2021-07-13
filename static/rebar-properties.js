
function updatePage()
{
    printOutput();
    setStatusUptodate();
}

function printOutput()
{
    let db = diameter.valueAsNumber;
    document.getElementById('text-results-window').innerHTML = `<pre>
Rebar diameter, db = ${db} mm
Steel area, Ast    = ${(Math.PI*db**2/4).toFixed(1)} mm^2
Second moment, I   = ${(Math.PI*db**4/64).toExponential(2)} mm^4
                   = ${(Math.PI*db**4/64/1000**4).toExponential(2)} m^4
</pre>`;
}

