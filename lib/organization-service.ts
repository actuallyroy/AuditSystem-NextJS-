// Organization service for handling API calls

const API_BASE_URL = 'https://test.scorptech.co/api/v1';

// Types
export interface Organization {
  organisationId: string;
  name: string;
  region: string;
  type: string;
  createdAt: string;
}

export interface OrganizationUser {
  userId: string;
  organisationId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  createdTemplates?: any[];
  assignedByAssignments?: any[];
  assignedToAssignments?: any[];
  audits?: any[];
  reports?: any[];
  logs?: any[];
}

export interface OrganizationAssignment {
  assignmentId: string;
  templateId: string;
  assignedToId: string;
  assignedById: string;
  organisationId: string;
  storeInfo: string;
  dueDate: string;
  priority: string;
  notes: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  template?: {
    templateId: string;
    name: string;
    description: string;
    category: string;
    questions: string;
    scoringRules: string;
    validFrom: string;
    validTo: string;
    createdById: string;
    isPublished: boolean;
    version: number;
    createdAt: string;
    createdBy?: string;
    assignments?: string[];
    audits?: string[];
  };
  assignedTo?: string | OrganizationUser;
  assignedBy?: string | OrganizationUser;
  organisation?: string;
}

export interface OrganizationWithData {
  // Organization basic info
  organisationId: string;
  name: string;
  region: string;
  type: string;
  createdAt: string;
  
  // Users/Members array - the main users array from the API
  users?: OrganizationUser[];
  
  // Assignments collected from all users
  assignments?: OrganizationAssignment[];
  
  // Additional data
  audits?: any[];
  reports?: any[];
  logs?: any[];
}

// Legacy interface for backward compatibility
export interface OrganizationMember {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateOrganizationRequest {
  organisationId: string;
  name: string;
  region: string;
  type: string;
}

export interface UpdateUserStatusRequest {
  userId: string;
  isActive: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class OrganizationService {
  /**
   * Get organization details
   */
  async getOrganization(organizationId: string, token: string, onTokenExpired?: () => void): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/Organisations/${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && onTokenExpired) {
          onTokenExpired();
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get organization details');
      }

      const data = await response.json();
      
      // Extract basic organization info
      return {
        organisationId: data.organisationId || organizationId,
        name: data.name || 'Unknown Organization',
        region: data.region || '',
        type: data.type || 'retail_chain',
        createdAt: data.createdAt || new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching organization details');
    }
  }

  /**
   * Get complete organization data including members and assignments
   */
  async getOrganizationWithData(organizationId: string, token: string, onTokenExpired?: () => void): Promise<OrganizationWithData> {
    try {
      const response = await fetch(`${API_BASE_URL}/Organisations/${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && onTokenExpired) {
          onTokenExpired();
          throw new Error('Session expired. Please login again.');
        }
        
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get organization data');
      }

      const data = await response.json();
      
      // The API returns the structure as:
      // - Basic organization info at root level
      // - users array with all organization members
      // - assignments array with all assignments (top-level)
      // - audits array with all audits (top-level)
      
      const users = Array.isArray(data.users) ? data.users : [];
      const assignments = Array.isArray(data.assignments) ? data.assignments : [];
      const audits = Array.isArray(data.audits) ? data.audits : [];
      
      // Return the complete organization data
      return {
        organisationId: data.organisationId || organizationId,
        name: data.name || 'Unknown Organization',
        region: data.region || '',
        type: data.type || 'retail_chain',
        createdAt: data.createdAt || new Date().toISOString(),
        users: users,
        assignments: assignments,
        audits: audits,
        reports: data.reports || [],
        logs: data.logs || []
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching organization data');
    }
  }

  /**
   * Get organization members (backward compatibility)
   */
  async getOrganizationMembers(organizationId: string, token: string, onTokenExpired?: () => void): Promise<OrganizationMember[]> {
    try {
      const orgData = await this.getOrganizationWithData(organizationId, token, onTokenExpired);
      
      // Convert OrganizationUser to OrganizationMember for backward compatibility
      return (orgData.users || []).map(user => ({
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.createdAt // Use createdAt as updatedAt fallback
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching organization members');
    }
  }

  /**
   * Update organization details
   */
  async updateOrganization(organizationData: UpdateOrganizationRequest, token: string): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/Organisations/${organizationData.organisationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update organization');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating the organization');
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: string, isActive: boolean, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating user status');
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to remove user');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while removing the user');
    }
  }

  /**
   * Get assignments for organization (backward compatibility)
   */
  async getOrganizationAssignments(organizationId: string, token: string): Promise<any[]> {
    try {
      const orgData = await this.getOrganizationWithData(organizationId, token);
      return orgData.assignments || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching assignments');
    }
  }

  /**
   * Get audits for organization (backward compatibility)
   */
  async getOrganizationAudits(organizationId: string, token: string): Promise<any[]> {
    try {
      const orgData = await this.getOrganizationWithData(organizationId, token);
      return orgData.audits || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching audits');
    }
  }
}

export const organizationService = new OrganizationService(); 