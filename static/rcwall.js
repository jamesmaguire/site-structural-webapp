function initPage()
{
    // Wall parameters
    input('i_Hw', {initval:2800, units:'mm'});
    input('i_L', {initval:1000, units:'mm'});
    input('i_t', {initval:200, units:'mm'});
    input('i_dbv', {initval:16, prefix:'N', align:'left'});
    input('i_vspc', {initval:200, units:'mm'});
    output('o_rhov');
    input('i_dbh', {initval:16, prefix:'N', align:'left'});
    input('i_hspc', {initval:300, units:'mm'});
    output('o_rhoh');
    input('i_layers', {initval:2});
    input('i_c', {initval:30, units:'mm'});
    output('o_Ast', {units:'mm<sup>2</sup>'});

    // Effective height
    dropdown('i_restraint', ['None', 'One edge', 'Both edges']);
    checkbox('i_fixfix', false);
    output('o_k');
    output('o_Hwe', {units:'mm'});
    
    // Material properties
    input('i_fc', {initval:40, units:'MPa'});
    input('i_fsy', {initval:500, units:'MPa'});

    // Simplified design method check
    input('i_Nstar', {initval:500, units:'kN/m'});
    output('o_stress', {units:'MPa'});
    output('o_Hwetot');
    textoutput('o_simplified');

    // Axial loading
    dropdown('i_slabcontinuity', ['Edge', 'Continuous']);
    input('i_slabloadpercentage', {initval:0, units:'%'});
    output('o_e', {units:'mm'});
    output('o_ea', {units:'mm'});
    output('o_phi');
    output('o_phiNu', {units:'kN/m'});
    output('axialCheck');

    
    // Shear loading
    input('i_Vstar', {initval:150, units:'kN'});
    output('o_Vumax', {units:'kN'});
    output('o_Vuc', {units:'kN'});
    output('o_Vus', {units:'kN'});
    output('o_phishear');
    output('o_phiVu', {units:'kN'});
    output('shearCheck');

    // Crack control
    output('o_rhovmin');
    output('o_rhohmin');
    output('o_rhow1');
    output('o_rhow2');
    output('o_rhow3');

    // Dowels
    output('o_Astwall', {units:'mm<sup>2</sup>/m'});
    checkbox('i_uaboveone', false);
    input('i_dbd', {prefix:'N', align:'left', initval:20});
    output('o_dspc', {units:'mm'});


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
        L:i_L.valueAsNumber,
        t:i_t.valueAsNumber,
        dbv:i_dbv.valueAsNumber,
        vspc:i_vspc.valueAsNumber,
        dbh:i_dbh.valueAsNumber,
        c:i_c.valueAsNumber,
        layers:i_layers.valueAsNumber
    };

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/wall.L, height/wall.t);

    const xmap = n => margin.left + sf*n + width/2 - sf*wall.L/2;
    const ymap = n => margin.top  - sf*n + height/2 + sf*wall.t/2;

    const svg = svgElemAppend(wallFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Concrete outline
    const wallOutline = svgElemAppend(svg, 'path', {
        class:'concrete',
        d:`M${xmap(0)},${ymap(0)}`
            +` L${xmap(0)},${ymap(wall.t)}`
            +` L${xmap(wall.L)},${ymap(wall.t)}`
            +` L${xmap(wall.L)},${ymap(0)} z`,
    });

    // Rebar
    let nbars = wall.L / wall.vspc;
    let gap = wall.L%wall.vspc===0 ? wall.vspc/2 : wall.L%wall.vspc/2;

    if (wall.layers === 1) {
        for (let i=0; i<nbars; i++) {
            svgElemAppend(svg, 'circle', {
                class:'rebar',
                cx:xmap(i*wall.vspc + gap),
                cy:ymap(wall.t/2 - wall.dbv/2),
                r:sf*wall.dbv/2
            });
        }
        svgElemAppend(svg, 'rect', {
            class:'rebar',
            x:xmap(0), y:ymap(wall.t/2 + wall.dbh),
            width: sf*wall.L, height:sf*wall.dbh
        });
    } else if (wall.layers === 2) {
        // Bottom
        for (let i=0; i<nbars; i++) {
            svgElemAppend(svg, 'circle', {
                class:'rebar',
                cx:xmap(i*wall.vspc + gap),
                cy:ymap(wall.c + wall.dbh + wall.dbv/2),
                r:sf*wall.dbv/2
            });
        }
        svgElemAppend(svg, 'rect', {
            class:'rebar',
            x:xmap(0), y:ymap(wall.c + wall.dbh),
            width: sf*wall.L, height:sf*wall.dbh
        });
        // Top
        for (let i=0; i<nbars; i++) {
            svgElemAppend(svg, 'circle', {
                class:'rebar',
                cx:xmap(i*wall.vspc + gap),
                cy:ymap(wall.t - wall.c - wall.dbh - wall.dbv/2),
                r:sf*wall.dbv/2
            });
        }
        svgElemAppend(svg, 'rect', {
            class:'rebar',
            x:xmap(0), y:ymap(wall.t - wall.c),
            width: sf*wall.L, height:sf*wall.dbh
        });
    }

}

function runCalcs() {
    let wall = {
        Hw:i_Hw.valueAsNumber,
        L:i_L.valueAsNumber,
        t:i_t.valueAsNumber,
        dbv:i_dbv.valueAsNumber,
        vspc:i_vspc.valueAsNumber,
        dbh:i_dbh.valueAsNumber,
        hspc:i_hspc.valueAsNumber,
        layers:i_layers.valueAsNumber,
        c:i_c.valueAsNumber,
    };
    if (wall.layers !== 1 && wall.layers !== 2) {
        i_layers.value = 2;
        wall.layers = 2;
    }

    const t = wall.t;
    const rhov = (Math.PI*wall.dbv**2/4) * wall.layers * (1000/wall.vspc) /Math.min(t,500)/1000;
    o_rhov.value = rhov.toFixed(4);
    const rhoh = (Math.PI*wall.dbh**2/4) * wall.layers * (1000/wall.hspc) /Math.min(t,500)/1000;
    o_rhoh.value = rhoh.toFixed(4);

    // Material properties
    let fc = i_fc.valueAsNumber,
        fsy = i_fsy.valueAsNumber;

    // Effective height
    let k;
    if (i_restraint.value === 'None') {
        i_fixfix.checked ? k = 0.75 : k = 1;
    } else if (i_restraint.value === 'One edge') {
        k = 1 / (1 + (wall.Hw/(3*wall.L))**2);
        k = Math.max(k, 0.3);
        k = Math.min(k, i_fixfix.checked ? 0.75 : 1);
    } else if (i_restraint.value === 'Both edges') {
        if (wall.Hw <= wall.L) {
            k = 1 / (1 + (wall.Hw/wall.L)**2);
        } else {
            k = wall.L/(2*wall.Hw);
        }
    }
    const Hwe = k*wall.Hw;
    o_k.value = k.toFixed(2);
    o_Hwe.value = Hwe.toFixed(0);

    // Simplified method
    const Nstar = i_Nstar.valueAsNumber;
    const stress = Nstar / wall.t;
    const Hweont = Hwe / wall.t;
    let allowed = 'Yes';
    o_simplified.parentElement.className = 'outputspan PASS';
    if (wall.layers === 1 && stress > 3) {
        allowed='No';
        o_simplified.parentElement.className = 'outputspan FAIL';
    }
    if ((wall.layers === 1 && Hweont > 20) || (wall.layers === 2 && Hweont > 30)) {
        allowed='No';
        o_simplified.parentElement.className = 'outputspan FAIL';
    }

    o_stress.value = stress.toFixed(2);
    o_Hwetot.value = Hweont.toFixed(1);
    o_simplified.value = allowed;

    // Axial load
    let e;
    if (i_slabcontinuity.value === 'Edge') {
        showInput(i_slabloadpercentage);
        const slabloadpercentage = i_slabloadpercentage.valueAsNumber;
        e = ((100-slabloadpercentage)/100) * wall.t/3;
    } else if (i_slabcontinuity.value === 'Continuous') {
        hideInput(i_slabloadpercentage);
        e = 0;
    }
    const ea = Hwe**2 / (2500*wall.t);
    const phi = 0.65;
    const phiNu = phi*(wall.t - 1.2*e - 2*ea)*0.6*fc;

    o_e.value = e.toFixed(1);
    o_ea.value = ea.toFixed(1);
    o_phi.value = phi.toFixed(2);
    o_phiNu.value = phiNu.toFixed(0);
    axialCheck.value = (Nstar/phiNu).toFixed(2);
    setPassFail(axialCheck);

    // Shear load
    const Vstar = i_Vstar.valueAsNumber;
    const Vumax = 0.2*fc*0.8*wall.L*wall.t/1000;
    let Vuc, pw;

    if (wall.Hw/wall.L <= 1) {
        Vuc = (0.66*Math.sqrt(fc) - 0.21*Math.sqrt(fc)*wall.Hw/wall.L)*0.8*wall.L*wall.t/1000;
        pw = Math.min(rhov, rhoh);
    } else {
        Vuc = (0.05*Math.sqrt(fc) + 0.1*Math.sqrt(fc)/(wall.Hw/wall.L - 1))*0.8*wall.L*wall.t/1000;
        pw = rhoh;
    }
    Vuc = Math.max(Vuc, 0.17*Math.sqrt(fc)*0.8*wall.L*wall.t/1000);
    const Vus = pw*fsy*0.8*wall.L*wall.t/1000;
    const phishear = 0.7;
    const phiVu = phishear * Math.min(Vumax, Vuc+Vus);
    o_Vumax.value = Vumax.toFixed(0);
    o_Vuc.value = Vuc.toFixed(0);
    o_Vus.value = Vus.toFixed(0);
    o_phishear.value = phishear.toFixed(2);
    o_phiVu.value = phiVu.toFixed(0);
    shearCheck.value = (Vstar/phiVu).toFixed(2);
    setPassFail(shearCheck);

    // Reinforcement
    let rhovmin;
    stress<Math.min(0.03*fc, 2) ? rhovmin = 0.0015 : rhovmin = 0.0025;
    o_rhovmin.value = rhovmin;

    const rhohmin = 0.0025;
    o_rhohmin.value = rhohmin;

    const rhow1 = 0.0025;
    o_rhow1.value = rhow1;
    const rhow2 = 0.0035;
    o_rhow2.value = rhow2;
    const rhow3 = 0.006;
    o_rhow3.value = rhow3;

    setPassFail(o_rhovmin, threshold=rhov, inverse=false);
    setPassFail(o_rhohmin, threshold=rhoh, inverse=false);
    setPassFail(o_rhow1, threshold=rhoh, inverse=false);
    setPassFail(o_rhow2, threshold=rhoh, inverse=false);
    setPassFail(o_rhow3, threshold=rhoh, inverse=false);

    // Reo spacing 11.7.3
    const maxspc = Math.min(2.5*t, 350);
    i_vspc.parentElement.classList = 'inputspan';
    i_hspc.parentElement.classList = 'inputspan';
    i_layers.parentElement.classList = 'inputspan';
    if (wall.vspc > maxspc) { setPassFail(i_vspc, threshold=maxspc); }
    if (wall.hspc > maxspc) { setPassFail(i_hspc, threshold=maxspc); }
    if ((wall.t > 200) && (wall.layers) === 1) { setPassFail(i_layers, threshold=1.5, inverse=true); }
    if ((wall.Hw > 20000) && (wall.layers) === 1) { setPassFail(i_layers, threshold=1.5, inverse=true); }
    if ((Hweont > 20) && (wall.layers) === 1) { setPassFail(i_layers, threshold=1.5, inverse=true); }

    // Dowels
    const Astwall = Math.PI*wall.dbv**2/4 * wall.layers * (1000/wall.vspc);
    o_Astwall.value = Astwall.toFixed(0);
    let Astdowel;
    i_uaboveone.checked ? Astdowel = Astwall : Astdowel = 0.5*Astwall;
    const dbd = i_dbd.valueAsNumber;
    const Adowel = Math.PI*dbd**2/4;
    let dspc = 1000 / (Astdowel/Adowel);
    dspc = 10*Math.ceil(dspc/10);
    o_dspc.value = dspc.toFixed(0);

}

initPage();
