// ==UserScript==
// @name         RED pthbetter Link Creator
// @namespace    http://savagecore.eu/
// @version      0.4.3
// @description  Generate REDBetter-crawler command and copy to clipboard
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

/* eslint complexity: 0 */

(function () {
	'use strict';

	const devider = ' | ';
	const linkregex = /torrents\.php\?action=download.*?id=(\d+).*?authkey=.*?torrent_pass=(?=([a-z\d]+))\2(?!&)/i;

	const baseURL = window.location.origin;

	const alltorrents = [];
	for (let i = 0; i < document.links.length; i++) {
		alltorrents.push(document.links[i]);
	}

	let allURL = '';
	let url;

	switch (window.location.href) {
		case (window.location.href.match(/\/torrents.php\?id/) || {}).input: {
			const query = getQueryParameters(document.location.search);

			for (const torrent of alltorrents) {
				if (linkregex.exec(torrent)) {
					const torrentGroup = query.id;
					const torrentID = RegExp.$1;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (document.querySelectorAll('[onclick^="$(\'#torrent_' + RegExp.$1 + '\')"]')[0].textContent.includes('Lossless')) {
						createlink(torrent, url);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}

			break;
		}

		case (window.location.href.match(/\?type=uploaded.*?&filter=uniquegroup/) || {}).input:
		case (window.location.href.match(/\?type=uploaded.*?&filter=perfectflac/) || {}).input:
		case (window.location.href.match(/\?type=seeding/) || {}).input:
		case (window.location.href.match(/\?type=leeching/) || {}).input:
		case (window.location.href.match(/\?type=snatched/) || {}).input:
		case (window.location.href.match(/\?type=uploaded/) || {}).input:
			for (const torrent of alltorrents) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(torrent)) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (torrent.nextSibling.nodeValue.includes('Lossless')) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0], url);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '&torrentid=' + torrentID + ' ';
					}
				}
			}

			break;
		case (window.location.href.match(/\/better.php\?method/) || {}).input:
			for (const torrent of alltorrents) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(torrent)) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '&torrentid=' + torrentID;
					createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0], url);
					allURL += baseURL + '/torrents.php?id=' + torrentGroup + '&torrentid=' + torrentID + ' ';
				}
			}

			break;
		case (window.location.href.match(/\/artist.php/) || {}).input:
		case (window.location.href.match(/\/collages.php\?id/) || {}).input:
		case (window.location.href.match(/\/torrents.php/) || {}).input:
			for (const torrent of alltorrents) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(torrent)) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '&torrentid=' + torrentID;
					if (torrent.textContent.includes('Lossless')) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]')[0], url);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '&torrentid=' + torrentID + ' ';
					}
				}
			}

			break;
		default:
			break;
	}

	function createlink(linkelement, url) {
		const link = document.createElement('redB');
		link.append(document.createElement('a'));
		link.firstChild.append(document.createTextNode('redB'));
		link.append(document.createTextNode(devider));
		link.firstChild.title = 'Copy pthbetter command to clipboard';
		linkelement.parentNode.insertBefore(link, linkelement);

		link.addEventListener('mouseover', () => {
			link.firstChild.style['text-decoration'] = 'underline';
			link.firstChild.style.cursor = 'pointer';
		});

		link.addEventListener('mouseout', () => {
			link.firstChild.style['text-decoration'] = 'none';
			link.firstChild.style.cursor = 'inherit';
		});
		let string;
		switch (location.hostname) {
			case 'apollo.rip':
				string = 'xanaxbetter ' + url;
				break;
			case 'redacted.ch':
				string = 'redactedbetter ' + url;
				break;
			default:
				string = 'whatbetter ' + url;
		}

		link.addEventListener('contextmenu', generateAll, false);

		link.addEventListener('click', async () => {
			await GM.setClipboard(string, 'text');
			const original = link.firstChild.getAttribute('style');
			link.firstChild.setAttribute('style', 'color: #63b708 !important');
			setTimeout(() => {
				link.firstChild.setAttribute('style', original);
			}, 2000);
		}, false);
	}

	function getQueryParameters(qs) {
		qs = qs.split('+').join(' ');

		const parameters = {};
		let tokens;
		const re = /[?&]?([^=]+)=([^&]*)/g;

		while ((tokens = re.exec(qs))) {
			parameters[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return parameters;
	}

	function generateAll(event) {
		event.preventDefault();
		let string;
		switch (location.hostname) {
			case 'apollo.rip':
				string = 'xanaxbetter ' + allURL;
				break;
			case 'redacted.ch':
				string = 'redactedbetter ' + allURL;
				break;
			default:
				string = 'whatbetter ' + allURL;
		}

		GM.setClipboard(string, 'text');
		const original = event.srcElement.getAttribute('style');
		event.srcElement.setAttribute('style', 'color: #63b708 !important');
		setTimeout(() => {
			event.srcElement.setAttribute('style', original);
		}, 2000);
	}
})();
