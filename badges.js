(function () {
    'use strict';

    function startPlugin() {
        if (window.ctb_plugin_loaded_v1) return;

        if (!window.Lampa || !Lampa.Component || !Lampa.Storage) {
            setTimeout(startPlugin, 10);
            return;
        }

        window.ctb_plugin_loaded_v1 = true;
        console.log('[ContentTypeBadges] v1.0 - плашки типа контента (Фильм/Сериал/Мультфильм/Аниме)');

        var css = [
            '.card__view { overflow: visible !important; }',
            '.card__type {',
            '   position: absolute !important;',
            '   top: 1.4em !important;',
            '   left: -0.8em !important;',
            '   padding: 0.4em 0.7em !important;',
            '   border-radius: 0.3em !important;',
            '   font-size: 0.8em !important;',
            '   font-weight: 700 !important;',
            '   line-height: 1 !important;',
            '   color: #fff !important;',
            '   text-transform: uppercase !important;',
            '   font-family: Arial, sans-serif !important;',
            '   z-index: 10 !important;',
            '   pointer-events: none !important;',
            '   box-shadow: 0 0.2em 0.5em rgba(0,0,0,0.5) !important;',
            '}',
            '.card__type.ctb-movie   { background: #1e88e5 !important; }',
            '.card__type.ctb-serial  { background: #e53935 !important; }',
            '.card__type.ctb-cartoon { background: #fb8c00 !important; }',
            '.card__type.ctb-anime   { background: #8e24aa !important; }'
        ].join('');

        $('<style>' + css + '</style>').appendTo('head');

        var genreCache = window.ctb_genre_cache = window.ctb_genre_cache || {};

        var hasGenreSignal = function (data) {
            return !!(data && ((data.genre_ids && data.genre_ids.length) ||
                (data.genres && data.genres.length) || data.genre));
        };

        var requestGenreEnrichment = function (method, id, cb) {
            var key = method + '_' + id;

            if (genreCache[key] && genreCache[key] !== 'pending') { cb(genreCache[key]); return; }
            if (genreCache[key] === 'pending') {
                (genreCache['_cb_' + key] = genreCache['_cb_' + key] || []).push(cb);
                return;
            }

            genreCache[key] = 'pending';
            genreCache['_cb_' + key] = [cb];

            var finish = function (result) {
                genreCache[key] = result || false;
                var cbs = genreCache['_cb_' + key] || [];
                delete genreCache['_cb_' + key];
                for (var i = 0; i < cbs.length; i++) { try { cbs[i](genreCache[key]); } catch (e) {} }
            };

            try {
                if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function' || !Lampa.Reguest) {
                    finish(false);
                    return;
                }
                var url = Lampa.TMDB.api(method + '/' + id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('language'));
                var network = new Lampa.Reguest();
                network.timeout(7000);
                network.silent(url, function (json) {
                    if (!json || (!json.genres && !json.original_language && !json.origin_country)) { finish(false); return; }
                    finish({
                        genre_ids: (json.genres || []).map(function (g) { return g.id; }),
                        original_language: json.original_language,
                        origin_country: json.origin_country
                    });
                }, function () { finish(false); });
            } catch (e) { finish(false); }
        };

        var resolveType = function (cardEl, data) {
            if (!data || typeof data !== 'object') return null;

            var isCollectionCard = cardEl.classList.contains('card--collection') || cardEl.classList.contains('cub-collection-card') ||
                !!data._collection || (typeof data.items_count !== 'undefined' && typeof data.username !== 'undefined' && typeof data.liked !== 'undefined');
            if (isCollectionCard) return null;

            if (data.tv === true && data.url) return null;
            if (data.logo && data.url && !data.release_date && !data.first_air_date) return null;

            try {
                var p = cardEl;
                var depth = 0;
                while (p && depth < 7) {
                    if (p.classList) {
                        for (var c = 0; c < p.classList.length; c++) {
                            if ((p.classList[c] || '').toLowerCase().indexOf('iptv') !== -1) return null;
                        }
                    }
                    p = p.parentNode;
                    depth++;
                }
            } catch (e) {}

            if (data.known_for_department || data.profile_path && !data.release_date && !data.first_air_date) return null;

            var hasMovieSignals = !!(data.title || data.original_title || data.release_date);
            var hasTvSignals = !!(data.name || data.original_name || data.first_air_date || data.seasons);
            if (!hasMovieSignals && !hasTvSignals) return null;

            var isTV = cardEl.classList.contains('card--tv') || !!(data && (data.original_name || data.first_air_date || data.name));

            var isAnim = false;
            var hasAnimeKeyword = false;
            if (data) {
                var ids = data.genre_ids;
                if (!ids && data.genres) ids = data.genres.map(function (g) { return (g && typeof g === 'object') ? g.id : g; });
                if (ids) isAnim = ids.indexOf(16) !== -1;

                var genreNames = [];
                if (data.genres && data.genres.length) {
                    for (var gi = 0; gi < data.genres.length; gi++) {
                        var g = data.genres[gi];
                        genreNames.push(((g && typeof g === 'object' ? g.name : g) || '') + '');
                    }
                }
                if (data.genre) genreNames.push(data.genre + '');
                var genreText = genreNames.join(',').toLowerCase();
                if (genreText.indexOf('аниме') !== -1 || genreText.indexOf('anime') !== -1) {
                    hasAnimeKeyword = true;
                    isAnim = true;
                } else if (!isAnim && (genreText.indexOf('мультф') !== -1 ||
                    genreText.indexOf('animation') !== -1 || genreText.indexOf('cartoon') !== -1)) {
                    isAnim = true;
                }
            }

            var isJapanese = !!(data && (data.original_language === 'ja' || (data.origin_country && data.origin_country.indexOf('JP') !== -1)));
            if (!isJapanese && data) {
                var jpName = ((data.original_name || data.original_title || data.name || data.title || '') + '');
                if (Lampa.Utils && typeof Lampa.Utils.containsJapanese === 'function') {
                    isJapanese = Lampa.Utils.containsJapanese(jpName);
                } else {
                    isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(jpName);
                }
            }

            var isAnime = hasAnimeKeyword || (isAnim && isJapanese);

            if (isAnime)        return { text: 'АНИМЕ',      cls: 'ctb-anime'   };
            if (isTV && isAnim) return { text: 'СЕРИАЛ',     cls: 'ctb-cartoon' };
            if (isTV)           return { text: 'СЕРИАЛ',     cls: 'ctb-serial'  };
            if (isAnim)         return { text: 'МУЛЬТФИЛЬМ', cls: 'ctb-cartoon' };
                                return { text: 'ФИЛЬМ',       cls: 'ctb-movie'   };
        };

        var applyBadge = function (cardEl) {
            if (cardEl._ctb_badge) return;
            if (!cardEl.classList.contains('card')) return;
            if (cardEl.querySelector('.card-parser__title')) return;
            var view = cardEl.querySelector('.card__view');
            if (!view) return;

            if (!cardEl._ctb_badge_listener && cardEl.addEventListener) {
                cardEl._ctb_badge_listener = true;
                cardEl.addEventListener('visible', function () {
                    try { applyBadge(cardEl); } catch (e) {}
                });
            }

            var data = cardEl.card_data || cardEl.data || null;
            if (!data) {
                if (!cardEl._ctb_badge_retry) {
                    cardEl._ctb_badge_retry = true;
                    setTimeout(function () {
                        try { cardEl._ctb_badge_retry = false; } catch (e) {}
                        try { applyBadge(cardEl); } catch (e) {}
                    }, 400);
                }
                return;
            }
            var type = resolveType(cardEl, data);
            if (!type) return;
            var typeEl = view.querySelector('.card__type');
            if (!typeEl) {
                typeEl = document.createElement('div');
                view.appendChild(typeEl);
            }
            typeEl.className = 'card__type ' + type.cls;
            typeEl.textContent = type.text;
            cardEl._ctb_badge = true;

            if (!hasGenreSignal(data) && data.id && !data._ctb_genre_tried) {
                data._ctb_genre_tried = true;

                var method = (cardEl.classList.contains('card--tv') || data.first_air_date || data.number_of_seasons || (data.name && !data.title)) ? 'tv' : 'movie';

                requestGenreEnrichment(method, data.id, function (result) {
                    if (!result) return;

                    if (result.genre_ids && result.genre_ids.length) data.genre_ids = result.genre_ids;
                    if (!data.original_language && result.original_language) data.original_language = result.original_language;
                    if (!data.origin_country && result.origin_country) data.origin_country = result.origin_country;

                    var newType = resolveType(cardEl, data);
                    if (!newType) return;
                    if (newType.text === typeEl.textContent && newType.cls === typeEl.className.replace('card__type ', '')) return;

                    typeEl.className = 'card__type ' + newType.cls;
                    typeEl.textContent = newType.text;
                });
            }
        };

        var initBadges = function () {
            var badgeObserver = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        var node = added[j];
                        if (node.nodeType !== 1) continue;
                        if (node.classList && node.classList.contains('card')) applyBadge(node);
                        else {
                            var found = node.querySelectorAll('.card');
                            for (var k = 0; k < found.length; k++) applyBadge(found[k]);
                        }
                    }
                }
            });
            badgeObserver.observe(document.body, { childList: true, subtree: true });
            var existing = document.querySelectorAll('.card');
            for (var i = 0; i < existing.length; i++) applyBadge(existing[i]);
        };

        if (document.body) initBadges();
        else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initBadges(); });
    }

    startPlugin();
})();
