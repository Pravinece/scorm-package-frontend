import { useEffect, useRef, useState } from 'react'
import { createScormApi } from '../scorm/runtime'

const LABELS = {
  'not attempted': 'Not started',
  unknown: 'Not started',
  browsed: 'Browsed',
  incomplete: 'In progress',
  completed: 'Completed',
  passed: 'Passed',
  failed: 'Failed',
}

export default function ScormPlayer({ course, onBack }) {
  const runtime = useRef(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState({ status: 'not attempted', score: '' })

  // Install the SCORM API on this window *before* the course iframe is created,
  // so the course can find it by walking up window.parent.
  useEffect(() => {
    const rt = createScormApi(course.version, {
      courseId: course.id,
      launchData: course.launchData,
      masteryScore: course.masteryScore,
      scaledPassingScore: course.scaledPassingScore,
      onChange: setProgress,
    })
    runtime.current = rt
    rt.install(window)
    setProgress(rt.summary())
    setReady(true)
    const save = () => rt.flush()
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('pagehide', save)
      rt.dispose(window)
    }
  }, [course])

  function back() {
    runtime.current?.flush() // save progress even if the course never called Finish/Terminate
    onBack()
  }

  const finished = progress.status === 'completed' || progress.status === 'passed'

  return (
    <div className="player">
      <header className="bar">
        <button className="back" onClick={back}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="title" title={course.title}>{course.title}</div>
        <div className="meta">
          <span>SCORM {course.version}</span>
          {progress.score !== '' && <span data-testid="score">Score {progress.score}</span>}
          <span className={`status ${finished ? 'done' : progress.status === 'failed' ? 'fail' : ''}`} data-testid="status">
            {LABELS[progress.status] || progress.status}
          </span>
        </div>
      </header>
      {ready && <iframe className="frame" src={course.launchUrl} title={course.title} allow="autoplay; fullscreen" allowFullScreen data-testid="course-frame" />}
    </div>
  )
}
