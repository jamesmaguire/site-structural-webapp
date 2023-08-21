function initPage()
{
    // Slab parameters
    input('i_B', {initval:1000, units:'mm'});
    input('i_D', {initval:200, units:'mm'});
    input('i_dbc', {initval:12, prefix:'N', align:'left'});
    input('i_spcc', {initval:200, units:'mm'});
    output('o_nbc', {units:'bars/m (TOP)'});
    input('i_dbt', {initval:12, prefix:'N', align:'left'});
    input('i_spct', {initval:200, units:'mm'});
    output('o_nbt', {units:'bars/m (BTM)'});
    input('i_c', {initval:30, units:'mm'});
    output('o_d', {units:'mm'});
    output('o_a', {units:'mm'});
    output('o_Ast', {units:'mm<sup>2</sup> (BTM)'});
    output('o_Asc', {units:'mm<sup>2</sup> (TOP)'});
    output('o_reoratio');

    // Tonnage
    output('o_tonnagem2', {units:'kg/m<sup>2</sup>'});
    output('o_tonnagem3', {units:'kg/m<sup>3</sup>'});
    output('o_tonnagem2tw', {units:'kg/m<sup>2</sup>'});
    output('o_tonnagem3tw', {units:'kg/m<sup>3</sup>'});

    // Crack control
    input('i_sigmacp', {initval:0, units:'MPa'});
    output('o_ccrate', {units:'mm<sup>2</sup>/m'});
    output('o_cc0', {units:'mm<sup>2</sup>/m'});
    output('o_cc1', {units:'mm<sup>2</sup>/m'});
    output('o_cc2', {units:'mm<sup>2</sup>/m'});
    output('o_cc3', {units:'mm<sup>2</sup>/m'});

    // Material properties
    input('i_fc', {initval:40, units:'MPa'});
    output('i_ecu');
    output('o_alpha2');
    output('o_gamma');
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_Es', {initval:200, units:'GPa'});
    output('o_esu');
    input('i_steelrho', {initval:7850, units:'kg/m<sup>3</sup>'});

    // Loading
    input('i_Mstar', {initval:30, units:'kNm'});

    // Bending capacity
    output('o_ku');
    output('o_dn', {units:'mm'});
    output('o_Muo', {units:'kNm'});
    output('o_phi');
    output('o_phiMuo', {units:'kNm'});
    output('momentCheck');

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
    document.getElementById('slabFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    let slab = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        c:i_c.valueAsNumber,
        dn:o_dn.valueAsNumber,
        spcc:i_spcc.valueAsNumber,
        spct:i_spct.valueAsNumber,
    };
    if (slab.spcc < slab.dbc) {slab.spcc = slab.dbc; i_spcc.value = slab.dbc;}
    if (slab.spct < slab.dbt) {slab.spct = slab.dbt; i_spct.value = slab.dbt;}
    slab.nbc = slab.B/slab.spcc;
    slab.nbt = slab.B/slab.spct;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/slab.B, height/slab.D);

    const xmap = n => margin.left + sf*n + width/2 - sf*slab.B/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*slab.D/2;

    const svg = svgElemAppend(slabFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Concrete outline
    const slabOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(slab.D)}`
            +` L${xmap(slab.B)},${ymap(slab.D)}`
            +` L${xmap(slab.B)},${ymap(0)} z`,
    });

    // Shade compression zone
    const compZone = svgElemAppend(svg, 'path', {
        class:'shadedzone',
        d: `M${xmap(0)},${ymap(slab.D-slab.dn)}`
            +` L${xmap(slab.B)},${ymap(slab.D-slab.dn)}`
    });

    // Rebar
    const bars = barCoords(slab);
    for (i=0; i<bars.length; i++) {
        if (bars[i].mult === 1) {
            svgElemAppend(svg, 'circle', {
                class:'rebar',
                cx:xmap(bars[i].x),
                cy:ymap(bars[i].y),
                r:sf*bars[i].db/2,
            });
        } else {
            for (let j=0; j<bars[i].mult; j++) {
                svgElemAppend(svg, 'circle', {
                    class:'rebar',
                    cx:xmap(bars[i].y === slab.c + slab.dbt/2 ?
                            j*slab.spct + 0.5*(slab.B-Math.floor(bars[i].mult)*slab.spct) :
                            j*slab.spcc + 0.5*(slab.B-Math.floor(bars[i].mult)*slab.spcc)
                           ),
                    cy:ymap(bars[i].y),
                    r:sf*bars[i].db/2,
                });
            }
        }
    }

}

function runCalcs() {
    let slab = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        spcc:i_spcc.valueAsNumber,
        spct:i_spct.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        c:i_c.valueAsNumber,
    };
    if (slab.spcc < slab.dbc) {slab.spcc = slab.dbc; i_spcc.value = slab.dbc;}
    if (slab.spct < slab.dbt) {slab.spct = slab.dbt; i_spct.value = slab.dbt;}
    slab.nbc = slab.B/slab.spcc;
    slab.nbt = slab.B/slab.spct;
    o_nbc.value = (slab.nbc).toFixed(1);
    o_nbt.value = (slab.nbt).toFixed(1);

    // Slab parameters
    slab.d = slab.D - slab.c - slab.dbt/2;
    slab.a = slab.c + slab.dbc/2;
    slab.Ast = slab.nbt*Math.PI*slab.dbt**2/4;
    slab.Asc = slab.nbc*Math.PI*slab.dbc**2/4;
    o_d.value = slab.d;
    o_a.value = slab.a;
    o_Ast.value = (slab.Ast).toFixed(0);
    o_Asc.value = (slab.Asc).toFixed(0);
    const reoratio = (slab.Ast + slab.Asc)/(slab.B*slab.D);
    o_reoratio.value = reoratio.toFixed(4);

    // Material properties
    let concrete = {
        fc:i_fc.valueAsNumber,
        ecu:0.003,
    };
    concrete.alpha2 = Math.max(0.85-0.0015*concrete.fc, 0.67);
    concrete.gamma = Math.max(0.97-0.0025*concrete.fc, 0.67);
    i_ecu.value = concrete.ecu;
    o_alpha2.value = concrete.alpha2;
    o_gamma.value = concrete.gamma;

    let steel = {
        fsy:i_fsy.valueAsNumber,
        Es:i_Es.valueAsNumber,
    };
    steel.esu = steel.fsy/(steel.Es*1000);
    o_esu.value = steel.esu;

    // Bending
    let ku = determineku(slab, concrete, steel);
    let dn = slab.d*ku;
    let Muo = momentCapacity(slab, concrete, steel, ku);
    let phi = bendingPhi(ku);
    o_ku.value = (ku).toFixed(3);
    o_dn.value = (dn).toFixed(1);
    o_Muo.value = Muo.toPrecision(3);
    o_phi.value = phi.toFixed(2);
    o_phiMuo.value = (phi*Muo).toPrecision(3);
    momentCheck.value = (i_Mstar.valueAsNumber/(phi*Muo)).toFixed(2);
    setPassFail(momentCheck);
    o_ku.parentElement.classList.remove('FAIL');
    if (ku > 0.36 && i_Mstar.valueAsNumber > 0.8*phi*Muo) {
        setPassFail(o_ku, 0.36);
    }

    // Tonnage
    steelrho = i_steelrho.valueAsNumber;
    const tonnagem2 = steelrho*(slab.Ast + slab.Asc)/1000**2;
    const tonnagem3 = tonnagem2/(slab.D/1000);
    o_tonnagem2.value = tonnagem2.toFixed(2);
    o_tonnagem3.value = tonnagem3.toFixed(1);
    o_tonnagem2tw.value = (2*tonnagem2).toFixed(2);
    o_tonnagem3tw.value = (2*tonnagem3).toFixed(1);

    // Crack control
    const ccrate = slab.Ast+slab.Asc;
    o_ccrate.value = ccrate.toFixed(0);
    const ccD = Math.min(i_D.valueAsNumber, 500);
    const sigmacp = i_sigmacp.valueAsNumber;
    const cc0 = Math.max(0, (1.75 - 2.5*sigmacp)*ccD);
    o_cc0.value = cc0.toFixed(0);
    const cc1 = Math.max(0, (1.75 - 2.5*sigmacp)*ccD);
    o_cc1.value = cc1.toFixed(0);
    const cc2 = Math.max(0, (3.5 - 2.5*sigmacp)*ccD);
    o_cc2.value = cc2.toFixed(0);
    const cc3 = Math.max(0, (6.0 - 2.5*sigmacp)*ccD);
    o_cc3.value = cc3.toFixed(0);

    setPassFail(o_cc0, threshold=ccrate, inverse=false);
    setPassFail(o_cc1, threshold=ccrate, inverse=false);
    setPassFail(o_cc2, threshold=ccrate, inverse=false);
    setPassFail(o_cc3, threshold=ccrate, inverse=false);

}

// Function that determines bar locations
// Returns array of form: [[x, y, db, multiplier], ...]
// Where x, y = 0, 0 is the bottom left corner
function barCoords(slab) {
    let bars = [];
    let barspc;

    // Bottom bars
    let a = slab.c + slab.dbt/2;
    let x1 = slab.spct/2;
    if (slab.nbt === 1) {
        bars.push({x:slab.B/2, y:a, db:slab.dbt, mult:1});
    } else if (Number.isInteger(slab.nbt)) {
        for (i=0; i < slab.nbt; i++) {
            bars.push({x:x1 + i*slab.spct, y:a, db:slab.dbt, mult:1});
        }
    } else {
        bars.push({x:slab.B/2, y:a, db:slab.dbt, mult:slab.nbt});
    }

    // Top bars
    a = slab.c + slab.dbc/2;
    x1 = slab.spcc/2;
    if (slab.nbc === 1) {
        bars.push({x:slab.B/2, y:slab.D-a, db:slab.dbt, mult:1});
    } else if (Number.isInteger(slab.nbc)) {
        for (i=0; i < slab.nbc; i++) {
            bars.push({x:x1 + i*slab.spcc, y:slab.D - a, db:slab.dbc, mult:1});
        }
    } else {
        bars.push({x:a + i*barspc, y:slab.D - a, db:slab.dbc, mult:slab.nbc});
    }

    return bars;
}

function determineku(slab, concrete, steel) {
    let incr = 0.1;
    let steps = 10;
    let ku = 0;
    for (let iteration=0; iteration<4; iteration++) {
        for (let testku=ku+incr; testku<ku+(incr*steps); testku+=incr) {
            let sumF = sumCSFforces(testku, slab, concrete, steel);
            if (sumF > 0) {
                ku = testku-incr;
                incr = incr/steps;
                break;
            }
        }
    }
    return ku; 
}

function sumCSFforces(ku, slab, concrete, steel, debug=false) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*slab.d*slab.B/1000;
    let Cs = slab.Asc*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, slab.d, slab.a);
    let Ts = slab.Ast*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, slab.d, slab.d);
    let barF = 0;
    let bars = barCoords(slab);
    for (i=0; i<bars.length; i++) {
        let A = bars[i].mult * Math.PI*bars[i].db**2/4;
        let y = slab.D - bars[i].y;
        barF += A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, slab.d, y);
    }
    return Cc+barF;
}

function steelStrain(ku, ecu, esu, d, y) {
    let e = (ecu/(ku*d))*(ku*d - y);
    if (e < -esu) {
        return -esu;
    } else if (e > esu) {
        return esu;
    } else {
        return e;
    }
}

function momentCapacity(slab, concrete, steel, ku) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*slab.d*slab.B/1000;
    let barM = 0;
    let bars = barCoords(slab);
    for (i=0; i<bars.length; i++) {
        let A = bars[i].mult * Math.PI*bars[i].db**2/4;
        let y = slab.D - bars[i].y;
        let barF = A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, slab.d, y);
        barM += y*barF;
    }
    let Muo = -(Cc*(concrete.gamma*ku*slab.d/2) + barM)/1000;
    return Muo;
}

function bendingPhi(ku) {
    let phi = 1.24 - 13*ku/12;
    return Math.min(Math.max(phi, 0.65), 0.85);
}

initPage();
