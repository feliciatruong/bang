import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class HomePage extends Component { // eslint-disable-line react/prefer-stateless-function

  /* TODO: Update to prevent collision if its clicked at the same time */
  createRoom() {
    const uid = new Date().valueOf();
    const sid = String(uid);
    browserHistory.push(`/room/${sid}`);
  }

  render() {
    return (
      <div>
        <Button bsStyle="primary" onClick={this.createRoom}>
          Create Room
        </Button>
      </div>
    );
  }
}
