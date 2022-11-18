import React from 'react';
import { Form, Message } from 'semantic-ui-react';

class Buy extends React.Component {
  state = {
    errorMessage: '',
  }

  buy = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '' });

    try {
      await this.props.contract.buy(this.props.tokenId, { value: this.props.price });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <Form onSubmit={this.buy} error={!!this.state.errorMessage}>
        <Message error header="Error" content={this.state.errorMessage} />
        <Form.Group>
          <Form.Input
            disabled
            placeholder='price'
            value={this.props.price}
          />
          <Form.Button positive content='Buy' onClick={this.buy} />
        </Form.Group>
      </Form>
    );
  }
}

export default Buy;
