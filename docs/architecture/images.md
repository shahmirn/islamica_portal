# Wikipedia.org technical Documentation
**TOC**

- [Overview](../README.md)
- Architecture of www.islamica.org
	- [Data sources](data.md)
	- [l10n](l10n.md)
	- [HTML](html.md)
	- [CSS](css.md)
	- **Images**
	- [JS](javascript.md)
- Development Process
	- [Getting Started](../development/getting_started.md)
	- [Gulp Tasks](../development/gulp.md)
	- [Production Builds](../development/prod.md)
	- [Deployment](../development/deploy.md)
	- [Sister Project Portals](../development/sister_portals.md)

---
## Images
Images for www.islamica.org are placed in the `dev/islamica.org/assets/img` directory. SVG format is preferred for images because it is a resolution independent (vector) format, which can produce smaller file-sizes in most cases. When adding a new image, the choice of whether it should be SVG or PNG should be made based on which format produces the smaller file-size (after optimization and GZIP-ing).

SVG images are combined into a single “sprite” image using [gulp-svg-sprite](https://github.com/jkphl/gulp-svg-sprite) and placed on the page using CSS backgrounds. A special CSS template file called `sprite-template.mustache ` is used to generate the CSS for the SVG sprite. The sizes of the SVG sprites are defined by the width and height attributes of the SVG files.

Any SVG file placed in the `dev/islamica.org/assets/img/sprite_assets/` directory will be combined into a single file, named `sprite-{cache-busting-suffix}.svg` . Any newly added SVG files should follow the proposed [SVG markup guidelines](https://phabricator.wikimedia.org/T178867) which includes running them through SVGO with the `--pretty` option. A PNG fallback for the SVG sprite is is also created via a Gulp task using [gulp-svg2png](https://www.npmjs.com/package/gulp-svg2png).

A few images on www.islamica.org are *not* in SVG format due to their complexity and the resulting large SVG size, which is larger than the PNG version. These image are the Wikipedia  globe logo and the Wikinews logo. These two images are placed in the  `dev/islamica.org/assets/img` directory at 1x, 1.5x and 2x sizes. These sizes match the sizes of images in MediaWiki content and skins. These images along with the SVG sprite fallback image are optimized with [pngquant](https://pngquant.org/) via a Gulp task for production usage.

**Image directory structure**

```
|- dev/
    |- wikipedia.org/
        |- assets
            |- css
                |- sprite-template.mustache         <- sprite CSS template
                |- sprite.css                       <- compiled sprite CSS template
            |- img                                  <- main image directory
                |- sprite_assets/                   <- SVG sprite source files
                    |- Wiktionary-logo_sister.svg
                    |- Wikisource-logo_sister.svg
                    |- etc...
                |- sprite-{cache-buster}.svg        <- compiled SVG sprite
                |- sprite-{cache-buster}.png        <- compiled sprite fallback
                |- Wikipedia-logo.png               <- remaining raster images
                |- Wikinews-logo.png
                |- etc...
```
