function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_Vstar', {initval:400, units:'kN'});
    input('i_Mxstar', {initval:0, units:'kNm'});
    input('i_Mystar', {initval:0, units:'kNm'});

    dropdown('i_shape', ["rectangle","circle"]);
    input('i_Dx', {initval:1000, units:'mm'});
    input('i_Dy', {initval:300, units:'mm'});
    input('i_Dia', {initval:400, units:'mm'});

    input('i_fc', {initval:40, units:'MPa'});
    input('i_sigmacp', {initval:0.00, units:'MPa'});
    input('i_D', {initval:200, units:'mm'});
    input('i_db', {prefix:'N', initval:12, align:'left'});
    input('i_c', {initval:30, units:'mm'});
    output('o_axisd', {initval:0, units:'mm'});
    output('o_phi', {initval:0.70});

    input('i_ureduction', {initval:0, units:'mm'});
    output('o_betah', {initval:0});
    output('o_u', {initval:0, units:'mm'});
    output('o_dom', {initval:0, units:'mm'});
    output('o_fcv', {initval:0, units:'MPa'});
    dropdown('i_transverseshear', ["No","Yes"]);

    updatePage();
}

function updatePage() {
    const Vstar = i_Vstar.valueAsNumber;
    const Mxstar = i_Mxstar.valueAsNumber;
    const Mystar = i_Mystar.valueAsNumber;

    if (i_shape.value === "rectangle") {
        hideInput(i_Dia);
        showInput(i_Dx);
        showInput(i_Dy);
    } else if (i_shape.value === "circle") {
        showInput(i_Dia);
        hideInput(i_Dx);
        hideInput(i_Dy);
    }

    const D = i_D.valueAsNumber,
          c = i_c.valueAsNumber,
          db = i_db.valueAsNumber;
    const axisd = c+db/2;
    o_axisd.value = axisd.toFixed(0);
    
    const Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber,
          Dia = i_Dia.valueAsNumber,
          shape = i_shape.value,
          sigmacp = i_sigmacp.valueAsNumber,
          ureduction = i_ureduction.valueAsNumber;
    const betah = shape === "rectangle" ?
          Math.max(Dx, Dy)/Math.min(Dx, Dy) : 1;
    o_betah.value = betah.toFixed(2);
    const dom = Math.max(D - axisd,
                         sigmacp > 0 ? 0.8*D : 0);
    o_dom.value = dom.toFixed(0);
    const u = shape === "rectangle" ?
          2*(Dx+dom + Dy+dom) - ureduction :
          Math.PI*(Dia+dom) - ureduction;
    o_u.value = u.toFixed(0);

    const phi = 0.7;
    o_phi.value = phi.toFixed(1);
    const fc = i_fc.valueAsNumber;
    const fcv = Math.min(0.17*(1+(2/betah))*Math.sqrt(fc),
                   0.34*Math.sqrt(fc));
    o_fcv.value = fcv.toFixed(2);

    const ax = shape === "rectangle" ? Dx + dom : Dia + dom,
          ay = shape === "rectangle" ? Dy + dom : Dia + dom;
    const Vuox = phi*u*dom*(fcv + 0.3*sigmacp)/1000,
          Vuoy = Vuox,
          Vux = Vuox/(1+(u*Mxstar*1000/(8*Vstar*ax*dom))),
          Vuy = Vuoy/(1+(u*Mystar*1000/(8*Vstar*ay*dom))),
          Vuminx = 1.2*Vuox/(1+(u*Mxstar*1000/(2*Vstar*ax**2))),
          Vuminy = 1.2*Vuoy/(1+(u*Mystar*1000/(2*Vstar*ay**2)));

    const check = (V, Vstar) => V > Vstar ? greentick : redcross;
    o_Vuox.innerHTML = `${Vuox.toFixed(0)} kN ${check(Vuox, Vstar)}<br><span class="DIM">(FoS: ${(Vuox/Vstar).toFixed(2)})</span>`;
    o_Vuoy.innerHTML = `${Vuoy.toFixed(0)} kN ${check(Vuoy, Vstar)}<br><span class="DIM">(FoS: ${(Vuoy/Vstar).toFixed(2)})</span>`;
    o_Vux.innerHTML = `${Vux.toFixed(0)} kN ${check(Vux, Vstar)}<br><span class="DIM">(FoS: ${(Vux/Vstar).toFixed(2)})</span>`;
    o_Vuy.innerHTML = `${Vuy.toFixed(0)} kN ${check(Vuy, Vstar)}<br><span class="DIM">(FoS: ${(Vuy/Vstar).toFixed(2)})</span>`;
    o_Vuminx.innerHTML = `${Vuminx.toFixed(0)} kN ${check(Vuminx, Vstar)}<br><span class="DIM">(FoS: ${(Vuminx/Vstar).toFixed(2)})</span>`;
    o_Vuminy.innerHTML = `${Vuminy.toFixed(0)} kN ${check(Vuminy, Vstar)}<br><span class="DIM">(FoS: ${(Vuminy/Vstar).toFixed(2)})</span>`;

    setStatusUptodate();
    drawDiagram();
}

const greentick = '<span style="color: green;">&#10004;</span>';
const redcross  = '<span style="color: red";>&#10008;</span>';

function drawDiagram () {
    diagram.innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:20, right:20, top:20, bottom:20},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber,
          Dia = i_Dia.valueAsNumber,
          shape = i_shape.value,
          dom = o_dom.valueAsNumber;

    let xmap, ymap, sf;
    if (shape === "rectangle") {
        sf = Math.min(width/(Dx+2*dom), height/(Dy+2*dom));
        xmap = n => margin.left + sf*n + width/2 - sf*Dx/2;
        ymap = n => margin.top  - sf*n + height/2 + sf*Dy/2;
    } else if (shape === "circle") {
        sf = Math.min(width/(Dia+(2*dom)), height/(Dia+(2*dom)));
        xmap = n => margin.left + sf*n + width/2;
        ymap = n => margin.top  - sf*n + height/2;
    }

    const svg = svgElemAppend(diagram, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    if (shape === "rectangle") {
        // Concrete outline
        svgElemAppend(svg, 'path', {
            class:'concrete',
            d:`M${xmap(0)},${ymap(0)}`
                +` L${xmap(0)},${ymap(Dy)}`
                +` L${xmap(Dx)},${ymap(Dy)}`
                +` L${xmap(Dx)},${ymap(0)} z`,
        });
        // Shear perimeter
        svgElemAppend(svg, 'path', {
            class:'concrete dashed',
            d:`M${xmap(-dom/2)},${ymap(-dom/2)}`
                +` L${xmap(-dom/2)},${ymap(Dy+dom/2)}`
                +` L${xmap(Dx+dom/2)},${ymap(Dy+dom/2)}`
                +` L${xmap(Dx+dom/2)},${ymap(-dom/2)} z`,
        });
    } else if (shape === "circle") {
        svgElemAppend(svg, 'circle', {
            class:'concrete',
            cx:xmap(0), cy:ymap(0), r:sf*(Dia/2)
        });
        svgElemAppend(svg, 'circle', {
            class:'concrete dashed',
            cx:xmap(0), cy:ymap(0), r:sf*(Dia/2 + dom/2)
        });
    }

}

initPage();
