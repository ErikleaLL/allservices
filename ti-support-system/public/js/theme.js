/* ════════════════════════════════════════════════════════════
   ALLSERVICES — GERENCIADOR DE TEMA (LIGHT / DARK)
   Persiste a escolha no localStorage
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEY = 'allservices-theme';
  const DEFAULT_THEME = 'light';

  /* ─── Aplica o tema ANTES da página renderizar (evita flash) ─── */
  const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', savedTheme);

  /* ─── Quando o DOM carregar, ativa o botão e ícones ─── */
  document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn   = document.getElementById('themeToggle');
    const iconSun     = document.getElementById('themeIconSun');
    const iconMoon    = document.getElementById('themeIconMoon');
    const labelText   = document.getElementById('themeLabel');

    if (!toggleBtn) return; // segurança caso o botão não exista em alguma view

    /* ─── Atualiza visual do botão conforme o tema atual ─── */
    function updateButtonUI(theme) {
      if (theme === 'dark') {
        if (iconSun)   iconSun.style.display   = 'inline-block';
        if (iconMoon)  iconMoon.style.display  = 'none';
        if (labelText) labelText.textContent   = 'Tema Claro';
      } else {
        if (iconSun)   iconSun.style.display   = 'none';
        if (iconMoon)  iconMoon.style.display  = 'inline-block';
        if (labelText) labelText.textContent   = 'Tema Escuro';
      }
    }

    /* Inicializa visual */
    updateButtonUI(savedTheme);

    /* ─── Clique no botão alterna tema ─── */
    toggleBtn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
      const next    = current === 'dark' ? 'light' : 'dark';

      /* Anima o ícone */
      toggleBtn.classList.add('theme-toggle--spinning');
      setTimeout(() => toggleBtn.classList.remove('theme-toggle--spinning'), 400);

      /* Aplica novo tema */
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);

      /* Atualiza UI do botão */
      updateButtonUI(next);

      /* Feedback toast (se função existir globalmente) */
      if (typeof showToast === 'function') {
        showToast(
          next === 'dark' ? '🌙 Tema escuro ativado' : '☀️ Tema claro ativado',
          'success'
        );
      }

      /* Dispara evento custom para outras partes do sistema ouvirem */
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    });
  });

  /* ─── Função global para outras páginas consultarem o tema ─── */
  window.getCurrentTheme = function () {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  };

  /* ─── Função global para forçar tema (útil em configurações) ─── */
  window.setTheme = function (theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

})();
