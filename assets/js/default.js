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

function handleImgClick (event) {
  var img = document.getElementById('dialogImage');
  img.src = "https://instagram.com/p/" + event.currentTarget.id + "/media/?size=l";

  var area = event.currentTarget.dataset.area;
  var areaElem = document.getElementById('artPieceArea');
  areaElem.textContent = area;
  
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
}

function handleSelectorClick (event) {
  var area = event.currentTarget.className;
  var elem = document.getElementsByClassName("wrapper")[0];

  if (area == "glebe") {
    elem.classList.remove("all");
    elem.classList.remove("allb");
    elem.classList.remove("allc");
    elem.classList.add("alla");
  } 
  else if (area == "centerTown") {
    elem.classList.remove("all");
    elem.classList.remove("alla");
    elem.classList.remove("allc");
    elem.classList.add("allb");
  } 
  else if (area == "byward") {
    elem.classList.remove("all");
    elem.classList.remove("allb");
    elem.classList.remove("alla");
    elem.classList.add("allc");
  }
    else if (area == "allArt") {
    elem.classList.add("all");
  }
}

function registerEvents () {
  var modal = document.getElementById('myModal');

  var spans = document.getElementsByClassName("close");
  var span = spans[0];
  span.onclick = function() {
      modal.style.display = "none";
  }
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }

  // todo:
  // register handle image click here
}

