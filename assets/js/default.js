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
  var area = event.currentTarget.dataset;
  var query;
  if (area.filter === "all") {
    query = getAllQuery();
  } else {
    query = getFilterQuery(area.filter);
  }
  
  createImages(execQuery(query));
}

function getFilterQuery(filter) {
 return { 
    "structuredQuery": { 
      "where": { 
        "fieldFilter": { 
          "field": { "fieldPath": "area" }, 
          "op": "EQUAL", 
          "value": { 
            "stringValue": filter } 
          } 
        }, 
        "from": [ { "collectionId": "artCollection" } ] 
      } 
    };
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
}

var artData;
var queriedData;
var area =[];
var imageTakenDate =[];

function displayImages (pageId) {
 
  var promise;

  if(pageId === "art") {
    promise = queryAll();
  } else {
    promise = queryLatestSix();
  }
  createImages(promise);
}

function createImages(promise) {
  promise.then(function(artData) {
    var imgCollectionDiv = document.getElementById('imgCollection');
    while (imgCollectionDiv.firstChild) {
      imgCollectionDiv.removeChild(imgCollectionDiv.firstChild);
    }
    artData.forEach(element => {
      if(element.document.fields && element.document.fields.id) {
        var imgId = element.document.fields.id.stringValue;
        var liElem = document.createElement("li");
        liElem.setAttribute("class", "landscape imageContainer");
        liElem.onclick = function(event){ handleImgClick(event)};
        liElem.id=imgId;
        var artImage = document.createElement("img");
        artImage.src = "https://www.instagram.com/p/" + imgId + "/media/?size=m";
        liElem.appendChild(artImage);
        imgCollectionDiv.appendChild(liElem);
      } else {
        console.error("Could not parse object:");
        console.log(element);
      }
    });
  })
  .catch(function(error) {
    console.log(error);
  });
}

function queryLatestSix () {
  var query =  { 
    "structuredQuery": { 
      "orderBy": [{
            "field": {
                "fieldPath": "imageTakenDate"
            },
            "direction":"ASCENDING"
            
        }],
        "from": [ { "collectionId": "artCollection" } ],
        "limit":6
      } 
    };
  return execQuery(query);
}

function queryAll () {
  return execQuery(getAllQuery());
}

function getAllQuery() {
  return { 
    "structuredQuery": { 
      "orderBy": [{
            "field": {
                "fieldPath": "imageTakenDate"
            },
            "direction":"ASCENDING"
            
        }],
        "from": [ { "collectionId": "artCollection" } ]
      } 
    };
}

function execQuery(query) {
  return axios({
    method:'post', 
    url:'https://firestore.googleapis.com/v1beta1/projects/street-art-ottawa/databases/(default)/documents:runQuery', 
    data: query,
    headers:{'Content-Type': 'application/json'}})
  .then(function (response) {
    return response.data;
  });
}



function queryX() {
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



