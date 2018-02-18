import React, { Component } from 'react';
import socketCluster from 'socketcluster-client';
import { List } from 'immutable';
import axios from 'axios';

import config from './configs/dev';

import ChatAuth from './ChatAuth';
import ChatContact from './ChatContact';


import './Chat.css';

const socket = socketCluster.connect({
  hostname: config.SOCKET_URL,
  port: config.SOCKET_PORT
});

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatContent: '',
      username: '',
      password: '',
      rUsername: '',
      rPassword: '',
      newContact: '',
      contact: '',
      token: '',
      isAuthError: false,
      isRegError: false,
      isAddContactError: false,
      isChat: false,
      messages: List(),
      contacts: List()
    };

    this.onChange = this.onChange.bind(this);
    this.send = this.send.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onRegister = this.onRegister.bind(this);
    this.onAddContact = this.onAddContact.bind(this);
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  send() {
    const { username, contact, chatContent, token } = this.state;

    axios.post(config.QUEUE_URL, {
      from: username,
      to: contact,
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

  onConnect(target) {
    const { username } = this.state;

    this.setState({
      contact: target,
      messages: List()
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
      });
    });

    chatChannel2.watch((chat) => {
      this.setState({
        messages: this.state.messages.push({
          username: target,
          msg: chat.msg,
          align: 'left'
        })
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

  onLogin() {
    const { username, password } = this.state;

    axios.post(config.AUTH_URL, { username, password })
      .then((response) => {
        if (response.data === 'SERVER_ERROR') {
          return Promise.reject(new Error('LOGIN_FAILED'));
        }

        this.setState({
          token: response.data
        });

        return axios.get(config.CONTACT_URL, {
          headers: {
            'x-auth-token': `${username} ${response.data}`
          }
        });
      })
      .then((response) => {
        this.setState({
          contacts: List(response.data),
          isAuthError: false,
          isChat: true
        });
      })
      .catch((e) => {
        this.setState({
          token: '',
          isAuthError: true,
          isChat: false
        });
      });
  }

  onRegister() {
    const { rUsername, rPassword } = this.state;

    axios
      .post(config.REGISTER_URL, { username: rUsername, password: rPassword })
      .then(() => {
        this.setState({
          isRegError: false,
          rUsername: '',
          rPassword: ''
        });
      })
      .catch(() => {
        this.setState({
          isRegError: true,
          rUsername: '',
          rPassword: ''
        });
      })
  }

  onAddContact() {
    const { username, token, newContact } = this.state;

    axios
      .post(
        config.CONTACT_URL,
        { contact: newContact },
        {
          headers: {
            'x-auth-token': `${username} ${token}`
          }
        }
      )
      .then(() => {
        this.setState({
          isAddContactError: false,
          newContact: '',
          contacts: this.state.contacts.push({
            contact: newContact
          })
        });
      })
      .catch((error) => {
        this.setState({
          isAddContactError: true,
          newContact: ''
        });
      });
  }

  render() {
    return (
      <div className="container Chat">
        <ChatAuth
          isDisplay={!this.state.isChat}
          username={this.state.username}
          password={this.state.password}
          rUsername={this.state.rUsername}
          rPassword={this.state.rPassword}
          isAuthError={this.state.isAuthError}
          isRegError={this.state.isRegError}
          onLogin={this.onLogin}
          onRegister={this.onRegister}
          onChange={this.onChange}
        />
        <ChatContact
          isDisplay={this.state.isChat}
          contacts={this.state.contacts.toArray()}
          messages={this.state.messages.toArray()}
          contact={this.state.contact}
          newContact={this.state.newContact}
          chatContent={this.state.chatContent}
          isAddContactError={this.state.isAddContactError}
          onAddContact={this.onAddContact}
          onChange={this.onChange}
          onConnect={this.onConnect}
          onDisconnect={this.onDisconnect}
          send={this.send}
        />
      </div>
    );
  }
}

export default Chat;
