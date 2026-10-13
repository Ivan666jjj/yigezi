/*! 访问统计 —— 零依赖、零注册、零后端
 *
 *  做两件事：
 *    ① 显示访客是从哪来的（不蒜子只给总数，不给来源）
 *    ② 用 Abacus 做一份自建计数，按来源分桶存下来
 *
 *  页面里需要先有这些元素（不蒜子要静态找到它们才会填数字）：
 *    <div id="visit-stats">
 *      本页被看过 <b><span id="busuanzi_value_page_pv">…</span></b> 次 ·
 *      <b><span id="busuanzi_value_site_uv">…</span></b> 位访客 ·
 *      来源 <span id="stat-source">检测中</span>
 *    </div>
 *    <script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
 *    <script src="stats.js" defer></script>
 *
 *  隐私：不采集 IP、不种 cookie、不识别个人身份，只做计数。
 */
(function () {
  'use strict';

  // ⚠️ Abacus 的命名空间和 key 都不能含 . 或 /（会返回 308 重定向，计数静默丢失）
  //    所以这里用连字符拼接，不要改成域名形式。
  var NS = 'ivan666jjj-yigezi';
  var ABACUS = 'https://abacus.jasoncameron.dev/hit/';

  var NAMES = {
    'direct':       '直接访问',
    'indep-list':   '独立开发者列表',
    'weekly':       '阮一峰周刊',
    'hellogithub':  'HelloGitHub',
    'xiaohongshu':  '小红书',
    'im':           '微信 / QQ',
    'search':       '搜索引擎',
    'github':       'GitHub',
    'github-other': 'GitHub 其他页',
    'internal':     '站内跳转',
    'other':        '其他站点'
  };

  function detectSource() {
    var q = null;
    try { q = new URLSearchParams(location.search); } catch (e) {}
    if (q && q.get('from')) {                       // 链接上手动标了 ?from=xxx
      return String(q.get('from')).slice(0, 32).replace(/[^a-zA-Z0-9_-]/g, '');
    }
    var r = document.referrer || '';
    if (!r) return 'direct';
    if (/1c7\/chinese-independent-developer/i.test(r))  return 'indep-list';
    if (/ruanyf\/weekly/i.test(r))                      return 'weekly';
    if (/hellogithub/i.test(r))                         return 'hellogithub';
    if (/xiaohongshu|xhslink/i.test(r))                 return 'xiaohongshu';
    if (/weixin|wechat|qq\.com|qzone|douyin/i.test(r))  return 'im';
    if (/baidu\.|bing\.|google\.|sogou\.|so\.com/i.test(r)) return 'search';
    if (/github\.com/i.test(r))                         return 'github-other';
    try {
      return new URL(r).hostname === location.hostname ? 'internal' : 'other';
    } catch (e) { return 'other'; }
  }

  var src = detectSource();

  // 显示来源
  function showSource() {
    var el = document.getElementById('stat-source');
    if (el) el.textContent = NAMES[src] || src;
  }

  // 计数（失败不影响任何功能）
  function ping(key) {
    try {
      var p = fetch(ABACUS + NS + '/' + encodeURIComponent(key),
                    { mode: 'cors', cache: 'no-store' });
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function run() {
    showSource();
    ping('total');
    ping('src-' + src);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
