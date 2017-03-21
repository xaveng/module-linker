const $ = window.jQuery

const external = require('../helpers').external
const treePromise = require('../helpers').treePromise
const createLink = require('../helpers').createLink
const bloburl = require('../helpers').bloburl

function treeProcess (tree) {
  return tree.map(path => {
    let parts = path.split('/')
    let index = parts.indexOf('lib')
    if (index === -1) return null
    return {
      prefix: parts.slice(0, index).join('/'),
      suffix: parts.slice(index + 1).join('/')
    }
  })
  .filter(path => path)
}

module.exports.process = function process () {
  let { user, repo, ref } = window.pathdata

  $('.blob-code-inner').each((i, elem) => {
    let line = elem.innerText.trim()
    let require = /require ["']([\w-_\/]*)["']/.exec(line)
    if (!require) return
    let moduleName = require[1]

    treePromise(treeProcess).then(paths => {
      for (let i = 0; i < paths.length; i++) {
        let {prefix, suffix} = paths[i]

        if (suffix.slice(0, -3) === moduleName) {
          return bloburl(user, repo, ref, `${prefix}/lib/${suffix}`)
        }
      }

      if (moduleName in stdlib) {
        return 'http://ruby-doc.org/stdlib/libdoc/' + moduleName + '/rdoc/index.html'
      } else {
        moduleName = moduleName.split('/')[0]
        return rubygemsurl(moduleName)
      }
    })
    .then(url => {
      createLink(elem, moduleName, url)
    })
  })
}

module.exports.processGemfile = function process () {
  $('.blob-code-inner').each((i, elem) => {
    let line = elem.innerText.trim()
    let gem = /gem ["']([\w-_]*)["']/.exec(line)
    let github = /github: ["']([\w-_\/]*)["']/.exec(line)

    if (gem) {
      let moduleName = gem[1]
      rubygemsurl(moduleName)
      .then(url => { createLink(elem, moduleName, url) })
      .catch(() => {})
    }

    if (github) {
      let path = github[1]
      createLink(elem, path, `https://github.com/${path}`)
    }
  })
}

var waiting = {} // a cache of promises to ruby external modules
module.exports.rubygemsurl = rubygemsurl
function rubygemsurl (moduleName) {
  moduleName = moduleName.split('/')[0]
  if (!waiting[moduleName]) {
    waiting[moduleName] = external('rubygems', moduleName)
      .catch(() => 'https://rubygems.org/gems/' + moduleName)
  }

  return waiting[moduleName]
}

const stdlib = {abbrev: 1, base64: 1, benchmark: 1, bigdecimal: 1, cgi: 1, cmath: 1, coverage: 1, csv: 1, date: 1, dbm: 1, debug: 1, delegate: 1, digest: 1, drb: 1, e2mmap: 1, English: 1, erb: 1, etc: 1, expect: 1, extmk: 1, fcntl: 1, fiddle: 1, fileutils: 1, find: 1, forwardable: 1, gdbm: 1, getoptlong: 1, 'io/console': 1, 'io/nonblock': 1, 'io/wait': 1, ipaddr: 1, irb: 1, json: 1, logger: 1, mathn: 1, matrix: 1, mkmf: 1, monitor: 1, mutex_m: 1, 'net/ftp': 1, 'net/http': 1, 'net/imap': 1, 'net/pop': 1, 'net/smtp': 1, 'net/telnet': 1, nkf: 1, objspace: 1, observer: 1, 'open-uri': 1, open3: 1, openssl: 1, optparse: 1, ostruct: 1, pathname: 1, pp: 1, prettyprint: 1, prime: 1, profile: 1, profiler: 1, pstore: 1, psych: 1, pty: 1, racc: 1, 'racc/parser': 1, rake: 1, rdoc: 1, readline: 1, resolv: 1, 'resolv-replace': 1, rexml: 1, rinda: 1, ripper: 1, rss: 1, rubygems: 1, scanf: 1, sdbm: 1, securerandom: 1, set: 1, shell: 1, shellwords: 1, singleton: 1, socket: 1, stringio: 1, strscan: 1, sync: 1, syslog: 1, tempfile: 1, thread: 1, thwait: 1, time: 1, timeout: 1, tk: 1, tmpdir: 1, tracer: 1, tsort: 1, un: 1, unicode_normalize: 1, uri: 1, weakref: 1, webrick: 1, win32ole: 1, xmlrpc: 1, yaml: 1, zlib: 1}