(function () {

if (typeof Prism === 'undefined' || typeof document === 'undefined') {
	return;
}
  
  
let isMobile = false;
  
if (navigator.userAgentData && navigator.userAgentData.mobile)
    isMobile = true;
  
if (navigator.userAgent && navigator.userAgent.includes('Mobile'))
    isMobile = true;	

if (isMobile) return; 
  
  
const input = document.querySelector('cd-el');
    
const suggestions = document.querySelector('.cd-wrapper .autocomplete');

const topHitEl = document.querySelector('.cd-wrapper .top-hit');
  

let CSSProps = Array.from(window.getComputedStyle(document.documentElement));
CSSProps.push('padding');
CSSProps.push('margin');
CSSProps.push('border');
CSSProps.push('flex');
CSSProps.push('grid');
CSSProps.push('gap');
CSSProps.push('background');
CSSProps.push('-webkit-user-select');

const maxChar = 0;//4;

let topHit = '';

let currSuggestions = [];

let selSuggestionIndex = 0;

let prevQuery = '';

let typed = false;


input.on('keydown caretmove', (e) => {
  
  if (cd.lang === 'css') {
    
    if (cd.typed(e)) {
      
      typed = true;
      
      window.requestAnimationFrame(onType);
      
    } else {
      
      typed = false;
      
    }
    
  }
  
});

input.on('caretmove', onCaretMove);


function onType() {
  
  const cursor = cd.dropper.cursor();
  
  if (!cursor.collapsed) return;
  
  
  const [query, undo] = getQuery(cursor);

	suggestions.classList.toggle('undo', undo);
  

  if (query === prevQuery) return;
  
  prevQuery = query;
  
  
  let out = [];
    
  selSuggestionIndex = 0;

  if (query !== '' &&
      query !== '\n' &&
      !query.includes(':') &&
      query.length >= maxChar) {

    let matches = [];
    
    // search props
    CSSProps.forEach(prop => {

      if (prop.startsWith(query)) {

        matches.push(prop);

      }

    });
    
    
    // if matches exist
    if (matches.length !== 0)  {
        
      matches = matches.sort((match1, match2) => match1.length - match2.length);

      matches.forEach((match, index) => {
        
        // if holding a preference for a match,
        // add it to the top of the list
        if (preference[query] === match) {
          
          array_move(matches, index, 0);
          
          out.unshift(match);
          
        } else {

          out.push(match);
          
        }

      });
      
      
      if (matches.length === 1
          && matches[0] === query) {
      
        out = []; // --matches--
        topHit = '';
        currSuggestions = [];
        
        topHitEl.textContent = '';
        
      } else {
        
        topHit = matches[0];
        currSuggestions = matches;
        
        //console.log('Top hit: ' + matches[0]);
        
        let topHitText = '<b>' + query + '</b>' + topHit.slice(query.length);
        
        // if top hit is a CSS property, add :
        if (!topHit.includes('@')) topHitText += ':';
        
        topHitEl.innerHTML = topHitText;
        
      }
      
    } else {
      
      topHitEl.textContent = '';
      
    }
    
  } else {
    
    topHitEl.textContent = '';
    
  }
  
  
  //console.log('Suggestions:\n' + out.replaceAll('<br>','\n'));

  // if suggestions exist
  if (out.length !== 0) {
    
    let html = '';
    
    out.forEach((suggestion, i) => {
      
      let active = '';
      if (i === 0) active = ' active';
      
      const suggestionHTML = suggestion.replace(query, '<b>' + query + '</b>');
      
      html += '<div class="icon'+ active +'">' + suggestionHTML + '</div>';
      
    });
    
    suggestions.innerHTML = html;
    
    // move suggestions to caret
    moveSuggestionsToCaret(cursor);
    
    suggestions.classList.add('visible');
    
    suggestions.scrollTop = 0;
    
  } else {
    
    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';
    
  }
  
}


input.on('keydown', handleMenuKeydown);

function handleMenuKeydown(e) {
  
  if (suggestions.classList.contains('visible')) {
    
    if (e.key === 'ArrowDown') {
      
      e.preventDefault();
      
      const active = suggestions.querySelector('.icon.active');
      let next = active.nextElementSibling;
      
      if (!next) {
        
        next = suggestions.querySelector('.icon:first-of-type');
        suggestions.scrollTop = 0;
        
      } else {
      
        const selIconPos = next.getBoundingClientRect().top - suggestions.getBoundingClientRect().top - 1;
        
        if (selIconPos > 140) {
          suggestions.scrollTop += next.clientHeight;
        }
        
      }
            
      active.classList.remove('active');
      next.classList.add('active');
      
      topHit = next.textContent;
      
      let topHitText = '<b>' + prevQuery + '</b>' + topHit.slice(prevQuery.length);
        
      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ':';
      
      topHitEl.innerHTML = topHitText;
            
    } else if (e.key === 'ArrowUp') {
      
      e.preventDefault();
      
      let active = suggestions.querySelector('.icon.active');
      let prev = active.previousElementSibling;
      
      if (!prev) {
        
        prev = suggestions.querySelector('.icon:last-of-type');
        suggestions.scrollTop = suggestions.scrollHeight;
      
      } else {
        
        const selIconPos = prev.getBoundingClientRect().top - suggestions.getBoundingClientRect().top;
        
        if (selIconPos < 0) {
          suggestions.scrollTop -= prev.clientHeight;
        }
        
      }
      
      active.classList.remove('active');
      prev.classList.add('active');
      
      topHit = prev.textContent;
      
      let topHitText = '<b>' + prevQuery + '</b>' + topHit.slice(prevQuery.length);
        
      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ':';
      
      topHitEl.innerHTML = topHitText;
      
    } else if (e.key === 'Enter') {
      
      e.preventDefault();
      

			if (suggestions.classList.contains('undo')) {
				
	      cd.history.pos -= 1;
	      const record = cd.history.records[cd.history.pos];
	
	      if (record) {
	
	        cd.innerHTML = record.html;
	        cd.setSelection(record.pos.start, record.pos.end);
	
	        cd.dispatchTypeEvent();
	
	      }
	
	      if (cd.history.pos < 0) cd.history.pos = 0;
	
			}
      
      
      let topHitText = topHit.slice(prevQuery.length);
      
      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ': ';
            
      topHit = '';
      topHitEl.innerHTML = '';
      
      suggestions.classList.remove('visible');
      suggestions.innerHTML = '';
      
      cd.insert(topHitText);
      
    }
    
  }
  
}


function onCaretMove() {
  
  if (!typed
      && suggestions.classList.contains('visible')) {
    
    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';
    topHitEl.innerHTML = '';
    
  } else {
    
    typed = false;
    
  }
  
}


function getQuery(cursor) {
  
  //const text = cursor.startContainer.textContent;
  const text = cd.beforeCursor();
  
  let query = '';
  
  //let i = cursor.startOffset;
  let i = text.length;
  
  while (i >= 0 && query.length < 50) {
    
    i--;
    
    const char = text[i];
    
    if (char !== ' ' && char !== '\n' && char !== '\t') {
      
      query = char + query;
      
    } else {
      
      break;
      
    }
    
  }

  if (query !== ''
      && text.slice(i - 1, i + 1) !== cd.options.tab
      && text.slice(i, i + 1) !== '\t') {
	
    return ['', true];

  }


	let undo = true;
	
	if (text.slice(i, i + 1) === '\t') {
		
		undo = false;
		
	}
	
  
  return [query, undo];
  
}


function getRangePosOf(originRange) {
  
  let range = originRange.cloneRange();
  
  const container = range.startContainer;
  const offset = range.startOffset - prevQuery.length;
  
  range.setStart(container, offset);
  
  const rect = range.getBoundingClientRect();
  
  const pos = [rect.top, rect.left];
  
  range.detach();
  
  return pos;
  
}


function moveSuggestionsToCaret(cursor) {
  
  const [top, left] = getRangePosOf(cursor);
  
  suggestions.style.top = top + 'px';
  suggestions.style.left = left - 350 + 'px';

  topHitEl.style.top = top + 'px';
  topHitEl.style.left = left - 350 + 'px';

}


input.on('scroll', () => {

  if (suggestions.classList.contains('visible')) {
    
    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';
    topHitEl.innerHTML = '';

  }

});



let preference = {};

/*

input.onkeydown = (e) => {
  
  // if pressed shift + enter or tab
  if (e.shiftKey && (e.key === 'Enter' || e.key === 'Tab')) {
    
    // if holding shift or alt
    // and suggestions exist
    if ((e.shiftKey || e.altKey)
        && currSuggestions.length > 1) {
      
      selSuggestionIndex++;
      
      if (selSuggestionIndex > currSuggestions.length-1) selSuggestionIndex = 0;
      
      topHit = currSuggestions[selSuggestionIndex];
      
      if (selSuggestionIndex !== 0) {
        
        Object.entries(preference).forEach(preferenceObj => {
          
          if (preferenceObj[1] === currSuggestions[selSuggestionIndex-1]) {
            
            preference[preferenceObj[0]] = topHit;
            
          }
          
        });
        
      } else {
        
        preference[input.value.replace(': ', '')] = topHit;
        
      }
      
      //topHitEl.textContent = '';
      
    } else if (topHit) {
      
      preference[input.value.replace(': ', '')] = topHit;
      
    }
    
    // if top hit exists
    if (topHit) {
      
      e.preventDefault();
      
      //input.value = topHit + ': ';
      console.log('selected ' + topHit + ':');
      
      topHit = '';
      
      //suggestions.innerHTML = '--yay!--';
      
    }
    
  }
  
}

*/



function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};


  
  
  
  
  
  
  
  
  
  
  
  
  
  /*
  // JavaScript tokens
  const tokens = 
   {
     "javascript": [
       "concat","forEach", "map", "filter", "for (let i = 0; i < 10; i++) {", "async", "await", "function", "new Promise", "await new Promise(resolve => { window.setTimeout(resolve, 10) });" "indexOf","join","lastIndexOf","pop","push","reverse","shift","slice","sort","splice","toString","unshift","valueOf","++","--","==","===","!=","!==",">=","&&","||",">>",">>>","function","alert","confirm","console.log","console.info","console.error","document.write","prompt","decodeURI","encodeURI","decodeURIComponent","encodeURI","encodeURIComponent","eval","isFinite","isNaN","Number","parseFloat","parseInt","for","while","do while","break","continue","if else","switch","\\b","\\f","\\n","\\r","\\t","\\v","charAt","charCodeAt","fromCharCode","indexOf","lastIndexOf","match","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase","valueOf","toExponential","toFixed","toPrecision","toString","valueOf","abs","acos","asin","atan","atan2","ceil","cos","exp","floor","log","max","min","pow","random","round","sin","sqrt","tan","Date","getDate","getDay","getFullYear","getHours","getMilliseconds","getMinutes","getMonth","getSeconds","getTime","getUTCDate","parse","setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setUTCDate","attributes","baseURI","childNodes","firstChild","lastChild","nextSibling","nodeName","nodeType","nodeValue","ownerDocument","parentNode","previousSibling","textContent","appendChild","cloneNode","compareDocumentPosition","getFeature","hasAttributes","hasChildNodes","insertBefore","isDefaultNamespace","isEqualNode","isSameNode","isSupported","lookupNamespaceURI","lookupPrefix","normalize","removeChild","replaceChild","getAttribute","getAttributeNS","getAttributeNode","getAttributeNodeNS","getElementsByTagName","getElementsByTagNameNS","hasAttribute","hasAttributeNS","removeAttribute","removeAttributeNS","removeAttributeNode","setAttribute","setAttributeNS","setAttributeNode","setAttributeNodeNS","closed","defaultStatus","document","frames","history","innerHeight","innerWidth","length","location","name","navigator","opener","outerHeight","outerWidth","pageXOffset","pageYOffset","parent","screen","screenLeft","screenTop","screenX","screenLeft","screenY","screenTop","self","status","top","alert","blur","clearInterval","setInterval","clearTimeout","setTimeout","close","confirm","focus","moveBy","moveTo","open","print","prompt","resizeBy","resizeTo","scrollBy","scrollTo","setInterval","setTimeout","stop","availHeight","availWidth","colorDepth","height","pixelDepth","width","onclick","oncontextmenu","ondblclick","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseover","onmouseout","onmouseup","onkeydown","onkeypress","onkeyup","onabort","onbeforeunload","onerror","onhashchange","onload","onpagehide","onpageshow","onresize","onscroll","onunload","onblur","onchange","onfocus","onfocusin","onfocusout","oninput","oninvalid","onreset","onsearch","onselect","onsubmit","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","oncopy","oncut","onpaste","onabort","oncanplay","oncanplaythrough","ondurationchange","onended","onerror","onloadeddata","onloadedmetadata","onloadstart","onpause","onplay","onplaying","onprogress","onratechange","onseeked","onseeking","onstalled","onsuspend","ontimeupdate","onvolumechange","onwaiting","animationend","animationiteration","animationstart","transitionend","onmessage","onoffline","ononline","onpopstate","onshow","onstorage","ontoggle","onwheel","ontouchcancel","ontouchend","ontouchmove","ontouchstart","try","catch","throw","finally","name","message", "Date", "Array", "String", "new"
     ]
   };
  */
  
  
  /*
  document.querySelectorAll('cd-el').forEach(cd => {
		
    const menu = cd.parentElement.querySelector('.menu');
    
    // add menu event listeners
    document.addEventListener('keydown', (e) => {
      
      // if menu is visible
      if (menu.classList.contains('visible')) {
        
        if (e.key === 'Enter' || e.keyCode === 13) { // if pressed enter
          
          // prevent default behavior
          e.preventDefault();
                    
          // get cursor
          const cursor = cd.dropper.cursor();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          // remove string to match
          cursor.setStart(cursor.startContainer, cursor.startContainer.length - stringToMatch.length - 1);
          cursor.deleteContents();

          const textEl = document.createTextNode(activeSuggestion.textContent);
          cursor.insertNode(textEl);

          // move cursor to end of node
          cursor.selectNode(cursor.endContainer);
          cursor.collapse();

          // hide menu
          menu.classList.remove('visible');
          
        } else if (e.key === 'ArrowDown' || e.keyCode === 40) { // if navigated down
          
          // prevent scrolling
          e.preventDefault();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          if (activeSuggestion.nextElementSibling) {
            
            // select next suggestion
            activeSuggestion.nextElementSibling.classList.add('active');
            activeSuggestion.classList.remove('active');
            
            activeSuggestion.nextElementSibling.scrollIntoView({block: 'nearest'});
            
          }
          
        } else if (e.key === 'ArrowUp' || e.keyCode === 38) { // if navigated up
          
          // prevent scrolling
          e.preventDefault();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          if (activeSuggestion.previousElementSibling) {
            
            // select previous suggestion
            activeSuggestion.previousElementSibling.classList.add('active');
            activeSuggestion.classList.remove('active');
            
            activeSuggestion.previousElementSibling.scrollIntoView({block: 'nearest'});
            
          }
          
        }
        
      }
      
    });
    
    // if moved cursor, hide menu
    cd.on('caretmove', () => {
      
      //menu.classList.remove('visible');
      
    });
    
    
    cd.on('type', () => {
			
      // if current language
      // is configured for autocomplete
      if (config[cd.lang]) {
        
        const cursor = cd.dropper.cursor();
        
        // if cursor is not in string or comment
        // but is in text node
        if (cursor && !cursor.in('string') && !cursor.in('comment')
	          && cursor.startContainer.nodeType === 3) {
          
          // remove spaces and tabs
          stringToMatch = cursor.startContainer.nodeValue
                                               .replaceAll(' ', '')
                                               .replaceAll('\t', '');

          stringToMatch = stringToMatch.split('\n').filter(n => n);
          stringToMatch = stringToMatch[stringToMatch.length-1];
          
          console.log(stringToMatch);
          
          
          // if node value does not exceed
          // maximum autocomplete length
          if (stringToMatch
	      && !Array.isArray(stringToMatch)
	      && stringToMatch.length < 50) {
            
            // find autocomplete matches
            const matches = autoComplete(stringToMatch, config[cd.lang]);
            
            // if found matches
            if (matches.length > 0) {
              
              // save rendered HTML
              let out = '';
              
              // render matches
              matches.forEach((match, index) => {
                
                // highlight first match
                if (index === 0) {
                  
                  out += '<div class="icon active">'+ match.content +'</div>';
                  
                } else {
                  
                  out += '<div class="icon">'+ match.content +'</div>';
                  
                }
                
              });
              
              // add rendered HTML to dom
              menu.innerHTML = out;
              menu.scrollTo(0, 0);
              
              
              // position menu
              
              // get cursor position
              const cursorPos = cursor.getBoundingClientRect();
              
              menu.style.left = cursorPos.left - 350 + 'px';
              menu.style.top = cursorPos.top + 'px';
              
              
              // show menu
              menu.classList.add('visible');
              
              
              // add match event listeners
              menu.querySelectorAll('.icon').forEach(icon => {
                
                // when clicked on icon
                icon.addEventListener('click', () => {
                  
                  // remove string to match
                  cursor.setStart(cursor.startContainer, cursor.startContainer.length - stringToMatch.length - 1);
                  cursor.deleteContents();
                  
                  const textEl = document.createTextNode(icon.textContent);
                  cursor.insertNode(textEl);
                  
                  // move cursor to end of node
                  cursor.selectNode(cursor.endContainer);
                  cursor.collapse();
                  
                  // hide menu
                  menu.classList.remove('visible');
                  
                });
                
              });
              
            } else {
              
              // hide menu
              menu.classList.remove('visible');
              
            }
            
          } else {
            
            // hide menu
            menu.classList.remove('visible');
            
          }
          
        }
        
			}
			
		});
		
	});*/
	
}());

