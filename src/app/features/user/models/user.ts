export interface User{
    id: string;
    username: string;
    password?: string; 
    roleId: string;
    employeeId: string; 
    status: number;
}