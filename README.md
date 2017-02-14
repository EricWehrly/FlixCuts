# FlixCuts
Cut the crap from Netflix shows

These scripts were designed with the idea that one could "cut" shows on Netflix in a similar manner to how one might release a "fan cut" of a movie, such as the version of Episode 1 that removes Jar-Jar entirely. 

I started working on an abridged version of Luke Cage as a proof of concept.

---
##Installation:
Chrome: 

Install the [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) extension.

Open the TamperMonkey Dashboard, and select "New Script".

Copy and paste the contents of [the script](https://github.com/EricWehrly/FlixCuts/blob/master/LukeCage-S01E01.user.js) from this repository into your new TamperMonkey script. (Better distribution methods to come).

Change the script's episode by replacing the url in the @match line and the title in the @name line. This script will work on any item in Neflix (shows, movies, etc.). Or none if they patch off the functionality I'm hijacking to accomplish this.

The script operates using the `showSegments` variable toward the top of the script. The segments are kept in an array of objects, each with a "from" and a "to" value, denoting the beginning and ending timestamps of the segment. The timestamps are in milliseconds since the beginning of the track (minutes : seconds would be easier to read, yes, but would lack the precision necessary to cut adequately). The idea is that when it reaches the end of a segment, it jumps to the beginning of the next one in the list.

When the script loads initially, if the position of the trackbar is before the first segment in the list, the script will jump to the beginning of the first segment. Think of the very first "from" as saying "start here". The structure and script is meant to allow the show to be paused and resumed, and returned to later, just as with the standard Netflix viewing experience. You can leave a final segment with a "from" and no "to" and the script will basically "turn off" at that timestamp and Netflix will resume normal behavior for the track.

Remove all of the "from" and "to" blocks inside of the `showSegments` variable, so that it reads `var showSegments = [];`.

The script has the `Q` key on the keyboard configured to print a timestamp to the console. You can open Chrome's console with the `F12` key. By pressing `Q` at the time you wish to cut, you will get a timestamp in milliseconds, like those that were in the showSegments variables.

**Note: Currently, if you log a timestamp to console and have the show jump to that timestamp, it seems to arrive a little after the frame that logged the timestamp. Once I get my head around the amount of time or the cause of the off timing, I'll put in a fix.**

---

It is also possible to install this with [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (FireFox), and directly into Chrome or Firefox as a UserScript (with some degree of fiddling). Instructions for that are to come.
