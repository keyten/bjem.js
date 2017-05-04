( function( global, factory ){

	"use strict";

	factory( global, global.jQuery );

} )( typeof window !== "undefined" ? window : this, function( window, jQuery ){

"use strict";

var version = "1.0.0";


// Events
jQuery.event.fn = {

	on: function( event, fn, context ){
		if ( !this._listeners ) {
			this._listeners = {};
		}

		if ( !this._listeners[ event ] ) {
			this._listeners[ event ] = [];
		}

		this._listeners[ event ].push( {
			fn: fn,
			ctx: context
		} );

		return this;
	},

	off: function( event, fn ){
		if ( !this._listeners || !this._listeners[ event ] ) {
			return this;
		}

		if ( !fn ) {
			this._listeners[ event ] = null;
		}

		this._listeners[ event ].every( function(cur, i){

			if ( cur.fn === fn ) {
				this._listeners[ event ].splice( i, 1 );

				return false;
			}

			return true;

		} );

		return this;
	},

	trigger: function( event, data ) {
		if ( !this._listeners || !this._listeners[ event ] ) {
			return this;
		}

		this._listeners[ event ].forEach( function ( cur ) {
			cur.fn.call( cur.fn.ctx, data );
		} );

		return this;
	}

};


// Blocks
jQuery.blocks = {};
jQuery.block = function( name, props ) {
	return new jQuery.block.fn.init( name, props );
};

jQuery.block.fn = jQuery.block.prototype = {

	init: function( name, props ) {
		this.blockDef = jQuery.extend( {}, jQuery.block.fn.default, props );
		jQuery.blocks[ name ] = this;
	},

	default: {
		tag: 'div'
	},

	declMod: function( name, props ) {
		;
	}

};

jQuery.block.fn.init.prototype = jQuery.block.fn;

jQuery.block( 'default', {} );

jQuery.block.constructClassName = function( blockName, elemName, mods ) {
	var name = elemName ? blockName + '__' + elemName : blockName;

	mods = jQuery.map( mods, function( value, modName ) {
		if ( value === true ) {
			return name + '_' + modName;
		} else if ( jQuery.isNumeric( value ) || typeof value === 'string' ) {
			return name + '_' + modName + '_' + value;
		}

		return null;
	} );

	return [name].concat( mods );
};


// Blocks add
jQuery.fn.content = function() {
	if ( isBem( arguments[ 0 ] ) ) {
		// todo: if there are a lot of elements (in this)
		// then we should clone
		arguments[ 0 ] = bemToJq( arguments[ 0 ] );
	}
	return this.html.apply( this, arguments );
};
/*
jQuery.fn._append = jQuery.fn.append;
jQuery.fn.append = function() {
	// Transform bem elements into common elements
	for( var i = 0; i < arguments.length; i++ ) {
		if ( isBem( arguments[ i ] ) ) {
			arguments[ i ] = bemToJq( arguments[ i ] );
		}
	}

	return jQuery.fn._append.apply( this, arguments );
}; */

var modifyFunc = {
	'append': Infinity,
	'prepend': Infinity
};

function bemDomManip( argNumber, parent ) {
	return function() {
		if ( argNumber === Infinity ) {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( isBem( arguments[ i ] ) ) {
					arguments[ i ] = bemToJq( arguments[ i ] );
				}
			}
		} else if ( isBem( arguments[ argNumber ] ) ) {
			arguments[ argNumber ] = bemToJq( arguments[ argNumber ] );
		}
		return parent.apply( this, arguments );
	};
}

jQuery.each( , function( funcName, argNumber ) {
	jQuery.fn[ '_' + funcName ] = jQuery.fn[ fucName ];
	jQuery.fn = bemDomManip( argNumber, jQuery.fn[ '_' + funcName ] );
} );

// Bem elems work
function isBem( something ) {
	return (
		typeof something === 'object'
		&&
		(
			typeof something.block === 'string'
			// or ...
		}
	);
}

function bemToJq( content ) {
	var elem;

	if ( content.block ) {
		var blockDef = ( jQuery.blocks[ content.block ] || jQuery.blocks.default ).blockDef;

		elem = jQuery( '<' + blockDef.tag + '>' );
		elem.data( 'bem', {
			className: content.block,
			def: blockDef
		} );

		elem[0].className = content.block;

		if ( blockDef.on ) {
			jQuery.each( blockDef.on, function( event, callback ) {
				if ( event === 'mods' ) {
					jQuery.each( callback, function( modName, callback ) {
						elem.on( 'mod:' + modName, callback );
					} );
				} else if ( event === 'state' ) {
					jQuery.each( callback, function( modName, callback ) {
						elem.on( 'state:' + modName, callback );
					} );
				} else {
					elem.on( event, callback );
				}
			} );
		}

		// todo: attrs

		if ( blockDef.defaultMods || content.mods ) {
			var mods = jQuery.extend( {}, blockDef.defaultMods, content.mods );
			jQuery.each( mods, function( modName, modVal ) {
				elem.mod( modName, modVal );
			} );
		}

		if ( blockDef.state ) {
			jQuery.each( blockDef.state, function( key, value ) {
				elem.state( key, value, true );
			} );
		}

		var inside = blockDef.content || content.content;
		if ( inside ) {
			if ( typeof inside === 'function' ) {
				inside = inside.call( elem, content );
			}

			elem.content( inside );
		}

		if ( blockDef.init ) {
			blockDef.init.call( elem, content );
		}

	} else if ( content.list ) {
		// list
	} else {
		// elem
	}

	return elem;
}

// Bem functions for jQ
jQuery.fn.state = function( key, value, silent ) {
	if ( value === undefined ) {
		return this.data( 'state:' + key );
	}

	var oldValue = this.data( 'state:' + key );

	if ( !jQuery.equal( oldValue, value ) ) {
		this.data( 'state:' + key, value );

		if ( !silent ) {
			value = {
				key: key,
				newVal: value,
				oldVal: oldValue
			};
			this.trigger( 'state:*', value );
			this.trigger( 'state:' + key, value );

			var def = this.data( 'bem' );
			if ( def ) {
				def = def.def;

				var content = def.content;
				if ( content ) {
					if ( typeof content === 'function' ) {
						content = content.call( this, value );
					}
					this.content( content );
				}
			}
		}
	}

	return this;
};

jQuery.fn.mod = function( key, value ) {
	var className = this.data( 'bem' );
	if ( !className ) {
		throw "Mods are available only for bem elements";
	}

	if ( value === undefined ) {
		return this.data( 'mod:' + key );
	}

	className = className.className;

	var oldValue = this.data( 'mod:' + key );

	if ( !jQuery.equal( oldValue, value ) ) {
		this.data( 'mod:' + key, value );

		// classNames
		if ( oldValue === true ) {
			this.removeClass( className + '_' + key );
		} else if ( jQuery.isNumeric( oldValue ) || typeof oldValue === 'string' ) {
			this.removeClass( className + '_' + key + '_' + oldValue );
		}

		if ( value === true ) {
			this.addClass( className + '_' + key );
		} else if ( jQuery.isNumeric( value ) || typeof value === 'string' ) {
			this.addClass( className + '_' + key + '_' + value );
		}

		// events
		value = {
			modName: key,
			newVal: value,
			oldVal: oldValue
		};
		this.trigger( 'mod:*', value );
		this.trigger( 'mod:' + key, value );
	}

	return this;
};

// A function from jQuery (is not public there)
jQuery.isArrayLike = function( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
};

// Whether two objects equal or not
jQuery.equal = function( a, b ) {
	if ( jQuery.isArray(a) && jQuery.isArray(b) ) {
		return a.length === b.length && a.every( function( value, i ) {
			return value === b[i];
		} );
	}

	return a == b;
};


// A data structure for storing data and call callbacks when they change
jQuery.dataProvider = function( initFn ) {
	var dp = new jQuery.dataProvider.fn.init();
	if ( initFn ) {
		initFn.call( dp );
	}
	return dp;
};

// Data Provider prototype
jQuery.dataProvider.fn = jQuery.dataProvider.prototype = {

	init: function() {
		this._data = {};
	},

	get: function( key ) {
		return this._data[ key ];
	},

	set: function( key, value ) {
		var oldVal = this._data[ key ];

		this._data[ key ] = value;

		// Fire the event if the value changed
		if ( !jQuery.equal( oldVal, this._data[ key ] ) ) {
			value = {
				newVal: value,
				oldVal: oldVal,
				key: key
			};

			this.trigger( '*', value );
			this.trigger( key, value );
		}

		return this;
	},

	serialize: function() {
		return JSON.stringify( this._data );
	},

	save: function( place, dbName ) {
		jQuery.dataProvider.save[ place ]( this._data, dbName );
		return this;
	},

	load: function ( place, dbName ) {
		if ( !dbName && ( place[0] === "[" || place[0] === "{" ) ) {
			dbName = place;
			place = "json";
		}

		jQuery.dataProvider.load[ place ]( this, dbName );
		return this;
	}

};

jQuery.extend(jQuery.dataProvider.fn, jQuery.event.fn);
jQuery.dataProvider.fn.init.prototype = jQuery.dataProvider.fn;

// Places to save
jQuery.dataProvider.save = {

	// Save to LocalStorage
	ls: function( data, dbName ) {
		if ( !window.localStorage ) {
			return false;
		}

		// LocalStorage quota may be exceeded
		try {
			// todo: think how to save cyclic structures (find the cycle and save the link)
			window.localStorage.setItem( "data-provider-" + dbName, JSON.stringify( data ) );
		} catch ( e ) {
			return false;
		}

		return true;
	}

};

// Places to load
jQuery.dataProvider.load = {

	// Load form LocalStorage
	ls: function( dataProvider, dbName ) {
		if ( !window.localStorage ) {
			return false;
		}

		jQuery.dataProvider.load.json( dataProvider, window.localStorage.getItem( "data-provider-" + dbName ) );
		return true;
	},

	// Set data from JSON
	json: function( dataProvider, data ) {
		jQuery.each(
			JSON.parse( data ),
			function( key, value ) {
				dataProvider.set( key, value );
			}
		);
		return true;
	}

};

// Factory for data provider
jQuery.dataProvider.factory = function( fn ) {
	return new jQuery.dataProvider.factory.fn.init( fn );
};

jQuery.dataProvider.factory.fn = jQuery.dataProvider.factory.prototype = {

	init: function( fn ) {
		this._listeners = {};
		this._preinit = fn;
	},

	on: jQuery.dataProvider.fn.on,

	off: jQuery.dataProvider.fn.off,

	trigger: jQuery.dataProvider.fn.trigger,

	create: function( data ) {
		var preinit = this._preinit;

		this._provider = jQuery.dataProvider( function() {

			// If the preinit fn returns false, we don't set data
			if ( preinit.call( this, data ) !== false ) {
				jQuery.each( data, function( key, data ) {
					this.set( key, data );
				}.bind( this ) );
			}

		} );

		this.trigger( "update", this._provider );

		return this;
	}

};

jQuery.dataProvider.factory.fn.init.prototype = jQuery.dataProvider.factory.fn;

} );
