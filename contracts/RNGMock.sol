// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
contract RNGMock {
   uint8 public result;
   constructor(uint8 _result) {
      result = _result;
   }
            
   function getRandomFromRange(uint256 _min, uint256 _max)
   public view returns (uint256) {
      return result;
   }
}