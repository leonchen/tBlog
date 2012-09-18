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
