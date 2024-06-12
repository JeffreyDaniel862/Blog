import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
export default function Comment({ postId }) {
    const { user } = useSelector(state => state.user);
    const [comment, setComment] = useState("");
    const { mutate, data } = useMutation({
        mutationFn: postComment
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        mutate({ userId: user.id, postId, content: comment });
    }

    useEffect(() => {
        if (data && data.statusCode == 200) {
            setComment("")
        }
    }, [data]);

    return user ?
        <>
            <div className='flex gap-2 items-center text-sm text-gray-400'>
                <p> Signed in as :</p>
                <img className='h-7 w-7 rounded-full' src={user.displayPicture} alt="display picture" />
                <Link className='text-sky-600 dark:text-sky-400' to={'/dashboard?tab=profile'}>@{user.username}</Link>
            </div>
            <form onSubmit={handleSubmit} className='mt-5 border border-sky-300 dark:border-sky-700 p-3 rounded-md'>
                <Textarea
                    placeholder='Add comments about this post ...'
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    maxLength={200}
                />
                <div className='mt-4 flex justify-between items-center'>
                    <p className='text-gray-400'>{200 - comment.length} characters remaining.</p>
                    <Button type='submit' outline pill className='bg-gradient-to-r from-blue-600 via-sky-500 to-teal-300'>Submit</Button>
                </div>
                {
                   data && data?.statusCode != 200 && <Alert className='mt-5' color={'failure'}>{data?.message || 'Unable to post comment'}</Alert>
                }
            </form>
        </>
        :
        <div className='flex gap-2 text-sky-500'>
            <p>Please login to comment --&gt;</p>
            <Link className='hover:underline' to={'/sign-in'}>Sign-in</Link>
        </div>
}

export const postComment = async (comment) => {
    try {
        const response = await fetch('/jd/comment/create', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(comment)
        });
        const resData = await response.json();
        return resData;
    } catch (error) {
        return error;
    }
}