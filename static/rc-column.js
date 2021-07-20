
function updatePage()
{
    // calcLoads();
    // calcBarParams();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('columnFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let col = {
        L:i_L.valueAsNumber,
        Dx:i_Dx.valueAsNumber,
        Dy:i_Dy.valueAsNumber,
        Dia:i_Dia.valueAsNumber,
        c:i_c.valueAsNumber,
        db:i_db.valueAsNumber,
        barspcx:i_barspcx.valueAsNumber,
        barspcy:i_barspcy.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
    };
    let scalefactor = 0.9*Math.min(canvas.width/col.Dx, canvas.height/col.Dy);
    if (i_shape.value == "circ") {
        scalefactor = 0.8*Math.min(canvas.width/col.Dia, canvas.height/col.Dia);
    }
    for (key in col) {
        col[key] = scalefactor*col[key];
    }
    col.nbarstop = i_nbarstop.valueAsNumber;
    col.nbarsside = i_nbarsside.valueAsNumber;
    col.nbarscirc = i_nbarscirc.valueAsNumber;
    col.nbars = o_nbars.valueAsNumber;
    col.shape = i_shape.value;

    if (col.shape == "rect") {
        // Column outline
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.rect((X-col.Dx)/2,(Y-col.Dy)/2,col.Dx,col.Dy);
        ctx.stroke();

        // Top bars
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        let barspc = (col.Dx-2*(col.c+col.dbt)-col.db)/(col.nbarstop-1);
        console.log(barspc);
        for (i = 0; i < col.nbarstop; i++) {
            rebar(ctx,
                  (X-col.Dx)/2 + col.c+col.dbt+col.db/2 + (i*barspc),
                  (Y-col.Dy)/2 + (col.c+col.dbt+col.db/2),
                  col.db);
            rebar(ctx,
                  (X-col.Dx)/2 + col.c+col.dbt+col.db/2 + (i*barspc),
                  (Y+col.Dy)/2 - (col.c+col.dbt+col.db/2),
                  col.db);
        }

        // Side bars
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        barspc = (col.Dy-2*(col.c+col.dbt)-col.db)/(col.nbarsside-1);
        for (i = 1; i < col.nbarsside-1; i++) {
            rebar(ctx,
                  (X-col.Dx)/2 + (col.c+col.dbt+col.db/2),
                  (Y-col.Dy)/2 + col.c+col.dbt+col.db/2 + (i*barspc),
                  col.db);
            rebar(ctx,
                  (X+col.Dx)/2 - (col.c+col.dbt+col.db/2),
                  (Y-col.Dy)/2 + col.c+col.dbt+col.db/2 + (i*barspc),
                  col.db);
        }

        // Stirrups
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        // I've trimmed one pixel to give the stirrup a more visually consistent size
        roundedrect(ctx, (X-col.Dx)/2+col.c+1, (Y-col.Dy)/2+col.c+1,
                    col.Dx-2*col.c-2, col.Dy-2*col.c-2, 3*col.dbt/2);
        roundedrect(ctx, (X-col.Dx)/2+col.c+col.dbt, (Y-col.Dy)/2+col.c+col.dbt,
                    col.Dx-2*col.c-2*col.dbt, col.Dy-2*col.c-2*col.dbt, col.dbt/2);

    } else if (col.shape == 'circ') {
        // Column outline
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.arc(X/2 ,Y/2 , col.Dia/2, 0, 2*Math.PI);
        ctx.stroke();

        // Stirrups
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(X/2 ,Y/2 , col.Dia/2-col.c-1, 0, 2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(X/2 ,Y/2 , col.Dia/2-col.c-col.dbt, 0, 2*Math.PI);
        ctx.stroke();

        // Longitudinal bars
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        for (angle = 0; angle < 2*Math.PI; angle+=(2*Math.PI)/col.nbarscirc) {
            rebar(ctx,
                  X/2 + (col.Dia/2-col.c-col.dbt-col.db/2)*Math.cos(angle),
                  Y/2 + (col.Dia/2-col.c-col.dbt-col.db/2)*Math.sin(angle), col.db);
        }

    }
}

function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.stroke();
}

function roundedrect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
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
