
function initPage()
{
    // Soil properties
    dropdown('i_theory', ['Manual', 'Rankine']);
    input('i_phi', {initval:20, units:'&deg;'});
    input('i_beta', {initval:0, units:'&deg;'});
    input('i_Ka', {initval:0.5});
    input('i_Kp', {initval:2.5});

    // Geometry
    input('i_gamma', {initval:20, units:'kN/m<sup>2</sup>'});
    input('i_z', {initval:5, units:'m'});
    input('i_surcharge', {initval:0, units:'kPa'});

    // Outputs
    output('o_Ka');
    output('o_Kp');
    output('o_Pa', {units:'kN/m'});
    output('o_Ma', {units:'kNm/m'});
    output('o_Pp', {units:'kN/m'});
    
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

    let z = i_z.valueAsNumber;
    let beta = i_beta.valueAsNumber;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(0.8*width/z, 0.8*height/z);

    const xmap = n => margin.left + sf*n + width/2;
    const ymap = n => margin.top  - sf*n + height/2 + (1/0.8)*sf*z/2;

    const svg = svgElemAppend(soilFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Backfill
    svgElemAppend(svg, 'path', {
        class:'backfill',
        d: `M${xmap(0)},${ymap(z)}`
            +` L${xmap(-2*z)},${ymap(z + 2*z*Math.tan(beta*Math.PI/180))}`
            +` L${xmap(-2*z)},${ymap(-2*z)}`
            +` L${xmap(2*z)},${ymap(-2*z)}`
            +` L${xmap(2*z)},${ymap(0)}`
            +` L${xmap(0)},${ymap(0)}`
    });

    // Load
    svgElemAppend(svg, 'path', {
        class:'shadedload',
        d: `M${xmap(0)},${ymap(z)}`
            +` L${xmap(0)},${ymap(0)}`
            +` L${xmap(-0.5*z)},${ymap(0)} z`
    });
    let arrowsize = 0.01*z;
    svgElemAppend(svg, 'path', {
        class:'loadarrow',
        d: `M${xmap(-0.3*z)},${ymap(z/3 + 0.3*z*Math.tan(beta*Math.PI/180))}`
            +` L${xmap(0)},${ymap(z/3)}`
            +` L${xmap(-arrowsize)},${ymap(z/3 + arrowsize)}`
            +` L${xmap(-arrowsize)},${ymap(z/3 - arrowsize)}`
            +` L${xmap(0)},${ymap(z/3)}`
    });

    // Wall
    let wallwidth = 0.05*z;
    svgElemAppend(svg, 'path', {
        class:'concretewall',
        d: `M${xmap(0)},${ymap(z)}`
            +` L${xmap(0)},${ymap(-z)}`
            +` L${xmap(wallwidth)},${ymap(-z)}`
            +` L${xmap(wallwidth)},${ymap(z)} z`
    });

}

function runCalcs() {
    let gamma = i_gamma.valueAsNumber;
    let Ka = i_Ka.valueAsNumber;
    let Kp = i_Kp.valueAsNumber;
    let z = i_z.valueAsNumber;
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
