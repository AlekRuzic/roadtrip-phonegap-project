var tripInProgress;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        firebase.auth().onAuthStateChanged(function(user) {

            if (user) {
                // user is logged in
                console.log(JSON.stringify(user));
                document.getElementById('loginScreen').style = "display:none;";
                document.getElementById('homeScreen').style = "display:block;";

                //check if trip is in progress
                checkIfTripInProgress();

                //clear previous trips from previous accounts
                document.getElementById("previousTripsDiv").innerHTML = "";

                //if trip is in progress, get the trip name

            } else {
                // user is logged out
                document.getElementById('loginScreen').style = "display:block";
                document.getElementById('homeScreen').style = "display:none;";
            }

        });
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        checkIfTripInProgress();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    startTrip: function() {
        if (tripInProgress == true ) {
            alert("You must finish the current trip before starting a new one.");
        } else {
        document.getElementById('homeScreen').style = "display:none;";
        document.getElementById("newTripScreen").style = "display:block;";
        document.getElementById("homeButton").style = "display:block;";
        }
    },

    endTrip: function() {
        if (tripInProgress == false) {
            alert("There is currently no trip in progress");
        } else {
        document.getElementById('homeScreen').style = "display:none;";
        document.getElementById("endTripScreen").style = "display:block;";
        document.getElementById("homeButton").style = "display:block;";
        }
    }

};


//Logging in and Signing up
var appAuth = {
    signOutUser: function signUserOut() {
        console.log("logout");
        firebase.auth().signOut().then(function () {
            console.log('User logged out');
        }).catch(function (error) {
            console.log(error);
        });
    },

    //creates a user, however the user will not be added to the database until its first trip has been started
    signUpUser: function writeUserData(email, password) {
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .catch(function (error) {
                console.log(error.code);
                console.log(error.message);
            });
        alert("User Created. Welcome to Road Trip!");
    },

    loginUser: function (email, password) {
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        if (!email || !password) {
            console.log('Invalid email/password');
        } else {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;

                alert(errorCode);
                console.error('Received error: ' + errorCode);
                console.log(errorMessage);
            });
        }
    },

    getCurrentUser: function () {
        return firebase.auth().currentUser.uid;
    }
};
//



//Getting start and end geolocation data
function getStartPosition() {
    navigator.geolocation.getCurrentPosition(successGetStartLocation, errorGetStartLocation);
}

function successGetStartLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var altitude = position.coords.altitude;

    document.getElementById("startLat").value = lat;
    document.getElementById("startLong").value = long;
    document.getElementById("startAlt").value = altitude;
}

function errorGetStartLocation(e) {
    alert(e.message);
}

function getEndPosition() {
    navigator.geolocation.getCurrentPosition(successGetEndLocation, errorGetEndLocation);
}

function successGetEndLocation(position) {
    var endLat = position.coords.latitude;
    var endLong = position.coords.longitude;
    var endAltitude = position.coords.altitude;

    document.getElementById("endLat").value = endLat;
    document.getElementById("endLong").value = endLong;
    document.getElementById("endAlt").value = endAltitude;
}

function errorGetEndLocation(e) {
    alert(e.message);
}
//


//Sending Trip Data
function sendStartTripData() {
    var userId = appAuth.getCurrentUser();
    var tripName = document.getElementById('tripName').value;
    var tripDescription = document.getElementById('tripDescription').value;
    var startLocation = document.getElementById('startLocation').value;
    var startLat = document.getElementById("startLat").value;
    var startLong = document.getElementById("startLong").value;
    var startAlt = document.getElementById("startAlt").value;

    if (startLat == '' || startLong == '' || startAlt == '' || tripDescription == '' || tripName == '') {
        alert("Please make sure all fields are filled in");
    } else {
        firebase.database().ref('Group22/Team Data/users/' + userId +'/trips/' + tripName).set({
            startLocation: startLocation,
            tripDescription: tripDescription,
            startLat: startLat,
            startLong: startLong,
            startAlt: startAlt,
            endLocation: '',
            endLat: '',
            endLong: '',
            endAlt: '',
            tripInProgress: true
        });
        alert("Trip Started!");
        tripInProgress = true;
        currentTripName = tripName;
        document.getElementById('homeScreen').style = "display:block;";
        document.getElementById("newTripScreen").style = "display:none;";
    }
}

function sendEndTripData() {
    var userId = appAuth.getCurrentUser();
    firebase.database().ref("Group22/Team Data/users/" + userId + "/trips/" + currentTripName).update(
      {
        endLocation: document.getElementById("endLocation").value,
        endLat: document.getElementById("endLat").value,
        endLong: document.getElementById("endLong").value,
        endAlt: document.getElementById("endAlt").value,
        tripInProgress: false
      }
    );
    alert("Trip Ended!");
    document.getElementById('homeScreen').style = "display:block;";
    document.getElementById("endTripScreen").style = "display:none;";
}
//


//see previous trip summaries
function previousTrips() {
    document.getElementById("homeScreen").style = "display:none;";
    document.getElementById("previousTripScreen").style = "display:block;";
    document.getElementById("homeButton").style = "display:block;";

    var userId = appAuth.getCurrentUser();
    firebase.database().ref('Group22/Team Data/users/' + userId + "/trips")
        .once('value', function (snapshot) {
            if (JSON.stringify(snapshot.val()) == null) {
                alert("You have not completed any trips!");
            } else {
                var tripInfo = [];
                var tripNames = [];
                var tripsObject = snapshot.val();
                for (var tripProperties in tripsObject) {
                    tripInfo.push(tripsObject[tripProperties]);
                }
                for (var tripName in tripsObject) {
                    tripNames.push(tripName);
                }

                console.log(tripInfo);
                console.log(tripNames);

                for (i=0; i<tripInfo.length; i++) {
                    document.getElementById("previousTripsDiv").innerHTML = "";
                    document.getElementById("previousTripsDiv").innerHTML +=
                        "<div class='tripName'>" + tripNames[i] + "</div>" +
                        "<p>Trip Description: " + tripInfo[i].tripDescription + "</p>" +
                        "<p>Starting Location: " + tripInfo[i].startLocation + "</p>" +
                        "<p>Starting Altitude: " + tripInfo[i].startAlt + "</p>" +
                        "<p>Starting Longitude: " + tripInfo[i].startLong + "</p>" +
                        "<p>Starting Latitude: " + tripInfo[i].startLat + "</p>" +
                        "<p>Ending Location: " + tripInfo[i].endLocation + "</p>" +
                        "<p>Ending Altitude: " + tripInfo[i].endAlt + "</p>" +
                        "<p>Ending Longitude: " + tripInfo[i].endLong + "</p>" +
                        "<p>Ending Latitude: " + tripInfo[i].endLat + "</p>";
                }
            }
        });
}
//

//Check if any trips are in progress
var checkIfTripInProgress = function() {
    firebase
    .database()
    .ref("Group22/Team Data/users/" + firebase.auth().currentUser.uid + "/trips")
    .on("value", function(snapshot) {
        var tripInfo = [];
        var tripsObject = snapshot.val();
        for (var tripProperties in tripsObject) {
            tripInfo.push(tripsObject[tripProperties]);
        }

        for (i = 0; i < tripInfo.length; i++) {
            if (tripInfo[i].tripInProgress == true) {
                tripInProgress = true;
                console.log(tripInProgress);
                return;
            }
        }
        tripInProgress = false;
        console.log(tripInProgress);
        return;
        });
}
//


//back button
function backToHome() {
    document.getElementById('homeScreen').style = "display:block;";
    document.getElementById("newTripScreen").style = "display:none;";
    document.getElementById("endTripScreen").style = "display:none;";
    document.getElementById("homeButton").style = "display:none;";
    document.getElementById("previousTripScreen").style = "display:none;";
}