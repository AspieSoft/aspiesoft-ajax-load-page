<?php
/**
* @package AspieSoftAjaxLoadPage
*/

if(!defined('ABSPATH') || !current_user_can('manage_options')){
  http_response_code(404);
  die('404 Not Found');
}

if(!class_exists('AspieSoft_AjaxLoadPage_Settings')){

  class AspieSoft_AjaxLoadPage_Settings{

    // settings for admin page (client side assets/settings.js file reads this, and loads html inputs from it)
    public function getOptionList(){
      $optionList = array(
        'jsdelivr' => array('label' => 'Use jsdelivr.net (recommended)', 'default' => 'false', 'form' => '[check][label][br][br]', 'type' => 'bool'),

        'altShortcode' => array('label' => 'Alternate Shortcode Name', 'default' => '', 'form' => '[label][text][br][br]'),
      );
      return $optionList;
    }

  }

  $aspieSoft_AjaxLoadPage_Settings = new AspieSoft_AjaxLoadPage_Settings();

}
