import React, { useEffect, useState } from 'react'
import ScormPlayer from '../../components/ScormPlayer';
import { loadCourse } from '../scorm/loadCourse';

function PlayScorm({packageId, packages}) {
    let currentPckg = packages.find((item)=>item._id == packageId)
    let [play , setPlay] = useState(false)
    const [activeCourse, setActiveCourse] = useState(null);
    const [loading, setLoading] = useState(false);
  
    console.log('currentPckg: ', currentPckg);
    async function playPackage(pkg) {
      console.log('pkg: ', pkg);
      setLoading(true);
      try {
        const course = await loadCourse(pkg._id);
        setActiveCourse(course);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }

    useEffect(()=>{
      if(play){
        playPackage(currentPckg)
      }
    },[play])
    
  return (
    <div className='w-full h-full flex justify-center items-center'>
        {(!activeCourse)&&<button className='px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-xl shadow-md transition-all duration-200 ease-in-out' disabled={loading} onClick={()=>setPlay(true)}>Play</button>}
        {
          activeCourse && <ScormPlayer course={activeCourse} onBack={()=> {setPlay(false), setActiveCourse(null)}} />
        }
    </div>
  )
}

export default PlayScorm