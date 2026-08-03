(function () {
    'use strict';

    try {
        var __jfMap = Lampa.Storage.get('jellyfin_tmdb_map', {});
        if (__jfMap && typeof __jfMap === 'object') {
            var __jfChanged = false;
            for (var __jfKey in __jfMap) {
                if (__jfMap.hasOwnProperty(__jfKey) && __jfMap[__jfKey] === 'none') {
                    delete __jfMap[__jfKey];
                    __jfChanged = true;
                }
            }
            if (__jfChanged) Lampa.Storage.set('jellyfin_tmdb_map', __jfMap);
        }
    } catch (e_jfCleanup) {}

    try {
        var __jfPb = Lampa.Storage.get('jellyfin_playback_state_v1', null);
        if (__jfPb && typeof __jfPb === 'object' && __jfPb.items && typeof __jfPb.items === 'object') {
            var __jfPbChanged = false;
            for (var __jfItemId in __jfPb.items) {
                if (!__jfPb.items.hasOwnProperty(__jfItemId)) continue;
                var __jfIt = __jfPb.items[__jfItemId];
                if (__jfIt && typeof __jfIt === 'object' && __jfIt.mediaSourceId) {
                    delete __jfIt.mediaSourceId;
                    __jfPbChanged = true;
                }
            }
            if (__jfPbChanged) Lampa.Storage.set('jellyfin_playback_state_v1', __jfPb);
        }
    } catch (e_jfPbCleanup) {}

    try {
        var __jfPb2 = Lampa.Storage.get('jellyfin_playback_state_v1', null);
        if (__jfPb2 && typeof __jfPb2 === 'object' && __jfPb2.items && typeof __jfPb2.items === 'object') {
            var __jfPb2Changed = false;
            for (var __jfItemId2 in __jfPb2.items) {
                if (!__jfPb2.items.hasOwnProperty(__jfItemId2)) continue;
                var __jfIt2 = __jfPb2.items[__jfItemId2];
                if (__jfIt2 && typeof __jfIt2 === 'object' && __jfIt2.mediaSourceId && !(parseFloat(__jfIt2.positionSec) > 0) && !(parseFloat(__jfIt2.durationSec) > 0)) {
                    delete __jfIt2.mediaSourceId;
                    __jfPb2Changed = true;
                }
            }
            if (__jfPb2Changed) Lampa.Storage.set('jellyfin_playback_state_v1', __jfPb2);
        }
    } catch (e_jfPbCleanup2) {}

    var JELLYFIN_SERVER = '';
    var JELLYFIN_USER = '';
    var JELLYFIN_PASS = '';

    var JELLYFIN_ICON_GRADIENT_TPL = '<svg class="jf-icon jf-icon--gradient" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs><linearGradient id="__GID__" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#AA5CC3"/><stop offset="100%" stop-color="#00A4DC"/></linearGradient></defs><path style="fill:url(#__GID__)" d="M12 .002C8.826.002-1.398 18.537.16 21.666c1.56 3.129 22.14 3.094 23.682 0C25.384 18.573 15.177 0 12 0zm7.76 18.949c-1.008 2.028-14.493 2.05-15.514 0C3.224 16.9 9.92 4.755 12.003 4.755c2.081 0 8.77 12.166 7.759 14.196zM12 9.198c-1.054 0-4.446 6.15-3.93 7.189.518 1.04 7.348 1.027 7.86 0 .511-1.027-2.874-7.19-3.93-7.19z"/></svg>';
    var JELLYFIN_ICON_WHITE = '<svg class="jf-icon jf-icon--white" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .002C8.826.002-1.398 18.537.16 21.666c1.56 3.129 22.14 3.094 23.682 0C25.384 18.573 15.177 0 12 0zm7.76 18.949c-1.008 2.028-14.493 2.05-15.514 0C3.224 16.9 9.92 4.755 12.003 4.755c2.081 0 8.77 12.166 7.759 14.196zM12 9.198c-1.054 0-4.446 6.15-3.93 7.189.518 1.04 7.348 1.027 7.86 0 .511-1.027-2.874-7.19-3.93-7.19z"/></svg>';

    var _jfIconGidSeq = 0;
    function _jfNextGid() {
        _jfIconGidSeq += 1;
        return 'jf_grad_g_' + Date.now().toString(36) + '_' + _jfIconGidSeq;
    }

    function getIcon() {
        try {
            if (Lampa.Storage.get('jellyfin_icon_style', 'gradient') === 'white') return JELLYFIN_ICON_WHITE;
            return JELLYFIN_ICON_GRADIENT_TPL.split('__GID__').join(_jfNextGid());
        } catch(e) {
            return JELLYFIN_ICON_GRADIENT_TPL.split('__GID__').join(_jfNextGid());
        }
    }

    var JELLYFIN_ICON = JELLYFIN_ICON_GRADIENT_TPL.split('__GID__').join('jf_grad_g_static');

    var _jfHeadIcon = null;

    function jfOpenMain() {
        Lampa.Activity.push({
            component: Jellyfin._componentsRegistered ? 'jellyfin_main' : 'category',
            title: 'Jellyfin',
            url: 'jellyfin://main',
            page: 1,
            source: 'tmdb'
        });
    }

    function jfHeadIconEnabled() {
        try { return Lampa.Storage.get('jellyfin_head_icon', true) !== false; } catch (e) { return true; }
    }

    function jfNewItemsNotyEnabled() {
        try { return Lampa.Storage.get('jellyfin_new_items_noty', true) !== false; } catch (e) { return true; }
    }

    function jfSyncHeadIcon() {
        if (!_jfHeadIcon || !_jfHeadIcon.length) return;
        try {
            var el = _jfHeadIcon[0];
            if (el && document && document.documentElement && !document.documentElement.contains(el)) {
                _jfHeadIcon = null;
                return;
            }
        } catch (e0) {}
        _jfHeadIcon.toggleClass('hide', !jfHeadIconEnabled());
    }

    function jfInjectHeadIcon() {
        try {
            if (!Lampa.Head || typeof Lampa.Head.addIcon !== 'function') return;
            if (_jfHeadIcon && _jfHeadIcon.length) {
                try {
                    var el0 = _jfHeadIcon[0];
                    if (el0 && document && document.documentElement && !document.documentElement.contains(el0)) _jfHeadIcon = null;
                } catch (e00) { _jfHeadIcon = null; }
            }

            if (!_jfHeadIcon || !_jfHeadIcon.length) {
                try {
                    var exist = document ? document.querySelector('.head .jf-head-icon') : null;
                    if (exist) _jfHeadIcon = $(exist);
                } catch (e01) {}
            }

            if (_jfHeadIcon && _jfHeadIcon.length) {
                try { _jfHeadIcon.off('hover:enter').on('hover:enter', jfOpenMain); } catch (e02) {}
                jfSyncHeadIcon();
                return;
            }
            var $icon = Lampa.Head.addIcon(getIcon());
            $icon.addClass('jf-head-icon selector');
            $icon.off('hover:enter').on('hover:enter', jfOpenMain);
            _jfHeadIcon = $icon;
            jfSyncHeadIcon();
        } catch (e0) {}
    }

    function jfRefreshHeadIconStyle() {
        try { jfInjectHeadIcon(); } catch (e00) {}
        try { if (_jfHeadIcon && _jfHeadIcon.length) _jfHeadIcon.html(getIcon()); } catch (e0) {}
    }

    function sget(key, def) { return Lampa.Storage.get(key, def); }
    function sset(key, val) { Lampa.Storage.set(key, val); }

    var Jellyfin = {
        token: null,
        userId: null,
        lastServer: null,
        lastUser: null,
        quickConnectTimer: null,
        quickConnectSecret: null,
        quickConnectInFlight: false,
        quickConnectFailCount: 0,
        apiPatched: false,
        searchRegistered: false,
        linePrefsKey: 'jellyfin_line_prefs',
        playbackStateKey: 'jellyfin_playback_state_v1',
        ticksPerSecond: 10000000,
        activePlayback: null,
        _jfExpectedFreshUrl: null,
        _jfQualityGuardTimer: null,
        _jfPlaylistListenerReady: false,

        _jfLastKnownPositionSec: 0,
        _jfLastKnownItemId: null,
        _jfPendingDestroy: false,
        _jfPendingDestroyTimer: null,

        delayedNoty: function (text, delayMs, timeMs) {
            var shown = false;
            var timer = null;
            var delay = typeof delayMs === 'number' ? delayMs : 450;
            var lifetime = typeof timeMs === 'number' ? timeMs : 30000;

            try {
                timer = setTimeout(function () {
                    shown = true;
                    try { if (window.Lampa && Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(text, { time: lifetime }); } catch (e0) {}
                }, delay);
            } catch (e1) {}

            return function stop() {
                try { if (timer) clearTimeout(timer); } catch (e2) {}
                if (!shown) return;
                try {
                    var root = document.querySelector('.noty');
                    var body = root ? root.querySelector('.noty__text') : null;
                    var current = body ? String(body.innerHTML || '') : '';
                    if (root && current === String(text)) root.classList.remove('noty--visible');
                } catch (e3) {}
            };
        },

        wrapSelectOnBack: function (onBack) {
            var prev = null;
            var focusEl = null;
            try { prev = Lampa.Controller && Lampa.Controller.enabled ? Lampa.Controller.enabled() : null; } catch (e0) { prev = null; }
            try { focusEl = document.querySelector('.selector.focus') || document.querySelector('.selector.hover'); } catch (e1) { focusEl = null; }

            return function () {
                try { if (typeof onBack === 'function') onBack(); } catch (e2) {}

                setTimeout(function () {
                    try {
                        if (document.body && document.body.classList && document.body.classList.contains('selectbox--open')) return;
                        if (!Lampa.Controller || !Lampa.Controller.enabled || !Lampa.Controller.toggle) return;
                        var enabled = Lampa.Controller.enabled();
                        if (!enabled || enabled.name !== 'select') return;

                        var prevName = prev && prev.name ? prev.name : 'content';
                        if (prevName === 'search') {
                            var isSearchOpen = false;
                            try { isSearchOpen = (document.body && document.body.classList && document.body.classList.contains('search--open')) || !!document.querySelector('.search,.search-box'); } catch (eS0) { isSearchOpen = false; }
                            if (!isSearchOpen) prevName = 'content';
                        }

                        Lampa.Controller.toggle(prevName);

                        var target = null;
                        if (focusEl && focusEl.offsetParent !== null && !focusEl.closest('.selectbox')) target = focusEl;
                        if (!target) {
                            try { target = document.querySelector('.full-start-new__buttons .selector, .full-start__buttons .selector'); } catch (eF0) { target = null; }
                        }
                        if (!target) {
                            try {
                                var all = document.querySelectorAll('.selector');
                                for (var i = 0; i < all.length; i++) {
                                    var el = all[i];
                                    if (!el || el.offsetParent === null) continue;
                                    if (el.closest('.selectbox')) continue;
                                    if (el.closest('.noty')) continue;
                                    target = el;
                                    break;
                                }
                            } catch (eF1) { target = null; }
                        }
                        if (target) {
                            try { Lampa.Controller.collectionFocus(target, document.body, true); } catch (e3) {}
                        }
                    } catch (e4) {}
                }, 10);
            };
        },

        getDeviceId: function() {
            var id = sget('jellyfin_device_id', '');
            if (!id) {
                id = Math.random().toString(36).slice(2, 12);
                sset('jellyfin_device_id', id);
            }
            return id;
        },

        saveAuth: function (server, token, userId, userLabel) {
            this.token = token || null;
            this.userId = userId || null;
            this.lastServer = server || null;
            this.lastUser = userLabel || null;

            if (server) sset('jellyfin_server', server);
            sset('jellyfin_token', token || '');
            sset('jellyfin_user_id', userId || '');
            sset('jellyfin_auth_type', userLabel || '');
            try { if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); } catch (e0) {}
        },

        clearAuth: function () {
            this.token = null;
            this.userId = null;
            this.lastServer = null;
            this.lastUser = null;
            sset('jellyfin_token', '');
            sset('jellyfin_user_id', '');
            sset('jellyfin_auth_type', '');
            try { if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); } catch (e0) {}
        },

        getAuthHeader: function() {
            var parts = [
                'Client="Jellyfin Web"',
                'Device="Chrome"',
                'DeviceId="' + this.getDeviceId() + '"',
                'Version="10.9.11"'
            ];
            if (this.token) parts.push('Token="' + this.token + '"');
            return 'MediaBrowser ' + parts.join(', ');
        },

        request: function(url, method, body, callback, error, opts) {
            try {
                var options = opts || {};
                var retriesLeft = typeof options._retriesLeft === 'number' ? options._retriesLeft : 1;

                var req = new Lampa.Reguest();

                var timeoutMs = options.timeoutMs || (1000 * 20);
                req.timeout(timeoutMs);
                var headers = options.headers || {};

                headers['X-Emby-Authorization'] = this.getAuthHeader();

                if (options.useTokenHeader !== false && this.token) {
                    headers['X-Emby-Token'] = this.token;
                }

                var post_data = false;
                var params = { dataType: options.dataType || 'json', headers: headers };

                if (method === 'POST') {
                    if (options.contentType) headers['Content-Type'] = options.contentType;
                    else headers['Content-Type'] = 'application/json';
                    headers['Accept'] = 'application/json';

                    if (options.form) post_data = String(body || '');
                    else post_data = JSON.stringify(body || {});
                }

                var self = this;
                req.native(
                    url,
                    function (res) {
                        if (typeof res === 'string') { try { res = JSON.parse(res); } catch (e0) {} }
                        callback(res);
                    },
                    function (err) {
                        var status = '';
                        try { status = String(err && (err.status || err.decode_code || err.code) || ''); } catch (eS) { status = ''; }

                        if (status === '401' && retriesLeft > 0) {
                            var retryOpts = {};
                            for (var k in options) { if (options.hasOwnProperty(k)) retryOpts[k] = options[k]; }
                            retryOpts._retriesLeft = retriesLeft - 1;
                            setTimeout(function () {
                                self.request(url, method, body, callback, error, retryOpts);
                            }, 900);
                            return;
                        }

                        error(err);
                    },
                    post_data,
                    params
                );
            } catch (e1) {
                if (error) error(e1);
            }
        },

        buildImageUrl: function (itemId, type) {
            try {
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                var token = String(this.token || sget('jellyfin_token', '') || '');
                if (!server || !itemId) return '';

                var path = '';
                var params = '';

                if (type === 'thumb') {
                    path = '/Items/' + encodeURIComponent(itemId) + '/Images/Thumb';
                    params = 'fillHeight=320&fillWidth=213&quality=90';
                } else if (type === 'backdrop') {
                    path = '/Items/' + encodeURIComponent(itemId) + '/Images/Backdrop/0';
                    params = 'maxWidth=1280&quality=90';
                } else if (type === 'logo') {
                    path = '/Items/' + encodeURIComponent(itemId) + '/Images/Logo';
                    params = 'maxWidth=600&quality=90';
                } else {
                    path = '/Items/' + encodeURIComponent(itemId) + '/Images/Primary';
                    params = 'maxWidth=420&quality=90';
                }

                var url = server + path + '?' + params;
                if (token) url += '&api_key=' + encodeURIComponent(token);
                return url;
            } catch (e0) {
                return '';
            }
        },

        rememberTmdbMapping: function (cardType, tmdbId, jellyfinId) {
            try {
                if (!tmdbId || !jellyfinId) return;
                var map = sget('jellyfin_tmdb_map', {});
                if (!map || typeof map !== 'object') map = {};
                var key = String(cardType || 'movie') + ':' + String(tmdbId);
                map[key] = String(jellyfinId);
                sset('jellyfin_tmdb_map', map);
            } catch (e0) {}
        },

        findJellyfinIdByTmdb: function (cardType, tmdbId) {
            try {
                var map = sget('jellyfin_tmdb_map', {});
                if (!map || typeof map !== 'object') return '';
                var key = String(cardType || 'movie') + ':' + String(tmdbId);
                return map[key] ? String(map[key]) : '';
            } catch (e0) {
                return '';
            }
        },

        forgetTmdbMapping: function (cardType, tmdbId) {
            try {
                if (!tmdbId) return;
                var map = sget('jellyfin_tmdb_map', {});
                if (!map || typeof map !== 'object') return;
                var key = String(cardType || 'movie') + ':' + String(tmdbId);
                if (map.hasOwnProperty(key)) {
                    delete map[key];
                    sset('jellyfin_tmdb_map', map);
                }
            } catch (e0) {}
        },

        rememberTmdbMappingsBulk: function (entries, replace) {
            try {
                entries = entries || [];
                if (!replace && !entries.length) return;
                var map = replace ? {} : sget('jellyfin_tmdb_map', {});
                if (!map || typeof map !== 'object') map = {};
                for (var i = 0; i < entries.length; i++) {
                    var e = entries[i];
                    if (!e || !e[1] || !e[2]) continue;
                    map[String(e[0] || 'movie') + ':' + String(e[1])] = String(e[2]);
                }
                sset('jellyfin_tmdb_map', map);
            } catch (e0) {}
        },

        _indexState: { building: false, builtAt: 0, fullBuiltAt: 0, deltaAt: 0 },
        buildTmdbIndex: function (opts, onDone) {
            opts = opts || {};
            var self = this;
            if (self._indexState.building) { if (onDone) onDone(false, 0, { alreadyBuilding: true }); return; }
            self._indexState.building = true;

            var safetyTimer = setTimeout(function () { self._indexState.building = false; self._indexState.progress = null; }, 90000);

            self.authenticate(function () {
                clearTimeout(safetyTimer);
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                var token = String(self.token || '');
                var uid = String(self.userId || '');
                if (!server || !token || !uid) {
                    self._indexState.building = false;
                    self._indexState.progress = null;
                    if (onDone) onDone(false);
                    return;
                }

                var NON_VIDEO_TYPES = { music: true, musicvideos: true, books: true, photos: true, playlists: true, boxsets: true };

                var collected = [];
                var totalFound = 0;
                var totalScanned = 0;
                var knownGrandTotal = 0;
                var failedPages = 0;
                var abortedJobs = 0;
                var byType = {
                    movie: { found: 0, scanned: 0, total: 0 },
                    tv: { found: 0, scanned: 0, total: 0 }
                };

                self._indexState.progress = { active: true, jobIdx: 0, jobsTotal: 0, scanned: 0, found: 0, libraryTotal: 0, label: 'подготовка...' };
                try { jfUpdateIndexStatusUI(); } catch (eP0) {}

                function finish() {

                    self.rememberTmdbMappingsBulk(collected, abortedJobs === 0);
                    self._indexState.building = false;
                    self._indexState.progress = null;
                    var now = Date.now();
                    self._indexState.builtAt = now;
                    self._indexState.fullBuiltAt = now;
                    self._indexState.deltaAt = now;
                    try { sset('jellyfin_index_built_at', now); } catch (e0) {}
                    try { sset('jellyfin_index_full_at', now); } catch (e0b) {}
                    try { sset('jellyfin_index_delta_at', now); } catch (e0c) {}
                    try {
                        sset('jellyfin_index_last_counts', {
                            matched: totalFound, scanned: totalScanned, libraryTotal: knownGrandTotal, at: now,
                            movie: byType.movie, tv: byType.tv
                        });
                    } catch (e0d) {}

                    try { jfRescanVisibleCards(); } catch (e1) {}
                    try { jfUpdateIndexStatusUI(); } catch (e2) {}
                    if (onDone) onDone(true, totalFound, { scanned: totalScanned, libraryTotal: knownGrandTotal, failedPages: failedPages, abortedKinds: abortedJobs, byType: byType });
                }

                function runJobs(jobs) {
                    function fetchPage(jobIdx, startIndex, attempt, consecFail) {
                        attempt = attempt || 0;
                        consecFail = consecFail || 0;
                        if (jobIdx >= jobs.length) { finish(); return; }

                        var job = jobs[jobIdx];
                        var limit = 300;
                        var query = [
                            'Recursive=true',
                            'IncludeItemTypes=' + job.type,
                            'StartIndex=' + startIndex,
                            'Limit=' + limit,
                            'Fields=ProviderIds',
                            'api_key=' + encodeURIComponent(token)
                        ];
                        if (job.parentId) query.push('ParentId=' + encodeURIComponent(job.parentId));
                        var url = server + '/Users/' + encodeURIComponent(uid) + '/Items?' + query.join('&');

                        self.request(url, 'GET', null, function (res) {
                            var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                            var total = 0;
                            try { total = parseInt(res.TotalRecordCount || res.totalRecordCount || 0, 10) || 0; } catch (eT) { total = 0; }
                            if (startIndex === 0) { knownGrandTotal += total; if (byType[job.cardType]) byType[job.cardType].total += total; }
                            totalScanned += items.length;
                            if (byType[job.cardType]) byType[job.cardType].scanned += items.length;

                            for (var i = 0; i < items.length; i++) {
                                var it = items[i];
                                if (!it) continue;
                                var providers = it.ProviderIds || it.Providerids || {};
                                var tmdb = providers && (providers.Tmdb || providers.tmdb || providers.TMDb || '');
                                if (tmdb && it.Id) {
                                    collected.push([job.cardType, String(tmdb), String(it.Id)]);
                                    totalFound++;
                                    if (byType[job.cardType]) byType[job.cardType].found++;
                                }
                            }

                            self._indexState.progress = {
                                active: true,
                                jobIdx: jobIdx + 1,
                                jobsTotal: jobs.length,
                                scanned: totalScanned,
                                found: totalFound,
                                libraryTotal: knownGrandTotal,
                                label: job.viewName + ' - ' + (job.cardType === 'tv' ? 'сериалы' : 'фильмы')
                            };
                            try { jfUpdateIndexStatusUI(); } catch (eP1) {}

                            var next = startIndex + limit;
                            if (next < total && items.length) {
                                fetchPage(jobIdx, next, 0, 0);
                            } else {
                                fetchPage(jobIdx + 1, 0, 0, 0);
                            }
                        }, function () {

                            self._indexState.progress = {
                                active: true,
                                jobIdx: jobIdx + 1,
                                jobsTotal: jobs.length,
                                scanned: totalScanned,
                                found: totalFound,
                                libraryTotal: knownGrandTotal,
                                label: (job.viewName || 'Библиотека') + ' - ' + (job.cardType === 'tv' ? 'сериалы' : 'фильмы') + ' (повтор запроса, сервер отвечает медленно)'
                            };
                            try { jfUpdateIndexStatusUI(); } catch (eP2) {}

                            if (attempt < 2) {
                                var backoff = 900 * (attempt + 1);
                                setTimeout(function () { fetchPage(jobIdx, startIndex, attempt + 1, consecFail); }, backoff);
                                return;
                            }

                            failedPages++;
                            var nextConsecFail = consecFail + 1;
                            if (nextConsecFail >= 3) {
                                abortedJobs++;
                                fetchPage(jobIdx + 1, 0, 0, 0);
                            } else {
                                // Раньше здесь была ошибка: неудачная страница пропускалась
                                // (startIndex + limit), из-за чего до 300 позиций терялись
                                // безвозвратно при временном сбое сети/сервера.
                                // Теперь повторяем именно ту же страницу.
                                setTimeout(function () { fetchPage(jobIdx, startIndex, 0, nextConsecFail); }, 1500);
                            }
                        }, { timeoutMs: 1000 * 30 });
                    }

                    fetchPage(0, 0, 0, 0);
                }

                self.getViews(function (views) {
                    var list = Array.isArray(views) ? views : [];
                    var jobs = [];
                    for (var i = 0; i < list.length; i++) {
                        var v = list[i];
                        if (!v || !v.Id) continue;
                        var ct = '';
                        try { ct = String(v.CollectionType || v.collectionType || '').toLowerCase(); } catch (e0) { ct = ''; }
                        if (NON_VIDEO_TYPES[ct]) continue;
                        var vName = String(v.Name || v.name || '') || 'Библиотека';

                        jobs.push({ parentId: String(v.Id), type: 'Movie', cardType: 'movie', viewName: vName });
                        jobs.push({ parentId: String(v.Id), type: 'Series', cardType: 'tv', viewName: vName });
                    }
                    if (!jobs.length) {

                        jobs.push({ parentId: '', type: 'Movie', cardType: 'movie', viewName: 'Библиотека' });
                        jobs.push({ parentId: '', type: 'Series', cardType: 'tv', viewName: 'Библиотека' });
                    }
                    self._indexState.progress.jobsTotal = jobs.length;
                    runJobs(jobs);
                }, function () {

                    var fallbackJobs = [
                        { parentId: '', type: 'Movie', cardType: 'movie', viewName: 'Библиотека' },
                        { parentId: '', type: 'Series', cardType: 'tv', viewName: 'Библиотека' }
                    ];
                    self._indexState.progress.jobsTotal = fallbackJobs.length;
                    runJobs(fallbackJobs);
                });
            });
        },

        syncTmdbIndexDelta: function (opts, onDone) {
            opts = opts || {};
            var self = this;
            if (self._indexState.building) { if (onDone) onDone(false, 0, { alreadyBuilding: true }); return; }

            var sinceMs = self._indexState.deltaAt || parseInt(sget('jellyfin_index_delta_at', 0), 10) || parseInt(sget('jellyfin_index_full_at', 0), 10) || 0;
            if (!sinceMs) { if (onDone) onDone(false); return; }

            self._indexState.building = true;
            var safetyTimer = setTimeout(function () { self._indexState.building = false; }, 60000);

            self.authenticate(function () {
                clearTimeout(safetyTimer);
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                var token = String(self.token || '');
                var uid = String(self.userId || '');
                if (!server || !token || !uid) {
                    self._indexState.building = false;
                    if (onDone) onDone(false);
                    return;
                }

                var sinceIso = new Date(sinceMs - 5 * 60 * 1000).toISOString();
                var NON_VIDEO_TYPES = { music: true, musicvideos: true, books: true, photos: true, playlists: true, boxsets: true };
                var collected = [];
                var totalFound = 0;
                var totalScanned = 0;
                var newFound = 0;
                var newByType = { movie: 0, tv: 0 };

                function finish(ok) {
                    if (ok && collected.length) self.rememberTmdbMappingsBulk(collected);
                    self._indexState.building = false;
                    var now = Date.now();
                    self._indexState.deltaAt = now;
                    try { sset('jellyfin_index_delta_at', now); } catch (e0) {}

                    if (ok && newFound) {
                        try {
                            var last = sget('jellyfin_index_last_counts', null);
                            if (last && typeof last === 'object') {
                                if (!last.movie) last.movie = { found: 0, scanned: 0, total: 0 };
                                if (!last.tv) last.tv = { found: 0, scanned: 0, total: 0 };
                                // Дельта-проверка находит только новые/изменённые позиции, а не всю
                                // библиотеку, поэтому реальный "total" неизвестен - считаем, что
                                // каждое новое совпадение соответствует новому элементу в библиотеке,
                                // и прибавляем найденное как к found, так и к total.
                                last.movie.found += newByType.movie;
                                last.movie.total += newByType.movie;
                                last.tv.found += newByType.tv;
                                last.tv.total += newByType.tv;
                                last.matched = (last.matched || 0) + newFound;
                                last.libraryTotal = (last.libraryTotal || 0) + newFound;
                                sset('jellyfin_index_last_counts', last);
                            }
                        } catch (eUpd) {}
                    }

                    if (ok && totalFound) {
                        try { jfRescanVisibleCards(); } catch (e1) {}
                    }
                    try { jfUpdateIndexStatusUI(); } catch (e2) {}

                    if (ok && newFound && jfNewItemsNotyEnabled()) {
                        try {
                            var parts = [];
                            if (newByType.movie) parts.push('фильмов ' + newByType.movie);
                            if (newByType.tv) parts.push('сериалов ' + newByType.tv);
                            if (parts.length) Lampa.Noty.show('Jellyfin: найдено новое - ' + parts.join(', '));
                        } catch (eNoty) {}
                    }

                    if (onDone) onDone(!!ok, totalFound, { scanned: totalScanned, newFound: newFound, newByType: newByType });
                }

                function fetchPage(views, viewIdx, startIndex, attempt) {
                    attempt = attempt || 0;
                    if (viewIdx >= views.length) { finish(true); return; }
                    var view = views[viewIdx];
                    var limit = 300;
                    var query = [
                        'Recursive=true',
                        'IncludeItemTypes=Movie,Series',
                        'MinDateLastSaved=' + encodeURIComponent(sinceIso),
                        'StartIndex=' + startIndex,
                        'Limit=' + limit,
                        'Fields=ProviderIds',
                        'api_key=' + encodeURIComponent(token)
                    ];
                    if (view.parentId) query.push('ParentId=' + encodeURIComponent(view.parentId));
                    var url = server + '/Users/' + encodeURIComponent(uid) + '/Items?' + query.join('&');

                    self.request(url, 'GET', null, function (res) {
                        var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                        var total = 0;
                        try { total = parseInt(res.TotalRecordCount || res.totalRecordCount || 0, 10) || 0; } catch (eT) { total = 0; }
                        totalScanned += items.length;

                        for (var i = 0; i < items.length; i++) {
                            var it = items[i];
                            if (!it) continue;
                            var cardType = String(it.Type || '').toLowerCase() === 'series' ? 'tv' : 'movie';
                            var providers = it.ProviderIds || it.Providerids || {};
                            var tmdb = providers && (providers.Tmdb || providers.tmdb || providers.TMDb || '');
                            if (tmdb && it.Id) {
                                var alreadyKnown = '';
                                try { alreadyKnown = self.findJellyfinIdByTmdb(cardType, tmdb); } catch (eKn) { alreadyKnown = ''; }
                                collected.push([cardType, String(tmdb), String(it.Id)]);
                                totalFound++;
                                if (!alreadyKnown) {
                                    newFound++;
                                    if (newByType[cardType] !== undefined) newByType[cardType]++;
                                }
                            }
                        }

                        var next = startIndex + limit;
                        if (next < total && items.length) fetchPage(views, viewIdx, next, 0);
                        else fetchPage(views, viewIdx + 1, 0, 0);
                    }, function () {
                        if (attempt < 2) {
                            var backoff = 900 * (attempt + 1);
                            setTimeout(function () { fetchPage(views, viewIdx, startIndex, attempt + 1); }, backoff);
                            return;
                        }

                        fetchPage(views, viewIdx + 1, 0, 0);
                    }, { timeoutMs: 1000 * 30 });
                }

                self.getViews(function (viewsRaw) {
                    var list = Array.isArray(viewsRaw) ? viewsRaw : [];
                    var views = [];
                    for (var i = 0; i < list.length; i++) {
                        var v = list[i];
                        if (!v || !v.Id) continue;
                        var ct = '';
                        try { ct = String(v.CollectionType || v.collectionType || '').toLowerCase(); } catch (e0) { ct = ''; }
                        if (NON_VIDEO_TYPES[ct]) continue;
                        views.push({ parentId: String(v.Id) });
                    }
                    if (!views.length) views.push({ parentId: '' });
                    fetchPage(views, 0, 0, 0);
                }, function () {
                    fetchPage([{ parentId: '' }], 0, 0, 0);
                });
            });
        },

        ensureTmdbIndex: function (force) {
            var self = this;
            try {
                if (!sget('jellyfin_token', '')) return;
                if (self._indexState.building) return;
                var fullAt = self._indexState.fullBuiltAt || parseInt(sget('jellyfin_index_full_at', 0), 10) || 0;
                var deltaAt = self._indexState.deltaAt || parseInt(sget('jellyfin_index_delta_at', 0), 10) || 0;
                var fullTtl = 7 * 24 * 60 * 60 * 1000;
                var deltaTtl = 20 * 60 * 1000;

                if (force || !fullAt || (Date.now() - fullAt) >= fullTtl) {
                    self.buildTmdbIndex({}, function () {});
                } else if (!deltaAt || (Date.now() - deltaAt) >= deltaTtl) {
                    self.syncTmdbIndexDelta({}, function () {});
                }
            } catch (e0) {}
        },

        getLinePrefs: function () {
            var prefs = sget(this.linePrefsKey, {});
            if (!prefs || typeof prefs !== 'object') prefs = {};
            if (!Array.isArray(prefs.order)) prefs.order = [];
            if (!prefs.disabled || typeof prefs.disabled !== 'object') prefs.disabled = {};
            return prefs;
        },

        setLinePrefs: function (prefs) {
            try {
                sset(this.linePrefsKey, prefs || {});
            } catch (e0) {}
        },

        lineKey: function (line) {
            try {
                if (!line) return '';
                if (line.url) return String(line.url);
                if (line.title) return 'title:' + String(line.title);
                return '';
            } catch (e0) {
                return '';
            }
        },

        applyLinePrefs: function (lines) {
            var prefs = this.getLinePrefs();
            var disabled = prefs.disabled || {};
            var order = prefs.order || [];

            var byKey = {};
            var keys = [];

            (lines || []).forEach(function (l) {
                var k = this.lineKey(l);
                if (!k) return;
                if (byKey[k]) return;
                byKey[k] = l;
                keys.push(k);
            }.bind(this));

            var filtered = keys.filter(function (k) { return !disabled[k]; });

            var out = [];
            for (var i = 0; i < order.length; i++) {
                var ok = order[i];
                if (!ok || !byKey[ok]) continue;
                if (disabled[ok]) continue;
                out.push(byKey[ok]);
                byKey[ok] = null;
            }

            for (var j = 0; j < filtered.length; j++) {
                var k2 = filtered[j];
                if (byKey[k2]) out.push(byKey[k2]);
            }

            return out;
        },

        ticksToSeconds: function (ticks) {
            var t = 0;
            try { t = parseInt(ticks, 10) || 0; } catch (e0) { t = 0; }
            if (!t) return 0;
            return t / this.ticksPerSecond;
        },

        secondsToTicks: function (sec) {
            var s = 0;
            try { s = parseFloat(sec) || 0; } catch (e0) { s = 0; }
            if (!s) return 0;
            return Math.max(0, Math.round(s * this.ticksPerSecond));
        },

        getPlaybackState: function () {
            var st = sget(this.playbackStateKey, {});
            if (!st || typeof st !== 'object') st = {};
            if (!st.items || typeof st.items !== 'object') st.items = {};
            if (!st.series || typeof st.series !== 'object') st.series = {};
            return st;
        },

        setPlaybackState: function (st) {
            try { sset(this.playbackStateKey, st || {}); } catch (e0) {}
        },

        getLocalItemState: function (itemId) {
            try {
                var st = this.getPlaybackState();
                var it = st.items && itemId ? st.items[String(itemId)] : null;
                return it && typeof it === 'object' ? it : null;
            } catch (e0) {
                return null;
            }
        },

        setLocalItemState: function (itemId, data) {
            try {
                if (!itemId) return;
                var st = this.getPlaybackState();
                st.items[String(itemId)] = data || {};
                this.setPlaybackState(st);
            } catch (e0) {}
        },

        getSeriesLastState: function (seriesId) {
            try {
                var st = this.getPlaybackState();
                var it = st.series && seriesId ? st.series[String(seriesId)] : null;
                return it && typeof it === 'object' ? it : null;
            } catch (e0) {
                return null;
            }
        },

        setSeriesLastState: function (seriesId, data) {
            try {
                if (!seriesId) return;
                var st = this.getPlaybackState();
                st.series[String(seriesId)] = data || {};
                this.setPlaybackState(st);
            } catch (e0) {}
        },

        getResumeSecondsFromItem: function (it) {
            var sec = 0;
            try {
                if (it && it.UserData && it.UserData.PlaybackPositionTicks) {
                    sec = this.ticksToSeconds(it.UserData.PlaybackPositionTicks);
                }
            } catch (e0) { sec = 0; }
            if (!sec) {
                try {
                    var local = this.getLocalItemState(it && it.Id ? it.Id : '');
                    if (local && local.positionSec) sec = parseFloat(local.positionSec) || 0;
                } catch (e1) { sec = 0; }
            }
            return sec || 0;
        },

        getDurationSecondsFromItem: function (it) {
            var sec = 0;
            try { if (it && it.RunTimeTicks) sec = this.ticksToSeconds(it.RunTimeTicks); } catch (e0) { sec = 0; }
            if (!sec) {
                try {
                    var local = this.getLocalItemState(it && it.Id ? it.Id : '');
                    if (local && local.durationSec) sec = parseFloat(local.durationSec) || 0;
                } catch (e1) { sec = 0; }
            }
            return sec || 0;
        },

        shouldOfferContinue: function (resumeSec, durationSec) {
            var r = 0;
            var d = 0;
            try { r = parseFloat(resumeSec) || 0; } catch (e0) { r = 0; }
            try { d = parseFloat(durationSec) || 0; } catch (e1) { d = 0; }
            if (r < 30) return false;
            if (d > 0 && r > (d - 30)) return false;
            if (d > 0 && (r / d) >= 0.95) return false;
            return true;
        },

        formatSecondsShort: function (sec) {
            var s = 0;
            try { s = Math.max(0, Math.floor(parseFloat(sec) || 0)); } catch (e0) { s = 0; }
            try {
                if (Lampa && Lampa.Utils && Lampa.Utils.secondsToTime) return Lampa.Utils.secondsToTime(s, true);
            } catch (e1) {}
            var h = Math.floor(s / 3600);
            var m = Math.floor((s % 3600) / 60);
            var ss = Math.floor(s % 60);
            var mm = (m < 10 ? '0' : '') + m;
            var sss = (ss < 10 ? '0' : '') + ss;
            return (h ? (h + ':') : '') + mm + ':' + sss;
        },

        enhanceResumeCards: function () {
            if (this._resumeCardsEnhanced) return;
            this._resumeCardsEnhanced = true;

            try {
                if (!document.getElementById('jf-resume-cards-style')) {
                    $('body').append('<style id="jf-resume-cards-style">' +
                        '.jf-resume__meta{position:absolute;top:.5em;left:.5em;right:.5em;color:#fff;font-size:1em;font-weight:700;padding:.4em .7em;border-radius:.4em;z-index:3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;pointer-events:none;opacity:0;transition:opacity .2s ease;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 2px 12px rgba(0,0,0,.6);text-shadow:0 1px 3px rgba(0,0,0,.8)}' +
                        '.jf-resume__line{position:absolute;left:0;right:0;bottom:0;height:.5em;margin:0;z-index:2;background:rgba(0,0,0,.4);pointer-events:none;opacity:0;transition:opacity .2s ease;overflow:hidden}' +
                        '.jf-resume__line>div{background:linear-gradient(90deg,#AA5CC3 0%,#8B68CC 25%,#6B89DD 50%,#4BA4E8 75%,#00A4DC 100%);height:100%;box-shadow:0 -2px 16px rgba(170,92,195,.8),0 0 20px rgba(0,164,220,.6);transition:width .3s ease;position:relative}' +
                        '.jf-resume__line>div::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.3) 50%,transparent 100%);animation:jf-shine 2s ease-in-out infinite}' +
                        '@keyframes jf-shine{0%,100%{transform:translateX(-100%)}50%{transform:translateX(100%)}}' +
                        '.card.jf-resume--ready .card-watched{display:none!important}' +
                        '.card.jf-resume--ready .card__vote{z-index:5}' +
                        '.card.jf-resume--has-vote .jf-resume__meta{right:3.6em}' +
                        '.card.focus .jf-resume__meta,.card.focus .jf-resume__line{opacity:1}' +
                        '.jf-resume__clip{position:absolute;overflow:hidden;pointer-events:none;z-index:2}' +
                        '.jf-resume__clip .jf-resume__line{z-index:auto}' +
                        '</style>');
                }
            } catch (e0) {}

            var self = this;
            var enhanceOne = function (cardEl) {
                try {
                    if (!cardEl || cardEl.nodeType !== 1) return;
                    if (!cardEl.classList || !cardEl.classList.contains('card')) return;
                    if (cardEl.classList.contains('jf-resume--ready')) return;
                    var data = cardEl.card_data || null;
                    if (!data || !data.jellyfin_resume || !data.jellyfin_resume_line) return;
                    cardEl.classList.add('jf-resume--ready');

                    var view = cardEl.querySelector('.card__view');
                    if (!view) return;

                    try {
                        if (cardEl.querySelector('.card__vote')) cardEl.classList.add('jf-resume--has-vote');
                    } catch (eV0) {}

                    try {
                        var cw = view.querySelector('.card-watched');
                        if (cw && cw.remove) cw.remove();
                    } catch (eCW0) {}

                    var meta = data.jellyfin_resume || {};
                    var percent = 0;
                    try { percent = Math.max(0, Math.min(100, parseFloat(meta.percent) || 0)); } catch (e1) { percent = 0; }

                    var labelParts = [];
                    if (meta.episodeLabel) labelParts.push(String(meta.episodeLabel));
                    if (meta.timeLabel) labelParts.push(String(meta.timeLabel));
                    var label = labelParts.filter(Boolean).join(' • ');

                    if (label) {
                        var metaEl = document.createElement('div');
                        metaEl.className = 'jf-resume__meta';
                        metaEl.textContent = label;
                        view.appendChild(metaEl);
                    }

                    var tl = document.createElement('div');
                    tl.className = 'time-line jf-resume__line';
                    tl.setAttribute('data-hash', String(meta.hash || ('jf:' + (data.jellyfin_item_id || data.jellyfin_id || data.id || ''))));

                    var inner = document.createElement('div');
                    inner.style.width = percent + '%';
                    tl.appendChild(inner);

                    var clip = document.createElement('div');
                    clip.className = 'jf-resume__clip';

                    var radius = '';
                    var imgEl = view.querySelector('.card__img') || view.querySelector('img');
                    try {
                        var pickRadius = function (el) {
                            if (!el) return '';
                            var cs = window.getComputedStyle(el);
                            var candidates = [cs.borderBottomLeftRadius, cs.borderRadius];
                            for (var i = 0; i < candidates.length; i++) {
                                var v = candidates[i];
                                if (!v) continue;
                                var m = String(v).match(/[\d.]+[a-z%]*/);
                                if (m && parseFloat(m[0]) > 0) return m[0];
                            }
                            return '';
                        };
                        radius = pickRadius(imgEl) || pickRadius(view) || pickRadius(cardEl);
                    } catch (eRad0) {}
                    if (!radius) radius = '.8em';
                    clip.style.borderRadius = radius;

                    var syncClipBox = function () {
                        try {
                            if (!imgEl) throw 0;

                            var top = imgEl.offsetTop;
                            var left = imgEl.offsetLeft;
                            var width = imgEl.offsetWidth;
                            var height = imgEl.offsetHeight;

                            var node = imgEl.offsetParent;
                            var guard = 0;
                            while (node && node !== view && guard < 10) {
                                top += node.offsetTop;
                                left += node.offsetLeft;
                                node = node.offsetParent;
                                guard++;
                            }
                            if (node !== view) throw 0;

                            top -= view.clientTop;
                            left -= view.clientLeft;

                            if (!(width > 0) || !(height > 0)) throw 0;

                            var overscanBottom = 1;

                            clip.style.right = '';
                            clip.style.bottom = '';
                            clip.style.top = top + 'px';
                            clip.style.left = left + 'px';
                            clip.style.width = width + 'px';
                            clip.style.height = (height + overscanBottom) + 'px';
                        } catch (eSync0) {
                            clip.style.width = '';
                            clip.style.height = '';
                            clip.style.top = '0';
                            clip.style.left = '0';
                            clip.style.right = '0';
                            clip.style.bottom = '0';
                        }
                    };
                    syncClipBox();

                    clip.appendChild(tl);
                    view.appendChild(clip);

                    try {
                        window.addEventListener('resize', syncClipBox);
                        window.addEventListener('orientationchange', syncClipBox);
                    } catch (eRes0) {}

                    var ensureSeriesMeta = function () {
                        try {
                            var applyDom = function () {
                                try {
                                    var parts2 = [];
                                    if (data.jellyfin_resume && data.jellyfin_resume.episodeLabel) parts2.push(String(data.jellyfin_resume.episodeLabel));
                                    if (data.jellyfin_resume && data.jellyfin_resume.timeLabel) parts2.push(String(data.jellyfin_resume.timeLabel));
                                    var lbl2 = parts2.filter(Boolean).join(' • ');
                                    var curMetaEl2 = view.querySelector('.jf-resume__meta');
                                    if (lbl2) {
                                        if (!curMetaEl2) {
                                            curMetaEl2 = document.createElement('div');
                                            curMetaEl2.className = 'jf-resume__meta';
                                            view.appendChild(curMetaEl2);
                                        }
                                        curMetaEl2.textContent = lbl2;
                                    }
                                    if (data.jellyfin_resume && typeof data.jellyfin_resume.percent !== 'undefined') {
                                        var p2 = Math.max(0, Math.min(100, parseFloat(data.jellyfin_resume.percent) || 0));
                                        inner.style.width = p2 + '%';
                                    }
                                } catch (eDOM1) {}
                            };

                            if (data.jellyfin_resume && data.jellyfin_resume.episodeLabel) {
                                applyDom();
                                return;
                            }

                            var itemId = '';
                            try { itemId = String(data.jellyfin_item_id || data.jellyfin_id || ''); } catch (eI0) { itemId = ''; }
                            if (itemId) {
                                if (!self._resumeItemCache) self._resumeItemCache = {};
                                if (!self._resumeItemInflight) self._resumeItemInflight = {};

                                var ic = self._resumeItemCache[itemId];
                                if (ic && (ic.episodeLabel || ic.timeLabel)) {
                                    try {
                                        data.jellyfin_resume = data.jellyfin_resume || {};
                                        if (ic.episodeLabel) data.jellyfin_resume.episodeLabel = ic.episodeLabel;
                                        if (ic.timeLabel) data.jellyfin_resume.timeLabel = ic.timeLabel;
                                        if (typeof ic.percent !== 'undefined') data.jellyfin_resume.percent = ic.percent;
                                        if (ic.seriesId && !data.jellyfin_resume_series_id) data.jellyfin_resume_series_id = ic.seriesId;
                                    } catch (eIC0) {}
                                    applyDom();
                                    return;
                                }

                                if (!self._resumeItemInflight[itemId]) {
                                    self._resumeItemInflight[itemId] = true;
                                    self.getItemDetails(itemId, function (full) {
                                        try { delete self._resumeItemInflight[itemId]; } catch (eIF0) {}
                                        if (!full || !full.Id) return;

                                        var tLower = '';
                                        try { tLower = String(full.Type || '').toLowerCase(); } catch (eTL) { tLower = ''; }

                                        if (tLower === 'episode') {
                                            var sNo0 = '';
                                            var eNo0 = '';
                                            try { sNo0 = full.ParentIndexNumber ? String(full.ParentIndexNumber) : ''; } catch (eS0) { sNo0 = ''; }
                                            try { eNo0 = full.IndexNumber ? String(full.IndexNumber) : ''; } catch (eE0) { eNo0 = ''; }
                                            var epLabel0 = (sNo0 || eNo0) ? ('S' + (sNo0 || '?') + 'E' + (eNo0 || '?')) : '';

                                            var resumeSec0 = 0;
                                            var durSec0 = 0;
                                            try { resumeSec0 = self.getResumeSecondsFromItem(full); } catch (eRS0) { resumeSec0 = 0; }
                                            try { durSec0 = self.getDurationSecondsFromItem(full); } catch (eDS0) { durSec0 = 0; }
                                            var timeLabel0 = '';
                                            try {
                                                var durStr0 = durSec0 > 0 ? self.formatSecondsShort(durSec0) : '';
                                                var posStr0 = resumeSec0 > 0 ? self.formatSecondsShort(resumeSec0) : '';
                                                if (durStr0 && posStr0) timeLabel0 = posStr0 + '/' + durStr0;
                                                else timeLabel0 = durStr0 || posStr0 || '';
                                            } catch (eT0) { timeLabel0 = ''; }
                                            var pct0 = 0;
                                            try { pct0 = durSec0 ? ((resumeSec0 / durSec0) * 100) : 0; } catch (eP0) { pct0 = 0; }
                                            pct0 = Math.max(0, Math.min(100, pct0));

                                            try {
                                                data.jellyfin_resume = data.jellyfin_resume || {};
                                                if (epLabel0) data.jellyfin_resume.episodeLabel = epLabel0;
                                                if (timeLabel0) data.jellyfin_resume.timeLabel = timeLabel0;
                                                if (pct0) data.jellyfin_resume.percent = pct0;
                                            } catch (eU0) {}

                                            try { self._resumeItemCache[itemId] = { episodeLabel: epLabel0, timeLabel: timeLabel0, percent: pct0 }; } catch (eC0) {}
                                            applyDom();
                                            return;
                                        }

                                        if (tLower === 'series') {
                                            try { data.jellyfin_resume_series_id = String(full.Id); } catch (eS1) {}
                                            try { self._resumeItemCache[itemId] = { seriesId: String(full.Id) }; } catch (eC1) {}
                                            try { applyDom(); } catch (eD1) {}
                                            try { $(cardEl).trigger('hover:focus.jf_resume'); } catch (eT1) {}
                                            return;
                                        }
                                    });
                                }
                            }

                            if (data.jellyfin_resume && data.jellyfin_resume.episodeLabel) {
                                applyDom();
                                return;
                            }

                            if (!data.jellyfin_resume_series_id) return;
                            var sid = String(data.jellyfin_resume_series_id || '');
                            if (!sid) return;

                            if (!self._resumeSeriesCache) self._resumeSeriesCache = {};
                            if (!self._resumeSeriesInflight) self._resumeSeriesInflight = {};

                            var cached = self._resumeSeriesCache[sid];
                            if (cached && (cached.episodeLabel || cached.timeLabel)) {
                                try {
                                    data.jellyfin_resume = data.jellyfin_resume || {};
                                    if (cached.episodeLabel) data.jellyfin_resume.episodeLabel = cached.episodeLabel;
                                    if (cached.timeLabel) data.jellyfin_resume.timeLabel = cached.timeLabel;
                                    if (typeof cached.percent !== 'undefined') data.jellyfin_resume.percent = cached.percent;
                                } catch (eC2) {}
                                applyDom();
                                return;
                            }

                            if (self._resumeSeriesInflight[sid]) return;
                            self._resumeSeriesInflight[sid] = true;
                            self.getSeriesResume(sid, function (resumeEpisode) {
                                try { delete self._resumeSeriesInflight[sid]; } catch (eIR0) {}
                                var sNo = '';
                                var eNo = '';
                                try { sNo = resumeEpisode && resumeEpisode.ParentIndexNumber ? String(resumeEpisode.ParentIndexNumber) : ''; } catch (eS2) { sNo = ''; }
                                try { eNo = resumeEpisode && resumeEpisode.IndexNumber ? String(resumeEpisode.IndexNumber) : ''; } catch (eE2) { eNo = ''; }
                                var epLabel = (sNo || eNo) ? ('S' + (sNo || '?') + 'E' + (eNo || '?')) : '';

                                var resumeSec = 0;
                                var durSec = 0;
                                try { resumeSec = self.getResumeSecondsFromItem(resumeEpisode); } catch (eRS1) { resumeSec = 0; }
                                try { durSec = self.getDurationSecondsFromItem(resumeEpisode); } catch (eDS1) { durSec = 0; }
                                var timeLabel2 = '';
                                try {
                                    var durStr2 = durSec > 0 ? self.formatSecondsShort(durSec) : '';
                                    var posStr2 = resumeSec > 0 ? self.formatSecondsShort(resumeSec) : '';
                                    if (durStr2 && posStr2) timeLabel2 = posStr2 + '/' + durStr2;
                                    else timeLabel2 = durStr2 || posStr2 || '';
                                } catch (eTL0) { timeLabel2 = ''; }

                                var pct = 0;
                                try { pct = durSec ? ((resumeSec / durSec) * 100) : 0; } catch (eP1) { pct = 0; }
                                pct = Math.max(0, Math.min(100, pct));

                                try { self._resumeSeriesCache[sid] = { episodeLabel: epLabel, timeLabel: timeLabel2, percent: pct }; } catch (eSC0) {}

                                try {
                                    data.jellyfin_resume = data.jellyfin_resume || {};
                                    if (epLabel) data.jellyfin_resume.episodeLabel = epLabel;
                                    if (timeLabel2) data.jellyfin_resume.timeLabel = timeLabel2;
                                    if (pct) data.jellyfin_resume.percent = pct;
                                } catch (eU1) {}

                                applyDom();
                            }.bind(self), function () {
                                try { delete self._resumeSeriesInflight[sid]; } catch (eIR1) {}
                            });
                        } catch (e0) {}
                    };

                    try {
                        $(cardEl).off('hover:focus.jf_resume');
                        $(cardEl).on('hover:focus.jf_resume', function () { ensureSeriesMeta(); });
                    } catch (eF0) {}
                } catch (e2) {}
            };

            try {
                var mo = new MutationObserver(function (mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (!m || !m.addedNodes) continue;
                        for (var j = 0; j < m.addedNodes.length; j++) {
                            var n = m.addedNodes[j];
                            if (!n || n.nodeType !== 1) continue;
                            if (n.classList && n.classList.contains('card')) enhanceOne(n);
                            try {
                                var list = n.querySelectorAll ? n.querySelectorAll('.card') : [];
                                for (var k = 0; k < (list ? list.length : 0); k++) enhanceOne(list[k]);
                            } catch (e3) {}
                        }
                    }
                });
                mo.observe(document.body, { childList: true, subtree: true });
                this._resumeCardsObserver = mo;
            } catch (e4) {}

            try {
                var existing = document.querySelectorAll('.card');
                for (var z = 0; z < (existing ? existing.length : 0); z++) enhanceOne(existing[z]);
            } catch (e5) {}
        },

        openContinuePopup: function (opts) {
            var enabled = null;
            try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
            var restoreTo = enabled && enabled.name ? enabled.name : 'full_start';

            try {
                if (this._continueOverlay && this._continueOverlay.remove) this._continueOverlay.remove();
                this._continueOverlay = null;
            } catch (e00) {}
            try { $('.jellyfin-continue-popup').remove(); } catch (e01) {}

            if (!document.getElementById('jellyfin-continue-styles')) {
                $('body').append('<style id="jellyfin-continue-styles">.jellyfin-continue-popup{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);}.jellyfin-continue__card{background:#1a1a1a;border-radius:1em;width:44em;max-width:94vw;overflow:hidden;box-shadow:0 1em 4em rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.06);}.jellyfin-continue__img{position:relative;width:100%;padding-top:56.25%;background:#000;overflow:hidden;}.jellyfin-continue__img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;}.jellyfin-continue__details{position:absolute;bottom:0;left:0;right:0;padding:1.3em;background:linear-gradient(transparent,rgba(0,0,0,0.95));}.jellyfin-continue__title{font-size:1.7em;font-weight:700;margin-bottom:0.25em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;}.jellyfin-continue__info{font-size:1.05em;opacity:0.65;color:#fff;}.jellyfin-continue__body{padding:0 1.3em 0.4em;margin-top:-0.4em;}.jellyfin-continue__question{font-size:1.15em;font-weight:600;margin:1em 0 0.8em;}.jellyfin-continue__footer{display:flex;flex-direction:row;gap:1em;padding:1.2em;}.jellyfin-continue__btn{position:relative;padding:1em 1.2em;border-radius:0.6em;cursor:pointer;font-size:1.15em;font-weight:600;background:rgba(255,255,255,0.08);color:#fff;transition:all 0.2s ease;text-align:center;flex:1;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.06);}.jellyfin-continue__btn.focus{background:#fff;color:#000;transform:translateY(-0.2em);box-shadow:0 0.5em 1.5em rgba(255,255,255,0.2);}.jellyfin-continue__bar{height:0.42em;background:rgba(255,255,255,0.12);border-radius:0.3em;overflow:hidden;}.jellyfin-continue__barfill{height:100%;background:#9B59B6;width:0%;}</style>');
            }

            var title = opts && opts.title ? String(opts.title) : 'Продолжить просмотр?';
            var name = opts && opts.name ? String(opts.name) : '';
            var info = opts && opts.info ? String(opts.info) : '';
            var image = opts && opts.image ? String(opts.image) : '';
            var percent = 0;
            try { percent = opts && typeof opts.percent !== 'undefined' ? parseFloat(opts.percent) || 0 : 0; } catch (e1) { percent = 0; }
            percent = Math.max(0, Math.min(100, percent));

            var overlay = $([
                '<div class="jellyfin-continue-popup">',
                '  <div class="jellyfin-continue__card">',
                '    <div class="jellyfin-continue__img">',
                (image ? ('      <img src="' + image + '" alt="">') : ''),
                '      <div class="jellyfin-continue__details">',
                '        <div class="jellyfin-continue__title"></div>',
                '        <div class="jellyfin-continue__info"></div>',
                '      </div>',
                '    </div>',
                '    <div class="jellyfin-continue__body">',
                '      <div class="jellyfin-continue__question"></div>',
                '      <div class="jellyfin-continue__timeline"><div class="jellyfin-continue__bar"><div class="jellyfin-continue__barfill"></div></div></div>',
                '    </div>',
                '    <div class="jellyfin-continue__footer">',
                '      <div class="jellyfin-continue__btn selector jellyfin-continue__btn-yes">▶ Продолжить</div>',
                '      <div class="jellyfin-continue__btn selector jellyfin-continue__btn-no">Выбрать</div>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join(''));

            overlay.find('.jellyfin-continue__title').text(name || 'Jellyfin');
            overlay.find('.jellyfin-continue__info').text(info || '');
            overlay.find('.jellyfin-continue__question').text(title);
            overlay.find('.jellyfin-continue__barfill').css('width', percent + '%');

            $('body').append(overlay);
            this._continueOverlay = overlay;

            var yesBtn = overlay.find('.jellyfin-continue__btn-yes');
            var noBtn = overlay.find('.jellyfin-continue__btn-no');
            var last = yesBtn.length ? yesBtn[0] : null;

            overlay.find('.selector').on('hover:focus', function () { last = this; });

            var close = function () {
                try { overlay.remove(); } catch (e0) {}
                try { Jellyfin._continueOverlay = null; } catch (e00) {}
                try { Lampa.Controller.toggle(restoreTo); } catch (e1) {}
            };

            overlay.on('click', function (e) {
                try {
                    if (e && e.target === overlay[0]) close();
                } catch (e0) {}
            });

            yesBtn.on('hover:enter', function () {
                close();
                if (opts && opts.onContinue) setTimeout(function () { try { opts.onContinue(); } catch (e0) {} }, 0);
            });

            noBtn.on('hover:enter', function () {
                close();
                if (opts && opts.onChoose) setTimeout(function () { try { opts.onChoose(); } catch (e0) {} }, 0);
            });

            Lampa.Controller.add('jellyfin_continue', {
                toggle: function () {
                    try { Lampa.Controller.collectionSet(overlay); } catch (e0) {}
                    try { Lampa.Controller.collectionFocus(yesBtn[0], overlay); } catch (e1) {}
                },
                left: function () {
                    if (!yesBtn.length || !noBtn.length) return;
                    if (last === noBtn[0]) Lampa.Controller.collectionFocus(yesBtn[0], overlay);
                    else Lampa.Controller.collectionFocus(noBtn[0], overlay);
                },
                right: function () {
                    if (!yesBtn.length || !noBtn.length) return;
                    if (last === yesBtn[0]) Lampa.Controller.collectionFocus(noBtn[0], overlay);
                    else Lampa.Controller.collectionFocus(yesBtn[0], overlay);
                },
                enter: function () {
                    try { if (last) $(last).trigger('hover:enter'); } catch (e0) {}
                },
                back: function () {
                    close();
                },
                gone: function () {
                    try { overlay.find('.selector').removeClass('focus'); } catch (e0) {}
                }
            });

            try { Lampa.Controller.toggle('jellyfin_continue'); } catch (e2) {}
        },

        getTmdbIdFromItem: function (it) {
            try {
                if (!it) return '';
                var providers = it.ProviderIds || it.Providerids || {};
                var tmdb = providers && (providers.Tmdb || providers.tmdb || providers.TMDb || '');
                return tmdb ? String(tmdb) : '';
            } catch (e0) {
                return '';
            }
        },

        getTmdbLang: function () {
            try { return String(Lampa.Storage.field('tmdb_lang') || 'ru'); } catch (e0) { return 'ru'; }
        },

        getEpisodeStillFromTmdb: function (tmdbSeriesId, seasonNumber, episodeNumber, callback) {
            try {
                var sid = String(tmdbSeriesId || '');
                var s = parseInt(seasonNumber, 10) || 0;
                var e = parseInt(episodeNumber, 10) || 0;
                if (!sid || !s || !e) return callback('');
                if (!window.Lampa || !Lampa.TMDB || !Lampa.TMDB.api || !Lampa.TMDB.key || !Lampa.TMDB.image) return callback('');

                var lang = this.getTmdbLang();
                var epUrl = Lampa.TMDB.api('tv/' + sid + '/season/' + s + '/episode/' + e + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
                $.ajax({ url: epUrl, timeout: 5000 })
                    .done(function (epData) {
                        try {
                            var still = (epData && epData.still_path) ? String(epData.still_path) : '';
                            if (still) return callback(Lampa.TMDB.image('t/p/w500' + still));
                        } catch (e0) {}
                        callback('');
                    })
                    .fail(function () { callback(''); });
            } catch (e1) {
                callback('');
            }
        },

        getResumeItems: function (callback, onFail) {
            this.authenticate(function () {
                try {
                    var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                    var token = String(this.token || '');
                    var uid = String(this.userId || '');
                    if (!server || !token || !uid) return (onFail ? onFail() : null);

                    var url = server + '/Users/' + encodeURIComponent(uid) + '/Items/Resume?Limit=100&Recursive=true&Fields=UserData,SeriesId,SeriesName,ParentId,IndexNumber,ParentIndexNumber,Name,RunTimeTicks,ProviderIds,Type&api_key=' + encodeURIComponent(token);
                    this.request(url, 'GET', null, function (res) {
                        var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                        callback(items || []);
                    }.bind(this), function () {
                        if (onFail) onFail();
                    }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 25 });
                } catch (e0) {
                    if (onFail) onFail();
                }
            }.bind(this));
        },

        getSeriesResume: function (seriesId, callback, onFail) {
            var sid = String(seriesId || '');
            if (!sid) return (onFail ? onFail() : null);
            this.getResumeItems(function (items) {
                var best = null;
                var bestTime = 0;
                for (var i = 0; i < (items || []).length; i++) {
                    var it = items[i];
                    var seriesMatch = '';
                    try { seriesMatch = String(it.SeriesId || it.seriesId || ''); } catch (e0) { seriesMatch = ''; }
                    if (seriesMatch !== sid) continue;
                    var pos = 0;
                    try { pos = it && it.UserData ? parseInt(it.UserData.PlaybackPositionTicks || 0, 10) || 0 : 0; } catch (e1) { pos = 0; }
                    if (!pos) continue;
                    var t = 0;
                    try { t = it && it.UserData && it.UserData.LastPlayedDate ? Date.parse(it.UserData.LastPlayedDate) : 0; } catch (e2) { t = 0; }
                    if (!t) t = pos;
                    if (!best || t > bestTime) {
                        best = it;
                        bestTime = t;
                    }
                }
                if (best) callback(best);
                else if (onFail) onFail();
            }.bind(this), onFail);
        },

        sessionReport: function (endpoint, payload) {
            try {
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                if (!server || !endpoint) return;
                var url = server + endpoint;
                this.request(url, 'POST', payload || {}, function () {}, function () {}, { useAuthHeader: true, useTokenHeader: true, dataType: 'text', timeoutMs: 1000 * 15 });
            } catch (e0) {}
        },

        playstateRequest: function (endpoint, method) {
            try {
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                var uid = String(this.userId || '');
                if (!server || !uid || !endpoint) return;
                var url = server + endpoint;
                this.request(url, method || 'POST', {}, function () {}, function () {}, { useAuthHeader: true, useTokenHeader: true, dataType: 'text', timeoutMs: 1000 * 15 });
            } catch (e0) {}
        },

        updateUserData: function (itemId, positionTicks, played) {
            try {
                var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                var uid = String(this.userId || '');
                var id = String(itemId || '');
                if (!server || !uid || !id) return;

                var pt = 0;
                try { pt = parseInt(positionTicks, 10) || 0; } catch (e0) { pt = 0; }
                if (pt < 0) pt = 0;

                var body = { PlaybackPositionTicks: pt };
                if (typeof played !== 'undefined') body.Played = !!played;
                try { body.LastPlayedDate = (new Date()).toISOString(); } catch (e1) {}

                var url = server + '/Users/' + encodeURIComponent(uid) + '/Items/' + encodeURIComponent(id) + '/UserData';
                this.request(url, 'POST', body, function () {}, function () {}, { useAuthHeader: true, useTokenHeader: true, dataType: 'text', timeoutMs: 1000 * 15 });
            } catch (e2) {}
        },

        markPlayed: function (itemId) {
            try {
                var uid = String(this.userId || '');
                var id = String(itemId || '');
                if (!uid || !id) return;
                this.playstateRequest('/Users/' + encodeURIComponent(uid) + '/PlayedItems/' + encodeURIComponent(id), 'POST');
            } catch (e0) {}
        },

        stopPlaybackSync: function (opts) {
            var pb = this.activePlayback;
            this.activePlayback = null;

            if (pb && pb.handlers) {
                try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.remove('timeupdate', pb.handlers.timeupdate); } catch (e0) {}
                try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.remove('pause', pb.handlers.pause); } catch (e1) {}
                try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.remove('play', pb.handlers.play); } catch (e2) {}
                try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.remove('ended', pb.handlers.ended); } catch (e3) {}
                try { if (Lampa && Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.remove('destroy', pb.handlers.destroy); } catch (e4) {}
            }

            try {
                if (pb && pb.itemId && pb.playSessionId) {
                    var stopped = {
                        ItemId: pb.itemId,
                        MediaSourceId: pb.mediaSourceId || pb.itemId,
                        PositionTicks: this.secondsToTicks(pb.positionSec || 0),
                        PlaySessionId: pb.playSessionId
                    };
                    if (opts && opts.playedToCompletion) stopped.PlayedToCompletion = true;
                    this.sessionReport('/Sessions/Playing/Stopped', stopped);

                    try {
                        if (opts && opts.playedToCompletion) this.markPlayed(pb.itemId);
                        var finalTicks = this.secondsToTicks(pb.positionSec || 0);
                        if (opts && opts.playedToCompletion) this.updateUserData(pb.itemId, 0, true);
                        else this.updateUserData(pb.itemId, finalTicks, false);
                    } catch (e7) {}
                }
            } catch (e5) {}
        },

        startPlaybackSync: function (meta) {
            try {
                if (this._jfPendingDestroyTimer) { clearTimeout(this._jfPendingDestroyTimer); this._jfPendingDestroyTimer = null; }
                this._jfPendingDestroy = false;
            } catch (eClr) {}
            try { this.stopPlaybackSync({}); } catch (e0) {}

            var self = this;
            var pb = meta || {};
            pb.itemId = pb.itemId ? String(pb.itemId) : '';
            pb.mediaSourceId = pb.mediaSourceId ? String(pb.mediaSourceId) : '';
            pb.playSessionId = pb.playSessionId || (Math.random().toString(36).slice(2) + Date.now().toString(36));
            pb.playMethod = pb.playMethod || 'DirectPlay';
            pb.positionSec = pb.positionSec || 0;
            pb.durationSec = pb.durationSec || 0;
            pb.lastReportAt = 0;
            pb.lastUserDataAt = 0;
            pb.started = false;

            var updateLocal = function () {
                try {
                    if (!pb.itemId) return;
                    var itemState = {
                        positionSec: pb.positionSec || 0,
                        durationSec: pb.durationSec || 0,
                        updatedAt: Date.now(),
                        mediaSourceId: pb.mediaSourceId || '',
                        audioIndex: (typeof pb.audioIndex === 'undefined' || pb.audioIndex === null) ? '' : pb.audioIndex,
                        title: pb.title || ''
                    };
                    Jellyfin.setLocalItemState(pb.itemId, itemState);

                    if (pb.seriesId) {
                        var seriesState = {
                            itemId: pb.itemId,
                            updatedAt: Date.now(),
                            seasonNumber: pb.seasonNumber || '',
                            episodeNumber: pb.episodeNumber || '',
                            seriesName: pb.seriesName || '',
                            episodeName: pb.title || ''
                        };
                        Jellyfin.setSeriesLastState(pb.seriesId, seriesState);
                    }
                } catch (e0) {}
            };

            var reportProgress = function (paused, force) {
                try {
                    var now = Date.now();
                    if (!force && pb.lastReportAt && (now - pb.lastReportAt) < 8000) return;
                    pb.lastReportAt = now;

                    if (!pb.started) {
                        pb.started = true;
                        this.sessionReport('/Sessions/Playing', {
                            ItemId: pb.itemId,
                            MediaSourceId: pb.mediaSourceId || pb.itemId,
                            PositionTicks: this.secondsToTicks(pb.positionSec || 0),
                            PlaySessionId: pb.playSessionId,
                            CanSeek: true,
                            PlayMethod: pb.playMethod
                        });

                        try {
                            var uid = String(this.userId || '');
                            if (uid) {
                                var aidx = (typeof pb.audioIndex === 'undefined' || pb.audioIndex === null || pb.audioIndex === '') ? null : pb.audioIndex;
                                var startUrl = '/Users/' + encodeURIComponent(uid) + '/PlayingItems/' + encodeURIComponent(pb.itemId) +
                                    '?MediaSourceId=' + encodeURIComponent(pb.mediaSourceId || pb.itemId) +
                                    (aidx === null ? '' : ('&AudioStreamIndex=' + encodeURIComponent(String(aidx)))) +
                                    '&PositionTicks=' + encodeURIComponent(String(this.secondsToTicks(pb.positionSec || 0))) +
                                    '&PlaySessionId=' + encodeURIComponent(String(pb.playSessionId || '')) +
                                    '&CanSeek=true';
                                this.playstateRequest(startUrl, 'POST');
                            }
                        } catch (e2) {}
                    }

                    this.sessionReport('/Sessions/Playing/Progress', {
                        ItemId: pb.itemId,
                        MediaSourceId: pb.mediaSourceId || pb.itemId,
                        PositionTicks: this.secondsToTicks(pb.positionSec || 0),
                        IsPaused: !!paused,
                        PlaySessionId: pb.playSessionId
                    });

                    try {
                        var uid2 = String(this.userId || '');
                        if (uid2) {
                            var aidx2 = (typeof pb.audioIndex === 'undefined' || pb.audioIndex === null || pb.audioIndex === '') ? null : pb.audioIndex;
                            var progUrl = '/Users/' + encodeURIComponent(uid2) + '/PlayingItems/' + encodeURIComponent(pb.itemId) + '/Progress' +
                                '?MediaSourceId=' + encodeURIComponent(pb.mediaSourceId || pb.itemId) +
                                (aidx2 === null ? '' : ('&AudioStreamIndex=' + encodeURIComponent(String(aidx2)))) +
                                '&PositionTicks=' + encodeURIComponent(String(this.secondsToTicks(pb.positionSec || 0))) +
                                '&PlaySessionId=' + encodeURIComponent(String(pb.playSessionId || '')) +
                                '&IsPaused=' + (paused ? 'true' : 'false');
                            this.playstateRequest(progUrl, 'POST');
                        }
                    } catch (e3) {}

                    try {
                        if (!pb.lastUserDataAt || (now - pb.lastUserDataAt) > 15000) {
                            pb.lastUserDataAt = now;
                            this.updateUserData(pb.itemId, this.secondsToTicks(pb.positionSec || 0), false);
                        }
                    } catch (e4) {}
                } catch (e1) {}
            }.bind(this);

            pb.everPlayed = false;

            pb.handlers = {};
            pb.handlers.timeupdate = function (e) {
                try {
                    pb.positionSec = e && typeof e.current !== 'undefined' ? (parseFloat(e.current) || 0) : pb.positionSec;
                    pb.durationSec = e && typeof e.duration !== 'undefined' ? (parseFloat(e.duration) || 0) : pb.durationSec;
                    if (pb.positionSec > 0) pb.everPlayed = true;

                    self._jfLastKnownPositionSec = pb.positionSec;
                    self._jfLastKnownItemId = pb.itemId;
                    if (pb.everPlayed) updateLocal();
                    reportProgress(false, false);
                } catch (e0) {}
            };
            pb.handlers.pause = function () { reportProgress(true, true); };
            pb.handlers.play = function () { reportProgress(false, true); };
            pb.handlers.ended = function () {
                try {
                    if (pb.everPlayed) updateLocal();
                    this.stopPlaybackSync({ playedToCompletion: true });
                } catch (e0) {}
                try { this.stopQualityGuardWatcher(); } catch (e1) {}
            }.bind(this);
            pb.handlers.destroy = function () {
                try {

                    self._jfPendingDestroy = true;
                    if (self._jfPendingDestroyTimer) clearTimeout(self._jfPendingDestroyTimer);
                    self._jfPendingDestroyTimer = setTimeout(function () {
                        self._jfPendingDestroyTimer = null;
                        if (!self._jfPendingDestroy) return;
                        self._jfPendingDestroy = false;
                        if (self.activePlayback !== pb) return;
                        try { if (pb.everPlayed) updateLocal(); } catch (eU) {}
                        try { self.stopPlaybackSync({}); } catch (e0) {}
                        try { self.stopQualityGuardWatcher(); } catch (e1) {}
                    }, 600);
                } catch (e0) {}
            };

            this.activePlayback = pb;

            try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.follow('timeupdate', pb.handlers.timeupdate); } catch (e2) {}
            try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.follow('pause', pb.handlers.pause); } catch (e3) {}
            try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.follow('play', pb.handlers.play); } catch (e4) {}
            try { if (Lampa && Lampa.PlayerVideo && Lampa.PlayerVideo.listener) Lampa.PlayerVideo.listener.follow('ended', pb.handlers.ended); } catch (e5) {}
            try { if (Lampa && Lampa.Player && Lampa.Player.listener) Lampa.Player.listener.follow('destroy', pb.handlers.destroy); } catch (e6) {}
        },

        configureLinesUI: function () {
            var enabled = null;
            try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
            var restore = function () {
                try { Lampa.Controller.toggle(enabled && enabled.name ? enabled.name : 'settings'); } catch (e1) {}
            };

            var prefs = this.getLinePrefs();
            var order = prefs.order || [];
            var disabled = prefs.disabled || {};

            this.getLineDefs(function (defs) {
                var map = {};
                (defs || []).forEach(function (d) {
                    if (!d || !d.key) return;
                    map[d.key] = { title: d.title, desc: '' };
                });

                var modal = null;
                try { modal = (Lampa && Lampa.Modal) ? Lampa.Modal : (typeof Modal !== 'undefined' ? Modal : null); } catch (e1) { modal = null; }
                if (!modal || !modal.open || !modal.close) {
                    Lampa.Noty.show('Jellyfin: Не удалось открыть окно');
                    restore();
                    return;
                }

                var keys = Object.keys(map || {});
                keys.sort(function (a, b) {
                    var ia = order.indexOf(a);
                    var ib = order.indexOf(b);
                    if (ia === -1 && ib === -1) return String(map[a].title).localeCompare(String(map[b].title));
                    if (ia === -1) return 1;
                    if (ib === -1) return -1;
                    return ia - ib;
                });

                var buildRow = function (k) {
                    var title = '';
                    try { title = map[k] && map[k].title ? String(map[k].title) : String(k); } catch (e0) { title = String(k); }

                    var row = $([
                        '<div class="menu-edit-list__item" data-key="' + encodeURIComponent(String(k)) + '">',
                        '  <div class="menu-edit-list__icon">' + getIcon() + '</div>',
                        '  <div class="menu-edit-list__title"></div>',
                        '  <div class="menu-edit-list__move move-up selector">',
                        '    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
                        '  </div>',
                        '  <div class="menu-edit-list__move move-down selector">',
                        '    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
                        '  </div>',
                        '  <div class="menu-edit-list__toggle toggle selector">',
                        '    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/></svg>',
                        '  </div>',
                        '</div>'
                    ].join(''));

                    row.find('.menu-edit-list__title').text(title);

                    var applyState = function () {
                        var off = !!disabled[k];
                        row.toggleClass('hidden', off);
                        row.find('.dot').attr('opacity', off ? 0 : 1);
                    };

                    row.find('.move-up').on('hover:enter', function () {
                        var prev = row.prev();
                        if (prev.length) row.insertBefore(prev);
                    });

                    row.find('.move-down').on('hover:enter', function () {
                        var next = row.next();
                        if (next.length) row.insertAfter(next);
                    });

                    row.find('.toggle').on('hover:enter', function () {
                        if (disabled[k]) delete disabled[k];
                        else disabled[k] = true;
                        applyState();
                    });

                    applyState();
                    return row;
                };

                var listEl = $('<div class="menu-edit-list jf-lines-edit-list"></div>');
                keys.forEach(function (k) { listEl.append(buildRow(k)); });

                try {
                    if (!document.getElementById('jf-lines-edit-style')) {
                        $('body').append(
                            '<style id="jf-lines-edit-style">' +
                            '.jf-lines-edit-list{width:100%}' +
                            '.jf-lines-edit-list .menu-edit-list__title{white-space:normal !important;overflow:visible !important;text-overflow:clip !important;line-height:1.25}' +
                            '</style>'
                        );
                    }
                } catch (eCss0) {}

                modal.open({
                    title: 'Редактировать',
                    html: listEl,
                    size: 'medium',
                    scroll_to_center: true,
                    onBack: function () {
                        var outOrder = [];
                        listEl.find('.menu-edit-list__item').each(function () {
                            var raw = $(this).attr('data-key') || '';
                            try { outOrder.push(decodeURIComponent(raw)); } catch (e0) { outOrder.push(raw); }
                        });

                        Jellyfin.setLinePrefs({ order: outOrder.filter(Boolean), disabled: disabled });
                        try { modal.close(); } catch (e1) {}
                        restore();
                    }
                });

                try {
                    var $modalBlock = listEl.closest('.modal__block');
                    if ($modalBlock.length) $modalBlock.css({ width: '44em', 'max-width': '92vw' });
                } catch (eWide0) {}
            });
        },

        parseLocalUrl: function (url) {
            var raw = String(url || '');
            raw = raw.replace(/^jellyfin:\/*/i, '');
            var out = { path: '', query: {} };
            try {
                var parts = raw.split('?');
                out.path = parts[0] || '';
                if (parts[1]) {
                    parts[1].split('&').forEach(function (p) {
                        if (!p) return;
                        var kv = p.split('=');
                        var k = decodeURIComponent(kv[0] || '');
                        var v = decodeURIComponent(kv.slice(1).join('=') || '');
                        if (k) out.query[k] = v;
                    });
                }
            } catch (e0) {}
            return out;
        },

        jellyfinToCard: function (it, opts) {
            try {
                if (!it || !it.Id) return null;
                var options = opts && typeof opts === 'object' ? opts : {};
                var forceJellyfinSource = options.forceJellyfinSource || false;

                var providers = it.ProviderIds || it.Providerids || {};
                var tmdb = forceJellyfinSource ? '' : (providers && (providers.Tmdb || providers.tmdb || providers.TMDb || ''));
                tmdb = tmdb ? String(tmdb) : '';

                var type = String(it.Type || '').toLowerCase();
                var isSeries = type === 'series';
                var isEpisode = type === 'episode';
                var date = '';
                try { date = String(it.PremiereDate || it.ProductionYear || '').slice(0, 10); } catch (e1) { date = ''; }

                var resumePosSec = 0;
                var resumeDurSec = 0;
                var resumePercent = 0;
                try { resumePosSec = it && it.UserData ? this.ticksToSeconds(it.UserData.PlaybackPositionTicks || 0) : 0; } catch (ePos0) { resumePosSec = 0; }
                try { resumeDurSec = this.ticksToSeconds(it.RunTimeTicks || 0); } catch (eDur0) { resumeDurSec = 0; }
                try { resumePercent = it && it.UserData && typeof it.UserData.PlayedPercentage !== 'undefined' ? (parseFloat(it.UserData.PlayedPercentage) || 0) : 0; } catch (ePct0) { resumePercent = 0; }
                if (!resumePercent && resumeDurSec > 0 && resumePosSec > 0) resumePercent = (resumePosSec / resumeDurSec) * 100;
                if (resumePercent < 0) resumePercent = 0;
                if (resumePercent > 100) resumePercent = 100;

                var imgUrl = '';
                if (forceJellyfinSource) {
                    if (isEpisode && it.SeriesId) {
                        imgUrl = this.buildImageUrl(it.SeriesId, 'thumb') || this.buildImageUrl(it.SeriesId, 'primary') || this.buildImageUrl(it.SeriesId, 'backdrop');
                    } else {
                        imgUrl = this.buildImageUrl(it.Id, 'thumb') || this.buildImageUrl(it.Id, 'primary') || this.buildImageUrl(it.Id, 'backdrop');
                    }
                } else if (isEpisode) {
                    imgUrl = this.buildImageUrl(it.SeriesId || it.Id, 'primary') || this.buildImageUrl(it.SeriesId || it.Id, 'backdrop');
                } else {
                    imgUrl = this.buildImageUrl(it.Id, 'primary') || this.buildImageUrl(it.Id, 'backdrop') || (it.SeriesId ? (this.buildImageUrl(it.SeriesId, 'primary') || this.buildImageUrl(it.SeriesId, 'backdrop')) : '');
                }

                var card = {
                    jellyfin_item_id: String(it.Id),
                    card_type: (isSeries || isEpisode) ? 'tv' : 'movie',
                    source: (forceJellyfinSource || isEpisode) ? 'jellyfin' : ((tmdb && !isEpisode) ? 'tmdb' : 'jellyfin'),
                    id: (forceJellyfinSource || isEpisode) ? String(it.Id) : ((tmdb && !isEpisode) ? tmdb : String(it.Id)),
                    img: imgUrl,
                    poster: forceJellyfinSource ? imgUrl : undefined,
                    background_image: this.buildImageUrl(isEpisode ? (it.SeriesId || it.Id) : it.Id, 'backdrop')
                };

                if (isEpisode) {
                    var seriesName = it.SeriesName || it.seriesName || 'Эпизод';
                    var seasonNo = it.ParentIndexNumber || it.SeasonNumber || '';
                    var epNo = it.IndexNumber || '';
                    card.name = seriesName;
                    card.original_name = seriesName;
                    card.episode_name = it.Name || '';
                    if (it.SeriesId) card.jellyfin_series_id = String(it.SeriesId);
                } else if (isSeries) {
                    card.name = it.Name || '';
                    card.original_name = it.OriginalTitle || it.Name || '';
                    if (date && date.length >= 4) card.first_air_date = date;
                } else {
                    card.title = it.Name || '';
                    card.original_title = it.OriginalTitle || it.Name || '';
                    if (date && date.length >= 4) card.release_date = date;
                }

                var localSeries = null;
                if (isSeries) {
                    try { localSeries = this.getSeriesLastState(it.Id); } catch (eLS0) { localSeries = null; }
                    try {
                        if ((!resumePosSec || !resumeDurSec) && localSeries && localSeries.itemId) {
                            var localEp = this.getLocalItemState(localSeries.itemId);
                            if (localEp) {
                                if (!resumePosSec && localEp.positionSec) resumePosSec = parseFloat(localEp.positionSec) || 0;
                                if (!resumeDurSec && localEp.durationSec) resumeDurSec = parseFloat(localEp.durationSec) || 0;
                            }
                        }
                    } catch (eLS1) {}
                    if (!resumePercent && resumeDurSec > 0 && resumePosSec > 0) resumePercent = (resumePosSec / resumeDurSec) * 100;
                    if (resumePercent < 0) resumePercent = 0;
                    if (resumePercent > 100) resumePercent = 100;
                }

                var hasEpisodeState = false;
                try { hasEpisodeState = !!(localSeries && (localSeries.seasonNumber || localSeries.episodeNumber)); } catch (eES0) { hasEpisodeState = false; }

                if (resumeDurSec > 0 || resumePosSec > 0 || resumePercent > 0 || hasEpisodeState) {
                    var epLabel2 = '';
                    if (isEpisode) {
                        var sNo = '';
                        var eNo = '';
                        try { sNo = String(it.ParentIndexNumber || it.SeasonNumber || ''); } catch (eE0) { sNo = ''; }
                        try { eNo = String(it.IndexNumber || ''); } catch (eE1) { eNo = ''; }
                        if (sNo || eNo) epLabel2 = 'S' + (sNo || '?') + 'E' + (eNo || '?');
                    } else if (isSeries && hasEpisodeState) {
                        var sNo2 = '';
                        var eNo2 = '';
                        try { sNo2 = String(localSeries.seasonNumber || ''); } catch (eSE0) { sNo2 = ''; }
                        try { eNo2 = String(localSeries.episodeNumber || ''); } catch (eSE1) { eNo2 = ''; }
                        if (sNo2 || eNo2) epLabel2 = 'S' + (sNo2 || '?') + 'E' + (eNo2 || '?');
                    }

                    var durStr = resumeDurSec > 0 ? this.formatSecondsShort(resumeDurSec) : '';
                    var posStr = resumePosSec > 0 ? this.formatSecondsShort(resumePosSec) : '';
                    var timeLabel = '';
                    if (durStr && posStr) timeLabel = posStr + '/' + durStr;
                    else timeLabel = durStr || posStr || '';

                    card.jellyfin_resume = {
                        hash: 'jf:' + String(it.Id),
                        percent: resumePercent,
                        episodeLabel: epLabel2,
                        timeLabel: timeLabel
                    };
                }

                try {
                    if (it.CommunityRating) card.vote_average = parseFloat(it.CommunityRating) || 0;
                } catch (e2) {}
                try {
                    if (it.Overview) card.overview = String(it.Overview);
                } catch (e3) {}

                if (tmdb && !isEpisode) this.rememberTmdbMapping(isSeries ? 'tv' : 'movie', tmdb, it.Id);

                return card;
            } catch (e0) {
                return null;
            }
        },

        boxsetToCard: function (it) {
            try {
                if (!it || !it.Id) return null;
                var childCount = 0;
                try { childCount = parseInt(it.ChildCount, 10) || 0; } catch (e0) { childCount = 0; }
                if (!childCount) {
                    try { childCount = parseInt(it.RecursiveItemCount, 10) || 0; } catch (e1) { childCount = 0; }
                }
                if (!childCount) {
                    try { childCount = parseInt(it.ItemCount, 10) || 0; } catch (e2) { childCount = 0; }
                }
                return {
                    id: String(it.Id),
                    jellyfin_id: String(it.Id),
                    jellyfin_boxset_id: String(it.Id),
                    source: 'jellyfin',
                    title: it.Name || '',
                    img: this.buildImageUrl(it.Id, 'primary') || '',
                    child_count: childCount,
                    _collection: true
                };
            } catch (e0) {
                return null;
            }
        },

        libraryViewCard: function (view, kind) {
            try {
                if (!view || !view.Id) return null;
                return {
                    jellyfin_view_id: String(view.Id),
                    title: view.Name || 'Библиотека',
                    img: this.buildImageUrl(view.Id, 'primary') || this.buildImageUrl(view.Id, 'backdrop') || '',
                    img_backdrop: this.buildImageUrl(view.Id, 'backdrop') || '',
                    kind: kind || 'media'
                };
            } catch (e0) {
                return null;
            }
        },

        browseItems: function (kind, parentId, page, callback, onFail) {
            this.authenticate(function () {
                try {
                    var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                    var token = String(this.token || '');
                    var uid = String(this.userId || '');
                    if (!server || !token || !uid) {
                        if (onFail) onFail();
                        return;
                    }

                    var reqPage = parseInt(page, 10) || 1;
                    if (reqPage < 1) reqPage = 1;
                    var pageSize = 40;
                    var startIndex = Math.max(0, (reqPage - 1) * pageSize);

                    var query = [];
                    query.push('StartIndex=' + startIndex);
                    query.push('Limit=' + pageSize);
                    query.push('SortBy=SortName');
                    query.push('SortOrder=Ascending');
                    if (parentId) query.push('ParentId=' + encodeURIComponent(String(parentId)));

                    if (kind === 'boxset') {
                        query.push('Recursive=false');
                        query.push('Fields=ChildCount,RecursiveItemCount,ItemCount');
                    } else {
                        query.push('Recursive=false');
                        query.push('Fields=ChildCount,ProviderIds,PremiereDate,ProductionYear,CommunityRating,Type,OriginalTitle');
                    }
                    query.push('api_key=' + encodeURIComponent(token));

                    var url = server + '/Users/' + encodeURIComponent(uid) + '/Items?' + query.join('&');

                    var timeout = (kind === 'boxset') ? 20 : 15;

                    this.request(url, 'GET', null, function (res) {
                        var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                        var total = 0;
                        try { total = parseInt(res.TotalRecordCount || res.totalRecordCount || 0, 10) || 0; } catch (e0) { total = 0; }

                        var cards = [];
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (!item) continue;
                            var itemType = String(item.Type || item.type || '').toLowerCase();

                            var c;
                            if (itemType === 'boxset' || itemType === 'playlist') {
                                c = this.boxsetToCard(item);
                            } else {
                                c = this.jellyfinToCard(item);
                            }
                            if (c) cards.push(c);
                        }
                        if (kind !== 'boxset') cards = this.dedupeCards(cards);
                        callback({ cards: cards, total: total });
                    }.bind(this), function (err) {
                        if (onFail) onFail(err);
                    }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * timeout });
                } catch (e1) {
                    if (onFail) onFail();
                }
            }.bind(this));
        },

        dedupeCards: function (cards) {
            var out = [];
            var seen = {};
            for (var i = 0; i < (cards || []).length; i++) {
                var c = cards[i];
                if (!c) continue;
                var key = '';
                try {
                    if (c.source === 'tmdb') key = 'tmdb:' + String(c.card_type || (c.name ? 'tv' : 'movie')) + ':' + String(c.id || '');
                    else key = 'jf:' + String(c.jellyfin_item_id || c.jellyfin_boxset_id || c.id || '');
                } catch (e0) {
                    key = '';
                }
                if (!key) continue;
                if (seen[key]) continue;
                seen[key] = true;
                out.push(c);
            }
            return out;
        },

        libraryItems: function (mode, media, page, callback, onFail, onlyTmdb, opts) {
            this.authenticate(function () {
                try {
                    var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                    var token = String(this.token || '');
                    var uid = String(this.userId || '');
                    if (!server || !token || !uid) {
                        if (onFail) onFail();
                        return;
                    }

                    var reqPage = parseInt(page, 10) || 1;
                    if (reqPage < 1) reqPage = 1;
                    var startIndex = Math.max(0, (reqPage - 1) * 20);
                    var base = server + '/Users/' + encodeURIComponent(uid) + '/Items';
                    var query = [];
                    query.push('Recursive=' + (media === 'boxset' ? 'false' : 'true'));
                    query.push('StartIndex=' + startIndex);
                    query.push('Limit=20');

                    if (mode === 'resume') {
                        query.push('Fields=ProviderIds,PremiereDate,ProductionYear,CommunityRating,Type,UserData,SeriesId,SeriesName,ParentIndexNumber,IndexNumber,RunTimeTicks');
                    } else {
                        query.push('Fields=ProviderIds,PremiereDate,ProductionYear,CommunityRating,Type,ChildCount,RecursiveItemCount,ItemCount');
                    }

                    if (mode === 'resume') {
                        base = server + '/Users/' + encodeURIComponent(uid) + '/Items/Resume';
                    } else {
                        var types = (media === 'tv') ? 'Series' : (media === 'boxset' ? 'BoxSet,Playlist' : 'Movie');
                        query.push('IncludeItemTypes=' + types);
                        if (mode === 'premiere') query.push('SortBy=PremiereDate,DateCreated');
                        else query.push('SortBy=DateCreated');
                        query.push('SortOrder=Descending');
                    }

                    try {
                        if (opts && opts.parentId) query.push('ParentId=' + encodeURIComponent(String(opts.parentId)));
                        if (opts && opts.genre) query.push('Genres=' + encodeURIComponent(String(opts.genre)));
                    } catch (e0) {}

                    query.push('api_key=' + encodeURIComponent(token));

                    var url = base + '?' + query.join('&');

                    this.request(url, 'GET', null, function (res) {
                        var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                        var total = 0;
                        try { total = parseInt(res.TotalRecordCount || res.totalRecordCount || res.Total || 0, 10) || 0; } catch (e0) { total = 0; }

                        var cards = [];
                        for (var i = 0; i < items.length; i++) {
                            var it = items[i];
                            if (!it) continue;
                            var itemType = '';
                            try { itemType = String(it.Type || it.type || '').toLowerCase(); } catch (eT0) { itemType = ''; }
                            var c;
                            if (itemType === 'boxset' || itemType === 'playlist') c = this.boxsetToCard(it);
                            else c = this.jellyfinToCard(it, { forceJellyfinSource: mode === 'resume' });
                            if (!c) continue;
                            if (mode === 'resume') {
                                c.jellyfin_resume_line = true;
                                if (itemType === 'series') c.jellyfin_resume_series_id = String(it.Id || '');
                            }
                            cards.push(c);
                        }

                        cards = this.dedupeCards(cards).slice(0, 20);
                        callback({ cards: cards, total: total });
                    }.bind(this), function (err) {
                        if (onFail) onFail(err);
                    }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 15 });
                } catch (e1) {
                    if (onFail) onFail();
                }
            }.bind(this));
        },

        getViews: function (callback, onFail) {
            this.authenticate(function () {
                try {
                    var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
                    var token = String(this.token || '');
                    var uid = String(this.userId || '');
                    if (!server || !token || !uid) {
                        if (onFail) onFail();
                        return;
                    }

                    var url = server + '/UserViews?userId=' + encodeURIComponent(uid) + '&api_key=' + encodeURIComponent(token);
                    this.request(url, 'GET', null, function (res) {
                        var items = (res && (res.Items || res.items)) ? (res.Items || res.items) : [];
                        callback(items || []);
                    }.bind(this), function (err) {
                        if (onFail) onFail(err);
                    }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 15 });
                } catch (e0) {
                    if (onFail) onFail();
                }
            }.bind(this));
        },

        getLineDefs: function (callback) {
            var fallbackDefs = function () {
                return [
                    { key: 'jellyfin://latest?type=movie&parentId=', title: 'Последние фильмы', mode: 'latest', media: 'movie', parentId: '' },
                    { key: 'jellyfin://latest?type=tv&parentId=', title: 'Последние сериалы', mode: 'latest', media: 'tv', parentId: '' },
                    { key: 'jellyfin://premiere?type=movie&parentId=', title: 'Новинки (фильмы)', mode: 'premiere', media: 'movie', parentId: '' }
                ];
            };

            var resumeDef = { key: 'jellyfin://resume', title: 'Продолжить просмотр', mode: 'resume', media: 'all', parentId: '' };

            var NON_VIDEO_TYPES = { music: true, musicvideos: true, books: true, photos: true };

            this.getViews(function (views) {
                var list = Array.isArray(views) ? views : [];
                var defs = [resumeDef];
                var seen = {};

                var addDef = function (media, mode, name, parentId) {
                    var key = 'jellyfin://' + mode + '?type=' + encodeURIComponent(media) + '&parentId=' + encodeURIComponent(String(parentId));
                    if (seen[key]) return;
                    seen[key] = true;
                    var titlePrefix = mode === 'premiere' ? 'Новинки (' + name + ')' : 'Недавно добавлено в ' + name;
                    defs.push({ key: key, title: titlePrefix, mode: mode, media: media, parentId: String(parentId) });
                };

                for (var i = 0; i < list.length; i++) {
                    var v = list[i];
                    if (!v || !v.Id) continue;
                    var ct = '';
                    try { ct = String(v.CollectionType || v.collectionType || '').toLowerCase(); } catch (e0) { ct = ''; }
                    if (NON_VIDEO_TYPES[ct]) continue;

                    var name = '';
                    try { name = String(v.Name || v.name || '').trim(); } catch (e2) { name = ''; }

                    if (ct === 'movies') {
                        var mName = name || 'Фильмы';
                        addDef('movie', 'latest', mName, v.Id);
                        addDef('movie', 'premiere', mName, v.Id);
                    } else if (ct === 'tvshows') {
                        addDef('tv', 'latest', name || 'Сериалы', v.Id);
                    } else if (ct === 'playlists') {
                        addDef('boxset', 'latest', name || 'Франшизы', v.Id);
                    } else {
                        var genName = name || 'Библиотека';
                        addDef('movie', 'latest', genName, v.Id);
                        addDef('movie', 'premiere', genName, v.Id);
                        addDef('tv', 'latest', genName, v.Id);
                    }
                }

                if (defs.length <= 1) defs = defs.concat(fallbackDefs());

                callback(defs);
            }, function (err) {
                try { console.warn('[Jellyfin] UserViews не загрузились, использую fallback', err); } catch (eLogF) {}
                callback([resumeDef].concat(fallbackDefs()));
            });
        },

        buildMainLines: function (oncomplite, onerror) {
            var self = this;

            self.getViews(function (allViews) {                var viewList = Array.isArray(allViews) ? allViews : [];
                var NON_VIDEO_TYPES = { music: true, musicvideos: true, books: true, photos: true };

                var libCards = [];
                for (var vi = 0; vi < viewList.length; vi++) {
                    var vv = viewList[vi];
                    if (!vv || !vv.Id) continue;
                    var vct = '';
                    try { vct = String(vv.CollectionType || vv.collectionType || '').toLowerCase(); } catch (e0) { vct = ''; }
                    if (vct === 'music' || vct === 'musicvideos' || vct === 'books' || vct === 'photos' || vct === 'livetv' || vct === 'trailers') continue;
                    var vkind = (vct === 'boxsets') ? 'boxset' : 'media';
                    var lc = self.libraryViewCard(vv, vkind);
                    if (lc) libCards.push(lc);
                }

                var lines = [];
                var lineSeen = {};
                var pushLine = function (line) {
                    try {
                        var k = (line && (line.url || line.title)) ? String(line.url || line.title) : '';
                        if (!k || lineSeen[k]) return;
                        lineSeen[k] = true;
                        lines.push(line);
                    } catch (e0) {}
                };

                var libLine = null;
                if (libCards.length) {
                    libLine = {
                        title: 'Мои медиатеки',
                        url: 'jellyfin://libraries',
                        results: libCards,
                        cardClass: function (item) { return new JellyfinLibraryCard(item); },
                        total_pages: 1
                    };
                    pushLine(libLine);
                }

                var fallbackDefs = [
                    { key: 'jellyfin://latest?type=movie&parentId=', title: 'Последние фильмы', mode: 'latest', media: 'movie', parentId: '' },
                    { key: 'jellyfin://latest?type=tv&parentId=', title: 'Последние сериалы', mode: 'latest', media: 'tv', parentId: '' },
                    { key: 'jellyfin://premiere?type=movie&parentId=', title: 'Новинки (фильмы)', mode: 'premiere', media: 'movie', parentId: '' }
                ];
                var resumeDef = { key: 'jellyfin://resume', title: 'Продолжить просмотр', mode: 'resume', media: 'all', parentId: '' };

                var defs = [resumeDef];
                var seenDef = {};
                var addDef = function (media, mode, name, parentId) {
                    var key = 'jellyfin://' + mode + '?type=' + encodeURIComponent(media) + '&parentId=' + encodeURIComponent(String(parentId));
                    if (seenDef[key]) return;
                    seenDef[key] = true;
                    var titlePrefix = mode === 'premiere' ? 'Новинки (' + name + ')' : 'Недавно добавлено в ' + name;
                    defs.push({ key: key, title: titlePrefix, mode: mode, media: media, parentId: String(parentId) });
                };

                for (var i = 0; i < viewList.length; i++) {
                    var v = viewList[i];
                    if (!v || !v.Id) continue;
                    var ct = '';
                    try { ct = String(v.CollectionType || v.collectionType || '').toLowerCase(); } catch (e1) { ct = ''; }
                    if (NON_VIDEO_TYPES[ct]) continue;
                    var name = '';
                    try { name = String(v.Name || v.name || '').trim(); } catch (e2) { name = ''; }

                    if (ct === 'movies') {
                        addDef('movie', 'latest', name || 'Фильмы', v.Id);
                        addDef('movie', 'premiere', name || 'Фильмы', v.Id);
                    } else if (ct === 'tvshows') {
                        addDef('tv', 'latest', name || 'Сериалы', v.Id);
                    } else if (ct === 'boxsets') {
                    } else if (ct === 'playlists') {
                        addDef('boxset', 'latest', name || 'Франшизы', v.Id);
                    } else {
                        var genName = name || 'Библиотека';
                        addDef('movie', 'latest', genName, v.Id);
                        addDef('movie', 'premiere', genName, v.Id);
                        addDef('tv', 'latest', genName, v.Id);
                    }
                }

                if (defs.length <= 1) defs = defs.concat(fallbackDefs);

                var total = defs.length;
                var done = 0;
                var nextIdx = Math.min(5, total);
                var okCount = 0;
                var failCount = 0;
                var emptyCount = 0;
                var firstErr = null;

                var finalize = function () {
                    if (okCount === 0 && total > 1 && (failCount + emptyCount) > 0) {
                        try {
                            var st = firstErr ? (' [' + (firstErr.status || firstErr.decode_code || firstErr.code || '') + ']') : '';
                            Lampa.Noty.show('Jellyfin: ленты не загрузились' + st);
                        } catch (eN) {}
                    }
                    var visible = self.applyLinePrefs(lines.filter(function (l) { return l && l.results && l.results.length; }));
                    if (libLine && libLine.results && libLine.results.length) {
                        var idx2 = visible.indexOf(libLine);
                        if (idx2 > 0) { visible.splice(idx2, 1); visible.unshift(libLine); }
                        else if (idx2 === -1) { visible.unshift(libLine); }
                    }
                    oncomplite(visible);
                };

                var oneDone = function () {
                    done++;
                    if (nextIdx < total) runOne(nextIdx++);
                    if (done >= total) finalize();
                };

                var runOne = function (i) {
                    var def = defs[i];
                    var opts = def.parentId ? { parentId: def.parentId } : {};
                    self.libraryItems(def.mode, def.media, 1, function (data) {
                        if (data && data.cards && data.cards.length) okCount++; else emptyCount++;
                        var line = {
                            title: 'Jellyfin \u2022 ' + def.title,
                            url: def.key,
                            results: data.cards || [],
                            total_pages: Math.max(1, Math.ceil((data.total || 0) / 20))
                        };
                        if (def.mode === 'resume') {
                            line.cardClass = function (item) { return new JellyfinResumeCard(item); };
                        }
                        var hasBoxsets = false;
                        for (var bi = 0; bi < (line.results || []).length; bi++) {
                            if (line.results[bi] && line.results[bi].jellyfin_boxset_id) { hasBoxsets = true; break; }
                        }
                        if (hasBoxsets) {
                            line.cardClass = function (item) { return new JellyfinFolderCard(item, 'boxset'); };
                        }
                        pushLine(line);
                        oneDone();
                    }, function (err) {
                        failCount++;
                        if (!firstErr) firstErr = err;
                        try { console.warn('[Jellyfin] лента "' + def.title + '" упала', err); } catch (e0) {}
                        oneDone();
                    }, true, opts);
                };

                if (total === 0) {
                    finalize();
                } else {
                    for (var pi = 0; pi < Math.min(5, total); pi++) runOne(pi);
                }

            }, function () {
                try { console.warn('[Jellyfin] getViews не загрузился'); } catch (e0) {}
                oncomplite([]);
            });
        },

        fetchBrowseData: function (object, callback, onFail) {
            try {
                var parsed = this.parseLocalUrl((object && object.url) || '');
                var parentId = parsed.query.parentId || '';
                var kind = parsed.query.kind === 'boxset' ? 'boxset' : 'media';
                var title = parsed.query.title || (object && object.title) || 'Jellyfin';
                var page = parseInt(object && object.page, 10) || 1;

                this.browseItems(kind, parentId, page, function (data) {
                    var lineData = {
                        title: title,
                        results: data.cards,
                        page: page,
                        total_pages: Math.max(1, Math.ceil((data.total || 0) / 40)),
                        total_results: data.total || 0
                    };
                    var hasBoxsets = false;
                    if (kind === 'boxset') {
                        hasBoxsets = true;
                    } else {
                        for (var ci = 0; ci < (data.cards || []).length; ci++) {
                            if (data.cards[ci] && data.cards[ci].jellyfin_boxset_id) { hasBoxsets = true; break; }
                        }
                    }
                    if (hasBoxsets) {
                        lineData.cardClass = function (item) {
                            return new JellyfinFolderCard(item, kind);
                        };
                    }
                    callback(lineData);
                }, function () {
                    if (onFail) onFail();
                });
            } catch (e0) {
                if (onFail) onFail();
            }
        },

        registerSearch: function () {
            if (this.searchRegistered) return;
            if (!Lampa || !Lampa.Search || !Lampa.Search.addSource) return;
            this.searchRegistered = true;

            var searchJellyfin = function (params, oncomplite) {
                var query = '';
                try {
                    query = params && params.query ? decodeURIComponent(params.query) : '';
                } catch (e) {
                    query = params && params.query ? params.query : '';
                }

                query = (query || '').toString().trim();
                if (!query) return oncomplite([]);

                Jellyfin.authenticate(function () {
                    var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');

                    var params = [
                        'searchTerm=' + encodeURIComponent(query),
                        'includeItemTypes=Movie,Series,BoxSet,Playlist',
                        'limit=50',
                        'includePeople=false',
                        'includeMedia=true',
                        'includeGenres=false',
                        'includeStudios=false',
                        'includeArtists=false',
                        'userId=' + encodeURIComponent(Jellyfin.userId)
                    ];

                    var url = server + '/Search/Hints?' + params.join('&');

                    Jellyfin.request(url, 'GET', null, function (data) {

                        var items = (data && Array.isArray(data.SearchHints)) ? data.SearchHints : [];

                        var movies = [];
                        var series = [];
                        var boxsets = [];
                        var playlists = [];

                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            var itemType = String(item.Type || '').toLowerCase();

                            var fullItem = {
                                Id: item.Id,
                                Name: item.Name,
                                Type: item.Type,
                                ProductionYear: item.ProductionYear,
                                IndexNumber: item.IndexNumber,
                                ParentIndexNumber: item.ParentIndexNumber,
                                ItemCount: item.ItemCount || 0,
                                ImageTags: item.ImageTags || {},
                                BackdropImageTags: item.BackdropImageTags || [],
                                UserData: item.UserData || {},
                                SeriesId: item.SeriesId,
                                SeriesName: item.Series,
                                RunTimeTicks: item.RunTimeTicks
                            };

                            var card = null;

                            if (itemType === 'movie') {
                                card = Jellyfin.jellyfinToCard(fullItem);
                                if (card) movies.push(card);
                            } else if (itemType === 'series') {
                                card = Jellyfin.jellyfinToCard(fullItem);
                                if (card) series.push(card);
                            } else if (itemType === 'boxset') {
                                fullItem.ChildCount = item.ChildCount || 0;
                                fullItem.RecursiveItemCount = item.ChildCount || 0;
                                fullItem.ItemCount = item.ItemCount || 0;
                                card = Jellyfin.boxsetToCard(fullItem);
                                if (card) {
                                    card._isBoxset = true;
                                    boxsets.push(card);
                                }
                            } else if (itemType === 'playlist') {
                                fullItem.ChildCount = item.ChildCount || 0;
                                fullItem.RecursiveItemCount = item.ChildCount || 0;
                                fullItem.ItemCount = item.ItemCount || 0;
                                card = Jellyfin.boxsetToCard(fullItem);
                                if (card) {
                                    card._isPlaylist = true;
                                    playlists.push(card);
                                }
                            }
                        }

                        var finish = function () {
                            var results = [];

                            if (movies.length > 0) {
                                results.push({
                                    title: 'Jellyfin • Фильмы',
                                    results: movies
                                });
                            }

                            if (series.length > 0) {
                                results.push({
                                    title: 'Jellyfin • Сериалы',
                                    results: series
                                });
                            }

                            if (boxsets.length > 0) {
                                results.push({
                                    title: 'Jellyfin • Коллекции',
                                    results: boxsets,
                                    cardClass: function (item) {
                                        return new JellyfinFolderCard(item, 'media');
                                    }
                                });
                            }

                            if (playlists.length > 0) {
                                results.push({
                                    title: 'Jellyfin • Франшизы',
                                    results: playlists,
                                    cardClass: function (item) {
                                        return new JellyfinFolderCard(item, 'boxset');
                                    }
                                });
                            }

                            oncomplite(results);
                        };

                        try {
                            var ids = [];
                            var seenIds = {};
                            var pushId = function (id) {
                                try { id = String(id || ''); } catch (e0) { id = ''; }
                                if (!id) return;
                                if (seenIds[id]) return;
                                seenIds[id] = true;
                                ids.push(id);
                            };
                            for (var bi = 0; bi < boxsets.length; bi++) pushId(boxsets[bi] && boxsets[bi].jellyfin_boxset_id);
                            for (var pi = 0; pi < playlists.length; pi++) pushId(playlists[pi] && playlists[pi].jellyfin_boxset_id);

                            if (!ids.length) return finish();

                            var fetchCountsPerItem = function (idsList, done) {
                                var outMap = {};
                                var inFlight = 0;
                                var idx = 0;
                                var limit = 3;

                                var parseCount = function (obj) {
                                    var cnt = 0;
                                    try { cnt = parseInt(obj && obj.ChildCount, 10) || 0; } catch (e0) { cnt = 0; }
                                    if (!cnt) { try { cnt = parseInt(obj && obj.RecursiveItemCount, 10) || 0; } catch (e1) { cnt = 0; } }
                                    if (!cnt) { try { cnt = parseInt(obj && obj.ItemCount, 10) || 0; } catch (e2) { cnt = 0; } }
                                    return cnt;
                                };

                                var step = function () {
                                    if (idx >= idsList.length && inFlight <= 0) return done(outMap);
                                    while (inFlight < limit && idx < idsList.length) {
                                        var oneId = idsList[idx++];
                                        inFlight++;
                                        (function (reqId) {
                                            var oneUrl = server + '/Users/' + encodeURIComponent(Jellyfin.userId) + '/Items/' + encodeURIComponent(reqId) + '?Fields=ChildCount,RecursiveItemCount,ItemCount&api_key=' + encodeURIComponent(Jellyfin.token || '');
                                            Jellyfin.request(oneUrl, 'GET', null, function (oneRes) {
                                                try {
                                                    var idr = '';
                                                    try { idr = String(oneRes && (oneRes.Id || oneRes.id) || ''); } catch (e2) { idr = ''; }
                                                    if (!idr) {
                                                        try { idr = String(reqId || ''); } catch (e3) { idr = ''; }
                                                    }
                                                    var ccc = parseCount(oneRes);
                                                    if (idr && ccc > 0) outMap[idr] = ccc;
                                                } catch (e4) {}
                                                inFlight--;
                                                step();
                                            }, function () {
                                                inFlight--;
                                                step();
                                            }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 10 });
                                        })(oneId);
                                    }
                                };

                                step();
                            };

                            var urlCounts = server + '/Users/' + encodeURIComponent(Jellyfin.userId) + '/Items?Ids=' + encodeURIComponent(ids.join(',')) + '&Recursive=false&IncludeItemTypes=BoxSet,Playlist&Fields=ChildCount,RecursiveItemCount,ItemCount&api_key=' + encodeURIComponent(Jellyfin.token || '');
                            Jellyfin.request(urlCounts, 'GET', null, function (res2) {
                                try {
                                    var items2 = (res2 && (res2.Items || res2.items)) ? (res2.Items || res2.items) : [];
                                    var map = {};
                                    for (var ci = 0; ci < items2.length; ci++) {
                                        var it2 = items2[ci];
                                        if (!it2) continue;
                                        var id2 = '';
                                        try { id2 = String(it2.Id || it2.id || ''); } catch (e1) { id2 = ''; }
                                        if (!id2) continue;
                                        var cnt2 = 0;
                                        try { cnt2 = parseInt(it2.ChildCount, 10) || 0; } catch (e2) { cnt2 = 0; }
                                        if (!cnt2) { try { cnt2 = parseInt(it2.RecursiveItemCount, 10) || 0; } catch (e3) { cnt2 = 0; } }
                                        if (!cnt2) { try { cnt2 = parseInt(it2.ItemCount, 10) || 0; } catch (e4) { cnt2 = 0; } }
                                        if (cnt2 > 0) map[id2] = cnt2;
                                    }

                                    var applyCounts = function (arr) {
                                        for (var ai = 0; ai < (arr || []).length; ai++) {
                                            var c = arr[ai];
                                            if (!c) continue;
                                            var cid = '';
                                            try { cid = String(c.jellyfin_boxset_id || c.jellyfin_id || c.id || ''); } catch (e4) { cid = ''; }
                                            if (!cid) continue;
                                            if (map[cid] && (!c.child_count || (parseInt(c.child_count, 10) || 0) <= 0)) {
                                                c.child_count = map[cid];
                                            }
                                        }
                                    };
                                    if (Object.keys(map).length) {
                                        applyCounts(boxsets);
                                        applyCounts(playlists);
                                        finish();
                                        return;
                                    }

                                    fetchCountsPerItem(ids, function (map2) {
                                        try {
                                            var applyCounts2 = function (arr) {
                                                for (var ai2 = 0; ai2 < (arr || []).length; ai2++) {
                                                    var c2 = arr[ai2];
                                                    if (!c2) continue;
                                                    var cid2 = '';
                                                    try { cid2 = String(c2.jellyfin_boxset_id || c2.jellyfin_id || c2.id || ''); } catch (e6) { cid2 = ''; }
                                                    if (!cid2) continue;
                                                    if (map2[cid2] && (!c2.child_count || (parseInt(c2.child_count, 10) || 0) <= 0)) {
                                                        c2.child_count = map2[cid2];
                                                    }
                                                }
                                            };
                                            applyCounts2(boxsets);
                                            applyCounts2(playlists);
                                        } catch (e7) {}
                                        finish();
                                    });
                                    return;
                                } catch (e5) {}
                                finish();
                            }, function () {
                                finish();
                            }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 10 });
                        } catch (e0) {
                            finish();
                        }
                    }, function (err) {
                        console.warn('[Jellyfin Search] Error:', err);
                        oncomplite([]);
                    });
                });
            };

            Lampa.Search.addSource({
                title: 'Jellyfin',
                search: searchJellyfin,
                params: { save: true },
                onSelect: function (ctx, done) {
                    var card = null;
                    try { card = ctx && (ctx.item_data || ctx.element) ? (ctx.item_data || ctx.element) : null; } catch (e0) { card = null; }
                    if (!card) return;

                    var title = '';
                    try { title = String(card.title || card.name || card.original_name || card.original_title || '').trim(); } catch (e1) { title = ''; }
                    if (!title) title = 'Jellyfin';

                    var isFolder = false;
                    try { isFolder = !!(card._isBoxset || card._isPlaylist || card.jellyfin_boxset_id); } catch (e2) { isFolder = false; }
                    if (isFolder) {
                        var parentId = '';
                        try { parentId = String(card.jellyfin_boxset_id || card.jellyfin_id || card.id || ''); } catch (e3) { parentId = ''; }
                        if (parentId) {
                            try {
                                Lampa.Activity.push({
                                    url: 'jellyfin://browse?parentId=' + encodeURIComponent(parentId) + '&kind=media&title=' + encodeURIComponent(title),
                                    title: title,
                                    component: 'category_full',
                                    page: 1
                                });
                            } catch (e4) {}
                            return;
                        }
                    }

                    var jfId = '';
                    try { jfId = String(card.jellyfin_item_id || card.jellyfin_id || ''); } catch (e5) { jfId = ''; }
                    if (!jfId) {
                        try {
                            var src = String(card.source || '');
                            if (src === 'jellyfin') jfId = String(card.id || '');
                        } catch (e6) { jfId = ''; }
                    }
                    if (!jfId) {
                        try {
                            var src2 = String(card.source || '');
                            if (src2 === 'tmdb' && card.id) {
                                var t = '';
                                try { t = String(card.card_type || '').toLowerCase(); } catch (e7) { t = ''; }
                                if (!t) t = (card.name || card.original_name) ? 'tv' : 'movie';
                                jfId = String(Jellyfin.findJellyfinIdByTmdb(t, card.id) || '');
                            }
                        } catch (e8) { jfId = ''; }
                    }

                    if (jfId) {
                        var stopNoty = Jellyfin.delayedNoty('Jellyfin: открываю...', 450);
                        Jellyfin.authenticate(function () {
                            Jellyfin.getItemDetails(jfId, function (full) {
                                if (full && full.Id) {
                                    Jellyfin.openPlayMenu(full, function () {}, null, stopNoty);
                                    return;
                                }

                                try { stopNoty(); } catch (e0) {}
                                try {
                                    var src3 = String(card.source || '');
                                    if (src3 === 'tmdb' && card.id) {
                                        var t2 = String(card.card_type || '').toLowerCase();
                                        if (!t2) t2 = (card.name || card.original_name) ? 'tv' : 'movie';
                                        Jellyfin.forgetTmdbMapping(t2, card.id);
                                    }
                                } catch (e1) {}
                                try {
                                    Lampa.Activity.push({
                                        component: 'full',
                                        id: card.id,
                                        method: card.original_name ? 'tv' : 'movie',
                                        card: card,
                                        source: card.source
                                    });
                                } catch (e2) {}
                            });
                        });
                        return;
                    }

                    try {
                        Lampa.Activity.push({
                            component: 'full',
                            id: card.id,
                            method: card.original_name ? 'tv' : 'movie',
                            card: card,
                            source: card.source
                        });
                    } catch (e9) {}
                },
                onRender: function (line) {
                    var t = '';
                    try { t = String(line && line.data && line.data.title ? line.data.title : ''); } catch (e0) { t = ''; }
                    if (t === 'Jellyfin • Франшизы' || t === 'Jellyfin • Коллекции') {
                        try {
                            line.use({
                                onlyCreateAndAppend: function (element) {
                                    if (!element) return;
                                    if (!element.params) element.params = {};

                                    var card = new JellyfinFolderCard(element, t === 'Jellyfin • Франшизы' ? 'boxset' : 'media');
                                    card.create();

                                    var html = $(card.item);
                                    html.on('visible', function () {
                                        try { card.visible(); } catch (e) {}
                                    });

                                    try {
                                        var cc = 0;
                                        try { cc = parseInt(element.child_count, 10) || 0; } catch (eCc0) { cc = 0; }
                                        if (!cc) {
                                            var fid = '';
                                            try { fid = String(element.jellyfin_boxset_id || element.jellyfin_id || element.id || ''); } catch (eCc1) { fid = ''; }
                                            if (fid) {
                                                var jfServer = '';
                                                try { jfServer = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, ''); } catch (eSrv0) { jfServer = ''; }
                                                if (!jfServer) return;

                                                Jellyfin._folderCounts = Jellyfin._folderCounts || {};
                                                Jellyfin._folderCountsPending = Jellyfin._folderCountsPending || {};

                                                var updateBadge = function (cnt) {
                                                    try {
                                                        if (!card || !card.badge_el) return;
                                                        if (cnt > 0) {
                                                            card.badge_el.textContent = cnt > 99 ? '99+' : String(cnt);
                                                            card.badge_el.style.display = '';
                                                        }
                                                    } catch (eU0) {}
                                                };

                                                if (Jellyfin._folderCounts[fid]) {
                                                    element.child_count = Jellyfin._folderCounts[fid];
                                                    updateBadge(Jellyfin._folderCounts[fid]);
                                                } else if (!Jellyfin._folderCountsPending[fid]) {
                                                    Jellyfin._folderCountsPending[fid] = 1;
                                                    var oneUrl = jfServer + '/Users/' + encodeURIComponent(Jellyfin.userId) + '/Items/' + encodeURIComponent(fid) + '?Fields=ChildCount,RecursiveItemCount,ItemCount&api_key=' + encodeURIComponent(Jellyfin.token || '');
                                                    Jellyfin.request(oneUrl, 'GET', null, function (oneRes) {
                                                        try {
                                                            var cnt = 0;
                                                            try { cnt = parseInt(oneRes && oneRes.ChildCount, 10) || 0; } catch (eCc2) { cnt = 0; }
                                                            if (!cnt) { try { cnt = parseInt(oneRes && oneRes.RecursiveItemCount, 10) || 0; } catch (eCc3) { cnt = 0; } }
                                                            if (!cnt) { try { cnt = parseInt(oneRes && oneRes.ItemCount, 10) || 0; } catch (eCc4) { cnt = 0; } }
                                                            if (cnt > 0) {
                                                                Jellyfin._folderCounts[fid] = cnt;
                                                                element.child_count = cnt;
                                                                updateBadge(cnt);
                                                            }
                                                        } catch (eCc5) {}
                                                        try { delete Jellyfin._folderCountsPending[fid]; } catch (eCc6) {}
                                                    }, function () {
                                                        try { delete Jellyfin._folderCountsPending[fid]; } catch (eCc7) {}
                                                    }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json', timeoutMs: 1000 * 10 });
                                                }
                                            }
                                        }
                                    } catch (eCcX) {}

                                    var emit = function (event) {
                                        var name = event.charAt(0).toUpperCase() + event.slice(1);
                                        var only = false;
                                        for (var i = 0; i < item.components.length; i++) {
                                            var c = item.components[i];
                                            var handler = c['only' + name];
                                            if (typeof handler === 'function') only = handler;
                                        }
                                        if (only) return only.apply(item, Array.prototype.slice.call(arguments, 1));
                                        for (var j = 0; j < item.components.length; j++) {
                                            var c2 = item.components[j];
                                            var handler2 = c2['on' + name];
                                            if (typeof handler2 === 'function') handler2.apply(item, Array.prototype.slice.call(arguments, 1));
                                        }
                                    };

                                    var use = function (module) {
                                        var instance = typeof module === 'function' ? new module(item) : module;
                                        if (item.components.indexOf(instance) >= 0) return;
                                        item.components.push(instance);
                                    };

                                    var item = {
                                        data: element,
                                        params: element && element.params ? element.params : {},
                                        html: html,
                                        components: [],
                                        emit: emit,
                                        use: use,
                                        create: function () {
                                            html.on('hover:focus', function () { item.emit('focus', html, element); });
                                            html.on('hover:touch', function () { item.emit('touch', html, element); });
                                            html.on('hover:hover', function () { item.emit('hover', html, element); });
                                            html.on('hover:enter', function () { item.emit('enter', html, element); });
                                            html.on('hover:long', function () { item.emit('long', html, element); });
                                        },
                                        render: function () {
                                            return html;
                                        },
                                        destroy: function () {
                                            try { card.destroy(); } catch (e) {}
                                        }
                                    };

                                    item.create();
                                    this.emit('instance', item, element);
                                    this.emit('append', item, element);
                                }
                            });
                        } catch (e) {
                            console.warn('[Jellyfin Search] onRender error:', e);
                        }
                    }
                }
            });
        },

        patchApi: function () {
            if (this.apiPatched) return;
            if (!Lampa || !Lampa.Api) return;
            this.apiPatched = true;

            var originalCategory = Lampa.Api.category;
            var originalList = Lampa.Api.list;

            Lampa.Api.category = function (params, oncomplite, onerror) {
                try {
                    if (params && params.url && String(params.url).indexOf('jellyfin:') === 0) {
                        var parsed = Jellyfin.parseLocalUrl(params.url);
                        if (parsed.path === 'main') {
                            Jellyfin.buildMainLines(oncomplite, function () { oncomplite([]); });
                            return;
                        }
                    }
                } catch (e0) {}
                return originalCategory(params, oncomplite, onerror);
            };

            Lampa.Api.list = function (params, oncomplite, onerror) {
                try {
                    if (params && params.url && String(params.url).indexOf('jellyfin:') === 0) {
                        var parsed = Jellyfin.parseLocalUrl(params.url);
                        var page = params.page || 1;

                        if (parsed.path === 'latest') {
                            var media = parsed.query.type === 'tv' ? 'tv' : (parsed.query.type === 'boxset' ? 'boxset' : 'movie');
                            var pid = parsed.query.parentId || parsed.query.topParentId || '';
                            Jellyfin.libraryItems('latest', media, page, function (data) {
                                var out = {
                                    title: (params && params.title) ? params.title : ((media === 'tv') ? 'Jellyfin • Последние сериалы' : (media === 'boxset' ? 'Jellyfin • Франшизы' : 'Jellyfin • Последние фильмы')),
                                    results: data.cards || [],
                                    page: page,
                                    total_pages: Math.max(1, Math.ceil((data.total || 0) / 20)),
                                    total_results: data.total || 0
                                };
                                var hasBoxsets = false;
                                for (var ci = 0; ci < (out.results || []).length; ci++) {
                                    if (out.results[ci] && out.results[ci].jellyfin_boxset_id) { hasBoxsets = true; break; }
                                }
                                if (hasBoxsets) out.cardClass = function (item) { return new JellyfinFolderCard(item, 'media'); };
                                oncomplite(out);
                            }, function () {
                                if (onerror) onerror({ status: 404 });
                            }, true, { parentId: pid });
                            return;
                        }

                        if (parsed.path === 'premiere') {
                            var media2 = parsed.query.type === 'tv' ? 'tv' : 'movie';
                            var pid2 = parsed.query.parentId || parsed.query.topParentId || '';
                            Jellyfin.libraryItems('premiere', media2, page, function (data) {
                                oncomplite({
                                    title: (media2 === 'tv') ? 'Jellyfin • Новинки (сериалы)' : 'Jellyfin • Новинки (фильмы)',
                                    results: data.cards,
                                    page: page,
                                    total_pages: Math.max(1, Math.ceil((data.total || 0) / 20)),
                                    total_results: data.total || 0
                                });
                            }, function () {
                                if (onerror) onerror({ status: 404 });
                            }, true, { parentId: pid2 });
                            return;
                        }

                        if (parsed.path === 'genre') {
                            var media3 = parsed.query.type === 'tv' ? 'tv' : 'movie';
                            var genre = parsed.query.name ? String(parsed.query.name) : '';
                            var pid3 = parsed.query.parentId || parsed.query.topParentId || '';
                            var title = 'Jellyfin • Жанр';
                            if (genre.toLowerCase() === 'animation') title = (media3 === 'tv') ? 'Jellyfin • Мультсериалы' : 'Jellyfin • Мультфильмы';

                            Jellyfin.libraryItems('genre', media3, page, function (data) {
                                oncomplite({
                                    title: title,
                                    results: data.cards,
                                    page: page,
                                    total_pages: Math.max(1, Math.ceil((data.total || 0) / 20)),
                                    total_results: data.total || 0
                                });
                            }, function () {
                                if (onerror) onerror({ status: 404 });
                            }, true, { genre: genre || 'Animation', parentId: pid3 });
                            return;
                        }

                        if (parsed.path === 'resume') {
                            Jellyfin.libraryItems('resume', 'all', page, function (data) {
                                oncomplite({
                                    title: 'Jellyfin • Продолжить просмотр',
                                    results: data.cards,
                                    cardClass: function (item) { return new JellyfinResumeCard(item); },
                                    page: page,
                                    total_pages: Math.max(1, Math.ceil((data.total || 0) / 20)),
                                    total_results: data.total || 0
                                });
                            }, function () {
                                if (onerror) onerror({ status: 404 });
                            });
                            return;
                        }

                        if (parsed.path === 'browse') {
                            var browseParentId = parsed.query.parentId || '';
                            var browseKind = parsed.query.kind === 'boxset' ? 'boxset' : 'media';
                            var browseTitle = parsed.query.title || 'Jellyfin';

                            Jellyfin.browseItems(browseKind, browseParentId, page, function (data) {
                                var lineData = {
                                    title: browseTitle,
                                    results: data.cards,
                                    page: page,
                                    total_pages: Math.max(1, Math.ceil((data.total || 0) / 40)),
                                    total_results: data.total || 0
                                };
                                if (browseKind === 'boxset') {
                                    lineData.cardClass = function (item) { return new JellyfinFolderCard(item); };
                                }
                                oncomplite(lineData);
                            }, function () {
                                if (onerror) onerror({ status: 404 });
                            });
                            return;
                        }
                    }
                } catch (e0) {}
                return originalList(params, oncomplite, onerror);
            };

            try {
                var originalActivityPush = Lampa.Activity.push;
                Lampa.Activity.push = function (params) {
                    try {
                        if (params && params.component === 'full' && params.source === 'jellyfin' && params.id) {
                            var stopNoty = Jellyfin.delayedNoty('Jellyfin: открываю...', 450);
                            var card = params.movie || params.card || params.data || {};
                            var boxsetId = card.jellyfin_boxset_id || '';
                            if (!boxsetId && params.id) {
                                try {
                                    var tmdbMap = Lampa.Storage.get('jellyfin_tmdb_map', {}) || {};
                                } catch(eBm) {}
                            }

                            if (boxsetId) {
                                try { stopNoty(); } catch (e0) {}
                                Lampa.Activity.push({
                                    url: 'jellyfin://browse?parentId=' + encodeURIComponent(boxsetId) + '&kind=media&title=' + encodeURIComponent(card.title || card.name || ''),
                                    title: card.title || card.name || '',
                                    component: 'category_full',
                                    page: 1
                                });
                                return;
                            }

                            var jfId = String(params.id);
                            var back = function () {
                                var enabled = null;
                                try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
                                try { Lampa.Controller.toggle(enabled && enabled.name ? enabled.name : 'full_start'); } catch (e1) {}
                            };
                            Jellyfin.authenticate(function () {
                                Jellyfin.getItemDetails(jfId, function (full) {
                                    if (full && String(full.Type || '').toLowerCase() === 'boxset') {
                                        try { stopNoty(); } catch (e0) {}
                                        Lampa.Activity.push({
                                            url: 'jellyfin://browse?parentId=' + encodeURIComponent(jfId) + '&kind=media&title=' + encodeURIComponent(full.Name || ''),
                                            title: full.Name || '',
                                            component: 'category_full',
                                            page: 1
                                        });
                                        return;
                                    }
                                    Jellyfin.openPlayMenu(full || { Id: jfId }, back, null, stopNoty);
                                });
                            });
                            return;
                        }
                    } catch (e2) {}
                    return originalActivityPush.apply(this, arguments);
                };
            } catch (e3) {}
        },

        authenticate: function (callback) {
            var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
            var user = sget('jellyfin_user', JELLYFIN_USER);
            var pass = sget('jellyfin_pass', JELLYFIN_PASS);
            var storedToken = sget('jellyfin_token', '');
            var storedUserId = sget('jellyfin_user_id', '');

            if (this.token && this.userId && this.lastServer === server) {
                callback(this.token);
                return;
            }

            if (storedToken && storedUserId && server) {
                this.token = storedToken;
                this.userId = storedUserId;
                this.lastServer = server;
                this.lastUser = 'token';
                callback(this.token);
                return;
            }

            if (!server || !user || !pass) {
                Lampa.Noty.show('Jellyfin: заполните адрес/логин/пароль или используйте "Быстрое подключение"');
                return;
            }

            var url = server + '/Users/AuthenticateByName';
            var payload = { Username: user, Pw: pass };

            var onFail = function (err) {
                var status = '';
                try { status = err && (err.status || err.decode_code || err.code || ''); } catch (e0) { status = ''; }
                if (String(status) === '401') Lampa.Noty.show('Jellyfin: неверный логин/пароль (401)');
                else if (String(status) === '405') Lampa.Noty.show('Jellyfin: сервер/прокси блокирует POST/OPTIONS (405)');
                else Lampa.Noty.show('Jellyfin: Сервер недоступен' + (status ? ' (' + status + ')' : ''));
            };

            this.request(url, 'POST', payload, function (res) {
                if (res && res.AccessToken) {
                    this.saveAuth(server, res.AccessToken, res.SessionInfo && res.SessionInfo.UserId ? res.SessionInfo.UserId : '', user);
                    callback(this.token);
                } else {
                    this.clearAuth();
                    Lampa.Noty.show('Jellyfin: Ошибка входа');
                }
            }.bind(this), function (err) {
                var status = '';
                try { status = err && (err.status || err.decode_code || err.code || ''); } catch (e0) { status = ''; }
                if (String(status) === '405') {
                    var form = 'Username=' + encodeURIComponent(user) + '&Pw=' + encodeURIComponent(pass);
                    this.request(url, 'POST', form, function (res) {
                        if (res && res.AccessToken) {
                            this.saveAuth(server, res.AccessToken, res.SessionInfo && res.SessionInfo.UserId ? res.SessionInfo.UserId : '', user);
                            callback(this.token);
                        } else {
                            onFail({ status: 401 });
                        }
                    }.bind(this), onFail, { form: true, contentType: 'application/x-www-form-urlencoded; charset=UTF-8', processData: false, useAuthHeader: false });
                } else {
                    onFail(err);
                }
            }.bind(this));
        },

        quickConnectStop: function () {
            if (this.quickConnectTimer) { try { clearTimeout(this.quickConnectTimer); } catch (e0) {} }
            this.quickConnectTimer = null;
            this.quickConnectSecret = null;
            this.quickConnectInFlight = false;
            this.quickConnectFailCount = 0;
        },

        quickConnectInitiate: function (server, callback, onFail) {
            var url = server + '/QuickConnect/Initiate';
            this.request(url, 'GET', null, function (res) {
                callback(res || null);
            }, function () {
                this.request(url, 'POST', {}, function (res2) {
                    callback(res2 || null);
                }, onFail, { useTokenHeader: false, dataType: 'json' });
            }.bind(this), { useTokenHeader: false, dataType: 'json' });
        },

        quickConnectConnect: function (server, secret, callback, onFail) {
            var s = secret || '';
            var url = server + '/QuickConnect/Connect?secret=' + encodeURIComponent(s);
            var url2 = server + '/QuickConnect/Connect';
            var payload = { Secret: s };

            this.request(url, 'POST', payload, function (res) {
                callback(res || null);
            }, function (e0) {
                this.request(url2, 'POST', payload, function (res2) {
                    callback(res2 || null);
                }, function (e1) {
                    this.request(url, 'GET', null, function (res3) { callback(res3 || null); }, function (e2) { if (onFail) onFail(e2 || e1 || e0); }, { useTokenHeader: false, dataType: 'json' });
                }.bind(this), { useTokenHeader: false, dataType: 'json' });
            }.bind(this), { useTokenHeader: false, dataType: 'json' });
        },

        quickConnectAuthenticate: function (server, secret, callback, onFail) {
            var url = server + '/Users/AuthenticateWithQuickConnect';
            var payload = { Secret: secret };

            this.request(url, 'POST', payload, function (res) {
                callback(res || null);
            }, function (e0) {
                var url2 = url + '?secret=' + encodeURIComponent(secret || '');
                this.request(url2, 'POST', {}, function (res2) {
                    callback(res2 || null);
                }, function (e1) {
                    this.request(url2, 'GET', null, function (res3) { callback(res3 || null); }, function (e2) { if (onFail) onFail(e2 || e1 || e0); }, { useTokenHeader: false, dataType: 'json' });
                }.bind(this), { useTokenHeader: false, dataType: 'json' });
            }.bind(this), { useTokenHeader: false, dataType: 'json' });
        },

        quickConnectUI: function () {
            var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
            if (!server) {
                Lampa.Noty.show('Jellyfin: заполните адрес сервера');
                return;
            }

            var enabled = null;
            try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
            var restore = function () {
                Lampa.Controller.toggle(enabled && enabled.name ? enabled.name : 'settings');
            };

            var modal = null;
            try { modal = (Lampa && Lampa.Modal) ? Lampa.Modal : (typeof Modal !== 'undefined' ? Modal : null); } catch (e1) { modal = null; }
            if (!modal || !modal.open) {
                Lampa.Noty.show('Jellyfin: Не удалось открыть окно');
                return;
            }

            this.quickConnectStop();

            var html = $('<div class="jellyfin-qc"><div class="jellyfin-qc__title">Быстрое подключение</div><div class="jellyfin-qc__text">Откройте Jellyfin в браузере и перейдите в "Быстрое подключение", затем введите код:</div><div class="jellyfin-qc__code">...</div><div class="jellyfin-qc__url">' + server + '/web/#/quickconnect.html</div><div class="jellyfin-qc__status">Получаем код...</div></div>');
            var statusEl = html.find('.jellyfin-qc__status');
            var codeEl = html.find('.jellyfin-qc__code');

            modal.open({
                title: 'Jellyfin',
                html: html,
                size: 'small',
                scroll_to_center: true,
                onBack: function () {
                    try { modal.close(); } catch (e0) {}
                    this.quickConnectStop();
                    restore();
                }.bind(this)
            });

            this.quickConnectInitiate(server, function (initRes) {
                var src = initRes || {};
                try { if (src && src.data) src = src.data; } catch (e0) {}
                try { if (src && src.Result) src = src.Result; } catch (e1) {}

                var code = src && (src.Code || src.code || src.QuickConnectCode || src.QuickConnectcode || '');
                var secret = src && (src.Secret || src.secret || src.QuickConnectSecret || src.QuickConnectsecret || '');

                if (!code || !secret) {
                    statusEl.text('Не удалось получить код (Quick Connect выключен на сервере?)');
                    return;
                }

                this.quickConnectSecret = secret;
                this.quickConnectFailCount = 0;
                codeEl.text(String(code));
                statusEl.text('Ожидание подтверждения...');

                var startedAt = Date.now();
                var poll = function () {
                    if (!this.quickConnectSecret) return;
                    if (this.quickConnectInFlight) {
                        this.quickConnectTimer = setTimeout(poll.bind(this), 1200);
                        return;
                    }
                    if (Date.now() - startedAt > 1000 * 180) {
                        statusEl.text('Время ожидания истекло. Повторите.');
                        this.quickConnectStop();
                        return;
                    }

                    this.quickConnectInFlight = true;
                    var scheduleNext = function (delay) {
                        if (!this.quickConnectSecret) return;
                        this.quickConnectInFlight = false;
                        this.quickConnectTimer = setTimeout(poll.bind(this), delay || 2000);
                    }.bind(this);

                    this.quickConnectAuthenticate(server, this.quickConnectSecret, function (authRes) {
                        if (authRes && authRes.AccessToken) {
                            this.quickConnectStop();
                            this.saveAuth(server, authRes.AccessToken, authRes.SessionInfo && authRes.SessionInfo.UserId ? authRes.SessionInfo.UserId : '', 'quickconnect');
                            statusEl.text('Подключено');
                            try { Lampa.Noty.show('Jellyfin: подключено'); } catch (e0) {}
                            setTimeout(function () { try { modal.close(); } catch (e1) {} restore(); }, 600);
                            return;
                        }

                        this.quickConnectConnect(server, this.quickConnectSecret, function (connectRes) {
                            var ok = false;
                            try { ok = !!(connectRes && (connectRes.Authenticated || connectRes.authenticated)); } catch (e2) { ok = false; }
                            if (ok) statusEl.text('Подтверждено, получаем токен...');
                            this.quickConnectFailCount = 0;
                            scheduleNext(ok ? 1200 : 2000);
                        }.bind(this), function () {
                            scheduleNext(2000);
                        });
                    }.bind(this), function (err) {
                        var status = '';
                        try { status = err && (err.status || err.decode_code || err.code || ''); } catch (e0) { status = ''; }
                        var statusStr = String(status || '');
                        var pending = (statusStr === '401' || statusStr === '403' || statusStr === '404' || statusStr === '400' || statusStr === '409');
                        if (pending) {
                            this.quickConnectFailCount = 0;
                            scheduleNext(2000);
                            return;
                        }

                        this.quickConnectFailCount++;
                        if (this.quickConnectFailCount >= 8 && Date.now() - startedAt > 15000) {
                            statusEl.text('Нет ответа от Quick Connect' + (statusStr ? ' (' + statusStr + ')' : ''));
                        }
                        scheduleNext(2500);
                    }.bind(this));
                }.bind(this);

                poll.call(this);
            }.bind(this), function () {
                statusEl.text('Не удалось получить код (сервер недоступен)');
            });
        },

        formatSize: function(bytes) {
            if (!bytes) return '';
            var gbs = bytes / (1024 * 1024 * 1024);
            return gbs.toFixed(1) + ' GB';
        },

        formatLang: function (lang) {
            var l = String(lang || '').toLowerCase();
            if (!l) return '';
            if (l === 'rus' || l === 'ru' || l === 'russian') return 'RU';
            if (l === 'eng' || l === 'en' || l === 'english') return 'EN';
            if (l === 'ukr' || l === 'uk' || l === 'ukrainian') return 'UK';
            if (l === 'spa' || l === 'es' || l === 'spanish') return 'ES';
            if (l === 'fra' || l === 'fr' || l === 'french') return 'FR';
            if (l === 'deu' || l === 'de' || l === 'german') return 'DE';
            if (l === 'ita' || l === 'it' || l === 'italian') return 'IT';
            return l.slice(0, 3).toUpperCase();
        },

        formatChannels: function (channels) {
            var ch = 0;
            try { ch = parseInt(channels, 10) || 0; } catch (e0) { ch = 0; }
            if (!ch) return '';
            if (ch === 1) return '1.0';
            if (ch === 2) return '2.0';
            if (ch === 6) return '5.1';
            if (ch === 8) return '7.1';
            return String(ch);
        },

        getMediaStreams: function (mediaSource, item) {
            try {
                if (mediaSource && mediaSource.MediaStreams && mediaSource.MediaStreams.length) return mediaSource.MediaStreams;
                if (item && item.MediaStreams && item.MediaStreams.length) return item.MediaStreams;
            } catch (e0) {}
            return [];
        },

        getVideoStream: function(mediaSource, item) {
            try {
                var streams = this.getMediaStreams(mediaSource, item);
                for (var i = 0; i < streams.length; i++) {
                    if (streams[i] && streams[i].Type === 'Video') return streams[i];
                }
            } catch (e) {}
            return null;
        },

        getAudioStreams: function (mediaSource, item) {
            var streams = this.getMediaStreams(mediaSource, item);
            var out = [];
            for (var i = 0; i < streams.length; i++) {
                if (streams[i] && streams[i].Type === 'Audio') out.push(streams[i]);
            }
            return out;
        },

        formatAudioStream: function (stream) {
            if (!stream) return '';
            var parts = [];

            var lang = '';
            try { lang = stream.DisplayLanguage || stream.Language || ''; } catch (e0) { lang = ''; }
            lang = this.formatLang(lang);
            if (lang) parts.push(lang);

            var codec = '';
            try { codec = stream.Codec || ''; } catch (e1) { codec = ''; }
            codec = codec ? String(codec).toUpperCase() : '';
            if (codec) parts.push(codec);

            var ch = this.formatChannels(stream.Channels);
            if (ch) parts.push(ch);

            var title = '';
            try { title = stream.Title || stream.DisplayTitle || ''; } catch (e2) { title = ''; }
            if (title) parts.push(String(title).trim());

            return parts.join(' • ');
        },

        getAudioSummary: function (mediaSource, item) {
            var audios = this.getAudioStreams(mediaSource, item);
            if (!audios.length) return '';

            var langs = {};
            for (var i = 0; i < audios.length; i++) {
                var l = '';
                try { l = audios[i].Language || audios[i].DisplayLanguage || ''; } catch (e0) { l = ''; }
                l = this.formatLang(l);
                if (l) langs[l] = true;
            }
            var list = Object.keys(langs);
            if (!list.length) return 'Audio: ' + audios.length;
            return 'Audio: ' + list.join('/') + ' (' + audios.length + ')';
        },

        getVideoCodecInfo: function (mediaSource, item) {
            var v = this.getVideoStream(mediaSource, item);
            if (!v) return '';
            var parts = [];

            var codec = '';
            try { codec = v.Codec || ''; } catch (e0) { codec = ''; }
            codec = codec ? String(codec).toUpperCase() : '';
            if (codec) parts.push(codec);

            var range = '';
            try { range = v.VideoRangeType || v.VideoRange || ''; } catch (e1) { range = ''; }
            range = String(range || '').toUpperCase();
            if (range === 'HDR' || range === 'HLG' || range === 'DOVI' || range === 'DV') parts.push(range === 'DV' ? 'DOVI' : range);

            return parts.join(' ');
        },

        getQuality: function(item, mediaSource) {
            var info = [];
            var ms = mediaSource || (item && item.MediaSources && item.MediaSources.length ? item.MediaSources[0] : null);

            if (ms) {
                var v = this.getVideoStream(ms, item);
                var w = 0;
                var h = 0;
                try { w = v && v.Width ? parseInt(v.Width, 10) : 0; } catch (e0) { w = 0; }
                try { h = v && v.Height ? parseInt(v.Height, 10) : 0; } catch (e1) { h = 0; }
                var px = Math.max(w || 0, h || 0);
                if (px >= 3800 || h >= 2000) info.push('4K');
                else if (px >= 1900 || h >= 1000) info.push('1080p');
                else if (px >= 1200 || h >= 700) info.push('720p');
                else if (px > 0) info.push('SD');

                var vcodec = this.getVideoCodecInfo(ms, item);
                if (vcodec) info.push(vcodec);

                var size = this.formatSize(ms.SizeInBytes || ms.Size);
                if (size) info.push(size);

                if (ms.Bitrate) info.push(Math.round(ms.Bitrate / 1000000) + ' Mbps');

                var as = this.getAudioSummary(ms, item);
                if (as) info.push(as);
            }

            return info.join(' • ') || (item && item.Type === 'Series' ? 'Сериал' : 'Фильм');
        },

        getItemDetails: function (id, callback) {
            try {
                if (!id) return callback(null);
                var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
                var url = server + '/Users/' + encodeURIComponent(this.userId) + '/Items/' + encodeURIComponent(id) + '?Fields=ProductionYear,Name,ProviderIds,MediaSources,MediaStreams,UserData,SeriesId,SeriesName,ParentId,IndexNumber,ParentIndexNumber,RunTimeTicks&api_key=' + encodeURIComponent(this.token || '');
                this.request(
                    url,
                    'GET',
                    null,
                    function (res) { callback(res || null); },
                    function () { callback(null); },
                    { useAuthHeader: false, useTokenHeader: false, dataType: 'json' }
                );
            } catch (e) {
                callback(null);
            }
        },

        search: function (query, year, callback) {
            this.authenticate(function (token) {
                var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
                var url = server + '/Users/' + encodeURIComponent(this.userId) + '/Items?searchTerm=' + encodeURIComponent(query) + '&IncludeItemTypes=Movie,Series&Recursive=true&limit=50&Fields=ProductionYear,Name,ProviderIds&api_key=' + encodeURIComponent(token);

                this.request(url, 'GET', null, function (res) {
                    var items = (res && res.Items) ? res.Items : [];

                    var y = 0;
                    if (year) {
                        try { y = parseInt(year, 10) || 0; } catch (eY) { y = 0; }
                    }

                    var filtered = items;
                    if (y && items.length > 0) {
                        var exact = [];
                        var other = [];

                        for (var ii = 0; ii < items.length; ii++) {
                            var cand = items[ii];
                            if (cand && cand.ProductionYear == y) exact.push(cand);
                            else other.push(cand);
                        }

                        filtered = exact.concat(other);
                    }

                    filtered = filtered.slice(0, 20);

                    var out = [];
                    var idx = 0;
                    var seen = {};

                    var getItemKey = function (obj) {
                        try {
                            if (!obj || !obj.Id) return '';
                            return String(obj.Id);
                        } catch (e0) {
                            return '';
                        }
                    };

                    var pushUnique = function (obj) {
                        var key = getItemKey(obj);
                        if (!key) return;
                        if (seen[key]) return;
                        seen[key] = true;
                        out.push(obj);
                    };

                    var next = function () {
                        if (idx >= filtered.length) return callback(out);
                        var it = filtered[idx++];
                        if (!it || !it.Id) return next();

                        this.getItemDetails(it.Id, function (full) {
                            var item = full || it;
                            pushUnique(item);
                            next();
                        });
                    }.bind(this);

                    next();
                }.bind(this), function () {
                    Lampa.Noty.show('Jellyfin: Ошибка поиска');
                }, { useAuthHeader: false, useTokenHeader: false, dataType: 'json' });
            }.bind(this));
        },

        getSeasons: function (seriesId, callback) {
            var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
            this.request(server + '/Shows/' + seriesId + '/Seasons?userId=' + this.userId + '&Fields=MediaSources,MediaStreams,UserData,SeriesId,ParentId,IndexNumber,ParentIndexNumber,RunTimeTicks&api_key=' + encodeURIComponent(this.token || ''), 'GET', null, callback, function() {}, { useAuthHeader: false, useTokenHeader: false, dataType: 'json' });
        },

        getEpisodes: function (seriesId, seasonId, callback) {
            var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
            this.request(server + '/Shows/' + seriesId + '/Episodes?seasonId=' + seasonId + '&userId=' + this.userId + '&Fields=MediaSources,MediaStreams,UserData,SeriesId,ParentId,IndexNumber,ParentIndexNumber,RunTimeTicks&api_key=' + encodeURIComponent(this.token || ''), 'GET', null, callback, function() {}, { useAuthHeader: false, useTokenHeader: false, dataType: 'json' });
        },

        ensureItemDetails: function (item, callback) {
            if (item && item.MediaSources && item.MediaSources.length) return callback(item);
            this.getItemDetails(item && item.Id ? item.Id : '', function (full) {
                callback(full || item || null);
            });
        },

        getResolutionLabel: function (item, mediaSource) {
            try {
                var v = this.getVideoStream(mediaSource, item);
                var h = 0;
                try { h = v && v.Height ? parseInt(v.Height, 10) : 0; } catch (e0) { h = 0; }
                if (h >= 2000) return '2160p';
                if (h >= 1000) return '1080p';
                if (h >= 700) return '720p';
                if (h >= 500) return '480p';
                if (h > 0) return h + 'p';
                return '';
            } catch (e1) {
                return '';
            }
        },

        selectMediaSource: function (item, callback, onBack) {
            var sources = (item && item.MediaSources) ? item.MediaSources : [];
            if (!sources || sources.length <= 1) return callback(sources && sources.length ? sources[0] : null);

            var list = sources.map(function (ms, idx) {
                var res = this.getResolutionLabel(item, ms);
                var name = '';
                try { name = ms && ms.Name ? String(ms.Name) : ''; } catch (eN) { name = ''; }
                return {
                    title: res || name || ('Версия ' + (idx + 1)),
                    subtitle: this.getQuality(item, ms),
                    ms: ms
                };
            }.bind(this));

            Lampa.Select.show({
                title: (item && item.Name ? item.Name : 'Jellyfin') + ' • Качество',
                items: list,
                onSelect: function (a) { callback(a && a.ms ? a.ms : null); },
                onBack: this.wrapSelectOnBack(onBack)
            });
        },

        QUALITY_PRESETS: [
            { id: 'original', title: 'Оригинал (без сжатия)', bitrate: 0, maxHeight: 0 },
            { id: '1080-20', title: '1080p • 20 Мбит/с', bitrate: 20000000, maxHeight: 1080 },
            { id: '1080-10', title: '1080p • 10 Мбит/с', bitrate: 10000000, maxHeight: 1080 },
            { id: '720-8', title: '720p • 8 Мбит/с', bitrate: 8000000, maxHeight: 720 },
            { id: '720-4', title: '720p • 4 Мбит/с', bitrate: 4000000, maxHeight: 720 },
            { id: '480-3', title: '480p • 3 Мбит/с', bitrate: 3000000, maxHeight: 480 },
            { id: '480-1_5', title: '480p • 1.5 Мбит/с', bitrate: 1500000, maxHeight: 480 },
            { id: '360-0_7', title: '360p • 0.7 Мбит/с', bitrate: 700000, maxHeight: 360 }
        ],

        selectQuality: function (item, mediaSource, callback, onBack) {
            var list = this.QUALITY_PRESETS.map(function (q) {
                return {
                    title: q.title,
                    subtitle: q.bitrate ? 'Транскодирование на сервере' : 'Максимальное качество, без перекодирования',
                    quality: q
                };
            });

            Lampa.Select.show({
                title: 'Качество',
                items: list,
                onSelect: function (a) { callback(a && a.quality ? a.quality : this.QUALITY_PRESETS[0]); }.bind(this),
                onBack: this.wrapSelectOnBack(onBack)
            });
        },

        selectAudioStreamIndex: function (item, mediaSource, callback, onBack) {
            var audios = this.getAudioStreams(mediaSource, item);
            if (!audios || audios.length <= 1) {
                var one = audios && audios.length ? audios[0] : null;
                var idx = one && typeof one.Index !== 'undefined' ? one.Index : 0;
                return callback(idx);
            }

            var list = audios.map(function (st, i) {
                var title = this.formatAudioStream(st) || ('Дорожка ' + (i + 1));
                var index = typeof st.Index !== 'undefined' ? st.Index : i;
                var isDef = false;
                try { isDef = !!(st.IsDefault || st.Default); } catch (e0) { isDef = false; }
                return {
                    title: title + (isDef ? ' • По умолчанию' : ''),
                    subtitle: '',
                    audioIndex: index
                };
            }.bind(this));

            Lampa.Select.show({
                title: 'Аудио',
                items: list,
                onSelect: function (a) { callback(a && typeof a.audioIndex !== 'undefined' ? a.audioIndex : 0); },
                onBack: this.wrapSelectOnBack(onBack)
            });
        },

        qualityLabelToDefaultNum: function (label) {
            var s = String(label || '');
            if (/2160|4k/i.test(s)) return 2160;
            if (/1080/.test(s)) return 1080;
            if (/720/.test(s)) return 720;
            if (/480/.test(s)) return 480;
            return 0;
        },

        directStreamUrl: function (itemId, msid, audioIndex) {
            var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
            var url = server + '/Videos/' + itemId + '/stream?static=true&api_key=' + encodeURIComponent(this.token || '');
            if (msid) url += '&MediaSourceId=' + encodeURIComponent(msid);
            if (typeof audioIndex !== 'undefined' && audioIndex !== null && audioIndex !== '') url += '&AudioStreamIndex=' + encodeURIComponent(audioIndex);
            return url;
        },

        buildDirectQualityMap: function (item, audioIndex) {
            try {
                var sources = (item && item.MediaSources) ? item.MediaSources : [];
                if (!sources.length) return null;
                var map = {};
                for (var i = 0; i < sources.length; i++) {
                    var ms = sources[i];
                    if (!ms || !ms.Id) continue;
                    var label = this.getResolutionLabel(item, ms);
                    if (!label) continue;
                    if (!map[label]) map[label] = this.directStreamUrl(item.Id, ms.Id, audioIndex);
                }
                var keys = Object.keys(map);
                return keys.length > 1 ? map : null;
            } catch (e) {
                return null;
            }
        },

        buildEpisodePlaylistItem: function (ep) {
            try {
                if (!ep || !ep.Id) return null;
                var sources = ep.MediaSources || [];
                var ms = sources.length ? sources[0] : null;
                var url = this.directStreamUrl(ep.Id, ms && ms.Id ? ms.Id : '', undefined);
                var title = (ep.IndexNumber ? ep.IndexNumber + '. ' : '') + (ep.Name || '');
                var out = { url: url, title: title, jellyfin_item_id: String(ep.Id), jellyfin_media_source_id: (ms && ms.Id ? String(ms.Id) : String(ep.Id)), jellyfin_raw: ep };
                var qm = this.buildDirectQualityMap(ep, undefined);
                if (qm) out.quality = qm;
                return out;
            } catch (e) {
                return null;
            }
        },

        upgradeToSeasonPlaylist: function (item, activeUrl, activeQualityMap) {
            try {
                var typeLower = String(item && item.Type || '').toLowerCase();
                if (typeLower !== 'episode') return;
                var seriesId = item.SeriesId || '';
                var seasonId = item.ParentId || item.SeasonId || '';
                if (!seriesId || !seasonId) return;
                if (!Lampa.Player || typeof Lampa.Player.playlist !== 'function') return;

                this.getEpisodes(seriesId, seasonId, function (res) {
                    try {
                        var episodes = (res && res.Items) ? res.Items : [];
                        if (episodes.length < 2) return;

                        var pl = [];
                        for (var i = 0; i < episodes.length; i++) {
                            var ep = episodes[i];
                            if (!ep || !ep.Id) continue;
                            if (String(ep.Id) === String(item.Id)) {
                                var activeTitle = (ep.IndexNumber ? ep.IndexNumber + '. ' : '') + (ep.Name || item.Name || '');
                                var activeOut = { url: activeUrl, title: activeTitle, jellyfin_item_id: String(item.Id), jellyfin_media_source_id: (item.MediaSourceId ? String(item.MediaSourceId) : String(item.Id)), jellyfin_raw: ep };
                                if (activeQualityMap) activeOut.quality = activeQualityMap;
                                pl.push(activeOut);
                                continue;
                            }
                            var lite = this.buildEpisodePlaylistItem(ep);
                            if (lite) pl.push(lite);
                        }

                        if (pl.length > 1) Lampa.Player.playlist(pl);
                    } catch (eIn) {}
                }.bind(this));
            } catch (eOut) {}
        },

        attachQualitySwitchGuard: function (itemId) {
            try {
                var video = Lampa.PlayerVideo && typeof Lampa.PlayerVideo.video === 'function' ? Lampa.PlayerVideo.video() : null;
                if (!video) return;
                if (video._jfQualityGuardAttached) return;
                video._jfQualityGuardAttached = true;
                var self = this;

                video.addEventListener('loadstart', function () {
                    var src = '';
                    try { src = video.currentSrc || video.src || ''; } catch (eSrc) { src = ''; }

                    if (self._jfPendingDestroy) {
                        self._jfPendingDestroy = false;
                    }
                    var pb = self.activePlayback;
                    var fallbackPos = (pb && pb.positionSec > 2) ? pb.positionSec : ((self._jfLastKnownPositionSec > 2) ? self._jfLastKnownPositionSec : 0);
                    if (self._jfExpectedFreshUrl && src && src === self._jfExpectedFreshUrl) {
                        self._jfExpectedFreshUrl = null;
                        video._jfPendingRestore = 0;
                        return;
                    }
                    video._jfPendingRestore = fallbackPos;
                });

                video.addEventListener('loadedmetadata', function () {
                    var t = video._jfPendingRestore || 0;
                    video._jfPendingRestore = 0;
                    if (t > 2) {
                        try {
                            if (Lampa.PlayerVideo && typeof Lampa.PlayerVideo.to === 'function') {
                                Lampa.PlayerVideo.to(t);
                            } else {
                                video.currentTime = t;
                            }
                        } catch (e) {}
                    }
                });
            } catch (e) {}
        },

        pollRestorePosition: function (video, posHint) {
            try {
                if (!video || !(posHint > 2)) return;
                var self = this;
                var attempts = 0;
                var maxAttempts = 200;
                var iv = setInterval(function () {
                    attempts++;
                    try {
                        if (!self.activePlayback) {
                            clearInterval(iv);
                            return;
                        }
                        var src = '';
                        try { src = video.currentSrc || video.src || ''; } catch (eSrc) { src = ''; }
                        if (self._jfExpectedFreshUrl && src && src === self._jfExpectedFreshUrl) {
                            self._jfExpectedFreshUrl = null;
                            clearInterval(iv);
                            return;
                        }
                        if (video.readyState >= 1 && video.duration > 0) {
                            clearInterval(iv);
                            try {
                                if (Lampa.PlayerVideo && typeof Lampa.PlayerVideo.to === 'function') {
                                    Lampa.PlayerVideo.to(posHint);
                                } else {
                                    video.currentTime = posHint;
                                }
                            } catch (eR) {}
                            return;
                        }
                    } catch (eIn) {}
                    if (attempts >= maxAttempts) {
                        clearInterval(iv);
                    }
                }, 150);
            } catch (e) {}
        },

        startQualityGuardWatcher: function () {
            try {
                if (this._jfQualityGuardTimer) return;
                var self = this;
                this.attachQualitySwitchGuard();
                var lastVideoSeen = null;
                this._jfQualityGuardTimer = setInterval(function () {
                    try {
                        var v = Lampa.PlayerVideo && typeof Lampa.PlayerVideo.video === 'function' ? Lampa.PlayerVideo.video() : null;
                        if (v && v !== lastVideoSeen) {
                            lastVideoSeen = v;
                            var pb = self.activePlayback;
                            var posHint = (pb && pb.positionSec > 2) ? pb.positionSec : ((self._jfLastKnownPositionSec > 2) ? self._jfLastKnownPositionSec : 0);
                            self.pollRestorePosition(v, posHint);
                        }
                    } catch (eW) {}
                    self.attachQualitySwitchGuard();
                }, 250);
            } catch (e) {}
        },

        stopQualityGuardWatcher: function () {
            try {
                if (this._jfQualityGuardTimer) {
                    clearInterval(this._jfQualityGuardTimer);
                    this._jfQualityGuardTimer = null;
                }
            } catch (e) {}
        },

        listenSeasonPlaylist: function () {
            if (this._jfPlaylistListenerReady) return;
            this._jfPlaylistListenerReady = true;
            try {
                var pl = Lampa.PlayerPlaylist;
                if (!pl || !pl.listener || typeof pl.listener.follow !== 'function') return;
                pl.listener.follow('select', function (e) {
                    try {
                        if (!e || !e.item) { return; }

                        var curPb = this.activePlayback;
                        var newItemId = e.item.jellyfin_item_id ? String(e.item.jellyfin_item_id) : null;

                        var isGenuineNewItem = !!(newItemId && (!curPb || !curPb.itemId || String(curPb.itemId) !== newItemId));

                        if (!isGenuineNewItem) {

                            if (curPb && e.item.jellyfin_media_source_id) curPb.mediaSourceId = e.item.jellyfin_media_source_id;
                            return;
                        }

                        this._jfExpectedFreshUrl = e.item.url || null;
                        var ep = e.item.jellyfin_raw;
                        if (!ep) return;

                        var seriesId = '';
                        var seasonNumber = '';
                        var episodeNumber = '';
                        try { seriesId = String(ep.SeriesId || ''); } catch (e2) { seriesId = ''; }
                        try { seasonNumber = ep.ParentIndexNumber ? String(ep.ParentIndexNumber) : ''; } catch (e3) { seasonNumber = ''; }
                        try { episodeNumber = ep.IndexNumber ? String(ep.IndexNumber) : ''; } catch (e4) { episodeNumber = ''; }

                        this.startPlaybackSync({
                            itemId: String(ep.Id),
                            mediaSourceId: e.item.jellyfin_media_source_id || String(ep.Id),
                            audioIndex: undefined,
                            positionSec: 0,
                            durationSec: this.getDurationSecondsFromItem(ep) || 0,
                            title: String(ep.Name || ''),
                            seriesId: seriesId,
                            seasonNumber: seasonNumber,
                            episodeNumber: episodeNumber,
                            seriesName: '',
                            playSessionId: Math.random().toString(36).slice(2) + Date.now().toString(36),
                            playMethod: 'DirectPlay'
                        });

                        this.startQualityGuardWatcher();
                    } catch (eIn) {}
                }.bind(this));
            } catch (eOut) {}
        },

        playWithOptions: function (item, mediaSource, audioIndex, startSeconds, quality) {
            this.authenticate(function () {
                if (!item || !item.Id) {
                    Lampa.Noty.show('Jellyfin: Неверные данные элемента');
                    return;
                }

                var server = sget('jellyfin_server', JELLYFIN_SERVER).replace(/\/$/, '');
                var msid = '';
                try { msid = mediaSource && mediaSource.Id ? mediaSource.Id : (item && (item.MediaSourceId || (item.MediaSources && item.MediaSources[0] && item.MediaSources[0].Id) || '')); } catch (e0) { msid = ''; }

                if (!msid && (!item.MediaSources || !item.MediaSources.length)) {
                }

                var q = quality && typeof quality === 'object' ? quality : this.QUALITY_PRESETS[0];
                var isDirect = !q.bitrate;
                var playSessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
                var deviceId = this.getDeviceId();

                var url;
                if (isDirect) {
                    url = server + '/Videos/' + item.Id + '/stream?static=true&api_key=' + encodeURIComponent(this.token || '');
                } else {
                    url = server + '/Videos/' + item.Id + '/stream.mp4?VideoCodec=h264&AudioCodec=aac,mp3&MaxStreamingBitrate=' + q.bitrate + '&VideoBitrate=' + Math.round(q.bitrate * 0.85) + '&AudioBitrate=128000';
                    if (q.maxHeight) url += '&MaxHeight=' + encodeURIComponent(String(q.maxHeight));
                    url += '&PlaySessionId=' + encodeURIComponent(playSessionId) + '&DeviceId=' + encodeURIComponent(deviceId) + '&api_key=' + encodeURIComponent(this.token || '');
                }

                if (msid) url += '&MediaSourceId=' + encodeURIComponent(msid);
                if (typeof audioIndex !== 'undefined' && audioIndex !== null && audioIndex !== '') url += '&AudioStreamIndex=' + encodeURIComponent(audioIndex);

                var timeline = null;
                var ss = 0;
                try { ss = parseFloat(startSeconds) || 0; } catch (e1) { ss = 0; }
                if (ss > 0) timeline = { time: ss, percent: 0, continued: false };

                var qualityMap = isDirect ? this.buildDirectQualityMap(item, audioIndex) : null;
                var playObj = { url: url, title: item.Name, timeline: timeline, jellyfin_item: item, jellyfin_media_source_id: msid, jellyfin_audio_index: audioIndex };
                if (qualityMap) playObj.quality = qualityMap;

                var chosenMs = mediaSource;
                if (!chosenMs && msid && item.MediaSources && item.MediaSources.length) {
                    for (var mi = 0; mi < item.MediaSources.length; mi++) {
                        if (item.MediaSources[mi] && item.MediaSources[mi].Id && String(item.MediaSources[mi].Id) === String(msid)) {
                            chosenMs = item.MediaSources[mi];
                            break;
                        }
                    }
                }
                var forcedNum = 0;
                var prevDefault;
                var restoreDefault = false;
                if (qualityMap && chosenMs) {
                    try {
                        forcedNum = this.qualityLabelToDefaultNum(this.getResolutionLabel(item, chosenMs));
                    } catch (eQ) { forcedNum = 0; }
                    if (forcedNum) {
                        try {
                            prevDefault = Lampa.Storage.field ? Lampa.Storage.field('video_quality_default') : Lampa.Storage.get('video_quality_default', '1080');
                            Lampa.Storage.set('video_quality_default', String(forcedNum));
                            restoreDefault = true;
                        } catch (eQ2) { restoreDefault = false; }
                    }
                }

                this._jfExpectedFreshUrl = url;
                Lampa.Player.play(playObj);
                Lampa.Player.playlist([{ url: url, title: item.Name, quality: qualityMap || undefined }]);

                if (restoreDefault) {
                    setTimeout(function () {
                        try { Lampa.Storage.set('video_quality_default', prevDefault); } catch (eQ3) {}
                    }, 0);
                }

                try { this.listenSeasonPlaylist(); } catch (eLs) {}
                this.startQualityGuardWatcher();

                try { this.upgradeToSeasonPlaylist(item, url, qualityMap); } catch (eUp) {}

                var seriesId = '';
                var seasonNumber = '';
                var episodeNumber = '';
                try { seriesId = String(item.SeriesId || item.seriesId || ''); } catch (e2) { seriesId = ''; }
                try { seasonNumber = item.ParentIndexNumber ? String(item.ParentIndexNumber) : ''; } catch (e3) { seasonNumber = ''; }
                try { episodeNumber = item.IndexNumber ? String(item.IndexNumber) : ''; } catch (e4) { episodeNumber = ''; }

                this.startPlaybackSync({
                    itemId: String(item.Id),
                    mediaSourceId: msid || String(item.Id),
                    audioIndex: audioIndex,
                    positionSec: ss || 0,
                    durationSec: this.getDurationSecondsFromItem(item) || 0,
                    title: String(item.Name || ''),
                    seriesId: seriesId || '',
                    seasonNumber: seasonNumber || '',
                    episodeNumber: episodeNumber || '',
                    seriesName: '',
                    playSessionId: playSessionId,
                    playMethod: isDirect ? 'DirectPlay' : 'Transcode'
                });
            }.bind(this));
        },

        openPlayMenu: function (item, onBack, opts, onReady) {
            var ctx = opts && typeof opts === 'object' ? opts : {};
            var readyFired = false;
            var fireReady = function () {
                if (readyFired) return;
                readyFired = true;
                try { if (typeof onReady === 'function') onReady(); } catch (eR) {}
            };
            this.ensureItemDetails(item, function (full) {
                if (!full || !full.Id) {
                    fireReady();
                    if (onBack) onBack();
                    return;
                }

                this.authenticate(function () {
                    var back = typeof onBack === 'function' ? onBack : function () {
                        var enabled = null;
                        try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
                        Lampa.Controller.toggle(enabled && enabled.name ? enabled.name : 'full_start');
                    };

                    var playFlow = function (playItem, resumeSeconds, backHandler, flowOpts) {
                        var fo = flowOpts && typeof flowOpts === 'object' ? flowOpts : {};
                        var sources = [];
                        try { sources = (playItem && playItem.MediaSources) ? playItem.MediaSources : []; } catch (e0) { sources = []; }
                        var localState = null;
                        try { localState = this.getLocalItemState(playItem && playItem.Id ? playItem.Id : ''); } catch (e00) { localState = null; }

                        var showAudioForSource = function (ms, backH) {
                            this.playWithOptions(playItem, ms, undefined, resumeSeconds || 0);
                        }.bind(this);

                        if (sources && sources.length > 1) {
                            var prefMsId = '';
                            try { prefMsId = localState && localState.mediaSourceId ? String(localState.mediaSourceId) : ''; } catch (e03) { prefMsId = ''; }
                            if (!fo.forceSelect && prefMsId) {
                                for (var i0 = 0; i0 < sources.length; i0++) {
                                    if (sources[i0] && sources[i0].Id && String(sources[i0].Id) === prefMsId) {
                                        showAudioForSource(sources[i0], backHandler || back);
                                        return;
                                    }
                                }
                            }

                            var showMedia = function () {
                                this.selectMediaSource(playItem, function (ms) {
                                    showAudioForSource(ms, showMedia);
                                }.bind(this), backHandler || back);
                            }.bind(this);
                            showMedia();
                        } else {
                            var msOne = sources && sources.length ? sources[0] : null;
                            showAudioForSource(msOne, backHandler || back);
                        }
                    }.bind(this);

                    var typeLower = String(full.Type || '').toLowerCase();
                    if (typeLower === 'episode') {
                        var resumeSecEp = this.getResumeSecondsFromItem(full);
                        var durSecEp = this.getDurationSecondsFromItem(full);
                        var startAt = this.shouldOfferContinue(resumeSecEp, durSecEp) ? resumeSecEp : 0;
                        fireReady();
                        playFlow(full, startAt, back, { forceSelect: true });
                        return;
                    }

                    if (typeLower === 'series') {
                        var seriesId = String(full.Id);
                        var localSeries = this.getSeriesLastState(seriesId);

                        var proceedSeasons = function () {
                            this.getSeasons(full.Id, function (res) {
                                var seasons = (res && res.Items) ? res.Items : [];
                                var backToPrev = function () { back(); };

                                var seasonsConfig = {
                                    title: full.Name || 'Jellyfin',
                                    items: seasons.map(function (s) { return { title: s.Name || ('Сезон ' + (s.IndexNumber || '')), season: s }; }),
                                    onBack: backToPrev,
                                    onSelect: function (b) {
                                        if (!b || !b.season) return;
                                        this.getEpisodes(full.Id, b.season.Id, function (res2) {
                                            var episodes = (res2 && res2.Items) ? res2.Items : [];
                                            var backToSeasons = function () { Lampa.Select.show(seasonsConfig); };

                                            var lastEpisodeId = '';
                                            try { lastEpisodeId = localSeries && localSeries.itemId ? String(localSeries.itemId) : ''; } catch (e0) { lastEpisodeId = ''; }

                                            Lampa.Select.show({
                                                title: b.season.Name || 'Сезон',
                                                items: episodes.map(function (e) {
                                                    var isLast = false;
                                                    try { isLast = lastEpisodeId && e && e.Id && String(e.Id) === lastEpisodeId; } catch (e1) { isLast = false; }
                                                    var t = (e.IndexNumber ? e.IndexNumber + '. ' : '') + (e.Name || '');
                                                    if (isLast) t = t + ' <span class="jellyfin-badge jellyfin-badge--last">Последняя</span>';
                                                    var sub = Jellyfin.getQuality(e);
                                                    return { title: t, subtitle: sub, episode: e };
                                                }),
                                                onBack: backToSeasons,
                                                onSelect: function (c) { if (c && c.episode) this.openPlayMenu(c.episode, backToSeasons, { skipContinuePopup: true }); }.bind(this)
                                            });
                                        }.bind(this));
                                    }.bind(this)
                                };

                                if (!seasons.length) {
                                    fireReady();
                                    back();
                                    return;
                                }

                                fireReady();
                                Lampa.Select.show(seasonsConfig);
                            }.bind(this));
                        }.bind(this);

                        this.getSeriesResume(seriesId, function (resumeEpisode) {
                            var resumeSec = this.getResumeSecondsFromItem(resumeEpisode);
                            var durSec = this.getDurationSecondsFromItem(resumeEpisode);
                            var percent = durSec ? ((resumeSec / durSec) * 100) : 0;
                            var sNo = '';
                            var eNo = '';
                            try { sNo = resumeEpisode.ParentIndexNumber ? String(resumeEpisode.ParentIndexNumber) : ''; } catch (e0) { sNo = ''; }
                            try { eNo = resumeEpisode.IndexNumber ? String(resumeEpisode.IndexNumber) : ''; } catch (e1) { eNo = ''; }
                            var info = [];
                            if (sNo) info.push('Сезон ' + sNo);
                            if (eNo) info.push('Серия ' + eNo);
                            if (resumeSec) info.push(this.formatSecondsShort(resumeSec));
                            var fallbackImg = this.buildImageUrl(resumeEpisode.Id, 'primary') || this.buildImageUrl(seriesId, 'backdrop') || this.buildImageUrl(seriesId, 'primary');
                            var tmdbSeriesId = this.getTmdbIdFromItem(full);

                            var openSeriesContinue = function (imgUrl) {
                                var img = imgUrl || fallbackImg;
                                fireReady();
                                if (!ctx.skipContinuePopup) {
                                    this.openContinuePopup({
                                        title: 'Продолжить просмотр?',
                                        name: String(full.Name || 'Jellyfin'),
                                        info: info.join(' • '),
                                        image: img,
                                        percent: percent,
                                        onContinue: function () {
                                            if (resumeEpisode && resumeEpisode.Id) {
                                                this.getItemDetails(resumeEpisode.Id, function (epFull) {
                                                    playFlow(epFull || resumeEpisode, resumeSec, back, { forceSelect: false });
                                                }.bind(this));
                                            } else {
                                                proceedSeasons();
                                            }
                                        }.bind(this),
                                        onChoose: function () { proceedSeasons(); }
                                    });
                                    return;
                                }
                                proceedSeasons();
                            }.bind(this);

                            if (tmdbSeriesId && sNo && eNo) {
                                this.getEpisodeStillFromTmdb(tmdbSeriesId, sNo, eNo, function (stillUrl) {
                                    openSeriesContinue(stillUrl || '');
                                });
                            } else {
                                openSeriesContinue('');
                            }
                        }.bind(this), function () {
                            if (localSeries && localSeries.itemId) {
                                this.getItemDetails(localSeries.itemId, function (epFull) {
                                    if (!epFull || !epFull.Id) return proceedSeasons();
                                    var resumeSec = this.getResumeSecondsFromItem(epFull);
                                    var durSec = this.getDurationSecondsFromItem(epFull);
                                    var percent = durSec ? ((resumeSec / durSec) * 100) : 0;
                                    var info = [];
                                    if (localSeries.seasonNumber) info.push('Сезон ' + localSeries.seasonNumber);
                                    if (localSeries.episodeNumber) info.push('Серия ' + localSeries.episodeNumber);
                                    if (resumeSec) info.push(this.formatSecondsShort(resumeSec));
                                    var img = this.buildImageUrl(epFull.Id, 'primary') || this.buildImageUrl(seriesId, 'backdrop') || this.buildImageUrl(seriesId, 'primary');

                                    fireReady();
                                    if (!ctx.skipContinuePopup) {
                                        this.openContinuePopup({
                                            title: 'Продолжить просмотр?',
                                            name: String(full.Name || 'Jellyfin'),
                                            info: info.join(' • '),
                                            image: img,
                                            percent: percent,
                                            onContinue: function () { playFlow(epFull, resumeSec, back, { forceSelect: false }); }.bind(this),
                                            onChoose: function () { proceedSeasons(); }
                                        });
                                        return;
                                    }
                                    proceedSeasons();
                                }.bind(this));
                                return;
                            }
                            fireReady();
                            proceedSeasons();
                        }.bind(this));

                        return;
                    }

                    var resumeSecItem = this.getResumeSecondsFromItem(full);
                    var durSecItem = this.getDurationSecondsFromItem(full);
                    var percentItem = durSecItem ? ((resumeSecItem / durSecItem) * 100) : 0;
                    var imgItem = this.buildImageUrl(full.Id, 'backdrop') || this.buildImageUrl(full.Id, 'primary');

                    fireReady();
                    if (!ctx.skipContinuePopup && this.shouldOfferContinue(resumeSecItem, durSecItem)) {
                        this.openContinuePopup({
                            title: 'Продолжить просмотр?',
                            name: String(full.Name || 'Jellyfin'),
                            info: (resumeSecItem ? this.formatSecondsShort(resumeSecItem) : ''),
                            image: imgItem,
                            percent: percentItem,
                            onContinue: function () { playFlow(full, resumeSecItem, back, { forceSelect: false }); }.bind(this),
                            onChoose: function () { playFlow(full, 0, back, { forceSelect: true }); }.bind(this)
                        });
                        return;
                    }

                    playFlow(full, 0, back, { forceSelect: true });
                }.bind(this));
            }.bind(this));
        }
    };

    function showSelection(items, onBack, tmdbInfo) {
        var list = items.map(function (item) {
            return {
                title: item.Name + (item.ProductionYear ? ' (' + item.ProductionYear + ')' : ''),
                subtitle: Jellyfin.getQuality(item, item && item.MediaSources && item.MediaSources[0] ? item.MediaSources[0] : null),
                item: item
            };
        });

        if (list.length === 0) {
            list.push({ title: 'Ничего не найдено', subtitle: 'Попробуйте другой поиск или проверьте сервер' });
        }

        Lampa.Select.show({
            title: 'Jellyfin',
            items: list,
            onBack: Jellyfin.wrapSelectOnBack(onBack),
            onSelect: function (a) {
                if (!a.item) {
                    if (onBack) onBack();
                    return;
                }

                try {
                    if (tmdbInfo && tmdbInfo.tmdbId && a.item.Id) {
                        Jellyfin.rememberTmdbMapping(tmdbInfo.cardType, tmdbInfo.tmdbId, a.item.Id);
                    }
                } catch (eRem) {}
                if (a.item.Type === 'Series') Jellyfin.openPlayMenu(a.item, function () { showSelection(items, onBack, tmdbInfo); });
                else Jellyfin.openPlayMenu(a.item, function () { showSelection(items, onBack, tmdbInfo); });
            }
        });
    }

    function bindJellyfinButton(btn, movie) {
        try { btn.off('hover:enter click'); } catch (e0) {}
        btn.on('hover:enter click', function () {
            var enabled = null;
            try { enabled = Lampa.Controller.enabled(); } catch (e0) { enabled = null; }
            var restore = function () {
                Lampa.Controller.toggle(enabled && enabled.name ? enabled.name : 'full_start');
                setTimeout(function () {
                    try {
                        if (btn && btn.length) Lampa.Controller.collectionFocus(btn[0], btn.parent());
                    } catch (e1) {}
                }, 10);
            };

            var cardType = movie && (movie.name || movie.original_name) ? 'tv' : 'movie';
            var jfId = '';
            try { jfId = movie && movie.jellyfin_item_id ? String(movie.jellyfin_item_id) : ''; } catch (e2) { jfId = ''; }
            if (!jfId) {
                try { jfId = Jellyfin.findJellyfinIdByTmdb(cardType, movie && movie.id ? movie.id : ''); } catch (e3) { jfId = ''; }
            }

            var title = movie.title || movie.name;
            var year = (movie.release_date || movie.first_air_date || '').split('-')[0];
            var tmdbId = movie && movie.id ? String(movie.id) : '';
            var tmdbInfo = { cardType: cardType, tmdbId: tmdbId };

            var doRealSearch = function () {
                var stopSearchNoty = Jellyfin.delayedNoty('Jellyfin: Поиск...', 0);
                Jellyfin.search(title, year, function (items) {
                    try { stopSearchNoty(); } catch (e0) {}
                    try {

                        if (tmdbId && items && items.length === 1 && items[0] && items[0].Id) {
                            var m0 = items[0];
                            var providers0 = m0.ProviderIds || m0.Providerids || {};
                            var itemTmdb = providers0 && (providers0.Tmdb || providers0.tmdb || providers0.TMDb || '');
                            if (itemTmdb && String(itemTmdb) === String(tmdbId)) {
                                Jellyfin.rememberTmdbMapping(cardType, tmdbId, m0.Id);
                            }
                        }
                    } catch (eRem2) {}
                    showSelection(items, restore, tmdbInfo);
                });
            };

            if (jfId) {
                var stopNoty = Jellyfin.delayedNoty('Jellyfin: открываю...', 450);
                Jellyfin.authenticate(function () {
                    Jellyfin.getItemDetails(jfId, function (full) {
                        var fullProviders = full && (full.ProviderIds || full.Providerids) || {};
                        var fullTmdb = fullProviders && (fullProviders.Tmdb || fullProviders.tmdb || fullProviders.TMDb || '');
                        if (full && full.Id && fullTmdb && String(fullTmdb) === String(tmdbId)) {
                            Jellyfin.openPlayMenu(full, restore, null, stopNoty);
                        } else {

                            try { stopNoty(); } catch (e0) {}
                            try { Jellyfin.forgetTmdbMapping(cardType, tmdbId); } catch (e1) {}
                            doRealSearch();
                        }
                    });
                });
                return;
            }

            doRealSearch();
        });
    }

    function addJellyfinButton(movie, render) {
        if (!render || !render.find) return;
        var buttons = render.find('.full-start-new__buttons');
        if (!buttons || !buttons.length) buttons = render.find('.full-start__buttons');
        if (!buttons || !buttons.length) return;
        var playBtn = buttons.find('.button--play');

        var existed = buttons.find('.button--jellyfin');
        if (existed && existed.length) {
            var btn_exist = existed.eq(0);
            try { btn_exist.html(''); } catch (e0) {}
            btn_exist.append($(getIcon()));
            btn_exist.append($('<span>Jellyfin</span>'));
            bindJellyfinButton(btn_exist, movie);
            if (playBtn && playBtn.length) btn_exist.insertAfter(playBtn.eq(0));
            return;
        }

        var btn = $('<div class="full-start__button selector button--jellyfin"></div>');
        btn.append($(getIcon()));
        btn.append($('<span>Jellyfin</span>'));
        bindJellyfinButton(btn, movie);

        if (playBtn && playBtn.length) {
            btn.insertAfter(playBtn.eq(0));
        } else {
            var options = buttons.find('.button--options');
            if (options.length) {
                var opt_el = options[0];
                if (opt_el && opt_el.parentNode) opt_el.parentNode.insertBefore(btn[0] || btn, opt_el);
                else buttons.append(btn);
            } else {
                var children = buttons.children();
                if (children && children.length >= 1) btn.insertAfter(children.eq(0));
                else buttons.append(btn);
            }
        }
        if (Lampa.Controller.enabled().name === 'full_start') Lampa.Controller.toggle('full_start');
    }

    if (!document.getElementById('jellyfin-button-styles')) {
        $('body').append('<style id="jellyfin-button-styles">.jellyfin-qc{padding:1.2em !important;}.jellyfin-qc__title{font-size:1.2em !important;font-weight:700 !important;margin-bottom:.8em !important;}.jellyfin-qc__text{opacity:.85 !important;line-height:1.35 !important;margin-bottom:1em !important;}.jellyfin-qc__code{font-size:2.4em !important;font-weight:900 !important;letter-spacing:.18em !important;padding:.45em .4em !important;border-radius:.6em !important;background:rgba(255,255,255,.08) !important;border:1px solid rgba(255,255,255,.18) !important;text-align:center !important;}.jellyfin-qc__url{margin-top:1em !important;opacity:.7 !important;word-break:break-all !important;font-size:.9em !important;}.jellyfin-qc__status{margin-top:1em !important;font-weight:600 !important;opacity:.9 !important;}.jellyfin-continue-popup{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.72);}.jellyfin-continue__card{background:#1a1a1a;border-radius:1em;width:44em;max-width:94vw;overflow:hidden;box-shadow:0 1em 4em rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.06);}.jellyfin-continue__img{position:relative;width:100%;padding-top:56.25%;background:#000;overflow:hidden;}.jellyfin-continue__img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0.75;}.jellyfin-continue__details{position:absolute;bottom:0;left:0;right:0;padding:1.3em;background:linear-gradient(transparent,rgba(0,0,0,0.95));}.jellyfin-continue__title{font-size:1.7em;font-weight:700;margin-bottom:0.25em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;}.jellyfin-continue__info{font-size:1.05em;opacity:0.65;color:#fff;}.jellyfin-continue__body{padding:0 1.3em 0.4em;margin-top:-0.4em;}.jellyfin-continue__question{font-size:1.15em;font-weight:600;margin:1em 0 0.8em;}.jellyfin-continue__footer{display:flex;flex-direction:row;gap:1em;padding:1.2em;}.jellyfin-continue__btn{position:relative;padding:1em 1.2em;border-radius:0.6em;cursor:pointer;font-size:1.15em;font-weight:600;background:rgba(255,255,255,0.08);color:#fff;transition:all 0.2s ease;text-align:center;flex:1;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.06);}.jellyfin-continue__btn.focus{background:#fff;color:#000;transform:translateY(-0.2em);box-shadow:0 0.5em 1.5em rgba(255,255,255,0.2);}.jellyfin-continue__bar{height:0.42em;background:rgba(255,255,255,0.12);border-radius:0.3em;overflow:hidden;}.jellyfin-continue__barfill{height:100%;background:#9B59B6;width:0%;}.jellyfin-badge{display:inline-block;margin-left:0.55em;padding:0.18em 0.55em;border-radius:0.55em;font-size:0.78em;line-height:1.2;font-weight:700;vertical-align:middle;white-space:nowrap;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.12);color:#fff;}.jellyfin-badge--last{background:rgba(155,89,182,0.25);border-color:rgba(155,89,182,0.45);}</style>');
    }

    function JellyfinLibraryCard(data) {
        this.data = data;

        function findEl(root, selector) {
            try {
                var found = root && root.find ? root.find(selector) : null;
                if (found && found[0]) return found[0];
                if (found && found.nodeType === 1) return found;
            } catch (e0) {}
            return null;
        }

        this.build = function () {
            this.item = Lampa.Template.js('jellyfin_library_card');
            if (!this.item) return;

            this.item_dom = this.item[0] ? this.item[0] : (this.item.nodeType === 1 ? this.item : null);
            this.img_el = findEl(this.item, '.card__img');
            this.title_el = findEl(this.item, '.jf-lib-card__title');

            if (this.title_el) this.title_el.textContent = data.title || '';

            if (this.item.addEventListener) this.item.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
            var self = this;
            if (this.img_el) {
                this.img_el.onload = function () {
                    try {
                        if (self.item_dom) self.item_dom.classList.add('card--loaded');
                    } catch (e) {}
                };
                this.img_el.onerror = function () {
                    try {
                        var fallback = data.img_backdrop || '';
                        if (fallback && self.img_el.src !== fallback) {
                            self.img_el.src = fallback;
                        } else {
                            self.img_el.src = './img/img_load.svg';
                        }
                    } catch (e) {}
                };
            }
        };

        this.visible = function () {
            if (this.img_el) this.img_el.src = data.img || './img/img_load.svg';
            if (this.onVisible) this.onVisible(this.item, data);
        };

        this.create = function () {
            var self = this;
            this.build();
            if (!this.item) return;

            this.item.addEventListener('hover:focus', function () { if (self.onFocus) self.onFocus(self.item, data); });
            this.item.addEventListener('hover:hover', function () { if (self.onHover) self.onHover(self.item, data); });
            this.item.addEventListener('hover:touch', function () { if (self.onTouch) self.onTouch(self.item, data); });
            this.item.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: 'jellyfin://browse?parentId=' + encodeURIComponent(data.jellyfin_view_id || '') + '&kind=' + encodeURIComponent(data.kind || 'media') + '&title=' + encodeURIComponent(data.title || ''),
                    title: data.title || '',
                        component: 'category_full',
                    page: 1
                });
            });

            this.image();
        };

        this.destroy = function () {
            if (this.img_el) { this.img_el.onload = null; this.img_el.onerror = null; this.img_el.src = ''; }
            if (this.item && this.item.remove) this.item.remove();
            this.item = null;
        };

        this.render = function (js) { return js ? this.item : $(this.item); };
    }

    function JellyfinResumeCard(data) {
        this.data = data;

        function findEl(root, selector) {
            try {
                var found = root && root.find ? root.find(selector) : null;
                if (found && found[0]) return found[0];
                if (found && found.nodeType === 1) return found;
            } catch (e0) {}
            return null;
        }

        this._updateTexts = function () {
            try {
                var title = '';
                var sub = '';

                try { title = String(data.title || data.name || data.original_title || data.original_name || '').trim(); } catch (eT0) { title = ''; }

                if (data && data.episode_name) {
                    var label = '';
                    try { label = data && data.jellyfin_resume && data.jellyfin_resume.episodeLabel ? String(data.jellyfin_resume.episodeLabel) : ''; } catch (eL0) { label = ''; }
                    var epName = '';
                    try { epName = String(data.episode_name || '').trim(); } catch (eEN0) { epName = ''; }
                    if (label && epName) sub = label + ' - ' + epName;
                    else sub = label || epName || '';
                } else {
                    var year = '';
                    try { year = String((data.release_date || data.first_air_date || '')).slice(0, 4); } catch (eY0) { year = ''; }
                    sub = year || '';
                }

                if (this.title_el) this.title_el.textContent = title || '';
                if (this.sub_el) {
                    this.sub_el.textContent = sub || '';
                    this.sub_el.style.display = sub ? '' : 'none';
                }
            } catch (e0) {}
        };

        this._updateProgress = function () {
            try {
                var pct = 0;
                try { pct = data && data.jellyfin_resume ? parseFloat(data.jellyfin_resume.percent) || 0 : 0; } catch (eP0) { pct = 0; }
                pct = Math.max(0, Math.min(100, pct));
                if (this.bar_fill_el) this.bar_fill_el.style.width = pct + '%';

                var timeLabel = '';
                try { timeLabel = data && data.jellyfin_resume && data.jellyfin_resume.timeLabel ? String(data.jellyfin_resume.timeLabel) : ''; } catch (eTL0) { timeLabel = ''; }
                if (this.time_el) {
                    this.time_el.textContent = timeLabel || '';
                    this.time_el.style.display = timeLabel ? '' : 'none';
                }
            } catch (e0) {}
        };

        this._ensureSeriesEpisodeInfo = function () {
            try {
                if (!data || data.episode_name) return;
                var cardType = '';
                try { cardType = String(data.card_type || '').toLowerCase(); } catch (eCT0) { cardType = ''; }
                if (cardType !== 'tv') return;
                if (data._jf_resume_series_loaded) return;
                data._jf_resume_series_loaded = true;

                var seriesId = '';
                try { seriesId = String(data.jellyfin_item_id || data.jellyfin_id || ''); } catch (eSI0) { seriesId = ''; }
                if (!seriesId) return;

                Jellyfin.getSeriesResume(seriesId, function (resumeEpisode) {
                    if (!resumeEpisode || !resumeEpisode.Id) return;

                    var sNo = '';
                    var eNo = '';
                    try { sNo = resumeEpisode.ParentIndexNumber ? String(resumeEpisode.ParentIndexNumber) : ''; } catch (eS0) { sNo = ''; }
                    try { eNo = resumeEpisode.IndexNumber ? String(resumeEpisode.IndexNumber) : ''; } catch (eE0) { eNo = ''; }
                    var epLabel = (sNo || eNo) ? ('S' + (sNo || '?') + 'E' + (eNo || '?')) : '';

                    var resumeSec = 0;
                    var durSec = 0;
                    try { resumeSec = Jellyfin.getResumeSecondsFromItem(resumeEpisode); } catch (eRS0) { resumeSec = 0; }
                    try { durSec = Jellyfin.getDurationSecondsFromItem(resumeEpisode); } catch (eDS0) { durSec = 0; }
                    var pct = 0;
                    try { pct = durSec ? ((resumeSec / durSec) * 100) : 0; } catch (eP0) { pct = 0; }
                    pct = Math.max(0, Math.min(100, pct));

                    var durStr = durSec > 0 ? Jellyfin.formatSecondsShort(durSec) : '';
                    var posStr = resumeSec > 0 ? Jellyfin.formatSecondsShort(resumeSec) : '';
                    var timeLabel = '';
                    if (durStr && posStr) timeLabel = posStr + '/' + durStr;
                    else timeLabel = durStr || posStr || '';

                    var epName = '';
                    try { epName = String(resumeEpisode.Name || '').trim(); } catch (eEN0) { epName = ''; }

                    data.jellyfin_resume = data.jellyfin_resume || {};
                    if (epLabel) data.jellyfin_resume.episodeLabel = epLabel;
                    if (timeLabel) data.jellyfin_resume.timeLabel = timeLabel;
                    if (pct) data.jellyfin_resume.percent = pct;

                    var sub = '';
                    if (epLabel && epName) sub = epLabel + ' - ' + epName;
                    else sub = epLabel || epName || '';

                    try {
                        if (Jellyfin._resumeCardRefs && Jellyfin._resumeCardRefs[seriesId]) {
                            var ref = Jellyfin._resumeCardRefs[seriesId];
                            if (ref && ref.sub_el) {
                                ref.sub_el.textContent = sub;
                                ref.sub_el.style.display = sub ? '' : 'none';
                            }
                            if (ref && ref.bar_fill_el) ref.bar_fill_el.style.width = (pct || 0) + '%';
                            if (ref && ref.time_el) {
                                ref.time_el.textContent = timeLabel || '';
                                ref.time_el.style.display = timeLabel ? '' : 'none';
                            }
                        }
                    } catch (eU0) {}
                }, function () {});
            } catch (e0) {}
        };

        this.build = function () {
            this.item = Lampa.Template.js('jellyfin_resume_card');
            if (!this.item) return;

            this.item_dom = this.item[0] ? this.item[0] : (this.item.nodeType === 1 ? this.item : null);
            this.img_el = findEl(this.item, '.jf-resume-card__img');
            this.title_el = findEl(this.item, '.jf-resume-card__title');
            this.sub_el = findEl(this.item, '.jf-resume-card__sub');
            this.bar_fill_el = findEl(this.item, '.jf-resume-card__barfill');
            this.time_el = findEl(this.item, '.jf-resume-card__time');

            this._updateTexts();
            this._updateProgress();

            if (this.item.addEventListener) this.item.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
            var self = this;
            if (this.img_el) {
                this.img_el.onload = function () { try { if (self.item_dom) self.item_dom.classList.add('card--loaded'); } catch (e) {} };
                this.img_el.onerror = function () {
                    try {
                        var currentSrc = self.img_el.src || '';
                        if (currentSrc.indexOf('/Images/Thumb') !== -1) {
                            var itemId = '';
                            try { itemId = String(data.jellyfin_item_id || data.jellyfin_id || data.id || ''); } catch (e0) { itemId = ''; }
                            if (itemId) {
                                var primaryUrl = Jellyfin.buildImageUrl(itemId, 'primary');
                                if (primaryUrl && primaryUrl !== currentSrc) {
                                    self.img_el.src = primaryUrl;
                                    return;
                                }
                            }
                        } else if (currentSrc.indexOf('/Images/Primary') !== -1) {
                            var itemId2 = '';
                            try { itemId2 = String(data.jellyfin_item_id || data.jellyfin_id || data.id || ''); } catch (e1) { itemId2 = ''; }
                            if (itemId2) {
                                var backdropUrl = Jellyfin.buildImageUrl(itemId2, 'backdrop');
                                if (backdropUrl && backdropUrl !== currentSrc) {
                                    self.img_el.src = backdropUrl;
                                    return;
                                }
                            }
                        }
                        self.img_el.src = './img/img_load.svg';
                    } catch (e) {
                        self.img_el.src = './img/img_load.svg';
                    }
                };
            }
        };

        this.visible = function () {
            try {
                var img = '';
                try { img = String(data.img || data.img_backdrop || data.background_image || ''); } catch (e0) { img = ''; }
                if (this.img_el) this.img_el.src = img || './img/img_load.svg';
            } catch (e1) {}
            if (this.onVisible) this.onVisible(this.item, data);
        };

        this.create = function () {
            var self = this;
            this.build();
            if (!this.item) return;

            var key = '';
            try { key = String(data.jellyfin_item_id || data.jellyfin_id || ''); } catch (e0) { key = ''; }
            if (key) {
                if (!Jellyfin._resumeCardRefs) Jellyfin._resumeCardRefs = {};
                Jellyfin._resumeCardRefs[key] = { sub_el: this.sub_el, bar_fill_el: this.bar_fill_el, time_el: this.time_el };
            }

            this.item.addEventListener('hover:focus', function () {
                self._updateTexts();
                self._updateProgress();
                self._ensureSeriesEpisodeInfo();
                if (self.onFocus) self.onFocus(self.item, data);
            });
            this.item.addEventListener('hover:hover', function () { if (self.onHover) self.onHover(self.item, data); });
            this.item.addEventListener('hover:touch', function () { if (self.onTouch) self.onTouch(self.item, data); });
            this.item.addEventListener('hover:enter', function () {
                var jfId = '';
                try { jfId = String(data.jellyfin_item_id || data.jellyfin_id || data.id || ''); } catch (e0) { jfId = ''; }
                if (!jfId) return;
                var stopNoty = Jellyfin.delayedNoty('Jellyfin: открываю...', 450);
                Jellyfin.authenticate(function () {
                    Jellyfin.getItemDetails(jfId, function (full) {
                        var typeLower = '';
                        try { typeLower = String(full.Type || '').toLowerCase(); } catch (eT0) { typeLower = ''; }
                        if (typeLower === 'episode' && full.SeriesId) {
                            Jellyfin.getItemDetails(full.SeriesId, function (seriesFull) {
                                Jellyfin.openPlayMenu(seriesFull || { Id: full.SeriesId }, null, null, stopNoty);
                            });
                            return;
                        }
                        Jellyfin.openPlayMenu(full || { Id: jfId }, null, null, stopNoty);
                    });
                });
            });

            this.image();
        };

        this.destroy = function () {
            try {
                var key = '';
                try { key = String(data.jellyfin_item_id || data.jellyfin_id || ''); } catch (e0) { key = ''; }
                if (key && Jellyfin._resumeCardRefs) delete Jellyfin._resumeCardRefs[key];
            } catch (e1) {}
            if (this.img_el) { this.img_el.onload = null; this.img_el.onerror = null; this.img_el.src = ''; }
            if (this.item && this.item.remove) this.item.remove();
            this.item = null;
        };

        this.render = function (js) { return js ? this.item : $(this.item); };
    }

    function JellyfinFolderCard(data, kind) {
        this.data = data;
        this.kind = kind || 'media';

        function findEl(root, selector) {
            try {
                var found = root && root.find ? root.find(selector) : null;
                if (found && found[0]) return found[0];
                if (found && found.nodeType === 1) return found;
            } catch (e0) {}
            return null;
        }

        this.build = function () {
            var templateName = (this.kind === 'boxset') ? 'jellyfin_folder_card_vertical' : 'jellyfin_folder_card';
            this.item = Lampa.Template.js(templateName);
            if (!this.item) return;

            this.item_dom = this.item[0] ? this.item[0] : (this.item.nodeType === 1 ? this.item : null);
            this.img_el = findEl(this.item, '.jf-folder-card__img');
            this.badge_el = findEl(this.item, '.jf-folder-card__badge');
            this.title_el = findEl(this.item, '.card__title');

            if (this.title_el) this.title_el.textContent = data.title || '';

            if (this.badge_el) {
                var cnt = parseInt(data.child_count, 10) || 0;
                if (cnt > 0) {
                    this.badge_el.textContent = cnt > 99 ? '99+' : String(cnt);
                } else {
                    this.badge_el.style.display = 'none';
                }
            }

            if (this.item.addEventListener) this.item.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
            var self = this;
            if (this.img_el) {
                this.img_el.onload = function () {
                    try {
                        if (self.item_dom) self.item_dom.classList.add('card--loaded');
                    } catch (e) {}
                };
                this.img_el.onerror = function () { try { self.img_el.src = './img/img_load.svg'; } catch (e) {} };
            }
        };

        this.visible = function () {
            if (this.img_el) this.img_el.src = data.img || './img/img_load.svg';
            if (this.onVisible) this.onVisible(this.item, data);
        };

        this.create = function () {
            var self = this;
            this.build();
            if (!this.item) return;

            this.item.addEventListener('hover:focus', function () { if (self.onFocus) self.onFocus(self.item, data); });
            this.item.addEventListener('hover:hover', function () { if (self.onHover) self.onHover(self.item, data); });
            this.item.addEventListener('hover:touch', function () { if (self.onTouch) self.onTouch(self.item, data); });
            this.item.addEventListener('hover:enter', function () {
                Lampa.Activity.push({
                    url: 'jellyfin://browse?parentId=' + encodeURIComponent(data.jellyfin_boxset_id || '') + '&kind=media&title=' + encodeURIComponent(data.title || ''),
                    title: data.title || '',
                        component: 'category_full',
                    page: 1
                });
            });

            this.image();
        };

        this.destroy = function () {
            if (this.img_el) { this.img_el.onload = null; this.img_el.onerror = null; this.img_el.src = ''; }
            if (this.item && this.item.remove) this.item.remove();
            this.item = null;
        };

        this.render = function (js) { return js ? this.item : $(this.item); };
    }

    function jfBadgeEnabled() {
        try { return Lampa.Storage.get('jellyfin_poster_badge', true) !== false; } catch (e) { return true; }
    }

    function jfIndexReady() {
        try {
            if (Jellyfin._indexState && Jellyfin._indexState.builtAt) return true;
        } catch (e0) {}
        try {
            return !!(parseInt(Lampa.Storage.get('jellyfin_index_built_at', 0), 10) || 0);
        } catch (e1) {
            return false;
        }
    }

    function jfFormatIndexTime(ts) {
        try {
            var d = new Date(ts);
            var p = function (n) { return (n < 10 ? '0' : '') + n; };
            return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
        } catch (e0) {
            return '';
        }
    }

    function jfIndexStatusDescription() {
        try {
            if (Jellyfin._indexState && Jellyfin._indexState.building && Jellyfin._indexState.progress) {
                var p = Jellyfin._indexState.progress;
                var line = 'Идёт сканирование библиотеки...';
                if (p.jobsTotal) line += ' Раздел ' + p.jobIdx + ' из ' + p.jobsTotal + (p.label ? ' (' + p.label + ')' : '');
                line += '. Просканировано: ' + (p.scanned || 0);
                if (p.libraryTotal) line += ' из ~' + p.libraryTotal;
                line += ', сопоставлено: ' + (p.found || 0);
                return line;
            }

            var last = Lampa.Storage.get('jellyfin_index_last_counts', null);
            if (!last || typeof last !== 'object' || !last.at) {
                return 'Ещё не сканировалось. Проверка запускается автоматически в фоне.';
            }
            var lines = [];
            if (last.movie) lines.push('Фильмов сопоставлено: ' + (last.movie.found || 0) + (last.movie.total ? ' из ' + last.movie.total : ''));
            if (last.tv) lines.push('Сериалов сопоставлено: ' + (last.tv.found || 0) + (last.tv.total ? ' из ' + last.tv.total : ''));
            if (!lines.length) lines.push('Найдено совпадений: ' + (last.matched || 0) + (last.libraryTotal ? ' из ' + last.libraryTotal : ''));
            var text = lines.join('. ') + '. Обновлено: ' + jfFormatIndexTime(last.at);
            var deltaAt = parseInt(Lampa.Storage.get('jellyfin_index_delta_at', 0), 10) || 0;
            if (deltaAt && deltaAt !== last.at) {
                text += '. Проверка новинок: ' + jfFormatIndexTime(deltaAt);
            }
            return text;
        } catch (e0) {
            return '';
        }
    }

    var jfIndexRowEl = null;

    function jfUpdateIndexStatusUI() {
        try {
            if (!jfIndexRowEl || !jfIndexRowEl.closest) return;
            if (!jfIndexRowEl.closest('body').length) { jfIndexRowEl = null; return; }
            var descr = jfIndexRowEl.find('.settings-param__descr');
            if (!descr.length) descr = $('<div class="settings-param__descr"></div>').appendTo(jfIndexRowEl);
            descr.text(jfIndexStatusDescription());
        } catch (e0) {}
    }

    function jfRebuildIndexHandler() {
        if (Jellyfin._indexState && Jellyfin._indexState.building) {
            Lampa.Noty.show('Jellyfin: проверка библиотеки уже выполняется, подождите');
            return;
        }
        Lampa.Noty.show('Jellyfin: проверяю библиотеку...');
        Jellyfin.buildTmdbIndex({}, function (ok, count, diag) {
            if (diag && diag.alreadyBuilding) {
                Lampa.Noty.show('Jellyfin: проверка библиотеки уже выполняется, подождите');
                return;
            }
            if (ok) {
                var msg = '';
                if (diag && diag.byType) {
                    msg = 'Jellyfin: фильмов ' + (diag.byType.movie.found || 0) + ' из ' + (diag.byType.movie.total || 0)
                        + ', сериалов ' + (diag.byType.tv.found || 0) + ' из ' + (diag.byType.tv.total || 0);
                } else {
                    msg = 'Jellyfin: найдено совпадений ' + (count || 0) + (diag ? ' из ' + (diag.scanned || 0) + ' просканированных' : '');
                }
                if (diag && diag.failedPages) msg += '. Сбоев страниц: ' + diag.failedPages;
                if (diag && diag.abortedKinds) msg += '. Некоторые разделы библиотеки не досканированы полностью';
                Lampa.Noty.show(msg);
            }
            else Lampa.Noty.show('Jellyfin: не удалось проверить библиотеку (нет соединения с сервером)');
        });
    }

    function jfCardMediaMethod(data) {
        if (!data) return '';
        if (data.method === 'tv' || data.method === 'movie') return data.method;
        var mt = String(data.media_type || data.type || '').toLowerCase();
        if (mt === 'tv' || mt === 'movie') return mt;
        if (data.name || data.original_name || data.first_air_date) return 'tv';
        if (data.title || data.release_date) return 'movie';
        return '';
    }

    function jfCardMediaId(data) {
        if (!data) return '';
        return String(data.id || data.tmdb_id || data.tmdb || '');
    }

    function jfBindCardData(html, data) {
        if (!html || !data) return;
        try {
            if (html.jquery) { html.card_data = data; if (html[0]) html[0].card_data = data; }
            else if (html.nodeType === 1) html.card_data = data;
        } catch (e0) {}
    }

    function jfDecorateFolderBadge(cardEl) {
        try {
            var el = cardEl && cardEl.jquery ? cardEl[0] : cardEl;
            if (!el) return;
            var data = jfCardDataFrom(el);
            if (!data || !data.jellyfin_boxset_id) return;
            var cnt = parseInt(data.child_count, 10) || 0;
            if (cnt <= 0) return;
            var $card = $(el);
            if ($card.find('.jf-count-badge, .jf-folder-card__badge').length) return;
            var $view = $card.find('.card__view').first();
            if (!$view.length) return;
            $view.append('<div class="jf-count-badge">' + (cnt > 99 ? '99+' : cnt) + '</div>');
        } catch (e0) {}
    }

    function jfCardDataFrom(cardEl) {
        try {
            var el = cardEl && cardEl.jquery ? cardEl[0] : cardEl;
            if (el && el.card_data) return el.card_data;
            if (el && el.mirkino_row) return el.mirkino_row;
        } catch (e0) {}
        return null;
    }

    function jfOpenById(jfId) {
        try {
            var id = String(jfId || '');
            if (!id) return;
            Jellyfin.authenticate(function () {
                Jellyfin.getItemDetails(id, function (full) {
                    try { Jellyfin.openPlayMenu(full || { Id: id }, null, null); } catch (e0) {}
                });
            });
        } catch (e0) {}
    }

    function jfBadgePosKey(elementId) {
        return elementId === 'badge_wide' ? 'jellyfin_badge_pos_wide' : 'jellyfin_badge_pos';
    }

    function jfBadgePos(elementId) {
        try { return String(Lampa.Storage.get(jfBadgePosKey(elementId), 'tl') || 'tl'); } catch (e0) { return 'tl'; }
    }

    var JF_BADGE_OFFSET_STEP = 2;
    var JF_BADGE_OFFSET_MIN = 0;
    var JF_BADGE_OFFSET_MAX = 40;
    var jfBadgeEditMode = '';
    var jfBadgeKeyCaptureReady = false;

    function jfClampBadgeOffset(value, fallback) {
        var fb = fallback == null ? 0 : fallback;
        var n = parseFloat(value);
        if (isNaN(n)) n = fb;
        n = Math.round(n / JF_BADGE_OFFSET_STEP) * JF_BADGE_OFFSET_STEP;
        if (n < JF_BADGE_OFFSET_MIN) n = JF_BADGE_OFFSET_MIN;
        if (n > JF_BADGE_OFFSET_MAX) n = JF_BADGE_OFFSET_MAX;
        return n;
    }

    function jfNormalizeStoredBadgeOffset(raw, fallback) {
        if (raw == null) return jfClampBadgeOffset(fallback, 0);
        var str = String(raw || '').trim();
        if (!str) return jfClampBadgeOffset(fallback, 0);
        var n = parseFloat(str.replace(/[^\d.\-]/g, ''));
        if (isNaN(n)) n = fallback;
        return jfClampBadgeOffset(n, fallback);
    }

    function jfBadgeOffsetKey(axis, elementId) {
        var wide = elementId === 'badge_wide';
        if (axis === 'x') return wide ? 'jellyfin_badge_off_x_wide' : 'jellyfin_badge_off_x';
        return wide ? 'jellyfin_badge_off_y_wide' : 'jellyfin_badge_off_y';
    }

    function jfReadBadgeOffset(axis, elementId) {
        var fallback = axis === 'x' ? 4 : 4;
        var key = jfBadgeOffsetKey(axis, elementId);
        var raw = '';
        try { raw = Lampa.Storage.get(key, ''); } catch (e0) { raw = ''; }
        if (raw) return jfNormalizeStoredBadgeOffset(raw, fallback);

        if (elementId !== 'badge_wide') {
            var legacyKey = axis === 'x' ? 'jellyfin_badge_offset_x' : 'jellyfin_badge_offset_y';
            var legacy = '';
            try { legacy = Lampa.Storage.get(legacyKey, ''); } catch (e1) { legacy = ''; }
            if (legacy !== '' && legacy != null) {
                var em = parseFloat(String(legacy).replace(/[^\d.\-]/g, ''));
                if (!isNaN(em) && isFinite(em)) {
                    var base = axis === 'x' ? 12.75 : (12.75 * 1.5);
                    var pct = (em / base) * 100;
                    var clamped = jfClampBadgeOffset(pct, fallback);
                    try { Lampa.Storage.set(key, String(clamped) + 'p'); } catch (e2) {}
                    return clamped;
                }
            }
        }
        return jfClampBadgeOffset(fallback, 0);
    }

    function jfWriteBadgeOffset(axis, value, elementId) {
        var key = jfBadgeOffsetKey(axis, elementId);
        var v = jfClampBadgeOffset(value, axis === 'x' ? 4 : 4);
        try { Lampa.Storage.set(key, String(v) + 'p'); } catch (e0) {}
        jfApplyBadgeCss();
        jfRefreshBadgePosEditorVisuals(elementId);
    }

    function jfNudgeBadgeOffset(dx, dy, elementId) {
        var anchor = jfBadgePos(elementId);
        var nextX = jfReadBadgeOffset('x', elementId);
        var nextY = jfReadBadgeOffset('y', elementId);
        if (dx) {
            if (anchor.indexOf('r') >= 0) nextX -= dx;
            else nextX += dx;
        }
        if (dy) {
            if (anchor.indexOf('b') >= 0) nextY -= dy;
            else nextY += dy;
        }
        if (dx) jfWriteBadgeOffset('x', nextX, elementId);
        if (dy) jfWriteBadgeOffset('y', nextY, elementId);
    }

    function jfExitBadgeEditMode() {
        if (!jfBadgeEditMode) return;
        var prev = jfBadgeEditMode;
        jfBadgeEditMode = '';
        $('[data-jf-ui-editor="' + prev + '"]').removeClass('jf-ui-pos-editor--active');
        jfRefreshBadgePosEditorVisuals(prev);
    }

    function jfEnterBadgeEditMode(elementId) {
        jfExitBadgeEditMode();
        jfBadgeEditMode = elementId;
        $('[data-jf-ui-editor="' + elementId + '"]').addClass('jf-ui-pos-editor--active');
        jfRefreshBadgePosEditorVisuals(elementId);
    }

    function jfToggleBadgeEditMode(elementId) {
        if (jfBadgeEditMode === elementId) jfExitBadgeEditMode();
        else jfEnterBadgeEditMode(elementId);
    }

    function jfBadgePosNudgeByDir(elementId, dir) {
        if (dir === 'left') jfNudgeBadgeOffset(-JF_BADGE_OFFSET_STEP, 0, elementId);
        else if (dir === 'right') jfNudgeBadgeOffset(JF_BADGE_OFFSET_STEP, 0, elementId);
        else if (dir === 'up') jfNudgeBadgeOffset(0, -JF_BADGE_OFFSET_STEP, elementId);
        else if (dir === 'down') jfNudgeBadgeOffset(0, JF_BADGE_OFFSET_STEP, elementId);
        jfRefreshBadgePosEditorVisuals(elementId);
    }

    function jfHandleBadgePosKeydown(e) {
        if (!jfBadgeEditMode) return;
        var code = e.keyCode || e.which || 0;
        var handled = false;
        if (code === 37) { jfBadgePosNudgeByDir(jfBadgeEditMode, 'left'); handled = true; }
        else if (code === 39) { jfBadgePosNudgeByDir(jfBadgeEditMode, 'right'); handled = true; }
        else if (code === 38) { jfBadgePosNudgeByDir(jfBadgeEditMode, 'up'); handled = true; }
        else if (code === 40) { jfBadgePosNudgeByDir(jfBadgeEditMode, 'down'); handled = true; }
        else if (code === 8 || code === 27 || code === 461 || code === 10009) { jfExitBadgeEditMode(); handled = true; }
        if (!handled) return;
        try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
    }

    function jfEnsureBadgePosKeyCapture() {
        if (jfBadgeKeyCaptureReady) return;
        jfBadgeKeyCaptureReady = true;
        try { document.addEventListener('keydown', jfHandleBadgePosKeydown, true); } catch (e) {}
    }

    function jfPreviewDotPos(elementId) {
        var anchor = jfBadgePos(elementId);
        var x = jfReadBadgeOffset('x', elementId);
        var y = jfReadBadgeOffset('y', elementId);
        var left = x;
        var top = y;
        if (anchor.indexOf('r') >= 0) left = 100 - x;
        if (anchor.indexOf('b') >= 0) top = 100 - y;
        left = Math.max(0, Math.min(100, left));
        top = Math.max(0, Math.min(100, top));
        return { left: left + '%', top: top + '%' };
    }

    function jfRefreshBadgePosEditorVisualsNow(elementId) {
        elementId = elementId || 'badge';
        var $editor = $('[data-jf-ui-editor="' + elementId + '"]');
        if (!$editor.length) return;
        try {
            var $dot = $editor.find('.jf-ui-pos-editor__dot');
            var pos = jfPreviewDotPos(elementId);
            $dot.css({ left: pos.left, top: pos.top });
        } catch (e0) {}
        try {
            var x = jfReadBadgeOffset('x', elementId);
            var y = jfReadBadgeOffset('y', elementId);
            $editor.find('.jf-ui-pos-editor__status').text('X ' + x + '% - Y ' + y + '%');
            $editor.find('.jf-ui-pos-editor__hint').text('OK — настройка стрелками пульта');
        } catch (e1) {}
    }

    function jfRefreshBadgePosEditorVisualsAll() {
        jfRefreshBadgePosEditorVisualsNow('badge');
        jfRefreshBadgePosEditorVisualsNow('badge_wide');
    }

    function jfRefreshBadgePosEditorVisualsDebounced(elementId) {
        setTimeout(function () { jfRefreshBadgePosEditorVisualsNow(elementId || 'badge'); }, 10);
    }

    function jfRefreshBadgePosEditorVisuals(elementId) {
        jfRefreshBadgePosEditorVisualsDebounced(elementId);
    }

    function jfRenderBadgePosEditor($item, elementId) {
        elementId = elementId || 'badge';
        var isWide = elementId === 'badge_wide';
        jfEnsureBadgePosKeyCapture();
        try { $item.addClass('jf-ui-pos-wrap'); } catch (e0) {}
        var $editor = $(
            '<div class="settings-param selector jf-ui-pos-editor" data-static="true" data-jf-ui-editor="' + elementId + '">' +
                '<div class="jf-ui-pos-editor__layout">' +
                    '<div class="jf-ui-pos-editor__preview' + (isWide ? ' jf-ui-pos-editor__preview--wide' : '') + '" aria-hidden="true">' +
                        '<div class="jf-ui-pos-editor__card"></div>' +
                        '<div class="jf-ui-pos-editor__dot"></div>' +
                    '</div>' +
                    '<div class="jf-ui-pos-editor__dpad" aria-hidden="true">' +
                        '<div class="jf-ui-pos-editor__chip jf-ui-pos-editor__chip--up" data-ui-dir="up">↑</div>' +
                        '<div class="jf-ui-pos-editor__chip jf-ui-pos-editor__chip--left" data-ui-dir="left">←</div>' +
                        '<div class="jf-ui-pos-editor__chip jf-ui-pos-editor__chip--mid"><span class="jf-ui-pos-editor__chip-label">OK</span></div>' +
                        '<div class="jf-ui-pos-editor__chip jf-ui-pos-editor__chip--right" data-ui-dir="right">→</div>' +
                        '<div class="jf-ui-pos-editor__chip jf-ui-pos-editor__chip--down" data-ui-dir="down">↓</div>' +
                    '</div>' +
                '</div>' +
                '<div class="jf-ui-pos-editor__status"></div>' +
                '<div class="jf-ui-pos-editor__hint"></div>' +
            '</div>'
        );
        $editor.on('hover:enter', function () { jfToggleBadgeEditMode(elementId); });
        $editor.on('hover:focus', function () { try { $editor.addClass('focus'); } catch (e0) {} });
        $editor.on('hover:blur', function () {
            if (jfBadgeEditMode === elementId) jfExitBadgeEditMode();
            try { $editor.removeClass('focus'); } catch (e0) {}
        });
        $editor.find('[data-ui-dir]').on('click', function (ev) {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            jfEnterBadgeEditMode(elementId);
            jfBadgePosNudgeByDir(elementId, String($(this).data('ui-dir') || ''));
        });
        $item.append($editor);
        jfRefreshBadgePosEditorVisuals(elementId);
    }

    function jfBadgeEdgesFor(elementId) {
        var pos = jfBadgePos(elementId);
        var x = jfReadBadgeOffset('x', elementId);
        var y = jfReadBadgeOffset('y', elementId);

        var left = 'auto';
        var right = 'auto';
        var top = 'auto';
        var bottom = 'auto';

        if (pos === 'tr') { right = x + '%'; top = y + '%'; }
        else if (pos === 'bl') { left = x + '%'; bottom = y + '%'; }
        else if (pos === 'br') { right = x + '%'; bottom = y + '%'; }
        else { left = x + '%'; top = y + '%'; }

        return { left: left, right: right, top: top, bottom: bottom };
    }

    function jfBadgeCss() {
        var v = jfBadgeEdgesFor('badge');
        var w = jfBadgeEdgesFor('badge_wide');

        return '' +
            '.jf-exist-badge{position:absolute;left:' + v.left + ';right:' + v.right + ';top:' + v.top + ';bottom:' + v.bottom + ';z-index:6;width:1.7em;height:1.7em;border-radius:50%;' +
            'display:flex;align-items:center;justify-content:center;background:rgba(20,20,24,.72);' +
            'box-shadow:0 2px 6px rgba(0,0,0,.4);pointer-events:none;backdrop-filter:blur(4px)}' +
            '.jf-exist-badge svg{width:1.05em;height:1.05em;display:block}' +
            '.jf-exist-badge.jf-exist-badge--wide{left:' + w.left + ';right:' + w.right + ';top:' + w.top + ';bottom:' + w.bottom + '}';
    }

    function jfApplyBadgeCss() {
        try {
            var el = document.getElementById('jf-badge-style');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        } catch (e0) {}
        try {
            $('body').append('<style id="jf-badge-style">' + jfBadgeCss() + '</style>');
        } catch (e1) {}
    }

    function jfInjectBadgePosEditorCss() {
        try { if (document.getElementById('jf-badge-pos-editor-style')) return; } catch (e0) {}
        var css = '' +
            '.jf-ui-pos-wrap .settings-param__name{margin-bottom:.15em}' +
            '.jf-ui-pos-editor{margin-top:.35em;padding:.75em .85em;border-radius:1em;background:linear-gradient(160deg,#1a2030 0%,#12161f 100%);border:1px solid rgba(255,255,255,.08)}' +
            '.jf-ui-pos-editor.focus{box-shadow:0 0 0 .18em rgba(255,255,255,.92)}' +
            '.jf-ui-pos-editor--active{border-color:rgba(90,200,250,.55);box-shadow:0 0 0 .18em rgba(90,200,250,.35),0 10px 24px rgba(0,0,0,.28)}' +
            '.jf-ui-pos-editor__layout{display:flex;align-items:center}' +
            '.jf-ui-pos-editor__preview{position:relative;flex:0 0 4.6em;width:4.6em;height:6.4em;border-radius:.65em;overflow:hidden;background:linear-gradient(145deg,#3a4254 0%,#222833 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}' +
            '.jf-ui-pos-editor__preview--wide{flex:0 0 7.2em;width:7.2em;height:4.05em}' +
            '.jf-ui-pos-editor__card{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.12))}' +
            '.jf-ui-pos-editor__dot{position:absolute;width:.62em;height:.62em;margin:-.31em 0 0 -.31em;border-radius:50%;background:#5ac8fa;box-shadow:0 0 0 .14em rgba(90,200,250,.35),0 2px 8px rgba(0,0,0,.35)}' +

            '.jf-ui-pos-editor__dpad{position:relative;width:7.01em;height:7.01em;margin-left:.85em;flex:0 0 auto}' +
            '.jf-ui-pos-editor__chip{position:absolute;width:2.15em;height:2.15em;display:flex;align-items:center;justify-content:center;border-radius:.75em;font-size:.95em;font-weight:700;color:#eef1f6;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}' +
            '.jf-ui-pos-editor__chip--mid{left:2.43em;top:2.43em;opacity:.72}' +
            '.jf-ui-pos-editor__chip--mid .jf-ui-pos-editor__chip-label{font-size:.72em;font-weight:600}' +
            '.jf-ui-pos-editor__chip--up{left:2.43em;top:0}' +
            '.jf-ui-pos-editor__chip--left{left:0;top:2.43em}' +
            '.jf-ui-pos-editor__chip--right{left:4.86em;top:2.43em}' +
            '.jf-ui-pos-editor__chip--down{left:2.43em;top:4.86em}' +
            '.jf-ui-pos-editor--active .jf-ui-pos-editor__chip{background:rgba(90,200,250,.14)}' +
            '.jf-ui-pos-editor--active .jf-ui-pos-editor__chip--mid{background:rgba(90,200,250,.28);opacity:1}' +
            '.jf-ui-pos-editor__status{margin-top:.55em;font-size:.92em;font-weight:600}' +
            '.jf-ui-pos-editor__hint{margin-top:.2em;font-size:.82em;opacity:.68;line-height:1.35}';
        try { $('body').append('<style id="jf-badge-pos-editor-style">' + css + '</style>'); } catch (e1) {}
    }

    function jfIsWideCard($card) {
        try {
            return $card.hasClass('card--wide') || $card.hasClass('card--horizontal') || $card.hasClass('card--big') || $card.hasClass('card--promo');
        } catch (e0) { return false; }
    }

    function jfDecorateCard(cardEl) {
        try {
            if (!jfBadgeEnabled()) return;
            var el = cardEl && cardEl.jquery ? cardEl[0] : cardEl;
            if (!el || el.jellyfin_badge_checked) return;
            var $card = $(el);
            if ($card.find('.jf-exist-badge').length) { el.jellyfin_badge_checked = true; return; }

            var data = jfCardDataFrom(el);
            if (!data) return;

            var method = jfCardMediaMethod(data);
            var id = jfCardMediaId(data);
            if (!method || !id) return;

            var jfId = '';
            try { jfId = Jellyfin.findJellyfinIdByTmdb(method, id); } catch (e1) { jfId = ''; }
            if (!jfId) {

                if (jfIndexReady()) el.jellyfin_badge_checked = true;
                return;
            }

            el.jellyfin_badge_checked = true;

            var $view = $card.find('.card__view').first();
            if (!$view.length) return;
            try { el.jellyfin_badge_jfid = String(jfId || ''); } catch (eJ0) { el.jellyfin_badge_jfid = ''; }

            var wideCls = jfIsWideCard($card) ? ' jf-exist-badge--wide' : '';
            $view.append('<div class="jf-exist-badge' + wideCls + '" title="Есть на сервере Jellyfin">' + getIcon() + '</div>');
        } catch (e0) {}
    }

    function jfRescanVisibleCards() {
        if (!jfBadgeEnabled()) return;
        try {
            $('.card.card--loaded, .card.selector').each(function () { jfDecorateCard(this); });
        } catch (e0) {}
    }

    function jfPatchCardModule() {
        try {
            if (Lampa.Maker && typeof Lampa.Maker.map === 'function') {
                var map = Lampa.Maker.map('Card');
                if (map && map.Card && !map.Card.__jellyfinBadgePatched) {
                    var originalOnCreate = map.Card.onCreate;
                    map.Card.onCreate = function () {
                        if (typeof originalOnCreate === 'function') originalOnCreate.apply(this, arguments);
                        if (this.html && this.data) jfBindCardData(this.html, this.data);
                    };
                    var originalOnVisible = map.Card.onVisible;
                    map.Card.onVisible = function () {
                        if (typeof originalOnVisible === 'function') originalOnVisible.apply(this, arguments);
                        if (this.html) jfDecorateCard(this.html);
                        if (this.html) jfDecorateFolderBadge(this.html);
                    };
                    map.Card.__jellyfinBadgePatched = true;
                }
            }
        } catch (e0) {}

        try {
            if (typeof Lampa.Card === 'function' && !Lampa.Card.__jellyfinBadgePatched) {
                var proto = Lampa.Card.prototype;
                if (proto && typeof proto.build === 'function') {
                    var originalBuild = proto.build;
                    proto.build = function () {
                        originalBuild.apply(this, arguments);
                        if (this.card && this.data) {
                            jfBindCardData(this.card, this.data);
                            jfDecorateCard(this.card);
                            jfDecorateFolderBadge(this.card);
                        }
                    };
                    Lampa.Card.__jellyfinBadgePatched = true;
                }
            }
        } catch (e0) {}
    }

    function jfInitPosterBadge() {
        jfPatchCardModule();
        [300, 1000, 3000, 8000].forEach(function (delay) { setTimeout(jfPatchCardModule, delay); });

        try {
            Lampa.Listener.follow('line', function (e) {
                if (!e || (e.type !== 'append' && e.type !== 'createAndAppend')) return;
                setTimeout(jfRescanVisibleCards, 120);
            });
            Lampa.Listener.follow('activity', function (e) {
                if (e && (e.type === 'start' || e.type === 'open')) setTimeout(jfRescanVisibleCards, 250);
            });
        } catch (e0) {}
        jfApplyBadgeCss();
    }

    function addJellyfinFoldersUi() {
        if (!Lampa.Template || !Lampa.Template.add) return;

        Lampa.Template.add('jellyfin_library_card',
            '<div class="card selector layer--visible layer--render jf-lib-card">' +
                '<div class="card__view">' +
                    '<img src="./img/img_load.svg" class="card__img">' +
                    '<div class="jf-lib-card__gradient"></div>' +
                    '<div class="jf-lib-card__title"></div>' +
                '</div>' +
                '<div class="card__title" style="display:none"></div>' +
            '</div>');

        Lampa.Template.add('jellyfin_resume_card',
            '<div class="card selector layer--visible layer--render jf-resume-card">' +
                '<div class="card__view">' +
                    '<img src="./img/img_load.svg" class="card__img jf-resume-card__img">' +
                    '<div class="jf-resume-card__time"></div>' +
                    '<div class="jf-resume-card__barclip"><div class="jf-resume-card__bar"><div class="jf-resume-card__barfill"></div></div></div>' +
                '</div>' +
                '<div class="jf-resume-card__title"></div>' +
                '<div class="jf-resume-card__sub"></div>' +
            '</div>');

        Lampa.Template.add('jellyfin_folder_card',
            '<div class="card selector layer--visible layer--render jf-folder-card jf-folder-card--horizontal">' +
                '<div class="card__view">' +
                    '<img src="./img/img_load.svg" class="card__img jf-folder-card__img">' +
                    '<div class="jf-folder-card__badge"></div>' +
                '</div>' +
                '<div class="card__title"></div>' +
            '</div>');

        Lampa.Template.add('jellyfin_folder_card_vertical',
            '<div class="card selector layer--visible layer--render jf-folder-card jf-folder-card--vertical">' +
                '<div class="card__view">' +
                    '<img src="./img/img_load.svg" class="card__img jf-folder-card__img">' +
                    '<div class="jf-folder-card__badge"></div>' +
                '</div>' +
                '<div class="card__title"></div>' +
            '</div>');

        var css = '' +
            '.jf-lib-card .card__view{padding-bottom:150% !important;border-radius:.8em !important;overflow:visible !important;position:relative;background-color:#2b2b2b}' +
            '.items-line .jf-lib-card{width:34.3em !important}' +
            '.items-line .jf-lib-card .card__view{padding-bottom:56% !important}' +
            '.jf-lib-card .card__view::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:.8em;overflow:hidden;pointer-events:none}' +
            '.jf-lib-card .card__img{width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover;opacity:0;transition:opacity .2s ease;border-radius:.8em !important}' +
            '.jf-lib-card.card--loaded .card__img{opacity:1 !important}' +
            '.jf-lib-card__gradient{position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.75) 100%);pointer-events:none;border-radius:0 0 .8em .8em}' +
            '.jf-lib-card__title{position:absolute;left:0;right:0;bottom:0;padding:.7em 1em;color:#fff;font-size:1.15em;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,.6)}' +
            '.jf-lib-card>.card__title{max-height:0 !important;overflow:hidden !important;padding:0 !important;margin:0 !important;visibility:hidden !important}' +
            '.jf-resume-card .card__view{padding-bottom:150% !important;border-radius:.8em !important;overflow:hidden !important;position:relative;background-color:#2b2b2b}' +
            '.items-line .jf-resume-card{width:34.3em !important}' +
            '.items-line .jf-resume-card .card__view{padding-bottom:56% !important}' +
            '.jf-resume-card.focus .card__view{overflow:visible !important}' +
            '.jf-resume-card .jf-resume-card__img{width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover;opacity:0;transition:opacity .2s ease;border-radius:inherit}' +
            '.jf-resume-card.card--loaded .jf-resume-card__img{opacity:1 !important}' +
            '.jf-resume-card__title{margin-top:.55em;font-size:1.1em;font-weight:600;line-height:1.2;max-height:2.4em;overflow:hidden}' +
            '.jf-resume-card__sub{margin-top:.25em;font-size:.95em;opacity:.75;line-height:1.25;max-height:2.5em;overflow:hidden}' +
            '.jf-resume-card__barclip{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;pointer-events:none;opacity:0;transition:opacity .2s ease;border-radius:inherit}' +
            '.jf-resume-card__bar{position:absolute;left:0;right:0;bottom:0;height:.45em;background:rgba(0,0,0,.5);pointer-events:none}' +
            '.jf-resume-card__barfill{height:100%;width:0%;background:linear-gradient(90deg,#AA5CC3 0%,#8B68CC 25%,#6B89DD 50%,#4BA4E8 75%,#00A4DC 100%);transition:width .3s ease}' +
            '.jf-resume-card__time{display:none !important}' +
            '.jf-resume-card.focus .jf-resume-card__barclip,.jf-resume-card.focus .jf-resume-card__time{opacity:1}' +
            '.jf-folder-card--horizontal{position:relative}' +
            '.jf-folder-card--horizontal .card__view{padding-bottom:150% !important;position:relative;border-radius:.8em !important;overflow:visible !important;background-color:#2b2b2b}' +
            '.jf-folder-card--horizontal .card__view::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:.8em;overflow:hidden;pointer-events:none}' +
            '.jf-folder-card--horizontal .jf-folder-card__img{width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover;opacity:0;transition:opacity .2s ease;border-radius:.8em !important}' +
            '.jf-folder-card--horizontal.card--loaded .jf-folder-card__img{opacity:1 !important}' +
            '.jf-folder-card--horizontal .jf-folder-card__badge{position:absolute;top:.5em;right:.5em;min-width:1.9em;height:1.9em;padding:0 .5em;border-radius:1em;background:#2f9bf0;color:#fff;font-size:.9em;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5);z-index:5}' +
            '.jf-folder-card--horizontal .card__title{margin-top:.5em;text-align:center}' +
            '.jf-folder-card--vertical{position:relative}' +
            '.jf-folder-card--vertical .card__view{padding-bottom:150%;position:relative;border-radius:.8em !important;overflow:visible !important;background-color:#3e3e3e}' +
            '.jf-folder-card--vertical .card__view::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;border-radius:.8em;overflow:hidden;pointer-events:none}' +
            '.jf-folder-card--vertical .jf-folder-card__img{width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover;opacity:0;transition:opacity .2s ease;border-radius:.8em !important}' +
            '.jf-folder-card--vertical.card--loaded .jf-folder-card__img{opacity:1 !important}' +
            '.jf-folder-card--vertical .jf-folder-card__badge{position:absolute;top:.5em;right:.5em;min-width:1.9em;height:1.9em;padding:0 .5em;border-radius:1em;background:#2f9bf0;color:#fff;font-size:.9em;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5);z-index:5}' +
            '.jf-folder-card--vertical .card__title{margin-top:.5em;text-align:center}' +
            '.jf-count-badge{position:absolute;top:.5em;right:.5em;min-width:1.9em;height:1.9em;padding:0 .5em;border-radius:1em;background:#2f9bf0;color:#fff;font-size:.9em;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5);z-index:5;pointer-events:none}';

        Lampa.Template.add('jellyfin_folders_css', '<style>' + css + '</style>');
        $('body').append(Lampa.Template.get('jellyfin_folders_css', {}, true));
    }

    function registerJellyfinComponents() {
        if (!Lampa || !Lampa.Component || !Lampa.Component.add) return;
        if (!Lampa.InteractionMain || !Lampa.InteractionCategory) return;
        if (Jellyfin._componentsRegistered) return;
        Jellyfin._componentsRegistered = true;

        Lampa.Component.add('jellyfin_main', function (object) {
            var comp = new Lampa.InteractionMain(object);
            comp.create = function () {
                var _this = this;
                this.activity.loader(true);
                Jellyfin.buildMainLines(function (lines) {
                    _this.build(lines);
                }, this.empty.bind(this));

                return this.render();
            };
            comp.onMore = function (data) {
                var url = data && (data.url || data.category);
                if (!url) return;
                if (String(url).indexOf('jellyfin://libraries') === 0) return;
                Lampa.Activity.push({
                    url: url,
                    title: data.title || '',
                    component: 'category_full',
                    page: 1
                });
            };
            return comp;
        });

        Lampa.Component.add('jellyfin_category_full', function (object) {
            var comp = new Lampa.InteractionCategory(object);
            comp.create = function () {
                var _this = this;
                try { this.activity.loader(true); } catch (e0) {}
                Lampa.Api.list(object, function (data) {
                    _this.build(data);
                }, this.empty.bind(this));

                return this.render();
            };
            comp.nextPageReuest = function (obj2, resolve, reject) {
                Lampa.Api.list(obj2, resolve.bind(comp), reject.bind(comp));
            };
            comp.cardRender = function (obj2, element, card) {
                if (element && element.jellyfin_boxset_id) {
                    card.onEnter = function () {
                        Lampa.Activity.push({
                            url: 'jellyfin://browse?parentId=' + encodeURIComponent(element.jellyfin_boxset_id) + '&kind=media&title=' + encodeURIComponent(element.title || ''),
                            title: element.title || '',
                            component: 'jellyfin_browse',
                            page: 1
                        });
                    };
                }
            };
            return comp;
        });

        Lampa.Component.add('jellyfin_browse', function (object) {
            var comp = new Lampa.InteractionCategory(object);
            comp.create = function () {
                var _this = this;
                try { this.activity.loader(true); } catch (e0) {}
                Jellyfin.fetchBrowseData(object, function (data) {
                    _this.build(data);
                }, this.empty.bind(this));

                return this.render();
            };
            comp.nextPageReuest = function (obj2, resolve, reject) {
                Jellyfin.fetchBrowseData(obj2, resolve.bind(comp), reject.bind(comp));
            };
            comp.cardRender = function (obj2, element, card) {
                if (element && element.jellyfin_boxset_id) {
                    card.onEnter = function () {
                        Lampa.Activity.push({
                            url: 'jellyfin://browse?parentId=' + encodeURIComponent(element.jellyfin_boxset_id) + '&kind=media&title=' + encodeURIComponent(element.title || ''),
                            title: element.title || '',
                            component: 'jellyfin_browse',
                            page: 1
                        });
                    };
                }
            };
            return comp;
        });

    }

    function init() {
        if (!window.Lampa) return setTimeout(init, 500);
        Lampa.SettingsApi.addComponent({ component: 'jellyfin_settings', name: 'Jellyfin', icon: getIcon() });
        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { name: 'jellyfin_auth_status', type: 'static' },
            field: { name: 'Статус авторизации', description: '' },
            onRender: function (item) {
                var server = '';
                var token = '';
                var uid = '';
                var type = '';

                try { server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, ''); } catch (e0) { server = ''; }
                try { token = String(sget('jellyfin_token', '') || ''); } catch (e1) { token = ''; }
                try { uid = String(sget('jellyfin_user_id', '') || ''); } catch (e2) { uid = ''; }
                try { type = String(sget('jellyfin_auth_type', '') || ''); } catch (e3) { type = ''; }

                var value = item.find('.settings-param__value');
                if (value.length) value.text(token ? 'Авторизован' : 'Не авторизован');

                var descr = item.find('.settings-param__descr');
                if (!descr.length) descr = $('<div class="settings-param__descr"></div>').appendTo(item);

                if (token) {
                    var parts = [];
                    if (server) parts.push('Сервер: ' + server);
                    if (uid) parts.push('UserId: ' + uid);
                    if (type) parts.push('Способ: ' + type);
                    descr.text(parts.join(' • ') || 'Токен сохранён');
                } else {
                    descr.text('Нет сохранённого токена. Войдите по логину/паролю или через "Быстрое подключение".');
                }
            }
        });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { name: 'jellyfin_server', type: 'input', values: '', 'default': JELLYFIN_SERVER }, field: { name: 'Адрес сервера', description: 'Например: https://myserver.example.com' } });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { name: 'jellyfin_user', type: 'input', values: '', 'default': JELLYFIN_USER }, field: { name: 'Логин', description: '' } });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { name: 'jellyfin_pass', type: 'input', values: '', 'default': JELLYFIN_PASS }, field: { name: 'Пароль', description: '' } });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { type: 'button', name: 'jellyfin_login' }, field: { name: 'Войти', description: 'Авторизоваться по логину и паролю' }, onChange: function () {
            var server = String(sget('jellyfin_server', JELLYFIN_SERVER) || '').replace(/\/$/, '');
            var user = String(sget('jellyfin_user', '') || '');
            var pass = String(sget('jellyfin_pass', '') || '');
            if (!server) { Lampa.Noty.show('Jellyfin: заполните адрес сервера'); return; }
            if (!user || !pass) { Lampa.Noty.show('Jellyfin: заполните логин и пароль'); return; }
            Jellyfin.clearAuth();
            Lampa.Noty.show('Jellyfin: авторизация...');
            Jellyfin.authenticate(function () {
                Lampa.Noty.show('Jellyfin: успешно авторизован');
                try { if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); } catch (e0) {}
                setTimeout(function () { Jellyfin.ensureTmdbIndex(true); }, 1500);
            });
        } });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { type: 'button', name: 'jellyfin_quick_connect' }, field: { name: 'Быстрое подключение', description: 'Войти по коду (Quick Connect) без логина/пароля' }, onChange: function () { Jellyfin.quickConnectUI(); } });
        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'button', name: 'jellyfin_rebuild_index' },
            field: { name: 'Библиотека Jellyfin', description: jfIndexStatusDescription() },
            onChange: jfRebuildIndexHandler,
            onRender: function (item) {
                jfIndexRowEl = item;
                var descr = item.find('.settings-param__descr');
                if (!descr.length) descr = $('<div class="settings-param__descr"></div>').appendTo(item);
                descr.text(jfIndexStatusDescription());
            }
        });
        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { type: 'button', name: 'jellyfin_logout' }, field: { name: 'Выйти', description: 'Удалить сохранённый токен Jellyfin' }, onChange: function () { Jellyfin.clearAuth(); try { Lampa.Noty.show('Jellyfin: токен очищен'); } catch (e0) {} } });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'title' },
            field: { name: 'Персонализация' }
        });

        Lampa.SettingsApi.addParam({ component: 'jellyfin_settings', param: { type: 'button', name: 'jellyfin_lines_config' }, field: { name: 'Ленты Jellyfin', description: 'Порядок и видимость лент в разделе Jellyfin' }, onChange: function () { Jellyfin.configureLinesUI(); } });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'trigger', name: 'jellyfin_head_icon', 'default': true },
            field: { name: 'Иконка в верхнем баре', description: 'Показывать иконку Jellyfin в верхней панели Lampa' },
            onChange: function () { jfSyncHeadIcon(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'trigger', name: 'jellyfin_poster_badge', 'default': true },
            field: { name: 'Значок на постере', description: 'Показывать значок Jellyfin на постерах, если фильм/сериал уже есть на сервере' }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: {
                name: 'jellyfin_badge_pos',
                type: 'select',
                values: { tl: 'Вверху слева', tr: 'Вверху справа', bl: 'Внизу слева', br: 'Внизу справа' },
                'default': 'tr'
            },
            field: { name: 'Угол значка (вертикальные карточки)', description: '' },
            onChange: function () { jfApplyBadgeCss(); jfRefreshBadgePosEditorVisuals('badge'); }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { name: 'jellyfin_badge_pos_editor', type: 'static' },
            field: { name: 'Позиция (вертикальные карточки)' },
            onRender: function (item) {
                jfInjectBadgePosEditorCss();
                jfRenderBadgePosEditor(item, 'badge');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'button', name: 'jellyfin_badge_reset' },
            field: { name: 'Сбросить позицию (вертикальные карточки)', description: '' },
            onChange: function () {
                try {
                    Lampa.Storage.set('jellyfin_badge_pos', 'tr');
                    Lampa.Storage.set('jellyfin_badge_off_x', '4p');
                    Lampa.Storage.set('jellyfin_badge_off_y', '4p');
                } catch (e0) {}
                jfApplyBadgeCss();
                jfRefreshBadgePosEditorVisuals('badge');
                try { if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); } catch (e1) {}
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: {
                name: 'jellyfin_badge_pos_wide',
                type: 'select',
                values: { tl: 'Вверху слева', tr: 'Вверху справа', bl: 'Внизу слева', br: 'Внизу справа' },
                'default': 'tr'
            },
            field: { name: 'Угол значка (горизонтальные карточки)', description: '' },
            onChange: function () { jfApplyBadgeCss(); jfRefreshBadgePosEditorVisuals('badge_wide'); }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { name: 'jellyfin_badge_pos_editor_wide', type: 'static' },
            field: { name: 'Позиция (горизонтальные карточки)' },
            onRender: function (item) {
                jfInjectBadgePosEditorCss();
                jfRenderBadgePosEditor(item, 'badge_wide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'button', name: 'jellyfin_badge_reset_wide' },
            field: { name: 'Сбросить позицию (горизонтальные карточки)', description: '' },
            onChange: function () {
                try {
                    Lampa.Storage.set('jellyfin_badge_pos_wide', 'tr');
                    Lampa.Storage.set('jellyfin_badge_off_x_wide', '4p');
                    Lampa.Storage.set('jellyfin_badge_off_y_wide', '4p');
                } catch (e0) {}
                jfApplyBadgeCss();
                jfRefreshBadgePosEditorVisuals('badge_wide');
                try { if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update(); } catch (e1) {}
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'trigger', name: 'jellyfin_new_items_noty', 'default': true },
            field: { name: 'Уведомлять о новинках', description: 'Нотификация о найденных новых фильмах/сериалах на сервере Jellyfin' }
        });

        Lampa.SettingsApi.addParam({
            component: 'jellyfin_settings',
            param: { type: 'button', name: 'jellyfin_icon_style_btn' },
            field: { name: 'Иконка', description: 'Выбрать стиль иконки Jellyfin' },
            onChange: function () {
                Lampa.Select.show({
                    title: 'Иконка Jellyfin',
                    items: [
                        {
                            title: '<div style="display:flex;align-items:center;line-height:1.2"><svg style="width:1.4em;height:1.4em;margin-right:.6em;flex-shrink:0;display:block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="jf_sel_g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#AA5CC3"/><stop offset="100%" stop-color="#00A4DC"/></linearGradient></defs><path fill="url(#jf_sel_g)" d="M12 .002C8.826.002-1.398 18.537.16 21.666c1.56 3.129 22.14 3.094 23.682 0C25.384 18.573 15.177 0 12 0zm7.76 18.949c-1.008 2.028-14.493 2.05-15.514 0C3.224 16.9 9.92 4.755 12.003 4.755c2.081 0 8.77 12.166 7.759 14.196zM12 9.198c-1.054 0-4.446 6.15-3.93 7.189.518 1.04 7.348 1.027 7.86 0 .511-1.027-2.874-7.19-3.93-7.19z"/></svg>Градиент</div>',
                            val: 'gradient'
                        },
                        {
                            title: '<div style="display:flex;align-items:center;line-height:1.2"><svg style="width:1.4em;height:1.4em;margin-right:.6em;flex-shrink:0;display:block" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M12 .002C8.826.002-1.398 18.537.16 21.666c1.56 3.129 22.14 3.094 23.682 0C25.384 18.573 15.177 0 12 0zm7.76 18.949c-1.008 2.028-14.493 2.05-15.514 0C3.224 16.9 9.92 4.755 12.003 4.755c2.081 0 8.77 12.166 7.759 14.196zM12 9.198c-1.054 0-4.446 6.15-3.93 7.189.518 1.04 7.348 1.027 7.86 0 .511-1.027-2.874-7.19-3.93-7.19z"/></svg>Белый</div>',
                            val: 'white'
                        }
                    ],
                    onSelect: function (item) {
                        Lampa.Storage.set('jellyfin_icon_style', item.val);
                        try { $('.menu__item[data-action="jellyfin"] .menu__ico').html(getIcon()); } catch(e0) {}
                        jfRefreshHeadIconStyle();
                        try { Lampa.Controller.toggle('settings'); } catch(e1) {}
                    },
                    onBack: function () {
                        try { Lampa.Controller.toggle('settings'); } catch(e0) {}
                    }
                });
            }
        });
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            if (!e.object || !e.object.activity) return;
            var movie = (e.data && e.data.movie) ? e.data.movie : (e.object.card || e.object.movie || e.object);
            if (!movie) return;
            var render = e.object.activity.render();
            if (!render || !render.find) return;
            addJellyfinButton(movie, render);
        });

        addJellyfinFoldersUi();
        registerJellyfinComponents();

        Jellyfin.patchApi();
        Jellyfin.registerSearch();
        Jellyfin.enhanceResumeCards();

        jfInjectHeadIcon();
        [300, 1000, 3000].forEach(function (delay) { setTimeout(jfInjectHeadIcon, delay); });
        try {
            Lampa.Listener.follow('activity', function (e) {
                if (!e || e.type !== 'start') return;
                jfInjectHeadIcon();
            });
        } catch (e0) {}
        try {
            Lampa.Listener.follow('app', function (e) {
                if (!e) return;
                if (e.type === 'ready' || e.type === 'start') jfInjectHeadIcon();
            });
        } catch (e1) {}

        jfInitPosterBadge();
        setTimeout(function () { Jellyfin.ensureTmdbIndex(); }, 4000);

        setInterval(function () { Jellyfin.ensureTmdbIndex(); }, 15 * 60 * 1000);

        Lampa.Listener.follow('menu', function (e) {
            try {
                if (!e || e.type !== 'start' || !e.body) return;
                var list = $('.menu__list:eq(0)', e.body);
                if (!list.length) return;
                if (list.find('[data-action="jellyfin"]').length) return;

                var item = $('<li class="menu__item selector" data-action="jellyfin"><div class="menu__ico"></div><div class="menu__text">Jellyfin</div></li>');
                item.find('.menu__ico').html(getIcon());
                item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        component: Jellyfin._componentsRegistered ? 'jellyfin_main' : 'category',
                        title: 'Jellyfin',
                        url: 'jellyfin://main',
                        page: 1,
                        source: 'tmdb'
                    });
                });
                list.append(item);
            } catch (e0) {}
        });
    }
    init();
})();
