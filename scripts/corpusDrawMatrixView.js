var margin = {
    top: 100,
    right: 50,
    bottom: 50,
    left: 200
}
var menutop = [{
        title: 'Sort by this column',
        action: (elm, d, i) => sortByThisCol(d)
    },
    {
        title: 'Sort column by distance from this',
        action: (elm, d, i) => sortColByThisDist(d)
    },
]
var menudoc = [{
        title: 'Sort by this row',
        action: (elm, d, i) => sortByThisRow(d)
    },
    {
        title: 'Sort rows by distance from this',
        action: (elm, d, i) => sortRowByThisDist(d)
    },
    {
        title: 'Open in TextViewer',
        action: function (elm, d, i) {
            console.log('Open in TextViewer');
        }
    },
]
var mat_root = 'matrix-content'
var mat_width
var mat_height
var svg

function drawMatrix(data, _docarr, _toparr) {
    mat_width = math.max(20 * getTopArr(metadata).length, 1200 - margin.left - margin.right)
    mat_height = math.max(20 * metadata.length, 900 - margin.top - margin.bottom)
    svg = d3.select('#matrix-content').append('svg')
        .attr("width", mat_width + margin.left + margin.right)
        .attr("height", mat_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var maxtval = getMaxTopVal(data)
    var l_docarr = _docarr
    var l_toparr = _toparr
    var xscale = d3.scalePoint()
        .domain(getPaddingArr(l_toparr))
        .range([0, mat_width])

    var yscale = d3.scalePoint()
        .domain(getPaddingArr(l_docarr).map(d => d.filename))
        .range([0, mat_height])

    var doclines = svg.append('g')
        .attr('class', 'doclines')
        .selectAll('.docline')
        .data(getPaddingArr(l_docarr))
        .enter()
        .append('line')
        .attr('class', d => 'docline ' + d.filename)
        // .style("stroke", "black")
        .attr("x1", 0)
        .attr("y1", d => yscale(d.filename))
        .attr("x2", mat_width)
        .attr("y2", d => yscale(d.filename))

    var toplines = svg.append('g')
        .attr('class', 'toplines')
        .selectAll('.topline')
        .data(getPaddingArr(l_toparr))
        .enter()
        .append('line')
        .attr('class', d => 'topline ' + d)
        // .style("stroke", "black")
        .attr("x1", d => xscale(d))
        .attr("y1", 0)
        .attr("x2", d => xscale(d))
        .attr("y2", mat_height)

    function dlabel(d) {
        return 'doclabel ' + d.filename + ' ' + d.id + ' ' + 'context-menu-doc'
    }
    var doclabels = svg.append('g')
        .attr('class', 'doclabels')
        .selectAll('.doclabels')
        .data(l_docarr)
        .enter()
        .append('text')
        .attr('class', d => dlabel(d))
        .attr("x", -10)
        .attr("y", function (d) {
            return yscale(d.filename);
        })
        // .attr("dy", ".25em")
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'end')
        .attr('cursor', "pointer")
        .text(function (d) {
            return d.filename;
        })
        .on('mouseover', hoverDoc)
        .on('mouseleave', hoverDoc)
        .on('dblclick', sortByThisRow)
        .call(d3.drag()
            // .on("start", started)
            .on("drag", draggedDoc)
            .on("end", endedDoc)
        )
        .on('click', selectDoc)
        .on('contextmenu', d3.contextMenu(menudoc))


    function tlabel(d) {
        return 'toplabel ' + d + ' ' + 'context-menu-top'
    }
    var toplabels = svg.append('g')
        .attr('class', 'toplabels')
        .selectAll('.toplabels')
        .data(l_toparr)
        .enter()
        .append('text')
        .attr('class', d => tlabel(d))
        .attr("y", -10)
        .attr("x", function (d) {
            return xscale(d);
        })
        .attr('transform', d => {
            return "rotate(-60," + xscale(d) + "," + -10 + ")"
        })
        .attr('text-anchor', 'start')
        .attr('cursor', "pointer")
        .text(function (d) {
            return d;
        })
        .on('mouseover', hoverTop)
        .on('mouseleave', hoverTop)
        .on('dblclick', sortByThisCol)
        .on('click', selectTop)
        .on('contextmenu', d3.contextMenu(menutop))
        .call(d3.drag()
            // .on("start", started)
            .on("drag", draggedTop)
            .on("end", endedTop)
        )

    var scatter_data = getScatter(data);
    var rscale = d3.scaleLinear()
        .domain([0, maxtval])
        .range([3, 8])
    var dots = svg.append("g")
        .attr("class", "dots")
        .selectAll(".dot")
        .data(scatter_data)
        .enter().append("circle")
        .attr("class", d => 'dot ' + d.doc + ' ' + d.top)
        .attr("r", d => {
            if (isNaN(d.val))
            console.log(d)
            return rscale(d.val)})
        .attr("cx", function (d) {
            return xscale(d.top);
        })
        .attr("cy", function (d) {
            return yscale(d.doc);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .style("fill", "yellow")
        .on('mouseover', hoverAll)
        .on('mouseleave', hoverAll)

        // click blank to deselect
        $('#'+mat_root).find('svg').on('click', (e) => {
            var _con = $('.toplabel,.doclabel')
            if(!_con.is(e.target) && _con.has(e.target).length === 0) {
                if (e.offsetX < margin.left) clearDocSel()
                if (e.offsetY < margin.top) clearTopSel()
			}

        })

    return {
        update: (newdata, newdocarr, newtoparr) => {
            mat_width = math.max(20 * getTopArr(metadata).length, 1200 - margin.left - margin.right)
            mat_height = math.max(7 * metadata.length, 900 - margin.top - margin.bottom)
            d3.select('#matrix-content').select('svg').attr("width", mat_width + margin.left + margin.right)
                .attr("height", mat_height + margin.top + margin.bottom)
            svg
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            maxtval = getMaxTopVal(newdata)
            l_toparr = newtoparr
            l_docarr = newdocarr
            xscale.domain(getPaddingArr(l_toparr)).range([0, mat_width])
            yscale.domain(getPaddingArr(l_docarr).map(d => d.filename))
                .range([0, mat_height])

            doclines
                .data(getPaddingArr(newdocarr))
                .transition()
                .duration(750)
                .attr('class', d => 'docline ' + d.filename)
                // .style("stroke", "black")
                .attr("x1", 0)
                .attr("y1", d => yscale(d.filename))
                .attr("x2", mat_width)
                .attr("y2", d => yscale(d.filename))
            doclines
                .data(getPaddingArr(newdocarr))
                .enter()
                .append('line')
                .attr('class', d => 'docline ' + d.filename)
                // .style("stroke", "black")
                .attr("x1", 0)
                .attr("y1", d => yscale(d.filename))
                .attr("x2", mat_width)
                .attr("y2", d => yscale(d.filename))
            doclines
                .data(getPaddingArr(l_docarr))
                .exit()
                .remove()
            // update existing lines, (still exist after update)
            toplines
                .data(getPaddingArr(l_toparr))
                .transition()
                .duration(750)
                .attr('class', d => 'topline ' + d)
                // .style("stroke", "black")
                .attr("x1", d => xscale(d))
                .attr("y1", 0)
                .attr("x2", d => xscale(d))
                .attr("y2", mat_height)
            //add new lines
            toplines
                .data(getPaddingArr(l_toparr))
                .enter()
                .append('line')
                .attr('class', d => 'topline ' + d)
                // .style("stroke", "black")
                .attr("x1", d => xscale(d))
                .attr("y1", 0)
                .attr("x2", d => xscale(d))
                .attr("y2", mat_height)
            // remove older ones
            toplines
                .data(getPaddingArr(l_toparr))
                .exit()
                .remove()

            doclabels = d3.select('.doclabels').selectAll('text').data(l_docarr)
            doclabels.exit().remove()
            doclabels.enter().append('text')
            doclabels
                .transition()
                .duration(750)
                .attr("x", -10)
                .attr("y", function (d) {
                    return yscale(d.filename);
                })
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'end')
                .attr('class', d => dlabel(d))
                .attr('cursor', "pointer")
                .text(function (d) {
                    return d.filename;
                })

            toplabels = d3.select('.toplabels').selectAll('text').data(l_toparr)
            toplabels.exit().remove()
            toplabels
                .enter()
                .append('text')
            toplabels.transition().duration(750)
                .attr('class', d => tlabel(d))
                .attr("x", function (d) {
                    return xscale(d);
                })
                .attr("y", -10)
                .attr('text-anchor', 'start')
                .attr('transform', d => {
                    return "rotate(-60," + xscale(d) + "," + -10 + ")"
                })
                .attr('cursor', "pointer")
                .text(function (d) {
                    return d;
                })

            scatter_data = getScatter(newdata);
            rscale.domain([0, maxtval])
            dots = d3.select('.dots').selectAll('circle').data(scatter_data)
            dots.exit().remove()
            dots.enter().append("circle")
            dots.transition()
                .duration(750)
                .attr("class", d => 'dot ' + d.doc + ' ' + d.top)
                .attr("r", d => {
                    if (d.val == NaN)
                    console.log(d)
                    return rscale(d.val)})
                .attr("cx", function (d) {
                    return xscale(d.top);
                })
                .attr("cy", function (d) {
                    return yscale(d.doc);
                })
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .style("fill", "yellow")
        },
        reorderMat: (newdocarr, newtoparr) => {
            l_toparr = newtoparr
            l_docarr = newdocarr
            xscale.domain(getPaddingArr(l_toparr))
            yscale.domain(getPaddingArr(l_docarr).map(d => d.filename))
            doclines
                .transition()
                .duration(750)
                .attr("y1", d => yscale(d.filename))
                .attr("y2", d => yscale(d.filename))
            toplines
                .transition()
                .duration(750)
                .attr("x1", d => xscale(d))
                .attr("x2", d => xscale(d))
            doclabels
                .transition()
                .duration(750)
                .attr("y", function (d) {
                    return yscale(d.filename);
                })
            toplabels.transition().duration(750)
                .attr("x", function (d) {
                    return xscale(d);
                })
                .attr('transform', d => {
                    return "rotate(-60," + xscale(d) + "," + -10 + ")"
                })
            dots.transition()
                .duration(750)
                .attr("cx", function (d) {
                    return xscale(d.top);
                })
                .attr("cy", function (d) {
                    return yscale(d.doc);
                })
        }
    }
}

var hoverAll = function (d) {
    var state = false;
    if (d3.event.type == 'mouseover') state = true
    var myClass = $(this).attr("class")
    var classSplit = myClass.split(' ')
    var doc = classSplit[1]
    var top = classSplit[2]

    var dots = $('.dots').find('.' + top + ',' + '.' + doc).toggleClass('hover', state)
    var toplabels = $('.toplabels').find('.' + top).toggleClass('hover', state)
    var doclabels = $('.doclabels').find('.' + doc).toggleClass('hover', state)
}

var hoverDoc = function (d) {
    var state = false;
    if (d3.event.type == 'mouseover') state = true
    var myClass = $(this).attr("class")
    var classSplit = myClass.split(' ')
    var doc = classSplit[1]
    var dots = $('.dots').find('.' + doc).toggleClass('hover', state)
    var doclabels = $('.doclabels').find('.' + doc).toggleClass('hover', state)

}
var hoverTop = function (d) {
    var state = false;
    if (d3.event.type == 'mouseover') state = true
    var myClass = $(this).attr("class")
    var classSplit = myClass.split(' ')
    var top = classSplit[1]
    var dots = $('.dots').find('.' + top).toggleClass('hover', state)
    var toplabels = $('.toplabels').find('.' + top).toggleClass('hover', state)
}

var sortByThisRow = function (d) {

    var myClass = $('.doclabels').find('.' + d.filename).attr("class")
    var classSplit = myClass.split(' ')
    var docid = parseInt(classSplit[2])
    // docarr = getDocArr(metadata)
    toparr = sortByRow(metadata, docid)
    matrixUpdater.reorderMat(docarr, toparr)
}

var sortByThisCol = function (d) {
    var myClass = $('.toplabels').find('.' + d).attr("class")
    var classSplit = myClass.split(' ')
    var topid = classSplit[1]
    // toparr = getTopArr(metadata)
    docarr = sortByCol(metadata, topid)
    matrixUpdater.reorderMat(docarr, toparr)
}

var draggedDoc = function (d) {
    var newY = Math.max(0, Math.min(mat_height, d3.event.y));
    d3.select(this)
        .attr('y', newY);
}
var endedDoc = function (d) {
    // Undo any highlighting here.

    // Find closest position to where the row is dropped and stick it there in the order.
    var newY = d3.select(this).attr('y');
    var newI = getRowIndexByY(newY);
    var oldI = docarr.findIndex(doc => d.id == doc.id)
    if (newI < oldI) {
        // offset
        newI += 1
        docarr.splice(newI, 0, docarr.splice(oldI, 1)[0]);
    } else if (newI > oldI) {
        docarr.splice(newI + 1, 0, docarr[oldI]);
        docarr.splice(oldI, 1);
    }
    matrixUpdater.reorderMat(docarr, toparr)
}

var draggedTop = function (d) {
    var newX = Math.max(0, Math.min(mat_width, d3.event.x));
    d3.select(this)
        .attr('x', newX)
        .attr('transform', d => {
            return "rotate(-60," + newX + "," + -10 + ")"
        })
}
var endedTop = function (d) {
    // Undo any highlighting here.

    // Find closest position to where the row is dropped and stick it there in the order.
    var newY = d3.select(this).attr('x');
    var newI = getColIndexByX(newY);
    var oldI = toparr.findIndex(top => d == top)
    if (newI < oldI) {
        // offset
        newI += 1
        toparr.splice(newI, 0, toparr.splice(oldI, 1)[0]);
    } else if (newI > oldI) {
        toparr.splice(newI + 1, 0, toparr[oldI]);
        toparr.splice(oldI, 1);
    }
    matrixUpdater.reorderMat(docarr, toparr)
}

var sortRowByThisDist = function (d) {
    var myClass = $('.doclabels').find('.' + d.filename).attr("class")
    var classSplit = myClass.split(' ')
    var docid = parseInt(classSplit[2])
    docarr = sortByDistRow(metadata, docid)
    matrixUpdater.reorderMat(docarr, toparr)
}

var sortColByThisDist = function (d) {
    var myClass = $('.toplabels').find('.' + d).attr("class")
    var classSplit = myClass.split(' ')
    var tid = classSplit[1]
    toparr = sortByDistCol(metadata, tid)
    matrixUpdater.reorderMat(docarr, toparr)
}

var selectDoc = function (d) {
    var myClass = $('.doclabels').find('.' + d.filename).toggleClass("selected")
    cur_sel_doc = d.id
    updateDocView()
    updateDocAdSel(d, myClass.hasClass('selected'))
}

var selectTop = function (d) {
    var myClass = $('.toplabels').find('.' + d)
    myClass.toggleClass("selected")
    cur_sel_top = d
    updateTopView()
    updateTopAdSel(d, myClass.hasClass('selected'))
}