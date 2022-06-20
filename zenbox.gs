const EMAIL_REG_EXP = '[a-zA-Z\.\+]+@[a-zA-Z\.\+]+'

function getEmailIterator(str) {
  return [...str.matchAll(EMAIL_REG_EXP)]
}

function isBlessed(scriptProperties, email) {
  return !!scriptProperties.getProperty(`bless-${email}`)
}

function bless(scriptProperties, email) {
  console.log('bless', email)
  scriptProperties.setProperty(`bless-${email}`, true)
}

function indexTo(start, end) {
  console.log('indexTo', start, end)
  const threads = GmailApp.search("in:sent", start, end)

  // Get set of emails sent `to`.
  const toSet = new Set()
  for (const thread of threads) {
    for (const msg of thread.getMessages()) {
      for (const email of getEmailIterator(msg.getTo())) {
        toSet.add(email[0])
      }
    }
  }

  // Persist emails. 
  const scriptProperties = PropertiesService.getScriptProperties()
  let count = 0
  for (const to of toSet.values()) {
    if (!isBlessed(scriptProperties, to)) {
      bless(to)
      count++
    }
  }
  console.log('indexTo blessed', count)
}

function shouldKeep(scriptProperties, thread) {
  for (const msg of thread.getMessages()) {
    for (const email of getEmailIterator(msg.getFrom())) {
      if (isBlessed(scriptProperties, email)) {
        return true
      }
    }
  }
  return false
}

function cleanInbox() {
  const scriptProperties = PropertiesService.getScriptProperties()

  // Index if needed.
  // const toStart = parseInt(scriptProperties.getProperty('toStart') || '0')
  // const toEnd = parseInt(scriptProperties.getProperty('toEnd') || '50')
  // if (toEnd <= 500) {
  //   indexTo(toStart, toEnd)
  //   scriptProperties.setProperty('toStart', toEnd)
  //   scriptProperties.setProperty('toEnd', toEnd + 50)
  //   return
  // }

  // Organize.
  const threads = GmailApp.getInboxThreads()
  let label = GmailApp.getUserLabelByName("zenbox")
  if (!label) {
    label = GmailApp.createLabel('zenbox')
  }
  for (const thread of threads) {
    if (!shouldKeep(scriptProperties, thread)) {
      console.log('moving')
      thread.addLabel(label)
      thread.moveToArchive()
    }
  }
}

