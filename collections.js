﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿(function () {
  'use strict';

  function Collection(data) {
    this.data = data;

    function remove(elem) {
      if (elem) elem.remove();
    }

    this.build = function () {
      this.item = Lampa.Template.js('cub_collection');
      if (!this.item) this.item = Lampa.Template.js('card');
      if (!this.item) return;

      this.img = this.item.find ? this.item.find('.card__img') : null;
      this.icon = this.item.find ? this.item.find('.cub-collection-card__user-icon img') : null;

      if (data && data.__create_collection) {
        this.item.classList.add('cub-collection-card--create');

        var view = this.item.find('.card__view');
        if (this.img) this.img.style.opacity = '1';
        if (view) {
          var bgicon = document.createElement('div');
          bgicon.className = 'cub-collection-create__bgicon';
          bgicon.innerHTML = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="18" width="36" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 26v12M26 32h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
          view.appendChild(bgicon);
        }

        var head = this.item.find('.cub-collection-card__head');
        if (head) head.remove();

        var bottom = this.item.find('.cub-collection-card__bottom');
        if (bottom) bottom.remove();

        var title = this.item.find('.card__title');
        if (title) title.textContent = '';

        var type = this.item.find('.card__type');
        if (type) type.remove();

        return;
      }

      try {
        var st = getSettings();
        var use_stack = st && st.cover_view === 'stack';
        this.item.classList.toggle('cub-collection-card--stack', !!use_stack);
        var view2 = this.item.find('.card__view');

        if (use_stack && view2) {
          var stack = view2.querySelector('.cub-collection-card__stack');
          if (!stack) {
            stack = document.createElement('div');
            stack.className = 'cub-collection-card__stack';
            stack.innerHTML = '<div class="cub-collection-card__stack-strip cub-collection-card__stack-strip--1 cub-collection-card__stack-img"></div><div class="cub-collection-card__stack-strip cub-collection-card__stack-strip--2 cub-collection-card__stack-img"></div><div class="cub-collection-card__stack-strip cub-collection-card__stack-strip--3 cub-collection-card__stack-img"></div><div class="cub-collection-card__stack-main cub-collection-card__stack-img"></div>';
            view2.insertBefore(stack, view2.firstChild);
          }
          this.stack = stack;
          this.stack_main = stack ? stack.querySelector('.cub-collection-card__stack-main') : null;
          this.stack_strips = stack ? Array.prototype.slice.call(stack.querySelectorAll('.cub-collection-card__stack-strip') || []) : [];
          this.stack_items = stack ? Array.prototype.slice.call(stack.querySelectorAll('.cub-collection-card__stack-img') || []) : [];
          if (this.img) this.img.style.opacity = '0';
        } else {
          if (this.img) this.img.style.opacity = '';
          if (view2) {
            var stack2 = view2.querySelector('.cub-collection-card__stack');
            if (stack2) stack2.remove();
          }
          this.stack = null;
          this.stack_main = null;
          this.stack_strips = null;
          this.stack_items = null;
        }
      }
      catch (e) {}

      var bottom_wrap = this.item.find('.cub-collection-card__bottom');
      var liked_wrap = this.item.find('.cub-collection-card__liked');
      var user_wrap = this.item.find('.cub-collection-card__user');

      if (bottom_wrap && liked_wrap && user_wrap) {
        liked_wrap.before(user_wrap);
        user_wrap.style.marginLeft = 'auto';
      }

      var title_el = this.item.find ? this.item.find('.card__title') : null;
      if (title_el && title_el.text) title_el.text(Lampa.Utils.capitalizeFirstLetter(data.title));

      var items_el = this.item.find ? this.item.find('.cub-collection-card__items') : null;
      if (items_el && items_el.text) items_el.text(data.items_count);

      var date_el = this.item.find ? this.item.find('.cub-collection-card__date') : null;
      if (date_el && date_el.text) date_el.text(Lampa.Utils.parseTime(data.time).full);

      var views_el = this.item.find ? this.item.find('.cub-collection-card__views') : null;
      if (views_el && views_el.text) views_el.text(Lampa.Utils.bigNumberToShort(data.views));

      var liked_el = this.item.find ? this.item.find('.full-review__like-counter') : null;
      if (liked_el && liked_el.text) liked_el.text(Lampa.Utils.bigNumberToShort(data.liked));

      var user_el = this.item.find ? this.item.find('.cub-collection-card__user-name') : null;
      if (user_el && user_el.text) user_el.text(data.username);

      if (this.item.addEventListener) this.item.addEventListener('visible', this.visible.bind(this));
    };
    /**
     * Загрузить картинку
     */


    this.image = function () {
      var _this = this;

      if (this.img) {
        this.img.onload = function () {
          try { _this.item.classList.add('card--loaded'); } catch (e) {}
        };

        this.img.onerror = function () {
          _this.img.src = './img/img_load.svg';
        };
      }

      if (this.icon) {
        this.icon.onload = function () {
          try {
            var wrap = _this.item && _this.item.find ? _this.item.find('.cub-collection-card__user-icon') : null;
            if (wrap) wrap.classList.add('loaded');
          }
          catch (e) {}
        };

        this.icon.onerror = function () {
          _this.icon.src = './img/img_broken.svg';
        };
      }
    };
    /**
     * Создать
     */


    this.create = function () {
      var _this2 = this;

      this.build();
      if (!this.item) return;

      if (data && data.__create_collection) {
        this.item.addEventListener('hover:enter', function () {
          openCreateDialog(function () {
            try {
              Lampa.Activity.replace(Lampa.Activity.active());
            }
            catch (e) {}
          });
        });
        return;
      }

      this.item.addEventListener('hover:focus', function () {
        if (_this2.onFocus) _this2.onFocus(_this2.item, data);
        try {
          var st = getSettings();
          if (!st || st.cover_view !== 'stack') return;
          var id = getCollectionId(data);
          if (!id) return;
          if (cover_stack_cache && cover_stack_cache[String(id)]) return;
          requestStackCovers(id, function () {
            applyStackCoverToCard(_this2, id, data && (data.backdrop_path || data.poster_path) ? (data.backdrop_path || data.poster_path) : '');
          });
        }
        catch (e) {}
      });
      this.item.addEventListener('hover:touch', function () {
        if (_this2.onTouch) _this2.onTouch(_this2.item, data);
      });
      this.item.addEventListener('hover:hover', function () {
        if (_this2.onHover) _this2.onHover(_this2.item, data);
      });
      this.item.addEventListener('hover:enter', function () {
        Lampa.Activity.push({
          url: data.id,
          collection: data,
          title: Lampa.Utils.capitalizeFirstLetter(data.title),
          component: 'cub_collections_view',
          page: 1
        });
      });
      this.item.addEventListener('hover:long', function () {
        Lampa.Loading.start(function () {
          Api.clear();
          Lampa.Loading.stop();
          Lampa.Controller.toggle('content');
        });
        Api.status(data, function (status) {
          Lampa.Loading.stop();
          var items = [];
          var voited = Lampa.Storage.cache('collections_voited', 100, []);
          var user = getAccount();
          var is_owner = user && getUserId(user) && getUserId(user) == data.cid;
          items.push({
            title: 'Коллeкции @' + data.username,
            onSelect: function onSelect() {
              Lampa.Activity.push({
                url: 'user_' + data.cid,
                title: 'Коллeкции @' + data.username,
                component: 'cub_collections_collection',
                page: 1
              });
              Lampa.Controller.toggle('content');
            }
          });
          items.push({
            title: Lampa.Lang.translate(status.saved ? 'Убрать из сохраненных' : 'Добавить в сохраненные'),
            onSelect: function onSelect() {
              Lampa.Controller.toggle('content');
              Api.save(data, function () {
                Lampa.Bell.push({
                  text: Lampa.Lang.translate(status.saved ? 'Убрано из сохраненных' : 'Добавлено в сохраненные')
                });
              });
            }
          });
          items.push({
            title: Lampa.Lang.translate('more'),
            separator: true
          });

          if (is_owner) {
            items.push({
              title: 'Публичная',
              checkbox: true,
              checked: typeof data.public === 'number' ? data.public === 1 : true,
              onCheck: function (elem) {
                try { Lampa.Select.close(); } catch (e) {}
                var next_public = elem && elem.checked ? 1 : 0;
                Lampa.Loading.start(function () {
                  Api.clear();
                  Lampa.Loading.stop();
                });
                Api.editCollection({
                  id: data.id,
                  title: data.title,
                  public: next_public
                }, function () {
                  Lampa.Loading.stop();
                  data.public = next_public;
                  Lampa.Bell.push({
                    text: next_public ? 'Коллекция публичная' : 'Коллекция приватная'
                  });
                }, function (err) {
                  Lampa.Loading.stop();
                  Lampa.Noty.show('Не удалось изменить тип');
                  if (err && err.a && err.e) Lampa.Noty.show(network.errorDecode(err.a, err.e));
                });
              }
            });
            items.push({
              title: 'Редактировать',
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                openEditDialog(data, _this2);
              }
            });
            items.push({
              title: 'Обложка (из карточек)',
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                openCoverDialog(data, _this2);
              }
            });
            var settings = getSettings();
            if (settings && settings.group_user === 'smart') {
              items.push({
                title: 'Группа',
                onSelect: function onSelect() {
                  Lampa.Controller.toggle('content');
                  openGroupOverrideDialog(data);
                }
              });
            }
            items.push({
              title: 'Удалить',
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                openDeleteDialog(data, _this2);
              }
            });
            items.push({
              title: Lampa.Lang.translate('more'),
              separator: true
            });
          }
          else {
            items.push({
              title: 'Скопировать в мои',
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                duplicateCollectionToMy(data);
              }
            });
          }

          if (voited.indexOf(data.id) == -1) {
            items = items.concat([{
              title: '<span class="settings-param__label">+1</span> ' + Lampa.Lang.translate('title_like'),
              like: 1
            }, {
              title: Lampa.Lang.translate('reactions_shit'),
              like: -1
            }]);
          }

          Lampa.Select.show({
            title: Lampa.Lang.translate('title_action'),
            items: items,
            onSelect: function onSelect(item) {
              if (item.onSelect) item.onSelect(item);
              else {
                Lampa.Controller.toggle('content');
                Api.liked({
                  id: data.id,
                  dir: item.like
                }, function () {
                  voited.push(data.id);
                  Lampa.Storage.set('collections_voited', voited);
                  data.liked += item.like;

                  _this2.item.find('.full-review__like-counter').text(Lampa.Utils.bigNumberToShort(data.liked));

                  Lampa.Bell.push({
                    text: Lampa.Lang.translate('discuss_voited')
                  });
                });
              }
            },
            onBack: function onBack() {
              Lampa.Controller.toggle('content');
            }
          });
        });
      });
      this.image();
    };
    /**
     * Загружать картинку если видна карточка
     */


    this.visible = function () {
      var img_path = data && (data.backdrop_path || data.poster_path) ? (data.backdrop_path || data.poster_path) : '';
      var st = null;
      try { st = getSettings(); } catch (e) {}
      var use_stack = st && st.cover_view === 'stack';
      if (use_stack && this.stack_items && this.stack_items.length) {
        var cid = getCollectionId(data);
        applyStackCoverToCard(this, cid, img_path);
        if (this.img) this.img.src = './img/img_load.svg';
        try {
          if (cid && !cover_stack_cache[String(cid)] && cover_stack_prefetch_budget > 0) {
            cover_stack_prefetch_budget--;
            requestStackCovers(cid, function () {
              applyStackCoverToCard(this, cid, img_path);
            }.bind(this));
          }
        }
        catch (e) {}
      } else {
        if (this.img) this.img.src = img_path ? Lampa.Api.img(img_path, 'w500') : './img/img_load.svg';
      }
      if (this.icon) this.icon.src = data && data.icon ? Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/img/profiles/' + data.icon + '.png' : './img/img_broken.svg';
      if (this.onVisible) this.onVisible(this.item, data);
    };
    /**
     * Уничтожить
     */


    this.destroy = function () {
      if (this.img) {
        this.img.onerror = function () {};
        this.img.onload = function () {};
        this.img.src = '';
      }
      remove(this.item);
      this.item = null;
      this.img = null;
    };
    /**
     * Рендер
     * @returns {object}
     */


    this.render = function (js) {
      return js ? this.item : $(this.item);
    };
  }

  var network = new Lampa.Reguest();
  var api_url = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/collections/';
  var collections = [{
    hpu: 'user',
    title: 'Мои коллекции'
  }, {
    hpu: 'saved',
    title: 'Сохраненные'
  }, {
    hpu: 'new',
    title: 'Новинки'
  }, {
    hpu: 'top',
    title: 'В топе'
  }, {
    hpu: 'week',
    title: 'Популярные за неделю'
  }, {
    hpu: 'month',
    title: 'Популярные за месяц'
  }, {
    hpu: 'big',
    title: 'Большие коллекции'
  }, {
    hpu: 'all',
    title: 'Все коллекции'
  }];

  var SETTINGS_KEY = 'cub_collections_settings';

  function getSettings() {
    var defaults = {
      only_my: false,
      hidden_categories: [],
      sort_user: 'default',
      group_user: 'none',
      cover_view: 'single'
    };

    try {
      var raw = Lampa.Storage.get(SETTINGS_KEY, '{}') || '{}';
      var data = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw;
      data = data && typeof data === 'object' ? data : {};
      return {
        only_my: !!data.only_my,
        hidden_categories: Array.isArray(data.hidden_categories) ? data.hidden_categories : [],
        sort_user: data.sort_user === 'az' ? 'az' : 'default',
        group_user: data.group_user === 'alpha' ? 'alpha' : data.group_user === 'smart' ? 'smart' : 'none',
        cover_view: data.cover_view === 'stack' ? 'stack' : 'single'
      };
    }
    catch (e) {
      return defaults;
    }
  }

  function setSettings(next) {
    try {
      Lampa.Storage.set(SETTINGS_KEY, next || {});
    }
    catch (e) {}
  }

  function applyUserSortToResults(results, keep_create) {
    if (!Array.isArray(results) || !results.length) return results || [];
    var settings = getSettings();
    if (settings.sort_user !== 'az') return results;

    var items = results.slice(0);
    var create = [];
    if (keep_create) {
      create = items.filter(function (x) {
        return x && x.__create_collection;
      });
      items = items.filter(function (x) {
        return !(x && x.__create_collection);
      });
    }

    items.sort(function (a, b) {
      var at = (a && a.title ? String(a.title) : '').toLowerCase();
      var bt = (b && b.title ? String(b.title) : '').toLowerCase();
      if (at === bt) return 0;
      return at > bt ? 1 : -1;
    });

    return keep_create ? create.concat(items) : items;
  }

  function getCollectionTitle(it) {
    if (!it) return '';
    return (it.title || it.name || it.label || '') + '';
  }

  function normalizeTitleForMatch(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9а-яё#\s]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function normalizeGroupLabel(label) {
    var s = (label || '').toString().trim();
    if (!s) return '';
    var has_letters = /[A-ZА-ЯЁ]/.test(s);
    var is_upper = has_letters && s === s.toUpperCase();
    if (is_upper) {
      if (s.length <= 4) return s;
      var low = s.toLowerCase();
      return low.charAt(0).toUpperCase() + low.slice(1);
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function pickHashtagGroup(norm) {
    var m = norm.match(/#([a-z0-9а-яё_-]{2,})/i);
    if (!m) return '';
    var tag = m[1] || '';
    if (!tag) return '';
    tag = (tag + '').toLowerCase().replace(/ё/g, 'е');
    return canonicalizeExplicitGroup(tag);
  }

  function pickBracketGroup(title) {
    var t = (title || '').toString().trim();
    if (!t) return '';
    var m = t.match(/^\s*[\[\(\{]\s*([^\]\)\}]{2,32})\s*[\]\)\}]/);
    if (!m) return '';
    return (m[1] || '').trim();
  }

  function pickPrefixGroup(title) {
    var t = (title || '').toString().trim();
    if (!t) return '';
    var m = t.match(/^\s*(жанр|genre|tag|тег|категория|category)\s*[:\-—]\s*(.{2,32})\s*$/i);
    if (!m) return '';
    return (m[2] || '').trim();
  }

  function canonicalizeExplicitGroup(label) {
    var raw = normalizeTitleForMatch(label || '');
    if (!raw) return '';

    var map = {
      anime: 'Аниме',
      аниме: 'Аниме',
      marvel: 'Marvel',
      dc: 'DC',
      horror: 'Ужасы',
      ужасы: 'Ужасы',
      thriller: 'Триллеры',
      триллер: 'Триллеры',
      comedy: 'Комедии',
      комедии: 'Комедии',
      комедия: 'Комедии',
      drama: 'Драмы',
      драмы: 'Драмы',
      драм: 'Драмы',
      action: 'Боевики',
      боевик: 'Боевики',
      боевики: 'Боевики',
      фантастика: 'Фантастика',
      fantasy: 'Фэнтези',
      фэнтези: 'Фэнтези',
      crime: 'Криминал',
      криминал: 'Криминал',
      detective: 'Детектив',
      детектив: 'Детектив',
      romance: 'Романтика',
      романтика: 'Романтика',
      melodrama: 'Мелодрамы',
      мелодрамы: 'Мелодрамы',
      family: 'Семейное',
      семейное: 'Семейное',
      documentary: 'Документальное',
      документальное: 'Документальное',
      history: 'История',
      история: 'История',
      biography: 'Биография',
      биография: 'Биография',
      war: 'Военные',
      военные: 'Военные',
      western: 'Вестерн',
      вестерн: 'Вестерн',
      sport: 'Спорт',
      спорт: 'Спорт',
      music: 'Музыка',
      музыка: 'Музыка',
      adventure: 'Приключения',
      приключения: 'Приключения',
      series: 'Сериалы',
      сериал: 'Сериалы',
      сериалы: 'Сериалы',
      tv: 'Сериалы',
      animation: 'Мультфильмы',
      cartoon: 'Мультфильмы',
      мультфильмы: 'Мультфильмы'
    };

    if (map[raw]) return map[raw];
    return normalizeGroupLabel(label);
  }

  function splitTitlePartsForMatch(title) {
    var t = (title || '').toString();
    var parts = t.split(/—|-|:|\||·/g).map(function (x) {
      return normalizeTitleForMatch(x);
    }).filter(function (x) {
      return x;
    });
    return parts.length ? parts : [normalizeTitleForMatch(t)];
  }

  function detectSmartGroup(title) {
    var norm = normalizeTitleForMatch(title);
    if (!norm) return 'Другое';

    var hashtag = pickHashtagGroup(norm);
    if (hashtag) return hashtag;

    var bracket = pickBracketGroup(title);
    if (bracket) {
      var c = canonicalizeExplicitGroup(bracket);
      if (c) return c;
    }

    var pref = pickPrefixGroup(title);
    if (pref) {
      var c2 = canonicalizeExplicitGroup(pref);
      if (c2) return c2;
    }

    var parts = splitTitlePartsForMatch(title);
    var tail = parts.length ? parts[parts.length - 1] : norm;

    var rules = [{
      title: 'Аниме',
      score: 60,
      rx: /(аниме|anime)/i
    }, {
      title: 'Marvel',
      score: 60,
      rx: /(marvel|мстител|железн(ый|ого)\s+человек|капитан\s+америка|человек\s+паук|спайдермен|spider\s?man)/i
    }, {
      title: 'DC',
      score: 60,
      rx: /(^|\s)(dc)(\s|$)|(\b|^)(batman|joker|superman|wonder\s+woman)(\b|$)|бэтмен|джокер|супермен|чудо[-\s]?женщина/i
    }, {
      title: 'Star Wars',
      score: 55,
      rx: /(star\s+wars|звездн(ые|ых)\s+войн)/i
    }, {
      title: 'Гарри Поттер',
      score: 55,
      rx: /(гарри\s+поттер|harry\s+potter)/i
    }, {
      title: 'Властелин колец',
      score: 55,
      rx: /(властелин\s+колец|lord\s+of\s+the\s+rings|the\s+hobbit|хоббит)/i
    }, {
      title: 'Pixar',
      score: 50,
      rx: /(pixar)/i
    }, {
      title: 'Disney',
      score: 50,
      rx: /(disney|дисней)/i
    }, {
      title: 'Ghibli',
      score: 50,
      rx: /(ghibli|гибли)/i
    }, {
      title: 'Сериалы',
      score: 35,
      rx: /(сериал|сериалы|tv|series)/i
    }, {
      title: 'Мультфильмы',
      score: 35,
      rx: /(мульт|мульты|мультфильм|мультфильмы|animation|cartoon|анимаци)/i
    }, {
      title: 'Документальное',
      score: 30,
      rx: /(док(?!тор)|документал|documentary)/i
    }, {
      title: 'Зомби',
      score: 29,
      rx: /(зомби|zombi|undead|ходяч)/i
    }, {
      title: 'Ужасы',
      score: 28,
      rx: /(ужас|horror)/i
    }, {
      title: 'Триллеры',
      score: 27,
      rx: /(триллер|thriller)/i
    }, {
      title: 'Комедии',
      score: 26,
      rx: /(комед|comedy)/i
    }, {
      title: 'Драмы',
      score: 26,
      rx: /(драм|drama)/i
    }, {
      title: 'Мелодрамы',
      score: 25,
      rx: /(мелодрам|melodrama)/i
    }, {
      title: 'Романтика',
      score: 24,
      rx: /(романт|love|romance)/i
    }, {
      title: 'Боевики',
      score: 24,
      rx: /(боевик|экшен|action)/i
    }, {
      title: 'Фантастика',
      score: 24,
      rx: /(фантаст|sci\s?-?\s?fi|sci-fi)/i
    }, {
      title: 'Фэнтези',
      score: 24,
      rx: /(фэнтез|fantasy)/i
    }, {
      title: 'Приключения',
      score: 23,
      rx: /(приключ|adventure)/i
    }, {
      title: 'Криминал',
      score: 22,
      rx: /(криминал|crime|мафия|gangster)/i
    }, {
      title: 'Детектив',
      score: 22,
      rx: /(детектив|detective)/i
    }, {
      title: 'История',
      score: 21,
      rx: /(истор|history)/i
    }, {
      title: 'Военные',
      score: 21,
      rx: /(военн|war)/i
    }, {
      title: 'Биография',
      score: 20,
      rx: /(биограф|biography|biopic)/i
    }, {
      title: 'Музыка',
      score: 19,
      rx: /(музык|music)/i
    }, {
      title: 'Спорт',
      score: 19,
      rx: /(спорт|sport)/i
    }, {
      title: 'Вестерн',
      score: 19,
      rx: /(вестерн|western)/i
    }, {
      title: 'Семейное',
      score: 18,
      rx: /(семейн|family|kids|детск)/i
    }];

    var best_title = '';
    var best_score = 0;

    var scoreText = function (text, boost) {
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].rx.test(text)) {
          var s = rules[i].score + (boost ? 3 : 0);
          if (s > best_score) {
            best_score = s;
            best_title = rules[i].title;
          }
        }
      }
    };

    parts.forEach(function (p) {
      scoreText(p, false);
    });
    if (tail && tail !== norm) scoreText(tail, true);
    scoreText(norm, false);

    return best_title || 'Другое';
  }

  function detectAlphaGroup(title) {
    var t = (title || '').trim();
    if (!t) return '#';
    var ch = (t[0] || '').toUpperCase();
    if (/\d/.test(ch)) return '0-9';
    if (/[A-ZА-ЯЁ]/.test(ch)) return ch === 'Ё' ? 'Е' : ch;
    return '#';
  }

  var GROUP_OVERRIDES_KEY = 'cub_collections_group_overrides';

  function getGroupOverrides() {
    try {
      var raw = Lampa.Storage.get(GROUP_OVERRIDES_KEY, '{}') || '{}';
      var data = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw;
      return data && typeof data === 'object' ? data : {};
    }
    catch (e) {
      return {};
    }
  }

  function setGroupOverrides(map) {
    try {
      Lampa.Storage.set(GROUP_OVERRIDES_KEY, map || {});
    }
    catch (e) {}
  }

  function getGroupOverride(collection_id) {
    if (!collection_id) return '';
    var map = getGroupOverrides();
    var v = map[String(collection_id)];
    return v ? String(v) : '';
  }

  function setGroupOverride(collection_id, group) {
    if (!collection_id) return;
    var id = String(collection_id);
    var map = getGroupOverrides();
    if (!group) delete map[id];
    else map[id] = String(group);
    setGroupOverrides(map);
  }

  var CUSTOM_GROUPS_KEY = 'cub_collections_custom_groups';

  function getCustomGroups() {
    try {
      var raw = Lampa.Storage.get(CUSTOM_GROUPS_KEY, '[]') || '[]';
      var data = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
      if (!Array.isArray(data)) return [];
      return data.map(function (x) {
        return (x || '').toString().trim();
      }).filter(function (x) {
        return x;
      });
    }
    catch (e) {
      return [];
    }
  }

  function setCustomGroups(list) {
    try {
      Lampa.Storage.set(CUSTOM_GROUPS_KEY, Array.isArray(list) ? list : []);
    }
    catch (e) {}
  }

  function addCustomGroup(name) {
    var n = (name || '').toString().trim();
    if (!n) return;
    var list = getCustomGroups();
    if (list.indexOf(n) === -1) {
      list.push(n);
      setCustomGroups(list);
    }
  }

  function normalizeTokenForGroup(t) {
    return (t || '').toString().toLowerCase().replace(/[^a-z0-9а-яё]+/g, '');
  }

  function stemTokenRu(token) {
    var src = token || '';
    var t = src;
    if (t.length < 5) return t;
    var endings = ['иями', 'ями', 'ами', 'ов', 'ев', 'ей', 'ям', 'ам', 'ах', 'ях', 'ом', 'ем', 'ою', 'ею', 'ую', 'юю', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ый', 'ий', 'ой', 'ым', 'им', 'ых', 'их', 'а', 'я', 'ы', 'и', 'у', 'ю', 'е', 'о'];
    for (var i = 0; i < endings.length; i++) {
      var e = endings[i];
      if (t.length > e.length + 2 && t.slice(-e.length) === e) {
        var cut = t.slice(0, -e.length);
        return cut.length >= 3 ? cut : src;
      }
    }
    return t;
  }

  function stemTokenEn(token) {
    var t = token || '';
    if (t.length < 5) return t;
    if (t.slice(-3) === 'ing' && t.length > 6) return t.slice(0, -3);
    if (t.slice(-2) === 'ed' && t.length > 5) return t.slice(0, -2);
    if (t.slice(-2) === 'es' && t.length > 5) return t.slice(0, -2);
    if (t.slice(-1) === 's' && t.length > 4) return t.slice(0, -1);
    return t;
  }

  function stemToken(token) {
    var t = normalizeTokenForGroup(token);
    if (!t) return '';
    if (/[a-z]/.test(t)) return stemTokenEn(t);
    return stemTokenRu(t);
  }

  function getStopwordsMap() {
    return {
      'и': 1, 'в': 1, 'во': 1, 'на': 1, 'по': 1, 'про': 1, 'для': 1, 'из': 1, 'или': 1, 'это': 1, 'то': 1, 'что': 1, 'как': 1, 'а': 1,
      'фильм': 1, 'фильмы': 1, 'сериал': 1, 'сериалы': 1, 'мульт': 1, 'мульты': 1, 'подборка': 1, 'подборки': 1, 'коллекция': 1, 'коллекции': 1,
      'топ': 1, 'лучшее': 1, 'лучшие': 1, 'избранное': 1, 'избранные': 1, 'любимое': 1, 'любимые': 1, 'мой': 1, 'мои': 1, 'моя': 1, 'мое': 1,
      'the': 1, 'a': 1, 'an': 1, 'and': 1, 'or': 1, 'of': 1, 'to': 1, 'for': 1, 'in': 1, 'on': 1, 'my': 1, 'best': 1, 'top': 1
    };
  }

  function extractKeywordsFromTitleDetailed(title) {
    var raw = (title || '').toString().toLowerCase().replace(/[^a-z0-9а-яё\s]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!raw) return [];
    var stop = getStopwordsMap();

    var out = [];
    raw.split(' ').forEach(function (w) {
      var surface = normalizeTokenForGroup(w);
      if (!surface) return;
      if (surface.length < 2) return;

      var stem = stemToken(surface);
      if (!stem) return;
      if (stem.length < 2) return;
      if (/^\d+$/.test(stem)) return;
      if (stop[stem]) return;

      out.push({
        stem: stem,
        surface: surface
      });
    });

    var seen = {};
    return out.filter(function (x) {
      var key = x.stem + '|' + x.surface;
      if (seen[key]) return false;
      seen[key] = 1;
      return true;
    });
  }

  function buildKeywordModel(items) {
    var model = {};
    (items || []).forEach(function (it) {
      var title = getCollectionTitle(it);
      extractKeywordsFromTitleDetailed(title).forEach(function (x) {
        if (!model[x.stem]) model[x.stem] = { count: 0, surfaces: {} };
        model[x.stem].count++;
        model[x.stem].surfaces[x.surface] = (model[x.stem].surfaces[x.surface] || 0) + 1;
      });
    });

    Object.keys(model).forEach(function (k) {
      var entry = model[k];
      var best = '';
      var bestCount = 0;
      Object.keys(entry.surfaces || {}).forEach(function (s) {
        var c = entry.surfaces[s] || 0;
        if (c > bestCount) {
          bestCount = c;
          best = s;
        }
      });
      entry.label = tokenToGroupLabel(best || k);
    });

    return model;
  }

  function tokenToGroupLabel(token) {
    var t = (token || '').toString();
    if (!t) return '';
    if (/^[a-z0-9]+$/.test(t)) return t.toUpperCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function topGroupsFromModel(model, limit) {
    var arr = Object.keys(model || {}).map(function (k) {
      var e = model[k] || {};
      return { k: k, c: e.count || 0, label: e.label || tokenToGroupLabel(k) };
    }).filter(function (x) {
      return x.c >= 2;
    });
    arr.sort(function (a, b) {
      if (b.c !== a.c) return b.c - a.c;
      return a.label > b.label ? 1 : -1;
    });
    return arr.slice(0, limit || 20).map(function (x) {
      return x.label;
    });
  }

  function detectDynamicGroup(title, model) {
    if (!model) return '';
    var tokens = extractKeywordsFromTitleDetailed(title);
    if (!tokens.length) return '';
    var best = '';
    var bestCount = 0;
    tokens.forEach(function (x) {
      var e = model[x.stem];
      var c = e && e.count ? e.count : 0;
      if (c > bestCount) {
        bestCount = c;
        best = x.stem;
      }
    });
    if (best && bestCount >= 2) return (model[best] && model[best].label) ? model[best].label : tokenToGroupLabel(best);
    return '';
  }

  function openGroupOverrideDialog(collection_data) {
    var id = getCollectionId(collection_data);
    if (!id) return;

    var current = getGroupOverride(id);
    var custom = getCustomGroups();
    var base_items = Array.isArray(window.cub_collections_last_user_items) ? window.cub_collections_last_user_items : [];
    var model = buildKeywordModel(base_items);
    var detected_map = {};
    base_items.forEach(function (it) {
      var title = getCollectionTitle(it);
      var forced = getGroupOverride(getCollectionId(it));
      var g = (forced || '').toString().trim();
      if (!g) {
        g = detectSmartGroup(title);
        if (g === 'Другое') {
          var dyn = detectDynamicGroup(title, model);
          if (dyn) g = dyn;
        }
      }
      g = (g || '').toString().trim();
      if (!g || g === 'Другое') return;
      detected_map[g] = (detected_map[g] || 0) + 1;
    });
    var detected = Object.keys(detected_map || {}).sort(function (a, b) {
      var ac = detected_map[a] || 0;
      var bc = detected_map[b] || 0;
      if (bc !== ac) return bc - ac;
      var aa = (a || '').toLowerCase();
      var bb = (b || '').toLowerCase();
      if (aa === bb) return 0;
      return aa > bb ? 1 : -1;
    });
    var present_groups = Object.keys(detected_map || {});
    if (current && current !== 'Другое' && present_groups.indexOf(current) === -1) present_groups.push(current);

    var overrides = getGroupOverrides();
    var forced_groups = Object.keys(overrides || {}).map(function (k) {
      return overrides[k];
    }).map(function (x) {
      return (x || '').toString().trim();
    }).filter(function (x) {
      return x && x !== 'Другое';
    });

    var groups_custom = custom.concat(forced_groups).filter(function (x, idx, arr) {
      return x && x !== 'Другое' && arr.indexOf(x) === idx;
    }).filter(function (x) {
      return present_groups.indexOf(x) !== -1;
    });
    groups_custom.sort(function (a, b) {
      var aa = (a || '').toLowerCase();
      var bb = (b || '').toLowerCase();
      if (aa === bb) return 0;
      return aa > bb ? 1 : -1;
    });

    var groups_suggested = detected.filter(function (x) {
      return groups_custom.indexOf(x) === -1 && x !== 'Другое';
    });
    groups_suggested.sort(function (a, b) {
      var aa = (a || '').toLowerCase();
      var bb = (b || '').toLowerCase();
      if (aa === bb) return 0;
      return aa > bb ? 1 : -1;
    });

    function escapeHtml(str) {
      return (str || '').toString().replace(/[&<>"']/g, function (m) {
        return m === '&' ? '&amp;' : m === '<' ? '&lt;' : m === '>' ? '&gt;' : m === '"' ? '&quot;' : '&#39;';
      });
    }

    function groupTitle(label) {
      var checked = current === label ? '<span class="cub-collections__group-check">✓</span>' : '<span class="cub-collections__group-check"></span>';
      return '<div class="cub-collections__group-item">' + checked + '<span class="cub-collections__group-label">' + escapeHtml(label) + '</span></div>';
    }

    var items = [{
      title: (current ? '' : '✓ ') + 'Авто',
      value: ''
    }, {
      title: (current === 'Другое' ? '✓ ' : '') + 'В Другое',
      value: 'Другое'
    }, {
      title: '',
      separator: true
    }, {
      title: 'Создать группу',
      action: 'create'
    }];

    if (groups_custom.length) {
      items.push({
        title: 'Мои группы',
        separator: true
      });
      groups_custom.forEach(function (g) {
        items.push({
          title: groupTitle(g),
          value: g
        });
      });
    }

    if (groups_suggested.length) {
      items.push({
        title: 'Авто группы',
        separator: true
      });
      groups_suggested.forEach(function (g) {
        items.push({
          title: groupTitle(g),
          value: g
        });
      });
    }

    Lampa.Select.show({
      title: 'Группа',
      items: items,
      onSelect: function (item) {
        Lampa.Controller.toggle('content');
        if (!item) return;
        if (item.action === 'create') {
          Lampa.Input.edit({
            title: 'Название группы',
            free: true,
            nosave: true,
            nomic: true,
            value: ''
          }, function (name) {
            Lampa.Controller.toggle('content');
            var n = (name || '').toString().trim();
            if (!n) return;
            addCustomGroup(n);
            setGroupOverride(id, n);
            refreshActiveActivity();
          });
          return;
        }
        if (item.separator) return;
        if (item.value === undefined) return;
        setGroupOverride(id, item.value);
        refreshActiveActivity();
      },
      onBack: function () {
        Lampa.Controller.toggle('content');
      }
    });
  }

  function buildGroupedUserLines(base_data) {
    var settings = getSettings();
    var mode = settings.group_user || 'none';
    if (mode === 'none') return [base_data];
    if (!base_data || !Array.isArray(base_data.results)) return [base_data];

    var create_cards = base_data.results.filter(function (x) {
      return x && x.__create_collection;
    });
    var items = base_data.results.filter(function (x) {
      return !(x && x.__create_collection);
    });

    var groups = {};
    var model = mode === 'smart' ? buildKeywordModel(items) : null;

    items.forEach(function (it) {
      var title = getCollectionTitle(it);
      var forced = mode === 'smart' ? getGroupOverride(getCollectionId(it)) : '';
      var key;
      if (forced) key = forced;
      else if (mode === 'alpha') key = detectAlphaGroup(title);
      else {
        key = detectSmartGroup(title);
        if (key === 'Другое') {
          var dyn = detectDynamicGroup(title, model);
          if (dyn) key = dyn;
        }
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });

    var keys = Object.keys(groups);
    keys.sort(function (a, b) {
      if (mode === 'smart') {
        if (a === 'Другое' && b !== 'Другое') return 1;
        if (b === 'Другое' && a !== 'Другое') return -1;
      }
      var aa = (a || '').toLowerCase();
      var bb = (b || '').toLowerCase();
      if (aa === bb) return 0;
      return aa > bb ? 1 : -1;
    });

    var lines = [];

    if (create_cards.length) {
      var create_line = {};
      for (var k1 in base_data) if (Object.prototype.hasOwnProperty.call(base_data, k1)) create_line[k1] = base_data[k1];
      create_line.title = 'Создать коллекцию';
      create_line.results = create_cards.slice(0, 1);
      create_line.nomore = true;
      lines.push(create_line);
    }

    keys.forEach(function (k) {
      var line = {};
      for (var k2 in base_data) if (Object.prototype.hasOwnProperty.call(base_data, k2)) line[k2] = base_data[k2];
      line.title = 'Мои • ' + k;
      line.results = groups[k];
      line.nomore = true;
      lines.push(line);
    });

    return lines.length ? lines : [base_data];
  }

  function applyMainSettingsToLines(lines) {
    var settings = getSettings();
    if (!Array.isArray(lines)) return lines || [];

    if (settings.only_my) {
      return lines.filter(function (x) {
        return x && x.category === 'user';
      });
    }

    var hidden = Array.isArray(settings.hidden_categories) ? settings.hidden_categories : [];
    if (!hidden.length) return lines;

    return lines.filter(function (x) {
      return x && hidden.indexOf(x.category) === -1;
    });
  }

  function refreshActiveActivity() {
    try {
      Lampa.Activity.replace(Lampa.Activity.active());
    }
    catch (e) {}
  }

  function openCollectionsSettings() {
    var settings = getSettings();
    var sort_label = settings.sort_user === 'az' ? 'А-Я' : 'По умолчанию';
    var group_label = settings.group_user === 'smart' ? 'Умная' : settings.group_user === 'alpha' ? 'А-Я' : 'Выкл';
    var cover_label = settings.cover_view === 'stack' ? 'Стек' : 'Одна';

    Lampa.Select.show({
      title: 'Настройки коллекций',
      items: [{
        title: 'Только мои',
        checkbox: true,
        checked: !!settings.only_my,
        onCheck: function (elem) {
          try { Lampa.Select.close(); } catch (e) {}
          try { Lampa.Controller.toggle('content'); } catch (e) {}
          var next = getSettings();
          next.only_my = !!(elem && elem.checked);
          if (next.only_my) next.hidden_categories = [];
          setSettings(next);
          refreshActiveActivity();
        }
      }, {
        title: 'Сортировка моих: ' + sort_label,
        action: 'sort_user'
      }, {
        title: 'Группировка моих: ' + group_label,
        action: 'group_user'
      }, {
        title: 'Вид обложки: ' + cover_label,
        action: 'cover_view'
      }, {
        title: 'Скрыть/показать разделы',
        action: 'toggle_sections'
      }],
      onSelect: function (item) {
        if (item && item.checkbox) return;
        Lampa.Controller.toggle('content');
        if (!item || !item.action) return;

        if (item.action === 'sort_user') {
          var next2 = getSettings();
          next2.sort_user = next2.sort_user === 'az' ? 'default' : 'az';
          setSettings(next2);
          refreshActiveActivity();
          return;
        }

        if (item.action === 'group_user') {
          var current = getSettings();
          var options = [{
            title: 'Выкл',
            value: 'none'
          }, {
            title: 'Умная',
            value: 'smart'
          }, {
            title: 'А-Я',
            value: 'alpha'
          }];

          Lampa.Select.show({
            title: 'Группировка моих',
            nomark: true,
            items: options.map(function (x) {
              var active = current.group_user === x.value;
              return {
                title: x.title,
                value: x.value,
                selected: active,
                onDraw: function (item) {
                  if (active) item.addClass('cub-collections-select--active');
                }
              };
            }),
            onSelect: function (opt) {
              Lampa.Controller.toggle('content');
              if (!opt || !opt.value) return;
              var next = getSettings();
              next.group_user = opt.value;
              setSettings(next);
              refreshActiveActivity();
            },
            onBack: function () {
              Lampa.Controller.toggle('content');
            }
          });

          return;
        }

        if (item.action === 'cover_view') {
          var current2 = getSettings();
          var options2 = [{
            title: 'Одна',
            value: 'single'
          }, {
            title: 'Стек',
            value: 'stack'
          }];

          Lampa.Select.show({
            title: 'Вид обложки',
            nomark: true,
            items: options2.map(function (x) {
              var active = current2.cover_view === x.value;
              return {
                title: x.title,
                value: x.value,
                selected: active,
                onDraw: function (item) {
                  if (active) item.addClass('cub-collections-select--active');
                }
              };
            }),
            onSelect: function (opt2) {
              Lampa.Controller.toggle('content');
              if (!opt2 || !opt2.value) return;
              var next3 = getSettings();
              next3.cover_view = opt2.value;
              setSettings(next3);
              refreshActiveActivity();
            },
            onBack: function () {
              Lampa.Controller.toggle('content');
            }
          });

          return;
        }

        if (item.action === 'toggle_sections') {
          openSectionsSettings();
        }
      },
      onBack: function () {
        Lampa.Controller.toggle('content');
      }
    });
  }

  function openSectionsSettings() {
    var settings = getSettings();
    var hidden = Array.isArray(settings.hidden_categories) ? settings.hidden_categories : [];
    var list = collections.filter(function (x) {
      return x && x.hpu !== 'user';
    }).map(function (x) {
      var off = hidden.indexOf(x.hpu) !== -1;
      return {
        title: x.title,
        checkbox: true,
        checked: !off,
        hpu: x.hpu,
        onCheck: function (elem) {
          try { Lampa.Select.close(); } catch (e) {}
          try { Lampa.Controller.toggle('content'); } catch (e) {}
          if (!elem || !elem.hpu) return;
          var next = getSettings();
          next.only_my = false;
          var arr = Array.isArray(next.hidden_categories) ? next.hidden_categories.slice(0) : [];
          var idx = arr.indexOf(elem.hpu);
          if (elem.checked) {
            if (idx !== -1) arr.splice(idx, 1);
          } else {
            if (idx === -1) arr.push(elem.hpu);
          }
          next.hidden_categories = arr;
          setSettings(next);
          refreshActiveActivity();
        }
      };
    });

    Lampa.Select.show({
      title: 'Разделы',
      items: list,
      onSelect: function (item) {
        if (item && item.checkbox) return;
      },
      onBack: function () {
        Lampa.Controller.toggle('content');
      }
    });
  }

  function getAccount() {
    return Lampa.Storage.get('account', '{}') || {};
  }

  function getUserId(account) {
    if (!account) return '';
    return account.id || (account.profile && account.profile.user_id ? account.profile.user_id : '') || (account.profile && account.profile.id ? account.profile.id : '');
  }

  function header() {
    var user = getAccount();
    if (!user.token) return false;
    return {
      headers: {
        token: user.token,
        profile: getUserId(user)
      }
    };
  }

  function main(params, oncomplite, onerror) {
    var user = getAccount();
    var status = new Lampa.Status(collections.length);

    status.onComplite = function () {
      var keys = Object.keys(status.data);
      var sort = collections.map(function (a) {
        return a.hpu;
      });

      if (keys.length) {
        var fulldata = [];
        keys.sort(function (a, b) {
          return sort.indexOf(a) - sort.indexOf(b);
        });
        keys.forEach(function (key) {
          var data = status.data[key];
          data.title = collections.find(function (item) {
            return item.hpu == key;
          }).title;

          data.cardClass = function (elem, param) {
            return new Collection(elem, param);
          };
          if (key === 'user') {
            buildGroupedUserLines(data).forEach(function (x) {
              fulldata.push(x);
            });
          } else fulldata.push(data);
        });
        oncomplite(applyMainSettingsToLines(fulldata));
      } else onerror();
    };

    collections.forEach(function (item) {
      if (item.hpu == 'user' && !user.token) return status.error();
      var url = api_url + 'list?category=' + item.hpu;
      if (item.hpu == 'user') url = api_url + 'list?cid=' + getUserId(user);
      if (item.hpu == 'saved') url = api_url + 'saved-list';
      network.silent(url, function (data) {
        if (item.hpu == 'user' && user.token) {
          data.results = data.results || [];
          data.results.unshift({ __create_collection: true });
          data.results = applyUserSortToResults(data.results, true);
          try {
            window.cub_collections_last_user_items = data.results.filter(function (x) {
              return x && !x.__create_collection;
            });
          }
          catch (e) {}
        }
        data.collection = true;
        data.line_type = 'collection';
        data.category = item.hpu;
        if (item.hpu == 'user') data.cid = getUserId(user);
        status.append(item.hpu, data);
      }, status.error.bind(status), false, header());
    });
  }

  function collection(params, oncomplite, onerror) {
    var url = api_url + 'list?category=' + params.url + '&page=' + params.page;

    if (params.url.indexOf('user') >= 0) {
      url = api_url + 'list?cid=' + params.url.split('_').pop() + '&page=' + params.page;
    }

    network.silent(url, function (data) {
      if (params.url.indexOf('user') >= 0 && data && Array.isArray(data.results)) {
        data.results = applyUserSortToResults(data.results, false);
      }
      data.collection = true;
      data.total_pages = data.total_pages || 15;

      data.cardClass = function (elem, param) {
        return new Collection(elem, param);
      };

      oncomplite(data);
    }, onerror, false, header());
  }

  function liked(params, callaback) {
    network.silent(api_url + 'liked', callaback, function (a, e) {
      Lampa.Noty.show(network.errorDecode(a, e));
    }, params, header());
  }

  function full(params, oncomplite, onerror) {
    network.silent(api_url + 'view/' + params.url + '?page=' + params.page, function (data) {
      data.total_pages = data.total_pages || 15;
      oncomplite(data);
    }, onerror, false, header());
  }

  function status(params, callaback) {
    network.silent(api_url + 'save-status?id=' + params.id, callaback, function (a, e) {
      Lampa.Noty.show(network.errorDecode(a, e));
    }, false, header());
  }

  function save(params, callaback) {
    network.silent(api_url + 'save', callaback, function (a, e) {
      Lampa.Noty.show(network.errorDecode(a, e));
    }, {
      id: params.id
    }, header());
  }

  function createCollection(params, callaback, onerror) {
    network.silent(api_url + 'create', callaback, function (a, e) {
      if (onerror) onerror({ a: a, e: e });
    }, params, header());
  }

  function editCollection(params, callaback, onerror) {
    network.silent(api_url + 'change', callaback, function (a, e) {
      if (onerror) onerror({ a: a, e: e });
    }, params, header());
  }

  function deleteCollection(params, callaback, onerror) {
    network.silent(api_url + 'remove', callaback, function (a, e) {
      if (onerror) onerror({ a: a, e: e });
    }, params, header());
  }

  function coverCollection(params, callaback, onerror) {
    network.silent(api_url + 'background', callaback, function (a, e) {
      if (onerror) onerror({ a: a, e: e });
    }, params, header());
  }

  function addCardToCollection(params, callaback, onerror) {
    var endpoints = ['add', 'add-card', 'add_card'];
    var i = 0;

    var tryNext = function (last_error) {
      if (i >= endpoints.length) {
        if (onerror) onerror(last_error || {});
        return;
      }

      var endpoint = endpoints[i++];
      network.silent(api_url + endpoint, function (data) {
        var norm = normalizeResponse(data);
        if (norm && norm.ok) callaback(data);
        else tryNext({ res: data, endpoint: endpoint });
      }, function (a, e) {
        tryNext({ a: a, e: e, endpoint: endpoint });
      }, params, header());
    };

    tryNext();
  }

  function removeCardFromCollection(params, callaback, onerror) {
    var endpoints = ['remove-card', 'remove_card'];
    var i = 0;

    var tryNext = function (last_error) {
      if (i >= endpoints.length) {
        if (onerror) onerror(last_error || {});
        return;
      }

      var endpoint = endpoints[i++];
      network.silent(api_url + endpoint, function (data) {
        var norm = normalizeResponse(data);
        if (norm && norm.ok) callaback(data);
        else tryNext({ res: data, endpoint: endpoint });
      }, function (a, e) {
        tryNext({ a: a, e: e, endpoint: endpoint });
      }, params, header());
    };

    tryNext();
  }

  function clear() {
    network.clear();
  }

  var Api = {
    main: main,
    collection: collection,
    full: full,
    clear: clear,
    liked: liked,
    status: status,
    save: save,
    createCollection: createCollection,
    editCollection: editCollection,
    deleteCollection: deleteCollection,
    coverCollection: coverCollection,
    addCardToCollection: addCardToCollection,
    removeCardFromCollection: removeCardFromCollection
  };

  var cover_stack_cache = {};
  var cover_stack_inflight = {};
  var cover_stack_queue = [];
  var cover_stack_queue_active = 0;
  var cover_stack_queue_limit = 3;
  var cover_stack_prefetch_budget = 200;

  var stack_image_cache = {};
  var stack_image_inflight = {};
  var stack_image_queue = [];
  var stack_image_queue_active = 0;
  var stack_image_queue_limit = 4;

  function normalizeCoverPath(p) {
    return (p || '').toString().trim();
  }

  function pumpStackImageQueue() {
    while (stack_image_queue_active < stack_image_queue_limit) {
      var url = stack_image_queue.shift();
      if (!url) return;
      if (stack_image_cache[url]) continue;
      if (!stack_image_inflight[url]) continue;

      stack_image_queue_active++;

      (function (u) {
        var img = new Image();
        img.onload = function () {
          stack_image_cache[u] = 1;
          var subs = stack_image_inflight[u] || [];
          delete stack_image_inflight[u];
          stack_image_queue_active = Math.max(0, stack_image_queue_active - 1);
          subs.forEach(function (fn) {
            try { fn(true); } catch (e) {}
          });
          pumpStackImageQueue();
        };
        img.onerror = function () {
          var subs2 = stack_image_inflight[u] || [];
          delete stack_image_inflight[u];
          stack_image_queue_active = Math.max(0, stack_image_queue_active - 1);
          subs2.forEach(function (fn) {
            try { fn(false); } catch (e) {}
          });
          pumpStackImageQueue();
        };
        img.src = u;
      })(url);
    }
  }

  function requestStackImage(url, ondone) {
    var u = normalizeCoverPath(url);
    if (!u) return ondone(false);
    if (stack_image_cache[u]) return ondone(true);
    if (stack_image_inflight[u]) {
      stack_image_inflight[u].push(ondone);
      return;
    }
    stack_image_inflight[u] = [ondone];
    stack_image_queue.push(u);
    pumpStackImageQueue();
  }

  function setStackBackground(el, url, placeholder) {
    if (!el) return;
    var ph = placeholder || '';
    var u = normalizeCoverPath(url);
    if (!u) {
      el.style.backgroundImage = ph ? 'url("' + ph + '")' : '';
      return;
    }
    el.style.backgroundImage = 'url("' + u + '")';
  }

  function uniqCoverPaths(arr) {
    var out = [];
    var seen = {};
    (arr || []).forEach(function (x) {
      var k = normalizeCoverPath(x);
      if (!k) return;
      if (seen[k]) return;
      seen[k] = 1;
      out.push(k);
    });
    return out;
  }

  function pickStackCoverPathsFromFull(res, limit) {
    var list = [];
    var results = res && res.results && Array.isArray(res.results) ? res.results : [];
    for (var i = 0; i < results.length; i++) {
      var it = results[i] || {};
      var img = it.backdrop_path || it.poster_path || '';
      img = normalizeCoverPath(img);
      if (!img) continue;
      list.push(img);
      if (list.length >= (limit || 6)) break;
    }
    return uniqCoverPaths(list);
  }

  function pumpStackQueue() {
    while (cover_stack_queue_active < cover_stack_queue_limit) {
      var id = cover_stack_queue.shift();
      if (!id) return;
      if (cover_stack_cache[id]) continue;
      if (!cover_stack_inflight[id]) continue;

      cover_stack_queue_active++;

      (function (cid) {
        Api.full({ url: cid, page: 1 }, function (res) {
          var list = pickStackCoverPathsFromFull(res, 4);
          cover_stack_cache[cid] = list;
          var subs = cover_stack_inflight[cid] || [];
          delete cover_stack_inflight[cid];
          cover_stack_queue_active = Math.max(0, cover_stack_queue_active - 1);
          subs.forEach(function (fn) {
            try { fn(list); } catch (e) {}
          });
          pumpStackQueue();
        }, function () {
          cover_stack_cache[cid] = [];
          var subs2 = cover_stack_inflight[cid] || [];
          delete cover_stack_inflight[cid];
          cover_stack_queue_active = Math.max(0, cover_stack_queue_active - 1);
          subs2.forEach(function (fn) {
            try { fn([]); } catch (e) {}
          });
          pumpStackQueue();
        });
      })(id);
    }
  }

  function requestStackCovers(collection_id, ondone) {
    var id = normalizeCoverPath(collection_id);
    if (!id) return ondone([]);
    if (cover_stack_cache[id]) return ondone(cover_stack_cache[id]);
    if (cover_stack_inflight[id]) {
      cover_stack_inflight[id].push(ondone);
      return;
    }
    cover_stack_inflight[id] = [ondone];
    cover_stack_queue.push(id);
    pumpStackQueue();
  }

  function applyStackCoverToCard(card, collection_id, base_path) {
    if (!card || !card.item) return;
    var stack = card.stack;
    if (!stack) return;

    var base = normalizeCoverPath(base_path);
    var id = normalizeCoverPath(collection_id);
    var cached = id && cover_stack_cache[id] ? cover_stack_cache[id] : null;

    var list = cached && cached.length ? uniqCoverPaths(cached).slice(0, 8) : [];

    var main = base || (list.length ? list[0] : '');
    var tail = list.filter(function (p) {
      return normalizeCoverPath(p) && normalizeCoverPath(p) !== normalizeCoverPath(main);
    }).slice(0, 3);

    var placeholder = './img/img_load.svg';

    var main_el = card.stack_main || stack.querySelector('.cub-collection-card__stack-main');
    setStackBackground(main_el, main ? Lampa.Api.img(main, 'w500') : '', placeholder);

    var strips = card.stack_strips && card.stack_strips.length ? card.stack_strips : Array.prototype.slice.call(stack.querySelectorAll('.cub-collection-card__stack-strip') || []);
    for (var s = 0; s < (strips ? strips.length : 0); s++) {
      try {
        strips[s].style.display = 'none';
        strips[s].style.backgroundImage = '';
      }
      catch (e) {}
    }

    var filled = [];
    for (var j = 0; j < tail.length; j++) {
      var p = normalizeCoverPath(tail[j]);
      if (p) filled.push(p);
      if (filled.length >= 3) break;
    }

    for (var k = 0; k < filled.length && k < 3; k++) {
      var idx = 2 - k;
      var el = strips && strips[idx] ? strips[idx] : null;
      if (!el) continue;
      el.style.display = '';
      setStackBackground(el, Lampa.Api.img(filled[k], 'w200'), placeholder);
    }
  }

  function openCreateDialog(onDone) {
    var user = getAccount();
    if (!user.token) return Lampa.Noty.show('Нужно войти в аккаунт CUB');
    Lampa.Input.edit({
      title: 'Название коллекции',
      free: true,
      nosave: true,
      nomic: true,
      value: ''
    }, function (name) {
      if (!name) return Lampa.Controller.toggle('content');
      Lampa.Controller.toggle('content');
      Lampa.Loading.start(function () {
        Api.clear();
        Lampa.Loading.stop();
      });
      Api.createCollection({
        name: name
      }, function (res) {
        Lampa.Loading.stop();
        Lampa.Bell.push({
          text: 'Коллекция создана'
        });
        if (onDone) onDone(res && res.collection ? res.collection : null);
      }, function (err) {
        Lampa.Loading.stop();
        Lampa.Noty.show('Не удалось создать коллекцию');
        if (err && err.a && err.e) Lampa.Noty.show(network.errorDecode(err.a, err.e));
      });
    });
  }

  function openEditDialog(data, card) {
    var user = getAccount();
    if (!user.token) return Lampa.Noty.show('Нужно войти в аккаунт CUB');
    Lampa.Input.edit({
      title: 'Название коллекции',
      free: true,
      nosave: true,
      nomic: true,
      value: data.title || ''
    }, function (title) {
      if (!title) return Lampa.Controller.toggle('content');
      Lampa.Controller.toggle('content');
      Lampa.Loading.start(function () {
        Api.clear();
        Lampa.Loading.stop();
      });
      var cur_public = typeof data.public === 'number' ? data.public : 1;
      Api.editCollection({
        id: data.id,
        title: title,
        public: cur_public
      }, function () {
        Lampa.Loading.stop();
        data.title = title;
        if (card && card.item) card.item.find('.card__title').text(Lampa.Utils.capitalizeFirstLetter(title));
        Lampa.Bell.push({
          text: 'Коллекция обновлена'
        });
      }, function (err) {
        Lampa.Loading.stop();
        Lampa.Noty.show('Не удалось обновить коллекцию');
        if (err && err.a && err.e) Lampa.Noty.show(network.errorDecode(err.a, err.e));
      });
    });
  }

  function duplicateCollectionToMy(source) {
    var user = getAccount();
    if (!user || !user.token) return Lampa.Noty.show('Нужно войти в аккаунт CUB');

    var source_id = getCollectionId(source);
    if (!source_id) return Lampa.Noty.show('Не удалось определить коллекцию');

    Lampa.Loading.start(function () {
      Api.clear();
      Lampa.Loading.stop();
    });

    var all_items = [];
    var page = 1;
    var total = 1;
    var max_items = 400;
    var new_collection_id = null;

    var addNext = function (i) {
      if (!new_collection_id) {
        Lampa.Loading.stop();
        return;
      }
      if (i >= all_items.length) {
        Lampa.Loading.stop();
        Lampa.Bell.push({
          text: 'Коллекция скопирована'
        });
        refreshActiveActivity();
        return;
      }

      var payload = buildCollectionCardPayload(new_collection_id, all_items[i]);
      Api.addCardToCollection(payload, function () {
        addNext(i + 1);
      }, function () {
        addNext(i + 1);
      });
    };

    var afterCreate = function (new_col) {
      new_collection_id = new_col && (new_col.id || new_col.collection_id || new_col._id) ? (new_col.id || new_col.collection_id || new_col._id) : null;
      if (!new_collection_id) {
        Lampa.Loading.stop();
        return Lampa.Noty.show('Не удалось создать копию');
      }

      var afterCover = function () {
        addNext(0);
      };

      if (source && source.backdrop_path) {
        Api.coverCollection({
          id: new_collection_id,
          backdrop_path: source.backdrop_path
        }, function () {
          afterCover();
        }, function () {
          afterCover();
        });
      } else afterCover();
    };

    var createCopy = function () {
      var name = (source && source.title ? source.title : 'Коллекция') + ' (копия)';
      Api.createCollection({
        name: name
      }, function (res) {
        var col = res && res.collection ? res.collection : null;
        afterCreate(col);
      }, function () {
        Lampa.Loading.stop();
        Lampa.Noty.show('Не удалось создать коллекцию');
      });
    };

    var loadNextPage = function () {
      Api.full({
        url: source_id,
        page: page
      }, function (res) {
        var results = res && res.results && Array.isArray(res.results) ? res.results : [];
        total = parseInt(res && res.total_pages ? res.total_pages : total, 10) || total;

        if (results.length) all_items = all_items.concat(results);
        if (all_items.length > max_items) all_items = all_items.slice(0, max_items);

        if (!results.length) return createCopy();
        if (page >= total) return createCopy();
        if (page >= 60) return createCopy();
        if (all_items.length >= max_items) return createCopy();

        page++;
        loadNextPage();
      }, function () {
        Lampa.Loading.stop();
        Lampa.Noty.show('Не удалось загрузить коллекцию');
      });
    };

    loadNextPage();
  }

  function openDeleteDialog(data, card) {
    Lampa.Select.show({
      title: 'Удалить коллекцию?',
      items: [{
        title: 'Удалить',
        confirm: true
      }, {
        title: 'Отмена',
        confirm: false
      }],
      onSelect: function onSelect(item) {
        Lampa.Controller.toggle('content');
        if (!item.confirm) return;
        Lampa.Loading.start(function () {
          Api.clear();
          Lampa.Loading.stop();
        });
        Api.deleteCollection({
          id: data.id
        }, function () {
          Lampa.Loading.stop();
          if (card && card.item) card.item.remove();
          Lampa.Bell.push({
            text: 'Коллекция удалена'
          });
        }, function (err) {
          Lampa.Loading.stop();
          Lampa.Noty.show('Не удалось удалить коллекцию');
          if (err && err.a && err.e) Lampa.Noty.show(network.errorDecode(err.a, err.e));
        });
      },
      onBack: function onBack() {
        Lampa.Controller.toggle('content');
      }
    });
  }

  function openCoverDialog(data, card) {
    Lampa.Loading.start(function () {
      Api.clear();
      Lampa.Loading.stop();
    });
    Api.full({
      url: data.id,
      page: 1
    }, function (res) {
      Lampa.Loading.stop();
      var items = (res && res.results || []).slice(0, 30).map(function (it) {
        var img = it.backdrop_path || it.poster_path;
        return {
          title: it.title || it.name || ('ID ' + it.id),
          img: Lampa.Api.img(img, 'w300'),
          backdrop_path: img,
          template: 'cub_collections_cover_item'
        };
      }).filter(function (it) {
        return it.backdrop_path;
      });
      if (!items.length) return Lampa.Noty.show('Нет подходящих карточек для обложки');
      Lampa.Select.show({
        title: 'Выберите обложку',
        items: items,
        onSelect: function onSelect(item) {
          Lampa.Controller.toggle('content');
          Lampa.Loading.start(function () {
            Api.clear();
            Lampa.Loading.stop();
          });
          var payload = {
            id: data.id,
            backdrop_path: item.backdrop_path
          };
          Api.coverCollection(payload, function () {
            Lampa.Loading.stop();
            data.backdrop_path = item.backdrop_path;
            if (card && card.img) {
              card.img.src = Lampa.Api.img(item.backdrop_path, 'w500');
            }
            Lampa.Bell.push({
              text: 'Обложка обновлена'
            });
          }, function (err) {
            Lampa.Loading.stop();
            Lampa.Noty.show('Не удалось обновить обложку');
            if (err && err.a && err.e) Lampa.Noty.show(network.errorDecode(err.a, err.e));
          });
        },
        onBack: function onBack() {
          Lampa.Controller.toggle('content');
        }
      });
    }, function () {
      Lampa.Loading.stop();
      Lampa.Noty.show('Не удалось загрузить список');
    });
  }

  function openAddToCollectionDialog(card_data) {
    var user = getAccount();
    if (!user.token) return Lampa.Noty.show('Нужно войти в аккаунт CUB');

    var back_to = 'content';
    try {
      var enabled = Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;
      if (enabled && enabled.name) back_to = enabled.name;
    }
    catch (e) {}

    Lampa.Loading.start(function () {
      Api.clear();
      Lampa.Loading.stop();
    });

    loadAllUserCollections(getUserId(user), function (results) {
      Lampa.Loading.stop();

      var in_collections = getCardCollectionsFromCache(card_data);
      var items = (results || []).map(function (col) {
        var cid = getCollectionId(col);
        var checked = cid && in_collections.indexOf(String(cid)) !== -1;
        return {
          title: col.title || 'Без названия',
          checkbox: true,
          checked: !!checked,
          collection: col,
          onCheck: function (elem, item) {
            var id = getCollectionId(elem.collection);
            if (!id) return;

            var next_state = !!elem.checked;

            var rollback = function () {
              try {
                elem.checked = !next_state;
                item.toggleClass('selectbox-item--checked', elem.checked);
              }
              catch (e) {}
            };

            if (next_state) {
              addCardToCollectionInternal(id, card_data, function (ok) {
                if (!ok) rollback();
              });
            } else {
              removeCardFromCollectionInternal(id, card_data, null, function (ok) {
                if (!ok) rollback();
              });
            }
          }
        };
      });

      items.push({
        title: 'Создать новую коллекцию',
        create: true
      });

      Lampa.Select.show({
        title: 'В коллекцию',
        items: items,
        onSelect: function onSelect(item) {
          if (item && item.create) {
            Lampa.Controller.toggle(back_to);
            openCreateDialog(function () {
              try { openAddToCollectionDialog(card_data); } catch (e) {}
            });
          }
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(back_to);
        }
      });
    }, function () {
      Lampa.Loading.stop();
      Lampa.Noty.show('Не удалось загрузить коллекции');
    });
  }

  function loadAllUserCollections(user_id, ondone, onerror) {
    var uid = String(user_id || '');
    if (!uid) {
      if (onerror) onerror();
      return;
    }

    var page = 1;
    var total = 1;
    var out = [];
    var limit_pages = 60;

    var next = function () {
      Api.collection({ url: 'user_' + uid, page: page }, function (data) {
        var list = data && data.results && Array.isArray(data.results) ? data.results : [];
        out = out.concat(list);

        total = parseInt(data && data.total_pages ? data.total_pages : total, 10) || total;

        if (!list.length) return ondone(out);
        if (page >= total) return ondone(out);
        if (page >= limit_pages) return ondone(out);

        page++;
        next();
      }, function () {
        if (!out.length) {
          if (onerror) onerror();
        } else ondone(out);
      });
    };

    next();
  }

  function getCollectionId(collection) {
    if (!collection) return '';
    return collection.id || collection.collection_id || collection._id || '';
  }

  function openCollectionActionDialog(collection, card_data) {
    var collection_id = getCollectionId(collection);
    if (!collection_id) return;

    var in_collections = getCardCollectionsFromCache(card_data);
    var is_in_this = in_collections.indexOf(String(collection_id)) !== -1;

    var items = is_in_this ? [{
      title: 'Удалить',
      action: 'remove'
    }, {
      title: 'Добавить',
      action: 'add'
    }] : [{
      title: 'Добавить',
      action: 'add'
    }, {
      title: 'Удалить',
      action: 'remove'
    }];

    Lampa.Select.show({
      title: collection.title || 'Коллекция',
      items: items,
      onSelect: function onSelect(item) {
        Lampa.Controller.toggle('content');
        if (item.action == 'add') addCardToCollectionInternal(collection_id, card_data);
        if (item.action == 'remove') removeCardFromCollectionInternal(collection_id, card_data);
      },
      onBack: function onBack() {
        Lampa.Controller.toggle('content');
      }
    });
  }

  function getCardMethod(card_data) {
    if (!card_data) return 'movie';
    return card_data.method || card_data.media_type || (card_data.name || card_data.original_name || card_data.first_air_date ? 'tv' : 'movie');
  }

  function getCardId(card_data) {
    if (!card_data) return '';
    return card_data.card_id || card_data.tmdb_id || card_data.id || '';
  }

  function getCardSource(card_data) {
    if (!card_data) return 'tmdb';
    return card_data.source || card_data.card_source || 'tmdb';
  }

  function buildCollectionCardPayload(collection_id, card_data) {
    var collection = collection_id;
    var card_id = getCardId(card_data);
    var method = getCardMethod(card_data);
    var source = getCardSource(card_data);

    if (method !== 'movie' && method !== 'tv') {
      method = card_data && (card_data.name || card_data.original_name || card_data.first_air_date) ? 'tv' : 'movie';
    }

    return {
      id: collection,
      collection_id: collection,
      collection: collection,
      card_id: card_id,
      card: card_id,
      tmdb_id: card_id,
      source: source,
      card_source: source,
      type: String(method || 'movie'),
      method: String(method || 'movie'),
      card_type: String(method || 'movie'),
      card_method: String(method || 'movie')
    };
  }

  function getCardKey(card_data) {
    return getCardSource(card_data) + ':' + getCardMethod(card_data) + ':' + getCardId(card_data);
  }

  function getMembershipMap() {
    try {
      var raw = Lampa.Storage.get('cub_collections_membership', '{}') || '{}';
      if (typeof raw === 'string') return JSON.parse(raw || '{}') || {};
      return raw || {};
    }
    catch (e) {
      return {};
    }
  }

  function setMembershipMap(map) {
    try {
      Lampa.Storage.set('cub_collections_membership', map || {});
    }
    catch (e) {}
  }

  function getCardCollectionsFromCache(card_data) {
    var key = getCardKey(card_data);
    var map = getMembershipMap();
    var ids = map[key];
    return Array.isArray(ids) ? ids : [];
  }

  function setCardInCollectionCache(card_data, collection_id, in_collection) {
    if (!collection_id) return;
    var key = getCardKey(card_data);
    if (!key) return;

    var map = getMembershipMap();
    var list = Array.isArray(map[key]) ? map[key] : [];
    var cid = String(collection_id);

    if (in_collection) {
      if (list.indexOf(cid) === -1) list.push(cid);
    } else {
      list = list.filter(function (x) {
        return String(x) !== cid;
      });
    }

    if (list.length) map[key] = list;
    else delete map[key];

    setMembershipMap(map);
    refreshFullCollectionsButton();
  }

  function normalizeResponse(res) {
    if (res === undefined || res === null) return { ok: true, data: res };

    var data = res;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return { ok: false, data: res, message: String(res) };
      }
    }

    if (!data || typeof data !== 'object') return { ok: false, data: res, message: 'Некорректный ответ сервера' };

    var code = data.code !== undefined ? Number(data.code) : NaN;
    if (!isNaN(code) && code >= 300) return { ok: false, data: data, message: data.text || data.message || ('Ошибка [' + data.code + ']') };

    if (data.success === false) return { ok: false, data: data, message: data.message || data.text || 'Ошибка' };
    if (data.result === false) return { ok: false, data: data, message: data.message || data.text || 'Ошибка' };
    if (data.status === 'error') return { ok: false, data: data, message: data.message || data.text || 'Ошибка' };
    if (data.error) return { ok: false, data: data, message: (data.error.message || data.error.text || data.error) || data.message || 'Ошибка' };

    return { ok: true, data: data };
  }

  function showApiError(fallback_text, err, res) {
    var decoded = '';
    try {
      if (err && err.a && err.e) decoded = network.errorDecode(err.a, err.e);
    } catch (e) {}

    var norm = res !== undefined ? normalizeResponse(res) : null;
    var msg = decoded || (norm && !norm.ok ? norm.message : '') || fallback_text;

    if (msg) Lampa.Noty.show(msg);
    else Lampa.Noty.show(fallback_text);
  }

  var full_button_state = {
    key: '',
    button: null
  };

  function refreshFullCollectionsButton() {
    if (!full_button_state.button) return;
    var map = getMembershipMap();
    var ids = map[full_button_state.key];
    var in_any = Array.isArray(ids) && ids.length > 0;

    try {
      full_button_state.button.toggleClass('button--collections--active', in_any);
      full_button_state.button.find('span').text(in_any ? 'В коллекции' : 'В коллекцию');
    } catch (e) {}
  }

  function bindFullCollectionsButton(btn, card_data) {
    full_button_state.key = getCardKey(card_data);
    full_button_state.button = btn;
    refreshFullCollectionsButton();
    discoverMembershipForCard(card_data);
  }

  var membership_discovery_seq = 0;

  function discoverMembershipForCard(card_data) {
    var user = getAccount();
    if (!user || !user.token) return;

    var key = getCardKey(card_data);
    if (!key) return;

    var map = getMembershipMap();
    if (map[key]) return;

    var seq = ++membership_discovery_seq;
    var target_id = String(getCardId(card_data) || '');
    if (!target_id) return;

    Api.collection({ url: 'user_' + getUserId(user), page: 1 }, function (data) {
      if (seq !== membership_discovery_seq) return;

      var cols = (data && data.results ? data.results : []).filter(function (col) {
        return col && getCollectionId(col) && !col.__create_collection;
      });

      var i = 0;
      var checkNext = function () {
        if (seq !== membership_discovery_seq) return;
        if (i >= cols.length) return;

        var col = cols[i++];
        var collection_id = getCollectionId(col);
        Api.full({ url: collection_id, page: 1 }, function (view) {
          if (seq !== membership_discovery_seq) return;

          var results = view && view.results ? view.results : [];
          var found = results.some(function (x) {
            return String(getCardId(x) || '') === target_id;
          });

          if (found) setCardInCollectionCache(card_data, collection_id, true);
          else checkNext();
        }, function () {
          checkNext();
        });
      };

      checkNext();
    }, function () {});
  }

  function addCardToCollectionInternal(collection_id, card_data, onResult) {
    var card_id = getCardId(card_data);
    if (!collection_id) return Lampa.Noty.show('Не выбрана коллекция');
    if (!card_id) return Lampa.Noty.show('Не удалось определить карточку');

    Lampa.Loading.start(function () {
      Api.clear();
      Lampa.Loading.stop();
    });
    Api.addCardToCollection(buildCollectionCardPayload(collection_id, card_data), function (res) {
      Lampa.Loading.stop();
      var norm = normalizeResponse(res);
      if (!norm.ok) {
        if (onResult) onResult(false);
        return showApiError('Не удалось добавить в коллекцию', null, res);
      }
      setCardInCollectionCache(card_data, collection_id, true);
      Lampa.Bell.push({
        text: 'Добавлено в коллекцию'
      });
      if (onResult) onResult(true);
    }, function (err) {
      Lampa.Loading.stop();
      showApiError('Не удалось добавить в коллекцию', err);
      if (onResult) onResult(false);
    });
  }

  function removeCardFromCollectionInternal(collection_id, card_data, onDone, onResult) {
    var card_id = getCardId(card_data);
    if (!collection_id) return Lampa.Noty.show('Не выбрана коллекция');
    if (!card_id) return Lampa.Noty.show('Не удалось определить карточку');

    Lampa.Loading.start(function () {
      Api.clear();
      Lampa.Loading.stop();
    });
    Api.removeCardFromCollection(buildCollectionCardPayload(collection_id, card_data), function (res) {
      Lampa.Loading.stop();
      var norm = normalizeResponse(res);
      if (!norm.ok) {
        if (onResult) onResult(false);
        return showApiError('Не удалось удалить из коллекции', null, res);
      }
      setCardInCollectionCache(card_data, collection_id, false);
      Lampa.Bell.push({
        text: 'Удалено из коллекции'
      });
      if (onDone) onDone();
      if (onResult) onResult(true);
    }, function (err) {
      Lampa.Loading.stop();
      showApiError('Не удалось удалить из коллекции', err);
      if (onResult) onResult(false);
    });
  }

  function component$2(object) {
    var comp = new Lampa.InteractionMain(object);

    comp.create = function () {
      var _this = this;

      this.activity.loader(true);
      Api.main(object, function (data) {
        _this.build(data);
      }, this.empty.bind(this));
      return this.render();
    };

    comp.onMore = function (data) {
      var cid = data && data.cid ? data.cid : getUserId(getAccount());
      Lampa.Activity.push({
        url: data.category + (data.category == 'user' ? '_' + cid : ''),
        title: data.title,
        component: 'cub_collections_collection',
        page: 1
      });
    };

    return comp;
  }

  function component$1(object) {
    var comp = new Lampa.InteractionCategory(object);
    var current_collection_id = object.url;
    var current_collection_data = object.collection;

    comp.create = function () {
      var _this = this;

      Api.full(object, function (data) {
        _this.build(data);

        comp.render().find('.category-full').addClass('mapping--grid cols--6');
      }, this.empty.bind(this));
    };

    comp.nextPageReuest = function (object, resolve, reject) {
      Api.full(object, resolve.bind(comp), reject.bind(comp));
    };

    comp.cardRender = function (object, element, card) {
      if (current_collection_id) setCardInCollectionCache(element, current_collection_id, true);
      var user = getAccount();
      var is_owner = user && getUserId(user) && current_collection_data && current_collection_data.cid == getUserId(user);

      var original_onMenuShow = card.onMenuShow;
      
      card.onMenuShow = function (menu_items) {
        if (original_onMenuShow) original_onMenuShow(menu_items);
        
        if (is_owner && current_collection_id) {
          menu_items.unshift({
            title: 'Удалить из коллекции',
            onSelect: function () {
              removeCardFromCollectionInternal(current_collection_id, element, function () {
                try {
                  var node = card.render(true);
                  if (node) node.remove();
                }
                catch (e) {}
              });
            }
          });
          menu_items.unshift({
            title: Lampa.Lang.translate('more'),
            separator: true
          });
        }
      };

      card.onEnter = function () {
        var method = getCardMethod(element);
        var id = getCardId(element);

        Lampa.Activity.push({
          url: element.url || id,
          title: element.title || element.name,
          component: 'full',
          id: id,
          method: method,
          card: element,
          source: getCardSource(element) || object.source
        });
      };
    };

    return comp;
  }

  function component(object) {
    var comp = new Lampa.InteractionCategory(object);
    var user = getAccount();
    var is_own = user && getUserId(user) && (object.url + '').indexOf('user') >= 0 && (object.url + '').split('_').pop() == getUserId(user);

    comp.create = function () {
      Api.collection(object, function (data) {
        comp.build(data);
      }, this.empty.bind(this));
    };

    comp.nextPageReuest = function (object, resolve, reject) {
      Api.collection(object, resolve.bind(comp), reject.bind(comp));
    };

    comp.cardRender = function (object, element, card) {
      card.onMenu = false;

      if (element && element.__create_collection) {
        card.onEnter = function () {
          openCreateDialog(function () {
            Lampa.Activity.replace({
              url: object.url,
              title: object.title,
              component: 'cub_collections_collection',
              page: 1
            });
          });
        };
        return;
      }

      card.onEnter = function () {
        Lampa.Activity.push({
          url: element.id,
          title: element.title,
          component: 'cub_collections_view',
          page: 1
        });
      };
    };

    return comp;
  }

  function startPlugin() {
    var manifest = {
      type: 'video',
      version: '1.1.2',
      name: 'Коллекции',
      description: '',
      component: 'cub_collections',
      onContextMenu: true,
      onContextLauch: function (card_data) {
        openAddToCollectionDialog(card_data);
      }
    };
    Lampa.Manifest.plugins = manifest;
    Lampa.Component.add('cub_collections_main', component$2);
    Lampa.Component.add('cub_collections_collection', component);
    Lampa.Component.add('cub_collections_view', component$1);
    Lampa.Template.add('cub_collections_cover_item', '<div class="selectbox-item selector cub-collections-cover-item"><div class="cub-collections-cover-item__img" style="background-image:url({img})"></div><div class="selectbox-item__title">{title}</div></div>');
    Lampa.Template.add('cub_collection', '<div class="card cub-collection-card selector layer--visible layer--render card--collection"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="cub-collection-card__head"><div class="cub-collection-card__items"></div><div class="cub-collection-card__date"></div></div><div class="cub-collection-card__bottom"><div class="cub-collection-card__views"></div><div class="cub-collection-card__user"><div class="cub-collection-card__user-icon"><img src="./img/img_load.svg"></div><div class="cub-collection-card__user-name"></div></div><div class="cub-collection-card__liked"><div class="full-review__like-icon"><svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.0131 9.05733H3.75799C2.76183 9.05903 1.80696 9.45551 1.10257 10.1599C0.39818 10.8643 0.00170332 11.8192 0 12.8153V23.0778C0.00170332 24.074 0.39818 25.0289 1.10257 25.7333C1.80696 26.4377 2.76183 26.8341 3.75799 26.8358H23.394C24.2758 26.8354 25.1294 26.5252 25.8056 25.9594C26.4819 25.3936 26.9379 24.6082 27.094 23.7403L28.9408 13.4821C29.038 12.9408 29.0153 12.3849 28.8743 11.8534C28.7333 11.3218 28.4774 10.8277 28.1247 10.4058C27.7721 9.98391 27.3311 9.6445 26.833 9.41151C26.3349 9.17852 25.7918 9.05762 25.2419 9.05733H18.5043V3.63509C18.5044 2.90115 18.2824 2.18438 17.8673 1.57908C17.4522 0.973783 16.8636 0.508329 16.179 0.243966C15.4943 -0.0203976 14.7456 -0.0712821 14.0315 0.0980078C13.3173 0.267298 12.6712 0.648829 12.178 1.1924L12.1737 1.19669C10.5632 2.98979 9.70849 5.78681 8.79584 7.79142C8.6423 8.14964 8.45537 8.49259 8.23751 8.81574C8.16898 8.90222 8.09358 8.98301 8.01203 9.05733H8.0131ZM6.54963 23.6147H3.75799C3.68706 23.6147 3.61686 23.6005 3.55156 23.5728C3.48626 23.5452 3.42719 23.5046 3.37789 23.4536C3.32786 23.4047 3.28819 23.3463 3.26126 23.2817C3.23433 23.217 3.22045 23.1468 3.22045 23.0778V12.8153C3.22045 12.6768 3.24805 12.5396 3.30209 12.4124C3.35613 12.2852 3.43564 12.1705 3.53638 12.0746C3.63712 11.9787 3.75732 11.9035 3.89118 11.8536C4.02504 11.8038 4.17052 11.7807 4.31673 11.7859H6.54963V23.6147ZM24.9551 23.0778C24.9551 23.2163 24.9275 23.3535 24.8735 23.4807C24.8194 23.6079 24.7399 23.7226 24.6392 23.8185C24.5384 23.9144 24.4182 23.9896 24.2844 24.0394C24.1505 24.0893 24.005 24.1124 23.8588 24.1072H9.87479V12.8153H18.5043V18.0188C18.5043 18.1573 18.4767 18.2945 18.4227 18.4217C18.3686 18.5489 18.2891 18.6636 18.1884 18.7595C18.0876 18.8554 17.9674 18.9306 17.8336 18.9805C17.6997 19.0303 17.5542 19.0534 17.408 19.0482V22.7064C17.408 22.7773 17.3938 22.8475 17.3662 22.9128C17.3386 22.9781 17.298 23.0372 17.247 23.0865C17.196 23.1358 17.1376 23.1755 17.0729 23.2024C17.0082 23.2293 16.938 23.2432 16.8671 23.2432H10.7074C10.569 23.2432 10.4317 23.2156 10.3045 23.1616C10.1773 23.1075 10.0626 23.028 9.96673 22.9273C9.8708 22.8265 9.79561 22.7063 9.74577 22.5725C9.69593 22.4386 9.67284 22.2931 9.67802 22.1469V12.8153H8.0131C8.0131 12.6768 8.0407 12.5396 8.09474 12.4124C8.14878 12.2852 8.22829 12.1705 8.32903 12.0746C8.42977 11.9787 8.54997 11.9035 8.68383 11.8536C8.81769 11.8038 8.96317 11.7807 9.10938 11.7859H10.9419C11.6851 10.188 12.391 8.00569 13.5842 6.75063C13.8806 6.42349 14.2597 6.24027 14.65 6.21986C15.0403 6.19945 15.4314 6.34393 15.7481 6.62702C16.0648 6.91011 16.2882 7.3189 16.3789 7.77865V11.7859H25.2419C25.3804 11.7859 25.5177 11.8135 25.6449 11.8675C25.7721 11.9216 25.8868 12.0011 25.9827 12.1018C26.0786 12.2026 26.1538 12.3228 26.2036 12.4566C26.2535 12.5905 26.2766 12.736 26.2714 12.8822L24.4246 23.1404C24.3832 23.367 24.2625 23.5648 24.0889 23.7058C23.9153 23.8468 23.6995 23.9225 23.475 23.9187H24.9551V23.0778Z" fill="currentColor"></path></svg></div><div class="full-review__like-counter"></div></div></div></div><div class="card__title"></div></div>');
    var style = '<style>.cub-collection-card__head{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;padding:.5em 1em;color:#fff;font-size:1em;font-weight:500;position:absolute;top:0;left:0;width:100%}.cub-collection-card__bottom{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;padding:.5em 1em;background-color:rgba(0,0,0,0.5);color:#fff;font-size:1em;font-weight:400;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;position:absolute;bottom:0;left:0;width:100%}.cub-collection-card__liked{padding-left:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.cub-collection-card__liked .full-review__like-icon{margin-top:-0.2em}.cub-collection-card__liked .full-review__like-counter{font-weight:600}.cub-collection-card__items{background:rgba(0,0,0,0.5);padding:.3em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em}.cub-collection-card__user{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.cub-collection-card__user-name{padding:0 1em;margin-left:auto}.cub-collection-card__user-icon{width:2em;height:2em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;background-color:#fff;border:.2em solid #fff}.cub-collection-card__user-icon img{width:100%;height:100%;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;opacity:0}.cub-collection-card__user-icon.loaded img{opacity:1}.category-full .cub-collection-card{padding-bottom:2em}body.glass--style .cub-collection-card .cub-collection-card__head,body.glass--style .cub-collection-card .cub-collection-card__bottom{background-color: rgba(0,0,0,0.2);background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0.3)),to(rgba(0,0,0,0.1)));background-image:-webkit-linear-gradient(top,rgba(0,0,0,0.3),rgba(0,0,0,0.1));background-image:-moz-linear-gradient(top,rgba(0,0,0,0.3),rgba(0,0,0,0.1));background-image:-o-linear-gradient(top,rgba(0,0,0,0.3),rgba(0,0,0,0.1));background-image:-o-linear-gradient(top,rgba(0,0,0,0.3),rgba(0,0,0,0.1));background-image:linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0.1))}.full--opened .cub-collection-card .card__view:after{display:none}.cub-collection-card img{-o-object-fit:cover;object-fit:cover}</style>';
    style = style.replace('</style>', '.cub-collection-card--stack .card__img{opacity:0 !important}.cub-collection-card--stack .card__view{position:relative}.cub-collection-card__stack{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:1em;display:grid;grid-template-rows:1fr 3fr;gap:.18em;padding:.18em;background:rgba(0,0,0,0.35)}.cub-collection-card__stack-main{grid-row:2;border-radius:.85em;background-size:cover;background-position:center;background-color:#3E3E3E}.cub-collection-card__stack-tail{grid-row:1;display:grid;grid-template-rows:repeat(3,1fr);gap:.18em}.cub-collection-card__stack-tail-item{border-radius:0;background-size:cover;background-position:center;background-color:#3E3E3E}.cub-collection-card__stack-tail-item:first-child{border-radius:.85em .85em 0 0}.cub-collection-card__head,.cub-collection-card__bottom{z-index:2}.cub-collection-card--create.card--collection{flex:0 0 12.5% !important;width:12.5% !important;min-width:12.5% !important;max-width:12.5% !important}.cub-collection-card--create.card--collection .card__view{padding-bottom:120% !important}.cub-collection-card--create .card__view{position:relative}.cub-collection-card--create .card__img{opacity:1 !important;object-fit:contain !important}body.size--bigger .cub-collection-card--create.card--collection{flex-basis:16.666% !important;width:16.666% !important;min-width:16.666% !important;max-width:16.666% !important}.cub-collection-card--create .cub-collection-card__bottom{position:absolute}.cub-collection-card--create .cub-collection-card__bottom>:not(.cub-collection-create__bottom-text){visibility:hidden}.cub-collection-card--create .cub-collection-create__bottom-text{visibility:visible;position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center}.cub-collection-create__center{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#fff}.cub-collection-create__center:before{content:"";position:absolute;width:4.2em;height:4.2em;border-radius:50%;background:rgba(0,0,0,0.55);box-shadow:0 .35em .9em rgba(0,0,0,0.55),inset 0 0 0 .18em rgba(255,255,255,0.12)}.cub-collection-create__center svg{position:relative;z-index:1;width:2.6em;height:2.6em;filter:drop-shadow(0 0 .25em rgba(0,0,0,0.9))}.cub-collection-card--create .card__type{display:none !important}.button--collections--active{color:#fff}.button--collections .collections-ico__fill{opacity:0}.button--collections .collections-ico__stroke{opacity:1}.button--collections--active .collections-ico__fill{opacity:1}.button--collections--active .collections-ico__stroke{opacity:0}.button--collections .collections-ico__check{display:none}.button--collections--active .collections-ico__plus{display:none}.button--collections--active .collections-ico__check{display:block}.cub-collections-cover-item{display:flex;align-items:center}.cub-collections-cover-item__img{width:5.6em;height:3.2em;border-radius:0.4em;background-size:cover;background-position:center;flex:0 0 auto;margin-right:1em}.cub-collections__group-item{display:flex;align-items:flex-start;gap:.6em;white-space:normal}.cub-collections__group-check{display:inline-block;min-width:1.2em;flex:0 0 1.2em}.cub-collections__group-label{display:block;white-space:normal;overflow:visible;line-height:1.2}</style>');
    style = style.replace('</style>', '.cub-collection-card__stack{display:block !important;padding:0 !important;background:transparent !important;--stack-radius:1em;--stack-strip-h:44%;--stack-step:8.5%}.cub-collection-card__stack-main{position:absolute !important;left:0 !important;right:0 !important;bottom:0 !important;top:calc(var(--stack-step) + var(--stack-step) + var(--stack-step)) !important;z-index:4 !important;border-radius:var(--stack-radius) !important;overflow:hidden !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;background-color:#3E3E3E !important;box-shadow:0 .55em 1.25em rgba(0,0,0,0.55),0 .14em .4em rgba(0,0,0,0.32),inset 0 0 0 1px rgba(255,255,255,0.08)}.cub-collection-card__stack-main:after{content:\"\";position:absolute;left:0;right:0;top:0;bottom:0;border-radius:inherit;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.18),rgba(0,0,0,0) 28%,rgba(0,0,0,0.28))}.cub-collection-card__stack-strip{position:absolute !important;left:0 !important;right:0 !important;height:var(--stack-strip-h) !important;z-index:1 !important;border-radius:var(--stack-radius) var(--stack-radius) 0 0 !important;overflow:hidden !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;background-color:#3E3E3E !important;box-shadow:0 .4em .95em rgba(0,0,0,0.5),0 .1em .25em rgba(0,0,0,0.28),inset 0 0 0 1px rgba(255,255,255,0.07)}.cub-collection-card__stack-strip:after{content:\"\";position:absolute;left:0;right:0;top:0;bottom:0;border-radius:inherit;pointer-events:none;background:linear-gradient(to bottom,rgba(255,255,255,0.10),rgba(0,0,0,0.10) 58%,rgba(0,0,0,0.40))}.cub-collection-card__stack-strip--1{top:0 !important;z-index:1 !important}.cub-collection-card__stack-strip--2{top:var(--stack-step) !important;z-index:2 !important}.cub-collection-card__stack-strip--3{top:calc(var(--stack-step) + var(--stack-step)) !important;z-index:3 !important}.cub-collection-card__head,.cub-collection-card__bottom{z-index:6 !important}</style>');
    style = style.replace('</style>', '.cub-collection-card__head{display:block !important;position:absolute !important;top:0 !important;left:0 !important;width:100% !important;height:0 !important;padding:0 !important;pointer-events:none !important}.cub-collection-card__items{position:absolute !important;top:0 !important;left:0 !important;background-color:rgba(0,0,0,0.5) !important;padding:.35em .65em !important;border-radius:1em !important;font-weight:600 !important}.cub-collection-card__date{position:absolute !important;top:0 !important;right:0 !important;background-color:rgba(0,0,0,0.5) !important;padding:.35em .65em !important;border-radius:1em !important;font-weight:500 !important}</style>');
    style = style.replace('</style>', '.cub-collection-card--create .card__img{opacity:0 !important}.cub-collection-card--create .card__view{background:transparent;border-radius:1em;overflow:hidden;position:relative}.cub-collection-create__bgicon{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:1;color:rgba(255,255,255,0.92)}.cub-collection-create__bgicon svg{display:block;width:86%;height:86%;max-width:240px;max-height:240px}.cub-collection-card--create .cub-collection-create__center{display:none !important}@media screen and (max-width:480px){.cub-collection-card--create.card--collection{flex:0 0 25% !important;width:25% !important;min-width:25% !important;max-width:25% !important}.cub-collection-card--create.card--collection .card__view{padding-bottom:120% !important}.cub-collection-create__bgicon svg{width:92%;height:92%;max-width:260px;max-height:260px}}.cub-collection-card--create.selector.focus .card__view,.cub-collection-card--create.selector.hover .card__view{box-shadow:0 0 0 0.35em rgba(255,255,255,0.95)}</style>');
    style = style.replace('</style>', '.selectbox-item.cub-collections-select--active{background:#fff !important;color:#000 !important}.selectbox-item.cub-collections-select--active.focus{background:#fff !important;color:#000 !important}</style>');
    Lampa.Template.add('cub_collections_css', style);
    $('body').append(Lampa.Template.get('cub_collections_css', {}, true));

    function add() {
      var button = $('<li class="menu__item selector"><div class="menu__ico"><svg width="191" height="239" viewBox="0 0 191 239" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M35.3438 35.3414V26.7477C35.3438 19.9156 38.0594 13.3543 42.8934 8.51604C47.7297 3.68251 54.2874 0.967027 61.125 0.966431H164.25C171.086 0.966431 177.643 3.68206 182.482 8.51604C187.315 13.3524 190.031 19.91 190.031 26.7477V186.471C190.031 189.87 189.022 193.192 187.133 196.018C185.245 198.844 182.561 201.046 179.421 202.347C176.28 203.647 172.825 203.988 169.492 203.325C166.158 202.662 163.096 201.026 160.692 198.623L155.656 193.587V220.846C155.656 224.245 154.647 227.567 152.758 230.393C150.87 233.219 148.186 235.421 145.046 236.722C141.905 238.022 138.45 238.363 135.117 237.7C131.783 237.037 128.721 235.401 126.317 232.998L78.3125 184.993L30.3078 232.998C27.9041 235.401 24.8419 237.037 21.5084 237.7C18.1748 238.363 14.7195 238.022 11.5794 236.722C8.43922 235.421 5.75517 233.219 3.86654 230.393C1.9779 227.567 0.969476 224.245 0.96875 220.846V61.1227C0.96875 54.2906 3.68437 47.7293 8.51836 42.891C13.3547 38.0575 19.9124 35.342 26.75 35.3414H35.3438ZM138.469 220.846V61.1227C138.469 58.8435 137.563 56.6576 135.952 55.046C134.34 53.4343 132.154 52.5289 129.875 52.5289H26.75C24.4708 52.5289 22.2849 53.4343 20.6733 55.046C19.0617 56.6576 18.1562 58.8435 18.1562 61.1227V220.846L66.1609 172.841C69.3841 169.619 73.755 167.809 78.3125 167.809C82.87 167.809 87.2409 169.619 90.4641 172.841L138.469 220.846ZM155.656 169.284L172.844 186.471V26.7477C172.844 24.4685 171.938 22.2826 170.327 20.671C168.715 19.0593 166.529 18.1539 164.25 18.1539H61.125C58.8458 18.1539 56.6599 19.0593 55.0483 20.671C53.4367 22.2826 52.5312 24.4685 52.5312 26.7477V35.3414H129.875C136.711 35.3414 143.268 38.0571 148.107 42.891C152.94 47.7274 155.656 54.285 155.656 61.1227V169.284Z" fill="currentColor"></path></svg></div><div class="menu__text">Коллекции</div></li>');
      button.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: manifest.name,
          component: 'cub_collections_main',
          page: 1
        });
      });
      $('.menu .menu__list').eq(0).append(button);
    }

    if (window.appready) add();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') add();
      });
    }

    function initHeadSettingsButton() {
      if (window.cub_collections_head_settings_button) return;

      var tryAdd = function () {
        if (!Lampa.Head || !Lampa.Head.addIcon || !Lampa.Head.render) return false;
        if (!Lampa.Head.render(true)) return false;

        try {
          var icon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M19.14,12.94c.04-.31,.06-.63,.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14,.23-.41,.12-.61l-1.92-3.32c-.11-.2-.36-.28-.57-.2l-2.39,.96c-.5-.38-1.04-.7-1.64-.94l-.36-2.54c-.03-.22-.22-.38-.44-.38h-3.84c-.22,0-.41,.16-.44,.38l-.36,2.54c-.6,.24-1.14,.56-1.64,.94l-2.39-.96c-.21-.08-.46,0-.57,.2l-1.92,3.32c-.11,.2-.06,.47,.12,.61l2.03,1.58c-.04,.31-.06,.63-.06,.94s.02,.63,.06,.94l-2.03,1.58c-.18,.14,.23,.41,.12,.61l1.92,3.32c.11,.2,.36,.28,.57,.2l2.39-.96c.5,.38,1.04,.7,1.64,.94l.36,2.54c.03,.22,.22,.38,.44,.38h3.84c.22,0,.41-.16,.44-.38l.36-2.54c.6-.24,1.14-.56,1.64-.94l2.39,.96c.21,.08,.46,0,.57-.2l1.92-3.32c.11-.2,.06-.47-.12-.61l-2.03-1.58Zm-7.14,2.56c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5,3.5,1.57,3.5,3.5-1.57,3.5-3.5,3.5Z"/></svg>';
          var btn = Lampa.Head.addIcon(icon, function () {
            openCollectionsSettings();
          });
          btn.addClass('open--collections-settings');
          window.cub_collections_head_settings_button = btn;

          var update = function () {
            var act = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
            var comp = act && act.component ? act.component : '';
            if (comp === 'cub_collections_main' || comp === 'cub_collections_collection' || comp === 'cub_collections_view') btn.show();
            else btn.hide();
          };

          update();
          Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') update();
          });

          return true;
        }
        catch (e) {
          return false;
        }
      };

      var attempts = 0;
      var loop = function () {
        if (window.cub_collections_head_settings_button) return;
        if (tryAdd()) return;
        attempts++;
        if (attempts < 50) setTimeout(loop, 200);
      };

      loop();
    }

    if (window.appready) initHeadSettingsButton();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') initHeadSettingsButton();
      });
    }

    function initGlobalSearchCollectionsSource() {
      if (window.cub_collections_global_search_source_added) return;
      if (!Lampa.Search || !Lampa.Search.addSource) return;

      window.cub_collections_global_search_source_added = true;

      var search_network = new Lampa.Reguest();
      var api_base = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/collections/';

      function normalizeSearchText(text) {
        return (text || '')
          .toString()
          .toLowerCase()
          .replace(/ё/g, 'е')
          .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
          .replace(/[^0-9a-zа-я]+/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      function tokenizeSearchText(text) {
        var norm = normalizeSearchText(text);
        if (!norm) return [];
        return norm.split(' ').filter(Boolean);
      }

      function mapCollectionToCard(col) {
        var img = col && (col.backdrop_path || col.poster_path) ? (col.backdrop_path || col.poster_path) : '';
        return {
          id: col && col.id ? col.id : '',
          title: getCollectionTitle(col) || 'Без названия',
          backdrop_path: img,
          poster_path: img,
          _collection: col,
          params: {
            style: { name: 'collection' }
          }
        };
      }

      function searchCollections(params, oncomplite) {
        var raw = '';
        try {
          raw = params && params.query ? decodeURIComponent(params.query) : '';
        }
        catch (e) {
          raw = params && params.query ? params.query : '';
        }

        var q = (raw || '').toString().trim();
        if (!q) return oncomplite([]);

        var q_norm = normalizeSearchText(q);
        var q_tokens = tokenizeSearchText(q_norm);
        if (!q_norm) return oncomplite([]);

        var page = 1;
        var max_pages = 60;
        var limit = 72;
        var found = [];

        function matchCollection(col) {
          if (!col) return false;
          var title = normalizeSearchText(getCollectionTitle(col));
          if (!title) return false;
          if (q_tokens.length <= 1) return title.indexOf(q_norm) !== -1;
          for (var i = 0; i < q_tokens.length; i++) {
            if (title.indexOf(q_tokens[i]) === -1) return false;
          }
          return true;
        }

        var done = function () {
          oncomplite([{
            title: 'Коллекции',
            results: found.slice(0, limit)
          }]);
        };

        var next = function () {
          if (page > max_pages) return done();
          if (found.length >= limit) return done();

          var url = api_base + 'list?category=all&page=' + page + '&search=' + encodeURIComponent(q_norm);
          search_network.silent(url, function (data) {
            var list = data && Array.isArray(data.results) ? data.results : [];

            if (data && data.total_pages && !isNaN(parseInt(data.total_pages, 10))) {
              max_pages = Math.min(max_pages, parseInt(data.total_pages, 10) || max_pages);
            }

            for (var i = 0; i < list.length; i++) {
              var col = list[i];
              if (!col) continue;
              if (matchCollection(col)) {
                found.push(mapCollectionToCard(col));
                if (found.length >= limit) break;
              }
            }

            page++;
            if (!list.length) return done();
            next();
          }, function () {
            done();
          });
        };

        next();
      }

      Lampa.Search.addSource({
        title: 'Коллекции',
        search: searchCollections,
        params: {
          save: true
        },
        onRender: function (line) {
          try {
            line.use({
              onlyCreateAndAppend: function (element) {
                try {
                  var col = element && element._collection ? element._collection : null;
                  if (!col) return;

                  col.title = getCollectionTitle(col) || col.title || 'Без названия';

                  var card = new Collection(col);
                  card.build();
                  card.image();

                  var html = $(card.item);
                  html.on('visible', function () {
                    try { card.visible(); } catch (e) {}
                  });

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
                catch (e) {}
              }
            });
          }
          catch (e) {}
        },
        onSelect: function (payload, close) {
          try {
            if (close) close();
          }
          catch (e) {}

          try {
            var el = payload && payload.element ? payload.element : null;
            var col = el && el._collection ? el._collection : null;
            var id = col && col.id ? col.id : (el && el.id ? el.id : '');
            if (!id) return;

            Lampa.Activity.push({
              url: id,
              title: (col && getCollectionTitle(col)) || (el && el.title) || 'Коллекция',
              component: 'cub_collections_view',
              page: 1,
              collection: col || null
            });
          }
          catch (e) {}
        },
        onMore: function (payload, close) {
          try {
            if (close) close();
          }
          catch (e) {}

          try {
            Lampa.Activity.push({
              url: 'all',
              title: 'Все коллекции',
              component: 'cub_collections_collection',
              page: 1
            });
          }
          catch (e) {}
        },
        onCancel: function () {
          try { search_network.clear(); } catch (e) {}
        }
      });
    }

    function initGlobalSearchCollectionsSourceEarly() {
      var attempts = 0;
      var loop = function () {
        if (window.cub_collections_global_search_source_added) return;
        if (!Lampa.Search || !Lampa.Search.addSource) {
          attempts++;
          if (attempts < 100) return setTimeout(loop, 200);
          return;
        }

        try {
          initGlobalSearchCollectionsSource();
        }
        catch (e) {}
      };

      loop();
    }

    initGlobalSearchCollectionsSourceEarly();

    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      if (!e.object || !e.object.activity) return;

      var card_data = e.data && e.data.movie ? e.data.movie : (e.object.card || null);
      if (!card_data) return;
      var render = e.object.activity.render();
      if (!render || !render.find) return;

      var buttons = render.find('.full-start-new__buttons');
      if (!buttons || !buttons.length) buttons = render.find('.full-start__buttons');
      if (!buttons || !buttons.length) return;

      var existed = buttons.find('.button--collections');
      if (existed && existed.length) {
        var btn_exist = existed.eq(0);
        try { btn_exist.off('hover:enter'); } catch (e) {}
        btn_exist.on('hover:enter', function () {
          openAddToCollectionDialog(card_data);
        });
        bindFullCollectionsButton(btn_exist, card_data);
        return;
      }

      var icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.0656 8.00389L11.25 7.99875H18.75C20.483 7.99875 21.8992 9.3552 21.9949 11.0643L22 11.2487V18.7487C22 20.4818 20.6435 21.898 18.9344 21.9936L18.75 21.9987H11.25C9.51697 21.9987 8.10075 20.6423 8.00515 18.9332L8 18.7487V11.2487C8 9.51571 9.35646 8.0995 11.0656 8.00389ZM18.75 9.49875H11.25C10.3318 9.49875 9.57881 10.2059 9.5058 11.1052L9.5 11.2487V18.7487C9.5 19.6669 10.2071 20.4199 11.1065 20.4929L11.25 20.4987H18.75C19.6682 20.4987 20.4212 19.7916 20.4942 18.8923L20.5 18.7487V11.2487C20.5 10.2822 19.7165 9.49875 18.75 9.49875ZM15.5818 4.23284L15.6345 4.40964L16.327 6.998H14.774L14.1856 4.79787C13.9355 3.86431 12.9759 3.31029 12.0423 3.56044L4.79787 5.50158C3.91344 5.73856 3.36966 6.61227 3.52756 7.49737L3.56044 7.64488L5.50158 14.8893C5.69372 15.6064 6.30445 16.0996 7.00045 16.1764L7.00056 17.6816C5.69932 17.6051 4.52962 16.7445 4.10539 15.4544L4.05269 15.2776L2.11155 8.03311C1.66301 6.35913 2.6067 4.6401 4.23284 4.10539L4.40964 4.05269L11.6541 2.11155C13.3281 1.66301 15.0471 2.6067 15.5818 4.23284Z" fill="currentColor"/><path class="collections-ico__plus" d="M15 11C15.4142 11 15.75 11.3358 15.75 11.75V14.248L18.25 14.2487C18.6642 14.2487 19 14.5845 19 14.9987C19 15.413 18.6642 15.7487 18.25 15.7487L15.75 15.748V18.25C15.75 18.6642 15.4142 19 15 19C14.5858 19 14.25 18.6642 14.25 18.25V15.748L11.75 15.7487C11.3358 15.7487 11 15.413 11 14.9987C11 14.5845 11.3358 14.2487 11.75 14.2487L14.25 14.248V11.75C14.25 11.3358 14.5858 11 15 11Z" fill="currentColor"/><path class="collections-ico__check" d="M12.2 14.9l1.6 1.6 4.1-4.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var btn = $('<div class="full-start__button selector button--collections">' + icon + '<span>В коллекцию</span></div>');
      btn.on('hover:enter', function () {
        openAddToCollectionDialog(card_data);
      });
      bindFullCollectionsButton(btn, card_data);

      var options = buttons.find('.button--options');
      if (options.length) options.before(btn);
      else buttons.append(btn);
    });
  }

  if (!window.cub_collections_ready && Lampa.Manifest.app_digital >= 242) startPlugin();
})();
