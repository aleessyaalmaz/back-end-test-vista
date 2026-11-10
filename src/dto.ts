export interface CreateCompanyRequest { name: string; registrationNumber: string; }
export interface CreateServiceRequest { companyId: number; name: string; description: string; price: number; }
export interface ServiceResponse { id: number; companyId: number; name: string; description: string; price: number; }
export interface CompanyResponse { id: number; name: string; registrationNumber: string; services: ServiceResponse[]; }