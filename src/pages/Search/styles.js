import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  .reset {
    /*Reset element apperance*/
    background: nonwe repeat scroll 0 0 transparent;
    border: medium none;
    border-spacing: 0;
    color: #26589f;
    font-family: 'PT Sans Narrow', sans-serif;
    font-size: 16px;
    font-weight: normal;
    line-height: 1.42rem;
    list-style: none outside none;
    margin: 0;
    padding: 0;
    text-align: left;
    text-decoration: none;
    text-indent: 0;
  }

  #__next {
    height: 100%;
  }

  .container {
    --bg-color: #fff;
    --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
    --font-size: 18px;
    --font-color: rgb(26, 32, 44);

    margin: 0;
    padding: 20px;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
    background-color: var(--bg-color);
    color: var(--font-color);

    font-family: var(--font-family);
    font-size: var(--font-size);

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .app-icon {
    width: 64px;
    height: 64px;
  }

  .input {
    margin: 16px 0 0 0;
    align-self: stretch;
    display: flex;
    position: relative;
  }

  .input input {
    margin: 0 4px 8px 0;
  }

  input {
    margin: 0;
    padding: 0.5rem 1rem;
    line-height: 28px;
    display: block;
    width: calc(100% - 4px);
    border-radius: 0.5rem;

    outline: 0;
    font-family: var(--font-family);
    font-size: var(--font-size);
    color: var(--font-color);

    background-color: rgb(237, 242, 247);
    border: 1px solid transparent; /* 2 */
    transition-duration: 0.1s !important;
  }

  input:focus {
    background-color: var(--bg-color);
    border: 1px solid #e2e8f0; /* 2 */
  }

  button {
    margin: 0;
    padding: 0.5rem 1rem;
    height: 46px;
    vertical-align: middle;
    border-radius: 0.25rem;
    border-color: transparent;
    background-color: rgb(226, 232, 240);
    cursor: pointer;

    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: 700;
    color: rgb(45, 55, 72);
  }

  button:hover {
    background: rgb(203, 213, 224);
  }

  #searchResults {
    overflow: overlay;
    -webkit-overflow-scrolling: touch;
  }

  .clear-all {
    margin: 0 0 8px 0;
  }

  .items {
    width: 100%;
  }

  .item {
    display: flex;
    flex-direction: row;
    align-items: center;

    margin: 0 0 8px 0;
    padding: 8px;
    border-radius: 0.25rem !important;
    box-shadow: 0 6px 8px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;

    transition: background 250ms;
  }

  .item:hover {
    background: rgb(237, 242, 247);
  }

  .item-image {
    width: 36px;
    height: 36px;
    margin: 0 8px 0 0;
  }

  .item-name {
    flex: 1;
    line-height: 23px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .item-actions {
    display: flex;
  }

  .item-actions button {
    margin: 0 0 0 8px;
    width: 64px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .item-actions--buy {
    width: 36px;
    background-size: 36px;
    height: 36px;
    display: block;
    background-image: url(images/bells.png);
    background-repeat: no-repeat;
    background-position: center;
    margin: 0;
    padding: 0;
  }

  .Image {

  }

  .Image-loading {
    background-color: rgb(237, 242, 247);
  }

  .ease-in-out {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .transition-colors {
    transition-property: background-color, border-color, color, fill, stroke !important;
  }

  .no-padding {
    padding: 0;
  }
`;
