function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{

    dropdown('i_beamtype', [
        'Simply supported with UDL',
        'Cantilever with UDL'
    ]);
    
    input('i_w', {initval:10, units:'kN/m'});
    input('i_L', {initval:6, units:'m'});
    input('i_E', {initval:200, units:'GPa'});
    input('i_I', {initval:2000e3, units:'mm<sup>4</sup>'});
    input('i_x', {initval:3, units:'m'});
    
    output('o_Vmax', {units:'kN'});
    output('o_Vx', {units:'kN'});
    output('o_Mmax', {units:'kNm'});
    output('o_Mx', {units:'kNm'});
    output('o_dmax', {units:'mm'});
    output('o_dx', {units:'mm'});

    updatePage();
}

function runCalcs() {

    const w = i_w.valueAsNumber;
    const L = i_L.valueAsNumber;
    const E = i_E.valueAsNumber;
    const I = i_I.valueAsNumber;
    const x = i_x.valueAsNumber;
    let Vmax, Vx, Mmax, Mx, dmax, dx;
    
    // Simply supported beam with UDL
    const beamtype = i_beamtype.value;
    if (beamtype === 'Simply supported with UDL') {
        Vmax = w*L/2;
        Vx = x => w*(L/2 - x);
        Mmax = w*L**2/8;
        Mx = x => w*x*(L-x)/2;
        dmax = 5*w*L**4/(384*E*I)*1000**3;
        dx = x => w*x*(L**3 - 2*L*x**2 + x**3)/(24*E*I)*1000**3;
    } else if (beamtype === 'Cantilever with UDL') {
        Vmax = w*L;
        Vx = x => w*x;
        Mmax = w*L**2/2;
        Mx = x => w*x**2/2;
        dmax = w*L**4/(8*E*I)*1000**3;
        dx = x => w*(x**4-4*L**3*x-3*x**4)/(48*E*I)*1000**3;
    }

    // Set outputs
    o_dx.value = dx(x).toFixed(1);
    o_Vmax.value = Vmax.toFixed(1);
    o_Vx.value = Vx(x).toFixed(1);
    o_Mmax.value = Mmax.toFixed(1);
    o_Mx.value = Mx(x).toFixed(1);
    o_dmax.value = dmax.toFixed(1);

    // Diagram
    document.getElementById('beamDiagram').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/L, height/L);

    const xmap = n => margin.left + sf*n;
    const ymap = n => margin.top  - sf*n;

    const svg = svgElemAppend(beamDiagram, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    let points = 50;

    let sfV = L/6/Vmax;
    let shearpath = `M${xmap(0)},${ymap(-L/6)} `;
    shearpath += [...Array(points+1).keys()]
                .map(n => n*L/points)
                .map(x => `L${xmap(x)},${ymap(-L/6 + sfV*Vx(x))}`)
        .join(' ');
    shearpath += ` L${xmap(L)},${ymap(-L/6)} `;
    const shearcurve = svgElemAppend(svg, 'path', {
        class: 'diagramarea', d:shearpath
    });
    const shearx = svgElemAppend(svg, 'line', {
        class: 'diagramx',
        x1:xmap(x), x2:xmap(x),
        y1:ymap(-L/6 + sfV*Vx(x)), y2:ymap(-L/6)
    });

    let sfM = L/6/Mmax;
    let momentpath = `M${xmap(0)},${ymap(-L/2)} `;
    momentpath += [...Array(points+1).keys()]
                .map(n => n*L/points)
                .map(x => `L${xmap(x)},${ymap(-L/2 + sfM*Mx(x))}`)
        .join(' ');
    momentpath += ` L${xmap(L)},${ymap(-L/2)}`;
    const momentcurve = svgElemAppend(svg, 'path', {
        class: 'diagramarea', d:momentpath
    });
    const momentx = svgElemAppend(svg, 'line', {
        class: 'diagramx',
        x1:xmap(x), x2:xmap(x),
        y1:ymap(-L/2 + sfM*Mx(x)), y2:ymap(-L/2)
    });

    let sfd = L/6/dmax*1000;
    let deflectionpath = `M${xmap(0)},${ymap(-5*L/6)} `;
    deflectionpath += [...Array(points+1).keys()]
                .map(n => n*L/points)
                .map(n => `L${xmap(n)},${ymap(-5*L/6 - sfd*dx(n)/1000)}`)
        .join(' ');
    deflectionpath += `L${xmap(L)},${ymap(-5*L/6)}`;
    const deflectioncurve = svgElemAppend(svg, 'path', {
        class: 'diagramarea', d:deflectionpath
    });
    const deflectionx = svgElemAppend(svg, 'line', {
        class: 'diagramx',
        x1:xmap(x), x2:xmap(x),
        y1:ymap(-5*L/6 - sfd*dx(x)/1000), y2:ymap(-5*L/6)
    });

    // X-lines
    const beam = svgElemAppend(svg, 'line', {
        class:'diagramaxis', x1:xmap(0), x2:xmap(L), y1:ymap(-L/6), y2:ymap(-L/6)
    });
    const beam2 = svgElemAppend(svg, 'line', {
        class:'diagramaxis', x1:xmap(0), x2:xmap(L), y1:ymap(-L/2), y2:ymap(-L/2)
    });
    const beam3 = svgElemAppend(svg, 'line', {
        class:'diagramaxis', x1:xmap(0), x2:xmap(L), y1:ymap(-5*L/6), y2:ymap(-5*L/6)
    });

    // Labels
    svgElemAppend(svg, 'text',
                  {x:xmap(L), y:ymap(-L/6), dy: 7, dx: 20,}, `Vx`);
    svgElemAppend(svg, 'text',
                  {x:xmap(L), y:ymap(-L/2), dy: 7, dx: 20,}, `Mx`);
    svgElemAppend(svg, 'text',
                  {x:xmap(L), y:ymap(-5*L/6), dy: 7, dx: 20,}, `dx`);

    
}

initPage();
