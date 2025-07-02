// Organization service for handling API calls

const API_BASE_URL = 'http://localhost:5049/api/v1';

// Types
export interface Organization {
  organisationId: string;
  name: string;
  region: string;
  type: string;
  createdAt: string;
}

export interface UpdateOrganizationRequest {
  organisationId: string;
  name: string;
  region: string;
  type: string;
}

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
  updatedAt: string;
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
  async getOrganization(organizationId: string, token: string): Promise<Organization> {
    try {
      const response = await fetch(`${API_BASE_URL}/Organisations/${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get organization details');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching organization details');
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
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string, token: string): Promise<OrganizationMember[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Organisations/${organizationId}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get organization members');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching organization members');
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
   * Get assignments for organization
   */
  async getOrganizationAssignments(organizationId: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments?organisationId=${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get assignments');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching assignments');
    }
  }

  /**
   * Get audits for organization
   */
  async getOrganizationAudits(organizationId: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Audits?organisationId=${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get audits');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching audits');
    }
  }
}

// Export a singleton instance
export const organizationService = new OrganizationService(); 