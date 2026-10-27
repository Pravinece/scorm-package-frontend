// Courses page example
import { useEffect, useState } from 'react';
import { loadCourse } from '../scorm/loadCourse';
import ScormPlayer from '../../components/ScormPlayer';
import instance from '../../utils/service';

export default function Courses({ token }) {
  const [packages, setPackages] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  // fetch list
  useEffect(() => {
    instance.get('packages')
      .then(data => {
        setPackages(data.data.packages.filter(p => p.status === 'ready'))});
  }, [token]);

  async function playPackage(pkg) {
    console.log('pkg: ', pkg);
    setLoading(true);
    try {
      const course = await loadCourse(pkg._id, token);
      setActiveCourse(course);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (activeCourse) {
    return (
      <ScormPlayer
        course={activeCourse}
        onBack={() => setActiveCourse(null)}
      />
    );
  }

  return (
    <div className='m-10 h-[80vh]'>
      <h1>SCORM Packages</h1>
      <div className='w-full h-full overflow-auto'>

      {packages.map(pkg => (
          <div className='w-full border-4 border-gray-200 rounded-xl shadow-2xl flex justify-between items-center p-2 text-[12px]' key={pkg._id}>
          <h3>{pkg.title}</h3>
          <button className='bg-blue-500 p-1 rounded-2xl w-15 text-gray-200 cursor-pointer' onClick={() => playPackage(pkg)} disabled={loading}>
            Play
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}