const { expect } = require(`chai`);
const { ethers } = require("hardhat");

let owner, rngContract;

const deployRng = async () => {
  const RNG = await ethers.getContractFactory('contracts/RNG.sol:RNG');
  const rng = await RNG.deploy();
  await rng.deployed();
  return rng;
};

const deployMockRng = async (desiredOutcome) => {
  const RNGMock = await ethers.getContractFactory('contracts/RNGMock.sol:RNGMock');
  const rngMock = await RNGMock.deploy(desiredOutcome);
  await rngMock.deployed();
  return rngMock;
};


describe(`RNG.sol`, async () => {
  describe(`Test random number generation`, async () => {
    before(async () => {
      rngContract = await deployRng();
      [owner] = await ethers.getSigners();
    });

    it('getRandom should produce a new 32byte value per block', async() => {
      let temp32Bytes = await rngContract.connect(owner).getRandom();
      await ethers.provider.send('evm_mine');
      let new32Bytes = await rngContract.connect(owner).getRandom();
      expect(temp32Bytes).not.equal(new32Bytes);
    });

    it('getRandomFromRange should (probably) not produce the same number 50 times in a row', async() => {
      let allTheSame = true;
      let resultArray = [];
      for (let index = 0; index < 50; index ++) {
        await ethers.provider.send('evm_mine');
        const result = await rngContract.connect(owner).getRandomFromRange(1,3);
        resultArray.push(result);
        if (result != resultArray[index]) {
          allTheSame = false;
        }
      }
      expect(allTheSame).to.be.true;
    });
  });
});

describe(`RNGMock.sol`, async () => {
  describe(`Test fixed number generation`, async () => {
    before(async () => {
      
      [owner] = await ethers.getSigners();
    });

    it('getRandomFromRange should produce "1" when "1" is passed to constructor args', async() => {
      rngContract = await deployMockRng(1);
      const result = await rngContract.connect(owner).getRandomFromRange(1,3);
      expect(result).equal(1);      
    });

    it('getRandomFromRange should produce "2" when "2" is passed to constructor args', async() => {
      rngContract = await deployMockRng(2);
      const result = await rngContract.connect(owner).getRandomFromRange(1,3);
      expect(result).equal(2);      
    });

    it('getRandomFromRange should produce "3" when "3" is passed to constructor args', async() => {
      rngContract = await deployMockRng(3);
      const result = await rngContract.connect(owner).getRandomFromRange(1,3);
      expect(result).equal(3);      
    });
  });
});