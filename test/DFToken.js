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
    it("Sets the right owner", async function () {
      const { token, owner } = await loadFixture(deployFixture);

      expect(await token.owner()).to.equal(owner.address);
    });
  });
});
