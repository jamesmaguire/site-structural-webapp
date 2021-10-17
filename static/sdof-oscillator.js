function initPage()
{
    // System properties
    input('i_m', {initval: 1});
    input('i_c', {initval: 0});
    input('i_k', {initval: 1});
    output('o_wn');
    output('o_Tn');

    // Initial condition
    input('i_u0', {initval: 0});
    input('i_v0', {initval: 0});

    // Force function
    dropdown('i_ftype', ['Triangular impulse']);
    input('i_fpeak', {initval: 1});
    input('i_td', {initval: 1});


    // Analysis
    input('i_dt', {initval: 0.1});
    input('i_duration', {initval: 10});
    output('o_umin');
    output('o_umax');

    updatePage();
}

function updatePage()
{
    runCalcs();
    plotForce();
    setStatusUptodate();
}

function plotForce()
{
    document.getElementById('forcePlot').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const dt = i_dt.valueAsNumber,
          duration = i_duration.valueAsNumber,
          nsteps = Math.floor(duration/dt, 1),
          t = [...Array(nsteps+1).keys()].map(i => dt*i),
          fpeak = i_fpeak.valueAsNumber,
          td = i_td.valueAsNumber,
          f = t.map(ti => fTriangularImpulse(ti, fpeak, td));

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const xmin = t.reduce((a, b) => a < b ? a : b),
          xmax = t.reduce((a, b) => a > b ? a : b),
          ymin = f.reduce((a, b) => a < b ? a : b)-0.5*Math.abs(fpeak),
          ymax = f.reduce((a, b) => a > b ? a : b)+0.5*Math.abs(fpeak),
          dx = xmax - xmin,
          dy = ymax - ymin;

    const xmap = n => (n+xmin)*width/dx + margin.left;
    const ymap = n => (-n+ymax)*height/dy + margin.top;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', width + margin.left + margin.right);
    svg.setAttributeNS(null, 'height', height + margin.top + margin.bottom);
    svg.setAttributeNS(null, 'viewBox', `0 0 `
                       +`${width + margin.left + margin.top} `
                       +`${height + margin.top + margin.bottom}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");
    document.getElementById('forcePlot').appendChild(svg);

    // X axis
    svgElemAppend(svg, 'line', {
        class:'axis',
        x1:xmap(xmin),
        x2:xmap(xmax),
        y1:ymap(0),
        y2:ymap(0)
    });

    // Y axis
    svgElemAppend(svg, 'line', {
        class:'axis',
        x1:xmap(0),
        x2:xmap(0),
        y1:ymap(ymin),
        y2:ymap(ymax)});

    let xticks = document.createElementNS(svgNS, 'g');
    xticks.setAttributeNS(null, 'class', 'xticks');
    [{text:xmin, loc:xmap(xmin)}, {text:xmax, loc:xmap(xmax)}]
        .map(function(t) {
            let tick = document.createElementNS(svgNS, 'text');
            tick.setAttributeNS(null, 'x', t.loc);
            tick.setAttributeNS(null, 'y', ymap(0));
            tick.innerHTML = t.text;
            xticks.appendChild(tick);
        });
    svg.appendChild(xticks);

    let yticks = document.createElementNS(svgNS, 'g');
    yticks.setAttributeNS(null, 'class', 'yticks');
    let tick = document.createElementNS(svgNS, 'text');
    tick.setAttributeNS(null, 'x', xmap(0));
    tick.setAttributeNS(null, 'y', ymap(fpeak));
    tick.innerHTML = fpeak.toPrecision(2);
    yticks.appendChild(tick);
    svg.appendChild(yticks);

    let xlabel = document.createElementNS(svgNS, 'text');
    xlabel.setAttributeNS(null, 'class', 'xlabel');
    xlabel.setAttributeNS(null, 'x', xmap((xmin+xmax)/2));
    xlabel.setAttributeNS(null, 'y', ymap(0));
    xlabel.innerHTML = 't';
    svg.appendChild(xlabel);

    let ylabel = document.createElementNS(svgNS, 'text');
    ylabel.setAttributeNS(null, 'class', 'ylabel');
    ylabel.setAttributeNS(null, 'x', xmap(0));
    ylabel.setAttributeNS(null, 'y', ymap(ymax));
    ylabel.innerHTML = 'f(t)';
    svg.appendChild(ylabel);

    let linepath = `M${xmap(t[0])},${ymap(f[0])}`;
    for (i=0; i<t.length; i++) {
        linepath += ` L${xmap(t[i])},${ymap(f[i])}`;
    }
    let line = document.createElementNS(svgNS, 'path');
    line.setAttributeNS(null, 'class', 'plotline');
    line.setAttributeNS(null, 'd', linepath);
    svg.appendChild(line);

}

function plotResponse(x, y)
{
    document.getElementById('responsePlot').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const xmin = x.reduce((a, b) => a < b ? a : b),
          xmax = x.reduce((a, b) => a > b ? a : b),
          ymin = y.reduce((a, b) => a < b ? a : b),
          ymax = y.reduce((a, b) => a > b ? a : b),
          dx = xmax - xmin,
          dy = ymax - ymin;

    const xmap = n => (n+xmin)*width/dx + margin.left;
    const ymap = n => (-n+ymax)*height/dy + margin.top;

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', width + margin.left + margin.right);
    svg.setAttributeNS(null, 'height', height + margin.top + margin.bottom);
    svg.setAttributeNS(null, 'viewBox', `0 0 `
                       +`${width + margin.left + margin.top} `
                       +`${height + margin.top + margin.bottom}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");
    document.getElementById('responsePlot').appendChild(svg);

    let xaxis = document.createElementNS(svgNS, 'line');
    xaxis.setAttributeNS(null, 'class', 'axis');
    xaxis.setAttributeNS(null, 'x1', xmap(xmin));
    xaxis.setAttributeNS(null, 'x2', xmap(xmax));
    xaxis.setAttributeNS(null, 'y1', ymap(0));
    xaxis.setAttributeNS(null, 'y2', ymap(0));
    svg.appendChild(xaxis);

    let xticks = document.createElementNS(svgNS, 'g');
    xticks.setAttributeNS(null, 'class', 'xticks');
    [{text:xmin, loc:xmap(xmin)}, {text:xmax, loc:xmap(xmax)}]
        .map(function(t) {
            let tick = document.createElementNS(svgNS, 'text');
            tick.setAttributeNS(null, 'x', t.loc);
            tick.setAttributeNS(null, 'y', ymap(0));
            tick.innerHTML = t.text;
            xticks.appendChild(tick);
        });
    svg.appendChild(xticks);

    let yaxis = document.createElementNS(svgNS, 'line');
    yaxis.setAttributeNS(null, 'class', 'axis');
    yaxis.setAttributeNS(null, 'x1', xmap(0));
    yaxis.setAttributeNS(null, 'x2', xmap(0));
    yaxis.setAttributeNS(null, 'y1', ymap(ymin));
    yaxis.setAttributeNS(null, 'y2', ymap(ymax));
    svg.appendChild(yaxis);

    let yticks = document.createElementNS(svgNS, 'g');
    yticks.setAttributeNS(null, 'class', 'yticks');
    [{text:ymin, loc:ymap(ymin)}, {text:ymax, loc:ymap(ymax)}]
        .map(function(t) {
            let tick = document.createElementNS(svgNS, 'text');
            tick.setAttributeNS(null, 'x', xmap(xmin));
            tick.setAttributeNS(null, 'y', t.loc);
            tick.innerHTML = t.text.toPrecision(2);
            yticks.appendChild(tick);
        });
    svg.appendChild(yticks);

    let xlabel = document.createElementNS(svgNS, 'text');
    xlabel.setAttributeNS(null, 'class', 'xlabel');
    xlabel.setAttributeNS(null, 'x', xmap((xmin+xmax)/2));
    xlabel.setAttributeNS(null, 'y', ymap(0));
    xlabel.innerHTML = 't';
    svg.appendChild(xlabel);

    let ylabel = document.createElementNS(svgNS, 'text');
    ylabel.setAttributeNS(null, 'class', 'ylabel');
    ylabel.setAttributeNS(null, 'x', xmap(0));
    ylabel.setAttributeNS(null, 'y', ymap(0));
    ylabel.innerHTML = 'u(t)';
    svg.appendChild(ylabel);

    let linepath = ` M${xmap(x[0])},${ymap(y[0])}`;
    for (i=1; i<x.length; i++) {
        linepath += ` L${xmap(x[i])},${ymap(y[i])}`;
    }
    let line = document.createElementNS(svgNS, 'path');
    line.setAttributeNS(null, 'class', 'plotline');
    line.setAttributeNS(null, 'd', linepath);
    svg.appendChild(line);

}

function runCalcs()
{
    let m = i_m.valueAsNumber;
    let c = i_c.valueAsNumber;
    let k = i_k.valueAsNumber;
    let u0 = i_u0.valueAsNumber;
    let v0 = i_v0.valueAsNumber;
    let dt = i_dt.valueAsNumber;
    let duration = i_duration.valueAsNumber;

    // Set force function
    let nsteps = Math.floor(duration/dt, 1);
    let fpeak = i_fpeak.valueAsNumber;
    let td = i_td.valueAsNumber;
    let t = [...Array(nsteps+1).keys()].map(i => dt*i);
    let f = t.map(ti => fTriangularImpulse(ti, fpeak, td));

    // Frequency/period
    let wn = Math.sqrt(k/m);
    let Tn = 2*Math.PI/wn;
    o_wn.value = wn.toPrecision(3);
    o_Tn.value = Tn.toPrecision(3);

    // Numerical integration (Central Difference Method)
    let u = [u0];
    let a0 = (f[0] - c*v0 - k*u0)/m;
    let uminus1 = u0 - dt*v0 + a0*dt**2/2;
    let khat = m/dt**2 + c/(2*dt);
    let A = m/dt**2 - c/(2*dt);
    let B = k - 2*m/dt**2;
    for (i=0; i<nsteps; i++) {
        let phati;
        if (i === 0) {
            phati = f[i] - A*uminus1 - B*u[i];
        } else {
            phati = f[i] - A*u[i-1] - B*u[i];
        }
        u[i+1] = phati/khat;
    }

    // let v = [v0];
    // let a = [a0];
    // for (i=1; i<nsteps; i++) {
    //     v.push( (u[i+1] - u[i-1])/2*dt );
    //     a.push( (u[i+1] - 2*u[i] - u[i-1])/dt**2 );
    // }
    
    o_umin.value = u.reduce((a, b) => a < b ? a : b).toPrecision(3);
    o_umax.value = u.reduce((a, b) => a > b ? a : b).toPrecision(3);
    plotResponse(t, u);

}

function fTriangularImpulse(t, P, td)
{
    if (t >= 0 && t <= td) {
        return P*(1 - t/td);
    } else {
        return 0;
    }
}
