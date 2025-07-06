// Dashboard service for handling API calls

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Types matching OpenAPI spec
export interface DashboardStats {
  totalAudits: number;
  completionRate: number;
  criticalIssues: number;
  activeAuditors: number;
  totalAuditsChange?: string;
  completionRateChange?: string;
  criticalIssuesChange?: string;
  activeAuditorsChange?: string;
}

export interface RecentAuditDto {
  id?: string;
  store?: string;
  auditor?: string;
  status?: string;
  score?: number;
  date?: string;
}

export interface UpcomingAssignmentDto {
  id?: string;
  template?: string;
  auditor?: string;
  store?: string;
  dueDate?: string;
  priority?: string;
}

export interface RegionalDataDto {
  region?: string;
  completed: number;
  total: number;
  completionPercentage?: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentAudits?: RecentAuditDto[];
  upcomingAssignments?: UpcomingAssignmentDto[];
  regionalData?: RegionalDataDto[];
  generatedAt: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

class DashboardService {
  
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
   * Get dashboard data for the current user
   */
  async getDashboard(token: string, onTokenExpired?: () => void): Promise<DashboardResponse> {
    try {
      const response = await this.makeRequest<DashboardResponse>(
        '/Dashboard',
        { token, onTokenExpired }
      );
      
      if (!response) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }



  /**
   * Clear dashboard cache
   */
  async clearDashboardCache(token: string, onTokenExpired?: () => void): Promise<void> {
    try {
      await this.makeRequest<void>(
        '/Dashboard/cache/clear',
        { method: 'DELETE', token, onTokenExpired }
      );
    } catch (error) {
      console.error('Error clearing dashboard cache:', error);
      throw error;
    }
  }



  /**
   * Check dashboard cache health
   */
  async checkDashboardCacheHealth(token: string, onTokenExpired?: () => void): Promise<boolean> {
    try {
      await this.makeRequest<void>(
        '/Dashboard/cache/health',
        { token, onTokenExpired }
      );
      return true;
    } catch (error) {
      console.error('Dashboard cache health check failed:', error);
      return false;
    }
  }
}

export const dashboardService = new DashboardService(); 