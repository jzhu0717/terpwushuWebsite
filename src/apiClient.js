const BASE_URL = "/api";

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: options.body ? { "Content-Type": "application/json" } : undefined,
        ...options,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    if (!res.ok) {
        const message = (data && data.error) || `Request failed (${res.status})`;
        throw new Error(message);
    }
    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
};
