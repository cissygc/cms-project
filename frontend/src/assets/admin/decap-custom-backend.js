/**
 * Decap CMS Custom REST Backend for Spring Boot Integration
 * Maps Decap CMS operations directly to your REST API structure (/api/posts, /api/media).
 */
class SpringBootRestBackend {
  constructor(config) {
    this.config = config;
    this.apiBaseUrl = window.API_BASE_URL || 'https://provoking-dork-purchase.ngrok-free.dev';
  }

  getAuthToken() {
    const userStr = localStorage.getItem('revlo-cms-user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.token || null;
    } catch (e) {
      return null;
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  isLoggedIn() {
    return !!this.getAuthToken();
  }

  async entriesByFolder(collection, extension) {
    try {
      const res = await fetch(`${this.apiBaseUrl}/api/posts`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch posts from REST API');
      const posts = await res.json();
      
      const entries = posts.map(post => ({
        data: {
          title: post.title,
          slug: post.slug,
          image: post.image || '',
          body: post.content || ''
        },
        slug: post.slug,
        path: `posts/${post.slug}.json`,
        raw: JSON.stringify(post)
      }));

      return { entries, pagination: { page: 1 } };
    } catch (err) {
      console.warn('Falling back to local entries for Decap CMS:', err);
      return { entries: [], pagination: { page: 1 } };
    }
  }

  async getEntry(collection, slug, path) {
    try {
      const res = await fetch(`${this.apiBaseUrl}/api/posts/${slug}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Entry not found');
      const post = await res.json();

      return {
        data: {
          title: post.title,
          slug: post.slug,
          image: post.image || '',
          body: post.content || ''
        },
        slug: post.slug,
        path: `posts/${post.slug}.json`,
        raw: JSON.stringify(post)
      };
    } catch (err) {
      console.error('Error fetching entry:', err);
      throw err;
    }
  }

  async persistEntry(entry, options) {
    const data = entry.data;
    const payload = {
      title: data.title,
      slug: data.slug,
      content: data.body,
      image: data.image
    };

    const res = await fetch(`${this.apiBaseUrl}/api/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to persist entry via REST API');
    return entry;
  }

  async deleteEntry(collection, slug, path) {
    const res = await fetch(`${this.apiBaseUrl}/api/posts/${slug}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete entry');
  }

  authComponent() {
    return null;
  }

  async authenticate() {
    return { token: this.getAuthToken() };
  }

  async logout() {
    localStorage.removeItem('revlo-cms-user');
  }
}

// Register Custom Backend in Decap CMS instance if window.CMS exists
if (typeof window !== 'undefined' && window.CMS) {
  window.CMS.registerBackend('spring-rest', SpringBootRestBackend);
}
