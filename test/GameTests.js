const { expect } = require('chai');
const { ethers } = require('hardhat');

let gameContract;
let rngContract;
let owner;

const deployMockRng = async (desiredOutcome) => {
  const RNGMock = await ethers.getContractFactory('contracts/RNGMock.sol:RNGMock');
  const rngMock = await RNGMock.deploy(desiredOutcome);
  await rngMock.deployed();
  return rngMock;
};

const deployGame = async (rngAddress) => {
  const Game = await ethers.getContractFactory('Game');
  const game = await Game.deploy(rngAddress);
  await game.deployed();
  return game;
};

describe(`Game.sol`, async() => {
  before(async() => {
    [owner] = await ethers.getSigners();
  })
  describe(`Test user inputs`, async() => {
    before(async() => {
      rngContract = await deployMockRng(2);
    });
    beforeEach(async() => {
      // Redeploy the contract between each test to reset contract state
      gameContract = await deployGame(rngContract.address);
    });
  
    it(`User can play "Rock"`, async() => {
      await expect(gameContract.connect(owner).playGame('Rock'))
        .to.not.be.reverted;
    });
  
    it(`User can play "Paper"`, async() => {
      await expect(gameContract.connect(owner).playGame('Paper'))
        .to.not.be.reverted;
    });
  
    it(`User can play "Scissors"`, async() => {
      await expect(gameContract.connect(owner).playGame('Scissors'))
        .to.not.be.reverted;
    });
  
    it(`User cannot play "rock"`, async() => {
      await expect(gameContract.connect(owner).playGame('rock'))
        .to.be.revertedWith('Input a valid move');
    });
  
    it(`User cannot play "Aeroplane"`, async() => {
      await expect(gameContract.connect(owner).playGame('Aeroplane'))
        .to.be.revertedWith('Input a valid move');
    });
  
    it(`User cannot play "1"`, async() => {
      await expect(gameContract.connect(owner).playGame('1'))
        .to.be.revertedWith('Input a valid move');
    });
  
    it (`User cannot play an empty string`, async() => {
      await expect(gameContract.connect(owner).playGame(""))
        .to.be.revertedWith('Input a valid move');
    });
  });

  describe(`Enemy uses Rock`, async() => {
    before(async() => {
      rngContract = await deployMockRng(1);
      gameContract = await deployGame(rngContract.address);
    });

    it(`Rock vs Rock - Draw`, async() => {
      await expect(gameContract.connect(owner).playGame('Rock'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Rock', 'Rock', false);
    });

    it(`Paper vs Rock - Win`, async() => {
      await expect(gameContract.connect(owner).playGame('Paper'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Paper', 'Rock', true);
    });

    it(`Scissors vs Rock - Loss`, async() => {
      await expect(gameContract.connect(owner).playGame('Scissors'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Scissors', 'Rock', false);
    });
  });

  describe(`Enemy uses Paper`, async() => {
    before(async() => {
      rngContract = await deployMockRng(2);
      gameContract = await deployGame(rngContract.address);
      [owner] = await ethers.getSigners();
    });

    it(`Rock vs Paper - Loss`, async() => {
      await expect(gameContract.connect(owner).playGame('Rock'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Rock', 'Paper', false);
    });

    it(`Paper vs Paper - Draw`, async() => {
      await expect(gameContract.connect(owner).playGame('Paper'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Paper', 'Paper', false);
    });

    it(`Scissors vs Paper - Win`, async() => {
      await expect(gameContract.connect(owner).playGame('Scissors'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Scissors', 'Paper', true);
    });
  });

  describe(`Enemy uses Scissors`, async() => {
    before(async() => {
      rngContract = await deployMockRng(3);
      gameContract = await deployGame(rngContract.address);
      [owner] = await ethers.getSigners();
    });

    it(`Rock vs Scissors - Win`, async() => {
      await expect(gameContract.connect(owner).playGame('Rock'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Rock', 'Scissors', true);
    });

    it(`Paper vs Scissors - Loss`, async() => {
      await expect(gameContract.connect(owner).playGame('Paper'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Paper', 'Scissors', false);
    });

    it(`Scissors vs Scissors - Draw`, async() => {
      await expect(gameContract.connect(owner).playGame('Scissors'))
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Scissors', 'Scissors', false);
    });
  });
});
