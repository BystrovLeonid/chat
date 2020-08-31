import React from 'react';
import './Chat.css';
import socketIOClient from 'socket.io-client';

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
      online: false // this.state.socket.connected // Lies!?
    };

    this.state.socket.on('loginUser', data => {
      this.setState({ room: data.roomId, userId: data.userId });
      window.location.hash = `room=${data.roomId}`;
      document.title = `Chat ${this.state.user}`;
      console.log(
        `User ${this.state.user} (id is ${this.state.userId}) logged into room ${this.state.room}`
      );
    });

    this.state.socket.on('connect', () => {
      this.setState({ online: true, users: []});
      this.state.userId && this.reLoginUser();
    });

    this.state.socket.on('disconnect', () => {
      this.setState({ online: false });
    });

    this.state.socket.on('usersList', usersList => {
      this.setState({ users: usersList });
    });

    this.state.socket.on('sendMessage', message => {
      this.state.messages.push(message);
      this.setState({ messages: this.state.messages });
    });

    this.state.socket.on('chatUser', chatUser => {
      console.log(chatUser);
      for (let i = chatUser.length - 1; i >= 0; i--) {
        if (chatUser[i].online) {
          this.state.users.push(chatUser[i]);
        } else {
          for (let j = this.state.users.length - 1; j >= 0; j--) {
            if (chatUser[i].id === this.state.users[j].id) {
              this.state.users.splice(j, 1);
            }
          }
        }
      }
      this.setState({ users: this.state.users });
    });

    this.loginUser = this.loginUser.bind(this);
    this.reLoginUser = this.reLoginUser.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }


  chatUsers(user) {
    return (
      this.state.userId === user.id
      ?
      <li className="Chat-users-me" key={user.id}>{user.name}</li>
      :
      <li key={user.id}>{user.name}</li>
      );
  }

  chatMessage(message, key) {
    let classes = 'Chat-message';
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

  offlineMessage(t) {
    return (
      <span className="Chat-offline-message">{t}</span>
    );
  }

  loginUser(e) {
    if (e.target.user.value.trim()) {
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

      this.state.socket.emit('loginUser', { name: e.target.user.value.trim(), room: room });
      this.setState({ user: e.target.user.value.trim() });
    }
    e.preventDefault();
  }
  reLoginUser() {
    this.state.socket.emit('loginUser', { name: this.state.user, room: this.state.room });
  }

  sendMessage(e) {
    if (e.target.message.value.trim()) {
      this.state.socket.emit('sendMessage', e.target.message.value.trim());
      e.target.message.value = '';
    }
    e.preventDefault();
  }

  componentDidMount() {
    document.title = 'Chat';
    this.l && this.l.focus();
  }

  componentDidUpdate() {
    this.b && this.b.scrollIntoView({ behavior: 'smooth' });
    this.m && this.m.focus();
  }

  render() {
    return (this.state.room === 0 ?

      <div className="Chat-login">
        {
          this.state.online
            ?
            <form className="Chat-userlogin" onSubmit={this.loginUser}>
              <input type="text" name="user" ref={(l) => { this.l = l; }} />
              <input type="submit" value="Login" />
            </form>
            :
            <div>{this.offlineMessage('Connecting...')}</div>
        }
      </div>
      :
      <div className="Chat">
        <ul className="Chat-users">
          {
            this.state.users
              .sort((a, b) => a.name > b.name ? 1 : -1)
              .map((e) => this.chatUsers(e))
          }
        </ul>
        <div className="Chat-right">
          <div className="Chat-messages">
            {this.state.messages.map((e, i) => this.chatMessage(e, i))}
          </div>
          <div ref={(b) => { this.b = b; }}></div>
          {
            this.state.online
              ?
              <form className="Chat-input" onSubmit={this.sendMessage}>
                <input type="text" name="message" ref={(m) => { this.m = m; }} />
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
