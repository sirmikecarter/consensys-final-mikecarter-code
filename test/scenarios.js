var Regulator = artifacts.require("./Regulator.sol");
var TollBoothOperator = artifacts.require('./TollBoothOperator.sol');

contract('Regulator', function(accounts) {

		var contract;
		var contractReg;
		var operatorAddress;
		var owner = accounts[0];
	  var PausedState = true;
	  var Deposit = 10;
	  var tollBooth1 = accounts[1];
	  var tollBooth2 = accounts[2];
		var vehicle1 = accounts[3];
		var vehicle2 = accounts[4];

	beforeEach(function() {
		return Regulator.deployed()
		.then(function(instance) {
			contractReg = instance;
      return contractReg.createNewOperator.call(web3.eth.coinbase, 10, {from: web3.eth.coinbase})
    }).then(function(address) {
				operatorAddress = address.valueOf();
				return contractReg.createNewOperator(web3.eth.coinbase, 10, {from: web3.eth.coinbase, gas: 4000000});
		})
	});

	it("should compile without errors", function() {
			assert.strictEqual(true, true, "Something is wrong.");
	});

	it("should be owned by owner", function() {
			return TollBoothOperator.at(operatorAddress).getOwner({from: owner})
			.then(function(ownerVar){
			assert.strictEqual(ownerVar, owner, "Contract is not owned by owner");
		})
	});

	it("should be un-paused", function() {
			return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
			.then(function(txt){
			return TollBoothOperator.at(operatorAddress).isPaused({from: owner})
		}).then(function(pausedVar){
			assert.strictEqual(pausedVar, false, "Contract is Un-Paused");
		})
	});

	it("should set and get multiplier", function() {
			return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
		 .then(function(txt){
			return TollBoothOperator.at(operatorAddress).setMultiplier(1, 2, {from: owner, gas: 4000000})
		}).then(function(txt){
			return TollBoothOperator.at(operatorAddress).getMultiplier(1, {from: owner})
		}).then(function(tollBoothVar){
			assert.strictEqual(Number(tollBoothVar.valueOf()), 2, "Multiplier is Set");
		})
	});

		it("should add toll booth 1", function() {
				return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
			 .then(function(txt){
				return TollBoothOperator.at(operatorAddress).isTollBooth(tollBooth1, {from: owner})
			}).then(function(tollBoothVar){
				assert.strictEqual(tollBoothVar.valueOf(), true, "TollBooth1 Exists");
			})
		});

		it("should add toll booth 2", function() {
				return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
			 .then(function(txt){
				return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
			}).then(function(tollBoothVar){
				assert.strictEqual(tollBoothVar.valueOf(), true, "TollBooth2 Exists");
			})
		});

		it("should set and get route price", function() {
				return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
				.then(function(tollBoothVar){
				return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
			}).then(function(tollBoothVar){
				return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
			}).then(function(tollBoothVar){
				return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
			}).then(function(tollBoothVar){
				return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 10, { from: owner })
			}).then(function(tollBoothVar){
				return TollBoothOperator.at(operatorAddress).getRoutePrice(tollBooth1, tollBooth2, { from: owner })
			}).then(function(tollBoothVar){
				assert.strictEqual(Number(tollBoothVar.valueOf()), 10, "Route Price Set");
			})
		});

it("Scenario 1: Deposits required. Route price equals the deposit", function() {
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
		.then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 10, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getRoutePrice(tollBooth1, tollBooth2, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
	}).then(function(PausedVar){
		return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
	}).then(function(PausedVar){
		return TollBoothOperator.at(operatorAddress).setMultiplier(3, 1, {from: owner, gas: 4000000})
	}).then(function(txt){
		return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
	}).then(function(multiplierVar){
		return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 10})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
	}).then(function(vehicleEntryVar){
		return TollBoothOperator.at(operatorAddress).reportExitRoad.call(false, {from: tollBooth2})
	}).then(function(exitRoadVar){
		assert.strictEqual(Number(exitRoadVar), 0, "Vehicle1 exited TollBooth2");
	})
});

it("Scenario 2: Deposits required. Route price more than the deposit", function() {
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
		.then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 20, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getRoutePrice(tollBooth1, tollBooth2, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
	}).then(function(PausedVar){
		return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
	}).then(function(PausedVar){
		return TollBoothOperator.at(operatorAddress).setMultiplier(3, 1, {from: owner, gas: 4000000})
	}).then(function(txt){
		return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
	}).then(function(multiplierVar){
		return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 10})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
	}).then(function(vehicleEntryVar){
		return TollBoothOperator.at(operatorAddress).reportExitRoad.call(false, {from: tollBooth2})
	}).then(function(exitRoadVar){
		assert.strictEqual(Number(exitRoadVar), 0, "Vehicle1 exited TollBooth2");
	})
});

it("Scenario 3: Deposits required. Route price less than the deposit", function() {
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
		.then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 20, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getRoutePrice(tollBooth1, tollBooth2, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
	}).then(function(PausedVar){
		return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
	}).then(function(PausedVar){
		return TollBoothOperator.at(operatorAddress).setMultiplier(3, 1, {from: owner, gas: 4000000})
	}).then(function(txt){
		return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
	}).then(function(multiplierVar){
		return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 40})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
	}).then(function(vehicleEntryVar){
		return TollBoothOperator.at(operatorAddress).reportExitRoad.call(false, {from: tollBooth2})
	}).then(function(exitRoadVar){
		assert.strictEqual(Number(exitRoadVar), 20, "Vehicle1 exited TollBooth2");
	})
});

it("Scenario 4: Deposits more than required. Route price equal the deposit", function() {
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
		.then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setRoutePrice(tollBooth1, tollBooth2, 20, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getRoutePrice(tollBooth1, tollBooth2, { from: owner })
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
	}).then(function(PausedVar){
		return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
	}).then(function(PausedVar){
		return TollBoothOperator.at(operatorAddress).setMultiplier(3, 2, {from: owner, gas: 4000000})
	}).then(function(txt){
		return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
	}).then(function(multiplierVar){
		return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 40})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
	}).then(function(vehicleEntryVar){
		return TollBoothOperator.at(operatorAddress).reportExitRoad.call(false, {from: tollBooth2})
	}).then(function(exitRoadVar){
		assert.strictEqual(Number(exitRoadVar), 0, "Vehicle1 exited TollBooth2");
	})
});

it("Scenario 5: Deposits more than required. Route price is unknown", function() {
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
		.then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
	}).then(function(PausedVar){
		return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
	}).then(function(PausedVar){
		return TollBoothOperator.at(operatorAddress).setMultiplier(3, 2, {from: owner, gas: 4000000})
	}).then(function(txt){
		return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
	}).then(function(multiplierVar){
		return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 20})
	}).then(function(tollBoothVar){
		return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
	}).then(function(vehicleEntryVar){
		return TollBoothOperator.at(operatorAddress).reportExitRoad(false, {from: tollBooth2})
	}).then(function(exitRoadVar){
		return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
	}).then(function(exitRoadVar){
		return TollBoothOperator.at(operatorAddress).clearSomePendingPayments(tollBooth1, tollBooth2, 1, {from: owner})
	}).then(function(exitRoadVar){
		return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
	}).then(function(exitRoadVar){
		assert.strictEqual(Number(exitRoadVar), 0, "Vehicle1 exited TollBooth2");
	})
});

  it("Scenario 6: Deposits more than required. Route price is unknown. Two Vehicles", function() {
      return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth1, {from: owner})
      .then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).addTollBooth(tollBooth2, {from: owner})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth1, {from: owner})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).tollBoothExists(tollBooth2, {from: owner})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).setPaused(false, {from: owner})
    }).then(function(PausedVar){
      return contractReg.setVehicleType(vehicle1, 3, {from: web3.eth.coinbase})
    }).then(function(PausedVar){
      return contractReg.setVehicleType(vehicle2, 5, {from: web3.eth.coinbase})
    }).then(function(PausedVar){
      return TollBoothOperator.at(operatorAddress).setMultiplier(3, 2, {from: owner, gas: 4000000})
    }).then(function(txt){
      return TollBoothOperator.at(operatorAddress).getMultiplier(3, {from: owner})
    }).then(function(PausedVar){
      return TollBoothOperator.at(operatorAddress).setMultiplier(5, 2, {from: owner, gas: 4000000})
    }).then(function(txt){
      return TollBoothOperator.at(operatorAddress).getMultiplier(5, {from: owner})
    }).then(function(multiplierVar){
      return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, false, {from: vehicle1, value: 20})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).getVehicleEntry(false, {from: owner})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).enterRoad(tollBooth1, true, {from: vehicle2, value: 20})
    }).then(function(tollBoothVar){
      return TollBoothOperator.at(operatorAddress).getVehicleEntry(true, {from: owner})
    }).then(function(vehicleEntryVar){
      return TollBoothOperator.at(operatorAddress).reportExitRoad(false, {from: tollBooth2})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).clearSomePendingPayments(tollBooth1, tollBooth2, 1, {from: owner})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
    }).then(function(exitRoadVar){
      assert.strictEqual(Number(exitRoadVar), 0, "Vehicle1 exited TollBooth2");
      return TollBoothOperator.at(operatorAddress).reportExitRoad(true, {from: tollBooth2})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).clearSomePendingPayments(tollBooth1, tollBooth2, 1, {from: owner})
    }).then(function(exitRoadVar){
      return TollBoothOperator.at(operatorAddress).getPendingPaymentCount.call(tollBooth1, tollBooth2, {from: owner})
    }).then(function(exitRoadVar){
      assert.strictEqual(Number(exitRoadVar), 0, "Vehicle2 exited TollBooth2");
    })
  });


  });
