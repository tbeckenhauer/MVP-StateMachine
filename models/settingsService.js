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
    });
