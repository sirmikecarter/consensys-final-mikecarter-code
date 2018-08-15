pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/MultiplierHolderI.sol";

contract MultiplierHolder is OwnedI, MultiplierHolderI {

    address public contractOwner;
    bool    public isPausedValue;
    bool    public newOwner;

    struct VehicleStruct {
        uint[] vehicleType;
    }

    struct MultiplierStruct {
        uint multiplier;
    }

    mapping (address    => VehicleStruct)    vehicleStructs;
    mapping (uint    => MultiplierStruct)    multiplierStructs;

    modifier onlyOwner () {
      if(msg.sender != contractOwner) revert();
      _;
    }

    function MultiplierHolder() {

        contractOwner = msg.sender;
        isPausedValue = false;
        LogOwnerSet(contractOwner, msg.sender);
    }

    //Multiplier

    function setMultiplier(uint _vehicleType, uint _multiplier)
        public
        onlyOwner
        returns(bool success){
            if(_vehicleType == 0) revert();
            if(_multiplier > 0 && multiplierStructs[_vehicleType].multiplier == _multiplier) revert();
                if(isPausedValue == false){isPausedValue = true;}
                vehicleStructs[msg.sender].vehicleType.push(_vehicleType);
                multiplierStructs[_vehicleType].multiplier = _multiplier;
                LogMultiplierSet(msg.sender, _vehicleType, _multiplier);
                if(isPausedValue == true){isPausedValue = false;}
                return true;
    }

    function getMultiplier(uint _vehicleType)
        constant
        public
        returns(uint multiplier){
                return multiplierStructs[_vehicleType].multiplier;
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
