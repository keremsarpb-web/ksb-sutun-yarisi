// Web sürümü: oyunun arayüzünü sunucu yerine tarayıcıdaki LocalServer'a bağlar
(() => {
  const base = window.game;
  window.game = function () {
    const g = base();
    g.token = LocalServer.hasPlayer() ? LocalServer.TOKEN : '';
    g.authTab = 'register';
    g.api = async function (action, body = {}) {
      try {
        return await LocalServer.handle(action, body);
      } catch (e) {
        const err = new Error(e.message || 'Hata');
        err.status = e.status;
        throw err;
      }
    };
    return g;
  };
})();
