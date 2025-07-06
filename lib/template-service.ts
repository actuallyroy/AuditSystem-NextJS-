// Template service for handling API calls

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Types
export interface Template {
  templateId: string;
  name: string;
  description: string;
  category: string;
  questions: string; // JSON string
  scoringRules: string; // JSON string
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: string;
  questions: string; // JSON string
  scoringRules: string; // JSON string
  validFrom: string;
  validTo: string;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {
  templateId: string;
}

export interface TemplateQuestion {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[]; // For multiple choice questions
  minValue?: number; // For number questions with range
  maxValue?: number; // For number questions with range
}

export interface TemplateSection {
  title: string;
  questions: TemplateQuestion[];
}

export interface TemplateQuestions {
  sections: TemplateSection[];
}

export interface ScoringRules {
  maxScore: number;
  passThreshold: number;
  questionScores: Record<string, number>; // Maps question ID to score value
}

// API error response type
export interface ApiError {
  message: string;
}

class TemplateService {
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

    // Handle empty responses for DELETE operations
    if (response.status === 204 || method === 'DELETE') {
      return null as T;
    }

    try {
      return await response.json();
    } catch {
      return null as T;
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(token: string, onTokenExpired?: () => void): Promise<Template[]> {
    try {
      return await this.makeRequest<Template[]>('/Templates', { token, onTokenExpired });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching templates');
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplateById(templateId: string, token: string, onTokenExpired?: () => void): Promise<Template> {
    try {
      return await this.makeRequest<Template>(`/Templates/${templateId}`, { token, onTokenExpired });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching the template');
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: CreateTemplateRequest, token: string): Promise<Template> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the template');
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateData: UpdateTemplateRequest, token: string): Promise<Template> {
    try {
      const response = await fetch(`${API_BASE_URL}/Templates/${templateData.templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update template');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating the template');
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string, token: string, onTokenExpired?: () => void): Promise<void> {
    try {
      await this.makeRequest<void>(`/Templates/${templateId}`, { 
        method: 'DELETE', 
        token, 
        onTokenExpired 
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting the template');
    }
  }
}

export const templateService = new TemplateService(); 