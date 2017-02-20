angular.module('carApp')
    .directive('tmbDashboard', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                });
            },
            replace: true,
            transclude: true,
            //I am cheating a little bit here. These are bootstrap specific properties.
            //Basically the logic got very hairy with an ng-switch inside of a transclude inside of an ng-switch
            //A lot of things could be simplified if the uisettings had been decided on by the configure stage.
            //Instead I will just swap out css classes as necessary.
            template: '<div ng-transclude class="btn-group" role="group"></div>',
            scope: {
                executeCommand: '&'
            }
        }
    }])
