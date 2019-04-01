// You have to manually assign values to global variable,
// following methods won't make changes to global variable

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getScatter(data) {
    var res = []
    data.forEach(doc => {
        var fname = doc.filename;
        doc.topics.forEach(top => {
            res.push({
                doc: fname,
                top: top.tid,
                val: top.val
            })
        });
    });
    return res;
}

function getTopArr(data) {
    var alltops = (data.map(d => d.topics))
    var tids = alltops.flat().map(d => d.tid)
    var l_toparr = d3.set();
    for (let i = 0; i < tids.length; i++)
        l_toparr.add(tids[i])
    return l_toparr.values().sort((a,b) => {
        return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])
    });
}

function getDocArr(data) {
    return data.map(d => {
        return {
            id: d.id,
            filename: d.filename
        }
    })
}

function getMaxTopVal(data) {
    var alltops = (data.map(d => d.topics))
    var maxtval = d3.max(alltops.flat().map(d => d.val))
    return maxtval;
}

function getPaddingArr(data) {
    return ['', ...data, {
        filename: 'Padding Item2'
    }]
}

function diff(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) == -1;
    });
}

/**
 * @param {*} metadata
 * @param {*} docid: document id
 * @returns modified toparr
 */
function sortByRow(metadata, docid) {
    var [doc] = metadata.filter(d => d.id == docid)
    var tops = doc.topics
    // tops.map(d=>d.tid='Topic-' + d.tid)
    var l_toparr = getTopArr(metadata)
    var emptyTops = diff(l_toparr, tops.map(d => d.tid))
    tops.sort((a, b) => b.val - a.val)
    return [...tops.map(d => d.tid), ...emptyTops]
}

function sortByCol(metadata, topid) {
    var l_docarr = metadata.map(doc => {
        var val = 0;
        var t = doc.topics.filter(top => top.tid == topid)
        if (t.length >= 1)
            val = t[0].val
        return {
            id: doc.id,
            filename: doc.filename,
            val: val
        }
    })
    l_docarr.sort((a, b) => b.val - a.val)
    l_docarr.map(doc => delete doc.val)
    return l_docarr
}

function getRowIndexByY(y) {
    var pad_docArr = getPaddingArr(docarr)
    var bar_height = mat_height / (pad_docArr.length - 1)
    var rowidx = Math.floor((y - bar_height) / bar_height)
    return rowidx
}

function getColIndexByX(x) {
    var pad_toparr = getPaddingArr(toparr)
    var bar_width = mat_width / (pad_toparr.length - 1)
    var colidx = Math.floor((x - bar_width) / bar_width)
    return colidx
}

function getDocVec(doc) {
    var tops = doc.topics
    var vec = []
    var len = getTopArr(ori_metadata).length
    for (let i = 0; i < len; i++) vec.push(0)
    tops.forEach(top => {
        var tid = parseInt(top.tid.split('-')[1])
        vec[tid] = top.val
    });
    return vec
}

function getTopVec(top) {
    var docs = top.docs
    var vec = []
    var len = getDocArr(ori_metadata).length
    for (let i = 0; i < len; i++) vec.push(0)
    docs.forEach(doc => {
        var id = parseInt(doc.id)
        vec[id] = doc.val
    });
    return vec
}

function dist(atops, btops) {
    var dist = 0;
    if (atops.length != btops.length) console.error('two vec length not match')
    for (let i = 0; i < btops.length; i++) dist += Math.pow(btops[i] - atops[i], 2)
    return dist
}

function sortByDistRow(this_meta, docid) {
    var [doc] = this_meta.filter(d => d.id == docid)
    var vec_doc = getDocVec(doc)
    this_meta.sort((a, b) => dist(getDocVec(a), vec_doc) - dist(getDocVec(b), vec_doc))
    return getDocArr(this_meta)
}

function reverseMetadata(this_meta) {
    var rev_this_meta = d3.map()
    this_meta.map(doc => {
        doc.topics.map(top => {
            var tid = top.tid
            if (rev_this_meta.has(tid)) {
                rev_this_meta.get(tid).docs.push({
                    id: doc.id,
                    filename: doc.filename,
                    val: top.val
                })
            } else {
                rev_this_meta.set(tid, {
                    tid: tid,
                    docs: [{
                        id: doc.id,
                        filename: doc.filename,
                        val: top.val
                    }]
                })
            }
        })
    })
    rev_this_meta = rev_this_meta.values()
    return rev_this_meta
}

function sortByDistCol(this_meta, tid) {
    var rev_this_meta = reverseMetadata(this_meta)
    var [top] = rev_this_meta.filter(d => d.tid == tid)
    var vec_top = getTopVec(top)
    rev_this_meta.sort((a, b) => dist(getTopVec(a), vec_top) - dist(getTopVec(b), vec_top))
    return rev_this_meta.map(top => top.tid)
}

function getTopStat(this_meta_data) {
    var rev_this_meta = reverseMetadata(this_meta_data)
    var this_top_stat = d3.map()
    rev_this_meta.map(top => {
        var val_arr = top.docs.map(doc => doc.val)
        this_top_stat.set(top.tid, {
            min: math.min(val_arr),
            max: math.max(val_arr),
            median: math.median(val_arr),
            variance: math.var(val_arr),
            mean: math.mean(val_arr),
            range: math.max(val_arr) - math.min(val_arr),
            numDocs: val_arr.length
        })
    })
    return this_top_stat
}

function getDocStat(this_meta_data) {
    var this_doc_stat = d3.map()
    this_meta_data.map(doc => {
        var val_arr = doc.topics.map(top=>top.val)
        while(val_arr.length < 5) val_arr.push(0)
        this_doc_stat.set(doc.id, {
            id: doc.id,
            filename: doc.filename,
            Author: doc.Author,
            Year: doc.Year,
            Genre: doc.Genre,
            Title: doc.Title,
            val_arr: val_arr.sort((a, b)=>b-a)
        })
    })
    return this_doc_stat
}

function sortTopByStat(value) {
    var method = value
    var l_toparr = getTopArr(metadata)
    var fst = `top_stat.get(b).${method}`
    var snd = `top_stat.get(a).${method}`
    l_toparr.sort((a, b) => {
        return eval(fst) - eval(snd)
    })
    return l_toparr
}

function sortDocByMeta(value) {
    var method = value
    var l_docarr = getDocArr(metadata)
    var fst = `doc_stat.get(a.id).${method}`
    var snd = `doc_stat.get(b.id).${method}`
    l_docarr.sort((a, b) => {
        return eval(fst) - eval(snd)
    })
    return l_docarr
}

function sortDocByNSize(value) {
    var method = parseInt(value)
    var l_docarr = getDocArr(metadata)
    l_docarr.sort((a, b) => {
        var bval = doc_stat.get(b.id).val_arr[method]
        var aval = doc_stat.get(a.id).val_arr[method]
        return bval- aval
    })
    return l_docarr
}

// sum multiple arrs to one arr, all same length
function arrSum() {
    var res = []
    while (res.length < arguments[0][0].length) res.push(0)
    arguments[0].map(arr => {
        for (let i = 0; i < res.length; i++) res[i] += arr[i]
    })
    return res
}