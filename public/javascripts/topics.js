var PER = 20;
var REQUEST_FROZEN_TIME = 2000;
var END = false;

var lastTimestamp = null;
var source = 'weibo';
var pageTime = (new Date()).getTime();
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
    var $template = $("#"+window.source+"TopicTemplate").html();
    for (var i=0,t; t=res.topics[i]; i++) {
      if (pageTime < t.timestamp) pageTime = t.timestamp;
      $topics.prepend(_.template($template, t));
    }
    window.scrollTo(0, 0);
  });
}

function loadMoreTopics() {
  $moreButton.hide();
  if (END) {
    $end.show();
    return;
  }
  if (!requesters.more) requesters.more = {};
  var requester = requesters.more;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $bottomLoading.show();
  var url = "/resources/"+window.source+"/topics/more?per="+PER+(lastTimestamp ? '&timestamp='+lastTimestamp : '');
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (res) {
    $bottomLoading.hide();
    if (res.error) {
      handleError(res.error);
      return;
    }
    if (res.topics.length == 0) {
      END = true;
      $moreButton.hide();
      $end.show();
      return;
    } else {
      $moreButton.show();
      $end.hide();
    }
    var $template = $("#"+window.source+"TopicTemplate").html();
    for (var i=0,t; t=res.topics[i]; i++) {
      if (lastTimestamp > t.timestamp) lastTimestamp = t.timestamp;
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


var $sourceButtons = $("#source a").click(function () {
  var source = this.id.replace(/source/i, '');
  window.source = source;
  $topics.html('');
  loadMoreTopics();
  $(this).addClass("on");
  $navButtons.eq(0).click();
});
