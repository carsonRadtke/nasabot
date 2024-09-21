# nasabot notes

## Deployment to Azure

// TODO (@cradtke): automate this w/ GitHub Actions.

```bash
$ az login -t <TenantId>
$ az acr login --name <ContainerRegistryName>
$ docker build -t <ImageTag> --platform <ContainerPlatform> .
$ docker tag <ImageTag> <ContainerInstanceNameAndVersion>
$ docker push <ContainerInstanceNameAndVersion>
```