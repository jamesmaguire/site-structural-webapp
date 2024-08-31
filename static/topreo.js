function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_Mstar', {initval:300, units:'kNm'});
    input('i_D', {initval:220, units:'mm'});
    input('i_c', {initval:30, units:'mm'});
    input('i_fc', {initval:40, units:'MPa'});
    input('i_fsy', {initval:500, units:'MPa'});
    output('o_phi', {initval:0.85});

    output('o_ec', {initval:0.003});
    output('o_es', {initval:0.0025});
    output('o_gamma', {});

    input('i_Dx', {initval:1000, units:'mm'});
    input('i_Dy', {initval:300, units:'mm'});

    input('i_np', {initval:0});
    dropdown('i_dp', ["12.7", "15.2"], initval="12.7");
    input('i_pthh', {initval:180, units:'mm'});
    output('o_fpy', {units:'MPa'});

    input('i_db1', {prefix:'N', initval:16, align:'left'});
    output('o_Lxx1', {units:'mm'});
    output('o_Lyy1', {units:'mm'});

    updatePage();
}

function updatePage() {
    const Mstar = i_Mstar.valueAsNumber;
    const fc = i_fc.valueAsNumber;
    const fsy = i_fsy.valueAsNumber;
    const D = i_D.valueAsNumber;

    const Dx = i_Dx.valueAsNumber;
    const Dy = i_Dy.valueAsNumber;
    const c = i_c.valueAsNumber;

    const np = i_np.valueAsNumber;
    const dp = i_dp.value;
    const pthh = i_pthh.valueAsNumber;
    const fpy = {"12.7":1533, "15.2":1468}[dp];
    o_fpy.value = fpy;

    const phi = o_phi.valueAsNumber;
    const ec = o_ec.valueAsNumber;
    const es = o_es.valueAsNumber;
    const gamma = Math.max(0.97-0.0025*fc, 0.67);
    o_gamma.value = gamma.toFixed(3);

    let roundto = 200; // Length to round off to

    // Design options
    const nbars = [4,5,6,7,8];
    const Ap = np*Math.PI*dp**2/4;

    // Design option 1
    const db1 = i_db1.valueAsNumber;
    let Lxx1 = 2*40*db1 + 2*(D-c) + Dx;
    Lxx1 = (Lxx1 / roundto | 0)*roundto + roundto;
    o_Lxx1.value = Lxx1;
    let Lyy1 = 2*40*db1 + 2*(D-c) + Dy;
    Lyy1 = (Lyy1 / roundto | 0)*roundto + roundto;
    o_Lyy1.value = Lyy1;
    let As = nbars.map(n => n*Math.PI*db1**2/4);
    let bars = nbars.map(n => `${n} N${db1}s`);
    let d = D-c-db1/2;
    let dn = 0.545*d;
    let Mu25 = As.map(A => phi*fsy*A*(d-(gamma*dn/2))/1000**2
                     + phi*fpy*Ap*((pthh+dp/2)-(gamma*dn/2))/1000**2);
    let Mu = Mu25.map(M => 4*M);
    // Generate table
    o_bar1.innerHTML = gentable(bars, As, Mu25, Mu);
    
    // Generate figure
    const scalenumx = Math.max(Lxx1, 4000);
    const scalenumy = Math.max(Lyy1, 4000);
    layoutDiagram(fig1, db1, Dx, Dy, Lxx1, Lyy1, scalenumx, scalenumy);

    setStatusUptodate();
}

function gentable (bars, As, Mu25, Mu) {
    let html = "<table>";
    const Mstar = i_Mstar.valueAsNumber;
    html += "<tr><th>Bars</th><th>A<sub>s.min</sub></th><th>Mu</th></tr>";
    for (let row=0; row<bars.length; row++) {
        let thisM = Mu[row];
        let thisclass = thisM > Mstar ? '' : 'DIM';
        html += `<tr class='${thisclass}'>`;
        html += `<td>${bars[row]}</td>`;
        html += `<td>${As[row].toFixed(0)} mm</td>`;
        html += `<td>${thisM.toFixed(0)} kNm`;
        html += ` ${thisM > Mstar ? greentick : redcross}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}

const greentick = '<span style="color: green;">&#10004;</span>';
const redcross  = '<span style="color: red";>&#10008;</span>';

function layoutDiagram (divId, db, Dx, Dy, Lx, Ly, scalenumx, scalenumy) {

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
        class:'planconcrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(Dy)}`
            +` L${xmap(Dx)},${ymap(Dy)}`
            +` L${xmap(Dx)},${ymap(0)} z`,
    });

    // X reo
    svgElemAppend(svg, 'line', {
        class:'planrebar',
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
        class:'planrebar',
        x1:xmap(Dx/2), x2:xmap(Dx/2),
        y1:ymap(Dy/2 - Ly/2), y2:ymap(Dy/2 + Ly/2),
    });
    // Y reo text
    svgElemAppend(svg, 'text', {
        x:xmap(Dx/2), y:ymap(Dy/2 + Ly/2),
        dx: 10, dy: 20,
    }, `N${db} x${Ly}`);

}

initPage();
