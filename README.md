# markdownlint-action

This action runs [code spell checker](http://cspell.org/) on your files and reports any errors into github annotations.

## Inputs

### `files`

**Required** The files to check. Default `"**/*"`.
Can be used with another action to only lint files that have changed.

### `token`

**Required** The github token to use for annotations. Should be `${{ secrets.GITHUB_TOKEN }}`.

## Usage example

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  build:
    name: Validation
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Run code-spell-checker
        uses: betrybe/code-spell-checker-action
        with:
          files: '**/*'
          token: ${{ secrets.GITHUB_TOKEN }}
```
