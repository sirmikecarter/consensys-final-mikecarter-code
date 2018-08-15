pragma solidity ^0.4.6;

import "./interfaces/RegulatedI.sol";

contract Regulated is RegulatedI {

    address public initialRegulator;
    bool    public isPausedValue;

    modifier onlyOwner () {
        if(msg.sender != initialRegulator) revert();
        _;
    }

    function Regulated(address _initialRegulator) {
        if(_initialRegulator == 0) revert();
        isPausedValue = false;
        initialRegulator = msg.sender;
    }

    //Regulated

    function setRegulator(address _newRegulator)
        public
        onlyOwner
        returns(bool success){
            if(_newRegulator == msg.sender) revert();
            if(_newRegulator == 0) revert();
                if(isPausedValue == false){isPausedValue = true;}
                LogRegulatorSet(initialRegulator, _newRegulator);
                RegulatorI(_newRegulator);
                initialRegulator = _newRegulator;
                if(isPausedValue == true){isPausedValue = false;}
                return true;
    }

    function getRegulator()
        constant
        public
        returns(RegulatorI regulator){
                regulator = RegulatorI(initialRegulator);
                return regulator;
    }

}
