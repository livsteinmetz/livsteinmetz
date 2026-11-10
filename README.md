### Hi, I'm Liv

I lead digital product for the [Barnes Foundation](https://www.barnesfoundation.org) and [Calder Gardens](https://caldergardens.org) in Philadelphia, working across engineering, UI/UX design, and product strategy. Before that I was a full-stack developer at Capital One and a technology product analyst at Accenture. I also play double bass.

Some things I've built with my team:

- **Visual Experience Platform**, an online classroom for looking at art together, with synced IIIF deep zoom
- **Barnes Focus**, in-gallery image recognition so the Barnes can keep its walls free of labels
- **Calder Gardens**, ticketing, membership, giving, and retail for a brand-new institution on the same codebase as the Barnes
- **[ACME ticketing client](https://github.com/BarnesFoundation/acme-ticketing-client)**, open source, for any museum on ACME

I write about museum digital work on [Medium](https://medium.com/@osteinmetz), and you can find me on [LinkedIn](https://linkedin.com/in/livsteinmetz).

---

## livsteinmetz.com

This repo is my personal site, [livsteinmetz.com](https://livsteinmetz.com). It's a static build in plain Node with no runtime dependencies.

The covers are put together in the browser from pre-rendered IIIF tiles (`site/art.js`), so the site runs on the same kind of image pipeline it describes. Every painting is public domain, and every work has a IIIF Presentation 3 manifest you can open in any IIIF viewer. The markup is semantic, with JSON-LD for each page.

Listening data is sealed in `content/private` and only opened at deploy time.

```
npm run content   # pull Medium posts and today's open access wall
npm run build     # write build/
npm run check     # confirm every tile the covers need exists
```
