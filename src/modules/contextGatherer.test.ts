import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gatherContext } from './contextGatherer';

// Patch global Node for DOM constants used in code
// @ts-ignore
if (typeof global.Node === 'undefined') {
  // @ts-ignore
  global.Node = { DOCUMENT_POSITION_PRECEDING: 2 };
}

// Helper to mock document and selection
function mockDom({ title = 'Test Page', bodyText = 'This is a test page with some content.', headingText = 'Heading' } = {}) {
  // @ts-ignore
  global.document = {
    title,
    body: { innerText: bodyText, textContent: bodyText } as unknown as HTMLElement,
    querySelectorAll: vi.fn().mockReturnValue([
      { tagName: 'H2', innerText: headingText, compareDocumentPosition: () => 2 } // Node.DOCUMENT_POSITION_PRECEDING
    ]),
  };
  // @ts-ignore
  global.window = {
    getSelection: () => ({
      rangeCount: 0,
      anchorNode: {} as unknown as Node,
      anchorOffset: 0,
      direction: '',
      focusNode: null,
      focusOffset: 0,
      isCollapsed: false,
      type: '',
      addRange: () => {},
      collapse: () => {},
      collapseToEnd: () => {},
      collapseToStart: () => {},
      containsNode: () => false,
      deleteFromDocument: () => {},
      empty: () => {},
      extend: () => {},
      getRangeAt: () => ({
        commonAncestorContainer: {
          closest: () => ({ innerText: 'block text' })
        } as unknown as Node,
        cloneContents: () => ({}),
        cloneRange: () => ({}),
        collapse: () => {},
        compareBoundaryPoints: () => 0,
        comparePoint: () => 0,
        createContextualFragment: () => ({}),
        deleteContents: () => {},
        detach: () => {},
        extractContents: () => ({}),
        getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }),
        getClientRects: () => ([]),
        insertNode: () => {},
        intersectsNode: () => false,
        isPointInRange: () => false,
        selectNode: () => {},
        selectNodeContents: () => {},
        setEnd: () => {},
        setEndAfter: () => {},
        setEndBefore: () => {},
        setStart: () => {},
        setStartAfter: () => {},
        setStartBefore: () => {},
        startContainer: {} as Node,
        startOffset: 0,
        endContainer: {} as Node,
        endOffset: 0,
        collapsed: false,
        END_TO_END: 0,
        END_TO_START: 0,
        START_TO_END: 0,
        START_TO_START: 0,
      }),
      removeAllRanges: () => {},
      removeRange: () => {},
      selectAllChildren: () => {},
      setBaseAndExtent: () => {},
      setPosition: () => {},
      toString: () => '',
    }),
  };
}

describe('gatherContext', () => {
  beforeEach(() => {
    mockDom();
  });

  it('returns context for default window size', () => {
    const result = gatherContext('test');
    expect(result).toEqual({
      page_title: 'Test Page',
      section_heading: 'Heading',
      context_snippet: 'test',
      user_selection: 'test',
    });
  });

  it('returns full page content when contextWindowSize is empty string', () => {
    const result = gatherContext('test', '');
    expect(result.context_snippet.startsWith('This is a test page')).toBe(true);
  });

  it('returns only selection when contextWindowSize is 0', () => {
    const result = gatherContext('test', 0);
    expect(result.context_snippet).toBe('test');
  });
}); 