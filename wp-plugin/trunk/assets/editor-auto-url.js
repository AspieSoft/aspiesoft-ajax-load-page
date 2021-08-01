/*
The MIT License

Copyright (c) 2020 aspiesoftweb@gmail.com

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

  $(document).ready(function(){
    $(document).on('paste', 'div[contenteditable="true"]', replaceHttpTextWithUrl);
    $(document).on('paste', '#content.wp-editor-area', replaceHttpTextWithUrl);
    setTimeout(function(){
      $('#content_ifr').contents().on('paste', 'body[contenteditable="true"]', replaceHttpTextWithUrl);
    }, 1000);
  });

  function replaceHttpTextWithUrl(e){
    let document = e.delegateTarget;

    let text = (e.originalEvent || e).clipboardData;
    if(!text){
      text = window.clipboardData.getData('text') || '';

      if(text && text !== '' && text.match(/^https?:\/\/(?:[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]+)+[\-A-Za-z0-9+&@#\/%=~_|]+[/?]?/)){
        e.preventDefault();

        if(e.target.tagName === 'TEXTAREA'){

          text = text.replace(/"/g, '&quot;');
          if(window.getSelection){
            text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            let newNode = document.createElement('p');
            newNode.innerText = '<a href="'+text+'">'+text+'</a>';
            window.getSelection().getRangeAt(0).insertNode(newNode);
          }else{
            text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            document.section.createRange().pasteText('<a href="'+text+'">'+text+'</a>');
          }

        }else if(window.getSelection){
          text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          let newNode = document.createElement('a');
          newNode.innerText = text;
          newNode.href = text;
          window.getSelection().getRangeAt(0).insertNode(newNode);
        }else{
          text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          document.section.createRange().pasteHTML('<a href="'+text+'">'+text+'</a>');
        }
      }

    }else{
      text = text.getData('text/plain') || '';

      if(text && text !== '' && text.match(/^https?:\/\/(?:[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]+)+[\-A-Za-z0-9+&@#\/%=~_|]+[/?]?/)){
        e.preventDefault();
        if(e.target.tagName === 'TEXTAREA'){
          document.execCommand('insertText', false, '<a href="'+text+'">'+text+'</a>');
        }else{
          text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          document.execCommand('insertHTML', false, '<a href="'+text+'">'+text+'</a>');
        }
      }

    }

  }

})(jQuery);
