//------------------------------------------------------------------------------------------------//
// 	content script
//------------------------------------------------------------------------------------------------//
//  cnt.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//

// create a global settings variable

var settings;

// content script injection method

(async function cntInit(){
	if(top.location.href.includes("twitch.tv/") && !top.location.href.includes('clips.twitch.tv/')){
		await updateUserSettings();
		let userSettings = settings.userSettings;
		if(settings === undefined || userSettings.enable_ttv_adEraser === undefined || userSettings.enable_ttv_adEraser){
			awaitTwitchUi();
			awaitTwitchPlayer();
		}
	}
})();

// content script message receiver

chrome.runtime.onMessage.addListener(
	function(request,sender,senderResponse){
		switch (request.call_method){
			case "changeTwitchIframeLocation":
				changeTwitchIframeLocation(request.payload)
			break;
		}
	}
);

// store currently selected stream quality in local storage

window.addEventListener("message", (event) => {
	if (event.data.eventName == "UPDATE_STATE" && event.data.params.quality && !document.hidden)
		if (/^((?:160|360|480|720|900|960|1080)p(?:30|48|50|60)|chunked)$/.test(event.data.params.quality))
      		localStorage.setItem("ttv_adEraser_embedQuality", event.data.params.quality);
});

// global settings variable updater

async function updateUserSettings(){
	settings = await getStorageItem('userSettings','sync');
}

// wait for the twitch ui to load and add ui features

async function awaitTwitchUi(){
	awaitHtmlElement('.side-bar-contents', 'inf', () =>{
		peekPlayerPrepper();
	});
}

// wait for the stream to load, remove ads and add player features

async function awaitTwitchPlayer(){
	awaitHtmlElement('video', 'inf', () =>{
		ttvTheaterButtonMover();
		twitchAdBlock();
	});
}

// prepare the side bar to spawn the peek player when hovering over a channel icon

var peekPlayerNonce;
async function peekPlayerPrepper(){
	async function awaitHoverPopup(evt){
		await updateUserSettings();
		let twitchUrlObjPrepper = channelName => twitchUrlObj(`https://www.twitch.tv/${channelName.toLowerCase().replace(/ /gmi,'')}`);
		if(!settings.userSettings.enable_ttv_peek_player) return;
		var urlObj;
		if(evt.target.tagName === 'A')
			urlObj = twitchUrlObj(evt.target.href);
		else if(evt.target.tagName === 'IMG')
			urlObj = twitchUrlObjPrepper(evt.target.getAttribute('alt'));
		else if(evt.target.tagName === 'P')
			urlObj = twitchUrlObj(evt.target.parentNode.parentNode.parentNode.parentNode.href);
		else return;
		var localNonce = peekPlayerNonce = new Object();
		setTimeout(async () =>{
			if(localNonce === peekPlayerNonce){
				if(document.getElementById('ttvpeekplayerframe') !== null || await awaitHtmlElement('.dialog-layer',4000))
					addPeekPlayer(urlObj);
			}
		},500);
	}
	with(document.querySelector('.side-bar-contents')){
		addEventListener('mouseover', awaitHoverPopup, false);
		addEventListener('wheel',function(evt){handleTwitchPlayerScroll(evt,document.getElementById('ttvpeekplayerframe').contentWindow.document)},false)
	}
}

// spawn the peek player

async function addPeekPlayer(urlObj){
	await updateUserSettings();
	let playerHeight = (settings.userSettings.ttv_peek_player_size !== undefined ? settings.userSettings.ttv_peek_player_size : 240);
	let element = document.querySelector('.dialog-layer .tw-pd-x-05').firstChild;
	let frameWrapper = document.createElement('div');
	let frameURL = `https://player.twitch.tv/?${urlObj.contentType}=${urlObj.contentId}&parent=www.twitch.tv&quality=chunked`;
	frameWrapper.setAttribute('style',`background-color: #000000; width: ${playerHeight*16/9}px; height: ${playerHeight}px; margin: 0 0 5px 0;`);
	frameWrapper.innerHTML = `<iframe id='ttvpeekplayerframe' class='video-player' src='${frameURL}' data-a-target='video-player' data-a-player-type='site' data-test-selector='video-player__video-layout' data-theaterMode='false' data-listening='false' allowfullscreen='false' allow='autoplay' style="width: 100%; display: none; width: ${playerHeight*16/9}px; height: ${playerHeight}px;"></iframe>
							  <img id="ttv_adEraser_loading" src="${getExtDir()}/IMG/ExtIcon-16.png" style="position: absolute; top: 18px; left: 32px;">
	`;
	if (element !== null){
		if(document.getElementById('ttvpeekplayerframe') === null)
			insertSiblingNodeBefore(frameWrapper,element);
		else if (frameURL !== document.getElementById('ttvpeekplayerframe').src){
			with(document.getElementById('ttvpeekplayerframe')){
				style.visibility = 'hidden';
				src = frameURL;
			}
		}
		document.getElementById('ttvpeekplayerframe').addEventListener('load', () =>{
			var frame = document.getElementById('ttvpeekplayerframe');
			with(frame){
				contentWindow.document.querySelector('.video-player__default-player').style.display = 'none';
				style.visibility = '';
				style.display = '';
			}
		});
	}
}

// add selected player features to the embedded stream player

var miniPlayerOverlayNonce;
async function ttvPlayerSetup(){
	let frame = this.contentWindow.document;
	this.style.visibility = "";
	await updateUserSettings();
	let userSettings = settings.userSettings;
	changePlayerHeadline(frame);
	ttvTheaterMode(frame);
	if (userSettings.enable_ttv_vplayer_pip && 'pictureInPictureEnabled' in document)
		ttvPipMode(frame);
	if(userSettings.enable_ttv_vplayer_compressor)
		ttvAudioCompressor(frame);
	with (frame.querySelector(".click-handler")){
		if(userSettings.enable_ttv_vplayer_click_play_pause)
			addEventListener('click', function(){handleTwitchPlayerClick(frame)},false);
		if(userSettings.enable_ttv_vplayer_mousewheel)
			addEventListener('wheel', function(evt){handleTwitchPlayerScroll(evt,frame)},false);
	}

	var miniPlayerOverlayNode = document.createElement('div');
	miniPlayerOverlayNode.setAttribute('id','ttvminiplayergui');
	miniPlayerOverlayNode.setAttribute('style','display: none;');
	miniPlayerOverlayNode.setAttribute('data-playing','true');
	miniPlayerOverlayNode.innerHTML = `<div class="tw-flex-shrink-0" style="float:right"><button class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-button-icon--overlay tw-core-button tw-core-button--overlay tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative" aria-label="Dismiss Mini Player"><span class="tw-button-icon__icon"><div style="width: 2rem; height: 2rem;"><div class="ScIconLayout-sc-1bgeryd-0 kbOjdP tw-icon"><div class="ScAspectRatio-sc-1sw3lwy-1 dNNaBC tw-aspect"><div class="ScAspectSpacer-sc-1sw3lwy-0 gkBhyN"></div><svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1bgeryd-1 cMQeyU"><g><path d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"></path></g></svg></div></div></div></span></button></div>
								<div class="tw-flex-shrink-0"><button class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-large tw-border-bottom-right-radius-large tw-border-top-left-radius-large tw-border-top-right-radius-large tw-button-icon tw-button-icon--large tw-button-icon--overlay tw-core-button tw-core-button--large tw-core-button--overlay tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative" data-test-selector="mini-overlay-play-pause-button" aria-label="Pause"><span class="tw-button-icon__icon"><div style="width: 2.4rem; height: 2.4rem;"><div class="ScIconLayout-sc-1bgeryd-0 kbOjdP tw-icon"><div class="ScAspectRatio-sc-1sw3lwy-1 dNNaBC tw-aspect"><div class="ScAspectSpacer-sc-1sw3lwy-0 gkBhyN"></div><svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1bgeryd-1 cMQeyU"><g><path d="M8 3H4v14h4V3zM16 3h-4v14h4V3z"></path></g></svg></div></div></div></span></button></div>
	`;
	
	miniPlayerOverlayNode.querySelectorAll('button')[0].addEventListener('click', () =>{
		document.getElementById('ttvplayerframe').style.visibility = 'hidden';
		frame.querySelector('video').pause();
	});

	miniPlayerOverlayNode.querySelectorAll('button')[1].addEventListener('click', () =>{
		let playPauseButton = miniPlayerOverlayNode.querySelectorAll('button')[1];
		with(frame){
			if (getElementById('ttvminiplayergui').getAttribute('data-playing') === 'false'){
				querySelector('video').play();
				getElementById('ttvminiplayergui').setAttribute('data-playing','true');
				playPauseButton.querySelector('svg').innerHTML = '<g><path d="M8 3H4v14h4V3zM16 3h-4v14h4V3z"></path></g>'
			}else{
				querySelector('video').pause();
				getElementById('ttvminiplayergui').setAttribute('data-playing','false');
				playPauseButton.querySelector('svg').innerHTML = '<g><path d="M5 17.066V2.934a.5.5 0 01.777-.416L17 10 5.777 17.482A.5.5 0 015 17.066z"></path></g>'
			}
		}
	});
	
	insertSiblingNodeAfter(miniPlayerOverlayNode,frame.querySelector('video'));

	this.addEventListener('mouseover', () =>{
		if(document.getElementById('ttvplayerframe').parentNode.parentNode.className.includes('persistent-player__border--mini')){
			frame.querySelector('.video-player__default-player').style.display = 'none';
			miniPlayerOverlayNode.style.display = '';
		}else{
			frame.querySelector('.video-player__default-player').style.display = '';
			miniPlayerOverlayNode.style.display = 'none';
		}
	});

	this.addEventListener('mouseleave', () =>{
		if(document.getElementById('ttvplayerframe').parentNode.parentNode.className.includes('persistent-player__border--mini')){
			var localNonce = miniPlayerOverlayNonce = new Object();
			setTimeout(() => {
				if(localNonce === miniPlayerOverlayNonce)
					miniPlayerOverlayNode.style.display = 'none';
			}, 500);
		}
	});

	with(frame.querySelector('video')){
		addEventListener('click', () =>{
			top.window.location = `https://twitch.tv/${(getUrlparams(frame.location)).channel}`;
		});
		style.cursor = 'pointer';
	}
	this.removeEventListener('load',ttvPlayerSetup,false);
}

// move the actual theater mode button from the main player to the html head

var theaterModeButton;
function ttvTheaterButtonMover(){
	let cloneButton = buttonNode => buttonNode.cloneNode(true);
	theaterButtonNode = top.window.document.querySelector('[data-a-target="player-theatre-mode-button"]').parentElement;
	theaterModeButton = cloneButton(theaterButtonNode);
	document.head.appendChild(window.parent.document.querySelector('[data-a-target="player-theatre-mode-button"]')).setAttribute('id','theaterModeButton');
}

// add a new theater mode button to the embedded stream player as well as the keyboard shortcut event handlers

function ttvTheaterMode(frame){
	function theaterModeButtonClicked(keyEvt=false){
		let tDoc = top.document;
		let ttvplayerframe = tDoc.getElementById('ttvplayerframe');
		with(ttvplayerframe){
			if(getAttribute('data-theaterMode') === 'false'){
				setAttribute('data-theaterMode','true');
				parentElement.classList.remove('video-player__container--resize-calc');
			}else{
				setAttribute('data-theaterMode','false');
				parentElement.classList.add('video-player__container--resize-calc');
			}
		}
		if(!keyEvt)
			tDoc.getElementById('theaterModeButton').click();
	}

	function keyEventHandler(evt){
		if (evt.target.nodeName === 'INPUT' || evt.target.nodeName === 'TEXTAREA') return;
		let contetnWindow = ttvplayerframe.contentWindow.document;
		if(evt.altKey && evt.key === 't'){
			theaterModeButtonClicked(true);
		}else if(evt.altKey && evt.key === 'x'){
			contetnWindow.querySelector('[data-a-target="player-clip-button"]').click();
		}else if(evt.key === ' ' || evt.key === 'k'){
			contetnWindow.querySelector('[data-a-target="player-play-pause-button"]').click();
		}else if(evt.key === 'f'){
			contetnWindow.querySelector('[data-a-target="player-fullscreen-button"]').click();
		}else if(evt.key === 'm'){
			contetnWindow.querySelector('[data-a-target="player-mute-unmute-button"]').click();
		}
	}

	function iFrameKeyEventHandler(evt){
		if(evt.altKey && evt.key === 't'){
			theaterModeButtonClicked();
		}
	}

	let fullScreenModeButton = frame.querySelector('[data-a-target="player-fullscreen-button"]');
	if(theaterModeButton === undefined) return;
	insertSiblingNodeBefore(theaterModeButton,fullScreenModeButton.parentNode);
	theaterModeButton.addEventListener('click', function(){theaterModeButtonClicked()}, true);
	top.document.getElementById('ttvplayerframe').contentWindow.document.addEventListener("keydown", iFrameKeyEventHandler,true);
	if(top.document.getElementById('ttvplayerframe').getAttribute('data-listening') === 'true') return;
	top.window.addEventListener("keydown", keyEventHandler,true);
	top.document.getElementById('ttvplayerframe').setAttribute('data-listening','true');
}

// change the location of the embedded stream player

function changeTwitchIframeLocation(details){
	let quality = localStorage["ttv_adEraser_embedQuality"] || "chunked";
	let twitchUrlTestPattern = new RegExp(/(.*)\/\/(www\.)?(twitch\.tv)\/(.*)$/, 'gmi');
	var frame = document.getElementById('ttvplayerframe');
	var urlObj;
	if(twitchUrlTestPattern.test(details.url))
		urlObj = twitchUrlObj(details.url);
	else if (details.tabId === 'reload')
		urlObj = true;
	else return
	if (!urlObj) return;
	frame.addEventListener('load', ttvPlayerSetup,false);
	chrome.runtime.sendMessage({call_method:'getTabId'}, tabId => {
		if(details.tabId !== tabId.tab && details.tabId !== 'reload') return
		if(details.url === window.location || details.tabId === 'reload'){
			frame.style.visibility = 'hidden';
			frame.contentWindow.location.reload();
			return;
		}
		frame.contentWindow.location.replace(`https://player.twitch.tv/?${urlObj.contentType}=${urlObj.contentId}&parent=www.twitch.tv&quality=${quality}`);
	});
}

// replace the normal stream player with an ad free embed player

function twitchAdBlock(){
	let quality = localStorage["ttv_adEraser_embedQuality"] || "chunked";
	let channelPlayer = document.querySelector('.video-player');
	if (channelPlayer === null) return;
	let urlObj = twitchUrlObj(window.location.href);
	if (!urlObj) return;
	document.querySelector('video').addEventListener('play', function(){
		this.volume = 0.0;
		this.pause();
		removeHTMLElement(this);
	});
	channelPlayer.outerHTML = `<iframe id='ttvplayerframe' class='video-player' src='https://player.twitch.tv/?${urlObj.contentType}=${urlObj.contentId}&parent=www.twitch.tv&quality=${quality}' data-a-target='video-player' data-a-player-type='site' data-test-selector='video-player__video-layout' data-theaterMode='false' data-listening='false' allowfullscreen='true' allow='autoplay' style="visibility: hidden"></iframe>`;
	let ttvplayerframe = document.getElementById('ttvplayerframe');
	ttvplayerframe.parentElement.classList.add('video-player__container--resize-calc');
	ttvplayerframe.addEventListener('load', ttvPlayerSetup,false);
	window.removeEventListener("load",twitchAdBlock);
}

// extract channel name as well as the content type from a twitch.tv url

function twitchUrlObj(url){
	let blockedTWKeywords = ['directory','create'];
	let twitchUrlPattern = new RegExp(/.*\/\/(www\.)?(twitch\.tv)\/(?<content_type>[a-zA-Z0-9]+)(?:\/)?(?<video_id>[0-9]+)?(?=\/)?/, 'gmi');
	let urlObj = twitchUrlPattern.exec(url)?.groups;
	let urlReturnObj = {};
	if (urlObj === null || blockedTWKeywords.includes(urlObj?.content_type)) return false;
	switch(urlObj.content_type){
		case 'videos':
			urlReturnObj.contentId = urlObj.video_id;
			urlReturnObj.contentType = 'video';
			break;
		default:
			urlReturnObj.contentId = urlObj.content_type;
			urlReturnObj.contentType = 'channel';
			break;
	}
	return urlReturnObj;
}

// change the text of the live indicator on the embed stream and add a reload frame button

async function changePlayerHeadline(element){
	const sleep = m => new Promise(r => setTimeout(r, m));
	var startTime = new Date().getTime();
	var liveElement;
	var liveElementText;
	do{
		await sleep(500);
		if (startTime + 20000 < new Date().getTime()) break;
		liveElement = element.querySelector(".tw-channel-status-text-indicator--live");
		if (liveElement === null) continue;
		liveElementText = liveElement.querySelector("p");
	}while(liveElement === null || liveElementText === null)
	if (liveElement === null || liveElementText === null) return;
	let reloadElement = liveElement.parentNode.appendChild(document.createElement('div'));
	reloadElement.addEventListener('click', function(){changeTwitchIframeLocation({tabId:'reload'})}, false);
	reloadElement.innerText = '♻';
	reloadElement.title = 'Click to reload video player';
	reloadElement.setAttribute('style','display:inline-block; cursor:pointer; padding: 0 6px 0 6px; margin: 0 0 0 10px; background-color: #00b52d; border-radius: 20em; font-size: 14pt; vertical-align: middle');
	liveElement.style.backgroundColor = "#9147ff";
	liveElementText.innerText = "LIVE & Ad-Free 🔴";
	removeHTMLElement(element.querySelector('[data-a-target="player-twitch-logo-button"]'));
	removeHTMLElement(element.querySelector(".stream-info-social-panel"));
	removeHTMLElement(element.querySelector(".tw-card"));
}

// handle scroll events on the embed player to change the stream volume

function handleTwitchPlayerScroll(evt,element){
	evt.preventDefault();
	
	let volumeSlider = element.querySelector('[data-a-target="player-volume-slider"]');
	let vsEvt = document.createEvent("Events");

	let modifier = -0.00015;
	let videoElement = element.querySelector('video');

	if(videoElement.volume + evt.deltaY * modifier > 1) videoElement.volume = 1;
	else if (videoElement.volume + evt.deltaY * modifier < 0) videoElement.volume = 0;
	else videoElement.volume = videoElement.volume + evt.deltaY * modifier;

	volumeSlider.value = videoElement.volume;
	vsEvt.initEvent("change", true, true);
	volumeSlider.dispatchEvent(vsEvt);
}

// handle click events on the embed player to play/pause the stream

let clickHandlerNonce;
async function handleTwitchPlayerClick(element){
	let videoElement = element.querySelector('video');
	const local = clickHandlerNonce = new Object();
	var isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	setTimeout(() => {
		let localIsFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		if(local === clickHandlerNonce && window.innerHeight !== screen.height && isFullScreen === localIsFullScreen)
			videoElement.pause();
	}, 400);
}

// add the picture in picture mode button to the embed player and implement the functionality

function ttvPipMode(frame){
	const pip_off = 'M22 30c-1.9 1.9-2 3.3-2 34s.1 32.1 2 34c1.9 1.9 3.3 2 42 2s40.1-.1 42-2c1.9-1.9 2-3.3 2-34 0-31.6 0-31.9-2.2-34-2.1-1.9-3.3-2-42-2-38.5 0-39.9.1-41.8 2zm78 34v28H28V36h72v28z';
	const pip_on = 'M60 72v12h32V60H60v12z';
	
	var anchor = frame.querySelector('[data-a-target="player-theatre-mode-button"]');
	var pipButton = anchor.parentElement.cloneNode(true);
	var videoElement = frame.querySelector('video');

	insertSiblingNodeBefore(pipButton, anchor.parentNode);
	
	with(pipButton){
		querySelector(".tw-tooltip").innerText = 'Picture in Picture';
		querySelector("svg").setAttribute("viewBox", "0 0 128 128");
		querySelector("svg").setAttribute('transform','scale(1.3)');
		querySelector("svg").className = 'tw-icon__svg';
		querySelector("g").innerHTML = `<path d="${pip_off}"></path><path d="${pip_on}"></path>`;
		setAttribute("data-active", 'false');
	}

	async function enablePip(){
		const active = pipButton.getAttribute('data-active');
		function enableElements(){
			with(pipButton){
				querySelector("g").lastChild.style.display = 'none';
				setAttribute('data-active', 'true');
			}
		}
		function disableElements(){
			with(pipButton){
				querySelector("g").lastChild.style.display = '';
				setAttribute('data-active', 'false');
			}
		}
		if (active === 'false') {
			enableElements();
			try{
				await videoElement.requestPictureInPicture();
				videoElement.addEventListener('leavepictureinpicture', disableElements, false);
			}catch(e){disableElements();}
		}else{
			disableElements();
			try{
				await frame.exitPictureInPicture();
			}catch(e){enableElements();}
		}
	}
	pipButton.addEventListener('click', enablePip,false);
}

// add the audio compressor toggle to the embed player and implement the functionality

function ttvAudioCompressor(frame){
	const compressor_off = 'M850 202.3C877.7 202.3 900 224.6 900 252.3V745.5C900 773.2 877.7 795.5 850 795.5S800 773.2 800 745.5V252.3C800 224.6 822.3 202.3 850 202.3ZM570 167.8C597.7 167.8 620 190.1 620 217.8V780C620 807.7 597.7 830 570 830S520 807.7 520 780V217.8C520 190.1 542.3 167.8 570 167.8ZM710 264.4C737.7 264.4 760 286.7 760 314.4V683.3C760 711 737.7 733.3 710 733.3S660 711 660 683.3V314.4C660 286.7 682.3 264.4 710 264.4ZM430 98.1C457.7 98.1 480 120.4 480 148.1V849.6C480 877.3 457.7 899.6 430 899.6S380 877.3 380 849.6V148.1C380 120.4 402.3 98.1 430 98.1ZM290 217.2C317.7 217.2 340 239.5 340 267.2V730.5C340 758.2 317.7 780.5 290 780.5S240 758.2 240 730.5V267.2C240 239.5 262.3 217.2 290 217.2ZM150 299.6C177.7 299.6 200 321.9 200 349.6V648.1C200 675.8 177.7 698.1 150 698.1S100 675.8 100 648.1V349.6C100 321.9 122.3 299.6 150 299.6Z';
	const compressor_on = 'M850 200C877.7 200 900 222.3 900 250V750C900 777.7 877.7 800 850 800S800 777.7 800 750V250C800 222.3 822.3 200 850 200ZM570 250C597.7 250 620 272.3 620 300V700C620 727.7 597.7 750 570 750S520 727.7 520 700V300C520 272.3 542.3 250 570 250ZM710 225C737.7 225 760 247.3 760 275V725C760 752.7 737.7 775 710 775S660 752.7 660 725V275C660 247.3 682.3 225 710 225ZM430 250C457.7 250 480 272.3 480 300V700C480 727.7 457.7 750 430 750S380 727.7 380 700V300C380 272.3 402.3 250 430 250ZM290 225C317.7 225 340 247.3 340 275V725C340 752.7 317.7 775 290 775S240 752.7 240 725V275C240 247.3 262.3 225 290 225ZM150 200C177.7 200 200 222.3 200 250V750C200 777.7 177.7 800 150 800S100 777.7 100 750V250C100 222.3 122.3 200 150 200Z';

	let muteButton = frame.querySelector('[data-a-target="player-play-pause-button"]');
	var compressorButton = muteButton.parentElement.cloneNode(true);

	insertSiblingNodeAfter(compressorButton, muteButton.parentNode);

	with(compressorButton){
		querySelector(".tw-tooltip").innerText = 'Audio Compressor';
		querySelector("svg").setAttribute("viewBox", "0 0 1000 1000");
		querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_off}" clip-rule="evenodd"></path>`;
		setAttribute("data-active", 'false');
	}

	let video = frame.querySelector('video');
	video.context = new AudioContext();
	video.source = video.context.createMediaElementSource(video);
	video.compressor = video.context.createDynamicsCompressor();

	// default values from FFZ
	with(video.compressor){
		threshold.setValueAtTime(-50, video.context.currentTime);
		knee.setValueAtTime(40, video.context.currentTime);
		ratio.setValueAtTime(12, video.context.currentTime);
		attack.setValueAtTime(0, video.context.currentTime);
		release.setValueAtTime(0.25, video.context.currentTime);
	}
	video.source.connect(video.context.destination);

	function enableCompressor(){
		const active = compressorButton.getAttribute('data-active');
		if (active === 'false') {
			with(compressorButton){
				querySelector(".tw-tooltip").innerText = 'Disable Audio Compressor';
				querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_on}" clip-rule="evenodd"></path>`;
				setAttribute('data-active', 'true');
			}
			video.source.disconnect(video.context.destination);
			video.source.connect(video.compressor);
			video.compressor.connect(video.context.destination);
		} else if (active === 'true') {
			with(compressorButton){
				querySelector(".tw-tooltip").innerText = 'Audio Compressor';
				querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_off}" clip-rule="evenodd"></path>`;
				setAttribute('data-active', 'false');
			}
			video.compressor.disconnect(video.context.destination);
			video.source.disconnect(video.compressor);
			video.source.connect(video.context.destination);
		}
		localStorage.setItem("ttv_adEraser_disableCompressor", active);
	}
	compressorButton.addEventListener('click', enableCompressor,false);
	if (localStorage.getItem("ttv_adEraser_disableCompressor") === 'false') enableCompressor();
}