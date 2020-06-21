/* eslint-env node, es6 */
var _ = require( 'underscore' ),
	hbs = require( '../../hbs-helpers.global.js' ),
	fs = require( 'fs' ),
	glob = require( 'glob' ),
	stats = require( '../../data/stats' ),
	otherProjects = require( './other-projects.json' ),
	otherLanguages = require( './other-languages.json' ),
	rtlLanguages = require( './rtl-languages.json' ),
	crypto = require( 'crypto' ),
	exec = require( 'child_process' ).execSync,
	topList,
	topDropdown,
	Controller,
	cachebuster,
	siteStats,
	range,
	translationPath = __dirname + '/assets/l10n/';

// Format the dropdown for ./templates/search.mustache
topList = stats.getRange( 'islamica', 'numPages', 0 );
topDropdown = stats.format( 'islamica', topList, {
	stripTags: true
} );

/**
 *  SiteStats returns and object for each language wikipedia by language code.
 *  ex:
 *  "en":{"url":"en.islamica.org",
 *        "numPages":"5 077 000",
 *        "views":1723574042,
 *        "siteName":"Wikipedia",
 *        "articles":"articles",
 *        "slogan":"The Free Encyclopedia",
 *        "name":"English",
 *        "lang":"en"
 *        }
 */
siteStats = {};
range = stats.getRangeFormatted( 'islamica', 'views', 10 );

_.each( range, function ( wiki ) {
	if ( wiki.closed || wiki.sublinks ) {
		return;
	}

	wiki.numPages = hbs.formatNumber( wiki.numPages, {
		hash: {
			thousandSeparator: true,
			rounded: true,
			nbsp: false
		}
	} ).toString();

	siteStats[ wiki.code ] = _.omit( wiki, 'closed', 'code', 'index' );
} );

function getPreloadLinks() {
	var preloadLinks = [];
	[
		{
			pattern: '/assets/img/sprite*.svg',
			as: 'image'
		}
	].forEach( function ( source ) {
		glob.sync( source.pattern, { cwd: __dirname } )
			.forEach( function ( href ) {
				preloadLinks.push( { href: href, as: source.as } );
			} );
	} );

	return preloadLinks;
}

/**
 * Writing stats to translation files
 */

function createTranslationsChecksum( siteStats ) {
	var data = JSON.stringify( siteStats ),
		hash = crypto.createHash( 'md5' ).update( data ).digest( 'hex' );

	// Truncating hash for legibility
	hash = hash.substring( 0, 8 );
	return hash;
}

function createTranslationFiles( translationPath, siteStats, cachebuster ) {
	var fileName, lang;

	function writeFile( el, lang ) {
		var fileContent;

		if ( el.code ) {
			lang = el.code;
		}

		fileName = translationPath + lang + '-' + cachebuster + '.json';
		fileContent = JSON.stringify( el );

		fs.writeFileSync( fileName, fileContent );
	}

	for ( lang in siteStats ) {
		if ( siteStats[ lang ].sublinks ) {
			siteStats[ lang ].sublinks.forEach( writeFile );
		} else {
			writeFile( siteStats[ lang ], lang );
		}
	}
}

cachebuster = createTranslationsChecksum( siteStats );

if ( fs.existsSync( translationPath ) ) {
	exec( 'find ' + translationPath + ' -mindepth 1 -delete' );
	createTranslationFiles( translationPath, siteStats, cachebuster );
} else {
	fs.mkdirSync( translationPath );
	createTranslationFiles( translationPath, siteStats, cachebuster );
}

Controller = {
	top10views: stats.getTopFormatted( 'islamica', 'views', 10 ),
	top1000000Articles: stats.getRangeFormatted( 'islamica', 'numPages', 1000000 ),
	top100000Articles: stats.getRangeFormatted( 'islamica', 'numPages', 100000, 1000000 ),
	top10000Articles: stats.getRangeFormatted( 'islamica', 'numPages', 10000, 100000 ),
	top1000Articles: stats.getRangeFormatted( 'islamica', 'numPages', 1000, 10000 ),
	top100Articles: stats.getRangeFormatted( 'islamica', 'numPages', 100, 1000 ),
	topDropdown: topDropdown,
	preloadLinks: getPreloadLinks(),
	otherProjects: otherProjects,
	otherLanguages: otherLanguages,
	rtlLanguages: rtlLanguages,
	// The only "advantage" to do this instead of JSON.stringify is to get single quotes.
	rtlLanguagesStringified: '[\'' + rtlLanguages.join( '\',\'' ) + '\']',
	translationChecksum: cachebuster
};

module.exports = Controller;
