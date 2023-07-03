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

    it("Sets token URI", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "http://example.com");

      expect(await token.tokenURI(1)).to.equal("http://example.com");
    });

    it("Sets token price as 0 by default", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "http://example.com");

      expect(await token.getPrice(1)).to.equal(0);
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

      expect(await token.getPrice(1)).to.equal(1000);
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

    it("Cleans trader's bids for this token", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.connect(otherAccount).bid(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.getBidsByToken(1)).to.be.empty;
    });

    it("Does not clean other trader's bids", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "#1");
      await token.safeMint(owner.address, "#2");
      await token.setPrice(1, 1000);
      await token.setPrice(2, 500);
      await token.connect(otherAccount).bid(1, 1000);
      await token.connect(otherAccount).bid(2, 500);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.getBidsByToken(1)).to.be.empty;

      const ids = await token.getBidsByToken(2);
      expect(ids[0]).to.equal(1);
    });

    it("Resets token price", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "");
      await token.setPrice(1, 1000);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.getPrice(1)).to.equal(0);
    });

    it("Does not reset other token prices", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "#1");
      await token.safeMint(owner.address, "#2");
      await token.setPrice(1, 1000);
      await token.setPrice(2, 500);
      await token.approve(otherAccount.address, 1);
      await token.connect(otherAccount).buy(1, { value: 1000 });

      expect(await token.getPrice(1)).to.equal(0);
      expect(await token.getPrice(2)).to.equal(500);
    });
  });

  describe("Burning", function () {
    it("Does not decrement token id counter", async function () {
      const { token, owner } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "#1");
      await token.safeMint(owner.address, "#2");
      await token.safeMint(owner.address, "#3");

      await token.safeBurn(1);

      await token.safeMint(owner.address, "#4");
      expect(await token.tokenURI(4)).to.equal("#4");
    });

    it("Cleans token's bids", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "#1");
      await token.safeMint(owner.address, "#2");
      await token.safeMint(owner.address, "#3");
      await token.setPrice(1, 1000);
      await token.setPrice(2, 500);
      await token.setPrice(3, 250);
      await token.connect(otherAccount).bid(1, 1000);
      await token.connect(otherAccount).bid(2, 500);
      await token.connect(otherAccount).bid(3, 250);

      await token.safeBurn(1);

      expect(await token.getBidsByToken(1)).to.be.empty;
    });

    it("Cleans token's price", async function () {
      const { token, owner, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(owner.address, "#1");
      await token.safeMint(owner.address, "#2");
      await token.safeMint(owner.address, "#3");
      await token.setPrice(1, 1000);
      await token.setPrice(2, 500);
      await token.setPrice(3, 250);
      await token.connect(otherAccount).bid(1, 1000);
      await token.connect(otherAccount).bid(2, 500);
      await token.connect(otherAccount).bid(3, 250);

      await token.safeBurn(1);

      expect(await token.getPrice(1)).to.equal(0);
    });

    it("Reverts when performed by non-owner", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "#1");

      await expect(token.connect(otherAccount).safeBurn(1))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
