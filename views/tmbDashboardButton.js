angular.module('carApp')
    .directive('tmbDashboardButton', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                $scope.uistyle = settings.uistyle.id;
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                });
            },
            replace: true,
            templateUrl: 'views/tmbDashboardButton.html',
            scope: {
                execCmd: '&',
                cmdVal: '@'
            }
        }
    }]);

