// Settings service for handling API calls

const API_BASE_URL = 'https://test.scorptech.co/api/v1';

// Types
export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  organisationId?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  auditAssignments: boolean;
  auditCompletions: boolean;
  criticalIssues: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAnimations: boolean;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
}

export interface RegionalSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  locale: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  requirePasswordChange: boolean;
  loginNotifications: boolean;
  deviceManagement: boolean;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

class SettingsService {
  
  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
   * Get user profile
   */
  async getUserProfile(userId: string, token: string, onTokenExpired?: () => void): Promise<UserProfile> {
    try {
      const response = await this.makeRequest<UserProfile>(
        `/Users/${userId}`,
        { token, onTokenExpired }
      );
      
      if (!response) {
        throw new Error('Failed to fetch user profile');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string, 
    profileData: UpdateProfileRequest, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<UserProfile> {
    try {
      const response = await this.makeRequest<UserProfile>(
        `/Users/${userId}`,
        { 
          method: 'PUT', 
          body: profileData, 
          token, 
          onTokenExpired 
        }
      );
      
      if (!response) {
        throw new Error('Failed to update user profile');
      }
      
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string, 
    passwordData: ChangePasswordRequest, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<void> {
    try {
      await this.makeRequest<void>(
        `/Users/${userId}/change-password`,
        { 
          method: 'PATCH', 
          body: passwordData, 
          token, 
          onTokenExpired 
        }
      );
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Get notification settings (mock implementation)
   */
  async getNotificationSettings(token: string, onTokenExpired?: () => void): Promise<NotificationSettings> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      auditAssignments: true,
      auditCompletions: true,
      criticalIssues: true,
      weeklyReports: false,
      monthlyReports: true,
    };
  }

  /**
   * Update notification settings (mock implementation)
   */
  async updateNotificationSettings(
    settings: NotificationSettings, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<NotificationSettings> {
    // This would typically call a real API endpoint
    // For now, return the updated settings
    return settings;
  }

  /**
   * Get appearance settings (mock implementation)
   */
  async getAppearanceSettings(token: string, onTokenExpired?: () => void): Promise<AppearanceSettings> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      showAnimations: true,
      colorScheme: 'blue',
    };
  }

  /**
   * Update appearance settings (mock implementation)
   */
  async updateAppearanceSettings(
    settings: AppearanceSettings, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<AppearanceSettings> {
    // This would typically call a real API endpoint
    // For now, return the updated settings
    return settings;
  }

  /**
   * Get regional settings (mock implementation)
   */
  async getRegionalSettings(token: string, onTokenExpired?: () => void): Promise<RegionalSettings> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      locale: 'en-IN',
    };
  }

  /**
   * Update regional settings (mock implementation)
   */
  async updateRegionalSettings(
    settings: RegionalSettings, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<RegionalSettings> {
    // This would typically call a real API endpoint
    // For now, return the updated settings
    return settings;
  }

  /**
   * Get security settings (mock implementation)
   */
  async getSecuritySettings(token: string, onTokenExpired?: () => void): Promise<SecuritySettings> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      requirePasswordChange: false,
      loginNotifications: true,
      deviceManagement: true,
    };
  }

  /**
   * Update security settings (mock implementation)
   */
  async updateSecuritySettings(
    settings: SecuritySettings, 
    token: string, 
    onTokenExpired?: () => void
  ): Promise<SecuritySettings> {
    // This would typically call a real API endpoint
    // For now, return the updated settings
    return settings;
  }

  /**
   * Get active sessions (mock implementation)
   */
  async getActiveSessions(token: string, onTokenExpired?: () => void): Promise<any[]> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return [
      {
        id: "1",
        device: "Chrome on Windows",
        location: "Delhi, India",
        lastActive: "Active now",
        current: true,
        ipAddress: "192.168.1.100",
      },
      {
        id: "2",
        device: "Mobile App on Android",
        location: "Delhi, India",
        lastActive: "2 hours ago",
        current: false,
        ipAddress: "192.168.1.101",
      },
    ];
  }

  /**
   * Revoke session (mock implementation)
   */
  async revokeSession(sessionId: string, token: string, onTokenExpired?: () => void): Promise<void> {
    // This would typically call a real API endpoint
    console.log(`Revoking session: ${sessionId}`);
  }

  /**
   * Get security events (mock implementation)
   */
  async getSecurityEvents(token: string, onTokenExpired?: () => void): Promise<any[]> {
    // This would typically call a real API endpoint
    // For now, return mock data
    return [
      {
        id: "1",
        event: "Password changed",
        timestamp: "2025-01-10 14:30",
        status: "success",
        ipAddress: "192.168.1.100",
      },
      {
        id: "2",
        event: "Login from new device",
        timestamp: "2025-01-08 09:15",
        status: "warning",
        ipAddress: "192.168.1.101",
      },
    ];
  }
}

export const settingsService = new SettingsService(); 