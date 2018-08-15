pragma solidity ^0.4.6;

import "./interfaces/OwnedI.sol";
import "./interfaces/PausableI.sol";
import "./interfaces/RegulatedI.sol";
import "./interfaces/MultiplierHolderI.sol";
import "./interfaces/DepositHolderI.sol";
import "./interfaces/TollBoothHolderI.sol";
import "./interfaces/RoutePriceHolderI.sol";
import "./interfaces/TollBoothOperatorI.sol";
import "./Regulator.sol";

contract TollBoothOperator is
        OwnedI,
        PausableI,
        RegulatedI,
        MultiplierHolderI,
        DepositHolderI,
        TollBoothHolderI,
        RoutePriceHolderI,
        TollBoothOperatorI
    {

    bool    public isPausedValue;
    bool    public newOwner;
    address public initialRegulator;
    address public contractOwner;
    uint    public totalPaymentsAmount;
    bytes32[2][] pendingPayments;

    struct VehicleStruct {
        uint[] vehicleType;
    }

    struct MultiplierStruct {
        uint multiplier;
    }

    struct RouteStruct {
        uint priceWeis;
        uint pendingPayments;
    }

    struct PendingStruct{
        bytes32 pendingVehicleHash;
    }

    struct DepositStruct {
        uint depositWeis;
    }

    struct TollStruct {
        address vehicle;
        address entryBooth;
        uint depositedWeis;
        uint feeTotal;
        uint amountToRefund;
        bool enteredRoad;
    }

    mapping (address => VehicleStruct)       vehicleStructs;
    mapping (uint    => MultiplierStruct)    multiplierStructs;
    mapping (bytes32 => PendingStruct[])     pendingPaymentsStruct;
    mapping (address => DepositStruct)       public depositStructs;
    mapping (bytes32 => RouteStruct)         public routeStructByHash;
    mapping (bytes32 => TollStruct)          public tollStructByHash;
    mapping (address => bool)                public tollBoothExists;
    mapping (bytes32 => bool)                public routeExists;

    modifier onlyOwner () {
            if(msg.sender != contractOwner) revert();
            _;
    }

    modifier whenPaused () {
        if(isPausedValue == false) revert();
        _;
    }

    modifier whenNotPaused () {
        if(isPausedValue == true) revert();
        _;
    }

    function TollBoothOperator(bool _iPausedState, uint _iDeposit, address _iRegulator) {
            if(_iDeposit == 0) revert();
            if(_iRegulator == 0) revert();

                contractOwner = _iRegulator;
                initialRegulator = msg.sender;
                isPausedValue = _iPausedState;

    }

    // Owner

    function setOwner(address _newOwner)
        public
        onlyOwner
        returns(bool success){
            if(_newOwner == msg.sender) revert();
            if(_newOwner == 0) revert();
                if(isPaused() == false){setPaused(true);}
                LogOwnerSet(contractOwner, _newOwner);
                contractOwner = _newOwner;
                if(isPaused() == true){setPaused(false);}
                return true;
    }

    function getOwner()
        constant
        public
        returns(address){
                return contractOwner;
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

    //Regulated

    function setRegulator(address _newRegulator)
        public
        onlyOwner
        returns(bool success){
            if(_newRegulator == 0) revert();
                LogRegulatorSet(initialRegulator, _newRegulator);
                RegulatorI(_newRegulator);
                initialRegulator = _newRegulator;
                return true;
    }

    function getRegulator()
        constant
        public
        returns(RegulatorI regulator){
                regulator = RegulatorI(initialRegulator);
                return regulator;
    }

    //Multiplier

    function setMultiplier(uint _vehicleType, uint _multiplier)
        public
        onlyOwner
        whenNotPaused
        returns(bool success){
            if(_vehicleType == 0) revert();
            if(_multiplier > 0 && multiplierStructs[_vehicleType].multiplier == _multiplier) revert();
                if(isPaused() == false){setPaused(true);}
                vehicleStructs[msg.sender].vehicleType.push(_vehicleType);
                multiplierStructs[_vehicleType].multiplier = _multiplier;
                LogMultiplierSet(msg.sender, _vehicleType, _multiplier);
                if(isPaused() == true){setPaused(false);}
                return true;
    }

    function getMultiplier(uint _vehicleType)
        constant
        public
        returns(uint multiplier){
                return multiplierStructs[_vehicleType].multiplier;
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

    // Toll Booth Operator

    function hashSecret(bytes32 _secret)
        constant
        public
        returns(bytes32 hashed){
            hashed = keccak256(_secret);
            return hashed;
    }

    function enterRoad(address _entryBooth, bytes32 _exitSecretHashed)
        public
        payable
        returns (bool success){
            if(tollBoothExists[_entryBooth] == false) revert();
            uint vehicleType = Regulator(initialRegulator).getVehicleType(msg.sender);
            uint multiplier = getMultiplier(vehicleType);
            if(getMultiplier(vehicleType) == 0) revert();
            if(vehicleType <= 0) revert();
            if(msg.value < multiplier) revert();
                bytes32 vehicleHash = keccak256(_exitSecretHashed);
                TollStruct memory tollStruct = tollStructByHash[vehicleHash];
                tollStruct.vehicle = msg.sender;
                tollStruct.entryBooth = _entryBooth;
                tollStruct.enteredRoad = true;
                setDeposit(msg.value);
                tollStruct.depositedWeis = getDeposit();
                tollStructByHash[vehicleHash] = tollStruct;
                LogRoadEntered(tollStruct.vehicle, tollStruct.entryBooth, vehicleHash, tollStruct.depositedWeis);
                return true;
    }

    function getVehicleEntry(bytes32 _exitSecretHashed)
        constant
        public
        returns(address _vehicle, address _entryBooth, uint _depositedWeis){
                bytes32 vehicleHash = keccak256(_exitSecretHashed);
                TollStruct memory tollStruct = tollStructByHash[vehicleHash];
                _vehicle = tollStruct.vehicle;
                _entryBooth = tollStruct.entryBooth;
                _depositedWeis = tollStruct.depositedWeis;
                return (_vehicle, _entryBooth, _depositedWeis);
    }

    function reportExitRoad(bytes32 _exitSecretClear)
        public
        whenNotPaused
        returns (uint status){
            if(tollBoothExists[msg.sender] == false) revert();
                bytes32 vehicleHash = keccak256(_exitSecretClear);
                TollStruct memory tollStruct = tollStructByHash[vehicleHash];
                uint vehicleType = Regulator(initialRegulator).getVehicleType(tollStruct.vehicle);
            if(getMultiplier(vehicleType) == 0) revert();
                uint multiplier = getMultiplier(vehicleType);
                uint finalFee = getRoutePrice(tollStruct.entryBooth, msg.sender) * multiplier;

                if (finalFee == 0){
                    tollStruct.amountToRefund = tollStruct.depositedWeis - finalFee;
                    tollStruct.feeTotal = finalFee;
                    tollStruct.enteredRoad == false;
                    tollStructByHash[vehicleHash] = tollStruct;

                    bytes32 routeHash = keccak256(tollStruct.entryBooth, msg.sender);
                    RouteStruct memory routeStruct = routeStructByHash[routeHash];
                    routeStruct.pendingPayments++;
                    routeStructByHash[routeHash] = routeStruct;

                    pendingPaymentsStruct[routeHash].push(PendingStruct(vehicleHash));

                    LogPendingPayment(_exitSecretClear, tollStruct.entryBooth, msg.sender);
                }else if (finalFee >= tollStruct.depositedWeis){
                    tollStruct.amountToRefund = 0;
                    tollStruct.feeTotal = finalFee;
                    tollStruct.enteredRoad == false;
                    tollStructByHash[vehicleHash] = tollStruct;
                    totalPaymentsAmount += finalFee;
                }else{
                    tollStruct.amountToRefund = tollStruct.depositedWeis - finalFee;
                    tollStruct.feeTotal = finalFee;
                    tollStruct.enteredRoad == false;
                    tollStruct.vehicle.transfer(tollStruct.amountToRefund);
                    tollStructByHash[vehicleHash] = tollStruct;
                    totalPaymentsAmount += finalFee;
                }

                LogRoadExited(msg.sender, _exitSecretClear, tollStruct.feeTotal, tollStruct.amountToRefund);
                return tollStruct.amountToRefund;
    }

    function getPendingPaymentCount(address _entryBooth, address _exitBooth)
        constant
        public
        returns (uint count){
                bytes32 routeHash = keccak256(_entryBooth, _exitBooth);
                RouteStruct memory routeStruct = routeStructByHash[routeHash];
                return routeStruct.pendingPayments;
    }

    function clearSomePendingPayments(address _entryBooth, address _exitBooth, uint _count)
        public
        whenNotPaused
        returns (bool success){
            if(tollBoothExists[_entryBooth] == false) revert();
            if(tollBoothExists[_exitBooth] == false) revert();
            if(_count == 0) revert();
            if(getPendingPaymentCount(_entryBooth, _exitBooth) == 0) revert();
            if(_count > getPendingPaymentCount(_entryBooth, _exitBooth)) revert();

                bytes32 routeHash = keccak256(_entryBooth, _exitBooth);
                RouteStruct memory routeStruct = routeStructByHash[routeHash];

                bytes32 vehicleHash = pendingPaymentsStruct[routeHash][0].pendingVehicleHash;
                TollStruct memory tollStruct = tollStructByHash[vehicleHash];

                uint vehicleType = Regulator(initialRegulator).getVehicleType(tollStruct.vehicle);
                uint multiplier = getMultiplier(vehicleType);
                uint finalFee = getRoutePrice(tollStruct.entryBooth, msg.sender) * multiplier;

                if (finalFee >= tollStruct.depositedWeis){
                    tollStruct.amountToRefund = 0;
                    routeStruct.pendingPayments -= 1;
                    tollStruct.feeTotal = finalFee;
                    totalPaymentsAmount += finalFee;
                    tollStructByHash[vehicleHash] = tollStruct;
                    routeStructByHash[routeHash] = routeStruct;

                }else{
                    tollStruct.amountToRefund = tollStruct.depositedWeis - finalFee;
                    tollStruct.feeTotal = finalFee;
                    routeStruct.pendingPayments -= 1;
                    totalPaymentsAmount += finalFee;
                    tollStruct.vehicle.transfer(tollStruct.amountToRefund);
                    tollStructByHash[vehicleHash] = tollStruct;
                    routeStructByHash[routeHash] = routeStruct;
                }

                return true;
    }

    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount){
                return totalPaymentsAmount;
    }

    function withdrawCollectedFees()
        public
        onlyOwner
        returns(bool success){
            if(totalPaymentsAmount == 0) revert();
                contractOwner.transfer(totalPaymentsAmount);
                LogFeesCollected(contractOwner, totalPaymentsAmount);
                return true;
    }

    // Fallback

    function () { revert(); }

}
