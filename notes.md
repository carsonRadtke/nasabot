# nasabot notes

## Deployment to Azure

// TODO (@cradtke): automate this w/ GitHub Actions.

```bash
$ docker build -t nasabot-docker --platform linux/amd64 .
$ docker tag nasabot-docker discordbotcontainers.azurecr.io/bots/nasabot:v0.0.1
$ docker push discordbotcontainers.azurecr.io/bots/nasabot:v0.0.1
```