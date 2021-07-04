function imagetocond(image) {
  return $(image.parentNode.parentNode);
}
$(document).ready( function() {


/* movedown moves a criterion box down.  If a nestbox is below, then move inside the box.
   moveup does the same thing, but up.  I should combine these two someday. */
function movedown() {
var cond=imagetocond(this);
var nextnode=cond.next();
if(nextnode.is('.nestbox')) { //We have a box next
  //Put this node inside the box
  nextnode.children('.boxcontents').prepend(cond);
} else if(nextnode.is('.tool')) { // We have a normal tool below us
  //Put the node after the tool
  nextnode.after(cond)
} else if(nextnode[0]==null) {
  var boxparent=cond.parents('.nestbox:first');
  if(boxparent[0]!=null) {
    boxparent.after(cond);
  }
}

};

function moveup() {
var cond=imagetocond(this);
var prevnode=cond.prev();
if(prevnode.is('.nestbox')) { //We have a box next
  //Put this node inside the box
  prevnode.children('.boxcontents').append(cond);
} else if(prevnode.is('.tool')) { // We have a normal tool above us
  //Put the node after the tool
  prevnode.before(cond)
} else if(prevnode[0]==null) {
  var boxparent=cond.parents('.nestbox:first');
  if(boxparent[0]!=null) {
    boxparent.before(cond);
  }
}
};


/* deletebox delets a criteria */
function deletebox() {
var cond=imagetocond(this);
  cond.hide("normal")
  cond.remove();
}


// associate any arrows or delete buttons that happen to already be created 
// (like static stuff on the page)
$('.uparrow').click(moveup);
$('.downarrow').click(movedown);
$('.delete').click(deletebox);


// Append a category to the toolbox
function makebuttoncategory(cattitle) {
    $('#toolbox') // Find the toolbox
    .append('\n<div class="category">'+cattitle+'</div>') // Add the header button
    .append('<div class="panel"></div>'); // Make a blank panel container
};

// Append a button to the last category in the toolbox
function makebutton(id,text,callback) {
// Insert HTML
$('#toolbox') // Find the toolbox
.children("div.panel:last") // get the last panel
.append('\n<div id="'+id+'" class="button">'+text+'</div>') // make the visual button (a div)
.children("#"+id) // Select the button
.click(callback); // Hook a callback to the button
};

function gencallback(boxclass,text,func,box) {

//box = typeof(box)=='undefined' ? false : true;
 return function () {
    // 
    var newthing=$('#query') // Find the query and append a new item to it
        .append('\n<div class="'+boxclass+'" function="'+func+'">'+text+'<span class="ordertool"><img class="uparrow" src="up.gif"/><img class="downarrow" src="down.gif"/><img class="delete" src="delete.gif"/></span></div>')
        .children(":last").hide(); // Hide the box initially (the transition below will show the box)
    // Activate the move arrows
    newthing.find(".uparrow").click(moveup);
    newthing.find(".downarrow").click(movedown);
    newthing.find(".delete").click(deletebox);

    // If we've created a box, put a boxcentents box in it
    if(typeof(box)!='undefined') {
        newthing.append('<div class="boxcontents"></div>');
        // Make it sortable?  Not for right now.
        // newthing.children(".boxcontents").Sortable( {accept: 'tool', floats: true});
    }
  // Animate the placing of the box and finally show it.
  $(this).TransferTo( {
 		to: newthing[0],
		className: 'transferer1',
		duration: 300,
		complete: function () {newthing.show()}
  	});

};
} // end gencallback


var fieldnumber=0

function makefieldcode(text, number) {
    return text.toLowerCase().split(" ").join("_")+'-'+fieldnumber;
}

function numericfield(text,size) {
    fieldnumber++;
    fieldcode=makefieldcode(text,fieldnumber);
    return '\n\t'+text+'<select name="'+fieldcode+'-operator" class="param"><option value="<=">&le;</option><option value="=">=</option><option value=">=">&ge;</option></select> <input type=text name="'+fieldcode+'-value" class="param" size='+size+'/>';
}

function truefalsefield(text,size) {
    fieldnumber++;
    fieldcode=makefieldcode(text,fieldnumber);
  return '\n\t'+text+'<input type=radio class="param" name="'+fieldcode+'-true" value="true" checked="checked"/>True <input type=radio name="'+fieldcode+'-false" value="false"/>False '; 
}

function makenumericbutton(boxtitle, boxclass, size) {
 // Used "split" and "join" because KHTML and Mozilla have different incompatible implementations of string.replace when using the global option.
    if( typeof(boxclass)=='undefined') {
        boxclass=boxtitle.toLowerCase().split(' ').join('_');
    }
    if (typeof(size)) { size=3; }
    makebutton(boxclass,boxtitle, gencallback('tool', numericfield(boxtitle, size),boxclass));

}

function maketruefalsebutton(boxtitle, boxclass, size) {
 // Used "split" and "join" because KHTML and Mozilla have different incompatible implementations of string.replace when using the global option.
    if( typeof(boxclass)=='undefined') {
        boxclass=boxtitle.toLowerCase().split(' ').join('_');
    }
    if (typeof(size)) { size=3; }
    makebutton(boxclass,boxtitle, gencallback('tool', truefalsefield(boxtitle, size),boxclass));

}




makebuttoncategory('General');
makenumericbutton('Vertices');
makenumericbutton('Edges');
makenumericbutton('Cycles');
makenumericbutton('Hamiltonian cycles');
makenumericbutton('Lovasz number');
makebuttoncategory('Connectivity');
makenumericbutton('Vertex connectivity');
makenumericbutton('Edge connectivity');
makenumericbutton('Girth');
makenumericbutton('Radius');
makenumericbutton('Diameter');
makenumericbutton('Clique number');
makenumericbutton('Independence number');
makenumericbutton('Number of cut vertices');
makenumericbutton('Size of minimum vertex cover');
makenumericbutton('Number of spanning trees');

makebuttoncategory('Degrees');
makenumericbutton('Minimum degree');
makenumericbutton('Maximum degree');
makenumericbutton('Sum of degrees');
makenumericbutton('Average degree');
makenumericbutton('Standard deviation of degrees');
maketruefalsebutton('Regular'); // Something seems wrong with the radio buttons in Konqueror

makebuttoncategory('Subgraphs');

makebuttoncategory('Complements');

makebuttoncategory('Spectrum');
makenumericbutton('Minimum eigenvalue');
makenumericbutton('Maximum eigenvalue');
makenumericbutton('Standard deviation of eigenvalues');
makenumericbutton('Energy');

makebuttoncategory('Automorphism group');

/* // I haven't implemented the boxes on the query side yet.
makebuttoncategory('And/Or/Not');
makebutton('andbutton','AND box',gencallback('andbox nestbox tool', 'AND','and',true));
makebutton('orbutton','OR box',gencallback('orbox nestbox tool', 'OR','or',true));
makebutton('notbutton','NOT box',gencallback('notbox nestbox tool', 'NOT','not',true));
*/

$('#toolbox').Accordion(
    {
        headerSelector	: 'div.category',
        panelSelector	: 'div.panel',
        panelHeight		: 300,
        speed			: 300,
        activeClass		: 'myAccordionActive',
        hoverClass		: 'myAccordionHover'
    }
);

/* // Haven't implemented selecting which fields to view yet.
var viewselectbox="<select><option>test</option><option>test2</option></select>";
var orderbuttons='<span class="ordertool"><img class="uparrow" src="up.gif"/><img class="downarrow" src="down.gif"/><img class="delete" src="delete.gif"/></span>'
var newthing=$('#view').append('<div class="tool viewitem">'
                                +viewselectbox+'1'+orderbuttons+'</div>').children(":last");
newthing.find(".uparrow").click(moveup);
newthing.find(".downarrow").click(movedown);
newthing.find(".delete").click(deletebox);

var newthing=$('#view').append('<div class="tool viewitem">'
                                +viewselectbox+'2'+orderbuttons+'</div>').children(":last");
newthing.find(".uparrow").click(moveup);
newthing.find(".downarrow").click(movedown);
newthing.find(".delete").click(deletebox);
*/


// $('div.andbox').Sortable( {accept: 'tool'});
// $('#query').Sortable( {accept: 'tool'});

});// end $()

/* 
I need to be able to parse a structure to generate a listing or array to send to the server.  We could generate an increasing number and embed the information into the form fields, or we could use javascript to parse things.  It's probably better to embed the information into the form fields.

Javascript method:
  When the submit button is clicked, generate a structure encapsulating the query.  Add that as a hiddden field to the form in JSON format and submit the form.

Form method:
  Generate a unique name for each form element that somehow encodes the form type and control.  Then there is not javascript when parsing the form.  However, the server-side logic is a bit more complex.

I don't think the javascript method will work if we don't have javascript enabled.  I think the form method is the way to go, then.  That consigns Javascript to a building role, but not a final assembly role in the query.  However, if we really want to support nested boxes, I think we have to use javascript.

A true-false element should look like: FIELDCODE_true_unique or FIELDCODE_false_unique.

A numeric element should look like: FIELDCODE_number_unique and the corresponding relation should be FIELDCODE_operator_unique, where the unique tags are the same.

For the nonjavascript form, make a checkbox next to each.  On the server side, we only have to process
things that have checkboxes passed.

*/

function parsetool(elt) {
    var values=[];
    values[0]=$(elt).attr('function');
    alert($(elt).children());
    $('.param',elt).each(function (i) {
        values[i+1]=[$(this).attr('name'), $(this).attr('value')];
    });
    return values;
}


function ser(obj, func) {
    var values=[];
    if(typeof(func)=='undefined') {
        values[0]=$(obj).attr('function')
    } else {
        values[0] = func;
    }
    $(obj).children('div.tool').each(function (i) {
        if($(this).is('.nestbox')) {
            alert("recursing");			
            values[i+1]=ser($(this).children('div.boxcontents'),$(this).attr('function'));
        } else {
            alert("parsing..."+this)
            values[i+1]=parsetool(this);
        }
    });
    alert("returning "+values);
    return values;
}
