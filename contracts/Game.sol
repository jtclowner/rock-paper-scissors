// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

interface IRNG {
   function getRandomFromRange(uint256 _min, uint256 _max) external view returns (uint256);
}

contract Game {
   struct Logic {
      string strongTo;
      string weakTo;
   }

   address public rngAddr;
   mapping (string => Logic) public moveChoices;

   event GameOver(address indexed player, string playerChoice, string enemyChoice, bool winStatus);

   constructor (address rngaddr) {
    // Set RNG contract address
    rngAddr = rngaddr;
    // Create and store game options. Rock Paper Scissors (..Lizard, Spock, etc)
    moveChoices["Rock"] = Logic("Scissors", "Paper");
    moveChoices["Paper"] = Logic("Rock", "Scissors");
    moveChoices["Scissors"] = Logic ("Paper", "Rock");
    }

   function playGame(string memory _myChoice) external returns (bool _won) {
      // If this value does not exist, the user's choice has no defined logic
      require(bytes(moveChoices[_myChoice].strongTo).length != 0, "Input a valid move");

      // RNG
      uint8 _randomDigit = uint8(IRNG(rngAddr).getRandomFromRange(1,3));
      string memory _enemyChoice = 
         _randomDigit == 1? "Rock" :
         _randomDigit == 2? "Paper" :
         "Scissors";

      // Get game outcome
      _won = false;
      if (
         keccak256(abi.encodePacked(moveChoices[_myChoice].strongTo)) ==
         keccak256(abi.encodePacked(_enemyChoice))
         ) { // win
            _won = true;
            emit GameOver(msg.sender, _myChoice, _enemyChoice, _won);
      } else if (
         keccak256(abi.encodePacked(moveChoices[_myChoice].weakTo)) ==
         keccak256(abi.encodePacked(_enemyChoice))
         ) { // lose
            emit GameOver(msg.sender, _myChoice, _enemyChoice, _won);
      } else { // draw
         emit GameOver(msg.sender, _myChoice, _enemyChoice, _won);
      }
   return _won;
   }
}