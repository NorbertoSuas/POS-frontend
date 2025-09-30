import { Employee } from "./employee";
import { Role } from "./Role";

export interface UserDto{
    id: string;
    username: string;
    password?: string; // Optional for update scenarios
    role: Partial<Role>; // Partial to allow for updates without requiring all fields
    employee: Partial<Employee>; // Optional for update scenarios
    status: number;
}