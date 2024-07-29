function initPage()
{
    // Wall parameters
    input('i_t', {initval:190, units:'mm'});
    input('i_H', {initval:2800, units:'mm'});
    input('i_L', {initval:4000, units:'mm'});

    // Lateral support
    checkbox('i_supportleft', false);
    checkbox('i_supportright', false);
    checkbox('i_supporttop', true);

    // Reo
    checkbox('i_reo', false);
    input('i_vbar', {initval:16, prefix:'N', align:'left'});
    input('i_vspc', {initval:400, units:'mm'});
    input('i_hbar', {initval:16, prefix:'N', align:'left'});
    input('i_hspc', {initval:400, units:'mm'});

    // FRL
    output('o_avf');
    output('o_ah');
    output('o_Srf');
    
    updatePage();
}

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
        reo: i_reo.checked,
        vbar: i_vbar.valueAsNumber,
        vspc: i_vspc.valueAsNumber,
        hbar: i_hbar.valueAsNumber,
        hspc: i_hspc.valueAsNumber
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

    // Reo
    if (wall.reo) {
        for (let i=1; i*wall.vspc<wall.L; i++) {
            svgElemAppend(svg, 'path', {
                class:'rebar',
                d:`M${xmap(i*wall.vspc)},${ymap(90)}`
                    +` L${xmap(i*wall.vspc)},${ymap(wall.H-90)}`
            });
        }
        for (let i=1; i*wall.hspc<wall.H; i++) {
            svgElemAppend(svg, 'path', {
                class:'rebar',
                d:`M${xmap(90)},${ymap(i*wall.hspc)}`
                    +` L${xmap(wall.L-90)},${ymap(i*wall.hspc)}`
            });
        }
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
        reo: i_reo.checked,
        vbar: i_vbar.valueAsNumber,
        vspc: i_vspc.valueAsNumber,
        hbar: i_hbar.valueAsNumber,
        hspc: i_hspc.valueAsNumber
    };
    
    if (wall.reo) {
        showInput(i_vbar);
        showInput(i_hbar);
    } else {
        hideInput(i_vbar);
        hideInput(i_hbar);
    }

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

    let table = document.getElementById('FRLtable');
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

    // setPassFail(o_rhovmin, threshold=rhov, inverse=false);
    // setPassFail(o_rhohmin, threshold=rhoh, inverse=false);
    // setPassFail(o_rhow1, threshold=rhoh, inverse=false);
    // setPassFail(o_rhow2, threshold=rhoh, inverse=false);
    // setPassFail(o_rhow3, threshold=rhoh, inverse=false);

}

initPage();
