import React from 'react';
import { Form, Button, Message } from 'semantic-ui-react';

class Mint extends React.Component {
  state = {
    errorMessage: '',
    address: this.props.signerAddress,
    url: ''
  }

  mint = async () => {
    this.setState({ errorMessage: '' });

    try {
      await this.props.contract.safeMint(
        this.state.address,
        this.state.url
      );
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <Form onSubmit={this.mint} error={!!this.state.errorMessage}>
        <Message error header="Error" content={this.state.errorMessage} />
        <Form.Input
          label='address'
          placeholder='address'
          value={this.state.address}
          onChange={(e) => this.setState({ address: e.target.value })}
        />
        <Form.Input
          label='url'
          placeholder='url'
          value={this.state.url}
          onChange={(e) => this.setState({ url: e.target.value })}
        />
        <Button content='Mint' positive />
      </Form>
    )
  }
}

export default Mint;
