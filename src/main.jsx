import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { fetchPosts } from "./api";

import "./index.css";

const LIMIT = 20;

export default function App() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const loadMore = async () => {
    setStatus("loading");
    try {
      const newPosts = await fetchPosts(page, LIMIT);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
      setStatus("success");
    } catch (error) {
      setError(error);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div>
      <p>Infinity Scroll Example</p>

      <br />
      <br />

      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          className="List"
          style={{
            height: `800px`,
            width: `100%`,
            overflow: "auto",
          }}
        >
          {posts &&
            posts.map((post, index) => {
              return (
                <div
                  style={{
                    height: "50px",
                  }}
                  className={index % 2 ? "ListItemOdd" : "ListItemEven"}
                >
                  {post.title}
                </div>
              );
            })}
        </div>
      )}
      <br />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
