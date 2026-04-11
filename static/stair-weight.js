function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function runCalcs() {
    const B = i_B.valueAsNumber;
    const L = i_L.valueAsNumber;
    const H = i_H.valueAsNumber;
    const n = i_n.valueAsNumber;
    const t = i_t.valueAsNumber;

    // Dimension checks
    const R = H/n;
    const G = L/n;
    const sloperel = 2*R + G;
    o_R.value = R.toFixed(1);
    o_G.value = G.toFixed(1);
    o_sloperel.value = sloperel.toFixed(1);
    R < 120 ? setPassFail(o_R, threshold=115, inverse=true) : setPassFail(o_R, threshold=190);
    G < 250 ? setPassFail(o_G, threshold=240, inverse=true) : setPassFail(o_G, threshold=355);
    sloperel < 600 ? setPassFail(o_sloperel, threshold=550, inverse=true) : setPassFail(o_sloperel, threshold=700);

    // Calcs
    const Vthroat = Math.sqrt(L**2 + H**2)*t*B/1000**3;
    o_Vthroat.value = Vthroat.toFixed(2);

    const singletread = 0.5*R*G*B;
    const Vtread = n*singletread/1000**3;
    o_Vtread.value = Vtread.toFixed(2);

    const V = Vthroat + Vtread;
    o_V.value = V.toFixed(2);

    const density = i_density.valueAsNumber;
    const SW = V*density;
    o_SW.value = SW.toFixed(2);
    o_SWkg.value = (SW*1000/10).toFixed(0);
    o_SWkPa.value = (SW/B/L*1000**2).toFixed(2);

    // Total loads
    const SDL = i_SDL.valueAsNumber;
    const DLkN = SW + SDL*B*L/1000**2;
    o_DL.value = DLkN.toFixed(1);
    const LL = i_LL.valueAsNumber;
    const LLkN = LL*B*L/1000**2;
    o_LL.value = LLkN.toFixed(1);

    // Per landing loads
    o_DLpl.value = (DLkN/2).toFixed(1);
    o_LLpl.value = (LLkN/2).toFixed(1);
    o_DLplpm.value = (DLkN/2/B*1000).toFixed(2);
    o_LLplpm.value = (LLkN/2/B*1000).toFixed(2);

}

function drawFigure()
{
    document.getElementById('stairFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const B = i_B.valueAsNumber;
    const L = i_L.valueAsNumber;
    const H = i_H.valueAsNumber;
    const n = i_n.valueAsNumber;
    const t = i_t.valueAsNumber;
    const R = H/n;
    const G = L/n;
    const theta = Math.atan(R/G);

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/L, height/H);

    const xmap = n => margin.left + sf*n + width/2 - sf*L/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*H/2;

    const svg = svgElemAppend(stairFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Stair

    let stairpath = `M${xmap(0)},${ymap(0)}`;
    for (let i=1; i<=n; i++) {
        stairpath = stairpath + ` l${0},${-sf*R}`;
        stairpath = stairpath + ` l${sf*G},${0}`;
    }
    // stairpath = stairpath + ` l${0},${sf*(t/Math.cos(theta))}`; // Straight vertical
    stairpath = stairpath + ` l${sf*t*Math.sin(theta)},${sf*t*Math.cos(theta)}`; // Tapered
    stairpath = stairpath + ` l${-sf*n*G},${sf*n*R} z`;
    const stairline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:stairpath,
    });

    const referenceline = svgElemAppend(svg, 'path', {
        class:'concrete dashed',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(L)},${ymap(H)}`,
    });

    // Numbers
    for (let i=0; i<n; i++) {
        svgElemAppend(svg, 'text', {
            x:xmap(i*G - 0.4*G), y:ymap(i*R + 0.3*R)
        }, `${i+1}`);
    }

}

updatePage();
