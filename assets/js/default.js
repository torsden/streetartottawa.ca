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
  // window.onclick = function(event) {
  //     if (event.target == modal) {
  //         modal.style.display = "none";
  //     }
  // }
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


function handleImgClick (event) {
  var img = document.getElementById('dialogImage');
  img.src = "https://instagram.com/p/" + event.currentTarget.id + "/media/?size=l";

  var area = event.currentTarget.dataset.area;
  var areaElem = document.getElementById('artPieceArea');
  areaElem.textContent = area;
  
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
}

class ModalCanvas extends React.Component {
  constructor(props){
    super();
    this.state = {open: props.open};
  }
  openModal() {
    this.setState({open: true});
  }

  closeModal(){
    this.setState({open: false});
  }

  render(){
    return React.createElement(Modal, {open : this.state.open, handleClose : this.closeModal.bind(this)}, React.createElement('button', {onClick: this.openModal.bind(this)}, "Open"))}
}

const Modal = ({ handleClose, open, children}) => { 
  const displayValue = open ? 'block' : 'none';

  return React.createElement('div', {style: {display: displayValue, margin: "30px"}, className:"reactModal"}, React.createElement('button', {onClick: handleClose}, "Close"));
};

// const Modal = function({open, handleClose, children}){ 
//   const displayValue;
//    if (open) {
//     displayValue = 'modal display-block';
//    }  
//    else {
//     displayValue = 'modal display-none';
//    }

//   return React.createElement('div', {className: displayValue}, {children}, React.createElement('button', {onClick: closeModal, displayName: "Close"}));
// };


// function Modal({open, handleClose, children}){ 
//   const displayValue;
//    if (open) {
//     displayValue = 'modal display-block';
//    }  
//    else {
//     displayValue = 'modal display-none';
//    }

//   return React.createElement('div', {className: displayValue}, {children}, React.createElement('button', {onClick: closeModal, displayName: "Close"}));
// };

function createModal() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  ReactDOM.render(React.createElement(ModalCanvas, {open:true}), container);
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



