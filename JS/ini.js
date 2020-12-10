//------------------------------------------------------------------------------------------------//
// 	popup initialization
//------------------------------------------------------------------------------------------------//
//  ini.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//

// load the panel content into the popup after the html file has loaded

document.addEventListener('DOMContentLoaded',function(){
	panelInitializer();
},false);

// popup script message receiver

chrome.runtime.onMessage.addListener(
	function(request,sender,senderResponse){
		switch (request.call_method){
			default:
				break;
		}
	}
);

// initializes app panels from content variables in res.js

function panelInitializer(callback){
	function init(result){
		retrieveuserSettingsInit(result);
		if(result.userSettings !== undefined){
			document.body.innerHTML = '';
			document.body.setAttribute('id','ttv_adEraser_hub');
		}else{
			document.body.setAttribute('id',result.userSettings.lastPanel)
		}
		switch(document.body.id){
			case 'ttv_adEraser_hub':
				ttv_adEraser_hub_init();
				break;
		}
		if (callback !== undefined)
			callback();
	}
	getStorageItem('userSettings','sync', init);
}

// HUB EVENT LISTENERS
// switch listeners - Hub
function addHubSwitchListeners(){

}

// input field listeners - Hub
function addHubInputFieldEventListeners(){
	document.getElementById('ttv_peek_player_size').addEventListener('change', ttv_peek_player_size_changed, false);
}

// button listeners - Hub
function addHubButtonEventListeners(){
	// collapse sub categories
	let collapsibleSubCategories = [];
	collapsibleSubCategories = Array.prototype.concat.apply(collapsibleSubCategories, document.querySelectorAll('.table.checkered .table.head'));
	collapsibleSubCategories.forEach(node => {
		node.addEventListener('click', collapseSubCategorie, false);
	});

	// button actions
	document.getElementById('enable_ttv_adEraser').addEventListener('click', enable_ttv_adEraser_clicked, false);
	document.getElementById('ttv_settings_collapse').parentNode.addEventListener('click', ttv_settings_collapse_clicked, false);
	document.getElementById('enable_ttv_vplayer_settings').addEventListener('click', enable_ttv_vplayer_settings_clicked, false);
	document.getElementById('enable_ttv_peek_player').addEventListener('click', enable_ttv_peek_player_clicked, false);
	document.getElementById('enable_ttv_vplayer_mousewheel').addEventListener('click', enable_ttv_vplayer_mousewheel_clicked, false);
	document.getElementById('enable_ttv_vplayer_click_play_pause').addEventListener('click', enable_ttv_vplayer_click_play_pause_clicked, false);
	document.getElementById('enable_ttv_vplayer_compressor').addEventListener('click', enable_ttv_vplayer_compressor_clicked, false);
	document.getElementById('enable_ttv_vplayer_pip').addEventListener('click', enable_ttv_vplayer_pip_clicked, false);
}

// drag & drop listeners - Hub
function addHubDragDropEventListeners(){

}

// checkBox listeners - Hub
function addHubCheckBoxListeners(){

}

// scroll Action listeners - Hub
function addHubScrollListeners(){

}