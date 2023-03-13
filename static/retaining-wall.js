function initPage()
{
    // Wall dimensions
    dropdown('i_side', ['Left', 'Right']);
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
    input('i_fsy', {initval:500, units:'MPa'});
    output('o_Ka');
    output('o_Kp');

    // Loading
    input('i_H', {initval:1000, units:'mm'});
    input('i_surcharge', {initval:5, units:'kPa'});
    output('o_Pa', {units:'kN/m'});
    // output('o_Pp', {units:'kN/m'});
    output('o_Ma', {units:'kNm/m'});
    output('o_Mstar', {units:'kNm/m'});

    // Wall bending
    input('i_fc', {initval:20, units:'MPa'});
    input('i_dbw', {initval:16, prefix:'N', align:'left'});
    input('i_spw', {initval:400, units:'mm'});
    input('i_cw', {initval:55, units:'mm'});
    output('o_d', {units:'mm'});
    output('o_alpha');
    output('o_gammac');
    output('o_ku');
    output('o_phiMu', {units:'kNm/m'});
    output('wallMomemntCheck');
    
    // Footing bending
    input('i_fcf', {initval:20, units:'MPa'});
    input('i_dbf', {initval:16, prefix:'N', align:'left'});
    input('i_spf', {initval:400, units:'mm'});
    input('i_cf', {initval:50, units:'mm'});
    output('o_df', {units:'mm'});
    output('o_alphaf');
    output('o_gammacf');
    output('o_kuf');
    output('o_phiMuf', {units:'kNm/m'});
    output('footMomemntCheck');

    // Sliding
    output('o_Rv', {units:'kN/m'});
    output('o_delta', {units:'&deg;'});
    output('o_Ppbase', {units:'kN/m'});
    output('o_Ppkey', {units:'kN/m'});
    output('o_Pp', {units:'kN/m'});
    output('slideCheck');

    // Overturning/bearing
    output('o_MR', {units:'kNm/m'});
    output('overturnCheck');
    input('i_q', {initval:150, units:'kPa'});
    output('o_qSW', {units:'kPa'});
    output('o_qstar', {units:'kPa'});
    output('bearingCheck');
    
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
    // let Pp = 0.5 * Kp * gamma * z**2;
    // o_Pp.value = Pp.toPrecision(3);
    o_Ma.value = (Pa_soil*z/3 + Pa_surcharge*z/2).toPrecision(3);
    const Mstar = (1.25*Pa_soil*z/3 + 1.5*Pa_surcharge*z/2);
    o_Mstar.value = Mstar.toPrecision(3);

    // Wall bending
    const fc = i_fc.valueAsNumber;
    const fsy = i_fsy.valueAsNumber;
    const dbw = i_dbw.valueAsNumber;
    const spw = i_spw.valueAsNumber;
    const Dw = i_Dw.valueAsNumber;
    const cover = i_cw.valueAsNumber;

    const alpha = Math.max(0.85-0.0015*fc, 0.67);
    const gammac = Math.max(0.97-0.0025*fc, 0.67);
    o_alpha.value = alpha.toFixed(2);
    o_gammac.value = gammac.toFixed(2);
    const d = Dw-cover-dbw/2;
    o_d.value = d.toFixed(1);

    const Ast = Math.PI*dbw**2/4 / (spw/1000);
    ku = Ast*fsy / (alpha*fc*1000*gammac*d);
    o_ku.value = ku.toFixed(3);
    const Mu = Ast*fsy * (d - gammac*ku*d/2) /1000**2;
    const phibend = 0.85;
    o_phiMu.value = (phibend*Mu).toPrecision(3);
    wallMomemntCheck.value = (Mstar/(phibend*Mu)).toFixed(2);
    setPassFail(wallMomemntCheck);

    // Footing bending
    const fcf = i_fcf.valueAsNumber;
    const dbf = i_dbf.valueAsNumber;
    const spf = i_spf.valueAsNumber;
    const Db = i_Db.valueAsNumber;
    const cf = i_cf.valueAsNumber;

    const alphaf = Math.max(0.85-0.0015*fcf, 0.67);
    const gammacf = Math.max(0.97-0.0025*fcf, 0.67);
    o_alphaf.value = alphaf.toFixed(2);
    o_gammacf.value = gammacf.toFixed(2);
    const df = Db-cf-dbf/2;
    o_df.value = df.toFixed(1);

    const Astf = Math.PI*dbf**2/4 / (spf/1000);
    kuf = Astf*fsy / (alphaf*fcf*1000*gammacf*df);
    o_kuf.value = kuf.toFixed(3);
    const Muf = Astf*fsy * (df - gammacf*kuf*df/2) /1000**2;
    o_phiMuf.value = (phibend*Muf).toPrecision(3);
    footMomemntCheck.value = (Mstar/(phibend*Muf)).toFixed(2);
    setPassFail(footMomemntCheck);

    // Sliding
    const B = i_B.valueAsNumber;
    const Dt = i_Dt.valueAsNumber;
    const Bt = i_Bt.valueAsNumber;
    const H = i_H.valueAsNumber;
    const offset = i_offset.valueAsNumber;
    const side = i_side.value;
    // Vertical reaction = weight base + weight stem + load on heel
    let Rv;
    if (side === 'Left') {
        Rv = 25*(B*Db + (Dt-Db)*Bt + Dw*H)/1000**2
            + H*offset*gamma/1000**2
            + surcharge*offset/1000;
    } else if (side === 'Right') {
        Rv = 25*(B*Db + (Dt-Db)*Bt + Dw*H)/1000**2
            + H*(B-Dw-offset)*gamma/1000**2
            + surcharge*(B-Dw-offset)/1000;
    }
    o_Rv.value = Rv.toPrecision(3);
    let delta;
    if (theory === 'Manual') {
        delta = (2/3) * 2*(Math.atan(Math.sqrt(Kp))*180/Math.PI - 45);
    }
    if (theory === 'Rankine') {
        delta = 2*i_phi.valueAsNumber/3;
    }
    o_delta.value = delta.toFixed(1);
    let Ppbase = Rv*Math.tan(delta*Math.PI/180);
    o_Ppbase.value = Ppbase.toPrecision(3);
    // Key resistance
    let Ppkey = 0.5*Kp*gamma*(Dt/1000)**2;
    o_Ppkey.value = Ppkey.toPrecision(3);
    let Pp = Ppbase + Ppkey;
    o_Pp.value = Pp.toPrecision(3);
    slideCheck.value = ((Pa_soil+Pa_surcharge)/Pp).toFixed(2);
    setPassFail(slideCheck);

    // Overturning/bearing
    const q = i_q.valueAsNumber;
    const qSW = 25*Db/1000;
    let Ma = (Pa_soil*z/3 + Pa_surcharge*z/2);
    let qstar, MR;
    if (side === 'Left') {
        [o_MR, overturnCheck].forEach(x => visible(x, false));
        [o_qSW].forEach(x => visible(x, true));
        let qresist = Ma / (0.5*B*(2/3)*B/1000**2);
        qstar = qresist + qSW;
    } else if (side === 'Right') {
        [o_MR, overturnCheck].forEach(x => visible(x, true));
        [o_qSW].forEach(x => visible(x, false));
        // Resisting moment
        let Mfoot = qSW*B*B/2/1000**2;
        let Mwall = 25*H*Dw*(offset+Dw/2)/1000**3;
        let Msoil = (B-(B-Dw-offset)/2)*H*(B-Dw-offset)*gamma/1000**3;
        let MR = Mfoot + Msoil + Mwall;
        o_MR.value = MR.toPrecision(3);
        overturnCheck.value = (Ma/MR).toFixed(2);
        setPassFail(overturnCheck);
        // Bearing
        let x = (MR - Ma)/Rv;
        let e = (B/1000)/2 - x;
        console.log(x, e);
        x > (B/1000)/3
            ? qstar = (2/3)*Rv/x
            : qstar = Rv/(B/1000) * (1+(6*e/(B/1000)));
    }
    o_qSW.value = qSW.toPrecision(3);
    o_qstar.value = qstar.toPrecision(3);
    bearingCheck.value = (qstar/q).toFixed(2);
    setPassFail(bearingCheck);

}

initPage();
