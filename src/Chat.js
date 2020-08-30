import React from 'react';
import './Chat.css';
import socketIOClient from 'socket.io-client';


function chatMessage(message, key) {
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
    </div>);
}

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: socketIOClient('http://localhost:9667'),
      user: '',
      room: 0,
      messages: []
    };

    this.state.socket.on('loginUser', roomId => {
      this.setState({ room: roomId });
      console.log(
        `User ${this.state.user} logged into room ${this.state.room}`
      );
    });

    this.state.socket.on('sendMessage', message => {
      this.state.messages.push(message);
      this.setState({ messages: this.state.messages });
    });

    this.loginUser = this.loginUser.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  loginUser(e) {
    if (e.target.user.value) {
      this.state.socket.emit('loginUser', e.target.user.value);
      this.setState({ user: e.target.user.value });
    }
    e.preventDefault();
  }

  sendMessage(e) {
    if (e.target.message.value) {
      this.state.socket.emit('sendMessage', e.target.message.value);
      e.target.message.value = '';
    }
    e.preventDefault();
  }

  componentDidUpdate() {
    // Scroll down.
  }

  render() {
    return (this.state.room === 0 ?

      <div className="Chat-login">
        <form className="Chat-userlogin" onSubmit={this.loginUser}>
          <input type="text" name="user" />
          <input type="submit" value="Login" />
        </form>
      </div>
      :
      <div className="Chat">
        <ul className="Chat-users">
          <li>Слон</li>
          <li>Помидор</li>
          <li>Master</li>
          <li>Test user 4</li>
          <li>Dead|Ok</li>
        </ul>
        <div className="Chat-right">
          <div className="Chat-messages">
            {this.state.messages.map((e, i) => chatMessage(e, i))}
          </div>
          <form className="Chat-input" onSubmit={this.sendMessage}>
            <input name="message" /><button>Send</button>
          </form>
        </div>
      </div>

    );
  }
}

export default Chat;
