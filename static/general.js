function eventHandler(event)
{
    if (event.keyCode == 13) {
        updatePage();
    } else {
        setStatusOutofdate();
    }
}

function setPassFail (obj, threshold=1, inverse=false) {
    if (obj.valueAsNumber < threshold && inverse == false) {
        obj.parentElement.className = 'outputspan PASS right';
    } else if (obj.valueAsNumber > threshold && inverse == true) {
        obj.parentElement.className = 'outputspan PASS right';
    } else {
        obj.parentElement.className = 'outputspan FAIL right';
    }
}

function setStatusOutofdate()
{
    if (document.getElementById('text-results-window') != null) {
        document.getElementById('text-results-window').innerHTML = "";
    }
    statusbutton.innerHTML = "▶ &nbsp Solve";
    statusbutton.className = "status-red";
}

function setStatusUptodate()
{
    statusbutton.innerHTML = "▶ &nbsp Up to date";
    statusbutton.className = "status-green";
}

function hideInput(i_ID) {
    i_ID.parentElement.parentElement.style.display = "none";
}
function showInput(i_ID) {
    i_ID.parentElement.parentElement.style.display = "";
}

function xlookup(x, lookuparr, returnarr) {
    return returnarr[lookuparr.indexOf(x)];
}

// Linear interpolation of xlookup values
function ilookup(x, lookuparr, returnarr) {
    let x0 = Math.max(...lookuparr.filter(n => n <= x));
    let x1 = Math.min(...lookuparr.filter(n => n > x));
    let y0 = xlookup(x0, lookuparr, returnarr);
    let y1 = xlookup(x1, lookuparr, returnarr);
    let y;
    if (x < lookuparr.reduce((a,b) => Math.min(a,b))) {
        y = returnarr.reduce((a,b) => Math.min(a,b));
    } else if (x > lookuparr.reduce((a,b) => Math.max(a,b))) {
        y = returnarr.reduce((a,b) => Math.max(a,b));
    }
    else {
        y = y0 + (x-x0)*(y1-y0)/(x1-x0);
    }
    return y;
}

// Input elements --------------------------------------------------------------

function dropdown(id, values, initval=0) {
    let html = `<select id='${id}' value='${initval}' onchange='updatePage();'>`;
    values.forEach(x => html+= `<option value="${x}">${x}</option>`);
    html += `</select>`;
    document.getElementById(id).outerHTML = html;
}

function input(id, {initval=0, units='', prefix='', align='right'}={}) {
    let html = `<span class="inputspan">${prefix}`;
    html += `<input id='${id}' class='${align}' type='number' value=${initval}`;
    html += ` onkeypress='eventHandler(event)' onblur='updatePage()'>`;
    html += ` ${units}</span>`;
    document.getElementById(id).outerHTML = html;
}

function output(id, {initval=0, units='', prefix='', align='right'}={}) {
    let html = `<span class="outputspan">${prefix}`;
    html += `<input id='${id}' class='${align}' type='number' value=${initval} readonly>`;
    html += ` ${units}</span>`;
    document.getElementById(id).outerHTML = html;
}

function textoutput(id, {initval='', units='', prefix='', align='right'}={}) {
    let html = `<span class="outputspan">`;
    html += `<input id='${id}' class='${align}' type='text' value="${initval}" readonly>`;
    html += `</span>`;
    document.getElementById(id).outerHTML = html;
}

function text(id, {initval='', align='left'}={}) {
    let html = `<span class="inputspan">`;
    html += `<input id='${id}' class='${align}' value='${initval}'`;
    html += ` onkeypress='eventHandler(event)' onblur='updatePage()'>`;
    html += ` </span>`;
    document.getElementById(id).outerHTML = html;
}

function canvas(id, width=500, height=500) {
    let html = `<canvas id='${id}'`;
    html += ` width=${width}`;
    html += ` height=${height}`;
    html += ` draggable='true'></canvas>`;
    return html;
}

// Helper for creating svg elements
function svgElemAppend(parent, type, dict, content='')
{
    let svgNS = 'http://www.w3.org/2000/svg';
    let element = document.createElementNS(svgNS, type);
    Object.keys(dict).forEach(key =>
        element.setAttributeNS(null, key, dict[key]));
    element.innerHTML = content;
    parent.appendChild(element);
    return element;
}
