import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import classname from 'classname';

class ChatContact extends PureComponent {
  constructor(props) {
    super(props);

    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  scrollToBottom() {
    const { messageList } = this.refs;
    const scrollHeight = messageList.scrollHeight;
    const height = messageList.clientHeight;
    const maxScrollTop = scrollHeight - height;
    ReactDOM.findDOMNode(messageList).scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  render() {
    if (!this.props.isDisplay) {
      return null;
    }

    return (
      <div className="row">
        <div className="hidden-xs col-md-3 Chat-contact">
          <ul className="list-group">
            {
              this.props.contacts.map((c, idx) => {
                const className = classname({
                  'list-group-item': true,
                  'active': this.props.contact === c.contact
                });

                return (
                  <button
                    className={className}
                    key={`contact-${idx}`}
                    onClick={() => this.props.onConnect(c.contact)}
                  >
                    { c.contact }
                  </button>
                );
              })
            }
          </ul>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Add new friend"
              name="newContact"
              value={this.props.newContact}
              onChange={this.props.onChange}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={this.props.onAddContact}
              >
                Add
              </button>
            </div>
          </div>
          {
            this.props.isAddContactError &&
            <small className="form-text text-danger">Error</small>
          }
          <div style={{ marginTop: '40px' }}>
            <button
              className="btn btn-danger btn-block"
              onClick={this.props.onDisconnect}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="col-xs-12 col-md-9">
          <div ref="messageList" className="Chat-container">
            <ul>
              {
                this.props.messages.map((m, idx) => (
                  <li key={`msg__${idx}`} style={{ textAlign: m.align }}>{m.username}: {m.msg}</li>
                ))
              }
            </ul>
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              name="chatContent"
              placeholder="..."
              onChange={this.props.onChange}
              value={this.props.chatContent}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={() => {
                  this.props.send();
                  setTimeout(() => this.scrollToBottom(), 500);
                }}
                disabled={this.props.contact === ''}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ChatContact.propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.shape({
    contact: PropTypes.string
  })).isRequired,
  messages: PropTypes.arrayOf(PropTypes.shape({
    username: PropTypes.string,
    msg: PropTypes.string,
    align: PropTypes.string
  })).isRequired,

  contact: PropTypes.string.isRequired,
  newContact: PropTypes.string.isRequired,
  chatContent: PropTypes.string.isRequired,

  isDisplay: PropTypes.bool.isRequired,
  isAddContactError: PropTypes.bool,

  onAddContact: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  send: PropTypes.func.isRequired
};

export default ChatContact;