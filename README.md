# slate.js demo

This is a demo project about [Slate](https://github.com/ianstormtaylor/slate) developed using **React.js**

## Toolbar

From left to right...

#### Bold (ctrl + b)

Make a text **bold** and vice-versa

#### Italic (ctrl + i)

_Make a text italic_

#### List

Todo: indentation for `tab` key and revert for `shift + tab` key

##### Un-ordered List

Make selected paragraphs into an un-ordered list.

##### Ordered List

Make selected paragraphs into an ordered list.

#### Image Upload from URL

Clicking this icon will popup a window for a link. Copy a link from web and paste here. It will add the image inside the editor.

#### Image upload from file browser

Upload an image from your local drive to add into the editor.

#### Block Limit

By default it is unlimited. You can change it. It will affect the "save button" next to it. Save button will be disabled, if you enter more blocks at your editor than allowed number.

#### Save

This will save your document at local storage. If you relaod your browser, your file should be unchanged, if you save before reloading.

#### Cancel

This will cancel your changes and revert your document as last saved one.
