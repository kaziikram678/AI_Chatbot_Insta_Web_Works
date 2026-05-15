(function() {
  if (window.__IWW_CHATBOT_LOADED__) return;
  window.__IWW_CHATBOT_LOADED__ = true;

  var CHATBOT_URL = 'https://instawebworks-chatbot.vercel.app';
  var IFRAME_ID = 'iww-chatbot-iframe';
  var TOGGLE_ID = 'iww-chatbot-toggle';
  var IS_OPEN = false;

  var style = document.createElement('style');
  style.textContent = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");';
  document.head.appendChild(style);

  var toggleBtn = document.createElement('button');
  toggleBtn.id = TOGGLE_ID;
  toggleBtn.setAttribute('aria-label', 'Open chat');
  toggleBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;width:60px;height:60px;border-radius:50%;background:#2563eb;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.4);transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;';
  toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  toggleBtn.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.08)'; });
  toggleBtn.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
  document.body.appendChild(toggleBtn);

  var iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.src = CHATBOT_URL + '/embed';
  iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;width:380px;max-width:calc(100vw - 40px);height:550px;max-height:calc(100vh - 40px);border:none;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12);display:none;overflow:hidden;background:#fff;';
  document.body.appendChild(iframe);

  toggleBtn.addEventListener('click', function() {
    IS_OPEN = !IS_OPEN;
    iframe.style.display = IS_OPEN ? 'block' : 'none';
    this.style.display = IS_OPEN ? 'none' : 'flex';
    if (IS_OPEN) this.setAttribute('aria-hidden', 'true');
  });

  window.addEventListener('message', function(e) {
    if (e.data === 'iww-close-chat') {
      IS_OPEN = false;
      iframe.style.display = 'none';
      toggleBtn.style.display = 'flex';
      toggleBtn.setAttribute('aria-hidden', 'false');
    }
  });

  var mediaQuery = window.matchMedia('(max-width: 480px)');
  function handleResize(mq) {
    if (mq.matches) {
      iframe.style.width = 'calc(100vw - 24px)';
      iframe.style.height = 'calc(100vh - 80px)';
      iframe.style.bottom = '12px';
      iframe.style.right = '12px';
      toggleBtn.style.bottom = '12px';
      toggleBtn.style.right = '12px';
      toggleBtn.style.width = '52px';
      toggleBtn.style.height = '52px';
    } else {
      iframe.style.width = '380px';
      iframe.style.height = '550px';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      toggleBtn.style.bottom = '20px';
      toggleBtn.style.right = '20px';
      toggleBtn.style.width = '60px';
      toggleBtn.style.height = '60px';
    }
  }
  mediaQuery.addListener(handleResize);
  handleResize(mediaQuery);
})();
