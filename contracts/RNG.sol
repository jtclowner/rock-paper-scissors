// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
contract RNG {
       
   function getRandom() public view returns (bytes32) {
      return blockhash(block.number - 1);
   }
            
   function getRandomFromRange(uint256 _min, uint256 _max) 
   public view returns (uint256) {
      uint256 random = uint256(getRandom()) % (_max) + _min;
      return random;
   }     
}