var PER = 20;
var REQUEST_FROZEN_TIME = 2000;
var END = false;

var lastTimestamp = null;
var pageSource = 'blog';
var pageTime = (new Date()).getTime();
var requesters = {};

var $home = $("#home");
var $source = $("#source");
var $about = $("#about");

var $topics = $("#topics");
var $refreshButton = $('#refreshButton');
var $homeButton = $("#homeButton");
var $sourceButton = $("#sourceButton");
var $aboutButton = $("#aboutButton");
var $moreButton = $('#moreButton');

var $topLoading = $('#topLoading');
var $bottomLoading = $('#bottomLoading');
var $end = $('#end');
var $topicTemplate = $("#topicTemplate").html(); 

function refreshTopics() {
  if (!requesters.latest) requesters.latest = {};
  var requester = requesters.latest;
  var now = (new Date()).getTime();
  if (requester.timestamp && now - requester.timestamp < REQUEST_FROZEN_TIME) return;
  if (requester.request) requester.request.abort();

  $topLoading.show();
  var url = "/topics/latest?source="+pageSource+"&timestamp="+pageTime;
  requester.timestamp = now;
  requester.request = $.getJSON(url, function (topics) {
    $topLoading.hide();
    for (var i=0,t; t=topics[i]; i++) {
      if (pageTime < t.timestamp) pageTime = t.timestamp;
      $topics.prepend(_.template($topicTemplate, t));
    }
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

$navButtons = $("#footer th");
$navButtons.click(function () {
  $navButtons.removeClass("on");
  $(this).addClass("on");
});
$homeButton.click(function () {
  $about.hide();
  $source.hide();
  $home.show();
});
$sourceButton.click(function () {
  $home.hide();
  $about.hide();
  $source.show();
});
$aboutButton.click(function () {
  console.log('111111111');
  $home.hide();
  $source.hide();
  $about.show();
});

$(function () {
  loadMoreTopics();
});
