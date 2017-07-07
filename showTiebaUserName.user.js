// ==UserScript==
// @name         贴吧显示真实ID
// @version      0.2
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
.frs-author-name:not(.shownUN), .p_author_name:not(.shownUN), .userinfo_username:not(.shownUN) {
    animation-duration: 0.001s;
    animation-name: showUserName;
}
.card_userinfo_title .userinfo_username, .card_userinfo_title .userinfo_username:hover {
        max-width: max-content!important;
}
div#showUserNameSetting {
    position: fixed;
    margin: auto;
    height: 20px;
    width: 500px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, .5);
    z-index: 1000;
    display: flex;
    padding: 10px;
    align-items: center;
}

#showUserNameSetting input {
    width: auto;
    margin-right: 10px;
    flex: 1;
}

#showUserNameSetting button {
    -webkit-appearance: push-button;
    border-width: 2px;
    border-style: outset;
    border-color: buttonface;
    border-image: initial;
    border-radius: unset;
    background-color: buttonface;
    background-image: none;
}
@keyframes showUserNameSetting {
    from {
        clip: rect(1px, auto, auto, auto);
    }
    to {
        clip: rect(0px, auto, auto, auto);
    }
}
#j_u_username .u_ddl_con_top > ul:not(.shownUN) {
    animation-duration: 0.001s;
    animation-name: showUserNameSetting;
}
`;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.documentElement.appendChild(style);
    // add setting
    var setting = localStorage.showUNSetting || '${un} (${nickname})';
    document.addEventListener('animationstart', function listener(event) {
        if (event.animationName !== 'showUserNameSetting') return;
        document.removeEventListener('animationstart', listener, false);
        var $set = $('<div id="showUserNameSetting"><input id="showUNInput" type="text"><button id="showUNButton">修改</button></div>').hide().appendTo('body');
        var $input = $set.children('#showUNInput').val(setting);
        $set.children('#showUNButton').on('click', function() {
            var newSetting = $input.val();
            if (newSetting !== setting) {
                localStorage.showUNSetting = newSetting;
                location.reload();
            } else {
                $set.hide();
            }
        });
        $('<li class="u_showUN"><a href="javascript:">显ID设置</a></li>').on('click', function() {
            $set.show();
        }).appendTo($(event.target).addClass('shownUN'));
    }, false);
    // main
    document.addEventListener('animationstart', function(event) { // shouldn't use jquery, bacause it may not be loaded
        if (event.animationName !== 'showUserName') return;
        var target = event.target,
            nickname = target.textContent,
            node = target;
        target.classList.add('shownUN');
        while (!node.hasAttribute('data-field')) node = node.parentElement;
        var un = JSON.parse(node.getAttribute('data-field')).un;
        if (nickname !== un) target.textContent = setting.replace(/\${un}/g, un).replace(/\${nickname}/g, nickname);
    }, false);
})();