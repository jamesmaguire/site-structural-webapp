function initPage()
{
    // Column props
    dropdown('i_shape', ['Rectangular', 'Circular']);
    input('i_Dx', {initval:300, units:'mm'});
    input('i_Dy', {initval:1000, units:'mm'});
    input('i_H', {initval:2800, units:'mm'});
    output('o_area', {units: 'm<sup>2</sup>'});
    output('o_vol', {units: 'm<sup>3</sup>'});

    // Slabs
    checkbox('i_termtop', false);
    input('i_Dst', {initval:200, units:'mm'});
    input('i_Dsb', {initval:200, units:'mm'});
    checkbox('i_termbtm', false);
    
    // Steel
    output('o_density', {units:'kg/m<sup>3</sup>'});
    input('i_nv', {initval:10});
    input('i_dbv', {initval:20, prefix:'N', align:'left'});
    input('i_dbt', {initval:12, prefix:'N', align:'left'});
    input('i_spct', {initval:200, units:'mm'});
    checkbox('i_doubletop', true);
    input('i_btmties', {initval:4});
    input('i_nligs', {initval:3});
    input('i_cover', {initval:30, units:'mm'});
    input('i_cog', {initval:300, units:'mm'});
    output('o_lap', {units:'mm'});

    // Rates
    output('o_vmass', {units:'kg'});
    output('o_smass', {units:'kg'});
    output('o_tmass', {units:'kg'});
    output('o_masstotal', {units:'kg'});
    output('o_rate', {units:'kg/m<sup>3</sup>'});
    
    updatePage();
}

function updatePage()
{
    runCalcs();
    drawColFigure();
    drawTieFigure();
    setStatusUptodate();
}

function drawColFigure()
{
    document.getElementById('colFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber,
          H = i_H.valueAsNumber,
          termtop = i_termtop.checked,
          Dst = i_Dst.valueAsNumber,
          Dsb = i_Dsb.valueAsNumber,
          termbtm = i_termbtm.checked,
          nv = i_nv.valueAsNumber,
          dbv = i_dbv.valueAsNumber,
          dbt = i_dbt.valueAsNumber,
          spct = i_spct.valueAsNumber,
          nligs = i_nligs.valueAsNumber,
          btmties = i_btmties.valueAsNumber,
          doubletop = i_doubletop.checked,
          cover = i_cover.valueAsNumber;
          cog = i_cog.valueAsNumber;
          lap = o_lap.valueAsNumber;

    let slabwidth = Dx+2000;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = 0.9*height/(H+Dst+Dsb+lap);

    const xmap = n => margin.left + sf*n + width/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*(H+Dst+Dsb+lap)/2;

    const svg = svgElemAppend(colFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Column and slab
    svgElemAppend(svg, 'path', {
        class: 'concrete',
        d: `M${xmap(-slabwidth/2)} ${ymap(0)}`
            + `L${xmap(-slabwidth/2)} ${ymap(Dsb)}`
            + `L${xmap(-Dx/2)} ${ymap(Dsb)}`
            + `L${xmap(-Dx/2)} ${ymap(Dsb+H)}`
            + `L${xmap(-slabwidth/2)} ${ymap(Dsb+H)}`
            + `L${xmap(-slabwidth/2)} ${ymap(Dsb+H+Dst)}`
            + `L${xmap(slabwidth/2)} ${ymap(Dsb+H+Dst)}`
            + `L${xmap(slabwidth/2)} ${ymap(Dsb+H)}`
            + `L${xmap(Dx/2)} ${ymap(Dsb+H)}`
            + `L${xmap(Dx/2)} ${ymap(Dsb)}`
            + `L${xmap(slabwidth/2)} ${ymap(Dsb)}`
            + `L${xmap(slabwidth/2)} ${ymap(0)}`
            + `Z`
    });

    // Vert bars
    if (termtop === true) {
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(-Dx/2+cover+dbv)} ${ymap(Dsb)}`
                + `L${xmap(-Dx/2+cover+dbv)} ${ymap(Dsb+H+Dst-cover)}`
                + `L${xmap(-Dx/2+cover+dbv-cog)} ${ymap(Dsb+H+Dst-cover)}`
                + `M${xmap(Dx/2-cover-dbv)} ${ymap(Dsb)}`
                + `L${xmap(Dx/2-cover-dbv)} ${ymap(Dsb+H+Dst-cover)}`
                + `L${xmap(Dx/2-cover-dbv+cog)} ${ymap(Dsb+H+Dst-cover)}`
        });
    } else {
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(-Dx/2+cover+dbv)} ${ymap(Dsb)}`
                + `L${xmap(-Dx/2+cover+dbv)} ${ymap(Dsb+H+Dst+lap)}`
                + `M${xmap(Dx/2-cover-dbv)} ${ymap(Dsb)}`
                + `L${xmap(Dx/2-cover-dbv)} ${ymap(Dsb+H+Dst+lap)}`
        });
    }

    // Starters
    if (termbtm === true) {
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(-Dx/2+cover+2.5*dbv-cog)} ${ymap(cover)}`
                + `L${xmap(-Dx/2+cover+2.5*dbv)} ${ymap(cover)}`
                + `L${xmap(-Dx/2+cover+2.5*dbv)} ${ymap(Dsb+lap)}`
                + `M${xmap(Dx/2-cover-2.5*dbv+cog)} ${ymap(cover)}`
                + `L${xmap(Dx/2-cover-2.5*dbv)} ${ymap(cover)}`
                + `L${xmap(Dx/2-cover-2.5*dbv)} ${ymap(Dsb+lap)}`
        });
    }

    // Ligs
    let btmspacing = (lap-2*cover-50)/(btmties-1);
    let tieheight = Dsb+50;
    for (let i=0; i<btmties; i++) {
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(-Dx/2+cover)} ${ymap(tieheight)}`
                + `L${xmap(Dx/2-cover)} ${ymap(tieheight)}`
        });
        tieheight += btmspacing;
    }
    for (let i=0; tieheight<Dsb+H; i++) {
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(-Dx/2+cover)} ${ymap(tieheight)}`
                + `L${xmap(Dx/2-cover)} ${ymap(tieheight)}`
        });
        tieheight += spct;
    }
    if (doubletop === true) {
        tieheight -= spct+50;
        svgElemAppend(svg, 'path', {
            class: 'rebar',
                    d: `M${xmap(-Dx/2+cover)} ${ymap(tieheight)}`
                + `L${xmap(Dx/2-cover)} ${ymap(tieheight)}`
        });
    }

}

function drawTieFigure()
{
    document.getElementById('tieFigure').innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber,
          shape = i_shape.value,
          dbt = i_dbt.valueAsNumber,
          nligs = i_nligs.valueAsNumber,
          cover = i_cover.valueAsNumber;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = 0.9*height/Math.max(Dx,Dy);

    const xmap = n => margin.left + sf*n + width/2 - sf*Dx/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*Dy/2;

    const svg = svgElemAppend(colFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Column
    svgElemAppend(svg, 'path', {
        class: 'concrete',
        d: `M${xmap(0)} ${ymap(0)}`
            + `L${xmap(0)} ${ymap(Dy)}`
            + `L${xmap(Dx)} ${ymap(Dy)}`
            + `L${xmap(Dx)} ${ymap(0)}`
            + `Z`
    });

    // Tie
    let r = 2*dbt;
    svgElemAppend(svg, 'path', {
        class: 'rebar',
        d: `M${xmap(cover)} ${ymap(cover+r)}`
            + `L${xmap(cover)} ${ymap(Dy-cover-r)}`
            + `Q${xmap(cover)} ${ymap(Dy-cover)} ${xmap(cover+r)} ${ymap(Dy-cover)}`
            + `L${xmap(Dx-cover-r)} ${ymap(Dy-cover)}`
            + `Q${xmap(Dx-cover)} ${ymap(Dy-cover)} ${xmap(Dx-cover)} ${ymap(Dy-cover-r)}`
            + `L${xmap(Dx-cover)} ${ymap(cover+r)}`
            + `Q${xmap(Dx-cover)} ${ymap(cover)} ${xmap(Dx-cover-r)} ${ymap(cover)}`
            + `L${xmap(cover+r)} ${ymap(cover)}`
            + `Q${xmap(cover)} ${ymap(cover)} ${xmap(cover)} ${ymap(cover+r)}`
            + `L${xmap(cover+2*r)} ${ymap(cover+3*r)}`
            + `M${xmap(cover+3*r)} ${ymap(cover+2*r)}`
            + `L${xmap(cover+r)} ${ymap(cover)}`
    });
    for (let i=0; i<nligs; i++) {
        let y = cover + (i+1)*(Dy-2*cover)/(nligs+1);
        svgElemAppend(svg, 'path', {
            class: 'rebar',
            d: `M${xmap(cover+3*r)} ${ymap(y-r)}`
                + `L${xmap(cover+r)} ${ymap(y-r)}`
                + `Q${xmap(cover)} ${ymap(y-r)} ${xmap(cover)} ${ymap(y)}`
                + `Q${xmap(cover)} ${ymap(y+r)} ${xmap(cover+r)} ${ymap(y+r)}`
                + `L${xmap(Dx-cover-r)} ${ymap(y+r)}`
                + `Q${xmap(Dx-cover)} ${ymap(y+r)} ${xmap(Dx-cover)} ${ymap(y)}`
                + `Q${xmap(Dx-cover)} ${ymap(y-r)} ${xmap(Dx-cover-r)} ${ymap(y-r)}`
                + `L${xmap(Dx-cover-3*r)} ${ymap(y-r)}`
        });
    }
}

const barmass = (diameter, length, density=7850) => density*length*Math.PI*diameter**2/4/1000**3;

function runCalcs() {

    const Dx = i_Dx.valueAsNumber,
          Dy = i_Dy.valueAsNumber,
          shape = i_shape.value,
          H = i_H.valueAsNumber,
          termtop = i_termtop.checked,
          Dst = i_Dst.valueAsNumber,
          Dsb = i_Dsb.valueAsNumber,
          termbtm = i_termbtm.checked,
          nv = i_nv.valueAsNumber,
          dbv = i_dbv.valueAsNumber,
          dbt = i_dbt.valueAsNumber,
          spct = i_spct.valueAsNumber,
          nligs = i_nligs.valueAsNumber,
          btmties = i_btmties.valueAsNumber,
          doubletop = i_doubletop.checked,
          cover = i_cover.valueAsNumber,
          cog = i_cog.valueAsNumber;

    // Lap
    const lap = 40*dbv;
    o_lap.value = lap;

    // Column
    let colarea;
    if (shape === 'Rectangular') {
        colarea = Dx * Dy / 1000**2;
        showInput(i_Dy);
    } else if (shape === 'Circular') {
        colarea = Math.PI*Dx**2/4 / 1000**2;
        hideInput(i_Dy);
    }
    o_area.value = colarea.toFixed(3);
    let volume = colarea*H/1000;
    o_vol.value = volume.toFixed(3);
    
    // Vertical
    let length = termtop ? H+Dst-cover+cog : H+Dst+lap;
    const vmass = nv * barmass(dbv, length);
    o_vmass.value = vmass.toFixed(0);

    // Starters
    length = termbtm ? cog+Dsb+lap : 0;
    const smass = nv * barmass(dbv, length);
    o_smass.value = smass.toFixed(0);

    // Ties
    const btmspacing = (lap-2*cover-50)/(btmties-1);
    let tieheight = Dsb+50;
    let nties = 0;
    for (let i=0; i<btmties; i++) {
        tieheight += btmspacing;
        nties += 1;
    }
    for (let i=0; tieheight<Dsb+H; i++) {
        tieheight += spct;
        nties += 1;
    }
    if (doubletop === true) {
        nties += 1;
    }

    if (shape === 'Rectangular') {
        length = 2*Dx + 2*Dy - 8*cover + 2*(5*dbt);
        length += nligs * (Math.min(Dx,Dy) + 2*(5*dbt));
    } else if (shape === 'Circular') {
        length = Math.PI*(Dx-cover-cover) + 2*(5*dbt);
    }
    const tmass = nties * barmass(dbt, length);
    o_tmass.value = tmass.toFixed(0);

    // Rates
    const mass = vmass + smass + tmass;
    const rate = mass/volume;
    o_masstotal.value = mass.toFixed(0);
    o_rate.value = rate.toFixed(0);

}

initPage();
