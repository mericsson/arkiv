# arkiv

Google Apps Script native tool to reduce emails in the inbox.

arkiv works by maintaining an allow-list of email addresses. This is initially populated after initial installation by looking through your most recent 200 sent emails. Additionally, arkiv will always look for emails with the `arkiv-allow` label -- appending the senders to the allowlist.

## Installation

arkiv can be installed by copy pasting the transpiled javascript code from sharable link below or by installing it from source.

### From Sharable Link

Go to https://script.google.com/d/1bpaSFnMp-143MelK8IHfHmHKg3-B6uKa7r57xJLgC85OeeKAW_iX-yEB/edit?usp=sharing and click Copy to add to your Google App Scripts.

### From Source

1. Install [clasp](https://developers.google.com/apps-script/guides/clasp)
2. ... TODO

#### Updating

```
clasp push
```

## Contributing

This repository uses [prettier](https://prettier.io/). Install and run prettier with `npx prettier --write .` before committing.
