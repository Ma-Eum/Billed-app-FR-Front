import $ from 'jquery';

// Configure jQuery globalement pour les tests
global.$ = global.jQuery = $;

// Mock de la méthode `.modal` utilisée dans vos tests
$.fn.modal = jest.fn(() => {
  console.log("Mock modal triggered");
});
