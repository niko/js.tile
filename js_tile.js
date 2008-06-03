// Textile namespace
//
var Textile = Textile || {};

// converter
//
// Wraps all "globals" so that the only thing
// exposed is makeHtml().
//
Textile.converter = function() {
  
  this.to_html = function(text) {
    text = '\n\n' + text + '\n\n'; // wrap in linebreaks
    text = this.empty_blank_lines(text);
    text = this.quick_tags(text);
    text = this.hyperref_images(text);
    text = this.hyperrefs(text);
    text = this.images(text);
    text = this.headings(text);
    text = this.unordered_lists(text);
    text = this.paragraphs(text);
    text = this.hard_breaks(text);
    text = text.replace(/([^>])\n<\//g,'$1<\/'); // close tag cleanup
    text = text.replace(/^\n*/g,'').replace(/\n*$/g,''); // strip linebreaks again
    return text;
  };
  
  this.headings = function(text){
    var header_re = new RegExp('h([1|2|3|4|5|6])\. ((.+\n)+)\n'); // [^] == anything, including linebreaks
    return( text.replace(header_re,'<h$1>$2</h$1>\n\n') );
  };
  
  this.empty_blank_lines = function(text){
    return( text.replace( /\n\s*\n/g , '\n\n') );
  };
  
  this.quick_tags = function(text){
    // we want the words tightly surounded by the tags so things like 3 * 4  or 4 - 5 is not interpreted as tag.
    var qtags =
    [['\\*', 'strong'],
    ['_', 'em'],
    ['-', 'del'],
    ['\\?\\?', 'cite'],
    ['\\+', 'ins'],
    ['@', 'code']];
    for (var i=0; i<qtags.length; i++) {
      ttag = qtags[i][0]; htag = qtags[i][1];
      qt_re = new RegExp( '(\\s)' + ttag + '(.+?)' + ttag + '(\\s|,|!|\\?|\\.)' , 'g');
      text = text.replace(qt_re,'$1<'+htag+'>'+'$2'+'</'+htag+'>$3');
    }
    // sup and sup tags may follow directly on a word character:
    var qtags =
    [['~', 'sub'],
    ['\\^', 'sup']];
    for (var i=0; i<qtags.length; i++) {
      ttag = qtags[i][0]; htag = qtags[i][1];
      qt_re = new RegExp( ttag + '(.+?)' + ttag + '(\\s|,|!|\\?|\\.)' , 'g');
      text = text.replace(qt_re,'<'+htag+'>'+'$1'+'</'+htag+'>$2');
    }
    return(text);
  }
  
  this.images = function(text){
    img_re = new RegExp('!(.+?)!','g');
    return( text.replace(img_re,'<img src="$1">') );
  }
  
  link_goal = '([^\\s\\\\]+[^;.:?!,\\s\\\\])\\\\?([;.:?!,]?)';
  this.hyperrefs = function(text){
    var link_re = new RegExp('"(.+?)":' + link_goal,'g');
    return( text.replace(link_re,'<a href="$2">$1</a>$3') );
  }
  
  this.hyperref_images = function(text){
    var href_link_re = new RegExp('!(.+?)!:' + link_goal,'g');
    return( text.replace(href_link_re,'<a href="$2"><img src="$1"></a>$3') );
  }
  
  this.unordered_lists = function(text){
    var first_ul_re         = new RegExp('(\n\n)\\*(\\*)? (.+)\n','g');
    var last_ul_re          = new RegExp('(\n)\\*(\\*)? (.+)\n(\n)','g');
    var ul_re               = new RegExp('(\n)\\*(\\*)? (.+)','g');
    var first_nested_ul_re   = new RegExp('(\n<li>.*)</li>\n\\*','g');
    var last_nested_ul_re   = new RegExp('\n\\*(<li>.*</li>)(\n[^\\*])','g');
    var middle_nester_re     = new RegExp('\n\\*(<li>)','g');
    text = text.replace(first_ul_re,              '$1<ul>\n<li>$3</li>\n');
    text = text.replace(last_ul_re,               '$1$2<li>$3</li>\n</ul>\n$4');
    text = text.replace(ul_re,                    '$1$2<li>$3</li>');
    text = text.replace(first_nested_ul_re,        '$1\n<ul>\n','g');
    text = text.replace(last_nested_ul_re,        '\n$1\n</ul>\n</li>$2','g');
    text = text.replace(middle_nester_re,          '\n$1','g');
    return(text)
  }

	this.hard_breaks = function(text){
		var hard_break_re = new RegExp('(<(p|li)>)([^>]+)(\n)([^<]+)(</(p|li)>)','g');
		text = text.replace(hard_break_re, '$1$3<br/>\n$5$6');
		return(text);
	}
  
	this.paragraphs = function(text){
		var paragraph_re = new RegExp('(\n\n)(([^\\s<].*\n)+)\n','g');
		// we do this twice because of overlapping regexps
		// there must be a better way!
		text = text.replace(paragraph_re, '$1<p>$2</p>\n\n');
		text = text.replace(paragraph_re, '$1<p>$2</p>\n\n');
		return(text);
	}
	
};

function run_tests(){
  var inputs = getElementsByClassNames('input');
  var outputs = getElementsByClassNames('output');
  var num_pending = getElementsByClassNames('input pending').length;
  
  if(inputs.length != outputs.length){ alert('we need the same number of inputs as outputs!'); }
  
  var converter = new Textile.converter();
  var num_failing = 0;
  for (var i = 0; i < inputs.length; i++){
    converted = converter.to_html(inputs[i].innerHTML);
    expected = outputs[i].innerHTML.replace(/^\n*/,'').replace(/\n*$/,'')
    if ( converted != expected ) {
      inputs[i].style.backgroundColor = 'red';
      outputs[i].style.backgroundColor = 'red';
      outputs[i].innerHTML = converted + '<hr/>expected<br/><textarea>' + expected + '</textarea><br/>but got<br/><textarea>' + converted + '</textarea>';
			alert(converted);
			alert(expected);
      num_failing++;
    }else{
      inputs[i].style.backgroundColor = 'green';
      outputs[i].style.backgroundColor = 'green';
    }
  }
  alert('total: ' + inputs.length + '; failing: ' + num_failing + '; pending: ' + num_pending);
}

// returns all elements with exactly matching classnames.
function getElementsByClassNames(classnames){
  var elements = [];
  var allElems = document.getElementsByTagName('*');
  for (var i = 0; i < allElems.length; i++) {
    var thisElem = allElems[i];
    if (thisElem.className && thisElem.className == classnames) {
      elements.push(thisElem);
    }
  }
  return(elements);
}

window.onload = run_tests;