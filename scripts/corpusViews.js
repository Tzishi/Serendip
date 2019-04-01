function openTextViewer(){
    if (cur_sel_doc == undefined) return;
    window.open(`text_viewer.html?corpus=${database}&doc=${doc_stat.get(cur_sel_doc).filename}`);
}

function updateDocView(but = null) {
    var links = $("#right_sidebar_bottom").find('.tablinks')
    if (cur_sel_doc != null) {
        $("#right_sidebar_bottom").find('#selectedDocId').text(' ' + cur_sel_doc)
    }
    if (but == 'meta') {
        links.eq(0).toggleClass('active', true)
        links.eq(1).toggleClass('active', false)
        $('#right_sidebar_doc-content').load('./html/doc-view-meta.html');
    } else if (but == 'graph') {
        links.eq(1).toggleClass('active', true)
        links.eq(0).toggleClass('active', false)
        $('#right_sidebar_doc-content').load('./html/doc-view-graph.html');
    } else {
        $("#right_sidebar_bottom").find('.active').trigger("click");
    }
}

function updateTopView(but = null) {
    var links = $("#right_sidebar_top").find('.tablinks')
    if (cur_sel_top) {
        var id = cur_sel_top.split('-')[1]
        $("#right_sidebar_top").find('#selectedTopId').text(' ' + id)
    }
    if (but == 'meta') {
        links.eq(0).toggleClass('active', true)
        links.eq(1).toggleClass('active', false)
        $('#right_sidebar_top-content').load('./html/top-view-meta.html');
    } else if (but == 'dist') {
        links.eq(1).toggleClass('active', true)
        links.eq(0).toggleClass('active', false)
        if (cur_sel_top == undefined)
            $('#right_sidebar_top-content').load('./html/top-view-dist.html');
        else
            d3.json(`Data/Metadata/${database}/TopicModel/topics_sal/topic_model.json`)
            .then(showTopicDistribution);
    } else {
        $("#right_sidebar_top").find('.active').trigger("click");
    }
}

function showTopicDistribution(data) {
    let wordsProportionInTopics = data["wordsPropPerTopic"];
    console.log("wordsProportionInTopics", wordsProportionInTopics);
    let topicId = cur_sel_top.split("-")[1];
    let topicData = wordsProportionInTopics[topicId];
    console.log("topicId", topicId);
    console.log("topicData", topicData);

    let TOPIC_DIST_TICK_WIDTH = 130;
    let TOPIC_DIST_BAR_WIDTH = 100;
    let TOPIC_DIST_HEIGHT = 360;

    $("#right_sidebar_top-content").html(""); // clear content

    $("#right_sidebar_top-content").append(`<p class=thick>${cur_sel_top}<p>`);

    let svg = d3.select("#right_sidebar_top-content")
        .append("svg")
        .attr("width", TOPIC_DIST_TICK_WIDTH + TOPIC_DIST_BAR_WIDTH)
        .attr("height", TOPIC_DIST_HEIGHT)

    let body = svg.append("g")
        .attr("id", "body");


    svg.append("g")
        .attr("id", "yAxis");

    let widthScale = d3.scaleLinear()
        .domain([0, d3.max(topicData.map(d => +d.prop))])
        .range([0, TOPIC_DIST_BAR_WIDTH]);

    let yPositionScale = d3.scaleBand()
        .domain(topicData.map(d => d.word))
        .range([0, TOPIC_DIST_HEIGHT])
        .padding(0.1);

    let join = body
        .selectAll("rect")
        .data(topicData, d => d.word)

    let newelement = join.enter()
        .append("rect")
        .attr("class", "wordBar")
        .attr("fill", "#9ecae1");

    join.merge(newelement)
        .attr("width", d => widthScale(+d.prop))
        .attr("height", yPositionScale.bandwidth())
        .attr("transform", d => `translate(${TOPIC_DIST_TICK_WIDTH},${yPositionScale(d.word)})`)

    join.exit().remove();

    // axis
    let yAxis = d3.axisLeft(yPositionScale);
    d3.select("#yAxis")
        .attr("transform", `translate(${TOPIC_DIST_TICK_WIDTH}, 0)`)
        .call(yAxis)
        .selectAll("text")
        .on("mouseover", function(){
            d3.select(this).style("cursor", "pointer"); 
        })
        .on("mouseout", function() {
            d3.select(this).style("cursor", "default"); 
        })
        .on("click", function(d) {
            let word = d3.select(this).text();
            window.open(`rank_viewer.html?corpus=${database}&word=${word.toLowerCase()}`);
        })
}    