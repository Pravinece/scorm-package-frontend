// SCORM runtime: window.API (SCORM 1.2) and window.API_1484_11 (SCORM 2004).
// One engine serves both; the version config below holds the differences.
import { loadSaved, saveState } from './store.js'
import { parse12, format12, parseISO, formatISO } from './time.js'

// "{n}" in a pattern stands for an array index; everything else is literal (dots are escaped).
const compile = (list) =>
  list.map(([p, v]) => [new RegExp('^' + p.replace(/\./g, '\\.').replace(/\{n\}/g, '\\d+') + '$'), v])

const ERR_12 = {
  0: 'No error', 101: 'General exception', 201: 'Invalid argument error',
  202: 'Element cannot have children', 203: 'Element not an array. Cannot have count',
  301: 'Not initialized', 401: 'Not implemented error',
  402: 'Invalid set value, element is a keyword', 403: 'Element is read only',
  404: 'Element is write only', 405: 'Incorrect data type',
}
const ERR_2004 = {
  0: 'No Error', 101: 'General Exception', 102: 'General Initialization Failure',
  103: 'Already Initialized', 104: 'Content Instance Terminated',
  111: 'General Termination Failure', 112: 'Termination Before Initialization',
  113: 'Termination After Termination', 122: 'Retrieve Data Before Initialization',
  123: 'Retrieve Data After Termination', 132: 'Store Data Before Initialization',
  133: 'Store Data After Termination', 142: 'Commit Before Initialization',
  143: 'Commit After Termination', 201: 'General Argument Error', 301: 'General Get Failure',
  351: 'General Set Failure', 391: 'General Commit Failure',
  401: 'Undefined Data Model Element', 402: 'Unimplemented Data Model Element',
  403: 'Data Model Element Value Not Initialized', 404: 'Data Model Element Is Read Only',
  405: 'Data Model Element Is Write Only', 406: 'Data Model Element Type Mismatch',
  407: 'Data Model Element Value Out Of Range', 408: 'Data Model Dependency Not Established',
}

// [pattern, mode] where mode is r (read-only), w (write-only) or rw
const SPEC_12 = compile([
  ['cmi.core.student_id', 'r'], ['cmi.core.student_name', 'r'],
  ['cmi.core.lesson_location', 'rw'], ['cmi.core.credit', 'r'],
  ['cmi.core.lesson_status', 'rw'], ['cmi.core.entry', 'r'],
  ['cmi.core.score.(raw|min|max)', 'rw'], ['cmi.core.total_time', 'r'],
  ['cmi.core.lesson_mode', 'r'], ['cmi.core.exit', 'w'], ['cmi.core.session_time', 'w'],
  ['cmi.suspend_data', 'rw'], ['cmi.launch_data', 'r'],
  ['cmi.comments', 'rw'], ['cmi.comments_from_lms', 'r'],
  ['cmi.student_data.(mastery_score|max_time_allowed|time_limit_action)', 'r'],
  ['cmi.student_preference.(audio|language|speed|text)', 'rw'],
  ['cmi.objectives.{n}.(id|status|score.(raw|min|max))', 'rw'],
  ['cmi.interactions.{n}.(id|time|type|weighting|student_response|result|latency)', 'w'],
  ['cmi.interactions.{n}.(objectives|correct_responses).{n}.(id|pattern)', 'w'],
])
const SPEC_2004 = compile([
  ['cmi.comments_from_learner.{n}.(comment|location|timestamp)', 'rw'],
  ['cmi.comments_from_lms.{n}.(comment|location|timestamp)', 'r'],
  ['cmi.completion_status', 'rw'], ['cmi.completion_threshold', 'r'],
  ['cmi.credit', 'r'], ['cmi.entry', 'r'], ['cmi.exit', 'w'],
  ['cmi.interactions.{n}.(id|type|timestamp|weighting|learner_response|result|latency|description)', 'rw'],
  ['cmi.interactions.{n}.objectives.{n}.id', 'rw'],
  ['cmi.interactions.{n}.correct_responses.{n}.pattern', 'rw'],
  ['cmi.launch_data', 'r'], ['cmi.learner_id', 'r'], ['cmi.learner_name', 'r'],
  ['cmi.learner_preference.(audio_level|language|delivery_speed|audio_captioning)', 'rw'],
  ['cmi.location', 'rw'], ['cmi.max_time_allowed', 'r'], ['cmi.mode', 'r'],
  ['cmi.objectives.{n}.(id|success_status|completion_status|progress_measure|description|score.(scaled|raw|min|max))', 'rw'],
  ['cmi.progress_measure', 'rw'], ['cmi.scaled_passing_score', 'r'],
  ['cmi.score.(scaled|raw|min|max)', 'rw'], ['cmi.session_time', 'w'],
  ['cmi.success_status', 'rw'], ['cmi.suspend_data', 'rw'],
  ['cmi.time_limit_action', 'r'], ['cmi.total_time', 'r'], ['adl.nav.request', 'rw'],
])

const KIDS_12 = compile([
  ['cmi._children', 'core,suspend_data,launch_data,comments,objectives,student_data,student_preference,interactions'],
  ['cmi.core._children', 'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time'],
  ['cmi.core.score._children', 'raw,min,max'],
  ['cmi.objectives._children', 'id,score,status'],
  ['cmi.objectives.{n}.score._children', 'raw,min,max'],
  ['cmi.student_data._children', 'mastery_score,max_time_allowed,time_limit_action'],
  ['cmi.student_preference._children', 'audio,language,speed,text'],
  ['cmi.interactions._children', 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency'],
])
const KIDS_2004 = compile([
  ['cmi.comments_from_learner._children', 'comment,location,timestamp'],
  ['cmi.comments_from_lms._children', 'comment,location,timestamp'],
  ['cmi.interactions._children', 'id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description'],
  ['cmi.learner_preference._children', 'audio_level,language,delivery_speed,audio_captioning'],
  ['cmi.objectives._children', 'id,score,success_status,completion_status,description'],
  ['cmi.score._children', 'scaled,raw,min,max'],
  ['cmi.objectives.{n}.score._children', 'scaled,raw,min,max'],
])

const COUNTS_12 = ['cmi.objectives', 'cmi.interactions', 'cmi.interactions.{n}.objectives', 'cmi.interactions.{n}.correct_responses']
const COUNTS_2004 = ['cmi.comments_from_learner', 'cmi.comments_from_lms', 'cmi.objectives', 'cmi.interactions',
  'cmi.interactions.{n}.objectives', 'cmi.interactions.{n}.correct_responses']
const compileCounts = (list) => compile(list.map((p) => [p, true]))

const NUM = /^-?(\d+(\.\d*)?|\.\d+)$/
const oneOf = (list, v, code) => (list.includes(v) ? 0 : code)

const VERSIONS = {
  '1.2': {
    global: 'API',
    errors: ERR_12,
    spec: SPEC_12, kids: KIDS_12, counts: compileCounts(COUNTS_12),
    k: {
      status: 'cmi.core.lesson_status', location: 'cmi.core.lesson_location', exit: 'cmi.core.exit',
      session: 'cmi.core.session_time', total: 'cmi.core.total_time', entry: 'cmi.core.entry',
      raw: 'cmi.core.score.raw', suspend: 'cmi.suspend_data',
    },
    // [initialized twice, get/set/commit/finish before init, ... after finish]
    e: { already: 101, arg: 201, getPre: 301, getPost: 301, setPre: 301, setPost: 301,
      commitPre: 301, commitPost: 301, termPre: 301, termPost: 301, undef: 401, keyword: 402,
      readOnly: 403, writeOnly: 404, type: 405 },
    parse: parse12, format: format12,
    validate(el, v) {
      if (el === 'cmi.core.lesson_status')
        return oneOf(['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'], v, 405)
      if (el === 'cmi.core.exit') return oneOf(['time-out', 'suspend', 'logout', ''], v, 405)
      if (el === 'cmi.core.session_time') return parse12(v) == null ? 405 : 0
      if (/\.score\.(raw|min|max)$/.test(el)) return v === '' || (NUM.test(v) && +v >= 0 && +v <= 100) ? 0 : 405
      return 0
    },
  },
  '2004': {
    global: 'API_1484_11',
    errors: ERR_2004,
    spec: SPEC_2004, kids: KIDS_2004, counts: compileCounts(COUNTS_2004),
    k: {
      status: 'cmi.completion_status', location: 'cmi.location', exit: 'cmi.exit',
      session: 'cmi.session_time', total: 'cmi.total_time', entry: 'cmi.entry',
      raw: 'cmi.score.raw', suspend: 'cmi.suspend_data',
    },
    e: { already: 103, arg: 201, getPre: 122, getPost: 123, setPre: 132, setPost: 133,
      commitPre: 142, commitPost: 143, termPre: 112, termPost: 113, undef: 401, keyword: 404,
      readOnly: 404, writeOnly: 405, type: 406 },
    parse: parseISO, format: formatISO,
    validate(el, v) {
      if (/^cmi\.(objectives\.\d+\.)?completion_status$/.test(el))
        return oneOf(['completed', 'incomplete', 'not attempted', 'unknown'], v, 406)
      if (/^cmi\.(objectives\.\d+\.)?success_status$/.test(el)) return oneOf(['passed', 'failed', 'unknown'], v, 406)
      if (el === 'cmi.exit') return oneOf(['time-out', 'suspend', 'logout', 'normal', ''], v, 406)
      if (el === 'cmi.session_time') return parseISO(v) == null ? 406 : 0
      if (/(^|\.)score\.scaled$/.test(el)) return !NUM.test(v) ? 406 : +v >= -1 && +v <= 1 ? 0 : 407
      if (/(^|\.)progress_measure$/.test(el)) return !NUM.test(v) ? 406 : +v >= 0 && +v <= 1 ? 0 : 407
      if (/\.score\.(raw|min|max)$|^cmi\.score\.(raw|min|max)$/.test(el)) return NUM.test(v) ? 0 : 406
      return 0
    },
  },
}

// Values that are per-session (or never worth restoring) are not saved.
const NOT_PERSISTED = /^cmi\.interactions\.|\.session_time$|\.exit$|^adl\.nav\./

export function createScormApi(version, ctx = {}) {
  const cfg = VERSIONS[version] || VERSIONS['1.2']
  const v12 = cfg === VERSIONS['1.2']
  const { k, e: E } = cfg
  const courseId = ctx.courseId || 'default'

  const saved = loadSaved(courseId)
  const user = { ...(saved?.values || {}) } // everything the course has written
  let total = saved?.total || 0 // seconds from earlier sessions
  let lastExit = saved?.exit || ''
  let defaults = {}
  let state = 'idle' // idle | running | terminated
  let startedAt = 0
  let err = 0
  let diag = ''

  const ok = (value = 'true') => { err = 0; diag = ''; return value }
  const bad = (code, value = 'false', d = '') => { err = code; diag = d; return value }

  const finished = () =>
    v12 ? ['completed', 'passed'].includes(user[k.status])
      : user[k.status] === 'completed' || user['cmi.success_status'] === 'passed'

  const persist = () => {
    const values = Object.fromEntries(Object.entries(user).filter(([key]) => !NOT_PERSISTED.test(key)))
    saveState(courseId, { values, total, exit: lastExit })
  }

  const summary = () => {
    const get = (key) => user[key] || ''
    if (v12) return { status: get(k.status) || 'not attempted', score: get(k.raw) }
    const success = get('cmi.success_status')
    const completion = get(k.status) || 'unknown'
    const scaled = get('cmi.score.scaled')
    return {
      status: success === 'passed' || success === 'failed' ? success : completion,
      score: get(k.raw) || (scaled !== '' ? String(Math.round(+scaled * 100)) : ''),
    }
  }
  const notify = () => ctx.onChange?.(summary())

  const lookup = (el) => cfg.spec.find(([re]) => re.test(el))?.[1] || null

  const count = (prefix) => {
    const re = new RegExp('^' + prefix.replace(/\./g, '\\.') + '\\.(\\d+)\\.')
    let n = 0
    for (const key of Object.keys(user)) {
      const m = re.exec(key)
      if (m) n = Math.max(n, +m[1] + 1)
    }
    return n
  }

  const begin = () => {
    delete user[k.exit]
    delete user[k.session]
    const resume = lastExit === 'suspend' || (!finished() && !!(user[k.location] || user[k.suspend]))
    if (!resume) {
      delete user[k.location]
      delete user[k.suspend]
    }
    defaults = v12
      ? {
          'cmi.core.student_id': 'local-learner', 'cmi.core.student_name': 'Learner, Local',
          'cmi.core.credit': 'credit', 'cmi.core.lesson_mode': 'normal',
          'cmi.core.lesson_status': 'not attempted',
          'cmi.launch_data': ctx.launchData || '',
          'cmi.student_data.mastery_score': ctx.masteryScore || '',
          'cmi.student_data.max_time_allowed': '', 'cmi.student_data.time_limit_action': '',
          'cmi.student_preference.audio': '0', 'cmi.student_preference.language': '',
          'cmi.student_preference.speed': '0', 'cmi.student_preference.text': '0',
          'cmi.comments_from_lms': '',
        }
      : {
          'cmi.learner_id': 'local-learner', 'cmi.learner_name': 'Local Learner',
          'cmi.credit': 'credit', 'cmi.mode': 'normal',
          'cmi.completion_status': 'unknown', 'cmi.success_status': 'unknown',
          'cmi.launch_data': ctx.launchData || '',
          'cmi.scaled_passing_score': ctx.scaledPassingScore || '',
          'cmi.completion_threshold': '', 'cmi.max_time_allowed': '', 'cmi.time_limit_action': '',
          'cmi._version': '1.0', 'adl.nav.request': '_none_',
        }
    defaults[k.entry] = resume ? 'resume' : 'ab-initio'
    defaults[k.total] = cfg.format(total)
    startedAt = Date.now()
    state = 'running'
  }

  const end = () => {
    const reported = user[k.session] != null ? cfg.parse(user[k.session]) : null
    total += reported ?? (Date.now() - startedAt) / 1000
    lastExit = user[k.exit] || ''
    state = 'terminated'
    persist()
    notify()
  }

  // ---- API methods -------------------------------------------------------
  const initialize = (p) => {
    if (p !== undefined && p !== '') return bad(E.arg)
    if (state === 'running') return bad(E.already)
    if (state === 'terminated' && !v12) return bad(104)
    begin()
    return ok()
  }

  const terminate = (p) => {
    if (p !== undefined && p !== '') return bad(E.arg)
    if (state !== 'running') return bad(state === 'idle' ? E.termPre : E.termPost)
    end()
    return ok()
  }

  const commit = (p) => {
    if (p !== undefined && p !== '') return bad(E.arg)
    if (state !== 'running') return bad(state === 'idle' ? E.commitPre : E.commitPost)
    persist()
    return ok()
  }

  const getValue = (el) => {
    if (state !== 'running') return bad(state === 'idle' ? E.getPre : E.getPost, '')
    if (typeof el !== 'string' || !el) return bad(E.arg, '')
    if (el.endsWith('._children')) {
      const hit = cfg.kids.find(([re]) => re.test(el))
      return hit ? ok(hit[1]) : bad(v12 ? 202 : E.undef, '')
    }
    if (el.endsWith('._count')) {
      const prefix = el.slice(0, -'._count'.length)
      return cfg.counts.some(([re]) => re.test(prefix)) ? ok(String(count(prefix))) : bad(v12 ? 203 : E.undef, '')
    }
    if (el === 'cmi._version') return ok(v12 ? '3.4' : '1.0')
    const mode = lookup(el)
    if (!mode) return bad(E.undef, '')
    if (mode === 'w') return bad(E.writeOnly, '')
    if (el in user) return ok(String(user[el]))
    if (el in defaults) return ok(String(defaults[el]))
    return ok('')
  }

  const setValue = (el, value) => {
    if (state !== 'running') return bad(state === 'idle' ? E.setPre : E.setPost)
    if (typeof el !== 'string' || !el) return bad(E.arg)
    const v = value == null ? '' : String(value)
    if (el.endsWith('._children') || el.endsWith('._count') || el === 'cmi._version') return bad(E.keyword)
    const mode = lookup(el)
    if (!mode) return bad(E.undef)
    if (mode === 'r') return bad(E.readOnly)
    const invalid = cfg.validate(el, v)
    if (invalid) return bad(invalid)
    user[el] = v
    persist()
    notify()
    return ok()
  }

  const wrap = (name, fn) => (...args) => {
    const result = fn(...args)
    console.debug(`[SCORM ${version}] ${name}(${args.map((a) => JSON.stringify(a)).join(', ')}) -> ${JSON.stringify(result)}${err ? ` (error ${err})` : ''}`)
    return result
  }
  const errorString = (code) => cfg.errors[Number(code)] || ''

  const api = v12
    ? {
        LMSInitialize: wrap('LMSInitialize', initialize),
        LMSFinish: wrap('LMSFinish', terminate),
        LMSGetValue: wrap('LMSGetValue', getValue),
        LMSSetValue: wrap('LMSSetValue', setValue),
        LMSCommit: wrap('LMSCommit', commit),
        LMSGetLastError: () => String(err),
        LMSGetErrorString: errorString,
        LMSGetDiagnostic: () => diag || errorString(err),
      }
    : {
        Initialize: wrap('Initialize', initialize),
        Terminate: wrap('Terminate', terminate),
        GetValue: wrap('GetValue', getValue),
        SetValue: wrap('SetValue', setValue),
        Commit: wrap('Commit', commit),
        GetLastError: () => String(err),
        GetErrorString: errorString,
        GetDiagnostic: () => diag || errorString(err),
      }

  return {
    api,
    summary,
    install: (target) => { target[cfg.global] = api },
    // Save and close the session if the course never did (used by Back / page close).
    flush: () => { if (state === 'running') end() },
    dispose(target) {
      if (state === 'running') end()
      if (target[cfg.global] === api) delete target[cfg.global]
    },
  }
}
