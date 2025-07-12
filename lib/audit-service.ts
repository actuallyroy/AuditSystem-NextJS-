// Audit service for handling API calls
// Based on OpenAPI specification

const API_BASE_URL = 'https://test.scorptech.co/api/v1';

// Types matching OpenAPI spec
export interface AuditSummaryDto {
  auditId: string;
  templateId: string;
  templateName?: string;
  auditorName?: string;
  organisationName?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  score?: number;
  criticalIssues: number;
  isFlagged: boolean;
  createdAt: string;
}

export interface AuditResponseDto {
  auditId: string;
  templateId: string;
  templateVersion?: number;
  auditorId: string;
  organisationId: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  storeInfo?: object; // JSON object
  responses?: object; // JSON object
  media?: object; // JSON object
  location?: object; // JSON object
  score?: number;
  criticalIssues: number;
  managerNotes?: string;
  isFlagged: boolean;
  syncFlag: boolean;
  createdAt: string;
  templateName?: string;
  auditorName?: string;
  organisationName?: string;
}

export interface CreateAuditDto {
  templateId: string;
  assignmentId?: string;
  storeName?: string;
  storeLocation?: string;
  storeInfo?: object; // JSON object
  location?: object; // JSON object
  responses?: object; // JSON object
  media?: object; // JSON object
  status?: string;
  score?: number;
  criticalIssues?: number;
}

export interface SubmitAuditDto {
  auditId: string;
  responses: object; // JSON object
  media?: object; // JSON object
  storeInfo?: object; // JSON object
  location?: object; // JSON object
}

export interface UpdateAuditStatusDto {
  status: string;
  managerNotes?: string;
  isFlagged?: boolean;
}

export interface AuditStats {
  total: number;
  completed: number;
  inProgress: number;
  flagged: number;
  averageScore: number;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

export interface StoreInfo {
  storeName: string;
  storeAddress: string;
  [key: string]: any;
}

class AuditService {
  
  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      token: string;
      onTokenExpired?: () => void;
    }
  ): Promise<T> {
    const { method = 'GET', body, token, onTokenExpired } = options;
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
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

    try {
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status} for ${url}`);

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && onTokenExpired) {
          console.log('Token expired, calling onTokenExpired');
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
        console.error(`API Error for ${url}:`, errorMessage);
        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (response.status === 204) {
        console.log(`Empty response (204) for ${url}`);
        return null as T;
      }

      try {
        const data = await response.json();
        console.log(`Successfully parsed response for ${url}:`, data);
        return data;
      } catch (parseError) {
        console.error(`Failed to parse JSON response for ${url}:`, parseError);
        return null as T;
      }
    } catch (fetchError) {
      console.error(`Fetch error for ${url}:`, fetchError);
      throw fetchError;
    }
  }

  /**
   * Get all audits
   */
  async getAudits(token: string, onTokenExpired?: () => void): Promise<AuditSummaryDto[]> {
    try {
      const audits = await this.makeRequest<AuditSummaryDto[]>('/Audits', { token, onTokenExpired });
      return audits || [];
    } catch (error) {
      console.error('Error fetching audits:', error);
      throw error;
    }
  }

  /**
   * Get audit by ID
   */
  async getAuditById(auditId: string, token: string, onTokenExpired?: () => void): Promise<AuditResponseDto> {
    try {
      const audit = await this.makeRequest<AuditResponseDto>(`/Audits/${auditId}`, { token, onTokenExpired });
      return audit;
    } catch (error) {
      console.error('Error fetching audit:', error);
      throw error;
    }
  }

  /**
   * Get audits by auditor
   */
  async getAuditsByAuditor(auditorId: string, token: string, onTokenExpired?: () => void): Promise<AuditSummaryDto[]> {
    try {
      const audits = await this.makeRequest<AuditSummaryDto[]>(`/Audits/by-auditor/${auditorId}`, { token, onTokenExpired });
      return audits || [];
    } catch (error) {
      console.error('Error fetching auditor audits:', error);
      throw error;
    }
  }

  /**
   * Get audits by organization
   */
  async getAuditsByOrganisation(organisationId: string, token: string, onTokenExpired?: () => void): Promise<AuditSummaryDto[]> {
    try {
      const audits = await this.makeRequest<AuditSummaryDto[]>(`/Audits/by-organisation/${organisationId}`, { token, onTokenExpired });
      return audits || [];
    } catch (error) {
      console.error('Error fetching organisation audits:', error);
      throw error;
    }
  }

  /**
   * Get audits by template
   */
  async getAuditsByTemplate(templateId: string, token: string, onTokenExpired?: () => void): Promise<AuditSummaryDto[]> {
    try {
      const audits = await this.makeRequest<AuditSummaryDto[]>(`/Audits/by-template/${templateId}`, { token, onTokenExpired });
      return audits || [];
    } catch (error) {
      console.error('Error fetching template audits:', error);
      throw error;
    }
  }

  /**
   * Create new audit
   */
  async createAudit(auditData: CreateAuditDto, token: string, onTokenExpired?: () => void): Promise<AuditResponseDto> {
    try {
      const audit = await this.makeRequest<AuditResponseDto>('/Audits', {
        method: 'POST',
        body: auditData,
        token,
        onTokenExpired
      });
      return audit;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  /**
   * Submit audit
   */
  async submitAudit(auditId: string, submitData: SubmitAuditDto, token: string, onTokenExpired?: () => void): Promise<AuditResponseDto> {
    try {
      const audit = await this.makeRequest<AuditResponseDto>(`/Audits/${auditId}/submit`, {
        method: 'PUT',
        body: submitData,
        token,
        onTokenExpired
      });
      return audit;
    } catch (error) {
      console.error('Error submitting audit:', error);
      throw error;
    }
  }

  /**
   * Update audit status
   */
  async updateAuditStatus(auditId: string, statusData: UpdateAuditStatusDto, token: string, onTokenExpired?: () => void): Promise<AuditResponseDto> {
    try {
      const audit = await this.makeRequest<AuditResponseDto>(`/Audits/${auditId}/status`, {
        method: 'PATCH',
        body: statusData,
        token,
        onTokenExpired
      });
      return audit;
    } catch (error) {
      console.error('Error updating audit status:', error);
      throw error;
    }
  }

  /**
   * Flag/unflag audit
   */
  async flagAudit(auditId: string, isFlagged: boolean, token: string, onTokenExpired?: () => void): Promise<AuditResponseDto> {
    try {
      const audit = await this.makeRequest<AuditResponseDto>(`/Audits/${auditId}/flag`, {
        method: 'PATCH',
        body: isFlagged,
        token,
        onTokenExpired
      });
      return audit;
    } catch (error) {
      console.error('Error flagging audit:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(token: string, organisationId?: string, onTokenExpired?: () => void): Promise<AuditStats> {
    try {
      let audits: AuditSummaryDto[];
      
      if (organisationId) {
        audits = await this.getAuditsByOrganisation(organisationId, token, onTokenExpired);
      } else {
        audits = await this.getAudits(token, onTokenExpired);
      }

      const total = audits.length;
      const completed = audits.filter(audit => audit.status === 'Completed').length;
      const inProgress = audits.filter(audit => audit.status === 'In Progress').length;
      const flagged = audits.filter(audit => audit.isFlagged).length;
      
      const scores = audits
        .filter(audit => audit.score !== null && audit.score !== undefined)
        .map(audit => audit.score!);
      
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

      return {
        total,
        completed,
        inProgress,
        flagged,
        averageScore
      };
    } catch (error) {
      console.error('Error calculating audit stats:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        flagged: 0,
        averageScore: 0
      };
    }
  }

  /**
   * Parse store info from API response
   */
  parseStoreInfo(storeInfo: any): StoreInfo {
    if (!storeInfo) {
      return { storeName: '', storeAddress: '' };
    }

    if (typeof storeInfo === 'string') {
      try {
        storeInfo = JSON.parse(storeInfo);
      } catch {
        return { storeName: '', storeAddress: '' };
      }
    }

    return {
      storeName: storeInfo.storeName || storeInfo.name || '',
      storeAddress: storeInfo.storeAddress || storeInfo.address || storeInfo.location || '',
      ...storeInfo
    };
  }

  /**
   * Format store info for API
   */
  formatStoreInfo(storeInfo: StoreInfo): object {
    return {
      ...storeInfo
    };
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  /**
   * Format time for display
   */
  formatTime(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in progress':
      case 'in_progress':
        return 'secondary';
      case 'flagged':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  }

  /**
   * Get score color for UI
   */
  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }
}

export const auditService = new AuditService(); 