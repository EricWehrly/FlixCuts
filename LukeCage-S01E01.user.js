// ==UserScript==
// @name         FlixCuts - Luke Cage Abridged (S01E01)
// @namespace    https://github.com/EricWehrly/FlixCuts
// @version      0.3
// @description  To improve Luke Cage
// @author       Eric Wehrly
// @match        https://www.netflix.com/watch/80002538?trackId=14170286&tctx=1%2C1%2C4ca0747b-aff8-4c77-8a3c-043b881c722f-20539565
// @grant        none
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

var FlixCuts = {};

// Have to be in chronological order
var showSegments = [
    {
        "from" : "722200",
        "to" : "827104"
    },
    {
        "from" : "865000",
        "to" : "898660"
    },
    {
        "from" : "928000",
        "to" : "1249667"
    },
    {
        "from" : "1533565"
    }
];
/*
    // Would be nice to skip the stupid tongue thing at 79-something but the song makes that difficult to cut on
    // Unfortunately currently doesn't save us from "UPS ain't the only brown that delivers" or the shaky cam
    */

(function() {
    'use strict';

    setTimeout(afterLoaded, 5000);
})();

var checkInterval;
function afterLoaded() {

    // get which marker we're "in" in "show segments"
    getCurrentShowSegmentMarker();

    checkInterval = setInterval(checkTime, 10);
}

var currentSegmentMarker = 0;
function getCurrentShowSegmentMarker() {

    if(showSegments == null || showSegments.length === 0 ) return;

    var currentTimeMs = getPlaybackPosition();
    var nextFrom = showSegments[currentSegmentMarker + 1].from;
    while(currentTimeMs > nextFrom) {

        currentSegmentMarker++;
        nextFrom = showSegments[currentSegmentMarker + 1].from;
    }

    // If we're before the first from, skip to it
    if(currentSegmentMarker === 0 && currentTimeMs < showSegments[currentSegmentMarker].from) {
        console.log("We're before marker 0, cutting to it.");
        seek(showSegments[currentSegmentMarker].from)();
    } else {
        console.log("We've loaded during the episode. Waiting until " + showSegments[currentSegmentMarker].to);
    }
}

function checkTime() {

    var currentTimeMs = getPlaybackPosition();
    // console.log("Current time: " + currentTimeMs);

    if(currentTimeMs > showSegments[currentSegmentMarker].to && getState() != "loading") {

        console.log("Made it past " + showSegments[currentSegmentMarker].to);

        currentSegmentMarker++;
        if(currentSegmentMarker >= showSegments.length || !("to" in showSegments[currentSegmentMarker])) {
            clearInterval(checkInterval);
        }

        // This is going to cause an error on the last one maybe. And we can be okay with that.
        seek(showSegments[currentSegmentMarker].from)();

        console.log("Waiting until " + showSegments[currentSegmentMarker].to);
    }
}

$("body").keydown(function( event ) {
    if ( event.which == 81 ) {  // Q
        console.log(getPlaybackPosition());
    }
});


// Straight lifted from https://github.com/stepchowfun/netflixparty-chrome/blob/master/content_script.js

// jump to a specific time in the video
var seekErrorRecent = [];
var seekErrorMean = 0;
var seek = function(milliseconds) {
    console.log("Skipping to " + milliseconds);

    return function() {
        uiEventsHappening += 1;
        var eventOptions, scrubber, oldPlaybackPosition, newPlaybackPosition;
        return showControls().then(function() {
            // compute the parameters for the mouse events
            scrubber = jQuery('#scrubber-component');
            var factor = (milliseconds - seekErrorMean) / getDuration();
            factor = Math.min(Math.max(factor, 0), 1);
            var mouseX = scrubber.offset().left + Math.round(scrubber.width() * factor); // relative to the document
            var mouseY = scrubber.offset().top + scrubber.height() / 2;                  // relative to the document
            eventOptions = {
                'bubbles': true,
                'button': 0,
                'screenX': mouseX - jQuery(window).scrollLeft(),
                'screenY': mouseY - jQuery(window).scrollTop(),
                'clientX': mouseX - jQuery(window).scrollLeft(),
                'clientY': mouseY - jQuery(window).scrollTop(),
                'offsetX': mouseX - scrubber.offset().left,
                'offsetY': mouseY - scrubber.offset().top,
                'pageX': mouseX,
                'pageY': mouseY,
                'currentTarget': scrubber[0]
            };

            // make the trickplay preview show up
            scrubber[0].dispatchEvent(new MouseEvent('mouseover', eventOptions));
        }).then(delayUntil(function() {
            // wait for the trickplay preview to show up
            return jQuery('.trickplay-preview').is(':visible');
        }, 2500)).then(function() {
            // remember the old position
            oldPlaybackPosition = getPlaybackPosition();

            // simulate a click on the scrubber
            scrubber[0].dispatchEvent(new MouseEvent('mousedown', eventOptions));
            scrubber[0].dispatchEvent(new MouseEvent('mouseup', eventOptions));
            scrubber[0].dispatchEvent(new MouseEvent('mouseout', eventOptions));
        }).then(delayUntil(function() {
            // wait until the seeking is done
            newPlaybackPosition = getPlaybackPosition();
            return Math.abs(newPlaybackPosition - oldPlaybackPosition) >= 1;
        }, 5000)).then(function() {
            // compute mean seek error for next time
            var newSeekError = Math.min(Math.max(newPlaybackPosition - milliseconds, -10000), 10000);
            shove(seekErrorRecent, newSeekError, 5);
            seekErrorMean = mean(seekErrorRecent);
        }).then(hideControls).ensure(function() {
            uiEventsHappening -= 1;
        });
    };
};

var uiEventsHappening = 0;

var showControls = function() {

    uiEventsHappening += 1;
    var scrubber = jQuery('#scrubber-component');
    var eventOptions = {
        'bubbles': true,
        'button': 0,
        'currentTarget': scrubber[0]
    };
    scrubber[0].dispatchEvent(new MouseEvent('mousemove', eventOptions));
    return delay(10)().then(function() {
        uiEventsHappening -= 1;
    });
};

// current playback position in milliseconds
var getPlaybackPosition = function() {
    return Math.floor(jQuery('.player-video-wrapper video')[0].currentTime * 1000);
};

// returns an action which delays for some time
var delay = function(milliseconds) {
    return function(result) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(result);
            }, milliseconds);
        });
    };
};

// returns an action which waits until the condition thunk returns true,
// rejecting if maxDelay time is exceeded
var delayUntil = function(condition, maxDelay) {
    return function(result) {
        var delayStep = 250;
        var startTime = (new Date()).getTime();
        var checkForCondition = function() {
            if (condition()) {
                return Promise.resolve(result);
            }
            if (maxDelay !== null && (new Date()).getTime() - startTime > maxDelay) {
                return Promise.reject(Error('delayUntil timed out'));
            }
            return delay(delayStep)().then(checkForCondition);
        };
        return checkForCondition();
    };
};

// hide the playback controls
var hideControls = function() {
    uiEventsHappening += 1;
    var player = jQuery('#netflix-player');
    var mouseX = 100; // relative to the document
    var mouseY = 100; // relative to the document
    var eventOptions = {
        'bubbles': true,
        'button': 0,
        'screenX': mouseX - jQuery(window).scrollLeft(),
        'screenY': mouseY - jQuery(window).scrollTop(),
        'clientX': mouseX - jQuery(window).scrollLeft(),
        'clientY': mouseY - jQuery(window).scrollTop(),
        'offsetX': mouseX - player.offset().left,
        'offsetY': mouseY - player.offset().top,
        'pageX': mouseX,
        'pageY': mouseY,
        'currentTarget': player[0]
    };
    player[0].dispatchEvent(new MouseEvent('mousemove', eventOptions));
    return delay(1)().ensure(function() {
        uiEventsHappening -= 1;
    });
};

// video duration in milliseconds
var lastDuration = 60 * 60 * 1000;
var getDuration = function() {
    var video = jQuery('.player-video-wrapper video');
    if (video.length > 0) {
        lastDuration = Math.floor(video[0].duration * 1000);
    }
    return lastDuration;
};

// add value to the end of array, and remove items from the beginning
// such that the length does not exceed limit
var shove = function(array, value, limit) {
    array.push(value);
    if (array.length > limit) {
        array.splice(0, array.length - limit);
    }
};

// compute the mean of an array of numbers
var mean = function(array) {
    return array.reduce(function(a, b) { return a + b; }) / array.length;
};

// promise.ensure(fn) method
// note that this method will not swallow errors
Promise.prototype.ensure = function(fn) {
    return this.then(fn, function(e) {
        fn();
        throw e;
    });
};

// 'playing', 'paused', 'loading', or 'idle'
var getState = function() {
    if (jQuery('.timeout-wrapper.player-active .icon-play').length > 0) {
        return 'idle';
    }
    if (jQuery('.player-progress-round.player-hidden').length === 0) {
        return 'loading';
    }
    if (jQuery('.player-control-button.player-play-pause.play').length === 0) {
        return 'playing';
    } else {
        return 'paused';
    }
};
