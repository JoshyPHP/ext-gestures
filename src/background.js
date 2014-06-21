/** @const */
var gestures = {
	'D'     : 'minimize',
	'DL'    : 'previousTab',
	'DR'    : 'nextTab',
	'DU'    : 'reload',
	'L'     : 'back',
	'LDRDL' : 'showSource',
	'R'     : 'forward',
	'UR'    : 'closeTab',
	'WD'    : 'nextTab',
	'WL'    : 'back',
	'WR'    : 'forward',
	'WU'    : 'previousTab'
};

/** @const */
var actions = {
	'closeTab': function (request, sender, sendResponse)
	{
		chrome.tabs.remove(sender.tab.id);
	},
	'minimize': function (request, sender, sendResponse)
	{
		chrome.windows.update(sender.tab.windowId, { 'state': 'minimized' });
	},
	'nextTab': function (request, sender, sendResponse)
	{
		switchTab(request, sender, 1);
	},
	'previousTab': function (request, sender, sendResponse)
	{
		switchTab(request, sender, -1);
	},
	'reload': function (request, sender, sendResponse)
	{
		chrome.tabs.reload(sender.tab.id);
	},
	'showSource': function (request, sender, sendResponse)
	{
		chrome.tabs.create({
			'index':    1 + sender.tab.index,
			'url':      'view-source:' + sender.tab.url,
			'windowId': sender.tab.windowId
		});
	}
};

function switchTab(request, sender, diff)
{
	chrome.tabs.sendMessage(
		sender.tab.id,
		{ 'action': 'removeListeners' },
		function () {}
	);

	chrome.tabs.query(
		{ 'windowId': sender.tab.windowId },
		function (tabs)
		{
			var index = (tabs.length + sender.tab.index + diff) % tabs.length;

			request['action'] = 'startGesture';
			chrome.tabs.sendMessage(tabs[index].id, request, function () {});

			chrome.tabs.highlight(
				{
					'windowId': sender.tab.windowId,
					'tabs': index
				},
				function () {}
			);
		}
	);
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse)
	{
		if (!gestures[request['gesture']])
		{
			return;
		}

		var action = gestures[request['gesture']];

		if (actions[action])
		{
			actions[action](request, sender, sendResponse);
		}
		else
		{
			request['action'] = action;
			chrome.runtime.tabs.sendMessage(sender.tab.id, request, function () {});
		}
	}
);