// var curUser;
// var curDiv = "login";
var todo = [];
var particle = new Particle();

// function show(divId) {
//   if (divId == 'logout') { //Change links shown
//     document.getElementById('isUser').style.display = 'none';
//     document.getElementById('noUser').style.display = 'block';
//     divId = 'login';
//   }
//   if (divId == 'controls' && curDiv == 'login') {
//     document.getElementById('noUser').style.display = 'none';
//     document.getElementById('isUser').style.display = 'block';
//   }
//   document.getElementById(curDiv).style.display = 'none';
//   document.getElementById(divId).style.display = 'block';
//   curDiv = divId;
// }
//
// function user(un, pass, email) {
//   this.un = un;
//   this.pass = pass;
//   this.email = email;
//   this.todo = [];
// }
//
// function login() {
//   var userI = users.findIndex(function(e) {
//     return e.un == document.getElementById('user').value;
//   });
//   if (userI >= 0 && users[userI].pass == document.getElementById('password').value) {
//     alert("Success!");
//     document.getElementById('user').value = "";
//     document.getElementById('password').value = "";
//     curUser = users[userI];
//     show('controls');
//   } else {
//     alert("Invalid credentials.");
//   }
// }
//
// function logout() {
//   curUser = null;
//   show('logout');
// }
//
// function addUser() {
//   var newUser = new user(document.getElementById('un').value, document.getElementById('pass').value, document.getElementById('email').value);
//   if (users.some(function(e) {
//       return e.un == newUser.un;
//     })) {
//     alert("Username already exists.");
//   } else if (newUser.pass != document.getElementById('pass2').value) {
//     alert("Passwords don't match!");
//   } else {
//     users.push(newUser);
//     alert("Created new user");
//     document.getElementById('email').value = "";
//     document.getElementById('un').value = "";
//     document.getElementById('pass').value = "";
//     document.getElementById('pass2').value = "";
//     show('login');
//   }
// }
//
// function recoverPass() {
//   var userI = users.findIndex(function(e) {
//     return e.un == document.getElementById('recUser').value;
//   });
//   if (userI >= 0) {
//     alert("Password: " + users[userI].pass);
//   } else {
//     alert("User does not exist!");
//   }
// }

function showCycles() {
  document.getElementById("range").innerHTML = document.getElementById("cycles").value;
  var publishEventPr = particle.publishEvent({
    name: 'cycles',
    data: document.getElementById("cycles").value,
    auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
  });

  publishEventPr.then(
    function(data) {
      if (data.body.ok) {
        console.log("Event published succesfully")
      }
    },
    function(err) {
      console.log("Failed to publish event: " + err)
    }
  );
}

function addTodo() {
  var todoName = document.getElementById("newTodo").value;
  var todoTime = document.getElementById("todoTime").value;
  if (todoName == "" || todoTime == "") {
    alert("Invalid todo!");
  } else {
    var newTodo = new Array(todoTime, todoName);
    var i;
    for (var i = 0; i < todo.length; i++) {
      if (todo[i][0] > todoTime) {
        todo.splice(i, 0, newTodo);
        break;
      }
    }
    if (i == todo.length) {
      todo.push(newTodo);
    }
    var publishEventPr = particle.publishEvent({
      name: 'addTodo',
      data: newTodo[0] + ": " + newTodo[1],
      auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
    });

    publishEventPr.then(
      function(data) {
        if (data.body.ok) {
          console.log("Event published succesfully")
        }
      },
      function(err) {
        console.log("Failed to publish event: " + err)
      }
    );
    showTodo();
  }
}

function showTodo() {
  var list = "";
  for (var i = 0; i < todo.length; i++) {
    list += "<p>" + todo[i][0] + " " + todo[i][1] + " <a href='javascript:removeTodo(" + i + ")'>Remove</a></p>";
  }
  document.getElementById("todo").innerHTML = list;
}

function removeTodo(index) {
  var remTodo = todo[index];
  var publishEventPr = particle.publishEvent({
    name: 'removeTodo',
    data: remTodo[0] + ": " + remTodo[1],
    auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
  });

  publishEventPr.then(
    function(data) {
      if (data.body.ok) {
        console.log("Event published succesfully")
      }
    },
    function(err) {
      console.log("Failed to publish event: " + err)
    }
  );
  todo.splice(index, 1);
  showTodo();
}

function onDeviceReady() {
  var publishEventPr = particle.publishEvent({
    name: 'websiteOn',
    data: true,
    auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
  });

  publishEventPr.then(
    function(data) {
      if (data.body.ok) {
        console.log("Event published succesfully")
      }
    },
    function(err) {
      console.log("Failed to publish event: " + err)
    }
  );
  particle.getEventStream({
    deviceId: '4e0055001951363036373538',
    auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
  }).then(function(stream) {
    stream.on('todoCache', function(data) {
      console.log("Event: ", data);
      var todoStr = data.data;
      var i = todoStr.lastIndexOf(":");
      var newTodo = new Array(todoStr.slice(0, i), todoStr.slice(i+2));
      todo.push(newTodo);
      showTodo();
    });
  });
}

document.getElementById("cycles").addEventListener("change", showCycles, false);
document.addEventListener('deviceready', onDeviceReady, false);
onDeviceReady();
/*particle.getEventStream({
  deviceId: 'mine',
  auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
}).then(function(stream) {
  stream.on('myClockState', function(data) {
    console.log("Event: ", data);
  });
});*/
