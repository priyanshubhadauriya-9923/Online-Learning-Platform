import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const {courseId} = await req.json();
        const user = await currentUser();

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        //if course is enrolled
        const enrollCourses = await db.select().from(enrollCourseTable)
            .where(and(
                eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress),
                eq(enrollCourseTable.cid, courseId)
            ));

        if(enrollCourses?.length == 0){
            const result = await db.insert(enrollCourseTable)
                .values({
                    cid: courseId,
                    userEmail: user.primaryEmailAddress.emailAddress
                }).returning(enrollCourseTable)

            return NextResponse.json(result);
        }
        return NextResponse.json({'resp': 'Already Enrolled'})

    } catch (error) {
        console.error('POST /api/enroll-course error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams?.get('courseId');
        
        console.log('Enroll-course GET - CourseId received:', courseId);

        // Get user with error handling
        let user;
        try {
            user = await currentUser();
            console.log('User:', user?.primaryEmailAddress?.emailAddress);
        } catch (userError) {
            console.error('Error getting current user:', userError);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: 'User email not found' }, { status: 401 });
        }

        if (courseId) {
            // Validate courseId format (UUID or number)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(courseId);
            const isNumber = !isNaN(parseInt(courseId));
            
            if (!isUUID && !isNumber) {
                console.error('Invalid courseId format:', courseId);
                return NextResponse.json({ 
                    error: 'Invalid course ID format', 
                    received: courseId,
                    expectedFormat: 'UUID or number'
                }, { status: 400 });
            }

            try {
                // Use the courseId as-is (string for UUID, or convert to number)
                const searchValue = isUUID ? courseId : parseInt(courseId);
                const result = await db.select().from(coursesTable)
                    .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
                    .where(and(
                        eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress),
                        eq(enrollCourseTable.cid, searchValue)
                    ));

                console.log('Single course result:', result);

                if (result.length === 0) {
                    return NextResponse.json({ error: 'Enrolled course not found' }, { status: 404 });
                }

                return NextResponse.json(result[0]);
            } catch (dbError) {
                console.error('Database error for single enrolled course:', dbError);
                return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
            }
        } else {
            // Get all enrolled courses for user
            try {
                const result = await db.select().from(coursesTable)
                    .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
                    .where(eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress))
                    .orderBy(desc(enrollCourseTable.id));

                console.log('All enrolled courses result:', result);
                return NextResponse.json(result);
            } catch (dbError) {
                console.error('Database error for all enrolled courses:', dbError);
                return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
            }
        }

    } catch (error) {
        console.error('Unexpected error in GET /api/enroll-course:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const {completedChapter, courseId} = await req.json();
        const user = await currentUser();

        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (!courseId || !completedChapter) {
            return NextResponse.json({ error: 'Course ID and completed chapter are required' }, { status: 400 });
        }

        const result = await db.update(enrollCourseTable).set({
            completedChapters: completedChapter
        }).where(and(
            eq(enrollCourseTable.cid, courseId),
            eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress)
        )).returning(enrollCourseTable)

        return NextResponse.json(result);

    } catch (error) {
        console.error('PUT /api/enroll-course error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}