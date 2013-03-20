//html5 canvas 扩展
//canvas dynamic element 
(function(){

var cde = function(selector){
    return new n.fn.init( selector );
};

cde.fn = n.prototype = {
    init : function( selector ){
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}
		
		if ( typeof(selector) == "string" ){
		    this.context = this[0] = document.getElementById( selector );
		    return [this[0]];
		}
    }
};

cde.extend = cde.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}
                target[ name ] = copy;
			}
		}
	}

	// Return the modified object
	return target;
};
window.cde = cde;
})();