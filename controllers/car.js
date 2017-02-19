angular.module('carApp')
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
    }]);

