const renderView = (locals) => {
  return `
  <html lang="en" >
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Angular Material style sheet -->
  <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.css">
  </head>

  <body ng-app="CommitApp" ng-cloak>
  <div ng-view></div>

  <!-- Angular Material requires Angular.js Libraries -->
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-resource.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-route.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-animate.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-aria.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular-messages.min.js"></script>

  <!-- Angular Material Library -->
  <script src="https://ajax.googleapis.com/ajax/libs/angular_material/1.1.0/angular-material.min.js"></script>

  <!-- Application bootstrap  -->
  <script type="text/javascript">
    (function() {
      var app = angular.module('CommitApp', ['ngRoute', 'ngResource', 'ngMaterial']);

      app.config(function($routeProvider) {
        $routeProvider
        .when("/", {
          template: '${renderRouteView('repo')}'
        })
        .when("/slack", {
          template: '${renderRouteView('slack')}'
        })
      });

      app.controller('RepoCtrl', function($scope, $http, $window) {
        var accessToken = $window.location.search.split('access_token=')[1];
        $http.defaults.headers.common['Authorization'] = "Bearer " + accessToken;
        $http({
          method: 'GET',
          url: 'https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/repos'
        }).then(function (response) {
          console.log(response.data.data);
          $scope.repos = response.data.data;
        });

        $scope.selectRepo = function(repo) {
          $http({
            method: 'POST',
            url: 'https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/repos',
            data: repo
          }).then(function (response) {
            console.log(response.data.data);
            $scope.repos = response.data.data;
          });
        };
      });
    })();
  </script>

  </body>
  </html>
  `;
};

const renderRouteView = (view) => {
  switch (view) {
    case 'repo':
      return `
      <div ng-controller="RepoCtrl" ng-cloak >
        <md-content class="md-padding" layout-align="center" layout="column">
          <div layout="row" layout-wrap>
            <md-card flex="30" ng-repeat="repo in repos">
              <md-card-title>
                <md-card-title-text>
                  <span class="md-headline">{{repo.name}}</span>
                  <span class="md-subhead">{{repo.full_name}}</span>
                </md-card-title-text>
                <md-card-title-media>
                  <img ng-src="{{repo.owner.avatar_url}}" style="height: 100px; width: 100px;">
                </md-card-title-media>
              </md-card-title>
              <md-card-actions layout="row" layout-align="end center">
                <md-button ng-click="selectRepo(repo)">Select</md-button>
              </md-card-actions>
            </md-card>
          </div>
        </md-content>
      </div>`.replace(/[\n\r]/g, '');;
    case 'slack':

      break;
  }
};

module.exports = {
  renderView
};
