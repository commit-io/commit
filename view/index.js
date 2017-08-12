const renderView = (ctx) => {
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
          template: '${renderRouteView(ctx, 'repo')}'
        })
        .when("/slack", {
          template: '${renderRouteView(ctx, 'slack')}'
        })
        .when("/channels", {
          template: '${renderRouteView(ctx, 'channels')}'
        })
        .when("/finish", {
          template: '${renderRouteView(ctx, 'finish')}'
        })
      });

      app.config(function($mdThemingProvider) {

        // Use that theme for the primary intentions
        $mdThemingProvider.theme('default')
          .primaryPalette('deep-purple');

      });

      app.controller('RepoCtrl', function($scope, $http, $window, $mdDialog) {
        var accessToken = $window.location.search.split('access_token=')[1];
        $window.localStorage.setItem('access_token', accessToken);
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
            $window.location = "#/slack";
          });
        };

        $scope.showConfirm = function(ev, repo) {
          var confirm = $mdDialog.confirm()
            .title('Do you want to select this repo?')
            .textContent("We\'re going to create a new webhook to read your commits. But don\'t worry, we\'ll take care of it!")
            .targetEvent(ev)
            .ok('Confirm')
            .cancel('Cancel');

          $mdDialog.show(confirm).then(function() {
            $scope.selectRepo(repo);
          });
        };

      });

      app.controller('SlackCtrl', function($scope, $http, $window) {
        $scope.accessToken = $window.localStorage.getItem('access_token');

        $scope.redirectSlack = function() {
          $window.location.href = "https://slack.com/oauth/authorize?client_id=${ctx.secrets.SLACK_CLIENT_ID}&scope=bot channels:history chat:write:bot&redirect_uri=${ctx.secrets.SLACK_AUTH_REDIRECT_URL}%3Faccess_token=" + $scope.accessToken;
        };

      });

      app.controller('ChannelCtrl', function($scope, $http, $window) {
        var slackToken = $window.location.search.split('slack_token=')[1].split('&accessToken=')[0];
        $window.localStorage.setItem('slack_token', slackToken);
        var accessToken = $window.localStorage.getItem('access_token');

        $http.defaults.headers.common['Authorization'] = "Bearer " + accessToken;
        $http({
          method: 'GET',
          url: 'https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/channels'
        }).then(function (response) {
          console.log(response);
          $scope.channels = response.data.channels;
        });

        $scope.selectChannel = function(channel) {
          $http({
            method: 'POST',
            url: 'https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/channels',
            data: channel
          }).then(function (response) {
            console.log(response.channels);
            $window.location = "#/finish";
          });
        };
      });
    })();
  </script>

  </body>
  </html>
  `;
};

const renderRouteView = (ctx, view) => {
  switch (view) {
    case 'repo':
      return `
      <md-toolbar class="md-whiteframe-6dp">
        <div class="md-toolbar-tools">
          <h2 class="md-flex">Select the Repository</h2>
        </div>
      </md-toolbar>
      <div ng-controller="RepoCtrl" ng-cloak >
        <md-content class="md-padding" layout-align="center" layout="column">
          <div layout="row" layout-wrap>
            <md-card flex-xs flex-gt-xs="30" ng-repeat="repo in repos">
              <md-card-title>
                <md-card-title-text>
                  <span class="md-headline">{{repo.name}}</span>
                  <span class="md-subhead">{{repo.full_name}}</span>
                </md-card-title-text>
                <md-card-title-media>
                  <img ng-src="{{repo.owner.avatar_url}}" class="md-media-lg card-media">
                </md-card-title-media>
              </md-card-title>
              <md-card-actions layout="row" layout-align="end center">
                <md-button class="md-primary" ng-click="showConfirm($event, repo)">Select</md-button>
              </md-card-actions>
            </md-card>
          </div>
        </md-content>
      </div>`.replace(/[\n\r]/g, '');
    case 'slack':
    return `
    <md-toolbar class="md-whiteframe-6dp">
      <div class="md-toolbar-tools">
        <h2 class="md-flex">Connect your Slack account</h2>
      </div>
    </md-toolbar>
      <div ng-cloak ng-controller="SlackCtrl">
        <md-content class="md-padding" layout="row" layout-align="center center">
          <md-card ng-click="redirectSlack()" flex-xs flex-gt-xs="30" layout="column" layout-align="center center">
            <md-card-title>
              <md-card-title-text>
                <span class="md-headline">Click to connect</span>
                <span class="md-subhead">We are going to send the weekly leaderboard in the channel that you pick.</span>
              </md-card-title-text>
              <md-card-title-media>
                <img ng-src="https://a.slack-edge.com/436da/marketing/img/meta/app-256.png" class="md-media-sm card-media">
                </img>
              </md-card-title-media>
            </md-card-title>
          </md-card>
        </md-content>
      </div>`.replace(/[\n\r]/g, '');
    case 'channels':
      return `
      <md-toolbar class="md-whiteframe-6dp">
        <div class="md-toolbar-tools">
          <h2 class="md-flex">Select the Slack channel</h2>
        </div>
      </md-toolbar>
      <div ng-controller="ChannelCtrl" ng-cloak >
        <md-content class="md-padding" layout-align="center" layout="column">
          <div layout="row" layout-wrap>
            <md-card flex-xs flex-gt-xs="30" ng-repeat="channel in channels">
              <md-card-title>
                <md-card-title-text>
                  <span class="md-headline">{{channel.name}}</span>
                  <span class="md-subhead">{{channel.topic.value}}</span>
                </md-card-title-text>
                <md-card-title-media>
                <img ng-src="https://a.slack-edge.com/436da/marketing/img/meta/app-256.png" class="md-media-sm card-media">
                </img>
                </md-card-title-media>
              </md-card-title>
              <md-card-actions layout="row" layout-align="end center">
                <md-button ng-class="md-primary" ng-click="selectChannel(channel)">Select</md-button>
              </md-card-actions>
            </md-card>
          </div>
        </md-content>
      </div>`.replace(/[\n\r]/g, '');
      case 'finish':
      return `
      <md-toolbar class="md-whiteframe-6dp">
        <div class="md-toolbar-tools">
          <h2 class="md-flex">You have finished the setup</h2>
        </div>
      </md-toolbar>
        <div ng-cloak ng-controller="SlackCtrl">
          <md-content class="md-padding" layout="row" layout-align="center center">
            <md-card flex-xs flex-gt-xs="30" layout="column" layout-align="center center">
              <md-card-title>
                <md-card-title-text>
                  <span class="md-headline">You are good to go!</span>
                  <span class="md-subhead">Now we are going to track the commits and send the weekly dashboard in the channel that you selected. </span>
                </md-card-title-text>
              </md-card-title>
            </md-card>
          </md-content>
        </div>`.replace(/[\n\r]/g, '');
  }
};

module.exports = {
  renderView
};
