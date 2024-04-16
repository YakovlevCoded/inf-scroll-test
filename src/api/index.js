export const fetchPosts = async (page = 1, limit) => {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};