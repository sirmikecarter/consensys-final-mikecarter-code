pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/TollBoothHolderI.sol";
import "./interfaces/RoutePriceHolderI.sol";

contract RoutePriceHolder is OwnedI, TollBoothHolderI, RoutePriceHolderI {

    address public contractOwner;
    bool    public isPausedValue;

    struct RouteStruct {
        uint priceWeis;
        uint pendingPayments;
    }

    struct TollBoothStruct {
        address vehicle;
        address entryBooth;
        uint depositedWeis;
        uint feeTotal;
        uint amountToRefund;
    }

    mapping (bytes32 => RouteStruct)      public routeStructByHash;
    mapping (bytes32 => bool)             public routeExists;
    mapping (bytes32 => TollBoothStruct)       public tollStructByHash;
    mapping (address => bool)             public tollBoothExists;

    modifier onlyOwner () {
        if(msg.sender != contractOwner) revert();
        _;
    }

    function RoutePriceHolder() {
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

    // Route Price

    function setRoutePrice(address _entryBooth, address _exitBooth, uint _priceWeis)
        public
        onlyOwner
        returns(bool success){
            if(_entryBooth == 0) revert();
            if(_exitBooth == 0) revert();
            if(_priceWeis == 0) revert();
            if(tollBoothExists[_entryBooth] == false) revert();
            if(tollBoothExists[_exitBooth] == false) revert();
                bytes32 routeHash = keccak256(_entryBooth, _exitBooth);
                routeExists[routeHash] = true;
                RouteStruct memory routeStruct = routeStructByHash[routeHash];
                routeStruct.priceWeis = _priceWeis;
                routeStructByHash[routeHash] = routeStruct;
                LogRoutePriceSet(msg.sender, _entryBooth, _exitBooth, _priceWeis);
                return true;
    }

    function getRoutePrice(address _entryBooth, address _exitBooth)
        constant
        public
        returns(uint priceWeis){
            if(_entryBooth == 0) revert();
            if(_exitBooth == 0) revert();
            bytes32 routeHash = keccak256(_entryBooth, _exitBooth);
            RouteStruct memory routeStruct = routeStructByHash[routeHash];
            return routeStruct.priceWeis;
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
