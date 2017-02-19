angular.module('carApp')
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
            var newMessage = 'setting vehicle to state:' + newState;
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
