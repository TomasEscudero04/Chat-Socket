import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [avatarColor, setAvatarColor] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("");

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      const tempColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const emojis = [
        "🐶",
        "🐱",
        "🦁",
        "🐮",
        "🐷",
        "🦊",
        "🐵",
        "🐻",
        "🐸",
        "🐭",
        "🐨",
        "🐰",
      ];
      const tempEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      setAvatarColor(tempColor);
      setAvatarEmoji(tempEmoji);
      socket.emit("register", username);
      setShowUsernameModal(false);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  useEffect(() => {
    const receiveMessage = (message) => {
      setMessages((state) => [...state, message]);
    };

    const handleUserConnected = (user) => {
      setOnlineUsers((prev) => [...prev, user]);
    };

    const handleUserDisconnected = (disconnectedUsername) => {
      setOnlineUsers((prev) =>
        prev.filter((user) => user.username !== disconnectedUsername)
      );
    };

    socket.on("message", receiveMessage);
    socket.on("userConnected", handleUserConnected);
    socket.on("userDisconnected", handleUserDisconnected);

    return () => {
      socket.off("message", receiveMessage);
      socket.off("userConnected", handleUserConnected);
      socket.off("userDisconnected", handleUserDisconnected);
    };
  }, []);

  return (
    <div className="h-screen bg-zinc-800 text-white flex items-center justify-center">
      {showUsernameModal ? (
        <div className="bg-zinc-900 p-10 rounded-lg">
          <h1 className="text-2xl font-bold mb-5 text-center">
            Bienvenidos al chat en tiempo real con WebSockets
          </h1>
          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-zinc-500 p-2 rounded-2xl text-white"
              required
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 py-2 px-4 rounded-lg"
            >
              Unirse al chat
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full max-w-4xl">
          <div className="bg-zinc-900 p-4 rounded-t-lg">
            <h1>Socket Chat ✅</h1>
            <div className="flex gap-2 flex-wrap">
              {onlineUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full"
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {user.avatarEmoji}
                  </span>
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-zinc-700 p-4 overflow-y-auto">
            <ul className="space-y-3">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`flex ${
                    msg.from === username ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-xs ${
                      msg.from === username ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0`}
                      style={{ backgroundColor: msg.avatarColor }}
                    >
                      {msg.avatarEmoji}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.from === username ? "bg-sky-600" : "bg-zinc-600"
                      }`}
                    >
                      {msg.from !== username && (
                        <div className="font-bold text-xs mb-1">{msg.from}</div>
                      )}
                      <div>{msg.body}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <form
            onSubmit={handleMessageSubmit}
            className="bg-zinc-900 p-4 rounded-b-lg"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-2 border-zinc-500 p-2 rounded-2xl text-white"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 py-2 px-6 rounded-lg"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
