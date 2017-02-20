angular.module('carApp')
    .directive('tmbDropdown', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                $scope.uistyle = settings.uistyle.id;
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                });

            },
            replace: true,
            templateUrl: 'views/tmbDropdown.html',
            scope: {
                label: '@',
                currentOption: '=',
                onChange: '&',
                options: '='
            }
        }
    }]);

