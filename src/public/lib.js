(function () {
	const notificationContainer = document.getElementById('notifications');
	window.lib = {
		createElement: function (type, props, styles, parent) {
			const element = document.createElement(type);
			for (const key in (props || {})) {
				element.setAttribute(key, props[key]);
			}
			for (const key in (styles || {})) {
				element.style.setProperty(key, props[key]);
			}

			if (parent) {
				parent.appendChild(element);
			}

			return element;
		},

		showNotification: function (text) {
			lib.emptyNode(notificationContainer);
			const el = lib.createElement('div', { class: 'notification'}, null, notificationContainer);
			el.innerHTML = text;

			el.addEventListener('animationend', function () {
				notificationContainer.removeChild(el);
			});
		},

		emptyNode: function(node) {
			while (node.hasChildNodes()) {
				node.removeChild(node.lastChild);
			}
		}
	};
})();