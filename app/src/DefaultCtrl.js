'use strict';

/**
 * String Value
 * 
 * @author Kehaw
 * @version 2.0.0
 */
app.controller("DefaultCtrl", function ($scope) {
	$scope.showPic = false;

	$scope.openBrowser = function (e, url) {
		e.preventDefault();
		shell.openExternal(url);
	}
});
