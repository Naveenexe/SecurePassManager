import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { PasswordGenerator } from "@/components/Password/PasswordGenerator";
import { PasswordStrengthIndicator } from "@/components/Password/PasswordStrengthIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { generatePassword, copyToClipboard } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Save } from "lucide-react";
import { PasswordModal } from "@/components/Password/PasswordModal";

export default function Generator() {
  const { toast } = useToast();
  const [password, setPassword] = useState("Kp9$mL2#nQ8@wX5!");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generateNewPassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  const handleSavePassword = () => {
    setShowPasswordModal(true);
  };

  const updateOption = (key: keyof typeof options, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Generate initial password on mount
  useState(() => {
    generateNewPassword();
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="generator-title">Password Generator</h2>
          <p className="text-muted-foreground">Generate strong, secure passwords with customizable options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generator Card */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generated Password Display */}
              <div className="space-y-2">
                <Label>Generated Password</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={password}
                    readOnly
                    className="font-mono text-lg pr-20"
                    data-testid="generated-password-display"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      data-testid="copy-generated-password"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateNewPassword}
                      data-testid="regenerate-password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Password Strength */}
              <div>
                <Label className="mb-2 block">Password Strength</Label>
                <PasswordStrengthIndicator password={password} />
              </div>

              {/* Length Slider */}
              <div className="space-y-2">
                <Label className="flex justify-between">
                  Length: <span className="text-primary font-medium">{options.length}</span>
                </Label>
                <Slider
                  value={[options.length]}
                  onValueChange={([value]) => updateOption('length', value)}
                  max={64}
                  min={8}
                  step={1}
                  className="w-full"
                  data-testid="password-length-slider"
                />
              </div>
              
              {/* Character Type Options */}
              <div className="space-y-4">
                <Label>Character Types</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={options.includeUppercase}
                      onCheckedChange={(checked) => updateOption('includeUppercase', !!checked)}
                      data-testid="include-uppercase"
                    />
                    <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={options.includeLowercase}
                      onCheckedChange={(checked) => updateOption('includeLowercase', !!checked)}
                      data-testid="include-lowercase"
                    />
                    <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={options.includeNumbers}
                      onCheckedChange={(checked) => updateOption('includeNumbers', !!checked)}
                      data-testid="include-numbers"
                    />
                    <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={options.includeSymbols}
                      onCheckedChange={(checked) => updateOption('includeSymbols', !!checked)}
                      data-testid="include-symbols"
                    />
                    <Label htmlFor="symbols" className="text-sm">Symbols (!@#$...)</Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={generateNewPassword}
                  className="flex-1"
                  data-testid="generate-new-password"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  data-testid="copy-password-main"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSavePassword}
                  data-testid="save-password-btn"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>Password Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">Use Long Passwords</h4>
                    <p className="text-xs text-muted-foreground">
                      Aim for at least 12 characters. Longer passwords are exponentially harder to crack.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">Mix Character Types</h4>
                    <p className="text-xs text-muted-foreground">
                      Include uppercase, lowercase, numbers, and symbols for maximum security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">Unique for Each Account</h4>
                    <p className="text-xs text-muted-foreground">
                      Never reuse passwords across different accounts or services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">Avoid Personal Information</h4>
                    <p className="text-xs text-muted-foreground">
                      Don't use names, dates, or other personal information that can be guessed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-sm">Regular Updates</h4>
                    <p className="text-xs text-muted-foreground">
                      Update passwords regularly, especially for important accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Recommended Settings</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Length: 16+ characters</li>
                  <li>• Include all character types</li>
                  <li>• Generate new passwords regularly</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </MainLayout>
  );
}
