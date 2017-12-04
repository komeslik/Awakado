var curUser;
var curDiv = "login";
var users = [new user("guest", "guest", "guest@gmail.com"), new user("dank", "123", "dank@dank.com")];
var particle = new Particle();

function show(divId) {
  if (divId == 'logout') { //Change links shown
    document.getElementById('isUser').style.display = 'none';
    document.getElementById('noUser').style.display = 'block';
    divId = 'login';
  }
  if (divId == 'controls' && curDiv == 'login') {
    document.getElementById('noUser').style.display = 'none';
    document.getElementById('isUser').style.display = 'block';
  }
  document.getElementById(curDiv).style.display = 'none';
  document.getElementById(divId).style.display = 'block';
  curDiv = divId;
}

function user(un, pass, email) {
  this.un = un;
  this.pass = pass;
  this.email = email;
  this.todo = [];
}

function login() {
  var userI = users.findIndex(function(e) {
    return e.un == document.getElementById('user').value;
  });
  if (userI >= 0 && users[userI].pass == document.getElementById('password').value) {
    alert("Success!");
    document.getElementById('user').value = "";
    document.getElementById('password').value = "";
    curUser = users[userI];
    show('controls');
  } else {
    alert("Invalid credentials.");
  }
}

function logout() {
  curUser = null;
  show('logout');
}

function addUser() {
  var newUser = new user(document.getElementById('un').value, document.getElementById('pass').value, document.getElementById('email').value);
  if (users.some(function(e) {
      return e.un == newUser.un;
    })) {
    alert("Username already exists.");
  } else if (newUser.pass != document.getElementById('pass2').value) {
    alert("Passwords don't match!");
  } else {
    users.push(newUser);
    alert("Created new user");
    document.getElementById('email').value = "";
    document.getElementById('un').value = "";
    document.getElementById('pass').value = "";
    document.getElementById('pass2').value = "";
    show('login');
  }
}

function recoverPass() {
  var userI = users.findIndex(function(e) {
    return e.un == document.getElementById('recUser').value;
  });
  if (userI >= 0) {
    alert("Password: " + users[userI].pass);
  } else {
    alert("User does not exist!");
  }
}

function showCycles() {
  document.getElementById("range").innerHTML = document.getElementById("cycles").value;
  var publishEventPr = particle.publishEvent({ name: 'cycles', data: document.getElementById("cycles").value, auth: '3169a9b1af16f544b5684e856555ed68a66b7af4' });

  publishEventPr.then(
      function(data) {
          if (data.body.ok) { console.log("Event published succesfully") }
      },
      function(err) {
          console.log("Failed to publish event: " + err)
      }
  );
}

function addTodo() {
  var newTodo = document.getElementById("newTodo").value;
  var todoTime = document.getElementById("todoTime").value;
  var todo = new Array(newTodo, todoTime);
  curUser.todo.push(todo);
  var publishEventPr = particle.publishEvent({ name: 'addTodo', data: todo[0] + " at " + todo[1], auth: '3169a9b1af16f544b5684e856555ed68a66b7af4' });

  publishEventPr.then(
      function(data) {
          if (data.body.ok) { console.log("Event published succesfully") }
      },
      function(err) {
          console.log("Failed to publish event: " + err)
      }
  );
  showTodo();
}

function showTodo() {
  var list = "";
  for(var i = 0; i < curUser.todo.length; i++){
    list += "<p>" + curUser.todo[i][0] + " " + curUser.todo[i][1] + " <a href='javascript:removeTodo(" + i + ")'>Remove</a></p>";
  }
  document.getElementById("todo").innerHTML = list;
}

function removeTodo(index) {
  var todo = curUser.todo[index];
  var publishEventPr = particle.publishEvent({ name: 'removeTodo', data: todo[0] + " at " + todo[1], auth: '3169a9b1af16f544b5684e856555ed68a66b7af4' });

  publishEventPr.then(
      function(data) {
          if (data.body.ok) { console.log("Event published succesfully") }
      },
      function(err) {
          console.log("Failed to publish event: " + err)
      }
  );
  curUser.todo.splice(index,1);
  showTodo();
}

document.getElementById("cycles").addEventListener("change", showCycles, false);
/*particle.getEventStream({
  deviceId: 'mine',
  auth: '3169a9b1af16f544b5684e856555ed68a66b7af4'
}).then(function(stream) {
  stream.on('myClockState', function(data) {
    console.log("Event: ", data);
  });
});*/
