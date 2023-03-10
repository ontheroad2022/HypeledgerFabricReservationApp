'use strict';

var app = angular.module('application',['ngNotify']);
var last_id = null;

app.controller('appController', function($scope, appFactory, ngNotify) {
    $scope.queryAllData = function() {
        appFactory.queryAllData(function(data) {
            var array = [];
            for (var i = 0; i<data.length; i++) {
                // data[i].Record.Key = parseInt(data[i].Key);
                // array.push(data[i].Record);

                data[i].Key = i + 1;

                // for (var key in data[i]){
                //     array.push(data[i][key]);
                // }

                array.push(data[i])
            }
            array.sort((a,b)=>{
                return parseFloat(a.Key) - parseFloat(b.Key);
            });
            $scope.all_data = array;
            // last_id = $scope.all_data[$scope.all_data.length-1].Key;
	    last_id = data.length+1;

            ngNotify.config({
                // theme: 'pastel',
                position: 'bottom',
                duration: 'f',
                type: 'success',
                sticky: true,
                html: true,
                target: '#modular'
            });
	    
            // ngNotify.set('This is the current default message type.');
	    
            console.log($scope.all_data);
        });
    }
    $scope.recordData = function(){
        appFactory.recordData($scope.data, function(response){
            console.log("Response:"+JSON.stringify(response));
            let object = JSON.parse(JSON.stringify(response));
            
            if(object.status == 200) {
                $scope.queryAllData();
            } else if (object.status == 500) {
	        $scope.doubleBooking();    
	    }
        })
    }
    $scope.changeHolder = function(data){
        // appFactory.changeHolder($scope.holder, function(response){
        appFactory.changeHolder($scope.all_data[data-1], function(response){
	    console.log(data);
            console.log(JSON.stringify(response));
            $scope.queryAllData();
        })
    }
    $scope.doubleBooking = function(){
        ngNotify.set('????????????????????????');

	    appFactory.doubleBooking($scope.holder, function(response){
        console.log(JSON.stringify(response));	    
        })
    }    
});

app.factory('appFactory', function($http) {
    var factory = {};

    factory.queryAllData = function(callback, ngNotify) {
        $http.get('/get_all_data').then( response => {
            callback(response.data);
            console.log(response);

	    ngNotify.set("Hello World");
            // Notification.success('Success notification');
	    
        }, err => {
            console.log("error:"+JSON.stringify(err));            
        });
    }

    factory.recordData = function(data, callback){
        data.location = data.longtitude +", " + data.latitude;
        data.id = last_id+1;
        data.timestamp = (new Date(data.timestamp)).getTime() / 1000;

        var data = data.id + "_" + data.location + "_" + data.timestamp + "_" + data.holder + "_" + data.vessel + "_" + data.AppraisedValue;

	
        $http.get("/add_data/"+data).then(response => {
            callback(response);
        }, err => {
            // ???????????????????????????????????????????????????
            // console.error("Error:"+err);
            callback(err);
	});
    }

    factory.changeHolder = function(data, callback) {
        // var holder = data.id + "-" + data.name;

        // console.log("Holder: "+holder);
        
        data.location = data.longtitude +", " + data.latitude;
        data.id = last_id+1;
        data.timestamp = (new Date(data.timestamp)).getTime() / 1000;
        
        var holder = data.id + "_" + data.Location + "_" + data.Timestamp + "_" + data.Owner + "_" + data.ID + "_" + data.AppraisedValue;

	
        $http.get('/change_holder/'+holder).then( response => {
            callback(response.data);         
        }, err => {
            console.log("error:"+JSON.stringify(err));            
        });
    }

    factory.doubleBooking = function(callback) {
        $http.get('/double_booking').then( response => {
            callback(response.data);         
        }, err => {
            console.log("error:"+JSON.stringify(err));            
        });
    }

    return factory;
});
