angular.module('carApp')
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
                value: possibleUiStyles[1],
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
