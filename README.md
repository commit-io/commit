# Commit

![logo](https://avatars1.githubusercontent.com/oa/525402?v=4&u=52d35b790d6044e52ddb5d1acfaef7e52b0b5c8e&s=240)

Commit is a simple motivation game for developer teams using Github + Slack.

## How it works

1. You sign up with your GitHub account and it'll ask for `repo` permissions in order to read the repos and create hooks on them.
2. You select in which repository you want the game.
3. The app will create a webhook in the selected repo and it'll track every push there.
4. You connect your Slack account.
5. You select in which channel you want to receive the updates from the app.
6. Now every push you make will be tracked by the app.
7. Everyday at 6pm (GMT -3) the app will send the weekly leaderboard on Slack.

![](https://image.ibb.co/ni1wsF/commit_screen.png)

## Motivation 
The idea came up during a very productive week of mine. The leader of my team started to count the commits of every one and I felt very motivated to push more and to divide my work into smaller and more organized commits to compete with my teammates.

The idea is based on the premise that adding competiton to the work environment will lead to more productivity and fun.

## How to use
Go to the [app page](https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/commit/) and follow the steps. Make sure you don't have any other hook activated in the repo that you select, because this may cause conflicts. Also, you need to be the owner or have admin permissions in this repo.

If you want to test the leaderboard, after you complete the setup, do a push to the repo, access https://wt-1d230a38e18ec582a3dce585ff81f44b-0.run.webtask.io/daily and then check your Slack.

## Tools
Commit is a "serverless" app built using [webtask.io](https://webtask.io) and [Auth0](https://auth0.com). The frontend uses [Angular Material](https://material.angularjs.org)

## Next steps
- Test coverage
- Remove "callback hell" and implement async/await (need to figure out how to do this in Webtask)
- Organize frontend code, maybe in a separated CDN
- Better "token flow". Avoid passing the `access_token` through query param and cache `github_token` and `slack_token`
- Better mongo schemas
