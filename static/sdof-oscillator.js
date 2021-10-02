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
    let dt = i_dt.valueAsNumber;
    let duration = i_duration.valueAsNumber;
    let nsteps = Math.floor(duration/dt, 1);
    let t = [...Array(nsteps).keys()].map(i => dt*i);
    let fpeak = i_fpeak.valueAsNumber;
    let td = i_td.valueAsNumber;
    let f = t.map(ti => fTriangularImpulse(ti, fpeak, td));

    let svgNS = 'http://www.w3.org/2000/svg';
    svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', 500);
    svg.setAttributeNS(null, 'height', 500);
    svg.setAttributeNS(null, 'viewBox', `${-0.1*duration} ${-0.1*fpeak} ${1.1*duration} ${1.1*fpeak}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");

    let linepath = `M${t[0]},${-f[0]}`;
    for (i=0; i<t.length; i++) {
        linepath += ` L${t[i]},${-f[i]}`;
    }
    let line = document.createElementNS(svgNS, 'path');
    line.setAttributeNS(null, 'd', linepath);
    line.setAttributeNS(null, 'fill', 'none');
    line.setAttributeNS(null, 'stroke', 'black');
    line.setAttributeNS(null, 'stroke-width', .1);

    document.getElementById('forcePlot').innerHTML='';
    document.getElementById('forcePlot').appendChild(svg).appendChild(line);
}

function plotResponse(x, y)
{
    let Width = 500;
    let Height = 500;
    let margin = {left:50, right:50, top:50, bottom:50};
    let plotH = Height - margin.top - margin.bottom;
    let plotW = Width - margin.left - margin.right;

    let xmin = x.reduce((a, b) => a < b ? a : b);
    let xmax = x.reduce((a, b) => a > b ? a : b);
    let ymin = y.reduce((a, b) => a < b ? a : b);
    let ymax = y.reduce((a, b) => a > b ? a : b);
    let dx = xmax - xmin;
    let dy = ymax - ymin;
    x = x.map(n => n*plotW/dx + margin.left + plotW*xmin/dx);
    y = y.map(n => n*plotH/dy - margin.top - plotH*ymax/dy);

    let svgNS = 'http://www.w3.org/2000/svg';
    svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', Width);
    svg.setAttributeNS(null, 'height', Height);
    svg.setAttributeNS(null, 'viewBox', `0 0 ${Width} ${Height}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");

    let xaxis = document.createElementNS(svgNS, 'line');
    xaxis.setAttributeNS(null, 'class', 'axis');
    xaxis.setAttributeNS(null, 'x1', margin.left);
    xaxis.setAttributeNS(null, 'x2', Width - margin.right);
    xaxis.setAttributeNS(null, 'y1', Height-margin.bottom+ymin/dy*plotH);
    xaxis.setAttributeNS(null, 'y2', Height-margin.bottom+ymin/dy*plotH);
    svg.appendChild(xaxis);

    let xticks = document.createElementNS(svgNS, 'g');
    xticks.setAttributeNS(null, 'class', 'xticks');
    [{text:xmin, loc:margin.left}, {text:xmax, loc:Width-margin.right}]
        .map(function(t) {
            let tick = document.createElementNS(svgNS, 'text');
            tick.setAttributeNS(null, 'x', t.loc);
            tick.setAttributeNS(null, 'y', Height-margin.bottom+ymin/dy*plotH);
            tick.innerHTML = t.text;
            xticks.appendChild(tick);
        });
    svg.appendChild(xticks);

    let yaxis = document.createElementNS(svgNS, 'line');
    yaxis.setAttributeNS(null, 'class', 'axis');
    yaxis.setAttributeNS(null, 'x1', margin.left);
    yaxis.setAttributeNS(null, 'x2', margin.left);
    yaxis.setAttributeNS(null, 'y1', Height - margin.bottom);
    yaxis.setAttributeNS(null, 'y2', margin.top);
    svg.appendChild(yaxis);

    let yticks = document.createElementNS(svgNS, 'g');
    yticks.setAttributeNS(null, 'class', 'yticks');
    [{text:ymin, loc:Height-margin.bottom}, {text:ymax, loc:margin.top}]
        .map(function(t) {
            let tick = document.createElementNS(svgNS, 'text');
            tick.setAttributeNS(null, 'x', margin.left);
            tick.setAttributeNS(null, 'y', t.loc);
            tick.innerHTML = t.text.toPrecision(2);
            yticks.appendChild(tick);
        });
    svg.appendChild(yticks);

    let xlabel = document.createElementNS(svgNS, 'text');
    xlabel.setAttributeNS(null, 'class', 'xlabel');
    xlabel.setAttributeNS(null, 'x', margin.left + plotW/2);
    xlabel.setAttributeNS(null, 'y', Height-margin.bottom+ymin/dy*plotH);
    xlabel.innerHTML = 't';
    svg.appendChild(xlabel);

    let ylabel = document.createElementNS(svgNS, 'text');
    ylabel.setAttributeNS(null, 'class', 'ylabel');
    ylabel.setAttributeNS(null, 'x', margin.left);
    ylabel.setAttributeNS(null, 'y', margin.top + plotH/2);
    ylabel.innerHTML = 'u(t)';
    svg.appendChild(ylabel);

    let linepath = ` M${x[0]},${-y[0]}`;
    for (i=1; i<x.length; i++) {
        linepath += ` L${x[i]},${-y[i]}`;
    }
    let line = document.createElementNS(svgNS, 'path');
    line.setAttributeNS(null, 'class', 'plotline');
    line.setAttributeNS(null, 'd', linepath);
    line.setAttributeNS(null, 'fill', 'none');
    svg.appendChild(line);

    document.getElementById('responsePlot').innerHTML='';
    document.getElementById('responsePlot').appendChild(svg);
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
