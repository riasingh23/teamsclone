const express = require('express');
const http = require('http');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4}=require('uuid')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const { join } = require("path");
const path = require('path');
app.use(express.static(path.join(__dirname,'/public')));
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'))

app.use('/peerjs', peerServer);

app.get('/thankyou', (
  req, res) => {
  res.render("thankyou");
})
  app.get('/', (
    req, res) => {
      res.redirect(`/${uuidV4()}`)
        })
  app.get('/:room', (req, res) => {
    res.render('room', { roomId2:req.params.room})
  })
  
  io.on('connection', socket => {
    socket.on('join-room', (roomId,userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected',userId);

      // messages
      socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
      });
        
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
      })
    })
  }); 
  
  server.listen(process.env.PORT||3030);
