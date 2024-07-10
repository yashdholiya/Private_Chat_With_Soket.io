// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const bcrypt = require("bcrypt");
// const mysql = require("mysql");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "chat_app",
// });

// app.use(express.static(__dirname + "/public"));
// app.use(express.json());

// let onlineUsers = {};
// let groups = {};

// // User registration endpoint
// app.post("/register", (req, res) => {
//   const { userid, username, password } = req.body;
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   const query =
//     "INSERT INTO users (userid, username, password, status) VALUES (?, ?, ?, 'offline')";

//   connection.query(
//     query,
//     [userid, username, hashedPassword],
//     (error, results) => {
//       if (error) {
//         console.error("Error registering user:", error);
//         res.status(500).send("Error registering user");
//       } else {
//         res.send("User registered successfully");
//       }
//     }
//   );
// });

// // User login endpoint
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   const query = "SELECT * FROM users WHERE username = ?";

//   connection.query(query, [username], (error, results) => {
//     if (error) {
//       console.error("Error logging in:", error);
//       res.status(500).send("Error logging in");
//     } else {
//       if (results.length > 0) {
//         const user = results[0];
//         if (bcrypt.compareSync(password, user.password)) {
//           const updateQuery =
//             "UPDATE users SET status = 'online' WHERE userid = ?";
//           connection.query(updateQuery, [user.userid], (err, updateResult) => {
//             if (err) {
//               console.error("Error updating user status:", err);
//               res.status(500).send("Error logging in");
//             } else {
//               res.send({
//                 message: "Login successful",
//                 userid: user.userid,
//                 username: user.username,
//               });
//             }
//           });
//         } else {
//           res.status(401).send("Invalid password");
//         }
//       } else {
//         res.status(401).send("User not found");
//       }
//     }
//   });
// });

// // Fetch all users
// app.get("/users", (req, res) => {
//   const query = "SELECT userid, username, status FROM users";
//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error("Error fetching users:", error);
//       res.status(500).send("Error fetching users");
//     } else {
//       res.json(results);
//     }
//   });
// });

// // Create a new group
// app.post("/groups", (req, res) => {
//   const { groupName, creatorId, members } = req.body;
//   const query = "INSERT INTO groupss (groupName, creatorId) VALUES (?, ?)";

//   connection.query(query, [groupName, creatorId], (error, results) => {
//     if (error) {
//       console.error("Error creating group:", error);
//       res.status(500).send("Error creating group");
//     } else {
//       const groupId = results.insertId;
//       const memberQueries = members.map((member) => {
//         return new Promise((resolve, reject) => {
//           connection.query(
//             "INSERT INTO group_members (groupId, userId) VALUES (?, ?)",
//             [groupId, member],
//             (err, res) => {
//               if (err) reject(err);
//               else resolve(res);
//             }
//           );
//         });
//       });
//       Promise.all(memberQueries)
//         .then(() => {
//           groups[groupId] = { groupName, creatorId, members };
//           res.send({ groupId, groupName, members });
//         })
//         .catch((err) => {
//           console.error("Error adding members to group:", err);
//           res.status(500).send("Error adding members to group");
//         });
//     }
//   });
// });

// // Fetch all groups
// app.get("/groups", (req, res) => {
//   const query = "SELECT * FROM groups";
//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error("Error fetching groups:", error);
//       res.status(500).send("Error fetching groups");
//     } else {
//       res.json(results);
//     }
//   });
// });

// io.on("connection", (socket) => {
//   // Handle join event
//   socket.on("joinRoom", ({ userId, username }) => {
//     onlineUsers[userId] = { socketId: socket.id, username };
//     console.log(`${username} is connected`);

//     // Broadcast updated user list
//     io.emit("update-users", onlineUsers);

//     // Update user status to online in the database
//     const updateQuery = "UPDATE users SET status = 'online' WHERE userid = ?";
//     connection.query(updateQuery, [userId], (err, results) => {
//       if (err) {
//         console.error("Error updating user status:", err);
//       } else {
//         // Fetch updated user list and broadcast it
//         const query = "SELECT userid, username, status FROM users";
//         connection.query(query, (error, results) => {
//           if (error) {
//             console.error("Error fetching users:", error);
//           } else {
//             io.emit("update-users", results);
//           }
//         });
//       }
//     });
//   });

//   // Handle private message
//   socket.on("private-message", ({ to, messageData }) => {
//     const recipient = Object.values(onlineUsers).find(
//       (user) => user.username === to
//     );
//     if (recipient) {
//       // Save message to the database
//       const query =
//         "INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)";
//       connection.query(
//         query,
//         [messageData.user, to, messageData.message],
//         (error, results) => {
//           if (error) {
//             console.error("Error saving message:", error);
//           }
//         }
//       );

//       io.to(recipient.socketId).emit("private-message", messageData);
//       console.log("Private message sent to:", recipient.username);
//     }
//   });

//   // Handle group message
//   socket.on("group-message", ({ groupId, messageData }) => {
//     if (groups[groupId]) {
//       // Save message to the database
//       const query =
//         "INSERT INTO group_messages (groupId, sender, message) VALUES (?, ?, ?)";
//       connection.query(
//         query,
//         [groupId, messageData.user, messageData.message],
//         (error, results) => {
//           if (error) {
//             console.error("Error saving group message:", error);
//           }
//         }
//       );

//       const groupMembers = groups[groupId].members;
//       groupMembers.forEach((memberId) => {
//         if (onlineUsers[memberId]) {
//           io.to(onlineUsers[memberId].socketId).emit(
//             "group-message",
//             messageData
//           );
//         }
//       });
//       console.log("Group message sent to group:", groups[groupId].groupName);
//     }
//   });

//   // Handle disconnect event
//   socket.on("disconnect", () => {
//     let userId = null;
//     for (const id in onlineUsers) {
//       if (onlineUsers[id].socketId === socket.id) {
//         userId = id;

//         // Update last seen time and status in the database
//         const disconnectTime = new Date();
//         const updateQuery =
//           "UPDATE users SET status = 'offline', last_seen = ? WHERE userid = ?";
//         connection.query(
//           updateQuery,
//           [disconnectTime, userId],
//           (err, results) => {
//             if (err) {
//               console.error("Error updating user status:", err);
//             } else {
//               // Fetch updated user list and broadcast it
//               const query =
//                 "SELECT userid, username, status, last_seen FROM users";
//               connection.query(query, (error, results) => {
//                 if (error) {
//                   console.error("Error fetching users:", error);
//                 } else {
//                   io.emit("update-users", results);
//                 }
//               });
//             }
//           }
//         );

//         // Emit user status change to all clients
//         io.emit("user-status-change", {
//           username: onlineUsers[id].username,
//           status: "offline",
//           disconnectTime: disconnectTime.getTime(),
//         });

//         delete onlineUsers[id];
//         break;
//       }
//     }
//   });
// });

// // Start server
// const PORT = 2123;
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcrypt");
const mysql = require("mysql");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  connectionStateRecovery: {},
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat_app",
});

app.use(express.static(__dirname + "/public"));
app.use(express.json());

let onlineUsers = {};

// User registration endpoint
app.post("/register", (req, res) => {
  const { userid, username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query =
    "INSERT INTO users (userid, username, password, status) VALUES (?, ?, ?, 'offline')";

  connection.query(
    query,
    [userid, username, hashedPassword],
    (error, results) => {
      if (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user");
      } else {
        res.send("User registered successfully");
      }
    }
  );
});

// User login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ?";

  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Error logging in");
    } else {
      if (results.length > 0) {
        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
          const updateQuery =
            "UPDATE users SET status = 'online' WHERE userid = ?";
          connection.query(updateQuery, [user.userid], (err, updateResult) => {
            if (err) {
              console.error("Error updating user status:", err);
              res.status(500).send("Error logging in");
            } else {
              res.send({
                message: "Login successful",
                userid: user.userid,
                username: user.username,
              });
            }
          });
        } else {
          res.status(401).send("Invalid password");
        }
      } else {
        res.status(401).send("User not found");
      }
    }
  });
});

// Fetch all users
app.get("/users", (req, res) => {
  const query = "SELECT userid, username, status FROM users";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error fetching users");
    } else {
      res.json(results);
    }
  });
});

io.on("connection", (socket) => {
  // Handle join event
  socket.on("joinRoom", ({ userId, username }) => {
    onlineUsers[userId] = { socketId: socket.id, username };
    console.log(` ${username} is connected`);

    // Broadcast updated user list
    io.emit("update-users", onlineUsers);

    // Update user status to online in the database
    const updateQuery = "UPDATE users SET status = 'online' WHERE userid = ?";
    connection.query(updateQuery, [userId], (err, results) => {
      if (err) {
        console.error("Error updating user status:", err);
      } else {
        // Fetch updated user list and broadcast it
        const query = "SELECT userid, username, status FROM users";
        connection.query(query, (error, results) => {
          if (error) {
            console.error("Error fetching users:", error);
          } else {
            io.emit("update-users", results);
          }
        });
      }
    });
  });

  // Handle private message
  socket.on("private-message", ({ to, messageData }) => {
    const recipient = Object.values(onlineUsers).find(
      (user) => user.username === to
    );
    if (recipient) {
      // Save message to the database
      const query =
        "INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)";
      connection.query(
        query,
        [messageData.user, to, messageData.message],
        (error, results) => {
          if (error) {
            console.error("Error saving message:", error);
          }
        }
      );

      io.to(recipient.socketId).emit("private-message", messageData);
      console.log("Private message sent to:", recipient.username);
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    let userId = null;
    for (const id in onlineUsers) {
      if (onlineUsers[id].socketId === socket.id) {
        userId = id;

        // Update last seen time and status in the database
        const disconnectTime = new Date();
        const updateQuery =
          "UPDATE users SET status = 'offline', last_seen = ? WHERE userid = ?";
        connection.query(
          updateQuery,
          [disconnectTime, userId],
          (err, results) => {
            if (err) {
              console.error("Error updating user status:", err);
            } else {
              // Fetch updated user list and broadcast it
              const query =
                "SELECT userid, username, status, last_seen FROM users";
              connection.query(query, (error, results) => {
                if (error) {
                  console.error("Error fetching users:", error);
                } else {
                  io.emit("update-users", results);
                }
              });
            }
          }
        );

        // Emit user status change to all clients
        io.emit("user-status-change", {
          username: onlineUsers[id].username,
          status: "offline",
          disconnectTime: disconnectTime.getTime(),
        });

        delete onlineUsers[id];
        break;
      }
    }
  });
});
// API endpoint to get messages between two users
app.get("/messages", (req, res) => {
  const { sender, recipient } = req.query;

  const query = `
    SELECT * FROM messages 
    WHERE (sender = ? AND recipient = ?) 
       OR (sender = ? AND recipient = ?)
    ORDER BY created_at ASC
  `;

  connection.query(
    query,
    [sender, recipient, recipient, sender],
    (error, results) => {
      if (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send("Error fetching messages");
      } else {
        console.log("Fetched messages:", results);
        res.json(results);
      }
    }
  );
});

// Start server
const PORT = 2123;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
