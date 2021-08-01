# Auto Ajax Load Page

Easily lazy load another page simply by adding a shortcode with its url.

The 2nd page wont load until the user scrolls to the bottom, than an ajax request is sent to get the page content.
This can help speed up large pages on your site, by not loading the stuff users don't see until they scroll down closer to the bottom.

## CDN Installation

```html
<script src="https://cdn.jsdelivr.net/gh/AspieSoft/aspiesoft-ajax-load-page/cdn/ajax-load-page.js"></script>
```

---

## Wordpress Installation

1. Upload plugin to the /wp-content/plugins
2. Activate the plugin through the "Plugins" menu in WordPress
3. Enjoy

## Usage

### How to use the wordpress shortcode

```WordPress
[ajax-load-page
  url="url of page to load"
]
```

---

### How to use this without wordpress

```javascript
<a href="url of page to load" class="ajax-load-page"></a>
```

---

### How to load only a specific part of a page

> On a page, if you wrap specific content with
>
> ```html
> <div class="ajax-load-content"></div>
> ```
>
> Using that class will tell the script to only load that section of the page.
>
> You can add the "ajax-load-content" as often as you want, and each of them will be loaded one after the other, without the in between content.

---

### What if the ajax request is still loading the header and footer?

> The plugin script, after getting the page data, uses jquery and attempts to find the main content.
>
> If this does fail, you can wrap your main content in the html tag with the class "ajax-load-content".
