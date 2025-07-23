import express from 'express';
import http from 'http';
import {Server as SocketServer} from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

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

console.log('Server listening on: http://localhost:3000');

server.listen(3000);