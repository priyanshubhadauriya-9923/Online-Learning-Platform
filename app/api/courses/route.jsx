import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams?.get('courseId');
        
        console.log('CourseId received:', courseId);

        // Get user with error handling
        let user;
        try {
            user = await currentUser();
            console.log('User:', user?.primaryEmailAddress?.emailAddress);
        } catch (userError) {
            console.error('Error getting current user:', userError);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        // Case 1: courseId is "0" - get all courses with content
        if (courseId && courseId === '0') {
            try {
                const result = await db.select().from(coursesTable)
                    .where(sql`${coursesTable.courseContent}::jsonb != '{}'::jsonb`);
                
                console.log('All courses result:', result);
                return NextResponse.json(result);
            } catch (dbError) {
                console.error('Database error for all courses:', dbError);
                return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
            }
        }

        // Case 2: specific courseId provided
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
                    .where(eq(coursesTable.cid, searchValue));

                console.log('Specific course result:', result);

                if (result.length === 0) {
                    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
                }

                return NextResponse.json(result[0]);
            } catch (dbError) {
                console.error('Database error for specific course:', dbError);
                return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
            }
        }

        // Case 3: No courseId - get user's courses
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: 'User email not found' }, { status: 401 });
        }

        try {
            const result = await db.select().from(coursesTable)
                .where(eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(coursesTable.id));

            console.log('User courses result:', result);
            return NextResponse.json(result);
        } catch (dbError) {
            console.error('Database error for user courses:', dbError);
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
        }

    } catch (error) {
        console.error('Unexpected error in API route:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}