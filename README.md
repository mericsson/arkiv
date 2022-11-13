# zenbox

WIP solution to managing Marcus' email.

## Installation

### Via script

Go to https://script.google.com/d/1bpaSFnMp-143MelK8IHfHmHKg3-B6uKa7r57xJLgC85OeeKAW_iX-yEB/edit?usp=sharing and click Copy to add to your appscripts. And then start running. :)

It is now working. First it will index all your sent email addresses. Once it has looked through 200 of your sent emails it will start cleaning your inbox every minute. If someone isn't in a sent email address it'll move it to the new `zenbox` label.

### Via CLI

TODO document this. :)

## Future Enhancements

- [ ] zenbox should know if you moved something from `zenbox` label to Inbox and update allowlist appropriately.
- [x] support 'blessing' random email addresses to the allowlist. (via label or UI)
- [ ] support distribution lists so ultimate frisbee d-list stays in inbox.

