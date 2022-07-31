function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    dropdown('i_class', ["A1", "A2", "B1", "B2", "C1", "C2"]);
    dropdown('i_FRP', [30,60,90,120,180,240]);
    input('i_fc', {initval:40, units:'MPa'});
    input('i_D', {initval:200, units:'mm'});

    dropdown('i_dp', ["12.7 mm", "15.2 mm"], );
    input('i_ducth', {initval:20, units:'mm'});
    output('o_pttc', {units:'mm'});
    output('o_ptbc', {units:'mm'});
    output('o_ptpan', {units:'mm'});

    output('o_ccorrosion', {units:'mm'});
    output('o_afire', {units:'mm'});

    updatePage();
}

function updatePage() {

    const classification = i_class.value;
    const FRP = i_FRP.value;
    const fc = i_fc.valueAsNumber;
    const D = i_D.valueAsNumber;
    const dp = Number(i_dp.value.split(" ")[0]);
    const ductheight = i_ducth.valueAsNumber;

    // Cover for corrosion
    const corrosiontable = {"A1": {20: 20, 25: 20, 32: 20, 40: 20, 50: 20},
                            "A2": {25: 30, 32: 25, 40: 20, 50: 20},
                            "B1": {32: 40, 40: 30, 50: 25},
                            "B1": {32: 40, 40: 30, 50: 25},
                            "B2": {40: 45, 50: 35},
                            "C1": {50: 50},
                            "C2": {50: 65},
                           };
    const ccorrosion = corrosiontable[classification][fc];
    o_ccorrosion.value = ccorrosion;

    // Axis dist for fire
    const afire = {30: 10, 60:15, 90:25, 120:35, 180:45, 240:50}[FRP];
    o_afire.value = afire;

    // PT
    o_pttc.value = ccorrosion;
    o_ptbc.value = 5*Math.floor((Math.max(afire+15+dp/2-ductheight, ccorrosion)-0.01)/5)+5;
    o_ptpan.value = D - 100 - ductheight/2;

    // Bar table
    const bars = [12, 16, 20, 24, 28, 32];
    const cover = bars.map(db => 5*Math.floor((Math.max(afire-db/2, ccorrosion)-0.01)/5)+5);
    bartable.innerHTML = gentable(bars, cover);

    setStatusUptodate();
}

function gentable (bars, cover) {
    let html = "<table>";
    html += "<tr><th>Bar diameter</th><th>Cover</th></tr>";
    for (let row=0; row<bars.length; row++) {
        html += `<tr>`;
        html += `<td>N${bars[row]}</td>`;
        html += `<td>${cover[row]} mm</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}

initPage();
