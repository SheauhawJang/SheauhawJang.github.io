// Local stub for Google Publisher Tag (offline archive)
var googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];
googletag._dummySlot = {
    addService: function() { return googletag._dummySlot; },
    setCollapseEmptyDiv: function() { return googletag._dummySlot; },
    setTargeting: function() { return googletag._dummySlot; }
};
googletag._dummyPubAds = {
    enableSingleRequest: function() {},
    collapseEmptyDivs: function() {},
    enableServices: function() {},
    setTargeting: function() {}
};
googletag.defineSlot = function() { return googletag._dummySlot; };
googletag.pubads = function() { return googletag._dummyPubAds; };
googletag.enableServices = function() {};
googletag.display = function() {};
if (Array.isArray(googletag.cmd)) {
    var queued = googletag.cmd.slice();
    googletag.cmd = {
        push: function(fn) {
            if (typeof fn === 'function') {
                try { fn(); } catch(e) {}
            }
        }
    };
    queued.forEach(function(fn) {
        if (typeof fn === 'function') {
            try { fn(); } catch(e) {}
        }
    });
}
