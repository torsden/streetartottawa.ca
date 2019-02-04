
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
        "compositeFilter": {
          "op": "AND",
          "filters": [
            {
              "fieldFilter": {
                "field": { "fieldPath": "area" }, 
                "op": "EQUAL", 
                "value": { 
                  "stringValue": filter
                }
              }
            },{
              "fieldFilter": { 
                "field": { "fieldPath": "exists" }, 
                "op": "EQUAL", 
                "value": { 
                  "booleanValue": true
                }
              }
            }
          ]
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
  constructor(props){
    super(props);
    this.state = {isOpen: true, currentImageId: props.id, description: props.description};
  }
  openModal(artId, description) {
    this.setState({isOpen: true, currentImageId: artId, description: description});
  }

  closeModal(){
    this.setState({isOpen: false});
  }

  escFunction(event){
    if(event.keyCode === 27) {
      this.closeModal();
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.escFunction.bind(this), false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction.bind(this), false);
  }

  render(){
    return React.createElement(ModalContent, {isOpen : this.state.isOpen, 
                                                      currentImageId: this.state.currentImageId,
                                                      description: this.state.description, 
                                                      handleClose: this.closeModal.bind(this)})}
}

const ModalContent = ({ handleClose, isOpen, currentImageId, description}) => { 
  const displayValue = isOpen ? 'flex' : 'none';

  return React.createElement('div', {style: {display: displayValue}, className:"reactModal"},
    React.createElement('div', {className:"topSection"}, 
    React.createElement('div', {className:"leftSection"}, 
    React.createElement('img', {className: "modalImage", src: "https://www.instagram.com/p/" + currentImageId + "/media/?size=l"})), 
    React.createElement('div', {className:"rightSection"}, 
    React.createElement('button', {onClick: handleClose, className: "closeButton"}, "Close"), 
    React.createElement('p', {className:"imgDescription"}, description ))),
    React.createElement('div', {id:"map"})
  );
};

function createModal(id, description) {
  var modalDiv = document.getElementById("modal")
  return ReactDOM.render(React.createElement(ModalDialog, {id: id, description: description}), modalDiv);
}


function handleImgClick (event) {
  showModal(event.currentTarget.id, event.currentTarget.dataset.description, event.currentTarget.dataset.lat, event.currentTarget.dataset.lng);
}
function showModal(id, description, lat, lng) {
  if(!modalDialog) {
    modalDialog = createModal(id, description);
  } else {
    modalDialog.openModal(id, description);
  }
  initMap(parseFloat(lat), parseFloat(lng));
}

class Art extends React.Component {
  render() {
      return React.createElement('li', {id: this.props.id, 
      'data-lng': this.props.coordinates.longitude,
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
            "direction":"DESCENDING"
            
        }],
        "where": {
          "fieldFilter": { 
            "field": { "fieldPath": "exists" }, 
            "op": "EQUAL", 
            "value": { 
              "booleanValue": true
            }
          }
        },
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
      "where": {
        "fieldFilter": { 
          "field": { "fieldPath": "exists" }, 
          "op": "EQUAL", 
          "value": { 
            "booleanValue": true
          }
        }
      },
      "orderBy": [{
            "field": {
                "fieldPath": "imageTakenDate"
            },
            "direction":"DESCENDING"
            
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

function initMapOfAllArt() {
  var mapElement = document.getElementById('mapOfAllArt');
  if (mapElement) {
    var ottawaCenter = {lat: 45.410006, lng: -75.714202}; 

    var map = new google.maps.Map(document.getElementById('mapOfAllArt'), {
      zoom: 12,
      maxZoom: 18,
      center: ottawaCenter,
      gestureHandling: 'cooperative',
      disableDefaultUI: true, 
      styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}]
    });

    queryAll().then(function(artData) {
      var markers =[];
      artData.map(element => {
        if(element.document && element.document.fields && element.document.fields.id) {
          if (element.document.fields.coordinates) {
            var coords = {
              lat:  parseFloat(element.document.fields.coordinates.geoPointValue.latitude), 
              lng:  parseFloat(element.document.fields.coordinates.geoPointValue.longitude)
            };
            var marker = new google.maps.Marker({
              position: coords,
              title: 'Art location',
              map: map,
              icon : {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: 'gray',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: 'black'
              }
            });
            marker.setValues({id:element.document.fields.id.stringValue, description:element.document.fields.description?element.document.fields.description.stringValue:null});
            google.maps.event.addListener(marker, "click", function(event) {
              event.cancelBubble = !0,
              event.stopPropagation && event.stopPropagation(),
              showModal(this.id, this.description, event.latLng.lat(), event.latLng.lng());
          }),
            markers.push(marker);
          }
        }
      })
      var markerClusterOptions = {
        gridSize: 17,
        maxZoom: 18,
        styles:[{"anchorIcon":[0,0],"anchorText":[0,0],"fontFamily":"inherit","fontWeight":"normal","height":46,"textColor":"black","textSize":20,
          "url":"assets/circle.svg",
          "width":46}]
        };
      
      var markerCluster = new MarkerClusterer(map, markers, markerClusterOptions);
    });
  }
}

var dialogMap;
var dialogMarker;

function initMap(lat, lng) {
  var eternalFlame = {lat: 45.423730, lng: -75.698700};  
  var artCoords = {lat: lat, lng: lng};
  if(lat === 0 && lng === 0){
    artCoords = eternalFlame;
  }

  if (!dialogMap) {
    dialogMap = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: artCoords,
      gestureHandling: 'cooperative'
    });
  } 
  

  if (!dialogMarker) {
    dialogMarker = new google.maps.Marker({
      position: artCoords,
      map: dialogMap,
      title: 'Art location'
    });
  } else {
    dialogMarker.setPosition(artCoords);
  }
}
