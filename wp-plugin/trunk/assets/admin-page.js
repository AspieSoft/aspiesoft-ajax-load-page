;(function($){

  let optionsInfo = {};
  if(typeof AspieSoftAdminOptionsInfo === 'object'){
    optionsInfo = AspieSoftAdminOptionsInfo;
  }else{
    form.append('<h2>Error: Options Info Not Found!</h2>');
    return;
  }

  const wpBody = $('#wpbody-content');

  wpBody.children().wrapAll('<div class="wp-notifications"></div>');

  let adminHTML = `
    <div id="aspiesoft-admin-options-header"><h1>${optionsInfo.plugin_name}</h1><div id="aspiesoft-admin-options-menu">
    <input type="button" id="aspiesoft-admin-options-default" value="Restore Defaults">
  `;

  if(!optionsInfo.is_multisite){
    adminHTML += `<input type="button" id="aspiesoft-admin-options-save" value="Save Changes"></input>`;
  }else{
    if(optionsInfo.can_manage_network){
      adminHTML += `<input type="button" id="aspiesoft-admin-options-save-global" value="Network Save"></input>`;
    }
    adminHTML += `<input type="button" id="aspiesoft-admin-options-save" value="Save Changes">`;
  }

  adminHTML += `
    </div></div>
    <form id="aspiesoft-admin-options">
      <input type="hidden" name="AspieSoft_Settings_Token" value="${optionsInfo.settingsToken}">
    </form>
  `;

  wpBody.append(adminHTML);

  const wpNotifications = $('.wp-notifications', wpBody);
  const adminOptionsForm = $('#aspiesoft-admin-options', wpBody);

  const adminBarHeight = $('#wpadminbar').height();
  const optionsHeaderHeight = $('#aspiesoft-admin-options-header', wpBody).css('top', adminBarHeight+'px').height();
  const notificationHeight = wpNotifications.css('top', (optionsHeaderHeight+adminBarHeight)+'px').height();
  adminOptionsForm.css('transform', `translateY(${notificationHeight}px)`);

  setInterval(function(){
    adminOptionsForm.css('transform', `translateY(${wpNotifications.height()}px)`);
  }, 200);

})(jQuery);
