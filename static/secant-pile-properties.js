
function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function initPage()
{
    input('i_D', {initval:600, units:'mm'});
    input('i_overlap', {initval:75, units:'mm'});
    input('i_fch', {initval:40, units:'MPa'});
    input('i_fcs', {initval:15, units:'MPa'});
    output('o_alpha', {units:'\&deg'});
    output('o_overlapH', {units:'mm'});
    output('o_overlapA', {units:'mm<sup>2</sup>'});

    output('o_spc', {units:'mm'});
    output('o_Eh', {units:'MPa'});
    output('o_Es', {units:'MPa'});

    // Free length
    input('i_theta', {initval:15, units:'\&deg'});
    input('i_RLBEL', {initval:-10, units:'m'});
    input('i_RLAnchor', {initval:-3, units:'m'});
    output('o_Lfree', {units:'m'});

    // Stiffness
    dropdown('i_method', [
        '1 Hard only',
        '2 Common core',
        '3 Accurate'
    ]);
    output('o_Ih', {units:'m<sup>4</sup>'});
    output('o_I', {units:'m<sup>4</sup>/m'});
    output('o_EI', {units:'kNm<sup>2</sup>/m'});


    updatePage();
}

function runCalcs() {

    // Geometry
    const D = i_D.valueAsNumber;
    const overlap = i_overlap.valueAsNumber;

    const spc = (D - overlap)*2;
    o_spc.value = spc.toFixed(0);

    const alpha = 2*180/Math.PI*Math.acos((D-overlap)/D);
    o_alpha.value = alpha.toFixed(1);
    const overlapH = 2*Math.sqrt(overlap*D/2 - overlap**2/4);
    o_overlapH.value = overlapH.toFixed(0);
    let aradians = alpha*Math.PI/180;
    const overlapA = 2*0.5*(D/2)**2*(aradians-Math.sin(aradians));

    o_overlapA.value = overlapA.toFixed(0);

    // Material properties
    const fch = i_fch.valueAsNumber;
    const fcs = i_fcs.valueAsNumber;

    function modulus(fc) {
        let modulusxs = [20, 25, 32, 40, 50, 65, 80, 100, 120];
        let modulusys = [24000, 26700, 30100, 32800, 34800, 37400, 39600, 42200, 44400];
        if (modulusxs.indexOf(fc)>=0) {
            return modulusys[modulusxs.indexOf(fc)];
        } else if (Math.min(modulusxs) < fc < Math.max(modulusxs)) {
            let x = fc;
            let xi = modulusxs.filter(n => n<fc).reduce((a,b) => Math.max(a,b));
            let xii = modulusxs.filter(n => n>fc).reduce((a,b) => Math.min(a,b));
            let yi = modulusys[modulusxs.indexOf(xi)];
            let yii = modulusys[modulusxs.indexOf(xii)];
            return yi+((x-xi)*(yii-yi)/(xii-xi));
        } else {
            return fc <=40
                ? 2400**1.5 * 0.043*Math.sqrt(fc)
                : 2400**1.5 * (0.024*Math.sqrt(fc) + 0.12);
        }
    };
    
    const Eh = modulus(fch);
    o_Eh.value = Eh.toFixed(0);
    const Es = modulus(fcs);
    o_Es.value = Es.toFixed(0);

    // Wall stiffness
    const method = i_method.value;
    Ih = Math.PI*(D/1000)**4/64;
    o_Ih.value = Ih.toFixed(5);

    let I = 0;
    let E;
    let Ah = Math.PI*D**2/4;
    let As = Ah - 2*overlapA;
    let softAratio = As/(As+Ah);
    if (method === '1 Hard only') {
        I = Ih/(spc/1000);
        E = Eh;
    } else if (method === '2 Common core') {
        E = softAratio*Es + (1-softAratio)*Eh;
        I = 1*(overlapH/1000)**3/12;
    } else if (method === '3 Accurate') {
        let r = D/2;
        let Isoftmissing = 4* ((aradians - Math.sin(aradians))*r**4/8
             - 2*((r-overlap/2)*(overlapH/2)**3)/12)/(1000**4);
        I = Ih/(spc/1000) + Ih/(spc/1000) - Isoftmissing/(spc/1000);
        E = softAratio*Es + (1-softAratio)*Eh;
    }
    const EI = E*I*1000;
    o_I.value = I.toFixed(5);
    o_EI.value = EI.toFixed(0);
    
    // Free length
    const theta = i_theta.valueAsNumber;
    const RLBEL = i_RLBEL.valueAsNumber;
    const RLAnchor = i_RLAnchor.valueAsNumber;
    const radians = a => a*Math.PI/180;
    const Lfree = (RLAnchor-RLBEL)/
          ((1+Math.tan(radians(45))/Math.tan(radians(theta)))*Math.sin(radians(theta)));
    o_Lfree.value = Lfree.toFixed(2);
    
    setStatusUptodate();
}

function drawFigure() {
    wallFigure.innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const D = i_D.valueAsNumber;
    const overlap = i_overlap.valueAsNumber;
    const spc = o_spc.valueAsNumber;
    const overlapH = o_overlapH.valueAsNumber;

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/3000, height/D);

    const xmap = n => margin.left + sf*n + width/2;
    const ymap = n => margin.top  - sf*n + height/2;

    const svg = svgElemAppend(wallFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // Hard pile
    for (let i=-2; i<=2; i++) {
        svgElemAppend(svg, 'circle', {
            class:'hardpile',
            cx:xmap(spc*i), cy:ymap(0),
            r:sf*D/2
        });
    }
    // Soft pile
    for (let i=-2; i<2; i++) {
        svgElemAppend(svg, 'circle', {
            class:'softpile',
            cx:xmap(spc/2 + spc*i), cy:ymap(0),
            r:sf*D/2
        });
    }

    // Stiffness model
    const method = i_method.value;
    if (method === '1 Hard only') {
        for (let i=-2; i<=2; i++) {
            svgElemAppend(svg, 'circle', {
                class:'stiffnessmethod',
                cx:xmap(spc*i), cy:ymap(0),
                r:sf*D/2
            });
        }
    } else if (method === '2 Common core') {
        svgElemAppend(svg, 'rect', {
            class:'stiffnessmethod',
            x:xmap(-spc*4.5/2), y:ymap(overlapH/2),
            width:sf*spc*4.5, height:sf*overlapH
        });
    } else if (method === '3 Accurate') {
        for (let i=-4; i<=4; i++) {
            svgElemAppend(svg, 'circle', {
                class:'stiffnessmethod',
                cx:xmap(spc*i/2), cy:ymap(0),
                r:sf*D/2
            });
        }
    }

}

initPage();

