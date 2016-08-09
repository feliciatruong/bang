import React, { Component, PropTypes } from 'react';
import * as firebase from 'firebase';
import { Button, FormGroup, FormControl } from 'react-bootstrap';
import MessageList from './messages.js';

export default class GamePage extends Component {

  static contextTypes = {
    store: PropTypes.object,
  }

  static propTypes = {
    loggedIn: PropTypes.bool,
    params: PropTypes.object,
    username: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      auth: firebase.auth(),
      database: firebase.database(),
      loggedIn: false,
      message: '',
      messages: [],
      username: '',
    };
  }


  componentDidMount() {
    const { store } = this.context;
    console.log(store.getState());
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      loggedIn: nextProps.loggedIn,
    });
  }

  handleChange = (event) => {
    event.preventDefault();
    this.setState({ message: event.target.value });
  }

  saveMessage = (event) => {
    event.preventDefault();
    const { database, loggedIn, message, username } = this.state;
    const { params } = this.props;
    if (message && loggedIn) {
      // Add a new message entry to the Firebase Database.
      database.ref(params.rid).push({
        name: username,
        text: message,
      }).then(() => {
        this.setState({ message: '' });
      });
    }
  }

  loadMessages() {
    const { database, messages } = this.state;
    const { params } = this.props;
    const messagesRef = database.ref(params.rid);
    messagesRef.off();
    messagesRef.limitToLast(12).on('child_added', (data) => {
      const val = data.val();
      messages.push({ key: data.key, name: val.name, text: val.text });
      this.setState({ messages });
    });
    messagesRef.limitToLast(12).on('child_changed', (data) => {
      const val = data.val();
      messages.push({ key: data.key, name: val.name, text: val.text });
      this.setState({ messages });
    });
  }

  render() {
    const { message, messages } = this.state;
    return (
      <div>
        <h3>Game Page</h3>
        <div>
          <div id="messages">
            <MessageList items={messages} />
          </div>
          <form onSubmit={this.saveMessage}>
            <FormGroup>
              <FormControl
                type="text"
                value={message}
                placeholder="Enter message"
                onChange={this.handleChange}
              />
              <Button
                disabled={!message}
                type="submit"
                bsStyle="primary"
              >
                Send
              </Button>
            </FormGroup>
          </form>
        </div>
      </div>
    );
  }
}
