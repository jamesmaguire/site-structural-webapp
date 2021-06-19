function updatePage()
{
    circleFigure();
    circleCalcs();
    rectangleFigure();
    rectangleCalcs();
    setStatusUptodate();
}

function axes(ctx)
{
    
}

function circleFigure()
{
    let canvas = document.getElementById('circleFig');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        let X = canvas.width;
        let Y = canvas.height;
        let R = X/3;

        // Circle shape
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'lightgray';
        ctx.beginPath();
        ctx.arc(X/2, Y/2, R, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.stroke();

        // Axes
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0.1*X,Y/2);
        ctx.lineTo(0.9*X,Y/2);
        ctx.moveTo(X/2,0.1*Y);
        ctx.lineTo(X/2,0.9*Y);
        ctx.stroke();

        // Text
        ctx.fillStyle = 'black';
        ctx.font = '11pt';
        ctx.fillText('x', 0.95*X,0.52*Y);
        ctx.fillText('y', 0.48*X,0.05*Y);

        // Radius
        ctx.beginPath();
        ctx.moveTo(X/2, Y/2);
        ctx.lineTo(X/2 + R/Math.sqrt(2), Y/2 - R/Math.sqrt(2));
        ctx.stroke();
        ctx.fillText('r', 0.65*X,0.43*Y);
    }
}

function circleCalcs ()
{
    let I = Math.PI*circleR.valueAsNumber**4/4;
    circleImm4.value = engineeringNotation(I);
    circleIm4.value = engineeringNotation(I/1e12);
}

function rectangleFigure()
{
    let canvas = document.getElementById('rectangleFig');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        let X = canvas.width;
        let Y = canvas.height;

        // Rectangle shape
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'lightgray';
        ctx.beginPath();
        ctx.moveTo(X/3,Y/5);
        ctx.lineTo(X/3,4*Y/5);
        ctx.lineTo(2*X/3,4*Y/5);
        ctx.lineTo(2*X/3,Y/5);
        ctx.lineTo(X/3,Y/5);
        ctx.fill();
        ctx.stroke();

        // Axes
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0.1*X,Y/2);
        ctx.lineTo(0.9*X,Y/2);
        ctx.moveTo(X/2,0.1*Y);
        ctx.lineTo(X/2,0.9*Y);
        ctx.stroke();

        // Text
        ctx.fillStyle = 'black';
        ctx.font = '11pt';
        ctx.fillText('x', 0.95*X,0.52*Y);
        ctx.fillText('y', 0.48*X,0.05*Y);

        // Dimensions
        ctx.fillText('b', 1.2*X/3,4.4*Y/5);
        ctx.fillText('h', 2.1*X/3,2*Y/5);
    }
}

function rectangleCalcs ()
{
    let I = rectangleb.valueAsNumber*rectangleh.valueAsNumber**3/12;
    rectImm4.value = engineeringNotation(I);
    rectIm4.value = engineeringNotation(I/1e12);
}

function engineeringNotation(number) {
    var unitMap = {"e15":1e15, "e12":1e12, "e9":1e9, "e6":1e6, "e3":1e3, "e0":1e0,
                   "e-3":1e-3, "e-6":1e-6, "e-9":1e-9, "e-12":1e-12, "e-15":1e-15};
    for(var unit in unitMap) {
        if (number >= unitMap[unit] && number < unitMap[unit]*1000) {
            return (number / unitMap[unit]).toPrecision(3) + unit;
        }
    }
    return number.toPrecision(3);
}
