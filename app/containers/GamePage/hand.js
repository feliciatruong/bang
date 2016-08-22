import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';

export default class Hand extends Component {
  static propTypes = {
    items: PropTypes.array,
    myTurn: PropTypes.bool,
  }

  render() {
    const { items, myTurn } = this.props;
    if (!items) {
      return null;
    }
    return (
      <ul>
        {
          items.map((item) =>
            <div
              key={item.key}
            >
              <Button disabled={!myTurn}>{item.name}</Button>
            </div>
        )}
      </ul>
    );
  }
}
