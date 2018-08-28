# NHS Portal UI

NHS Portal landing, document and map pages

### Docker

Dashboard can be deployed as a single container from [edenlabllc/nhs.portal.web](https://hub.docker.com/r/edenlabllc/nhs.portal.web/) Docker Hub.

## Configurations

Application supports these environment variables:

| Environment Variable | Default Value | Description                                          |
| -------------------- | ------------- | ---------------------------------------------------- |
| `API_ENDPOINT`       | `-`           | URL to the API Gateway. eg. http://dev.ehealth.world |

## Technologies

- VanillaJS
- WebAnimation API
- DOM Level 4
- BEM
- PostCSS

## Run in localhost

- node version 8.9.4
- npm version 4.6.1
- ruby version 2.3.3

- npm install
- bundler install

## Tasks

- `npm run dev` - Run build and start livereload server
- `npm run build` - Build CSS and JS, copy static files
- `npm run production` - Run build and minify
