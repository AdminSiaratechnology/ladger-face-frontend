import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Shield, 
  Bell, 
  Database,
  Upload,
  Download,
  Link,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanySettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
}

interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  customDomain: string;
  brandName: string;
}

interface IntegrationSettings {
  tallyEnabled: boolean;
  tallyServerUrl: string;
  tallyCompanyName: string;
  quickbooksEnabled: boolean;
  quickbooksClientId: string;
  zohoEnabled: boolean;
  zohoClientId: string;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  loginAttempts: number;
  ipWhitelist: string[];
}

export default function Settings() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'ABC Business Solutions Pvt Ltd',
    logo: '',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    phone: '+91 22 1234 5678',
    email: 'info@abcbusiness.com',
    website: 'https://www.abcbusiness.com',
    gstNumber: '27AABCU9603R1ZX',
    panNumber: 'AABCU9603R'
  });

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    logoUrl: '',
    faviconUrl: '',
    customDomain: 'app.abcbusiness.com',
    brandName: 'ABC BMS'
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    tallyEnabled: true,
    tallyServerUrl: 'http://localhost:9000',
    tallyCompanyName: 'ABC Company Ltd',
    quickbooksEnabled: false,
    quickbooksClientId: '',
    zohoEnabled: false,
    zohoClientId: '',
    emailProvider: 'smtp',
    smtpHost: 'mail.abcbusiness.com',
    smtpPort: '587',
    smtpUsername: 'noreply@abcbusiness.com',
    smtpPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    sessionTimeout: 480, // 8 hours
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    loginAttempts: 5,
    ipWhitelist: []
  });

  const [showPasswords, setShowPasswords] = useState(false);

  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleTestConnection = (service: string) => {
    toast.info(`Testing connection to ${service}...`);
    setTimeout(() => {
      toast.success(`${service} connection successful`);
    }, 2000);
  };

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#6B7280', accent: '#F59E0B' },
    { name: 'Green', primary: '#10B981', secondary: '#6B7280', accent: '#3B82F6' },
    { name: 'Red', primary: '#EF4444', secondary: '#6B7280', accent: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your business management system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Link className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Basic company details that will appear on invoices and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gst">GST Number</Label>
                    <Input
                      id="gst"
                      value={companySettings.gstNumber}
                      onChange={(e) => setCompanySettings({ ...companySettings, gstNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input
                      id="pan"
                      value={companySettings.panNumber}
                      onChange={(e) => setCompanySettings({ ...companySettings, panNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Company')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Company Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo & Branding Assets</CardTitle>
                <CardDescription>
                  Upload your company logo and other branding materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Logo</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload logo</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                  <div>
                    <Label>Favicon</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload favicon</p>
                      <p className="text-xs text-gray-500">ICO, PNG 32x32</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>
                  Customize the color theme of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Quick Presets</Label>
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    {colorPresets.map((preset) => (
                      <div
                        key={preset.name}
                        className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setBrandingSettings({
                          ...brandingSettings,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent
                        })}
                      >
                        <div className="flex space-x-2 mb-2">
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }}></div>
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }}></div>
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }}></div>
                        </div>
                        <p className="text-sm font-medium">{preset.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={brandingSettings.secondaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })}
                        placeholder="#6B7280"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={brandingSettings.accentColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, accentColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={brandingSettings.accentColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, accentColor: e.target.value })}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Branding')}>
                    <Save className="w-4 h-4 mr-2" />
                    Apply Theme
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>White Label Settings</CardTitle>
                <CardDescription>
                  Configure custom domain and branding for resellers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={brandingSettings.brandName}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, brandName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      value={brandingSettings.customDomain}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, customDomain: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ERP Integrations</CardTitle>
                <CardDescription>
                  Configure connections to external ERP systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tally ERP */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Tally ERP</h4>
                      <p className="text-sm text-gray-600">Sync ledgers, items, and transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={integrationSettings.tallyEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {integrationSettings.tallyEnabled ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Switch
                      checked={integrationSettings.tallyEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, tallyEnabled: checked })}
                    />
                  </div>
                </div>

                {integrationSettings.tallyEnabled && (
                  <div className="grid grid-cols-2 gap-4 ml-16">
                    <div>
                      <Label htmlFor="tallyServer">Tally Server URL</Label>
                      <Input
                        id="tallyServer"
                        value={integrationSettings.tallyServerUrl}
                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, tallyServerUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tallyCompany">Company Name</Label>
                      <Input
                        id="tallyCompany"
                        value={integrationSettings.tallyCompanyName}
                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, tallyCompanyName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button variant="outline" onClick={() => handleTestConnection('Tally ERP')}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                )}

                {/* QuickBooks */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">QuickBooks</h4>
                      <p className="text-sm text-gray-600">Sync accounting data and reports</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={integrationSettings.quickbooksEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {integrationSettings.quickbooksEnabled ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Switch
                      checked={integrationSettings.quickbooksEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, quickbooksEnabled: checked })}
                    />
                  </div>
                </div>

                {/* Zoho */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Database className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Zoho Inventory</h4>
                      <p className="text-sm text-gray-600">Manage inventory and orders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={integrationSettings.zohoEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {integrationSettings.zohoEnabled ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Switch
                      checked={integrationSettings.zohoEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, zohoEnabled: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email notifications and SMTP settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <Select 
                    value={integrationSettings.emailProvider} 
                    onValueChange={(value: 'smtp' | 'sendgrid' | 'mailgun') => setIntegrationSettings({ ...integrationSettings, emailProvider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {integrationSettings.emailProvider === 'smtp' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={integrationSettings.smtpHost}
                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, smtpHost: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">Port</Label>
                      <Input
                        id="smtpPort"
                        value={integrationSettings.smtpPort}
                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, smtpPort: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUsername">Username</Label>
                      <Input
                        id="smtpUsername"
                        value={integrationSettings.smtpUsername}
                        onChange={(e) => setIntegrationSettings({ ...integrationSettings, smtpUsername: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">Password</Label>
                      <div className="relative">
                        <Input
                          id="smtpPassword"
                          type={showPasswords ? 'text' : 'password'}
                          value={integrationSettings.smtpPassword}
                          onChange={(e) => setIntegrationSettings({ ...integrationSettings, smtpPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => handleTestConnection('Email Server')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button onClick={() => handleSaveSettings('Email')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication & Access</CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorRequired}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    className="w-32 mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Users will be logged out after {securitySettings.sessionTimeout} minutes of inactivity
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Password Policy</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={securitySettings.passwordPolicy.minLength}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: { ...securitySettings.passwordPolicy, minLength: parseInt(e.target.value) }
                        })}
                        className="w-32 mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireUppercase"
                          checked={securitySettings.passwordPolicy.requireUppercase}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, requireUppercase: checked }
                          })}
                        />
                        <Label htmlFor="requireUppercase" className="text-sm">Uppercase letters</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireNumbers"
                          checked={securitySettings.passwordPolicy.requireNumbers}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, requireNumbers: checked }
                          })}
                        />
                        <Label htmlFor="requireNumbers" className="text-sm">Numbers</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireSpecial"
                          checked={securitySettings.passwordPolicy.requireSpecialChars}
                          onCheckedChange={(checked) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy, requireSpecialChars: checked }
                          })}
                        />
                        <Label htmlFor="requireSpecial" className="text-sm">Special characters</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Security')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login Security</CardTitle>
                <CardDescription>
                  Configure login restrictions and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="loginAttempts">Maximum Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
                    className="w-32 mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Lock account after {securitySettings.loginAttempts} failed attempts
                  </p>
                </div>

                <div>
                  <Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.1"
                    className="mt-2"
                    rows={4}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    One IP address per line. Leave empty to allow all IPs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure when to send email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Order Notifications</h4>
                      <p className="text-sm text-gray-600">Send email when new orders are placed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Confirmations</h4>
                      <p className="text-sm text-gray-600">Send email when payments are received</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Low Stock Alerts</h4>
                      <p className="text-sm text-gray-600">Send email when inventory is low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sync Status Updates</h4>
                      <p className="text-sm text-gray-600">Send email about ERP sync results</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Configure SMS alerts for critical events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order Status Updates</h4>
                      <p className="text-sm text-gray-600">Send SMS to customers about order status</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Security Alerts</h4>
                      <p className="text-sm text-gray-600">Send SMS for suspicious login attempts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Downtime</h4>
                      <p className="text-sm text-gray-600">Send SMS when system is down</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>
                  Configure notifications within the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Real-time Updates</h4>
                      <p className="text-sm text-gray-600">Show live notifications for new activities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Desktop Notifications</h4>
                      <p className="text-sm text-gray-600">Show browser notifications</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sound Alerts</h4>
                      <p className="text-sm text-gray-600">Play sound for important notifications</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}