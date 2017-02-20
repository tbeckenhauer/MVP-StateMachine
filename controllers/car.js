angular.module('carApp')
    .controller('carController', ['$scope', 'carStateMachine', 'settings', function($scope, carState, settings) {

        $scope.selectedUistyle = settings.uistyle;
        settings.listenTo('uistyle', function(uistyle) {
            $scope.selectedUistyle = uistyle;
        });
        $scope.possibleUistyles = settings.getPossibleValues('uistyle');
        $scope.updateUiStyle = function (id, name) {
            settings.uistyle = {id: id, name: name};
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

