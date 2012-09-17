var PER = 20;
var REQUEST_FROZEN_TIME = 2000;
var END = false;

var lastTimestamp = null;
var pageSource = 'blog';
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

function refreshTopics() {
  if (!requesters.latest) requesters.latest = {};
  var requester = requesters.latest;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $topLoading.show();
  $refreshButton.hide();
  $refreshLoading.show();
  var url = "/topics/latest?source="+pageSource+"&timestamp="+pageTime;
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (topics) {
    $refreshLoading.hide();
    $refreshButton.show();
    $topLoading.hide();
    for (var i=0,t; t=topics[i]; i++) {
      if (pageTime < t.timestamp) pageTime = t.timestamp;
      $topics.prepend(_.template($topicTemplate, t));
    }
    window.scrollTo(0, 0);
  });
}

function loadMoreTopics() {
  if (END) {
    $moreButton.hide();
    $end.show();
    return;
  }
  if (!requesters.more) requesters.more = {};
  var requester = requesters.more;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $bottomLoading.show();
  var url = "/topics/more?source="+pageSource+"&per="+PER+(lastTimestamp ? '&timestamp='+lastTimestamp : '');
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (topics) {
    $bottomLoading.hide();
    if (topics.length == 0) {
      END = true;
      $moreButton.hide();
      $end.show();
      return;
    } else {
      $moreButton.show();
      $end.hide();
    }
    for (var i=0,t; t=topics[i]; i++) {
      if (lastTimestamp > t.timestamp) lastTimestamp = t.timestamp;
      $topics.append(_.template($topicTemplate, t));
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
  $navButtons.removeClass("on");
  $this.addClass("on");
  $bodyElements.hide();
  $bodyElements.eq($this.prevAll("th").length).show();
});

$(function () {
  loadMoreTopics();
});
