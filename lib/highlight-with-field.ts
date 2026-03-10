import Highlight from "@tiptap/extension-highlight";

/**
 * Extends TipTap Highlight to support an optional dataField attribute
 * so we can identify document-change highlights (e.g. "disclosing", "receiving")
 * for hover-to-approve UI. Renders as data-doc-change-field in the DOM.
 */
export const HighlightWithField = Highlight.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-color") || element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            "data-color": attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          };
        },
      },
      dataField: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-doc-change-field"),
        renderHTML: (attributes) => {
          if (!attributes.dataField) return {};
          return { "data-doc-change-field": attributes.dataField };
        },
      },
      dataJumpPhrase: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-jump-phrase"),
        renderHTML: (attributes) => {
          if (!attributes.dataJumpPhrase) return {};
          return { "data-jump-phrase": attributes.dataJumpPhrase };
        },
      },
    };
  },
});
