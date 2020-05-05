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


  /* reset ios input fields */
  textarea,
  input.text,
  input[type="text"],
  input[type="button"],
  input[type="submit"],
  input[type="search"],
  .input-checkbox {
    -webkit-appearance: none;
    border-radius: 0;
  }

  #__next {
    height: 100%;
  }

  .sticky-header {
    width: 100%;
    background-color: var(--bg-color);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .container {
    margin: 0;
    padding: 8px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .item-container {
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
    padding-right: 48px;
  }

  .input--clear {
    width: 48px;
    position: absolute;
    right: 48px;
    background-color: transparent;
    border: none;

    path {
      fill: var(--font-color);
    }

  }

  .input--search {
    width: 48px;
    position: absolute;
    right: 0;
    color: #fff;
    background-color: rgb(39,121,189);
    border-radius: 2rem;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    @media (prefers-color-scheme: light) {
      border-color: rgb(39,121,189);
    }

    @media (prefers-color-scheme: dark) {
      border-color: var(--button-border-color);
    }
  }

  input {
    margin: 0;
    padding: 0.5rem 1rem;
    line-height: 28px;
    display: block;
    width: calc(100% - 4px);

    outline: 0;
    font-family: var(--font-family);
    font-size: var(--font-size);
    color: var(--font-color);

    background-color: rgb(226, 232, 240);
    @media (prefers-color-scheme: dark) {
      background-color: rgb(34,41,47);
    }

    border: 1px solid transparent; /* 2 */
    border-color: var(--button-border-color);
    border-radius: 2rem !important;
    transition-duration: 0.1s !important;
  }

  input:focus {
    background-color: var(--bg-color);
  }

  button {
    margin: 0;
    padding: 0.5rem 1rem;
    height: 46px;
    vertical-align: middle;
    border-color: var(--button-border-color);
    border-radius: 0.25rem;
    background-color: var(--button-color);
    cursor: pointer;

    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: 700;
    color: var(--button-text);
  }

  .icon-button {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .searchResult-highlight {
    font-weight: 800;
    color: rgb(25, 174, 94);
    background-color: rgb(227, 252, 236);
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
    background-color: var(--bg-color);

    border: 1px solid transparent; /* 2 */
    border-color: var(--button-border-color);
    border-radius: 0.25rem !important;
    box-shadow: 0 6px 8px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;

    transition: background 250ms;
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

  .item-actions--delete {
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item-actions--buy {
    width: 36px;
    background-size: 36px;
    height: 36px;
    display: block;
    background-image: url(images/bells.36ea30.png);
    background-repeat: no-repeat;
    background-position: center;
    margin: 0;
    padding: 0;
  }

  .Image {

  }

  .Image-loading {
    background-color: var(--button-border-color);
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

  /* clears the 'X' from Internet Explorer */
  input[type=search]::-ms-clear {  display: none; width : 0; height: 0; }
  input[type=search]::-ms-reveal {  display: none; width : 0; height: 0; }

  /* clears the 'X' from Chrome */
  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration { display: none; }

`;
