function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure()
{
    document.getElementById('wallFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    let wall = {
        t:i_t.valueAsNumber,
        H:i_H.valueAsNumber,
        L:i_L.valueAsNumber,
        supportright:i_supportright.checked,
        supportleft:i_supportleft.checked,
        supporttop:i_supporttop.checked,
        vspc: 400,
        hspc: 400
    };

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/(wall.L+wall.t), height/(wall.H+wall.t/2));

    const xmap = n => margin.left + sf*n + width/2 - sf*(wall.L+wall.t)/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*(wall.H+wall.t/2)/2;

    const svg = svgElemAppend(wallFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // 3D Wall outline
    const wall3dOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(wall.H)}`
            +` L${xmap(wall.t)},${ymap(wall.H+wall.t/2)}`
            +` L${xmap(wall.L+wall.t)},${ymap(wall.H+wall.t/2)}`
            +` L${xmap(wall.L+wall.t)},${ymap(wall.t/2)}`
            +` L${xmap(wall.L)},${ymap(0)} z`,
    });
    const wall3dOutlinemark = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(wall.L)},${ymap(wall.H)}`
            +` L${xmap(wall.L+wall.t)},${ymap(wall.H+wall.t/2)}`
    });

    // Wall outline
    const wallOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(wall.H)}`
            +` L${xmap(wall.L)},${ymap(wall.H)}`
            +` L${xmap(wall.L)},${ymap(0)} z`,
    });

    // Wall supports
    if (wall.supportleft) {
        const supportleft = svgElemAppend(svg, 'path', {
            class:'lateralsupport behind',
            d:`M${xmap(0+wall.t/2)},${ymap(0+wall.t/4)}`
                +` L${xmap(0+wall.t/2)},${ymap(wall.H+wall.t/4)}`
        });
    }
    if (wall.supportright) {
        const supportright = svgElemAppend(svg, 'path', {
            class:'lateralsupport',
            d:`M${xmap(wall.L+wall.t/2)},${ymap(0+wall.t/4)}`
                +` L${xmap(wall.L+wall.t/2)},${ymap(wall.H+wall.t/4)}`
        });
    }
    if (wall.supporttop) {
        const supporttop = svgElemAppend(svg, 'path', {
            class:'lateralsupport',
            d:`M${xmap(0+wall.t/2)},${ymap(wall.H+wall.t/4)}`
                +` L${xmap(wall.L+wall.t/2)},${ymap(wall.H+wall.t/4)}`
        });
    }

}

function runCalcs() {
    let wall = {
        t:i_t.valueAsNumber,
        H:i_H.valueAsNumber,
        L:i_L.valueAsNumber,
        supportright:i_supportright.checked,
        supportleft:i_supportleft.checked,
        supporttop:i_supporttop.checked,
    };
    
    // FRL
    let avf, ah, Srf;
    wall.supporttop ? avf=0.75 : avf=2.0;
    if (wall.supportleft && wall.supportright) {ah=1; showInput(o_ah);}
    else if (wall.supportleft || wall.supportright) {ah=2.5; showInput(o_ah);}
    else {ah=0; hideInput(o_ah);}
    const Srf1 = avf*wall.H/wall.t;
    const Srf2 = (0.7/wall.t) * Math.sqrt(avf*wall.H*ah*wall.L);
    const Srf3 = ah*wall.L/wall.t;
    if (wall.supportleft || wall.supportright) {
        Srf = Math.min(Srf1, Srf2, Srf3);
    } else {
        Srf = Srf1;
    }

    o_avf.value = avf.toFixed(2);
    o_ah.value = ah.toFixed(1);
    o_Srf.value = Srf.toFixed(1);

    // Highlight for adequacy
    let table = document.getElementById('AdequacyTable');
    let cells = table.getElementsByTagName('td');
    for (let i=0; i < cells.length; i++) {
        let slenderness = Number(cells[i].innerText);
        if (slenderness > Srf) {
            cells[i].classList.add('PASS');
            cells[i].classList.remove('FAIL');
        } else if (!isNaN(slenderness)) {
            cells[i].classList.remove('PASS');
            cells[i].classList.add('FAIL');
        }
    }

    // Highlight for insulation
    table = document.getElementById('InsulationTable');
    cells = table.getElementsByTagName('td');
    for (let i=0; i < cells.length; i++) {
        let thickness = Number(cells[i].innerText);
        if (thickness <= wall.t) {
            cells[i].classList.add('PASS');
            cells[i].classList.remove('FAIL');
        } else if (!isNaN(thickness)) {
            cells[i].classList.remove('PASS');
            cells[i].classList.add('FAIL');
        }
    }

}

updatePage();
