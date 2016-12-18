'use strict';

var SESSION_ID = "";
var EVENTS_SEARCH_LIMIT = 100;
var DEFAULT_PICTURE_FETCH_COUNT = 100;
var DEFAULT_SORTING_OPTION = "date";
var EVENT_LIST_UPDATED_EVENT = "new_event_list";
var PICTURE_LIST_UPDATED_EVENT = "new_picture_list";
var USERNAME = "";

angular.module('Home',["ngTouch", "angucomplete", "ngFileUpload"])

.filter('publicOrPrivate', function(){
    return function(is_public){
        return is_public?"Public event":"Private event";
    }
})

.filter('daysBeforeExpired', function(){
    return function(dateString){
        if(dateString != undefined){
            var a = dateString.split(/[- :]/);
            var date  = new Date(a[0], a[1]-1, a[2], a[3], a[4], a[5]);
            var now = new Date();
            var diff = date.getTime() - now.getTime();
            return Math.floor(diff/(1000*60*60*24)) + "d";
        }
    };
})

.filter('hoursSinceCreated', function(){
    return function(dateString){
        if(dateString != undefined){
            var a = dateString.split(/[- :]/);
            var date  = new Date(a[0], a[1]-1, a[2], a[3], a[4], a[5]);
            var now = new Date();
            var diff = now.getTime() - date.getTime();
            var hours = Math.floor((diff + 1000*60*60*8)/(1000*60*60));
            if (hours < 24) {
                return hours + "h";
            }
            return Math.floor((diff + 1000*60*60*8)/(1000*60*60*24)) + "d";
        }
    };
})

.filter('photoOrPhotos', function(){
    return function(pic_count){
        return pic_count + " Photo" + ((pic_count>1)?"s":"");
    };
})

.service('eventService', function(){
    
    var eventList = [];

    var setEvents = function(events){
        eventList = events;
    };

    var getEvents = function(){
        return eventList;
    };

    return{
        setEvents: setEvents,
        getEvents: getEvents,
    };
})

.service('pictureService', function(){
    
    var pictureList = [];
    var picture_event = {};

    var setPictures = function(pictures){
        pictureList = pictures;
    };

    var getPictures = function(){
        return pictureList;
    };

    var setPictureEvent = function(eve){
        picture_event = eve;
    };

    var getPictureEvent = function(){
        return picture_event;
    };

    return{
        setPictures: setPictures,
        getPictures: getPictures,
        setPictureEvent: setPictureEvent,
        getPictureEvent: getPictureEvent,
    };
})

.controller('HomeController',
    ['$scope', '$cookieStore', '$http', '$location',
    function ($scope, $cookieStore, $http, $location) {
    	$scope.user = $cookieStore.get('globals') || {};
    	if ($scope.user) 
    	{
    		// $scope.name = $scope.user.currentUser.username;
            $scope.name = "uscteam05";
    		$scope.id = $scope.user.currentUser.sessionid;
            SESSION_ID = $scope.id;
            USERNAME = $scope.name;
    	}
        
        // for user logout
        $scope.logout = function(){
            console.log("log out");
            var data = $.param({session_id: $scope.id});
            var config = {
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            
            $http.post('https://api.theshareapp.co/api/users/logout',data,config)
            .success(function(response){
                console.log("logout successfully!");
                console.log(response);
                $location.path('/login');
            })
            .error(function(response){
                console.log("unknown error......");
            })
        }
        
    }])

.controller('appCtrl', function($scope, $http, $rootScope, $window, eventService, pictureService) {

    $scope.errormessage = "";
    $rootScope.curEvent = "";
    $rootScope.page = "home";


    // $scope.login = function(){

    //     USERNAME = $scope.usrname;
    //     PASSWORD = $scope.pwd;
    //     USERNAME = "uscteam05";
    //     PASSWORD = "USC_team05";        
        
    //     var data = $.param({username:USERNAME, password:PASSWORD});
    //     var config = {
    //         headers : {
    //             'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
    //         }
    //     }        
    //     $http.post('https://theshareapp.co/api/users/login', data, config)
    //     .success(function(res) {
    //         console.log("Success: Logged in! seesion_id got!");
    //         console.log(res);
    //         if(res.status=="fail")
    //             {
    //                 $scope.errormessage = "Invalid username and password!"
    //             }
    //         else
    //             SESSION_ID = res.data.session_id;
            
    //         $("#login").text("login success"); 
    //         $("#login").css("background-color", "grey");
            
            
    //         $scope.loginshow = false;
    //         // SHOW = false;
    //         $rootScope.page = "home";
    //         $scope.getMyPictures();
    //         $scope.getMyEvents();
    //         $("#picture_tab").click();
    //     })
    //     .error(function (res) {
    //         console.log("get events fail");
    //         console.log(res);
    //     });
    // };
    
    $rootScope.getEvents = function(){
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/events?session_id=" + SESSION_ID + "&count=" + EVENTS_SEARCH_LIMIT,
        }).then(successCallback, errorCallback);

        function successCallback(res){
            var events = res.data.data.events;
            eventService.setEvents(events); // 1 save events to eventService
            $rootScope.$broadcast(EVENT_LIST_UPDATED_EVENT, events); // 2 broadcast: New Events!
            console.log(events);
        };

        function errorCallback(res){
            console.log("get events fail");
            console.log(res);
        };
    };
    
    $rootScope.getMyEvents = function(){
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/events?session_id=" + SESSION_ID + "&count=" + EVENTS_SEARCH_LIMIT + "&is_mine=true",
        }).then(successCallback, errorCallback);

        function successCallback(res){
            var events = res.data.data.events;
            eventService.setEvents(events); // 1 save events to eventService
            $rootScope.$broadcast(EVENT_LIST_UPDATED_EVENT, events); // 2 broadcast: New Events!
            console.log(events);
        };

        function errorCallback(res){
            console.log("get events fail");
            console.log(res);
        };


        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/events?session_id=" + SESSION_ID + "&count=10000",
        }).then(successCallback1, errorCallback1);

        function successCallback1(res){
            $rootScope.tempList = res.data.data.events;
            var log = new Array();

            for(var i = 0;i < $rootScope.tempList.length;i++){
                var jsonArg = new Object();
                jsonArg.name = $rootScope.tempList[i].event_name;
                jsonArg.code = $rootScope.tempList[i].event_name;
                log.push(jsonArg);
            }
            $rootScope.eventsName = log;
            console.log("log is " + $rootScope.eventsName);
        };
        function errorCallback1(res){
            console.log("get events names fail");
            console.log(res);
        };



    };
    
    $rootScope.getMyPictures = function(){
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/pictures/user?" + 
                    "session_id=" + SESSION_ID +
                    "&count=" + DEFAULT_PICTURE_FETCH_COUNT,
        }).then(successCallback, errorCallback);

        function successCallback(res){
            //console.log(res);
            var pictures = res.data.data.pictures;
            pictureService.setPictures(pictures); // 1 save pictures to pictureService
            //pictureService.setPictureEvent(event); // 2 save the corresponding event to pictureService
            $rootScope.$broadcast(PICTURE_LIST_UPDATED_EVENT, pictures); // 3 broadcast: New Pictures!
            $rootScope.page = "home";
            console.log(pictures);
            console.log("broadcast new_picture_list");
        };

        function errorCallback(res){
            console.log("fail");
            console.log(res);
        };
    };
    
    $rootScope.getEventPictures = function(event, count, sorting_option){
        var event_id = event.event_id;
        var count = count || DEFAULT_PICTURE_FETCH_COUNT;
        var sorting_option = sorting_option || DEFAULT_SORTING_OPTION;
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/pictures/event?" + 
                    "session_id=" + SESSION_ID +
                    "&event_id=" + event_id +
                    "&count=" + count + 
                    "&sorting_option=" + sorting_option,
        }).then(successCallback, errorCallback);

        function successCallback(res){
            $rootScope.curEvent = event;
            console.log("res:",res);
            var pictures = res.data.data.pictures;
            pictureService.setPictures(pictures);
            pictureService.setPictureEvent(event);
            $rootScope.$broadcast(PICTURE_LIST_UPDATED_EVENT, pictures);
            $rootScope.page = "eventPic";
            console.log("pictures:", pictures);
            console.log("broadcast new_picture_list");
        };

        function errorCallback(res){
            console.log("fail");
            console.log(res);
        };





    };    

    $rootScope.accessPrivate = function(event){
        
        var id = "#event_" + event.event_id + "_pwd";
        var pwd = $(id).val();
        var data = $.param({session_id:SESSION_ID, event_id:event.event_id, password:pwd});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/events/private/access', data, config)
        .success(function(res) {
            console.log("Got response from accessPrivate");
            console.log(res);
            if (res.op_status == "success") {
                $rootScope.getEventPictures(event);
            } else {
                $window.alert("Password is incorrcect!");
            }
        })
        .error(function (res) {
            console.log("accessPrivate Fail");
            console.log(res);
        });
    };
    
    $rootScope.deletePic = function(pic_id) {
        var data = $.param({session_id:SESSION_ID, pic_id:pic_id});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/pictures/delete', data, config)
        .success(function(res) {
            if (res.op_status == "fail") {
                $window.alert("Delete fail! You can only delete your own pictures!");
            } else {
                console.log("Delete Picture Success");
                console.log(res);
                if($rootScope.curEvent == "") {
                    console.log("getMyPictures()");
                    $rootScope.getMyPictures();
                } else {
                    console.log("getEventPictures()");
                    $rootScope.getEventPictures($rootScope.curEvent, DEFAULT_PICTURE_FETCH_COUNT, DEFAULT_SORTING_OPTION);
                }
                $scope.getMyEvents();               
            }

        })
        .error(function (res) {
            console.log("Delete Picture Fail");
            console.log(res);
        });            
    }

    $rootScope.confirmDeletePic = function(pic_id){
        if($window.confirm("Delete the photo?")) {
            $rootScope.deletePic(pic_id);
            console.log("You clicked YES.");
        } else {
            console.log("You clicked NO.");
        }
    };
    
    $rootScope.back = function(){
        if ($rootScope.page == "details") {
            if ($rootScope.curEvent != "") {
                $rootScope.page = "eventPic";
            } else {
                //$scope.getMyPictures();
                $rootScope.page = "home";
            }
        } else if ($rootScope.page == "eventPic" || $rootScope.page == "createEvent"){
            $rootScope.curEvent = "";
            $rootScope.page = "home";
            $rootScope.getMyPictures();
            $rootScope.getMyEvents();
            $("#event_tab").click();            
        }
    };

    $rootScope.getMyPictures();
    $rootScope.getMyEvents();
    $("#picture_tab").click();
})

.controller('eventCtrl', function($scope, $http, $rootScope, $window, eventService, pictureService) {
    $scope.events = [];
    $scope.eventName = "";
    $scope.canUpload = true;
    // $scope.password = "PRI_vate1";
    $scope.password = "";
    //$scope.events;
    
    $scope.isPrivate = false;
    
    $scope.$on(EVENT_LIST_UPDATED_EVENT, function(event_info)
    {
        console.log("got new_event_list");
        $scope.events = eventService.getEvents(); // 3 set events to $scope
        $scope.events.forEach(function(eve){
            if(eve.pic_count>0){
                $scope.getEventCoverPictures(eve, 1); // 4 set Cover Picture for each event
            }
        });
    });

    $scope.getEventCoverPictures = function(event, count, sorting_option){
        var event_id = event.event_id;
        var count = count || DEFAULT_PICTURE_FETCH_COUNT;
        var sorting_option = sorting_option || DEFAULT_SORTING_OPTION;
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/pictures/event?" + 
                    "session_id=" + SESSION_ID +
                    "&event_id=" + event_id +
                    "&count=" + count + 
                    "&sorting_option=" + sorting_option,
        }).then(successCallback, errorCallback);

        function successCallback(res){
            console.log(res);
            if(res!=undefined && res.data!=undefined && res.data.data!=undefined){
                var pictures = res.data.data.pictures;
                if(pictures!=undefined){
                    event.cover_picture = pictures[0].pic_thumb_url;
                }
                console.log(pictures);
                console.log("broadcast new_picture_list");
            }
        };
        function errorCallback(res){
            console.log("fail");
            console.log(res);
        };
    };
    
    $scope.deleteEvent = function(event_id) {

        var data = $.param({session_id:SESSION_ID, event_id:event_id});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/events/delete', data, config)
        .success(function(res) {
            if (res.op_status == "fail") {
                $window.alert("Delte Event Fail! You can only delete your own events!");
            } else {
                console.log("Delete event Successfully!");
                console.log(res);
                $rootScope.getMyEvents();
                $rootScope.getMyPictures();  
            }
        })
        .error(function (res) {
            console.log("Delete event Fail...");
            console.log(res);
        });            
    }   

    $scope.confirmDeleteEvent = function(event_id){
        if($window.confirm("Are you sure you want to delete this Event?")) {
            $scope.deleteEvent(event_id);
            console.log("You clicked YES.");
        } else {
            console.log("You clicked NO.");
        }
    };
    
    $scope.newEvent = function(){
        $rootScope.page = "createEvent";
    };
    
   $scope.createPublic = function(){

        var data = $.param({session_id:SESSION_ID, event_name:$scope.eventName, can_upload:$scope.canUpload});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/events/public/create', data, config)
        .success(function(res) {

            if (res.op_status == "success") {
                $window.alert("Public event created Successfully!");
//                $rootScope.page = "home";
//                $rootScope.getMyEvents();
                $scope.password = "";
                $scope.eventName = "";
                
                $rootScope.getEventPictures(res.data);
                
            } else {
                $window.alert(res.error_message);
            }
            
            console.log("Got Create public event response!");
            console.log(res);
        })
        .error(function (res) {
            console.log("Create public event Fail!");
            $window.alert("Create Fail!");
            console.log(res);
        });
    };
    
    $scope.createPrivate = function(){

        var data = $.param({session_id:SESSION_ID, event_name:$scope.eventName, password:$scope.password, can_upload:$scope.canUpload});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/events/private/create', data, config)
        .success(function(res) {
            if (res.op_status == "success") {
                $window.alert("Private event created Successfully!");
//                $rootScope.page = "home";
//                $rootScope.getMyEvents();
                $scope.password = "";
                $scope.eventName = "";
                
                $rootScope.getEventPictures(res.data);
            } else {
                $window.alert(res.error_message);
            }
            console.log("Got Create private event response!");
            console.log(res);
        })
        .error(function (res) {
            console.log("Create private event Fail");
            $window.alert("create fail!");
            console.log(res); 
        });
    }     
    
})

.controller('pictureCtrl', function ($scope, $rootScope, pictureService, $http, $window) {
    
    $scope.pictures = [];

    // multidownload
    $scope.checkboxShow = false;
    $scope.downloadShow = false;
    $scope.PIC_ID_LIST = [];
    $scope.multiURL = "";
    $scope.counter = 0;
    // $scope.isCheck = false;
    $scope.inDownloadList = false;

    $rootScope.pic;
    $scope.myComment = "";

    $scope.$on(PICTURE_LIST_UPDATED_EVENT, function(){
        console.log("got new_picture_list event")
        $scope.pictures = pictureService.getPictures(); // 4 set pictures to $scope
        console.log($scope.pictures);
    });
   
    // multidownload
    $scope.multidownload = function(){
        if ($('#multidownload').text()=='Multi-Download') 
        {
            $('#multidownload').text('Cancel');
            $scope.checkboxShow = true;
            $scope.downloadShow = true;
            $('.event_multidownload').css({"padding": "5px"});
        }
        else 
        {
            $('#multidownload').text('Multi-Download');
            $scope.checkboxShow = false;
            $scope.downloadShow = false;
            $('#select').text('Select All');
            $('.checkboxes').prop('checked', false);
            $scope.PIC_ID_LIST = [];
            $('.event_multidownload').css({"padding": "0px", "background-color": "rgb(255, 255, 255)", "border-color": "black"});
        }
    };

    $scope.isDownload = function(id){
        console.log($scope.PIC_ID_LIST);
        if ($scope.PIC_ID_LIST.length == 0) 
        {
            $scope.PIC_ID_LIST.push(id);
            $('#'+id).css({"background-color": "rgb(2, 185, 229)", "border-color": "rgb(2, 185, 229)"});
            console.log($scope.PIC_ID_LIST);
        }
        else
        {
            for (var i = 0; i < $scope.PIC_ID_LIST.length; i++) {
                if ($scope.PIC_ID_LIST[i] == id)
                 {
                    $scope.PIC_ID_LIST.splice(i,1);
                    console.log($scope.PIC_ID_LIST);
                    $('#'+id).css({"background-color": "rgb(255, 255, 255)", "border-color": "black"});
                    $scope.inDownloadList = true;
                 }
            }
            if (!$scope.inDownloadList) 
            {
                $scope.PIC_ID_LIST.push(id);
                $('#'+id).css({"background-color": "rgb(2, 185, 229)", "border-color": "rgb(2, 185, 229)"});
                $scope.inDownloadList = false;
            }
            console.log($scope.PIC_ID_LIST);
        }
    };

    $scope.selectAll = function(){
        if (!($scope.counter%2)) 
        {
            for (var i = 0; i < $scope.pictures.length; i++) {
                $scope.PIC_ID_LIST.push($scope.pictures[i].pic_id)
            }
            $('.checkboxes').prop('checked', true);
            $('#select').text('Unselect All');
            $('.event_multidownload').css({"background-color": "rgb(2, 185, 229)", "border-color": "rgb(2, 185, 229)"});
            $scope.counter++;
        }
        else
        {
            $scope.PIC_ID_LIST = [];
            $('.checkboxes').prop('checked', false);
            $('#select').text('Select All');
            $('.event_multidownload').css({"background-color": "rgb(255, 255, 255)", "border-color": "black"});
            $scope.counter++;
        }
        
    };

    $scope.singleDownload = function(id){
        console.log($scope.PIC_ID_LIST);
        $scope.PIC_ID_LIST.push(id);
        $scope.download();

    }

    $scope.download = function(){

        console.log($scope.PIC_ID_LIST);
        var data = $.param({session_id:SESSION_ID, pic_id_list:$scope.PIC_ID_LIST});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        };

        $scope.checkboxShow = false;
        $scope.downloadShow = false;
        $scope.inDownloadList = false;
        $('.checkboxes').prop('checked', false);
        $('.event_multidownload').css({"padding": "0px", "background-color": "rgb(255, 255, 255)", "border-color": "black"});

        $http.post('https://api.theshareapp.co/api/pictures/download', data, config)
        .success(function(response){
            console.log("multi-download!");
            console.log(SESSION_ID);
            console.log(response);
            $scope.multiURL = response.data.URL;
            console.log($scope.multiURL);
            $scope.PIC_ID_LIST = [];
            $("#multidownloadArea").append("<a class ='picDownload' href='" + $scope.multiURL + "' download>da</a>");
            $(".picDownload")[0].click();
            $('.checkboxes').prop('checked', false);
            $('#select').text('Select All');

            $("#multidownloadArea").html("");
            $scope.checkboxShow = false;
            $scope.downloadShow = false;
            $scope.inDownloadList = false;
            $('.checkboxes').prop('checked', false);
            $('.event_multidownload').css({"padding": "0px", "background-color": "rgb(255, 255, 255)", "border-color": "black"});
            console.log($scope.PIC_ID_LIST);

        })
        .error(function(response){
            console.log("Multi-Download Failed!");
            console.log(response);
            console.log(session_id);
        });

        $scope.checkboxShow = false;
        $scope.downloadShow = false;
        $('#multidownload').text('Multi-Download');
    }
    
    $scope.like = function(pic) {
        var pic_id = pic.pic_id;
        var data = $.param({session_id:SESSION_ID, pic_id:pic_id});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/pictures/like', data, config)
        .success(function(res) {
            console.log("Like Success");
            console.log(res);
            if(res.data.operation == "like") {
                pic.like_count+=1;
            } else {
                pic.like_count-=1;
            }
            pic.has_liked = !pic.has_liked; // change local value
        })
        .error(function (res) {
            console.log("Like Fail");
            console.log(res);
        });
    }
    
    $scope.picDetails = function(pic) {
        var pic_id = pic.pic_id;
        
        $http({
            method: "GET",
            url: "https://api.theshareapp.co/api/comments/picture/get?" + 
                    "session_id=" + SESSION_ID +
                    "&pic_id=" + pic_id,
        }).then(successCallback, errorCallback);

        function successCallback(res){
            $rootScope.pic = pic;
            $rootScope.comments = res.data.data.comments;
            $rootScope.page = "details";
            console.log("get comments success");
            console.log(res);
            console.log($rootScope.comments);
        };

        function errorCallback(res){
            console.log("get comments fail");
            console.log(res);
        };
    }
    
    $scope.submitComment = function(){
        var data = $.param({session_id:SESSION_ID, pic_id:$rootScope.pic.pic_id, comment_text:$scope.myComment});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }        
        $http.post('https://api.theshareapp.co/api/comments/create', data, config)
        .success(function(res) {
            console.log("Comment Success!");
            console.log(res);
            $scope.myComment = "";
            $rootScope.pic.num_comments+=1;
            $scope.picDetails($rootScope.pic);
        })
        .error(function (res) {
            console.log("Comment Fail!");
            console.log(res);
        });
    };   
    
    $scope.deleteCmt = function(comment_id) {
        var data = $.param({session_id:SESSION_ID, comment_id:comment_id});
        var config = {
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }

        $http.post('https://api.theshareapp.co/api/comments/delete', data, config)
        .success(function(res) {
            if (res.op_status == "error") {
                $window.alert("Cannot delete others' comment!");
            } else {
                console.log("Delete Comment Success");
                console.log(res);
                $rootScope.pic.num_comments-=1;
                $scope.picDetails($rootScope.pic);                
            }
        })
        .error(function (res) {
            console.log("Delete Comment Fail");
            console.log(res);
        });            
    }

    $scope.confirmDeleteCmt = function(comment_id){
        if($window.confirm("Delete the comment?")) {
            $scope.deleteCmt(comment_id);
            console.log("You clicked YES.");
        } else {
            console.log("You clicked NO.");
        }
    };
    
    $scope.rotate = function(pic_id, edge){
        var id;
        
        if($rootScope.page == "home") {
            id = "#pic0_" + pic_id;
        } else if($rootScope.page == "eventPic") {
            id = "#pic1_" + pic_id;
        } else {
            id = "#pic2_" + pic_id;
        }
        
        console.log("rotate")
        //$(id).css({'transform': 'rotate(' + 90 + 'deg)'});

        var matrix = $(id).css("transform");

        var angle = 0
        if(matrix.indexOf('(')>-1){
            console.log(matrix);
            var values = matrix.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
            var a = values[0];
            var b = values[1];

            angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        }
        
        console.log(angle);
        angle += 90;
        $(id).css({'transform': 'rotate(' + angle + 'deg)'});
    }
})


.controller('UploadCtrl', ['$rootScope', '$scope', 'Upload', '$timeout', function ($rootScope, $scope, Upload, $timeout) {
    // $scope.uploadPic = function(file) {
       //  file.upload = Upload.upload({
       //    url: 'https://theshareapp.co/api/pictures/event/create',
       //    data: {event_id: 589, session_id: SESSION_ID ,picture: file},
       //  });

       //  file.upload.then(function (response) {
       //    $timeout(function () {
       //      file.result = response.data;
       //    });
       //  }, function (response) {
       //    if (response.status > 0)
       //      $scope.errorMsg = response.status + ': ' + response.data;
       //  }, function (evt) {
       //    // Math.min is to fix IE which reports 200% sometimes
       //    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
       //  });
    // }
    $scope.uploadFiles = function (files) {
        //var eventid = $rootScope.curEvent.event_id;//need a event_id when user enter a event to see details
        //console.log("curEvent.event_id is " + $rootScope.curEvent.event_id);
        $scope.files = files;
        var uploadeventid = $rootScope.curEvent.event_id;

        for(var i = 0;i < files.length;i++){
            Upload.upload({
                url: 'https://api.theshareapp.co/api/pictures/event/create',
                data: {
                    event_id: uploadeventid,
                    session_id: SESSION_ID,
                    picture: files[i]
                }
            }).then(function (response) {
                $timeout(function () {
                    $scope.result = response.data;
                    $rootScope.getEventPictures($rootScope.curEvent);
                });
            }, function (response) {
                if (response.status > 0) {
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
            }, function (evt) {
                $scope.progress = 
                    Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

}])






.controller('searchCtrl', function($scope, $http, $rootScope, eventService, pictureService){

    $scope.keyword = '';
    $scope.text = '';
    $scope.submit = function() {
        if ($scope.text) {
            $scope.keyword = this.text;
            $scope.text = '';
        }
        $scope.keyword = $scope.selectedCountry.originalObject.name;
        console.log("search keyword is: " + $scope.keyword);
        console.log("event names are : " + $scope.countries);
        $scope.searchEvent();
    };

    $scope.searchEvent = function(){
        var num = 1;
        $rootScope.search = true;
        //console.log("hello");
        //alert($scope.selectedCountry.originalObject.name);
        console.log("https://api.theshareapp.co/api/events?session_id=" + SESSION_ID + 
                  "&count=1" + "&event_name=" + $scope.keyword);
        $http({
            method : "GET",
            url : "https://api.theshareapp.co/api/events?session_id=" + SESSION_ID + 
                  "&count=1" + "&event_name=" + $scope.keyword , 
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            },
                }).then(successCallback, errorCallback);

        function successCallback(res){
            console.log("search event success!");
            var events = res.data.data.events;
//            eventService.setEvents(events); // 1 save events to eventService
//            $rootScope.$broadcast(EVENT_LIST_UPDATED_EVENT, events); // 2 broadcast: New Events!
            //console.log("$rootScope.event4local[0].event_id is " + $rootScope.event4local[0].event_name);
            if (events[0].has_access) {
                $rootScope.getEventPictures(events[0]);
            } else {
                var pwd123 = prompt("Please enter the password");
                if (pwd123 != null) {
                    $rootScope.accessPrivate(events[0], pwd123);
                }
            }
        };
        function errorCallback(res){
            console.log("get events fail");
            console.log(res);
        };
    };

    $scope.people = [
            {firstName: "Daryl", surname: "Rowland", twitter: "@darylrowland", pic: "img/daryl.jpeg"},
            {firstName: "Alan", surname: "Partridge", twitter: "@alangpartridge", pic: "img/alanp.jpg"},
            {firstName: "Annie", surname: "Rowland", twitter: "@anklesannie", pic: "img/annie.jpg"}
        ];

    $scope.countries = $rootScope.eventsName;
})
