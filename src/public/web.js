(function () {
	let urls = [];
	let needle = -1;
	let content = document.getElementById('content');
	let paused = false;
	let timeout = -1;
	const defaultTimeout = 1000 * 160;

	function start() {
		loadYTAPI(() =>
			getURLs()
				.then((data) => {
					urls = data;
					go(1);
					lib.showNotification('Arrow keys for navigation<br/>Space to pause/resume');
				}));
	}

	function getURLs() {
		return fetch('/urls')
			.then(res => res.json());
	}

	function next() {
		if (paused === false) {
			go(1);
		}
	}

	function go(increment) {
		let next = needle + increment;

		if (next >= urls.length) {
			next = 0;
		}

		if (next < 0) {
			next = urls.length - 1;
		}

		if (next !== needle) {
			show(next);
		}
	}

	function show(next) {
		needle = next;
		const data = urls[next];

		lib.emptyNode(content);

		lib.showNotification((next + 1) + '/' + urls.length);

		switch (data.type) {
			case "youtube": {
				youtubeRenderer(data.data);
				break;
			}

			case "image": {
				imageRenderer(data.data);
				break;
			}

			case "iframe": {
				iframeRenderer(data.data);
				break;
			}
		}
	}

	document.addEventListener('keyup', function (event) {
		// 37 left
		if (event.keyCode === 37) {
			go(-1);
		}

		if (event.keyCode === 39) {
			go(1);
		}

		if (event.keyCode === 32) {
			paused = !paused;

			lib.showNotification(paused ? 'Paused' : 'Unpaused');
		}
	});

	function iframeRenderer(data) {
		lib.createElement('iframe', {src: data.src}, null, content);
		nextTimeout(data.timeout);
	}

	function nextTimeout(timeout) {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => next(), timeout || defaultTimeout);
	}

	function imageRenderer(data) {
		lib.createElement('img', {src: data.src, class: 'fit'}, null, content);
		nextTimeout(data.timeout);
	}

	function youtubeRenderer(data) {
		const container = lib.createElement('div', {class: 'youtube'}, null, content);
		const player = lib.createElement('div', {id: 'ytplayer'}, null, container);

		const video = new YT.Player('ytplayer', {
			height: '360',
			width: '640',
			playerVars: {
				controls: 0,
				showinfo: 0,
				autoplay: 1,
				fs: 0,
				modestbranding: 1,
			},
			events: {
				onReady: () => {
					if (data.seek) {
						video.seekTo(data.seek);
					}
				},
				onStateChange: (event) => {
					if (event.data === YT.PlayerState.ENDED) {
						go(1);
					}
				}
			},
			videoId: data.id
		});
	}

	function loadYTAPI(cb) {
		window.onYouTubePlayerAPIReady = function () {
			cb();
		};

		const tag = window.lib.createElement('script', {src: 'https://www.youtube.com/player_api'});
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	start();
})();