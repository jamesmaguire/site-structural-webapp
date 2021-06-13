function update_page()
{
    draw_footing(0.05);
    check_bearing();
    check_punching();
}

function draw_footing(scale)
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
        var xmin = scale*(Lx.valueAsNumber - Lcx.valueAsNumber)/2;
        var ymin = scale*(Ly.valueAsNumber - Lcy.valueAsNumber)/2;
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

function check_bearing()
{
    var A = Lx.valueAsNumber * Ly.valueAsNumber / 1e6;
    footingArea.value = A.toFixed(2);
    var design_pressure = (deadLoad.valueAsNumber+liveLoad.valueAsNumber+(A*footingHeight.valueAsNumber/1000*gammac.valueAsNumber))/A;
    qstar.value = design_pressure.toFixed();
    bearingCheck.value = (design_pressure/qs.valueAsNumber).toFixed(2);
    setPassFail(bearingCheck);
}

function check_punching()
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

function setPassFail (obj) {
    if (obj.valueAsNumber < 1) {
        obj.className = 'PASS';
    } else {
        obj.className = 'FAIL';
    }
}
