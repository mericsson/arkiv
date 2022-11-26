# arkiv

Google Apps Script native tool to reduce emails in the inbox.

## Installation

### Via script

Go to https://script.google.com/d/1bpaSFnMp-143MelK8IHfHmHKg3-B6uKa7r57xJLgC85OeeKAW_iX-yEB/edit?usp=sharing and click Copy to add to your appscripts. And then start running. :)

It is now working. First it will index all your sent email addresses. Once it has looked through 200 of your sent emails it will start cleaning your inbox every minute. If someone isn't in a sent email address it'll move it to the new `_arkiv` label.

### Via CLI

1. Install [clasp](https://developers.google.com/apps-script/guides/clasp)
1. `clasp push` maybe?

TODO document this. :)
