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

// block background gql requests with a specific opeartionName

chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		// if (details.initiator !== 'https://player.twitch.tv') return;
		try{
			let requestPayload = JSON.parse(decodeURIComponent(stringFromArrayBuffer(details.requestBody.raw[0].bytes)));
			
			if (!Array.isArray(requestPayload)) return;
			var block = false;
			requestPayload.forEach(item =>{
				if(
					item.operationName === "ClientSideAdEventHandling_RecordAdEvent"
					// item.operationName === "VideoPlayerStreamInfoOverlayChannel" ||
					// item.operationName === "EmbedPlayer_UserData" ||
					// item.operationName === "updateUserViewedVideo" ||
					// item.operationName === "WatchTrackQuery" ||
					// item.operationName === "PbyPGame" ||
					// item.operationName === "Consent" ||
					// item.operationName === "CountessData" ||
					// item.operationName === "StreamRefetchManager" ||
					// item.operationName === "PlayerTrackingContextQuery" ||
					// item.operationName === "Core_Services_Spade_CurrentUser" ||
					// item.operationName === "VideoAdRequestHandling" 
					// item.operationName === "PlaybackAccessToken_Template"
				
				){
					console.log(item)
					console.log('GQL blocked');
					block = true;
					return;
				}
			});
			
			if (block) return { cancel:true };
			// console.log(requestPayload[0].operationName);
			// console.log(details);
			// console.log('calling gql');
		}catch(e){
			return;
		}
	},
	{ urls: ["*://gql.twitch.tv/gql*"] },
	['blocking','requestBody','extraHeaders']
);