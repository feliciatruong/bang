import React, { Component, PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ParticipantList from './participants.js';

export default class Hand extends Component {
  static propTypes = {
    database: PropTypes.object,
    emailKey: PropTypes.string,
    items: PropTypes.array,
    myTurn: PropTypes.bool,
    participants: PropTypes.array,
    rid: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      cardKey: null,
      cardName: '',
      showModal: false,
      target: '',
    };
  }

  playCard = (event) => {
    const { database, emailKey, rid } = this.props;
    const userRef = database.ref(`${rid}/participants/${emailKey}/hand/`);
    userRef.child(event.target.value).once('value', (data) => {
      const key = data.key;
      const val = data.val();
      switch (val.name) {
        case 'Bang!':
          this.setState({ showModal: true, cardKey: key, cardName: val.name });
          console.log('bang');
          return;
        case 'Miss':
          console.log('hey');
          return;
        default:
          console.log(event.target.value);
      }
    });
  }

  close = () => {
    this.setState({ showModal: false });
  }

  targetTurn() {
    console.log('hey');
  }

  selectTarget = (event) => {
    const { cardKey, cardName } = this.state;
    const { database, emailKey, rid } = this.props;
    const userRef = database.ref(`${rid}/participants/${emailKey}/hand/`);
    userRef.child(cardKey).remove();
    const databaseRef = database.ref(`${rid}/current`);
    databaseRef.child('card').update({ name: cardName });
    console.log(event.target.value);
    this.setState({ target: event.target.value });
  }


  render() {
    const { showModal } = this.state;
    const { emailKey, items, myTurn, participants } = this.props;
    if (!items) {
      return null;
    }
    return (
      <div>
        <ul>
          {
            items.map((item) =>
              <div
                key={item.key}
              >
                <Button onClick={this.playCard} value={item.key} disabled={!myTurn}>{item.name}</Button>
              </div>
          )}
        </ul>
        <Modal show={showModal} onHide={this.close}>
          <Modal.Header closeButton>
            Select Target
          </Modal.Header>
          <Modal.Body>
            <ParticipantList selectTarget={this.selectTarget} players={participants} emailKey={emailKey} />
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-primary" onClick={this.close}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
