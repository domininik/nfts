import React from 'react';
import { Table, Button } from 'semantic-ui-react';

class BidRow extends React.Component {
  state = {
    errorMessage: '',
    price: null,
    trader: null,
  }

  getBidById = async () => {
    this.setState({ errorMessage: '' });

    try {
      const bid = await this.props.contract.bids(this.props.bidId);

      this.setState({
        price: bid.value.toString(),
        trader: bid.trader
      });
    } catch (error) {
      this.props.onError(error.message);
    }
  }

  approve = async () => {
    this.setState({ errorMessage: '' });

    try {
      await this.props.contract.approve(
        this.state.trader,
        this.props.tokenId
      );
    } catch (error) {
      this.props.onError(error.message);
    }
  }

  render() {
    return(
      <Table.Row>
        <Table.Cell>{ this.props.index }</Table.Cell>
        <Table.Cell>{ this.state.price }</Table.Cell>
        <Table.Cell>{ this.state.trader }</Table.Cell>
        <Table.Cell>
          <Button content='Get details' onClick={this.getBidById} />
          {
            this.props.tokenOwner === this.props.signerAddress ? (
              <Button positive content='Approve' onClick={this.approve} />
            ) : null
          }
        </Table.Cell>
      </Table.Row>
    )
  }
}

export default BidRow;
