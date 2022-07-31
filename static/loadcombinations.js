function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    text('i_unit', {initval:'kPa'});

    input('i_G', {initval:6.0});
    input('i_Q', {initval:1.5});
    input('i_Wu', {initval:0});
    input('i_Eu', {initval:0});

    dropdown('i_combtype',
             ['Residential', 'Offices', 'Parking', 'Retail', 'Storage',
              'Other', 'Trafficable roof', 'Non-trafficable roof']);

    output('o_psis');
    output('o_psil');
    output('o_psic');
    output('o_psiE');

    textoutput('o_strength1', {});
    textoutput('o_strength2', {});
    textoutput('o_strength3', {});
    textoutput('o_strength4', {});
    textoutput('o_strength5', {});
    textoutput('o_strength6', {});

    textoutput('o_service1', {});
    textoutput('o_service2', {});
    textoutput('o_service3', {});

    updatePage();
}

function updatePage() {

    const units = i_unit.value;

    const G = i_G.valueAsNumber;
    const Q = i_Q.valueAsNumber;
    const Wu = i_Wu.valueAsNumber;
    const Eu = i_Eu.valueAsNumber;

    // Make dynamic

    const factors = {
        'Residential':          {'s':0.7, 'l':0.4, 'c':0.4, 'E':0.3},
        'Offices':              {'s':0.7, 'l':0.4, 'c':0.4, 'E':0.3},
        'Parking':              {'s':0.7, 'l':0.4, 'c':0.4, 'E':0.3},
        'Retail':               {'s':0.7, 'l':0.4, 'c':0.4, 'E':0.3},
        'Storage':              {'s':1.0, 'l':0.6, 'c':0.6, 'E':0.6},
        'Other':                {'s':1.0, 'l':0.6, 'c':0.6, 'E':0.6},
        'Trafficable roof':     {'s':0.7, 'l':0.4, 'c':0.4, 'E':0.3},
        'Non-trafficable roof': {'s':0.7, 'l':0.0, 'c':0.0, 'E':0.0},
    };
    const psis = factors[i_combtype.value]['s'];
    const psil = factors[i_combtype.value]['l'];
    const psic = factors[i_combtype.value]['c'];
    const psiE = factors[i_combtype.value]['E'];

    o_psis.value = psis.toFixed(1);
    o_psil.value = psil.toFixed(1);
    o_psic.value = psic.toFixed(1);
    o_psiE.value = psiE.toFixed(1);

    o_strength1.value = (1.35*G).toPrecision(3).toString() + " " + units;
    o_strength2.value = (1.2*G + 1.5*Q).toPrecision(3).toString() + " " + units;
    o_strength3.value = (1.2*G + 1.5*psil*Q).toPrecision(3).toString() + " " + units;
    o_strength4.value = (1.2*G + Wu + psic*Q).toPrecision(3).toString() + " " + units;
    o_strength5.value = (0.9*G + Wu).toPrecision(3).toString() + " " + units;
    o_strength6.value = (G + Eu + psiE*Q).toPrecision(3).toString() + " " + units;

    o_service1.value = (G).toPrecision(3).toString() + " " + units;
    o_service2.value = (G + psis*Q).toPrecision(3).toString() + " " + units;
    o_service3.value = (G + psil*Q).toPrecision(3).toString() + " " + units;

    setStatusUptodate();
}

initPage();
