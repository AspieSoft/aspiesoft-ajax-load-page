<?php
/**
* @package AspieSoftAjaxLoadPage
*/

if(!defined('ABSPATH')){
  http_response_code(404);
  die('404 Not Found');
}

if(!class_exists('AspieSoft_AjaxLoadPage_Main')){

  class AspieSoft_AjaxLoadPage_Main {

    public $plugin;
    private static $func;
    private static $options;

    public function init($pluginData){
      // get plugin data and load common functions
      $this->plugin = $pluginData;
      require_once(plugin_dir_path(__FILE__).'../functions.php');
      global $aspieSoft_Functions_v1_3;
      self::$func = $aspieSoft_Functions_v1_3;
      self::$options = self::$func::options($this->plugin);
    }

    public function start(){
      // add shortcode
      add_shortcode('ajax-load-page', array($this, 'shortcode_loadPage'));

      $altShortcode = self::$options['get']('altShortcode');
      if($altShortcode && $altShortcode !== null){
        add_shortcode($altShortcode, array($this, 'shortcode_loadPage'));
      }
    }


    function shortcode_loadPage($atts = ''){
      $attr = shortcode_atts(array(
        'url' => false, 'page' => false,
        'type' => false, 'method' => false,
      ), $atts);

      $attr = self::$func::cleanShortcodeAtts($attr);

      $url = $attr['url'];
      if(!$url && $attr['page']){
        $url = $attr['page'];
      }

      $type = $attr['type'];
      if(!$type && $type['method']){
        $type = $type['method'];
      }

      $url = get_site_url(null, $url);

      if($type === 'ajax'){
        return '<a href="'.esc_url($url).'" class="ajax-load-page"></a>';
      }else if($type === 'iframe'){
        return '<iframe page-src="'.esc_url($url).'" class="ajax-load-page"></a>';
      }

      $defaultType = self::$options['get']('defaultType', 'ajax');

      if($defaultType === 'ajax'){
        return '<a href="'.esc_url($url).'" class="ajax-load-page"></a>';
      }else if($defaultType === 'iframe'){
        return '<iframe page-src="'.esc_url($url).'" class="ajax-load-page"></a>';
      }

      return '<a href="'.esc_url($url).'" class="ajax-load-page"></a>';
    }

  }

  $aspieSoft_AjaxLoadPage_Main = new AspieSoft_AjaxLoadPage_Main();

}
