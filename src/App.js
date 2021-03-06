import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Chat from './Chat';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Chat App</h1>
        </header>
        <Chat />
      </div>
    );
  }
}

export default App;
