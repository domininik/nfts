const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("DFToken", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const DFToken = await ethers.getContractFactory("DFToken");
    const token = await DFToken.deploy();

    return { token, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Sets the right contract owner", async function () {
      const { token, owner } = await loadFixture(deployFixture);

      expect(await token.owner()).to.equal(owner.address);
    });

    it("Initializes tokenIdCounter with default value as 1", async function () {
      const { token } = await loadFixture(deployFixture);

      expect(await token.tokenIdCounter()).to.equal(1);
    })
  });

  describe("Minting", function () {
    it("Assigns token owner", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "");

      expect(await token.ownerOf(1)).to.equal(otherAccount.address);
    });

    it("Updates token owner balance", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "");

      expect(await token.balanceOf(otherAccount.address)).to.equal(1);
    });

    it("Updates token id counter", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "");

      expect(await token.tokenIdCounter()).to.equal(2);
    });

    it("Sets token URI", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "http://example.com");

      expect(await token.tokenURI(1)).to.equal("http://example.com");
    });

    it("Sets token price as 0 by default", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "http://example.com");

      expect(await token.price(1)).to.equal(0);
    });

    it("Fails when it's called by non-owner", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);

      await expect(token.connect(otherAccount).safeMint(otherAccount.address, ""))
       .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pricing", function () {
    it("Allows token owner to set the token price", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);

      expect(await token.price(1)).to.equal(1000);
    });

    it("Reverts if other account tries to set the price", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "");

      await expect(token.setPrice(1, 1000)).to.be.revertedWith("You are not the item owner");
    });
  });

  describe("Details", function () {
    it("Returns overview of token in one call", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "http://example.com");
      await token.setPrice(1, 1000);

      const details = await token.getDetails(1);

      expect(details[0]).to.equal(owner.address);
      expect(details[1]).to.equal("http://example.com");
      expect(details[2]).to.equal(ethers.BigNumber.from(1000));
    });
  });

  describe("Bidding", function () {
    it("Reverts if item is not for sale (price is 0)", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");

      await expect(token.connect(otherAccount).bid(1, 1000)).to.be.revertedWith("Item is not for sale");
    });

    it("Creates new bid record", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);

      const bid = await token.bids(0);

      expect(bid.tokenId).to.equal(1);
      expect(bid.value).to.equal(1000);
      expect(bid.trader).to.equal(otherAccount.address);
    });

    it("Saves bid-to-token mapping", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);

      expect(await token.bidToToken(0)).to.equal(1);
    });

    it("Updates token bids counter", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);

      expect(await token.tokenBidsCount(1)).to.equal(1);
    });

    it("Returns bid ids of given token", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);

      const ids = await token.getBidsByToken(1);

      expect(ids.length).to.equal(1);
      expect(ids[0]).to.equal(0);
    });
  });

  describe("Approving", function () {
    it("Stores which account is approved for given token", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.approve(otherAccount.address, 1);

      expect(await token.getApproved(1)).to.equal(otherAccount.address);
    });

    it("Emits approval event", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");

      await expect(
        token.approve(otherAccount.address, 1)
      ).to.emit(token, "Approval").withArgs(owner.address, otherAccount.address, 1);
    });

    it("Reverts when caller is not the token owner", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");

      await expect(token.connect(otherAccount).approve(otherAccount.address, 1)).to.be.reverted;
    });
  });

  describe("Buying", function () {
    it("Reverts if item is not for sale", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");

      await expect(token.connect(otherAccount).buy(1)).to.be.revertedWith("Item is not for sale");
    });

    it("Reverts if price is not met", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);

      await expect(token.connect(otherAccount).buy(1)).to.be.revertedWith("Price is not met");
    });

    it("Reverts if trader is not approved", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);

      await expect(token.connect(otherAccount).buy(1, { value: 1000 })).to.be.reverted;
    });

    it("Does not revert if trader is approved", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);

      await expect(token.connect(otherAccount).buy(1, { value: 1000 })).not.to.be.reverted;
    });

    it("Updates account ether balances", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);

      await expect(token.connect(otherAccount).buy(1, { value: 1000 })).to.changeEtherBalances(
        [owner, otherAccount], 
        [1000, -1000]
      );
    });

    it("Updates account token balances", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);

      await expect(token.connect(otherAccount).buy(1, { value: 1000 })).to.changeTokenBalances(
        token,
        [owner, otherAccount], 
        [-1, 1]
      );
    });

    it("Transfers token ownership", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.ownerOf(1)).to.equal(otherAccount.address);
    });

    it("Emits transfer event", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);

      await expect(
        token.connect(otherAccount).buy(1, { value: 1000 })
      ).to.emit(token, "Transfer").withArgs(owner.address, otherAccount.address, 1);
    });

    it("Resets token price", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.price(1)).to.equal(0);
    });

    it("Resets token bids counter", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.tokenBidsCount(1)).to.equal(0);
    });

    it("Resets bid-to-token mappings", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.bidToToken(0)).to.equal(0);
    });

    it("Does not return bid ids of just bought token", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      const ids = await token.getBidsByToken(1);

      expect(ids.length).to.eq(0);
    });
  });
});
