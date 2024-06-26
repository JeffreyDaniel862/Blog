import { Link, useLoaderData } from "react-router-dom";
import { Button } from 'flowbite-react'
import { useEffect, useState } from "react";
import Comment from "../components/Comment";
import { FaBookmark, FaCheck, FaHeart, FaRegBookmark, FaRegEye, FaRegHeart } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import AuthModal from "../components/AuthModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import queryClient from "../utils/http";
import Card from "../components/Card";

export default function PostPage() {
    const post = useLoaderData();
    const [author, setAuthor] = useState(undefined);
    const [copy, setCopy] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [liked, setLiked] = useState(false);
    const { user } = useSelector(state => state.user);
    const [morePosts, setMorePosts] = useState();

    const { data: likedData } = useQuery({
        queryKey: ['likesOfPost'],
        queryFn: () => getLikes(post?.id)
    });

    const { data: isSaved } = useQuery({
        queryKey: ['isSaved'],
        queryFn: () => getSavedPost({ postId: post?.id, userId: user?.id })
    })

    const { mutate: saveMutation } = useMutation({
        mutationFn: savePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['isSaved'] });
        }
    })

    const { mutate: likeMutation } = useMutation({
        mutationFn: likePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likesOfPost'] });
        }
    });

    useEffect(() => {
        if (likedData) {
            const ans = likedData?.likedUsers.findIndex(likedUser => likedUser.userId == user?.id);
            if (ans != -1) {
                setLiked(true);
            } else {
                setLiked(false)
            }
        }
        queryClient.invalidateQueries({ queryKey: ['isSaved'] });
    }, [likedData, user])

    useEffect(() => {
        if (post) {
            const fetchUser = async () => {
                const response = await fetch(`/jd/user/getUser?userId=${post.userId}`);
                const resData = await response.json();
                if (response.ok) {
                    setAuthor(resData)
                }
            }
            const updateViews = async () => {
                const response = await fetch(`/jd/post/update-views/${post?.id}`, {
                    method: "PATCH"
                });
                const resData = await response.json();
                if (response.ok) {
                    console.log(resData);
                }
            }
            updateViews();
            fetchUser();
        }
        const fetchMorePosts = async () => {
            const response = await fetch(`/jd/post/getposts?userId=${post.userId}&limit=${3}`);
            const resData = await response.json();
            if (response.ok) {
                setMorePosts(resData.posts);
            }
        }
        fetchMorePosts();
    }, [post]);

    const handleCopy = () => {
        setCopy(true);
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(
            () => {
                console.log('Copied!');
            },
            () => {
                console.log('Copy error')
            }
        );
        setTimeout(() => {
            setCopy(false)
        }, 5000);
    }

    const handleLike = () => {
        likeMutation({ postId: post?.id, userId: user?.id });
    }

    const handleSavePost = () => {
        saveMutation({ postId: post?.id, userId: user?.id });
    }

    const closeModal = () => {
        setShowModal(false);
    }

    return (
        <>
            <main className="p-3 flex flex-col gap-3 items-center max-w-6xl min-h-screen mx-auto">
                <h1 className="text-3xl text-center font-serif lg:text-4xl max-w-2xl mx-auto mt-10">{post.title}</h1>
                <Button className="mt-5" pill color={'gray'} size={'xs'}>{post && post.category}</Button>
                <img className="w-full max-h-[660px] object-cover mt-10 rounded-lg" src={post.coverImage} alt="cover image" />
                <div className="border-b-2 border-slate-500 w-full px-2 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex gap-2 md:gap-6 items-center py-3 text-sm italic">
                        <img className="h-6 w-6 md:h-10 md:w-10 rounded-full" src={author?.displayPicture} alt="Author's Picture" />
                        <div className="flex flex-col gap-2 md:gap-3 justify-center items-start">
                            <Link to={`/@${author?.username}`} className="italic text-sm md:text-lg hover:underline">
                                <p>{author?.username}</p>
                            </Link>
                            <p className="text-gray-400">
                                <span className="pr-1">Published On:</span>
                                {new Date(post.createdAt).toDateString()}
                                <span className="px-2 md:px-4">-</span>
                                {post && (post.content.length / 1000).toFixed(0)} mins read
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center self-end gap-6 text-lg py-3 text-gray-500 dark:text-gray-400">
                        <div className="flex gap-3 items-center">
                            <FaRegEye className="text-xl  text-sky-600 dark:text-sky-400" />
                            <span className="text-sm italic">{post && post.View.views} views</span>
                        </div>
                        <p className="flex gap-3 items-center">
                            {
                                liked ?
                                    <FaHeart className="text-red-700 hover:scale-150 transition-all delay-150 customAnime" title="liked" onClick={handleLike} />
                                    :
                                    <FaRegHeart className="hover:scale-150 transition-all delay-150" title="like" onClick={user ? handleLike : () => setShowModal(true)} />
                            }
                            <span className="text-sm font-semibold">{likedData && likedData?.count}</span>
                        </p>
                        {
                            isSaved ?
                                <FaBookmark className="text-green-700 dark:text-green-400 hover:scale-125 transition-all delay-150" title="saved" onClick={handleSavePost} />
                                :
                                <FaRegBookmark className="hover:text-green-700 hover:scale-125 transition-all delay-150" title="save" onClick={user ? handleSavePost : () => setShowModal(true)} />
                        }
                        {copy ? <FaCheck className="text-green-600 dark:text-green-400 animate-pulse" /> : <MdContentCopy title="copy" onClick={handleCopy} />}
                    </div>
                </div>
                <article className="p-3 max-w-2xl mx-auto w-full post-content" dangerouslySetInnerHTML={{ __html: post && post.content }}>

                </article>
                <div className="max-w-2xl mx-auto w-full p-3 border-y-2 border-gray-400">
                    <Comment postId={post.id} />
                </div>
                {
                    morePosts?.length > 1 &&
                    <div className="flex flex-col justify-center items-center p-2">
                        <h1 className="text-start text-lg border-b-2 pb-2 border-gray-400 text-gray-600 dark:text-gray-400">More writs from <span className="font-semibold text-black dark:text-white">{author?.username}'s</span> Archive</h1>
                        <div className="flex flex-wrap justify-center gap-5 my-3">
                            {
                                morePosts.map(userPost => {
                                    if (userPost.id == post.id) {
                                        return null;
                                    }
                                    return <Card key={userPost.id} post={userPost} />
                                })
                            }
                        </div>
                    </div>
                }
            </main>
            <AuthModal showModal={showModal} onClose={closeModal} />
        </>
    )
}

export const getLikes = async (id) => {
    const response = await fetch(`/jd/post/likesOfPost/${id}`);
    const resData = await response.json();
    return resData;
}

export const likePost = async (params) => {
    const { postId, userId } = params
    const response = await fetch("/jd/post/like-post/" + postId, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
    });
    const resData = await response.json();
    return resData;
}

export const savePost = async (params) => {
    const { postId, userId } = params;
    const response = await fetch(`/jd/post/save-post/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
    });
    const resData = await response.json();
    return resData;
}

export const getSavedPost = async (params) => {
    if (params.postId) {
        const { postId, userId } = params;
        if (!userId) {
            return false
        }
        const response = await fetch(`/jd/user/getUserSavedPost/${userId}?postId=${postId}`);
        const resData = await response.json();
        if (resData.count == 0) {
            return false
        } else {
            return true
        }
    } else {
        const response = await fetch(`/jd/user/getUserSavedPost/${params}`);
        const resData = await response.json();
        return resData
    }
}