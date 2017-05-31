// ==UserScript==
// @name         CustomCut Luke Cage S01E01
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.netflix.com/watch/80002538?trackId=14170287*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var currentPageX = -1;

(function() {
    'use strict';

    console.log("Loaded");

    $(function() {
        showMouse();

        setTimeout(doTheClick, 8000);
    });
})();

function doTheClick() {

    var targretElement = ".scrubber-container";

    getClickDetails(targretElement);

    // console.log("Track at " + jQuery(".scrubber-head").attr("aria-valuenow"));

    var offset = jQuery(".scrubber-head").offset();
    //console.log(offset);

    simulateClick(offset.left + 100, offset.top, targretElement);
    //click(300,300);
}

function showMouse() {

    jQuery("#appMountPoint").append('<div id="status" style="position:absolute; font-size: 14px; z-index: 99;"></div>');

    jQuery(document).mousemove(function(e) {
        currentPageX = e.pageX;
        jQuery('#status').html(e.pageX +', '+ e.pageY);
    });
}

function simulateClick(x, y, targretElement) {

  var evt = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
      clientX: 200,
      clientY: 730
  });

    // var element = jQuery(".AkiraPlayer")[0];
    var element = jQuery(targretElement)[0];
    console.log(evt);
    // console.log("Current page x:" + currentPageX);
  element.dispatchEvent(evt);

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#Example
}

function click_deprecated(x,y, targretElement) {

    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent

    var evt = document.createEvent("MouseEvent");
    var element = jQuery(targretElement)[0];
    console.log(element);
    evt.initMouseEvent(
        "click",
        true /* bubble */, false /* cancelable */,
        window, null,
        x, y, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    console.log(evt);
    element.dispatchEvent(evt);
}

function getClickDetails(elementSelector) {

    jQuery(elementSelector)[0].addEventListener('click', showClickDetails);
}

function showClickDetails(event) {
    console.log("You done clicked a thing.");
    console.log(event);
}
