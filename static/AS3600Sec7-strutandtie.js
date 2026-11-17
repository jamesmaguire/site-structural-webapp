
function initPage()
{
    input('i_D', {initval:2000, units:'mm'});
    input('i_spacing', {initval:3400, units:'mm'});
    input('i_W', {initval:1000, units:'mm'});
    input('i_Dp', {initval:600, units:'mm'});
    input('i_Ll', {initval:700, units:'mm'});

    input('i_P', {initval:2000, units:'kN'});

    input('i_fc', {initval:32, units:'MPa'});

    output('o_theta', {units:'°'});
    output('o_Pp',   {units:'kN'});
    output('o_Cstar', {units:'kN'});
    output('o_Tstar', {units:'kN'});

    input('i_nb', {initval:6});
    input('i_db', {initval:24, prefix:'N', align:'left'});

    updatePage();
}

function inputState()
{
    const state = {};
    document.querySelectorAll('input[id^="i_"]').forEach(el => {
        const key = el.id.substring(2); // remove "i_"
        state[key] = el.type === "number" ? el.valueAsNumber : el.value;
    });
    return state;
}

function writeOutputs(s)
{
    const thetaRad = Math.atan(s.D/(s.spacing/2));
    s.theta = thetaRad*180/Math.PI;
    o_theta.value = s.theta.toFixed(2);

    const Pp = s.P/2;
    o_Pp.value = Pp.toFixed(0);
    const Cstar = Pp/Math.sin(thetaRad);
    o_Cstar.value = Cstar.toFixed(0);
    const Tstar = Pp/Math.tan(thetaRad);
    o_Tstar.value = Tstar.toFixed(0);
    return s;
}

function updatePage()
{
    let s = inputState();
    s = writeOutputs(s);
    drawFigure(s);
    setStatusUptodate();
}

function drawFigure(s) {
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const pierDepth = 300;
    const loadHeight = 300;
    const cutDepth = 0.25*s.Dp;
    const Lcap = s.spacing + 2*s.Dp;    // pile cap: Dp/2 overhang + pile + spacing + pile + Dp/2 overhang
    const c = 100;                      // cover
    const totalH = s.D + pierDepth + cutDepth/2 + loadHeight;
    const totalW = Lcap;

    const sf = Math.min(height/totalH, width/totalW);

    const xmap = n => margin.left + sf*n + width/2 - sf*(Lcap/10+s.W)/2;
    const ymap = n => margin.top  - sf*n + height/2 - sf*s.D/2;

    elementElevation.innerHTML='';
    let svg = svgElemAppend(elementElevation, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Pile cap
    svgElemAppend(svg, 'rect', {
        class:'concrete',
        x:xmap(-Lcap/2), y:ymap(0),
        width:sf*Lcap, height:sf*s.D
    });
    // Pile cap side
    svgElemAppend(svg, 'rect', {
        class:'concrete',
        x:xmap(Lcap/2 + Lcap/10), y:ymap(0),
        width:sf*s.W, height:sf*s.D
    });

    // Load pad: 20 mm thick, indicates the load width
    svgElemAppend(svg, 'rect', {
        class:'concrete',
        x:xmap(-s.Ll/2), y:ymap(20),
        width:sf*s.Ll, height:sf*20
    });

    // Load arrows: one at the centre of each of 5 equal segments
    const arrowHW = 0.25*sf*s.Ll/5;      // arrowhead half width
    const arrowHL = 0.15*sf*loadHeight; // arrowhead length
    const yBase = ymap(20) - arrowHL;   // arrowhead base line
    for (let i = 0; i < 5; i++) {
        const x = xmap(-s.Ll/2 + (i + 0.5)*s.Ll/5);
        svgElemAppend(svg, 'path', {
            class:'loadarrow',
            d:`M${x} ${ymap(loadHeight)}`
                + `L${x} ${yBase}`
                + `l${-arrowHW} 0`
                + `L${x} ${ymap(20)}`
                + `l${arrowHW} ${-arrowHL}`
                + `L${x} ${yBase}`
                + `Z`
        });
    }

    // Piles
    [-s.spacing/2, s.spacing/2, Lcap/2+Lcap/10+s.W/2].forEach(nodeX => {
        // Main pile
        svgElemAppend(svg, 'path', {
            class:'concrete',
            d:`M${xmap(nodeX-s.Dp/2)} ${ymap(-s.D)}`
                + `l${0} ${sf*pierDepth}`
                + `q${sf*s.Dp/4} ${-sf*0.25*s.Dp} ${sf*s.Dp/2} ${0}`
                + `q${sf*s.Dp/4} ${sf*0.25*s.Dp} ${sf*s.Dp/2} ${0}`
                + `l${0} ${-sf*pierDepth}`
                + `Z`
        });
        // Hidden edge of the cut
        svgElemAppend(svg, 'path', {
            class:'concrete',
            style:'fill:none',
            d:`M${xmap(nodeX-s.Dp/2)} ${ymap(-s.D-pierDepth)}`
                + `q${sf*s.Dp/4} ${sf*0.25*s.Dp} ${sf*s.Dp/2} ${0}`
        });
    });

    // Bottom reo
    const yc = ymap(-s.D+c);
    const xL = xmap(-Lcap/2+c);
    const xR = xmap(Lcap/2-c);
    const rCog = sf*4*s.db; // cog bend radius
    const lCog = sf*20*s.db; // cog tail length
    svgElemAppend(svg, 'path', {
        class:'rebar',
        style:`stroke-width:${sf*s.db}`,
        'stroke-linejoin':'round',
        d:`M ${xL} ${yc - lCog}`
        + ` L ${xL} ${yc - rCog}`
        + ` Q ${xL} ${yc} ${xL + rCog} ${yc}`
        + ` L ${xR - rCog} ${yc}`
        + ` Q ${xR} ${yc} ${xR} ${yc - rCog}`
        + ` L ${xR} ${yc - lCog}`
    });
    // Tie reo in side view
    // evenly spaced across the middle 70% of the pier width
    for (let j = 0; j < s.nb; j++) {
        const xj = Lcap/2 + Lcap/10 + s.W/2 - 0.35*s.Dp + j*(0.7*s.Dp/(s.nb-1));
        svgElemAppend(svg, 'circle', {
            class:'rebar',
            cx:xmap(xj),
            cy:ymap(-s.D+c),
            r:sf*s.db/2,
        });
    }

}

initPage();
