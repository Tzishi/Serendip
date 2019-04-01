
function sortTag(tags) {
  let topics = []
  for (let item in tags) {
    topics.push(tags[item]);
  }

  topics.sort(function (a, b) { return b.num_tags - a.num_tags })
  return topics;
}

function creaetButton(topic) {
  let btn = document.createElement("BUTTON");
  btn.className = "btn-tag";
  btn.setAttribute("data-key", topic.name);

  let span = document.createElement('span');
  span.className = "btn-label";

  span.innerHTML = formatTopicName(topic.name);
  btn.appendChild(span);

  btn.onclick = function () {
    toggleTopicActive(topic.name);
  };

  return btn;
}

function formatTopicName(topic_name) {
  let splitted_topic_name = topic_name.split("_");
  return capitalizeFirstLetter(splitted_topic_name[0]) + " " + splitted_topic_name[1];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function toggleTopicActive(topic){
  let button = $('.btn-tag[data-key=' + topic +']')
  button.toggleClass("active");

  let lineGroup = $(".topic_model_line_graph g." + topic);
  lineGroup.toggleClass("active");

  let line = lineGroup.children("use.polyline");
  line.toggleClass("active");

  // color related logics
  let color;
  if ($(button).hasClass("active")){

    activeTopics.push(topic);
  
    color = getNextUnusedColor(colors, usedColors);
    
    topicColors[topic] = color;
    usedColors.add(color);
  } else {
    // Remove topic from active topic
    activeTopics.splice(activeTopics.indexOf(topic), 1);
    
    color = topicColors[topic];
    
    // Remove topic color
    delete topicColors[topic]

    // Remove color from used color
    usedColors.delete(color)  
  }

  $(button).toggleClass('noramp_' + color);
  $("#main_content_text ." + topic).toggleClass(rankingType + color);
  line.toggleClass('noramp_' + color);

}

function showTextOfActiveTopics(topic){
  let color = topicColors[topic];
  $("#main_content_text ." + topic).addClass(rankingType + color);
}

function getNextUnusedColor(colors, usedColors){
  for (index in colors) {
    if (!usedColors.has(colors[index])){
      return colors[index];
    }
  }
  return colors[colors.length -1];
}

function initNavBar() {
  $("#nav_corpus")
    .text(corpus)
    .click(function() {
      window.open("index.html","_self");
    });
  $("#nav_document")
    .text(filename)
    .click(function() {
      location.reload();
    });
}

function initSidebar(sortedTopics) {
  let sidebar_content = document.getElementById("sidebar_content");

  sortedTopics.forEach(function (topic) {
    let btn = creaetButton(topic)
    sidebar_content.appendChild(btn);
  })

  d3.select("#sidebar_content")
    .selectAll(".btn-tag")
    .on("mouseover", function() {
      d3.select(this).classed("highlight", true);
      let topic = d3.select(this).attr("data-key");
      toggleLineGraphHighlight(topic);
    })
    .on("mouseout", function() {
      d3.select(this).classed("highlight", false);
      let topic = d3.select(this).attr("data-key");
      toggleLineGraphHighlight(topic);
    })

  console.log("sortedColors", sortedTopics);
}

function toggleLineGraphHighlight(topic){
  $(".topic_model_line_graph g." +topic).toggleClass("highlight");
}

function initMain() {
  refreshMain(0);
}

function refreshMain(page) {
  let htmlFile = `./Data/Metadata/${corpus}/TopicModel/HTML/${filename}/page${page}.html`
  $(function(){    
    console.log("refreshMain");
    $("#main_content_text").load(htmlFile, function () {
      // show text with active topics 
      console.log("html loaded");

      for (let i = 0; i < activeTopics.length; i++) {
        showTextOfActiveTopics(activeTopics[i]);
      }

      $("#main_content_text span")
      .on("click", function(){
        let word = $(this).text();
        if (word.trim().length != 0)
          window.open(`rank_viewer.html?corpus=${corpus}&word=${word.toLowerCase()}`);
      });
    });

    // set previous button
    $("a.prev").on("click", function () {
      if (page === 0) return;
      page -= 1;
      refreshMain(page);
    })

    // set next button
    $("a.next").on("click", function () {
      console.log("clicked");
      page += 1;
      refreshMain(page);
    })
  });
}

function initTopicOverview() {
  $("#right_sidebar_content").load(`./Data/Metadata/${corpus}/TopicModel/HTML/${filename}/${rankingType}.svg`);

  $(function () {
    // set svg width, height
    d3.select("svg")
      .style("width", "100%")
      .style("height", "100%");

    // set line graph interaction
    d3.select(".topic_model_line_graph")
      .selectAll("g")
      .on("mouseover", function () {
        d3.select(this).classed("highlight", true);

        // toggle left side bar
        let topic = d3.select(this).attr("data-key");
        toggleButtonHighlight(topic);
      })
      .on("mouseout", function () {
        d3.select(this).classed("highlight", false);

        // toggle left side bar
        let topic = d3.select(this).attr("data-key");
        toggleButtonHighlight(topic);
      })
      .on("click", function () {
        let topic = d3.select(this).attr("data-key");
        toggleTopicActive(topic);
      })

    // set page locator interaction
    let timeout;
    $("a.page_locator")
      .click(function () {
        page = $(this).data("page-index");
        refreshMain(page);
      });
    $(".page_locator rect")
      .mouseover(function (handler) {
        $(this).addClass("hover");
        let pageIndex = $(this).parent().data("page-index");
        timeout = setTimeout(() => {
          tooltip
            .style("visibility", "visible")
            .style("top", (handler.pageY + 10) + "px")
            .style("left", (handler.pageX + 10) + "px")
            .html(`Click to jump to page ${pageIndex}`);
        }, 800);
      })
      .mouseout(function () {
        $(this).removeClass("hover");
        tooltip.style("visibility", "hidden");
        clearTimeout(timeout);
      })
  });
}

function toggleButtonHighlight(topic) {
  $('.btn-tag[data-key=' + topic +']').toggleClass("highlight");
}


function showPage(topics) {
  console.log("topics", topics);

  initNavBar();

  let sortedTopics = sortTag(topics);
  initSidebar(sortedTopics);

  initMain();

  initTopicOverview();
}

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

function initTooltip(){
   tooltip = d3.select("body")
    .append("div")
    .attr("id", "myTooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");
}


let corpus = "Shakespeare_50";
let filename = "2KINGHENRYIV";
let page = 0;

let rankingType = 'sal';
let topics;
let sortedTopics;
let colors = ['6baed6', '74c476', 'fd8d3c', '9e9ac8', 'fb6a4a']
let usedColors = new Set();
let activeTopics = []
let topicColors = {}

let params = getUrlParams();
corpus = params["corpus"];
filename = params["doc"];

let tooltip;

initTooltip();

$.when($.getJSON(`./Data/Metadata/${corpus}/TopicModel/HTML/${filename}/rules.json`))
  .done(function (topics) {
    showPage(topics)
  });
