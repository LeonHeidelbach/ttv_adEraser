//------------------------------------------------------------------------------------------------//
// 	helper methods
//------------------------------------------------------------------------------------------------//
//  hlp.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//

// popup settings items

let valueSettingsItems = ['ttv_peek_player_size||240'];
let booleanSettingsItems = ['enable_ttv_adEraser','enable_ttv_vplayer_settings','enable_ttv_peek_player','enable_ttv_vplayer_mousewheel','enable_ttv_vplayer_click_play_pause','enable_ttv_vplayer_compressor','enable_ttv_vplayer_pip'];

// retrieve user settings from background and popup script

async function retrieveuserSettingsInit(result){
    if (result ===  undefined)
        result = await getStorageItem('userSettings','sync');
        
    // create default settings object if it does not exist in chrome storage
	if(result.userSettings === undefined){
		let userSettings = {
			lastPanel: 'ttv_adEraser_hub'
        }
        booleanSettingsItems.forEach(id => {
            if (userSettings[id] === undefined)
                userSettings[id] = true;
        });
		setStorageItem({userSettings: userSettings},'sync');
	}
}

// send runtime messages

function sendRuntimeMessage(call_method,pld,callback){
	if (pld === undefined) chrome.runtime.sendMessage({call_method: call_method})
	else chrome.runtime.sendMessage({call_method: call_method, payload: pld});
	if (callback !== undefined) callback();
}

// script communication trough the chrome messages api

async function sendRuntimeMessagetoContent(call_method,pld,tabId){
    try{
        tabId = (tabId === undefined ? (await getCurrentTab()).id : tabId);
        if (pld === undefined)chrome.tabs.sendMessage(tabId, {call_method: call_method});
        else chrome.tabs.sendMessage(tabId, {call_method: call_method, payload: pld});
    }catch(e){}
}

// remove HTML element from DOM

function removeHTMLElement(element) {
	if (element !== null)
		element && element.parentNode && element.parentNode.removeChild(element);
}

// get current tab url from popup

async function getCurrentTab(){
    return new Promise(function(resolve){
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            resolve(tabs[0]);
        });
    });
}

// set the content of the popup panel

function setPanelContent(content){
	document.body.innerHTML = content;
}

// insert a new node before a reference node

function insertSiblingNodeBefore(newNode, referenceNode){
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

// insert a new node after a reference node

function insertSiblingNodeAfter(newNode, referenceNode){
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// collapse popup sections

function collapseSection(element,collapseHeight) {
	var sectionHeight = element.scrollHeight;
	var elementTransition = element.style.transition;
	element.style.transition = '';
	requestAnimationFrame(()=>{
		element.style.height = `${sectionHeight}px`;
		element.style.transition = elementTransition;
		requestAnimationFrame(()=>{
			element.style.height = `${collapseHeight}px`;
		});
	});
	element.setAttribute('data-collapsed', 'true');
}

// expand collapsed sections

function expandSection(element) {
	var sectionHeight = element.scrollHeight;
	element.style.height = `${sectionHeight}px`;
	element.addEventListener('transitionend', function(e) {
		element.removeEventListener('transitionend', arguments.callee);
		element.style.height = null;
	});
	element.setAttribute('data-collapsed', 'false');
}

// receive data from chrome storage api

function getStorageItem(items=[],api='local',callback){
    if (items === undefined) return;
    function storageItemReceived(result,resolve){
        if(callback !== undefined) callback(result);
        else resolve(result);
    }
    return new Promise(function(resolve) {
        if (api === 'local')
            chrome.storage.local.get(items,function(result) {
                storageItemReceived(result,resolve);
            });
        else if(api === 'sync')
            chrome.storage.sync.get(items,function(result) {
                storageItemReceived(result,resolve);
            });
    });
}

// store data in chrome storage api

async function setStorageItem(item,api='local',callback){
    async function setItem(item,api='local'){
        if (item === undefined) return;
        return new Promise(function(resolve) {
            if (api === 'local')
                chrome.storage.local.set(item,function() {
                    resolve(result);
                });
            else if(api === 'sync')
                chrome.storage.sync.set(item,function() {
                    resolve();
                });
        });
    }
    var itemKeys = Object.keys(item);
    var itemExists;
    for(let i=0;i<itemKeys.length; i++){
        itemExists = await getStorageItem(itemKeys[i],api);
        if (itemExists[itemKeys[i]] !== undefined && itemExists[itemKeys[i]].constructor === Object && item[itemKeys[i]].constructor === Object)
            item[itemKeys[i]] = mergeNestedObjs(itemExists[itemKeys[i]],item[itemKeys[i]]);
    }
    await setItem(item,api);
    if(callback !== undefined) callback();
    else return;
}

// merge nested json type objects including arrays

function mergeNestedObjs(baseObj,updateObj){
    function listAppender(baseObj,value,key){
        if (Object.keys(baseObj).includes(key) && Array.isArray(baseObj[key])){
            var result = [];
            let baseObjMaxIndex = baseObj[key].length;
            let valueObjMaxIndex = value.length;
            let indexLen = (baseObjMaxIndex >= valueObjMaxIndex ? baseObjMaxIndex : valueObjMaxIndex);
            for (let i=0;i<indexLen;i++){
                try{
                    item = baseObj[key][i];
                }catch(e){
                    item = undefined;
                }
                try{
                    if (!result.includes(item) && !result.includes(value[i])){
                        if (item.constructor === Object && value[i].constructor === Object)
                            result.push(updateObjKeys(item, value[i]));
                        else if (Array.isArray(item) && Array.isArray(value[i]))
                            result.push(listAppender(baseObj,value,key));
                        else{
                            if (item !== undefined && item !== value[i])
                                result.push(item);
                            if (value[i] !== undefined)
                                result.push(value[i]);
                        }
                    }
                }catch(e){}
            }
            return result;
        }else return value;
    }
    Object.keys(updateObj).forEach(function(key){
        let value = updateObj[key];
        if (value.constructor === Object)
            baseObj[key] = updateObjKeys((baseObj[key] !== undefined ? baseObj[key] : {}), value);
        else if(Array.isArray(value))
            baseObj[key] = listAppender(baseObj,value,key);
        else
            baseObj[key] = value;
    });
    return baseObj;
}

// enable/disable loading indicator

async function loadingIndicator(enabled,element){
	if(element === undefined)
		element = document.body;
	if(enabled){
        let loading = `
            <div class="centered loadingIndicatorRound">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `
		let barrier = element.appendChild(document.createElement('div'));
		barrier.setAttribute('id','ldb');
        barrier.setAttribute('class','centered loadingBarrier');
        barrier.setAttribute('style','left: 45%; top: 55%;');
        barrier.innerHTML = loading;
    }else{
        removeHTMLElement(document.getElementById('ldb'));
    }
}

// method to wait for one or multiple html elements by selector (accepts selector arrays and strings)

function awaitHtmlElement(selector,timeOut,callback){
	if (timeOut !== undefined && timeOut !== 'inf')
		var timeStamp = new Date().getTime();
	return new Promise((resolve, reject) => {
		new MutationObserver((mutationRecords, observer) => {
			if(timeOut !== undefined && timeOut !== 'inf'){
				let currentTime = new Date().getTime();
				if(timeStamp + timeOut < currentTime){
					observer.disconnect();
					resolve(false);
					return;
				}			
			}
			if(Array.isArray(selector)){
				while(document.querySelector(selector[0]) !== null && selector.length > 0)
					selector.shift();
				if(selector.length > 0) return;
			}else
				if(document.querySelector(selector) === null) return;
			if (callback !== undefined) callback();
			observer.disconnect();
			resolve(true);
		})
		.observe(document.documentElement, {
			childList: true
			, subtree: true
			, attributes: false
			, characterData: false
		});
	});
}

// get the extensions absolut install directory

function getExtDir(filePath,callback){
	let extPath = chrome.runtime.getURL(filePath);
	if (callback !== undefined) callback(extPath);
	else return extPath;
}

// get url parameter object

function getUrlparams(url){
    var getParam = {};
    url.search.substr(1).split("&").forEach(function(item){getParam[item.split("=")[0]] = item.split("=")[1]})
    return getParam;
}