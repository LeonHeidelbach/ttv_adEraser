//------------------------------------------------------------------------------------------------//
// popup resources
//------------------------------------------------------------------------------------------------//
//  res.js
//  TTV AdEraser Chrome-Extension
//
//  Created by Leon Heidelbach on 21.11.2020.
//  Copyright © 2020 Leon Heidelbach.
//
//------------------------------------------------------------------------------------------------//


// main extension hub content

var ttv_adEraser_hub = `
	<div style="height: auto; width: 300px; overflow-y: auto;">
		<div style="position:absolute; top: 0; left: 0; width: 100%; z-index: 0; height: 50px; background-color: #1f2224; border-bottom: 1px solid #b4b4b4">
			<div class="table" style="width:100%">
				<div>
					<div style="position: fixed; transform: scale(0.25); top: -40px; left: -35px; padding: 0; margin: 0;">
						<img src="/IMG/Exticon-128.png">
					</div>
					<div style="vertical-align: middle;">
						<h3 style="color: #FFFFFF; width: 95%; text-align: right;">TTV AdEraser</h3>
					</div>
					<div style="vertical-align: middle;">
						<span id="vNr" style="float:right; color: #ffffff; font-size: 10pt; font-weight: bold; background-color: #9147ff; border: 1px solid #b4b4b4; border-radius: 20px; padding: 2px 5px 2px 5px;"></span>
					</div>
				</div>
			</div>
		</div>

		<div class="elementContainer vcentered" style="margin-top: 52px;; overflow: hidden;">
			<div class="table" style="width:100%; margin: 0; padding:0">
				<div>
					<div style="padding: 0 0 0 5px; vertical-align: middle;">
						<h3 style="color: #FFFFFF; margin: 0; font-size: 11pt;">Enable TTV AdEraser</h3>
					</div>
					<div style="padding: 0; vertical-align: middle;">
						<label class="switch" style="float:right;">
							<input id="enable_ttv_adEraser" type="checkbox">
							<span></span>
						</label>
					</div>
				</div>
			</div>
		</div>

		<div class="elementContainer" data-ct-type="stct" data-collapsed="true" style="margin-top: 5px; height: 24px; overflow: hidden;">
			<div class="table" style="width:100%;">
				<div role="button">
					<div id="ttv_settings_collapse" style="padding: 0 0 0 5px;">
						<h3 style="color: #FFFFFF; margin: 0 2px 5px 0; font-size: 13pt; display: inline-block;">Settings</h3>
						<i class="collapse_icn" style="vertical-align: middle; margin: 5px 0 0 5px"></i>
					</div>
					<div style="padding: 0 0 10px 0; vertical-align: middle;">
						<label class="switch" style="float:right;">
							<input id="enable_ttv_vplayer_settings" type="checkbox">
							<span></span>
						</label>
					</div>
				</div>
			</div>

			<div class="subCategoryContainer" style="border-radius: 10px; overflow: hidden; width: 110%; height: 33px;">	
				<div class="table checkered" style="padding: 0 0 2.5px 0; width: 91%;">
					<div class="table head rounded" role="button">
						<div style="padding: 0 0 0 7px;">
							<h3 style="color: #ffffff; font-size: 10pt; padding: 0; margin: 8px 0 8px 5px;">UI Options</h3>
						</div>
					</div>
					<div class="table body" style="display: block; max-height: 100px; width:102.5%; overflow-y: scroll;">
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Hover over a channel icon in the side bar to peek into the stream. Use your mouse wheel to change the volume.</span>
								<label for="ttv_peek_player_size" style="display:inline-block; color: #ffffff; font-size: 9pt;">Size: </label>
								<input id="ttv_peek_player_size" type="range" min="160" max="1080" step="10" style="width: 80%; margin: 20px 0 0 10px;">
							</div>
							<div style="padding: 0 0 0 15px">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_peek_player" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="subCategoryContainer" style="border-radius: 10px; overflow: hidden; width: 110%; height: 33px;">
				<div class="table checkered" style="padding: 2.5px 0 0 0; width: 91%;">
					<div class="table head rounded" role="button">
						<div style="padding: 0 0 0 7px;">
							<h3 style="color: #ffffff; font-size: 10pt; padding: 0; margin: 8px 0 8px 5px;">Player Options</h3>
						</div>
					</div>
					<div class="table body" style="display: block; max-height: 100px; width:102.5%; overflow-y: scroll;">
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Show mini ad player when an ad break starts and hide it when it is over.</span>
							</div>
							<div style="padding: 0 0 0 15px">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_miniAdPlayer" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Use the mouse wheel on the video player to change the volume.</span>
							</div>
							<div style="padding: 0 0 0 15px">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_vplayer_mousewheel" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Click on the video player to play/pause playback.</span>
							</div>
							<div style="padding: 0">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_vplayer_click_play_pause" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Show audio compressor toggle in video player. ${(browser.toLowerCase().includes('firefox') ? '<span style="color: #9147ff">(chromium browsers only)</span>' : '')}</span>
							</div>
							<div style="padding: 0">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_vplayer_compressor" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
						<div>
							<div style="padding: 10px 0 10px 7px;">
								<span style="color: #ffffff; font-size: 9pt;">Show picture in picture mode toggle in video player. ${(browser.toLowerCase().includes('firefox') ? '<span style="color: #9147ff">(chromium browsers only)</span>' : '')}</span>
							</div>
							<div style="padding: 0">
								<label class="switch" style="float:right;">
									<input id="enable_ttv_vplayer_pip" type="checkbox">
									<span></span>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="elementContainer" style="margin-top: 5px;">
			<div class="vcentered" style="padding: 2px 0 10px 0;">
				<span style="color: #ffffff; font-size: 9pt; text-align: justify;">This extension can be used completely free of charge. However, if you like it and feel generous you can buy me a coffee. 😄</span>
			</div>
			<div style="padding: 0 0 10px 0;">
				<span style="color: #ffffff; font-size: 9pt; text-align: left; margin: 10px 0 0 0;">The source code is available on <a href="https://github.com/LeonHeidelbach/ttv_adEraser" target="_blank">GitHub</a>.</span>
			</div>
			<a href="https://www.paypal.com/donate/?hosted_button_id=MWGYXMSZ7H2B2" target="_blank" role="button" class="buttonBG vcentered" style="padding: 5px 10px 5px 10px;">
				<span style="color: #FFFFFF; font-size: 10pt;">Buy the dev a coffee ☕</span>
			</a
		</div>
	</div>
`
