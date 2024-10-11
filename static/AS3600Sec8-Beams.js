function initPage()
{
    // Beam parameters
    input('i_B', {initval:200, units:'mm'});
    input('i_D', {initval:400, units:'mm'});
    input('i_nbc', {initval:2});
    input('i_dbc', {initval:16, prefix:'N', align:'left'});
    input('i_nbt', {initval:2});
    input('i_dbt', {initval:16, prefix:'N', align:'left'});
    input('i_nbe', {initval:0});
    input('i_dbe', {initval:16, prefix:'N', align:'left'});
    input('i_dbs', {initval:10, prefix:'N', align:'left'});
    input('i_dbspc', {initval:200});
    input('i_c', {initval:50, units:'mm'});
    output('o_d', {units:'mm'});
    output('o_a', {units:'mm'});
    output('o_Ast', {units:'mm<sup>2</sup>'});
    output('o_Asc', {units:'mm<sup>2</sup>'});

    // Material properties
    input('i_fc', {initval:40, units:'MPa'});
    output('i_ecu');
    output('o_alpha2');
    output('o_gamma');
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_Es', {initval:200, units:'GPa'});
    output('o_esu');

    // Loading
    input('i_Mstar', {initval:50, units:'kNm'});
    input('i_Vstar', {initval:75, units:'kN'});

    // Bending capacity
    output('o_ku');
    output('o_dn', {units:'mm'});
    output('o_Muo', {units:'kNm'});
    output('o_phi');
    output('o_phiMuo', {units:'kNm'});
    output('momentCheck');

    // Min strength
    output('o_Z', {units:'mm<sup>3</sup>'});
    output('o_fctf', {units:'MPa'});
    output('o_Muomin', {units:'kNm'});
    output('momentminCheck');

    // Shear capacity
    input('i_nlegs', {initval:2});
    input('i_alphav', {initval:90, units:'&deg'});
    output('o_Asv', {units:'mm<sup>2</sup>'});
    output('o_Asvmin', {units:'mm<sup>2</sup>'});
    textoutput('o_Asvminreq');
    output('o_epsilonx');
    output('o_thetav', {units:'&deg'});
    output('o_kv');
    output('o_Vuc', {units:'kN'});
    output('o_Vus', {units:'kN'});
    output('o_phiV');
    output('o_phiVumax', {units:'kN'});
    output('o_phiVu', {units:'kN'});
    output('shearCheck');
    output('webCrushCheck');

    // Torsion
    input('i_Tstar', {units:'kNm', initval:0});
    output('o_Acp', {units:'m<sup>2</sup>'});
    output('o_uc', {units:'m'});
    output('o_Tcr', {units:'kNm'});
    textoutput('o_torsionConsidered');
    output('o_Ao', {units:'m<sup>2</sup>'});
    output('o_phiTus', {units:'kNm'});
    output('torsionCheck');

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
    document.getElementById('beamFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    let beam = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        dbe:i_dbe.valueAsNumber,
        dbs:i_dbs.valueAsNumber,
        c:i_c.valueAsNumber,
        dn:o_dn.valueAsNumber,
        nbc:i_nbc.valueAsNumber,
        nbt:i_nbt.valueAsNumber,
        nbe:i_nbe.valueAsNumber,
    };

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/beam.B, height/beam.D);

    const xmap = n => margin.left + sf*n + width/2 - sf*beam.B/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*beam.D/2;

    const svg = svgElemAppend(beamFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Concrete outline
    const beamOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(beam.D)}`
            +` L${xmap(beam.B)},${ymap(beam.D)}`
            +` L${xmap(beam.B)},${ymap(0)} z`,
    });

    // Shade compression zone
    const compZone = svgElemAppend(svg, 'path', {
        class:'shadedzone',
        d: `M${xmap(0)},${ymap(beam.D-beam.dn)}`
            +` L${xmap(beam.B)},${ymap(beam.D-beam.dn)}`
    });

    // Rebar
    const bars = barCoords(beam);
    for (i=0; i<bars.length; i++) {
        if (bars[i].mult === 1) {
            svgElemAppend(svg, 'circle', {
                class:'rebar',
                cx:xmap(bars[i].x),
                cy:ymap(bars[i].y),
                r:sf*bars[i].db/2,
            });
        } else {
            svgElemAppend(svg, 'line', {
                class:'rebardash',
                x1:xmap(beam.c+beam.dbs), x2:xmap(beam.B-beam.c-beam.dbs),
                y1:ymap(bars[i].y), y2:ymap(bars[i].y),
                'stroke-dasharray': (beam.B - 2*beam.c - 2*beam.dbs)/7,
            });
        }
    }

    // Stirrups
    if (beam.dbs > 0) {
        let rs = 3*beam.dbs/2;
        let spath = `M${xmap(beam.c)},${ymap(beam.D-beam.c-rs)}`
            +`Q${xmap(beam.c)},${ymap(beam.D-beam.c)} ${xmap(beam.c+rs)},${ymap(beam.D-beam.c)}`
            +`L${xmap(beam.B-beam.c-rs)},${ymap(beam.D-beam.c)}`
            +`Q${xmap(beam.B-beam.c)},${ymap(beam.D-beam.c)} ${xmap(beam.B-beam.c)},${ymap(beam.D-beam.c-rs)}`
            +`L${xmap(beam.B-beam.c)},${ymap(beam.c+rs)}`
            +`Q${xmap(beam.B-beam.c)},${ymap(beam.c)} ${xmap(beam.B-beam.c-rs)},${ymap(beam.c)}`
            +`L${xmap(beam.c+rs)},${ymap(beam.c)}`
            +`Q${xmap(beam.c)},${ymap(beam.c)} ${xmap(beam.c)},${ymap(beam.c+rs)} Z`;
        rs = beam.dbs/2;
        beam.dbs -= 1;
        spath += `M${xmap(beam.c+beam.dbs)},${ymap(beam.D-beam.c-beam.dbs-rs)}`
            +`Q${xmap(beam.c+beam.dbs)},${ymap(beam.D-beam.c-beam.dbs)} ${xmap(beam.c+beam.dbs+rs)},${ymap(beam.D-beam.c-beam.dbs)}`
            +`L${xmap(beam.B-beam.c-beam.dbs-rs)},${ymap(beam.D-beam.c-beam.dbs)}`
            +`Q${xmap(beam.B-beam.c-beam.dbs)},${ymap(beam.D-beam.c-beam.dbs)} ${xmap(beam.B-beam.c-beam.dbs)},${ymap(beam.D-beam.c-beam.dbs-rs)}`
            +`L${xmap(beam.B-beam.c-beam.dbs)},${ymap(beam.c+beam.dbs+rs)}`
            +`Q${xmap(beam.B-beam.c-beam.dbs)},${ymap(beam.c+beam.dbs)} ${xmap(beam.B-beam.c-beam.dbs-rs)},${ymap(beam.c+beam.dbs)}`
            +`L${xmap(beam.c+beam.dbs+rs)},${ymap(beam.c+beam.dbs)}`
            +`Q${xmap(beam.c+beam.dbs)},${ymap(beam.c+beam.dbs)} ${xmap(beam.c+beam.dbs)},${ymap(beam.c+beam.dbs+rs)} Z` ;
        beam.dbs += 1;
        const stirrup = svgElemAppend(svg, 'path', {
            class:'rebar',
            d:spath,
        });
    }

}

function runCalcs() {
    let beam = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        nbc:i_nbc.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        nbt:i_nbt.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        nbe:i_nbe.valueAsNumber,
        dbe:i_dbe.valueAsNumber,
        dbs:i_dbs.valueAsNumber,
        dbspc:i_dbspc.valueAsNumber,
        c:i_c.valueAsNumber,
    };

    // Beam parameters
    beam.d = beam.D - beam.c - beam.dbs - beam.dbt/2;
    beam.a = beam.c + beam.dbs + beam.dbc/2;
    beam.Ast = beam.nbt*Math.PI*beam.dbt**2/4;
    beam.Asc = beam.nbc*Math.PI*beam.dbc**2/4;
    o_d.value = beam.d;
    o_a.value = beam.a;
    o_Ast.value = (beam.Ast).toFixed(0);
    o_Asc.value = (beam.Asc).toFixed(0);

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
        fsyf:i_fsyf.valueAsNumber,
    };
    steel.esu = steel.fsy/(steel.Es*1000);
    o_esu.value = steel.esu;

    // Bending
    const Mstar = i_Mstar.valueAsNumber;
    let ku = determineku(beam, concrete, steel);
    let dn = beam.d*ku;
    let Muo = momentCapacity(beam, concrete, steel, ku);
    let phi = bendingPhi(ku);
    o_ku.value = (ku).toFixed(3);
    o_dn.value = (dn).toFixed(1);
    o_Muo.value = Muo.toPrecision(3);
    o_phi.value = phi.toFixed(2);
    o_phiMuo.value = (phi*Muo).toPrecision(3);
    momentCheck.value = (Mstar/(phi*Muo)).toFixed(2);
    setPassFail(momentCheck);
    o_ku.parentElement.classList.remove('FAIL');
    if (ku > 0.36 && Mstar > 0.8*phi*Muo) {
        setPassFail(o_ku, 0.36);
    }

    beam.Z = beam.B * beam.d**2 / 6;
    concrete.fctf = 0.6*Math.sqrt(concrete.fc);
    let Muomin = 1.2*beam.Z*concrete.fctf/1000**2;
    o_Z.value = (beam.Z).toPrecision(3);
    o_fctf.value = (concrete.fctf).toPrecision(3);
    o_Muomin.value = (Muomin).toFixed(0);
    momentminCheck.value = (Muomin/Muo).toFixed(2);
    setPassFail(momentminCheck);

    sumCSFforces(0.15, beam, concrete, steel, true);

    // Shear
    const Vstar = i_Vstar.valueAsNumber;
    let bv = beam.B;
    o_bv.value = bv.toFixed(0);
    const dv = Math.max(0.72*beam.D, 0.9*beam.d);
    o_dv.value = dv.toFixed(0);
    let s = beam.dbspc;
    let nlegs = i_nlegs.valueAsNumber;
    const Asv = nlegs*Math.PI*beam.dbs**2/4;
    const Asvmin = 0.08*Math.sqrt(concrete.fc)*bv*s/steel.fsyf;
    const alphav = i_alphav.valueAsNumber;

    const epsilonx = Math.min((Mstar/(dv/1000) + Vstar) / (2*steel.Es*beam.Ast), 3*10**-3);
    const thetav = 29 + 7000*epsilonx;
    let kv;
    let dg = i_dg.valueAsNumber;
    let kdg = concrete.fc <= 65 ? Math.max(32/(16+dg),1.0) : 2.0;
    o_kdg.value = kdg.toFixed(1);
    if (Asv < Asvmin) {
        kv = (0.4/(1+1500*epsilonx))*(1300/(1000+kdg*dv));
    } else {
        kv = 0.4/(1+1500*epsilonx);
    }
    const Vuc = kv*bv*dv*Math.min(8,Math.sqrt(concrete.fc))/1000;

    const radians = a => a*Math.PI/180;
    const cosav = Math.cos(radians(alphav));
    const sinav = Math.sin(radians(alphav));
    const cotav = 1/Math.tan(radians(alphav));
    const cottv = 1/Math.tan(radians(thetav));
    const Vus = (Asv*steel.fsyf*dv/s)*(sinav*cottv + cosav)/1000;

    const Vumax = 0.55*0.9*concrete.fc*bv*dv*((cottv + cotav)/(1 + cottv**2))/1000;
    const Vu = Math.min(Vuc+Vus, Vumax);

    const phiV = Asv > Asvmin ? 0.75 : 0.7;
    if (Vu === Vumax) {phiV = 0.7;}

    o_Asv.value = Asv.toFixed(0);
    o_Asvmin.value = Asvmin.toFixed(0);
    o_thetav.value = thetav.toFixed(1);
    o_epsilonx.value = epsilonx.toFixed(5);
    o_kv.value = kv.toFixed(2);
    o_Vuc.value = Vuc.toFixed(0);
    o_Vus.value = Vus.toFixed(0);
    o_phiV.value = phiV.toFixed(2);
    o_phiVumax.value = (phiV*Vumax).toFixed(0);
    o_phiVu.value = (phiV*Vu).toFixed(0);

    shearCheck.value = (Vstar/(phiV*Vu)).toFixed(2);
    setPassFail(shearCheck);

    // Torsion
    const Tstar = i_Tstar.valueAsNumber;
    const phiT = 0.75;
    const Acp = beam.D*beam.B/1000**2;
    const uc = 2*(beam.D + beam.B)/1000;
    const uh = 2*(beam.D + beam.B - 4*beam.c - 2*beam.dbs)/1000;
    const Tcr = 0.33*Math.sqrt(concrete.fc)*Acp**2/uc*1000;
    Tstar > 0.25*phiT*Tcr
        ? o_torsionConsidered.value = 'Yes'
        : o_torsionConsidered.value = 'No';
    const Aoh = (beam.D-2*beam.c-beam.dbs)*(beam.B-2*beam.c-beam.dbs)/1000**2;
    const Ao = 0.85*Aoh;
    const Asw = Math.PI*beam.dbs**2/4/1000**2;
    const Tus = 2*Ao*Asw*steel.fsyf*cottv/s*1000**2;
    let phiTus = phiT*Tus;
    if (beam.dbs === 0) {phiTus = 0;}

    o_Acp.value = Acp.toFixed(3);
    o_uc.value = uc.toFixed(2);
    o_uh.value = uh.toFixed(2);
    o_Tcr.value = Tcr.toFixed(1);
    o_Aoh.value = Aoh.toFixed(3);
    o_Ao.value = Ao.toFixed(3);
    o_phiTus.value = phiTus.toFixed(1);
    torsionCheck.value = (Tstar/phiTus).toFixed(2);
    setPassFail(torsionCheck);

    // Web crushing check
    const LHS = Math.sqrt((Vstar/(bv*dv/1000**2))**2
                          +(Tstar*uh/(1.7*Aoh**2))**2);
    const RHS = phiT*Vumax/(bv*dv/1000**2);
    webCrushCheck.value = (LHS/RHS).toFixed(2);
    setPassFail(webCrushCheck);

    // Asvmin requirement check
    let ks;
    if (beam.D <= 300) {
        ks = 1;
    } else if (beam.D < 650) {
        ks = (1000-beam.D)/700;
    } else {
        ks = 0.5;
    }
    let Asvminreq = Vstar > ks*phiT*Vuc ? 'Yes' : 'No';
    if (Tstar > 0.25*phiT*Tcr) {Asvminreq='Yes';}
    if (beam.D >= 750) {Asvminreq='Yes';}
    o_Asvminreq.value = Asvminreq;
    if (Asvminreq.value === 'No') {
        o_Asvminreq.parentElement.className = 'outputspan PASS right';
    } else if (Asv >= Asvmin) {
        o_Asvminreq.parentElement.className = 'outputspan PASS right';
    } else {
        o_Asvminreq.parentElement.className = 'outputspan FAIL right';
    }
    if (Asvminreq === 'Yes' && Asvmin >= Asv) {
        setPassFail(o_Asv, threshold=Asvmin, inverse=true);
        o_Asv.parentElement.className = 'outputspan FAIL';
    } else {
        o_Asv.parentElement.className = 'outputspan';
    }

}

// Function that determines bar locations
// Returns array of form: [[x, y, db, multiplier], ...]
// Where x, y = 0, 0 is the bottom left corner
function barCoords(beam) {
    let bars = [];
    let barspc;

    // Bottom bars
    let a = beam.c + beam.dbs + beam.dbt/2;
    if (beam.nbt === 1) {
        bars.push({x:beam.B/2, y:a, db:beam.dbt, mult:1});
    } else if (Number.isInteger(beam.nbt)) {
        for (i=0; i < beam.nbt; i++) {
            let barspc = (beam.B - 2*a)/(beam.nbt-1);
            bars.push({x:a + i*barspc, y:a, db:beam.dbt, mult:1});
        }
    } else {
        bars.push({x:beam.B/2, y:a, db:beam.dbt, mult:beam.nbt});
    }

    // Top bars
    a = beam.c + beam.dbs + beam.dbc/2;
    if (beam.nbc === 1) {
        bars.push({x:beam.B/2, y:beam.D-a, db:beam.dbt, mult:1});
    } else if (Number.isInteger(beam.nbc)) {
        for (i=0; i < beam.nbc; i++) {
            barspc = (beam.B - 2*a)/(beam.nbc-1);
            bars.push({x:a + i*barspc, y:beam.D - a, db:beam.dbc, mult:1});
        }
    } else {
        bars.push({x:a + i*barspc, y:beam.D - a, db:beam.dbc, mult:beam.nbc});
    }

    // Edge bars
    a = beam.c + beam.dbs + beam.dbe/2;
    if (beam.nbc === 1 || beam.nbt === 1) {
        for (i=1; i < beam.nbe+1; i++) {
            barspc = (beam.D - 2*a)/(beam.nbe+1);
            bars.push({x:beam.B/2, y:a + i*barspc, db:beam.dbe, mult:1});
        }
    } else {
        for (i=1; i < beam.nbe+1; i++) {
            barspc = (beam.D - 2*a)/(beam.nbe+1);
            bars.push({x:a, y:a + i*barspc, db:beam.dbe, mult:1});
            bars.push({x:beam.B - a, y:a + i*barspc, db:beam.dbe, mult:1});
        }
    }
    return bars;
}

function determineku(beam, concrete, steel) {
    let incr = 0.1;
    let steps = 10;
    let ku = 0;
    for (let iteration=0; iteration<4; iteration++) {
        for (let testku=ku+incr; testku<ku+(incr*steps); testku+=incr) {
            let sumF = sumCSFforces(testku, beam, concrete, steel);
            if (sumF > 0) {
                ku = testku-incr;
                incr = incr/steps;
                break;
            }
        }
    }
    return ku; 
}

function sumCSFforces(ku, beam, concrete, steel, debug=false) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let Cs = beam.Asc*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, beam.a);
    let Ts = beam.Ast*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, beam.d);
    let barF = 0;
    let bars = barCoords(beam);
    for (i=0; i<bars.length; i++) {
        let A = bars[i].mult * Math.PI*bars[i].db**2/4;
        let y = beam.D - bars[i].y;
        barF += A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, y);
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

function momentCapacity(beam, concrete, steel, ku) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let barM = 0;
    let bars = barCoords(beam);
    for (i=0; i<bars.length; i++) {
        let A = bars[i].mult * Math.PI*bars[i].db**2/4;
        let y = beam.D - bars[i].y;
        let barF = A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, y);
        barM += y*barF;
    }
    let Muo = -(Cc*(concrete.gamma*ku*beam.d/2) + barM)/1000;
    return Muo;
}

function bendingPhi(ku) {
    let phi = 1.24 - 13*ku/12;
    return Math.min(Math.max(phi, 0.65), 0.85);
}

initPage();
