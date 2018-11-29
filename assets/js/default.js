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

var artData;
var queriedData;
var picId =[];
var area =[];
var imageTakenDate =[];

function getData () {
  axios.get('https://firestore.googleapis.com/v1beta1/projects/street-art-ottawa/databases/(default)/documents/artCollection')
  .then(function(response){
    console.log(response.data); 
    console.log(response.status); 
    artData = response.data;
  }); 
  return artData;
}

function showData (artData) {
  var imgCollectionDiv = document.getElementById('imgCollection');
  for(var i in artData){
    var element = artData[i]
    for(key in element){
      var picData = element[key];
      for(subKey in picData){
        if(subKey == "fields"){
          var finaldata = picData[subKey];
          picId = finaldata.id;
          var res = picId.stringValue;
          var artImage = document.createElement("img");
          artImage.src = "https://instagram.com/p/" + res + "/media/?size=l";
          imgCollectionDiv.appendChild(artImage);
          console.log(res);
        }
      }
    }
  }
}


function query () {
  axios.post('https://firestore.googleapis.com/v1beta1/projects/street-art-ottawa/databases/(default)/documents:runQuery', 
  { 
    "structuredQuery": { 
      "where": { 
        "fieldFilter": { 
          "field": { "fieldPath": "area" }, 
          "op": "EQUAL", 
          "value": { 
            "stringValue": "Downtown" } 
          } 
        }, 
        "from": [ { "collectionId": "artCollection" } ] 
      } 
    })
  .then(function (response) {
    console.log(response.data);
    queriedData = response.data;
  })
  .catch(function (error) {
    console.log(error);
  });
}

function populateHomePage (queriedData) {
  var imgCollectionDiv = document.getElementById('imgCollection');
  for(var i in queriedData){
    var element = queriedData[i]
    for(key in element){
      var picData = element[key];
      for(subKey in picData){
        if(subKey == "fields"){
          var finaldata = picData[subKey];
          picId = finaldata.id;
          var res = picId.stringValue;
          var artImage = document.createElement("img");
          artImage.src = "https://instagram.com/p/" + res + "/media/?size=l";
          imgCollectionDiv.appendChild(artImage);
          console.log(res);
        }
      }
    }
  }
}



