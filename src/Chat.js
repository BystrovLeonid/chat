import React from 'react';
import './css/Chat.css';
import socketIOClient from 'socket.io-client';


// async function makeCall() {
//   this.state.peerConnection = new RTCPeerConnection({ 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] });

//   this.state.peerConnection.onconnectionstatechange = (event) => {
//     if (this.state.peerConnection.connectionState === 'connected') {
//       console.log("local peer connected");
//     }
//     console.log(this.state.peerConnection.connectionState);
//   };

//   this.state.peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       this.state.socket.emit('message', { 'iceCandidate': event.candidate });
//     }
//     console.log(event);
//   };

//   const offer = await this.state.peerConnection.createOffer();
//   await this.state.peerConnection.setLocalDescription(offer);

//   this.state.socket.emit('message', { offer: offer });

//   console.log(this.state.peerConnection);
// }


class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: socketIOClient(`http://${window.location.hostname}:9667`),
      user: '',
      userId: 0,
      room: 0,
      users: [],
      messages: [],
      online: false, // this.state.socket.connected
      // streaming: false,
      // peerConnection: null
    };

    //
    // this.state.socket.on('message', async data => {

    //   console.log(data);

    //   let index = -1;
    //   for (let i = 0; i < this.state.users.length; i++) {
    //     if (this.state.users[i].id === data.userId) {
    //       index = i;
    //       break;
    //     }
    //   }

    //   if (data.message.offer) {

    //     if (index > -1) {
    //       this.state.users[index].peerConnection = new RTCPeerConnection({ 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] });

    //       this.state.users[index].peerConnection.onconnectionstatechange = (event) => {
    //         if (this.state.users[index].peerConnection.connectionState === 'connected') {
    //           console.log("remote peer connected");
    //         }
    //         console.log(this.state.users[index].peerConnection.connectionState);
    //       };

    //       this.state.users[index].peerConnection.onicecandidate = (event) => {
    //         if (event.candidate) {
    //           this.state.socket.emit('message', { 'iceCandidate': event.candidate });
    //         }
    //         console.log(event);
    //       };

    //       this.state.users[index].peerConnection.setRemoteDescription(new RTCSessionDescription(data.message.offer));
    //       const answer = await this.state.users[index].peerConnection.createAnswer();
    //       await this.state.users[index].peerConnection.setLocalDescription(answer);
    //       this.state.socket.emit('message', { answer: answer });
    //     }

    //     console.log(this.state.users[index].peerConnection);
    //   }

    //   if (data.message.answer) {
    //     const remoteDesc = new RTCSessionDescription(data.message.answer);
    //     await this.state.peerConnection.setRemoteDescription(remoteDesc);
    //   }

    //   if (data.message.iceCandidate) {
    //     if (index > -1) {
    //       try {
    //         await this.state.users[index].peerConnection.addIceCandidate(data.message.iceCandidate);
    //       } catch (e) {
    //         console.error('Error adding received ice candidate', e);
    //       }
    //     }
    //   }
    // });

    // On server authorized user.
    this.state.socket.on('loginUser', data => {
      this.setState({
        room: data.roomId,
        userId: data.userId
      });

      // Add room id to address line after #
      window.location.hash = `room=${data.roomId}`;

      document.title = `${this.state.user} - Chat`;
    });

    // On connect to server.
    this.state.socket.on('connect', () => {
      this.setState({
        online: true,
        users: []
      });

      // If user authorized then just relogin,
      // else focus on login field.
      if (this.state.userId) {
        this.reLoginUser();
      } else {
        this.loginInputField && this.loginInputField.focus();
      }
    });

    this.state.socket.on('disconnect', () => {
      this.setState({ online: false });
    });

    // Receive online users list.
    this.state.socket.on('usersList', usersList => {
      this.setState({ users: usersList });
    });

    // Received message from chat user.
    this.state.socket.on('sendMessage', message => {
      this.state.messages.push(message);
      this.setState({ messages: this.state.messages });
    });

    // Then user joined or leaved chat, update list.
    this.state.socket.on('chatUser', chatUser => {
      chatUser.forEach(u => {
        // Remove from user list.
        // eslint-disable-next-line
        this.state.users = this.state.users.filter(e => e.id !== u.id);
        // If user online then add to user list.
        if (u.online) {
          this.state.users.push(u);
        }
      });

      // Remove doubles, sometimes server sends same chatUser.
      this.setState({ users: [...new Set(this.state.users)] });
    });

    this.loginUser = this.loginUser.bind(this);
    this.reLoginUser = this.reLoginUser.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    // this.startStream = this.startStream.bind(this);
    // this.makeCall = makeCall.bind(this);
  }

  //
  // startStream(e) {

  //   if (!navigator.mediaDevices) {
  //     return;
  //   }

  //   if (this.state.streaming) { // Stop streaming.

  //     document.getElementById(this.state.userId).srcObject.getTracks().forEach(
  //       track => track.stop()
  //     );

  //     this.state.socket.emit(
  //       'stream', {
  //       id: this.state.userId,
  //       streaming: false
  //     });

  //     this.setState({ streaming: false });
  //   } else { // Start streaming.
  //     this.setState({ streaming: true });

  //     setTimeout(() => {

  //       navigator.mediaDevices.getUserMedia({
  //         'video': true,
  //         'audio': true
  //       }).then(stream => {
  //         const videoElement = document.getElementById(this.state.userId);
  //         videoElement.srcObject = stream;

  //         this.state.socket.emit(
  //           'stream', {
  //           id: this.state.userId,
  //           streaming: true
  //         });
  //       }).catch(error => {
  //         console.error('Error opening video camera.', error);
  //         this.setState({ streaming: false });
  //       });

  //       this.makeCall();
  //     }, 100);
  //   }
  // }

  // Users, left side.
  chatUsers(user) {

    if (!user.name) {
      return;
    }

    let userClasses = 'Chat-user';
    // let videoClasses = 'Chat-user-camera';
    let id = user.id;
    let me = this.state.userId === id;
    // let streaming = me ? this.state.streaming : user.streaming;

    // Streaming now.
    // if (this.state.streaming) {
    //   videoClasses += ' Chat-user-camera-no-video';
    // }

    // If it's me.
    if (me) {
      userClasses += ' Chat-user-me';
    }

    return (
      <div className={userClasses} key={user.id}>
        <div className="Chat-user-name">
          <span>{user.name}</span>
          {/* {me && <button className={videoClasses} onClick={this.startStream}></button>} */}
        </div>
        {/* {streaming && <video className="Chat-user-video" id={id} autoPlay playsInline />} */}
      </div>
    );
  }

  //
  chatMessage(message, key) {
    let classes = 'Chat-message';

    // If this is my message.
    if (message.local) {
      classes += ' Chat-message-my';
    }

    return (
      <div key={key} className={classes}>
        <div className="Chat-message-author">
          {message.author}
        </div>
        <div className="Chat-message-text">
          {message.text}
        </div>
        <div className="Chat-message-datetime">
          {message.datetime}
        </div>
      </div>
    );
  }

  // Shows this message then socket server offline.
  offlineMessage(t) {
    return (
      <span className="Chat-offline-message">{t}</span>
    );
  }


  loginUser(e) {
    if (e.target.user.value.trim()) {

      // Get chat room id from address line.
      let h = window.location.hash;
      let room = 0;
      if (h.indexOf('room=') > -1) {
        h = h.substr(1, h.length).split('&');

        for (let i = 0; i < h.length; i++) {
          let p = h[i].split('=');

          if (p.length === 2 && p[0] === 'room') {
            room = p[1];
            break;
          }
        }

      }

      // Send user and desired room to server.
      this.state.socket.emit(
        'loginUser', {
        name: e.target.user.value.trim(),
        room: room
      });

      this.setState({
        user: e.target.user.value.trim()
      });
    }
    e.preventDefault();
  }

  reLoginUser() {
    this.state.socket.emit(
      'loginUser', {
      name: this.state.user,
      room: this.state.room
    });
  }

  // Send message to server.
  sendMessage(e) {
    if (e.target.message.value.trim()) {

      this.state.socket.emit(
        'sendMessage',
        e.target.message.value.trim()
      );

      e.target.message.value = '';
    }
    e.preventDefault();
  }

  componentDidMount() {
    document.title = 'Chat';
    this.loginInputField && this.loginInputField.focus();
  }

  componentDidUpdate() {
    this.bottomScrollLine && this.bottomScrollLine.scrollIntoView({ behavior: 'smooth' });
    this.messageInputField && this.messageInputField.focus();
  }

  render() {
    return (this.state.room === 0 ?

      <div className="Chat-login">
        {
          this.state.online
            ?
            <form className="Chat-userlogin" onSubmit={this.loginUser}>
              <input type="text" name="user" maxLength="8" ref={(l) => { this.loginInputField = l; }} />
              <input type="submit" value="Login" />
            </form>
            :
            <div>{this.offlineMessage('Connecting...')}</div>
        }
      </div>
      :
      <div className="Chat">
        <div className="Chat-users">
          {
            this.state.users
              .sort((a, b) => a.name > b.name ? 1 : -1)
              .map((e) => this.chatUsers(e))
          }
        </div>
        <div className="Chat-right">
          <div className="Chat-messages">
            {this.state.messages.map((e, i) => this.chatMessage(e, i))}
          </div>
          <div ref={(b) => { this.bottomScrollLine = b; }}></div>
          {
            this.state.online
              ?
              <form className="Chat-input" onSubmit={this.sendMessage}>
                <input type="text" name="message" ref={(m) => { this.messageInputField = m; }} />
                <button>Send</button>
              </form>
              :
              <div className="Chat-offline">{this.offlineMessage('Server temporary offline...')}</div>
          }
        </div>
      </div>

    );
  }
}

export default Chat;
