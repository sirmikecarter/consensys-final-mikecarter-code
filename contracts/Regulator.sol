pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/RegulatorI.sol";
import "./TollBoothOperator.sol";

contract Regulator is RegulatorI, OwnedI {

    address public contractOwner;
    bool    public isPausedValue;

    struct VehicleStruct {
        uint vehicleType;
    }

    mapping (address  => bool)          public operatorExists;
    mapping (address  => VehicleStruct) public vehicleStructs;

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function Regulator() {
        contractOwner = msg.sender;
        isPausedValue = false;
        LogOwnerSet(contractOwner, msg.sender);
    }

    // Vehicle Type

    function setVehicleType (address _vehicle, uint _vehicleType)
        public
        onlyOwner
        returns(bool success){
            if(_vehicle == 0) revert();
            if(_vehicleType == 0) revert();
            // Set Vehicle Type
                vehicleStructs[_vehicle].vehicleType = _vehicleType;
                LogVehicleTypeSet(msg.sender, _vehicle, _vehicleType);
            return true;
        }

    function getVehicleType(address _vehicle)
        constant
        public
        returns(uint vehicleType){
            if(_vehicle == 0) revert();
            return vehicleStructs[_vehicle].vehicleType;
        }

    // Operator

    function createNewOperator(address _owner, uint _deposit)
        public
        onlyOwner
        returns(TollBoothOperatorI newOperator){
            if(_owner == 0) revert();
            if(_deposit == 0) revert();
                TollBoothOperator tollBoothOperator = new TollBoothOperator(true, _deposit, _owner);
                newOperator = TollBoothOperatorI(tollBoothOperator);
                operatorExists[tollBoothOperator] = true;
                LogTollBoothOperatorCreated(msg.sender, tollBoothOperator, _owner, _deposit);
            return newOperator;
    }

    function removeOperator(address _operator)
        public
        onlyOwner
        returns(bool success){
            if(_operator == 0) revert();
            if(operatorExists[_operator] == false) revert();
            // Removing operator
                operatorExists[_operator] = false;
                LogTollBoothOperatorRemoved(msg.sender, _operator);
            return true;
    }

    function isOperator(address _operator)
        constant
        public
        onlyOwner
        returns(bool indeed){
            if(_operator == 0) revert();
            if(operatorExists[_operator] == false) return false;
            return true;
    }

    // Owner

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
