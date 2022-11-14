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
      await token.safeMint(otherAccount.address, '');

      expect(await token.ownerOf(0)).to.equal(otherAccount.address);
    });

    it("Updates token owner balance", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, '');

      expect(await token.balanceOf(otherAccount.address)).to.equal(1);
    });

    it("Sets token URI", async function () {
      const { token, otherAccount } = await loadFixture(deployFixture);
      await token.safeMint(otherAccount.address, "http://example.com");

      expect(await token.tokenURI(0)).to.equal("http://example.com");
    });
  });
});