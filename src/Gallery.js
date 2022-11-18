import React from 'react';
import { Form, Message, Table } from 'semantic-ui-react';
import Sell from './Sell.js';
import Bid from './Bid.js';
import Buy from './Buy.js';

class Gallery extends React.Component {
  state = {
    errorMessage: '',
    tokenId: '',
    owner: '',
    uri: '',
    price: '',
    approvedAddress: null
  }

  search = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '' });

    try {
      const details = await this.props.contract.getDetails(this.state.tokenId);
      const approvedAddress = await this.props.contract.getApproved(this.state.tokenId);

      this.setState({
        owner: details[0],
        uri: details[1],
        price: details[2].toString(),
        approvedAddress: approvedAddress
      });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  onPriceChange = (value) => {
    this.setState({ price: value });
  }

  isOwner() {
    return(this.state.owner === this.props.signerAddress);
  }

  render() {
    return(
      <React.Fragment>
        <Form onSubmit={this.search} error={!!this.state.errorMessage}>
          <Message error header="Error" content={this.state.errorMessage} />
          <Form.Group>
            <Form.Input
              placeholder='tokenId'
              value={this.state.tokenId}
              onChange={(e) => this.setState({ tokenId: e.target.value })}
            />
            <Form.Button primary content='Search' onClick={this.search} />
          </Form.Group>
        </Form>
        {
          this.isOwner() ? (
            <Sell
              contract={this.props.contract}
              signerAddress={this.props.signerAddress}
              tokenId={this.state.tokenId}
              onPriceChange={this.onPriceChange}
            />
          ) : null
        }
        {
          !this.isOwner()
            && this.state.price
            && this.state.price !== '0'
            && this.props.signerAddress !== this.state.approvedAddress ? (
            <Bid
              contract={this.props.contract}
              signerAddress={this.props.signerAddress}
              tokenId={this.state.tokenId}
            />
          ) : null
        }
        {
          this.props.signerAddress === this.state.approvedAddress ? (
            <Buy
              contract={this.props.contract}
              tokenId={this.state.tokenId}
              price={this.state.price}
            />
          ) : null
        }
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={2}>owner</Table.Cell>
              <Table.Cell>{ this.state.owner }</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>URI</Table.Cell>
              <Table.Cell>{ this.state.uri }</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>price</Table.Cell>
              <Table.Cell>
                {
                  this.state.price ? (
                    this.state.price === '0' ? 'not for sale' : this.state.price
                  ) : null
                }
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  };
}

export default Gallery;
