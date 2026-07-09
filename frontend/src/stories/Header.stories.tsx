import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Header } from "@/components/layout/Header/Header";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/AuthContext";
import type { User } from "@/types";

const mockUser: User = {
  userId: 1,
  email: "john.doe@acd.edu.ph",
  fullName: "John Doe",
  role: "STUDENT",
  profilePictureUrl: null,
  department: null,
};

const mockAuth: AuthContextValue = {
  user: mockUser,
  setUser: () => undefined,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoading: false,
  setIsLoading: () => undefined,
  authError: null,
  setAuthError: () => undefined,
};

const meta: Meta<typeof Header> = {
  component: Header,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const Admin: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/super-admin/users"]}>
        <AuthContext.Provider
          value={{
            ...mockAuth,
            user: { ...mockUser, role: "SUPER_ADMIN" },
          }}
        >
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};
