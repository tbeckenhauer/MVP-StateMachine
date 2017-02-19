angular.module('carApp', ['ngMaterial']);

angular.module('carApp')
    .directive('tmbDashboard', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                $scope.uistyle = settings.uistyle.id;
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                });
            },
            replace: true,
            transclude: true,
            //I am cheating a little bit here. These are bootstrap specific properties.
            //Basically the logic got very hairy with an ng-switch inside of a transclude inside of an ng-switch
            //A lot of things could be simplified if the uisettings had been decided on by the configure stage.
            //Instead I will just swap out css classes as necessary.
            template: '<div ng-transclude class="btn-group" role="group"></div>',
            scope: {
                executeCommand: '&'
            }
        }
    }])
  .directive('tmbDashboardButton', ['settings', function (settings) {
    return {
      controller: function ($scope) {
          $scope.uistyle = settings.uistyle.id;
        settings.listenTo('uistyle', function(uistyle) {
          $scope.uistyle = uistyle.id;
        });
      },
      replace: true,
        template: ''+
        '<ng-switch on="uistyle">' +
            '<span ng-switch-when="material"><md-button class="md-raised" ng-click="execCmd()">{{cmdVal}}</md-button></span>'+
            '<button ng-switch-when="bootstrap" type="button" class="btn btn-default" ng-click="execCmd()">{{cmdVal}}</button>'+
            '<input ng-switch-default type="button" ng-click="execCmd()" value="{{cmdVal}}">'+
        '</ng-switch>',
      scope: {
        execCmd: '&',
        cmdVal: '@'
      }
    }
  }])
  .directive('tmbMessages', ['settings', function (settings) {
    return {
      controller: function ($scope) {
          var classMap = {
              html5: {
                  info: 'blue',
                  warn: 'orange',
                  error: 'red'
              },
              bootstrap: {
                  info: 'list-group-item-info',
                  warn: 'list-group-item-warning',
                  error: 'list-group-item-danger'
              },
              material: {
                  info: {color: 'blue-800'},
                  warn: {color: 'amber-800'},
                  error: {color: 'red-800'}
              }
          };
          $scope.uistyle = settings.uistyle.id;
          $scope.messageLevel = classMap[$scope.uistyle];
        settings.listenTo('uistyle', function(uistyle) {
          $scope.uistyle = uistyle.id;
          $scope.messageLevel = classMap[$scope.uistyle]
        });
      },
      replace: true,
      template: ''+
      '<ng-switch on="uistyle">'+
          '<div ng-switch-when="material">' +
              '<md-list flex>' +
                  '<md-list-item class="md-1-line" ng-click="null" ng-repeat="msg in msgArray track by $index" md-colors="messageLevel[msg.color]">' +
                      '<p md-colors="messageLevel[msg.color]">{{msg.message}}</p>' +
                  '</md-list-item>' +
              '</md-list>'+
          '</div>'+
          '<ul ng-switch-when="bootstrap" class="list-group">' +
            '<li class="list-group-item" ng-class="messageLevel[msg.color]" ng-repeat="msg in msgArray track by $index">{{msg.message}}</li>' +
          '</ul>'+
          '<div ng-switch-default>' +
            '<div ng-repeat="msg in msgArray track by $index" ng-class="messageLevel[msg.color]">{{msg.message}}</div>' +
          '</div>'+
      '</ng-switch>',
      scope: {
        msgArray: '='
      }
    }
  }])

.controller('carController', ['$scope', 'carStateMachine', 'settings', function($scope, carState, settings) {

    $scope.possibleUistyles = settings.getPossibleValues('uistyle');
    $scope.selectedUistyle = settings.uistyle;
    $scope.updateUiStyle = function () {
        settings.uistyle = $scope.selectedUistyle;
    };

  $scope.logObj = [];
  $scope.updateLog = function(logArray) {

    $scope.messageArray = logArray.map(function(logObject) {
      return {
        color: logObject.level,
        message: logObject.item
      }
    });
  };

  carState().addHandler($scope.updateLog);
  $scope.acceptCommand = function(command) {
    var commandMap = {
      startEngine: 'insertKeys',
      turnOffEngine: 'removeKeys',
      pushForward: 'accelerate',
      pullBack: 'deAccelerate'
    };
    carState().handleInput(commandMap[command]);
  }
}])

    .service('settings', function () {
        //settings will be an observable, that is you can register a callback with
        //listenTo, and it will notify you when a property has been changed
        var self = this;

        //This is the private storage of properties, and their associated callbacks
        var possibleUiStyles = [
            {id: 'html5',     name: 'Retro' },
            {id: 'bootstrap', name: 'Curved'},
            {id: 'material',  name: 'Flat' }
        ];
        var settings = {
            uistyle: {
                possibleValues: possibleUiStyles,
                value: possibleUiStyles[2],
                callbacks : []
            }
        };

        //Walk through each of the properies on settings, and define
        // a getter/setter for it.  When set, notify the listeners.
        Object.keys(settings).forEach(function(key) {
            Object.defineProperty(self, key, {
                set: function(value) {
                    //update the property with the new value
                    settings[key].value = value;
                    //walk through all the callbacks for the property and call each callback
                    settings[key].callbacks.forEach(function(callback) {
                        callback(value);
                    });
                },
                get: function() {
                    return settings[key].value;
                }
            });
        });

        self.getPossibleValues = function(property) {
            return settings[property].possibleValues;
        };

        self.listenTo = function (property, callback) {
            //look up the callbacks of the property and add a new callback.
            settings[property].callbacks.push(callback);
        };
        return self;
    })
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

  var protoVehicle = function() {};
  var carLog = [];
  var vehicleStates = {};
  var currentState;
  var getCurrentState = function() {
    return vehicleStates[currentState];
  };
  var setCurrentState = function(state) {
    currentState = state;

  };
  var handlers = [];

  protoVehicle.prototype.set = function(newState) {
    var newMessage = 'setting vehical to state:' + newState;
    setCurrentState(newState);
    this.log({
      level: 'info',
      item: newMessage
    });
  };

  protoVehicle.prototype.warn = function(cmd) {
    var newMessage = 'command: ' + cmd + ' in state: ' + currentState + ' is not allowed';
    this.log({
      level: 'warn',
      item: newMessage
    });
  };

  protoVehicle.prototype.info = function() {
    var newMessage = 'remaining in state:' + currentState;
    this.log({
      level: 'info',
      item: newMessage
    });
  };

  protoVehicle.prototype.log = function(newMessage) {
    carLog.unshift(newMessage);
    handlers.forEach(function(handler) {
      handler(carLog);
    });
  };

  protoVehicle.prototype.addHandler = function(newHandler) {
    handlers.push(newHandler);
  };

  this.registerState = function(state, stateConfig, isDefault) {
    vehicleStates[state] = Object.create(protoVehicle.prototype, stateConfig);
    if (isDefault) setCurrentState(state);
  };

  this.$get = [function() {
    return getCurrentState;
  }];
}]);
