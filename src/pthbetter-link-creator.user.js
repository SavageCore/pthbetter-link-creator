// ==UserScript==
// @name         RED pthbetter Link Creator
// @namespace    http://savagecore.eu/
// @version      0.2.19
// @description  Generate pthbetter command and copy to clipboard
// @author       SavageCore

// @include    http*://redacted.ch/artist.php*
// @include    http*://redacted.ch/better.php*
// @include    http*://redacted.ch/collages.php*
// @include    http*://redacted.ch/torrents.php*

// @include    http*://apollo.rip/artist.php*
// @include    http*://apollo.rip/better.php*
// @include    http*://apollo.rip/collages.php*
// @include    http*://apollo.rip/torrents.php*

// @downloadURL	 https://github.com/SavageCore/pthbetter-link-creator/raw/master/src/pthbetter-link-creator.user.js
// @grant        GM_setClipboard
// @grant        GM.setClipboard
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

/*	global document, window, GM, location	*/

(function () {
	'use strict';

	var devider = ' | ';
	var linkregex = /torrents\.php\?action=download.*?id=(\d+).*?authkey=.*?torrent_pass=(?=([a-z0-9]+))\2(?!&)/i;

	var baseURL = window.location.origin;

	var alltorrents = [];
	for (var i = 0; i < document.links.length; i++) {
		alltorrents.push(document.links[i]);
	}

	var allURL = '';

	switch (window.location.href) {
		case (window.location.href.match(/\/torrents.php\?id/) || {}).input:
			var query = getQueryParams(document.location.search);

			for (var i = 0; i < alltorrents.length; i++) {
				if (linkregex.exec(alltorrents[i])) {
					var torrentGroup = query.id;
					var torrentID = RegExp.$1;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (document.querySelectorAll('[onclick^="$(\'#torrent_' + RegExp.$1 + '\')"]')[0].innerText.indexOf('Lossless') !== -1) {
						createlink(alltorrents[i]);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}
			break;
		case (window.location.href.match(/\?type=uploaded.*?&filter=uniquegroup/) || {}).input:
		case (window.location.href.match(/\?type=uploaded.*?&filter=perfectflac/) || {}).input:
		case (window.location.href.match(/\?type=seeding/) || {}).input:
		case (window.location.href.match(/\?type=leeching/) || {}).input:
		case (window.location.href.match(/\?type=snatched/) || {}).input:
		case (window.location.href.match(/\?type=uploaded/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].nextSibling.nodeValue.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0]);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}
			break;
		case (window.location.href.match(/\/better.php\?method/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0]);
					allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
				}
			}
			break;
		case (window.location.href.match(/\/artist.php/) || {}).input:
		case (window.location.href.match(/\/collages.php\?id/) || {}).input:
		case (window.location.href.match(/\/torrents.php/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].innerText.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0]);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}
			break;
		default:
			break;
	}

	function createlink(linkelement) {
		var link = document.createElement('pthB');
		link.appendChild(document.createElement('a'));
		link.firstChild.appendChild(document.createTextNode('pthB'));
		link.appendChild(document.createTextNode(devider));
		link.firstChild.title = 'Copy pthbetter command to clipboard';
		linkelement.parentNode.insertBefore(link, linkelement);

		link.onmouseover = function () {
			link.firstChild.style['text-decoration'] = 'underline';
			link.firstChild.style.cursor = 'pointer';
		};

		link.onmouseout = function () {
			link.firstChild.style['text-decoration'] = 'none';
			link.firstChild.style.cursor = 'inherit';
		};
		switch (location.hostname) {
			case 'apollo.rip':
				var str = 'xanaxbetter ' + url;
				break;
			case 'redacted.ch':
				str = 'whatbetter ' + url;
				break;
			default:
				str = 'whatbetter ' + url;
		}

		link.addEventListener('contextmenu', generateAll, false);

		link.addEventListener('click', async function () {
			await GM.setClipboard(str, 'text'); // eslint-disable-line new-cap
			var original = link.firstChild.getAttribute('style');
			link.firstChild.setAttribute('style', 'color: #63b708 !important');
			setTimeout(function () {
				link.firstChild.setAttribute('style', original);
			}, 2000);
		}, false);
	}

	function getQueryParams(qs) {
		qs = qs.split('+').join(' ');

		var params = {};
		var tokens;
		var re = /[?&]?([^=]+)=([^&]*)/g;

		while ((tokens = re.exec(qs))) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}

	function generateAll(e) {
		e.preventDefault();
		switch (location.hostname) {
			case 'apollo.rip':
				var str = 'xanaxbetter ' + allURL;
				break;
			case 'redacted.ch':
				str = 'whatbetter ' + allURL;
				break;
			default:
				str = 'whatbetter ' + allURL;
		}
		GM.setClipboard(str, 'text'); // eslint-disable-line new-cap
		var original = e.srcElement.getAttribute('style');
		e.srcElement.setAttribute('style', 'color: #63b708 !important');
		setTimeout(function () {
			e.srcElement.setAttribute('style', original);
		}, 2000);
	}
})();
