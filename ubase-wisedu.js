(function () {
    var gCurrentRoute = null
    var gRouter = null
    var gConfig = null
    var gRoutes = []
    var gResource = null
    var gUserInfo = {
        "userAvatar": "http://ossdomain/aaa/bbb/ccc_token/",
        "userName": "姓名",
        "userAccount": "职工号或者学号或者临时人员号",
        "userGenderCode": "性别代码",
        "userGender": "性别",
        "userDepartmentCode": "部门代码",
        "userDepartment": "所属部门",
        "userMajorCode": "专业代码",
        "userMajor": "专业",
        "userGrade": "年级",
        "userClassCode": "班级代码",
        "userClass": "班级",
        "userMail": "用户邮箱",
        "userCellPhone": "用户手机号"
    }

    window.Utils = {}

    /* =================APP loading动画===================== */
    var loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:fixed;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:999999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s;opacity:1;}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}'

    var style = document.createElement('style')
    style.innerText = loadingCss
    document.getElementsByTagName('head')[0].appendChild(style)
    $('body').append('  <div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app-loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>')

    function showLoading() {
        $('.app-loading').addClass('app-loading-show')
    }

    function hideLoading() {
        $('.app-loading').removeClass('app-loading-show')
    }

    /* =================/APP loading动画===================== */

    window.Ubase.beforeInit = function (transition) {

        showLoading()

        gConfig = transition.config
        gRouter = transition.router

        gConfig['BH_VERSION'] = gConfig['BH_VERSION'] || '1.2'

        // 智校云管理平台主题色设置为橙色
        if(location.href.indexOf('wecmp.wisedu.com')>0){
            gConfig['THEME'] = 'yellow-fawn'
        }

        if (gConfig['APP_ID']) {
            $.ajax({
                dataType:'json',
                type: 'post',
                contentType: 'application/json',
                data: {appId: gConfig['APP_ID']},
                async: false,
                url: '/portal/portal/appFrameInfo'
            }).done(function (res) {
                var serverConfig = null
                gUserInfo = res.datas.userInfo
                if (res.code == 0 && gUserInfo) {
                    serverConfig = {
                        "BH_VERSION": "1.2",
                        "LANG": res.datas.locale || "cn",
                        "HEADER": {
                            "logo": res.datas.logo || "http://res.wisedu.com/scenes/public/images/demo/logo.png",
                            "userImage": res.datas.userInfo.userAvatar || "http://res.wisedu.com/scenes/public/images/demo/user1.png",
                            "userInfo": {
                                "image": res.datas.userInfo.userAvatar || "http://res.wisedu.com/scenes/public/images/demo/user1.png",
                                "info": [
                                    res.datas.userInfo.userAccount,
                                    res.datas.userInfo.userName + " " + res.datas.userInfo.userGender,
                                    res.datas.userInfo.userDepartment,
                                    res.datas.userInfo.userEmail,
                                    res.datas.userInfo.userCellPhone
                                ]
                            }
                        }
                    }
                }
                gConfig = $.extend(true, {}, gConfig, serverConfig)
            })
        }

        gResource = getResource()

        setModules(transition.routes)
        loadCss()

        loadJs(function () {
            hideLoading()
            afterLoadResource()
            transition.next()
        })

        setRouterAfterEach()
    }

    var afterLoadResource = function afterInit() {
        var miniModeConfig = gConfig['MINI_MODE']
        var userParams = getUserParams()

        setContentMinHeight($('body').children('main').children('article'))
        $('body').css('overflow-y', 'scroll')
        $(window).resize(function () {
            // 给外层的container添加最小高度
            setContentMinHeight($('body').children('main').children('article'))
        })
        // 阻止下拉框的事件冒泡  防止点击下拉后 poppver 自动关闭
        $(document).on('click.bhRules.stop', '.jqx-listbox, .jqx-calendar, .jqx-dropdownbutton-popup', function (e) {
            e.stopPropagation();
        })

        initFooter()
        renderHeader()

        if (miniModeConfig || userParams['min'] == '1') {
            miniMode()
        }
    }

    function getResource() {
        var resource = {
            'RESOURCE_VERSION': '100003',
            'PUBLIC_CSS': [
                '/fe_components/iconfont/iconfont.css',
                '/bower_components/wecloud-font/iconfont.css',
                '/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css',
                '/fe_components/jqwidget/{{theme}}/bh-scenes{{version}}.min.css'
            ],

            'PUBLIC_BASE_JS': [
                '/fe_components/bh_utils.js',
                gConfig['DEBUG'] === true ? '/fe_components/emap{{version}}.js' : '/fe_components/emap{{version}}.min.js',
                '/fe_components/amp/ampPlugins.min.js',
                '/fe_components/jqwidget/globalize.js',
                '/bower_components/jquery.nicescroll/jquery.nicescroll.min.js',
                '/bower_components/moment/min/moment-with-locales.min.js'
            ],

            'PUBLIC_NORMAL_JS': [
                gConfig['DEBUG'] === true ? '/fe_components/bh{{version}}.js' : '/fe_components/bh{{version}}.min.js',
                '/fe_components/jqwidget/jqxwidget.min.js',
                '/fe_components/mock/getmock.js'
            ]
        }
        return resource
    }

    Vue.mixin({
        ready: function () {
            var self = this
            var componentName = this.$options._ubase_component_name
            if (componentName) {
                var $body = $('body')
                setContentMinHeight($body.children('main').children('article'))
                hideLoading()

                if (this.$options.template && (this.$options.template.indexOf('emap-card') > 0 || this.$options.template.indexOf('emap-grid') > 0)) {
                    // emapcard的事件綁定
                    $(this.$el).on('click', '.card-opt-button', function (e) {
                        var row = $(this).data('row');
                        var event = $(this).attr('data-event');
                        if (row && event) {
                            if (event.indexOf('.')) {
                                Ubase.invoke(event, row)
                            } else {
                                self.$emit(event, row);
                            }
                        }
                    })
                }
            }
        }
    })

    function loadCss() {
        var publicCss = getPublicCss()
        _.each(publicCss, function (item) {
            var link = document.createElement('link')
            link.type = 'text/css'
            link.rel = 'stylesheet'
            link.href = item
            document.getElementsByTagName('head')[0].appendChild(link)
        })
    }

    function loadJs(callback) {
        var publicNormalJs = getPublicNormalJs()
        var publicBaseJs = getPublicBaseJs()

        if (publicBaseJs) {
            $script(publicBaseJs, function () {
                if (publicNormalJs) {
                    $script(publicNormalJs, function () {
                        $.jqx.data.ajaxSettings.contentType = 'application/json'
                        callback()
                    })
                } else {
                    callback()
                }

            })
        } else if (publicNormalJs) {
            $script(publicNormalJs, function () {
                callback()
            })
        } else {
            callback()
        }
    }

    function setRouterAfterEach() {
        gRouter.afterEach(function (transition) {
            gCurrentRoute = transition.to.path.substr(1)
            // showLoading()

            // 主菜单切换时， 隐藏内容区域，切换后的菜单内容组件渲染完成后会自动显示出来
            $('body>main>article>*').css('display', 'none')
            Vue.nextTick(function () {
                $('.bh-paper-pile-dialog').remove()
                $('.sc-container').removeClass('bh-border-transparent bh-bg-transparent')
                var $body = $('body')
                $body.children('[bh-footer-role=footer]').removeAttr('style')
                setContentMinHeight($body.children('main').children('article'))
                reselectHeaderNav()
                setTimeout(function () {
                    $body.children('main').children('article[bh-layout-role=navLeft]').children('section').css('width', 'initial')
                }, 10)
                try {
                    $('.jqx-window').jqxWindow('destroy')
                } catch (e) {
                    //
                }
            })

        })
    }

    function reselectHeaderNav() {
        var currentIndex = 0

        for (var i = 0; i < gRoutes.length; i++) {
            if (gRoutes[i].route === gCurrentRoute) {
                currentIndex = i + 1
                break
            }
        }

        $('header').bhHeader('resetNavActive', {
            'activeIndex': currentIndex
        })
    }

    function setContentMinHeight($setContainer) {
        if (!$setContainer) {
            return
        }
        if ($setContainer && $setContainer.length > 0) {
            var $window = $(window)
            var windowHeight = $window.height()
            var footerHeight = $('[bh-footer-role=footer]').outerHeight()
            var headerHeight = $('[bh-header-role=bhHeader]').outerHeight()
            var minHeight = windowHeight - headerHeight - footerHeight - 1
            $setContainer.css('min-height', minHeight + 'px')
        }
    }

    /**
     * ubase-vue 配置
     * */

// 框架初始化结束钩子


    // 只留页面主体部分， 用于iframe嵌入到其他页面
    function miniMode() {
        $('header').hide();
        $('footer').remove();
        $('main').css({
            'margin-top': '0',
            'max-width': 'none',
            'width': '100%',
            'padding': '0'
        });

        $(document).trigger('resize');
    }

    function getUserParams() {
        var params = {};
        var search = location.search && location.search.substr(1);

        if (search) {
            var paramsArr = search.split('&');
            _.each(paramsArr, function (item) {
                var kv = item.split('=');
                if (kv.length == 2) {
                    params[kv[0]] = kv[1];
                }
            })
        }

        return params;
    }

    function initFooter() {
        var text = gConfig['FOOTER_TEXT']
        $('body').children('footer').bhFooter({
            text: text || '版权信息：© 2015 江苏金智教育信息股份有限公司 苏ICP备10204514号'
        })
    }

    function renderHeader() {
        var headerData = gConfig['HEADER'] || {}
        var appEntry = gRoutes.length > 0 && gRoutes[0].route
        var appTitle = gConfig['APP_NAME']

        var hash = window.location.hash
        hash = hash.replace('\#\!\/', '')

        if (hash.indexOf('/') !== -1) {
            hash = hash.substring(0, hash.indexOf('/'))
        }

        if (!hash && appEntry) {
            gRouter.go('/' + appEntry)
        }
        var nav = []

        for (var i = 0; i < gRoutes.length; i++) {
            (function () {
                var navItem = {
                    title: gRoutes[i].title,
                    route: gRoutes[i].route,
                    hide: gRoutes[i].hide,
                    href: '#/' + gRoutes[i].route
                }

                nav.push(navItem)
            })()
        }

        for (var i = 0; i < nav.length; i++) {
            if (nav[i].route === (hash || appEntry)) {
                nav[i].active = true
            }
        }

        headerData['title'] = appTitle
        headerData['nav'] = nav

        $('body').children('header').bhHeader(headerData)
    }

    function setModules(routes) {
        var routers = _.keys(routes)

        _.each(routers, function (router) {
            if (!routes[router].title) {
                return
            }
            gRoutes.push({
                title: routes[router].title,
                route: router.substr(1)
            })
        })
    }

    function getCdn() {
        return gConfig['RESOURCE_SERVER'] || 'http://res.wisedu.com'
    }

    function getPublicCss() {
        var config = gConfig
        var cdn = getCdn()
        var publicCss = gResource['PUBLIC_CSS']
        var bhVersion = config['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''
        var theme = config['THEME'] || 'blue'
        var regEx = /fe_components|bower_components/
        var cssUrl = []

        for (var i = 0; i < publicCss.length; i++) {
            var url = addTimestamp(publicCss[i])
            if (regEx.test(publicCss[i])) {
                cssUrl.push(cdn + url.replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version))
            } else {
                cssUrl.push(url)
            }
        }

        return cssUrl
    }

    function getPublicNormalJs() {
        var cdn = getCdn()
        var publicNormalJs = gResource['PUBLIC_NORMAL_JS']
        var bhVersion = gConfig['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''
        var deps = []

        var regEx = /fe_components|bower_components/
        for (var i = 0; i < publicNormalJs.length; i++) {
            var url = addTimestamp(publicNormalJs[i])
            if (regEx.test(publicNormalJs[i])) {
                deps.push(cdn + url.replace(/\{\{version\}\}/, version))
            } else {
                deps.push(url)
            }
        }

        return deps
    }

    function getPublicBaseJs() {
        var cdn = getCdn()
        var publicBaseJs = gResource['PUBLIC_BASE_JS']

        var bhVersion = gConfig['BH_VERSION']
        var version = bhVersion ? ('-' + bhVersion) : ''

        var deps = []
        var regEx = /fe_components|bower_components/

        for (var i = 0; i < publicBaseJs.length; i++) {
            var url = addTimestamp(publicBaseJs[i])
            if (regEx.test(publicBaseJs[i])) {
                deps.push(cdn + url.replace(/\{\{version\}\}/, version))
            } else {
                deps.push(url)
            }
        }

        return deps
    }

    function addTimestamp(url) {
        var resourceVersion = gResource['RESOURCE_VERSION'] || (+new Date())

        return url + '?rv=' + resourceVersion
    }


    /* =================弹框类组件vue全局封装===================== */

    function tip(options, content) {
        if (options === 'hide' || options === 'close') {
            $('body>div.bh-tip').remove()
            return
        }
        if (typeof options == 'string') {
            $.bhTip({
                state: options,
                content: content
            })
        } else {
            $.bhTip(options)
        }
    }

    function toast(options, type) {
        if (options === 'hide' || options === 'close') {
            $('.bh-bhdialog-container').remove()
            return
        }

        // 如果没有指定buttons则设置默认
        if (!options.buttons && (options.okText || options.okEvent || options.cancelText || options.cancelEvent)) {
            options.buttons = [{
                text: options.okText || '确认',
                callback: typeof options.okEvent == 'function' ? options.okEvent : function (e) {
                    if (options.okEvent && options.okEvent.indexOf('.') > 0) {
                        Ubase.invoke(options.okEvent)
                    }

                    //deprecated
                    if (options.okEvent && options.okEvent.indexOf(':') > 0) {
                        gRouter.app.$broadcast(options.okEvent)
                    }
                }
            }, {
                text: options.cancelText || '取消',
                callback: typeof options.cancelEvent == 'function' ? options.cancelEvent : function (e) {
                    if (options.cancelEvent && options.cancelEvent.indexOf('.') > 0) {
                        Ubase.invoke(options.cancelEvent)
                    }

                    //deprecated
                    if (options.cancelEvent && options.cancelEvent.indexOf(':') > 0) {
                        gRouter.app.$broadcast(options.cancelEvent)
                    }
                }
            }]
        }
        $.bhDialog(options)
    }

    function propertyDialog(options) {
        var dialogRef = gRouter.app.$refs.ubase_propertydialog
        if (options === 'hide' || options === 'close') {
            $.bhPropertyDialog.hide({
                destroy: true
            })
            dialogRef && dialogRef.$destroy(false, true)
            return
        }

        gRouter.app.ubasePropertyDialog = options

        $.bhPropertyDialog.show({
            title: '<span v-html="ubasePropertyDialog.title"></span>',
            content: '<component :is="ubasePropertyDialog.currentView" v-ref:ubase_propertydialog></component>',
            footer: 'default',
            compile: function ($header, $section, $footer, $aside) {
                gRouter.app.$compile($section[0].parentElement.parentElement)
            },
            ready: function ($header, $section, $footer, $aside) {

            },
            ok: function () {
                if (options.okEvent && options.okEvent.indexOf('.') > 0) {
                    Ubase.invoke(options.okEvent)
                }

                //deprecated
                if (options.okEvent && options.okEvent.indexOf(':') > 0) {
                    gRouter.app.$broadcast(options.okEvent)
                }
                return false
            },
            hide: function () {
                dialogRef = gRouter.app.$refs.ubase_propertydialog
                dialogRef && dialogRef.$destroy(false, true)
            },
            close: function () {
                dialogRef = gRouter.app.$refs.ubase_propertydialog
                dialogRef && dialogRef.$destroy(false, true)
            },
            cancel: function () {
                dialogRef = gRouter.app.$refs.ubase_propertydialog
                dialogRef && dialogRef.$destroy(false, true)
            }
        })

        if (options.footerShow === undefined || options.footerShow === true) {
            $.bhPropertyDialog.footerShow()
        }

    }

    function paperDialog(options) {
        var dialogRef = gRouter.app.$refs.ubase_paperdialog
        if (options === 'hide' || options === 'close') {
            $.bhPaperPileDialog.hide()
            dialogRef && dialogRef.$destroy(false, true)
            return
        }

        var paperdialogElem = $('<div id="ubase-vue-temp-paperdialog-content"><component v-ref:ubase_paperdialog :is="ubasePaperDialog.currentView"></component></div>')
        gRouter.app.ubasePaperDialog = options
        gRouter.app.$compile(paperdialogElem[0])

        $.bhPaperPileDialog.show({
            title: options.title,
            content: gRouter.app.$refs.ubase_paperdialog.$options.template,
            compile: function ($header, $section, $footer, $aside) {
                var dialogRef = gRouter.app.$refs.ubase_paperdialog

                dialogRef.$el = $section[0].parentElement.parentElement
                dialogRef.$compile($section[0].parentElement.parentElement)
                // 在该场景下 vue判断ready执行时机失效 需手动执行ready方法
                dialogRef.$options.ready && dialogRef.$options.ready.forEach(function (item) {
                    item.bind(dialogRef)()
                })
            },
            close: function () {
                dialogRef = gRouter.app.$refs.ubase_paperdialog
                dialogRef && dialogRef.$destroy(false, true)
            }
        })
    }

    function dialog(options) {
        var dialogRef = gRouter.app.$refs.ubase_dialog

        if (options === 'hide' || options === 'close') {
            BH_UTILS.bhWindow.close && BH_UTILS.bhWindow.close()
            dialogRef && dialogRef.$destroy(false, true)
            return
        }
        gRouter.app.ubaseDialog = options
        var params = options.params || {}
        var title = options.title,
            content = options.content || '<component :is="ubaseDialog.currentView" v-ref:ubase_dialog></component>',
            btns = options.buttons || options.btns

        if (btns && typeof btns === 'object') {
            btns.forEach(function (item, index) {
                var callback = item.callback

                item.callback = function () {
                    if (typeof callback === 'function') {
                        callback()
                    } else if (typeof callback === 'string') {
                        Ubase.invoke(callback)
                    }
                    return false
                }
            })
        }

        if (options.width) {
            params.width = options.width
        }
        if (options.height) {
            params.height = options.height
        }
        if (options.inIframe) {
            params.inIframe = options.inIframe
        }
        params.userClose = params.close
        params.close = function () {
            dialogRef = gRouter.app.$refs.ubase_dialog
            params.userClose && params.userClose()
            dialogRef && dialogRef.$destroy(false, true)
        }

        var callback = function () {
            if (options.okEvent && options.okEvent.indexOf('.') > 0) {
                Ubase.invoke(options.okEvent)
            }

            //deprecated
            if (options.okEvent && options.okEvent.indexOf(':') > 0) {
                gRouter.app.$broadcast(options.okEvent)
            }
            return false
        }
        var win = BH_UTILS.bhWindow(content, title, btns, params, typeof options.okEvent == 'function' ? options.okEvent : callback)
        win.on('open', function () {
            gRouter.app.$compile(win[0])
            Vue.nextTick(function () {
                options.afterRendered && options.afterRendered()
            })
        })

        if (!title) {
            win.find('.jqx-window-header').remove()
        }

        return win
    }

    function pop(options) {
        var dialogRef = gRouter.app.$refs.pop_dialog

        if (options === 'hide' || options === 'close') {
            $.bhPopOver.close()
            dialogRef && dialogRef.$destroy(false, true)
            return
        }

        gRouter.app.popDialog = options
        var userClose = options.close
        options.content = options.content || '<component :is="popDialog.currentView" v-ref:pop_dialog></component>'
        options.close = function (a, b, c) {
            dialogRef = gRouter.app.$refs.pop_dialog
            dialogRef && dialogRef.$destroy(false, true)
            userClose && userClose(a, b, c)
        }

        $.bhPopOver(options)

        gRouter.app.$compile($('#bhPopover')[0])
    }

    function resetFooter() {
        Vue.nextTick(function () {
            $.bhPaperPileDialog.resetPageFooter()
            $.bhPaperPileDialog.resetDialogFooter()
        })
    }


    // deprecated
    Vue.paperDialog = paperDialog
    Vue.propertyDialog = propertyDialog
    Vue.tip = tip
    Vue.toast = toast
    Vue.dialog = dialog
    Vue.pop = pop
    Vue.resetFooter = resetFooter

    function getUserInfo() {
        return gUserInfo
    }

    // recommend
    window.Utils.paperDialog = paperDialog
    window.Utils.propertyDialog = propertyDialog
    window.Utils.tip = tip
    window.Utils.toast = toast
    window.Utils.dialog = dialog
    window.Utils.pop = pop
    window.Utils.resetFooter = resetFooter
    window.Utils.getUserInfo = getUserInfo

    /* =================/弹框类组件vue全局封装===================== */

    function post(url, body) {
        var dfd = new $.Deferred();

        Vue.http.post(url, body).then(function (res) {
            var body = res.body
            if (body.code !== '0' && body.code !== 0 && body.code !== 200) {
                dfd.reject(body)
            } else {
                dfd.resolve(body)
            }
        }, function () {
            dfd.reject({code: '99999999', message: '网络错误'})
        })

        return dfd.promise()
    }

    window.Utils.post = post


    $.ajaxSetup({
        beforeSend: function (xhr, request) {
            showLoading()
        },

        complete: function () {
            hideLoading()
        }
    })

    // vue-resource v1.0.3 中才做下面配置
    Vue.http.options.jsonp || Vue.http.interceptors.push(function (request, next) {
        if (request.body && request.body._showLoading !== false) {
            delete request.body._showLoading
            showLoading();
        } else if (request.body && request.body._showLoading === false) {
            delete request.body._showLoading
        }
        next(function (response) {
            hideLoading();
        });
    })

    // vue-resource 0.＊版做下面配置
    Vue.http.options.jsonp && Vue.http.interceptors.push({
        request: function (request) {
            showLoading();
            return request
        },
        response: function (response) {
            hideLoading();
            return response
        }
    })

    // jquery ajax setting

    $.ajaxSettings.contentType = 'application/json'

    var originParamMethod = $.param

    // 如果是get请求 则按原来方式处理 如果是post请求 则序列化为json字符串
    $.param = function (data, traditinal, source) {
        if (source && source.type == 'GET') {
            return originParamMethod(data)
        }
        if (typeof(data) == 'object') {
            return JSON.stringify(data)
        } else {
            return data
        }
    }

    /*// vue-resource v1.0.3 中才做下面配置
     Vue.http.options.jsonp || Vue.http.interceptors.push(function (request, next) {
     next(function (response) {
     var body = response.body
     if (body && body.code !== '0' && body.code !== 0 && body.code !== 200) {
     Utils.tip({
     state: 'danger',
     content: body.message || '系统错误'
     })
     }
     });
     })

     // vue-resource 0.＊版做下面配置
     Vue.http.options.jsonp && Vue.http.interceptors.push({
     request: function (request) {
     return request
     },
     response: function (response) {
     var body = response.data
     if (body && body.code !== '0' && body.code !== 0 && body.code !== 200) {
     Utils.tip({
     state: 'danger',
     content: body.message || '系统错误'
     })
     }
     return response
     }
     })*/

    _.s = JSON.stringify

})()
