
function updatePage()
{
    fillOutputs();
    setStatusUptodate();
}

function fillOutputs()
{
    area.value = calcArea().toPrecision(3);
    aream.value = (calcArea()/1000**2).toExponential(2);
    secondmoment.value = calcSecondMoment().toPrecision(3);
    secondmomentm.value = (calcSecondMoment()/1000**4).toPrecision(3);
    sectionmodulus.value = calcSectionModulus().toPrecision(3);
    sectionmodulusm.value = (calcSectionModulus()/1000**3).toPrecision(3);

    Ncapacity.value = calcAxialCapacity().toPrecision(3);
    Mcapacity.value = calcMomentCapacity().toPrecision(3);
}

function calcArea()
{
    let db = diameter.valueAsNumber;
    return Math.PI*db**2/4;
}

function calcSectionModulus() {
    let db = diameter.valueAsNumber;
    return calcSecondMoment()/(db/2);
}

function calcSecondMoment()
{
    let db = diameter.valueAsNumber;
    return Math.PI*db**4/64;
}

function calcAxialCapacity() {
    let fsy = yieldStrength.valueAsNumber;
    return fsy*calcArea()/1000; // kN
}

function calcMomentCapacity() {
    // let db = diameter.valueAsNumber;
    let fsy = yieldStrength.valueAsNumber;
    return fsy*calcSectionModulus()/1000**2; // kNm
}
