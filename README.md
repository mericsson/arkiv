# arkiv

arkiv (Swedish for archive, pronounced "arkeev") is a Google Apps Script native tool to reduce emails in the inbox.

arkiv works by maintaining an allow-list of email addresses. This is initially populated after initial installation by looking through your most recent 200 sent emails. Additionally, arkiv will always look for emails with the `arkiv.allow` label -- appending the senders to the allowlist. Emails received from email addresses that are not in the allow-list of email addresses are removed from the Gmail Inbox and given the label `arkiv.`.

arkiv runs as a Time-based Google Apps Scripts Trigger.

<img width="640" alt="image" src="https://user-images.githubusercontent.com/36717/204095443-0d4ae689-eca8-48ce-bc3a-8c18fc210007.png">

The allow list of email addresses is stored local to the Google Apps Scripts user in Script Properties. All data stays local to the Google Apps user account.

## Limitations

1. This is beta software, use at your own risk. There are no support assurances.
1. The allow list cannot be edited / viewed through a GUI. Entries can be removed from the allow list by adding the label `arkiv.removeAllow`. (The allow list will get appended to again if you send an email to a particular address).
1. arkiv will only organize the first 100 email threads in your inbox. If you have more, you will need to clean those up yourself currently.

## Installation

arkiv can be installed by copy pasting the transpiled javascript code from sharable link below or by installing it from source.

### From Sharable Link

_Note: Installing this way will require sharing Gmail Access with `arkiv` and going through untrusted developer prompt. Alternative is to install from source to fully own the experience._

1. Go to https://script.google.com/u/2/home/projects/1bpaSFnMp-143MelK8IHfHmHKg3-B6uKa7r57xJLgC85OeeKAW_iX-yEB/triggers
1. Click "+ Add Trigger"
1. Update "Select type of time based trigger" to Minutes timer
1. Every 5 minutes

arkiv is designed to only run every five minutes. For this reason it may take some time to do initial clean up of an inbox. Recommend declaring Inbox Bankruptcy and moving everything out of the inbox for faster results. :)

Also note that since it will populate the allowlist initially (every 5 min, chunks of 10 until 200) it will take 1 hr, 40 min before any organization happens.

### From Source

arkiv can be pushed directly from the typescript source using [clasp](https://developers.google.com/apps-script/guides/clasp) tool.

```shell
$ npm install
$ clasp push
```

## Contributing

This repository uses [prettier](https://prettier.io/). Install and run prettier with `npx prettier --write .` before committing.
