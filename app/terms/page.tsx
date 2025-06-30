'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scale, FileText, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfService() {
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
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our surgery support platform
          </p>
          <div className="text-sm text-gray-500">
            Last updated: January 25, 2024
          </div>
        </div>

        {/* Important Notice */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Important Medical Disclaimer</h2>
                <p className="text-yellow-800 text-sm">
                  This platform provides support tools and information but does not replace professional medical advice. 
                  Always consult with your healthcare provider for medical decisions and emergency situations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                By accessing and using the Surgery Support platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600">
                These Terms of Service ("Terms") govern your use of our website located at surgerysupport.io (the "Service") operated by Surgery Support ("us", "we", or "our").
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Surgery Support is a digital platform that provides:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Pre-operative and post-operative care coordination</li>
                <li>Communication tools between patients and healthcare providers</li>
                <li>Medication tracking and reminder systems</li>
                <li>Appointment scheduling and management</li>
                <li>Educational resources and recovery planning</li>
                <li>Progress tracking and reporting tools</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-blue-900 mb-2">Not a Medical Provider</h3>
                <p className="text-blue-800 text-sm">
                  We are a technology platform that facilitates communication and organization. We do not provide medical advice, 
                  diagnosis, or treatment. All medical decisions should be made in consultation with qualified healthcare professionals.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Creation</h3>
                <p className="text-gray-600 mb-3">
                  To use our Service, you must:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Be at least 18 years of age</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-600">
                  You are responsible for safeguarding the password and for maintaining the confidentiality of your account. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Permitted Uses</h3>
                <p className="text-gray-600 mb-3">
                  You may use our Service for:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Managing your surgery preparation and recovery</li>
                  <li>Communicating with authorized healthcare providers</li>
                  <li>Tracking medications and appointments</li>
                  <li>Accessing educational resources</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prohibited Uses</h3>
                <p className="text-gray-600 mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Use the Service for any unlawful purpose or activity</li>
                  <li>Share your account credentials with unauthorized persons</li>
                  <li>Attempt to gain unauthorized access to other users' accounts</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Harass, abuse, or harm other users or healthcare providers</li>
                  <li>Use the Service to provide medical advice to others</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Medical Information and HIPAA Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Protected Health Information</h3>
                <p className="text-gray-600">
                  We handle your medical information in accordance with HIPAA (Health Insurance Portability and Accountability Act) 
                  and other applicable privacy laws. Your medical information will only be shared with authorized healthcare providers 
                  involved in your care.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Accuracy of Information</h3>
                <p className="text-gray-600">
                  You are responsible for providing accurate and up-to-date medical information. Inaccurate information may affect 
                  the quality of care you receive. Always verify important medical information with your healthcare providers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Emergency Situations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Emergency Disclaimer</h3>
                <p className="text-red-800 text-sm mb-3">
                  <strong>DO NOT USE THIS PLATFORM FOR MEDICAL EMERGENCIES.</strong>
                </p>
                <p className="text-red-800 text-sm">
                  In case of a medical emergency, call 911 (US), your local emergency number, or go to the nearest emergency room immediately. 
                  Our platform is not monitored 24/7 and should not be relied upon for urgent medical situations.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Our Content</h3>
                <p className="text-gray-600">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of 
                  Surgery Support and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-gray-600">
                  You retain ownership of any content you submit to the Service. By submitting content, you grant us a limited, 
                  non-exclusive license to use, store, and process your content solely for the purpose of providing the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Payment Terms and Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Fees</h3>
                <p className="text-gray-600">
                  Some features of our Service may require payment of fees. You agree to pay all applicable fees as described 
                  on the Service at the time you choose to purchase or subscribe to such features.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Billing and Cancellation</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Subscription fees are billed in advance on a recurring basis</li>
                  <li>You may cancel your subscription at any time through your account settings</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds are provided for partial billing periods</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service Disclaimer</h3>
                <p className="text-gray-600">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, 
                  express or implied, as to the operation of the Service or the information, content, or materials included therein.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Medical Disclaimer</h3>
                <p className="text-gray-600">
                  The information provided through our Service is for informational purposes only and is not intended as a substitute 
                  for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified 
                  health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                <p className="text-gray-600">
                  In no event shall Surgery Support, its directors, employees, partners, agents, suppliers, or affiliates be liable 
                  for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
                  data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You agree to defend, indemnify, and hold harmless Surgery Support and its licensee and licensors, and their employees, 
                contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, 
                costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-3">
                <li>Your use and access of the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third party right, including without limitation any copyright, property, or privacy right</li>
                <li>Any claim that your content caused damage to a third party</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by You</h3>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings. 
                  Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Termination by Us</h3>
                <p className="text-gray-600">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                  under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Effect of Termination</h3>
                <p className="text-gray-600">
                  Upon termination, we will retain your medical information as required by law and our data retention policies. 
                  You may request a copy of your data before account deletion.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Governing Law</h3>
                <p className="text-gray-600">
                  These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict 
                  of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dispute Resolution</h3>
                <p className="text-gray-600">
                  Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration 
                  in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive 
                  relief in any court of competent jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will 
                be determined at our sole discretion.
              </p>
              <p className="text-gray-600 mt-3">
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <div><strong>Email:</strong> legal@surgerysupport.io</div>
                <div><strong>Phone:</strong> (555) 123-4567</div>
                <div><strong>Mail:</strong> Surgery Support Legal Department<br />
                123 Healthcare Blvd, Suite 100<br />
                Medical City, MC 12345</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-blue-900 mb-2">Questions About Your Care?</h3>
                <p className="text-blue-800 text-sm">
                  For questions about your medical care or treatment, please contact your healthcare provider directly or use 
                  the messaging feature within the platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            These Terms of Service are effective as of January 25, 2024
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