import React from 'react';
import './Chat.css';
import socketIOClient from 'socket.io-client';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: socketIOClient('http://localhost:9667')
    };

    this.loginUser = this.loginUser.bind(this);
  }

  loginUser(e) {
    this.state.socket.emit('loginUser', e.target.user.value);
    
    e.preventDefault();
  }

  render() {
    return (
      <div className="Chat">
        <form className="Chat-userlogin" onSubmit={this.loginUser}>
          <input type="text" name="user" />
          <input type="submit" value="Login" />
        </form>
      </div>
    );
  }
}

export default Chat;
