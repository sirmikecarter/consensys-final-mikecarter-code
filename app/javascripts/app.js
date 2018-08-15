// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import regulator_artifacts from '../../build/contracts/Regulator.json'
import tollBoothOperator_artifacts from '../../build/contracts/TollBoothOperator.json'

// Contacts
var Regulator = contract(regulator_artifacts);
var TollBoothOperator = contract(tollBoothOperator_artifacts);

// Variables
var TollBoothOperatorContract;
var TollBoothOperatorOwner;
var numOperators=[];

// Module
var app = angular.module("myApp", ["ngRoute"]);

//RouteProvider for Links
app.config(function($routeProvider) {
    $routeProvider
    // route for the regulator page
    .when('/', {
        templateUrl : 'app/regulator.html',
        controller  : 'regulatorController'
    })
    // route for the tollbooth operator page
    .when('/operator', {
        templateUrl : 'app/tollBoothOperator.html',
        controller  : 'tollBoothOperatorController'
    })
    // route for the vehicles page
    .when('/vehicles', {
        templateUrl : 'app/vehicles.html',
        controller  : 'vehiclesController'
    })
    // route for the tollBooths page
    .when('/tollbooths', {
        templateUrl : 'app/tollbooths.html',
        controller  : 'tollBoothsController'
    });
});

////
//// Regulator Controller
////
app.controller("regulatorController", function ($scope) {

  $scope.message = "Regulator Page";

  // Array declaration
  $scope.vehicleLog=[];
  $scope.operatorLog=[];
  $scope.numAccounts=[];
  $scope.numOperators = [];

  // Display message if No account selected
  $scope.balance = "Select an Account";
  $scope.balanceInEth = "Select an Account";
  $scope.contractOwner = web3.eth.coinbase;

  //Set the Contract Instance of Regulator
  Regulator.deployed()
      .then(function(_instance) {
          $scope.contractReg = _instance;
          onVehicleTypeAdded();
          onNewOperatorAdded();
        return $scope.getCurrentBlockNumber();
  })

  // Event Watcher Functions

  function onVehicleTypeAdded() {
  $scope.contractReg.LogVehicleTypeSet({}, {fromBlock: 0})
      .watch(function(err, _newVehicleType) {
        if(err)
        {
          console.error(err);
      } else {
        $scope.vehicleLog.push(_newVehicleType);
        $scope.$apply();
      }
    });
  }

  function onNewOperatorAdded() {
  $scope.contractReg.LogTollBoothOperatorCreated({}, {fromBlock: 0})
      .watch(function(err, _newOperator) {
        if(err)
        {
          console.error(err);
      } else {
        $scope.operatorLog.push(_newOperator);
        TollBoothOperatorContract = _newOperator.args.newOperator;
        numOperators.push(_newOperator.args.newOperator);
        TollBoothOperatorOwner = _newOperator.args.owner;
        $scope.$apply();
      }
    });
  }

  // Functions from Page

  $scope.setVehicleType = function() {
      if(parseInt($scope.vehicleType)<=0) return;
      if($scope.accountSelect == null) return;
        var newVehicleType = $scope.vehicleType;
        var newOwner = $scope.accountSelect.valueOf();
      $scope.contractReg.setVehicleType(newOwner, newVehicleType, {from: web3.eth.coinbase, gas: 4000000})
      .then(function(txn) {
        //console.log("Transaction Receipt", txn);
        $scope.getAccountBalances();
        $scope.getCurrentBlockNumber();
      })
      .catch(function(error){
          console.log("Error processing contribution", error);
      })
  }

  $scope.createOperator = function() {
      if(parseInt($scope.operatorDeposit)<=0) return;
      if($scope.accountSelect == null) return;
        var newDeposit = $scope.operatorDeposit;
        var newOwner = $scope.accountSelect.valueOf();
      $scope.contractReg.createNewOperator(newOwner, newDeposit, {from: web3.eth.coinbase, gas: 4000000})
      .then(function(txn) {
          //console.log("Transaction Receipt", txn);
          $scope.getAccountBalances();
          $scope.getCurrentBlockNumber();
      })
      .catch(function(error){
          console.log("Error processing contribution", error);
      });
  }

  // On the change of the Account combo
  $scope.onAccountChange = function () {
      if($scope.accountSelect != null){
          //Get the Account Balances
          return $scope.getAccountBalances();
      } else {
          //Display message if No Account selected
          $scope.balance = "Select an Account";
          $scope.balanceInEth = "Select an Account";
      }
  }

  //Get the Account Balances
  $scope.getAccountBalances = function () {
      web3.eth.getBalance($scope.accountSelect, function(err, _balance){
        $scope.balance = _balance.toString(10);
        $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
        $scope.$apply();
      })
  }

  //Get the Curent Block Number
  $scope.getCurrentBlockNumber = function() {
      web3.eth.getBlockNumber(function(err, bn) {
        if(err) {
            console.log("error getting block number", err);
        } else {
            $scope.blockNumber = bn;
            $scope.$apply();
        }
      })
  }

  //Get the Accounts
  web3.eth.getAccounts(function(err, accs) {
      if(err !=null) {
        alert("There was an error fetching your accounts.");
        return;
      }
        if(accs.length==0) {
        alert("Couldn't get any accounts. Make sure your Ethereum client is configured correctly.")
        return;
      }
        $scope.accounts = accs;
        $scope.account = $scope.accounts[0];

      //Populate the Accounts ComboBox
      for (var i = 0; i < accs.length; i++) {
        $scope.numAccounts.push($scope.accounts[i]);
      }
  });

}); // End Controller

////
//// TollBooth Operator Controller
////
app.controller("tollBoothOperatorController", function ($scope) {
  $scope.message = "TollBooth Operator Page";

  // TollBooth Contract Instance
  var TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
  var TollBoothInstance = TollBoothOperator.at(TollBoothOperatorContract);

  // Array declaration
  $scope.numOperators = [];
  $scope.numTollBooths = [];
  $scope.numTollBoothsExist = [];
  $scope.numBaseRoutePrices = [];
  $scope.numAccounts=[];
  $scope.numMultipliers=[];

  // Display message if No account selected
  $scope.balance = "Select an Account";
  $scope.balanceInEth = "Select an Account";
  $scope.TollBoothOperatorContract = "Select an Account";
  $scope.TollBoothOperatorOwner = "Select an Account";

  // Deployed Regulator contract

  Regulator.deployed()
    .then(function(_instance) {
      $scope.contractReg = _instance;
      $scope.newOperatorWatcher = $scope.contractReg.LogTollBoothOperatorCreated({}, {fromBlock: 0})
    .watch(function(err, _newOperator) {
    if(err) {
      console.log("Error watching contriubution events", err);
    }else{
      $scope.numOperators.push(_newOperator.args.newOperator);
      $scope.getCurrentBlockNumber();
      $scope.$apply();
      }
    })
  })

  // Event Watcher Functions

  function onBaseRoutePriceAdded() {

  TollBoothInstance.LogRoutePriceSet({}, {fromBlock: 0})
      .watch(function(err, received) {
        if(err)
        {
          console.error(err);
        } else {
          $scope.numBaseRoutePrices.push(received);
          $scope.$apply();
        }
      });
  }

  function onMultiplierAdded() {

  TollBoothInstance.LogMultiplierSet({}, {fromBlock: 0})
      .watch(function(err, received) {
        if(err)
        {
          console.error(err);
        } else {
          $scope.numMultipliers.push(received);
          $scope.$apply();
        }
      });
  }

  function onTollBoothAdded() {

  TollBoothInstance.LogTollBoothAdded({}, {fromBlock: 0})
      .watch(function(err, received) {
        if(err)
        {
          console.error(err);
        } else {
          //console.log("Faucet balance: " + received.args.tollBooth);
          $scope.numTollBooths.push(received);
          $scope.numTollBoothsExist.push(received.args.tollBooth);
          $scope.$apply();
        }
      });
  }

  //Create a Toll Booth
  $scope.addTollBooth = function() {
    if($scope.accountSelect == null) return;
    if($scope.operatorSelect == null) return;
      var newTollBooth = $scope.accountSelect.valueOf();
      TollBoothInstance.addTollBooth(newTollBooth, {from: $scope.TollBoothOperatorOwner, gas: 125000}, function(err, result){
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            onTollBoothAdded();
        }
      });
  }

  //Create a Set Multiplier
  $scope.setMultiplier = function() {
    if($scope.operatorSelect == null) return;
    if(parseInt($scope.multiplier)<=0) return;
      TollBoothInstance.setMultiplier($scope.vehicleType, $scope.multiplier, {from: $scope.TollBoothOperatorOwner, gas: 125000}, function(err, result){
        if (err) {
            console.error(err);
        } else {
            //console.log(result);
            onMultiplierAdded();
        }
      });
  }

  //Create a Set Vehicle Type
  $scope.setBaseRoutePrice = function() {
    if($scope.tollBooth1Select == null) return;
    if($scope.tollBooth2Select == null) return;
    if(parseInt($scope.baseRoutePrice)<=0) return;
      TollBoothInstance.setRoutePrice($scope.tollBooth1Select, $scope.tollBooth2Select, $scope.baseRoutePrice, {from: $scope.TollBoothOperatorOwner, gas: 125000}, function(err, result){
        if (err) {
            console.error(err);
        } else {
            //console.log(result);
            onBaseRoutePriceAdded();
        }
        });
  }

  //When the Operator combobox changes, update addresses
  $scope.onOperatorChange = function () {
        if($scope.operatorSelect != null){
            //Get the Account Balances
            return $scope.getOperatorAddresses();
        } else {
              //Display message if No Account selected
              $scope.TollBoothOperatorContract = "Select an Account";
              $scope.TollBoothOperatorOwner = "Select an Account";
        }
  }

  //Get Operator Addresses
  $scope.getOperatorAddresses = function () {
    $scope.TollBoothOperatorContract = $scope.operatorSelect;
    TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
    TollBoothInstance = TollBoothOperator.at($scope.TollBoothOperatorContract);
    TollBoothInstance.getOwner({from: web3.eth.coinbase, gas: 75000}, function(err, address){
        if (err) {
              console.error(err);
        } else {
              $scope.TollBoothOperatorOwner = address;
              // Array declaration
              $scope.numTollBooths = [];
              $scope.numTollBoothsExist = [];
              $scope.numBaseRoutePrices = [];
              $scope.numMultipliers=[];
              $scope.getCurrentBlockNumber();
              $scope.$apply();
              onTollBoothAdded();
              onBaseRoutePriceAdded();
              onMultiplierAdded();
            }
        });
  }

  // On the change of the Account combo
  $scope.onAccountChange = function () {
      if($scope.accountSelect != null){
          //Get the Account Balances
          return $scope.getAccountBalances();
      } else {
          //Display message if No Account selected
          $scope.balance = "Select an Account";
          $scope.balanceInEth = "Select an Account";
      }
  }

  //Get the Account Balances
  $scope.getAccountBalances = function () {
      web3.eth.getBalance($scope.accountSelect, function(err, _balance){
        $scope.balance = _balance.toString(10);
        $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
        $scope.$apply();
      })
  }

  //Get the Curent Block Number
  $scope.getCurrentBlockNumber = function() {
      web3.eth.getBlockNumber(function(err, bn) {
        if(err) {
            console.log("error getting block number", err);
        } else {
            $scope.blockNumber = bn;
            $scope.$apply();
        }
      })
  }

  //Get the Accounts
  web3.eth.getAccounts(function(err, accs) {
      if(err !=null) {
        alert("There was an error fetching your accounts.");
        return;
      }
        if(accs.length==0) {
        alert("Couldn't get any accounts. Make sure your Ethereum client is configured correctly.")
        return;
      }
        $scope.accounts = accs;
        $scope.account = $scope.accounts[0];

      //Populate the Accounts ComboBox
      for (var i = 0; i < accs.length; i++) {
        $scope.numAccounts.push($scope.accounts[i]);
      }
  });
}); // End Controller

////
//// Vehicles Controller
////
app.controller("vehiclesController", function ($scope) {
  $scope.message = "Vehicles Page";

  // TollBoothOperator Contract
  var TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
  var TollBoothInstance = TollBoothOperator.at(TollBoothOperatorContract);

  // Array declaration
  $scope.numAccounts=[];
  $scope.numMultipliers=[];
  $scope.numOperators = [];
  $scope.numTollBooths = [];
  $scope.numTollBoothsExist = [];
  $scope.numBaseRoutePrices = [];
  $scope.numRoadsEntered = [];
  $scope.numVehiclesExit = [];

  // Display message if No account selected
  $scope.balance = "Select an Account";
  $scope.balanceInEth = "Select an Account";
  $scope.TollBoothOperatorContract = "Select an Account";
  $scope.TollBoothOperatorOwner = "Select an Account";

  // Deployed Regulator Contract
  Regulator.deployed()
    .then(function(_instance) {
      $scope.contractReg = _instance;
      $scope.newOperatorWatcher = $scope.contractReg.LogTollBoothOperatorCreated({}, {fromBlock: 0})
        .watch(function(err, _newOperator) {
          if(err) {
            console.log("Error watching contriubution events", err);
          }else{
            $scope.numOperators.push(_newOperator.args.newOperator);
            $scope.getCurrentBlockNumber();
            $scope.$apply();
          }
        })
  })

  // Event Watcher Functions

  function onEnterRoadAdded() {

   TollBoothInstance.LogRoadEntered({}, {fromBlock: 0})
      .watch(function(err, received) {
      if(err)
      {
        console.error(err);
      } else {
          $scope.numRoadsEntered.push(received);
          $scope.getCurrentBlockNumber();
          $scope.$apply();
      }
    });
  }

  function onTollBoothAdded() {

   TollBoothInstance.LogTollBoothAdded({}, {fromBlock: 0})
      .watch(function(err, received) {
      if(err)
      {
        console.error(err);
      } else {
          $scope.numTollBooths.push(received);
          $scope.numTollBoothsExist.push(received.args.tollBooth);
          $scope.getCurrentBlockNumber();
          $scope.$apply();
          }
      });
  }

  function onVehicleExit() {

    TollBoothInstance.LogRoadExited({}, {fromBlock: 0})
        .watch(function(err, received) {
        if(err)
        {
          console.error(err);
        } else {
          $scope.numVehiclesExit.push(received);
          $scope.getCurrentBlockNumber();
          $scope.$apply();
        }
    });
  }

  // Page functions

  //Set Vehicle Entry
  $scope.setVehicleEntry = function() {
    if($scope.accountSelect == null) return;
    if($scope.operatorSelect == null) return;
    if($scope.tollBooth1Select == null) return;
    if(parseInt($scope.entryDeposit)<=0) return;
      var newVehicle = $scope.accountSelect.valueOf();
      var newTollBooth = $scope.tollBooth1Select.valueOf();
      var newHash = $scope.secretHash.valueOf();

      TollBoothInstance.enterRoad(newTollBooth, $scope.secretHash, {from: newVehicle, value: $scope.entryDeposit, gas: 150000}, function(err, result){
        if (err) {
          console.error(err);
        } else {
            console.log(result);
            onEnterRoadAdded();
        }
      });
  }

  //When the Operator combobox changes, updates addresses
  $scope.onOperatorChange = function () {
    if($scope.operatorSelect != null){
      //Get the Account Balances
      return $scope.getOperatorAddresses();
    } else {
      //Display message if No Account selected
      $scope.TollBoothOperatorContract = "Select an Account";
      $scope.TollBoothOperatorOwner = "Select an Account";
    }
  }

  //Get Operator Addresses
  $scope.getOperatorAddresses = function () {

    $scope.TollBoothOperatorContract = $scope.operatorSelect;
    TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
    TollBoothInstance = TollBoothOperator.at($scope.TollBoothOperatorContract);

    TollBoothInstance.getOwner({from: web3.eth.coinbase, gas: 75000}, function(err, address){
      if (err) {
        console.error(err);
      } else {
        $scope.TollBoothOperatorOwner = address;
        // Array declaration
        $scope.numTollBooths = [];
        $scope.numTollBoothsExist = [];
        $scope.numRoadsEntered = [];
        $scope.numVehiclesExit = [];
        $scope.getCurrentBlockNumber();
        $scope.$apply();
        onTollBoothAdded();
        onEnterRoadAdded();
        onVehicleExit();
      }
    });
  }

  // On the change of the Account combo
  $scope.onAccountChange = function () {
      if($scope.accountSelect != null){
          //Get the Account Balances
          return $scope.getAccountBalances();
      } else {
          //Display message if No Account selected
          $scope.balance = "Select an Account";
          $scope.balanceInEth = "Select an Account";
      }
  }

  //Get the Account Balances
  $scope.getAccountBalances = function () {
      web3.eth.getBalance($scope.accountSelect, function(err, _balance){
        $scope.balance = _balance.toString(10);
        $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
        $scope.getCurrentBlockNumber();
        $scope.$apply();
      })
  }

  //Get the Curent Block Number
  $scope.getCurrentBlockNumber = function() {
      web3.eth.getBlockNumber(function(err, bn) {
        if(err) {
            console.log("error getting block number", err);
        } else {
            $scope.blockNumber = bn;
            $scope.$apply();
        }
      })
  }

  //Get the Accounts
  web3.eth.getAccounts(function(err, accs) {
      if(err !=null) {
        alert("There was an error fetching your accounts.");
        return;
      }
        if(accs.length==0) {
        alert("Couldn't get any accounts. Make sure your Ethereum client is configured correctly.")
        return;
      }
        $scope.accounts = accs;
        $scope.account = $scope.accounts[0];

      //Populate the Accounts ComboBox
      for (var i = 0; i < accs.length; i++) {
        $scope.numAccounts.push($scope.accounts[i]);
      }
  });
}); // End Controller

//
// TollBooth Controller
//
app.controller("tollBoothsController", function ($scope) {

  $scope.message = "Toll Booths Page";

  // TollBoothOperator Contract Instance
  var TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
  var TollBoothInstance = TollBoothOperator.at(TollBoothOperatorContract);

  // Array declaration
  $scope.numAccounts=[];
  $scope.numMultipliers=[];
  $scope.numOperators = [];
  $scope.numTollBooths = [];
  $scope.numTollBoothsExist = [];
  $scope.numBaseRoutePrices = [];
  $scope.numRoadsEntered = [];
  $scope.numVehiclesExit = [];
  $scope.numPendingPayments = [];

  // Display message if No account selected
  $scope.balance = "Select an Account";
  $scope.balanceInEth = "Select an Account";
  $scope.TollBoothOperatorContract = "Select an Account";
  $scope.TollBoothOperatorOwner = "Select an Account";

  //Deployed Regulator Contract
  Regulator.deployed()
    .then(function(_instance) {
      $scope.contractReg = _instance;
      $scope.newOperatorWatcher = $scope.contractReg.LogTollBoothOperatorCreated({}, {fromBlock: 0})
        .watch(function(err, _newOperator) {
          if(err) {
            console.log("Error watching contriubution events", err);
          }else{
            $scope.numOperators.push(_newOperator.args.newOperator);
            $scope.getCurrentBlockNumber();
            $scope.$apply();
          }
        })
  })

  // Event Watcher Functions

  function onTollBoothAdded() {
    TollBoothInstance.LogTollBoothAdded({}, {fromBlock: 0})
        .watch(function(err, received) {
        if(err)
        {
            console.error(err);
        } else {
            $scope.numTollBooths.push(received);
            $scope.numTollBoothsExist.push(received.args.tollBooth);
            $scope.getCurrentBlockNumber();
            $scope.$apply();
        }
    });
  }

  function onVehicleExit() {
    TollBoothInstance.LogRoadExited({}, {fromBlock: 0})
        .watch(function(err, received) {
        if(err)
        {
            console.error(err);
        } else {
            $scope.numVehiclesExit.push(received);
            $scope.getCurrentBlockNumber();
            $scope.$apply();
        }
    });
  }

  function onPendingPayment() {
    TollBoothInstance.LogPendingPayment({}, {fromBlock: 0})
        .watch(function(err, received) {
        if(err)
        {
            console.error(err);
        } else {
            $scope.numPendingPayments.push(received);
            $scope.getCurrentBlockNumber();
            $scope.$apply();
        }
    });
  }

  // Functions for the Page

  //Set Vehicle Exit
  $scope.setVehicleExit = function() {
    if($scope.accountSelect == null) return;
    if($scope.operatorSelect == null) return;
      var newTollBooth = $scope.accountSelect.valueOf();
      var newHash = $scope.secretHash.valueOf();

      TollBoothInstance.reportExitRoad($scope.secretHash, {from: newTollBooth, gas: 150000}, function(err, result){
        if (err) {
          console.error(err);
        } else {
          console.log(result);
          onVehicleExit();
        }
      });
  }

  //When the Operator combobox changes, updates addresses
  $scope.onOperatorChange = function () {
    if($scope.operatorSelect != null){
      //Get the Account Balances
      return $scope.getOperatorAddresses();
    } else {
      //Display message if No Account selected
      $scope.TollBoothOperatorContract = "Select an Account";
      $scope.TollBoothOperatorOwner = "Select an Account";
    }
  }

  //Get Operator Addresses
  $scope.getOperatorAddresses = function () {

    $scope.TollBoothOperatorContract = $scope.operatorSelect;
    TollBoothOperator = web3.eth.contract(tollBoothOperator_artifacts.abi);
    TollBoothInstance = TollBoothOperator.at($scope.TollBoothOperatorContract);

    TollBoothInstance.getOwner({from: web3.eth.coinbase, gas: 75000}, function(err, address){
      if (err) {
        console.error(err);
      } else {
        $scope.TollBoothOperatorOwner = address;
        // Array declaration
        $scope.numTollBooths = [];
        $scope.numTollBoothsExist = [];
        $scope.numRoadsEntered = [];
        $scope.numVehiclesExit = [];
        $scope.getCurrentBlockNumber();
        $scope.$apply();
        onTollBoothAdded();
        onVehicleExit();
        onPendingPayment();
      }
    });
  }

  // On the change of the Account combo
  $scope.onAccountChange = function () {
      if($scope.accountSelect != null){
          //Get the Account Balances
          return $scope.getAccountBalances();
      } else {
          //Display message if No Account selected
          $scope.balance = "Select an Account";
          $scope.balanceInEth = "Select an Account";
      }
  }

  //Get the Account Balances
  $scope.getAccountBalances = function () {
      web3.eth.getBalance($scope.accountSelect, function(err, _balance){
        $scope.balance = _balance.toString(10);
        $scope.balanceInEth = web3.fromWei($scope.balance, "ether");
        $scope.getCurrentBlockNumber();
        $scope.$apply();
      })
  }

  //Get the Curent Block Number
  $scope.getCurrentBlockNumber = function() {
      web3.eth.getBlockNumber(function(err, bn) {
        if(err) {
            console.log("error getting block number", err);
        } else {
            $scope.blockNumber = bn;
            $scope.$apply();
        }
      })
  }
}); // End Controller

// Event Listener for web3
window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    //console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    //console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  Regulator.setProvider(web3.currentProvider);
  TollBoothOperator.setProvider(web3.currentProvider);

});
