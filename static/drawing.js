function draw()
{
    var canvas = document.getElementById('cs-circle');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        var X = canvas.width;
        var Y = canvas.height;
        var R = X/3;

        // Circle shape
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'gray';
        ctx.fillStyle = 'lightgray';

        ctx.beginPath();
        ctx.arc(X/2, Y/2, R, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.stroke();

        // Axes
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.setLineDash([5, 5, 15, 5]);
        ctx.beginPath();
        ctx.moveTo(0,Y/2);
        ctx.lineTo(X,Y/2);
        ctx.moveTo(X/2,0);
        ctx.lineTo(X/2,Y);
        ctx.stroke();

        // Text
        ctx.fillStyle = 'black';
        ctx.font = '1rem serif';
        ctx.fillText('x', 0.9*X,0.65*Y);
        ctx.fillText('y', 0.55*X,0.1*Y);
    }
}

// RC Beam
// -----------------------------------------------------------------------------

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.stroke();
}

function draw_beam()
{
    var canvas = document.getElementById('rc-beam');
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var scale = 0.5;
        var B = scale*Number(document.getElementById("B").value);
        var D = scale*Number(document.getElementById("D").value);
        var dbb = scale*Number(document.getElementById("dbb").value); // Diameter of bottom bars
        var dbt = scale*Number(document.getElementById("dbt").value); // Diameter of top bars
        var cover = scale*Number(document.getElementById("cover").value);
        var btmBars = Number(document.getElementById("btmBars").value);
        var topBars = Number(document.getElementById("topBars").value);

        // Concrete
        ctx.lineWidth = 2;
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(0,0,B,D);

        // Bottom bars
        var barSpace = (B-2*cover-dbb)/(btmBars-1);
        var axisDist = cover + (dbb/2);
        for (i = 0; i < btmBars; i++) {
            rebar(ctx, axisDist+(i*barSpace), D-axisDist, dbb);
        }
        var barSpace = (B-2*cover-dbt)/(topBars-1);
        var axisDist = cover + (dbt/2);
        for (i = 0; i < topBars; i++) {
            rebar(ctx, axisDist+(i*barSpace), axisDist, dbt);
        }
    }
}
