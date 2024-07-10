// const socket = io();
// let userId = "";
// let username = "";
// let currentRecipient = null;

// // Function to switch between registration, login, chat, and private chat views
// function showView(viewId) {
//   hideAllViews();
//   const viewElement = document.getElementById(viewId);
//   if (viewElement) {
//     viewElement.style.display = "block";
//   } else {
//     console.error(`Element with ID ${viewId} not found.`);
//   }
// }

// // Helper function to hide all views
// function hideAllViews() {
//   const views = [
//     "registerContainer",
//     "loginContainer",
//     "chatContainer",
//     "privateChatContainer",
//   ];
//   views.forEach((viewId) => {
//     const viewElement = document.getElementById(viewId);
//     if (viewElement) {
//       viewElement.style.display = "none";
//     }
//   });
// }

// // Function to update user status (online/offline)
// function updateUserStatus(username, status) {
//   const onlineUsersList = document.getElementById("onlineUsersList");
//   if (onlineUsersList) {
//     const userItems = onlineUsersList.getElementsByTagName("li");
//     for (let i = 0; i < userItems.length; i++) {
//       const userItem = userItems[i];
//       if (userItem.textContent.startsWith(username)) {
//         userItem.textContent = `${username} (${status}) `;
//         break;
//       }
//     }
//   }
// }

// // Event listener for registration form submission
// document.getElementById("registerForm").addEventListener("submit", (event) => {
//   event.preventDefault();
//   const userid = document.getElementById("regUserId").value.trim();
//   const username = document.getElementById("regUsername").value.trim();
//   const password = document.getElementById("regPassword").value.trim();
//   registerUser(userid, username, password);
// });

// // Event listener for login form submission
// document.getElementById("loginForm").addEventListener("submit", (event) => {
//   event.preventDefault();
//   const usernameInput = document.getElementById("loginUsername").value.trim();
//   const password = document.getElementById("loginPassword").value.trim();
//   loginUser(usernameInput, password);
// });

// // Function to register a new user
// function registerUser(userid, username, password) {
//   fetch("http://localhost:2123/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ userid, username, password }),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Registration failed.");
//       }
//       alert("Registration successful. Please log in.");
//       showView("loginContainer");
//     })
//     .catch((error) => {
//       console.error("Error registering user:", error);
//       alert("Registration failed. Please try again.");
//     });
// }

// // Function to log in an existing user
// function loginUser(usernameInput, password) {
//   fetch("http://localhost:2123/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ username: usernameInput, password }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (!data.userid) {
//         throw new Error("Login failed.");
//       }
//       userId = data.userid;
//       username = usernameInput;
//       showView("chatContainer");`
//       initializeChat();`
//     })
//     .catch((error) => {
//       console.error("Error logging in:", error);
//       alert("Login failed. Please check your username and password.");
//     });
// }

// function initializeChat() {
//   fetch("http://localhost:2123/users")
//     .then((response) => response.json())
//     .then((users) => {
//       const onlineUsersList = document.getElementById("onlineUsersList");
//       if (onlineUsersList) {
//         onlineUsersList.innerHTML = "";
//         console.log("all user list ...",onlineUsersList);
//         users.forEach((user) => {
//           const userItem = document.createElement("li");
//           if (user.username === username) {
//             userItem.textContent = `${user.username} (You)`;
//           } else if (user.status === "online") {
//             userItem.textContent = `${user.username} (Online)`;
//           } else {
//             const lastSeenTime = new Date(user.last_seen);
//             const currentTime = new Date();
//             const offlineDuration = Math.floor(
//               (currentTime - lastSeenTime) / (60 * 1000)
//             );

//             if (isNaN(offlineDuration)) {
//               userItem.textContent = `${user.username} (Offline)`;
//             } else {
//               const hours = Math.floor(offlineDuration / 60);
//               const minutes = offlineDuration % 60;
//               userItem.textContent = `${user.username} (Offline for ${hours}h ${minutes}m)`;
//             }
//           }

//           if (user.status === "online" && user.username !== username) {
//             userItem.addEventListener("click", () => {
//               currentRecipient = user.username;
//               openPrivateChat(user.username);
//             });
//           }
//           onlineUsersList.appendChild(userItem);
//         });
//       } else {
//         console.error("Element with ID 'onlineUsersList' not found.");
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching users:", error);
//     });

//   const allMessages = document.getElementById("messages");

//   function appendMessage(messageData, isPrivate = false) {
//     const div = document.createElement("div");
//     div.className = messageData.user === username ? "sent" : "received";
//     const p = document.createElement("p");
//     p.textContent = `${messageData.user}: ${messageData.message}`;

//     const timeSpan = document.createElement("span");
//     timeSpan.className = "timestamp";
//     timeSpan.innerText = messageData.timestamp;
//     p.appendChild(timeSpan);
//     div.appendChild(p);

//     if (isPrivate) {
//       const privateMessages = document.getElementById("privateMessages");
//       if (privateMessages) {
//         privateMessages.appendChild(div);
//         privateMessages.scrollTop = privateMessages.scrollHeight;
//       } else {
//         console.error("Element with ID 'privateMessages' not found.");
//       }
//     } else {
//       if (allMessages) {
//         allMessages.appendChild(div);
//         allMessages.scrollTop = allMessages.scrollHeight;
//       } else {
//         console.error("Element with ID 'messages' not found.");
//       }
//     }
//   }

//   function sendPrivateMessage() {
//     const messageInput = document.getElementById("privateMessageInput");
//     const message = messageInput.value.trim();
//     if (message && currentRecipient) {
//       const messageData = {
//         user: username,
//         message,
//         timestamp: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: false,
//         }),
//       };
//       appendMessage(messageData, true);
//       socket.emit("private-message", { to: currentRecipient, messageData });
//       messageInput.value = "";
//     }
//   }

//   // Event listener for private message form submission
//   const privateMessageForm = document.getElementById("privateMessageForm");
//   if (privateMessageForm) {
//     privateMessageForm.addEventListener("submit", (event) => {
//       event.preventDefault();
//       sendPrivateMessage();
//     });
//   } else {
//     console.error("Element with ID 'privateMessageForm' not found.");
//   }

//   // Event listener for message form submission
//   const messageForm = document.getElementById("messageForm");
//   if (messageForm) {
//     messageForm.addEventListener("submit", (event) => {
//       event.preventDefault();
//       const messageInput = document.getElementById("messageInput");
//       const message = messageInput.value.trim();
//       if (message) {
//         const messageData = {
//           user: username,
//           message,
//           timestamp: new Date().toLocaleTimeString(),
//         };
//         appendMessage(messageData);
//         socket.emit("broadcast-message", messageData);
//         messageInput.value = "";
//       }
//     });
//   } else {
//     console.error("Element with ID 'messageForm' not found.");
//   }

//   // Listen for private messages
//   socket.on("private-message", (messageData) => {
//     if (
//       messageData.user === currentRecipient ||
//       messageData.user === username
//     ) {
//       appendMessage(messageData, true);
//     }
//     console.log("Private message received:", messageData);
//   });

//   socket.on("user-status-change", ({ username, status, disconnectTime }) => {
//     const onlineUsersList = document.getElementById("onlineUsersList");
//     if (onlineUsersList) {
//       // Update user status and offline duration
//       const userItems = onlineUsersList.getElementsByTagName("li");
//       for (let i = 0; i < userItems.length; i++) {
//         const userItem = userItems[i];
//         if (userItem.textContent.startsWith(username)) {
//           if (status === "offline") {
//             const lastSeenTime = new Date(disconnectTime).getTime();
//             const currentTime = new Date().getTime();
//             const offlineDuration = currentTime - lastSeenTime;

//             if (isNaN(offlineDuration)) {
//               userItem.textContent = `${username} (Offline)`;
//             } else {
//               userItem.textContent = `${username} (Offline for ${offlineDuration} ms)`;
//             }
//           } else {
//             userItem.textContent = `${username} (Online)`;
//           }
//           break;
//         }
//       }
//     }
//   });

//   // Join the chat room and notify the server
//   socket.emit("joinRoom", { userId, username });
// }

// // Function to open a private chat view
// function openPrivateChat(recipient) {
//   showView("privateChatContainer");
//   const privateRecipient = document.getElementById("privateRecipient");
//   if (privateRecipient) {
//     privateRecipient.textContent = recipient;
//   } else {
//     console.error("Element with ID 'privateRecipient' not found.");
//   }
// }
// // Initial view setup
// showView("registerContainer");
const socket = io();
let userId = "";
let username = "";
let currentRecipient = null;

// Function to switch between registration, login, chat, and private chat views
function showView(viewId) {
  hideAllViews();
  const viewElement = document.getElementById(viewId);
  if (viewElement) {
    viewElement.style.display = "block";
  } else {
    console.error(`Element with ID ${viewId} not found.`);
  }
}

// Helper function to hide all views
function hideAllViews() {
  const views = [
    "registerContainer",
    "loginContainer",
    "chatContainer",
    "privateChatContainer",
  ];
  views.forEach((viewId) => {
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
      viewElement.style.display = "none";
    }
  });
}

// Function to update user status (online/offline)
function updateUserStatus(username, status) {
  const onlineUsersList = document.getElementById("onlineUsersList");
  if (onlineUsersList) {
    const userItems = onlineUsersList.getElementsByTagName("li");
    for (let i = 0; i < userItems.length; i++) {
      const userItem = userItems[i];
      if (userItem.textContent.startsWith(username)) {
        userItem.textContent = `${username} (${status})`;
        break;
      }
    }
  }
}

// Event listener for registration form submission
document.getElementById("registerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const userid = document.getElementById("regUserId").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  registerUser(userid, username, password);
});

// Event listener for login form submission
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const usernameInput = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  loginUser(usernameInput, password);
});

// Function to register a new user
function registerUser(userid, username, password) {
  fetch("http://localhost:2123/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userid, username, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Registration failed.");
      }
      alert("Registration successful. Please log in.");
      showView("loginContainer");
    })
    .catch((error) => {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again.");
    });
}

// Function to log in an existing user
function loginUser(usernameInput, password) {
  fetch("http://localhost:2123/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: usernameInput, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.userid) {
        throw new Error("Login failed.");
      }
      userId = data.userid;
      username = usernameInput;
      showView("chatContainer");
      initializeChat();
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      alert("Login failed. Please check your username and password.");
    });
}

// Function to initialize chat and load users
function initializeChat() {
  fetch("http://localhost:2123/users")
    .then((response) => response.json())
    .then((users) => {
      const onlineUsersList = document.getElementById("onlineUsersList");
      if (onlineUsersList) {
        onlineUsersList.innerHTML = "";
        users.forEach((user) => {
          const userItem = document.createElement("li");
          if (user.username === username) {
            userItem.textContent = `${user.username} (You)`;
          } else if (user.status === "online") {
            userItem.textContent = `${user.username} (Online)`;
          } else {
            const lastSeenTime = new Date(user.last_seen).getTime();
            const currentTime = new Date().getTime();
            const offlineDuration = currentTime - lastSeenTime;

            if (isNaN(offlineDuration)) {
              userItem.textContent = `${user.username} (Offline)`;
            } else {
              const hours = Math.floor(offlineDuration / (60 * 60 * 1000));
              const minutes = Math.floor(
                (offlineDuration % (60 * 60 * 1000)) / (60 * 1000)
              );
              userItem.textContent = `${user.username} (Offline for ${hours}h ${minutes}m)`;
            }
          }

          if (user.status === "online" && user.username !== username) {
            userItem.addEventListener("click", () => {
              currentRecipient = user.username;
              openPrivateChat(user.username);
            });
          }
          onlineUsersList.appendChild(userItem);
        });
      } else {
        console.error("Element with ID 'onlineUsersList' not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });

  const allMessages = document.getElementById("messages");

  function appendMessage(messageData, isPrivate = false) {
    const div = document.createElement("div");
    div.className = messageData.user === username ? "sent" : "received";
    const p = document.createElement("p");
    p.textContent = `${messageData.user}: ${messageData.message}`;

    const timeSpan = document.createElement("span");
    timeSpan.className = "timestamp";
    timeSpan.innerText = messageData.timestamp;
    p.appendChild(timeSpan);
    div.appendChild(p);

    if (isPrivate) {
      const privateMessages = document.getElementById("privateMessages");
      if (privateMessages) {
        privateMessages.appendChild(div);
        privateMessages.scrollTop = privateMessages.scrollHeight;
      } else {
        console.error("Element with ID 'privateMessages' not found.");
      }
    } else {
      if (allMessages) {
        allMessages.appendChild(div);
        allMessages.scrollTop = allMessages.scrollHeight;
      } else {
        console.error("Element with ID 'messages' not found.");
      }
    }
  }

  function sendPrivateMessage() {
    const messageInput = document.getElementById("privateMessageInput");
    const message = messageInput.value.trim();
    if (message && currentRecipient) {
      const messageData = {
        user: username,
        message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      appendMessage(messageData, true);
      socket.emit("private-message", { to: currentRecipient, messageData });
      messageInput.value = "";
    }
  }

  // Event listener for private message form submission
  const privateMessageForm = document.getElementById("privateMessageForm");
  if (privateMessageForm) {
    privateMessageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      sendPrivateMessage();
    });
  } else {
    console.error("Element with ID 'privateMessageForm' not found.");
  }

  // Event listener for message form submission
  const messageForm = document.getElementById("messageForm");
  if (messageForm) {
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const messageInput = document.getElementById("messageInput");
      const message = messageInput.value.trim();
      if (message) {
        const messageData = {
          user: username,
          message,
          timestamp: new Date().toLocaleTimeString(),
        };
        appendMessage(messageData);
        socket.emit("broadcast-message", messageData);
        messageInput.value = "";
      }
    });
  } else {
    console.error("Element with ID 'messageForm' not found.");
  }

  // Listen for private messages
  socket.on("private-message", (messageData) => {
    if (
      messageData.user === currentRecipient ||
      messageData.user === username
    ) {
      appendMessage(messageData, true);
    }
    console.log("Private message received:", messageData);
  });

  socket.on("user-status-change", ({ username, status, disconnectTime }) => {
    const onlineUsersList = document.getElementById("onlineUsersList");
    if (onlineUsersList) {
      // Update user status and offline duration
      const userItems = onlineUsersList.getElementsByTagName("li");
      for (let i = 0; i < userItems.length; i++) {
        const userItem = userItems[i];
        if (userItem.textContent.startsWith(username)) {
          if (status === "offline") {
            const lastSeenTime = new Date(disconnectTime).getTime();
            const currentTime = new Date().getTime();
            const offlineDuration = currentTime - lastSeenTime;

            if (isNaN(offlineDuration)) {
              userItem.textContent = `${username} (Offline)`;
            } else {
              const hours = Math.floor(offlineDuration / (60 * 60 * 1000));
              const minutes = Math.floor(
                (offlineDuration % (60 * 60 * 1000)) / (60 * 1000)
              );
              userItem.textContent = `${username} (Offline for ${hours}h ${minutes}m)`;
            }
          } else {
            userItem.textContent = `${username} (Online)`;
          }
          break;
        }
      }
    }
  });

  // Join the chat room and notify the server
  socket.emit("joinRoom", { userId, username });
}

// Function to open a private chat view
function openPrivateChat(recipient) {
  showView("privateChatContainer");
  const privateRecipient = document.getElementById("privateRecipient");
  if (privateRecipient) {
    privateRecipient.textContent = recipient;
  } else {
    console.error("Element with ID 'privateRecipient' not found.");
  }
}

// Initial view setup
showView("registerContainer");
