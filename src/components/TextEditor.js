import React, { Component } from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { BoldMark, ItalicMark } from './index'

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

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    this.setState({ value })
  }

  // On Key Down
  onKeyDown = (event, change, next) => {
    // Return with no changes if the keypress is not 'Ctrl'
    if (!event.ctrlKey) {
      return next()
    }

    event.preventDefault()

    switch (event.key) {
      // When 'b' is pressed, add a 'bold' mark to the text
      case 'b': {
        change.toggleMark('bold')
        return true
      }
      // When 'i' is pressed, add a 'italic' mark to the text
      case 'i': {
        change.toggleMark('italic')
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

      default:
        return next()
    }
  }

  // Render the editor.
  render() {
    return (
      <Editor
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        renderMark={this.renderMark}
      />
    )
  }
}

export default TextEditor
