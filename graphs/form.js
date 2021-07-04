// $Id: form.js,v 1.6 2005/07/30 01:12:04 grout Exp $



//Array push for IE5 (see http://www.quirksmode.org/quirksmode.js)
function Array_push() {
    var A_p = 0
	for (A_p = 0; A_p < arguments.length; A_p++) {
	    this[this.length] = arguments[A_p]
	}
    return this.length
	}

if (typeof Array.prototype.push == "undefined") {
    Array.prototype.push = Array_push;
}


var W3CDOM = (document.createElement && document.getElementsByTagName);
// LIST ALL SHOW/HIDE ELEMENT IDS HERE
menus_array = new Array ('ddGeneralGraphInfo', 'ddConnectivity', 'ddDegrees', 'ddComplements', 'ddSpectrum', 'ddAutomorphismGp', 'ddSubgraphs');
menus_status_array = new Array ();// remembers state of switches
img_close = 'expandbutton-close.gif';
img_open = 'expandbutton-open.gif';

window.onload = function () {
    init();
    resetMenu();
    checkMenus();
}

function init()
{
    if(document.getElementsByTagName) {
        var inputs = document.getElementsByTagName('INPUT');
	var ancestor;
        for (var i=0;i<inputs.length;i++)
	    {
		if(inputs[i].type=='text') {
		    //inputs[i].onfocus = focusinput;
		    inputs[i].onblur = blurinput;
		} else if ( inputs[i].type=='checkbox') {
		    inputs[i].onchange = blurinput;
		    ancestor=inputs[i].parentNode;
		    while(ancestor.nodeName!='TD' && ancestor.nodeName!='BODY') {
			ancestor = ancestor.parentNode;
		    }
		    if(ancestor.nodeName=='TD'){
			ancestor.onclick = checkBoxes;
		    }
		}
	    }
    }
}

    

function trimstring (string) {
    // Find the last space
    var firstchar=0;
    var lastchar=string.length-1;
    i=0;
    while(string.charAt(firstchar)==' ' || string.charAt(firstchar)=='\t') {
	firstchar++;
    }
    if(firstchar == string.length)
	return '';

    
    while(string.charAt(lastchar)==' ' || string.charAt(lastchar)=='\t') {
	lastchar--;
    }
    return string.substring(firstchar,lastchar+1);
}
    
function isWhitespace (string) {
    var pos = 0;
    
    while(string.charAt(pos)==' ') {
	pos++;
    }
    return pos == string.length;
}


function checkMenus () {
    if(document.getElementsByTagName) {
	var filled;
	var visible;
	var spanShowItems
	var conditions_string = new Array();
	//var spanShowItems;
	var menus = document.getElementsByTagName('DIV');
        for (var i=0;i<menus.length;i++) {
	    //alert('Checking DIV '+menus[i].className+' '+menus[i].id);
	    if(menus[i].className=='expandMenu' || menus[i].className=='filledExpandMenu') {
		filled=0;
		visible=false;
		var conditions = new Array();
		//conditions.length=0;
		conditions_string.length=0;
		menuItems = menus[i].getElementsByTagName('DIV');
		for(var j=0;j<menuItems.length;j++) {
		    //alert('Checking DIV '+menuItems[j].className+' '+menuItems[j].id);
		    if(menuItems[j].className=='hideSwitch' || menuItems[j].className=='showSwitch') {
			// We have a DIV that is a menu item.  Check the form elements.
			inputs = menuItems[j].getElementsByTagName('INPUT');
			for(var k=0; k<inputs.length;k++) {
			    //alert('Checking input '+inputs[k].id);
			    if(inputs[k].type=='text') {
				if(!isWhitespace(inputs[k].value)) {
				    // Fill the TD cell
				    inputs[k].parentNode.className='filled';
				    // Find the label
				    if(conditions[inputs[k].parentNode.parentNode.title] != 'visible')
					conditions[inputs[k].parentNode.parentNode.title] = 'filled';
				} else {
				    inputs[k].parentNode.className='';
				}
			    } else if(inputs[k].type=='checkbox') {
				if(inputs[k].name=='VISIBLE[]' || inputs[k].name=='PICTURE[]') {
				    if(inputs[k].checked) {
					conditions[inputs[k].parentNode.parentNode.title] = 'visible';
					inputs[k].parentNode.parentNode.className='visible';
					visible=true;
					//alert(inputs[k].name+' checked '+inputs[k].parentNode.parentNode.className);
				    } else {
					//alert(inputs[k].name+' unchecked');
					inputs[k].parentNode.parentNode.className='';
				    } 
				} else {
				    if(inputs[k].checked) {
					if(conditions[inputs[k].parentNode.parentNode.title] != 'visible')
					    conditions[inputs[k].parentNode.parentNode.title] = 'filled';
					inputs[k].parentNode.className='filled';
					//alert('input '+inputs[k].name+' FILLED!!');
					//break;
				    } else {
					inputs[k].parentNode.className='';
				    }
				    
				}
			    }
			    
			}
		    }
		    //if(filled==1)
		    //break;
		}
		spanShowItems = menus[i].getElementsByTagName('SPAN')[0];
		spanShowItems.innerHTML='';
		for(l in conditions) {
		    if(l!='length') {
			if(conditions[l]=='filled')
			    conditions_string.push(l);
			else
			    conditions_string.push('<b>'+l+'</b>');
			//alert(l+conditions[l]);
		    }
		}
		spanShowItems.innerHTML=conditions_string.join(', ');
		if(visible) {
		    //alert('Found filled menu!');
		      menus[i].className='filledExpandMenu';
		} else {
		    //alert('Found EMPTY menu!');
		     menus[i].className='expandMenu';
		}
	    }
	}
    }
}



function blurinput (e) {
     //These two lines are to provide cross-browser compatibility
 // (see http://www.quirksmode.org/js/events_access.html 
 //  and http://www.quirksmode.org/js/events_compinfo.html)
 if (!e) var e = window.event;
 var element = (e.target) ? e.target : e.srcElement;
 var etype=element.type;
 checkMenus();
}

function checkBoxes (e) {
    //These two lines are to provide cross-browser compatibility
    // (see http://www.quirksmode.org/js/events_access.html 
    //  and http://www.quirksmode.org/js/events_compinfo.html)
    if (!e) var e = window.event;
    var element = (e.target) ? e.target : e.srcElement;
    var etype=element.type;
    var ancestor=element;
    
    if(element.type!='checkbox') {
    while(ancestor.nodeName!='TD' && ancestor.nodeName!='BODY') {
	ancestor = ancestor.parentNode;
    }

    if(ancestor.nodeName=='TD'){
	if(document.getElementsByTagName) {
	    var inputs = ancestor.getElementsByTagName('INPUT');
	    for (var i=0;i<inputs.length;i++) {
		if(inputs[i].checked) {
		    inputs[i].checked=false;
		} else {
		    inputs[i].checked=true;
		}
	    }
	    checkMenus();
	}
    }
    }
}



function toggleVisible (e) {
    if (!e) var e = window.event;
    var element = (e.target) ? e.target : e.srcElement;
}
    


function resetMenu () { // read cookies and set menus to last visited state
    if (document.getElementById) {
	for (var i=0; i<menus_array.length; i++) {
	    var idname = menus_array[i];
	    var switch_id = document.getElementById(idname);
	    var imgid = idname+'Button';
	    var button_id = document.getElementById(imgid);
	    if (getCookie(idname) == 'show') {
		button_id.setAttribute ('src', img_close);
		switch_id.className = 'showSwitch';
		menus_status_array [idname] = 'show';
	    }else{
		button_id.setAttribute ('src', img_open);
		switch_id.className = 'hideSwitch';
		menus_status_array [idname] = 'hide';
	    }
	}
    }
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
	begin = dc.indexOf(prefix);
	if (begin != 0) return null;
    } else
	begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
	end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
}


function showHideSwitch (theid) {
  if (document.getElementById) {
    var switch_id = document.getElementById(theid);
    var imgid = theid+'Button';
    var button_id = document.getElementById(imgid);
    if (menus_status_array[theid] != 'show') {
      button_id.setAttribute ('src', img_close);
      switch_id.className = 'showSwitch';
	  menus_status_array[theid] = 'show';
	  document.cookie = theid+'=show';
    }else{
      button_id.setAttribute ('src', img_open);
      switch_id.className = 'hideSwitch';
	  menus_status_array[theid] = 'hide';
	  document.cookie = theid+'=hide';
    }
  }
}



 function highlightelement(e) {
 alert('Inside highlightelement');

 //These two lines are to provide cross-browser compatibility
 // (see http://www.quirksmode.org/js/events_access.html 
 //  and http://www.quirksmode.org/js/events_compinfo.html)
 if (!e) var e = window.event;
 var element = (e.target) ? e.target : e.srcElement;
 if (element.tagName=='INPUT') {
  etype=element.type;
  if ((etype=='submit' || etype=='reset') && state==1) state=2;
  element.style.backgroundColor=clr[1];
  // element.focus();
  }


 }



function CheckAll() {
    count = document.graphquery.elements.length;
    for (i=0; i < count; i++) {
	if((document.graphquery.elements[i].name=="VISIBLE[]")
	   || (document.graphquery.elements[i].name=="PICTURE[]")) {
	 
	    document.graphquery.elements[i].checked=true;
	}
    }	  
}	


function UncheckAll() {
    count = document.graphquery.elements.length;
    for (i=0; i < count; i++) {
	if((document.graphquery.elements[i].name=="VISIBLE[]")
	   || (document.graphquery.elements[i].name=="PICTURE[]")) {

	    document.graphquery.elements[i].checked=false;
	}
    }	  
}	
