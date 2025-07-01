'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatabaseTestService, type DatabaseTestResult } from '@/lib/supabase/database-test';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Info,
  Eye,
  EyeOff,
  Bug,
  Shield,
  Key
} from 'lucide-react';

export default function DatabaseTestPanel() {
  const [testResults, setTestResults] = useState<DatabaseTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [rlsTestResults, setRlsTestResults] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await DatabaseTestService.runAllTests();
      setTestResults(results);
      
      const info = await DatabaseTestService.getDatabaseInfo();
      setDatabaseInfo(info);

      // Run specific RLS tests for roles table
      const rolesSelectTest = await DatabaseTestService.testSpecificRLSPolicy('roles', 'SELECT');
      setRlsTestResults({ rolesSelect: rolesSelectTest });
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleDetails = (testName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const failedTests = testResults.filter(r => r.status === 'fail').length;
  const warningTests = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card className="surgery-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-primary" />
            <span>Enhanced Database Diagnostics</span>
          </CardTitle>
          <CardDescription>
            Comprehensive test to diagnose database configuration and RLS policy issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Enhanced Tests...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Run Enhanced Diagnostics
                </>
              )}
            </Button>
            
            {testResults.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor('pass')}>
                  {passedTests} Passed
                </Badge>
                {failedTests > 0 && (
                  <Badge className={getStatusColor('fail')}>
                    {failedTests} Failed
                  </Badge>
                )}
                {warningTests > 0 && (
                  <Badge className={getStatusColor('warning')}>
                    {warningTests} Warnings
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Database Info */}
          {databaseInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Database Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Supabase URL:</span>
                  <div className="text-gray-600 font-mono text-xs break-all">
                    {databaseInfo.supabaseUrl || 'Not configured'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">API Keys:</span>
                  <div className="text-gray-600">
                    Anon: {databaseInfo.hasAnonKey ? '✅' : '❌'} | 
                    Service: {databaseInfo.hasServiceKey ? '✅' : '❌'}
                  </div>
                </div>
                {databaseInfo.anonKeyPrefix && (
                  <div>
                    <span className="font-medium">Anon Key Preview:</span>
                    <div className="text-gray-600 font-mono text-xs">{databaseInfo.anonKeyPrefix}</div>
                  </div>
                )}
                <div>
                  <span className="font-medium">Environment:</span>
                  <div className="text-gray-600">{databaseInfo.environment}</div>
                </div>
                {databaseInfo.currentUser && (
                  <>
                    <div>
                      <span className="font-medium">Current User:</span>
                      <div className="text-gray-600">{databaseInfo.currentUser.email}</div>
                    </div>
                    <div>
                      <span className="font-medium">Email Confirmed:</span>
                      <div className="text-gray-600">
                        {databaseInfo.currentUser.emailConfirmed ? '✅ Yes' : '❌ No'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <div className="text-gray-600 font-mono text-xs">{databaseInfo.currentUser.id}</div>
                    </div>
                    <div>
                      <span className="font-medium">User Created:</span>
                      <div className="text-gray-600 text-xs">{new Date(databaseInfo.currentUser.createdAt).toLocaleString()}</div>
                    </div>
                  </>
                )}
                {databaseInfo.session && (
                  <>
                    <div>
                      <span className="font-medium">Session Status:</span>
                      <div className="text-gray-600">
                        Access Token: {databaseInfo.session.accessToken} | 
                        Refresh Token: {databaseInfo.session.refreshToken}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Token Expires:</span>
                      <div className="text-gray-600 text-xs">
                        {databaseInfo.session.expiresAt ? new Date(databaseInfo.session.expiresAt * 1000).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* RLS Test Results */}
          {rlsTestResults && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                RLS Policy Test Results
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(rlsTestResults).map(([testName, result]: [string, any]) => (
                  <div key={testName} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium">{testName}:</span>
                      <span className={`ml-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.success ? '✅ Allowed' : '❌ Denied'}
                      </span>
                    </div>
                    {!result.success && (
                      <div className="text-xs text-red-600">
                        {result.errorCode}: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Detailed Test Results</h3>
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{result.test}</h4>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                      {result.details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetails(result.test)}
                        >
                          {showDetails[result.test] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {showDetails[result.test] && result.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <h5 className="font-medium text-gray-900 mb-2">Technical Details:</h5>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Critical Issues */}
          {testResults.length > 0 && failedTests > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">🚨 Critical Issues Found</h3>
              <div className="text-sm text-red-800 space-y-2">
                {testResults
                  .filter(r => r.status === 'fail')
                  .map((result, index) => (
                    <div key={index}>
                      <strong>{result.test}:</strong> {result.message}
                      {result.details?.hint && (
                        <div className="text-xs text-red-700 ml-4 mt-1">
                          💡 {result.details.hint}
                        </div>
                      )}
                    </div>
                  ))}
                <div className="mt-3 p-3 bg-red-100 rounded">
                  <strong>🔧 Recommended Actions:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check if your user has the correct role assigned in the database</li>
                    <li>Verify RLS policies allow authenticated users to read the roles table</li>
                    <li>Ensure the user profile was created properly with a valid role_id</li>
                    <li>Check if the roles table has the required data</li>
                    <li>Verify Supabase project configuration and API keys</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {testResults.length > 0 && failedTests === 0 && warningTests === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ All Tests Passed</h3>
              <p className="text-sm text-green-800">
                Your database configuration appears to be working correctly!
              </p>
            </div>
          )}

          {/* Warnings */}
          {testResults.length > 0 && warningTests > 0 && failedTests === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Warnings Found</h3>
              <div className="text-sm text-yellow-800 space-y-1">
                {testResults
                  .filter(r => r.status === 'warning')
                  .map((result, index) => (
                    <div key={index}>
                      <strong>{result.test}:</strong> {result.message}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}