/**
 * Element with a title.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} $label Titled node, assigned to #$titled
 * @param {Object} [config] Configuration options
 * @cfg {string|Function} [title] Title text or a function that returns text
 */
OO.ui.TitledElement = function OoUiTitledElement( $titled, config ) {
	// Config intialization
	config = config || {};

	// Properties
	this.$titled = $titled;
	this.title = null;

	// Initialization
	this.setTitle( config.title || this.constructor.static.title );
};

/* Static Properties */

OO.ui.TitledElement.static = {};

/**
 * Title.
 *
 * @static
 * @inheritable
 * @property {string|Function} Title text or a function that returns text
 */
OO.ui.TitledElement.static.title = null;

/* Methods */

/**
 * Set title.
 *
 * @method
 * @param {string|Function|null} title Title text, a function that returns text or null for no title
 * @chainable
 */
OO.ui.TitledElement.prototype.setTitle = function ( title ) {
	this.title = title = OO.ui.resolveMsg( title ) || null;

	if ( typeof title === 'string' && title.length ) {
		this.$titled.attr( 'title', title );
	} else {
		this.$titled.removeAttr( 'title' );
	}

	return this;
};

/**
 * Get title.
 *
 * @method
 * @returns {string} Title string
 */
OO.ui.TitledElement.prototype.getTitle = function () {
	return this.title;
};
