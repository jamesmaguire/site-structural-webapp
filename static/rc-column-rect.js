
function initPage()
{
    // Column geometry
    input('i_L', {initval:3000, units:'mm'});
    input('i_kx', {initval:1.0});
    input('i_ky', {initval:1.0});
    input('i_Dx', {initval:600, units:'mm'});
    input('i_Dy', {initval:250, units:'mm'});
    output('o_Ag', {units:'mm<sup>2</sup>'});

    // Concrete
    input('i_fc', {initval:32, units:'MPa'});
    input('i_c', {initval:40, units:'mm'});
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
    const svgNS = 'http://www.w3.org/2000/svg';

    const col = {
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
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

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', width + margin.left + margin.right);
    svg.setAttributeNS(null, 'height', height + margin.top + margin.bottom);
    svg.setAttributeNS(null, 'viewBox', `0 0 `
                       +`${width + margin.left + margin.top} `
                       +`${height + margin.top + margin.bottom}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");
    document.getElementById('columnFigure').appendChild(svg);

    svgCreateAppend(svg, 'path', {
        'class': 'concrete',
        'd': `M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(col.Dy)}`
            +` L${xmap(col.Dx)},${ymap(col.Dy)}`
            +` L${xmap(col.Dx)},${ymap(0)} z`
    });

    const bars = barCoords(col);
    for (i=0; i<bars.length; i++) {
        svgCreateAppend(svg, 'circle', {
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
    const stirrup = document.createElementNS(svgNS, 'path');
    stirrup.setAttributeNS(null, 'class', 'rebar');
    stirrup.setAttributeNS(null, 'd', spath);
    svg.appendChild(stirrup);

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
    let col = {
        L:i_L.valueAsNumber,
        kx:i_kx.valueAsNumber,
        ky:i_ky.valueAsNumber,
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
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

    // Material properties
    let concrete = {
        fc:i_fc.valueAsNumber,
        ecu:0.003,
    };
    concrete.alpha1 = Math.min(Math.max(1.0-0.003*concrete.fc, 0.72), 0.85);
    concrete.alpha2 = Math.max(0.85-0.0015*concrete.fc, 0.67);
    concrete.gamma = Math.max(0.97-0.0025*concrete.fc, 0.67);
    o_ecu.value = concrete.ecu.toFixed(4);
    o_alpha1.value = concrete.alpha1.toFixed(2);
    o_alpha2.value = concrete.alpha2.toFixed(2);
    o_gamma.value = concrete.gamma.toFixed(2);

    let steel = {
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
    let Nuo = ((col.Ag - col.Ast)*concrete.alpha1*concrete.fc + col.Ast*steel.fsy)/1000;
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
    let canvas = document.getElementById(plotid);
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    // Chart area
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.rect(0.1*X, 0.1*Y, 0.8*X, 0.8*Y);
    ctx.stroke();

    // Axes labels
    ctx.font = "14pt sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("ΦMu", 0.9*X, 0.92*Y);
    ctx.fillText("ΦNu", 0.08*X, 0.1*Y);

    // Scale points
    let xmax = 0;
    let ymax = 0;
    for (i=0; i<points.length; i++) {
        let x = points[i][0];
        let y = points[i][1];
        xmax = Math.max(xmax, x);
        ymax = Math.max(ymax, y);
    }
    let sf = 0.75*Math.max(X, Y)/Math.max(xmax, ymax);
    let sfx = 0.5*X/xmax;
    let sfy = 0.75*Y/ymax;

    let coords = [];
    for (i=0; i<points.length; i++) {
        coords.push([sfx*points[i][0]+0.1*X, -sfy*points[i][1]+0.9*Y]);
    }
    let labelcoords = [];
    for (i=0; i<labelledpts.length; i++) {
        labelcoords.push([sfx*labelledpts[i][0]+0.1*X, -sfy*labelledpts[i][1]+0.9*Y]);
    }

    // Plot points
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);
    for (i=1; i<coords.length; i++) {
        ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.stroke();

    // Label points
    ctx.font = "12pt sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";

    for (i=0; i<labelcoords.length; i++) {
        ctx.beginPath();
        ctx.arc(labelcoords[i][0], labelcoords[i][1], 3, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillText("(" + labelledpts[i][0].toFixed(0) + "kNm , "
                     + labelledpts[i][1].toFixed(0) + "kN)",
                     labelcoords[i][0]+0.03*X, labelcoords[i][1]);
    }

    // Design points
    let designcoords = [0.1*X + designpt[0]*sfx,
                        0.9*Y - designpt[1]*sfy];
    if (pass) {
        ctx.fillStyle = 'green';
    } else {
        ctx.fillStyle = 'red';
    }
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.beginPath();
    ctx.arc(designcoords[0], designcoords[1], 4, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillText("(" + designpt[0].toFixed(0) + "kNm , "
                 + designpt[1].toFixed(0) + "kN)",
                 designcoords[0], designcoords[1]+0.02*Y);

}
