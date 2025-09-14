"use client"
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

function Provider({ children }) {
  const { user } = useUser();
  const [userDetail,setUserDetail]=useState();
  const [selectedChapterIndex,setSelectedChapterIndex]=useState(0);

  useEffect(() => {
    if (user) CreateNewUser();
  }, [user])

  const CreateNewUser = async () => {
    // Validate required fields before sending
    if (!user.fullName || !user.primaryEmailAddress?.emailAddress) {
      console.error("Missing user data");
      return;
    }

    try {
      const result = await axios.post('/api/user', {
        name: user.fullName,  // Fixed typo: fullName (not fullname)
        email: user.primaryEmailAddress.emailAddress
      });
      console.log(result.data);
    } catch (error) {
      console.error("User creation failed:", 
        error.response?.data || error.message
      );
      console.log(result.data);
      setUserDetail(result.data);
    }
  }

  return (
    <UserDetailContext.Provider value={{ userDetail,setUserDetail }}>
      <SelectedChapterIndexContext.Provider value={{selectedChapterIndex,setSelectedChapterIndex}}>
        <div>{children}</div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>   
 )
}

export default Provider