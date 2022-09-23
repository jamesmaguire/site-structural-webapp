function initPage()
{
    // Parameters
    dropdown('i_sectionType', ['UB', 'UC', 'PFC', 'UBP']);
    input('i_fy', {units:'MPa', initval:'350'});
    input('i_E', {units:'GPa', initval:'200'});
    input('i_G', {units:'GPa', initval:'80'});
    input('i_Mstar', {units:'kNm', initval:'0'});
    input('i_Nstar', {units:'kN', initval:'0'});
    input('i_kf', {initval:'1.0'});
    input('i_le', {initval:'3.0', units:'m'});
    dropdown('i_latRestraint', ['F', 'E', 'U']);

    o_table.className += 'overflow';

    updatePage();
}

function updatePage()
{
    runCalcs();
    setStatusUptodate();
}

function runCalcs()
{
    const sectionType = i_sectionType.value;
    let steelSectionData = membersOfType(sectionType);
    const keys = ['Designation', 'phiMs', 'phiNu'];
    const fy = i_fy.valueAsNumber;
    const E = i_E.valueAsNumber;
    const G = i_G.valueAsNumber;
    const kf = i_kf.valueAsNumber;
    const le = i_le.valueAsNumber === 0 ? 0.001 : i_le.valueAsNumber;
    const latRestraint = i_latRestraint.value;
    const phi = 0.9;

    console.log(steelSectionData[0]);

    const Mstar = i_Mstar.valueAsNumber;
    const Nstar = i_Nstar.valueAsNumber;

    // Bending
    for (let i=0; i<steelSectionData.length; i++) {
        let sec = steelSectionData[i];
        // Section moment capacity
        let Ms = sec.Zx*fy/1000;
        sec.phiMs = phi*Ms;
        // Member moment capacity
        let Mb;
        let Mo = Math.sqrt((Math.PI**2*(E*1000)*(sec.Iy*10**6)/(le*1000)**2)*((G*1000)*(sec.J*10**3) + (Math.PI**2*(E*1000)*(sec.Iw*10**9)/(le*1000)**2)))/1000**2;
        if (latRestraint === 'F') {
            Mb = Ms;
        } else if (latRestraint === 'E') {
            // let alpham = ;
            let Moa = Mo;
            let alphas = 0.6*(Math.sqrt((Ms/Moa)**2+3) - Ms/Moa);
            let alpham = 1.0; // Conservative, can increase up to 2.5
            Mb = Math.min(alpham*alphas*Ms, Ms);
        } else if (latRestraint === 'U') {
            let Mob = Mo;
            let alphas = 0.6*(Math.sqrt((Ms/Mob)**2+3) - Ms/Mob);
            Mb = Math.min(alphas*Ms, Ms);
        }
        sec.phiMb = phi*Mb;
    }

    // Axial compression
    for (let i=0; i<steelSectionData.length; i++) {
        let sec = steelSectionData[i];
        // Section axial capacity
        let kf = 1; // Assumed compact sections
        sec.phiNs = phi*kf*sec.Ag*fy/1000;
        // Member bending capacity
        let lambdan = (1000*le/Math.min(sec.rx,sec.ry))*Math.sqrt(kf)*Math.sqrt(fy/250);
        let alphaa = 2100*(lambdan-13.5)/(lambdan**2 - 15.3*lambdan + 2050);
        let alphab = {'UB':0, 'UC':0, 'PFC':0.5, 'UBP':0}[sectionType];
        let lambda = lambdan + alphaa*alphab;
        let nu = Math.max(0.00326*(lambda-13.5), 0);
        let zeta = ((lambda/90)**2+1+nu)/(2*(lambda/90)**2);
        let alphac = zeta*(1-Math.sqrt(1-(90/(zeta*lambda))**2));
        sec.phiNc = alphac*sec.phiNs;
        console.log(sec.rx, sec.ry);
        console.log(lambdan, alphac, nu, lambda, zeta, sec.phiNc);
    }

    o_table.innerHTML = gentable(steelSectionData, Mstar, Nstar);
}

const memberType = x =>
      x.Designation
      .split('')
      .filter(c => '0123456789.x'.indexOf(c) === -1)
      .join('');

const membersOfType = type =>
      steelSectionData.filter(x => memberType(x) === type);

function gentable (data, Mstar, Nstar) {
    const greentick = '<span style="color: green;">&#10004;</span>';
    const redcross  = '<span style="color: red";>&#10008;</span>';
    let html = "<table>";
    html += "<tr><th>Designation</th>";
    html += "<th>ϕM<sub>b</sub></th>";
    html += "<th>ϕN<sub>c</sub></th></tr>";
    for (let row=0; row<data.length; row++) {
        html += `<tr>`;
        html += `<td>${data[row].Designation}</td>`;
        html += `<td>${data[row].phiMb.toFixed(0)} kNm`;
        html += ` ${data[row].phiMb > Mstar ? greentick : redcross}</td>`;
        html += `<td>${data[row].phiNc.toFixed(0)} kN`;
        html += ` ${data[row].phiNc > Nstar ? greentick : redcross}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    return html;
}


initPage();
