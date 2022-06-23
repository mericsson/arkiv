const EMAIL_REG_EXP = '[0-9a-zA-Z\.\+\=\-]+@[0-9a-zA-Z\.\+\=\-]+'

function cleanInbox() {
  const scriptProperties = PropertiesService.getScriptProperties()

  // Index if needed.
  const toStart = parseInt(scriptProperties.getProperty('..start..') || '0')
  if (toStart <= 200) {
    const indexCount = indexTo(toStart)
    scriptProperties.setProperty('..start..', toStart + indexCount)
    return
  } else {
    // Regular indexing starting at 0.
    indexTo(0)
  }

  // Organize.
  const threads = GmailApp.getInboxThreads()
  let label = GmailApp.getUserLabelByName("zenbox")
  if (!label) {
    label = GmailApp.createLabel('zenbox')
  }
  for (const thread of threads) {
    if (!shouldKeep(scriptProperties, thread)) {
      thread.addLabel(label)
      thread.moveToArchive()
    }
  }
}

function getEmails(str) {
  const emails = []
  for (const match of str.matchAll(EMAIL_REG_EXP)) {
    emails.push(match[0])
  }
  return emails
}

function isBlessed(scriptProperties, email) {
  return !!scriptProperties.getProperty(email.toLowerCase())
}

function bless(scriptProperties, email) {
  scriptProperties.setProperty(email.toLowerCase(), true)
}

function clearProperties() {
  PropertiesService.getScriptProperties().deleteAllProperties();
}

function indexTo(start) {
  console.log('indexTo', start)
  const indexCount = 10
  const threads = GmailApp.search("in:sent", start, indexCount)

  // Get set of emails sent `to`.
  const toSet = new Set()
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

function shouldKeep(scriptProperties, thread) {
  for (const msg of thread.getMessages()) {
    for (const email of getEmails(msg.getFrom())) {
      if (isBlessed(scriptProperties, email)) {
        return true
      }
    }
  }
  return false
}


