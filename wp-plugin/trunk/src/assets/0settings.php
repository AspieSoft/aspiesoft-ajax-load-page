<?php
/**
* @package AspieSoftAjaxLoadPage
*/

if(!defined('ABSPATH')){
  http_response_code(404);
  die('404 Not Found');
}

// file named 0settings so it will be indexed at the top of the src/assets dir

if(!class_exists('AspieSoft_AjaxLoadPage_AssetSettings')){

  class AspieSoft_AjaxLoadPage_AssetSettings{

    public $plugin;
    public static $func;

    public function init($pluginData){
      $this->plugin = $pluginData;
      require_once(plugin_dir_path(__FILE__).'../../functions.php');
      global $aspieSoft_Functions_v1_3;
      self::$func = $aspieSoft_Functions_v1_3;
    }

    /*public function addScript($scriptBefore){
      
    }*/

    // addStyle can be used in the future to enqueue inline styles
    /*public function addStyle($scriptBefore){
      
    }*/

  }
  
  $aspieSoft_AjaxLoadPage_AssetSettings = new AspieSoft_AjaxLoadPage_AssetSettings();

}
