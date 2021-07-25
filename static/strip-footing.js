function updatePage()
{
    drawFigure();
    checkBearing();
    checkShear();
    checkBending();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('stripFootingFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let strip = {
        W:footingWidth.valueAsNumber,
        D:footingHeight.valueAsNumber,
        db:barDiameter.valueAsNumber,
        c:cover.valueAsNumber,
    };

    let wall = {
        W:wallWidth.valueAsNumber,
        e:eccentricity.valueAsNumber,
    };

    let scalefactor = 0.9*Math.min(canvas.width/strip.W,
                                   canvas.height/strip.D);
    for (key in strip) {
        strip[key] = scalefactor*strip[key];
    }
    for (key in wall) {
        wall[key] = scalefactor*wall[key];
    }

    // Strip
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect((X-strip.W)/2, 0.95*Y - strip.D, strip.W, strip.D);
    ctx.stroke();


    // Wall
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect((X-wall.W)/2+wall.e, 0.05*Y, wall.W, 0.9*Y - strip.D);
    ctx.stroke();

    // Shear perimeter
    let d0 = strip.D - strip.c - strip.db/2;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo((X-wall.W-d0)/2+wall.e, 0.95*Y-strip.D);
    ctx.lineTo((X-wall.W-d0)/2+wall.e, 0.95*Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((X+wall.W+d0)/2+wall.e, 0.95*Y-strip.D);
    ctx.lineTo((X+wall.W+d0)/2+wall.e, 0.95*Y);
    ctx.stroke();
}

function d0()
{
    return footingHeight.valueAsNumber
        - cover.valueAsNumber
        - barDiameter.valueAsNumber/2;
}

function shearPlaneLHS()
{
    return footingWidth.valueAsNumber/2
        - wallWidth.valueAsNumber/2
        + eccentricity.valueAsNumber
        - d0()/2;
}

function shearPlaneRHS()
{
    return footingWidth.valueAsNumber/2
        - wallWidth.valueAsNumber/2
        - eccentricity.valueAsNumber
        - d0()/2;
}

function checkBearing()
{
    let A = footingWidth.valueAsNumber * 1000 / 1e6; // Take 1000mm length
    let design_pressure = (deadLoad.valueAsNumber
                           +liveLoad.valueAsNumber
                           +(A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber))/A;
    qstar.value = design_pressure.toFixed();
    bearingCheck.value = (design_pressure/qs.valueAsNumber).toFixed(2);
    setPassFail(bearingCheck);
}

function checkShear()
{
    // Effective depth
    let fc = concreteStrength.valueAsNumber;
    let dv = Math.max(0.72*footingHeight.valueAsNumber, 0.9*d0());
    let kv = 0.1; // No fitments in strip footing

    // Shear
    let phiVucx = 0.7*kv*dv*Math.min(Math.sqrt(fc), 8);
    let Vstar = qULS()*Math.max(shearPlaneLHS(), shearPlaneRHS())/1e3;
    shearLoad.value = Vstar.toFixed();
    shearCapacity.value = phiVucx.toFixed();
    shearCheck.value = (Vstar/phiVucx).toFixed(2);
    setPassFail(shearCheck);
}

function qULS()
{
    let A = footingWidth.valueAsNumber * 1000 / 1e6; // 1000mm length
    let qULS = (psiG.valueAsNumber*(deadLoad.valueAsNumber+A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber)
                + psiQ.valueAsNumber*liveLoad.valueAsNumber)/A;
    pressureULS.value = qULS.toFixed();
    return qULS;
}

function checkBending()
{
    // Variables
    let h = footingHeight.valueAsNumber;
    let Wf = footingWidth.valueAsNumber;
    let fctf = 0.6*Math.sqrt(concreteStrength.valueAsNumber);
    let db = barDiameter.valueAsNumber;

    // Moment 
    let lever = Wf/2;
    let bendingForce = qULS()*lever/1000; // kN/m
    let Mstar = bendingForce*lever/2/1000; // kNm/m
    momentX.value = Mstar.toFixed();

    let steelArea = Mstar/(0.85*fsy.valueAsNumber*d0())*1e6;
    let minSteelArea = 0.20*(h/d0())**2 * (fctf/fsy.valueAsNumber) * 1000*h;
    let nBars = Math.max(steelArea,minSteelArea)/(Math.PI*db**2/4);
    let spacing = 1000/nBars;
    bars.value = "N" + db + " @ " + spacing.toFixed() + "mm";
    bars.style.width = "12ch";

}
