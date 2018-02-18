import React, { Component } from 'react';
import socketCluster from 'socketcluster-client';
import { List } from 'immutable';
import * as ReactDOM from 'react-dom';
import axios from 'axios';

import config from './configs/dev';


import './Chat.css';

const socket = socketCluster.connect({
  hostname: config.SOCKET_URL,
  port: config.SOCKET_PORT
});

socket.on('connect', function () {
  console.log('CONNECTED');
});



class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatContent: '',
      username: '',
      password: '',
      target: '',
      token: '',
      isAuthError: false,
      isRegError: false,
      isChat: false,
      messages: List()
    };

    this.onChange = this.onChange.bind(this);
    this.send = this.send.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onRegister = this.onRegister.bind(this);
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  send() {
    const { username, target, chatContent, token } = this.state;

    axios.post(config.QUEUE_URL, {
      from: username,
      to: target,
      text: chatContent
    }, {
      headers: {
        'x-auth-token': `${username} ${token}`
      }
    })
      .then(() => {
        this.setState({
          chatContent: ''
        });
      })
      .catch(() => {
        this.setState({
          chatContent: ''
        });
      });
  }

  onConnect() {
    const { username, password, target } = this.state;

    axios.post(config.AUTH_URL, { username, password })
      .then((response) => {
        if (response.data !== 'SERVER_ERROR') {
          this.setState({
            token: response.data,
            isAuthError: false,
            isChat: true
          });

          const chatChannel1 = socket.subscribe(`new_message_${username}_${target}`);
          const chatChannel2 = socket.subscribe(`new_message_${target}_${username}`);

          chatChannel1.watch((chat) => {
            this.setState({
              messages: this.state.messages.push({
                username,
                msg: chat.msg,
                align: 'right'
              })
            }, () => this.scrollToBottom());
          });

          chatChannel2.watch((chat) => {
            this.setState({
              messages: this.state.messages.push({
                username: target,
                msg: chat.msg,
                align: 'left'
              })
            }, () => this.scrollToBottom());
          });
        } else {
          this.setState({
            token: '',
            isAuthError: true,
            isChat: false
          });
        }
      })
      .catch(() => {
        this.setState({
          token: '',
          isAuthError: true,
          isChat: false
        });
      });
  }

  onDisconnect() {
    this.setState({
      token: '',
      isAuthError: false,
      isChat: false,
      messages: List()
    });
  }

  onRegister() {
    const { rusername, rpassword } = this.state;

    axios
      .post(config.REGISTER_URL, { username: rusername, password: rpassword })
      .then(() => {
        this.setState({
          isRegError: false,
          rusername: '',
          rpassword: ''
        });
      })
      .catch(() => {
        this.setState({
          isRegError: true,
          rusername: '',
          rpassword: ''
        });
      })
  }

  scrollToBottom() {
    const { messageList } = this.refs;
    const scrollHeight = messageList.scrollHeight;
    const height = messageList.clientHeight;
    const maxScrollTop = scrollHeight - height;
    ReactDOM.findDOMNode(messageList).scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  render() {
    return (
      <div className="Chat">
        {
          !this.state.isChat &&
          <div className="Chat-auth">
            <div>
              <h2>
                Login
              </h2>
              <input
                name="username"
                placeholder="username"
                onChange={this.onChange}
                value={this.state.username}
              />
              <input
                name="password"
                type="password"
                placeholder="password"
                onChange={this.onChange}
                value={this.state.password}
              />
              <input
                name="target"
                placeholder="target username"
                onChange={this.onChange}
                value={this.state.target}
              />
              <button
                onClick={this.onConnect}
              >Connect</button>
              <p style={{ color: 'red' }}>{ this.state.isAuthError && 'Auth error' }</p>
            </div>
            <div>
              <h2>
                Register
              </h2>
              <input
                name="rusername"
                placeholder="username"
                onChange={this.onChange}
                value={this.state.rusername}
              />
              <input
                name="rpassword"
                type="password"
                placeholder="password"
                onChange={this.onChange}
                value={this.state.rpassword}
              />
              <button
                onClick={this.onRegister}
              >Register</button>
              <p style={{ color: 'red' }}>{ this.state.isRegError && 'Reg error' }</p>
            </div>
          </div>
        }
        {
          this.state.isChat &&
          <div>
            <div ref="messageList" className="Chat-container">
              <ul>
                {
                  this.state.messages.map((m, idx) => (
                    <li key={`msg__${idx}`} style={{ textAlign: m.align }}>{m.username}: {m.msg}</li>
                  ))
                }
              </ul>
            </div>
            <div>
              <input
                name="chatContent"
                placeholder="message"
                onChange={this.onChange}
                value={this.state.chatContent}
              />
              <button
                onClick={this.send}
              >Send</button>
              <button
                onClick={this.onDisconnect}
              >Disconnect</button>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Chat;
