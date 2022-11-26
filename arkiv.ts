const labelNames = {
  archive: '_arkiv',
  allow: 'arkiv_allow'
}

// eslint-disable-next-line no-useless-escape
const EMAIL_REG_EXP = /[0-9a-zA-Z\.\+\=\-]+@[0-9a-zA-Z\.\+\=\-]+/g

/**
 * This is the main entrypoint for the Google Apps Script.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function cleanInbox(): void {
  const scriptProperties = PropertiesService.getScriptProperties()

  // Index if needed.
  const toStart = parseInt(scriptProperties.getProperty('..start..') || '0')
  if (toStart <= 200) {
    const indexCount = indexTo(toStart)
    scriptProperties.setProperty('..start..', `${toStart + indexCount}`)
    return
  } else {
    // Regular indexing starting at 0.
    indexTo(0)
  }

  let archiveLabel = GmailApp.getUserLabelByName(labelNames.archive)
  if (!archiveLabel) {
    archiveLabel = GmailApp.createLabel(labelNames.archive)
  }

  // First look at allow-listed emails.
  processAllowed(scriptProperties, archiveLabel)

  // Then organize inbox.
  const threads = GmailApp.getInboxThreads()
  for (const thread of threads) {
    if (!shouldKeep(scriptProperties, thread)) {
      thread.addLabel(archiveLabel)
      thread.moveToArchive()
    }
  }
}

function processAllowed(scriptProperties: GoogleAppsScript.Properties.Properties, archiveLabel: GoogleAppsScript.Gmail.GmailLabel) {
  let label = GmailApp.getUserLabelByName(labelNames.allow)
  if (!label) {
    label = GmailApp.createLabel(labelNames.allow)
  }
  for (const thread of label.getThreads()) {
    for (const msg of thread.getMessages()) {
      for (const email of getEmails(msg.getFrom())) {
        allowlist(scriptProperties, email)
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
  scriptProperties: GoogleAppsScript.Properties.Properties,
  email: string
): boolean {
  return !!scriptProperties.getProperty(email.toLowerCase())
}

function allowlist(
  scriptProperties: GoogleAppsScript.Properties.Properties,
  email: string
): void {
  scriptProperties.setProperty(email.toLowerCase(), '1')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearProperties(): void {
  PropertiesService.getScriptProperties().deleteAllProperties()
}

function indexTo(start: number): number {
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
  const scriptProperties = PropertiesService.getScriptProperties()
  for (const to of toSet.values()) {
    if (!isAllowlisted(scriptProperties, to)) {
      allowlist(scriptProperties, to)
    }
  }
  return indexCount
}

function shouldKeep(
  scriptProperties: GoogleAppsScript.Properties.Properties,
  thread: GoogleAppsScript.Gmail.GmailThread
): boolean {
  for (const msg of thread.getMessages()) {
    for (const email of getEmails(msg.getFrom())) {
      if (isAllowlisted(scriptProperties, email)) {
        return true
      }
    }
  }
  return false
}
