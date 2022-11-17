import React from 'react';
import { Form, Message } from 'semantic-ui-react';

class Bid extends React.Component {
  state = {
    errorMessage: '',
    value: ''
  }

  bid = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '' });

    try {
      await this.props.contract.bid(
        this.props.tokenId,
        this.state.value
      );
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <Form onSubmit={this.bid} error={!!this.state.errorMessage}>
        <Message error header="Error" content={this.state.errorMessage} />
        <Form.Group>
          <Form.Input
            placeholder='price'
            value={this.state.value}
            onChange={(e) => this.setState({ value: e.target.value })}
          />
          <Form.Button positive content='Bid' onClick={this.bid} />
        </Form.Group>
      </Form>
    );
  }
}

export default Bid;
