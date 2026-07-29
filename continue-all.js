(function () {
    'use strict';

    function inListById(list, id) {
        var i;
        if (!list || !list.length) return false;
        for (i = 0; i < list.length; i++) {
            if (list[i] && list[i].id == id) return true;
        }
        return false;
    }

    function isTvCard(card) {
        return !!(card && (card.number_of_seasons || card.first_air_date || card.type === 'tv' || (card.subscribe && card.subscribe.season)));
    }

    function repairCard(card) {
        if (!card) return card;

        if (isTvCard(card) && !card.name && card.title) {
            card.name = card.title;
            card.original_name = card.original_title;
        }

        return card;
    }

    function buildSelectedContinues() {
        var result = [];
        var history = [];
        var viewed = [];
        var thrown = [];
        var i, card;
        var byId = {};

        if (!Lampa.Favorite || typeof Lampa.Favorite.get !== 'function') return result;

        try {
            history = Lampa.Favorite.get({ type: 'history' }) || [];
            viewed = Lampa.Favorite.get({ type: 'viewed' }) || [];
            thrown = Lampa.Favorite.get({ type: 'thrown' }) || [];
        } catch (e) {}

        for (i = 0; i < history.length; i++) {
            card = history[i] ? Lampa.Arrays.clone(history[i]) : null;
            if (!card || typeof card.id === 'undefined') continue;

            if (byId[card.id]) continue;
            byId[card.id] = true;

            if (inListById(viewed, card.id)) continue;
            if (inListById(thrown, card.id)) continue;

            result.push(repairCard(card));

            if (result.length >= 19) break;
        }

        return result.slice(0, 19);
    }

    function patchMainContinueWatch() {
        if (!Lampa.ContentRows || typeof Lampa.ContentRows.call !== 'function') return;
        if (Lampa.ContentRows.call.__continue_watch_main_patched) return;

        var original = Lampa.ContentRows.call;

        var patched = function (screen, params, calls) {
            if (screen !== 'main') {
                return original.apply(this, arguments);
            }

            var fake_calls = [];
            original.call(this, screen, params, fake_calls);

            var i, cb, str, is_native_continue;
            for (i = 0; i < fake_calls.length; i++) {
                cb = fake_calls[i];
                str = typeof cb === 'function' ? cb.toString() : '';

                is_native_continue = str.indexOf('cub_notices') !== -1 || str.indexOf('Timeline') !== -1 || str.indexOf('watchedEpisode') !== -1;

                if (is_native_continue) {
                    continue;
                }

                calls.push(cb);
            }

            var merged = buildSelectedContinues();
            if (merged.length > 0) {
                calls.splice(1, 0, function(call_cb) {
                    var results = merged;

                    try {
                        var cub_notices = [];
                        if (Lampa.Notice && Lampa.Notice.get) {
                            var cub = Lampa.Notice.get('cub');
                            if (cub && cub.items) cub_notices = cub.items();
                        } else if (Lampa.Notices && Lampa.Notices.get) {
                            var cub = Lampa.Notices.get('cub');
                            if (cub && cub.items) cub_notices = cub.items();
                        }
                        cub_notices = cub_notices.filter(function(n) { return n && n.item && n.item.method == 'tv-voice'; });

                        if (cub_notices.length) {
                            var history = [];
                            if (Lampa.Favorite && Lampa.Favorite.get) history = Lampa.Favorite.get({type:'history'}) || [];

                            history = history.filter(function(h) {
                                return cub_notices.find(function(n) { return n.item.card_id == h.id; });
                            });

                            var new_episode = history.map(function(h) {
                                var noty = cub_notices.find(function(n) { return n.item.card_id == h.id; });
                                var card = Lampa.Arrays.clone(h);

                                var maskValue = 254;
                                if (Lampa.Maker && typeof Lampa.Maker.module === 'function') {
                                    try {
                                        var cardModule = Lampa.Maker.module('Card');
                                        if (cardModule && typeof cardModule.toggle === 'function' && cardModule.MASK) {
                                            maskValue = cardModule.toggle(cardModule.MASK.base, 'Subscribe');
                                        }
                                    } catch (e) {}
                                } else if (Lampa.MaskHelper && Lampa.Arrays && typeof Lampa.Arrays.getKeys === 'function') {
                                    try {
                                        var cardMap = (Lampa.Maker && typeof Lampa.Maker.map === 'function') ? Lampa.Maker.map('Card') : null;
                                        if (cardMap) {
                                            var tempMask = new Lampa.MaskHelper(Lampa.Arrays.getKeys(cardMap));
                                            maskValue = tempMask.toggle(tempMask.MASK.base, 'Subscribe');
                                        }
                                    } catch (e) {}
                                }
                                card.params = { module: maskValue };

                                card.subscribe = {
                                    status: 1,
                                    season: noty.item.season,
                                    episode: noty.item.episode,
                                    voice: noty.data.voice
                                };
                                card.viewed = (Lampa.Timeline && Lampa.Timeline.watchedEpisode) ? Lampa.Timeline.watchedEpisode(h, noty.item.season, noty.item.episode) : 0;
                                return repairCard(card);
                            });

                            new_episode = new_episode.filter(function(n) { return n.viewed < 10; });

                            if (new_episode.length) {
                                results = results.filter(function(r) { return !new_episode.find(function(h) { return h.id == r.id; }); });
                                results = [].concat(new_episode, results);
                                results = results.slice(0, 19);
                            }
                        }
                    } catch (e) {}

                    call_cb({
                        results: results,
                        title: (Lampa.Lang && typeof Lampa.Lang.translate === 'function') ? Lampa.Lang.translate('title_continue') : 'Продолжить просмотр'
                    });
                });
            }
        };

        patched.__continue_watch_main_patched = true;
        Lampa.ContentRows.call = patched;
    }

    function init() {
        try {
            if (Lampa.SettingsApi && typeof Lampa.SettingsApi.removeComponent === 'function') {
                Lampa.SettingsApi.removeComponent('continue_watch_main');
            }
        } catch (e) {}

        patchMainContinueWatch();
    }

    if (window.Lampa) {
        init();
    } else {
        window.addEventListener('load', function () {
            if (window.Lampa) init();
        });
    }
})();
