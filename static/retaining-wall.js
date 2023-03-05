function initPage()
{
    // Wall dimensions
    dropdown('i_side', ['Left', 'Right']);
    input('i_H', {initval:1000, units:'mm'});
    input('i_B', {initval:850, units:'mm'});
    input('i_Db', {initval:250, units:'mm'});
    input('i_Dt', {initval:450, units:'mm'});
    input('i_Bt', {initval:250, units:'mm'});
    input('i_Dw', {initval:190, units:'mm'});
    input('i_offset', {initval:30, units:'mm'});
    
    // Soil properties
    dropdown('i_theory', ['Manual', 'Rankine']);
    input('i_phi', {initval:20, units:'&deg;'});
    input('i_beta', {initval:0, units:'&deg;'});
    input('i_Ka', {initval:0.5});
    input('i_Kp', {initval:2.5});

    // Soil properties
    input('i_gamma', {initval:20, units:'kN/m<sup>2</sup>'});
    input('i_surcharge', {initval:0, units:'kPa'});
    output('o_Ka');
    output('o_Kp');

    // Loading
    output('o_Pa', {units:'kN/m'});
    output('o_Ma', {units:'kNm/m'});
    output('o_Pp', {units:'kN/m'});

    // Wall bending
    input('i_dbw', {initval:16, prefix:'N', align:'left'});
    input('i_spw', {initval:400, units:'mm'});
    input('i_cw', {initval:55, units:'mm'});
    
    // Footing bending
    input('i_dbf', {initval:16, prefix:'N', align:'left'});
    input('i_spf', {initval:400, units:'mm'});
    input('i_cf', {initval:50, units:'mm'});
    
    updatePage();
}

function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure()
{
    document.getElementById('soilFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';


    let side = i_side.value,
        H = i_H.valueAsNumber,
        B = i_B.valueAsNumber,
        Db = i_Db.valueAsNumber,
        Dt = i_Dt.valueAsNumber,
        Bt = i_Bt.valueAsNumber,
        Dw = i_Dw.valueAsNumber,
        offset = i_offset.valueAsNumber,
        beta = i_beta.valueAsNumber,
        dbw = i_dbw.valueAsNumber,
        dbf = i_dbf.valueAsNumber,
        cw = i_cw.valueAsNumber,
        cf = i_cf.valueAsNumber;

    let soilwidth = 400;
    let soilunder = 150;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(0.8*width/B, 0.8*height/(H+Dt));

    const xmap = n => margin.left + sf*n + width/2 - sf*B/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*(H+Dt-soilunder)/2;

    const svg = svgElemAppend(soilFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Backfill
    let bfillpath;
    if (side === 'Left') {
        bfillpath = `M${xmap(offset)} ${ymap(Dt+H)}`
            + `L${xmap(-soilwidth)} ${ymap(Dt+H+soilwidth*Math.tan(beta*Math.PI/180))}`
            + `L${xmap(-soilwidth)} ${ymap(-soilunder+soilwidth)}`
            + `Q${xmap(-soilwidth)} ${ymap(-soilunder)}`
            + ` ${xmap(0)} ${ymap(-soilunder)}`
            + `L${xmap(B)} ${ymap(-soilunder)}`
            + `Q${xmap(B+soilwidth)} ${ymap(-soilunder)}`
            + ` ${xmap(B+soilwidth)} ${ymap(-soilunder+soilwidth)}`
            + `L${xmap(B+soilwidth)} ${ymap(Dt)}`
            + `L${xmap(B)} ${ymap(Dt)}`
            + `L${xmap(B)} ${ymap(Dt-Db)}`
            + `L${xmap(Bt)} ${ymap(Dt-Db)}`
            + `L${xmap(Bt)} ${ymap(0)}`
            + `L${xmap(0)} ${ymap(0)}`
            + `L${xmap(0)} ${ymap(Dt)}`
            + `L${xmap(offset)} ${ymap(Dt)}`
            + `Z`;
    } else if (side === 'Right') {
        bfillpath = `M${xmap(0)} ${ymap(Dt)}`
            + `L${xmap(-soilwidth)} ${ymap(Dt)}`
            + `L${xmap(-soilwidth)} ${ymap(-soilunder+soilwidth)}`
            + `Q${xmap(-soilwidth)} ${ymap(-soilunder)}`
            + ` ${xmap(0)} ${ymap(-soilunder)}`
            + `L${xmap(B)} ${ymap(-soilunder)}`
            + `Q${xmap(B+soilwidth)} ${ymap(-soilunder)}`
            + ` ${xmap(B+soilwidth)} ${ymap(-soilunder+soilwidth)}`
            + `L${xmap(B+soilwidth)} ${ymap(Dt+H+(B+soilwidth-Dw-offset)*Math.tan(beta*Math.PI/180))}`
            + `L${xmap(Dw+offset)} ${ymap(Dt+H)}`
            + `L${xmap(Dw+offset)} ${ymap(Dt)}`
            + `L${xmap(B)} ${ymap(Dt)}`
            + `L${xmap(B)} ${ymap(Dt-Db)}`
            + `L${xmap(Bt)} ${ymap(Dt-Db)}`
            + `L${xmap(Bt)} ${ymap(0)}`
            + `L${xmap(0)} ${ymap(0)}`
            + `Z`;
    }
    svgElemAppend(svg, 'path', {
        class: 'backfill',
        d: bfillpath
    });

    // Footing
    svgElemAppend(svg, 'path', {
        class: 'concrete',
        d: `M${xmap(0)},${ymap(0)}`
            + `L${xmap(0)},${ymap(Dt)}`
            + `L${xmap(B)},${ymap(Dt)}`
            + `L${xmap(B)},${ymap(Dt-Db)}`
            + `L${xmap(Bt)},${ymap(Dt-Db)}`
            + `L${xmap(Bt)},${ymap(0)}`
            + `z`
    });
    // Wall
    svgElemAppend(svg, 'path', {
        class: 'concrete',
        d: `M${xmap(offset)},${ymap(Dt)}`
            + `L${xmap(offset)},${ymap(Dt+H)}`
            + `L${xmap(Dw+offset)},${ymap(Dt+H)}`
            + `L${xmap(Dw+offset)},${ymap(Dt)}`
            + `z`
    });

    // Rebar
    let wallbarpath, footbarpath;
    if (side === 'Left') {
        wallbarpath =
            `M${xmap(cw+dbw/2+offset)},${ymap(Dt+H-cf)}`
            + `L${xmap(cw+dbw/2+offset)},${ymap(Dt+cf)}`;
        footbarpath = 
            `M${xmap(B-cf)},${ymap(Dt-Db+cf+dbf/2)}`
            + `L${xmap(cw+dbf+offset)},${ymap(Dt-Db+cf+dbf/2)}`
            + `L${xmap(cw+dbf+offset)},${ymap(Dt+40*dbf)}`;
    } else if (side === 'Right') {
        wallbarpath =
            `M${xmap(Dw-cw-dbw/2+offset)},${ymap(Dt+H-cf)}`
            + `L${xmap(Dw-cw-dbw/2+offset)},${ymap(cf+4*dbw)}`
            + `Q${xmap(Dw-cw-dbw/2+offset)},${ymap(cf)}`
            + ` ${xmap(Dw-cw-dbw/2-2*dbw+offset)},${ymap(cf)}`
            + `Q${xmap(Dw-cw-dbw/2-4*dbw+offset)},${ymap(cf)}`
            + ` ${xmap(Dw-cw-dbw/2-4*dbw+offset)},${ymap(cf+2*dbw)}`
            + `L${xmap(Dw-cw-dbw/2-4*dbw+offset)},${ymap(cf+4*dbw)}`;
        footbarpath = 
            `M${xmap(B-cf)},${ymap(Dt-cf-dbf/2)}`
            + `L${xmap(cw+dbf/2)},${ymap(Dt-cf-dbf/2)}`
            + `L${xmap(cw+dbf/2)},${ymap(cf)}`;
    }

    svgElemAppend(svg, 'path', {
        class: 'rebar',
        d: wallbarpath
    });
    svgElemAppend(svg, 'path', {
        class: 'rebar',
        d: footbarpath
    });
}

function runCalcs() {
    let gamma = i_gamma.valueAsNumber;
    let Ka = i_Ka.valueAsNumber;
    let Kp = i_Kp.valueAsNumber;
    let z = i_H.valueAsNumber/1000;
    let phi = i_phi.valueAsNumber;
    let beta = i_beta.valueAsNumber;
    let theory = i_theory.value;
    let surcharge = i_surcharge.valueAsNumber;

    // Pressure coefficients
    if (theory === 'Manual') {
        [i_Ka, i_Kp].forEach(x => visible(x, true));
        [i_phi, i_beta, o_Ka, o_Kp].forEach(x => visible(x, false));
    }
    if (theory === 'Rankine') {
        [i_Ka, i_Kp].forEach(x => visible(x, false));
        [i_phi, i_beta, o_Ka, o_Kp].forEach(x => visible(x, true));
        let cosb = Math.cos(beta*Math.PI/180);
        let cosp = Math.cos(phi*Math.PI/180);
        Ka = cosb * (cosb-Math.sqrt(cosb**2-cosp**2)) / (cosb+Math.sqrt(cosb**2-cosp**2));
        Kp = cosb * (cosb+Math.sqrt(cosb**2-cosp**2)) / (cosb-Math.sqrt(cosb**2-cosp**2));
        i_Ka.value = Ka.toPrecision(2);
        i_Kp.vplue = Kp.toPrecision(2);
    }
    o_Ka.value = Ka.toPrecision(2);
    o_Kp.value = Kp.toPrecision(2);

    // Forces
    let Pa_soil = 0.5*Ka*gamma*z**2;
    let Pa_surcharge = Ka*surcharge*z;
    o_Pa.value = (Pa_soil+Pa_surcharge).toPrecision(3);
    o_Ma.value = (Pa_soil*z/3 + Pa_surcharge*z/2).toPrecision(3);
    let Pp = 0.5 * Kp * gamma * z**2;
    o_Pp.value = Pp.toPrecision(3);

}

initPage();
