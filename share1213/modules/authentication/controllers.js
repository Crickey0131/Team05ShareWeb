'use strict';

angular.module('Authentication')

.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', '$http',
    function ($scope, $rootScope, $location, AuthenticationService, $http) {
        // reset login status
        AuthenticationService.ClearCredentials();
        $scope.sentSuccessfully = false;
        $scope.sentFailed = false;

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password, response.data.session_id);
                    $location.path('/');
                } else {
                    if(response.error_message) $scope.error = response.error_message;
                    else $scope.error = response;
                    $scope.dataLoading = false;
                }
            });
        };

        $scope.reset = function(){
            console.log("reset");
            var data = $.param({email:$scope.email});
                var config = {
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            $http.post('https://api.theshareapp.co/api/users/password/forgot', data, config)
            .success(function(response){
                console.log("connect successfully");
                console.log(response);
                if (response.op_status=="success") 
                {
                     $scope.sentSuccessfully = true;
                     $scope.sentSuccessInfo = "If the email exists, an email will be sent to that address to reset your password. Please check your SPAM folder for the email";
                }
                else
                {
                    $scope.sentFailed = true;
                    $scope.sentFailInfo = "Please input valid email address!";
                }
            })
            .error(function(response){
                console.log("conncect fail");
                console.log(response);
            });
        }
    }]);