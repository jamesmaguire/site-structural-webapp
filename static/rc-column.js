
function updatePage()
{
    calcLoads();
    calcBarParams();
    drawFigure(0.3);
    setStatusUptodate();
}

function drawFigure(scale)
{
    let canvas = document.getElementById('columnFigure');
    if (canvas.getContext)
    {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Variables
        let Xc = canvas.width/2;
        let Yc = canvas.height/2;
        let Dx = colDx.valueAsNumber;
        let Dy = colDy.valueAsNumber;
        let c = cover.valueAsNumber;
        let dt = tiedb.valueAsNumber;
        let db = bardb.valueAsNumber;
        let barsTB = nbarsTB.valueAsNumber;
        let barsS = nbarsSide.valueAsNumber;

        // Concrete mass
        ctx.lineWidth = 1;
        ctx.fillStyle = 'lightgray';
        ctx.beginPath();
        ctx.rect(Xc-scale*(Dx/2),Yc-scale*(Dy/2),scale*Dx,scale*Dy);
        ctx.fill();
        ctx.stroke();

        // Tie
        

        // Long bars
        
    }
}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
}

function calcBarParams ()
{
    let db = bardb.valueAsNumber;
    let barsTB = nbarsTB.valueAsNumber;
    let barsS = nbarsSide.valueAsNumber;
    let c = cover.valueAsNumber;
    let dt = tiedb.valueAsNumber;
    nbars.value = 2*(barsTB+barsS) - 4;
    barSpcX.value = (colDx.valueAsNumber - 2*c - 2*dt - db)/(barsTB-1);
    barSpcY.value = (colDy.valueAsNumber - 2*c - 2*dt - db)/(barsS-1);
}

function calcLoads ()
{
    let G = deadLoad.valueAsNumber;
    let Q = liveLoad.valueAsNumber;
    loadULS.value = 1.2*G + 1.5*Q;
    loadFire.value = 1.0*G + 0.4*Q;
    beta.value = (G/(G+Q)).toFixed(3);
}
