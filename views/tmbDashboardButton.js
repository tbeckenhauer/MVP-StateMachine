angular.module('carApp')
    .directive('tmbDashboardButton', ['settings', function (settings) {
        return {
            controller: function ($scope) {
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

