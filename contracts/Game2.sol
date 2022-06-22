// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IRNG {
   function getRandomFromRange(uint256 _min, uint256 _max) external view returns (uint256);
}

contract Game2 {
   struct Logic {
      string strongTo;
      string weakTo;
   }

   struct Commitment {
      uint256 blockNumber;
      string choice;
      uint8 randomOutcome;
   }

   // Tracking commitments. Visibility is private to prevent reading by malicious smart contracts
   mapping (address => Commitment) private _commits; 

   address public rngAddr;
   mapping (string => Logic) public moveChoices;

   event GameOver(address indexed player, string playerChoice, string enemyChoice, bool winStatus);

   // Modifier to prevent smart contract interactions. This prevents malicious contracts from
   // calling functions then reverting if the conditions are not favourable 
   modifier onlyEOA {
      require(msg.sender == tx.origin, "EOAs only. No contracts.");
      _;
   }
   constructor (address rngaddr) {
    // Set RNG contract address
    rngAddr = rngaddr;
    // Create and store game options. Rock Paper Scissors (..Lizard, Spock, etc)
    moveChoices["Rock"] Logic("Scissors", "Paper");
    moveChoices["Paper"] Logic("Rock", "Scissors");
    moveChoices["Scissors"] Logic ("Paper", "Rock");
    }


   // Commit phase
   function playGame(string memory _myChoice) external onlyEOA {
      // If this value does not exist, the user's choice has no defined logic
      require(bytes(moveChoices[_myChoice].strongTo).length != 0, "Input a valid move");
      // Prevent the user from changing their commitment after it has already been made
      require(_commits[msg.sender].blockNumber == 0, "Commitment already made");
      // Store current block number, user choice, and result of RNG call to a new user commitment
      Commitment memory commitment = Commitment(
         block.number,
         _myChoice,
         uint8(IRNG(rngAddr).getRandomFromRange(1,3)));
      // Save user commitment to state
      _commits[msg.sender] = commitment;
   }

   // Reveal phase
   function reveal() external returns (bool _won) {
      // Require a commitment to have already been made
      require(_commits[msg.sender].blockNumber != 0, "Your move, creep");
      // Prevent the game's outcome from being revealed unless we comitted 2 blocks ago or more
      require(_commits[msg.sender].blockNumber + 2 <= block.number, "Revealed too soon");
      
      // Grab pre-determined RNG outcome
      _won = false;
      string memory _enemyChoice = 
         _commits[msg.sender].randomOutcome == 1? "Rock" :
         _commits[msg.sender].randomOutcome == 2? "Paper" :
         "Scissors";
      // Resolve game outcome
      string _userChoice = moveChoices[_commits[msg.sender].choice;
      if (
         keccak256(abi.encodePacked(_userChoice].strongTo)) ==
         keccak256(abi.encodePacked(_enemyChoice))
         ) { // win
            _won = true;
            emit GameOver(msg.sender, _userChoice, _enemyChoice, _won);
      } else if (
         keccak256(abi.encodePacked(_userChoice].weakTo)) ==
         keccak256(abi.encodePacked(_enemyChoice))
         ) { // lose
            emit GameOver(msg.sender, _userChoice, _enemyChoice, _won);
      } else { // draw
         emit GameOver(msg.sender, _userChoice, _enemyChoice, _won);
      }
      // Delete the commitment to allow a new game to begin
      delete _commits[msg.sender];
      return _won;
   }
}
