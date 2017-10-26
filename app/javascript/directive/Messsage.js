app.directive('message', function () {
    return {
        restrict: 'E',
        template: '<div class="message">{{text}}</div>',
        replace: true
    };
});