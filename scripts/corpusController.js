// click to expand collapsible
var coll = $(".collapsible");
coll.on("click", function () {
    $(this).toggleClass("active");
    var content = $(this).next();
    if (content.css('maxHeight') != '0px') {
        content.css('maxHeight', '0px')
    } else {
        content.css('maxHeight', 30000 + "px")
    }
})

function handleSortTopByStat(evt) {
    if (evt.target.value) {
        var value = evt.target.value
        toparr = sortTopByStat(value)
        matrixUpdater.reorderMat(docarr, toparr)
    }
}

function handleSortDocByMeta(evt) {
    var sizeSel = document.getElementById('sortByNthTopicSelect')
    sizeSel.selectedIndex = 0
    if (evt.target.value) {
        var value = evt.target.value
        docarr = sortDocByMeta(value)
        matrixUpdater.reorderMat(docarr, toparr)
    }
}

function handleSortDocByNSize(evt) {
    var sizeSel = document.getElementById('sortByDocMeta')
    sizeSel.selectedIndex = 0
    if (evt.target.value) {
        var value = evt.target.value
        docarr = sortDocByNSize(value)
        matrixUpdater.reorderMat(docarr, toparr)
    }
}


// topic selection
function updateTopAdSel(top, add) {
    var dft = '<p id=default>No selected Topic</p>'
    var box = $('#advanced-sel-top')
    if (add) {
        var newtop = `<p id=${top}>${top}</p>`
        box.find('#default').remove()
        box.append(newtop)
    } else {
        box.find('#' + top).remove()
        if (box.children().length == 0) {
            box.append(dft)
        }
    }
}

function clearTopSel() {
    cur_sel_top = null
    $('.toplabels').find('.selected').toggleClass('selected', false)
    var dft = '<p id=default>No selected Topic</p>'
    var box = $('#advanced-sel-top')
    box.children().remove()
    box.append(dft)
}

function sortDocBySelTop() {
    var sel_top = d3.select('.toplabels').selectAll('.selected').data()
    var sel_top_num = sel_top.map(t => parseInt(t.split('-')[1]))
    if (sel_top_num.length == 0) return
    metadata.sort((d1, d2) => {
        var vd1 = getDocVec(d1)
        var vd2 = getDocVec(d2)
        var s1 = 0
        var s2 = 0
        sel_top_num.map(t => {
            s1 += vd1[t]
            s2 += vd2[t]
        })
        return s2 - s1
    })
    docarr = getDocArr(metadata)
    matrixUpdater.reorderMat(docarr, toparr)
}

function moveSelTopLeft() {
    var sel_top = d3.select('.toplabels').selectAll('.selected').data()
    sel_top.map(top => {
        var idx = toparr.findIndex(t => t == top)
        toparr.splice(idx, 1)
    })
    toparr.splice(0, 0, ...sel_top)
    matrixUpdater.reorderMat(docarr, toparr)
}

function sortTopBySelTop() {
    var rev_meta = reverseMetadata(metadata)
    var sel_top = d3.select('.toplabels').selectAll('.selected').data()
    if (sel_top.length == 0) return
    var sel_top_arr = sel_top.map(top => rev_meta.filter(t => top == t.tid)[0])
    var top_avg = arrSum(sel_top_arr.map(top => getTopVec(top)))
    top_avg = top_avg.map(val => val / sel_top.length)
    rev_meta.sort((a, b) => dist(getTopVec(a), top_avg) - dist(getTopVec(b), top_avg))
    toparr = rev_meta.map(top => top.tid)
    matrixUpdater.reorderMat(docarr, toparr)
}

// document selection
function updateDocAdSel(doc, add) {
    var dft = '<p id=default>No selected document</p>'
    var box = $('#advanced-sel-doc')
    if (add) {
        var newdoc = `<p id=${doc.id}>${doc.filename}</p>`
        box.find('#default').remove()
        box.append(newdoc)
    } else {
        box.find('#' + doc.id).remove()
        if (box.children().length == 0) {
            box.append(dft)
        }
    }
}

function clearDocSel() {
    cur_sel_top = null
    $('.doclabels').find('.selected').toggleClass('selected', false)
    var dft = '<p id=default>No selected document</p>'
    var box = $('#advanced-sel-doc')
    box.children().remove()
    box.append(dft)
}

function sortTopBySelDoc() {
    var sel_doc = d3.select('.doclabels').selectAll('.selected').data()
    var sel_doc_num = sel_doc.map(d => d.id)
    if (sel_doc_num.length == 0) return
    if (sel_doc_num.length == 1) {
        toparr = sortByRow(metadata, sel_doc_num[0])
    } else {
        var rev_meta = reverseMetadata(metadata)
        rev_meta.sort((t1, t2) => {
            var vt1 = getTopVec(t1)
            var vt2 = getTopVec(t2)
            var s1 = 0
            var s2 = 0
            sel_doc_num.map(d => {
                s1 += vt1[d]
                s2 += vt2[d]
            })
            return s2 - s1
        })
        toparr = rev_meta.map(top => top.tid)
    }
    matrixUpdater.reorderMat(docarr, toparr)
}

function moveSelDocTop() {
    var sel_doc = d3.select('.doclabels').selectAll('.selected').data()
    sel_doc.map(doc => {
        var idx = docarr.findIndex(d => d.id == doc.id)
        docarr.splice(idx, 1)
    })
    docarr.splice(0, 0, ...sel_doc)
    matrixUpdater.reorderMat(docarr, toparr)
}

function sortDocBySelDoc() {
    // var metadata = reverseMetadata(metadata)
    var sel_doc = d3.select('.doclabels').selectAll('.selected').data()
    if (sel_doc.length == 0) return
    var sel_doc_arr = sel_doc.map(doc => metadata.filter(d => doc.id == d.id)[0])
    var doc_avg = arrSum(sel_doc_arr.map(doc => getDocVec(doc)))
    doc_avg = doc_avg.map(val => val / sel_doc.length)
    metadata.sort((a, b) => dist(getDocVec(a), doc_avg) - dist(getDocVec(b), doc_avg))
    docarr = getDocArr(metadata)
    matrixUpdater.reorderMat(docarr, toparr)
}

function clearSel() {
    clearDocSel()
    clearTopSel()
}

function resetData() {
    metadata = JSON.parse(JSON.stringify(ori_metadata))
    updateState()
    matrixUpdater.update(metadata, docarr, toparr)
}

function createTooltip() {
    tooltip = d3.select('#left_sidebar').append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
    d3.selectAll('.btn-group').selectAll('button')
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
}

var mouseover = function () {
    var btn = d3.select(this)
    var x = d3.event.pageX
    var y = d3.event.pageY
    if (btn.attr('data-tooltip') != null && btn.attr('data-tooltip').length > 0) {
        timeout = setTimeout(() => {
            tooltip
                .html(btn.attr('data-tooltip'))
                .style("left", (x) + "px")
                .style("top", (y + 10) + "px")
            tooltip
                .style("opacity", 1)
            btn
                .style("stroke", "grey")
                .style("opacity", 1)
        }, 700);
    }

}
var mousemove = function (m) {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
}
var mouseleave = function () {
    clearTimeout(timeout);
}

let timeout;