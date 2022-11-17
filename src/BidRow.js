import React from 'react';
import { Table, Button } from 'semantic-ui-react';

class BidRow extends React.Component {
  state = {
    price: null,
    trader: null,
  }

  getBidById = async () => {
    try {
      const bid = await this.props.contract.bids(this.props.bidId);

      this.setState({
        price: bid.value.toString(),
        trader: bid.trader
      });
    } catch (error) {
      console.log(error.message);
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
        </Table.Cell>
      </Table.Row>
    )
  }
}

export default BidRow;
