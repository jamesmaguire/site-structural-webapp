function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function runCalcs()
{

    // Natural period
    let frametype = i_frametype.value;
    let hn = i_hn.valueAsNumber;
    let kt = {"mrsf":0.11, "mrcf":0.075, "ebsf":0.06, "other":0.05};
    let T1 = i_T1.valueAsNumber;
    T1simple = 1.25*kt[frametype]*hn**0.75;
    o_kt.value = kt[frametype];
    o_T1simple.value = T1simple.toFixed(2);

    // Spectral shape factor
    let periods = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
                   1.2, 1.5, 1.7, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    let SSC = i_SSC.value;
    let Ch = periods.map(T => SpectralShapeFactor(SSC, T));
    let ChT = ilookup(T1, periods, Ch);
    drawPlot("ChPlot", periods, Ch, T1);

}

// function drawPlot(plotid, points, labelledpts, designpt, pass) {
function drawPlot(plotid, periods, Chs, T) {
    let canvas = document.getElementById(plotid);
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);
    ctx.clearRect(0, 0, X, Y);

    // Chart area
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.rect(0.1*X, 0.1*Y, 0.8*X, 0.8*Y);
    ctx.stroke();

    // Axes labels
    ctx.font = "14pt sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("PERIOD IN SECONDS (T)", 0.5*X, 0.92*Y);
    ctx.save();
    ctx.rotate(-Math.PI/2);
    ctx.fillText("SPECTRAL ORDINATES (Ch(T))", -0.50*X, 0.03*Y);
    ctx.restore();

    // Scale points
    let xmax = 5.0;
    let ymax = 4.0;
    let xs = [];
    let ys = [];
    for (i=0; i<periods.length; i++) {
        xs.push(0.8*X*periods[i]/xmax + 0.1*X);
        ys.push(-0.8*Y*Chs[i]/ymax + 0.9*Y);
    }
    
    // Plot points
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (i=1; i<xs.length; i++) {
        ctx.lineTo(xs[i], ys[i]);
    }
    ctx.stroke();

    // Show T1 vline
    let ChT = ilookup(T, periods, Chs);
    x = 0.8*X*T/xmax + 0.1*X;
    y = -0.8*Y*ChT/ymax + 0.9*Y;
    ctx.strokeStyle = 'darkred';
    ctx.fillStyle = 'darkred';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0.9*Y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x,y, 4, 0, 2*Math.PI);
    ctx.stroke();
    ctx.fill();

    ctx.font = "14pt sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("Ch("+T.toFixed(2)+") = "+ChT.toFixed(2), x+0.01*X, y-0.01*Y);

}

function SpectralShapeFactor(SSC, T) {
    if (SSC == "Ae") {
        if (T <= 0.1) {
            return 0.8 + 15.5*T;
        } else if (T <= 1.5) {
            return Math.min(0.704/T, 2.35);
        } else {
            return 1.056/T**2;
        }
    }
    else if (SSC == "Be") {
        if (T <= 0.1) {
            return 1.0 + 19.4*T;
        } else if (T <= 1.5) {
            return Math.min(0.88/T, 2.94);
        } else {
            return 1.32/T**2;
        }
    } else if (SSC == "Ce") {
        if (T <= 0.1) {
            return 1.3 + 23.8*T;
        } else if (T <= 1.5) {
            return Math.min(1.25/T, 3.68);
        } else {
            return 1.874/T**2;
        }
    } else if (SSC == "De") {
        if (T <= 0.1) {
            return 1.1 + 25.8*T;
        } else if (T <= 1.5) {
            return Math.min(1.98/T, 3.68);
        } else {
            return 2.97/T**2;
        }
    } else if (SSC == "Ee") {
        if (T <= 0.1) {
            return 1.1 + 25.8*T;
        } else if (T <= 1.5) {
            return Math.min(3.08/T, 3.68);
        } else {
            return 4.62/T**2;
        }
    } else {
        return [];
    }
}
