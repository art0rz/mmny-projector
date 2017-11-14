(function () {
	let urls = [];
	let needle = -1;
	let content = document.getElementById('content');
	let paused = false;
	const defaultTimeout = 1000 * 160;

	function start() {
		loadYTAPI(() =>
			getURLs()
				.then((data) => {
					urls = data;
					showNext();
				}));
	}

	function getURLs() {
		return fetch('/urls')
			.then(res => res.json());
	}

	function showNext() {
		let next = needle + 1;

		if (paused) {
			return;
		}

		if (next >= urls.length) {
			next = 0;
		}

		if (next !== needle) {
			show(next);
		}
	}

	function show(next) {
		needle = next;
		const data = urls[next];

		empty();

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

	function empty() {
		while (content.hasChildNodes()) {
			content.removeChild(content.lastChild);
		}
	}

	document.addEventListener('keyup', function (event) {
		if (event.keyCode === 78) { // 'n' key
			showNext();
		}

		if(event.keyCode === 32) {
			paused = !paused;
		}
	});

	function iframeRenderer(data) {
		const iframe = document.createElement('iframe');
		iframe.src = data.src;

		content.appendChild(iframe);

		setTimeout(() => showNext(), data.timeout || defaultTimeout);
	}

	function imageRenderer(data) {
		const img = document.createElement('img');
		img.setAttribute('src', data.src);
		img.classList.add('fit');
		content.appendChild(img);

		setTimeout(() => showNext(), data.timeout || defaultTimeout);
	}

	function youtubeRenderer(data) {
		const container = document.createElement('div');
		container.classList.add('youtube');
		const player = document.createElement('div');
		player.setAttribute('id', 'ytplayer');

		container.appendChild(player);
		content.appendChild(container);

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
					if(event.data === YT.PlayerState.ENDED) {
						showNext();
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

		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/player_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	start();
})();