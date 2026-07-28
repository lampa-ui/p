(function () {
    'use strict';

    if (window.sisi_loader_installed) return;
    window.sisi_loader_installed = true;

    var servers = [
        'https://lam.maxvol.pro/sisi.js',
        'http://185.117.152.224:9118/sisi.js'
    ];
    var TIMEOUT_MS = 4000;

    var index = 0;
    var done = false;

    function loadNext() {
        if (done) return;
        if (index >= servers.length) {
            console.warn('[sisi.js] все сервера недоступны');
            return;
        }

        var url = servers[index++];
        var script = document.createElement('script');
        var timer = null;

        function cleanup() {
            clearTimeout(timer);
            script.onload = script.onerror = null;
        }

        function fail() {
            if (done) return;
            cleanup();
            if (script.parentNode) script.parentNode.removeChild(script);
            loadNext();
        }

        function succeed() {
            if (done) return;
            done = true;
            cleanup();
        }

        script.type = 'text/javascript';
        script.src = url;
        script.onload = succeed;
        script.onerror = fail;
        timer = setTimeout(fail, TIMEOUT_MS);

        document.body.appendChild(script);
    }

    function waitForLampa() {
        if (typeof window.Lampa !== 'undefined' && window.Lampa.Manifest) {
            loadNext();
        } else {
            setTimeout(waitForLampa, 200);
        }
    }

    waitForLampa();
})();
