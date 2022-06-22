const { expect } = require(`chai`);
const { ethers } = require("hardhat");

let gameContract; let rngContract; let owner; let alice; let bob;

const deployMockRng = async (desiredOutcome) => {
  const RNGMock = await ethers.getContractFactory('contracts/RNGMock.sol:RNGMock');
  const rngMock = await RNGMock.deploy(desiredOutcome);
  await rngMock.deployed();
  return rngMock;
};

const deployGame = async (rngAddress) => {
  const Game = await ethers.getContractFactory('Game2');
  const game = await Game.deploy(rngAddress);
  await game.deployed();
  return game;
};

describe(`Game2.sol`, async() => {
  before(async() => {
    [owner, alice, bob] = await ethers.getSigners();
  });
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
  });

  describe(`Test commit-reveal schema`, async() => {
    before(async() => {
      rngContract = await deployMockRng(1);
    });

    beforeEach(async() => {
      // Redeploy the contract between each test to reset contract state
      gameContract = await deployGame(rngContract.address);
    });

    it(`Commit "Paper", wait 1 block, then reveal. CPU plays "Rock". Winning gameOver event emitted`, async() => {
      await gameContract.connect(owner).playGame('Paper');
      await ethers.provider.send('evm_mine');
      await expect(gameContract.connect(owner).reveal())
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Paper', 'Rock', true);
    });

    it(`Commit "Paper", wait 1 block, then reveal. Commit "Scissors", wait 1 block, then reveal. Expect Win, Loss`, async() => {
      await gameContract.connect(owner).playGame('Paper');
      await ethers.provider.send('evm_mine');
      await expect(gameContract.connect(owner).reveal())
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Paper', 'Rock', true);
      await gameContract.connect(owner).playGame('Scissors');
      await ethers.provider.send('evm_mine');
      await expect(gameContract.connect(owner).reveal())
        .to.emit(gameContract, 'GameOver')
        .withArgs(owner.address, 'Scissors', 'Rock', false);
    });

    it(`Commit "Rock", then reveal on the next block. Should revert`, async() => {
      await gameContract.connect(owner).playGame('Rock');
      await expect(gameContract.connect(owner).reveal())
        .to.be.revertedWith('Revealed too soon');
    });

    it(`Commit "Rock", then attempt to commit "Scissors." Should revert`, async() => {
      await gameContract.connect(owner).playGame('Rock');
      await expect(gameContract.connect(owner).playGame('Scissors'))
        .to.be.revertedWith('Commitment already made');
    });

    it(`Reveal without making a commitment. Should revert`, async() => {
      await expect(gameContract.connect(owner).reveal())
        .to.be.revertedWith('Your move, creep');
    });

    it(`Commit "Paper", wait 1 block, reveal, then reveal again. Should revert`, async() => {
      await gameContract.connect(owner).playGame('Rock');
      await ethers.provider.send('evm_mine');
      await gameContract.connect(owner).reveal();
      await expect(gameContract.connect(owner).reveal())
        .to.be.revertedWith('Your move, creep');
    });

    it(`Alice and Bob can have simultaneous games with unaffected outcomes`, async() => {
      await gameContract.connect(alice).playGame('Rock');
      await gameContract.connect(bob).playGame('Paper');
      await ethers.provider.send('evm_mine');
      await expect(gameContract.connect(bob).reveal())
        .to.emit(gameContract, 'GameOver')
        .withArgs(bob.address, 'Paper', 'Rock', true)
      await expect(gameContract.connect(alice).reveal())
        .to.emit(gameContract, 'GameOver')
        .withArgs(alice.address, 'Rock', 'Rock', false)
    });
  });
});