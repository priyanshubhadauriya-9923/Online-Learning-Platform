import React from 'react';

function WelcomeBanner() {
  return (
    // Added bg-gradient-to-r for horizontal gradient + text-white for contrast
    <div className='p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 rounded-xl text-white'>
      <h2 className='font-bold text-2xl'>Welcome to Online Learning Platform</h2>
      <p>Learn, Create and Explore Your Favorite courses</p>
    </div>
  );
}

export default WelcomeBanner;