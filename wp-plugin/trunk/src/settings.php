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
        'jsdelivr' => array('label' => 'Load Assets From', 'default' => 'default', 'form' => '[label][select][br][br]', 'type' => 'select', 'options' => array(
          'default' => 'Default',
          'local' => 'Your Site',
          'jsdelivr' => 'Github (jsdelivr.net) (recommended)',
        )),

        'altShortcode' => array('label' => 'Alternate Shortcode Name', 'default' => '', 'form' => '[label][text][br][br]'),

        'defaultType' => array('label' => 'Default Type', 'default' => 'ajax', 'form' => '[label][select][br]', 'type' => 'select', 'options' => array(
          'ajax' => 'AJAX Load Content',
          'iframe' => 'Iframe Embed',
        )),
      );
      return $optionList;
    }

    // global settings shared by all plugins
    public function getOptionListGlobal(){
      $optionList = array(
        'jsdelivr' => array('label' => 'Load Assets From', 'default' => 'local', 'form' => '[label][select][br][hr][br]', 'type' => 'select', 'options' => array(
          'local' => 'Your Site',
          'jsdelivr' => 'Github (jsdelivr.net) (recommended)',
        )),
      );
      return $optionList;
    }

  }

  $aspieSoft_AjaxLoadPage_Settings = new AspieSoft_AjaxLoadPage_Settings();

}
