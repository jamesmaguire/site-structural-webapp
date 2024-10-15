function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function runCalcs() {
    const fc = i_fc.valueAsNumber;
    const t = i_t.valueAsNumber;
    const Ag = i_Ag.valueAsNumber;
    const ue = i_ue.valueAsNumber;
    const ecsdbstar = i_ecsdbstar.valueAsNumber;

    // Autogenous Shrinkage Strain
    const ecsestar = fc <= 50
          ? (0.07*fc-0.5)*50*10**-6
          : (0.08*fc-1.0)*50*10**-6;
    const ecse = ecsestar*(1.0-Math.exp(-0.07*t));
    o_ecsestar.value = ecsestar.toFixed(6);
    o_ecse.value = ecse.toFixed(6);

    // Drying Shrinkage Strain
    const th = 2*Ag/ue;
    const alpha1 = 0.8 + 1.2*Math.exp(-0.005*th);
    const k1 = alpha1*t**0.8/(t**0.8+0.15*th);
    const ecsdb = (0.9-0.005*fc)*ecsdbstar;
    let k4;
    if (i_env.value == "Arid") {
        k4 = 0.7;
    } else if (i_env.value == "Interior") {
        k4 = 0.65;
    } else if (i_env.value == "Temperate inland") {
        k4 = 0.6;
    } else if (i_env.value == "Tropical") {
        k4 = 0.5;
    } else if (i_env.value == "Near coastal/coastal") {
        k4 = 0.5;
    }
    const ecsd = k1*k4*ecsdb;

    o_th.value = th.toFixed(0);
    o_alpha1.value = alpha1.toFixed(2);
    o_k1.value = k1.toFixed(2);
    o_k4.value = k4.toFixed(2);
    o_ecsdb.value = ecsdb.toFixed(6);
    o_ecsd.value = ecsd.toFixed(6);
    
    // Shrinkage strain
    const ecs = ecse + ecsd;
    o_ecs.value = ecs.toFixed(6);

    // Shrinkage
    const L = i_L.valueAsNumber;
    const dL = L*ecs*1000;
    o_dL.value = dL.toFixed(0);
    o_dLmin.value = (dL*(1-0.3)).toFixed(0);
    o_dLmax.value = (dL*(1+0.3)).toFixed(0);


}

updatePage();
