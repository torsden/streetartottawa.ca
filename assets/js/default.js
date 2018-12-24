
var artData;
var queriedData;
var area =[];
var imageTakenDate =[];
var modalDialog;

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

function displayImages (pageId) {
  var promise;
  if(pageId === "art") {
    promise = queryAll();
  } else {
    promise = queryLatestSix();
  }
  createImages(promise);
}

class ModalDialog extends React.Component {
  constructor(){
    super();
    this.state = {isOpen: false, currentImageId: null, description: null};
  }
  openModal(artId, description) {
    this.setState({isOpen: true, currentImageId: artId, description: description});
  }

  closeModal(){
    this.setState({isOpen: false});
  }

  render(){
    return React.createElement(ModalContent, {isOpen : this.state.isOpen, 
                                                      currentImageId: this.state.currentImageId,
                                                      description: this.state.description, 
                                                      handleClose: this.closeModal.bind(this)})}
}

const ModalContent = ({ handleClose, isOpen, currentImageId, description}) => { 
  const displayValue = isOpen ? 'flex' : 'none';

  return React.createElement('div', {style: {display: displayValue}, className:"reactModal"}, React.createElement('div', {className:"topSection"}, 
  React.createElement('div', {className:"leftSection"}, 
  React.createElement('img', {className: "modalImage", src: "https://www.instagram.com/p/" + currentImageId + "/media/?size=m"})), 
  React.createElement('div', {className:"rightSection"}, 
  React.createElement('button', {onClick: handleClose, className: "closeButton"}, "Close"), 
  React.createElement('p', {className:"imgDescription"}, description ))),
  React.createElement('div', {id:"map"}));
};

function createModal() {
  var modalDiv = document.getElementById("modal")
  return ReactDOM.render(React.createElement(ModalDialog), modalDiv);
}

function handleImgClick (event) {
  if(!modalDialog) {
    modalDialog = createModal();
  }
  modalDialog.openModal(event.currentTarget.id, event.currentTarget.dataset.description);
  initMap(parseFloat(event.currentTarget.dataset.lat), parseFloat(event.currentTarget.dataset.long));
}

class Art extends React.Component {
  render() {
      return React.createElement('li', {id: this.props.id, 
      'data-long': this.props.coordinates.longitude,
      'data-lat': this.props.coordinates.latitude,
      'data-description': this.props.description,
       className: "landscape imageContainer", onClick: function(event){ handleImgClick(event)}},
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
              return React.createElement(Art, {
                key: element.document.fields.id.stringValue, 
                id : element.document.fields.id.stringValue, 
                coordinates: {latitude: element.document.fields.coordinates?element.document.fields.coordinates.geoPointValue.latitude:0, 
                            longitude: element.document.fields.coordinates?element.document.fields.coordinates.geoPointValue.longitude:0},
                description: element.document.fields.description?element.document.fields.description.stringValue:null             
                });
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

function initMap(lat, lng) {
  var eternalFlame = {lat: 45.423730, lng: -75.698700};  
  var artCoords = {lat: lat, lng: lng};
  if(lat === 0 && lng === 0){
    artCoords = eternalFlame;
  }

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: artCoords,
    gestureHandling: 'cooperative'
  });

//   var marker = new google.maps.Marker({
//     position: otherLatLng,
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
    position: artCoords,
    map: map,
    title: 'Art location'
  });
}
