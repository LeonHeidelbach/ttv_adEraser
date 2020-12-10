//------------------------------------------------------------------------------------------------//
// 	main background script
//------------------------------------------------------------------------------------------------//
//  bkg.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//

// set user settings values on extension install or browser launch from background script

retrieveuserSettingsInit();

// listen to browser history changes and send a runtime message to the content script to change the player frame location

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	if(details.url.includes('twitch.tv/'))
		sendRuntimeMessagetoContent('changeTwitchIframeLocation',details)
});

// background script message receiver

chrome.runtime.onMessage.addListener(
	function(request,sender,senderResponse){
		switch (request.call_method){
			case 'getTabId':
				senderResponse({tab: sender?.tab.id});
				break;
			case 'reloadAllttvTabs':
				reloadAllttvTabs((request.payload === undefined ? false : request.payload.iframeOnly));
				break;
		}
	}
);

// reloads all tabs in all browser windows that match a twitch channel pattern

function reloadAllttvTabs(iframeOnly=false){
	chrome.tabs.query({},function(tabs){
		let twitchUrlTestPattern = new RegExp(/(.*)\/\/(www\.)?(twitch\.tv)\/(.*)$/, 'gmi');
		tabs.forEach(function(tab){
			if(twitchUrlTestPattern.test(tab.url))
				if(iframeOnly)
					sendRuntimeMessagetoContent('changeTwitchIframeLocation',{tabId:'reload'},tab.id);
				else chrome.tabs.reload(tab.id);
		});
	});
}