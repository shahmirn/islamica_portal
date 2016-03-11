// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/*global
 eventLoggingLite
 */

window.wmTest = ( function ( eventLoggingLite ) {

	'use strict';
	var sessionId = eventLoggingLite.generateRandomSessionId(),
		populationSize = 2, // population size for beta or dev
		group,
		sessionExpiration = 15 * 60 * 1000, // 15 minutes
		preferredLangs,
		KEYS = {
			GROUP: 'portal_test_group',
			SESSION_ID: 'portal_session_id',
			EXPIRES: 'portal_test_group_expires'
		},

	// You can allow a test-only mode (no eventlogging)
	// e.g: testOnly = (location.hash.slice( 1 ) === 'pab1')
		testOnly = false;

	/**
	 * If we're on production, increase population size.
	 */
	if ( /www.wikipedia.org/.test( location.hostname ) ) {
		populationSize = 200;
	}

	/**
	 * Determines whether the user is part of the population size.
	 *
	 * @param {number} rand
	 * @param {number} populationSize
	 * @return {boolean}
	 */
	function oneIn( rand, populationSize ) {
		// take the first 52 bits of the rand value
		var parsed = parseInt( rand.slice( 0, 13 ), 16 );
		return parsed % populationSize === 0;
	}

	/**
	 * Puts the user in a population group randomly.
	 */
	function getTestGroup( sessionId ) {
		// 1:populationSize of the people are tested (baseline)
		if ( oneIn( sessionId, populationSize ) ) {
			return 'baseline';

		} else {
			return 'rejected';
		}
	}

	/**
	 * Tests if `localStorage` is enabled and usable.
	 *
	 * @return {boolean} Whether we can use the `localStorage`.
	 */
	function isLocalStorageEnabled() {
		if ( !( 'localStorage' in window ) ) {
			return false;
		}
		var test = 'lsTest';
		try {
			localStorage.setItem( test, test );
			localStorage.removeItem( test );
			return true;
		} catch ( err ) {
			return false;
		}
	}

	if ( testOnly ) {
		group = location.hash.slice( 1 );
	} else if ( isLocalStorageEnabled() ) {
		var portalGroup = localStorage.getItem( KEYS.GROUP ),
			portalSessionId = localStorage.getItem( KEYS.SESSION_ID ),
			expires = localStorage.getItem( KEYS.EXPIRES ),
			now = new Date().getTime();
		if ( expires &&
			portalSessionId &&
			portalGroup &&
			now < parseInt( expires, 10 )
		) {
			sessionId = portalSessionId;
			// Because localStorage will convert null to a string.
			group = portalGroup === 'null' ? null : portalGroup;
		} else {
			group = getTestGroup( sessionId );
			localStorage.setItem( KEYS.SESSION_ID, sessionId );
			localStorage.setItem( KEYS.GROUP, group );
		}
		// set or extend for 15 more minutes
		localStorage.setItem( KEYS.EXPIRES, now + sessionExpiration );
	} else {
		group = 'rejected';
	}

	/**
	 * Created an array of preferred languages in ISO939 format.
	 *
	 * @return {Array} langs
	 */
	function setPreferredLanguages() {
		var langs = [];

		function appendLanguage( l ) {
			var lang = getIso639( l );
			if ( lang && langs.indexOf( lang ) < 0 ) {
				langs.push( lang );
			}
		}

		for ( var i in navigator.languages ) {
			appendLanguage( navigator.languages[ i ] );
		}

		appendLanguage( navigator.language );
		appendLanguage( navigator.userLanguage );
		appendLanguage( navigator.browserLanguage );
		appendLanguage( navigator.systemLanguage );

		return langs;
	}

	preferredLangs = setPreferredLanguages();

	return {
		loggingDisabled: testOnly, // for test

		/**
		 * User random session ID
		 *
		 * @type {string}
		 */
		sessionId: sessionId,

		/**
		 * The users preferred languages as inferred from
		 * their browser settings.
		 */
		userLangs: preferredLangs,

		/**
		 * User population group
		 *
		 * @type {string}
		 */
		group: group
	};

}( eventLoggingLite ) );
