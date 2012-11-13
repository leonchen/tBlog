var pxToEm = 9;
var resizeImg = function (img, max) {
  var image = new Image();
  image.src = img.src;
  if (image.width > 0 && image.height > 0) {
    var rate = (max / image.width < max / image.height) ? (max / image.width) : (max / image.height);
    img.style.width = Math.floor((rate <= 1 ? image.width * rate : image.width) /  pxToEm) + "em";
    img.style.height = Math.floor((rate <= 1 ? image.height * rate : image.height) /  pxToEm) + "em";
  } 
};

var showLinks = function (txt) {
  return txt.replace(/(http:\/\/[\w.\/]+)/g, '<a href="$1" target="_blank">$1</a>'); 
};


var $containers = $('body>div.container');
var $topic = $("#topicContainer");
var $image = $("#imageContainer>img");
var $video = $("#videoContainer>video");
var $audio = $("#audioContainer>audio");
var topicScrollTop = 0;
$('#imageContainer,#videoContainer,#audioContainer').click(function () {
  window.showTopic();
});

var showTopic = function () {
  showContainer('topic');
  $(window).scrollTop(topicScrollTop);
}
var showImage = function (img) {
  showMedia('image', img);
}
var showVideo = function (video) {
  showMedia('video', video);
}
var showAudio = function (audio) {
  showMedia('audio', audio);
}
var showContainer = function (media) {
  window.$containers.hide();
  $("#"+media+"Container").show();
}
var showMedia = function (mediaType, media) {
  topicScrollTop = $(window).scrollTop();
  window["$"+mediaType].attr("src", '');
  showContainer(mediaType);
  window["$"+mediaType].attr("src", media);
};
