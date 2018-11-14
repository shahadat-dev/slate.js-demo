# slate.js demo

A demo project of creating a _rich text editor_ using [Slate.js](https://github.com/ianstormtaylor/slate) and [React.js](https://reactjs.org/)

## Toolbar

### Bold (ctrl + b)

Make a text **bold** and vice-versa

### Italic (ctrl + i)

_Make a text italic_

### List

Todo: indentation for `tab` key and revert for `shift + tab` key

#### Un-ordered List

Make selected paragraphs into an unordered list.

#### Ordered List

Make selected paragraphs into an ordered list.

### Image

_**Supports drag and drop**_

#### Upload from URL

Clicking this icon will pop up a window for a link. Copy a link from a web and paste here. It will add the image inside the editor.

#### Upload from the file browser

Upload an image from your local drive to add to the editor.

### Block Limit

By default it is unlimited. You can change it. It will affect the "save button" next to it. Save button will be disabled if you enter more blocks at your editor than allowed number.

### Save

This will save your document at local storage. If you reload your browser, your file should be unchanged, if you save before reloading.

### Cancel

This will cancel your changes and revert your document as last saved one.
