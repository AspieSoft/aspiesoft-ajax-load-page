;(function($){

  // set toast message options
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "5000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  let form = $('#aspiesoft-admin-options').first();

  let optionsList = {};
  if(typeof AspieSoftAdminOptionsList === 'object'){
    optionsList = AspieSoftAdminOptionsList;
  }else{
    form.append('<h2>Error: Settings List Not Found!</h2>');
    return;
  }

  // add inputs for settings to form

  function buildInput(name, inputType, style, value, defaultValue, type, optionsList){
  
    if(value || value === 0 || value === false){value = value.toString();}else{value = '';}
    if(defaultValue || defaultValue === 0 || defaultValue === false){defaultValue = defaultValue.toString();}else{defaultValue = '';}
    
    if(type === 'bool'){
      if(value === true || value === 1 || (typeof value === 'string' && value.match(/^true$/i))){
        value = true;
      }else if(value === false || value === 0 || (typeof value === 'string' && value.match(/^false$/i))){
        value = false;
      }else{
        value = null;
      }
      if(defaultValue === true || defaultValue === 1 || (typeof defaultValue === 'string' && defaultValue.match(/^true$/i))){
        defaultValue = true;
      }else{
        defaultValue = false;
      }
    }else{
      if(!value || value.trim() === ''){
        value = '';
      }
      if(!defaultValue || defaultValue.trim() === ''){
        defaultValue = '';
      }
    }

    let valueAttr = '';
    if(value && type !== 'bool'){
      value = value.replace(/\\?"/g, '\\"');
      valueAttr = ' value="'+value+'"';
    }

    let defValueAttr = '';
    if(defaultValue && type !== 'bool'){
      defaultValue = defaultValue.replace(/\\?"/g, '\\"');
      defValueAttr = ' placeholder="'+defaultValue+'"';
    }
    
    if(optionsList){
      try{
        optionsList = JSON.parse(optionsList);
      }catch(e){optionsList = undefined;}
    }

    if(inputType === 'check'){

      let checked = '';
      if(value === true){
        checked = ' checked origValue="true"';
      }else if(value === false){
        checked = ' origValue="false"';
      }else if(defaultValue === true){
        checked = ' checked';
      }
      return '<input type="checkbox" name="'+name+'"'+checked+style+'>';

    }else if(inputType === 'textarea'){

      let origValue = '';
      if(value !== ''){origValue = ' origValue="'+value+'"';}
      return '<textarea name="'+name+'"'+valueAttr+defValueAttr+origValue+style+'></textarea>';

    }else if(inputType === 'select' && optionsList){

      let origValue = '';
      if(value !== ''){
        origValue = ' origValue="'+value+'"';
      }else{
        value = defaultValue;
      }

      let result = '<select name="'+name+'"'+origValue+style+'>';
      
      let optList = Object.keys(optionsList);
      optList.forEach(function(val){
        if(val === value){
          result += '<option value="'+val+'" selected>'+optionsList[val]+'</option>';
        }else{
          result += '<option value="'+val+'">'+optionsList[val]+'</option>';
        }
      });

      result += '</select>';

      return result;

    }else if(inputType === 'color'){
      //todo: add color input (not using for this project, but may use sometime in the future)

    }

    let origValue = '';
    if(value !== ''){origValue = ' origValue="'+value+'"';}

    return '<input type="'+inputType+'" name="'+name+'"'+valueAttr+defValueAttr+origValue+style+'>';
  }

  names = Object.keys(optionsList);
  for(let i = 0; i < names.length; i++){
    let name = names[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let option = optionsList[name];
    if(option){
      let label = option['label'].toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let value = option['value'].toString().replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      let defaultValue = option['default'].toString().replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

      if(!Array.isArray(defaultValue)){
        try{
          let json = JSON.parse(defaultValue);
          if(Array.isArray(json)){
            defaultValue = json;
          }else{
            defaultValue = [defaultValue];
          }
        }catch(e){defaultValue = [defaultValue];}
      }

      if(option['format'] && value && value !== ''){
        valueList = [];

        let val = '«'+value+'»';
        let format = ('«'+option['format'].toString()+'»').split(/(%s)/);

        for(let i = 0; i < format.length; i++){
          if(format[i] === '%s'){
            val = val.replace(new RegExp(format[i-1].replace(/\\?([^\w])/, '\\$1')+'(.*?)'+format[i+1].replace(/\\?([^\w])/, '\\$1')), function(_, v){
              valueList.push(v);
              return format[i+1];
            });
          }
        }

        value = valueList;
      }else if(!Array.isArray(value)){
        value = [value];
      }

      let valueIndex = 0;
      let html = option['form'].replace(/\[(\w+)(?:\{([\w\-:;]+)\}|)\]/g, function(_, inputType, inputStyle){
        let style = '';
        if(inputStyle){
          style = ' style="'+inputStyle+'"';
        }
        if(inputType === 'input'){
          inputType = 'text';
        }
        if(inputType === 'br'){
          return '<br'+style+'>';
        }
        if(inputType === 'hr'){
          return '<hr'+style+'>';
        }
        if(inputType === 'label'){
          return '<label for="'+name+'"'+style+'>'+label+'</label>';
        }

        let input = buildInput(name, inputType, style, value[valueIndex], defaultValue[valueIndex], option['type'], option['options']);
        valueIndex++;
        return input;
      });
      form.append(html);
    }
  }

  // prevent form default submit (will handle saving settings with ajax request instead)
  form.on('submit', function(e){
    e.preventDefault();
  });

  // build a queue to run buttons in clicked order (instead of preventing clicks until done)

  let currentFunction = false;
  let functionQueue = [];

  function runNextQueuedFunction(){
    if(functionQueue.length <= 0){
      currentFunction = false;
    }else{
      currentFunction = functionQueue.shift();
      if(currentFunction === 'default'){
        $('#aspiesoft-admin-options-default').click();
      }else if(currentFunction === 'save'){
        $('#aspiesoft-admin-options-save').click();
      }else if(currentFunction === 'save-global'){
        $('#aspiesoft-admin-options-save-global').click();
      }
    }
  }

  function queueFunction(name){
    if(!currentFunction){
      currentFunction = name;
    }else if(currentFunction && currentFunction !== name){
      if(!functionQueue.includes(name)){
        functionQueue.push(name);
      }
      return true;
    }
    return false;
  }

  // restore default options
  $('#aspiesoft-admin-options-default').on('click', function(e){
    e.preventDefault();

    if(queueFunction('default')){
      return;
    }

    form.children().each(function(){

      let elmTag = $(this).prop('tagName');
      let elmType = $(this).attr('type');
      if(!elmTag){return;}
      elmTag = elmTag.toLowerCase();
      if(elmType){elmType = elmType.toLowerCase();}else{elmType = '';}

      if((elmTag === 'input' && elmType !== 'hidden' && elmType !== 'button' && elmType !== 'submit') || elmTag === 'textarea' || elmTag === 'select'){
        let name = $(this).attr('name');

        //let origValue = $(this).attr('origValue');
        let defaultValue = optionsList[name]['default'];

        if(elmType === 'checkbox'){
          if(defaultValue === true || defaultValue === 1 || (typeof defaultValue === 'string' && defaultValue.match(/^true$/i))){
            this.checked = true;
          }else{
            this.checked = false;
          }
          this.setAttribute('set-default-value', '');
        }else if(elmTag === 'select'){
          this.value = defaultValue;
        }else if(elmType !== 'checkbox'){
          this.value = '';
        }
      }
    });

    toastr.info('Restored Default Options! <br>(Remember to click save)');

    runNextQueuedFunction();

  });


  // save local site options
  $('#aspiesoft-admin-options-save').on('click', function(e){
    e.preventDefault();

    if(queueFunction('save')){
      return;
    }

    let updatedValues = getUpdatedOptionValues(false);

    updatedValues['UpdateOptions'] = 'local';

    updatedValues['AspieSoft_Settings_Token'] = $('#aspiesoft-admin-options input[name="AspieSoft_Settings_Token"]').val();

    $.ajax({
      url: window.location.href,
      type: 'POST',
      data: updatedValues,
      timeout: 30000,
      success: function(){
        toastr.success('Saved Settings!');
        runNextQueuedFunction();
      },
      error: function(jqXHR){
        if(jqXHR.status == 401){
          toastr.error('Failed To Save Settings! (Session Expired)');
        }else if(jqXHR.status == 403){
          toastr.error('Failed To Save Settings! (Invalid Session Token)');
        }else{
          toastr.error('Failed To Save Settings!');
        }
        runNextQueuedFunction();
      }
    });

  });

  // save global network options
  $('#aspiesoft-admin-options-save-global').on('click', function(e){
    e.preventDefault();

    if(queueFunction('save-global')){
      return;
    }

    let updatedValues = getUpdatedOptionValues(true);

    updatedValues['UpdateOptions'] = 'global';

    updatedValues['AspieSoft_Settings_Token'] = $('#aspiesoft-admin-options input[name="AspieSoft_Settings_Token"]').val();

    $.ajax({
      url: window.location.href,
      type: 'POST',
      data: updatedValues,
      timeout: 30000,
      success: function(){
        toastr.success('Saved Network Settings!');
        runNextQueuedFunction();
      },
      error: function(jqXHR){
        if(jqXHR.status == 401){
          toastr.error('Failed To Save Network Settings! (Session Expired)');
        }else if(jqXHR.status == 403){
          toastr.error('Failed To Save Network Settings! (Invalid Session Token)');
        }else{
          toastr.error('Failed To Save Network Settings!');
        }
        runNextQueuedFunction();
      }
    });

  });

  // remove session token on unload (not critical because session token has an expression server side)
  $(window).on('beforeunload', function(){
    $.ajax({
      url: window.location.href,
      type: 'POST',
      data: {
        UpdateOptions: 'RemoveSession',
        AspieSoft_Settings_Token: $('#aspiesoft-admin-options input[name="AspieSoft_Settings_Token"]').val(),
      },
      timeout: 10000,
      async: false,
    });
  });


  // return updated options (avoids sending unchanged settings unnecessarily)
  function getUpdatedOptionValues(isGlobal = false){

    //todo: separate global (network) changes from local (site) changes (store different orig values)
    // may need admin getList function to return network values separate

    let updateOptionValues = {};

    let optionName = false;
    let optionValueBuilder = [];
    let optionOrigValueBuilder = [];
    let optionElmBuilder = [];

    form.children().each(function(){

      // get element type
      let elmTag = $(this).prop('tagName');
      let elmType = $(this).attr('type');
      if(!elmTag){return;}
      elmTag = elmTag.toLowerCase();
      if(elmType){elmType = elmType.toLowerCase();}else{elmType = '';}
      
      // don't run for hidden, button, and submit input types
      if(elmTag === 'input' && (elmType === 'hidden' || elmType === 'button' || elmType === 'submit')){
        return;
      }

      let name = $(this).attr('name');

      // return if invalid option
      if(!optionsList[name]){
        return;
      }

      // set default value if selected
      if(!optionName && this.hasAttribute('set-default-value')){
        updateOptionValues[name] = 'del';
        $(this).removeAttr('origValue');
        return;
      }

      //todo: test if textarea list works properly (not using for this project, but may use sometime in the future)

      if(elmType === 'checkbox'){ // if checkbox
        let origValue = $(this).attr('origValue');
        if(this.hasAttribute('set-default-value') && this.hasAttribute('origValue')){
          updateOptionValues[name] = 'del';
          $(this).removeAttr('origValue');
        }else if(this.checked && origValue !== 'true'){
          updateOptionValues[name] = 'set:true';
          $(this).attr('origValue', 'true');
        }else if(!this.checked && origValue !== 'false'){
          updateOptionValues[name] = 'set:false';
          $(this).attr('origValue', 'false');
        }
        return;
      }/*else if(elmTag === 'textarea'){ // if textarea
        value = $(this).val();
        origValue = $(this).attr('origValue');

        if(!value){value = '';}
        if(!origValue){origValue = '';}

        if(value === '' && origValue !== ''){
          updateOptionValues[name] = 'del';
          $(this).removeAttr('origValue');
        }else if(value !== origValue){
          value = JSON.stringify(value.split(/\r?\n/));
          updateOptionValues[name] = 'set:'+value;
          $(this).attr('origValue', value);
        }
        return;
      }*/

      // below should only run for inputs that are not a checkbox //!or textarea

      // init set option name
      if(!optionName){
        optionName = name;
      }

      // get value
      let value = $(this).val();
      let origValue = $(this).attr('origValue');

      // add value to builder
      if(optionName === name){
        optionValueBuilder.push(value);
        optionOrigValueBuilder.push(origValue);
        optionElmBuilder.push(this);
        return;
      }

      // add built value to update list on next option
      addOptionBuilderToUpdateList();

      if(this.hasAttribute('set-default-value')){
        updateOptionValues[name] = 'del';
        optionName = name;
        optionValueBuilder = [];
        optionOrigValueBuilder = [];
        optionElmBuilder = [];
        return;
      }

      // reset builder with next value
      optionName = name;
      optionValueBuilder = [value];
      optionOrigValueBuilder = [origValue];
      optionElmBuilder = [this];
      return;

    });

    // make sure there are no leftover values in option builder list
    addOptionBuilderToUpdateList();

    function addOptionBuilderToUpdateList(){
      if(optionValueBuilder.length > 0){
        let newValBlank = true;
        let newOrigValBlank = true;
        for(let i = 0; i < Math.max(optionValueBuilder.length, optionOrigValueBuilder.length); i++){
          if(optionValueBuilder[i] && optionValueBuilder !== ''){
            newValBlank = false;
          }
          if(optionOrigValueBuilder[i] && optionOrigValueBuilder !== ''){
            newOrigValBlank = false;
          }
          if(!newValBlank && !newOrigValBlank){
            break;
          }
        }

        if(newValBlank && !newOrigValBlank){
          updateOptionValues[optionName] = 'del';
          for(let i = 0; i < optionElmBuilder.length; i++){
            $(optionElmBuilder[i]).removeAttr('origValue');
          }
          return;
        }

        let format = optionsList[optionName]['format'];

        let newValue = '';
        let newOrigValue = '';

        if(format){ // set value from format
          let index = 0;
          newValue = format.replace(/%s/g, function(){
            return optionValueBuilder[index++] || '';
          });
          index = 0;
          newOrigValue = format.replace(/%s/g, function(){
            return optionOrigValueBuilder[index++] || '';
          });
        }else{
          newValue = optionValueBuilder.join('');
          newOrigValue = optionOrigValueBuilder.join('');
        }

        if(!newValue){newValue = '';}
        if(!newOrigValue){newOrigValue = '';}

        // add value to update list
        if(newValue.trim() === '' && newOrigValue.trim() !== ''){
          // set default value
          updateOptionValues[optionName] = 'del';
          for(let i = 0; i < optionElmBuilder.length; i++){
            $(optionElmBuilder[i]).removeAttr('origValue');
          }
        }else if(newValue !== newOrigValue){
          // set new value
          updateOptionValues[optionName] = 'set:'+newValue;
          for(let i = 0; i < optionElmBuilder.length; i++){
            $(optionElmBuilder[i]).attr('origValue', optionValueBuilder[i]);
          }
        }
      }
    }

    return updateOptionValues;
  }

  // fix css header width
  function setFormSize(){
    let header = $('#aspiesoft-admin-options-header');
    header.css('width', $('#wpbody-content').width()+'px');
    $('#aspiesoft-admin-options').css('margin-top', (header.height()+(header.css('padding').replace('px', '')*3))+'px');
  }
  setFormSize();
  setInterval(setFormSize, 10);

})(jQuery);
