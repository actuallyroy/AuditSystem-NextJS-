// Assignment service for handling API calls
// Updated to use real backend endpoints

const API_BASE_URL = 'https://test.scorptech.co/api/v1';

// Types matching OpenAPI spec
export interface Assignment {
  assignmentId: string;
  templateId: string;
  assignedToId: string;
  assignedById: string;
  organisationId: string;
  storeInfo: object; // JSON object instead of string
  dueDate: string;
  priority: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  // Additional fields populated from joins
  templateName?: string;
  assignedToName?: string;
  assignedByName?: string;
  // Nested objects from API response
  template?: {
    templateId: string;
    name: string;
    category: string;
  };
  assignedTo?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedBy?: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAssignmentRequest {
  templateId: string;
  assignedToId: string;
  organisationId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  storeInfo: object; // JSON object
}

export interface UpdateAssignmentRequest {
  assignmentId: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'fulfilled';
  storeInfo?: object; // JSON object
}

export interface StoreInfo {
  storeName: string;
  storeAddress: string;
  [key: string]: any;
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

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organisationId: string;
}

export interface Template {
  templateId: string;
  name: string;
  description: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

class AssignmentService {
  
  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      token: string;
      onTokenExpired?: () => void;
    }
  ): Promise<T> {
    const { method = 'GET', body, token, onTokenExpired } = options;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && onTokenExpired) {
        onTokenExpired();
        throw new Error('Session expired. Please login again.');
      }
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204) {
      return null as T;
    }

    try {
      return await response.json();
    } catch {
      return null as T;
    }
  }

  /**
   * Get users from organization
   */
  private async getUsers(token: string, organisationId: string): Promise<User[]> {
    try {
      const response = await this.makeRequest<User[]>(
        `/Users/by-organisation/${organisationId}`,
        { token }
      );
      return response || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get templates
   */
  private async getTemplates(token: string): Promise<Template[]> {
    try {
      const response = await this.makeRequest<Template[]>('/Templates', { token });
      return response || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  /**
   * Get all assignments
   */
  async getAssignments(token: string, organisationId?: string, onTokenExpired?: () => void): Promise<Assignment[]> {
    try {
      let endpoint = '/Assignments';
      if (organisationId) {
        endpoint = `/Assignments/organisation/${organisationId}`;
      }
      
      const assignments = await this.makeRequest<Assignment[]>(endpoint, { token, onTokenExpired });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw new Error(`Failed to load assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string, token: string): Promise<Assignment> {
    try {
      const assignment = await this.makeRequest<Assignment>(
        `/Assignments/${assignmentId}`,
        { token }
      );
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      return assignment;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw new Error(`Failed to load assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assignments assigned to current user
   */
  async getMyAssignments(token: string, onTokenExpired?: () => void): Promise<Assignment[]> {
    try {
      const assignments = await this.makeRequest<Assignment[]>('/Assignments/my', { token, onTokenExpired });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      // Fallback to get all assignments and filter by user
      try {
        const allAssignments = await this.getAssignments(token, undefined, onTokenExpired);
        // Note: This requires the JWT token to contain user ID info
        return allAssignments; // Backend should handle filtering by user
      } catch {
        throw new Error(`Failed to load your assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get upcoming assignments (due within next 7 days)
   */
  async getUpcomingAssignments(token: string): Promise<Assignment[]> {
    try {
      const assignments = await this.makeRequest<Assignment[]>('/Assignments/upcoming', { token });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      // Fallback to filter from all assignments
      try {
        const allAssignments = await this.getAssignments(token);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return allAssignments.filter(assignment => {
          const dueDate = new Date(assignment.dueDate);
          return dueDate >= now && dueDate <= weekFromNow;
        });
      } catch {
        throw new Error(`Failed to load upcoming assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get overdue assignments
   */
  async getOverdueAssignments(token: string): Promise<Assignment[]> {
    try {
      const assignments = await this.makeRequest<Assignment[]>('/Assignments/overdue', { token });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching overdue assignments:', error);
      throw new Error(`Failed to load overdue assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assignments by status
   */
  async getAssignmentsByStatus(status: string, token: string): Promise<Assignment[]> {
    try {
      const assignments = await this.makeRequest<Assignment[]>(`/Assignments/status/${status}`, { token });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching assignments by status:', error);
      throw new Error(`Failed to load ${status} assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assignments by priority
   */
  async getAssignmentsByPriority(priority: string, token: string): Promise<Assignment[]> {
    try {
      const assignments = await this.makeRequest<Assignment[]>(`/Assignments/priority/${priority}`, { token });
      return assignments || [];
    } catch (error) {
      console.error('Error fetching assignments by priority:', error);
      // Fallback to filter from all assignments
      try {
        const allAssignments = await this.getAssignments(token);
        return allAssignments.filter(assignment => assignment.priority === priority);
      } catch {
        throw new Error(`Failed to load ${priority} priority assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(assignmentData: CreateAssignmentRequest, token: string): Promise<Assignment> {
    try {
      const assignment = await this.makeRequest<Assignment>('/Assignments', {
        method: 'POST',
        body: assignmentData,
        token
      });
      
      if (!assignment) {
        throw new Error('Failed to create assignment');
      }
      
      return assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error(`Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update assignment
   */
  async updateAssignment(assignmentData: UpdateAssignmentRequest, token: string): Promise<Assignment> {
    try {
      const { assignmentId, ...updateData } = assignmentData;
      
      const assignment = await this.makeRequest<Assignment>(`/Assignments/${assignmentId}`, {
        method: 'PUT',
        body: updateData,
        token
      });
      
      if (!assignment) {
        throw new Error('Failed to update assignment');
      }
      
      return assignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw new Error(`Failed to update assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete assignment
   */
  async completeAssignment(assignmentId: string, token: string): Promise<void> {
    try {
      await this.makeRequest<void>(`/Assignments/${assignmentId}/complete`, {
        method: 'PUT',
        token
      });
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw new Error(`Failed to complete assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(assignmentId: string, token: string): Promise<void> {
    try {
      await this.makeRequest<void>(`/Assignments/${assignmentId}`, {
        method: 'DELETE',
        token
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw new Error(`Failed to delete assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assignment statistics
   * Calculates stats from fetched assignments since there's no dedicated stats endpoint
   */
  async getAssignmentStats(token: string, organisationId?: string, onTokenExpired?: () => void): Promise<AssignmentStats> {
    try {
      // Fetch all assignments for the organization and calculate stats client-side
      const assignments = await this.getAssignments(token, organisationId, onTokenExpired);
      const now = new Date();
      
      const stats: AssignmentStats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === 'pending').length,
        inProgress: assignments.filter(a => a.status === 'in_progress').length,
        completed: assignments.filter(a => a.status === 'completed' || a.status === 'fulfilled').length,
        overdue: assignments.filter(a => a.status === 'pending' && new Date(a.dueDate) < now).length,
        cancelled: assignments.filter(a => a.status === 'cancelled').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating assignment stats:', error);
      throw new Error(`Failed to load assignment statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse store info from various formats
   */
  parseStoreInfo(storeInfo: any): StoreInfo {
    if (!storeInfo) {
      return {
        storeName: 'Unknown Store',
        storeAddress: 'Unknown Address'
      };
    }

    // If it's already an object, return as is
    if (typeof storeInfo === 'object' && storeInfo !== null) {
      const result = { ...storeInfo };
      if (!result.storeName) result.storeName = 'Unknown Store';
      if (!result.storeAddress) result.storeAddress = 'Unknown Address';
      return result;
    }

    // If it's a string, try to parse as JSON
    if (typeof storeInfo === 'string') {
      try {
        const parsed = JSON.parse(storeInfo);
        const result = { ...parsed };
        if (!result.storeName) result.storeName = 'Unknown Store';
        if (!result.storeAddress) result.storeAddress = 'Unknown Address';
        return result;
      } catch {
        return {
          storeName: storeInfo,
          storeAddress: 'Unknown Address'
        };
      }
    }

    return {
      storeName: 'Unknown Store',
      storeAddress: 'Unknown Address'
    };
  }

  /**
   * Format store info for API submission
   */
  formatStoreInfo(storeInfo: StoreInfo): object {
    return {
      ...storeInfo
    };
  }
}

export const assignmentService = new AssignmentService(); 