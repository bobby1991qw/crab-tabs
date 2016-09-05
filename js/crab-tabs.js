'use strict';

;(function (window, undefined) {
    function Tabs() {
        var utils = {
            createElement: function createElement(tagName, attrs) {
                var ele = window.document.createElement(tagName);

                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        var attribute = attrs[key];
                        ele[key] = attribute;
                    }
                }

                return ele;
            },
            extends: function _extends(dest, source) {
                var args = [].slice.call(arguments, 0);

                if (args.length > 2) {
                    return this.extends.apply(this, args.slice(1));
                } else {
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            var value = source[key];
                            dest[key] = value;
                        }
                    }

                    return dest;
                }
            },
            getAgent: function getAgent() {
                var userAgent = navigator.userAgent;
                var mobilePattern = /mobile/i;

                return {
                    mobile: mobilePattern.test(userAgent)
                };
            },

            /**
             * 注册事件
             * @param ele {Node|NodeList|NodeSelector} DESC: bind event's node  
             * @param type DESC: event type
             * @param childSelector [optional]  DESC: child node selector, usage like $(parent).on('click', child, cb)
             * @param callback DESC: call back
             */
            addEventListener: function addEventListener(ele, type, childSelector, callback) {
                var delegate = true;
                var isMobile = this.isMobile || (this.mobile = this.getAgent().mobile);

                if (!ele) {
                    throw new Error('绑定事件错误！未提供DOM节点');
                }

                // 修正ele为 [node, node, ...]的形式
                if (typeof ele === 'string') {
                    ele = window.document.querySelectorAll(ele);
                }

                if (ele.length) {
                    ele = Array.from(ele);
                }

                ele = [].concat(ele);

                if (ele[0].nodeType !== 1) {
                    throw new Error('初始化失败！错误的元素' + ele + '，ele参数必须是DOM节点或可以查找到节点的选择器');
                }

                // 判断是否使用事件代理，不使用时修正参数
                if (!callback) {
                    delegate = false;
                    callback = childSelector;
                }

                // 针对mobile的优化
                if (isMobile) {
                    type = {
                        click: 'touchend'
                    }[type] || type;
                }

                if (delegate) {
                    // 事件代理
                    ele.forEach(function (e) {
                        e.addEventListener(type, function () {
                            event.preventDefault();
                            event.stopPropagation();
                            var children = ele.querySelectorAll(childTagName);

                            children.forEach(function (child, i) {
                                if (child === event.target) {
                                    callback();
                                    return true;
                                }
                            });

                            return false;
                        });
                    });
                } else {
                    // 非代理
                    ele.forEach(function (e) {
                        e.addEventListener(type, callback);
                    });
                }
            }
        };

        var data = {
            prevPane: 0, // 上次的tab
            activePane: 0, // 激活的tab
            changePane: function changePane(index) {
                this.prevPane = this.activePane;
                this.activePane = index;
            }
        };

        var ui = {
            root: undefined,
            unitPattern: /\d+([\w%]+)/i,
            defaults: {
                defaultPane: 0, // 默认显示的pane
                headCls: 'crab-head', // 默认的tabHead类名，可以修改成别的类名来重写样式，也可以扩展成"crab-head,xxx"的形式来扩展样式, 多个类名之间用逗号隔开
                position: 'top', // tabheader的位置  top|bottom
                headWidth: true, // head的宽度, 默认为true(表示平分width), 可以设置成100px,90%的形式 
                slideable: true },
            /**
             * @param ele {node|nodeSelector} DESC: tabs root node
             * @param opts {object} DESC: options of tabs [optional]
             * @return tabs {object} DESC: contains root, some APIs
             */
            initUI: function initUI(ele) {
                var _this = this;

                var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                if (!ele) {
                    throw new Error('初始化失败！未找到指定元素，ele参数必须是DOM节点或可以查找到节点的选择器');
                }

                // 修正ele
                if (typeof ele === 'string') {
                    ele = window.document.querySelector(ele);
                }

                if (ele.nodeType !== 1) {
                    throw new Error('初始化失败！错误的元素' + ele + '，ele参数必须是DOM节点或可以查找到节点的选择器');
                }

                var root = this.root = ele,
                    options = this.opts = utils.extends({}, this.defaults, opts),
                    headers = this.headers = [].slice.call(ele.querySelectorAll('.' + this.defaults.headCls), 0),
                    headWidth = this.headWidth = options.headWidth === true ? 100 / headers.length + '%' : options.headWidth,
                    dynamicStyle = utils.createElement('style', { id: 'dynamicStyle' }),
                    style = utils.createElement('style', {
                    innerText: ['.crab-headers:after{ width: ' + headWidth + ' ; ' + { top: 'bottom: 0', bottom: 'top: 0' }[options.position] + ' }', '.crab-head{width: ' + headWidth + '}', utils.isMobile && '.crab-panes{ transform: translateX(' + -options.defaultPane * 100 + '%) }', '.crab-tabs{ flex-direction:' + { top: 'column', bottom: 'column-reverse' }[options.position] + ' }'].join('')
                });

                data.changePane(options.defaultPane);

                // 判断是否移动端
                utils.isMobile || (utils.isMobile = utils.getAgent().mobile) && root.classList.add('mobile');

                headers.forEach(function (h, i) {
                    h.classList.remove('crab-head');

                    //  修正head类名                  
                    options.headCls.split(',').forEach(function (cls) {
                        h.classList.add(cls);
                    });

                    if (i === options.defaultPane) {
                        var pane = root.querySelectorAll('.crab-pane')[i];
                        // 设置默认显示的pane 
                        h.classList.add('active');
                        pane.style.top = 0;
                        pane.classList.add('active');

                        dynamicStyle.innerText = _this.createChangeStyle();
                    }
                });

                window.document.head.appendChild(style);
                style.innerText += ['.crab-panes{ height: ' + (root.scrollHeight - root.querySelector('.crab-headers').scrollHeight) + 'px }', '.crab-pane{height: 100%}'].join('');
                window.document.head.appendChild(dynamicStyle);
            },
            changePane: function changePane() {
                var _this2 = this;

                var options = this.opts;
                var headers = ui.headers;
                var dynamicStyle = window.document.getElementById('dynamicStyle'),
                    styles = [this.createChangeStyle()];

                if (utils.isMobile) {
                    // 移动端
                    styles = styles.concat('.crab-panes{ transform: translateX(' + -data.activePane * 100 + '%) }');
                } else {
                    (function () {
                        // pc端
                        var direct = data.prevPane - data.activePane,
                            panes = _this2.root.querySelectorAll('.crab-pane');

                        // 旧的tab消失    
                        panes[data.prevPane].style.transform = 'translateX(' + direct * 10 + '%)';
                        setTimeout(function () {
                            panes[data.prevPane].style.top = '120%';
                        }, 250);
                        panes[data.prevPane].classList.remove('active');

                        // 新的tab出现
                        panes[data.activePane].style.transform = 'translateX(0)';
                        panes[data.activePane].style.top = 0;
                        panes[data.activePane].classList.add('active');
                    })();
                }

                dynamicStyle.innerText = styles.join('');
                this.headers[data.prevPane].classList.remove('active');
                this.headers[data.activePane].classList.add('active');
            },
            slidePane: function slidePane(direct) {
                if (data.activePane === 0 && direct === -1 || data.activePane === this.headers.length - 1 && direct === 1) {
                    return false;
                }

                ctrl.changePane(data.activePane + direct);
                return true;
            },
            createChangeStyle: function createChangeStyle() {
                var options = this.opts,
                    headers = this.headers;
                return '.crab-headers:after{ left: ' + data.activePane * (parseInt(options.headWidth) || 100 / headers.length) + (options.headWidth === true ? '%' : options.headWidth.match(this.unitPattern)[1]) + '}';
            }
        };

        var ctrl = {
            init: function init(ele, opts) {
                ui.initUI(ele, opts);
                data.changePane(ui.opts.defaultPane);
                ctrl.bindEvent();

                return this;
            },
            bindEvent: function bindEvent() {
                var headers = ui.headers;
                headers.forEach(function (head, i) {
                    utils.addEventListener(head, 'click', function () {
                        console.log(1);
                        data.changePane(i);
                        ui.changePane();
                    });
                });

                if (ui.opts.slideable) {
                    var panes = ui.root.querySelector('.crab-panes');
                    utils.addEventListener(panes, 'touchstart', function () {
                        ui.startX = event.touches[0].clientX;
                    });

                    utils.addEventListener(panes, 'touchend', function () {
                        var endX = event.changedTouches[0].clientX;
                        var distance = endX - ui.startX;

                        if (Math.abs(distance) > 50) {
                            var direct = distance > 0 ? -1 : 1;
                            ui.slidePane(direct);
                        }
                    });
                }
            },
            changePane: function changePane(i) {
                if (i >= ui.headers.length) {
                    throw new Error('索引超出范围');
                }
                data.changePane(i);
                ui.changePane();
            },
            getCurrentIndex: function getCurrentIndex() {
                return data.activePane;
            },
            getCurrentPane: function getCurrentPane() {
                return ui.root.querySelectorAll('.crab-pane')[data.activePane];
            }
        };

        this.init = ctrl.init;
        this.root = ui.root;
        this.changePane = ctrl.changePane;
        this.getCurrentIndex = ctrl.getCurrentIndex;
        this.getCurrentPane = ctrl.getCurrentPane;
    }

    window.Tabs = new Tabs();
})(window);