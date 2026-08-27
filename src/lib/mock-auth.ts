export const MOCK_AUTH_KEY = "fiki-transit-admin-session";

export type MockUser = {
  name: string;
  email: string;
  initials: string;
  role: string;
};

export const defaultMockUser: MockUser = {
  name: "Admin",
  email: "admin@fikitransit.com",
  initials: "AD",
  role: "Fleet Manager",
};

export function saveMockSession(email?: string) {
  const name = email?.split("@")[0]?.replace(/[._-]/g, " ") || "Admin";
  const user = {
    ...defaultMockUser,
    email: email || defaultMockUser.email,
    name:
      name === "admin"
        ? defaultMockUser.name
        : name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
  };
  window.localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(user));
}

export function getMockSession(): MockUser | null {
  const value = window.localStorage.getItem(MOCK_AUTH_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as MockUser;
  } catch {
    return null;
  }
}

export function clearMockSession() {
  window.localStorage.removeItem(MOCK_AUTH_KEY);
}
