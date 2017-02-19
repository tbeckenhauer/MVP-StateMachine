angular.module('carApp')
    .directive('tmbDashboard', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                $scope.uistyle = settings.uistyle.id;
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
    .directive('tmbDashboardButton', ['settings', function (settings) {
        return {
            controller: function ($scope) {
                $scope.uistyle = settings.uistyle.id;
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                });
            },
            replace: true,
            template: ''+
            '<ng-switch on="uistyle">' +
            '<span ng-switch-when="material"><md-button class="md-raised" ng-click="execCmd()">{{cmdVal}}</md-button></span>'+
            '<button ng-switch-when="bootstrap" type="button" class="btn btn-default" ng-click="execCmd()">{{cmdVal}}</button>'+
            '<input ng-switch-default type="button" ng-click="execCmd()" value="{{cmdVal}}">'+
            '</ng-switch>',
            scope: {
                execCmd: '&',
                cmdVal: '@'
            }
        }
    }])
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
                settings.listenTo('uistyle', function(uistyle) {
                    $scope.uistyle = uistyle.id;
                    $scope.messageLevel = classMap[$scope.uistyle]
                });
            },
            replace: true,
            template: ''+
            '<ng-switch on="uistyle">'+
            '<div ng-switch-when="material">' +
            '<md-list flex>' +
            '<md-list-item class="md-1-line" ng-click="null" ng-repeat="msg in msgArray track by $index" md-colors="messageLevel[msg.color]">' +
            '<p md-colors="messageLevel[msg.color]">{{msg.message}}</p>' +
            '</md-list-item>' +
            '</md-list>'+
            '</div>'+
            '<ul ng-switch-when="bootstrap" class="list-group">' +
            '<li class="list-group-item" ng-class="messageLevel[msg.color]" ng-repeat="msg in msgArray track by $index">{{msg.message}}</li>' +
            '</ul>'+
            '<div ng-switch-default>' +
            '<div ng-repeat="msg in msgArray track by $index" ng-class="messageLevel[msg.color]">{{msg.message}}</div>' +
            '</div>'+
            '</ng-switch>',
            scope: {
                msgArray: '='
            }
        }
    }])

