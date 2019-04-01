function drawCorpusView() {
    d3.csv(data_path + 'metadata.csv').then(readData => {
        var updater;
        metadata = readData.filter(d => d.id != 'int' && d.id != '')
        metadata.map(d => {
            d.id = parseInt(d.id);
            d.Year = parseInt(d.Year)
            d.filename = d.filename.split('.txt')[0].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
            return d;
        })
        $.get(data_path + 'theta.csv', function (data) {
            var lines = data.split('\n').filter(d => d != '' && d.length >= 4)
                            .map(l => l.replace(/['"]+/g, ''))
            
            for (let i = 0; i < metadata.length; i++) {
                metadata[i].topics = [];
                var linesp = lines[i].split(',')
                for (let j = 0; j < linesp.length; j += 2) {
                    var l_id = parseInt(linesp[j]);
                    var l_val = parseFloat(linesp[j + 1])
                    metadata[i].topics.push({
                        tid: 'Topic-' + l_id,
                        val: l_val
                    })
                }
            }
        }, 'text').done(() => {
            ori_metadata = JSON.parse(JSON.stringify(metadata))
            updateState()
            matrixUpdater = drawMatrix(metadata, docarr, toparr)
        })
    })
}

function updateCorpusView() {
    d3.csv(data_path + 'metadata.csv').then(readData => {
        var updater;
        metadata = readData.filter(d => d.id != 'int' && d.id != '')
        metadata.map(d => {
            d.id = parseInt(d.id);
            d.Year = parseInt(d.Year)
            d.filename = d.filename.split('.txt')[0].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
            return d;
        })
        $.get(data_path + 'theta.csv', function (data) {
            var lines = data.split('\n').filter(d => d != '' && d.length >= 4)
                            .map(l => l.replace(/['"]+/g, ''))
            
            for (let i = 0; i < metadata.length; i++) {
                metadata[i].topics = [];
                var linesp = lines[i].split(',')
                for (let j = 0; j < linesp.length; j += 2) {
                    var l_id = parseInt(linesp[j]);
                    var l_val = parseFloat(linesp[j + 1])
                    metadata[i].topics.push({
                        tid: 'Topic-' + l_id,
                        val: l_val
                    })
                }
            }
        }, 'text').done(() => {
            clearTopSel()
            clearDocSel()
            ori_metadata = JSON.parse(JSON.stringify(metadata))
            updateState()
            d3.select('#matrix-content').select('svg').remove()
            matrixUpdater = drawMatrix(metadata, docarr, toparr)
        })
    })
}

drawCorpusView()
createTooltip()

function updateState() {
    toparr = getTopArr(metadata)
    docarr = getDocArr(metadata)
    doc_stat = getDocStat(metadata)
    top_stat = getTopStat(metadata)
}

function reload(){
    console.log("reload");
    location.reload();
}

function changeDatabase(newDatabase) {
    $('#corpus_header .dropbtn').text(newDatabase)
    database = newDatabase
    data_path = `Data/Metadata/${database}/TopicModel/`
    console.log(newDatabase)
    console.log(metadata)
    updateCorpusView()
    createTooltip()
}