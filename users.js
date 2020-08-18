const Moniker = require("moniker");
let users = [];
let clicks = 20;

function start(io) {
  io.sockets.on("connection", function (socket) {
    console.log(socket.handshake.session.user);
    const user = socket.handshake.session.user ? saveUser(socket) : registerUser(socket);

    socket.userName = user.name;

    socket.emit("welcome", user);
    io.sockets.emit("clicks", clicks);

    socket.on("disconnect", function () {
      removeUser(user);
    });

    socket.on("click", function () {
      const user = socket.handshake.session.user;
      console.log(user);
      io.emit("whoHasClicked", user);
      addClick();
      increaseCountClickUser(user);
      winner(io, user);
    });
  });

  

  function saveUser(socket) {
    const user = socket.handshake.session.user;
    users.push(user)
    return user;
  }

  function addClick() {
    clicks += 1;
    io.emit("clicks", clicks);
  }

  function increaseCountClickUser(user){
    
    const userFind = users.find((user1) => user1.name === user.name);
    userFind.clicks += 1;
    updateUsers();
  }

  function resetNumberOfClicks(){
    users.forEach((user) => {
      user.clicks = 0;
    })

    updateUsers();
  }

  const addUser = function () {
    const user = {
      name: Moniker.choose(),
      clicks: 0,
    };
    users.push(user);
    updateUsers();
    return user;
  };

  const removeUser = function (user) {
    for (var i = 0; i < users.length; i++) {
      if (user.name === users[i].name) {
        users.splice(i, 1);
        updateUsers();
        return;
      }
    }
  };

  const updateUsers = function () {
    let str = "";
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      str += user.name + " <small>(" + user.clicks + " clicks)</small>";
    }
    io.sockets.emit("users", { users: str });
  };

  function registerUser(socket) {
    const user = addUser();
    socket.handshake.session.user = user;
    socket.handshake.session.save();
    return user;
  }

  function winner(io, user) {
    if (clicks === 30) {
      io.emit("whoWins", user);
      clicks = 20;
      io.emit("clicks", clicks);
      resetNumberOfClicks();
    }
  }
}

module.exports = start;
