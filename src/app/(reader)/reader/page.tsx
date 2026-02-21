import Newsome from '@/components/Reader/ReaderHome/Newsome'
import ReaderBanner from '@/components/Reader/ReaderHome/ReaderBanner'
import SundanceInPark from '@/components/Reader/ReaderHome/SundanceInPark'
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
       <SundanceInPark />
    </div>
  )
}

export default page
