
// let p1 = d3.csv("./Data/Metadata/Shakespeare_50/TopicModel/topics_sal/topic_0.csv");

// Mock input data
let corpus = "Shakespear_50";

let numberOfWordsPerTopic;

let wordRankingInTopics;

let selectedWords = [];
let selectedColors = [];

let wordsProportionInTopics;

// dimension constants
let wordLabelY = 30;
let wordLabelWidth = 140;
let wordLabelHeight = 15;

let wordRankingWidth = 720;
let wordRankingHeight = 300;
let wordRankingAxisHeight = 75;
let wordLineHeight = 5;

// varaibles
let numberOfTopics; 
let topicBarData;

let wordLines = [];
let wordRankinBody;

let wordRankBarHeightScale;
let wordRankBarXPositionScale;

let wordRankingContainer = d3.select("#wordRankings");
wordRankingContainer
    .attr("width", `${wordLabelWidth + wordRankingWidth}px`)
    .attr("height", `${wordRankingHeight + wordRankingAxisHeight}px`);

let transitionDuration = 1000;

function initForms() {
    $("#addWordsForm")
        .on("click", function(event) {
            console.log("onSubmit");
            event.preventDefault();
            let words = getWordsFromInput();
            addWords(words, getColorsFromSelector(words.length), true);
        })
}

function getWordsFromInput(){
    return $("#addWordsInput").val().split(' ');
}

function getColorsFromSelector(length) {
    let color = $("#colorSelect").val();
    let colors = new Array(length);
    for (let i = 0; i < length; i++) {
        colors[i] = color;
    }
    console.log("colors", colors);
    return colors;
}

function initWordRankings(selectedWords, selectedColors) {
    updateWordRankings(selectedWords, selectedColors, false);
}

function updateWordRankings(selectedWords, selectedColors, transition) {
    updateWordRankBarHeightScale();
    updateWordRankBarXPositionScale(topicBarData);

    updateTopicBarView(transition);

    updateWordLinesData(selectedWords, selectedColors);
    updateWordLinesView(transition);

    updateWordLabelsView(selectedWords, selectedColors);
}

function updateWordRankBarHeightScale() {
    wordRankBarHeightScale = d3.scaleLinear()
        .domain([0, d3.max(numberOfWordsPerTopic)])
        .range([0, wordRankingHeight])
}

function updateWordRankBarXPositionScale(topicBarData){
    wordRankBarXPositionScale = d3.scaleBand()
    .domain(topicBarData.map(d => d.topicName))
    .range([0, wordRankingWidth])
    .padding(0.1);  
}

function updateTopicBarView(transition=true){
    console.log("updateTopicBarView()");

    wordRankinBody = wordRankingContainer.select("#body");
    console.log("body", wordRankinBody);
    let join = wordRankinBody
            .selectAll("rect")
            .data(topicBarData, d => d.topicName)

    let newelements = join.enter()        
        .append("rect")
        .attr("class", "topicBar")
        .attr("fill", "#bdbdbd");
    console.log("newelements", newelements);

    let merge = join.merge(newelements);
    merge.attr("width", wordRankBarXPositionScale.bandwidth())
        .attr("height", d => wordRankBarHeightScale(d.numOfWords))
        .attr("transform", d => `translate(${wordLabelWidth}, 0)`)
        .on("mouseover", function(d) {
            console.log("highlightTopic: ", d.topicId);
            highlightTopic(d.topicId, true);
        })
        .on("mouseout", function(d){
            highlightTopic(d.topicId, false);
        })
        .on("click", function(d) {
            updateTopicDetail(d.topicId);
        });

    if (transition) {
        merge.transition()
            .duration(transitionDuration)
            .attr("x", d => wordRankBarXPositionScale(d.topicName))
    } else {
        merge.attr("x", d => wordRankBarXPositionScale(d.topicName))
    }

    join.exit().remove()

    let xAxis = d3.axisBottom(wordRankBarXPositionScale)
    d3.select("#xAxis")
        .attr("transform", `translate(${wordLabelWidth}, ${wordRankingHeight})`)
        .transition()
        .duration(transitionDuration)
        .call(xAxis)

    d3.select("#xAxis")   
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(90)")
        .attr("x", 10)
        .attr("dy", "-0.4em")

}

function highlightTopic(topicId, highlight){
    wordRankingContainer.selectAll(".topicBar")
        .filter(function() {
            return d3.select(this).data()[0].topicId == topicId;
        })
        .classed("highlight", highlight);

    // topic label
    wordRankingContainer.selectAll("text")
        .filter(function() {
            return d3.select(this).text() == "Topic " + topicId;
        })
        .classed("highlight", highlight);
    
    // word label
    wordRankingContainer.selectAll(".wordLabel")
        .filter(function(){
            let word = d3.select(this).data();
            if (wordRankingInTopics[word] != null)
                return topicId in wordRankingInTopics[word];
            else false;
        })
        .classed("highlight", highlight);
}

function updateTopicDetail(topicId) {
    let TOPIC_DETAIL_TICK_WIDTH = 130;
    let TOPIC_DETAIL_VIEW_WIDTH = 200;
    let TOPIC_DETAIL_VIEW_HEIGHT = wordRankingHeight + wordRankingAxisHeight - 50;

    let topicData = wordsProportionInTopics[topicId];
    
    let title = d3.select("#topicTitle")
    title.text("Topic " + topicId + ": Top ranking words");
        
    let topicDetailView = d3.select("#topicWords");
    topicDetailView
        .attr("width", TOPIC_DETAIL_TICK_WIDTH + TOPIC_DETAIL_VIEW_WIDTH)
        .attr("height", TOPIC_DETAIL_VIEW_HEIGHT)

    // body
    let topicDetailBody = topicDetailView.select("#body");

    let widthScale = d3.scaleLinear()
        .domain([0, d3.max(topicData.map(d => +d.prop))])
        .range([0, TOPIC_DETAIL_VIEW_WIDTH]);

    let yPositionScale = d3.scaleBand()
        .domain(topicData.map(d => d.word))
        .range([0, wordRankingHeight])
        .padding(0.1);

    let join = topicDetailBody
            .selectAll("rect")
            .data(topicData, d => d.word)
    
    let newelement = join.enter()
        .append("rect")
        .attr("class", "wordBar")
        .attr("fill", "#9ecae1");

    join.merge(newelement)
        .attr("width", d => widthScale(+d.prop))
        .attr("height", yPositionScale.bandwidth())
        .attr("transform", d => `translate(${TOPIC_DETAIL_TICK_WIDTH},${yPositionScale(d.word)})`)

    join.exit().remove();

    // axis
    let yAxis = d3.axisLeft(yPositionScale);
    topicDetailView.select("#yAxis")
        .attr("transform", `translate(${TOPIC_DETAIL_TICK_WIDTH}, 0)`)
        .call(yAxis)
        .selectAll("text")
        .attr("cursor", "pointer")
        .on("click", function(d) {
            let word = d;
            addWords([word], getColorsFromSelector(1), true);
        })
}

function updateWordLinesData(selectedWords, selectedColors) {
    wordLines = []
    console.log("selectedWords", selectedWords);
    let word, color;
    for (let i = 0; i < selectedWords.length; i++){
        word = selectedWords[i];
        color = selectedColors[i];

        if (wordRankingInTopics[word] == null) continue;

        let topics = Object.keys(wordRankingInTopics[word]);
        for (let j = 0; j < topics.length; j++) {
            let topicId = topics[j];
            let rank = wordRankingInTopics[word][topicId];
            wordLines.push(
                {
                    "word": word,
                    "color": color,
                    "topic": topicId,
                    "rank": rank
                }
            )
        }
    }
    return wordLines;
}

function updateWordLinesView(transition=true) {
    console.log("updateWordLinesView()");
    let join = wordRankingContainer.selectAll(".wordLine")
        .data(wordLines)

    let newelements = join.enter()
        .append("rect")
        .attr("class", "wordLine");
    console.log("newelements", newelements);

    let merge = join.merge(newelements)
    merge.attr("width", wordRankBarXPositionScale.bandwidth())
        .attr("height", wordLineHeight)
        .attr("transform", `translate(${wordLabelWidth}, 0)`)
        .attr("y", d => wordRankBarHeightScale(d.rank) - wordLineHeight/2)
        .style("fill", d => d.color)
        .on("mouseover", function(d) {
            highlightWord(d.word, true);
        })
        .on("mouseout", function(d) {
            highlightWord(d.word, false);
        });

    if(transition) {
        merge.transition()
        .duration(transitionDuration)
        .attr("x", d => wordRankBarXPositionScale("Topic " + d.topic))
    } else {
        merge.attr("x", d => wordRankBarXPositionScale("Topic " + d.topic))
    }

    join.exit().remove()
}

function updateWordLabelsView(selectedWords, selectedColors) {
    updateWordLabelsText(selectedWords, selectedColors);
    updateWordLabelsDeleter(selectedWords);
}

function updateWordLabelsText(selectedWords, selectedColors) {
    console.log("updateWordLabelsText()");
    let join = wordRankingContainer.selectAll(".wordLabel")
        .data(selectedWords);

    let newelements = join.enter()
        .append("text")
        .attr("class", "wordLabel")
        .text(d => d);
    console.log("newelements", newelements);

    join.merge(newelements)
        .attr("text-anchor", "end")
        .style("fill", (d, i) => selectedColors[i])
        .attr("x", wordLabelWidth - 25)
        .attr("y", (d, i) => wordLabelY + wordLabelHeight * i)
        .attr("cursor", "pointer")
        .on("mouseover", function(word) {
            console.log("mouseover", word);
            highlightWord(word, true);
        })
        .on("mouseout", function(word) {
            highlightWord(word, false);
        })
        .on("click", function(word) {
            sortTopicBarsBy([word]);
            updateWordRankings(selectedWords, selectedColors);
        })

    join.exit().remove();
}

function highlightWord(word, highlight){
    d3.selectAll(".wordLine")
        .filter(function () {
            return d3.select(this).data()[0].word == word;
        })
        .classed("highlight", highlight);
    d3.selectAll(".wordLabel")
        .filter(function() {
            return d3.select(this).data() == word;
        })
        .classed("highlight", highlight);
}

function updateWordLabelsDeleter(selectedWords) {
    let join = wordRankingContainer.selectAll(".wordDeleter")
        .data(selectedWords);
    
    let newelements = join.enter()
        .append("text")
        .attr("class", "wordDeleter")
        .text("x");
    
    join.merge(newelements)
        .attr("text-anchor", "end")
        .attr("cursor", "pointer")
        .style("fill", 'gray')
        .attr("x", wordLabelWidth-10)
        .attr("y", (d, i) => wordLabelY + wordLabelHeight * i)
        .on("click", function (d){
            removeWord(d);
        });

    join.exit().remove();
}

function addWords(words, colors, sortByThem) {
    selectedWords = selectedWords.concat(words);
    selectedColors = selectedColors.concat(colors);

    updateWordLinesData(selectedWords, selectedColors);
    updateWordLinesView(false);

    updateWordLabelsView(selectedWords, selectedColors);

    if (sortByThem){
        sortTopicBarsBy(words);
        updateWordRankings(selectedWords, selectedColors);
    }
}

function removeWord(word) {
    let wordIndex = selectedWords.indexOf(word);

    if (wordIndex == -1) return;

    selectedWords.splice(wordIndex, 1);
    console.log("selectedWords", selectedWords);
    selectedColors.splice(wordIndex, 1);
    console.log("selectedColors", selectedColors);

    updateWordLinesData(selectedWords, selectedColors);
    updateWordLinesView(false);

    updateWordLabelsView(selectedWords, selectedColors);
}


function sortTopicBarsBy(selectedWords) {
    if (selectedWords.length == 0) return;
    // Compute topic ranking
    let topicRanking = new Array(numberOfTopics);

    for (let topicId = 0; topicId < numberOfTopics; topicId++){
        let NumOfSelectedWords = 0;
        let rankSum = 0;
        for (let i = 0; i < selectedWords.length; i++) {
            word = selectedWords[i];
            if (wordRankingInTopics[word] == null) continue;      
            let wordRanking = wordRankingInTopics[word][topicId];
            if (wordRanking == -1) continue;
            rankSum += wordRanking;
            NumOfSelectedWords += 1;
            
        }
        topicRanking[topicId] = {}
        topicRanking[topicId]["numOfSelectedWords"] = NumOfSelectedWords;
        topicRanking[topicId]["rankSum"] = rankSum > 0 ? rankSum : -1;
    }

    console.log("topicRanking", topicRanking);

    // sort topic bar data
    let newTopicBarData = topicBarData.slice();

    newTopicBarData.sort(function(a, b){
        let numOfSelectedWordsA = topicRanking[a.topicId].numOfSelectedWords;
        let numOfSelectedWordsB = topicRanking[b.topicId].numOfSelectedWords;

        if (numOfSelectedWordsA == numOfSelectedWordsB) {
            let rankSumA = topicRanking[a.topicId].rankSum;
            let rankSumB = topicRanking[b.topicId].rankSum;

            if (rankSumA == -1 && rankSumB != -1) {
                return 1;
            } else if (rankSumA != -1 && rankSumB == -1) {
                return -1;
            } else {
                return rankSumA - rankSumB;
            }
        } else {
            return numOfSelectedWordsB - numOfSelectedWordsA;
        }
    });

    topicBarData = newTopicBarData;
    console.log("sorted topicBarData", topicBarData);
}

// function getUrlParams() {
//     let params = {};
//     window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
//         console.log("key", key);
//         params[key] = value;
//     });
//     return params;
// }

function getUrlParams(){
    console.log("getUrlParams");
    let params = {}
    window.location.search.slice(1).split("&").map(function(d) {
        var nv = d.split("=");
        var name = nv[0], value = nv[1];
        params[name] = value;
    })

    return params;
}

function showPage(data){
    initTopicData(data);
    initForms();
    initWordRankings(selectedWords, selectedColors);
    sortTopicBarsBy(selectedWords);
    updateWordRankings(selectedWords, selectedColors);
}

function initTopicData(data){
    numberOfWordsPerTopic = data["wordsPerTopic"];
    numberOfTopics = numberOfWordsPerTopic.length; 
    topicBarData = new Array(numberOfTopics);
    for (let i = 0; i < numberOfTopics; i++) {
        topicBarData[i] = { "topicName": `Topic ${i}`, "topicId": +i, "numOfWords":+numberOfWordsPerTopic[i]};
    }

    wordRankingInTopics = data["wordRankingInTopics"];

    wordsProportionInTopics = data["wordsPropPerTopic"];
}

function initVarFromParams() {
    let params = getUrlParams();

    corpus = params["corpus"];

    selectedWords = [params["word"]];
    selectedColors = getColorsFromSelector(selectedWords.length);
}

initVarFromParams();
d3.json(`Data/Metadata/${corpus}/TopicModel/topics_sal/topic_model.json`).then(showPage);