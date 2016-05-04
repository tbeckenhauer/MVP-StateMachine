angular.module('carApp', []);

angular.module('carApp')
  .directive('dashboardButton', [function() {
    return {
      replace: true,
      template: '<input type="button" ng-click="execCmd()" value="{{cmdVal}}">',
      scope: {
        execCmd: '&',
        cmdVal: '@',
      }
    }
  }])
  .directive('dashboard', [function() {
    return {
      replace: true,
      transclude: true,
      template: '<div ng-transclude></div>',
      scope: {
        executeCommand: '&'
      }
    }
  }])
  .directive('messages', [function() {
    return {
      replace: true,
      scope: {
        msgArray: '='
      },
      template: '<div ng-repeat="msg in msgArray track by $index">' +
        '<div ng-class="msg.color">{{msg.message}}</div>' +
        '</div>'
    }
  }])
  .controller('carController', ['$scope', 'carStateMachine', function($scope, carState) {
    $scope.logObj = [];
    $scope.updateLog = function(logArray) {
      var logToMessageMap = {
        info: 'blue',
        warn: 'orange',
        error: 'red'
      }
      $scope.messageArray = logArray.map(function(logObject) {
        return {
          color: logToMessageMap[logObject.level],
          message: logObject.item,
        }
      });
    }
    carState().addHandler($scope.updateLog);
    $scope.acceptCommand = function(command) {
      var commandMap = {
        startEngine: 'insertKeys',
        turnOffEngine: 'removeKeys',
        pushForward: 'accelerate',
        pullBack: 'deAccelerate'
      }
      carState().handleInput(commandMap[command]);
    }
  }])
  .config(['carStateMachineProvider', function(carStateMachineProvider) {

    carStateMachineProvider.registerState('parked', {
      handleInput: {
        value: function(command) {
          switch (command) {
            case 'accelerate':
              this.warn(command);
              break;
            case 'deAccelerate':
              this.warn(command);
              break;
            case 'removeKeys':
              this.info();
              break;
            case 'insertKeys':
              this.set('stopped');
              break;
          }
        }
      }
    }, true);

    carStateMachineProvider.registerState('stopped', {
      handleInput: {
        value: function(command) {
          switch (command) {
            case 'accelerate':
              this.set('driving');
              break;
            case 'deAccelerate':
              this.set('reverse');
              break;
            case 'removeKeys':
              this.set('parked');
              break;
            case 'insertKeys':
              this.info();
              break;
          }
        }
      }
    });

    carStateMachineProvider.registerState('driving', {
      handleInput: {
        value: function(command) {
          switch (command) {
            case 'accelerate':
              this.info();
              break;
            case 'deAccelerate':
              this.set('stopped');
              break;
            case 'removeKeys':
              this.warn(command);
              break;
            case 'insertKeys':
              this.warn(command);
              break;
          }
        }
      }
    });

    carStateMachineProvider.registerState('reverse', {
      handleInput: {
        value: function(command) {
          switch (command) {
            case 'accelerate':
              this.set('stopped');
              break;
            case 'deAccelerate':
              this.info();
              break;
            case 'removeKeys':
              this.warn(command);
              break;
            case 'insertKeys':
              this.warn(command);
              break;
          }
        }
      }
    });

  }])
  .provider('carStateMachine', [function() {

    var protoVehical = function() {}
    var carLog = [];
    var vehicalStates = {};
    var getCurrentState = function() {
      return vehicalStates[currentState];
    }
    var setCurrentState = function(state) {
      currentState = state;

    }
    var handlers = [];

    protoVehical.prototype.set = function(newState) {
      var newMessage = 'setting vehical to state:' + newState;
      setCurrentState(newState);
      this.log({
        level: 'info',
        item: newMessage
      });
    }

    protoVehical.prototype.warn = function(cmd) {
      var newMessage = 'command: ' + cmd + ' in state: ' + currentState + ' is not allowed';
      this.log({
        level: 'warn',
        item: newMessage
      });
    }

    protoVehical.prototype.info = function() {
      var newMessage = 'remaining in state:' + currentState;
      this.log({
        level: 'info',
        item: newMessage
      });
    }

    protoVehical.prototype.log = function(newMessage) {
      carLog.push(newMessage);
      handlers.forEach(function(handler) {
        handler(carLog);
      });
    }


    protoVehical.prototype.addHandler = function(newHandler) {
      handlers.push(newHandler);
    };

    this.registerState = function(state, stateConfig, isDefault) {
      vehicalStates[state] = Object.create(protoVehical.prototype, stateConfig);
      if (isDefault) setCurrentState(state);
    }

    this.$get = [function() {
      return getCurrentState;
    }];
  }])