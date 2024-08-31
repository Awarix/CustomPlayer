import styled from "@emotion/styled";

const EditorStyled = styled.div`
  /* Basic editor styles */

  div[contenteditable="true"] {
    border: none;
    background-color: transparent;
    outline: none;
  }

  code {
    background-color: #f4f6f8;
    border-radius: 5px;
    padding: 5px 5px;
  }

  .has-focus {
    border-radius: 3px;
    box-shadow: 0 0 0 3px #00ab55;
    padding: 5px 5px;
  }

  .ProseMirror {
    > * + * {
      margin-top: 1em;
    }

    img {
      max-width: 100%;
      height: auto;
      margin: auto;

      &.ProseMirror-selectednode {
        outline: 3px solid #00ab55;
      }
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid #00ab55;
    }
    ul,
    ol {
      padding: 0 1.5rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    pre {
      background: #0d0d0d;
      color: #fff;
      font-family: "JetBrainsMono", monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
    }

    img {
      max-width: 100%;
      height: auto;
    }

    hr {
      border-top: 1px solid #0d0d0d;
      margin: auto;
      width: 50%;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    }
  }
`;

export default EditorStyled;