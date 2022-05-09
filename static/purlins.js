function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_SDL', {initval:1.0, units:'kPa'});
    input('i_LL', {initval:0.25, units:'kPa'});
    input('i_phiG', {initval:1.2, units:'G'});
    input('i_phiQ', {initval:1.5, units:'Q'});
    output('o_load', {units:'kPa'});

    dropdown('i_type', ["Lysaught CZ",
                        "Lysaught SupaCZ",
                        "Stramit Exacta CZ"]);
    input('i_L', {initval:4500, units:'mm'});
    dropdown('i_spantype', ["Single span",
                            "Double span",
                            "Three span"]);
    output('o_designload', {units:'kN/m'});

    updatePage();
}

function updatePage() {

    const inp = inputs.value;
    console.log(inp);

    const SDL = i_SDL.valueAsNumber;
    const LL = i_LL.valueAsNumber;
    const phiG = i_phiG.valueAsNumber;
    const phiQ = i_phiQ.valueAsNumber;

    const load = phiG*SDL + phiQ*LL;
    o_load.value = load.toPrecision(3);

    const type = i_type.value;
    const spantype = i_spantype.value;
    const L = i_L.valueAsNumber/1000;
    const designload = load*L;
    o_designload.value = designload.toPrecision(3);

    optiontable.innerHTML = gentable(data, L, spantype);

    setStatusUptodate();
}

function gentable (data, length, spantype) {

    let members = Object.keys(data);
    let d = {};
    for (let i=0; i<members.length; i++) {
        let member = members[i];
        let span = data[member].map(m => m.span)
            .filter(l => l > length*1000)
            .reduce((a, b) => Math.min(a, b));
        d[member] = data[member].filter(m => m.span === span)
                     .filter(m => m.spantype === spantype)[0];
    }

    let html = "<table>";
    html += "<tr>";
    html += "<th rowspan='2'>Member</th>";
    html += "<th rowspan='2'>Inward</th>";
    html += "<th colspan='4'>Outward</th></tr>";
    html += "</tr>";

    html += "<tr><th>0</th><th>1</th><th>2</th><th>3</th><th>L/150</th></tr>";
    for (let i=0; i<members.length; i++) {
        let member = members[i];
        html += `<tr>`;
        html += `<td>${member}</td>`;
        html += `<td>${d[member].inward.toFixed(2)}</td>`;
        html += `<td>${d[member].outward0 ? d[member].outward0.toFixed(2) : ""}</td>`;
        html += `<td>${d[member].outward1 ? d[member].outward1.toFixed(2) : ""}</td>`;
        html += `<td>${d[member].outward2 ? d[member].outward2.toFixed(2) : ""}</td>`;
        html += `<td>${d[member].outward3 ? d[member].outward3.toFixed(2) : ""}</td>`;
        html += `<td>${d[member].L150 ? d[member].L150.toFixed(2) : ""}</td>`;
        html += `<td>${d[member].span}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}

const data = {
    "SC10010": [
        {"spantype": "Single span", "span": 2100, "inward": 3.97, "outward0": 3.39, "outward1": 3.97, "outward2": 3.97, "outward3": 3.97, "L150": 3.56},
        {"spantype": "Single span", "span": 2400, "inward": 3.04, "outward0": 2.18, "outward1": 3.04, "outward2": 3.04, "outward3": 3.04, "L150": 2.42},
        {"spantype": "Single span", "span": 2700, "inward": 2.40, "outward0": 1.47, "outward1": 2.40, "outward2": 2.40, "outward3": 2.40, "L150": 1.72},
        {"spantype": "Single span", "span": 3000, "inward": 1.95, "outward0": 1.01, "outward1": 1.95, "outward2": 1.95, "outward3": 1.95, "L150": 1.27},
        {"spantype": "Single span", "span": 3300, "inward": 1.61, "outward0": 0.75, "outward1": 1.59, "outward2": 1.61, "outward3": 1.61, "L150": 0.97},
        {"spantype": "Single span", "span": 3600, "inward": 1.35, "outward0": 0.57, "outward1": 1.21, "outward2": 1.35, "outward3": 1.35, "L150": 0.76},
        {"spantype": "Single span", "span": 3900, "inward": 1.15, "outward0": 0.43, "outward1": 0.93, "outward2": 1.15, "outward3": 1.15, "L150": 0.60},
        {"spantype": "Single span", "span": 4200, "inward": 0.99, "outward1": 0.72, "outward2": 0.99, "outward3": 0.99, "L150": 0.49},
        {"spantype": "Single span", "span": 4500, "inward": 0.87, "outward1": 0.57, "outward2": 0.87, "outward3": 0.87, "L150": 0.40},
        {"spantype": "Single span", "span": 4800, "inward": 0.76, "outward1": 0.46, "outward2": 0.76, "outward3": 0.76, "L150": 0.33},
        {"spantype": "Single span", "span": 5100, "inward": 0.67, "outward2": 0.63, "outward3": 0.67, "L150": 0.28},
        {"spantype": "Single span", "span": 5400, "inward": 0.60, "outward2": 0.52, "outward3": 0.60, "L150": 0.24},
        {"spantype": "Single span", "span": 5700, "inward": 0.54, "outward2": 0.44, "outward3": 0.54, "L150": 0.20},
        {"spantype": "Single span", "span": 6000, "inward": 0.49, "outward3": 0.49, "L150": 0.17},
        {"spantype": "Single span", "span": 6300, "inward": 0.44, "outward3": 0.44, "L150": 0.15},
        {"spantype": "Single span", "span": 6600, "inward": 0.40, "L150": 0.13},
    ],

};
