function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{

    dropdown('i_beamtype', [
        'Simply supported',
        'Cantilever',
    ]);
    
    input('i_w1', {initval:10, units:'kN/m'});
    input('i_w2', {initval:10, units:'kN/m'});
    input('i_L', {initval:6, units:'m'});
    input('i_E', {initval:200, units:'GPa'});
    input('i_I', {initval:300e6, units:'mm<sup>4</sup>'});
    slider('i_x');
    output('o_x', {units:'m'});
    
    output('o_RA', {units:'kN'});
    output('o_RB', {units:'kN'});
    output('o_Vmax', {units:'kN'});
    output('o_Vx', {units:'kN'});
    output('o_Mmax', {units:'kNm'});
    output('o_Mx', {units:'kNm'});
    output('o_dmax', {units:'mm'});
    output('o_dx', {units:'mm'});

    updatePage();
}

function runCalcs() {

    const w1 = i_w1.valueAsNumber;
    const w2 = i_w2.valueAsNumber;
    const L = i_L.valueAsNumber;
    const E = i_E.valueAsNumber;
    const I = i_I.valueAsNumber;
    const x = i_x.valueAsNumber*L/100;
    o_x.value = x.toFixed(2);
    let wx, Vmax, Vx, Mmax, Mx, dmax, dx;
    let RA, RB, MA;
    let samples = 100, xs = [...Array(samples+1).keys()].map(n => n*L/samples);

    // Simply supported beam with UDL
    const beamtype = i_beamtype.value;
    if (beamtype === 'Simply supported') {
        // Formulas: https://calcresource.com/statics-simple-beam.html#anchor-17
        showInput(o_RB);
        RA = (2*w1+w2)*L/6;
        RB = (w1+2*w2)*L/6;
        wx = x => w1 + (w2-w1)*x/L;
        Vx = x => RA - (w1+wx(x))*x/2;
        Mx = x => RA*x - (2*w1+wx(x))*x**2/6;
        dx = x => (((8*w1)+(7*w2))*x*L**3/(360*E*I) - RA*x**3/(6*E*I) + (4*w1+wx(x))*x**4/(120*E*I))*1000**3;
        // Maximums
        Vmax = Math.max(RA,RB);
        Mmax = xs.map(x => Mx(x)).reduce((a,b) => Math.max(a,b));
        dmax = xs.map(x => dx(x)).reduce((a,b) => Math.max(a,b));
    } else if (beamtype === 'Cantilever') {
        // Formulas: https://calcresource.com/statics-cantilever-beam.html#anchor-15
        hideInput(o_RB);
        RA = (w1+w2)*L/2;
        MA = -(w1+2*w2)*L**2/6;
        RB = 0;
        wx = x => w1 + (w2-w1)*x/L;
        Vx = x => RA - (w1+w2)*x/2;
        Mx = x => RA*x + MA - (2*w1+wx(x))*x**2/6;
        dx = x => (-RA*x**3/(6*E*I) - MA*x**2/(2*E*I) + (4*w1+wx(x))*x**4/(120*E*I))*1000**3;
        // Maximums
        Vmax = RA;
        Mmax = MA;
        dmax = xs.map(x => dx(x)).reduce((a,b) => Math.max(a,b));
    }

    // Set outputs
    o_RA.value = RA.toFixed(0);
    o_RB.value = RB.toFixed(0);
    o_dx.value = dx(x).toFixed(1);
    o_Vmax.value = Vmax.toFixed(1);
    o_Vx.value = Vx(x).toFixed(1);
    o_Mmax.value = Mmax.toFixed(1);
    o_Mx.value = Mx(x).toFixed(1);
    o_dmax.value = dmax.toFixed(1);

    // Diagrams
    document.getElementById('outputDiagram').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/L, height/L);

    const xmap = n => margin.left + sf*n;
    const ymap = n => margin.top  - sf*n;

    const svg = svgElemAppend(outputDiagram, 'svg', {
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

    // Load diagram
    document.getElementById('loadDiagram').innerHTML='';
    const svg2 = svgElemAppend(loadDiagram, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    svgElemAppend(svg2, 'line', {
        class:'diagramaxis', x1:xmap(0), x2:xmap(L), y1:ymap(-L/2), y2:ymap(-L/2)
    });
    const sfw = L/4/Math.max(w1,w2);
    let loadcurve = `M${xmap(0)},${ymap(-L/2)}`;
    loadcurve += `L${xmap(0)},${ymap(-L/2+sfw*w1)}`;
    loadcurve += `L${xmap(L)},${ymap(-L/2+sfw*w2)}`;
    loadcurve += `L${xmap(L)},${ymap(-L/2)} Z`;
    svgElemAppend(svg2, 'path', {
        class:'diagramarea', d:loadcurve
    });
    svgElemAppend(svg2, 'text',
                  {x:xmap(0), y:ymap(-L/2+sfw*w1), dy: -10, dx: -10}, `w1`);
    svgElemAppend(svg2, 'text',
                  {x:xmap(L), y:ymap(-L/2+sfw*w2), dy: -10, dx: -10}, `w2`);
    // RA + arrow
    let sfR = L/4/Math.max(RA,RB);
    svgElemAppend(svg2, 'text',
                  {x:xmap(0), y:ymap(-L/2-sfR*RA), dy: 25, dx: -10}, `RA`);
    let arrowhead = `M${xmap(0)},${ymap(-L/2-sfR*RA)}`;
    arrowhead += `L${xmap(0)},${ymap(-L/2 - L/50)}`;
    arrowhead += 'l5,10 l-10,0 l5,-10 z';
    svgElemAppend(svg2, 'path', {
        class:'arrow', d:arrowhead
    });
    // RB + arrow
    if (beamtype === 'Simply supported') {
        svgElemAppend(svg2, 'text',
                      {x:xmap(L), y:ymap(-L/2-sfR*RB), dy: 25, dx: -10}, `RB`);
        arrowhead = `M${xmap(L)},${ymap(-L/2-sfR*RB)}`;
        arrowhead += `L${xmap(L)},${ymap(-L/2 - L/50)}`;
        arrowhead += 'l5,10 l-10,0 l5,-10 z';
        svgElemAppend(svg2, 'path', {
            class:'arrow', d:arrowhead
        });
    }
    // MA + arrow
    if (beamtype === 'Cantilever') {
        svgElemAppend(svg2, 'text',
                      {x:xmap(-2*L/20), y:ymap(-L/2), dy: 5, dx: -30}, `MA`);
        arrowhead = `M${xmap(-L/20)},${ymap(-L/2-L/10)}`;
        arrowhead += `Q${xmap(-2*L/20)},${ymap(-L/2)} ${xmap(-L/20)},${ymap(-L/2+L/10)}`;
        arrowhead += 'l2,10 l-10,-1 l8,-9';
        svgElemAppend(svg2, 'path', {
            class:'arrow', d:arrowhead
        });
    }

}

initPage();
