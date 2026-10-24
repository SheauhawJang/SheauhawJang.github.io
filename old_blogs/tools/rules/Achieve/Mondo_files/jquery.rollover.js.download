var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/**
 * jQuery.rollover
 *
 * @version  1.0.2
 * @author   rew <rewish.org@gmail.com>
 * @link     http://rewish.org/javascript/jquery_rollover_plugin
 * @license  http://rewish.org/license/mit The MIT License
 *
 * Inspired by:
 * Telepath Labs (http://dev.telepath.co.jp/labs/article.php?id=15)
 *
 * Usage:
 * jQuery(document).ready(function($) {
 *   // <img>
 *   $('#nav a img').rollover();
 *
 *   // <input type="image">
 *   $('form input:image').rollover();
 *
 *   // set suffix
 *   $('#nav a img').rollover('_over');
 * });
 */
jQuery.fn.rollover = function(suffix) {
	suffix = suffix || '_on';
	return this.not('[src*="'+ suffix +'."]').each(function() {
		var img = jQuery(this);
		var src = img.attr('src');
		var _on = [
			src.substr(0, src.lastIndexOf('.')),
			src.substring(src.lastIndexOf('.'))
		].join(suffix);
		jQuery('<img>').attr('src', _on);
		img.hover(
			function() { img.attr('src', _on); },
			function() { img.attr('src', src); }
		);
	});
};

}

/*
     FILE ARCHIVED ON 15:08:08 May 02, 2023 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 04:12:51 Oct 09, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.479
  load_resource: 161.304 (2)
  PetaboxLoader3.resolve: 101.097 (2)
  PetaboxLoader3.datanode: 27.506 (2)
*/