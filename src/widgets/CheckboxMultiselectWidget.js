/**
 * CheckboxMultiselectWidget is a {@link OO.ui.MultiselectWidget multiselect widget} that contains
 * checkboxes and is used together with OO.ui.CheckboxMultioptionWidget. The
 * CheckboxMultiselectWidget provides an interface for adding, removing and selecting options.
 * Please see the [OOjs UI documentation on MediaWiki][1] for more information.
 *
 * If you want to use this within a HTML form, such as a OO.ui.FormLayout, use
 * OO.ui.CheckboxMultiselectInputWidget instead.
 *
 *     @example
 *     // A CheckboxMultiselectWidget with CheckboxMultioptions.
 *     var option1 = new OO.ui.CheckboxMultioptionWidget( {
 *         data: 'a',
 *         selected: true,
 *         label: 'Selected checkbox'
 *     } );
 *
 *     var option2 = new OO.ui.CheckboxMultioptionWidget( {
 *         data: 'b',
 *         label: 'Unselected checkbox'
 *     } );
 *
 *     var multiselect=new OO.ui.CheckboxMultiselectWidget( {
 *         items: [ option1, option2 ]
 *      } );
 *
 *     $( 'body' ).append( multiselect.$element );
 *
 * [1]: https://www.mediawiki.org/wiki/OOjs_UI/Widgets/Selects_and_Options
 *
 * @class
 * @extends OO.ui.MultiselectWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.CheckboxMultiselectWidget = function OoUiCheckboxMultiselectWidget( config ) {
	// Parent constructor
	OO.ui.CheckboxMultiselectWidget.parent.call( this, config );

	// Properties
	this.$lastClicked = null;

	// Events
	this.$group.on( 'click', this.onClick.bind( this ) );

	// Initialization
	this.$element
		.addClass( 'oo-ui-checkboxMultiselectWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.CheckboxMultiselectWidget, OO.ui.MultiselectWidget );

/* Methods */

/**
 * Get an option by its position relative to the specified item (or to the start of the option array,
 * if item is `null`). The direction in which to search through the option array is specified with a
 * number: -1 for reverse (the default) or 1 for forward. The method will return an option, or
 * `null` if there are no options in the array.
 *
 * @param {OO.ui.CheckboxMultioptionWidget|null} item Item to describe the start position, or `null` to start at the beginning of the array.
 * @param {number} direction Direction to move in: -1 to move backward, 1 to move forward
 * @return {OO.ui.CheckboxMultioptionWidget|null} Item at position, `null` if there are no items in the select
 */
OO.ui.CheckboxMultiselectWidget.prototype.getRelativeFocusableItem = function ( item, direction ) {
	var currentIndex, nextIndex, i,
		increase = direction > 0 ? 1 : -1,
		len = this.items.length;

	if ( item ) {
		currentIndex = this.items.indexOf( item );
		nextIndex = ( currentIndex + increase + len ) % len;
	} else {
		// If no item is selected and moving forward, start at the beginning.
		// If moving backward, start at the end.
		nextIndex = direction > 0 ? 0 : len - 1;
	}

	for ( i = 0; i < len; i++ ) {
		item = this.items[ nextIndex ];
		if ( item && !item.isDisabled() ) {
			return item;
		}
		nextIndex = ( nextIndex + increase + len ) % len;
	}
	return null;
};

/**
 * Handle click events on checkboxes.
 *
 * @param {jQuery.Event} e
 */
OO.ui.CheckboxMultiselectWidget.prototype.onClick = function ( e ) {
	var $options, checked,
		$lastClicked = this.$lastClicked,
		$nowClicked = $( e.target ).closest( '.oo-ui-checkboxMultioptionWidget' )
			.not( '.oo-ui-widget-disabled' );

	// Allow selecting multiple options at once by Shift-clicking them
	if ( $lastClicked && $nowClicked.length && e.shiftKey ) {
		$options = this.$group.find( '.oo-ui-checkboxMultioptionWidget' );
		checked = $nowClicked.find( 'input' ).prop( 'checked' );

		$options
			.slice(
				Math.min( $options.index( $lastClicked ), $options.index( $nowClicked ) ),
				Math.max( $options.index( $lastClicked ), $options.index( $nowClicked ) ) + 1
			)
			.find( 'input' )
			.filter( function () {
				return !this.disabled;
			} )
			.prop( 'checked', checked )
			.trigger( 'change' );
	}

	if ( $nowClicked.length ) {
		this.$lastClicked = $nowClicked;
	}
};
