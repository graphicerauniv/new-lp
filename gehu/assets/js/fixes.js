// fixes.js - robust UI behavior for Apply (mobile-only), Back-to-top, Smooth scroll, Ripple, Positioning
(function () {
  'use strict';

  const FORM_SELECTOR = '#apply-form';
  const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
  const SHOW_AFTER_PX = 800; // ✅ UPDATED: Shows back-to-top button after scrolling 800px

  const isMobile = () => window.matchMedia && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  const qs = (sel) => document.querySelector(sel);

  function safeAddListener(el, event, handler, opts) { if (!el) return; el.addEventListener(event, handler, opts); }

  function smoothScrollToElement(el, opts = { behavior: 'smooth', block: 'center' }) {
    if (!el) return;
    try { el.scrollIntoView(opts); } catch (e) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }); }
  }

  function initBackToTop(backBtn) {
    if (!backBtn) return;
    function update() { if (window.scrollY > SHOW_AFTER_PX) backBtn.classList.add('show'); else backBtn.classList.remove('show'); }
    safeAddListener(backBtn, 'click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); this.blur && this.blur(); });
    safeAddListener(backBtn, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click && this.click(); } });
    let ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { window.requestAnimationFrame(function () { update(); ticking = false; }); ticking = true; } }, { passive: true });
    update();
  }

  function initApplyButton(applyBtn) {
    if (!applyBtn) return;
    const form = qs(FORM_SELECTOR);
    safeAddListener(applyBtn, 'click', function (e) {
      const href = this.getAttribute && this.getAttribute('href');
      if (href && href.startsWith('#') && form) { e.preventDefault(); smoothScrollToElement(form); }
    });
    safeAddListener(applyBtn, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click && this.click(); } });

    if (form && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { applyBtn.classList.remove('show'); }
          else { if (isMobile()) applyBtn.classList.add('show'); else applyBtn.classList.remove('show'); }
        });
      }, { threshold: 0.25 });
      try { obs.observe(form); } catch (e) { applyBtn.classList.remove('show'); }
      window.addEventListener('resize', function () {
        if (!form) return; const rect = form.getBoundingClientRect(); const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView && isMobile()) applyBtn.classList.add('show'); else applyBtn.classList.remove('show');
      });
    } else {
      window.addEventListener('scroll', function () {
        if (!isMobile()) { applyBtn.classList.remove('show'); return; }
        if (window.scrollY > SHOW_AFTER_PX) applyBtn.classList.add('show'); else applyBtn.classList.remove('show');
      }, { passive: true });
    }
  }

  function initRippleForElements(elements) {
    if (!elements || !elements.length) return;
    function createRipple(event, el) {
      if (event.button && event.button !== 0) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span'); ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 1.2; ripple.style.width = ripple.style.height = size + 'px';
      const clientX = event.clientX !== undefined ? event.clientX : (rect.left + rect.width / 2);
      const clientY = event.clientY !== undefined ? event.clientY : (rect.top + rect.height / 2);
      const x = clientX - rect.left - (size / 2); const y = clientY - rect.top - (size / 2);
      ripple.style.left = x + 'px'; ripple.style.top = y + 'px'; el.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
      setTimeout(function () { try { ripple.remove(); } catch (e) {} }, 900);
    }
    elements.forEach(function (el) { if (!el) return; safeAddListener(el, 'pointerdown', function (e) { createRipple(e, el); }); safeAddListener(el, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const rect = el.getBoundingClientRect(); createRipple({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, button: 0 }, el); } }); });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const applyBtn = qs('#floatingApply'); const backBtn = qs('#backToTop');
    initBackToTop(backBtn); initApplyButton(applyBtn); initRippleForElements([].concat(applyBtn || [], backBtn || []).filter(Boolean));
  });

  // Positioning helper appended separately (if present)
})();

/* Position Back-to-top in sync with page content */
(function() {
  const containerSelectors = ['.container','.site-container','.site-content','#main','.content','.wrap','.page-wrapper','.container-lg','.page-container','.inner-wrapper'];
  function findContainer(){ for(const s of containerSelectors){ const el=document.querySelector(s); if(el) return el;} const mainEl=document.querySelector('main, article, #primary'); if(mainEl) return mainEl; return null; }
  function positionBackButton(){ const backBtn=document.getElementById('backToTop'); if(!backBtn) return; const edgeMargin=16; const isRTL=document.documentElement && document.documentElement.dir==='rtl'; const container=findContainer(); if(!container){ backBtn.style.right=null; backBtn.style.left=null; backBtn.style[isRTL?'left':'right']=edgeMargin+'px'; return; } const rect=container.getBoundingClientRect(); const gapRight=Math.max(0, window.innerWidth-(rect.left+rect.width)); const gapLeft=Math.max(0, rect.left); const offset=Math.max(edgeMargin, (isRTL?gapLeft:gapRight)+edgeMargin); if(window.innerWidth<=480){ backBtn.style.right=null; backBtn.style.left=null; backBtn.style[isRTL?'left':'right']=edgeMargin+'px'; return; } backBtn.style.right=null; backBtn.style.left=null; backBtn.style[isRTL?'left':'right']=offset+'px'; }
  function debounce(fn,wait){ let t=null; return function(){ const a=arguments; clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),wait); }; }
  document.addEventListener('DOMContentLoaded', function(){ positionBackButton(); window.addEventListener('resize', debounce(positionBackButton,120),{passive:true}); window.addEventListener('orientationchange', debounce(positionBackButton,120),{passive:true}); try{ const observer=new MutationObserver(debounce(positionBackButton,200)); observer.observe(document.body,{childList:true,subtree:true,attributes:true}); }catch(e){} });
  window.addEventListener('load', function(){ positionBackButton(); }, { passive: true });
})();

