function updatePage()
{
    checkAxial();
    checkSoil();
    designBars();
    drawFigure(0.2);
    setStatusUptodate();
}

function drawFigure(scale)
{
    let canvas = document.getElementById('boredPileFigure');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Variables
        let R = diameter.valueAsNumber/2;
        let c = cover.valueAsNumber;
        let dt = tieDiameter.valueAsNumber;
        let db = barDiameter.valueAsNumber;

        // Concrete mass
        ctx.lineWidth = 1;
        ctx.fillStyle = 'lightgray';
        ctx.beginPath();
        ctx.arc(scale*R, scale*R, scale*R, 0, 2*Math.PI);
        ctx.fill();

        // Tie
        ctx.lineWidth = scale*dt;
        ctx.lineStyle = 'black';
        ctx.beginPath();
        ctx.arc(scale*R, scale*R, scale*(R-c-dt/2), 0, 2*Math.PI);
        ctx.stroke();

        // Long bars
        let nbars = parseInt(longBars.value.split(" ")[0]);
        let armlength = diameter.valueAsNumber/2 - cover.valueAsNumber
            - tieDiameter.valueAsNumber - barDiameter.valueAsNumber/2;
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        for (let i = 0; i < nbars; i++) {
            let x = armlength * Math.sin(i*2*Math.PI/nbars) + R;
            let y = armlength * Math.cos(i*2*Math.PI/nbars) + R;
            rebar(ctx, scale*x, scale*y, scale*barDiameter.valueAsNumber);
        }
        
    }
}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.fill();
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

function designBars()
{
    let c = cover.valueAsNumber;
    let Abar = Math.PI * barDiameter.valueAsNumber**2 / 4;
    let dt = tieDiameter.valueAsNumber;

    // Longitudinal
    let Astmin = 0.005*Ag() * 1e6;
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
