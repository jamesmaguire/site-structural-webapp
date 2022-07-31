function updatePage()
{
    checkAxial();
    checkSoil();
    designBars();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('boredPileFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let pile = {
        D:diameter.valueAsNumber,
        c:cover.valueAsNumber,
        db:barDiameter.valueAsNumber,
        dbt:tieDiameter.valueAsNumber,
    };

    let scalefactor = 0.9*Math.min(canvas.width/pile.D, canvas.height/pile.D);
    for (key in pile) {
        pile[key] = scalefactor*pile[key];
    }
    pile.nbars = parseInt(longBars.value.split(" ")[0]);

    // Pile outline
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.arc(X/2 ,Y/2 , pile.D/2, 0, 2*Math.PI);
    ctx.stroke();

    // Ties
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(X/2 ,Y/2 , pile.D/2-pile.c-1, 0, 2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(X/2 ,Y/2 , pile.D/2-pile.c-pile.dbt, 0, 2*Math.PI);
    ctx.stroke();

    // Longitudinal bars
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    let armlength = pile.D/2 - pile.c - pile.dbt - pile.db/2;
    for (let i = 0; i < pile.nbars; i++) {
        let x = armlength * Math.sin(i*2*Math.PI/pile.nbars) + X/2;
        let y = armlength * Math.cos(i*2*Math.PI/pile.nbars) + Y/2;
        rebar(ctx, x, y, pile.db);
    }

}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.stroke();
}

function Ag()
{
    // Returns pile gross area in m^2
    return Math.PI * diameter.valueAsNumber**2 / 4 / 1e6;
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

function checkSoil()
{
    let bearing = endBearing.valueAsNumber * Ag();
    let perimeter = Math.PI * diameter.valueAsNumber / 1000;
    let friction = shaftAdhesion.valueAsNumber * perimeter * embedment.valueAsNumber;

    bearingCapacity.value = bearing.toFixed();
    frictionCapacity.value = friction.toFixed();
    soilCapacity.value = (bearing + friction).toFixed();
    soilCheck.value = (load.valueAsNumber/(bearing+friction)).toFixed(2);
    setPassFail(soilCheck);
}

function calcAstmin() {
    
    if (embedded.checked) {
        return 0.005*Ag() * 1e6;
    }
    else {
        return 0.010*Ag() * 1e6;
    }
}

function designBars()
{
    let c = cover.valueAsNumber;
    let Abar = Math.PI * barDiameter.valueAsNumber**2 / 4;
    let dt = tieDiameter.valueAsNumber;

    // Longitudinal
    let Astmin = calcAstmin();
    let Astmax = 0.04*Ag() * 1e6;
    let bars = Math.floor(Astmin/Abar)+1;
    let Ast = bars*Abar;
    if (Ast > Astmax) {
        alert("Ast (" + Ast.toFixed() + "mm)> Astmax (" + Astmax.toFixed() + "mm)");
    }
    longBars.value = bars.toString() + " N" + barDiameter.value;

    // Spacing
    let perim = Math.PI * (diameter.valueAsNumber
                           - (2*(tieDiameter.valueAsNumber
                                 + cover.valueAsNumber))
                           - barDiameter.valueAsNumber);
    spacing.value = (perim/bars).toFixed();

    // Ties
    let pitch = Math.floor((15*barDiameter.valueAsNumber) / 50)*50;
    tieBars.value = "R" + tieDiameter.value + "-" + pitch;
}

initPage();
