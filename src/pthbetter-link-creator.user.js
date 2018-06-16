// ==UserScript==
// @name         RED pthbetter Link Creator
// @namespace    http://savagecore.eu/
// @version      0.4.1
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
	const linkregex = /torrents\.php\?action=download.*?id=(\d+).*?authkey=.*?torrent_pass=(?=([a-z0-9]+))\2(?!&)/i;

	const baseURL = window.location.origin;

	const alltorrents = [];
	for (let i = 0; i < document.links.length; i++) {
		alltorrents.push(document.links[i]);
	}

	let allURL = '';
	let url;

	switch (window.location.href) {
		case (window.location.href.match(/\/torrents.php\?id/) || {}).input: {
			const query = getQueryParams(document.location.search);

			for (let i = 0; i < alltorrents.length; i++) {
				if (linkregex.exec(alltorrents[i])) {
					const torrentGroup = query.id;
					const torrentID = RegExp.$1;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (document.querySelectorAll('[onclick^="$(\'#torrent_' + RegExp.$1 + '\')"]')[0].innerText.indexOf('Lossless') !== -1) {
						createlink(alltorrents[i], url);
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
			for (let i = 0; i < alltorrents.length; i++) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].nextSibling.nodeValue.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]', url)[0]);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}
			break;
		case (window.location.href.match(/\/better.php\?method/) || {}).input:
			for (let i = 0; i < alltorrents.length; i++) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]', url)[0]);
					allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
				}
			}
			break;
		case (window.location.href.match(/\/artist.php/) || {}).input:
		case (window.location.href.match(/\/collages.php\?id/) || {}).input:
		case (window.location.href.match(/\/torrents.php/) || {}).input:
			for (let i = 0; i < alltorrents.length; i++) {
				const torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					const torrentGroup = RegExp.$1;
					const torrentID = RegExp.$2;
					url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].innerText.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '&"]', url)[0]);
						allURL += baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID + ' ';
					}
				}
			}
			break;
		default:
			break;
	}

	function createlink(linkelement, url) {
		const link = document.createElement('redB');
		link.appendChild(document.createElement('a'));
		link.firstChild.appendChild(document.createTextNode('redB'));
		link.appendChild(document.createTextNode(devider));
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
		let str;
		switch (location.hostname) {
			case 'apollo.rip':
				str = 'xanaxbetter ' + url;
				break;
			case 'redacted.ch':
				str = 'redactedbetter ' + url;
				break;
			default:
				str = 'whatbetter ' + url;
		}

		link.addEventListener('contextmenu', generateAll, false);

		link.addEventListener('click', async () => {
			await GM.setClipboard(str, 'text'); // eslint-disable-line new-cap
			const original = link.firstChild.getAttribute('style');
			link.firstChild.setAttribute('style', 'color: #63b708 !important');
			setTimeout(() => {
				link.firstChild.setAttribute('style', original);
			}, 2000);
		}, false);
	}

	function getQueryParams(qs) {
		qs = qs.split('+').join(' ');

		const params = {};
		let tokens;
		const re = /[?&]?([^=]+)=([^&]*)/g;

		while ((tokens = re.exec(qs))) {
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}

		return params;
	}

	function generateAll(e) {
		e.preventDefault();
		let str;
		switch (location.hostname) {
			case 'apollo.rip':
				str = 'xanaxbetter ' + allURL;
				break;
			case 'redacted.ch':
				str = 'redactedbetter ' + allURL;
				break;
			default:
				str = 'whatbetter ' + allURL;
		}
		GM.setClipboard(str, 'text'); // eslint-disable-line new-cap
		const original = e.srcElement.getAttribute('style');
		e.srcElement.setAttribute('style', 'color: #63b708 !important');
		setTimeout(() => {
			e.srcElement.setAttribute('style', original);
		}, 2000);
	}
})();
