=== AspieSoft Ajax Load Page ===
Contributors: AspieSoft
Tags: ajax, load, page, performance
Requires at least: 3.0.1
Tested up to: 5.6
Stable tag: 5.6
Requires PHP: 5.2.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://buymeacoffee.aspiesoft.com

== Description ==
Easily lazy load another page simply by adding a shortcode with its url.

The 2nd page wont load until the user scrolls to the bottom, than an ajax request is sent to get the page content.
This can help speed up large pages on your site, by not loading the stuff users don't see until they scroll down closer to the bottom.

== Installation ==

1. Upload plugin to the /wp-content/plugins
2. Activate the plugin through the "Plugins" menu in WordPress
3. Enjoy

== Frequently Asked Questions ==

= How do I use the shortcode? =
[ajax-load-page
  url="url of page to load"
]

= How to load only a specific part of a page? =
On a page, if you wrap specific content with "<div class="ajax-load-content"></div>".
Using that class will tell the script to only load that section of the page.
You can add the "ajax-load-content" as often as you want, and each of them will be loaded one after the other, without the in between content.

= What if the ajax request is still loading the header and footer? =
The plugin script, after getting the page data, uses jquery and attempts to find the main content.
If this does fail, you can wrap your main content in the html tag with the class "ajax-load-content".

== Changelog ==

= 1.0 =
Initial Commit

== Upgrade Notice ==

= 1.0 =
Initial Commit
