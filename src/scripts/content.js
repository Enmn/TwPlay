// Check if the current URL is a Twitch video URL
function isTwitchVideoUrl(url) {
    const regex = /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\/\d+$/;
    return regex.test(url);
}

// Fetch video twitch sub-only 
async function fetchTwitchDataGQL(vod) {
    let response = await fetch("https://gql.twitch.tv/gql", {
        method: 'POST',
        body: JSON.stringify([
            {
                "operationName": "VideoPlayer_VODSeekbarPreviewVideo",
                "variables": {
                    "includePrivate": false,
                    "videoID": vod
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "07e99e4d56c5a7c67117a154777b0baf85a5ffefa393b213f4bc712ccaf85dd6"
                    }
                }
            },
            {
                "operationName": "ComscoreStreamingQuery",
                "variables": {
                    "channel": "",
                    "clipSlug": "",
                    "isClip": false,
                    "isLive": false,
                    "isVodOrCollection": true,
                    "vodID": vod
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "e1edae8122517d013405f237ffcc124515dc6ded82480a88daef69c83b53ac01"
                    }
                }
            },
            {
                "operationName": "VodChannelLoginQuery",
                "variables": {
                    "videoID": vod
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "0c5feea4dad2565508828f16e53fe62614edf015159df4b3bca33423496ce78e"
                    }
                }
            }
        ]),
        headers: {
            'Accept': 'application/json',
            'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            'Content-Type': 'application/json'
        }
    });

    return response.json();
}

function FormatTime(player) {
    var input = player.duration();
    var pad = function(input) {return (input < 10) ? "0" + input : input;};
    var d = [
        pad(Math.floor(input / 3600)),
        pad(Math.floor(input % 3600 / 60)),
        pad(Math.floor(input % 60)),
    ].join(':')
    return d
}

// Display Times video 
function displayTime(player, displytime, duration) {
    // To move time like this (01:59:10)
    setInterval(function() {
        var input = player.currentTime();
        var pad = function(input) {return (input < 10) ? "0" + input : input;};
        var d = [
            pad(Math.floor(input / 3600)),
            pad(Math.floor(input % 3600 / 60)),
            pad(Math.floor(input % 60)),
        ].join(':')
        displytime.innerHTML = `<span>${d}</span>`;
        duration.innerHTML = `<span id="video-duration">${FormatTime(player)}</span>`;
    }, 100);
}

// Fixed to show Duration Time 
function fullscreenDuration(player, duration) {
    player.on('fullscreenchange', function () {
        if (player.isFullscreen()) {
            duration.setAttribute(
                "style", "left: 30%;"
            )
        } else {
            duration.setAttribute(
                "style", "right: 0.50%;"
            )
        }
    });
}
  
// Replace the video player with a custom one
function replaceVideoPlayer(data) {
    // Setting to video stream live
    var seekPreviewsURL = data.seekPreviewsURL;
    var host = seekPreviewsURL.split("/")[2]
    var res = seekPreviewsURL.split("/")[3]
    var url = "https://" + host + "/" + res;

    // Remove the default player
    const video = document.querySelector('div[class*=persistent-player]');
    const className = video.className;
    if (video) {
        video.parentNode.removeChild(video);
    }

    // Create the custom player
    const customPlayer = document.createElement('div');
    customPlayer.setAttribute('preload', 'auto');
    customPlayer.setAttribute('class', `video-js vjs-16-9 vjs-big-play-centered vjs-controls-enabled vjs-workinghover vjs-v7 player-dimensions vjs-has-started vjs-paused vjs-user-inactive  ${className}`);
    customPlayer.setAttribute('id', "player");
    customPlayer.setAttribute('tabindex', "-1");
  
    // Create the video player
    const videoPlayer = document.createElement('video');
    videoPlayer.style.width = '100%';
    videoPlayer.style.height = '100%';
    videoPlayer.setAttribute('id', 'video');
    videoPlayer.setAttribute('class', 'vjs-tech vjs-matrix');
    videoPlayer.setAttribute('controls', '');
    videoPlayer.setAttribute('autoplay', '');
    videoPlayer.setAttribute('playsinline', '');

    // Added video player in div player
    customPlayer.appendChild(videoPlayer);
  
    // Add the custom player to the page
    const videoWrapper = document.querySelector("div[data-target='persistent-player-content']");
    if (videoWrapper) {
        videoWrapper.appendChild(customPlayer);
    }

    const player = videojs("video", {
        controlBar: {
            children: [
                'playToggle',
                'volumePanel',
                'progressControl',
                'currentTimeDisplay',
                'DurationDisplay',
                'spacer',
                'PlaybackRateMenuButton',
                'qualitySelector',
                'fullscreenToggle',
            ],
        }
    });

    // Running video 
    player.src([
        {
            src: url + "/chunked/index-dvr.m3u8",
            type: 'application/x-mpegURL',
            label: '1080p60 (Source)',
        },
        {
            src: url + "/720p60/index-dvr.m3u8",
            type: 'application/x-mpegURL',
            label: '720p60',
        },
        {
            src: url + "/480p30/index-dvr.m3u8",
            type: 'application/x-mpegURL',
            label: '480p30',
        },
        {
            src: url + "/360p30/index-dvr.m3u8",
            type: 'application/x-mpegURL',
            label: '360p30',
        },
        {
            src: url + "/160p30/index-dvr.m3u8",
            type: 'application/x-mpegURL',
            label: '160p30',
        },
     ]);

    player.on("loadeddata", () => {
        var displytime = document.querySelector("div[class='vjs-current-time vjs-time-control vjs-control'")
        var duration = document.querySelector("div[class='vjs-duration vjs-time-control vjs-control']")

        // To move time like this (01:59:10)
        displayTime(player, displytime, duration);

        fullscreenDuration(player, duration);
    });

}
    
// Check if the current URL is a Twitch video URL
if (isTwitchVideoUrl(window.location.href)) {
    var vod = window.location.href.split("/")[4]
    // Replace the video player with a custom one
    fetchTwitchDataGQL(vod)
    .then(data => {
      let stream = data[0].data.video;
      replaceVideoPlayer(stream);
    });
}
    
// Send a message to the background script to confirm that the content script has been loaded
chrome.runtime.sendMessage({ message: 'contentScriptLoaded' });
    
// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.message === 'contentScriptLoaded') {
        // Send a message to the content script to confirm that the background script has been loaded
        chrome.tabs.sendMessage(sender.tab.id, { message: 'backgroundScriptLoaded' });
    }
});