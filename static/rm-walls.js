
function updatePage()
{
    bending();
    inplaneShear();
    outofplaneShear();
    setStatusUptodate();
}

function bending() {
    let phi = 0.75;
    bendingphi.value = phi;
    let fsy = yieldstrength.valueAsNumber;
    let d = thickness.valueAsNumber / 2;
    let b = walllength.valueAsNumber;
    let fm = compressivestrength.valueAsNumber;
    let Ast = (b*1000/vbarspc.valueAsNumber)*Math.PI*vbarsize.valueAsNumber**2/4;
    let Asd = Math.min(Ast, 0.29*1.3*fm*b*d*1000**2/fsy);
    let Mu = phi*fsy*Asd*d * (1- (0.6*fsy*Asd)/(1.3*fm*b*d*1000**2))/1000;
    let Md = designMoment.valueAsNumber*b;
    Mapplied.value = (Md).toPrecision(3);
    Mcapacity.value = (Mu).toPrecision(3);
    momentcheck.value = (Md/Mu).toFixed(2);
    setPassFail(momentcheck);
}

function inplaneShear() {
    let phi = 0.75;
    shearphiip.value = phi;
    let D = thickness.valueAsNumber*1000;
    let L = walllength.valueAsNumber*1000;
    let H = height.valueAsNumber*1000;
    let fm = compressivestrength.valueAsNumber;

    let fvr = 1.5 - 0.5*H/L;
    effshearstrength.value = (fvr).toFixed(1);
    let Ad = L*D;
    let fsy = yieldstrength.valueAsNumber;
    let Ash = (H/hbarspc.valueAsNumber)*Math.PI*hbarsize.valueAsNumber**2/4;
    let Asv = (L/vbarspc.valueAsNumber)*Math.PI*vbarsize.valueAsNumber**2/4;
    let As = 0;
    if (H/L > 1) {
        As = Ash*L/H;
    } else {
        As = Math.min(Ash,Asv);
    }

    let Pv = vertload.valueAsNumber;
    let ksw = 1 - Pv/(Ad*fm/1000);
    let ldash = vbarspc.valueAsNumber; // Seems conservative?

    let Vd = designipshear.valueAsNumber*L/1000;
    ipvApplied.value = (Vd).toPrecision(3);
    
    if (H/L <= 2.3) {
        longwallp.value = "True";
        Vu = phi*(fvr*Ad + 0.8*fsy*As)/1000;
        ipshearCapacity.value = (Vu).toPrecision(3);
        ipshearcheck.value = (Vd/Vu).toFixed(2);
        // Stability check
        let Vustable = phi*(ksw*Pv*L/2 + fsy*Asv*(L-2*ldash)/1000)/H;
        ipstabilityCapacity.value = (Vustable).toPrecision(3);
        ipstabilitycheck.value = (Vd/Vustable).toFixed(2);
    } else {
        longwallp.value = "False";
        ipshearCapacity.value = 0;
        ipshearcheck.value = 0;
        ipstabilityCapacity.value = 0;
        ipstabilitycheck.value = 0;
    }
    setPassFail(ipshearcheck);
    setPassFail(ipstabilitycheck);

}

function outofplaneShear() {
    let phi = 0.75;
    shearphiop.value = phi;
    let fsy = yieldstrength.valueAsNumber;
    let fvm = 0.35; //MPa
    let fvs = 17.5; //MPa
    strengthvm.value = fvm;
    strengthvs.value = fvs;
    let bw = walllength.valueAsNumber*1000; //mm
    let d = thickness.valueAsNumber*1000/2; //mm

    let s = vbarspc.valueAsNumber;
    let Ast = Math.min((bw/s)*Math.PI*vbarsize.valueAsNumber**2/4,
                       0.02*bw*d);
    let Asv = (bw/vbarspc.valueAsNumber)*Math.PI*vbarsize.valueAsNumber**2/4;

    let Vd = designopshear.valueAsNumber*bw/1000;
    opvApplied.value = (Vd).toPrecision(3);
    
    let Vu = phi*(fvm*bw*d + fvs*Ast + fsy*Asv*d/s)/1000;
    opshearCapacity.value = (Vu).toPrecision(3);
    opshearcheck.value = (Vd/Vu).toFixed(2);
    setPassFail(opshearcheck);
}
