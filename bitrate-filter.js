(function () {
    'use strict';
    var CONFIG = {
        selectors: {
            item: '.torrent-item',
            title: '.torrent-item__title',
            size: '.torrent-item__size',
            bitrate: '.torrent-item__bitrate span, .bitrate span',
            filterLine: '.torrent-filter'
        },
        debug: false,
        speedTestUrl: 'https://speed.cloudflare.com/__down',
        speedTestChunkBytes: 5000000,
        speedTestMaxTimeMs: 16000,
        speedTestWarmupMs: 600,
        speedTestWindowMs: 1600,
        speedTestRampStepMs: 350,
        speedTestTickMs: 200,
        speedTestStableSkipMs: 3200,
        speedTestConnections: 6,
        speedTestNdt7LocateUrl: 'https://locate.measurementlab.net/v2/nearest/ndt/ndt7',
        speedTestNdt7SubProtocol: 'net.measurementlab.ndt.v7',
        speedTestNdt7Connections: 3,
        speedTestNdt7DiscoveryTimeoutMs: 5000,
        storageSpeedKey: 'bitrate_filter_speed',
        storageSpeedTimeKey: 'bitrate_filter_speed_time',
        cacheTtlMs: 15 * 60 * 1000,
        marginOptions: [1, 0.9, 0.85, 0.7, 0.5],
        defaultMargin: 0.85,
        defaultEnabled: true,
        defaultMode: 'hide'
    };

    var ICON = '<svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3 30C3 17.0163 13.0163 7 26 7" stroke="white" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="18.5" cy="27" r="3" fill="white"/>' +
        '<line x1="18.5" y1="27" x2="26" y2="16" stroke="white" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';

    function nowMs() {
        if (window.performance && typeof performance.now === 'function') return performance.now();
        return Date.now();
    }

    function matchesEl(el, selector) {
        if (!el || el.nodeType !== 1) return false;
        var fn = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
        if (!fn) return false;
        return fn.call(el, selector);
    }

    function closestEl(el, selector) {
        var cur = el;
        while (cur && cur.nodeType === 1) {
            if (matchesEl(cur, selector)) return cur;
            cur = cur.parentElement;
        }
        return null;
    }

    function injectStyles() {
        if (document.getElementById('bitrate-filter-styles')) return;
        var style = document.createElement('style');
        style.id = 'bitrate-filter-styles';
        style.textContent =
            '.selectbox-item.has-ring{padding-right:6.5em}' +
            '.selectbox-item.has-ring::after{display:none !important;content:none !important}' +
            '.selectbox-item.has-ring .selectbox-item__checkbox{display:none !important}' +
            '.selectbox-item.has-ring .selectbox-item__checkbox::after{display:none !important;content:none !important}' +
            '.bf-modern-ring-wrap{position:absolute;top:50%;right:1.2em;transform:translateY(-50%);width:4.2em;height:4.2em;pointer-events:none}' +
            '.bf-modern-ring{width:100%;height:100%;overflow:visible}' +
            '.bf-modern-ring .bf-ring-progress{transition:stroke-dashoffset 0.4s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease}' +
            '.bf-modern-ring.testing .bf-ring-progress{stroke:url(#bfRingGradTesting); animation:bfRingPulse 1s ease-in-out infinite}' +
            '@keyframes bfRingPulse{0%,100%{opacity:1}50%{opacity:0.6}}';
        document.head.appendChild(style);
    }

    function buildModernRingSvg() {
        return '<div class="bf-modern-ring-wrap">' +
            '<svg viewBox="0 0 100 100" class="bf-modern-ring">' +
            '<defs>' +
            '<linearGradient id="bfRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="#00f2fe" />' +
            '<stop offset="100%" stop-color="#4facfe" />' +
            '</linearGradient>' +
            '<linearGradient id="bfRingGradTesting" x1="0%" y1="100%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="#f77062" />' +
            '<stop offset="100%" stop-color="#fe5196" />' +
            '</linearGradient>' +
            '<filter id="bfRingShadow" x="-25%" y="-25%" width="150%" height="150%">' +
            '<feOffset dx="0" dy="2" in="SourceAlpha" result="off"/>' +
            '<feGaussianBlur stdDeviation="2" in="off" result="blur"/>' +
            '<feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" result="shadow"/>' +
            '<feMerge>' +
            '<feMergeNode in="shadow"/>' +
            '<feMergeNode in="SourceGraphic"/>' +
            '</feMerge>' +
            '</filter>' +
            '</defs>' +
            '<g filter="url(#bfRingShadow)">' +
            '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" />' +
            '<circle class="bf-ring-progress" cx="50" cy="50" r="40" fill="none" stroke="url(#bfRingGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="251.2" stroke-dashoffset="251.2" transform="rotate(-90 50 50)" />' +
            '<text class="bf-ring-val" x="50" y="48" text-anchor="middle" fill="#fff" font-size="26" font-weight="700">--</text>' +
            '<text class="bf-ring-unit" x="50" y="68" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="14" font-weight="600">Мбит/с</text>' +
            '</g>' +
            '</svg>' +
            '</div>';
    }

    function updateModernRing(el, mbps, testing) {
        if (!el || !el.length) return;
        var svgEl = el.find('svg.bf-modern-ring');
        var valEl = el.find('.bf-ring-val');
        var progEl = el.find('.bf-ring-progress');

        svgEl.toggleClass('testing', !!testing);

        var MAX_SPEED = 100;
        var CIRC = 251.2;

        if (mbps === null && !testing) {
            valEl.text('--');
            progEl.css('stroke-dashoffset', CIRC);
        } else {
            valEl.text(mbps ? mbps.toFixed(0) : '...');
            var ratio = Math.min(Math.max((mbps || 0) / MAX_SPEED, 0.02), 1);
            if (!mbps && testing) ratio = 0.05;
            var offset = CIRC - (ratio * CIRC);
            progEl.css('stroke-dashoffset', offset);
        }
    }

    function log() {
        if (!CONFIG.debug) return;
        var args = ['[bitrate-filter]'].concat(Array.prototype.slice.call(arguments));
        console.log.apply(console, args);
    }

    var State = {
        enabled: CONFIG.defaultEnabled,
        margin: CONFIG.defaultMargin,
        mode: CONFIG.defaultMode,
        speedMbps: null
    };

    function loadState() {
        var enabled = Lampa.Storage.get('bitrate_filter_enabled', null);
        if (enabled !== null && typeof enabled !== 'undefined') State.enabled = (enabled === true || enabled === 'true');

        var margin = parseFloat(Lampa.Storage.get('bitrate_filter_margin', CONFIG.defaultMargin));
        if (margin) State.margin = margin;

        var mode = Lampa.Storage.get('bitrate_filter_mode', CONFIG.defaultMode);
        if (mode) State.mode = mode;
    }

    function getCachedSpeed() {
        var mbps = parseFloat(Lampa.Storage.get(CONFIG.storageSpeedKey, 0));
        var time = parseInt(Lampa.Storage.get(CONFIG.storageSpeedTimeKey, 0));

        if (mbps && (Date.now() - time < CONFIG.cacheTtlMs)) return mbps;
        return null;
    }

    function saveSpeed(mbps) {
        Lampa.Storage.set(CONFIG.storageSpeedKey, mbps);
        Lampa.Storage.set(CONFIG.storageSpeedTimeKey, Date.now());
        State.speedMbps = mbps;
    }

    function robustPeakMbps(arr) {
        if (!arr || !arr.length) return null;
        var sorted = arr.slice().sort(function (a, b) { return a - b; });
        var startIdx = Math.floor(sorted.length * 0.3);
        if (startIdx >= sorted.length) startIdx = sorted.length - 1;
        var slice = sorted.slice(startIdx);
        var sum = 0;
        for (var i = 0; i < slice.length; i++) sum += slice[i];
        return sum / slice.length;
    }

    function ndt7Discover(count, cb) {
        var done = false;
        var guardTimer = setTimeout(function () {
            if (done) return;
            done = true;
            log('ndt7: discovery timeout');
            cb([]);
        }, CONFIG.speedTestNdt7DiscoveryTimeoutMs);

        function finishDiscovery(urls) {
            if (done) return;
            done = true;
            clearTimeout(guardTimer);
            cb(urls);
        }

        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', CONFIG.speedTestNdt7LocateUrl, true);
            try { xhr.timeout = CONFIG.speedTestNdt7DiscoveryTimeoutMs; } catch (e) {}

            xhr.onload = function () {
                var urls = [];
                try {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var data = JSON.parse(xhr.responseText);
                        var results = (data && data.results) || [];
                        for (var i = 0; i < results.length && urls.length < count; i++) {
                            var u = results[i] && results[i].urls && results[i].urls['wss:///ndt/v7/download'];
                            if (u) urls.push(u);
                        }
                    }
                } catch (e) {
                    log('ndt7: ошибка парсинга discovery', e && e.message);
                }
                finishDiscovery(urls);
            };
            xhr.onerror = function () { finishDiscovery([]); };
            xhr.ontimeout = function () { finishDiscovery([]); };
            xhr.send(null);
        } catch (e) {
            finishDiscovery([]);
        }
    }

    function runSpeedTestNdt7(onDone, onProgress, onUnavailable) {
        if (typeof WebSocket === 'undefined') {
            log('ndt7: WebSocket недоступен, откат');
            onUnavailable();
            return;
        }

        var WARMUP_MS = CONFIG.speedTestWarmupMs;
        var WINDOW_MS = CONFIG.speedTestWindowMs;
        var STABLE_SKIP_MS = CONFIG.speedTestStableSkipMs;
        var TICK_MS = CONFIG.speedTestTickMs;
        var MAX_MS = CONFIG.speedTestMaxTimeMs;
        var CONN_COUNT = CONFIG.speedTestNdt7Connections;
        var SUBPROTOCOL = CONFIG.speedTestNdt7SubProtocol;

        var testStart = null;
        var stopRequested = false;
        var finished = false;
        var fellBack = false;
        var capTimer = null;
        var tickTimer = null;
        var totalBytes = 0;
        var samples = [];
        var readings = [];
        var emaMbps = null;
        var sockets = [];
        var closedCount = 0;
        var expectedCount = 0;

        function computeWindowedMbps(now) {
            if (samples.length < 2) return null;
            var windowStart = now - WINDOW_MS;
            var first = samples[0];
            for (var i = 0; i < samples.length; i++) {
                if (samples[i].t >= windowStart) { first = samples[i]; break; }
            }
            var last = samples[samples.length - 1];
            var dt = (last.t - first.t) / 1000;
            var db = last.bytes - first.bytes;
            if (dt <= 0 || db <= 0) return null;
            return (db * 8 / 1e6) / dt;
        }

        function recordProgress(deltaBytes) {
            if (deltaBytes <= 0) return;
            totalBytes += deltaBytes;
        }

        function tick() {
            var now = nowMs();
            samples.push({ t: now, bytes: totalBytes });
            var cutoff = now - (WINDOW_MS + 500);
            while (samples.length > 2 && samples[0].t < cutoff) samples.shift();

            if (now - testStart < WARMUP_MS) return;

            var mbps = computeWindowedMbps(now);
            if (!mbps) return;

            readings.push({ t: now, mbps: mbps });
            emaMbps = emaMbps === null ? mbps : (emaMbps * 0.8 + mbps * 0.2);
            if (onProgress) onProgress(emaMbps);
        }

        function closeAllSockets() {
            for (var i = 0; i < sockets.length; i++) {
                try { sockets[i].close(); } catch (e) {}
            }
        }

        function finish(reason) {
            if (finished) return;
            finished = true;
            stopRequested = true;
            if (capTimer) clearTimeout(capTimer);
            if (tickTimer) clearInterval(tickTimer);
            closeAllSockets();

            if (totalBytes <= 0 && !fellBack) {
                fellBack = true;
                log('ndt7: без данных, откат на XHR-тест', reason || '');
                onUnavailable();
                return;
            }

            var stableReadings = [];
            for (var i = 0; i < readings.length; i++) {
                if (readings[i].t - testStart >= STABLE_SKIP_MS) stableReadings.push(readings[i].mbps);
            }
            var pool = stableReadings.length >= 4 ? stableReadings : readings.map(function (r) { return r.mbps; });

            var result = robustPeakMbps(pool) || emaMbps || computeWindowedMbps(nowMs());

            log('ndt7: финиш', result, reason || '', readings.length, pool.length);
            if (result && result > 0) saveSpeed(result);
            if (onDone) onDone(result || null);
        }

        function openSocket(url) {
            var ws;
            try {
                ws = new WebSocket(url, SUBPROTOCOL);
            } catch (e) {
                onSocketClosed();
                return;
            }

            try { ws.binaryType = 'arraybuffer'; } catch (e) {}

            ws.onmessage = function (e) {
                if (stopRequested) return;
                if (typeof e.data === 'string') return; // JSON measurement message, свой tick() используем вместо него
                var len = (e.data && (e.data.byteLength || (e.data.size))) || 0;
                if (len) recordProgress(len);
            };
            ws.onerror = function () { onSocketClosed(); };
            ws.onclose = function () { onSocketClosed(); };

            sockets.push(ws);
        }

        function onSocketClosed() {
            closedCount++;
            if (closedCount >= expectedCount) finish('sockets closed');
        }

        ndt7Discover(CONN_COUNT, function (urls) {
            if (stopRequested) return;
            if (!urls.length) {
                log('ndt7: discovery не дал серверов, откат');
                onUnavailable();
                return;
            }

            expectedCount = urls.length;
            testStart = nowMs();
            capTimer = setTimeout(function () { finish('timeout cap'); }, MAX_MS);
            tickTimer = setInterval(tick, TICK_MS);

            for (var i = 0; i < urls.length; i++) openSocket(urls[i]);
        });
    }

    function runSpeedTest(onDone, onProgress) {
        runSpeedTestNdt7(onDone, onProgress, function () {
            runSpeedTestXhr(onDone, onProgress);
        });
    }

    function runSpeedTestXhr(onDone, onProgress) {
        var CONN_COUNT = CONFIG.speedTestConnections;
        var WARMUP_MS = CONFIG.speedTestWarmupMs;
        var WINDOW_MS = CONFIG.speedTestWindowMs;
        var STABLE_SKIP_MS = CONFIG.speedTestStableSkipMs;
        var RAMP_STEP_MS = CONFIG.speedTestRampStepMs;
        var TICK_MS = CONFIG.speedTestTickMs;
        var MAX_MS = CONFIG.speedTestMaxTimeMs;
        var MAX_SLOT_FAILS = 5;

        var testStart = nowMs();
        var stopRequested = false;
        var finished = false;
        var capTimer = null;
        var tickTimer = null;
        var totalBytes = 0;
        var samples = [];
        var readings = [];
        var emaMbps = null;
        var activeXhrs = {};
        var slotFailCount = {};
        var deadSlots = {};
        var deadSlotCount = 0;

        log('тест: старт', CONFIG.speedTestUrl, CONN_COUNT, CONFIG.speedTestChunkBytes);

        function computeWindowedMbps(now) {
            if (samples.length < 2) return null;
            var windowStart = now - WINDOW_MS;
            var first = samples[0];
            for (var i = 0; i < samples.length; i++) {
                if (samples[i].t >= windowStart) { first = samples[i]; break; }
            }
            var last = samples[samples.length - 1];
            var dt = (last.t - first.t) / 1000;
            var db = last.bytes - first.bytes;
            if (dt <= 0 || db <= 0) return null;
            return (db * 8 / 1e6) / dt;
        }

        function recordProgress(deltaBytes) {
            if (deltaBytes <= 0) return;
            totalBytes += deltaBytes;
        }

        function tick() {
            var now = nowMs();
            samples.push({ t: now, bytes: totalBytes });
            var cutoff = now - (WINDOW_MS + 500);
            while (samples.length > 2 && samples[0].t < cutoff) samples.shift();

            if (now - testStart < WARMUP_MS) return;

            var mbps = computeWindowedMbps(now);
            if (!mbps) return;

            readings.push({ t: now, mbps: mbps });
            emaMbps = emaMbps === null ? mbps : (emaMbps * 0.8 + mbps * 0.2);
            if (onProgress) onProgress(emaMbps);
        }

        function startSlot(slot) {
            if (stopRequested || deadSlots[slot]) return;

            var url = CONFIG.speedTestUrl + '?bytes=' + CONFIG.speedTestChunkBytes +
                '&cachebust=' + Date.now() + '-' + slot + '-' + Math.random().toString(36).slice(2);
            var xhr = new XMLHttpRequest();
            var prevLoaded = 0;

            xhr.open('GET', url, true);
            try { xhr.responseType = 'arraybuffer'; } catch (e) {}

            xhr.onprogress = function (e) {
                var loaded = typeof e.loaded === 'number' ? e.loaded : prevLoaded;
                if (loaded > prevLoaded) {
                    recordProgress(loaded - prevLoaded);
                    prevLoaded = loaded;
                }
            };

            xhr.onload = function () {
                if (xhr.response && xhr.response.byteLength && xhr.response.byteLength > prevLoaded) {
                    recordProgress(xhr.response.byteLength - prevLoaded);
                    prevLoaded = xhr.response.byteLength;
                }
                delete activeXhrs[slot];
                slotFailCount[slot] = 0;
                if (!stopRequested) startSlot(slot);
            };
            xhr.onerror = function () {
                delete activeXhrs[slot];
                handleSlotFailure(slot);
            };
            xhr.onabort = function () {
                delete activeXhrs[slot];
            };

            activeXhrs[slot] = xhr;

            try {
                xhr.send(null);
            } catch (e) {
                delete activeXhrs[slot];
                handleSlotFailure(slot);
            }
        }

        function handleSlotFailure(slot) {
            if (stopRequested) return;
            slotFailCount[slot] = (slotFailCount[slot] || 0) + 1;

            if (slotFailCount[slot] >= MAX_SLOT_FAILS) {
                if (!deadSlots[slot]) {
                    deadSlots[slot] = true;
                    deadSlotCount++;
                }
                if (deadSlotCount >= CONN_COUNT) finish('all slots failed');
                return;
            }

            setTimeout(function () { startSlot(slot); }, 250);
        }

        function finish(reason) {
            if (finished) return;
            finished = true;
            stopRequested = true;
            if (capTimer) clearTimeout(capTimer);
            if (tickTimer) clearInterval(tickTimer);

            for (var slot in activeXhrs) {
                try { activeXhrs[slot].abort(); } catch (e) {}
            }

            var stableReadings = [];
            for (var i = 0; i < readings.length; i++) {
                if (readings[i].t - testStart >= STABLE_SKIP_MS) stableReadings.push(readings[i].mbps);
            }
            var pool = stableReadings.length >= 4 ? stableReadings : readings.map(function (r) { return r.mbps; });

            var result = robustPeakMbps(pool) || emaMbps || computeWindowedMbps(nowMs());

            log('тест: финиш', result, reason || '', readings.length, pool.length);
            if (result && result > 0) saveSpeed(result);
            if (onDone) onDone(result || null);
        }

        capTimer = setTimeout(function () {
            finish('timeout cap');
        }, MAX_MS);

        tickTimer = setInterval(tick, TICK_MS);

        for (var c = 0; c < CONN_COUNT; c++) {
            (function (slot) {
                setTimeout(function () {
                    if (!stopRequested) startSlot(slot);
                }, slot * RAMP_STEP_MS);
            })(c);
        }
    }

    function parseSizeBytes(text) {
        if (!text) return null;
        var m = text.match(/([\d]+[.,]?\d*)\s*(TB|ТБ|GB|ГБ|MB|МБ)/i);
        if (!m) return null;
        var value = parseFloat(m[1].replace(',', '.'));
        var unit = m[2].toUpperCase();
        var mult = unit === 'TB' || unit === 'ТБ' ? 1e12 : (unit === 'GB' || unit === 'ГБ' ? 1e9 : 1e6);
        return value * mult;
    }

    function parseDurationText(fullText) {
        if (!fullText) return null;
        var m = fullText.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (m) return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10);

        m = fullText.match(/(\d{1,3})\s*(?:мин\.?|min\.?)\b/i);
        if (m) return parseInt(m[1], 10) * 60;

        return null;
    }

    function parseEpisodeCount(title) {
        if (!title) return null;
        var t = title.toLowerCase();

        var m = t.match(/s\d{1,3}e(\d{1,3})[-–](?:e)?(\d{1,3})/i);
        if (m) return Math.abs(parseInt(m[2], 10) - parseInt(m[1], 10)) + 1;

        m = t.match(/(\d{1,3})[-–](\d{1,3})\s*(?:серия|серии|series|episodes?|эпизод)/i) ||
            t.match(/(?:серия|серии|episodes?|эпизод)\s*:?\s*(\d{1,3})[-–](\d{1,3})/i);
        if (m) return Math.abs(parseInt(m[2], 10) - parseInt(m[1], 10)) + 1;

        m = t.match(/(\d{1,3})[-–](\d{1,3})\s*из/i);
        if (m) return Math.abs(parseInt(m[2], 10) - parseInt(m[1], 10)) + 1;

        m = t.match(/\((\d{1,3})\s*(?:серий|серии|episodes?)\)/i) || t.match(/(\d{1,3})\s*(?:серий|серии)\b/i);
        if (m) return parseInt(m[1], 10);

        m = t.match(/s\d{1,3}e\d{1,3}\b/i);
        if (m) return 1;

        m = t.match(/\b\d{1,3}x\d{1,3}\b(?![-–]\d)/i);
        if (m) return 1;

        m = t.match(/\d{1,3}\s*(?:серия|episode|эпизод)\b/i) || t.match(/(?:серия|episode|эпизод)\s*\d{1,3}\b/i);
        if (m) return 1;

        m = t.match(/s(\d{1,3})[-–](\d{1,3})\b/i) ||
            t.match(/(?:сезон[а-я]*|seasons?)\s*:?\s*(\d{1,3})[-–](\d{1,3})\b/i);
        if (m) {
            var rangeStart = parseInt(m[1], 10);
            var rangeEnd = parseInt(m[2], 10);
            if (rangeEnd < rangeStart) { var tmpR = rangeStart; rangeStart = rangeEnd; rangeEnd = tmpR; }

            var activityR = Lampa.Activity.active();
            var cardR = activityR && activityR.movie;

            if (cardR && cardR.seasons && cardR.seasons.length) {
                var totalEp = 0, foundAny = false;
                for (var ri = 0; ri < cardR.seasons.length; ri++) {
                    var sR = cardR.seasons[ri];
                    if (sR && sR.season_number >= rangeStart && sR.season_number <= rangeEnd && sR.episode_count) {
                        totalEp += sR.episode_count;
                        foundAny = true;
                    }
                }
                if (foundAny && totalEp > 0) return totalEp;
            }

            if (cardR && cardR.number_of_episodes && rangeStart <= 1 && cardR.number_of_seasons && rangeEnd >= cardR.number_of_seasons) {
                return cardR.number_of_episodes;
            }
        }

        m = t.match(/s(\d{1,3})\b/i) || t.match(/(?:сезон|season)\s*:?\s*(\d{1,3})\b/i) || t.match(/(\d{1,3})\s*(?:сезон|season)\b/i);
        if (m) {
            var seasonNum = parseInt(m[1], 10);
            var activity = Lampa.Activity.active();
            var card = activity && activity.movie;
            if (card && card.seasons) {
                for (var i = 0; i < card.seasons.length; i++) {
                    var season = card.seasons[i];
                    if (season && season.season_number === seasonNum) {
                        if (season.episode_count) return season.episode_count;
                        break;
                    }
                }
            }
        }

        return null;
    }

    function parseSeasonNumber(title) {
        if (!title) return null;
        var t = String(title).toLowerCase();
        var m = t.match(/s(\d{1,3})\b/i) ||
            t.match(/(?:сезон[а-я]*|season)\s*:?\s*(\d{1,3})\b/i) ||
            t.match(/(\d{1,3})\s*(?:сезон|season)\b/i) ||
            t.match(/(\d{1,2})x\d{1,3}[-–]\d{1,3}/i);
        if (!m) return null;
        return parseInt(m[1], 10);
    }

    var SERIES_RUNTIME_CACHE_TTL_OK_MS = 7 * 24 * 60 * 60 * 1000;
    var SERIES_RUNTIME_CACHE_TTL_FAIL_MS = 10 * 60 * 1000;
    var seriesRuntimePending = {};

    function runtimeCacheStorageKey(tvId, seasonNum) {
        return 'bitrate_filter_tv_ep_runtime_' + String(tvId) + '_' + String(seasonNum);
    }

    function readRuntimeCacheEntry(tvId, seasonNum) {
        try {
            var raw = Lampa.Storage.get(runtimeCacheStorageKey(tvId, seasonNum), null);
            if (!raw) return null;

            if (typeof raw === 'string') {
                try { raw = JSON.parse(raw); } catch (e) { return null; }
            }

            if (typeof raw === 'number') {
                return { m: raw, t: Date.now() };
            }

            if (raw && typeof raw === 'object') return raw;
        } catch (e) {}
        return null;
    }

    function writeRuntimeCacheEntry(tvId, seasonNum, entry) {
        try { Lampa.Storage.set(runtimeCacheStorageKey(tvId, seasonNum), entry); }
        catch (e) {
            try { Lampa.Storage.set(runtimeCacheStorageKey(tvId, seasonNum), JSON.stringify(entry)); } catch (e2) {}
        }
    }

    function getCachedSeasonRuntimeMin(tvId, seasonNum) {
        var entry = readRuntimeCacheEntry(tvId, seasonNum);
        if (!entry) return null;

        if (!entry.t) return null;

        if (entry.f) {
            if ((Date.now() - entry.t) > SERIES_RUNTIME_CACHE_TTL_FAIL_MS) return null;
            return -1;
        }

        if (typeof entry.m === 'number' && entry.m > 0) {
            if ((Date.now() - entry.t) > SERIES_RUNTIME_CACHE_TTL_OK_MS) return null;
            return entry.m;
        }

        return null;
    }

    function requestSeasonRuntimeMin(tvId, seasonNum, onDone) {
        var key = String(tvId) + ':' + String(seasonNum);
        if (seriesRuntimePending[key]) {
            seriesRuntimePending[key].push(onDone);
            return;
        }

        seriesRuntimePending[key] = [onDone];

        function finish(min, ok) {
            if (ok && min && min > 0) writeRuntimeCacheEntry(tvId, seasonNum, { m: min, t: Date.now() });
            else writeRuntimeCacheEntry(tvId, seasonNum, { f: 1, t: Date.now() });

            var list = seriesRuntimePending[key] || [];
            delete seriesRuntimePending[key];

            for (var i = 0; i < list.length; i++) {
                try { if (list[i]) list[i](ok ? min : null); } catch (e) {}
            }

            reprocessAll();
        }

        try {
            if (window.Lampa && Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && typeof Lampa.Api.sources.tmdb.get === 'function') {
                Lampa.Api.sources.tmdb.get('tv/' + String(tvId) + '/season/' + String(seasonNum), {}, function (data) {
                    try {
                        var episodes = data && data.episodes;
                        if (!episodes || !episodes.length) { finish(null, false); return; }

                        var sum = 0;
                        var cnt = 0;
                        for (var i = 0; i < episodes.length; i++) {
                            var rt = episodes[i] && episodes[i].runtime;
                            if (typeof rt === 'number' && rt > 0) { sum += rt; cnt++; }
                        }

                        if (!cnt) { finish(null, false); return; }
                        finish(sum / cnt, true);
                    } catch (e) {
                        finish(null, false);
                    }
                }, function () {
                    finish(null, false);
                }, false);
            }
            else {
                if (!(window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.api === 'function' && typeof Lampa.TMDB.key === 'function')) {
                    finish(null, false);
                    return;
                }

                var url = Lampa.TMDB.api('tv/' + String(tvId) + '/season/' + String(seasonNum) + '?api_key=' + encodeURIComponent(Lampa.TMDB.key()));
                var lang = null;
                try {
                    if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.field === 'function') lang = Lampa.Storage.field('tmdb_lang');
                } catch (e) {}
                if (lang) url += '&language=' + encodeURIComponent(lang);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;
                    if (xhr.status < 200 || xhr.status >= 300) { finish(null, false); return; }
                    try {
                        var json = JSON.parse(xhr.responseText || '{}');
                        var episodes = json && json.episodes;
                        if (!episodes || !episodes.length) { finish(null, false); return; }
                        var sum = 0;
                        var cnt = 0;
                        for (var i = 0; i < episodes.length; i++) {
                            var rt = episodes[i] && episodes[i].runtime;
                            if (typeof rt === 'number' && rt > 0) { sum += rt; cnt++; }
                        }
                        if (!cnt) { finish(null, false); return; }
                        finish(sum / cnt, true);
                    } catch (e) {
                        finish(null, false);
                    }
                };
                xhr.onerror = function () { finish(null, false); };
                xhr.send(null);
            }
        } catch (e) {
            finish(null, false);
        }
    }

    function getCardDuration() {
        var activity = Lampa.Activity.active();
        var card = activity && activity.movie;
        if (!card) return null;

        var isSeries = card.type === 'tv' || typeof card.number_of_seasons !== 'undefined' || typeof card.episode_run_time !== 'undefined';

        if (!isSeries && card.runtime) {
            return { seconds: card.runtime * 60, isSeries: false };
        }

        var epMinutes = null;
        if (card.episode_run_time && card.episode_run_time.length) {
            epMinutes = card.episode_run_time.reduce(function (a, b) { return a + b; }, 0) / card.episode_run_time.length;
        } else if (card.runtime) {
            epMinutes = card.runtime;
        }
        return { isSeries: true, episodeRuntimeSec: epMinutes ? epMinutes * 60 : null, tvId: card.id };
    }

    function getBitrateFromText(fullText) {
        var m = fullText.match(/битрейт\s*:?\s*([\d]+[.,]?\d*)\s*мбит/i) || fullText.match(/bitrate\s*:?\s*([\d]+[.,]?\d*)\s*mb/i);
        if (m) return parseFloat(m[1].replace(',', '.'));
        return null;
    }

    function getSizeFromText(fullText) {
        return parseSizeBytes(fullText);
    }

    function estimateBitrate(el) {
        var fullText = el.textContent || '';

        var nativeBitrateEl = null;
        var bitrateCandidates = el.querySelectorAll(CONFIG.selectors.bitrate);
        for (var bi = 0; bi < bitrateCandidates.length; bi++) {
            if (!closestEl(bitrateCandidates[bi], '[data-bf="1"]')) { nativeBitrateEl = bitrateCandidates[bi]; break; }
        }
        var nativeMbps = nativeBitrateEl ? parseFloat(nativeBitrateEl.textContent.replace(',', '.')) : null;
        if (!nativeMbps) nativeMbps = getBitrateFromText(fullText);

        if (nativeMbps) return { known: true, bitrateMbps: nativeMbps, source: 'native' };

        var titleEl = el.querySelector(CONFIG.selectors.title);
        var sizeEl = el.querySelector(CONFIG.selectors.size);
        var title = titleEl ? titleEl.textContent : fullText;
        var sizeBytes = sizeEl ? parseSizeBytes(sizeEl.textContent) : null;
        if (!sizeBytes) sizeBytes = getSizeFromText(fullText);

        if (!sizeBytes) return { known: false };

        var duration = getCardDuration();

        if (!duration) return { known: false };

        if (!duration.isSeries) {
            var explicitDurationSec = parseDurationText(fullText);
            if (explicitDurationSec && explicitDurationSec > 300) {
                return { known: true, bitrateMbps: (sizeBytes * 8 / 1e6) / explicitDurationSec, source: 'calc_explicit_duration' };
            }
            return { known: true, bitrateMbps: (sizeBytes * 8 / 1e6) / duration.seconds, source: 'calc_movie' };
        }

        var epCount = parseEpisodeCount(title);
        if (!epCount) return { known: false };

        var perEpBytes = sizeBytes / epCount;
        var perEpDurationSec = parseDurationText(fullText);
        if (perEpDurationSec && perEpDurationSec >= 300 && perEpDurationSec <= 10800) {
            return { known: true, bitrateMbps: (perEpBytes * 8 / 1e6) / perEpDurationSec, source: 'calc_series_text_duration' };
        }

        if (duration.episodeRuntimeSec) {
            return { known: true, bitrateMbps: (perEpBytes * 8 / 1e6) / duration.episodeRuntimeSec, source: 'calc_series_tmdb_card' };
        }

        var seasonNum = parseSeasonNumber(title);
        if (seasonNum && duration.tvId) {
            var cachedMin = getCachedSeasonRuntimeMin(duration.tvId, seasonNum);
            if (cachedMin === null) {
                requestSeasonRuntimeMin(duration.tvId, seasonNum);
                return { known: false, pending: true, source: 'calc_series_tmdb_season_pending' };
            }
            if (cachedMin === -1) {
                return { known: false, source: 'calc_series_tmdb_season_failed' };
            }
            if (cachedMin > 0) {
                return { known: true, bitrateMbps: (perEpBytes * 8 / 1e6) / (cachedMin * 60), source: 'calc_series_tmdb_season' };
            }
        }

        return { known: false, source: 'calc_series_no_runtime' };
    }

    function resetItem(el) {
        el.style.display = '';
        el.style.opacity = '';
        el.removeAttribute('title');
    }

    function translate(key, fallback) {
        try {
            if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === 'function') return Lampa.Lang.translate(key);
        } catch (e) {}
        return fallback;
    }

    function removeInjectedBitrate(el) {
        var details = el.querySelector('.torrent-item__details');
        if (!details) return;
        var box = details.querySelector('.torrent-item__bitrate.bitrate[data-bf="1"]');
        if (box && box.parentNode) box.parentNode.removeChild(box);
    }

    function clearInjectedBitrates(root) {
        var base = root || document;
        var nodes = base.querySelectorAll('.torrent-item__bitrate.bitrate[data-bf="1"]');
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n && n.parentNode) n.parentNode.removeChild(n);
        }
    }

    function ensureInjectedBitrateSpan(el) {
        var details = el.querySelector('.torrent-item__details');
        if (!details) return null;

        var box = details.querySelector('.torrent-item__bitrate.bitrate');
        if (!box) {
            box = document.createElement('div');
            box.className = 'torrent-item__bitrate bitrate';
            box.setAttribute('data-bf', '1');
            box.innerHTML = translate('torrent_item_bitrate', 'Битрейт') + ': <span></span>';

            var seeds = details.querySelector('.torrent-item__seeds');
            var grabs = details.querySelector('.torrent-item__grabs');
            var size = details.querySelector('.torrent-item__size');

            if (seeds) details.insertBefore(box, seeds);
            else if (grabs) details.insertBefore(box, grabs);
            else if (size) details.insertBefore(box, size);
            else details.appendChild(box);
        }

        var span = box.querySelector('span');
        if (!span) return null;
        return span;
    }

    function renderInjectedBitrate(el, mbps) {
        var span = ensureInjectedBitrateSpan(el);
        if (!span) return;
        span.textContent = mbps.toFixed(2) + ' ' + translate('torrent_item_mb', 'Мбит/с');
    }

    function processItem(el) {
        var result = estimateBitrate(el);

        if (result.pending) {
            var span = ensureInjectedBitrateSpan(el);
            if (span) span.textContent = '...';
            resetItem(el);
            return;
        }

        if (result.known) {
            if (result.source !== 'native') renderInjectedBitrate(el, result.bitrateMbps);
        } else {
            removeInjectedBitrate(el);
        }

        if (!State.enabled || !State.speedMbps) {
            log('пропуск: enabled=', State.enabled, 'speed=', State.speedMbps);
            resetItem(el);
            return;
        }

        if (!result.known) {
            log('битрейт неизвестен для:', (el.querySelector(CONFIG.selectors.title) || el).textContent.slice(0, 60));
            resetItem(el);
            return;
        }

        var threshold = State.speedMbps * State.margin;

        log('битрейт', result.bitrateMbps.toFixed(1), 'Мбит/с (' + result.source + '), порог', threshold.toFixed(1));

        if (result.bitrateMbps > threshold) {
            if (State.mode === 'hide') {
                el.style.display = 'none';
            } else {
                el.style.display = '';
                el.style.opacity = '0.35';
                el.title = 'Битрейт ~' + result.bitrateMbps.toFixed(1) + ' Мбит/с — выше вашей скорости';
            }
        } else {
            resetItem(el);
        }
    }

    var selfMutating = false;
    var selfMutatingResetTimer = null;

    function withSelfMutation(fn) {
        selfMutating = true;
        if (selfMutatingResetTimer) clearTimeout(selfMutatingResetTimer);
        try {
            fn();
        } finally {
            selfMutatingResetTimer = setTimeout(function () { selfMutating = false; }, 50);
        }
    }

    function reprocessAll(root) {
        withSelfMutation(function () {
            var items = (root || document).querySelectorAll(CONFIG.selectors.item);
            for (var i = 0; i < items.length; i++) processItem(items[i]);
        });
    }

    var currentObserver = null;

    function findListRoot() {
        var line = document.querySelector(CONFIG.selectors.filterLine);
        var body = line ? closestEl(line, '.activity__body') : null;
        return body || document.querySelector('.activity__body') || document.body;
    }

    function attachObserver() {
        var root = findListRoot();
        if (!root) { log('не нашёл корень списка вообще'); return; }

        log('корень списка:', root.className || root.tagName);

        if (currentObserver) currentObserver.disconnect();

        clearInjectedBitrates(root);
        reprocessAll(root);

        var reprocessTimer = null;
        function scheduleReprocess() {
            if (reprocessTimer) return;
            reprocessTimer = setTimeout(function () {
                reprocessTimer = null;
                reprocessAll(root);
            }, 80);
        }

        currentObserver = new MutationObserver(function (mutations) {
            if (selfMutating) return;

            var sawGenuineNewItem = false;

            mutations.forEach(function (mut) {
                if (mut.type !== 'childList') return;
                if (!mut.addedNodes || !mut.addedNodes.length) return;

                for (var i = 0; i < mut.addedNodes.length; i++) {
                    var node = mut.addedNodes[i];
                    if (node.nodeType !== 1) continue;
                    if (node.hasAttribute && node.hasAttribute('data-bf')) continue;

                    if (matchesEl(node, CONFIG.selectors.item)) {
                        processItem(node);
                        sawGenuineNewItem = true;
                    } else if (node.querySelectorAll) {
                        var found = node.querySelectorAll(CONFIG.selectors.item);
                        for (var j = 0; j < found.length; j++) processItem(found[j]);
                        if (found.length) sawGenuineNewItem = true;
                    }
                }
            });

            if (sawGenuineNewItem) scheduleReprocess();
        });

        currentObserver.observe(root, { childList: true, subtree: true });
    }

    function speedLabel() {
        return State.speedMbps ? State.speedMbps.toFixed(1) + ' Мбит/с' : 'не измерено';
    }

    function marginLabel(m) { return Math.round(m * 100) + '%'; }
    function modeLabel(m) { return m === 'hide' ? 'Скрывать' : 'Затемнять'; }

    function buildSpeedButton() {
        var btn = $('<div class="simple-button simple-button--filter selector filter--speed">' +
            '<span>Скорость</span>' +
            '<div>' + speedLabel() + '</div>' +
            '</div>');

        btn.on('hover:enter', function () { openSpeedMenu(btn); });

        return btn;
    }

    function setButtonTesting(btn, testing, mbps) {
        if (!btn || !btn.length) return;
        btn.find('div').text(testing ? (mbps ? mbps.toFixed(1) + ' Мбит/с…' : 'измеряю…') : speedLabel());
    }

    function setMenuItemProgress(mbps, done) {
        var item = Lampa.Select.render().find('.selectbox-item').eq(0);
        var sub = item.find('.selectbox-item__subtitle');
        if (sub.length) sub.text(done ? 'Готово: ' + speedLabel() : (mbps ? mbps.toFixed(1) + ' Мбит/с…' : 'измеряю…'));

        updateModernRing(item.find('.bf-modern-ring-wrap'), mbps || (done ? State.speedMbps : null), !done);
    }

    function openSpeedMenu(btn) {
        var items = [
            { title: 'Обновить скорость интернета', subtitle: 'нажмите, чтобы запустить', action: 'refresh' },
            { title: 'Фильтр по битрейту', subtitle: State.enabled ? 'Включен' : 'Выключен', action: 'toggle' },
            { title: 'Режим', subtitle: modeLabel(State.mode), action: 'mode' },
            { title: 'Запас по скорости', subtitle: marginLabel(State.margin), action: 'margin' }
        ];

        Lampa.Select.show({
            title: 'Скорость интернета: ' + speedLabel(),
            items: items,
            nohide: true,
            onBack: function () { Lampa.Controller.toggle('content'); },
            onSelect: function (a) {
                if (a.action === 'refresh') {
                    var firstItem = Lampa.Select.render().find('.selectbox-item').eq(0);
                    firstItem.addClass('nomark');

                    setButtonTesting(btn, true);
                    setMenuItemProgress(null, false);

                    runSpeedTest(
                        function (mbps) {
                            setButtonTesting(btn, false, mbps || State.speedMbps);
                            setMenuItemProgress(mbps, true);
                            reprocessAll();
                            setTimeout(function () { openSpeedMenu(btn); }, 700);
                        },
                        function (mbpsLive) {
                            setButtonTesting(btn, true, mbpsLive);
                            setMenuItemProgress(mbpsLive, false);
                        }
                    );
                }
                else if (a.action === 'toggle') {
                    State.enabled = !State.enabled;
                    Lampa.Storage.set('bitrate_filter_enabled', State.enabled);
                    reprocessAll();
                    openSpeedMenu(btn);
                }
                else if (a.action === 'mode') openModeMenu(btn);
                else if (a.action === 'margin') openMarginMenu(btn);
            }
        });

        var firstItem = Lampa.Select.render().find('.selectbox-item').eq(0);
        if (firstItem.length && !firstItem.find('.bf-modern-ring-wrap').length) {
            firstItem.addClass('has-ring nomark').append(buildModernRingSvg());
            updateModernRing(firstItem.find('.bf-modern-ring-wrap'), State.speedMbps, false);
        }
    }

    function openModeMenu(btn) {
        var items = ['hide', 'grey'].map(function (m) {
            return { title: modeLabel(m), value: m, checked: m === State.mode };
        });

        Lampa.Select.show({
            title: 'Режим фильтра',
            items: items,
            onBack: function () { openSpeedMenu(btn); },
            onSelect: function (a) {
                State.mode = a.value;
                Lampa.Storage.set('bitrate_filter_mode', a.value);
                reprocessAll();
                openSpeedMenu(btn);
            }
        });
    }

    function openMarginMenu(btn) {
        var items = CONFIG.marginOptions.map(function (m) {
            return { title: marginLabel(m), value: m, checked: m === State.margin };
        });

        Lampa.Select.show({
            title: 'Запас по скорости',
            items: items,
            onBack: function () { openSpeedMenu(btn); },
            onSelect: function (a) {
                State.margin = a.value;
                Lampa.Storage.set('bitrate_filter_margin', a.value);
                reprocessAll();
                openSpeedMenu(btn);
            }
        });
    }

    function injectButton() {
        var line = document.querySelector(CONFIG.selectors.filterLine);
        if (!line || line.querySelector('.filter--speed')) return;

        var btn = buildSpeedButton();
        line.appendChild(btn[0]);

        forceRevealButton(line, btn[0]);
    }
	
    function forceRevealButton(line, btnEl) {
        var scrollEl = closestEl(line, '.scroll');
        var scrollInstance = scrollEl && scrollEl.Scroll;

        log('scrollEl найден:', !!scrollEl, 'Scroll-инстанс найден:', !!scrollInstance);

        btnEl.style.marginRight = '1em';

        function isTvScrollMode() {
            return !!(window.Lampa && Lampa.Platform && typeof Lampa.Platform.screen === 'function' && Lampa.Platform.screen('tv'));
        }

        function apply() {
            if (!scrollEl) return;

            if (isTvScrollMode() && scrollInstance) {
                if (typeof scrollInstance.shift === 'function') scrollInstance.shift(100000);
                if (typeof scrollInstance.update === 'function') scrollInstance.update(btnEl);
            }
            else {
                scrollEl.style.overflowX = 'auto';
                scrollEl.style.webkitOverflowScrolling = 'touch';

                var overflowPx = scrollEl.scrollWidth - scrollEl.clientWidth;
                log('overflowPx:', overflowPx, 'scrollWidth:', scrollEl.scrollWidth, 'clientWidth:', scrollEl.clientWidth);

                if (overflowPx > 0) scrollEl.scrollLeft = scrollEl.scrollWidth;
            }
        }

        apply();
        setTimeout(apply, 200);
        setTimeout(apply, 600);

        if (!forceRevealButton._rotationBound) {
            forceRevealButton._rotationBound = true;

            var reapply = function () {
                var freshLine = document.querySelector(CONFIG.selectors.filterLine);
                var freshBtn = freshLine && freshLine.querySelector('.filter--speed');
                if (freshLine && freshBtn) forceRevealButton(freshLine, freshBtn);
            };

            window.addEventListener('orientationchange', function () { setTimeout(reapply, 300); });
            window.addEventListener('resize', function () { setTimeout(reapply, 300); });
        }
    }

    function registerSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'bitrate_filter',
            icon: ICON,
            name: 'Фильтр битрейта'
        });

        Lampa.SettingsApi.addParam({
            component: 'bitrate_filter',
            param: { name: 'bitrate_filter_enabled', type: 'trigger', default: CONFIG.defaultEnabled },
            field: { name: 'Включить фильтр', description: 'Скрывать/затемнять раздачи, битрейт которых выше скорости интернета' },
            onChange: function (value) { State.enabled = value === true || value === 'true'; }
        });

        Lampa.SettingsApi.addParam({
            component: 'bitrate_filter',
            param: { name: 'bitrate_filter_mode', type: 'select', default: CONFIG.defaultMode, values: { hide: 'Скрывать', grey: 'Затемнять' } },
            field: { name: 'Режим', description: 'Что делать с раздачами не по скорости' },
            onChange: function (value) { State.mode = value; }
        });

        var marginValues = {};
        CONFIG.marginOptions.forEach(function (m) { marginValues[String(m)] = marginLabel(m); });

        Lampa.SettingsApi.addParam({
            component: 'bitrate_filter',
            param: { name: 'bitrate_filter_margin', type: 'select', default: String(CONFIG.defaultMargin), values: marginValues },
            field: { name: 'Запас по скорости', description: 'Порог = скорость × запас' },
            onChange: function (value) { State.margin = parseFloat(value); }
        });

        Lampa.SettingsApi.addParam({
            component: 'bitrate_filter',
            param: { name: 'bitrate_filter_speed_info', type: 'static' },
            field: { name: 'Текущая скорость', description: speedLabel() + ' — обновляется через кнопку "Скорость" на странице торрентов' },
            onRender: function (item) { item.find('.settings-param__descr').text(speedLabel()); }
        });
    }

    function init() {
        loadState();
        injectStyles();
        registerSettings();

        State.speedMbps = getCachedSpeed();
        if (!State.speedMbps) runSpeedTest(function () { reprocessAll(); });

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.object && e.object.component === 'torrents') {
                setTimeout(function () {
                    injectButton();
                    attachObserver();
                }, 300);
            }
        });
    }

    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
