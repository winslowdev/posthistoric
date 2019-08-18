const app = angular.module('App', [])

// =====================================================================
//                          PARENT CONTROLLER
// =====================================================================
// * ATTACHED TO: <body> tag
// * Contains the properties for the $rootScope (see google doc for details)
app.controller('ParentController', ['$http', '$rootScope', function($http, $rootScope){

  // ==============
  // INITIAL VALUES
  // ==============
  $rootScope.currentUser = null;




}]);

// =====================================================================
//                            MAIN CONTROLLER
// =====================================================================
// * ATTACHED TO: <div class="container"> tag
// * Contains the main functionality for the app
app.controller('Controller', ['$http', '$rootScope', function($http, $rootScope){

    // ==============
    // INITIAL VALUES
    // ==============
    const controller = this;
    this.indexOfEditFormToShow = 0;

    // ==============
    // RESTFUL ROUTES
    // ==============

    // CREATE NEW STORY (POST)

  this.createStory = function(){
    if (!$rootScope.currentUser){
      alert("You need to sign in to do that.");
    } else if (controller.text.length > 200){
      alert("Brevity is the soul of wit. Please limit your submission to less than 200 characters.")
    } else {
      $http({
        method:'POST',
        url:'/stories',
        data:{
          text: this.text,
          author: $rootScope.currentUser.username,
          date: this.date
        }
      }).then(function(response){
          controller.text = null;
          controller.stories.push(response.data);
          controller.currentStoryIndex = controller.stories.length - 2;
      });
    }
  };

    // EDIT STORY (POST)

  this.editStory = function(story){
    if (!$rootScope.currentUser){
      alert("You need to sign in to do that.")
    } else if ($rootScope.currentUser.username !== story.author){
      alert("You do not have permission to edit this story.");
    } else {
      $http({
        method:"PUT",
        url: '/stories/' + story._id,
        data: {
          text: this.updatedText
        }
      }).then(function(response){
        controller.indexOfEditFormToShow = null;
        const indexOfUpdatedStory = controller.stories.findIndex(eachStory => eachStory._id === story._id);
        controller.stories.splice(indexOfUpdatedStory, 1, response.data);
      });
    }
  };

    // DESTROY STORY (DELETE)
    // See Unit 3 w08d02 angular_delete.md for the solution to this

    this.deleteStory = function(story){
      if (!$rootScope.currentUser){
        alert("You need to sign in to do that.")
      } else if ($rootScope.currentUser.username !== story.author){
        alert("You do not have permission to remove this story.")
      } else {
        $http({
          method: "DELETE",
          url: '/stories/' + story._id
        }).then(function(response){
            controller.currentStoryIndex -= 1;
            const indexOfDeletedStory = controller.stories.findIndex(eachStory => eachStory._id === story._id);
            controller.stories.splice(indexOfDeletedStory, 1);
            controller.indexOfEditFormToShow = null;
        });
      }
  };

    // SEE ALL STORIES (GET)

    this.getStories = function(){
      $http({
        method:'GET',
        url:'/stories'
      }).then(function(response){
        controller.stories = response.data.sort((a, b) => {
          if (a.date < b.date){return -1}
          if (a.date > b.date){return 1}
          else{return 0}
        });
        controller.currentStoryIndex = 0;
      }, function(error){
        console.log(error);
      });
    };

    this.getStories();
}]);

// =====================================================================
//                        AUTHORIZATION CONTROLLER
// =====================================================================
// * ATTACHED TO: <header> tag
// * Contains the functionality for logging in/logging out/signing up
app.controller('AuthController', ['$http', '$rootScope', function($http, $rootScope){

  // ==============
  // INITIAL VALUES
  // ==============
  const controller = this;
  this.showLogin = false;
  this.showSignup = false;
  this.username = null;
  this.password = null;
  this.newUsername = null;
  this.newPassword = null;

  // ==============
  // RESTFUL ROUTES
  // ==============

  // CREATE NEW USER (POST)
  this.signup = function(){
    $http({
      method: "POST",
      url: "/contributors",
      data: {
        username: this.newUsername,
        password: this.newPassword
      }
    }).then(function(response){
      controller.newUsername = null;
      controller.newPassword = null;
      controller.startSession();
    }, function(error){
      alert("ERROR: You probably need to pick another username. Please try again.")
    })
  };

  // CREATE NEW SESSION (POST)
  this.login = function(){
    $http({
      method: "POST",
      url: "/sessions",
      data: {
        username: this.username,
        password: this.password
      }
    }).then(function(response){
      controller.username = null;
      controller.password = null;
      controller.startSession();
    }, function(error){
      alert("ERROR: Either that username doesn't exist or your password was incorrect. Please try again.")
    })
  };

  // DESTROY SESSION (DELETE)
  this.logout = function(){
    $http({
      method: "DELETE",
      url: "/sessions"
    }).then(function(response){
      $rootScope.currentUser = null;
    }, function(error){
      alert("ERROR: Something must have gone wrong on our end. Refresh the page and try again.")
    })
  };

  // GET SESSION
  this.startSession = function(){
    $http({
      method: "GET",
      url: "/app"
    }).then(function(response){
      $rootScope.currentUser = response.data;
      controller.showLogin = false;
      controller.showSignup = false;
    }, function(error){
      alert("ERROR: Something went wrong. Either try a new username or refresh the page.")
    })
  };

  // =====================
  // APP-SPECIFIC METHODS
  // =====================

  this.toggleModal = function(modal){
    switch (modal){
      case "signup":
        controller.showSignup = !controller.showSignup;
        controller.showLogin = false;
        break;
      case "login":
        controller.showLogin = !controller.showLogin;
        controller.showSignup = false;
        break;
      default:
        break;
    }
  };

}]);
