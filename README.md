# crab-tabs
---
一个js的tab插件

## 特性
1. 支持chrome，firefox，edge，ie10+
2. 支持移动端划屏切换

##查看demo

[查看在线demo](https://github.com/bobby1991qw/crab-tabs)

1. **下载或克隆这个项目**

    `git clone https://github.com/bobby1991qw/crab-tabs.git`

2. **安装依赖**

    `npm install`

3. **打开调试**

    `gulp dev`

##用法
1. **html结构**

        <div id="tabs" class="crab-tabs">
            <ul class="crab-headers">
                <li class="crab-head">标题1</li>
                <li class="crab-head">标题2</li>
                <li class="crab-head">标题3</li>
                <li class="crab-head">标题4</li>
            </ul>
    
            <div class="crab-panes">
                <div class="crab-pane">
                    1
                </div>
                <div class="crab-pane">
                    2
                <div class="crab-pane">
                    3
                </div>
                <div class="crab-pane">
                    4
                </div>
            </div>
        </div>
        
2. **js代码**

        var tabs = document.getElementById('tabs');

        if(tabs){
            tabs = Tabs.init(tabs, {
                defaultPane: 1,         // 默认显示的pane,默认为0
                position: 'bottom',     // tab头的位置,允许的值为top|bottom，默认为top
                headCls: 'crab-head',   // tab头的className，默认为crab-head。多个值用逗号隔开，如“crab-head,test”
                headWidth: '100px',     // tab头的宽度，默认为true，将会平分整个宽度
                slideable: false        // 允许滑动开关，移动端可用。默认打开
            });
        }