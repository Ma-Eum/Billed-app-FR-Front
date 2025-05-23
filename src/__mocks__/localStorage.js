export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store.hasOwnProperty(key) ? store[key] : null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();