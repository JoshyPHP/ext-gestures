/** @define {!number} Mouse button that triggers gestures */
var GESTURE_BUTTON = 1;

/** @define {!number} Minimum distance to count as a step */
var DIFF_MIN = 40;

(function (window)
{
	/** @const */
	var actions = {
		'back': function (request)
		{
			window.history.back();
		},
		'forward': function (request)
		{
			window.history.forward();
		},
		'startGesture': function (request)
		{
			startGesture(request['startX'], request['startY']);
		},
		'removeListeners': function (request)
		{
			removeListeners();
		}
	};

	var gesture = '', lastStep = '', startX, startY;

	function mousemove(e)
	{
		var currentX = e.screenX,
			currentY = e.screenY,
			diffX    = Math.abs(currentX - startX),
			diffY    = Math.abs(currentY - startY);

		if (diffX < DIFF_MIN && diffY < DIFF_MIN)
		{
			return;
		}

		if (diffX > diffY)
		{
			addStep((currentX > startX) ? 'R' : 'L');
		}
		else
		{
			addStep((currentY > startY) ? 'D' : 'U');
		}

		startX = currentX;
		startY = currentY;
	}

	function wheel(e)
	{
		gesture = 'W';

		if (e['deltaY'] > 0)
		{
			gesture += 'D';
		}
		else if (e['deltaY'] < 0)
		{
			gesture += 'U';
		}

		if (e['deltaX'] > 0)
		{
			gesture += 'R';
		}
		else if (e['deltaX'] < 0)
		{
			gesture += 'L';
		}

		sendGesture();
		e.preventDefault();
	}

	function mouseup()
	{
		removeListeners();
		sendGesture();
	}

	function addListeners()
	{
		window.addEventListener('mousemove', mousemove, true);
		window.addEventListener('mouseup',   mouseup,   true);
		window.addEventListener('wheel',     wheel,     true);
	}

	function removeListeners()
	{
		window.removeEventListener('mousemove', mousemove, true);
		window.removeEventListener('mouseup',   mouseup,   true);
		window.removeEventListener('wheel',     wheel,     true);
	}

	function startGesture(currentX, currentY)
	{
		gesture = lastStep = '';

		startX = currentX;
		startY = currentY;

		addListeners();
	}

	function addStep(step)
	{
		if (step !== lastStep)
		{
			gesture  += step;
			lastStep  = step;
		}
	}

	function sendGesture()
	{
		if (gesture === '')
		{
			return;
		}

		chrome.runtime.sendMessage(
			{ 'gesture': gesture, 'startX': startX, 'startY': startY },
			function () {}
		);

		gesture = '';
	}

	window.addEventListener(
		'mousedown',
		function (e)
		{
			if (e.button !== GESTURE_BUTTON)
			{
				return;
			}

			startGesture(e.screenX, e.screenY);
		},
		true
	);

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse)
		{
			var action = request['action'];

			if (actions[action])
			{
				actions[action](request);
			}
		}
	);
})(window);