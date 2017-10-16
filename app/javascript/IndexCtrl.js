'use strict';

app.controller("IndexController", ["$scope", function($scope) {

    $scope.$on("changeServer", function(event, server) {
        $scope.$broadcast("clearKeysPanel");
        $scope.$broadcast("clearValuePanel");
        $scope.$broadcast("loadKey", server);
    });

    $scope.$on("changeKey", function(event, server, key) {
        $scope.$broadcast("loadValue", server, key);
    });

    $scope.$on("stringValueChange", function(event, server, key) {
        $scope.$broadcast("loadStringValue", server, key);
    });

    $scope.$on("hashValueChange", function(event, server, key) {
        $scope.$broadcast("loadHashValue", server, key);
    });

    $scope.$on("zsetValueChange", function(event, server, key) {
        $scope.$broadcast("loadZsetValue", server, key);
    });

    $scope.$on("setValueChange", function(event, server, key) {
        $scope.$broadcast("loadSetValue", server, key);
    });

    $scope.$on("listValueChange", function(event, server, key) {
        $scope.$broadcast("loadListValue", server, key);
    });


    $scope.$on("clearValue",function(event){
        $scope.$broadcast("clearValuePanel");
    });

    $scope.$on("clearKeys",function(event){
        $scope.$broadcast("clearKeysPanel");
        $scope.$broadcast("clearValuePanel");
    });

    $scope.$on("reloadKey",function(){
        $scope.$broadcast("reloadK");
    })
}]);