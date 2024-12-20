import DbPageWrapper from "@/components/dashboard/page-wrapper";
import PostForm from "@/components/dashboard/posts/post-form";
import React from "react";

const CreatePostPage = () => {
  return (
    <DbPageWrapper title="Create Post">
      <PostForm />
    </DbPageWrapper>
  );
};

export default CreatePostPage;
