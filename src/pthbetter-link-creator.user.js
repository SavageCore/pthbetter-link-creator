// ==UserScript==
// @name         pthbetter Link Creator
// @namespace    http://savagecore.eu/
// @version      0.1.10
// @description  Generate pthbetter command and copy to clipboard
// @author       SavageCore

// @include    http*://passtheheadphones.me/artist.php*
// @include    http*://passtheheadphones.me/better.php*
// @include    http*://passtheheadphones.me/collages.php*
// @include    http*://passtheheadphones.me/torrents.php*

// @downloadURL	 https://github.com/SavageCore/pthbetter-link-creator/raw/master/src/pthbetter-link-creator.user.js
// @grant        GM_setClipboard
// ==/UserScript==

/*	global document, window, GM_setClipboard	*/

(function () {
	'use strict';

	var devider = ' | ';
	var linkregex = /torrents.php\?action=download.*?id=(\d+).*?authkey=.*?torrent_pass=.*/i;

	var baseURL = window.location.origin;

	var alltorrents = [];
	for (var i = 0; i < document.links.length; i++) {
		alltorrents.push(document.links[i]);
	}

	switch (window.location.href) {
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?id/) || {}).input:
			var query = getQueryParams(document.location.search);

			for (var i = 0; i < alltorrents.length; i++) {
				if (linkregex.exec(alltorrents[i])) {
					var torrentGroup = query.id;
					var torrentID = RegExp.$1;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (document.querySelectorAll('[onclick^="$(\'#torrent_' + RegExp.$1 + '\')"]')[0].innerText.indexOf('Lossless') !== -1) {
						createlink(alltorrents[i]);
					}
				}
			}
			break;
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=uploaded.*?&filter=uniquegroup/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=uploaded.*?&filter=perfectflac/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=seeding/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=leeching/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=snatched/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php\?type=uploaded/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].nextSibling.nodeValue.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '"]')[0]);
					}
				}
			}
			break;
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/better.php\?method/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '"]')[0]);
				}
			}
			break;
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/artist.php/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/collages.php\?id/) || {}).input:
		case (window.location.href.match(/http[s]?:\/\/passtheheadphones.me\/torrents.php/) || {}).input:
			for (var i = 0; i < alltorrents.length; i++) {
				var torrentRegex = /torrents.php\?id=(\d+)&torrentid=(\d+)/;
				if (torrentRegex.exec(alltorrents[i])) {
					var torrentGroup = RegExp.$1;
					var torrentID = RegExp.$2;
					var url = baseURL + '/torrents.php?id=' + torrentGroup + '\\&torrentid=' + torrentID;
					if (alltorrents[i].innerText.indexOf('Lossless') !== -1) {
						createlink(document.querySelectorAll('[href^="torrents.php?action=download&id=' + torrentID + '"]')[0]);
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
		var str = 'python pthbetter ' + url;

		link.addEventListener('click', function () {
			GM_setClipboard(str, 'text'); // eslint-disable-line new-cap
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
})();
