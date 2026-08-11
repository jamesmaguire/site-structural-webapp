function initPage()
{
    input('i_D', {initval:600, units:'mm'});
    input('i_spacing', {initval:2100, units:'mm'});

    input('i_fc', {initval:40, units:'MPa'});
    output('o_Ec', {units:'GPa'});

    // Stiffness
    output('o_Iwall', {units:'m<sup>4</sup>/m'});
    output('o_Ipile', {units:'m<sup>4</sup>/pile'});
    output('o_EI', {units:'kNm<sup>2</sup>/m'});


    // Free length
    input('i_NGL', {initval:0, units:'m'});
    input('i_BEL', {initval:-10, units:'m'});
    input('i_RLAnchor', {initval:-3, units:'m'});
    input('i_theta', {initval:30, units:'\&deg'});
    output('o_Lfree', {units:'m'});

    updatePage();
}

function inputState()
{
    const state = {};
    document.querySelectorAll('input[id^="i_"]').forEach(el => {
        const key = el.id.substring(2); // remove "i_"
        state[key] = el.type === "number" ? el.valueAsNumber : el.value;
    });
    return state;
}

function writeOutputs(state)
{
    o_Ec.value = state.Ec.toFixed(1);
    o_Ipile.value = state.Ipile.toFixed(5);
    o_Iwall.value = state.Iwall.toFixed(5);
    o_EI.value = state.EI.toFixed(0);
    o_Lfree.value = state.Lfree.toFixed(2);
}

function updatePage()
{
    const s = inputState();

    function modulus(fc) {
        let modulusxs = [20, 25, 32, 40, 50, 65, 80, 100, 120];
        let modulusys = [24.000, 26.700, 30.100, 32.800, 34.800, 37.400, 39.600, 42.200, 44.400];
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
    s.Ec = modulus(s.fc);

    s.Ipile = Math.PI*(s.D/1000)**4/64;
    s.Iwall = s.Ipile / s.spacing * 1000;
    s.EI = s.Ec * s.Iwall * 1000*1000;

    // Free length
    const radians = a => a*Math.PI/180;
    s.Lfree = (s.RLAnchor-s.BEL)/
        ((1+Math.tan(radians(45))/Math.tan(radians(s.theta)))*Math.sin(radians(s.theta)));
    
    console.log(s);
    writeOutputs(s);
    drawFigure(s);
    setStatusUptodate();
}

function drawFigure(s) {
    wallFigure.innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:50, right:50, top:50, bottom:50},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/5, height/(s.NGL-s.BEL));

    const xmap = n => margin.left + sf*n + width/2;
    const ymap = n => margin.top  - sf*n;

    const svg = svgElemAppend(wallFigure, 'svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });

    // NGL
    svgElemAppend(svg, 'line', {
        class:'concrete',
        x1:xmap(0), y1:ymap(s.NGL),
        x2:xmap(-20), y2:ymap(s.NGL)
    });

    // BEL
    svgElemAppend(svg, 'line', {
        class:'concrete',
        x1:xmap(0), y1:ymap(s.BEL),
        x2:xmap(20), y2:ymap(s.BEL)
    });

    // ZOI
    svgElemAppend(svg, 'line', {
        class:'concrete',
        x1:xmap(0), y1:ymap(s.BEL),
        x2:xmap(-s.NGL+s.BEL), y2:ymap(s.NGL)
    });

    // Pile
    svgElemAppend(svg, 'rect', {
        class:'concrete',
        x:xmap(0), y:ymap(s.NGL),
        width:sf*s.D/1000, height:sf*(s.NGL-s.BEL)
    });

    const radians = a => a*Math.PI/180;
    const Lx = s.Lfree * Math.cos(radians(s.theta));
    const Ly = s.Lfree * Math.sin(radians(s.theta));

    // Anchor
    svgElemAppend(svg, 'line', {
        class:'concrete',
        x1:xmap(0), y1:ymap(s.RLAnchor),
        x2:xmap(-Lx), y2:ymap(s.RLAnchor-Ly)
    });
    svgElemAppend(svg, 'line', {
        class:'concrete',
        x1:xmap(-Lx), y1:ymap(s.RLAnchor-Ly),
        x2:xmap(-1.5*Lx), y2:ymap(s.RLAnchor-1.5*Ly)
    });

}

initPage();
