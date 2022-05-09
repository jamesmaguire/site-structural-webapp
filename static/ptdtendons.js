function initPage () {

    // Canvas
    //TMP
    const maxX = 60;
    const maxY = 60;

    diagram.innerHTML='';
    const svgNS = 'http://www.w3.org/2000/svg';

    const margin = {left:20, right:20, top:20, bottom:20},
          height = 500 - margin.top - margin.bottom,
          width = 500 - margin.left - margin.right;

    const sf = Math.min(width/maxX, height/maxY);
    console.log(sf);

    const xmap = n => margin.left + sf*n;
    const ymap = n => margin.top  - sf*n + height;

    const svg = svgElemAppend(diagram, 'svg', {
        class:'bigsvg',
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom,
        viewBox:`0 0 `
            +`${width + margin.left + margin.top} `
            +`${height + margin.top + margin.bottom}`,
        preserveAspectRatio:"xMidYMid",
    });


    // Tendons
    let lines = ptdfile.split("\n");
    let tendonstartline = lines.findIndex(line => line==="TENDONS") + 2;
    let ntendons = Number(lines[tendonstartline-1]);
    let tendons = lines.slice(tendonstartline, tendonstartline + ntendons);
    tendons = tendons.map(t => t.split(","));
    tendondict = [];
    for (let i=0; i<tendons.length; i++) {
        tendondict.push({x1:Number(tendons[i][1]), y1:Number(tendons[i][2]),
                         x2:Number(tendons[i][3]), y2:Number(tendons[i][4])});
    }
    for (let i=0; i<tendondict.length; i++) {
        svgElemAppend(svg, 'line', {
            class:'tendon',
            x1:xmap(tendondict[i].x1),
            y1:ymap(tendondict[i].y1),
            x2:xmap(tendondict[i].x2),
            y2:ymap(tendondict[i].y2),
        });
    }

    // Columns
    lines = ptdfile.split("\n");
    let columnstartline = lines.findIndex(line => line==="COLUMNS") + 2;
    let ncolumns = Number(lines[columnstartline-1]);
    let columns = lines.slice(columnstartline, columnstartline + ncolumns);
    columns = columns.map(t => t.split(","));
    columndict = [];
    for (let i=0; i<columns.length; i++) {
        columndict.push({label:columns[i][2],
                         x:columns[i][3], y:columns[i][4],
                         A:columns[i][6], B:columns[i][7]});
        // console.log(columns[i]);
        // TODO: Support circular
        // TODO: Support rotations
        // TODO: Check over/under
    }
    for (let i=0; i<columndict.length; i++) {
        svgElemAppend(svg, 'rect', {
            class:'planconcrete',
            x:xmap(columndict[i].x - columndict[i].A/2),
            y:ymap(columndict[i].y - columndict[i].B/2),
            width:sf*columndict[i].A,
            height:sf*columndict[i].B,
        });
    }

    // Geometry line groups
    lines = ptdfile.split("\n");
    let geomlinestartline = lines.findIndex(line => line==="Geometry Line Groups") + 2;
    let ngeomlines = Number(lines[geomlinestartline-1]);
    let geomlines = lines.slice(geomlinestartline, geomlinestartline + ngeomlines);
    geomlines = geomlines.map(t => t.split(","));
    geomlinedict = [];
    for (let i=0; i<geomlines.length; i++) {
        // geomlinedict.push({label:geomlines[i][2],
        //                  x:geomlines[i][3], y:geomlines[i][4],
        //                  A:geomlines[i][6], B:geomlines[i][7]});
        console.log(geomlines[i]);
    }
    // for (let i=0; i<geomlinedict.length; i++) {
    //     svgElemAppend(svg, 'rect', {
    //         class:'planconcrete',
    //         x:xmap(geomlinedict[i].x - geomlinedict[i].A/2),
    //         y:ymap(geomlinedict[i].y - geomlinedict[i].B/2),
    //         width:sf*geomlinedict[i].A,
    //         height:sf*geomlinedict[i].B,
    //     });
    // }
};
