// pages/index.js
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify, API, Auth, withSSRContext } from 'aws-amplify';
import Head from 'next/head';
import awsExports from '../../aws-exports';
import { createPost } from '../../graphql/mutations';
import { listPosts } from '../../graphql/queries';

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }: any) {
  const SSR = withSSRContext({ req });
  
  try {
    const response = await SSR.API.graphql({ query: listPosts, authMode: 'API_KEY' });

    return {

      props: {
        posts: response.data.listPosts.items,
      },
    };
  } catch (err) {
    console.log(err);

    return {
      props: {},
    };
  }
}

async function handleCreatePost(event: any) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data }: any = await API.graphql({
      authMode: 'AMAZON_COGNITO_USER_POOLS',
      query: createPost,
      variables: {
        input: {
          title: form.get('title'),
          content: form.get('content')
        }
      }
    });

    window.location.href = `/posts/${data.createPost.id}`;
  } catch ({ errors }: any) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [] }: any) {
  return (
    <div >
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main >
        <h1 >Amplify + Next.js</h1>

        <p >
          <code >{posts.length}</code>
          posts
        </p>

        <div >
          {posts.map((post: any) => (
            <a  href={`/posts/${post.id}`} key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </a>
          ))}

          <div>
            <h3 >New Post</h3>

            <Authenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend>Title</legend>
                  <input
                    defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                    name="title"
                  />
                </fieldset>

                <fieldset>
                  <legend>Content</legend>
                  <textarea
                    defaultValue="I built an Amplify project with Next.js!"
                    name="content"
                  />
                </fieldset>

                <button>Create Post</button>
                <button type="button" onClick={() => Auth.signOut()}>
                  Sign out
                </button>
              </form>
            </Authenticator>
          </div>
        </div>
      </main>
    </div>
  );
}