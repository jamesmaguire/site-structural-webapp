function initPage()
{
    // Parameters
    dropdown('i_section', steelSectionData.map(x => x.Designation));
    o_table.className += 'overflow';

    updatePage();
}

function updatePage()
{
    runCalcs();
    drawFigure();
    setStatusUptodate();
}

function drawFigure()
{
    let section = i_section.value;
    let sectionProps = steelSectionData.filter(x => x.Designation === section)[0];
    let sectionType = memberType(sectionProps);

    let svgNS = 'http://www.w3.org/2000/svg';
    let s = 'black';
    let f = 'lightgrey';
    let sw = 1;
    let figW = 500;
    let figH = 500;
    let secW = 400;
    let secH = 400;

    let outlinePath = '';
    if (sectionType === 'UB' ||
        sectionType === 'UBP' ||
        sectionType === 'UC') {
        outlinePath = UBrelpath(sectionProps);
        secW = sectionProps.bf;
        secH = sectionProps.d;
    } else if (sectionType === 'EA') {
        outlinePath = EArelpath(sectionProps);
        secW = sectionProps.nL+sectionProps.nR;
        secH = sectionProps.pB+sectionProps.pT;
    } else if (sectionType === 'UA') {
        outlinePath = UArelpath(sectionProps);
        secW = sectionProps.b2;
        secH = sectionProps.b1;
    } else if (sectionType === 'PFC') {
        outlinePath = PFCrelpath(sectionProps);
        secW = sectionProps.bf;
        secH = sectionProps.d;
    } else if (sectionType === 'TFB') {
        console.log('TFB figure not implemented');
    } else {
        console.log('Section not recognised');
    }

    svg = document.createElementNS(svgNS, 'svg');
    svg.setAttributeNS(null, 'width', figW);
    svg.setAttributeNS(null, 'height', figH);
    svg.setAttributeNS(null, 'viewBox', `${-0.1*secW} ${-0.1*secH} ${1.2*secW} ${1.2*secH}`);
    svg.setAttributeNS(null, 'preserveAspectRatio',"xMidYMid");

    outline = document.createElementNS(svgNS,'path');
    outline.setAttributeNS(null, 'd', outlinePath);
    outline.setAttributeNS(null, 'fill', f);
    outline.setAttributeNS(null, 'stroke', s);
    outline.setAttributeNS(null, 'stroke-width', sw);
    outline.setAttributeNS(null, 'stroke-linejoin', 'round');

    document.getElementById('sectionFigure').innerHTML = '';
    document.getElementById('sectionFigure').appendChild(svg).appendChild(outline);
}

function runCalcs()
{
    let section = i_section.value;
    let sectionProps = steelSectionData.filter(x => x.Designation === section)[0];
    let sectionType = memberType(sectionProps);

    const keysub = key => key !== 'Designation' && key !== 'Mass'
          ? `${key[0]}<sub>${key.slice(1)}</sub>`
          : key;

    // Display member properties
    let units = {
        'Mass':' kg/m',
        'Ag':' mm<sup>2</sup>',
        'Ix':'x10<sup>6</sup> mm<sup>4</sup>',
        'Zx':'x10<sup>3</sup> mm<sup>3</sup>',
        'Sx':'x10<sup>3</sup> mm<sup>3</sup>',
        'rx':' mm',
        'Iy':'x10<sup>6</sup> mm<sup>4</sup>',
        'Zy':'x10<sup>3</sup> mm<sup>3</sup>',
        'Sy':'x10<sup>3</sup> mm<sup>3</sup>',
        'ry':' mm',
        'J':'x10<sup>3</sup> mm<sup>4</sup>',
        'Iw':'x10<sup>9</sup> mm<sup>6</sup>',
    };
    let names = {
        'Mass':'',
        'Ag':'Gross area, ',
        'Ix':'Second moment, ',
        'Zx':'Elastic section modulus, ',
        'Sx':'Plastic section modulus, ',
        'rx':'Radius of gyration, ',
        'Iy':'Second moment, ',
        'Zy':'Elastic section modulus, ',
        'Sy':'Plastic section modulus, ',
        'ry':'Radius of gyration, ',
        'J':'Torsion constant, ',
        'Iw':'Warping constant, ',
    };
    propmarkups = '';
    let keys = Object.keys(sectionProps);
    for (i=0; i<keys.length; i++) {
        let prop = keys[i];
        if (Object.keys(units).some(x => x === prop)) {
            let ele = `<p>${names[prop]}${keysub(prop)} `;
            ele += `<span class="outputspan">`;
            ele += `<input type="number" value="${sectionProps[prop]}" class="right" readonly>`;
            ele += `${units[prop]}`;
            ele += `</span></p>`;
            propmarkups += ele;
        }

    }
    o_properties.innerHTML = propmarkups;

    // Construct table
    let candidates = membersOfType(sectionType);
    keys = Object.keys(candidates[0]);
    let tablemarkup = "<table>";
    tablemarkup += "<tr>";
    for (i=0; i<keys.length; i++) {tablemarkup += `<th>${keysub(keys[i])}</th>`;}
    tablemarkup += "</tr>";
    for (candidate=0; candidate<candidates.length; candidate++) {
        if (candidates[candidate].Designation === section) {
            tablemarkup += "<tr class='selected'>";
        } else {
            tablemarkup += "<tr>";
        }
        for (key=0; key<keys.length; key++) {
            tablemarkup += `<td>${candidates[candidate][keys[key]]}</td>`;
        }
        tablemarkup += "</tr>";
    }
    o_table.innerHTML = tablemarkup;

}

const memberType = x =>
      x.Designation
      .split('')
      .filter(c => '0123456789.x'.indexOf(c) === -1)
      .join('');

const membersOfType = type =>
      steelSectionData.filter(x => memberType(x) === type);

function UBrelpath(sec) {
    let bi = (sec.bf - sec.tw)/2;
    let path = 'M0,0';
    path+=`l${sec.bf},0`;
    path+=`l0,${sec.tf}`;
    path+=`l${-bi+sec.r1},0`;
    path+=`q${-sec.r1},0 ${-sec.r1},${sec.r1}`;
    path+=`l0,${sec.d-2*sec.tf-2*sec.r1}`;
    path+=`q0,${sec.r1} ${sec.r1},${sec.r1}`;
    path+=`l${bi-sec.r1},0`;
    path+=`l0,${sec.tf}`;
    path+=`l${-sec.bf},0`;
    path+=`l0,${-sec.tf}`;
    path+=`l${bi-sec.r1},0`;
    path+=`q${sec.r1},0 ${sec.r1},${-sec.r1}`;
    path+=`l0,${-sec.d+2*sec.tf+2*sec.r1}`;
    path+=`q0,${-sec.r1} ${-sec.r1},${-sec.r1}`;
    path+=`l${-bi+sec.r1},0`;
    path+=`z`;
    return path;
}

function PFCrelpath(sec) {
    let bi = sec.bf-sec.tw;
    let path = 'M0,0';
    path+=`l${sec.bf},0`;
    path+=`l0,${sec.tf}`;
    path+=`l${-bi+sec.r1},0`;
    path+=`q${-sec.r1},0 ${-sec.r1},${sec.r1}`;
    path+=`l0,${sec.d-2*sec.tf-2*sec.r1}`;
    path+=`q0,${sec.r1} ${sec.r1},${sec.r1}`;
    path+=`l${bi-sec.r1},0`;
    path+=`l0,${sec.tf}`;
    path+=`l${-sec.bf},0`;
    path+=`z`;
    return path;
}

function EArelpath(sec) {
    let path = 'M0,0';
    path+=`l0,${sec.pT+sec.pB}`;
    path+=`l${sec.nL+sec.nR},0`;
    if (sec.t > sec.r1) {
        path+=`l0,${-sec.t+sec.r1}`;
        path+=`q0,${-sec.r1} ${-sec.r1},${-sec.r1}`;
    } else {
        path+=`q0,${-sec.t} ${-sec.r1},${-sec.t}`;
    }
    path+=`l${-sec.nR-sec.nL+sec.t+sec.r1+sec.r2},0`;
    path+=`q${-sec.r2},0 ${-sec.r2},${-sec.r2}`;
    path+=`l0,${-sec.pB-sec.pT+sec.t+sec.r1+sec.r2}`;
    if (sec.t > sec.r1) {
        path+=`q0,${-sec.r1} ${-sec.r1},${-sec.r1}`;
    } else {
        path+=`q0,${-sec.r1} ${-sec.t},${-sec.r1}`;
    }
    path+=`z`;
    return path;
}

function UArelpath(sec) {
    let path = 'M0,0';
    path+=`l0,${sec.b1}`;
    path+=`l${sec.b2},0`;
    if (sec.t > sec.r1) {
        path+=`l0,${-sec.t+sec.r1}`;
        path+=`q0,${-sec.r1} ${-sec.r1},${-sec.r1}`;
    } else {
        path+=`q0,${-sec.t} ${-sec.r1},${-sec.t}`;
    }
    path+=`l${-sec.b2+sec.t+sec.r1+sec.r2},0`;
    path+=`q${-sec.r2},0 ${-sec.r2},${-sec.r2}`;
    path+=`l0,${-sec.b1+sec.t+sec.r1+sec.r2}`;
    if (sec.t > sec.r1) {
        path+=`q0,${-sec.r1} ${-sec.r1},${-sec.r1}`;
    } else {
        path+=`q0,${-sec.r1} ${-sec.t},${-sec.r1}`;
    }
    path+=`z`;
    return path;
}

initPage();
