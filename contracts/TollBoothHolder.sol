pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/TollBoothHolderI.sol";

contract TollBoothHolder is OwnedI, TollBoothHolderI {

    address public contractOwner;
    bool    public isPausedValue;

    struct TollStruct {
        address vehicle;
        address entryBooth;
        uint depositedWeis;
        uint feeTotal;
        uint amountToRefund;
    }

    mapping (bytes32 => TollStruct)       public tollStructByHash;
    mapping (address => bool)             public tollBoothExists;

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function TollBoothHolder() {
        contractOwner = msg.sender;
        isPausedValue = false;
        LogOwnerSet(contractOwner, msg.sender);
    }

    // Toll Booth

    function addTollBooth(address _tollBooth)
        public
        onlyOwner
        returns(bool success){
            if(_tollBooth == 0) revert();
            if(tollBoothExists[_tollBooth] == true) revert();
            // Adding TollBooth
                tollBoothExists[_tollBooth] = true;
                LogTollBoothAdded(msg.sender, _tollBooth);
                return true;
    }

    function isTollBooth(address _tollBooth)
        constant
        public
        returns(bool indeed){
            if(_tollBooth == 0) revert();
            if(tollBoothExists[_tollBooth] == false) return false;
                return true;
    }

    function removeTollBooth(address _tollBooth)
        public
        onlyOwner
        returns(bool success){
            if(_tollBooth == 0) revert();
            if(tollBoothExists[_tollBooth] == false) revert();
            // Removing TollBooth
                tollBoothExists[_tollBooth] = false;
                LogTollBoothRemoved(msg.sender, _tollBooth);
                return true;
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
