/*
The MIT License

Copyright (c) 2021 aspiesoftweb@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

;(function($){

  let running = false;

  $(window).on('scroll', function(){
    if(running){
      return;
    }
    if((window.innerHeight + window.scrollY) >= (document.body || (document.getElementsByTagName('body')[0]).offsetHeight - 200)){
      onScrollBottom();
    }
  });

  function onScrollBottom(){
    const loadPage = $('a.ajax-load-page').first();
    if(!loadPage){
      return;
    }
    running = true;

    let url = loadPage.getAttr('href');
    loadPage.removeClass('ajax-load-page');

    if(url.startsWith('https://'+window.location.hostname) || (window.location.protocol === 'http:' && url.startsWith('http://'+window.location.hostname))){
      $.ajax({
        url: url,
        type: 'GET',
        timeout: 10000,
        dataType: 'html',
        success: function(data){ 
          if(data && data.toString()){
            const resultHtml = $(data.toString());
            if(!resultHtml){
              loadPage.remove();
              running = false;
              return;
            }
            let pageContent = resultHtml.find('main');

            // attempt to find main content
            if(!pageContent.length){pageContent = resultHtml.find('#content');}
            if(!pageContent.length){pageContent = resultHtml.find('[role="main"]');}
            if(!pageContent.length){pageContent = resultHtml.find('.single-page-container');}
            
            if(!pageContent.length){
              loadPage.remove();
              running = false;
              return;
            }

            pageContent = pageContent.first();

            if(pageContent.hasClass('neve-main')){
              let row = pageContent.find('.row');
              if(row.length){pageContent = row.first();}
            }

            let ajaxLoad = pageContent.find('.ajax-load-content');
            if(ajaxLoad.length){
              ajaxLoad.forEach(page => {
                loadPage.before($(page));
              });
              loadPage.remove();
              running = false;
              return;
            }

            loadPage.after(pageContent);
          }
          loadPage.remove();
          running = false;
        },
        error: function(){
          loadPage.remove();
          running = false;
        }
      });
    }
  }

})(jQuery);
