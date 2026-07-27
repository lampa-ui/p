(function() {
    'use strict';
    var servers = [
        'http://185.117.152.224:9118/sisi.js',
        'https://lam.maxvol.pro/sisi.js'
    ];
    var index = 0;
    function loadNext() {
        if (index >= servers.length) {
            return;
        }
        var url = servers[index];
        index++;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onerror = function() {
            loadNext();
        };
        document.body.appendChild(script);
    }
    setTimeout(loadNext, 100);
})();
