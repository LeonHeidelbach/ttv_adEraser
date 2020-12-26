//------------------------------------------------------------------------------------------------//
//  hub script
//------------------------------------------------------------------------------------------------//
//  hub.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//

// initialization method for the main hub panel

function ttv_adEraser_hub_init(){
	loadingIndicator(true);
	setPanelContent(ttv_adEraser_hub);
	document.getElementById('vNr').innerText = "v." + chrome.runtime.getManifest().version
	applyUserSettings();
	addHubButtonEventListeners();
	addHubInputFieldEventListeners();
	loadingIndicator(false);
}

// load user settings from chrome storage and apply them to the popup ui

async function applyUserSettings(){
	let userSettings = (await getStorageItem('userSettings','sync')).userSettings;
	valueSettingsItems.forEach((item) =>{
		let itemArr = item.split('||')
		document.getElementById(itemArr[0]).value = (userSettings[itemArr[0]] !== undefined ? userSettings[itemArr[0]] : itemArr[1]);
	});
	booleanSettingsItems.forEach((id,index) => {
		let element = document.getElementById(id);
		let userSettingsValue = true;
		if (userSettings[id] === undefined){ 
			if(browser.toLowerCase().includes('firefox') && onlyChromium.includes(id) || disabledBooleanSettingsItems.includes(id)) userSettingsValue = false;
			changeUserSetting(id, userSettingsValue);
			userSettings[id] = userSettingsValue;
		}
		element.nextElementSibling.className = 'slider round';
		element.checked =  userSettings[id];
		if(userSettings.enable_ttv_adEraser !== undefined && !userSettings.enable_ttv_adEraser && index > 0 || userSettings.enable_ttv_adEraser !== undefined &&  !userSettings.enable_ttv_vplayer_settings && index > 1 || browser.toLowerCase().includes('firefox') && onlyChromium.includes(id))
			element.disabled = true;
	});
	const index = booleanSettingsItems.indexOf("enable_ttv_adEraser");
	if (index > -1) booleanSettingsItems.splice(index, 1);
}

// handle sub category auto collapse if a sub category is clicked

async function collapseSubCategorie(){
	let collapsibleSubCategories = [];
	collapsibleSubCategories = Array.prototype.concat.apply(collapsibleSubCategories, document.querySelectorAll('.table.checkered .table.head'));
	collapsibleSubCategories.forEach(node => {
		if(!node.className.includes('rounded') && node !== this)
			node.click();
	});
	if(this.className.includes('rounded')){
		this.classList.remove('rounded');
		expandSection(this.parentNode.parentNode);
	}else{
		this.classList.add('rounded');
		collapseSection(this.parentNode.parentNode, 33);
	}
}

// extension enable/disable switch event handler method

async function enable_ttv_adEraser_clicked(){
	booleanSettingsItems.forEach(item =>{
		let element = document.getElementById(item);
		if (this.checked) element.disabled = false;
		else element.disabled = true;
	});
	await checkBoxValueSwitcher(this.id);
	sendRuntimeMessage('reloadAllttvTabs');
}

// settings category collapse/expand event handler method

function ttv_settings_collapse_clicked(evt){
	if (evt.target.tagName === 'SPAN' || evt.target.tagName === 'INPUT') return;
	let container = document.querySelector('[data-ct-type=stct]');
	if (container.style.height !== "24px"){
		collapseSection(container,24);
		this.querySelector('.collapse_icn').style.margin = '5px 0 0 5px';
		this.querySelector('.collapse_icn').classList.remove('rotate');
	} else{
		expandSection(container);
		this.querySelector('.collapse_icn').style.margin = '-5px 0 0 5px';
		this.querySelector('.collapse_icn').classList.add('rotate');
	}
}

// all player settings enable/disable switch event handler method

async function enable_ttv_vplayer_settings_clicked(){
	var mainSwitch = this;
	booleanSettingsItems.forEach(id => {
		let element = document.getElementById(id);
		if(!mainSwitch.checked && mainSwitch.id !== id) {
			element.disabled = true;
			element.checked = false;
		}else if (mainSwitch.checked && mainSwitch.id !== id){
			element.disabled = false;
			element.checked = true;
		}
	});
	sendRuntimeMessage('reloadAllttvTabs',{iframeOnly: true});
	await checkBoxValueSwitcher(booleanSettingsItems,this.checked);
}

// peek player enable/disable switch event handler method

async function enable_ttv_peek_player_clicked(){
	let previewCard = document.querySelector('#enable_ttv_peek_previewCard');
	if(this.checked) previewCard.disabled = false;
	else previewCard.disabled = true;
	await checkBoxValueSwitcher(this.id);
}

// peek preview card enable/disable switch event handler method

async function enable_ttv_peek_previewCard_clicked(){
	await checkBoxValueSwitcher(this.id);
}

// peek player size input range event handler method

async function ttv_peek_player_size_changed(){
	await changeUserSetting(this.id,this.value);
}

// show mini ad player enable/disable switch event handler method

async function enable_ttv_miniAdPlayer_clicked(){
	await checkBoxValueSwitcher(this.id);
}

// player volume scroll enable/disable switch event handler method

async function enable_ttv_vplayer_mousewheel_clicked(){
	sendRuntimeMessage('reloadAllttvTabs',{iframeOnly: true});
	await checkBoxValueSwitcher(this.id);
}

// player play/pause enable/disable switch event handler method

async function enable_ttv_vplayer_click_play_pause_clicked(){
	sendRuntimeMessage('reloadAllttvTabs',{iframeOnly: true});
	await checkBoxValueSwitcher(this.id);
}

// player compressor toggle enable/disable switch event handler method

async function enable_ttv_vplayer_compressor_clicked(){
	sendRuntimeMessage('reloadAllttvTabs',{iframeOnly: true});
	await checkBoxValueSwitcher(this.id);
}

// player picture in picture mode toggle enable/disable switch event handler method

async function enable_ttv_vplayer_pip_clicked(){
	sendRuntimeMessage('reloadAllttvTabs',{iframeOnly: true});
	await checkBoxValueSwitcher(this.id);
}

// generalized checkbox value switch & store in chrome storage api method

async function checkBoxValueSwitcher(dataEntry,mainSwitchBool){
	function setValues(value){
		if(Array.isArray(dataEntry))
			dataEntry.forEach(function(key){
				settings.userSettings[key] = value;
			});
		else settings.userSettings[dataEntry] = value;
	}
	let settings = await getStorageItem('userSettings','sync');
	if(settings === undefined || settings.userSettings[dataEntry] === undefined || settings.userSettings[dataEntry])
		setValues((mainSwitchBool !== undefined ? mainSwitchBool : false))
	else setValues((mainSwitchBool !== undefined ? mainSwitchBool : true));
	await setStorageItem(settings,'sync');
}

// generalized userSettings item value change method

async function changeUserSetting(dataEntry,dataValue){
	let settings = await getStorageItem('userSettings','sync');
	settings.userSettings[dataEntry] = dataValue;
	await setStorageItem(settings,'sync');
}