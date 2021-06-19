function updatePage()
{
    drawFooting(0.05);
    checkBearing();
    checkPunching();
    checkShear();
    checkBending();
    setStatusUptodate();
}

function drawFooting(scale)
{
    var canvas = document.getElementById('padFootingFigure');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Footing
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0,0,scale*Lx.valueAsNumber,scale*Ly.valueAsNumber);
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.lineStyle = 'black';
        ctx.beginPath();
        ctx.rect(0,0,scale*Lx.valueAsNumber,scale*Ly.valueAsNumber);
        ctx.stroke();

        // Column
        var xmin = scale*(eccentricityX.valueAsNumber+(Lx.valueAsNumber - Lcx.valueAsNumber)/2);
        var ymin = scale*(eccentricityY.valueAsNumber+(Ly.valueAsNumber - Lcy.valueAsNumber)/2);
        ctx.lineStyle = 'black';
        ctx.beginPath();
        ctx.rect(xmin,ymin,scale*Lcx.valueAsNumber,scale*Lcy.valueAsNumber);
        ctx.stroke();

        // Shear perimeter
        var d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
        xmin = scale*(eccentricityX.valueAsNumber+(Lx.valueAsNumber-Lcx.valueAsNumber-d0)/2);
        ymin = scale*(eccentricityY.valueAsNumber+(Ly.valueAsNumber-Lcy.valueAsNumber-d0)/2);
        ctx.lineStyle = 'grey';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.rect(xmin,ymin,scale*(Lcx.valueAsNumber+d0),scale*(Lcy.valueAsNumber+d0));
        ctx.stroke();

    }
}

function checkBearing()
{
    var A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;
    footingArea.value = A.toFixed(2);
    var design_pressure = (deadLoad.valueAsNumber+liveLoad.valueAsNumber+(A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber))/A;
    qstar.value = design_pressure.toFixed();
    bearingCheck.value = (design_pressure/qs.valueAsNumber).toFixed(2);
    setPassFail(bearingCheck);
}

function checkPunching()
{
    var fc = concreteStrength.valueAsNumber;
    var betah = Math.max(Lcx.valueAsNumber,Lcy.valueAsNumber)/Math.min(Lcx.valueAsNumber,Lcy.valueAsNumber);
    var A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;

    // Effective depth
    var d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    // Shear perimeter
    var u = 2*(Lcx.valueAsNumber+d0+Lcy.valueAsNumber+d0);
    // Concrete shear strength
    var fcv = Math.min(0.17*(1+2/betah)*Math.sqrt(fc), 0.34*Math.sqrt(fc));
    // Shear capacity
    var phiVuo = 0.75*u*d0*fcv/1000;
    punchingCapacity.value = phiVuo.toFixed();

    // Shear load
    var Vstar= 1.2*(deadLoad.valueAsNumber + A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber) +
        1.5*liveLoad.valueAsNumber;
    shearLoad.value = Vstar.toFixed();

    punchingCheck.value = (Vstar/phiVuo).toFixed(2);
    setPassFail(punchingCheck);
}

function checkShear()
{
    // Effective depth
    var fc = concreteStrength.valueAsNumber;
    var d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    var dv = Math.max(0.72*footingHeight.valueAsNumber, 0.9*d0);
    var kv = 0;
    if (fitments.checked) {
        kv = 0.15;
    } else {
        kv = Math.min(200/(1000+1.3*dv), 0.1);
    }

    // Shear in X
    var bv = Lx.valueAsNumber;
    var shearPlaneDistRHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 - eccentricityY.valueAsNumber;
    var shearPlaneDistLHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 + eccentricityY.valueAsNumber;
    var phiVucx = 0.75*kv*bv*dv*Math.min(Math.sqrt(fc), 8)/1000;
    var Vstar = qULS()*(Math.max(shearPlaneDistLHS, shearPlaneDistRHS)-d0)*Lx.valueAsNumber/1e6;
    shearX.value = Vstar.toFixed();
    shearCapacityX.value = phiVucx.toFixed();
    shearCheckX.value = (Vstar/phiVucx).toFixed(2);
    setPassFail(shearCheckX);
    
    // Shear in Y
    bv = Ly.valueAsNumber;
    shearPlaneDistRHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 - eccentricityX.valueAsNumber;
    shearPlaneDistLHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 + eccentricityX.valueAsNumber;
    var phiVucy = 0.75*kv*bv*dv*Math.min(Math.sqrt(fc), 8)/1000;
    Vstar = qULS()*(Math.max(shearPlaneDistLHS, shearPlaneDistRHS)-d0)*Ly.valueAsNumber/1e6;
    shearY.value = Vstar.toFixed();
    shearCapacityY.value = phiVucy.toFixed();
    shearCheckY.value = (Vstar/phiVucy).toFixed(2);
    setPassFail(shearCheckY);
}

function qULS()
{
    var A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;
    var qULS = (psiG.valueAsNumber*(deadLoad.valueAsNumber+A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber)
                + psiQ.valueAsNumber*liveLoad.valueAsNumber)/A;
    pressureULS.value = qULS.toFixed();
    return qULS;
}

function checkBending()
{
    var h = footingHeight.valueAsNumber;
    var d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    var fctf = 0.6*Math.sqrt(concreteStrength.valueAsNumber);
    var db = barDiameter.valueAsNumber;

    // Moment in X
    var bendingPlaneDistRHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 - eccentricityX.valueAsNumber;
    var bendingPlaneDistLHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 + eccentricityX.valueAsNumber;
    var lever = Math.max(bendingPlaneDistLHS, bendingPlaneDistRHS);
    var resultantPressure = qULS()*lever*Ly.valueAsNumber/1e6;
    var Mstar = resultantPressure*lever/2/1000;
    var steelArea = Mstar/(0.85*fsy.valueAsNumber*d0)*1e6;
    var minSteelArea = 0.19*(h/d0)**2 * (fctf/fsy.valueAsNumber) * Ly.valueAsNumber*h;
    var nBars = Math.floor(Math.max(steelArea,minSteelArea)/(Math.PI*db**2/4))+1;
    var spacing = (Ly.valueAsNumber-2*cover.valueAsNumber-db)/nBars;
    momentX.value = Mstar.toFixed();
    barsX.value = "" + nBars + " N" + db + "-" + spacing.toFixed();
    barsX.style.width = "12ch";
    
    // Moment in Y
    bendingPlaneDistRHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 - eccentricityY.valueAsNumber;
    bendingPlaneDistLHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 + eccentricityY.valueAsNumber;
    lever = Math.max(bendingPlaneDistLHS, bendingPlaneDistRHS);
    resultantPressure = qULS()*lever*Lx.valueAsNumber/1e6;
    Mstar = resultantPressure*lever/2/1000;
    steelArea = Mstar/(0.85*fsy.valueAsNumber*d0)*1e6;
    minSteelArea = 0.19*(h/d0)**2 * (fctf/fsy.valueAsNumber) * Lx.valueAsNumber*h;
    nBars = Math.floor(Math.max(steelArea,minSteelArea)/(Math.PI*db**2/4))+1;
    spacing = (Lx.valueAsNumber-2*cover.valueAsNumber-db)/nBars;
    momentY.value = Mstar.toFixed();
    barsY.value = "" + nBars + " N" + db + "-" + spacing.toFixed();
    barsY.style.width = "12ch";
    
}
