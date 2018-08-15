pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";

contract Owned is OwnedI {

    address public contractOwner;
    bool    public isPausedValue;

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function Owned() {
        contractOwner = msg.sender;
        isPausedValue = false;
        LogOwnerSet(contractOwner, msg.sender);
    }

    function setOwner(address _newOwner)
        public
        onlyOwner
        returns(bool success){
            if(_newOwner == msg.sender) revert();
            if(_newOwner == 0) revert();
                if(isPausedValue == false){isPausedValue = true;}
                LogOwnerSet(contractOwner, _newOwner);
                contractOwner = _newOwner;
                if(isPausedValue == true){isPausedValue = false;}
                return true;
    }

    function getOwner()
        constant
        public
        returns(address){
                return contractOwner;
    }

    function () { revert(); }
}
