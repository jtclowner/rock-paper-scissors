
const hre = require("hardhat");

async function main() {
  const Rng = await hre.ethers.getContractFactory("RNG");
  const rng = await Rng.deploy();
  await rng.deployed();
  console.log("RNG contract deployed to:", rng.address);

  const Game = await hre.ethers.getContractFactory("Game");
  const game = await Game.deploy(rng.address);
  await game.deployed();

  console.log("Game contract deployed to:", game.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
