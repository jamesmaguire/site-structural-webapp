
function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_Nstar', {initval:400, units:'kN'});
    input('i_fc', {initval:40, units:'MPa'});
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_phi', {initval:0.85});

    input('i_Dx', {initval:1000, units:'mm'});
    input('i_Dy', {initval:300, units:'mm'});
    input('i_c', {initval:30, units:'mm'});
    input('i_a', {initval:100, units:'mm'});
    output('o_k1', {});
    output('o_cds', {});

    input('i_db1', {prefix:'N', initval:12, align:'left'});
    output('o_Lsytb1', {units:'mm'});
    output('o_Lxx1', {units:'mm'});
    output('o_Lyy1', {units:'mm'});

    input('i_db2', {prefix:'N', initval:16, align:'left'});
    output('o_Lsytb2', {units:'mm'});
    output('o_Lxx2', {units:'mm'});
    output('o_Lyy2', {units:'mm'});

    input('i_db3', {prefix:'N', initval:20, align:'left'});
    output('o_Lsytb3', {units:'mm'});
    output('o_Lxx3', {units:'mm'});
    output('o_Lyy3', {units:'mm'});

    updatePage();
}

function updatePage() {
    const fc = i_fc.valueAsNumber;
    const fsy = i_fsy.valueAsNumber;
    const phi = i_phi.valueAsNumber;

    const Dx = i_Dx.valueAsNumber;
    const Dy = i_Dy.valueAsNumber;
    const c = i_c.valueAsNumber;
    const a = i_a.valueAsNumber;

    let k1 = (c >= 100) ? 1.3 : 1.0;
    o_k1.value = k1.toFixed(1);
    let cds = Math.min(a/2, c);
    o_cds.value = cds.toFixed(0);

    let roundto = 100; // Length to round off to

    // Design options
    const nbars = [4,6,8,10,12];

    // Design option 1
    const db1 = i_db1.valueAsNumber;
    let k2 = (132-db1)/100;
    let k3 = Math.min(Math.max(1-0.15*(cds-db1)/db1, 0.7), 1);
    let Lsytb1 = Math.max(0.5*k1*k3*fsy*db1/(k2*Math.sqrt(fc)),
                          0.058*fsy*k1*db1);
    o_Lsytb1.value = Lsytb1.toFixed(0);
    let Lxx1 = 4*Lsytb1 + Dx;
    Lxx1 = (Lxx1 / roundto | 0)*roundto + roundto;
    o_Lxx1.value = Lxx1;
    let Lyy1 = 4*Lsytb1 + Dy;
    Lyy1 = (Lyy1 / roundto | 0)*roundto + roundto;
    o_Lyy1.value = Lyy1;
    let As = nbars.map(n => 2*n*Math.PI*db1**2/4);
    // As = 2* since bar passes column face twice
    let bars = nbars.map(n => `${n} N${db1}s`);
    let N = As.map(A => A*phi*fsy/2/1000); // kN
    // Generate table
    o_bar1.innerHTML = gentable(bars, As, N);
    
    // Design option 2
    const db2 = i_db2.valueAsNumber;
    k2 = (132-db2)/100;
    k3 = Math.min(Math.max(1-0.15*(cds-db2)/db2, 0.7), 1);
    let Lsytb2 = Math.max(0.5*k1*k3*fsy*db2/(k2*Math.sqrt(fc)),
                          0.058*fsy*k1*db2);
    o_Lsytb2.value = Lsytb2.toFixed(0);
    let Lxx2 = 4*Lsytb2 + Dx;
    Lxx2 = (Lxx2 / roundto | 0)*roundto + roundto;
    o_Lxx2.value = Lxx2;
    let Lyy2 = 4*Lsytb2 + Dy;
    Lyy2 = (Lyy2 / roundto | 0)*roundto + roundto;
    o_Lyy2.value = Lyy2;
    As = nbars.map(n => 2*n*Math.PI*db2**2/4);
    // As = 2* since bar passes column face twice
    bars = nbars.map(n => `${n} N${db2}s`);
    N = As.map(A => A*phi*fsy/2/1000); // kN
    // Generate table
    o_bar2.innerHTML = gentable(bars, As, N);
    
    // Design option 3
    const db3 = i_db3.valueAsNumber;
    k2 = (132-db3)/100;
    k3 = Math.min(Math.max(1-0.15*(cds-db3)/db3, 0.7), 1);
    let Lsytb3 = Math.max(0.5*k1*k3*fsy*db3/(k2*Math.sqrt(fc)),
                          0.058*fsy*k1*db3);
    o_Lsytb3.value = Lsytb3.toFixed(0);
    let Lxx3 = 4*Lsytb3 + Dx;
    Lxx3 = (Lxx3 / roundto | 0)*roundto + roundto;
    o_Lxx3.value = Lxx3;
    let Lyy3 = 4*Lsytb3 + Dy;
    Lyy3 = (Lyy3 / roundto | 0)*roundto + roundto;
    o_Lyy3.value = Lyy3;
    As = nbars.map(n => 2*n*Math.PI*db3**2/4);
    // As = 2* since bar passes column face twice
    bars = nbars.map(n => `${n} N${db3}s`);
    N = As.map(A => A*phi*fsy/2/1000); // kN
    // Generate table
    o_bar3.innerHTML = gentable(bars, As, N);
    
    // Generate figure
    const scalenumx = Math.max(Lxx1, Lxx2, Lxx3);
    const scalenumy = Math.max(Lyy1, Lyy2, Lyy3);
    integrityDiagram(fig1, db1, Dx, Dy, Lxx1, Lyy1, scalenumx, scalenumy);
    integrityDiagram(fig2, db2, Dx, Dy, Lxx2, Lyy2, scalenumx, scalenumy);
    integrityDiagram(fig3, db3, Dx, Dy, Lxx3, Lyy3, scalenumx, scalenumy);

    setStatusUptodate();
}

function gentable (bars, As, N) {
    let html = "<table>";
    const Nstar = i_Nstar.valueAsNumber;
    html += "<tr><th>Bars</th><th>A<sub>s.min</sub></th><th>N*</th></tr>";
    for (let row=0; row<bars.length; row++) {
        let thisN = N[row];
        let thisclass = thisN > Nstar ? '' : 'DIM';
        html += `<tr class='${thisclass}'>`;
        html += `<td>${bars[row]}</td>`;
        html += `<td>${As[row].toFixed(0)} mm</td>`;
        html += `<td>${thisN.toFixed(0)} kN`;
        html += ` ${thisN > Nstar ? greentick : redcross}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}

const greentick = '<span style="color: green;">&#10004;</span>';
const redcross  = '<span style="color: red";>&#10008;</span>';

function integrityDiagram (divId, db, Dx, Dy, Lx, Ly, scalenumx, scalenumy) {

    divId.innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:20, right:20, top:20, bottom:20},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/scalenumx, height/scalenumy);

    const xmap = n => margin.left + sf*n + width/2 - sf*Dx/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*Dy/2;

    const svg = svgElemAppend(divId, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Concrete outline
    const colOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(Dy)}`
            +` L${xmap(Dx)},${ymap(Dy)}`
            +` L${xmap(Dx)},${ymap(0)} z`,
    });

    // X reo
    svgElemAppend(svg, 'line', {
        class:'rebar',
        x1:xmap(Dx/2 - Lx/2), x2:xmap(Dx/2 + Lx/2),
        y1:ymap(Dy/2), y2:ymap(Dy/2),
    });
    // X reo text
    svgElemAppend(svg, 'text', {
        x:xmap(Dx/2 + Lx/2), y:ymap(Dy/2),
        dy: -10, dx: -50,
    }, `N${db} x${Lx}`);

    // Y reo
    svgElemAppend(svg, 'line', {
        class:'rebar',
        x1:xmap(Dx/2), x2:xmap(Dx/2),
        y1:ymap(Dy/2 - Ly/2), y2:ymap(Dy/2 + Ly/2),
    });
    // Y reo text
    svgElemAppend(svg, 'text', {
        x:xmap(Dx/2), y:ymap(Dy/2 + Ly/2),
        dx: 10, dy: 20,
    }, `N${db} x${Ly}`);

}
