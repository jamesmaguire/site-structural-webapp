function initPage() {

    input('i_L', {initval:3000, units:'mm'});
    input('i_kx', {initval:1.0});
    input('i_ky', {initval:1.0});
    input('i_D', {initval:500, units:'mm'});
    output('o_Ag', {units:'mm<sup>2</sup>'});
    input('i_fc', {initval:32, units:'MPa'});
    input('i_c', {initval:40, units:'mm'});
    output('o_ecu');
    output('o_alpha1');
    output('o_alpha2');
    output('o_gamma');
    input('i_db', {align:'left', prefix:'N', initval:16});
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_nbars', {initval:8});
    output('o_barspc');
    output('o_Ast', {units:'mm<sup>2</mm>'});
    output('o_Astratio', {units:'%'});
    output('o_Es', {units:'GPa'});
    output('o_esu');
    input('i_dbt', {align:'left', prefix:'N', initval:12});
    input('i_tieSpacing', {initval:200, units:'mm'});
    input('i_fsyt', {initval:500, units:'MPa'});
    output('o_minTieSpacing', {units:'mm'});
    output('o_r', {units:'mm'});
    output('o_lambda');
    textoutput('o_shortlong');
    input('i_rhos', {initval:7850, units:'kg/m<sup>3</sup>'});
    output('o_concreteVol', {units:'m<sup>3</sup>'});
    output('o_steelRate', {units:'kg/m<sup>3</sup>'});

    updatePage();

}

function updatePage()
{
    // runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {

    const col = {
        D:i_D.valueAsNumber,
        c:i_c.valueAsNumber,
        db:i_db.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        nbars:i_nbars.valueAsNumber,
    };

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/col.D, height/col.D);
    const xmap = n => margin.left + sf*n + width/2 - sf*col.D/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*col.D/2;

    const canvas = document.getElementById('columnFigure');
    canvas.innerHTML = '';
    const svg = svgElemAppend(canvas, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox: `0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio: "xMidYMid",
    });

    // Concrete
    svgElemAppend(svg, 'circle', {
        'class': 'concrete',
        'cx': xmap(col.D/2),
        'cy': ymap(col.D/2),
        'r': sf*col.D/2,
    });

    // Ties
    if (col.dbt > 0) {
        svgElemAppend(svg, 'circle', {
            'class': 'rebar',
            'cx': xmap(col.D/2),
            'cy': ymap(col.D/2),
            'r': sf*(col.D/2-col.c-2),
        });
        svgElemAppend(svg, 'circle', {
            'class': 'rebar',
            'cx': xmap(col.D/2),
            'cy': ymap(col.D/2),
            'r': sf*(col.D/2 - col.c - col.dbt),
        });
    }

    // Bars
    const coords = barCoords(col);
    for (let i=0; i<coords.length; i++) {
        svgElemAppend(svg, 'circle', {
            'class': 'rebar',
            'cx': xmap(col.D/2+coords[i][0]),
            'cy': ymap(col.D/2+coords[i][1]),
            'r': sf*(col.db/2),
        });
    };

}

function barCoords(col) {
    const coords = [];
    for (let angle=0; angle<2*Math.PI; angle+=2*Math.PI/col.nbars) {
        let x = (col.D/2-col.c-col.dbt-col.db/2) * Math.cos(angle);
        let y = (col.D/2-col.c-col.dbt-col.db/2) * Math.sin(angle);
        coords.push([x, y]);
    }
    return coords;
}

function runCalcs() {

}

initPage();
