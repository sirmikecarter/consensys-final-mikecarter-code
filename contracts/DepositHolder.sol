pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/DepositHolderI.sol";

contract DepositHolder is OwnedI, DepositHolderI {

    address public contractOwner;
    bool    public isPausedValue;

    struct DepositStruct {
        uint depositWeis;
    }

    mapping (address => DepositStruct)    public depositStructs;

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function DepositHolder(uint _initialDeposit) {
        if(_initialDeposit == 0) revert();
        depositStructs[msg.sender].depositWeis = _initialDeposit;
        LogDepositSet(msg.sender, _initialDeposit);
        contractOwner = msg.sender;
        isPausedValue = false;
        LogOwnerSet(contractOwner, msg.sender);
    }

    // Deposit

    function setDeposit(uint _depositWeis)
        public
        returns(bool success){
            if(_depositWeis == 0) revert();
                depositStructs[msg.sender].depositWeis = _depositWeis;
                LogDepositSet(msg.sender, _depositWeis);
                return true;
    }

    function getDeposit()
        constant
        public
        returns(uint weis){
                return depositStructs[msg.sender].depositWeis;
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
