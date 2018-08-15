pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/PausableI.sol";

contract Pausable is OwnedI, PausableI {

    bool    public isPausedValue;
    address public contractOwner;

    modifier whenPaused () {
        if(isPausedValue== false) revert();
        _;
    }

    modifier whenNotPaused () {
        if(isPausedValue == true) revert();
        _;
    }

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function Pausable(bool _initialPauseState) {
        isPausedValue = _initialPauseState;
        contractOwner = msg.sender;
        LogOwnerSet(contractOwner, msg.sender);
    }

    // Pausable

    function setPaused(bool newState)
        public
        onlyOwner
        returns(bool success){
                isPausedValue = newState;
                LogPausedSet(msg.sender, isPausedValue);
                return true;
    }

    function isPaused()
        constant
        public
        returns(bool isIndeed){
                LogPausedSet(msg.sender, isPausedValue);
                return isPausedValue;
    }

    // Owned

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

}
