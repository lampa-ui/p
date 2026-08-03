(function () {
  ("use strict");

  var year;
  var namemovie;
  var savedHTML = null;

  function endsWithSlash(str) {
    return str.charAt(str.length - 1) === '/';
  }

  function startsWithHttp(str) {
    return str.indexOf('http') === 0;
  }

  function repeatChar(ch, n) {
    var s = '';
    for (var i = 0; i < n; i++) s += ch;
    return s;
  }

  function fetchCompat(url, options) {
    options = options || {};
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(options.method || 'GET', url, true);

      var headers = options.headers || {};
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          try {
            xhr.setRequestHeader(h, headers[h]);
          } catch (e) {}
        }
      }

      xhr.onload = function () {
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          text: function () {
            return Promise.resolve(xhr.responseText);
          }
        });
      };
      xhr.onerror = function () {
        reject(new Error('Network error'));
      };
      xhr.ontimeout = function () {
        reject(new Error('Request timeout'));
      };

      xhr.send(options.body || null);
    });
  }

  // --- Дублированная логика QR/TV авторизации для быстрого вызова с карточки фильма ---
  // (настройки в SettingsApi ниже не трогаем, это отдельная копия)

  function generateAuthCodeQuick() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  function buildAuthUrlQuick() {
    var proxyUrl = (Lampa.Storage.get('rezka_comment_proxy', 'https://rezka.lampasochka.workers.dev/') || 'https://rezka.lampasochka.workers.dev/').trim();
    if (!startsWithHttp(proxyUrl)) {
      Lampa.Noty.show('Сначала настройте URL прокси-воркера в настройках плагина');
      return null;
    }
    if (!endsWithSlash(proxyUrl)) proxyUrl += '/';

    var host = (Lampa.Storage.get('rezka_comment_host', 'https://rezka.ag') || 'https://rezka.ag').trim();
    var hostBare = host.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

    var code = generateAuthCodeQuick();
    var authUrl = proxyUrl + 'auth/' + code + '/' + encodeURIComponent(hostBare);

    return { proxyUrl: proxyUrl, code: code, authUrl: authUrl };
  }

  function pollAuthCodeQuick(proxyUrl, code, statusSelector, waitingText, onSuccess, onTimeout) {
    var attempts = 0;
    window.rezkaQuickAuthInterval = setInterval(function () {
      attempts++;
      if (attempts > 90) {
        clearInterval(window.rezkaQuickAuthInterval);
        $(statusSelector).text('Время ожидания истекло. Попробуйте снова.').css('color', '#ff5722');
        if (onTimeout) onTimeout();
        return;
      }

      $(statusSelector).text(waitingText + repeatChar('.', attempts % 4));

      $.ajax({
        url: proxyUrl + 'check?code=' + code,
        type: 'GET',
        dataType: 'json',
        success: function (d) {
          if (d && (d.status === 'success' || d.cookie)) {
            clearInterval(window.rezkaQuickAuthInterval);
            Lampa.Storage.set('rezka_comment_cookie', d.cookie);
            console.log('[RezkaComment] (quick) cookie saved:', d.cookie);

            var tail = (d.cookie || '').slice(-16);
            $(statusSelector).html('<span style="color: #4CAF50;">Успешно! Cookie сохранены (…' + tail + ').</span>');

            if (onSuccess) setTimeout(onSuccess, 1500);
          }
        },
        error: function () {}
      });
    }, 2000);
  }

  function closeAuthModalQuick(modalClass) {
    clearInterval(window.rezkaQuickAuthInterval);
    Lampa.Modal.close();
    $(modalClass).remove();
    try {
      Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  function openQrAuthModalQuick(onDone) {
    var auth = buildAuthUrlQuick();
    if (!auth) return;

    var modalHtml = $(
      '<div style="text-align: center; padding: 20px;">' +
        '<div style="margin-bottom: 20px; font-size: 1.2em; color: #fff;">' +
          'Отсканируйте код камерой телефона<br>' +
          '<span style="font-size: 0.8em; opacity: 0.7;">или перейдите по ссылке:</span><br>' +
          '<a href="' + auth.authUrl + '" target="_blank" style="font-size: 0.8em; color: #a335ff; word-break: break-all;">' + auth.authUrl + '</a>' +
        '</div>' +
        '<div id="rezka_qr_container_quick" style="background: white; padding: 15px; display: inline-block; border-radius: 10px;"></div>' +
        '<div id="rezka_qr_status_quick" style="margin-top: 20px; font-size: 1.1em; color: #e5e5e5;">Ожидание сканирования...</div>' +
      '</div>'
    );

    function finish() {
      closeAuthModalQuick('.modal--medium');
      if (onDone) onDone();
    }

    Lampa.Modal.open({
      title: 'Авторизация HDRezka',
      html: modalHtml,
      size: 'medium',
      mask: true,
      onBack: function () { closeAuthModalQuick('.modal--medium'); }
    });

    var qrImgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(auth.authUrl);
    $('#rezka_qr_container_quick').html(
      '<img src="' + qrImgUrl + '" width="250" height="250" alt="QR" onerror="this.parentElement.innerHTML=' +
      "'<div style=\\'color:#333;font-size:0.9em;padding:20px;\\'>Не удалось загрузить QR. Используйте ссылку выше.</div>'" +
      '">'
    );

    pollAuthCodeQuick(auth.proxyUrl, auth.code, '#rezka_qr_status_quick', 'Ожидание решения защиты на телефоне', finish, null);
  }

  function openTvAuthModalQuick(onDone) {
    var auth = buildAuthUrlQuick();
    if (!auth) return;

    var modalHtml = $(
      '<div style="padding: 10px;">' +
        '<iframe src="' + auth.authUrl + '" style="width:100%;height:60vh;border:none;background:#fff;border-radius:6px;"></iframe>' +
        '<div id="rezka_tv_status_quick" style="margin-top: 15px; font-size: 1.1em; color: #e5e5e5; text-align:center;">Ожидание прохождения проверки...</div>' +
      '</div>'
    );

    function finish() {
      closeAuthModalQuick('.modal--large');
      if (onDone) onDone();
    }

    Lampa.Modal.open({
      title: 'Проверка HDRezka',
      html: modalHtml,
      size: 'large',
      mask: true,
      onBack: function () { closeAuthModalQuick('.modal--large'); }
    });

    pollAuthCodeQuick(auth.proxyUrl, auth.code, '#rezka_tv_status_quick', 'Ожидание решения защиты', finish, null);
  }

  // Показывает выбор способа авторизации, когда куки протухли/отсутствуют.
  // retryFn (опционально) — вызывается после успешной авторизации, чтобы
  // сразу повторить действие (поиск/загрузку комментариев) без лишних нажатий.
  function showCookieExpiredChoice(retryFn) {
    Lampa.Select.show({
      title: 'Cookie Rezka устарели или отсутствуют',
      items: [
        { title: 'Пройти проверку в Lampa', method: 'tv' },
        { title: 'Через QR-код на телефоне', method: 'qr' }
      ],
      onBack: function () {
        Lampa.Controller.toggle('content');
      },
      onSelect: function (item) {
        if (item.method === 'tv') {
          openTvAuthModalQuick(retryFn);
        } else {
          openQrAuthModalQuick(retryFn);
        }
      }
    });
  }
  // --- конец дублированной логики ---

  // Явные текстовые маркеры блокировки ботозащитой (Anubis и т.п.).
  // Безопасно применять к любому ответу, т.к. не даёт ложных срабатываний.
  function hasExplicitBotMarkers(text) {
    return text.indexOf("Проверяем, что вы не бот") !== -1 || text.indexOf("Anubis") !== -1;
  }

  // Расширенная эвристика для HTML-ответов (поиск, либо ответ, который не
  // удалось распарсить как JSON): если явных маркеров нет, но куки не
  // передавались вообще и в ответе нет ожидаемой разметки страницы (b-content),
  // тоже считаем это блокировкой, а не легитимным "не найдено"/пустым ответом.
  // Для уже успешно распарсенного JSON эту версию не используем — она даст
  // ложные срабатывания, т.к. в JSON-ответе никогда не будет "b-content".
  function looksLikeBotBlockHtml(text, hasCookie) {
    if (hasExplicitBotMarkers(text)) return true;
    if (!hasCookie && text.indexOf("b-content") === -1) return true;
    return false;
  }

  function getSettings() {
    var host = (Lampa.Storage.get('rezka_comment_host', 'https://rezka.ag') || 'https://rezka.ag').trim().replace(/\/+$/, '');
    var cookie = (Lampa.Storage.get('rezka_comment_cookie', '') || '').trim();
    var proxy = (Lampa.Storage.get('rezka_comment_proxy', 'https://rezka.lampasochka.workers.dev/') || 'https://rezka.lampasochka.workers.dev/').trim();
    if (proxy && !endsWithSlash(proxy)) {
      proxy += '/';
    }
    return { host: host, cookie: cookie, proxy: proxy };
  }

  function searchRezka(name, ye) {
    var settings = getSettings();
    var host = settings.host;
    var cookie = settings.cookie;
    var proxy = settings.proxy;
    var path = host + "/search/?do=search&subaction=search&q=" + encodeURIComponent(name) + (ye ? "+" + ye : "");
    var searchUrl = proxy;
    if (cookie) {
      searchUrl += "param/Cookie=" + encodeURIComponent(cookie) + "/";
    }
    searchUrl += path;

    console.log('[RezkaComment] searching hdrezka with url:', searchUrl);

    return fetchCompat(searchUrl, {
      method: "GET",
      headers: { "Content-Type": "text/html" }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
      }
      return response.text();
    }).then(function (fc) {
      var dom = new DOMParser().parseFromString(fc, "text/html");

      var item = dom.querySelector(".b-content__inline_item");
      if (!item) {
        console.warn('[RezkaComment] show not found on Rezka:', name, ye);
        Lampa.Loading.stop();
        if (looksLikeBotBlockHtml(fc, !!cookie)) {
          showCookieExpiredChoice(function () {
            Lampa.Loading.start();
            searchRezka(name, ye);
          });
        } else {
          Lampa.Noty.show('Фильм/сериал не найден на Rezka');
        }
        return;
      }

      var linkEl = item.querySelector(".b-content__inline_item-link");
      namemovie = linkEl ? linkEl.innerText : "";

      var itemUrl = linkEl ? linkEl.getAttribute("href") : "";
      return comment_rezka(item.dataset.id, itemUrl);
    }).catch(function (e) {
      console.error('[RezkaComment] searchRezka error:', e);
      Lampa.Noty.show('Ошибка поиска на Rezka: ' + e.message);
      Lampa.Loading.stop();
    });
  }

  function getEnTitle(id, type) {
    var tmdbType = type === 'movie' ? 'movie' : 'tv';
    var tmdbCacheKey = tmdbType + '_' + id;

    window.__tmdbTranslationsCache = window.__tmdbTranslationsCache || {};
    window.__tmdbFallbackTitleCache = window.__tmdbFallbackTitleCache || {};
    var cachedTr = window.__tmdbTranslationsCache[tmdbCacheKey];
    var fallbackTitle = window.__tmdbFallbackTitleCache[tmdbCacheKey] || '';

    var trPromise;

    if (cachedTr) {
      console.log('[RezkaComment] using shared translations cache for', tmdbCacheKey);
      trPromise = Promise.resolve(cachedTr);
    } else {
      trPromise = new Promise(function (res, rej) {
        Lampa.Api.sources.tmdb.get(
          tmdbType + '/' + id,
          { append_to_response: 'translations' },
          res,
          rej
        );
      }).then(function (data) {
        var tr = (data && data.translations && data.translations.translations) || [];
        window.__tmdbTranslationsCache[tmdbCacheKey] = tr;

        if (data && data.original_language === 'en') {
          fallbackTitle = (data && data.title) || (data && data.name) || (data && data.original_title) || (data && data.original_name) || '';
        }
        window.__tmdbFallbackTitleCache[tmdbCacheKey] = fallbackTitle;

        console.log('[RezkaComment] TMDB raw response for', tmdbCacheKey, data);
        return tr;
      });
    }

    return trPromise.then(function (tr) {
      var enTitle = '';
      var enList = tr.filter(function (t) {
        return t.iso_639_1 === 'en';
      });
      for (var i = 0; i < enList.length; i++) {
        var cand = enList[i];
        var candTitle = (cand && cand.data && cand.data.title) || (cand && cand.data && cand.data.name);
        if (candTitle) {
          enTitle = candTitle;
          break;
        }
      }
      if (!enTitle) enTitle = fallbackTitle;

      if (enTitle) {
        return searchRezka(normalizeTitle(enTitle), year);
      } else {
        console.warn('[RezkaComment] English title not found for', tmdbCacheKey, tr, 'fallbackTitle:', fallbackTitle);
        Lampa.Noty.show('Английское название не найдено');
        Lampa.Loading.stop();
      }
    }).catch(function (e) {
      console.error('[RezkaComment] TMDB error', e);
      var reason = (e && (e.message || e.status_message)) ? (e.message || e.status_message) : JSON.stringify(e);
      Lampa.Noty.show('Ошибка получения данных TMDB: ' + reason);
      Lampa.Loading.stop();
    });
  }

  function cleanTitle(str) {
    return str.replace(/[\s.,:;’'`!?]+/g, " ").trim();
  }

  function normalizeTitle(str) {
    return cleanTitle(
      str
        .toLowerCase()
        .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, "-")
        .replace(/ё/g, "е")
    );
  }

  function buildCommentNode(item) {
    function q(s) {
      return item.querySelector(s);
    }

    var avaImg = q(".ava img");
    var avatar = (avaImg && (avaImg.dataset.src || avaImg.src)) || "";
    var nameEl = q(".name, .b-comment__user");
    var user = (nameEl && nameEl.innerText) || "Без имени";
    var dateEl = q(".date, .b-comment__time");
    var date = (dateEl && dateEl.innerText) || "";
    var textEl = q(".message .text, .text");
    var text = (textEl && textEl.innerHTML) || "";

    var wrapper = document.createElement("div");
    wrapper.className = "message";

    wrapper.innerHTML =
      '<div class="comment-wrap">' +
        '<div class="avatar-column">' +
          '<img src="' + avatar + '" class="avatar-img" alt="' + user + '">' +
        '</div>' +

        '<div class="comment-card">' +
          '<div class="comment-header">' +
            '<span class="name">' + user + '</span>' +
            '<span class="date">' + date + '</span>' +
          '</div>' +

          '<div class="comment-text">' +
            '<div class="text">' + text + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    return wrapper;
  }

  function buildTree(root) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < root.children.length; i++) {
      var li = root.children[i];
      var indent = parseInt(li.dataset.indent || 0, 10);

      var wrapper = document.createElement("li");
      wrapper.className = "comments-tree-item";
      wrapper.style.marginLeft = indent > 0 ? "20px" : "0";
      wrapper.appendChild(buildCommentNode(li));

      var childrenList = li.querySelector("ol.comments-tree-list");
      if (childrenList) wrapper.appendChild(buildTree(childrenList));

      fragment.appendChild(wrapper);
    }

    return fragment;
  }

  function comment_rezka(id, pageUrl) {
    var settings = getSettings();
    var host = settings.host;
    var cookie = settings.cookie;
    var proxy = settings.proxy;
    var t = Date.now();
    var path = host + "/ajax/get_comments/?t=" + t + "&news_id=" + (id ? id : "1") + "&cstart=1&type=0&comment_id=0&skin=hdrezka";

    var commentsUrl = proxy;
    if (cookie) {
      commentsUrl += "param/Cookie=" + encodeURIComponent(cookie) + "/";
    }
    if (pageUrl) {
      commentsUrl += "param/Referer=" + encodeURIComponent(pageUrl) + "/";
    }
    commentsUrl += path;

    console.log('[RezkaComment] fetching comments from:', commentsUrl);

    function openModal(treeContent) {
      Lampa.Loading.stop();
      var modal = $(
        '<div><div class="broadcast__text" style="text-align:left;"><div class="comment"></div></div></div>'
      );
      modal.find(".comment").append(treeContent);

      if (!document.getElementById("rezka-comment-style")) {
        var styleEl = document.createElement("style");
        styleEl.id = "rezka-comment-style";
        styleEl.textContent =
          '    .comments-tree-list{list-style:none;margin:0;padding:0;}' +
          '.comments-tree-item{list-style:none;margin:0;padding:0;}' +
          '.comment-wrap{display:flex;margin-bottom:5px;}' +
          '.avatar-column{margin-right:10px;}' +
          '.avatar-img{width:48px;height:48px;border-radius:4px;}' +
          '.comment-card{background:#1b1b1b;padding:5px 12px;border-radius:6px;border:1px solid #2a2a2a;width:100%;}' +
          '.comment-header{display:flex;justify-content:space-between;margin-bottom:6px;}' +
          '.comment-header .name{font-weight:600;color:#fff;}' +
          '.comment-header .date{opacity:.7;font-size:11px;}' +
          '.comment-text .text{color:#ddd;line-height:1.45;}' +
          '.rc-children{margin-left:30px;border-left:1px solid #333;padding-left:14px;}' +
          '.title_spoiler{display:inline-flex;align-items:center;background:#2a2a2a;border-radius:6px;padding:1px 4px;margin:0 2px;font-size:13px;color:#e0e0e0;cursor:pointer;box-shadow:0 0 2px rgba(0,0,0,.4);}' +
          '.title_spoiler a{color:#e0e0e0!important;text-decoration:none!important;}' +
          '.title_spoiler img{height:14px;width:auto;vertical-align:middle;margin:0 2px;}' +
          '.title_spoiler .attention{height:14px;width:14px;margin-left:4px;vertical-align:middle;}' +
          '.modal-close-btn{background:#2a2a2a;border:1px solid #444;color:#ddd;border-radius:6px;font-size:18px;line-height:18px;cursor:pointer;transition:.15s;}' +
          '.modal-close-btn:hover{background:#3a3a3a;color:#fff;}';
        document.head.appendChild(styleEl);
      }
      if (!window.rezkaSpoilerInit) {
        window.rezkaSpoilerInit = true;
        var Script = document.createElement("script");
        Script.textContent =
          "function ShowOrHide(id){var t=$('#'+id);t.prev('.title_spoiler').remove();t.css('display','inline');}";
        document.head.appendChild(Script);
      }

      Lampa.Modal.open({
        title: "",
        html: modal,
        size: "large",
        style: "margin-top:10px;",
        mask: true,
        onBack: function () {
          Lampa.Modal.close();
          $(".modal--large").remove();
          Lampa.Controller.toggle("content");
        }
      });

      var modalHead = document.querySelector(".modal__head");
      if (modalHead) {
        modalHead.insertAdjacentHTML(
          "afterend",
          '<button class="modal-close-btn selector" onclick="$(\'.modal--large\').remove()">&times;</button>  ' + namemovie
        );
      }
    }

    return fetchCompat(commentsUrl, {
      method: "GET",
      headers: { "Content-Type": "text/plain" }
    }).then(function (r) {
      if (!r.ok) {
        throw new Error('HTTP status ' + r.status);
      }
      return r.text();
    }).then(function (fc) {
      if (hasExplicitBotMarkers(fc)) {
        Lampa.Loading.stop();
        showCookieExpiredChoice(function () {
          Lampa.Loading.start();
          comment_rezka(id, pageUrl);
        });
        return;
      }

      var json;
      try {
        json = JSON.parse(fc);
      } catch (parseErr) {
        // Ответ не похож на JSON комментариев — вероятно, это HTML-страница
        // ботозащиты без явных текстовых маркеров. Применяем ту же
        // эвристику, что и в поиске (в т.ч. проверку на отсутствие куки).
        if (looksLikeBotBlockHtml(fc, !!cookie)) {
          Lampa.Loading.stop();
          showCookieExpiredChoice(function () {
            Lampa.Loading.start();
            comment_rezka(id, pageUrl);
          });
          return;
        }
        throw new Error('Не удалось разобрать ответ сервера комментариев');
      }

      if (!json || !json.comments) {
        throw new Error('Пустой ответ от сервера комментариев');
      }

      var dom = new DOMParser().parseFromString(json.comments, "text/html");
      var toRemove = dom.querySelectorAll(".actions, i, .share-link");
      for (var i = 0; i < toRemove.length; i++) {
        toRemove[i].remove();
      }

      var rootList = dom.querySelector(".comments-tree-list");
      if (!rootList) {
        console.warn('[RezkaComment] comments-tree-list not found in parsed HTML for', id);
        Lampa.Noty.show('Комментарии к фильму/сериалу отсутствуют');
        Lampa.Loading.stop();
        return;
      }

      var newTree = buildTree(rootList);
      openModal(newTree);
    }).catch(function (e) {
      console.error('[RezkaComment] comment_rezka error:', e);
      Lampa.Noty.show('Ошибка получения комментариев: ' + e.message);
      Lampa.Loading.stop();
    });
  }

  function startPlugin() {
    window.comment_plugin = true;

    function generateAuthCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    try {
      Lampa.SettingsApi.addComponent({
        component: 'rezka_comment',
        name: 'Rezka Comments',
        icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment',
        param: {
          name: 'rezka_comment_host',
          type: 'input',
          placeholder: 'https://rezka.ag',
          values: Lampa.Storage.get('rezka_comment_host', 'https://rezka.ag'),
          default: 'https://rezka.ag'
        },
        field: {
          name: 'Зеркало hdrezka',
          description: 'Адрес зеркала hdrezka (например, https://hdrezka.me)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_host', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment',
        param: {
          name: 'rezka_comment_proxy',
          type: 'input',
          placeholder: 'https://ваш-воркер.workers.dev/',
          values: Lampa.Storage.get('rezka_comment_proxy', 'https://rezka.lampasochka.workers.dev/'),
          default: 'https://rezka.lampasochka.workers.dev/'
        },
        field: {
          name: 'CORS Прокси (Умный)',
          description: 'URL вашего Cloudflare Worker с поддержкой авторизации (с / на конце)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_proxy', value);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment',
        param: {
          name: 'rezka_comment_cookie',
          type: 'input',
          placeholder: 'вставьте cookie',
          values: Lampa.Storage.get('rezka_comment_cookie', ''),
          default: ''
        },
        field: {
          name: 'Cookie авторизации (Ручной ввод)'
        },
        onChange: function(value) {
          Lampa.Storage.set('rezka_comment_cookie', value);
        }
      });

      function pollAuthCode(proxyUrl, code, statusSelector, waitingText, onSuccess, onTimeout) {
          var attempts = 0;
          window.rezkaAuthInterval = setInterval(function() {
              attempts++;
              if(attempts > 90) {
                  clearInterval(window.rezkaAuthInterval);
                  $(statusSelector).text('Время ожидания истекло. Попробуйте снова.').css('color', '#ff5722');
                  if (onTimeout) onTimeout();
                  return;
              }

              $(statusSelector).text(waitingText + repeatChar('.', attempts % 4));

              $.ajax({
                  url: proxyUrl + 'check?code=' + code,
                  type: 'GET',
                  dataType: 'json',
                  success: function(d) {
                      if(d && (d.status === 'success' || d.cookie)) {
                          clearInterval(window.rezkaAuthInterval);
                          Lampa.Storage.set('rezka_comment_cookie', d.cookie);
                          console.log('[RezkaComment] cookie saved:', d.cookie);

                          var tail = (d.cookie || '').slice(-16);
                          $(statusSelector).html('<span style="color: #4CAF50;">Успешно! Cookie сохранены (…' + tail + ').</span>');

                          try {
                              $('.settings-param[data-name="rezka_comment_cookie"] .settings-param__value').text(d.cookie);
                          } catch(e) {}

                          if (onSuccess) setTimeout(onSuccess, 2500);
                      }
                  },
                  error: function() {}
              });
          }, 2000);
      }

      function closeAuthModal(modalClass) {
          clearInterval(window.rezkaAuthInterval);
          Lampa.Modal.close();
          $(modalClass).remove();
          try {
              Lampa.Controller.toggle('settings_component');
          } catch (e) {
              try { Lampa.Controller.toggle('settings'); } catch (e2) {}
          }
      }

      function buildAuthUrl() {
          var proxyUrl = (Lampa.Storage.get('rezka_comment_proxy', 'https://rezka.lampasochka.workers.dev/') || 'https://rezka.lampasochka.workers.dev/').trim();
          if(!startsWithHttp(proxyUrl)) {
              Lampa.Noty.show('Сначала настройте URL прокси-воркера');
              return null;
          }
          if(!endsWithSlash(proxyUrl)) proxyUrl += '/';

          var host = (Lampa.Storage.get('rezka_comment_host', 'https://rezka.ag') || 'https://rezka.ag').trim();
          var hostBare = host.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

          var code = generateAuthCode();
          var authUrl = proxyUrl + 'auth/' + code + '/' + encodeURIComponent(hostBare);

          return { proxyUrl: proxyUrl, code: code, authUrl: authUrl };
      }

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment',
        param: {
          name: 'rezka_auth_qr',
          type: 'button'
        },
        field: {
          name: 'Авторизация через QR-код',
          description: 'Отсканируйте код телефоном, чтобы автоматически получить Cookie'
        },
        onChange: function() {
            var auth = buildAuthUrl();
            if (!auth) return;

            var modalHtml = $(
                '<div style="text-align: center; padding: 20px;">' +
                    '<div style="margin-bottom: 20px; font-size: 1.2em; color: #fff;">' +
                        'Отсканируйте код камерой телефона<br>' +
                        '<span style="font-size: 0.8em; opacity: 0.7;">или перейдите по ссылке:</span><br>' +
                        '<a href="' + auth.authUrl + '" target="_blank" style="font-size: 0.8em; color: #a335ff; word-break: break-all;">' + auth.authUrl + '</a>' +
                    '</div>' +
                    '<div id="rezka_qr_container" style="background: white; padding: 15px; display: inline-block; border-radius: 10px;"></div>' +
                    '<div id="rezka_qr_status" style="margin-top: 20px; font-size: 1.1em; color: #e5e5e5;">Ожидание сканирования...</div>' +
                '</div>'
            );

            function closeThisModal() { closeAuthModal('.modal--medium'); }

            Lampa.Modal.open({
                title: 'Авторизация HDRezka',
                html: modalHtml,
                size: 'medium',
                mask: true,
                onBack: closeThisModal
            });

            var qrImgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(auth.authUrl);
            $('#rezka_qr_container').html(
                '<img src="' + qrImgUrl + '" width="250" height="250" alt="QR" onerror="this.parentElement.innerHTML=' +
                "'<div style=\\'color:#333;font-size:0.9em;padding:20px;\\'>Не удалось загрузить QR. Используйте ссылку выше.</div>'" +
                '">'
            );

            pollAuthCode(auth.proxyUrl, auth.code, '#rezka_qr_status', 'Ожидание решения защиты на телефоне', closeThisModal, null);
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'rezka_comment',
        param: {
          name: 'rezka_auth_tv',
          type: 'button'
        },
        field: {
          name: 'Пройти проверку в Lampa',
          description: 'Без телефона — открывает окно проверки в самой Lampa. Может не сработать на слабых/старых ТВ'
        },
        onChange: function() {
            var auth = buildAuthUrl();
            if (!auth) return;

            var modalHtml = $(
                '<div style="padding: 10px;">' +
                    '<iframe src="' + auth.authUrl + '" style="width:100%;height:60vh;border:none;background:#fff;border-radius:6px;"></iframe>' +
                    '<div id="rezka_tv_status" style="margin-top: 15px; font-size: 1.1em; color: #e5e5e5; text-align:center;">Ожидание прохождения проверки...</div>' +
                '</div>'
            );

            function closeThisModal() { closeAuthModal('.modal--large'); }

            Lampa.Modal.open({
                title: 'Проверка HDRezka',
                html: modalHtml,
                size: 'large',
                mask: true,
                onBack: closeThisModal
            });

            pollAuthCode(auth.proxyUrl, auth.code, '#rezka_tv_status', 'Ожидание решения защиты', closeThisModal, null);
        }
      });
    } catch (e) {
      console.error('[RezkaComment] Settings init error:', e);
    }

    Lampa.Listener.follow("full", function (e) {
      if (e.type == "complite") {
        $(".button--comment").remove();
        $(".full-start-new__buttons").append(
          '<div class="full-start__button selector button--comment"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 356.484 356.484"><g><path d="M293.984 7.23H62.5C28.037 7.23 0 35.268 0 69.731v142.78c0 34.463 28.037 62.5 62.5 62.5l147.443.001 70.581 70.58a12.492 12.492 0 0 0 13.622 2.709 12.496 12.496 0 0 0 7.717-11.547v-62.237c30.759-3.885 54.621-30.211 54.621-62.006V69.731c0-34.463-28.037-62.501-62.5-62.501zm37.5 205.282c0 20.678-16.822 37.5-37.5 37.5h-4.621c-6.903 0-12.5 5.598-12.5 12.5v44.064l-52.903-52.903a12.493 12.493 0 0 0-8.839-3.661H62.5c-20.678 0-37.5-16.822-37.5-37.5V69.732c0-20.678 16.822-37.5 37.5-37.5h231.484c20.678 0 37.5 16.822 37.5 37.5v142.78z" fill="currentcolor"/></g></svg><span>' +
          Lampa.Lang.translate("title_comments") +
          '</span></div>'
        );

        $(".button--comment").on("hover:enter", function (card) {
          year = 0;
          if (e.data.movie.release_date) {
            year = e.data.movie.release_date.slice(0, 4);
          } else if (e.data.movie.first_air_date) {
            year = e.data.movie.first_air_date.slice(0, 4);
          }
          Lampa.Loading.start();
          getEnTitle(e.data.movie.id, e.object.method);
        });
      }
    });
  }

  if (!window.comment_plugin) startPlugin();
})();
