var PER = 20;
var REQUEST_FROZEN_TIME = 2000;
var resourcesEnding = {};

var requesters = {};

var $topics = $("#topics");
var $refreshButton = $('#refreshButton');
var $refreshLoading = $('#refreshLoading');
var $moreButton = $('#moreButton');

var $topLoading = $('#topLoading');
var $bottomLoading = $('#bottomLoading');
var $end = $('#end');
var $topicTemplate = $("#topicTemplate").html(); 

var $bodyElements = $('#body>div');
var $navButtons = $("#footer th");

function resetPage() {
  window.lastTimestamp = 0;
  window.pageTime = 0;
}

resetPage();

function showDate(timestamp) {
  var localTime = new Date();
  var date = new Date(timestamp - localTime.getTimezoneOffset()*60000);
  return date.toJSON().replace(/[^\d-:]+/g, ' ').replace(/\s\d+\s*$/,'');
}

function handleError(err) {
  if (err.code == 302) {
    window.location.href = err.message;
  } else if (err.code == 500) {
    alert(err.message);
  }
}

function refreshTopics() {
  if (!requesters.latest) requesters.latest = {};
  var requester = requesters.latest;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $topLoading.show();
  $refreshButton.hide();
  $refreshLoading.show();
  var url = "/resources/"+window.source+"/topics/latest?timestamp="+pageTime;
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (res) {
    $refreshLoading.hide();
    $refreshButton.show();
    $topLoading.hide();
    if (res.error) {
      handleError(res.error);
      return;
    }
    if (res.topics.length == 0) return;
    var $template = $("#"+window.source+"TopicTemplate").html();
    for (var i=0,t; t=res.topics[i]; i++) {
      if (pageTime == 0 || pageTime < t.id) pageTime = t.id;
      $topics.prepend(_.template($template, t));
    }
    window.scrollTo(0, 0);
  });
}

function loadMoreTopics() {
  $moreButton.hide();
  if (resourcesEnding[window.source]) {
    $end.show();
    return;
  }
  if (!requesters.more) requesters.more = {};
  var requester = requesters.more;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $bottomLoading.show();
  var url = "/resources/"+window.source+"/topics/more?per="+PER+'&timestamp='+lastTimestamp;
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (res) {
    $bottomLoading.hide();
    if (res.error) {
      handleError(res.error);
      return;
    }
    if (res.topics.length == 0) {
      resourcesEnding[window.source] = true;
      $moreButton.hide();
      $end.show();
      return;
    } else {
      resourcesEnding[window.source] = false;
      $moreButton.show();
      $end.hide();
    }
    var $template = $("#"+window.source+"TopicTemplate").html();
    for (var i=0,t; t=res.topics[i]; i++) {
      if (pageTime == 0 || pageTime < t.id) pageTime = t.id;
      if (lastTimestamp == 0 || lastTimestamp > t.id) lastTimestamp = t.id;
      $topics.append(_.template($template, {t:t}));
    }
  });
}

$refreshButton.click(function () {
  refreshTopics();
});

$moreButton.click(function () {
  loadMoreTopics();
});

$navButtons.click(function () {
  var $this = $(this);
  var index = $this.prevAll("th").length;
  if (index > 0 && $this.is(".on")) {
    $navButtons.eq(0).click();
    return;
  }
  $navButtons.removeClass("on");
  $this.addClass("on");
  $bodyElements.hide();
  $bodyElements.eq(index).show();
});

$(function () {
  loadMoreTopics();
});


var $sourceButtons = $("#source li").click(function () {
  var source = this.id.replace(/source/i, '');
  window.location.href = window.location.protocol + "//" + window.location.host + "/?source=" + source;
});
