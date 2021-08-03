<?php

if(!defined('ABSPATH')){
  http_response_code(404);
  die('404 Not Found');
}

if(!class_exists('AspieSoft_Functions_v1_3')){

  class AspieSoft_Functions_v1_3{

    public static function startsWith($haystack, $needle){
      return substr_compare($haystack, $needle, 0, strlen($needle)) === 0;
    }

    public static function endsWith($haystack, $needle){
      return substr_compare($haystack, $needle, -strlen($needle)) === 0;
    }

    public static function encodeArrayOrStringForClient($value){
      if(is_array($value)){
        $list = array();
        foreach($value as $key => $val){
          $list[esc_html(sanitize_key($key))] = esc_html(sanitize_text_field($val));
        }
        $value = wp_json_encode($list);
      }else{
        $value = esc_html(sanitize_text_field($value));
      }
      return $value;
    }

    public static function cleanShortcodeAtts($attr){
      foreach($attr as $k => $v){
        $vType = gettype($v);
        if($vType === 'string'){
          $attr[sanitize_key($k)] = esc_html(sanitize_text_field($v));
        }else if($vType === 'boolean'){
          $attr[sanitize_key($k)] = !!$v;
        }else if($vType === 'integer'){
          $attr[sanitize_key($k)] = intval($v);
        }else if($vType === 'double'){
          $attr[sanitize_key($k)] = floatval($v);
        }else{
          $attr[sanitize_key($k)] = null;
        }
      }
      return $attr;
    }

    public static function getValue($attr){
      if(!is_array($attr)){
        return $attr;
      }
      foreach($attr as $v){
        if($v !== null){
          return $v;
        }
      }
      return null;
    }

    public static function loadPluginFile($name, $plugin){
      $path = plugin_dir_path(__FILE__).'src/'.$name.'.php';
      if(file_exists($path)){
        $name = str_replace('-', '', ucwords($name, '-'));
        require_once($path);
        $pName = str_replace('-', '_', sanitize_html_class($plugin['pluginName']));
        if(class_exists('AspieSoft_'.$pName.'_'.$name)){
          return ${'aspieSoft_'.$pName.'_'.$name};
        }
      }
      return null;
    }

    // options
    public static function options($plugin){
      $functions = array(
        'get' => function($name, $default = null, $bool = false) use ($plugin){
          return self::options_get($plugin, $name, $default, $bool);
        },
        'set' => function($name, $value, $global = false, $autoload = true) use ($plugin){
          return self::options_set($plugin, $name, $value, $global, $autoload);
        },
        'del' => function($name, $global = false) use ($plugin){
          return self::options_del($plugin, $name, $global);
        },
        'getList' => function($list) use ($plugin){
          return self::options_getList($plugin, $list);
        },
        'setList' => function($list, $global, $autoload = true, $onActivation = false) use ($plugin){
          return self::options_setList($plugin, $list, $global, $autoload, $onActivation);
        },
      );

      return $functions;
    }

    private static function options_get($plugin, $name, $default = null, $bool = false){
      $name = sanitize_file_name(sanitize_text_field($plugin['setting'].'_'.$name));

      $option = null;
      if(is_multisite()){
        $option = sanitize_text_field(get_option($name));
        if(!isset($option) || !$option || $option === null || $option === ''){
          $option = sanitize_text_field(get_site_option($name));
        }
      }else{
        $option = sanitize_text_field(get_option($name));
      }
      if(!isset($option) || !$option || $option === null || $option === ''){
        $option = $default;
      }

      if($bool){
        if($option === true || $option === 1 || $option === 'true' || $option === 'TRUE' || $option === 'True'){
          return true;
        }else if($option === false || $option === 0 || $option === 'false' || $option === 'FALSE' || $option === 'False'){
          return false;
        }else{
          return null;
        }
      }

      return $option;
    }

    private static function options_set($plugin, $name, $value, $global = false, $autoload = true){
      $name = sanitize_file_name(sanitize_text_field($plugin['setting'].'_'.$name));
      if(is_multisite() && $global){
        update_site_option($name, sanitize_text_field($value), $autoload);
      }else{
        update_option($name, sanitize_text_field($value), $autoload);
      }
    }

    private static function options_del($plugin, $name, $global = false){
      $name = sanitize_file_name(sanitize_text_field($plugin['setting'].'_'.$name));
      if(is_multisite() && $global){
        delete_site_option($name);
      }else{
        delete_option($name);
      }
    }

    private static function options_getList($plugin, $list){
      $optionList = array();
      foreach($list as $name => $info){
        $bool = false;
        if(isset($info['type']) && $info['type'] === 'bool'){
          $bool = true;
        }
        $name = sanitize_text_field($name);
        $value = self::options_get($plugin, $name, $info['default'], false);
        $default = null; $options = null;
        if(isset($info['default'])){$default = $info['default'];}
        if(isset($info['options'])){$options = $info['options'];}

        $value = self::encodeArrayOrStringForClient($value);
        $default = self::encodeArrayOrStringForClient($default);
        $options = self::encodeArrayOrStringForClient($options);

        $optListLabel = null; $optListForm = null; $optListFormat = null; $optListType = null;
        if(isset($info['form'])){$optListLabel = esc_html__($info['label']);}
        if(isset($info['form'])){$optListForm = esc_html($info['form']);}
        if(isset($info['format'])){$optListFormat = esc_html($info['format']);}
        if(isset($info['type'])){$optListType = esc_html($info['type']);}

        $optionList[$name] = array(
          'name' => $name,
          'label' => $optListLabel,
          'value' => $value,
          'default' => $default,
          'form' => $optListForm,
          'format' => $optListFormat,
          'type' => $optListType,
          'options' => $options,
        );
      }
      return $optionList;
    }

    private static function options_setList($plugin, $list, $global = false, $autoload = true, $onActivation = false){
      foreach($list as $name => $info){
        $name = sanitize_text_field($name);
        if($onActivation){
          $value = self::options_get($plugin, $name, null, false);
          if($value && $value !== null){
            // twice with name change to force update
            self::options_set($plugin, $name, 'autoload:'.$value, $global, $autoload);
            self::options_set($plugin, $name, $value, $global, $autoload);
          }
        }else if(isset($_POST['AspieSoft_Option_'.$name])){
          $value = sanitize_text_field($_POST['AspieSoft_Option_'.$name]);
          if($value === 'del'){
            self::options_del($plugin, $name, $global);
          }else if(substr($value, 0, 4) === 'set:'){
            $value = substr($value, 4);
            self::options_set($plugin, $name, $value, $global, $autoload);
          }
        }
      }
    }

  }

  global $aspieSoft_Functions_v1_3;
  $aspieSoft_Functions_v1_3 = new AspieSoft_Functions_v1_3();

}
