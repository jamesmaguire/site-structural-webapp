function updatePage()
{
    runCalcs();
    // drawFigure(0.4);
    setStatusUptodate();
}

function runCalcs() {
    let beam = {
        B:i_B.valueAsNumber,
        D:i_D.valueAsNumber,
        nbc:i_nbc.valueAsNumber,
        dbc:i_dbc.valueAsNumber,
        nbt:i_nbt.valueAsNumber,
        dbt:i_dbt.valueAsNumber,
        dbs:i_dbs.valueAsNumber,
        dbspc:i_dbspc.valueAsNumber,
        c:i_c.valueAsNumber
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
    let ku = determine_ku(beam, concrete, steel);
    let dn = beam.d*ku;
    let Muo = moment_capacity(beam, concrete, steel, ku);
    let phi = bending_phi(ku);
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

}

function determine_ku(beam, concrete, steel) {
    let incr = 0.1;
    let steps = 10;
    let ku = 0;
    for (let iteration=0; iteration<4; iteration++) {
        for (let testku=ku+incr; testku<ku+(incr*steps); testku+=incr) {
            let sumF = sum_cs_forces(testku, beam, concrete, steel);
            if (sumF > 0) {
                ku = testku-incr;
                incr = incr/steps;
                break;
            }
        }
    }
    return ku; 
}

function sum_cs_forces(ku, beam, concrete, steel) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let Cs = beam.Asc*steel.Es*steel_strain(ku, concrete.ecu, steel.esu, beam.d, beam.a);
    let Ts = beam.Ast*steel.Es*steel_strain(ku, concrete.ecu, steel.esu, beam.d, beam.d);
    return Cc+Cs+Ts;
}

function steel_strain(ku, ecu, esu, d, y) {
    let e = (ecu/(ku*d))*(ku*d - y);
    if (e < -esu) {
        return -esu;
    } else if (e > esu) {
        return esu;
    } else {
        return e;
    }
}

function moment_capacity(beam, concrete, steel, ku) {
    let Cc = concrete.alpha2*concrete.fc*concrete.gamma*ku*beam.d*beam.B/1000;
    let Cs = beam.Asc*steel.Es*steel_strain(ku, concrete.ecu, steel.esu, beam.d, beam.a);
    let Ts = beam.Ast*steel.Es*steel_strain(ku, concrete.ecu, steel.esu, beam.d, beam.d);
    let Muo = -(Cc*(concrete.gamma*ku*beam.d/2) + Cs*beam.a + Ts*beam.d)/1000;
    return Muo;
}

function bending_phi(ku) {
    let phi = 1.24 - 13*ku/12;
    return Math.min(Math.max(phi, 0.65), 0.85);
}


/// ORIGINAL FUNCTIONS:

// function drawFigure(scale)
// {
//     let canvas = document.getElementById('beamFigure');
//     if (canvas.getContext)
//     {
//         let ctx = canvas.getContext('2d');
//         let X = canvas.width;
//         let Y = canvas.height;
//         ctx.clearRect(0, 0, X, Y);

//         // Variables
//         let B = beamWidth.valueAsNumber;
//         let D = beamDepth.valueAsNumber;
//         let dbt = dbtension.valueAsNumber;
//         let dbc = dbcompression.valueAsNumber;
//         let axist = cover.valueAsNumber + dbt/2;
//         let axisc = cover.valueAsNumber + dbc/2;
//         let btmBars = nbarstension.valueAsNumber;
//         let topBars = nbarscompression.valueAsNumber;

//         // Concrete mass
//         ctx.fillStyle = 'lightgray';
//         ctx.fillRect(0,0,scale*B,scale*D);

//         // Bottom bars
//         ctx.lineStyle = 'black';
//         ctx.lineWidth = 1;
//         ctx.fillStyle = 'black';
//         let barSpace = (B-2*axist)/(btmBars-1);
//         for (i = 0; i < btmBars; i++) {
//             rebar(ctx, scale*(axist+(i*barSpace)), scale*(D-axist), scale*dbt);
//         }
//         // Top bars
//         barSpace = (B-2*axisc)/(topBars-1);
//         for (i = 0; i < topBars; i++) {
//             rebar(ctx, scale*(axisc+(i*barSpace)), scale*axisc, scale*dbc);
//         }

//         // ULS N.A.
//         let dn = ulsdn.valueAsNumber;
//         ctx.lineStyle = 'black';
//         ctx.setLineDash([5,5]);
//         ctx.beginPath();
//         ctx.moveTo(0,scale*dn);
//         ctx.lineTo(scale*B,scale*dn);
//         ctx.stroke();
//         ctx.fillStyle = '#bbb';
//         ctx.fillRect(0,0,scale*B,scale*dn);

//     }
// }

// function rebar(ctx, x, y, db)
// {
//     ctx.beginPath();
//     ctx.arc(x, y, db/2, 0, 2*Math.PI, false);
//     ctx.fill();
//     ctx.stroke();
// }
