import React, { Component, PropTypes } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Account from '@graphite/account';

export class LoginPassword extends Component {
  static propTypes = {
    mutate: PropTypes.func,
    emailInputPlaceholder: PropTypes.string,
    passwordInputPlaceholder: PropTypes.string,
    buttonSubmitText: PropTypes.string,
    legendtext: PropTypes.string,
  }

  static defaultProps = {
    emailInputPlaceholder: 'Please, enter your email',
    passwordInputPlaceholder: 'Please, enter your password',
    buttonSubmitText: 'Login',
    legendtext: 'Login',
  }

  constructor() {
    super();

    const loginToken = localStorage.getItem('Graphite.loginToken');
    const loginTokenExpires = localStorage.getItem('Graphite.loginTokenExpires');
    const userId = localStorage.getItem('Graphite.userId');
    const isLoggedIn = !!userId;

    this.state = {
      url: '',
      isLoggedIn,
      loginToken,
      loginTokenExpires,
      userId,
    };

    window.addEventListener('loggedIn', this.loggedIn.bind(this), false);
    window.addEventListener('logout', this.logout.bind(this), false);
  }

  async onSubmit(event) {
    try {
      event.preventDefault();
      const { emailInput, passwordInput } = this.refs;
      const email = emailInput.value;
      const password = passwordInput.value;
      const { data } = await this.props.mutate({ variables: { email, password } });
      if (data.loginPassword) {
        const { loginToken, loginTokenExpires, userId } = data.loginPassword;
        Account.loggedIn(loginToken, loginTokenExpires, userId);
        this.setState({ isLoggedIn: true, loginToken, loginTokenExpires, userId });
      }
    } catch (e) {
      this.logout();
    }
  }

  render() {
    const { emailInputPlaceholder, passwordInputPlaceholder, buttonSubmitText, legendtext } = this.props;
    const { isLoggedIn } = this.state;

    const legend = (
      <legend> {legendtext} </legend>
    );

    const emailInput = (
      <input ref= "emailInput" type= "text" placeholder= {emailInputPlaceholder} />
    );

    const passwordInput = (
      <input ref= "passwordInput" type= "password" placeholder= {passwordInputPlaceholder} />
    );

    const buttonSubmit = (
      <button> {buttonSubmitText} </button>
    );

    const form = isLoggedIn ? null : (
      <form onSubmit={this.onSubmit.bind(this)}>
        <fieldset>
          {legend}
          {emailInput}
          {passwordInput}
          {buttonSubmit}
        </fieldset>
      </form>
    );

    return (
      <div id= "LoginPassword"> {form} </div>
    );
  }

  logout() {
    this.setState({ isLoggedIn: false, loginToken: '', loginTokenExpires: '', userId: '' });
  }

  loggedIn({ detail }) {
    const { loginToken, loginTokenExpires, userId } = detail;
    this.setState({ isLoggedIn: true, loginToken, loginTokenExpires, userId });
  }
}

export default graphql(gql `
  mutation loginPassword($email: String, $password: String) {
    loginPassword(email: $email, password: $password) {
      loginToken
      loginTokenExpires
      userId
    }
  }
`)(LoginPassword);
