'use strict';

app.controller("PanelController", ["$rootScope", "$scope", "$interval", "local", function ($rootScope, $scope, $interval, local) {

    console.log($scope.server)
    let client = redis.createClient({
        host: $scope.server.host,
        port: $scope.server.port,
        connect_timeout: $scope.server.timeout
    });
    let getClients = function () {
        $scope.server.clients = [];
        client.client("list", function (err, result) {
            let cstr = result.split("\n");
            for (let i = 0; i < cstr.length; i++) {
                let cli = [];

                let props = cstr[i].split(" ");
                if (props[0] == "") {
                    continue;
                }
                for (let j = 0; j < props.length; j++) {
                    if (props) {
                        let tmp = props[j].split("=")
                        if (tmp[0]) {
                            cli[tmp[0]] = tmp[1];
                        }
                    }
                }
                $scope.server.clients.push(cli);
            }
            console.log($scope.server.clients);
        });

    }
    getClients();

    $scope.refreshClientList = function () {
        getClients();
    }
}]);