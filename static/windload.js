
function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('windFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    // North arrow
    let northdir = i_northdir.valueAsNumber * Math.PI/180;
    let q = Math.PI/2;
    let x0 = 7*X/8;
    let y0 = 7*Y/8;
    let radius = X/16;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x0,y0,radius,-northdir-Math.PI,-northdir+Math.PI,false);
    ctx.lineTo(x0 + radius*Math.cos(northdir), y0 - radius*Math.sin(northdir));
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0+radius*Math.cos(northdir+q), y0-radius*Math.sin(northdir+q));
    ctx.lineTo(x0+radius*Math.cos(northdir), y0-radius*Math.sin(northdir));
    ctx.lineTo(x0+radius*Math.cos(northdir-q), y0-radius*Math.sin(northdir-q));
    ctx.stroke();

    // Wind arrows
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#88accc';
    ctx.lineWidth = 1;
    drawWindArrow(ctx, 1*X/8, Y/2, X/8, 0);
    drawWindArrow(ctx, 7*X/8, Y/2, X/8, Math.PI);
    drawWindArrow(ctx, X/2, 7*Y/8, X/8, Math.PI/2);
    drawWindArrow(ctx, X/2, 1*Y/8, X/8, 3*Math.PI/2);

    // Structure
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#88accc';
    ctx.lineWidth = 1;
    let xdim = i_xdim.valueAsNumber;
    let ydim = i_ydim.valueAsNumber;
    let sf = 0.4*X / Math.max(xdim,ydim);
    xdim *= sf;
    ydim *= sf;
    ctx.beginPath();
    ctx.rect((X-xdim)/2, (Y-ydim)/2, xdim, ydim);
    ctx.stroke();

}

function drawWindArrow(ctx, x0, y0, len, dir)
{
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0+0.8*len*Math.cos(dir-0.1), y0-0.8*len*Math.sin(dir-0.1));
    ctx.lineTo(x0+0.8*len*Math.cos(dir-0.2), y0-0.8*len*Math.sin(dir-0.2));
    ctx.lineTo(x0+1.0*len*Math.cos(dir), y0-1.0*len*Math.sin(dir));
    ctx.lineTo(x0+0.8*len*Math.cos(dir+0.2), y0-0.8*len*Math.sin(dir+0.2));
    ctx.lineTo(x0+0.8*len*Math.cos(dir+0.1), y0-0.8*len*Math.sin(dir+0.1));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function runCalcs()
{
    let region = i_region.value;
    let R = parseInt(i_R.value);
    let Cfig = i_Cfig.valueAsNumber;
    let Cdyn = i_Cdyn.valueAsNumber;
    let rho = 1.2;
    o_rho.value = rho;

    let Mzcat = i_Mzcat.valueAsNumber;
    let Ms = i_Ms.valueAsNumber;
    let Mt = i_Mt.valueAsNumber;

    // Regional wind speed
    let VR = 0;
    if (region[0] == "A") {
        VR = Math.round(67-41*R**-0.1, 0);
    } else if (region == "W") {
        VR = Math.round(104-70*R**-0.045);
    } else if (region == "B") {
        VR = Math.round(106-92*R**-0.1);
    } else {
        let FC = 1.0;
        let FD = 1.0;
        if (R >= 50) {FC = 1.05; FD = 1.1;}
        if (region == "C") {
            VR = Math.round(FC*(122-104*R**-0.1));
        } else if (region == "D") {
            VR = Math.round(FD*(156-142*R**-0.1));
        }
    }
    o_VR.value = VR;
    let pressure = 0.5*rho* VR**2 * Cfig * Cdyn / 1000;
    o_p.value = pressure.toFixed(2);

    // Site wind speed
    let direction = {N :0, NE:1, E :2, SE:3, S :4, SW:5, W :6, NW:7};
    let winddirmult = {
        //    N     NE    E     SE    S     SW    W     NW
        "A1":[0.90, 0.80, 0.80, 0.80, 0.85, 0.95, 1.00, 0.95],
        "A2":[0.80, 0.80, 0.80, 0.95, 0.90, 0.95, 1.00, 0.95],
        "A3":[0.85, 0.80, 0.80, 0.80, 0.80, 0.85, 0.90, 1.00],
        "A4":[0.90, 0.85, 0.90, 0.90, 0.95, 0.95, 0.95, 0.90],
        "A5":[1.00, 0.85, 0.80, 0.80, 0.85, 0.90, 1.00, 0.95],
        "A6":[0.85, 0.95, 1.00, 0.95, 0.85, 0.95, 1.00, 0.95],
        "A7":[0.90, 0.90, 0.80, 0.90, 0.90, 0.90, 1.00, 1.00],
        "W" :[1.00, 0.95, 0.80, 0.90, 1.00, 1.00, 0.90, 0.95],
        "B" :[0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95],
        "C" :[0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95],
        "D" :[0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95],
    };
    // console.log(winddirmult[region][direction.NE]);

    // Design wind pressure
    var tablemarkup = "<table>";
    tablemarkup += "<tr>";
    tablemarkup += "<th>Direction</th>";
    tablemarkup += "<th>M<sub>d</sub></th>";
    tablemarkup += "<th>V<sub>sit,&beta;</sub> (m/s)</th>";
    tablemarkup += "<th>p (kPa)</th>";
    tablemarkup += "</tr>";
    for(var dir in direction){
        let Md = winddirmult[region][direction[dir]];
        let Vsitb = VR*Md * Mzcat*Ms*Mt;
        let p = 0.5*rho* Vsitb**2 * Cfig * Cdyn / 1000;
        tablemarkup += "<tr>";
        tablemarkup += "<td>"+dir+"</td>";
        tablemarkup += "<td>"+Md.toFixed(2)+"</td>";
        tablemarkup += "<td>"+Vsitb.toFixed(1)+"</td>";
        tablemarkup += "<td>"+p.toFixed(2)+"</td>";
        tablemarkup += "</tr>";
    }
    windir.innerHTML = tablemarkup;

    // (Calculator) Terrain height multiplier
    let tc = i_tc.value;
    let tcdesc = {
        "1":  "Very exposed open terrain with few or no obstructions and enclosed, limited-sized water surfaces at serviceability and ultimate wind speeds in all wind regions, e.g. flat, treeless, poorly grassed plains; rivers, canals and lakes; and enclosed bays extending less than 10 km in the wind direction.",
        "1.5":"Open water surfaces subjected to shoaling waves at serviceability and ultimate wind speeds in all wind regions, e.g. near-shore ocean water; large unenclosed bays on seas and oceans; lakes; and enclosed bays extending greater than 10 km in the wind direction.",
        "2":  "Open terrain, including grassland, with well-scattered obstructions having heights generally from 1.5 m to 5 m, with no more than two obstructions per hectare, e.g. farmland and cleared subdivisions with isolated trees and uncut grass.",
        "2.5":"Terrain with a few trees or isolated obstructions. This category is intermediate between TC2 and TC3 and represents the terrain in developing outer urban areas with scattered houses, or large acreage developments with fewer than ten buildings per hectare.",
        "3":  "Terrain with numerous closely spaced obstructions having heights generally from 3 m to 10 m. The minimum density of obstructions shall be at least the equivalent of 10 house-size obstructions per hectare, e.g. suburban housing, light industrial estates or dense forests.",
        "4":  "Terrain with numerous large, high (10 m to 30 m tall) and closely-spaced constructions, such as large city centres and well-developed industrial complexes.",
    };
    o_tc.innerHTML = tcdesc[tc];
    let tczs = [0, 3, 5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200];
    let tcmults = {
        "1":   [0.99, 0.99, 1.05, 1.12, 1.16, 1.19, 1.22, 1.24, 1.25, 1.27, 1.29, 1.31, 1.32],
        "1.5": [0.95, 0.95, 0.98, 1.06, 1.10, 1.14, 1.17, 1.20, 1.21, 1.25, 1.27, 1.29, 1.31],
        "2":   [0.91, 0.91, 0.91, 1.00, 1.05, 1.08, 1.12, 1.16, 1.18, 1.22, 1.24, 1.27, 1.29],
        "2.5": [0.87, 0.87, 0.87, 0.92, 0.97, 1.01, 1.06, 1.10, 1.12, 1.17, 1.20, 1.24, 1.27],
        "3":   [0.83, 0.83, 0.83, 0.83, 0.89, 0.94, 1.00, 1.04, 1.07, 1.12, 1.16, 1.21, 1.24],
        "4":   [0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.80, 0.85, 0.90, 0.98, 1.03, 1.11, 1.16],
    };
    let Mzcatcalc = ilookup(i_zz.valueAsNumber, tczs, tcmults[tc]);
    o_Mzcatcalc.value = Mzcatcalc.toFixed(2);

    // (Calculator) Sheilding multiplier
    let smults = [0.0, 1.5, 3.0, 6.0, 12.0, 1000];
    let smultM = [0.7, 0.7, 0.8, 0.9, 1.0,  1.0];
    let hs = i_hs.valueAsNumber;
    let bs = i_bs.valueAsNumber;
    let h = i_h.valueAsNumber;
    let ns = i_ns.valueAsNumber;
    let s = h*(10/ns + 5) / Math.sqrt(hs*bs);
    let Mscalc = ilookup(s, smults, smultM);
    o_20h.value = (20*h).toFixed(1);
    o_Mscalc.value = Mscalc.toFixed(2);

    // (Calculator) Hill-shape multiplier
    let hilltype = i_hilltype.value;
    if (hilltype == "hill") {
        fighill.style.display = "";
        figescarpment.style.display = "none";
    } else {
        fighill.style.display = "none";
        figescarpment.style.display = "";
    }
    let H = i_H.valueAsNumber;
    let Lu = i_Lu.valueAsNumber;
    let x = i_x.valueAsNumber;
    let zh = i_zh.valueAsNumber;
    let L1 = Math.max(0.36*Lu, 0.4*H);
    let L2 = 4*L1;
    if (hilltype == "escarpmentdw") {
        L2 = 10*L1;
    }
    o_L1.value = L1.toFixed(0);
    o_L2.value = L2.toFixed(0);
    let Mhcalc = 1.0;
    hideInput(o_L1);
    hideInput(o_L2);
    if (0.05 <= H/(2*Lu)) {
        Mhcalc = 1 + (H/(3.5*(zh+L1))) * (1-(Math.abs(x)/L2));
        showInput(o_L1);
        showInput(o_L2);
    }
    if (H/(2*Lu) > 0.45 && zh < H/10 && Math.abs(x) < H/4) {
        Mhcalc = 1 + 0.71*(1-(Math.abs(x)/L2));
    }
    if (Math.abs(x) == 0 && z == 0) {
        Mhcalc = ilookup((H/2*Lu),
                         [0, 0.049, 0.05, 0.10, 0.20, 0.30, 0.45, 100],
                         [1.0, 1.0, 1.08, 1.16, 1.32, 1.48, 1.71, 1.71]);
    }
    o_Mt.value = Mhcalc.toFixed(2);

}

initPage();
