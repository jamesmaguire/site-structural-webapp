
function initPage()
{
    // Column geometry
    input('i_L', {initval:3000, units:'mm'});
    input('i_kx', {initval:1.0});
    input('i_ky', {initval:1.0});
    input('i_Dx', {initval:600, units:'mm'});
    input('i_Dy', {initval:250, units:'mm'});
    input('i_Dvoid', {initval:0, units:'mm'});
    output('o_Ag', {units:'mm<sup>2</sup>'});
    output('o_Avoid', {units:'mm<sup>2</sup>'});
    output('o_Ac', {units:'mm<sup>2</sup>'});

    // Concrete
    input('i_fc', {initval:32, units:'MPa'});
    input('i_c', {initval:40, units:'mm'});
    output('o_cvoid', {units:'mm'});
    output('o_ecu');
    output('o_alpha1');
    output('o_alpha2');
    output('o_gamma');

    // Long steel
    input('i_db', {initval:16, units:'mm'});
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_nbarstop', {initval:3});
    output('o_barspcx', {units:'m'});
    input('i_nbarsside', {initval:3});
    output('o_barspcy', {units:'m'});
    output('o_nbars');
    output('o_Ast', {units:'mm<sup>2</sup>'});
    output('o_Astratio', {units:'%'});
    output('o_Es', {units:'GPa'});
    output('o_esu');

    // Steel ties
    input('i_dbt', {prefix:'N', initval:12, align:'left'});
    input('i_tieSpacing', {initval:200, units:'mm'});
    input('i_fsyt', {initval:500, units:'MPa'});
    output('o_minTieSpacing',{units:'mm'});

    // Column properties
    output('o_rx', {units:'mm'});
    output('o_ry', {units:'mm'});
    output('o_lambdax');
    output('o_lambday');
    output('o_r', {units:'mm'});
    output('o_lambda');

    // Design load
    textoutput('o_shortlong');
    input('i_G', {initval:1000, units:'kN'});
    input('i_Q', {initval:500, units:'kN'});
    input('i_Mx', {initval:0, units:'kNm'});
    input('i_My', {initval:0, units:'kNm'});
    output('o_Nuls', {units:'kN'});
    output('o_deltab');
    output('o_Mstarx', {units:'kNm'});
    output('o_Mstary', {nits:'kNm'});
    // output('o_Nfire', {units:'kN'});
    output('o_beta');

    // Strength design
    output('o_Nc', {units:'kN'});
    output('o_phiNc', {units:'kN'});
    output('o_buckleCheck');
    output('o_Nuo', {units:'kN'});
    output('o_phiNuo', {units:'kN'});
    output('o_squashCheck');
    output('o_phiMux');
    output('o_MxCheck');
    output('o_phiMuy');
    output('o_MyCheck');

    // Rates
    input('i_rhos', {initval:7850, units :'kg/m<sup>3</sup>'});
    output('o_concreteVol', {units:'m<sup>3</sup>'});
    output('o_steelRate', {units:'kg/m<sup>3</sup>'});

    updatePage();
}

function updatePage()
{
    runCalcs();
    drawFigure();
    calcBarParams();
    setStatusUptodate();
}

function drawFigure()
{
    document.getElementById('columnFigure').innerHTML='';
    const col = {
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
        Dvoid:i_Dvoid.valueAsNumber,
        c:i_c.valueAsNumber,
        db:i_db.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        nbarstop:i_nbarstop.valueAsNumber,
        nbarsside:i_nbarsside.valueAsNumber,
    };

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/col.Dx, height/col.Dy);

    const xmap = n => margin.left + sf*n + width/2 - sf*col.Dx/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*col.Dy/2;

    const svg = svgElemAppend(columnFigure, 'svg', {
        width:  width + margin.left + margin.right,
        height:  height + margin.top + margin.bottom,
        viewBox: `0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio: "xMidYMid",
    });

    svgElemAppend(svg, 'path', {
        'class': 'concrete',
        'd': `M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(col.Dy)}`
            +` L${xmap(col.Dx)},${ymap(col.Dy)}`
            +` L${xmap(col.Dx)},${ymap(0)} z`
    });

    const pipe = svgElemAppend(svg, 'circle', {
        'class': 'downpipe',
        'cx': xmap(col.Dx/2),
        'cy': ymap(col.Dy/2),
        'r': sf*col.Dvoid/2,
    });

    const bars = barCoords(col);
    for (i=0; i<bars.length; i++) {
        svgElemAppend(svg, 'circle', {
            'class': 'rebar',
            'cx': xmap(bars[i][0]),
            'cy': ymap(bars[i][1]),
            'r': sf*col.db/2,
        });
    }

    let rs = 3*col.dbt/2;
    let spath = `M${xmap(col.c)},${ymap(col.Dy-col.c-rs)}`
        +`Q${xmap(col.c)},${ymap(col.Dy-col.c)} ${xmap(col.c+rs)},${ymap(col.Dy-col.c)}`
        +`L${xmap(col.Dx-col.c-rs)},${ymap(col.Dy-col.c)}`
        +`Q${xmap(col.Dx-col.c)},${ymap(col.Dy-col.c)} ${xmap(col.Dx-col.c)},${ymap(col.Dy-col.c-rs)}`
        +`L${xmap(col.Dx-col.c)},${ymap(col.c+rs)}`
        +`Q${xmap(col.Dx-col.c)},${ymap(col.c)} ${xmap(col.Dx-col.c-rs)},${ymap(col.c)}`
        +`L${xmap(col.c+rs)},${ymap(col.c)}`
        +`Q${xmap(col.c)},${ymap(col.c)} ${xmap(col.c)},${ymap(col.c+rs)} Z`;
    rs = col.dbt/2;
    col.dbt -= 1;
    spath += `M${xmap(col.c+col.dbt)},${ymap(col.Dy-col.c-col.dbt-rs)}`
        +`Q${xmap(col.c+col.dbt)},${ymap(col.Dy-col.c-col.dbt)} ${xmap(col.c+col.dbt+rs)},${ymap(col.Dy-col.c-col.dbt)}`
        +`L${xmap(col.Dx-col.c-col.dbt-rs)},${ymap(col.Dy-col.c-col.dbt)}`
        +`Q${xmap(col.Dx-col.c-col.dbt)},${ymap(col.Dy-col.c-col.dbt)} ${xmap(col.Dx-col.c-col.dbt)},${ymap(col.Dy-col.c-col.dbt-rs)}`
        +`L${xmap(col.Dx-col.c-col.dbt)},${ymap(col.c+col.dbt+rs)}`
        +`Q${xmap(col.Dx-col.c-col.dbt)},${ymap(col.c+col.dbt)} ${xmap(col.Dx-col.c-col.dbt-rs)},${ymap(col.c+col.dbt)}`
        +`L${xmap(col.c+col.dbt+rs)},${ymap(col.c+col.dbt)}`
        +`Q${xmap(col.c+col.dbt)},${ymap(col.c+col.dbt)} ${xmap(col.c+col.dbt)},${ymap(col.c+col.dbt+rs)} Z` ;
    col.dbt += 1;
    const stirrup = svgElemAppend(svg, 'path', {
        class:'rebar',
        d:spath,
    });

}

function calcBarParams()
{
    const db = i_db.valueAsNumber,
          topbars = i_nbarstop.valueAsNumber,
          sidebars = i_nbarsside.valueAsNumber,
          c = i_c.valueAsNumber,
          dt = i_dbt.valueAsNumber,
          Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber;
    o_barspcx.value = (i_Dx.valueAsNumber - 2*c - 2*dt - db)/(topbars-1);
    o_barspcy.value = (i_Dy.valueAsNumber - 2*c - 2*dt - db)/(sidebars-1);
}

function barCoords(col) {
    let coords = [];

    // Top
    let barspc = (col.Dx-2*(col.c+col.dbt)-col.db)/(col.nbarstop-1);
    let ys = [col.c+col.dbt+col.db/2, col.Dy-col.c-col.dbt-col.db/2];
    for (i=0; i<col.nbarstop; i++) {
        let x = col.c+col.dbt+col.db/2 + (i*barspc);
        for (j in ys) {
            coords.push([x, ys[j]]);
        }
    }

    //Side
    barspc = (col.Dy-2*(col.c+col.dbt)-col.db)/(col.nbarsside-1);
    let xs = [col.c+col.dbt+col.db/2, col.Dx-col.c-col.dbt-col.db/2];
    for (i=1; i<col.nbarsside-1; i++) {
        let y = col.c+col.dbt+col.db/2 + (i*barspc);
        for (j in xs) {
            coords.push([xs[j], y]);
        }
    }

    return coords;
}

function runCalcs() {
    const col = {
        L:i_L.valueAsNumber,
        kx:i_kx.valueAsNumber,
        ky:i_ky.valueAsNumber,
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
        Dvoid:i_Dvoid.valueAsNumber,
        db:i_db.valueAsNumber,
        nbarstop:i_nbarstop.valueAsNumber,
        nbarsside:i_nbarsside.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        c:i_c.valueAsNumber,
    };
    col.nbars = barCoords(col).length;
    col.Ast = col.nbars*Math.PI*col.db**2/4;
    o_nbars.value = col.nbars;
    o_Ast.value = col.Ast.toFixed(0);

    col.Ag = col.Dx * col.Dy;
    o_Ag.value = col.Ag.toFixed(0);
    o_Astratio.value = (100*col.Ast/col.Ag).toFixed(2);
    setPassFail(o_Astratio, 1, inverse=true);

    col.Avoid = Math.PI*col.Dvoid**2/4;
    o_Avoid.value = col.Avoid.toFixed(0);
    col.Ac = col.Ag - col.Avoid;
    o_Ac.value = col.Ac.toFixed(0);

    // Material properties
    const concrete = {
        fc:i_fc.valueAsNumber,
        ecu:0.003,
    };

    col.voidcovertoedge = (Math.min(col.Dx, col.Dy) - col.Dvoid)/2;
    col.voidcovertorebar = col.voidcovertoedge - col.c - col.db - col.dbt;
    o_cvoid.value = col.voidcovertorebar;
 
    concrete.alpha1 = Math.min(Math.max(1.0-0.003*concrete.fc, 0.72), 0.85);
    concrete.alpha2 = Math.max(0.85-0.0015*concrete.fc, 0.67);
    concrete.gamma = Math.max(0.97-0.0025*concrete.fc, 0.67);
    o_ecu.value = concrete.ecu.toFixed(4);
    o_alpha1.value = concrete.alpha1.toFixed(2);
    o_alpha2.value = concrete.alpha2.toFixed(2);
    o_gamma.value = concrete.gamma.toFixed(2);

    const steel = {
        fsy:i_fsy.valueAsNumber,
        Es:200, // GPa
    };
    steel.esu = steel.fsy/(steel.Es*1000);
    o_Es.value = steel.Es;
    o_esu.value = steel.esu;

    // Column properties
    col.ry = 0.3*col.Dy;
    col.rx = 0.3*col.Dx;
    col.rd = 0.25*col.Dia;
    o_rx.value = col.rx.toFixed(1);
    o_ry.value = col.ry.toFixed(1);
    col.lambdax = col.kx * col.L / col.rx;
    col.lambday = col.ky * col.L / col.ry;
    o_lambdax.value = col.lambdax.toFixed(1);
    o_lambday.value = col.lambday.toFixed(1);
    col.r = Math.min(col.rx, col.ry);
    col.lambda = Math.max(col.lambdax, col.lambday);
    o_r.value = col.r.toFixed(1);
    o_lambda.value = col.lambda.toFixed(1);
    if (col.lambda <= 25) {col.class = "short";} else {col.class = "long";}
    o_shortlong.value = "(" + col.class.charAt(0).toUpperCase() + col.class.slice(1) + ")";

    // Design load
    let G = i_G.valueAsNumber;
    let Q = i_Q.valueAsNumber;
    let Nuls = 1.2*G + 1.5*Q;
    let Nfire = 1.0*G + 0.4*Q;
    let beta = G/(G+Q);
    o_Nuls.value = Nuls.toFixed(0);
    o_beta.value = beta.toFixed(3);

    // Buckling load
    let Mcx = MNpointx(0.545, col, concrete, steel)[0];
    let Mcy = MNpointy(0.545, col, concrete, steel)[0];
    let phi = 0.65;
    let axisdist = col.c + col.dbt + col.db/2;
    let Ncx = (Math.PI**2/col.L**2) * (182*(col.Dx-axisdist)*phi*Mcx/(1+beta)) * 1000;
    let Ncy = (Math.PI**2/col.L**2) * (182*(col.Dy-axisdist)*phi*Mcy/(1+beta)) * 1000;
    let Nc = Math.min(Ncx, Ncy);
    col.phiNc = phi*Nc;
    o_Nc.value = Nc.toFixed(0);
    o_phiNc.value = col.phiNc.toFixed(0);
    
    // Design loads
    let km = 0.4; // Moment equal on both ends
    let deltab = Math.max(km/(1-Nuls/Nc), 1); // Moment magnifier (braced col)
    let Mstarx = deltab * Math.max(Nuls * 0.05*col.Dx/1000, i_Mx.valueAsNumber);
    let Mstary = deltab * Math.max(Nuls * 0.05*col.Dy/1000, i_My.valueAsNumber);
    o_deltab.value = deltab.toFixed(2);
    o_Mstarx.value = Mstarx.toFixed(0);
    o_Mstary.value = Mstary.toFixed(0);
    
    // Squash load
    let Nuo = ((col.Ac - col.Ast)*concrete.alpha1*concrete.fc + col.Ast*steel.fsy)/1000;
    let phiNuo = 0.65*Nuo;
    col.phiNuo = phiNuo;
    o_Nuo.value = Nuo.toFixed(0);
    o_phiNuo.value = phiNuo.toFixed(0);

    // Strength design
    o_buckleCheck.value = (Nuls/col.phiNc).toFixed(2);
    setPassFail(o_buckleCheck);
    o_squashCheck.value = (Nuls/phiNuo).toFixed(2);
    setPassFail(o_squashCheck);
    let phiMux = findMNpointx(Nuls, col, concrete, steel)[0];
    o_phiMux.value = phiMux.toFixed(0);
    o_MxCheck.value = (Mstarx/phiMux).toFixed(2);
    setPassFail(o_MxCheck);
    let phiMuy = findMNpointy(Nuls, col, concrete, steel)[0];
    o_phiMuy.value = phiMuy.toFixed(0);
    o_MyCheck.value = (Mstary/phiMuy).toFixed(2);
    setPassFail(o_MyCheck);

    // Load-moment plot (X)
    let purecomp = [0, phiNuo];
    let decompression = MNpointx(1, col, concrete, steel);
    let balance = MNpointx(0.545, col, concrete, steel);
    let purebend = findMNpointx(0, col, concrete, steel);
    let keyPts = [purecomp, decompression, balance, purebend];
    let plotPts = [purecomp, decompression];
    let designxpt = [Mstarx, Nuls];
    for (ku=0.9; ku>0.55; ku-=0.1) {
        plotPts.push(MNpointx(ku, col, concrete, steel));
    }
    plotPts.push(balance);
    for (ku=0.5; ku>0; ku-=0.05) {
        pt = MNpointx(ku, col, concrete, steel);
        if (pt[1] < 0) {break;}
        plotPts.push(pt);
    }
    plotPts.push(purebend);

    // confinement
    plotPts.push([0,0]);
    plotPts.push([0, 0.75*phiNuo]);
    for (let ku=0.999; ku>0; ku-=0.01) {
        pt = MNpointx(ku, col, concrete, steel);
        if(pt[1] < 0.75*phiNuo && pt[1] > 0.65*0.3*col.Ac*concrete.fc/1000) {
            plotPts.push([0.6*pt[0], pt[1]]);
        }
    }
    plotPts.push([phiMux/0.65, 0.65*0.3*col.Ac*concrete.fc/1000]);

    drawPlot('mnxPlot', plotPts, keyPts, designxpt, o_MxCheck.value<1.0);

    // Load-moment plot (Y)
    purecomp = [0, phiNuo];
    decompression = MNpointy(1, col, concrete, steel);
    balance = MNpointy(0.545, col, concrete, steel);
    purebend = findMNpointy(0, col, concrete, steel);
    keyPts = [purecomp, decompression, balance, purebend];
    plotPts = [purecomp, decompression];
    let designypt = [Mstary, Nuls];
    for (ku=0.9; ku>0.55; ku-=0.1) {
        plotPts.push(MNpointy(ku, col, concrete, steel));
    }
    plotPts.push(balance);
    for (ku=0.5; ku>0; ku-=0.05) {
        pt = MNpointy(ku, col, concrete, steel);
        if (pt[1] < 0) {break;}
        plotPts.push(pt);
    }
    plotPts.push(purebend);
    drawPlot('mnyPlot', plotPts, keyPts, designypt, o_MyCheck.value<1.0);

    // Ties
    let tieSpacing = i_tieSpacing.valueAsNumber;
    let minTieSpacing = 0;
    if (concrete.fc <= 50) { // Clause 10.7.4
        let b = 0;
        b = Math.min(col.Dx,col.Dy);
        minTieSpacing = Math.min(b, 15*col.db);
    }
    // TODO: else (fc > 50) (clause 10.7.3.2-10.7.3.4)
    o_minTieSpacing.value = minTieSpacing;
    setPassFail(o_minTieSpacing, tieSpacing, inverse=true);

    // Rates
    let steelDensity = i_rhos.valueAsNumber;
    let tielength = 0;
    tielength = 2*(col.Dx-col.c-col.dbt) + 2*(col.Dy-col.c-col.dbt);
    let longVol = col.Ast*col.L; // mm3
    let tieVol = Math.PI*col.dbt**2/4 * tielength * col.L/tieSpacing; // mm3
    let steelVol = (longVol + tieVol) / 1000**3; // m3
    let steelMass = steelVol * steelDensity; // kg
    let concreteVol = col.Ag*col.L / 1000**3; // m3
    let steelRate = steelMass / concreteVol;
    o_concreteVol.value = concreteVol.toFixed(2);
    o_steelRate.value = steelRate.toFixed(0);

}

function MNpointy(ku, col, concrete, steel) {
    let d = col.Dy - col.c - col.dbt - col.db/2;
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*d*col.Dx/1000;
    let yc = concrete.gamma*ku*d/2;

    let bars = barCoords(col);
    let barForce = [];
    let barMoment = [];
    // Loop over each steel bar
    for (let i=0; i<bars.length; i++) {
        let y = bars[i][1];
        let strain = steel_strain(ku, concrete.ecu, steel.esu, d, y);
        let F = Math.PI*col.db**2/4 * steel.Es*strain;
        if (strain > 0) { // In compression, subtract concrete load
            F -= Math.PI*col.db**2/4 * concrete.alpha2*concrete.fc/1000;
        }
        barForce.push(F);
        barMoment.push(F*y);
    }
    let Nu = Cc + barForce.reduce((a,b)=>a+b);
    let Mu = (Nu*col.Dy/2 - Cc*yc - barMoment.reduce((a,b)=>a+b))/1000;
    let phiN = 0.65;
    let phiM = 0.65*(12/13);
    if (ku < 0.545) {
        let phi = Math.min(Math.max(1.24 - 13*ku/12, 0.65));
        let kphi = 12/13;
        let Nub = MNpointy(0.545, col, concrete, steel)[1] / phiN;
        phiM = 0.65*kphi + ((phi - 0.65*kphi)*(1 - Nu/Nub));
    }
    return [phiM*Mu, phiN*Nu];
}

function MNpointx(ku, col, concrete, steel) {
    let d = col.Dx - col.c - col.dbt - col.db/2;
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*d*col.Dy/1000;
    xc = concrete.gamma*ku*d/2;

    let bars = barCoords(col);
    let barForce = [];
    let barMoment = [];
    // Loop over each steel bar
    for (let i=0; i<bars.length; i++) {
        let x = bars[i][0];
        let strain = steel_strain(ku, concrete.ecu, steel.esu, d, x);
        let F = Math.PI*col.db**2/4 * steel.Es*strain;
        if (strain > 0) { // In compression, subtract concrete load
            F -= Math.PI*col.db**2/4 * concrete.alpha2*concrete.fc/1000;
        }
        barForce.push(F);
        barMoment.push(F*x);
    }
    let Nu = Cc + barForce.reduce((a,b)=>a+b);
    let Mu = (Nu*col.Dx/2 - Cc*xc - barMoment.reduce((a,b)=>a+b))/1000;
    let phiN = 0.65;
    let phiM = 0.65*(12/13);
    if (ku < 0.545) {
        let phi = Math.min(Math.max(1.24 - 13*ku/12, 0.65));
        let kphi = 12/13;
        let Nub = MNpointx(0.545, col, concrete, steel)[1] / phiN;
        phiM = 0.65*kphi + ((phi - 0.65*kphi)*(1 - Nu/Nub));
    }
    return [phiM*Mu, phiN*Nu];
}

function findMNpointx(N, col, concrete, steel) {
    let decompression = MNpointx(1, col, concrete, steel);
    if (N > decompression[1]) {
        // Linear interpolate
        pt1 = [0, col.phiNuo];
        pt2 = decompression;
        slope = (pt2[0]-pt1[0])/(pt1[1]-pt2[1]);
        return [slope*(pt1[1] - N), N];
    } else {
        // Iterate to find N
        let ku= 1;
        for (kutest=ku; kutest>0; kutest -=0.1) {
            let pt = MNpointx(kutest , col, concrete, steel);
            if (pt[1] < N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest <1; kutest +=0.01) {
            let pt = MNpointx(kutest , col, concrete, steel);
            if (pt[1] > N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest >0; kutest -=0.001) {
            let pt = MNpointx(kutest , col, concrete, steel);
            if (pt[1] < N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest <1; kutest +=0.0001) {
            let pt = MNpointx(kutest , col, concrete, steel);
            if (pt[1] > N) {ku = kutest; break;}
        }
        return MNpointx(ku, col, concrete, steel);
    }
}

function findMNpointy(N, col, concrete, steel) {
    let decompression = MNpointy(1, col, concrete, steel);
    if (N > decompression[1]) {
        // Linear interpolate
        pt1 = [0, col.phiNuo];
        pt2 = decompression;
        slope = (pt2[0]-pt1[0])/(pt1[1]-pt2[1]);
        return [slope*(pt1[1] - N), N];
    } else {
        // Iterate to find N
        let ku= 1;
        for (kutest=ku; kutest>0; kutest -=0.1) {
            let pt = MNpointy(kutest , col, concrete, steel);
            if (pt[1] < N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest <1; kutest +=0.01) {
            let pt = MNpointy(kutest , col, concrete, steel);
            if (pt[1] > N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest >0; kutest -=0.001) {
            let pt = MNpointy(kutest , col, concrete, steel);
            if (pt[1] < N) {ku = kutest; break;}
        }
        for (kutest=ku; kutest <1; kutest +=0.0001) {
            let pt = MNpointy(kutest , col, concrete, steel);
            if (pt[1] > N) {ku = kutest; break;}
        }
        return MNpointy(ku, col, concrete, steel);
    }
}

function steel_strain(ku, ecu, esu, d, y) {
    let e = (ecu/(ku*d))*(ku*d - y);
    if (e < -esu) {
        return -esu;
    } else if (e > esu) {
        return esu;
    } else {
        return e;
    }
}

function drawPlot(plotid, points, labelledpts, designpt, pass) {
    
    document.getElementById(plotid).innerHTML='';

    const Ms = points.map(pt => pt[0]),
          Ns = points.map(pt => pt[1]);

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const xmin = 0,
          xmax = Math.max(o_phiMux.valueAsNumber, o_phiMuy.valueAsNumber)*1.8,
          ymin = 0,
          ymax = o_phiNuo.valueAsNumber*1.1,
          dx = xmax - xmin,
          dy = ymax - ymin;

    const xmap = n => (n+xmin)*width/dx + margin.left;
    const ymap = n => (-n+ymax)*height/dy + margin.top;

    const svg = svgElemAppend(document.getElementById(plotid), 'svg', {
        width:  width + margin.left + margin.right,
        height:  height + margin.top + margin.bottom,
        viewBox: `0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio: "xMidYMid",
    });

    // X axis
    svgElemAppend(svg, 'line', {
        class:'axis',
        x1:margin.left,
        x2:margin.left+width,
        y1:margin.top+height,
        y2:margin.top+height,
    });

    // Y axis
    svgElemAppend(svg, 'line', {
        class:'axis',
        x1:margin.left,
        x2:margin.left,
        y1:margin.top+height,
        y2:margin.top,
    });

    // Points of interest
    for (let i=0; i<labelledpts.length; i++) {
        let pt = labelledpts[i];
        svgElemAppend(svg, 'circle',
                        {'cx':xmap(pt[0]), 'cy':ymap(pt[1]), 'r':3});
        svgElemAppend(svg, 'text',
                        {'class': 'ptlabel', 'x':xmap(pt[0]), 'y':ymap(pt[1])},
                       content=`(${pt[0].toFixed(0)} kNm, ${pt[1].toFixed(0)} kN)`);
    }

    // Design load
    svgElemAppend(svg, 'circle',
                    {'cx':xmap(designpt[0]), 'cy':ymap(designpt[1]),
                     'r':4, 'fill': pass ? 'green' : 'red'});
    svgElemAppend(svg, 'text',
                    {'class': 'designptlabel',
                     'x':xmap(designpt[0]), 'y':ymap(designpt[1]),
                     'fill': pass ? 'green' : 'red'},
                    content=`(${designpt[0].toFixed(0)} kNm, ${designpt[1].toFixed(0)} kN)`);

    // Axes labels
    svgElemAppend(svg, 'text',
                    {'class': 'xlabel', 'x': xmap(xmax), 'y': ymap(0)},
                    content='&Phi;Mu');
    svgElemAppend(svg, 'text',
                    {'class': 'ylabel', 'x': xmap(0), 'y': ymap(ymax)},
                    content='&Phi;Nu');

    // Plot line
    let linepath = `M${xmap(Ms[0])},${ymap(Ns[0])}`;
    for (i=0; i<Ns.length; i++) {
        linepath += ` L${xmap(Ms[i])},${ymap(Ns[i])}`;
    }
    svgElemAppend(svg, 'path', {'class': 'plotline', 'd': linepath});

}

initPage();
