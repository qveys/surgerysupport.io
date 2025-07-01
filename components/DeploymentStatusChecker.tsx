'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkDeploymentStatus, createRoles, fixMissingUserProfile } from '@/lib/supabase/deployment-status';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Shield,
  UserPlus,
  Key
} from 'lucide-react';

export default function DeploymentStatusChecker() {
  const [status, setStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixingRoles, setIsFixingRoles] = useState(false);
  const [isFixingProfile, setIsFixingProfile] = useState(false);
  const [fixRolesResult, setFixRolesResult] = useState<any>(null);
  const [fixProfileResult, setFixProfileResult] = useState<any>(null);
  const { user, refreshUser } = useAuth();

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkDeploymentStatus();
      setStatus(result);
    } catch (error) {
      console.error('Error checking deployment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFixRoles = async () => {
    setIsFixingRoles(true);
    try {
      const result = await createRoles();
      setFixRolesResult(result);
      
      // Refresh status after fixing
      await checkStatus();
    } catch (error) {
      console.error('Error fixing roles:', error);
    } finally {
      setIsFixingRoles(false);
    }
  };

  const handleFixUserProfile = async () => {
    if (!user) return;
    
    setIsFixingProfile(true);
    try {
      const result = await fixMissingUserProfile(user.id, user.email);
      setFixProfileResult(result);
      
      // Refresh user and status after fixing
      await refreshUser();
      await checkStatus();
    } catch (error) {
      console.error('Error fixing user profile:', error);
    } finally {
      setIsFixingProfile(false);
    }
  };

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card className="surgery-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-primary" />
          <span>Supabase Deployment Status</span>
        </CardTitle>
        <CardDescription>
          Check and fix common deployment issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={checkStatus} 
            variant="outline"
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Status
          </Button>
          
          <div className="flex items-center space-x-2">
            {status && (
              <>
                <Badge className={`${status.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Badge className={`${status.hasRoles ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.hasRoles ? 'Roles OK' : 'No Roles'}
                </Badge>
                <Badge className={`${status.hasUserProfiles ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.hasUserProfiles ? 'Profiles OK' : 'No Profiles'}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Status Display */}
        {status && (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className={`p-4 rounded-lg border ${status.isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start space-x-3">
                {status.isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${status.isConnected ? 'text-green-900' : 'text-red-900'}`}>
                    Database Connection
                  </h3>
                  <p className={`text-sm ${status.isConnected ? 'text-green-700' : 'text-red-700'}`}>
                    {status.isConnected 
                      ? 'Successfully connected to Supabase' 
                      : `Connection failed: ${status.error}`}
                  </p>
                  {status.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 font-mono">
                      {JSON.stringify(status.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Roles Status */}
            <div className={`p-4 rounded-lg border ${status.hasRoles ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start space-x-3">
                {status.hasRoles ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${status.hasRoles ? 'text-green-900' : 'text-yellow-900'}`}>
                      Roles Configuration
                    </h3>
                    {!status.hasRoles && (
                      <Button 
                        size="sm" 
                        onClick={handleFixRoles}
                        disabled={isFixingRoles}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {isFixingRoles ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        Create Roles
                      </Button>
                    )}
                  </div>
                  <p className={`text-sm ${status.hasRoles ? 'text-green-700' : 'text-yellow-700'}`}>
                    {status.hasRoles 
                      ? `Found ${status.details?.rolesCount || 0} roles in the database` 
                      : 'No roles found in the database'}
                  </p>
                  
                  {status.hasRoles && status.details?.roles && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {status.details.roles.map((role: any) => (
                        <Badge key={role.id} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {fixRolesResult && (
                    <div className={`mt-2 p-2 rounded text-xs ${fixRolesResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {fixRolesResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Profile Status */}
            {user && (
              <div className={`p-4 rounded-lg border ${user.profile ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start space-x-3">
                  {user.profile ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${user.profile ? 'text-green-900' : 'text-yellow-900'}`}>
                        User Profile
                      </h3>
                      {!user.profile && (
                        <Button 
                          size="sm" 
                          onClick={handleFixUserProfile}
                          disabled={isFixingProfile}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          {isFixingProfile ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3 mr-1" />
                          )}
                          Create Profile
                        </Button>
                      )}
                    </div>
                    <p className={`text-sm ${user.profile ? 'text-green-700' : 'text-yellow-700'}`}>
                      {user.profile 
                        ? `Profile exists for ${user.email}` 
                        : `No profile found for ${user.email}`}
                    </p>
                    
                    {user.profile && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-green-800">
                        <div>
                          <span className="font-medium">Name:</span> {user.profile.full_name}
                        </div>
                        <div>
                          <span className="font-medium">Role:</span> {user.role?.name || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">ID:</span> {user.profile.id.substring(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(user.profile.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    
                    {fixProfileResult && (
                      <div className={`mt-2 p-2 rounded text-xs ${fixProfileResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {fixProfileResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overall Status */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Deployment Status Summary</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  {status.isConnected ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Database Connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  {status.hasRoles ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Roles Configuration</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.profile ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>User Profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.role ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>User Role Assignment</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isChecking && !status && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Checking deployment status...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}