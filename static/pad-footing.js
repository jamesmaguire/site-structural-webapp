function updatePage()
{
    drawFigure();
    checkBearing();
    checkPunching();
    checkShear();
    checkBending();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('padFootingFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let pad = {
        Lx:Lx.valueAsNumber,
        Ly:Ly.valueAsNumber,
        D:footingHeight.valueAsNumber,
        db:barDiameter.valueAsNumber,
        c:cover.valueAsNumber,
    };

    let col = {
        Lx:Lcx.valueAsNumber,
        Ly:Lcy.valueAsNumber,
        ex:eccentricityX.valueAsNumber,
        ey:eccentricityY.valueAsNumber,
    };

    let scalefactor = 0.9*Math.min(canvas.width/pad.Lx,
                                   canvas.height/pad.Ly);
    for (key in pad) {
        pad[key] = scalefactor*pad[key];
    }
    for (key in col) {
        col[key] = scalefactor*col[key];
    }

    // Footing
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.rect((X-pad.Lx)/2, (Y-pad.Ly)/2, pad.Lx, pad.Ly);
    ctx.stroke();

    // Column
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect((X-col.Lx)/2+col.ex, (Y-col.Ly)/2-col.ey, col.Lx, col.Ly);
    ctx.stroke();

    // Shear perimeter
    let d0 = pad.D - pad.c - pad.db/2;
    ctx.lineStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.rect((X-col.Lx-d0)/2+col.ex, (Y-col.Ly-d0)/2-col.ey,
             col.Lx+d0, col.Ly+d0);
    ctx.stroke();
}

function checkBearing()
{
    let A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;
    footingArea.value = A.toFixed(2);
    let design_pressure = (deadLoad.valueAsNumber+liveLoad.valueAsNumber+(A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber))/A;
    qstar.value = design_pressure.toFixed();
    bearingCheck.value = (design_pressure/qs.valueAsNumber).toFixed(2);
    setPassFail(bearingCheck);
}

function checkPunching()
{
    let fc = concreteStrength.valueAsNumber;
    let betah = Math.max(Lcx.valueAsNumber,Lcy.valueAsNumber)/Math.min(Lcx.valueAsNumber,Lcy.valueAsNumber);
    let A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;

    // Effective depth
    let d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    // Shear perimeter
    let u = 2*(Lcx.valueAsNumber+d0+Lcy.valueAsNumber+d0);
    // Concrete shear strength
    let fcv = Math.min(0.17*(1+2/betah)*Math.sqrt(fc), 0.34*Math.sqrt(fc));
    // Shear capacity
    let phiVuo = 0.75*u*d0*fcv/1000;
    punchingCapacity.value = phiVuo.toFixed();

    // Shear load
    let Vstar= 1.2*(deadLoad.valueAsNumber + A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber) +
        1.5*liveLoad.valueAsNumber;
    shearLoad.value = Vstar.toFixed();

    punchingCheck.value = (Vstar/phiVuo).toFixed(2);
    setPassFail(punchingCheck);
}

function checkShear()
{
    // Effective depth
    let fc = concreteStrength.valueAsNumber;
    let d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    let dv = Math.max(0.72*footingHeight.valueAsNumber, 0.9*d0);
    let kv = 0;
    if (fitments.checked) {
        kv = 0.15;
    } else {
        kv = Math.min(200/(1000+1.3*dv), 0.1);
    }

    // Shear in X
    let bv = Lx.valueAsNumber;
    let shearPlaneDistRHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 - eccentricityY.valueAsNumber;
    let shearPlaneDistLHS = (Ly.valueAsNumber-Lcy.valueAsNumber)/2 + eccentricityY.valueAsNumber;
    let phiVucx = 0.75*kv*bv*dv*Math.min(Math.sqrt(fc), 8)/1000;
    let Vstar = qULS()*(Math.max(shearPlaneDistLHS, shearPlaneDistRHS)-d0)*Lx.valueAsNumber/1e6;
    shearX.value = Vstar.toFixed();
    shearCapacityX.value = phiVucx.toFixed();
    shearCheckX.value = (Vstar/phiVucx).toFixed(2);
    setPassFail(shearCheckX);
    
    // Shear in Y
    bv = Ly.valueAsNumber;
    shearPlaneDistRHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 - eccentricityX.valueAsNumber;
    shearPlaneDistLHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 + eccentricityX.valueAsNumber;
    let phiVucy = 0.75*kv*bv*dv*Math.min(Math.sqrt(fc), 8)/1000;
    Vstar = qULS()*(Math.max(shearPlaneDistLHS, shearPlaneDistRHS)-d0)*Ly.valueAsNumber/1e6;
    shearY.value = Vstar.toFixed();
    shearCapacityY.value = phiVucy.toFixed();
    shearCheckY.value = (Vstar/phiVucy).toFixed(2);
    setPassFail(shearCheckY);
}

function qULS()
{
    let A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;
    let qULS = (psiG.valueAsNumber*(deadLoad.valueAsNumber+A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber)
                + psiQ.valueAsNumber*liveLoad.valueAsNumber)/A;
    pressureULS.value = qULS.toFixed();
    return qULS;
}

function checkBending()
{
    let h = footingHeight.valueAsNumber;
    let d0 = footingHeight.valueAsNumber - cover.valueAsNumber - barDiameter.valueAsNumber;
    let fctf = 0.6*Math.sqrt(concreteStrength.valueAsNumber);
    let db = barDiameter.valueAsNumber;

    // Moment in X
    let bendingPlaneDistRHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 - eccentricityX.valueAsNumber;
    let bendingPlaneDistLHS = (Lx.valueAsNumber-Lcx.valueAsNumber)/2 + eccentricityX.valueAsNumber;
    let lever = Math.max(bendingPlaneDistLHS, bendingPlaneDistRHS);
    let resultantPressure = qULS()*lever*Ly.valueAsNumber/1e6;
    let Mstar = resultantPressure*lever/2/1000;
    let steelArea = Mstar/(0.85*fsy.valueAsNumber*d0)*1e6;
    let minSteelArea = 0.19*(h/d0)**2 * (fctf/fsy.valueAsNumber) * Ly.valueAsNumber*h;
    let nBars = Math.floor(Math.max(steelArea,minSteelArea)/(Math.PI*db**2/4))+1;
    let spacing = (Ly.valueAsNumber-2*cover.valueAsNumber-db)/nBars;
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
