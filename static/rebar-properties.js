
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
