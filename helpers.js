/* global chrome */

const fetch = window.fetch

var waitToken = new Promise((resolve, reject) => {
  chrome.storage.sync.get('token', ({token}) => {
    if (chrome.runtime.lastError) {
      reject(chrome.runtime.lastError.message)
    } else {
      resolve(token)
    }
  })
})

module.exports.gh = function (path) {
  return waitToken
  .then(token =>
    fetch(`https://api.github.com/${path}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'github.com/fiatjaf/module-linker',
        'Authorization': `token ${token}`
      }
    })
    .then(r => {
      return r.json()
    })
  )
}

module.exports.pathdata = function () {
  let path = location.pathname.split('/')
  return {
    user: path[1],
    repo: path[2],
    ref: path[4] || 'master',
    current: path[4] ? path.slice(5) : ''
  }
}

module.exports.bloburl = function (user, repo, ref, path) {
  path = path[0] === '/' ? path.slice(1) : path
  return `https://github.com/${user}/${repo}/blob/${ref}/${path}`
}

module.exports.treeurl = function (user, repo, ref, path) {
  path = path[0] === '/' ? path.slice(1) : path
  return `https://github.com/${user}/${repo}/tree/${ref}/${path}`
}

module.exports.createLink = function createLink (lineElem, moduleName, url) {
  lineElem.innerHTML = lineElem.innerHTML.replace(
    moduleName,
    `<a class="module-linker" href="${url}">${moduleName}</a>`
  )
}
