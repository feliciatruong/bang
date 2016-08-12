import React, { Component, PropTypes } from 'react';
import * as firebase from 'firebase';
import { Button } from 'react-bootstrap';
import Hand from './hand.js';

export default class Bang extends Component {
  static propTypes = {
    assign: PropTypes.bool,
    database: PropTypes.object,
    email: PropTypes.string,
    params: PropTypes.object,
    participants: PropTypes.array,
    players: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      auth: firebase.auth(),
      database: firebase.database(),
      hand: [],
      roles: ['Sheriff', 'Outlaw', 'Renegade', 'Outlaw', 'Vice', 'Outlaw', 'Vice'],
      deck: [],
      joined: false,
    };
  }

  assignRoles = () => {
    const { roles } = this.state;
    const { database, params, participants, players } = this.props;
    const usersRef = database.ref(`${params.rid}/participants`);
    const messagesRef = database.ref(`${params.rid}/messages`);
    usersRef.off();
    for (let i = players - 1; i >= 0; i--) {
      const index = Math.floor(Math.random() * (i + 1));
      const userRef = usersRef.child(participants[i].key);
      participants[i].role = roles[index];
      userRef.update({ role: participants[i].role });
      userRef.update({ health: participants[i].health });
      userRef.update({ hand: participants[i].hand });
      if (roles[index] === 'Sheriff') {
        messagesRef.push({ name: '[SYSTEM]', text: `${participants[i].name} is the Sheriff!` });
      }
      roles.splice(index, 1);
      this.setState({ roles, participants });
    }
    this.createBangCards();
    this.shuffleCards();
    this.dealCards();
    this.loadHand();
  }

  shuffleCards() {
    const { deck } = this.state;
    const { params, database } = this.props;
    for (let i = deck.length - 1; i >= 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[rand];
      deck[rand] = temp;
    }
    this.setState({ deck });
    database.ref(`${params.rid}/cards`).remove();
    database.ref(`${params.rid}/hand`).remove();
    for (let i = 0; i < deck.length - 1; i++) {
      database.ref(`${params.rid}/cards`).push(deck[i]);
    }
  }

  dealCards() {
    const { deck } = this.state;
    const { database, params, participants, players } = this.props;
    const usersRef = database.ref(`${params.rid}/participants`);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < players; j++) {
        participants[j].hand.push(deck[deck.length - 1]);
        deck.pop();
      }
    }
    this.setState({ deck, participants });
    for (let j = 0; j < players; j++) {
      const userRef = usersRef.child(participants[j].key);
      userRef.update({ hand: participants[j].hand });
    }
  }

  createBangCards() {
    const { deck } = this.state;
    const { players } = this.props;
    for (let i = 0; i < 25; i++) {
      deck.push({ name: 'Bang!', type: 'attack', hit: -1, targets: 1, limit: 1 });
    }
    for (let i = 0; i < 3; i++) {
      deck.push({ name: 'Indians', type: 'attack', hit: -1, targets: players, limit: 0 });
    }
    for (let i = 0; i < 12; i++) {
      deck.push({ name: 'Missed!', type: 'defense', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 6; i++) {
      deck.push({ name: 'Beer', type: 'defense', hit: 1, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Panic!', type: 'support', hit: 0, targets: 1, limit: 0, range: 1 });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Cat Balou', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Stagecoach', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Wells Fargo', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    this.setState({ deck });
  }

  escapeEmailAddress(email) {
    if (!email) return false;
    // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
    return email.toLowerCase().replace(/\./g, ',');
  }

  loadHand() {
    const { hand } = this.state;
    const { database, email, params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/${this.escapeEmailAddress(email)}/hand/`);
    userRef.off();
    userRef.limitToLast(12).on('child_added', (data) => {
      const val = data.val();
      hand.push({ key: data.key, name: val.name });
    });
    userRef.limitToLast(12).on('child_changed', (data) => {
      const val = data.val();
      hand.push({ key: data.key, name: val.name });
    });
    this.setState({ hand });
  }

  joinGame = () => {
    const { database, email, username } = this.state;
    const { params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/`).child(this.escapeEmailAddress(email));
    userRef.update({ name: username });
    this.setState({ joined: true });
  }

  leaveGame = () => {
    const { database, email } = this.state;
    const { params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/`).child(this.escapeEmailAddress(email));
    userRef.remove();
    this.setState({ joined: false });
  }

  render() {
    const { hand, joined } = this.state;
    const { assign } = this.props;
    return (
      <div>
        <Button hidden={!joined} onClick={this.joinGame}>
          Join Game
        </Button>
        <Button hidden={joined} onClick={this.leaveGame}>
          Leave Game
        </Button>
        <Button
          disabled={!assign}
          type="submit"
          bsStyle="primary"
          onClick={this.assignRoles}
        >
          Assign Roles
        </Button>
        <Hand items={hand} />
      </div>
    );
  }
}
