/* Ceenor AIOS — password gate (đặt <script src="gate.js"></script> NGAY ĐẦU <head> của dashboard).
   - Hiện overlay nhập mật khẩu khi mở trang.
   - Tự chèn ?key=<mật khẩu> vào MỌI request tới n8n → webhook kiểm mật khẩu mới trả dữ liệu.
   - Mật khẩu do người dùng gõ (lưu sessionStorage), KHÔNG nằm trong source. */
(function(){
  var N8N = 'srv-lhzd2.auto.123host.asia';
  function key(){ return sessionStorage.getItem('ceenor_key') || ''; }
  var _f = window.fetch.bind(window);
  window.fetch = function(url, opts){
    try{
      var s = (typeof url === 'string') ? url : (url && url.url) || '';
      if (s.indexOf(N8N) > -1 && s.indexOf('/webhook/ceenor-auth') < 0){
        url = s + (s.indexOf('?') > -1 ? '&' : '?') + 'key=' + encodeURIComponent(key());
      }
    }catch(e){}
    return _f(url, opts);
  };
  function gate(){
    if (document.getElementById('ceenor-gate')) return;
    var d = document.createElement('div'); d.id = 'ceenor-gate';
    d.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#1c1530;color:#fff;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
    d.innerHTML = '<div style="background:#241a3c;padding:30px;border-radius:16px;width:320px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)">'
      + '<div style="font-size:20px;font-weight:800">◆ Ceenor AIOS</div>'
      + '<div style="font-size:13px;color:#9b90b5;margin:6px 0 16px">Nhập mật khẩu để truy cập</div>'
      + '<input id="cg-pw" type="password" placeholder="Mật khẩu" style="width:100%;padding:11px;border-radius:9px;border:1px solid #3a2c5e;background:#1c1530;color:#fff;font-size:14px;box-sizing:border-box">'
      + '<div id="cg-err" style="color:#ff8a8a;font-size:12px;height:16px;margin-top:6px"></div>'
      + '<button id="cg-go" style="width:100%;margin-top:6px;padding:11px;border:0;border-radius:9px;background:#7c3aed;color:#fff;font-weight:700;cursor:pointer">Vào</button></div>';
    document.body.appendChild(d);
    function go(){
      var pw = document.getElementById('cg-pw').value;
      _f('https://' + N8N + '/webhook/ceenor-auth', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'key=' + encodeURIComponent(pw)})
        .then(function(r){ return r.json(); })
        .then(function(j){
          if (j && j.ok){ sessionStorage.setItem('ceenor_key', pw); d.remove(); if (window.loadCRM){ try{ window.loadCRM(true); }catch(e){} } }
          else document.getElementById('cg-err').textContent = 'Sai mật khẩu';
        })
        .catch(function(){ document.getElementById('cg-err').textContent = 'Lỗi kết nối'; });
    }
    document.getElementById('cg-go').onclick = go;
    document.getElementById('cg-pw').addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
    document.getElementById('cg-pw').focus();
  }
  function start(){ if (!key()) gate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
