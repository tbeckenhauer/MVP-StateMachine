angular.module('carApp')
    .controller('carController', ['$scope', 'carStateMachine', 'settings', function($scope, carState, settings) {

        //Wire up the Settings-Dropdown
        settings.listenTo('uistyle', function(uistyle) {
            $scope.selectedUistyle = uistyle;
        });
        $scope.possibleUistyles = settings.getPossibleValues('uistyle');
        $scope.updateUiStyle = function (id, name) {
            settings.uistyle = {id: id, name: name};
        };

        //Wire up the engine buttons
        $scope.acceptCommand = function(command) {
            var commandMap = {
                startEngine: 'insertKeys',
                turnOffEngine: 'removeKeys',
                pushForward: 'accelerate',
                pullBack: 'deAccelerate'
            };
            carState().handleInput(commandMap[command]);
        };

        //Wire up the car log
        carState().addHandler(updateLog);
        function updateLog(logArray) {
            $scope.messageArray = logArray.map(function(logObject) {
                return {
                    color: logObject.level,
                    message: logObject.item
                }
            });
        };

    }]);

