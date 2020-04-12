angular.module('thumbController', [])

  // inject the Todo service factory into our controller
  .controller('mainController', ['$scope','$http','Thumbs', function($scope, $http, Thumbs) {
    $scope.formData = {};
    $scope.loading = true;

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    // use the service to get all the todos
    Thumbs.get()
      .success(function(data) {
        $scope.thumbs = data;
        $scope.loading = false;
      });

    // CREATE ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.createThumb = function() {

      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.formData.url != undefined) {
        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        Thumbs.create($scope.formData)

          // if successful creation, call our get function to get all the new todos
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.thumbs = data; // assign our new list of todos
          })
                    .error(function(data, status) {
                        console.error('Create Failed',status,data);
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
                    });
      }
    };

    // CREATE using img ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.createThumbImg = function() {

      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.formData.img != undefined) {
        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        Thumbs.createThumbImg($scope.formData)

          // if successful creation, call our get function to get all the new todos
          .success(function(data) {
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.thumbs = data; // assign our new list of todos
          })
                    .error(function(data, status) {
                        console.error('Create Failed',status,data);
            $scope.loading = false;
            $scope.formData = {}; // clear the form so our user is ready to enter another
                    });
      }
    };


    // DELETE ==================================================================
    // delete a todo after checking it
    $scope.deleteThumb = function(id) {
      $scope.loading = true;

      Thumbs.delete(id)
        // if successful creation, call our get function to get all the new todos
        .success(function(data) {
          $scope.loading = false;
          $scope.thumbs = data; // assign our new list of todos
        });
    };
  }])
  .controller('matchController', ['$scope','$http','Thumbs', function($scope, $http, Thumbs) {
    $scope.p1 = {};
    $scope.p2 = {};
    $scope.loading = true;

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    // use the service to get all the todos
    Thumbs.match()
      .success(function(data) {
                $scope.p1 = data.match[0]
                $scope.p2 = data.match[1]
        $scope.loading = false;
      });

    // CREATE ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.p1win = function() {
            console.log("asdfasd");

      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.p1._id != undefined && $scope.p2._id != undefined) {
        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        Thumbs.record($scope.p1, $scope.p2)

          // if successful creation, call our get function to get all the new todos
          .success(function(data) {
            $scope.loading = false;
            $scope.p1 = data.match[0]; // assign our new list of todos
            $scope.p2 = data.match[1]; // assign our new list of todos
          });
      }
    };

    $scope.p2win = function() {

      // validate the formData to make sure that something is there
      // if form is empty, nothing will happen
      if ($scope.p1._id != undefined && $scope.p2._id != undefined) {
        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        Thumbs.record($scope.p2, $scope.p1)

          // if successful creation, call our get function to get all the new todos
          .success(function(data) {
            $scope.loading = false;
            $scope.p1 = data.match[0]; // assign our new list of todos
            $scope.p2 = data.match[1]; // assign our new list of todos
          });
      }
    };

  }])

