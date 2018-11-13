import React, { Component, Fragment } from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'

import Icon from 'react-icons-kit'
import { bold } from 'react-icons-kit/feather/bold'
import { italic } from 'react-icons-kit/feather/italic'
import { list } from 'react-icons-kit/feather/list'

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

  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <BoldMark {...props} />

      case 'italic':
        return <ItalicMark {...props} />

      case 'ul':
        return (
          <ul {...props.attributes}>
            <li>{props.children}</li>
          </ul>
        )

      case 'ol':
        return (
          <ol {...props.attributes}>
            <li>{props.children}</li>
          </ol>
        )

      default:
        return next()
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
        </FormatToolbar>

        <Editor
          ref={this.ref}
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderMark={this.renderMark}
        />
      </Fragment>
    )
  }
}

export default TextEditor
