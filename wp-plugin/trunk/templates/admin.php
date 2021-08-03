<?php

if(!defined('ABSPATH') || !current_user_can('manage_options')){
  http_response_code(404);
  die('404 Not Found');
}

if(!class_exists('AspieSoft_Settings')){

  class AspieSoft_Settings{

    public $plugin;

    private static $func;

    function start(){
      $options = self::$func::options($this->plugin);
      $optionsGlobal = self::$func::options(array('setting' => 'global'));
      $optionList = array();

      // get option list from src directory
      require_once(plugin_dir_path(__FILE__).'../src/settings.php');
      $pName = str_replace('-', '_', sanitize_html_class($this->plugin['pluginName']));
      if(class_exists('AspieSoft_'.$pName.'_Settings')){
        $optionList = ${'aspieSoft_'.$pName.'_Settings'}->getOptionList();
        //$optionListGlobal = ${'aspieSoft_'.$pName.'_Settings'}->getOptionListGlobal();
      }

      $optionList = $options['getList']($optionList);
      //$optionListGlobal = $optionsGlobal['getList']($optionListGlobal);

      if(isset($_POST['UpdateOptions'])){ // if post request, update options

        // unique identifier to allow multiple sessions
        $computerId = hash('sha256', sanitize_text_field($_SERVER['HTTP_USER_AGENT']).sanitize_text_field($_SERVER['LOCAL_ADDR']).sanitize_text_field($_SERVER['LOCAL_PORT']).sanitize_text_field($_SERVER['REMOTE_ADDR']));

        // verify session token
        $settingsToken = get_option('AspieSoft_Settings_Token'.$computerId);

        // send expired if missing
        if(!isset($settingsToken) || $settingsToken == '' || $settingsToken == null){
          http_response_code(401);
          exit();
        }

        $sToken = json_decode($settingsToken, true);

        // send expired if expired
        if(!$sToken || !$sToken['expires'] || round(microtime(true) * 1000) > $sToken['expires']){
          delete_option('AspieSoft_Settings_Token'.$computerId);
          http_response_code(401);
          exit();
        }

        // send permission error if token not sent
        if(!isset($_POST['AspieSoft_Settings_Token'])){
          http_response_code(403);
          exit();
        }

        // send permission error if token is not valid
        if($_POST['AspieSoft_Settings_Token'] !== $sToken['token']){
          http_response_code(403);
          exit();
        }

        // update options
        $updateOptions = sanitize_text_field($_POST['UpdateOptions']);
        if($updateOptions === 'RemoveSession'){ // remove session token
          delete_option('AspieSoft_Settings_Token'.$computerId);

          // end request with 204 response
          http_response_code(204);
          exit();
        }else if($updateOptions === 'local'){ // update site options
          $options['setList']($optionList, false);
          //$optionsGlobal['setList']($optionListGlobal, false);

          // update session expiration
          $sToken['expires'] = round(microtime(true) * 1000)+7200*1000;
          update_option('AspieSoft_Settings_Token'.$computerId, wp_json_encode($sToken), false);

          // end request with 200 response
          http_response_code(200);
          exit();
        }else if($updateOptions === 'global'){ // update network default options (for multisite)
          $options['setList']($optionList, true);
          //$optionsGlobal['setList']($optionListGlobal, true);

          // update session expiration
          $sToken['expires'] = round(microtime(true) * 1000)+7200*1000;
          update_option('AspieSoft_Settings_Token'.$computerId, wp_json_encode($sToken), false);

          // end request with 200 response
          http_response_code(200);
          exit();
        }

        // end request with 404 response (because update request not found)
        http_response_code(404);
        exit();
      }else{ // load settings form
        $jsonOptions = array();
        /*foreach($optionListGlobal as $k => $v){
          $jsonOptions['AspieSoft_Option_'.$k] = $v;
        }*/
        foreach($optionList as $k => $v){
          $jsonOptions['AspieSoft_Option_'.$k] = $v;
        }
        $json = wp_json_encode($jsonOptions);


        // generate random session token
        $settingsToken = str_replace('"', '`', wp_generate_password(64));

        // unique identifier to allow multiple sessions
        $computerId = hash('sha256', sanitize_text_field($_SERVER['HTTP_USER_AGENT']).sanitize_text_field($_SERVER['LOCAL_ADDR']).sanitize_text_field($_SERVER['LOCAL_PORT']).sanitize_text_field($_SERVER['REMOTE_ADDR']));

        // store session token with expiration ($wp_session was not working)
        update_option('AspieSoft_Settings_Token'.$computerId, wp_json_encode(array(
          'token' => $settingsToken,
          'expires' => round(microtime(true) * 1000)+7200*1000, // 2 hours
        )), false);


        $pluginInfoJson = wp_json_encode(array(
          'plugin_name' => esc_html($this->plugin['name']),
          'is_multisite' => !!is_multisite(),
          'can_manage_network' => !!(current_user_can('manage_network_plugins') || current_user_can('manage_network_options') || current_user_can('manage_network')),
          'settingsToken' => esc_html($settingsToken)
        ));

        add_action('admin_enqueue_settings_scripts', array($this, 'enqueue'));
        do_action('admin_enqueue_settings_scripts', array(
          'json' => $json,
          'pluginInfo' => $pluginInfoJson,
        ));
      }
    }

    function enqueue($opts){
      $jsonOptions = $opts['json'];
      $jsonInfo = $opts['pluginInfo'];

      $ver = '1.2';

      // styles
      wp_enqueue_style('toastr', plugins_url('/../assets/toastr/toastr.min.css', __FILE__), array(), '2.1.4');

      wp_enqueue_style('AspieSoft_Settings_Style', plugins_url('/../assets/settings.css', __FILE__), array(), $ver);


      // scripts
      wp_enqueue_script('AspieSoft_Settings_AdminPage_Script', plugins_url('/../assets/admin-page.js', __FILE__), array('jquery'), $ver, true);
      wp_add_inline_script('AspieSoft_Settings_AdminPage_Script', ";var AspieSoftAdminOptionsInfo = $jsonInfo;", 'before');

      wp_enqueue_script('toastr', plugins_url('/../assets/toastr/toastr.min.js', __FILE__), array('jquery'), '2.1.4', false);

      wp_enqueue_script('AspieSoft_Settings_Script', plugins_url('/../assets/settings.js', __FILE__), array('jquery'), $ver, true);
      wp_add_inline_script('AspieSoft_Settings_Script', ";var AspieSoftAdminOptionsList = $jsonOptions;", 'before');
    }

    function init(){
      // get plugin data
      $pluginData = get_plugin_data(WP_PLUGIN_DIR.'/'.sanitize_text_field(constant('PLUGIN_BASENAME_'.basename(plugin_dir_path(dirname(__FILE__, 1))))));
      $this->plugin = array(
        'name' => sanitize_text_field($pluginData['Name']),
        'setting' => str_replace('-', '', ucwords(sanitize_text_field($pluginData['TextDomain']), '-')),
        'slug' => sanitize_text_field($pluginData['TextDomain']),
        'version' => sanitize_text_field($pluginData['Version']),
        'author' => sanitize_text_field($pluginData['AuthorName']),
        'pluginName' => str_replace('-', '', ucwords(trim(str_replace(strtolower(sanitize_text_field($pluginData['AuthorName'])), '', strtolower(sanitize_text_field($pluginData['TextDomain']))), '-'), '-')),
      );

      // load common functions
      require_once(plugin_dir_path(__FILE__).'../functions.php');
      global $aspieSoft_Functions_v1_3;
      self::$func = $aspieSoft_Functions_v1_3;
    }

  }

  $aspieSoft_Settings = new AspieSoft_Settings();
  $aspieSoft_Settings->init();
  $aspieSoft_Settings->start();

}
