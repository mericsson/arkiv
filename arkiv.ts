// https://github.com/mericsson/arkiv
// 2022-11-27

const labelNames = {
  archive: 'arkiv.',
  allow: 'arkiv.allow',
  removeAllow: 'arkiv.removeAllow',
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
    const indexCount = util.indexTo(props, toStart)
    props.setProperty('..start..', `${toStart + indexCount}`)
    return
  } else {
    // Index most recent sent emails.
    util.indexTo(props, 0)
  }

  let archiveLabel = GmailApp.getUserLabelByName(labelNames.archive)
  if (!archiveLabel) {
    archiveLabel = GmailApp.createLabel(labelNames.archive)
  }

  // First look at any explict allow-listed emails.
  util.processAllowed(props, archiveLabel)

  // Then look at attempts to remove from allow-list.
  util.processRemoveAllowed(props, archiveLabel)

  // Then organize inbox.
  // Assumption is inbox has less than 100 threads. Since this is meant
  // to run every 5 minutes we need to chunk the work to "roughly 5 min"
  // without doing time checking. This means that if it is the first
  // time running it could take a while to organize the inbox.
  const threads = GmailApp.getInboxThreads(0, 100)
  for (const thread of threads) {
    if (!util.shouldKeep(props, thread)) {
      thread.addLabel(archiveLabel)
      thread.moveToArchive()
    }
  }
}

const util = {
  processAllowed: function (
    props: GoogleAppsScript.Properties.Properties,
    archiveLabel: GoogleAppsScript.Gmail.GmailLabel
  ) {
    let label = GmailApp.getUserLabelByName(labelNames.allow)
    if (!label) {
      label = GmailApp.createLabel(labelNames.allow)
    }
    for (const thread of label.getThreads()) {
      for (const msg of thread.getMessages()) {
        for (const email of util.getEmails(msg.getFrom())) {
          util.allowlist(props, email)
        }
      }
      thread.moveToInbox()
      thread.removeLabel(archiveLabel)
      thread.removeLabel(label)
    }
  },

  processRemoveAllowed: function (
    props: GoogleAppsScript.Properties.Properties,
    archiveLabel: GoogleAppsScript.Gmail.GmailLabel
  ) {
    let label = GmailApp.getUserLabelByName(labelNames.removeAllow)
    if (!label) {
      label = GmailApp.createLabel(labelNames.removeAllow)
    }
    for (const thread of label.getThreads()) {
      for (const msg of thread.getMessages()) {
        for (const email of util.getEmails(msg.getFrom())) {
          util.removeAllow(props, email)
        }
      }
      if (thread.isInInbox()) {
        thread.moveToArchive()
      }
      thread.addLabel(archiveLabel)
      thread.removeLabel(label)
    }
  },

  getEmails: function (str: string): string[] {
    return str.match(EMAIL_REG_EXP) || []
  },

  isAllowlisted: function (
    props: GoogleAppsScript.Properties.Properties,
    email: string
  ): boolean {
    return !!props.getProperty(email.toLowerCase())
  },

  allowlist: function (
    props: GoogleAppsScript.Properties.Properties,
    email: string
  ): void {
    props.setProperty(email.toLowerCase(), '1')
  },

  removeAllow: function (
    props: GoogleAppsScript.Properties.Properties,
    email: string
  ): void {
    props.deleteProperty(email.toLowerCase())
  },

  indexTo: function (
    props: GoogleAppsScript.Properties.Properties,
    start: number
  ): number {
    const indexCount = 10
    const threads = GmailApp.search('in:sent', start, indexCount)

    // Get set of emails sent `to`.
    const toSet = new Set<string>()
    for (const thread of threads) {
      for (const msg of thread.getMessages()) {
        for (const email of util.getEmails(msg.getTo())) {
          toSet.add(email)
        }
      }
    }

    // Persist emails.
    toSet.forEach((to) => {
      if (!util.isAllowlisted(props, to)) {
        util.allowlist(props, to)
      }
    })
    return indexCount
  },

  shouldKeep: function (
    props: GoogleAppsScript.Properties.Properties,
    thread: GoogleAppsScript.Gmail.GmailThread
  ): boolean {
    for (const msg of thread.getMessages()) {
      for (const email of util.getEmails(msg.getFrom())) {
        if (util.isAllowlisted(props, email)) {
          return true
        }
      }
    }
    return false
  },
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _viewProperties(): void {
  const props = PropertiesService.getUserProperties()
  const keys = props.getKeys()
  console.log('keys.length', keys.length)
  for (const key of keys) {
    console.log(key, props.getProperty(key))
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _deleteProperties(): void {
  PropertiesService.getUserProperties().deleteAllProperties()
}
