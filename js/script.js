(function () {
    "use strict";

    var a = window.location,
        o = window.document,
        t = o.currentScript,
        r = t.getAttribute("data-api") || new URL(t.src).origin + "/api/event",
        l = t.getAttribute("data-domain");

    function s(t, e) {
        if (t) {
            console.warn("Ignoring Event: " + t);
        }
        if (e && e.callback) {
            e.callback();
        }
    }

    function e(t, e) {
        if (
            /^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(a.hostname) ||
            "file:" === a.protocol
        ) {
            return s("localhost", e);
        }

        if (
            (window._phantom || 
             window.__nightmare || 
             window.navigator.webdriver || 
             window.Cypress) && 
            !window.__plausible
        ) {
            return s(null, e);
        }

        try {
            if ("true" === window.localStorage.plausible_ignore) {
                return s("localStorage flag", e);
            }
        } catch (t) {}

        var n = {};
        n.n = t;
        n.u = a.href;
        n.d = l;
        n.r = o.referrer || null;

        if (e && e.meta) {
            n.m = JSON.stringify(e.meta);
        }
        if (e && e.props) {
            n.p = e.props;
        }

        var i = new XMLHttpRequest();
        i.open("POST", r, true);
        i.setRequestHeader("Content-Type", "text/plain");
        i.send(JSON.stringify(n));
        i.onreadystatechange = function () {
            if (i.readyState === 4 && e && e.callback) {
                e.callback({ status: i.status });
            }
        };
    }

    var n = (window.plausible && window.plausible.q) || [];
    window.plausible = e;

    for (var i, p = 0; p < n.length; p++) {
        e.apply(this, n[p]);
    }

    function c() {
        if (i !== a.pathname) {
            i = a.pathname;
            e("pageview");
        }
    }

    function u() {
        c();
    }

    var w;
    var t = window.history;

    if (t.pushState) {
        w = t.pushState;
        t.pushState = function () {
            w.apply(this, arguments);
            u();
        };
        window.addEventListener("popstate", u);
    }

    if ("prerender" === o.visibilityState) {
        o.addEventListener("visibilitychange", function () {
            if (!i && o.visibilityState === "visible") {
                c();
            }
        });
    } else {
        c();
    }
})();
