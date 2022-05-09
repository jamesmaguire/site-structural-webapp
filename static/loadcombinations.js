function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function initPage()
{
    input('i_G', {initval:6.0});
    input('i_Q', {initval:1.5});
    input('i_Wu', {initval:0});
    input('i_Eu', {initval:0});

    output('o_strength1', {});
    output('o_strength2', {});
    output('o_strength3', {});
    output('o_strength4', {});
    output('o_strength5', {});
    output('o_strength6', {});
    // output('o_strength7', {});

    updatePage();
}

function updatePage() {

    const G = i_G.valueAsNumber;
    const Q = i_Q.valueAsNumber;
    const Wu = i_Wu.valueAsNumber;
    const Eu = i_Eu.valueAsNumber;

    // Make dynamic
    const psil = 0.7;
    const psic = 0.4;
    const psiE = 0.3;

    o_strength1.value = (1.35*G).toPrecision(3);
    o_strength2.value = (1.2*G + 1.5*Q).toPrecision(3);
    o_strength3.value = (1.2*G + 1.5*psil*Q).toPrecision(3);
    o_strength4.value = (1.2*G + Wu + psic*Q).toPrecision(3);
    o_strength5.value = (0.9*G + Wu).toPrecision(3);
    o_strength6.value = (G + Eu + psiE*Q).toPrecision(3);
    // o_strength7.value = (G + Su + psiE*Q).toPrecision(3);

    setStatusUptodate();
}
