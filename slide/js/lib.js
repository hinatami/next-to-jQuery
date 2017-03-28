/*==================================================================
Name: WebSlides
Version: Pro (trackpad gestures and keyboard shortcuts).
Description: HTML presentations made easy.
URL: https://github.com/jlantunez/WebSlides
Thanks @LuisSacristan for your help :)
-
Based on SimpleSlides, by Jenn Schiffer:
https://github.com/jennschiffer/SimpleSlides
==================================================================== */

jQuery(document).ready(function($){

      var ID = {
        slideshow : 'webslides',
        slide : 'slide',
        counter : 'counter',
        navigation : 'navigation',
        next : 'next',
        previous : 'previous',
        current : 'current',
        verticalClass : 'vertical' // #webslides.vertical - You must add this class to slideshow for vertical sliding
      };
      var easing = 'swing';
      var slideOffset = 50; // minimun number of pixels for sliding
      var verticalDelay = 150; // to avoid 2 slides in a row
      var wheelDetail = -6; // how far the wheel turned for Firefox
      var wheelDelta = 150; // how far the wheel turned for Chrome
      var isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));

      var $slideshow = jQuery('#' + ID.slideshow),
          $navigation = jQuery('<div>').attr('id','navigation'),
          $slides = $slideshow.children('section').addClass(ID.slide),
          $currentSlide,
          $firstSlide = $slides.first(),
          $lastSlide = $slides.last(),
          $auxSlide = null;

      var total = $slides.length;

      var labels = {
        next : $slideshow.hasClass(ID.verticalClass)?'&darr;':'&rarr;',
        previous : $slideshow.hasClass(ID.verticalClass)?'&uarr;':'&larr;',
        separator : ' / '
      };


      // make sure the last slide doesn't page break while printing.
      jQuery('head').append( '<style> .slide:nth-child(' + total + ') { page-break-after: auto }</style>' );

      // remove non-section children (like html comments which wp wraps in <p> tags)
      $slideshow.children().not('section').remove();

      // add navigational arrows and counter
      $navigation.append(jQuery('<a href="#" title="Arrow Keys">').attr('id',ID.previous).html(labels.previous));
      $navigation.append(jQuery('<a href="#" title="Arrow Keys">').attr('id',ID.next).html(labels.next));
      $slideshow.append($navigation);
      $slideshow.append(jQuery('<span>').attr('id',ID.counter));

      var $counter = jQuery('#'+ID.counter),
          $next = jQuery('#'+ID.next),
          $previous = jQuery('#'+ID.previous);
      $navigation.append($counter);


      /*** FUNCTIONS ***/

      var updateCounter = function() {
        // updates the counter
        $counter.text(slidePointer.current + labels.separator + slidePointer.last);
      };

      var updateURL = function() {
        // updates slide state
        var currentURL = document.location.toString();

        if (currentURL.indexOf('#') != 1){
          currentURL = currentURL.substr(0,currentURL.indexOf('#'));
        }

        history.pushState(null, null, '#slide='+ slidePointer.current );
      };

      var hideCurrentSlide = function() {
        // hide the current slide
        if ( $currentSlide ) {
          $currentSlide.hide().removeClass(ID.current);
        }
      };

      $slideshow.data('moving', false);
      var nextSlide = function() {
        var nextSlide;
        if ($slideshow.hasClass(ID.verticalClass) && !isMobile) { // Is vertical
          if ($slideshow.data('moving')) return;
          $slideshow.data('moving', true);
          jQuery('html').css({overflow: 'hidden'});

          nextSlide = $currentSlide.next();
          slidePointer.current = ((slidePointer.current+1)%total);
          if (slidePointer.current === 0) slidePointer.current = total;

          // show next slide
          nextSlide.show().addClass(ID.current);
          // scroll to next slide
          var animated = false;
          jQuery('html, body').animate({scrollTop: nextSlide.offset().top}, 500, easing, function() {
            if (!animated) {
              $currentSlide.hide().removeClass(ID.current);
              $currentSlide.siblings('.slide').last().after($currentSlide);
              $currentSlide = nextSlide;

              // update counter
              updateCounter();

              // update url
              updateURL();

              // fire slide event
              fireSlideEvent();

              jQuery('html').css({overflow: 'auto'});
              setTimeout(function() {$slideshow.data('moving', false);}, $slideshow.data('iswheel')?verticalDelay:0);
            }
            animated = true;
          });



        } else { // Is landscape
          jQuery("html, body").animate({ scrollTop: 0 }, 0);
          // hide current slide
          hideCurrentSlide();

          // get the next slide
          nextSlide = $currentSlide.next();

          nextSlide.show().addClass(ID.current);
          $currentSlide.siblings('.slide').last().after($currentSlide);
          $currentSlide = nextSlide;
          slidePointer.current = ((slidePointer.current+1)%total);
          if (slidePointer.current == 0) slidePointer.current = total;

          // update counter
          updateCounter();

          // update url
          updateURL();

          // fire slide event
          fireSlideEvent();
        }
      };

      var previousSlide = function() {
        var prevSlide;
        if ($slideshow.hasClass(ID.verticalClass) && !isMobile) { // Is vertical
          if ($slideshow.data('moving')) return;
          $slideshow.data('moving', true);
          jQuery('html').css({overflow: 'hidden'});

          $currentSlide.before($currentSlide.siblings('.slide').last());

          prevSlide = $currentSlide.prev();

          if (prevSlide.length === 0) return false;
          // show next slide
          prevSlide.show().addClass(ID.current);
          // scroll to next slide
          var animated = false;
          jQuery('html, body').scrollTop($currentSlide.offset().top);
          jQuery('html, body').animate({scrollTop: prevSlide.offset().top}, 500, easing, function() {
            if (!animated) {
              $currentSlide.hide().removeClass(ID.current);
              $currentSlide = prevSlide;

              // not the last slide => go to the next one and increment the counter
              $currentSlide = prevSlide;
              slidePointer.current = slidePointer.current== 1? total : (slidePointer.current-1);

              // update counter
              updateCounter();

              // update url
              updateURL();

              // fire slide event
              fireSlideEvent();

              jQuery('html').css({overflow: 'auto'});
              setTimeout(function() {$slideshow.data('moving', false);}, $slideshow.data('iswheel')?verticalDelay:0);
            }
            animated = true;
          });



        } else { // Is landscape
          jQuery("html, body").animate({ scrollTop: 0 }, 0);
          // hide current slide
          hideCurrentSlide();

          // get the previous slide
          $currentSlide.before($currentSlide.siblings('.slide').last());
          prevSlide = $currentSlide.prev();

          prevSlide.show().addClass(ID.current);
          $currentSlide = prevSlide;
          slidePointer.current = slidePointer.current== 1? total : (slidePointer.current-1);

          // update counter
          updateCounter();

          // update URL
          updateURL();

          // fire slide event
          fireSlideEvent();
        }
      };

      var goToSlide = function(slideNumber) {
        // hide current slide
        hideCurrentSlide();
        moveToSlide = slideNumber-1;

        $currentSlide = $slides.eq(moveToSlide);
        $currentSlide.show().addClass(ID.current);
        jQuery('.slide:lt('+$currentSlide.index()+')').each(function() {
          var $this = jQuery(this);
          $this.siblings('.slide').last().after($this);
        });
        slidePointer.current = slideNumber;

        // update counter
        updateCounter();
      };

      var fireSlideEvent = function(slide) {
        var slideEvent = new window.CustomEvent('slidechanged', {
          detail: { slide: slide || $currentSlide }
        });
        window.dispatchEvent(slideEvent);
      };

      /*** INIT SLIDESHOW ***/

      // Initially hide all slides
      $slides.hide();

      // The first slide is number first, last is slides length
      var slidePointer = {
        current : 1,
        last : $slides.length
      };

      var slideState = parseInt(document.location.hash.replace('#slide=', ''));

      if ( slideState && (slideState > 0 && slideState <= $slides.length )) {
        // if slide= hash state is given and valid, go to that slide
        goToSlide(slideState);
      }
      else {
        // The first slide is the first slide, so make visible and set the counter...
        $currentSlide = $firstSlide.show().addClass(ID.current);
        updateCounter();
      }


      /*** EVENTS ***/

      // "next" arrow clicked => next slide
      $next.click( function(e){
        e.preventDefault();
        nextSlide();
      });

      // "previous" arrow clicked => previous slide
      $previous.click( function(e){
        e.preventDefault();
        previousSlide();
      });

      // Add keyboard shortcuts for changing slides
      jQuery(document).keydown(function(e){
        if (!$slideshow.hasClass(ID.verticalClass) || isMobile) {
          $slideshow.data('iswheel', false);
          if (e.which == 39 || e.which == 32) {
            // right key pressed => next slide
            nextSlide();
            return false;
          }
          else if (e.which == 37) {
            // left or l key pressed => previous slide
            previousSlide();
            return false;
          }
        }
      });

      // Add keyboard shortcuts for changing slides
      jQuery(document).keydown(function(e){
        if ($slideshow.hasClass(ID.verticalClass) && !isMobile) {
          $slideshow.data('iswheel', false);
          if (e.which == 40 || e.which == 32) {
            // right key pressed => next slide
            nextSlide();
            return false;
          }
          else if (e.which == 38) {
            // left or l key pressed => previous slide
            previousSlide();
            return false;
          }
        }
      });


      /**
       *  Bind the event HashChange when the prev/next history button was clicked
      */
      jQuery(window).bind("hashchange", function () {
        if (hasHash()) {
          goToSlideIfSlideHashChange();
        } else {
          window.location.reload();
        }
      });

      function hasHash() {
        return window.location.hash ? true : false;
      }

      function goToSlideIfSlideHashChange() {
        var paramsArr = getArrayOfHashParams();
        var slideObj = $.grep(paramsArr, function (e) {
          return (e.key == "slide");
        });
        if (slideObj.length == 1) {
          goToSlide(slideObj[0].value);
        }
      }

      function getArrayOfHashParams() {
        var hash = window.location.hash.replace('#', '').split('&');
        var paramsArr = new Array([]);
        for (var i = 0; i < hash.length; i++) {
          var itemArray = hash[i].split('=');
          var action = new Object({});
          action.key = itemArray[0];
          action.value = itemArray[1];
          paramsArr.push(action);
        }
        return paramsArr;
      }

      // Mouse wheel
      jQuery(window).bind('mousewheel DOMMouseScroll', function(event){
        $slideshow.data('iswheel', true);
        if ($slideshow.hasClass(ID.verticalClass) && !isMobile) {
          if (event.originalEvent.wheelDelta > wheelDelta || event.originalEvent.detail < wheelDetail) {
            // Scroll up
            previousSlide();
          } else if (event.originalEvent.wheelDelta < -wheelDelta || event.originalEvent.detail > -wheelDetail) {
            // scroll down
            nextSlide();
          }
        }
      });

      // Touch
      jQuery(window).on("touchstart", function(ev) {
        var e = ev.originalEvent;
        $slideshow.data('touchYStart', e.touches[0].screenY);
        $slideshow.data('touchXStart', e.touches[0].screenX);
        $slideshow.data('touchYEnd', e.touches[0].screenY);
        $slideshow.data('touchXEnd', e.touches[0].screenX);
      });
      jQuery(window).on("touchmove", function(ev) {
        var e = ev.originalEvent;
        $slideshow.data('touchYEnd', e.touches[0].screenY);
        $slideshow.data('touchXEnd', e.touches[0].screenX);
      });
      jQuery(window).on("touchend", function(ev) {
        $slideshow.data('iswheel', false);
        var e = ev.originalEvent;
        var diffX = $slideshow.data('touchXStart') - $slideshow.data('touchXEnd');
        var diffY = $slideshow.data('touchYStart') - $slideshow.data('touchYEnd');
        if ((!$slideshow.hasClass(ID.verticalClass) || isMobile) && Math.abs(diffX) > Math.abs(diffY)) {
          if(diffX < -slideOffset) {
            previousSlide();
            // Scroll up
          } else if(diffX > slideOffset) {
            // scroll down
            nextSlide();
          }
        }
      });

      // Tabs
      jQuery('ul.tabs li').click(function(){
          var $this = jQuery(this);
          var tab_id = $this.attr('data-tab');
          jQuery('ul.tabs li').removeClass('current');
          jQuery('.tab-content').removeClass('current');
          $this.addClass('current');
          jQuery("#"+tab_id).addClass('current');
      });

      /* jQuery plugin */
      $.WebSlides = function () {};

      /* Public goToSlide */
      $.WebSlides.goToSlide = goToSlide;
    });

    // Prototype better, faster. To show the grid/baseline.png, press Enter on keyboard
    $(document).keypress(function(e) {
    if(e.which == 13) {
    $('body').toggleClass('baseline').css('height', $(document).height());
    }
  });

/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript */
var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(\w+)\b/i,t=0,n=_self.Prism={manual:_self.Prism&&_self.Prism.manual,util:{encode:function(e){return e instanceof a?new a(e.type,n.util.encode(e.content),e.alias):"Array"===n.util.type(e)?e.map(n.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function(e){var t=n.util.type(e);switch(t){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=n.util.clone(e[r]));return a;case"Array":return e.map&&e.map(function(e){return n.util.clone(e)})}return e}},languages:{extend:function(e,t){var a=n.util.clone(n.languages[e]);for(var r in t)a[r]=t[r];return a},insertBefore:function(e,t,a,r){r=r||n.languages;var l=r[e];if(2==arguments.length){a=arguments[1];for(var i in a)a.hasOwnProperty(i)&&(l[i]=a[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==t)for(var i in a)a.hasOwnProperty(i)&&(o[i]=a[i]);o[s]=l[s]}return n.languages.DFS(n.languages,function(t,n){n===r[e]&&t!=e&&(this[t]=o)}),r[e]=o},DFS:function(e,t,a,r){r=r||{};for(var l in e)e.hasOwnProperty(l)&&(t.call(e,l,e[l],a||l),"Object"!==n.util.type(e[l])||r[n.util.objId(e[l])]?"Array"!==n.util.type(e[l])||r[n.util.objId(e[l])]||(r[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,l,r)):(r[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,null,r)))}},plugins:{},highlightAll:function(e,t){var a={callback:t,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",a);for(var r,l=a.elements||document.querySelectorAll(a.selector),i=0;r=l[i++];)n.highlightElement(r,e===!0,a.callback)},highlightElement:function(t,a,r){for(var l,i,o=t;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1].toLowerCase(),i=n.languages[l]),t.className=t.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=t.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var s=t.textContent,u={element:t,language:l,grammar:i,code:s};if(n.hooks.run("before-sanity-check",u),!u.code||!u.grammar)return u.code&&(u.element.textContent=u.code),n.hooks.run("complete",u),void 0;if(n.hooks.run("before-highlight",u),a&&_self.Worker){var g=new Worker(n.filename);g.onmessage=function(e){u.highlightedCode=e.data,n.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(u.element),n.hooks.run("after-highlight",u),n.hooks.run("complete",u)},g.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=n.highlight(u.code,u.grammar,u.language),n.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(t),n.hooks.run("after-highlight",u),n.hooks.run("complete",u)},highlight:function(e,t,r){var l=n.tokenize(e,t);return a.stringify(n.util.encode(l),r)},tokenize:function(e,t){var a=n.Token,r=[e],l=t.rest;if(l){for(var i in l)t[i]=l[i];delete t.rest}e:for(var i in t)if(t.hasOwnProperty(i)&&t[i]){var o=t[i];o="Array"===n.util.type(o)?o:[o];for(var s=0;s<o.length;++s){var u=o[s],g=u.inside,c=!!u.lookbehind,h=!!u.greedy,f=0,d=u.alias;if(h&&!u.pattern.global){var p=u.pattern.toString().match(/[imuy]*$/)[0];u.pattern=RegExp(u.pattern.source,p+"g")}u=u.pattern||u;for(var m=0,y=0;m<r.length;y+=r[m].length,++m){var v=r[m];if(r.length>e.length)break e;if(!(v instanceof a)){u.lastIndex=0;var b=u.exec(v),k=1;if(!b&&h&&m!=r.length-1){if(u.lastIndex=y,b=u.exec(e),!b)break;for(var w=b.index+(c?b[1].length:0),_=b.index+b[0].length,P=m,A=y,j=r.length;j>P&&_>A;++P)A+=r[P].length,w>=A&&(++m,y=A);if(r[m]instanceof a||r[P-1].greedy)continue;k=P-m,v=e.slice(y,A),b.index-=y}if(b){c&&(f=b[1].length);var w=b.index+f,b=b[0].slice(f),_=w+b.length,x=v.slice(0,w),O=v.slice(_),S=[m,k];x&&S.push(x);var N=new a(i,g?n.tokenize(b,g):b,d,b,h);S.push(N),O&&S.push(O),Array.prototype.splice.apply(r,S)}}}}}return r},hooks:{all:{},add:function(e,t){var a=n.hooks.all;a[e]=a[e]||[],a[e].push(t)},run:function(e,t){var a=n.hooks.all[e];if(a&&a.length)for(var r,l=0;r=a[l++];)r(t)}}},a=n.Token=function(e,t,n,a,r){this.type=e,this.content=t,this.alias=n,this.length=0|(a||"").length,this.greedy=!!r};if(a.stringify=function(e,t,r){if("string"==typeof e)return e;if("Array"===n.util.type(e))return e.map(function(n){return a.stringify(n,t,e)}).join("");var l={type:e.type,content:a.stringify(e.content,t,r),tag:"span",classes:["token",e.type],attributes:{},language:t,parent:r};if("comment"==l.type&&(l.attributes.spellcheck="true"),e.alias){var i="Array"===n.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}n.hooks.run("wrap",l);var o=Object.keys(l.attributes).map(function(e){return e+'="'+(l.attributes[e]||"").replace(/"/g,"&quot;")+'"'}).join(" ");return"<"+l.tag+' class="'+l.classes.join(" ")+'"'+(o?" "+o:"")+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(_self.addEventListener("message",function(e){var t=JSON.parse(e.data),a=t.language,r=t.code,l=t.immediateClose;_self.postMessage(n.highlight(r,n.languages[a],a)),l&&_self.close()},!1),_self.Prism):_self.Prism;var r=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return r&&(n.filename=r.src,!document.addEventListener||n.manual||r.hasAttribute("data-manual")||("loading"!==document.readyState?window.requestAnimationFrame?window.requestAnimationFrame(n.highlightAll):window.setTimeout(n.highlightAll,16):document.addEventListener("DOMContentLoaded",n.highlightAll))),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
Prism.languages.markup={comment:/<!--[\w\W]*?-->/,prolog:/<\?[\w\W]+?\?>/,doctype:/<!DOCTYPE[\w\W]+?>/i,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,inside:{tag:{pattern:/^<\/?[^\s>\/]+/i,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,inside:{punctuation:/[=>"']/}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:/&#?[\da-z]{1,8};/i},Prism.hooks.add("wrap",function(a){"entity"===a.type&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Prism.languages.xml=Prism.languages.markup,Prism.languages.html=Prism.languages.markup,Prism.languages.mathml=Prism.languages.markup,Prism.languages.svg=Prism.languages.markup;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^\{\}\s][^\{\};]*?(?=\s*\{)/,string:{pattern:/("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,greedy:!0},property:/(\b|\B)[\w-]+(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},Prism.languages.css.atrule.inside.rest=Prism.util.clone(Prism.languages.css),Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,lookbehind:!0,inside:Prism.languages.css,alias:"language-css"}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').*?\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:{pattern:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/};
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*\*?|\/|~|\^|%|\.{3}/}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0,greedy:!0}}),Prism.languages.insertBefore("javascript","string",{"template-string":{pattern:/`(?:\\\\|\\?[^\\])*?`/,greedy:!0,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:Prism.languages.javascript,alias:"language-javascript"}}),Prism.languages.js=Prism.languages.javascript;
