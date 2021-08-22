
function updatePage()
{
    fillOutputs();
    setStatusUptodate();
}

function fillOutputs()
{
    // Inputs
    let db = i_db.valueAsNumber;
    let spc = i_spc.valueAsNumber;
    let fsy = i_fsy.valueAsNumber;
    let rho = i_rho.valueAsNumber;

    // Cross section props
    area.value = calcArea(db).toPrecision(3);
    aream.value = (calcArea(db)/1000**2).toExponential(2);
    secondmoment.value = calcSecondMoment(db).toPrecision(3);
    secondmomentm.value = (calcSecondMoment(db)/1000**4).toPrecision(3);
    sectionmodulus.value = calcSectionModulus(db).toPrecision(3);
    sectionmodulusm.value = (calcSectionModulus(db)/1000**3).toPrecision(3);

    // Rates
    o_barid.value = "N"+i_db.valueAsNumber;
    o_barmass.value = (calcArea(db)*rho/1000**2).toPrecision(3);
    o_arearate.value = (calcArea(db)*1000/spc).toFixed();
    o_barrate.value = (rho*calcArea(db)*1000/spc/1000**2).toPrecision(3);
    o_ratetwoway.value = (2*rho*calcArea(db)*1000/spc/1000**2).toPrecision(3);
    o_rateef.value = (2*rho*calcArea(db)*1000/spc/1000**2).toPrecision(3);
    o_ratetwowayef.value = (4*rho*calcArea(db)*1000/spc/1000**2).toPrecision(3);

    // Capacity
    Mcapacity.value = calcMomentCapacity(fsy, db).toPrecision(3);
    Ncapacity.value = calcAxialCapacity(fsy, db).toPrecision(3);

    // Development length
    hideshowac();
    let cd = calccd();
    let fc = i_fc.valueAsNumber;
    let k1 = 1.0;
    let k2 = (132-db)/100;
    let k3 = limit(0.7, 1.0-0.15*(cd-db)/db, 1.0);
    console.log(k1, k2, k3);
    let Lsytb = Math.max(0.5*k1*k3*fsy*db/(k2*Math.sqrt(fc)),
                         0.058*fsy*k1*db);
    console.log(0.5*k1*k3*fsy*db/(k2*Math.sqrt(fc)));
    console.log(0.058*fsy*k1*db);
    o_cd.value = cd.toFixed();
    o_Lsytb.value = Lsytb.toFixed();
    o_simpleL.value = (40*db).toFixed();
}

function calccd()
{
    let cdtype = i_cdtype.value;
    let a = i_a.value;
    let c = i_c.value;
    if (cdtype == "ia" || cdtype == "ib" || cdtype == "iia")
    { return Math.min(a/2, c); }
    else if (cdtype == "ic" || cdtype == "iic")
    { return c; }
    else if (cdtype == "iib")
    { return a/2; }
}

function hideshowac()
{
    let cdtype = i_cdtype.value;
    if (cdtype == "ia" || cdtype == "ib" || cdtype == "iia") {
        i_a.parentElement.parentElement.style.display = "";
        i_c.parentElement.parentElement.style.display = "";
    }
    else if (cdtype == "ic" || cdtype == "iic") {
        i_a.parentElement.parentElement.style.display = "none";
        i_c.parentElement.parentElement.style.display = "";
    }
    else if (cdtype == "iib") {
        i_a.parentElement.parentElement.style.display = "";
        i_c.parentElement.parentElement.style.display = "none";
    }
}

function limit(min, val, max)
{
    return Math.max(Math.min(val, max), min);
}

function calcArea(db)
{
    return Math.PI*db**2/4;
}

function calcSectionModulus(db) {
    return calcSecondMoment(db)/(db/2);
}

function calcSecondMoment(db)
{
    return Math.PI*db**4/64;
}

function calcAxialCapacity(fsy, db) {
    return fsy*calcArea(db)/1000; // kN
}

function calcMomentCapacity(fsy, db) {
    return fsy*calcSectionModulus(db)/1000**2; // kNm
}
