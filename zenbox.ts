// eslint-disable-next-line no-useless-escape
const EMAIL_REG_EXP = /[0-9a-zA-Z\.\+\=\-]+@[0-9a-zA-Z\.\+\=\-]+/g

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

  // Organize.
  const threads = GmailApp.getInboxThreads()
  let label = GmailApp.getUserLabelByName('_zenbox')
  if (!label) {
    label = GmailApp.createLabel('_zenbox')
  }
  for (const thread of threads) {
    const blessLabel = thread.getLabels().find((l) => l.getName() === 'bless')
    if (blessLabel) {
      // Previously zenbox'ed. If it is inbox again must be a reason.
      // Let's index sender and then skip.
      for (const msg of thread.getMessages()) {
        for (const email of getEmails(msg.getFrom())) {
          bless(scriptProperties, email)
        }
      }
      thread.removeLabel(label)
      thread.removeLabel(blessLabel) // to indicate that it has been processed.
    } else if (!shouldKeep(scriptProperties, thread)) {
      thread.addLabel(label)
      thread.moveToArchive()
    }
  }
}

function getEmails(str: string): string[] {
  return str.match(EMAIL_REG_EXP) || []
}

function isBlessed(
  scriptProperties: GoogleAppsScript.Properties.Properties,
  email: string
): boolean {
  return !!scriptProperties.getProperty(email.toLowerCase())
}

function bless(
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
  console.log('indexTo', start)
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
  let count = 0
  for (const to of toSet.values()) {
    if (!isBlessed(scriptProperties, to)) {
      bless(scriptProperties, to)
      count++
    }
  }
  console.log('indexTo blessed', count)
  return indexCount
}

function shouldKeep(
  scriptProperties: GoogleAppsScript.Properties.Properties,
  thread: GoogleAppsScript.Gmail.GmailThread
): boolean {
  for (const msg of thread.getMessages()) {
    for (const email of getEmails(msg.getFrom())) {
      if (isBlessed(scriptProperties, email)) {
        return true
      }
    }
  }
  return false
}
