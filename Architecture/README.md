# Architecture

| File | Description |
|---|---|
| `Architecture_Diagram.svg` | System architecture diagram (open in browser or VS Code) |
| `Architecture_Diagram.png` | PNG export — generate from SVG using a browser screenshot |

## Generating PNG from SVG

Open `Architecture_Diagram.svg` in Chrome, press `Ctrl+Shift+I` (DevTools),  
run in console:
```js
// Or simply take a screenshot of the browser window
```
Or use [Inkscape](https://inkscape.org/) → File → Export PNG.

## Architecture Summary

```
Browser (React/Vite :5173)
    ↓  HTTP /api/*  (proxied in dev)
Express.js (:5000)
    ↓  Mongoose ODM
MongoDB (:27017)
    collections: complaints · departments · riskalerts · users
```
