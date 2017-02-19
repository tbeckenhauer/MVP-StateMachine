angular.module('carApp')
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
                settings.listenTo('uistyle', function (uistyle) {
                    $scope.uistyle = uistyle.id;
                    $scope.messageLevel = classMap[$scope.uistyle]
                });
            },
            replace: true,
            templateUrl: './views/tmbMessages.html',
            scope: {
                msgArray: '='
            }
        }
    }]);
