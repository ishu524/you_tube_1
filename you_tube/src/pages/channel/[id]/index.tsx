import ChannelHeader from '@/components/ChannelHeader';
import Channeltabs from '@/components/Channeltabs';
import ChannelVideos from '@/components/ChannelVideos';
import VideoUploader from '@/components/VideoUploader';
import { useUser } from '@/lib/AuthContext';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react'

const index = () => {
    const router = useRouter()
    const { id } = router.query;
    const { user } = useUser();
    //   const user: any = {
    //  id: 1,
    //  name: "John Doe",
    //email: "john.doe@example.com",
    // image: "https://tse2.mm.bing.net/th/id/OIP.9-uO9K5uFpERhAc8OShvlQHaFj?pid=Api&P=0&h=180",
    // };
    try {
        let channel = user

        const videos = [
            {
                _id: "1",
                videotitle: "Amazing Nature Documentary",
                filename: "nature-doc.mp4",
                filetype: "video/mp4",
                filepath: "/videos/nature-doc.mp4",
                filesize: "500MB",
                videochanel: "Nature Channel",
                Like: 1250,
                Dislikes: 100,
                views: 45000,
                uploader: "nature_lover",
                createdAt: new Date().toISOString(),
            },
            {
                _id: "2",
                videotitle: "Cooking Tutorial: Perfect Pasta",
                filename: "pasta-tutorial.mp4",
                filetype: "video/mp4",
                filepath: "/videos/pasta-tutorial.mp4",
                filesize: "300MB",
                videochanel: "Chef's Kitchen",
                Like: 890,
                Dislikes: 50,
                views: 23000,
                uploader: "chef_master",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ]
        return (
            <div className='min-h-screen bg-white' >
                <ChannelHeader channel={channel} user={user} />
                <div className='max-w-7xl mx-auto'>
                    <Channeltabs />
                    <div>
                        <VideoUploader channelId={id} channelName={channel?.channelname} />
                    </div>
                    <div>
                        <ChannelVideos videos={videos} />
                    </div>
                </div>

            </div >
        )


    } catch (error) {
        console.error("error fetching channel data:", error)

    }

}

export default index