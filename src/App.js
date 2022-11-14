import React from 'react';
import { ethers } from 'ethers';
import DFToken from './artifacts/contracts/DFToken.sol/DFToken.json';
import { Container, Message, Segment } from 'semantic-ui-react';
import Mint from './Mint.js';

class App extends React.Component {
  state = {
    contract: null,
    signerAddress: '',
    owner: null
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

      this.setState({
        owner: owner,
        balance: balance.toString()
      });
    } catch (error) {
      console.log(error);
    }

    this.setState({
      contract: contract,
      signerAddress: signerAddress
    });
  }

  render() {
    return (
      <Container style={{marginTop: 10}}>
        {
          this.state.owner === this.state.signerAddress ? (
            <React.Fragment>
              <Message attached>
                You have { this.state.balance } NFTs
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
