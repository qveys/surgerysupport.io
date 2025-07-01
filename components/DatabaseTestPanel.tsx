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
  EyeOff
} from 'lucide-react';

export default function DatabaseTestPanel() {
  const [testResults, setTestResults] = useState<DatabaseTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await DatabaseTestService.runAllTests();
      setTestResults(results);
      
      const info = await DatabaseTestService.getDatabaseInfo();
      setDatabaseInfo(info);
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
            <span>Database Configuration Test</span>
          </CardTitle>
          <CardDescription>
            Comprehensive test to diagnose database configuration issues
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
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Database Tests
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
              <h3 className="font-semibold text-gray-900 mb-2">Database Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Supabase URL:</span>
                  <div className="text-gray-600 font-mono text-xs break-all">
                    {databaseInfo.supabaseUrl || 'Not configured'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Keys Configured:</span>
                  <div className="text-gray-600">
                    Anon: {databaseInfo.hasAnonKey ? '✅' : '❌'} | 
                    Service: {databaseInfo.hasServiceKey ? '✅' : '❌'}
                  </div>
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Test Results</h3>
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
                      <h5 className="font-medium text-gray-900 mb-2">Details:</h5>
                      <pre className="text-xs text-gray-700 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {testResults.length > 0 && failedTests > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">🚨 Critical Issues Found</h3>
              <div className="text-sm text-red-800 space-y-2">
                {testResults
                  .filter(r => r.status === 'fail')
                  .map((result, index) => (
                    <div key={index}>
                      <strong>{result.test}:</strong> {result.message}
                    </div>
                  ))}
                <div className="mt-3 p-2 bg-red-100 rounded">
                  <strong>Recommended Actions:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check if all database migrations have been run in order</li>
                    <li>Verify Supabase project configuration and RLS policies</li>
                    <li>Ensure user profiles are properly created for auth users</li>
                    <li>Check if required roles exist in the database</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {testResults.length > 0 && failedTests === 0 && warningTests === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ All Tests Passed</h3>
              <p className="text-sm text-green-800">
                Your database configuration appears to be working correctly!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}