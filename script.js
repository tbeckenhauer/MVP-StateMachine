angular.module('carApp', []);

angular.module('carApp')
    .directive('tmbDashboard', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle;
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
        settings.listenTo('uistyle', function(uistyle) {
          $scope.uistyle = uistyle;
        });
      },
      replace: true,
        template: ''+
        '<ng-switch on="uistyle">' +
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
        settings.listenTo('uistyle', function(uistyle) {
          $scope.uistyle = uistyle;
        });
      },
      replace: true,
      template: ''+
      '<ng-switch on="uistyle">'+
          '<ul ng-switch-when="bootstrap" class="list-group">' +
            '<li class="list-group-item" ng-class="msg.color" ng-repeat="msg in msgArray track by $index">{{msg.message}}</li>' +
          '</ul>'+
          '<div ng-switch-default>' +
            '<div ng-repeat="msg in msgArray track by $index" ng-class="msg.color">{{msg.message}}</div>' +
          '</div>'+
      '</ng-switch>',
      scope: {
        msgArray: '='
      }
    }
  }])

.controller('carController', ['$scope', 'carStateMachine', 'settings', function($scope, carState, settings) {

  $scope.updateUiStyle = function (isBootstrap) {
      if(isBootstrap) {
          settings.uistyle = 'bootstrap';
      } else {
          settings.uistyle = 'vanilla';
      }
  };

  $scope.logObj = [];
  $scope.updateLog = function(logArray) {
    var logToMessageMapStandard = {
      info: 'blue',
      warn: 'orange',
      error: 'red'
    };
    var logToMessageMapBootstrap = {
      info: 'list-group-item-info',
      warn: 'list-group-item-warning',
      error: 'list-group-item-danger'
    };

    var logToMessageMap = $scope.isBootstrap ? logToMessageMapBootstrap : logToMessageMapStandard;

    $scope.messageArray = logArray.map(function(logObject) {
      return {
        color: logToMessageMap[logObject.level],
        message: logObject.item,
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
        var settings = {
            uistyle: {
                value: 'vanilla',
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
                    return settings[key];
                }
            });
        });

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
    carLog.unshift(newMessage);
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
