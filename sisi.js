(function () {
    'use strict';

    if (window.sisi_loader_installed) return;
    window.sisi_loader_installed = true;

    var STORAGE_KEY = 'sisi_blocked_sources';
    var CACHE_KEY = 'sisi_all_sources';
    var EXCLUDED_TITLES = ['закладки', 'история'];
    var SISI_HOST = 'https://lam.maxvol.pro/sisi';

    var servers = [
        'https://lam.maxvol.pro/sisi.js',
        'http://185.117.152.224:9118/sisi.js'
    ];
    var TIMEOUT_MS = 4000;

    function normalizeTitle(title) {
        if (!title) return '';
        var base = String(title).split('.')[0];
        return base.charAt(0).toUpperCase() + base.slice(1);
    }

    function getBlockedList() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    function setBlockedList(list) {
        Lampa.Storage.set(STORAGE_KEY, list);
    }

    function getCachedSources() {
        return Lampa.Storage.get(CACHE_KEY, []);
    }

    function isExcluded(normalizedTitle) {
        var t = (normalizedTitle || '').toLowerCase();
        return EXCLUDED_TITLES.indexOf(t) !== -1;
    }

    function cacheSources(channels) {
        var titles = channels
            .map(function (c) { return normalizeTitle(c.title); })
            .filter(Boolean)
            .filter(function (t) { return !isExcluded(t); });
        Lampa.Storage.set(CACHE_KEY, titles);
    }

    function buildAccountUrl(base) {
        var unic_id = Lampa.Storage.get('sisi_unic_id', '');
        var uid = Lampa.Storage.get('lampac_unic_id', '');
        var u = base;
        if (unic_id) u = Lampa.Utils.addUrlComponent(u, 'box_mac=' + unic_id);
        if (uid) u = Lampa.Utils.addUrlComponent(u, 'uid=' + encodeURIComponent(uid));
        return u;
    }

    function patchMenuFilter() {
        var proto = Lampa.Reguest.prototype;
        if (proto.__sisi_filter_patched) return;
        proto.__sisi_filter_patched = true;

        var origSilent = proto.silent;

        proto.silent = function (url) {
            var args = arguments;
            var isMenuRequest = typeof url === 'string' && /\/sisi(\?|$)/.test(url) && typeof args[1] === 'function';

            if (!isMenuRequest) return origSilent.apply(this, args);

            var origSuccess = args[1];
            var patchedArgs = Array.prototype.slice.call(args);

            patchedArgs[1] = function (data) {
                if (data && Array.isArray(data.channels)) {
                    cacheSources(data.channels);

                    var blocked = getBlockedList();
                    if (blocked.length) {
                        data.channels = data.channels.filter(function (channel) {
                            var norm = normalizeTitle(channel.title);
                            return isExcluded(norm) || blocked.indexOf(norm) === -1;
                        });
                    }
                }
                origSuccess(data);
            };

            return origSilent.apply(this, patchedArgs);
        };
    }

    function patchSelectFilter() {
        if (Lampa.Select.__sisi_filter_patched) return;
        Lampa.Select.__sisi_filter_patched = true;

        var origShow = Lampa.Select.show;

        Lampa.Select.show = function (params) {
            if (params && params.title === 'Сайты' && Array.isArray(params.items)) {
                var blocked = getBlockedList();

                if (blocked.length) {
                    params.items = params.items.filter(function (item) {
                        if (!item || !item.title) return true;
                        var norm = normalizeTitle(item.title);
                        return isExcluded(norm) || blocked.indexOf(norm) === -1;
                    });
                }
            }
            return origShow.apply(this, arguments);
        };
    }

    function prefetchSources() {
        var net = new Lampa.Reguest();
        net.timeout(10000);
        net.silent(buildAccountUrl(SISI_HOST), function (data) {
            if (data && Array.isArray(data.channels)) cacheSources(data.channels);
        }, function () {});
    }

    function openSourcesSelect() {
        var all = getCachedSources();

        if (!all.length) {
            Lampa.Noty.show('Список сайтов ещё не загружен, откройте "Клубничку" один раз и повторите');
            return;
        }

        var blocked = getBlockedList();

        var items = all.map(function (title) {
            return {
                title: title,
                checkbox: true,
                checked: blocked.indexOf(title) === -1,
                source_title: title,
                onCheck: function (elem) {
                    var current = getBlockedList();
                    var idx = current.indexOf(elem.source_title);

                    if (elem.checked) {
                        if (idx !== -1) current.splice(idx, 1);
                    } else {
                        if (idx === -1) current.push(elem.source_title);
                    }

                    setBlockedList(current);
                }
            };
        });

        Lampa.Select.show({
            title: 'Отключить сайты',
            items: items,
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function addSettings() {
        if (window.sisi_filter_settings_ready) return;
        window.sisi_filter_settings_ready = true;

        Lampa.SettingsApi.addParam({
            component: 'sisi',
            param: {
                name: 'sisi_sources_filter_btn',
                type: 'button'
            },
            field: {
                name: 'Отключить сайты',
                description: 'Выбрать, какие сайты показывать в списке'
            },
            onRender: function (item) {
                item.on('hover:enter', openSourcesSelect);
            }
        });
    }

    function loadNext(index) {
        if (index >= servers.length) {
            console.warn('[sisi.js] все сервера недоступны');
            return;
        }

        var url = servers[index];
        var script = document.createElement('script');
        var timer = null;
        var done = false;

        function cleanup() {
            clearTimeout(timer);
            script.onload = script.onerror = null;
        }

        function fail() {
            if (done) return;
            done = true;
            cleanup();
            if (script.parentNode) script.parentNode.removeChild(script);
            loadNext(index + 1);
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
        if (window.Lampa && Lampa.Manifest && Lampa.Reguest && Lampa.SettingsApi && Lampa.Select) {
            patchMenuFilter();
            patchSelectFilter();
            addSettings();
            prefetchSources();
            loadNext(0);
        } else {
            setTimeout(waitForLampa, 200);
        }
    }

    waitForLampa();
})();
