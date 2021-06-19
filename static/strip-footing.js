function updatePage()
{
    drawFooting(0.05);
    checkBearing();
    checkShear();
    checkBending();
    setStatusUptodate();
}

function drawFooting(scale)
{
    var canvas = document.getElementById('stripFootingFigure');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var Ww = wallWidth.valueAsNumber;
        var Hw = 1500;
        var Wf = footingWidth.valueAsNumber;
        var Hf = footingHeight.valueAsNumber;
        var e = eccentricity.valueAsNumber;

        // Footing
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0,scale*Hw,scale*Wf,scale*Hf);
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.lineStyle = 'black';
        ctx.beginPath();
        ctx.rect(0,scale*Hw,scale*Wf,scale*Hf);
        ctx.stroke();

        // Wall
        ctx.fillStyle = '#eee';
        ctx.fillRect(scale*(e+(Wf-Ww)/2), 0, scale*Ww, scale*Hw);
        ctx.beginPath();
        ctx.rect(scale*(e+(Wf-Ww)/2), 0, scale*Ww, scale*Hw);
        ctx.stroke();

        // Shear planes
        var x1 = shearPlaneLHS();
        var x2 = Wf-shearPlaneRHS();
        ctx.lineStyle = 'grey';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(scale*x1,scale*Hw);
        ctx.lineTo(scale*x1,scale*(Hw+Hf));
        ctx.moveTo(scale*x2,scale*Hw);
        ctx.lineTo(scale*x2,scale*(Hw+Hf));
        ctx.stroke();

        // Reo
        var c = cover.valueAsNumber;
        ctx.lineStyle = 'black';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(scale*c,scale*(Hw+c));
        ctx.lineTo(scale*c,scale*(Hw+Hf-c));
        ctx.lineTo(scale*(Wf-c),scale*(Hw+Hf-c));
        ctx.lineTo(scale*(Wf-c),scale*(Hw+c));
        ctx.stroke();
    }
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
        + eccentricity.valueAsNumber
        - d0();
}

function shearPlaneRHS()
{
    return footingWidth.valueAsNumber/2
        - eccentricity.valueAsNumber
        - d0();
}

function checkBearing()
{
    var A = footingWidth.valueAsNumber * 1000 / 1e6; // Take 1000mm length
    var design_pressure = (deadLoad.valueAsNumber
                           +liveLoad.valueAsNumber
                           +(A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber))/A;
    qstar.value = design_pressure.toFixed();
    bearingCheck.value = (design_pressure/qs.valueAsNumber).toFixed(2);
    setPassFail(bearingCheck);
}

function checkShear()
{
    // Effective depth
    var fc = concreteStrength.valueAsNumber;
    var dv = Math.max(0.72*footingHeight.valueAsNumber, 0.9*d0());
    var kv = 0.1; // No fitments in strip footing

    // Shear
    var phiVucx = 0.7*kv*dv*Math.min(Math.sqrt(fc), 8);
    var Vstar = qULS()*Math.max(shearPlaneLHS(), shearPlaneRHS())/1e3;
    shearLoad.value = Vstar.toFixed();
    shearCapacity.value = phiVucx.toFixed();
    shearCheck.value = (Vstar/phiVucx).toFixed(2);
    setPassFail(shearCheck);
}

function qULS()
{
    var A = footingWidth.valueAsNumber * 1000 / 1e6; // 1000mm length
    var qULS = (psiG.valueAsNumber*(deadLoad.valueAsNumber+A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber)
                + psiQ.valueAsNumber*liveLoad.valueAsNumber)/A;
    pressureULS.value = qULS.toFixed();
    return qULS;
}

function checkBending()
{
    // Variables
    var h = footingHeight.valueAsNumber;
    var Wf = footingWidth.valueAsNumber;
    var fctf = 0.6*Math.sqrt(concreteStrength.valueAsNumber);
    var db = barDiameter.valueAsNumber;

    // Moment 
    var lever = Wf/2;
    var bendingForce = qULS()*lever/1000; // kN/m
    var Mstar = bendingForce*lever/2/1000; // kNm/m
    momentX.value = Mstar.toFixed();

    var steelArea = Mstar/(0.85*fsy.valueAsNumber*d0())*1e6;
    var minSteelArea = 0.20*(h/d0())**2 * (fctf/fsy.valueAsNumber) * 1000*h;
    var nBars = Math.max(steelArea,minSteelArea)/(Math.PI*db**2/4);
    var spacing = 1000/nBars;
    bars.value = "N" + db + " @ " + spacing.toFixed() + "mm";
    bars.style.width = "12ch";

}
