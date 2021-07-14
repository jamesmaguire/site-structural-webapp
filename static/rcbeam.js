function updatePage()
{
    calculateProperties();
    calculateULS();
    drawFigure(0.4);
    setStatusUptodate();
}

function drawFigure(scale)
{
    let canvas = document.getElementById('beamFigure');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        let X = canvas.width;
        let Y = canvas.height;
        ctx.clearRect(0, 0, X, Y);

        // Variables
        let B = beamWidth.valueAsNumber;
        let D = beamDepth.valueAsNumber;
        let dbt = dbTension.valueAsNumber;
        let dbc = dbCompression.valueAsNumber;
        let axist = cover.valueAsNumber + dbt/2;
        let axisc = cover.valueAsNumber + dbc/2;
        let btmBars = nbarsTension.valueAsNumber;
        let topBars = nbarsCompression.valueAsNumber;

        // Concrete mass
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0,0,scale*B,scale*D);

        // Bottom bars
        ctx.lineStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        let barSpace = (B-2*axist)/(btmBars-1);
        for (i = 0; i < btmBars; i++) {
            rebar(ctx, scale*(axist+(i*barSpace)), scale*(D-axist), scale*dbt);
        }
        // Top bars
        barSpace = (B-2*axisc)/(topBars-1);
        for (i = 0; i < topBars; i++) {
            rebar(ctx, scale*(axisc+(i*barSpace)), scale*axisc, scale*dbc);
        }

        // ULS N.A.
        let dn = ulsdn.valueAsNumber;
        ctx.lineStyle = 'black';
        ctx.setLineDash([5,5]);
        ctx.beginPath();
        ctx.moveTo(0,scale*dn);
        ctx.lineTo(scale*B,scale*dn);
        ctx.stroke();
        ctx.fillStyle = '#bbb';
        ctx.fillRect(0,0,scale*B,scale*dn);

    }
}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
}

function checkAxial()
{
    let phi = 0.65;
    let k = placementFactor.valueAsNumber;
    let fc = concreteStrength.valueAsNumber;
    // Reinforced
    let phiNus = phi*k*fc*Ag()*1000;
    axialCapacity.value = phiNus.toFixed();
    axialCheck.value = (load.valueAsNumber/phiNus).toFixed(2);
    setPassFail(axialCheck);
    // Unreinforced
    phiNus = 0.45*phiNus;
    noreoAxialCapacity.value = phiNus.toFixed();
    noreoAxialCheck.value = (load.valueAsNumber/phiNus).toFixed(2);
    setPassFail(noreoAxialCheck);
}


function calcAlpha2(fc)
{
    return Math.max(0.85 - (0.0015*fc), 0.67);
}

function calcGamma(fc)
{
    return Math.max(0.97 - (0.0025*fc), 0.67);
}

function calculateProperties()
{
    alpha2.value = calcAlpha2(concreteStrength.valueAsNumber).toFixed(2);
    gamma.value = calcGamma(concreteStrength.valueAsNumber).toFixed(2);
    effectiveD.value = (beamDepth.valueAsNumber - cover.valueAsNumber
                        - dbTension.valueAsNumber/2).toFixed();
    epsilonc.value = 0.003;
}

function equillibriumForces(ku)
{
    let fc = concreteStrength.valueAsNumber;
    let fsy = steelStrength.valueAsNumber;
    let alpha2 = calcAlpha2(fc);
    let gamma = calcGamma(fc);
    let b = beamWidth.valueAsNumber;
    let ec = epsilonc.valueAsNumber;
    let dbc = dbCompression.valueAsNumber;
    let dbt = dbTension.valueAsNumber;
    let c = cover.valueAsNumber;
    let d = effectiveD.valueAsNumber;

    let Cc = alpha2*fc*gamma*ku*d*b; // units: N

    // Compression steel
    let y = c + dbc/2;
    let Asc = nbarsCompression.valueAsNumber * Math.PI * dbc**2 / 4;
    let esc = (ec/(ku*d))*(ku*d - y);
    let Cs = Asc*Math.min(fsy,esc*steelModulus.valueAsNumber/1000);

    // Tension steel
    y = d;
    let Ast = nbarsTension.valueAsNumber * Math.PI * dbt**2 / 4;
    let est = (ec/(ku*d))*(ku*d - y);
    let Ts = Ast*Math.max(-fsy,est*steelModulus.valueAsNumber*1000);

    return {Cc,Cs,Ts};
}

function calculateULS()
{
    let ku = 0.0;
    let guess = -1;
    let forces = NaN;
    while (guess < 0 && ku < 1) {
        ku += 0.1;
        forces = equillibriumForces(ku);
        guess = forces['Cc'] + forces['Cs'] + forces['Ts'];
    }
    while (guess > 0 && ku > 0) {
        ku -= 0.01;
        forces = equillibriumForces(ku);
        guess = forces['Cc'] + forces['Cs'] + forces['Ts'];
    }
    while (guess < 0 && ku < 1) {
        ku += 0.001;
        forces = equillibriumForces(ku);
        guess = forces['Cc'] + forces['Cs'] + forces['Ts'];
    }
    while (guess > 0 && ku > 0) {
        ku -= 0.0001;
        forces = equillibriumForces(ku);
        guess = forces['Cc'] + forces['Cs'] + forces['Ts'];
    }
    while (guess < 0 && ku < 1) {
        ku += 0.00001;
        forces = equillibriumForces(ku);
        guess = forces['Cc'] + forces['Cs'] + forces['Ts'];
    }

    ulsku.value = ku.toFixed(2);
    setPassFail(ulsku, 0.36);
    let dn = ku*effectiveD.valueAsNumber;
    ulsdn.value = dn.toFixed(1);

    let gamma = calcGamma(concreteStrength.valueAsNumber);
    let leverCc = gamma*dn/2;
    let leverCs = dn-cover.valueAsNumber-dbCompression.valueAsNumber/2;
    let leverTs = effectiveD.valueAsNumber - dn;
    let Mu = Math.abs(forces['Cc'])*leverCc
        + Math.abs(forces['Cs'])*leverCs
        + Math.abs(forces['Ts'])*leverTs;
    let phi = Math.max(Math.min(1.24 - 13*ku/12, 0.85), 0.65); // Check
    phiMu.value = (phi*Mu/1e6).toFixed();

    momentCheck.value = (Mstar.valueAsNumber/(phi*Mu/1e6)).toFixed(2);
    setPassFail(momentCheck);
}
