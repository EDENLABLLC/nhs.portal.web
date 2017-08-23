# NHS Portal UI

NHS Portal landing, document and map pages

Demo: https://nebo15.github.io/nhs.portal.web/

### Docker

Dashboard can be deployed as a single container from [nebo15/nhs.portal.web](https://hub.docker.com/r/nebo15/nhs.portal.web/) Docker Hub.

## Configurations

Application supports these environment variables:

| Environment Variable  | Default Value           | Description |
| --------------------- | ----------------------- | ----------- |
| `API_ENDPOINT`        | `-`                     | URL to the API Gateway. eg. http://dev.ehealth.world |

## Technologies

- VanillaJS
- WebAnimation API
- DOM Level 4
- BEM
- PostCSS

## Tasks

- `npm run dev` - Run build and start livereload server
- `npm run build` - Build CSS and JS, copy static files
- `npm run production` - Run build and minify
- `npm run deploy` - Build, minify and deploy to GitHub Pages
