import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Blog API endpoints
export const blogService = {
  createBlog: async (blogData) => {
    try {
      const response = await api.post("/blogs", blogData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create blog");
    }
  },

  getAllBlogs: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/blogs", {
        params: { page, limit },
      });
      return {
        blogs: response.data.blogs,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch blogs");
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const response = await api.get(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Blog not found");
    }
  },

  updateBlog: async (slug, updateData) => {
    try {
      const response = await api.put(`/blogs/${slug}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update blog");
    }
  },

  deleteBlog: async (slug) => {
    try {
      const response = await api.delete(`/blogs/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete blog");
    }
  },

  toggleBlogVisibility: async (slug) => {
    try {
      const response = await api.patch(`/blogs/${slug}/toggle-visibility`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to toggle visibility"
      );
    }
  },
};
