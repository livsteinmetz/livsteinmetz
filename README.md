# livsteinmetz.web.app

Olivia Steinmetz's site. A static build in plain Node, with no runtime dependencies.

Covers are assembled in the browser from pre-rendered IIIF tiles (`site/art.js`), so the site runs on the same Barnes image pipeline it describes. The markup is semantic and hand-structured: `main`, `article`, `figure` and `figcaption`, plus JSON-LD and IIIF Presentation 3 manifests for every work.

    npm run content   # pull Medium posts and today's open access wall
    npm run build     # write build/
    npm run check     # confirm every tile the covers need exists
