//import { useParams } from 'next/navigation'
import React from 'react'
import EditCourse from '../../edit-course/[courseId]/page';

function ViewCourse() {
  //const { couseId } = useParams();
  return (
    <div>
      <EditCourse viewCourse={true} />
    </div>
  )
}

export default ViewCourse
