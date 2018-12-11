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

class Art extends React.Component {
  render() {
      return React.createElement('li', {id: this.props.id, className: "landscape imageContainer", onClick: function(event){ handleImgClick(event)}},
        React.createElement('img', {src: "https://www.instagram.com/p/" + this.props.id + "/media/?size=m"})
      );
  }
}

class ArtList extends React.Component {
  render() {
      return (
        React.createElement(React.Fragment, null, 
          this.props.artData.map(element => {
            if(element.document && element.document.fields && element.document.fields.id) {
              return React.createElement(Art, { key: element.document.fields.id.stringValue, id : element.document.fields.id.stringValue });
            } else {
              return null;
            }
          })
        )
      );
  }
}


function createImages(promise) {
  promise.then(function(artData) {
    var imgCollectionDiv = document.getElementById('imgCollection');
    ReactDOM.render(
      React.createElement(ArtList,  { artData : artData }),
      document.getElementById('imgCollection')
    );
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

function initMap() {
  var myLatLng = {lat: 45.337723, lng: -75.785092};
  var otherLatLng = {lat: 45.335814, lng: -75.785043};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: otherLatLng,
    gestureHandling: 'cooperative'
  });

//   var marker = new google.maps.Marker({
//     position: otherLatLng,
//     map: map,
//     title: 'Hello World!',
//     icon : {
//       path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
//       scale: 5,
//       fillColor: 'red',
//    		fillOpacity: 0.8,
//       strokeWeight: 5,
// 			strokeColor: 'gold'
// },
//   });
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });
}