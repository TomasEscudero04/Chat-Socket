import express from 'express';
import http from 'http';
import {Server as SocketServer} from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', socket => {
    console.log('New client connected: ', socket.id);

    socket.on('register', (username) => {
        const avatarColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        const emojis = ['🐶','🐱','🦁','🐮','🐷','🦊','🐵','🐻','🐸','🐭','🐨','🐰'];
        const avatarEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        users[socket.id] = {
            username,
            avatarColor,
            avatarEmoji
        };
        io.emit('userConnected', {
            username,
            avatarColor,
            avatarEmoji
        });
        console.log(`User registered: ${username}`);
    })
    socket.on('message', (body) => {
        const user = users[socket.id];
        if(!user) return

        //Enviamos el mensaje a todos los clientes incluyendo el que lo envió
        //pero con la informacion de si es propio o no
        io.emit('message', {
            body,
            from: user.username,
            avatarColor: user.avatarColor,
            avatarEmoji: user.avatarEmoji
        });
    });
    socket.on('disconnect', () => {
        if(users[socket.io]){
            io.emit('userDisconnected', users[socket.id].username)
            delete users[socket.id]
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});