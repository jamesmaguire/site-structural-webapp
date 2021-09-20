function initPage()
{
    // Beam parameters
    input('i_B', {initval:200, units:'mm'});
    input('i_D', {initval:400, units:'mm'});
    input('i_nbc', {initval:2});
    input('i_dbc', {initval:16, prefix:'N', align:'left'});
    input('i_nbt', {initval:2});
    input('i_dbt', {initval:16, prefix:'N', align:'left'});
    input('i_nbe', {initval:2});
    input('i_dbe', {initval:16, prefix:'N', align:'left'});
    input('i_dbs', {initval:10, prefix:'N', align:'left'});
    input('i_dbspc', {initval:200});
    input('i_c', {initval:50, units:'mm'});
    output('o_d', {units:'mm'});
    output('o_a', {units:'mm'});
    output('o_Ast', {units:'mm<sup>2</sup>'});
    output('o_Asc', {units:'mm<sup>2</sup>'});

    // Material properties
    input('i_fc', {initval:40, units:'MPa'});
    output('i_ecu');
    output('o_alpha2');
    output('o_gamma');
    input('i_fsy', {initval:500, units:'MPa'});
    input('i_Es', {initval:200, units:'GPa'});
    output('o_esu');

    // Loading
    input('i_Mstar', {initval:50, units:'kNm'});

    // // Bending capacity
    output('o_ku');
    output('o_dn', {units:'mm'});
    output('o_Muo', {units:'kNm'});
    output('o_phi');
    output('o_phiMuo', {units:'kNm'});
    output('momentCheck');

    // // // Min strength
    output('o_Z', {units:'mm<sup>3</sup>'});
    output('o_fctf', {units:'MPa'});
    output('o_Muomin', {units:'kNm'});
    output('momentminCheck');

    updatePage();
}

function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure() {
    let canvas = document.getElementById('beamFigure');
    let ctx = canvas.getContext('2d');
    let X = canvas.width;
    let Y = canvas.height;
    ctx.clearRect(0, 0, X, Y);

    let beam = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        dbe:i_dbe.valueAsNumber,
        dbs:i_dbs.valueAsNumber,
        c:i_c.valueAsNumber,
        dn:o_dn.valueAsNumber,
    };
    let scalefactor = 0.9*Math.min(canvas.width/beam.B,
                                   canvas.height/beam.D);
    for (key in beam) {
        beam[key] = scalefactor*beam[key];
    }
    beam.nbc = i_nbc.valueAsNumber;
    beam.nbt = i_nbt.valueAsNumber;
    beam.nbe = i_nbe.valueAsNumber;

    // Neutral axis
    ctx.strokeStyle = '#ccc';
    ctx.fillStyle = '#f3f3f3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect((X-beam.B)/2,(Y-beam.D)/2,beam.B,beam.dn);
    ctx.fill();
    ctx.stroke();

    // Beam outline
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.rect((X-beam.B)/2,(Y-beam.D)/2,beam.B,beam.D);
    ctx.stroke();

    // Bars
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    bars = beamBars(beam);
    for (i=0; i<bars.length; i++) {
        rebar(ctx, (X-beam.B)/2+bars[i][0], (Y+beam.D)/2-bars[i][1], bars[i][2]);
    }

    // Stirrups
    if (beam.dbs > 0) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        // I've trimmed one pixel to give the stirrup a more visually consistent size
        roundedrect(ctx, (X-beam.B)/2+beam.c+1, (Y-beam.D)/2+beam.c+1,
                    beam.B-2*beam.c-2, beam.D-2*beam.c-2, 3*beam.dbs/2);
        roundedrect(ctx, (X-beam.B)/2+beam.c+beam.dbs, (Y-beam.D)/2+beam.c+beam.dbs,
                    beam.B-2*beam.c-2*beam.dbs, beam.D-2*beam.c-2*beam.dbs, beam.dbs/2);
    }

}


function rebar(ctx, x, y, db)
{
    ctx.beginPath();
    ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
    ctx.stroke();
}

function roundedrect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.stroke();
}

function runCalcs() {
    let beam = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        nbc:i_nbc.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        nbt:i_nbt.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        nbe:i_nbe.valueAsNumber,
        dbe:i_dbe.valueAsNumber,
        dbs:i_dbs.valueAsNumber,
        dbspc:i_dbspc.valueAsNumber,
        c:i_c.valueAsNumber,
    };

    // Beam parameters
    beam.d = beam.D - beam.c - beam.dbs - beam.dbt/2;
    beam.a = beam.c + beam.dbs + beam.dbc/2;
    beam.Ast = beam.nbt*Math.PI*beam.dbt**2/4;
    beam.Asc = beam.nbc*Math.PI*beam.dbc**2/4;
    o_d.value = beam.d;
    o_a.value = beam.a;
    o_Ast.value = (beam.Ast).toFixed(0);
    o_Asc.value = (beam.Asc).toFixed(0);

    // Material properties
    let concrete = {
        fc:i_fc.valueAsNumber,
        ecu:0.003,
    };
    concrete.alpha2 = Math.max(0.85-0.0015*concrete.fc, 0.67);
    concrete.gamma = Math.max(0.97-0.0025*concrete.fc, 0.67);
    i_ecu.value = concrete.ecu;
    o_alpha2.value = concrete.alpha2;
    o_gamma.value = concrete.gamma;

    let steel = {
        fsy:i_fsy.valueAsNumber,
        Es:i_Es.valueAsNumber,
    };
    steel.esu = steel.fsy/(steel.Es*1000);
    o_esu.value = steel.esu;

    // Bending
    let ku = determineku(beam, concrete, steel);
    let dn = beam.d*ku;
    let Muo = momentCapacity(beam, concrete, steel, ku);
    let phi = bendingPhi(ku);
    o_ku.value = (ku).toFixed(3);
    o_dn.value = (dn).toFixed(1);
    o_Muo.value = Muo.toPrecision(3);
    o_phi.value = phi.toFixed(2);
    o_phiMuo.value = (phi*Muo).toPrecision(3);
    momentCheck.value = (i_Mstar.valueAsNumber/(phi*Muo)).toFixed(2);
    setPassFail(momentCheck);

    beam.Z = beam.B * beam.d**2 / 6;
    concrete.fctf = 0.6*Math.sqrt(concrete.fc);
    let Muomin = 1.2*beam.Z*concrete.fctf/1000**2;
    o_Z.value = (beam.Z).toPrecision(3);
    o_fctf.value = (concrete.fctf).toPrecision(3);
    o_Muomin.value = (Muomin).toFixed(0);
    momentminCheck.value = (Muomin/Muo).toFixed(2);
    setPassFail(momentminCheck);

    sumCSFforces(0.15, beam, concrete, steel, true);

}

// Function that determines bar locations
// Returns array of form: [[x, y, db], ...]
// Where x, y = 0, 0 is the bottom left corner
function beamBars(beam) {
    let bars = [];
    // Bottom bars
    let a = beam.c + beam.dbs + beam.dbt/2;
    let barspc = (beam.B - 2*a)/(beam.nbt-1);
    for (i=0; i < beam.nbt; i++) {
        bars.push([a + i*barspc, a, beam.dbt]);
    }
    // Top bars
    a = beam.c + beam.dbs + beam.dbc/2;
    barspc = (beam.B - 2*a)/(beam.nbc-1);
    for (i=0; i < beam.nbc; i++) {
        bars.push([a + i*barspc, beam.D - a, beam.dbc]);
    }
    // Edge bars
    a = beam.c + beam.dbs + beam.dbe/2;
    barspc = (beam.D - 2*a)/(beam.nbe+1);
    for (i=1; i < beam.nbe+1; i++) {
        bars.push([a, a + i*barspc, beam.dbe]);
        bars.push([beam.B - a, a + i*barspc, beam.dbe]);
    }
    return bars;
}

function determineku(beam, concrete, steel) {
    let incr = 0.1;
    let steps = 10;
    let ku = 0;
    for (let iteration=0; iteration<4; iteration++) {
        for (let testku=ku+incr; testku<ku+(incr*steps); testku+=incr) {
            let sumF = sumCSFforces(testku, beam, concrete, steel);
            if (sumF > 0) {
                ku = testku-incr;
                incr = incr/steps;
                break;
            }
        }
    }
    return ku; 
}

function sumCSFforces(ku, beam, concrete, steel, debug=false) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let Cs = beam.Asc*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, beam.a);
    let Ts = beam.Ast*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, beam.d);
    let barF = 0;
    let bars = beamBars(beam);
    for (i=0; i<bars.length; i++) {
        let A = Math.PI*bars[i][2]**2/4;
        let y = beam.D - bars[i][1];
        barF += A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, y);
    }
    return Cc+barF;
}

function steelStrain(ku, ecu, esu, d, y) {
    let e = (ecu/(ku*d))*(ku*d - y);
    if (e < -esu) {
        return -esu;
    } else if (e > esu) {
        return esu;
    } else {
        return e;
    }
}

function momentCapacity(beam, concrete, steel, ku) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let barM = 0;
    let bars = beamBars(beam);
    for (i=0; i<bars.length; i++) {
        let A = Math.PI*bars[i][2]**2/4;
        let y = beam.D - bars[i][1];
        let barF = A*steel.Es*steelStrain(ku, concrete.ecu, steel.esu, beam.d, y);
        barM += y*barF;
    }
    let Muo = -(Cc*(concrete.gamma*ku*beam.d/2) + barM)/1000;
    return Muo;
}

function bendingPhi(ku) {
    let phi = 1.24 - 13*ku/12;
    return Math.min(Math.max(phi, 0.65), 0.85);
}
