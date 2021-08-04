const socket=io('/')

const videocontainer = document.getElementById('video-grid');
const myvideo=document.createElement('video');
myvideo.muted=true;

var peer = new Peer(undefined,{
  path:'/peerjs',
  host:'/',
  port:'443'
}); 

let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myvideo, stream);

  peer.on('call',call=>{
    call.answer(stream);
    const video=document.createElement('video');
    call.on('stream', userVideoStream=>{
        addVideoStream(video,userVideoStream)
    })
  })

  socket.on('user-connected' , (userId)=>{
    setTimeout(connectingNewUser,1000,userId,stream)
  })
})


peer.on('open',id=>{
  socket.emit('join-room',ROOM_ID,id);
})

const connectingNewUser = (userId,stream) =>{
  const call = peer.call(userId,stream)
  const video=document.createElement('video');
  call.on('stream', userVideoStream =>{
    addVideoStream(video, userVideoStream);
  }); 
}

//this fuction appends the video to video-grid
const addVideoStream =(video, stream)=>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videocontainer.append(video);
  }






// CHAT IMPLEMENTATION

//taking chat input
let text = $("#chat_message");
$('html').keydown((e)=>{
  if (e.which == 13 && text.val().length !== 0) {
    let newmsg={
      name:User,
      msg: text.val()
    }
    socket.emit('message',newmsg);
    text.val('');
  }
});

//this function appends the received message on our ejs page
socket.on('createMessage',(message)=>{
  $('ul').append(`<li class="message"><b><i class="fa fa-fw fa-user-circle"></i>${message.name}</b><br>${message.msg}</li>`);
});

//User is the variable store our personal name
let User="User";//this is the default name to the user
let user = $("#user");
//here we are updating the user name if the user provide its name in input session
$('html').keydown((e)=>{
  if (e.which == 13 && user.val().length !== 0) {
    console.log(user.val());
    User=user.val()
    document. getElementById("user").remove();
  }
});






//MUTE IMPLEMENTATION
//this is a toogle button which mutes and unmutes the video stream provided by individual user
const muteUnmute = () => {
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  console.log(enabled);
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } 
  else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

//the below two function change the icon and the inner text of the button when toggled

const setMuteButton = () => {
  const html = `
    <i class="fa fa-fw fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('#main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="fa fa-fw fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('#main__mute_button').innerHTML = html;
}




//Stop Video IMPLEMENTATION
//this is a toogle button which play and stop the video provided by individual user
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

//the below two function change the icon and the inner text of the button when toggled

const setStopVideo = () => {
  const html = `
    <i class="fa fa-fw fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('#main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="fa fa-fw fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('#main__video_button').innerHTML = html;
}




//To continue chating after the call is dropped

$(document).ready(function(){
  $("#endcall").click(function(){
    myVideoStream.getVideoTracks()[0].stop();
    $("video").remove();
    //document.querySelector('#endcall').innerHTML = html;
    $("#endcall").remove();
    $("#main__mute_button").remove();
    $("#main__video_button").remove();
  });
});


document.getElementById('leave_meeting').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = 'thankyou';
  } else {
  }
});
