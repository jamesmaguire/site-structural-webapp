function updatePage() {
    const fc = i_fc.valueAsNumber;
    const fsy = i_fsy.valueAsNumber;
    const phi = i_phi.valueAsNumber;

    const Dx = i_Dx.valueAsNumber;
    const Dy = i_Dy.valueAsNumber;

    // Table
    function barformat(n, db) {
        const Nstar = i_Nstar.valueAsNumber;
        const A = 2*n*Math.PI*db**2/4; // A = 2x since bar passes column face twice
        const N = A*phi*fsy/2/1000;
        return `<td${N < Nstar ? ' class="DIM"' : ''}>`
            +`${N.toFixed(0)} kN`
            +` ${N > Nstar ? greentick : redcross}`
            +`</td>`;
    }
    const barlist = [1, 2, 3, 4, 5, 6, 7, 8, 'Lx', 'Ly'];
    const n12s = barlist.map(n => barformat(n, 12));
    const n16s = barlist.map(n => barformat(n, 16));
    const n20s = barlist.map(n => barformat(n, 20));
    const n24s = barlist.map(n => barformat(n, 24));
    let tableHTML = "<table>";
    // Header
    tableHTML += "<tr><th>Bars</th><th>N12</th><th>N16</th><th>N20</th><th>N24</th></tr>";
    // Capacities
    for (let row=0; row<barlist.length-2; row++) {
        tableHTML += `<td>${barlist[row]}</td>`;
        tableHTML += n12s[row];
        tableHTML += n16s[row];
        tableHTML += n20s[row];
        tableHTML += n24s[row];
        tableHTML += "</tr>";
    }
    // Bar length
    const barsizelist = [12, 16, 20, 24];
    const develLens = barsizelist.map(d => Lsytb(d, fsy, fc));
    const barLengthsX = develLens.map(L => barlength(L, Dx));
    const barLengthsY = develLens.map(L => barlength(L, Dy));
    tableHTML += "<tr><th>Length</th><th>N12</th><th>N16</th><th>N20</th><th>N24</th></tr>";
    tableHTML += "<tr><td>L<sub>sy,tb</sub></td>";
    for (let row=0; row<barsizelist.length; row++) {
        tableHTML += `<td>${develLens[row].toFixed(0)} mm</td>`;
    }
    tableHTML += "</tr>";
    tableHTML += "<tr><td>Lx</td>";
    for (let row=0; row<barsizelist.length; row++) {
        tableHTML += `<td>${barLengthsX[row]} mm</td>`;
    }
    tableHTML += "</tr>";
    tableHTML += "<tr><td>Ly</td>";
    for (let row=0; row<barsizelist.length; row++) {
        tableHTML += `<td>${barLengthsY[row]} mm</td>`;
    }
    tableHTML += "</tr>";
    tableHTML += "</table>";
    o_table.innerHTML = tableHTML;

    // Custom bars
    const n1 = i_nbars.valueAsNumber;
    const db1 = i_db1.valueAsNumber;
    const As1 = 2*n1*Math.PI*db1**2/4;
    o_As1.value = As1.toFixed(0);
    const N1 = As1*phi*fsy/2/1000;
    o_N1.value = N1.toFixed(0);
    const Lsytb1 = Lsytb(db1, fsy, fc);
    o_Lsytb1.value = Lsytb1.toFixed(0);
    const Lxx1 = barlength(Lsytb1, Dx);
    o_Lxx1.value = Lxx1;
    const Lyy1 = barlength(Lsytb1, Dy);
    o_Lyy1.value = Lyy1;
    
    // Generate figure
    const scalenumx = Math.max(Lxx1,4000);
    const scalenumy = Math.max(Lyy1,4000);
    integrityDiagram(fig1, db1, Dx, Dy, Lxx1, Lyy1, scalenumx, scalenumy);

    setStatusUptodate();
}

const greentick = '<span style="color: green;">&#10004;</span>';
const redcross  = '<span style="color: red";>&#10008;</span>';

function Lsytb(db, fsy, fc) {
    const c = i_c.valueAsNumber;
    const a = i_a.valueAsNumber;
    const k1 = (c >= 100) ? 1.3 : 1.0;
    const cds = Math.min(a/2, c);
    const k2 = (132-db)/100;
    const k3 = Math.min(Math.max(1-0.15*(cds-db)/db, 0.7), 1);
    const Lsytb = Math.max(
        0.5*k1*k3*fsy*db/(k2*Math.sqrt(fc)),
        0.058*fsy*k1*db);
    return Lsytb;
}

function barlength(Lsytb, colL) {
    let roundto = 100; // Length to round off to
    let L = 4*Lsytb + colL;
    L = (L / roundto | 0)*roundto + roundto;
    return L;
}

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

updatePage();
