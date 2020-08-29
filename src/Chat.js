import React from 'react';
import logo from './logo.svg';
import './Chat.css';

function Chat() {
  return (
    <div className="Chat">
      <header className="Chat-header">
        <img src={logo} className="Chat-logo" alt="logo" />
        <p>
          Edit <code>src/Chat.js</code> and save to reload.
        </p>
        <a
          className="Chat-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default Chat;
