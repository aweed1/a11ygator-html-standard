# a11ygator-html-standard

This document outlines the a11ygator html-based document standard.

### Data format

When running the script with a supplemental `filename.json` file, the json should be in the following format:

```json
{
    // A description of the document contents.
    "description": "string",
    // The title of the document.
    "title": "string",
    // The author of the document.
    "author": "string",
    // The publication date in epoch format.
    "published": "number",
    // The publisher.
    "publisher": "string",
    // A string array containing keywords relating to the document.
    "keywords": ["string", "string", "string", ... "string"],
    // The name of who created the a11ygator html document.
    "creator": "string",
    // The creation date in epoch format.
    "created": "number",
    // The last modified in epoch format. 
    "lastmodified": "number",
    // The content of the book. This should be in HTML format, but stringified.
    "content": "string"
}
```