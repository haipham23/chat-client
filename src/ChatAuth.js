import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class ChatAuth extends PureComponent {
  render() {
    if (!this.props.isDisplay) {
      return null;
    }

    return (
      <div className="row Chat-auth">
        <div className="col-xs-12 col-md-6 Chat-login">
          <h2>
            Login
          </h2>
          <div className="form-group">
            <input
              name="username"
              placeholder="username"
              className="form-control"
              onChange={this.props.onChange}
              value={this.props.username}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="password"
              className="form-control"
              onChange={this.props.onChange}
              value={this.props.password}
              autoComplete="off"
            />
          </div>
          {
            this.props.isAuthError &&
            <small className="form-text text-danger">Login Error</small>
          }
          <div className="text-right">
            <button
              className="btn btn-primary"
              onClick={this.props.onLogin}
            >
              Login
            </button>
          </div>
        </div>
        <div className="col-xs-12 col-md-6 Chat-register">
          <h2>
            Register
          </h2>
          <div className="form-group">
            <input
              name="rUsername"
              placeholder="Username"
              className="form-control"
              onChange={this.props.onChange}
              value={this.props.rUsername}
            />
          </div>
          <div className="form-group">
            <input
              name="rPassword"
              type="password"
              placeholder="password"
              className="form-control"
              onChange={this.props.onChange}
              value={this.props.rPassword}
            />
          </div>
          {
            this.props.isRegError &&
            <small className="form-text text-danger">Register Error</small>
          }
          <div className="text-right">
            <button
              className="btn btn-info"
              onClick={this.props.onRegister}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }
}

ChatAuth.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,

  rUsername: PropTypes.string.isRequired,
  rPassword: PropTypes.string.isRequired,

  isDisplay: PropTypes.bool.isRequired,
  isAuthError: PropTypes.bool,
  isRegError: PropTypes.bool,

  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ChatAuth;