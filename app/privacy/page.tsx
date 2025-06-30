'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Image 
                src="/icon.png" 
                alt="Surgery Support Icon" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-bold text-gray-900">surgerysupport.io</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy and the security of your medical information is our top priority
          </p>
          <div className="text-sm text-gray-500">
            Last updated: January 25, 2024
          </div>
        </div>

        {/* Quick Overview */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Privacy at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">End-to-end encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">No data selling</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">HIPAA compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-600 mb-3">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Medical history and health information</li>
                  <li>Surgery details and treatment plans</li>
                  <li>Insurance information and billing details</li>
                  <li>Communication preferences and settings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                <p className="text-gray-600 mb-3">
                  When you use our platform, we automatically collect:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and platform interactions</li>
                  <li>Log files and error reports</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide personalized surgery support and recovery plans</li>
                <li>Facilitate communication between you and your healthcare providers</li>
                <li>Schedule appointments and send important reminders</li>
                <li>Track your progress and medication adherence</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Healthcare Providers</h3>
                <p className="text-gray-600">
                  We share your medical information with your authorized healthcare providers to facilitate your care and treatment.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
                <p className="text-gray-600">
                  We work with trusted third-party service providers who help us operate our platform. These providers are bound by strict confidentiality agreements.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <p className="text-gray-600">
                  We may disclose information when required by law, court order, or to protect the rights and safety of our users.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">We Never Sell Your Data</h3>
                <p className="text-red-800 text-sm">
                  We do not sell, rent, or trade your personal or medical information to third parties for marketing purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure data storage with regular backups</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Employee training on data privacy and security</li>
                <li>Compliance with HIPAA and other healthcare regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  To exercise these rights, contact us at privacy@surgerysupport.io or through your account settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Medical records: 7 years after last treatment (or as required by law)</li>
                <li>Account information: Until account deletion is requested</li>
                <li>Communication logs: 3 years for quality assurance</li>
                <li>Usage data: 2 years for platform improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during international transfers, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Adequacy decisions for countries with equivalent privacy protections</li>
                <li>Certification under recognized privacy frameworks</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
                <li>Posting the updated policy on our platform</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice on our homepage</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Your continued use of our platform after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <div><strong>Email:</strong> privacy@surgerysupport.io</div>
                <div><strong>Phone:</strong> (555) 123-4567</div>
                <div><strong>Mail:</strong> Surgery Support Privacy Team<br />
                123 Healthcare Blvd, Suite 100<br />
                Medical City, MC 12345</div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-green-900 mb-2">Data Protection Officer</h3>
                <p className="text-green-800 text-sm">
                  For EU residents, you can contact our Data Protection Officer at dpo@surgerysupport.io
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of January 25, 2024
          </p>
          <div className="mt-4">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Return to Surgery Support
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}