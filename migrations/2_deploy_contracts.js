var TollBoothOperator = artifacts.require("./TollBoothOperator.sol");
var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer) {

  var Owner = web3.eth.accounts[0];
  var tollBooth1 = web3.eth.accounts[1];
  var tollBooth2 = web3.eth.accounts[2];
  var vehicle1 = web3.eth.accounts[3];
  var vehicle2 = web3.eth.accounts[4];

  deployer.deploy(Regulator).then(function() {
    Regulator.deployed().then(function (instance) {
      contract = instance;
      return contract.createNewOperator.call(Owner, 25, {from: Owner});
    }).then(function(newOperatorAddress) {
      operatorAddress = newOperatorAddress.valueOf();
        return contract.createNewOperator(Owner, 25, {from: Owner});
    }).then(function() {
        return TollBoothOperator.at(operatorAddress).setPaused(false, {from: Owner});
    }).then(function() {
        return contract.setVehicleType(vehicle1, 3, {from: Owner});
    }).then(function() {
        return contract.setVehicleType(vehicle2, 5, {from: Owner});
    }).then(function() {
        return TollBoothOperator.at(operatorAddress).isPaused.call({from: Owner});
    }).then(function(value) {
        console.log("Toll Booth Operator - is Paused: ", value.valueOf());
    return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: Owner});
    }).then(function() {
        return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: Owner});
    }).then(function() {
        return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 10, {from: Owner});
    }).catch(function(e) {
        console.log(e);
    });
  });
} // End of module
