
// document.addEventListener("DOMContentLoaded", () => {
// // Initialize Firebase
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// import {
//   getMessaging,
//   getToken,
//   onMessage,
// } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js";



// const firebaseConfig = {
//   apiKey: "AIzaSyA9KxDiUTiTEa8a4Clz3qB9gCJKlw1ikd4",
//   authDomain: "chat-app-23373.firebaseapp.com",
//   projectId: "chat-app-23373",
//   storageBucket: "chat-app-23373.appspot.com",
//   messagingSenderId: "720635786190",
//   appId: "1:720635786190:web:75d58acc418bb130b1f19f",
//   measurementId: "G-BS5V5G8PZ1",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// Notification.requestPermission()
//   .then((permission) => {
//     if (permission === "granted") {
//       getToken(messaging, {
//         vapidKey:
//           "BBHA7z1NSxlctxRFwW20lSnRAQdYNgrYlMZtwlzdV9Pipdgs3uhRwfeqd4k2Y50YpHI0iuYvtjUch-V_lmiVZAs",
//       })
//         .then((currentToken) => {
//           if (currentToken) {
//             console.log(currentToken);

//             onMessage(messaging, (payload) => {
//               const notificationTitle = payload.notification.title;
//               const notificationOptions = {
//                 body: payload.notification.body,
//                 icon: payload.notification.image,
//               };

//               new Notification(notificationTitle, notificationOptions);
//             });
//           } else {
//             alert("! token not generated ! check permission !");
//           }
//         })
//         .catch((error) => {
//           alert("Token : " + error);
//         });
//     } else {
//       alert("! permission denied !");
//     }
//   })
//   .catch(
//     (error) =>
//       function () {
//         alert("Permission : " + error);
//       }
//   );

// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// messaging
//   .requestPermission()
//   .then(() => {
//     console.log("Notification permission granted.");
//     return messaging.getToken();
//   })
//   .then((token) => {
//     console.log("FCM Token:", token);
//     // Store the token in localStorage
//     localStorage.setItem("fcmToken", token);
//   })
//   .catch((error) => {
//     console.error("Unable to get permission to notify.", error);
//   });

const socket = io();
let userId = "";
let username = "";
let currentRecipient = null;
let privateMessagePage = 1;
const privateMessageLimit = 10;

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
  document.getElementById("registerContainer").style.display = "none";
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("chatContainer").style.display = "none";
  document.getElementById("privateChatContainer").style.display = "none";
}

// Example check for form submission
document.getElementById("registerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const regUserId = document.getElementById("regUserId").value;
  const regUsername = document.getElementById("regUsername").value;
  const regPassword = document.getElementById("regPassword").value;

  if (
    regUserId.trim() === "" ||
    regUsername.trim() === "" ||
    regPassword.trim() === ""
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  // Proceed with form submission
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userid: regUserId,
      username: regUsername,
      password: regPassword,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      alert(data);
    })
    .catch((error) => {
      console.error("Error registering user:", error);
      alert("Error registering user");
    });
});

// Event listener for login form submission
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const loginUsername = document.getElementById("loginUsername").value;
  const loginPassword = document.getElementById("loginPassword").value;
  const fcmToken = localStorage.getItem("fcmToken");
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: loginUsername,
      password: loginPassword,
      fcmToken: fcmToken, // Include the token in the request body
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      userId = data.userid;
      username = data.username;
      document.getElementById("currentUser").textContent = username;
      showView("chatContainer");
      socket.emit("joinRoom", { userId, username });
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      alert("Invalid username or password");
    });
});

// Event listener for sending private messages
document
  .getElementById("privateMessageForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const messageInput = document.getElementById("privateMessageInput").value;
    if (messageInput.trim() === "") {
      return;
    }
    sendPrivateMessage(currentRecipient, messageInput);
    document.getElementById("privateMessageInput").value = "";
  });

// Event listener for back to chat button in private chat view
document.getElementById("backToChatBtn").addEventListener("click", () => {
  showView("chatContainer");
  currentRecipient = null;
  document.getElementById("privateMessages").innerHTML = "";
  privateMessagePage = 1; // Reset pagination to first page
});

// Function to send a private message to another user
function sendPrivateMessage(to, message) {
  const messageData = {
    user: username,
    message,
    timestamp: new Date().toISOString(),
  };
  socket.emit("private-message", { to, messageData });
  displayPrivateMessage(messageData, true);
}

// Function to display a private message
function displayPrivateMessage(messageData, isSender) {
  const privateMessages = document.getElementById("privateMessages");
  const messageElement = createMessageElement(messageData, isSender);
  privateMessages.appendChild(messageElement);
  privateMessages.scrollTop = privateMessages.scrollHeight;
}

function fetchPrivateMessages(recipient, isInitialLoad = false) {
  fetch(
    `/messages?sender=${username}&recipient=${recipient}&page=${privateMessagePage}&limit=${privateMessageLimit}`
  )
    .then((response) => response.json())
    .then((messages) => {
      const privateMessages = document.getElementById("privateMessages");
      const scrollPosition =
        privateMessages.scrollHeight - privateMessages.scrollTop;

      messages.messages.forEach((message) => {
        const messageData = {
          user: message.sender,
          message: message.message,
          timestamp: new Date(message.created_at),
        };

        // If it's the initial load, append messages at the bottom
        if (isInitialLoad) {
          displayPrivateMessage(messageData, message.sender === username);
        } else {
          // Otherwise, prepend messages at the top
          const messageElement = createMessageElement(
            messageData,
            message.sender === username
          );
          privateMessages.insertBefore(
            messageElement,
            privateMessages.firstChild
          );
        }
      });

      if (!isInitialLoad) {
        privateMessages.scrollTop =
          privateMessages.scrollHeight - scrollPosition;
      }
    })
    .catch((error) => {
      console.error("Error fetching private messages:", error);
    });
}

// Function to create a message element
function createMessageElement(messageData, isSender) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${isSender ? "sent" : "received"}`;

  // Adjust the timestamp by 4 hours
  const timestamp = new Date(messageData.timestamp);
  timestamp.setHours(timestamp.getHours() + 4);

  const formattedTimestamp = timestamp.toLocaleTimeString();

  messageElement.innerHTML = `
      <div class="message-user">${messageData.user}</div>
      <div class="message-content">${messageData.message}</div>
      <div class="message-timestamp">${formattedTimestamp}</div>
    `;
  return messageElement;
}

// Socket event to receive private message
socket.on("private-message", (messageData) => {
  if (currentRecipient === messageData.user || username === messageData.user) {
    displayPrivateMessage(messageData, false);
  }
});

// Socket event to update online users list
socket.on("update-users", (users) => {
  const onlineUsersList = document.getElementById("onlineUsersList");
  onlineUsersList.innerHTML = "";
  users.forEach((user) => {
    const userElement = document.createElement("li");
    userElement.textContent = `${user.username} (${user.status})`;
    userElement.addEventListener("click", () => {
      if (user.userid !== userId) {
        currentRecipient = user.username;
        document.getElementById(
          "privateChatWith"
        ).textContent = `Chat with ${user.username}`;
        fetchPrivateMessages(user.username);
        showView("privateChatContainer");
      }
    });
    onlineUsersList.appendChild(userElement);
  });
});

// Scroll event listener for loading more messages
document
  .getElementById("privateMessages")
  .addEventListener("scroll", (event) => {
    const privateMessages = document.getElementById("privateMessages");
    if (privateMessages.scrollTop === 0) {
      privateMessagePage++;
      fetchPrivateMessages(currentRecipient);
    }
  });

showView("registerContainer");
