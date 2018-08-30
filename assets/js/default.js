

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("navbar").setAttribute("class", "menuBar");
  } else {
    document.getElementById("navbar").setAttribute("class", "hiddenMenuBar");
  }
  prevScrollpos = currentScrollPos;
}