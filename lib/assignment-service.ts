// Assignment service for handling API calls

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Types
export interface Assignment {
  assignmentId: string;
  templateId: string;
  templateName?: string; // Populated from joins
  assignedToId: string;
  assignedToName?: string; // Populated from joins
  assignedById: string;
  assignedByName?: string; // Populated from joins
  organisationId: string;
  storeInfo: string; // JSON string
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'fulfilled';
  createdAt: string;
}

export interface CreateAssignmentRequest {
  templateId: string;
  assignedToId: string;
  organisationId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  storeInfo: string; // JSON string
}

export interface UpdateAssignmentRequest {
  assignmentId: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'fulfilled';
  storeInfo?: string; // JSON string
}

export interface StoreInfo {
  storeName: string;
  storeAddress: string;
  [key: string]: any; // Allow additional properties
}

export interface AssignmentStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  cancelled: number;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

class AssignmentService {
  /**
   * Get all assignments
   */
  async getAssignments(token: string, organisationId?: string): Promise<Assignment[]> {
    try {
      const url = organisationId 
        ? `${API_BASE_URL}/Assignments?organisationId=${organisationId}`
        : `${API_BASE_URL}/Assignments`;
        
      const response = await fetch(url, {
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
   * Get a specific assignment by ID
   */
  async getAssignmentById(assignmentId: string, token: string): Promise<Assignment> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/${assignmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get assignment');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching the assignment');
    }
  }

  /**
   * Get assignments assigned to the current user
   */
  async getMyAssignments(token: string): Promise<Assignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/my-assignments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get my assignments');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching your assignments');
    }
  }

  /**
   * Get upcoming assignments
   */
  async getUpcomingAssignments(token: string): Promise<Assignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get upcoming assignments');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching upcoming assignments');
    }
  }

  /**
   * Get overdue assignments
   */
  async getOverdueAssignments(token: string): Promise<Assignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/overdue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get overdue assignments');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching overdue assignments');
    }
  }

  /**
   * Get assignments by status
   */
  async getAssignmentsByStatus(status: string, token: string): Promise<Assignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/by-status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get assignments by status');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching assignments by status');
    }
  }

  /**
   * Get assignments by priority
   */
  async getAssignmentsByPriority(priority: string, token: string): Promise<Assignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/by-priority/${priority}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to get assignments by priority');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching assignments by priority');
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(assignmentData: CreateAssignmentRequest, token: string): Promise<Assignment> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the assignment');
    }
  }

  /**
   * Update an existing assignment
   */
  async updateAssignment(assignmentData: UpdateAssignmentRequest, token: string): Promise<Assignment> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/${assignmentData.assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update assignment');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating the assignment');
    }
  }

  /**
   * Complete an assignment (for auditors)
   */
  async completeAssignment(assignmentId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/${assignmentId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to complete assignment');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while completing the assignment');
    }
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(assignmentId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/Assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to delete assignment');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting the assignment');
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(token: string, organisationId?: string): Promise<AssignmentStats> {
    try {
      const assignments = await this.getAssignments(token, organisationId);
      
      const stats: AssignmentStats = {
        total: assignments.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0,
      };

      const now = new Date();
      
      assignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate);
        
        switch (assignment.status) {
          case 'pending':
            if (dueDate < now) {
              stats.overdue++;
            } else {
              stats.pending++;
            }
            break;
          case 'in_progress':
            stats.inProgress++;
            break;
          case 'completed':
          case 'fulfilled':
            stats.completed++;
            break;
          case 'cancelled':
            stats.cancelled++;
            break;
        }
      });

      return stats;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while calculating assignment statistics');
    }
  }

  /**
   * Parse store info JSON string
   */
  parseStoreInfo(storeInfoJson: string): StoreInfo {
    try {
      return JSON.parse(storeInfoJson);
    } catch {
      return {
        storeName: 'Unknown Store',
        storeAddress: 'Unknown Address',
      };
    }
  }

  /**
   * Format store info object to JSON string
   */
  formatStoreInfo(storeInfo: StoreInfo): string {
    return JSON.stringify(storeInfo);
  }
}

// Export a singleton instance
export const assignmentService = new AssignmentService(); 