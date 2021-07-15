
function updatePage()
{
    bending();
    inplaneShear();
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
    Mu = phi*fsy*Asd*d * (1- (0.6*fsy*Asd)/(1.3*fm*b*d*1000**2))/1000/b;
    Mcapacity.value = (Mu).toPrecision(3);
    momentcheck.value = (designMoment.valueAsNumber/Mu).toFixed(2);
    setPassFail(momentcheck);
}

function inplaneShear() {
    let phi = 0.75;
    shearphi.value = phi;
    let D = thickness.valueAsNumber;
    let L = walllength.valueAsNumber;
    let H = height.valueAsNumber;

    let Vd = designipshear.valueAsNumber;
    let fvr = 1.5 - 0.5*H/L;
    effshearstrength.value = (fvr).toFixed(1);
    let Ad = L*D*1000^2;
    let fsy = yieldstrength.valueAsNumber;
    let Ash = (H*1000/hbarspc.valueAsNumber)*Math.PI*hbarsize.valueAsNumber**2/4;
    let Asv = (L*1000/vbarspc.valueAsNumber)*Math.PI*vbarsize.valueAsNumber**2/4;
    let As = 0;
    if (H/L > 1) {
        As = Ash*L/H;
    } else {
        As = Math.min(Ash,Asv);
    }
    
    if (H/L <= 2.3) {
        longwallp.value = "True";
        Vu = phi*(fvr*Ad + 0.8*fsy*As)/1000;
        ipshearCapacity.value = (Vu/L).toPrecision(3);
        ipshearcheck.value = (Vd/Vu).toFixed(2);
    } else {
        longwallp.value = "False";
        ipshearCapacity.value = 0;
        ipshearcheck.value = 0;
    }
    setPassFail(ipshearcheck);
}
