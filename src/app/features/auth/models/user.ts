import { Employee } from "../../user/models/employee";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  employee: Employee
}