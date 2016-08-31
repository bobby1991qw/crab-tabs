var tabs = document.getElementById('tabs');
if (tabs) {
    tabs = Tabs.init(tabs, {
        defaultPane: 1,    // 默认显示的pane
        position: 'bottom',
        // headWidth: '100%'
    });
}