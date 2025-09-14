"use client"
import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import CourseInfo from '../_components/CourseInfo';
import ChapterTopicList from '../_components/ChapterTopicList';

function EditCourse({viewCourse=false}) {
    const {courseId}=useParams();
    const [loading,setLoading]=useState(false);
    const [course,setCourse]=useState();
    const [error, setError] = useState(null);

    useEffect(()=>{
        console.log('EditCourse - CourseId from params:', courseId);
        console.log('EditCourse - CourseId type:', typeof courseId);
        console.log('EditCourse - Is courseId valid?:', courseId && !isNaN(parseInt(courseId)));
        
        if (courseId) {
            GetCourseInfo();
        } else {
            setError('No course ID provided');
        }
    },[courseId])

    const GetCourseInfo=async()=>{
        try {
            setLoading(true);
            setError(null);
            
            console.log('EditCourse - Making API call with courseId:', courseId);
            const result=await axios.get('/api/courses?courseId='+courseId);
            console.log('EditCourse - API Response:', result.data);
            setLoading(false);
            setCourse(result.data);
        } catch (error) {
            console.error('EditCourse - API Error:', error.response?.data || error.message);
            console.error('EditCourse - Status:', error.response?.status);
            console.error('EditCourse - CourseId that caused error:', courseId);
            
            setLoading(false);
            setError(error.response?.data?.error || 'Failed to load course information');
        }
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="text-center">Loading course information...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <div className="mt-2 text-sm">
                        <strong>Course ID:</strong> {courseId}
                        <br />
                        <strong>Type:</strong> {typeof courseId}
                    </div>
                    <button 
                        onClick={GetCourseInfo}
                        className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-4">
                <div className="text-center text-gray-500">No course data available</div>
            </div>
        );
    }

    return (
        <div>
            <CourseInfo course={course} viewCourse={viewCourse} />
            <ChapterTopicList course={course} />
        </div>
    )
}

export default EditCourse