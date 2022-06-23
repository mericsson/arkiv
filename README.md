# zenbox

WIP solution to managing Marcus' email.

## Installation

1. Create a new google app script.
2. Copy paste the .gs file there.
3. Run the file once and do the OAuth dance to your email.
4. Create a new trigger that fires `cleanInbox` every minute.

It is now working. First it will index all your sent email addresses. Once it has looked through 200 of your sent emails it will start cleaning your inbox every minute. If someone isn't in a sent email address it'll move it to the new `zenbox` label.

## Future Enhancements

- [ ] zenbox should know if you moved something from `zenbox` label to Inbox and update allowlist appropriately.
- [ ] support distribution lists so ultimate frisbee d-list stays in inbox.
- [ ] support 'blessing' random email addresses to the allowlist. (via label or UI)
