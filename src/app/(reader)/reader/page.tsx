import Newsome from '@/components/Reader/ReaderHome/Newsome'
import ReaderBanner from '@/components/Reader/ReaderHome/ReaderBanner'
import SundanceInPark from '@/components/Reader/ReaderHome/SundanceInPark'
import TheLede from '@/components/Reader/ReaderHome/TheLede'
import TheOPEDPodcast from '@/components/Reader/ReaderHome/TheOPEDPodcast'
import TodayMixCard from '@/components/Reader/ReaderHome/TodayMixCard'
import UnlimitedAccess from '@/components/Reader/ReaderHome/UnlimitedAccess'
import React from 'react'

const page = () => {
  return (
    <div className=''>
       <ReaderBanner />
       <TodayMixCard />
       <Newsome />
       <TheLede/>
       <SundanceInPark />
       <TheOPEDPodcast />
       <UnlimitedAccess />
    </div>
  )
}

export default page
