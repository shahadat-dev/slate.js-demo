import React, { Component, Fragment } from 'react'
import { Editor } from 'slate-react'
import { Block, Value } from 'slate'
import styled from 'react-emotion'

import Icon from 'react-icons-kit'
import { bold } from 'react-icons-kit/feather/bold'
import { italic } from 'react-icons-kit/feather/italic'
import { list } from 'react-icons-kit/feather/list'
import { image } from 'react-icons-kit/feather/image'

import { BoldMark, ItalicMark, FormatToolbar } from './index'

// Create our initial value...
const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.'
              }
            ]
          }
        ]
      }
    ]
  }
})

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

// A styled image block component.
const Image = styled('img')`
  display: block;
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${props => (props.selected ? '0 0 0 2px blue;' : 'none')};
  margin: 5px;
`

// Insert Image
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
    value: initialValue
  }

  // Store a reference to the `editor`.
  ref = editor => {
    this.editor = editor
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    this.setState({ value })
  }

  // On Key Down
  onKeyDown = (event, editor, next) => {
    // Return with no changes if the keypress is not 'Ctrl'
    if (!event.ctrlKey) {
      return next()
    }

    event.preventDefault()

    switch (event.key) {
      // When 'b' is pressed, add a 'bold' mark to the text
      case 'b': {
        editor.toggleMark('bold')
        return true
      }
      // When 'i' is pressed, add a 'italic' mark to the text
      case 'i': {
        editor.toggleMark('italic')
        return true
      }
      default: {
        return next()
      }
    }
  }

  // Render a Slate Mark.
  renderMark = (props, editor, next) => {
    const { attributes, node, isFocused } = props

    switch (props.mark.type) {
      case 'bold':
        return <BoldMark {...props} />

      case 'italic':
        return <ItalicMark {...props} />

      case 'ul':
        return (
          <ul {...attributes}>
            <li>{props.children}</li>
          </ul>
        )

      case 'ol':
        return (
          <ol {...attributes}>
            <li>{props.children}</li>
          </ol>
        )

      default:
        return next()
    }
  }

  // Render a Slate node.
  renderNode = (props, editor, next) => {
    const { attributes, node, isFocused } = props

    switch (node.type) {
      case 'image': {
        const src = node.data.get('src')
        return <Image src={src} selected={isFocused} {...attributes} />
      }

      default: {
        return next()
      }
    }
  }

  onMarkClick = (event, type) => {
    event.preventDefault()
    // console.log(event, type)
    const { editor } = this
    const { value } = editor
    const change = editor.toggleMark(type)

    console.log(this, editor, value, change)

    this.onChange(change)
  }

  // Image
  onClickImage = event => {
    event.preventDefault()
    const src = window.prompt('Enter the URL of the image:')
    if (!src) return
    this.editor.command(insertImage, src)
  }

  render() {
    return (
      <Fragment>
        <FormatToolbar>
          <button
            onPointerDown={event => this.onMarkClick(event, 'bold')}
            className="tooltip-icon-button"
          >
            <Icon icon={bold} />
          </button>

          <button
            onPointerDown={event => this.onMarkClick(event, 'italic')}
            className="tooltip-icon-button"
          >
            <Icon icon={italic} />
          </button>

          <button
            onPointerDown={event => this.onMarkClick(event, 'ul')}
            className="tooltip-icon-button"
          >
            <Icon icon={list} />
            ul
          </button>

          <button
            onPointerDown={event => this.onMarkClick(event, 'ol')}
            className="tooltip-icon-button"
          >
            <Icon icon={list} />
            ol
          </button>

          <button onMouseDown={this.onClickImage}>
            <Icon icon={image} />
          </button>
        </FormatToolbar>

        <Editor
          ref={this.ref}
          value={this.state.value}
          schema={schema}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderMark={this.renderMark}
          renderNode={this.renderNode}
        />
      </Fragment>
    )
  }
}

export default TextEditor
