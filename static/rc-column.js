
function updatePage()
{
    // displayShape();
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('columnFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let col = {
        L:i_L.valueAsNumber,
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
        Dia:i_Dia.valueAsNumber,
        c:i_c.valueAsNumber,
        db:i_db.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
    };
    let scalefactor = 0.9*Math.min(canvas.width/col.Dx, canvas.height/col.Dy);
    if (i_shape.value == "circ") {
        scalefactor = 0.8*Math.min(canvas.width/col.Dia, canvas.height/col.Dia);
    }
    for (key in col) {
        col[key] = scalefactor*col[key];
    }
    col.nbarstop = i_nbarstop.valueAsNumber;
    col.nbarsside = i_nbarsside.valueAsNumber;
    col.nbarscirc = i_nbarscirc.valueAsNumber;
    col.nbars = o_nbars.valueAsNumber;
    col.shape = i_shape.value;

    if (col.shape == "rect") {
        // Column outline
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.rect((X-col.Dx)/2,(Y-col.Dy)/2,col.Dx,col.Dy);
        ctx.stroke();

        // Long bars
        let coords = barCoords(col);
        for (i = 0; i<coords.length; i++) {
            rebar(ctx, (X-col.Dx)/2+coords[i][0], (Y-col.Dy)/2+coords[i][1], col.db);
        }

        // Stirrups
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        // I've trimmed one pixel to give the stirrup a more visually consistent size
        roundedrect(ctx, (X-col.Dx)/2+col.c+1, (Y-col.Dy)/2+col.c+1,
                    col.Dx-2*col.c-2, col.Dy-2*col.c-2, 3*col.dbt/2);
        roundedrect(ctx, (X-col.Dx)/2+col.c+col.dbt, (Y-col.Dy)/2+col.c+col.dbt,
                    col.Dx-2*col.c-2*col.dbt, col.Dy-2*col.c-2*col.dbt, col.dbt/2);

    } else if (col.shape == 'circ') {
        // Column outline
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.arc(X/2 ,Y/2 , col.Dia/2, 0, 2*Math.PI);
        ctx.stroke();

        // Stirrups
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(X/2 ,Y/2 , col.Dia/2-col.c-1, 0, 2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(X/2 ,Y/2 , col.Dia/2-col.c-col.dbt, 0, 2*Math.PI);
        ctx.stroke();

        // Longitudinal bars
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        let coords = barCoords(col);
        for (i = 0; i<coords.length; i++) {
            rebar(ctx, X/2+coords[i][0], Y/2+coords[i][1], col.db);
        }

    }
}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.stroke();
}

function roundedrect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.stroke();
}

// function calcBarParams()
// {
//     let db = bardb.valueAsNumber;
//     let barsTB = nbarsTB.valueAsNumber;
//     let barsS = nbarsSide.valueAsNumber;
//     let c = cover.valueAsNumber;
//     let dt = tiedb.valueAsNumber;
//     nbars.value = 2*(barsTB+barsS) - 4;
//     barSpcX.value = (colDx.valueAsNumber - 2*c - 2*dt - db)/(barsTB-1);
//     barSpcY.value = (colDy.valueAsNumber - 2*c - 2*dt - db)/(barsS-1);
// }

function displayShape()
{
    let shape = i_shape.value;
    let circInputs = [i_Dia, i_nbarscirc, o_rd, o_lambdad];
    let rectInputs = [i_Dx, i_Dy, i_nbarstop, i_nbarsside, o_nbars, o_rx, o_ry, o_lambdax, o_lambday];
    if (shape == "rect") {
        circInputs.forEach(hideInput);
        rectInputs.forEach(showInput);
    } else if (shape == "circ") {
        circInputs.forEach(showInput);
        rectInputs.forEach(hideInput);
    }
}

function hideInput(i_ID) {
    i_ID.parentElement.parentElement.style.display = "none";
}
function showInput(i_ID) {
    i_ID.parentElement.parentElement.style.display = "";
}

function barCoords(col) {
    let coords = [];

    if (col.shape == "rect") {
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

    } else if (col.shape == "circ") {
        for (let angle=0; angle<2*Math.PI; angle+=2*Math.PI/col.nbarscirc) {
            let x = (col.Dia/2-col.c-col.dbt-col.db/2) * Math.cos(angle);
            let y = (col.Dia/2-col.c-col.dbt-col.db/2) * Math.sin(angle);
            coords.push([x, y]);
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
        Dia:i_Dia.valueAsNumber,
        db:i_db.valueAsNumber,
        nbarstop:i_nbarstop.valueAsNumber,
        nbarsside:i_nbarsside.valueAsNumber,
        nbarscirc:i_nbarscirc.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        c:i_c.valueAsNumber,
        shape:i_shape.value,
    };
    col.nbars = barCoords(col).length;
    col.Ast = col.nbars*Math.PI*col.db**2/4;
    o_nbars.value = col.nbars;
    o_Ast.value = col.Ast.toFixed(0);

    if (col.shape == "rect") {
        col.Ag = col.Dx * col.Dy;
    } else if (col.shape == "circ") {
        col.Ag = Math.PI*col.Dia**2/4;
    }
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
    if (col.shape=="rect") {
        col.r = Math.min(col.rx, col.ry);
        col.lambda = Math.max(col.lambdax, col.lambday);
    } else if (col.shape=="circ") {
        col.r = col.rd;
        col.lambda = Math.max(col.ky, col.kx) * col.L / col.r;
    }
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
    o_Nfire.value = Nfire.toFixed(0);
    o_beta.value = beta.toFixed(3);
    // TODO: min bending load

    
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
    
    // Squash load
    let Nuo = ((col.Ag - col.Ast)*concrete.alpha1*concrete.fc + col.Ast*steel.fsy)/1000;
    let phiNuo = 0.65*Nuo;
    col.phiNuo = phiNuo;
    o_Nuo.value = Nuo.toFixed(0);
    o_phiNuo.value = phiNuo.toFixed(0);

    // Load-moment plot (X)
    let purecomp = [0, phiNuo];
    let decompression = MNpointx(1, col, concrete, steel);
    let balance = MNpointx(0.545, col, concrete, steel);
    let purebend = findMNpointx(0, col, concrete, steel);
    let keyPts = [purecomp, decompression, balance, purebend];
    let plotPts = [purecomp, decompression];
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
    drawPlot('mnxPlot', plotPts, keyPts);

    // Load-moment plot (Y)
    purecomp = [0, phiNuo];
    decompression = MNpointy(1, col, concrete, steel);
    balance = MNpointy(0.545, col, concrete, steel);
    purebend = findMNpointy(0, col, concrete, steel);
    keyPts = [purecomp, decompression, balance, purebend];
    plotPts = [purecomp, decompression];
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
    drawPlot('mnyPlot', plotPts, keyPts);

    // Ties
    // TODO:
    let tieSpacing = 300;

    // Rates
    let steelDensity = i_rhos.valueAsNumber;
    let tielength = 0;
    if (col.shape == "rect") {
        let tielength = 2*(col.Dx-col.c-col.dbt) + 2*(col.Dy-col.c-col.dbt);
    } else if (col.shape == "circ") {
        let tielength = Math.PI * (col.Dia - 2*col.c - col.dbt);
    }
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


function drawPlot(plotid, points, labelledpts) {
    let canvas = document.getElementById(plotid);
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    // Chart area
    ctx.strokeStyle = 'black';
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
        ctx.fillText("(" + labelledpts[i][0].toFixed(0) + ", "
                     + labelledpts[i][1].toFixed(0) + ")",
                     labelcoords[i][0]+0.03*X, labelcoords[i][1]);
    }

}
