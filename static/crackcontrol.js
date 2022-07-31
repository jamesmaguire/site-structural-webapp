function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_db', {initval:12, units:'mm'});
    input('i_spc', {initval:200, units:'mm'});
    input('i_layers', {initval:1});
    output('o_Ab', {units:'mm<sup>2</sup>'});
    output('o_rate', {units:'mm<sup>2</sup>/m'});

    input('i_D', {initval:200, units:'mm'});
    input('i_sigmacp', {initval:0, units:'MPa'});
    output('o_cc0', {units:'mm<sup>2</sup>/m'});
    output('o_cc1', {units:'mm<sup>2</sup>/m'});
    output('o_cc2', {units:'mm<sup>2</sup>/m'});
    output('o_cc3', {units:'mm<sup>2</sup>/m'});

    input('i_t', {initval:200, units:'mm'});
    output('o_rhow');
    output('o_rhowmin');
    output('o_rhowv');
    output('o_rhowh');
    output('o_rhow1');
    output('o_rhow2');
    output('o_rhow3');

    updatePage();
}

function updatePage() {

    // Rates
    const db = i_db.valueAsNumber;
    const spc = i_spc.valueAsNumber;
    const layers = i_layers.valueAsNumber;

    const Ab = Math.PI * db**2 / 4;
    o_Ab.value = Ab.toFixed(0);
    const rate = layers*Ab*1000/spc;
    o_rate.value = rate.toFixed(0);

    // Slabs
    const D = Math.min(i_D.valueAsNumber, 500);
    const sigmacp = i_sigmacp.valueAsNumber;
    const cc0 = Math.max(0, (1.75 - 2.5*sigmacp)*D);
    o_cc0.value = cc0.toFixed(0);
    const cc1 = Math.max(0, (1.75 - 2.5*sigmacp)*D);
    o_cc1.value = cc1.toFixed(0);
    const cc2 = Math.max(0, (3.5 - 2.5*sigmacp)*D);
    o_cc2.value = cc2.toFixed(0);
    const cc3 = Math.max(0, (6.0 - 2.5*sigmacp)*D);
    o_cc3.value = cc3.toFixed(0);

    setPassFail(o_cc0, threshold=rate, inverse=false);
    setPassFail(o_cc1, threshold=rate, inverse=false);
    setPassFail(o_cc2, threshold=rate, inverse=false);
    setPassFail(o_cc3, threshold=rate, inverse=false);

    // Walls
    const t = Math.min(i_t.valueAsNumber, 500);
    const rhow = Ab*layers*(1000/spc)/t/1000;
    o_rhow.value = rhow.toFixed(4);

    const rhowmin = 0.0025;
    o_rhowmin.value = rhowmin;
    const rhowv = 0.0015;
    o_rhowv.value = rhowv;
    const rhowh = 0.0015;
    o_rhowh.value = rhowh;

    const rhow1 = 0.0025;
    o_rhow1.value = rhow1;
    const rhow2 = 0.0035;
    o_rhow2.value = rhow2;
    const rhow3 = 0.006;
    o_rhow3.value = rhow3;

    setPassFail(o_rhowmin, threshold=rhow, inverse=false);
    setPassFail(o_rhowv, threshold=rhow, inverse=false);
    setPassFail(o_rhowh, threshold=rhow, inverse=false);
    setPassFail(o_rhow1, threshold=rhow, inverse=false);
    setPassFail(o_rhow2, threshold=rhow, inverse=false);
    setPassFail(o_rhow3, threshold=rhow, inverse=false);

    setStatusUptodate();
}

initPage();
