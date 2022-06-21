require("@nomiclabs/hardhat-waffle");
const { privateKey, INFURA_API_KEY } = require(`./secrets.json`)

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers:[
      {
        version: "0.8.4"
      },
      {
        version: "0.8.15"
      }
    ]
  },
  networks:{
    rinkeby:{
      url:`https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts:[privateKey]
    }
  }
};