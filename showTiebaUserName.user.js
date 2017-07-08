// ==UserScript==
// @name         贴吧显示真实ID
// @version      0.6
// @namespace    https://github.com/8qwe24657913
// @description  贴吧昵称掩盖了真实ID，认不出人了？这个脚本适合你
// @author       8qwe24657913
// @match        http://tieba.baidu.com/*
// @match        https://tieba.baidu.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    // add css
    var css = `
@keyframes showUserName {
    from {
        clip: rect(1px, auto, auto, auto);
    }
    to {
        clip: rect(0px, auto, auto, auto);
    }
}
.frs-author-name:not(.shownUN), .p_author_name:not(.shownUN), .userinfo_username:not(.shownUN), #j_u_username .u_ddl_con_top > ul:not(.shownUN) {
    animation-duration: 0.001s;
    animation-name: showUserName;
}
.card_userinfo_title .userinfo_username, .card_userinfo_title .userinfo_username:hover {
    max-width: 100%!important;
}
.userinfo_username + div[style]:not([class]):not([id]), img[src="//tb1.bdstatic.com/tb/cms/nickemoji/nickname_sign.png"] {
    display: none!important;
}
`;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.documentElement.appendChild(style);
    // add setting
    var setting = localStorage.showUNSetting || '${un} (${nickname})';

    function changeSetting() {
        var newSetting = prompt('${un}表示真实ID，${nickname}表示昵称', setting);
        if (newSetting && newSetting !== setting) {
            localStorage.showUNSetting = newSetting;
            location.reload();
        }
    }

    function closestAttr(elem, attr) {
        while (elem && !elem.hasAttribute(attr)) elem = elem.parentElement;
        return elem ? elem.getAttribute(attr) : false;
    }
    // main
    document.addEventListener('animationstart', function(event) { // shouldn't use jQuery, bacause it may not be loaded
        if (event.animationName !== 'showUserName') return;
        var target = event.target;
        target.classList.add('shownUN');
        if (target.nodeName === 'UL') return $('<li class="u_showUN"><a href="javascript:">显ID设置</a></li>').on('click', changeSetting).appendTo(target); // jQuery is loaded here
        var field = closestAttr(target, 'data-field'), un;
        if (field) { // frs & pb & card
            un = JSON.parse(field).un;
        } else if (typeof PageData === 'object' && PageData.product === 'ihome') { // ihome
            un = target.nextElementSibling.getAttribute('data-username');
        } else { // unknown
            return console.error('贴吧显示真实ID: 找不到真实ID', target);
        }
        var nickname = target.innerHTML.replace(/^<div[^>]*>(.*)<\/div>$/, '$1').replace(/<img src="\/\/tb1\.bdstatic\.com\/tb\/cms\/nickemoji\/nickname_sign\.png"[^>]*>/, '');
        if (nickname.endsWith('...') && target.classList.contains('frs-author-name')) { // frs 用户名被切掉的情况
            nickname = closestAttr(target.parentElement, 'title').split(' ')[1];
            if (nickname === un) target.textContent = nickname; // 尽量显示完整
        }
        if (nickname !== un) target.innerHTML = setting.replace(/\${un}/g, un).replace(/\${nickname}/g, nickname);
    }, false);
})();