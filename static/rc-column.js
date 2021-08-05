
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

    col.ry = 0.3*col.Dy;
    col.rx = 0.3*col.Dx;
    col.rd = 0.25*col.Dia;

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

    // Design load
    let G = i_G.valueAsNumber;
    let Q = i_Q.valueAsNumber;
    let Nuls = 1.2*G + 1.5*Q;
    let Nfire = 1.0*G + 0.4*Q;
    let beta = G/(G+Q);
    o_Nuls.value = Nuls.toFixed(0);
    o_Nfire.value = Nfire.toFixed(0);
    o_beta.value = beta.toFixed(3);

    // Strength
    o_rx.value = col.rx.toFixed(1);
    o_ry.value = col.ry.toFixed(1);
    o_rd.value = col.rd.toFixed(1);
    col.lambdax = col.kx * col.L / col.rx;
    col.lambday = col.ky * col.L / col.ry;
    col.lambdad = Math.max(col.ky, col.kx) * col.L / col.rd;
    o_lambdax.value = col.lambdax.toFixed(1);
    o_lambday.value = col.lambday.toFixed(1);
    o_lambdad.value = col.lambdad.toFixed(1);
    // TODO: Show short/long
    
    // Buckling load
    let Mcx = MNpointx(0.545, col, concrete, steel)[0];
    let Mcy = MNpointy(0.545, col, concrete, steel)[0];
    let phi = 0.65;
    let Ncx = (Math.PI**2/col.L**2) * (182*(col.Dx-col.c-col.dbt-col.db/2)*phi*Mcx/(1+beta)) * 1000;
    let Ncy = (Math.PI**2/col.L**2) * (182*(col.Dy-col.c-col.dbt-col.db/2)*phi*Mcy/(1+beta)) * 1000;
    let Nc = Math.min(Ncx, Ncy);
    o_Nc.value = Nc.toFixed(0);
    
    // Squash load
    let Nuo = ((col.Ag - col.Ast)*concrete.alpha1*concrete.fc + col.Ast*steel.fsy)/1000;
    o_Nuo.value = Nuo.toFixed(0);

}

function MNpointy(ku, col, concrete, steel) {
    let d = col.Dy - col.c - col.dbt - col.db/2;
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*d*col.Dx/1000;
    let bars = barCoords(col);
    let barForce = [];
    let barMoment = [];
    // Loop over each steel bar
    for (let i=0; i<bars.length; i++) {
        let y = bars[i][1];
        let strain = steel_strain(ku, concrete.ecu, steel.esu, d, y);
        let F = Math.PI*col.db**2/4 * steel.Es*strain;
        barForce.push(F);
        barMoment.push(F*(ku*d - y));
    }
    let N = Cc + barForce.reduce((a,b)=>a+b);
    let M = (Cc*(ku*d - concrete.gamma*ku*d/2) + barMoment.reduce((a,b)=>a+b))/1000;
    return [M, N];
}

function MNpointx(ku, col, concrete, steel) {
    let d = col.Dx - col.c - col.dbt - col.db/2;
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*d*col.Dy/1000;
    let bars = barCoords(col);
    let barForce = [];
    let barMoment = [];
    // Loop over each steel bar
    for (let i=0; i<bars.length; i++) {
        let x = bars[i][0];
        let strain = steel_strain(ku, concrete.ecu, steel.esu, d, x);
        let F = Math.PI*col.db**2/4 * steel.Es*strain;
        barForce.push(F);
        barMoment.push(F*(ku*d - x));
    }
    let N = Cc + barForce.reduce((a,b)=>a+b);
    let M = (Cc*(ku*d - concrete.gamma*ku*d/2) + barMoment.reduce((a,b)=>a+b))/1000;
    return [M, N];
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
