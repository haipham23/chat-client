import React, { Component } from 'react';
import socketCluster from 'socketcluster-client';
import { List } from 'immutable';
import shortid from 'shortid';
import * as ReactDOM from 'react-dom';


import './Chat.css';

const socket = socketCluster.connect({
  hostname: '45.77.253.119',
  port: 8000
});

socket.on('connect', function () {
  console.log('CONNECTED');
});


class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatContent: '',
      client: '',
      target: '',
      messages: List()
    };

    this.onChange = this.onChange.bind(this);
    this.send = this.send.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  send() {
    const { client, target, chatContent } = this.state;

    socket.emit('new_message', {
      from: this.state.client,
      to: this.state.target,
      msg: this.state.chatContent
    });

    this.setState({
      chatContent: ''
    });
  }

  onConnect() {
    const { client, target } = this.state;

    const chatChannel1 = socket.subscribe(`new_message_${client}_${target}`);
    const chatChannel2 = socket.subscribe(`new_message_${target}_${client}`);

    chatChannel1.watch((chat) => {
      this.setState({
        messages: this.state.messages.push({
          username: client,
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

    this.setState({
      isChat: true
    });
  }

  onDisconnect() {
    this.setState({
      isChat: false
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
          <div>
            <input
              name="client"
              placeholder="client username"
              onChange={this.onChange}
              value={this.state.client}
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
