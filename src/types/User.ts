import Role from "./Roles";

export default interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}
