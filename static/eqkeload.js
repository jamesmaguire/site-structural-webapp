function initPage()
{
    
    // Natural period
    dropdown('i_frametype', ['Moment resisting steel frame',
                             'Moment resisting concrete frame',
                             'Eccentrically braced steel frames',
                             'All other structures',]);
    output('o_kt');
    input('i_hn', {initval:10, units:'m'});
    output('o_T1simple', {units:'s'});
    input('i_T1', {initval:0.5, units:'s'});

    // Spectral shape factor
    dropdown('i_SSC', ['Strong rock, Ae', 
                       'Rock, Be', 
                       'Shallow soil, Ce', 
                       'Deep or soft soil, De', 
                       'Very soft soil, Ee',]);

    // Base shear
    input('i_kp', {initval:1});
    input('i_Z', {initval:0.08});
    input('i_Spmu', {initval:1.5});
    input('i_nlevels', {initval:5});
    output('o_Wt', {units:'kN'});
    output('o_V', {units:'kN'});

    // Equivalent static forces
    const nlevels = i_nlevels.valueAsNumber;
    let html = '<table><tr>';
    html += '<th>Level</th>';
    html += '<th>Height, h<sub>i</sub></th>';
    html += '<th>Weight, W<sub>i</sub></th>';
    html += '<th>k<sub>Fi</sub></th>';
    html += '<th>Force, F<sub>i</sub></th>';
    html += '</tr>';
    for (i=1; i<nlevels+1; i++) {
        html += `<tr><td>${i}</td>`;
        html += `<td><span class='inputspan'>`;
        html += `<input id='h${i}' class='right' type='number' onchange='updatePage();' value=${3*i}> m`;
        html += `</span></td>`;
        html += `<td><span class='inputspan'>`;
        html += `<input id='W${i}' class='right' type='number' onchange='updatePage();' value=100> kN`;
        html += `</span></td>`;
        html += `<td><span class='outputspan'>`;
        html += `<input id='kF${i}' class='right' type='number' value=0>`;
        html += `</span></td>`;
        html += `<td><span class='outputspan'>`;
        html += `<input id='F${i}' class='right' type='number' value=0> kN`;
        html += `</span></td>`;
        html += `</tr>`;
    }
    document.getElementById('leveltable').innerHTML = html;

    updatePage();
}

function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function runCalcs()
{

    // Natural period
    let frametype = i_frametype.value;
    let hn = i_hn.valueAsNumber;
    let kt = {"Moment resisting steel frame":0.11,
              "Moment resisting concrete frame":0.075,
              "Eccentrically braced steel frames":0.06,
              "All other structures":0.05};
    let T1 = i_T1.valueAsNumber;
    T1simple = 1.25*kt[frametype]*hn**0.75;
    o_kt.value = kt[frametype];
    o_T1simple.value = T1simple.toFixed(2);

    // Spectral shape factor
    let periods = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
                   1.2, 1.5, 1.7, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    let SSC = i_SSC.value;
    let Ch = periods.map(T => SpectralShapeFactor(SSC, T));
    let ChT = ilookup(T1, periods, Ch);

    /////////////////////////////////////////////////////////////////////////////
    // Plot

    document.getElementById('svgplot').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const xmin = 0, xmax = 5.0,
          ymin = 0, ymax = 4.5,
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
    document.getElementById('svgplot').appendChild(svg);

    let xaxis = document.createElementNS(svgNS, 'line');
    xaxis.setAttributeNS(null, 'class', 'axis');
    xaxis.setAttributeNS(null, 'x1', xmap(xmin));
    xaxis.setAttributeNS(null, 'x2', xmap(xmax));
    xaxis.setAttributeNS(null, 'y1', ymap(0));
    xaxis.setAttributeNS(null, 'y2', ymap(0));
    svg.appendChild(xaxis);

    let xticks = document.createElementNS(svgNS, 'g');
    xticks.setAttributeNS(null, 'class', 'xticks');
    [xmin, xmax].map(function(t) {
        let tick = document.createElementNS(svgNS, 'text');
        tick.setAttributeNS(null, 'x', xmap(t));
        tick.setAttributeNS(null, 'y', ymap(0));
        tick.innerHTML = t;
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
    [ymin, ymax].map(function(t) {
        let tick = document.createElementNS(svgNS, 'text');
        tick.setAttributeNS(null, 'x', xmap(0));
        tick.setAttributeNS(null, 'y', ymap(t));
        tick.innerHTML = t;
        yticks.appendChild(tick);
    });
    svg.appendChild(yticks);

    let xlabel = document.createElementNS(svgNS, 'text');
    xlabel.setAttributeNS(null, 'class', 'xlabel');
    xlabel.setAttributeNS(null, 'x', xmap((xmin+xmax)/2));
    xlabel.setAttributeNS(null, 'y', ymap(0));
    xlabel.innerHTML = 'Period, T (s)';
    svg.appendChild(xlabel);

    let ylabel = document.createElementNS(svgNS, 'text');
    ylabel.setAttributeNS(null, 'class', 'ylabel');
    ylabel.setAttributeNS(null, 'x', xmap(0));
    ylabel.setAttributeNS(null, 'y', ymap(ymax/2));
    ylabel.innerHTML = 'Ch(T)';
    svg.appendChild(ylabel);

    let linepath = `M${xmap(periods[0])},${ymap(Ch[0])}`;
    for (i=0; i<periods.length; i++) {
        linepath += ` L${xmap(periods[i])},${ymap(Ch[i])}`;
    }
    let line = document.createElementNS(svgNS, 'path');
    line.setAttributeNS(null, 'class', 'plotline');
    line.setAttributeNS(null, 'd', linepath);
    svg.appendChild(line);

    let hl = document.createElementNS(svgNS, 'line');
    hl.setAttributeNS(null, 'class', 'highlight');
    hl.setAttributeNS(null, 'x1', xmap(T1));
    hl.setAttributeNS(null, 'x2', xmap(T1));
    hl.setAttributeNS(null, 'y1', ymap(0));
    hl.setAttributeNS(null, 'y2', ymap(ChT));
    svg.appendChild(hl);
    hl = document.createElementNS(svgNS, 'circle');
    hl.setAttributeNS(null, 'class', 'highlight');
    hl.setAttributeNS(null, 'cx', xmap(T1));
    hl.setAttributeNS(null, 'cy', ymap(ChT));
    hl.setAttributeNS(null, 'r', 3);
    svg.appendChild(hl);

    let callout = document.createElementNS(svgNS, 'text');
    callout.setAttributeNS(null, 'x', xmap(T1)+0.02*width);
    callout.setAttributeNS(null, 'y', ymap(ChT));
    callout.innerHTML = `Ch(${T1.toPrecision(2)}) = ${ChT.toPrecision(3)}`;
    svg.appendChild(callout);

    /////////////////////////////////////////////////////////////////////////////

    // Base shear
    const nlevels = i_nlevels.valueAsNumber;
    const kp = i_kp.valueAsNumber;
    const Z = i_Z.valueAsNumber;
    const Spmu = i_Spmu.valueAsNumber;
    let k = ilookup(T1, [0.5, 2.5], [1, 2]);
    let W = [];
    let h = [];
    let sumWhk = 0;
    for (i=1; i<nlevels+1; i++) {
        if (document.getElementById(`h${i}`)) {
            h.push(document.getElementById(`h${i}`).valueAsNumber);
            W.push(document.getElementById(`W${i}`).valueAsNumber);
        } else {
            h.push(0);
            W.push(0);
        }
        sumWhk += W[i-1] * h[i-1]**k;
    }
    const Wt = W.reduce((a,b) => a+b);
    const V = kp*Z*ChT*Spmu*Wt;
    o_Wt.value = Wt.toFixed(0);
    o_V.value = V.toFixed(0);

    // Equivalent static forces
    // const table = document.getElementById('leveltable');
    let kF = [];
    let F = [];
    for (i=0; i<nlevels; i++) {
        let kFi = W[i]*h[i]**k/sumWhk;
        kF.push(kFi);
        F.push(kFi*V);
        if (document.getElementById(`h${i+1}`)) {
            document.getElementById(`kF${i+1}`).value = kF[i].toFixed(3);
            document.getElementById(`F${i+1}`).value = F[i].toFixed(1);
        }
    }

    // Rebuild table
    let html = '<table><tr>';
    html += '<th>Level</th>';
    html += '<th>Height, h<sub>i</sub></th>';
    html += '<th>Weight, W<sub>i</sub></th>';
    html += '<th>k<sub>Fi</sub></th>';
    html += '<th>Force, F<sub>i</sub></th>';
    html += '</tr>';
    for (i=1; i<nlevels+1; i++) {
        if (i-1 < W.length) {
            html += `<tr><td>${i}</td>`;
            html += `<td><span class='inputspan'>`;
            html += `<input id='h${i}' class='right' type='number' onchange='updatePage();' value=${h[i-1]}> m`;
            html += `</span></td>`;
            html += `<td><span class='inputspan'>`;
            html += `<input id='W${i}' class='right' type='number' onchange='updatePage();' value=${W[i-1]}> kN`;
            html += `</span></td>`;
            html += `<td><span class='outputspan'>`;
            html += `<input id='kF${i}' class='right' type='number' value=${kF[i-1].toFixed(3)}>`;
            html += `</span></td>`;
            html += `<td><span class='outputspan'>`;
            html += `<input id='F${i}' class='right' type='number' value=${F[i-1].toFixed(1)}> kN`;
            html += `</span></td>`;
            html += `</tr>`;
        } else {
            html += `<tr><td>${i}</td>`;
            html += `<td><span class='inputspan'>`;
            html += `<input id='h${i}' class='right' type='number' onchange='updatePage();' value=0> m`;
            html += `</span></td>`;
            html += `<td><span class='inputspan'>`;
            html += `<input id='W${i}' class='right' type='number' onchange='updatePage();' value=0> kN`;
            html += `</span></td>`;
            html += `<td><span class='outputspan'>`;
            html += `<input id='kF${i}' class='right' type='number' value=0>`;
            html += `</span></td>`;
            html += `<td><span class='outputspan'>`;
            html += `<input id='F${i}' class='right' type='number' value=0> kN`;
            html += `</span></td>`;
            html += `</tr>`;
        }
    }
    document.getElementById('leveltable').innerHTML = html;

}

function SpectralShapeFactor(SSC, T) {
    if (SSC == "Strong rock, Ae") {
        if (T <= 0.1) {
            return 0.8 + 15.5*T;
        } else if (T <= 1.5) {
            return Math.min(0.704/T, 2.35);
        } else {
            return 1.056/T**2;
        }
    }
    else if (SSC == "Rock, Be") {
        if (T <= 0.1) {
            return 1.0 + 19.4*T;
        } else if (T <= 1.5) {
            return Math.min(0.88/T, 2.94);
        } else {
            return 1.32/T**2;
        }
    } else if (SSC == "Shallow soil, Ce") {
        if (T <= 0.1) {
            return 1.3 + 23.8*T;
        } else if (T <= 1.5) {
            return Math.min(1.25/T, 3.68);
        } else {
            return 1.874/T**2;
        }
    } else if (SSC == "Deep or soft soil, De") {
        if (T <= 0.1) {
            return 1.1 + 25.8*T;
        } else if (T <= 1.5) {
            return Math.min(1.98/T, 3.68);
        } else {
            return 2.97/T**2;
        }
    } else if (SSC == "Very soft soil, Ee") {
        if (T <= 0.1) {
            return 1.1 + 25.8*T;
        } else if (T <= 1.5) {
            return Math.min(3.08/T, 3.68);
        } else {
            return 4.62/T**2;
        }
    } else {
        return [];
    }
}
