# Mesh Gradient

A web component to create mesh gradients

## Syntax

```html
  <gradient-mesh
    width="512"
    height="512"
  >
    <gradient-row>
      <gradient-patch>
        <gradient-stop
          position="topLeft"
          x="0" y="0"
          cp1x="0" cp1y="0"
          cp2x="0" cp2y="0"
        >
        <gradient-stop
          position="topRight"
          x="100" y="0"
          cp1x="100" cp1y="0"
          cp2x="100" cp2y="0"
        >
        <gradient-stop
          position="bottomLeft"
          x="0" y="100"
          cp1x="0" cp1y="100"
          cp2x="0" cp2y="100"
        >
        <gradient-stop
          position="bottomRight"
          x="100" y="100"
          cp1x="100" cp1y="100"
          cp2x="100" cp2y="100"
        >
      </gradient-patch>
      <!-- More gradient-patch elements... -->
    </gradient-row>
    <!-- More gradient-row elements... -->
  </gradient-mesh>
```

Note that patches can refer to the previous patch above or beside it, so its possible to omit gradient-stops

## trying the example:

```bash
npm i # Install dependencies
npx tsc # Build project
python -m http.server -b 127.0.0.1 8000
```

And then open `http://127.0.0.1:8000/example.html` in your browser.

using a HTTP server is necessary to get around [this error](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default)
