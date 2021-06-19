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
    let canvas = document.getElementById('stripFootingFigure');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let Ww = wallWidth.valueAsNumber;
        let Hw = 1500;
        let Wf = footingWidth.valueAsNumber;
        let Hf = footingHeight.valueAsNumber;
        let e = eccentricity.valueAsNumber;

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
        let x1 = shearPlaneLHS();
        let x2 = Wf-shearPlaneRHS();
        ctx.lineStyle = 'grey';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(scale*x1,scale*Hw);
        ctx.lineTo(scale*x1,scale*(Hw+Hf));
        ctx.moveTo(scale*x2,scale*Hw);
        ctx.lineTo(scale*x2,scale*(Hw+Hf));
        ctx.stroke();

        // Reo
        let c = cover.valueAsNumber;
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
