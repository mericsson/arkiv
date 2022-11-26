// https://github.com/mericsson/arkiv
// 2022-11-26

const labelNames = {
  archive: 'arkiv',
  allow: 'arkiv-allow',
}

// eslint-disable-next-line no-useless-escape
const EMAIL_REG_EXP = /[0-9a-zA-Z\.\+\=\-]+@[0-9a-zA-Z\.\+\=\-]+/g

/**
 * This is the main entrypoint for the Google Apps Script.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function cleanInbox(): void {
  // User properties data is shared only to current user.
  // https://developers.google.com/apps-script/guides/properties
  const props = PropertiesService.getUserProperties()

  // Index if needed.
  const toStart = parseInt(props.getProperty('..start..') || '0')
  if (toStart <= 200) {
    const indexCount = indexTo(props, toStart)
    props.setProperty('..start..', `${toStart + indexCount}`)
    return
  } else {
    // Regular indexing starting at 0.
    indexTo(props, 0)
  }

  let archiveLabel = GmailApp.getUserLabelByName(labelNames.archive)
  if (!archiveLabel) {
    archiveLabel = GmailApp.createLabel(labelNames.archive)
  }

  // First look at allow-listed emails.
  processAllowed(props, archiveLabel)

  // Then organize inbox.
  const threads = GmailApp.getInboxThreads()
  for (const thread of threads) {
    if (!shouldKeep(props, thread)) {
      thread.addLabel(archiveLabel)
      thread.moveToArchive()
    }
  }
}

function processAllowed(
  props: GoogleAppsScript.Properties.Properties,
  archiveLabel: GoogleAppsScript.Gmail.GmailLabel
) {
  let label = GmailApp.getUserLabelByName(labelNames.allow)
  if (!label) {
    label = GmailApp.createLabel(labelNames.allow)
  }
  for (const thread of label.getThreads()) {
    for (const msg of thread.getMessages()) {
      for (const email of getEmails(msg.getFrom())) {
        allowlist(props, email)
      }
    }
    thread.moveToInbox()
    thread.removeLabel(archiveLabel)
    thread.removeLabel(label)
  }
}

function getEmails(str: string): string[] {
  return str.match(EMAIL_REG_EXP) || []
}

function isAllowlisted(
  props: GoogleAppsScript.Properties.Properties,
  email: string
): boolean {
  return !!props.getProperty(email.toLowerCase())
}

function allowlist(
  props: GoogleAppsScript.Properties.Properties,
  email: string
): void {
  props.setProperty(email.toLowerCase(), '1')
}

function indexTo(
  props: GoogleAppsScript.Properties.Properties,
  start: number
): number {
  const indexCount = 10
  const threads = GmailApp.search('in:sent', start, indexCount)

  // Get set of emails sent `to`.
  const toSet = new Set<string>()
  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      for (const email of getEmails(msg.getTo())) {
        toSet.add(email)
      }
    }
  }

  // Persist emails.
  for (const to of toSet.values()) {
    if (!isAllowlisted(props, to)) {
      allowlist(props, to)
    }
  }
  return indexCount
}

function shouldKeep(
  props: GoogleAppsScript.Properties.Properties,
  thread: GoogleAppsScript.Gmail.GmailThread
): boolean {
  for (const msg of thread.getMessages()) {
    for (const email of getEmails(msg.getFrom())) {
      if (isAllowlisted(props, email)) {
        return true
      }
    }
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function viewProperties(): void {
  const props = PropertiesService.getUserProperties()
  const keys = props.getKeys()
  for (const key of keys) {
    console.log(key, props.getProperty(key))
  }
}