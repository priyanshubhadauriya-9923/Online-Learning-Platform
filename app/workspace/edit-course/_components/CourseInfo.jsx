import { Button } from '@/components/ui/button'
import axios from 'axios';
import { Book, Clock, Loader2Icon, PlayCircle, Settings, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

function CourseInfo({course,viewCourse}) {
    const courseLayout = course?.courseJson?.course;
    const hasBannerImage = course?.bannerImageUrl && course.bannerImageUrl.trim() !== '';
    const [loading,setLoading]=useState(false);
    const router=useRouter();
    const GenerateCourseContent=async()=>{

        setLoading(true);
        try{
        const result=await axios.post('/api/generate-course-content',{
            courseJson:courseLayout,
            courseTitle:course?.name,
            courseId:course?.cid
        });
        console.log(result.data);
        setLoading(false);
        router.replace('/workspace')
        toast.success('Course Generated Successfully.')
        }
        catch(e)
        {
            console.log(e);
            setLoading(false);
            toast.error("Server Side error. Please try again")
        }

    }
    
    return (
        <div className='md:flex gap-5 justify-between p-5 rounded-2xl shadow'>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-3xl'>{courseLayout?.name}</h2>
                <p className='line-clamp-2 text-gray-500'>{courseLayout?.description}</p>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                    <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                        <Clock className='text-blue-500'/>
                        <section>
                            <h2 className='font-bold'>Duration</h2>
                            <h2>2 Hours</h2>
                        </section>
                    </div>
                    <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                        <Book className='text-green-500'/>
                        <section>
                            <h2 className='font-bold'>Chapters</h2>
                            <h2>{courseLayout?.chapters?.length || 0}</h2>
                        </section>
                    </div>
                    <div className='flex gap-5 items-center p-3 rounded-lg shadow'>
                        <TrendingUp className='text-red-500'/>
                        <section>
                            <h2 className='font-bold'>Difficulty Level</h2>
                            <h2>{course?.level}</h2>
                        </section>
                    </div>
                </div>
                {!viewCourse ?
                 <Button className={'max-w-sm'} onClick={GenerateCourseContent}
                disabled={loading}>
                {loading ? <Loader2Icon className='animate-spin' /> : <Settings />} Generate Content</Button>
                : <Link href={'/course/'+course?.cid}><Button> <PlayCircle/> Continue Learning </Button></Link>}
            </div>
            
            {hasBannerImage ? (
                <Image 
                    src={course.bannerImageUrl} 
                    alt='Course banner image' 
                    width={400} 
                    height={400} 
                    className='w-full h-[240px] mt-5 md:mt-0 object-cover aspect-auto rounded-2xl'  
                />
            ) : (
                <div className='bg-gray-200 border-2 border-dashed rounded-xl w-full h-[240px] mt-5 md:mt-0 flex items-center justify-center'>
                    <span className='text-gray-500'>No banner image</span>
                </div>
            )}
        </div>
    )
}

export default CourseInfo