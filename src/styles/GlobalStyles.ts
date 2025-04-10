import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }

  input, button, textarea, select {
    font: inherit;
  }

  p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
  }

  #root, #__next {
    isolation: isolate;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* React Toastify Özelleştirmeleri */
  .Toastify__toast {
    font-family: inherit; /* Global font ailesini kullan */
    border-radius: 6px; /* Daha yumuşak köşeler */
    padding: 8px 12px; /* Daha kompakt padding */
    min-height: auto; /* Minimum yüksekliği kaldır */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); /* Hafif gölge */
  }

  .Toastify__toast-body {
    font-size: 0.85rem; /* Daha küçük font boyutu */
    margin: 0; /* Varsayılan margin'i kaldır */
    padding: 0; /* Varsayılan padding'i kaldır */
    line-height: 1.4; /* Satır yüksekliğini ayarla */
    display: flex; /* İkon ve metni yan yana getirmek için */
    align-items: center; /* Dikey hizalama */
  }
  
  .Toastify__toast-icon {
    width: 1.2em !important; /* İkon boyutunu küçült */
    height: 1.2em !important; /* İkon boyutunu küçült */
    margin-right: 8px !important; /* İkon ve metin arasına boşluk */
  }

  .Toastify__progress-bar {
    height: 3px; /* Progress bar kalınlığını azalt */
  }

  .Toastify__close-button {
    align-self: center; /* Kapatma butonunu dikeyde ortala */
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
`;

export default GlobalStyles; 