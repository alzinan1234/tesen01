import Newsome from '@/components/Reader/ReaderHome/Newsome'
import ReaderBanner from '@/components/Reader/ReaderHome/ReaderBanner'
import TheLede from '@/components/Reader/ReaderHome/TheLede'
import TodayMixCard from '@/components/Reader/ReaderHome/TodayMixCard'
import React from 'react'

const page = () => {
  return (
    <div className=''>
       <ReaderBanner />
       <TodayMixCard />
       <Newsome />
       <TheLede/>
    </div>
  )
}

export default page
