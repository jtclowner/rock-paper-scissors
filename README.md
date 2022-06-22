# Rock-Paper-Scissors
A single-player solidity rock paper scissors implementation using commit-reveal for added security.

``Game.sol`` demonstrates a rock-paper-scissors implementation that is vulnerable to attack adversarial smart contracts, malicious block producers and transaction batching services like flashbots.

``Game2.sol`` takes the same logic and protects against these attack vectors by implementing a commit-reveal pattern that the satisfies the following conditions:
- All assets related to the random event are collected during the commitment, and users cannot retract or replace the commitment after it has been made.
- The outcome is locked at the time the commitment is made, and users cannot infer the outcome while they are making the commitment. 

These conditions are met with a ``private`` commitment mapping to prevent auxilary smart contracts from querying commitments in the contract state, an ``onlyEOA`` modifier to prevent contracts from calling the ``playGame`` function and reverting if the the desired outcome is not met, and a ``require`` for a minimum number of blocks having passed between commits and reveals in order to prevent transaction reorganisation by nodes.
In this model, we require a minimum of 2 blocks to pass before a ``playGame`` commitment can be revealed; the block the transaction appeared in, and one other. This protects from flashbot-style transaction batching, and requires a malicious node to be able to mine 3 consecutive blocks in order to undo a commitment and a prevent a 'losing' set of transactions from executing. The more blocks required between the commit and reveal phases, the more hash power a miner must control to game the system. 

Safe randomness is outside the scope of this project, but can be acquired via a VRF (Verifiable Random Function). In place of this, ``RNG.sol`` provides a ``getRandom`` function that returns the previous ``block.hash`` as a 32 byte value, used as source of unsafe randomness for the ``getRandomBetweenRange`` function. For testing, ``RNGMock.sol`` provides a version  of the ``getRandomFromRange`` function that returns a predetermined integer value.

### Build me
```npm i```

#### Run tests on localhost:
```npx hardhat test```

#### Deploy on localhost and interact:
1. ```npx hardhat node```
2. ```npx hardhat run --network localhost ./scripts/deploy.js```
3. Copy deployed address and source code to Remix and select local development network

#### Deploy on rinkeby and interact:
1. Populate ``secrets.json`` with ``INFURA_API_KEY`` and ``privateKey``
2. ```npx hardhat run --network rinkeby ./scripts/deploy.js```
3. Copy deployed address and source code to Remix and select rinkeby network

#### Linting
- Smart contracts: ```npm run solhint```
- Tests and scripts: ```npm run eslint```

