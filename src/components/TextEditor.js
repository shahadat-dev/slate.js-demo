import React, { Component, Fragment } from 'react'
import { Editor, getEventRange, getEventTransfer } from 'slate-react'
import { Block, Value, Selection } from 'slate'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { isKeyHotkey } from 'is-hotkey'
import { Button, Icon, Image } from './utils'
import FormatToolbar from './FormatToolbar'
import initialValueFromJSON from './value.json'

/**
 * Define the default node type.
 *
 * @type {String}
 */

const DEFAULT_NODE = 'paragraph'

/**
 * Define hotkey matchers.
 *
 * @type {Function}
 */

const isTabHotkey = isKeyHotkey('tab')
const isShiftTabHotkey = isKeyHotkey('shift+tab')

// Update the initial content to be pulled from Local Storage if it exists.
const existingValue = JSON.parse(localStorage.getItem('content'))

let initialValue = Value.fromJSON(existingValue || initialValueFromJSON)

// Schema
const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor, { code, node, child }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph')
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
        }
      }
    }
  },
  blocks: {
    image: {
      isVoid: true
    }
  }
}

/**
 * Image extension check
 *
 * @param {String} url
 * @return {Boolean}
 */
function isImage(url) {
  return !!imageExtensions.find(url.endsWith)
}

/**
 * Insert an image into editor
 *
 * @param {Editor} editor
 * @param {String} src
 * @param {String} target
 */

function insertImage(editor, src, target) {
  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type: 'image',
    data: { src }
  })
}

class TextEditor extends Component {
  state = {
    value: initialValue,
    saveButton: false,
    blockLimit: 99999999,
    fileSaved: false
  }

  /**
   * Store a reference to the `editor`.
   *
   * @param {Editor} editor
   */

  ref = editor => {
    this.editor = editor
  }

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type == type)
  }

  /**
   * On change, save the new `value`.
   *
   * @param {Editor} editor
   */

  onChange = ({ value }) => {
    // Check number of blocks and allowed blocks
    if (this.countBlocks() > this.state.blockLimit) {
      this.setState({ saveButton: true })
    } else {
      this.setState({ saveButton: false })
    }

    this.setState({ value })
  }

  /**
   * When save button is clicked, save the current editor content.
   *
   * @param {Event} event
   */

  onClickSave = event => {
    event.preventDefault()

    // If save button is disabled, do not save
    if (this.state.saveButton) return

    const { editor } = this
    const { value } = editor

    // Save the value to Local Storage.
    const content = JSON.stringify(value.toJSON())
    localStorage.setItem('content', content)

    // Update initialValue
    initialValue = Value.fromJSON(JSON.parse(localStorage.getItem('content')))

    this.setState({ value, fileSaved: true })

    window.setTimeout(() => {
      this.setState({ fileSaved: false })
    }, 1000)
  }

  /**
   * When cancel button is clicked, cancel current changes.
   *
   * @param {Event} event
   */
  onClickCancel = event => {
    event.preventDefault()
    this.setState({ value: initialValue })
  }

  /**
   * Change block limit from dropdown.
   *
   * @param {Event} event
   */
  onChangeBlockLimit = event => {
    event.preventDefault()

    // Check number of blocks and allowed blocks
    if (this.countBlocks() > event.target.value) {
      this.setState({ saveButton: true, blockLimit: event.target.value })
    } else {
      this.setState({ saveButton: false, blockLimit: event.target.value })
    }
  }

  // count blocks
  countBlocks = () => {
    const { editor } = this
    const { value } = editor

    const countBlocks = value.document.getBlocks().filter(block => {
      if (block.type === 'paragraph') {
        if (block.text === '') return false
        else return block
      } else return block
    })

    return countBlocks.size
  }

  /**
   * On key down, if it's a formatting command toggle a mark.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @return {Change}
   */

  onKeyDown = (event, editor, next) => {
    // tab
    if (isTabHotkey(event)) {
      const { value } = editor
      const { document } = value

      const block = value.blocks.first()
      const parent = value.blocks.first()
        ? document.getParent(value.blocks.first().key)
        : null

      // If no previous sibling exists, return
      const previousSibling = document.getPreviousSibling(block.key)
      if (!previousSibling) return next()

      // check whether it's already in 3rd level
      const depth = document.getDepth(block.key)
      if (depth > 3) return next()

      //check selected blocks, if any node is in 3rd level
      let flag = false
      value.blocks.map(block => {
        let depth = document.getDepth(block.key)
        if (depth > 3) flag = true
      })
      if (flag) return next()

      // check previos sibling
      if (
        previousSibling &&
        (previousSibling.type === 'numbered-list' ||
          previousSibling.type === 'bulleted-list')
      ) {
        // todo
        return next()
      }

      // check next sibling
      const nextSibling = document.getNextSibling(block.key)
      if (
        nextSibling &&
        (nextSibling.type === 'numbered-list' ||
          nextSibling.type === 'bulleted-list')
      ) {
        // todo
        return next()
      }

      if (parent) {
        let type = !parent.type ? 'bulleted-list' : parent.type
        editor.setBlocks('list-item').wrapBlock(type)
      }
    }
    // shift + tab
    else if (isShiftTabHotkey(event)) {
      const { value } = editor
      const { document } = value
      const block = value.blocks.first()
        ? document.getParent(value.blocks.first().key)
        : null
      let parent = document.getParent(block.key)

      // if multi level list items are selected for shift+tab, then return
      const firstBlockDepth =
        value.blocks.first() && document.getDepth(value.blocks.first().key)
      let hasChildren = false
      value.blocks.map(blok => {
        let depth = document.getDepth(blok.key)
        if (firstBlockDepth !== depth) hasChildren = true
      })
      if (hasChildren) return next()

      // if first level list-items selected then, make paragraph
      if (parent && typeof parent.type === 'undefined') {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
        return next()
      }

      const isActive =
        this.hasBlock('list-item') &&
        block &&
        (block.type === 'numbered-list' || block.type === 'bulleted-list')

      if (isActive) {
        editor
          .setBlocks('list-item')
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      }
    } else {
      return next()
    }

    event.preventDefault()
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = (props, editor, next) => {
    const { attributes, children, node, isFocused } = props

    switch (node.type) {
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      case 'image': {
        const src = node.data.get('src')
        return <Image src={src} selected={isFocused} {...attributes} />
      }
      default:
        return next()
    }
  }

  /**
   * When image button is clicked, save image from URL.
   *
   * @param {Event} event
   */
  onClickImage = event => {
    event.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    this.editor.command(insertImage, src)
  }

  /**
   * When image upload button is clicked, open an expoler to upload image
   *
   * @param {Event} event
   */
  onClickImageUploadButton = event => {
    event.preventDefault()
    document.getElementById('image-file').click()
  }

  /**
   * When image upload button is clicked, upload an image from machine's local storage.
   *
   * @param {Event} event
   */
  uploadImage = event => {
    event.preventDefault()

    const file = event.target.files[0]

    const reader = new FileReader()

    const [mime] = file.type.split('/')
    if (mime !== 'image') return
    const target = getEventRange(event, this.editor)
    reader.addEventListener('load', () => {
      this.editor.command(insertImage, reader.result, target)
    })

    const src = reader.readAsDataURL(file)
    if (!src) return
    this.editor.command(insertImage, src)
  }

  /**
   * On drop, insert the image wherever it is dropped.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @return {Change}
   */

  onDropOrPaste = (event, editor, next) => {
    const target = getEventRange(event, editor)
    if (!target && event.type === 'drop') return next()

    const transfer = getEventTransfer(event)
    const { type, text, files } = transfer

    if (type === 'files') {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')
        if (mime !== 'image') continue

        reader.addEventListener('load', () => {
          editor.command(insertImage, reader.result, target)
        })

        reader.readAsDataURL(file)
      }
      return
    }

    if (type === 'text') {
      if (!isUrl(text)) return next()
      if (!isImage(text)) return next()
      editor.command(insertImage, text, target)
      return
    }

    next()
  }

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value } = this.state
      const parent = value.blocks.first()
        ? value.document.getParent(value.blocks.first().key)
        : null
      isActive = this.hasBlock('list-item') && parent && parent.type === type
    }

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickBlock = (event, type) => {
    event.preventDefault()

    const { editor } = this
    const { value } = editor
    const { document } = value

    // Handle everything but list buttons.
    if (type != 'bulleted-list' && type != 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type == type)
      })

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        editor
          .unwrapBlock(
            type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        editor.setBlocks('list-item').wrapBlock(type)
      }
    }
  }

  render() {
    return (
      <Fragment>
        <div>
          <p>
            <strong>{'Slate.js Demo'}</strong>
            {this.state.fileSaved && <span>{' (File Saved!)'}</span>}
          </p>
        </div>
        <FormatToolbar>
          {this.renderBlockButton('numbered-list', 'format_list_numbered')}
          {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
          <Button onMouseDown={this.onClickImage}>
            <Icon>{'image'}</Icon>
          </Button>
          <Button onMouseDown={this.onClickImageUploadButton}>
            <Icon>{'image'}</Icon>
          </Button>
          <input
            type="file"
            name="image"
            className="image-file"
            id="image-file"
            onChange={this.uploadImage}
          />
          &nbsp;
          <select name="blockLimit" onChange={this.onChangeBlockLimit}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={100}>100</option>
            <option selected={true} value={99999999}>
              Unlimited
            </option>
          </select>
          <button
            disabled={this.state.saveButton}
            onMouseDown={this.onClickSave}
          >
            Save
          </button>
          <button onMouseDown={this.onClickCancel}>Cancel</button>
        </FormatToolbar>

        <Editor
          ref={this.ref}
          value={this.state.value}
          schema={schema}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderMark={this.renderMark}
          renderNode={this.renderNode}
          onDrop={this.onDropOrPaste}
          onPaste={this.onDropOrPaste}
        />
      </Fragment>
    )
  }
}

export default TextEditor
