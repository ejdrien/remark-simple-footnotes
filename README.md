# Simple footnotes

This is a simple remark plugin to create and format footnotes.

- It has been created for my personal use.
- It outputs heading in Czech.
- It does not allow footnote definition above its reference.
- It does not work with inline footnotes.

## TODO

- [ ] Add proper support for multiline footnote definition.


## Finds footnotes with RegEx

### Footnote Reference

**Example**: `[^1]`

```
(?<!\s)(?<=.+?)(\[\^)([^\]])(.*?)(\])
```

### Footnote Definition

**Example**: `[^1]: Salve!`

```
^(\[\^)(.+?)(\]:)
```

## License

[MIT](license) © [Adrián Zámečník](https://adrianzamecnik.cz)