; (function (window, undefined) {
    function Tabs() {
        const utils = {
            createElement(tagName, attrs) {
                const ele = window.document.createElement(tagName);

                for (let key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        const attribute = attrs[key];
                        ele[key] = attribute;
                    }
                }

                return ele;
            },
            extends(dest, source) {
                const args = [].slice.call(arguments, 0);

                if (args.length > 2) {
                    return this.extends.apply(this, args.slice(1))
                } else {
                    for (let key in source) {
                        if (source.hasOwnProperty(key)) {
                            const value = source[key];
                            dest[key] = value;
                        }
                    }

                    return dest;
                }
            },
            getAgent() {
                const userAgent = navigator.userAgent;
                const mobilePattern = /mobile/i;

                return {
                    mobile: mobilePattern.test(userAgent)
                }
            },
            /**
             * 注册事件
             * @param ele {Node|NodeList|NodeSelector} DESC: bind event's node  
             * @param type DESC: event type
             * @param childSelector [optional]  DESC: child node selector, usage like $(parent).on('click', child, cb)
             * @param callback DESC: call back
             */
            addEventListener(ele, type, childSelector, callback) {
                let delegate = true;
                const isMobile = this.isMobile || (this.mobile = this.getAgent().mobile);

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
                    throw new Error(`初始化失败！错误的元素${ele}，ele参数必须是DOM节点或可以查找到节点的选择器`);
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
                    ele.forEach((e) => {
                        e.addEventListener(type, () => {
                            event.preventDefault();
                            event.stopPropagation();
                            const children = ele.querySelectorAll(childTagName);

                            children.forEach((child, i) => {
                                if (child === event.target) {
                                    callback();
                                    return true;
                                }

                            });

                            return false;
                        });
                    })
                } else {
                    // 非代理
                    ele.forEach((e) => {
                        e.addEventListener(type, callback);
                    })

                }
            }
        }

        const data = {
            prevPane: 0,    // 上次的tab
            activePane: 0,  // 激活的tab
            changePane(index) {
                this.prevPane = this.activePane;
                this.activePane = index;
            }
        };

        const ui = {
            root: undefined,
            unitPattern: /\d+([\w%]+)/i,
            defaults: {
                defaultPane: 0,         // 默认显示的pane
                headCls: 'crab-head',   // 默认的tabHead类名，可以修改成别的类名来重写样式，也可以扩展成"crab-head,xxx"的形式来扩展样式, 多个类名之间用逗号隔开
                position: 'top',        // tabheader的位置  top|bottom
                headWidth: true,        // head的宽度, 默认为true(表示平分width), 可以设置成100px,90%的形式 
                slideable: true,        // 设置是否可滑动  
            },
            /**
             * @param ele {node|nodeSelector} DESC: tabs root node
             * @param opts {object} DESC: options of tabs [optional]
             * @return tabs {object} DESC: contains root, some APIs
             */
            initUI(ele, opts = {}) {
                if (!ele) {
                    throw new Error('初始化失败！未找到指定元素，ele参数必须是DOM节点或可以查找到节点的选择器');
                }

                // 修正ele
                if (typeof ele === 'string') {
                    ele = window.document.querySelector(ele);
                }

                if (ele.nodeType !== 1) {
                    throw new Error(`初始化失败！错误的元素${ele}，ele参数必须是DOM节点或可以查找到节点的选择器`);
                }

                const root = this.root = ele,
                    options = this.opts = utils.extends({}, this.defaults, opts),
                    headers = this.headers = [].slice.call(ele.querySelectorAll(`.${this.defaults.headCls}`), 0),
                    headWidth = this.headWidth = options.headWidth === true ? `${100 / headers.length}%` : options.headWidth,
                    dynamicStyle = utils.createElement('style', { id: 'dynamicStyle' }),
                    style = utils.createElement('style', {
                        innerText: [`.crab-headers:after{ width: ${headWidth} ; ${{ top: 'bottom: 0', bottom: 'top: 0' }[options.position]} }`,
                            `.crab-head{width: ${headWidth}}`,
                            utils.getAgent().mobile && `.crab-panes{ transform: translateX(${-options.defaultPane * 100}%) }`,
                            `.crab-tabs{ flex-direction:${{ top: 'column', bottom: 'column-reverse' }[options.position]} }`,
                        ].join('')
                    });

                data.changePane(options.defaultPane);

                // 判断是否移动端
                utils.isMobile || (utils.isMobile = utils.getAgent().mobile) && root.classList.add('mobile');

                headers.forEach((h, i) => {
                    h.classList.remove('crab-head');

                    //  修正head类名                  
                    options.headCls.split(',').forEach((cls) => {
                        h.classList.add(cls);
                    });

                    if (i === options.defaultPane) {
                        const pane = root.querySelectorAll('.crab-pane')[i];
                        // 设置默认显示的pane 
                        h.classList.add('active');
                        pane.style.top = 0;
                        pane.classList.add('active');

                        dynamicStyle.innerText = this.createChangeStyle();
                    }
                });

                window.document.head.appendChild(style);
                style.innerText += [
                    `.crab-panes{ height: ${root.scrollHeight - root.querySelector('.crab-headers').scrollHeight}px }`,
                    '.crab-pane{height: 100%}'
                ].join('');
                window.document.head.appendChild(dynamicStyle);
            },
            changePane() {
                const options = this.opts;
                const headers = ui.headers;
                let dynamicStyle = window.document.getElementById('dynamicStyle'),
                    styles = [this.createChangeStyle()];

                if (utils.isMobile) {
                    // 移动端
                    styles = styles.concat(`.crab-panes{ transform: translateX(${-data.activePane * 101}%) }`);
                } else {
                    // pc端
                    const direct = data.prevPane - data.activePane,
                        panes = this.root.querySelectorAll('.crab-pane');

                    // 旧的tab消失    
                    panes[data.prevPane].style.transform = `translateX(${direct * 10}%)`;
                    panes[data.prevPane].style.zIndex = 1;
                    panes[data.prevPane].classList.remove('active');

                    // 新的tab出现
                    panes[data.activePane].style.transform = 'translateX(0)';
                    panes[data.activePane].style.zIndex = 9999;
                    panes[data.activePane].classList.add('active');
                }

                dynamicStyle.innerText = styles.join('');
                this.headers[data.prevPane].classList.remove('active');
                this.headers[data.activePane].classList.add('active');
            },
            slidePane(direct) {
                if (data.activePane === 0 && direct === -1 || data.activePane === this.headers.length - 1 && direct === 1) {
                    return false;
                }

                ctrl.changePane(data.activePane + direct);
                return true;
            },
            createChangeStyle() {
                const options = this.opts,
                    headers = this.headers;
                return `.crab-headers:after{ left: ${data.activePane * (parseInt(options.headWidth) || 100 / headers.length)}${options.headWidth === true ? '%' : options.headWidth.match(this.unitPattern)[1]}}`;
            }
        };

        const ctrl = {
            init(ele, opts) {
                ui.initUI(ele, opts);
                data.changePane(ui.opts.defaultPane);
                ctrl.bindEvent();

                return this;
            },
            bindEvent() {
                const headers = ui.headers;
                headers.forEach((head, i) => {
                    utils.addEventListener(head, 'click', () => {
                        if (data.activePane !== i) {
                            data.changePane(i);
                            ui.changePane();
                        }
                    });
                });

                if (ui.opts.slideable) {
                    const panes = ui.root.querySelector('.crab-panes');
                    utils.addEventListener(panes, 'touchstart', function () {
                        ui.startX = event.touches[0].clientX;
                    });

                    utils.addEventListener(panes, 'touchend', function () {
                        const endX = event.changedTouches[0].clientX;
                        const distance = endX - ui.startX;

                        if (Math.abs(distance) > 50) {
                            const direct = distance > 0 ? -1 : 1;
                            ui.slidePane(direct);
                        }
                    });
                }
            },
            changePane(i) {
                if (i >= ui.headers.length) {
                    throw new Error('索引超出范围');
                }
                data.changePane(i);
                ui.changePane();
            },
            getCurrentIndex() {
                return data.activePane;
            },
            getCurrentPane() {
                return ui.root.querySelectorAll('.crab-pane')[data.activePane];
            }
        }

        this.init = ctrl.init;
        this.root = ui.root;
        this.changePane = ctrl.changePane;
        this.getCurrentIndex = ctrl.getCurrentIndex;
        this.getCurrentPane = ctrl.getCurrentPane;
    }

    window.Tabs = new Tabs();
})(window);