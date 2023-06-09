// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DFToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Bid {
        address trader;
        uint value;
        uint tokenId;
    }

    Counters.Counter public tokenIdCounter;
    Bid[] public bids;
    mapping (uint => uint) public bidToToken;
    mapping (uint => uint) public tokenBidsCount;
    mapping (uint => uint) public price;

    constructor() ERC721("DFToken", "DFT") {
        // start counter with 1 instead of 0
        tokenIdCounter.increment();
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    //

    function getDetails(uint tokenId) public view returns(address, string memory, uint) {
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            price[tokenId]
        );
    }

    function setPrice(uint tokenId, uint value) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the item owner");

        price[tokenId] = value;
    }

    function bid(uint tokenId, uint value) public {
        require(price[tokenId] > 0, "Item is not for sale");

        bids.push(Bid(msg.sender, value, tokenId));
        uint id = bids.length - 1;
        bidToToken[id] = tokenId;
        tokenBidsCount[tokenId]++;
    }

    function getBidsByToken(uint tokenId) public view returns(uint[] memory) {
        uint[] memory result = new uint[](tokenBidsCount[tokenId]);
        uint counter = 0;

        for (uint i = 0; i < bids.length; i ++) {
            if (bidToToken[i] == tokenId) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function buy(uint tokenId) public payable {
        require(price[tokenId] > 0, "Item is not for sale");
        require(price[tokenId] == msg.value, "Price is not met");

        address payable userPayable = payable(ownerOf(tokenId));
        userPayable.transfer(price[tokenId]);

        price[tokenId] = 0;
        tokenBidsCount[tokenId] = 0;

        for (uint i = 0; i < bids.length; i ++) {
            if (bidToToken[i] == tokenId) {
                bidToToken[i] = 0;
            }
        }

        transferFrom(ownerOf(tokenId), msg.sender, tokenId);
    }
}
