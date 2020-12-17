# ![TTV adEraser](/IMG/ExtIcon-48.png) TTV adEraser

**Tested with uBlock origin and bttv installed**

**TTV AdEraser** aims to remove **livestream ads** as well as **add some useful features** to our favourite streaming site :-).

I will try to maintain this project as well as possible and if you have any feature requests or would like to report bugs, feel free to let me know by opening up a new issue.

At the moment the **extension** and all its features **have been tested** on [Google Chrome](https://www.google.com/chrome/) and [Firefox](https://www.mozilla.org/en-US/firefox/new/) (dev_build). Support for **other browsers** might be added in the future if requested.

- [Extension Settings](#extension-settings)
- [Google Chrome](#google-chrome)
- [Mozilla Firefox](#mozilla-firefox)
- [Additional information](#additional-information)
- [Changelog](#changelog)

## Extension Settings

With TTV adEraser you can choose between a variety of different usability options. By default all options will be enabled.

![TTV adEraser settings](/IMG/ttv_adEraser_chrome_settings_popup_1.png)


## Google Chrome

TTV AdEraser is now available on the Chrome Web Store. You can install it by following this URL: https://chrome.google.com/webstore/detail/ttv-aderaser/pjnopimdnmhiaanhjfficogijajbhjnc

If you would still like to install the extension manually simply follow these instructions:

1. Download the ZIP file containing all resources for the extension from the folllowing URL: https://github.com/LeonHeidelbach/ttv_adEraser/archive/main.zip
2. If you would like to try out the [dev_build](https://github.com/LeonHeidelbach/ttv_adEraser/tree/dev_build) version of the extension with all the latest features use this download URL and follow the same steps: https://github.com/LeonHeidelbach/ttv_adEraser/archive/dev_build.zip 
3. Unzip the file contents into a new folder.
4. Open **Google Chrome**, type `"chrome://extensions"` into the URL bar and navigate to the installed extensions overview page.
5. In the top right corner of the installed extensions overview page, enable **"Developer mode"**.
6. Then click **"Load unpacked"** in the top left corner.
7. A file dialog prompt will open up. Navigate to the folder where you extracted the extension's resource files and select it.

The extension should now be installed and show up in the installed extensions overview! Now you can enjoy an ad free live stream experience.

**IMPORTANT**

 **Do not delete the extension folder** or it will be removed from **Google Chrome**.

## Mozilla Firefox

There is currently a dev_build version of the extension in the [dev_build](https://github.com/LeonHeidelbach/ttv_adEraser/tree/dev_build) branch. If you want to install the extension on the standard Firefox you will have to follow these steps:

1. Delete the manifest.json file in the downloaded folder
2. Rename the manifest_firefox.json file to manifest.json
3. Add the extension as a temporary addon by navigating to `"about:debugging"`
4. Click on `"This Firefox"` and `"Load Temporary Add-on..."`
5. Navigate to the folder where the extension is saved and double click on any file inside of the folder to import the addon

Unfortunately you will have to do this each time you restart firefox or download the Firefox Developer Edition. If you have the Firefox Developer Edition or Firefox Nightly installed, you can install the extension permanently by following these steps:

1. Navigate to `"about:config"`
2. Type `"xpinstall.signatures.required"` into the text field that shows up and set the value to `"false"`
3. Navigate to `"about:addons"`
4. Click on the little cog wheel icon and `"Install Addon from file..."`
5. Select the folder and you are done

This way you will not have to reinstall the extension each time you restart your browser.

Keep in mind though that this is still a development build so you might encounter a couple of bugs. Please let me know if you find any, I'd really appreciate it.

You can download the dev_build from the following URL: https://github.com/LeonHeidelbach/ttv_adEraser/archive/dev_build.zip

## Additional information

- If you previously used a third party script through the `"userResourcesLocation"` setting in uBlock origin, make sure to remove the script and purge the cache, as it might conflict with the extension.
- If you have "Alternate Player for Twitch.tv" installed make sure to disable it.

## Changelog

### [v.1.1] [dev_build](https://github.com/LeonHeidelbach/ttv_adEraser/tree/) - 17.12.2020

- Added Firefox support

- TTV AdEraser now blocks Ads while still supporting your favourite streamers
    - TTV AdEraser now displays muted ads in a small mini player in the lower left corner of the page when they appear. This player will only show up when an ad is playing and hide itself again once the ad break is over. The mini ad player can also stay completely hidden, however ads will still run in the background so that you can support your streamer while not bothering to watch the ads themselves. The setting for this feature has been added to the popup settings list and can be adjusted to your liking. This feature has been tested thoroughly and works like a charm :-D.

- Channel points are back
    - Previously channel points would only be added once after visiting a stream. This issue has been resolved and you will now receive channel points as usual.

- Stream player error detector
    - TTV AdEraser now recognizes when your stream player has encountered an error and will reload the player (not the entire site) after 5 seconds. You will be prompted with a message informing you about the crash and can abort the player reload by clicking on "Stop Player Reload".

- Streams will no longer lower their quality when in background
    - Previously when switching tabs with the stream being in the same browser window the player would lower the stream's resolution to 480p. After bringing the tab back to the front it would take a couple of seconds for the stream to play at full quality again. Now the player will not lower the quality by itself when switching tabs anymore.

### [v.1.0] Initial Release - 14.12.2020
- TTV AdEraser blocks twitch.tv ads without lowering the stream quality by switching the standard stream player with the embed player provided by twitch

- Adds an easy to use extension popup to change preferences

- Adds a Audio Compressor feature to the stream player (chromium based browsers only)

- Adds a live stream peek preview to the twitch side bar