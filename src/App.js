import React from 'react';
import { ethers } from 'ethers';
import DFToken from './artifacts/contracts/DFToken.sol/DFToken.json';
import { Container, Message, Segment } from 'semantic-ui-react';
import Mint from './Mint.js';

class App extends React.Component {
  state = {
    contract: null,
    signerAddress: '',
    owner: null,
    balance: 0,
    counter: 0
  }

  componentDidMount() {
    if (typeof window.ethereum !== 'undefined') {
      this.initialize();
    } else {
      console.log('ERROR: web3 provider not available');
    };
  };

  async initialize() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    let contract;
    let signerAddress;

    try {
      signerAddress = await signer.getAddress();
      const contractAddress = ethers.utils.getContractAddress({
        from: signerAddress,
        nonce: 0
      });
      contract = new ethers.Contract(contractAddress, DFToken.abi, signer);
      const owner = await contract.owner();
      const balance = await contract.balanceOf(signerAddress);
      const counter = await contract.tokenIdCounter();

      this.addListeners(contract);

      this.setState({
        owner: owner,
        balance: balance.toString(),
        counter: counter.toString()
      });
    } catch (error) {
      console.log(error);
    }

    this.setState({
      contract: contract,
      signerAddress: signerAddress
    });
  }

  addListeners(contract) {
    contract.on('Transfer', async (from, to, tokenId, event) => {
      const notification = `Token #${tokenId} transferred from ${from} to ${to}`;
      const block = await event.getBlock();
      const timestamp = new Date(block.timestamp * 1000);
      const balance = await contract.balanceOf(this.state.signerAddress);
      const counter = await contract.tokenIdCounter();

      this.setState({
        notification: notification,
        timestamp: timestamp.toUTCString(),
        balance: balance.toString(),
        counter: counter.toString()
      });
    });
  }

  render() {
    return (
      <Container style={{marginTop: 10}}>
        {
          this.state.notification ? (
            <Message positive>
              <Message.Header>New event at {this.state.timestamp}</Message.Header>
              {this.state.notification}
            </Message>
          ) : null
        }
        {
          this.state.owner === this.state.signerAddress ? (
            <React.Fragment>
              <Message attached>
                <Message.Header>{ this.state.balance } owned by you</Message.Header>
                { this.state.counter } available
              </Message>
              <Segment attached>
                <Mint
                  contract={this.state.contract}
                  signerAddress={this.state.signerAddress}
                />
              </Segment>
            </React.Fragment>
          ) : (
            <Message warning>
              <Message.Header>You are not authorized to access this page</Message.Header>
            </Message>
          )
        }
      </Container>
    )
  }
}

export default App;
