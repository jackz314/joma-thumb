angular.module('thumbService', [])

  // super simple service
  // each function returns a promise object
  .factory('Thumbs', ['$http',function($http) {
    return {
      get : function() {
        return $http.get('/api/thumbs');
      },
      match: function() {
        return $http.get('/api/match');
      },
      record: function(id1, id2) {
        return $http.post('/api/match', {win: id1, lose: id2});
      },
      create : function(thumbData) {
        return $http.post('/api/thumbs', thumbData);
      },
      createThumbImg : function(thumbData) {
        return $http.post('/api/imgs', thumbData);
      },
      update : function(id, rankData) {
        return $http.post('/api/thumbs/' + id, rankData);
      },
      delete : function(id) {
        return $http.delete('/api/thumbs/' + id);
      }
    }
  }]);

